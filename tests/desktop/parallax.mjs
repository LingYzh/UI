import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'parallax-'));
const fixture = `<!doctype html><html style="overflow: visible; height: auto"><head><meta charset="utf-8"></head><body style="overflow: visible; height: auto"><div id="app"></div><script type="module">
    import { createApp, h, reactive } from 'vue';
    import { UImg, UParallax, UScrollArea, createUI } from '/src/ui/index.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';
    const state = reactive({ speed: 0.8, disabled: false, height: 240, mounted: true });
    const ui = createUI();
    window.parallaxFixture = { state, theme: ui.theme };
    const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#efe8df"/><circle cx="480" cy="100" r="60" fill="#bd6749"/><path d="M0 320 180 90 360 320Z" fill="#789380"/><path d="M230 320 420 150 640 320Z" fill="#a7b7a5"/></svg>');
    function scene(id) {
        return h(UParallax, { id, speed: state.speed, disabled: state.disabled, style: { height: state.height + 'px' } }, {
            background: () => h(UImg, { src: image, alt: '背景山丘' }),
            default: ({ offset, ratio }) => h('strong', { 'data-offset': offset, 'data-ratio': ratio }, '视差背景与前景标题')
        });
    }
    createApp({ render() {
        return h('div', { style: { padding: '24px', maxWidth: '850px', margin: 'auto' } }, [
            h('h2', '内部容器滚动'),
            h(UScrollArea, { id: 'nested', height: '400px', label: '视差内部滚动示例', style: { border: '1px solid var(--border)' } }, () => [
                h('div', { style: { height: '240px' } }, '向下滚动观察背景'),
                state.mounted ? scene('inner-scene') : null,
                h('div', { style: { height: '650px' } })
            ]),
            h('div', { style: { height: '300px' } }),
            scene('window-scene'),
            h('div', { style: { height: '1200px' } })
        ]);
    } }).use(ui).mount('#app');
</script></body></html>`;
const server = await createServer({ cacheDir: path.join(evidence, 'vite-cache'), server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'parallax-fixture',
    configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
            if (request.url !== '/__parallax.html') { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await server.transformIndexHtml('/__parallax.html', fixture));
        });
    }
}] });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__parallax.html` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const reports = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
});
async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function readScene(id) {
    await settle();
    return page.locator(`#${id}`).evaluate(element => {
        const scene = element.getBoundingClientRect();
        const image = element.querySelector('img').getBoundingClientRect();
        const background = element.querySelector('.u-parallax-background').getBoundingClientRect();
        const foreground = element.querySelector('strong').getBoundingClientRect();
        return { offset: Number(element.querySelector('strong').dataset.offset), ratio: Number(element.querySelector('strong').dataset.ratio), scene: scene.toJSON(), background: background.toJSON(), image: image.toJSON(), foreground: foreground.toJSON() };
    });
}
function coversScene(metrics) {
    assert.ok(metrics.image.top <= metrics.scene.top + 1 && metrics.image.bottom >= metrics.scene.bottom - 1, 'background image covers scene at every speed');
    assert.ok(Math.abs(metrics.image.height - metrics.background.height) < 1, 'UImg fills background height');
}
async function capture(name) {
    await settle();
    await page.waitForTimeout(100);
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})));
    });
    await settle();
    const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
