import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'theme-transitions-'));
const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
    import { createApp } from 'vue';
    import { createUiTheme } from '/src/ui/theme.ts';
    import { reducedMotion } from '/src/ui/docs/preferences.js';
    import UiPreview from '/src/ui/UiPreview.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';
    import '/src/ui/docs/docs.css';
    window.transitions = [];
    window.nativeTransition = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
        const transition = window.nativeTransition(...args);
        window.transitions.push(transition);
        transition.ready.catch(() => {});
        return transition;
    };
    window.fixtureTheme = createUiTheme();
    window.fixtureReducedMotion = reducedMotion;
    window.fixtureApp = createApp(UiPreview).use(window.fixtureTheme);
    window.fixtureApp.mount('#app');
</script></body></html>`;
const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'theme-transitions-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__theme-transitions.html') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await server.transformIndexHtml('/__theme-transitions.html', html));
            });
        }
    }]
});
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__theme-transitions.html#/theme` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
let app;
const passed = [];
const errors = [];
try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    const page = await app.firstWindow();
    page.on('pageerror', error => errors.push(error.message));
    await page.locator('.docs-shell').waitFor();
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1440, 900));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const header = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const demo = page.locator('.docs-example[aria-labelledby="theme-switch-heading"]');
    const reduced = demo.getByRole('checkbox', { name: '减少动态效果', exact: true });
    const count = () => page.evaluate(() => window.transitions.length);
    const styleCount = () => page.evaluate(() => [...document.head.querySelectorAll('style')].filter(style => style.textContent.includes('@keyframes ui-theme-reveal')).length);
    async function settle() {
        await page.evaluate(async () => { await window.transitions.at(-1)?.finished; });
        assert.equal(await styleCount(), 0);
    }
    async function capture(name) {
        const png = Buffer.from(await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64')), 'base64');
        assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1440, 900]);
        await writeFile(path.join(evidence, `${name}.png`), png);
    }
    await capture('theme-light-before');
    assert.equal(await reduced.isChecked(), false);
    await header.check();
    await page.evaluate(async () => { await window.transitions.at(-1).ready; });
    assert.equal(await count(), 1, 'topbar uses the default theme transition');
    assert.equal(await styleCount(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    const frame = await page.evaluate(() => {
        const animation = document.getAnimations().find(animation => animation.animationName === 'ui-theme-reveal');
        if (!animation) throw new Error('Missing rendered theme reveal animation');
        animation.pause();
        animation.currentTime = 180;
        const style = [...document.head.querySelectorAll('style')].find(style => style.textContent.includes('@keyframes ui-theme-reveal')).textContent;
        return { duration: animation.effect.getTiming().duration, style };
    });
    assert.equal(frame.duration, 400);
    const origin = frame.style.match(/circle\(0% at ([\d.]+)% ([\d.]+)%\)/);
    assert.ok(origin && Number(origin[1]) > 80 && Number(origin[2]) < 10, 'reveal begins at the topbar theme switch');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await capture('theme-topbar-transition-midpoint');
    const pixels = await app.evaluate(async ({ BrowserWindow }) => {
        const image = await BrowserWindow.getAllWindows()[0].webContents.capturePage();
        const bytes = image.toBitmap();
        const width = image.getSize().width;
        const pixel = (x, y) => [...bytes.subarray((y * width + x) * 4, (y * width + x) * 4 + 3)];
        return { left: pixel(280, 100), right: pixel(1400, 100) };
    });
    assert.ok(pixels.left.every(channel => channel > 200) && pixels.right.every(channel => channel < 80), `midpoint contains both old and new themes: ${JSON.stringify(pixels)}`);
    await page.evaluate(() => document.getAnimations().find(animation => animation.animationName === 'ui-theme-reveal').play());
    await settle();
    await capture('theme-dark-after');
    assert.equal(await header.evaluate(element => element === document.activeElement), false);
    passed.push('topbar defaults to a real 400ms reveal from the switch, preserves pointer focus policy and cleans its style');

    await reduced.check();
    await page.waitForFunction(() => document.documentElement.dataset.reducedMotion === 'true');
    await header.uncheck();
    assert.equal(await count(), 1);
    assert.equal(await styleCount(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
    await reduced.uncheck();
    await header.check();
    assert.equal(await count(), 2);
    await settle();
    passed.push('shared manual reduced motion bypasses the topbar transition and full motion automatically restores it');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await header.uncheck();
    assert.equal(await count(), 2);
    await page.evaluate(() => window.fixtureTheme.change('dark', true));
    assert.equal(await count(), 2, 'an explicit transition cannot override reduced motion');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await header.uncheck();
    assert.equal(await count(), 3);
    await settle();
    passed.push('system reduced motion overrides even explicit transitions, and restoring full motion re-enables them');

    for (const method of ['toggle', 'cycle']) {
        const before = await count();
        await page.evaluate(method => window.fixtureTheme[method](), method);
        assert.equal(await count(), before + 1);
        await settle();
    }
    await page.evaluate(() => window.fixtureTheme.change('dark', false));
    assert.equal(await count(), 5);
    passed.push('change/toggle/cycle share the default and retain explicit false for host opt-out');

    await page.evaluate(async () => { await window.fixtureTheme.change('light'); await window.transitions.at(-1).ready; window.fixtureReducedMotion.value = true; });
    await page.waitForFunction(() => !document.getAnimations().some(animation => animation.animationName === 'ui-theme-reveal'));
    await settle();
    assert.equal(await reduced.isChecked(), true);
    await reduced.uncheck();
    await page.evaluate(async () => { await window.fixtureTheme.change('dark'); await window.transitions.at(-1).ready; });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.getAnimations().some(animation => animation.animationName === 'ui-theme-reveal'));
    await settle();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('manual and system reduced motion immediately finish a transition already playing');

    await header.focus();
    await page.keyboard.press('Space');
    await settle();
    assert.equal(await header.evaluate(element => element === document.activeElement), true);
    passed.push('keyboard topbar activation retains its focus while playing the transition');

    const beforeFallback = await count();
    await page.evaluate(async () => { document.startViewTransition = undefined; await window.fixtureTheme.change('dark'); });
    assert.equal(await count(), beforeFallback);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    await page.evaluate(() => window.fixtureApp.unmount());
    assert.equal(await page.locator('head style[id^="ui-theme-"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--primary')), '');
    assert.deepEqual(errors, []);
    passed.push('unsupported browsers switch immediately and app disposal cleans generated styles, variables and listeners');
} catch (error) {
    errors.push(error.stack || String(error));
    process.exitCode = 1;
} finally {
    if (app) await app.close();
    await server.close();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ passed, errors }, null, 4));
    console.log(JSON.stringify({ evidence, passed, errors }, null, 4));
}
