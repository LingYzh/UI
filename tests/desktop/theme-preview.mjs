import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'theme-preview-'));
const fixtureHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
        import { createApp } from 'vue';
        import UiPreview from '/src/ui/UiPreview.vue';
        import '/src/docs-base.css';
        import '/src/ui/styles.css';
        import '/src/ui/docs/docs.css';
        const app = createApp(UiPreview);
        window.fixtureApp = app;
        app.mount('#app');
    </script></body></html>`;
const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'theme-preview-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__theme-preview.html') { next(); return; }
                const html = await server.transformIndexHtml('/__theme-preview.html', fixtureHtml);
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(html);
            });
        }
    }]
});
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__theme-preview.html#/theme` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
    await page.locator('.docs-shell').waitFor();
    assert.equal(await page.evaluate(() => Boolean(window.fixtureApp)), true, 'fixture mounts UiPreview without importing main.js');
    const global = page.locator('.docs-example[aria-labelledby="theme-switch-heading"]');
    await global.getByRole('combobox', { name: '全局主题', exact: true }).selectOption('ocean');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'ocean');
    assert.equal(await global.locator('.ui-markdown code').evaluate(element => getComputedStyle(element).color), 'rgb(36, 106, 145)');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).check();
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await global.getByRole('combobox', { name: '全局主题', exact: true }).selectOption('system');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'light');
    const activeStyles = await page.locator('head style[id^="ui-theme-"]').count();
    assert.equal(activeStyles, 1);
    await page.evaluate(() => window.fixtureApp.unmount());
    assert.equal(await page.locator('head style[id^="ui-theme-"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--primary')), '');
    assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-ui-theme')), false);
    assert.deepEqual(errors, []);
    const passed = ['exported UiPreview works without a host theme plugin', 'custom theme, legacy dark switch and system mode remain functional', 'app unmount cleans root variables, theme attributes and generated style'];
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ passed, errors }, null, 2));
    console.log(JSON.stringify({ evidence, passed, errors }, null, 2));
} finally { await app.close(); await server.close(); }