try {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('#inner-scene img').waitFor();
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    const viewport = page.locator('#nested .ui-scroll-viewport');
    const before = await readScene('inner-scene');
    await capture('nested-before');
    await viewport.evaluate(element => element.scrollTop = 200);
    const after = await readScene('inner-scene');
    await capture('nested-after');
    reports.push({ name: 'nested scroll', before, after });
    if (process.argv.includes('--baseline')) {
        console.log(JSON.stringify({ evidence, reports }, null, 4));
    } else {
        assert.ok(after.offset - before.offset > 40, 'nested scroll updates background offset');
        assert.ok(Math.abs((after.background.top - before.background.top) - (after.scene.top - before.scene.top)) > 40, 'background and foreground scroll at different rates');
        assert.ok(Math.abs((after.foreground.top - before.foreground.top) - (after.scene.top - before.scene.top)) < 1, 'foreground follows scene normally');
        const viewportRect = await viewport.evaluate(element => element.getBoundingClientRect().toJSON());
        const expectedRatio = (viewportRect.bottom - after.scene.top) / (viewportRect.height + after.scene.height);
        assert.ok(Math.abs(after.ratio - expectedRatio) < 0.005, 'ratio uses internal viewport bounds');
        coversScene(after);
        await page.evaluate(() => { window.parallaxFixture.state.speed = -0.8; });
        const reversed = await readScene('inner-scene');
        assert.ok(Math.abs(reversed.offset + after.offset) < 0.01, 'speed updates immediately and reverses direction');
        await page.evaluate(() => window.parallaxFixture.state.disabled = true);
        assert.equal((await readScene('inner-scene')).offset, 0, 'disable clears transform without another scroll');
        await page.evaluate(() => { window.parallaxFixture.state.disabled = false; window.parallaxFixture.state.speed = 0; });
        assert.equal((await readScene('inner-scene')).offset, 0, 'zero speed is static');
        await page.evaluate(() => window.parallaxFixture.state.speed = 1);
        coversScene(await readScene('inner-scene'));
        await viewport.evaluate(element => element.scrollTop = 650);
        coversScene(await readScene('inner-scene'));
        await viewport.evaluate(element => element.scrollTop = 200);
        await page.evaluate(() => window.parallaxFixture.state.height = 320);
        const resized = await readScene('inner-scene');
        assert.equal(resized.scene.height, 320, 'scene adopts updated height');
        assert.ok(Math.abs(resized.ratio - 0.5) < 0.005, 'size change remeasures without scrolling');
        coversScene(resized);
        await viewport.evaluate(element => element.scrollTop = 120);
        await settle();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => Number(document.querySelector('#inner-scene strong').dataset.offset) === 0);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(() => Number(document.querySelector('#inner-scene strong').dataset.offset) !== 0);
        await page.evaluate(() => document.documentElement.dataset.reducedMotion = 'true');
        assert.equal((await readScene('inner-scene')).offset, 0, 'application reduced-motion setting clears transform');
        await page.evaluate(() => delete document.documentElement.dataset.reducedMotion);
        assert.notEqual((await readScene('inner-scene')).offset, 0, 'motion resumes when preference is cleared');
        await page.evaluate(() => window.parallaxFixture.state.mounted = false);
        await settle();
        await page.evaluate(() => window.parallaxFixture.state.mounted = true);
        assert.notEqual((await readScene('inner-scene')).offset, 0, 'remount measures already-scrolled container');
        const windowBefore = await readScene('window-scene');
        await page.evaluate(() => window.scrollTo(0, 250));
        await page.waitForFunction(() => window.scrollY >= 249);
        const windowAfter = await readScene('window-scene');
        reports.push({ name: 'window scroll', before: windowBefore, after: windowAfter });
        assert.ok(windowAfter.offset > windowBefore.offset + 10, 'window scrolling still works');
        await page.goto(`${server.resolvedUrls.local[0]}#/parallax`);
        const demo = page.locator('[data-demo-component="UParallax"]');
        await demo.waitFor();
        await demo.scrollIntoViewIfNeeded();
        const demoViewport = demo.locator('.ui-scroll-viewport');
        await demoViewport.evaluate(element => element.scrollTop = 60);
        const demoOffset = await demo.locator('output').textContent();
        await capture('docs-before');
        await demoViewport.hover();
        await page.mouse.wheel(0, 120);
        await page.waitForFunction(() => document.querySelector('[data-demo-component="UParallax"] .ui-scroll-viewport').scrollTop > 100);
        await settle();
        assert.notEqual(await demo.locator('output').textContent(), demoOffset, 'real docs example reacts to wheel scroll');
        const outerBefore = await demo.locator('.u-parallax-background').evaluate(element => getComputedStyle(element).transform);
        const outerScroll = await page.locator('.docs-content-scroll').evaluate(element => {
            const previous = element.scrollTop;
            element.scrollTop += 800;
            return previous;
        });
        await settle();
        assert.notEqual(await demo.locator('.u-parallax-background').evaluate(element => getComputedStyle(element).transform), outerBefore, 'outer docs clipping updates nested viewport bounds');
        await page.locator('.docs-content-scroll').evaluate((element, previous) => element.scrollTop = previous, outerScroll);
        await capture('docs-after');
        await demo.getByRole('checkbox', { name: '关闭视差', exact: true }).check();
        await settle();
        assert.ok((await demo.locator('output').textContent()).includes('0.0'), 'real demo disables motion');
        await demo.getByRole('checkbox', { name: '关闭视差', exact: true }).uncheck();
        for (const [name, width, zoom, dark] of [['dark', 1200, 1, true], ['mobile', 390, 1, false], ['zoom125', 900, 1.25, false]]) {
            await app.evaluate(({ BrowserWindow }, { width, zoom }) => {
                const window = BrowserWindow.getAllWindows()[0];
                window.setContentSize(width, 900);
                window.webContents.setZoomFactor(zoom);
            }, { width, zoom });
            await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(dark);
            await page.waitForFunction(dark => document.documentElement.dataset.theme === (dark ? 'dark' : 'light'), dark);
            await demo.scrollIntoViewIfNeeded();
            await capture(`docs-${name}`);
            assert.ok(await demo.evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'demo fits available width');
        }
        assert.deepEqual(errors, []);
        await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ reports, passed: ['nested/window scrolling', 'viewport-relative ratio', 'foreground/background relative motion', 'image coverage', 'speed/disabled updates', 'resize/remount', 'system/app reduced motion', 'real docs wheel/control', 'dark/mobile/zoom layout'], errors }, null, 4));
        console.log(JSON.stringify({ evidence, passed: 9, errors }, null, 4));
    }
} catch (error) {
    await capture('failure');
    console.error(JSON.stringify({ evidence, reports, errors }, null, 4));
    throw error;
} finally { await app.close(); await server.close(); }
