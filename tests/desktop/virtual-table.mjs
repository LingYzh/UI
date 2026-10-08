import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'virtual-table-'));
const fixture = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
    import { createApp, h, reactive } from 'vue';
    import { UDataTableVirtual, createUI } from '/src/ui/index.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';
    const state = reactive({ search: '', width: undefined });
    const headers = [{ key: 'title', title: '工作区', sortable: true }, { key: 'category', title: '分类', sortable: true }, { key: 'count', title: '任务数', sortable: true, align: 'end' }];
    const items = Array.from({ length: 10000 }, (_, index) => ({ id: index, title: '工作区 ' + (index + 1), category: '开发', count: index }));
    const ui = createUI();
    window.virtualFixture = { state, theme: ui.theme };
    createApp({ render() { return h('div', { style: { padding: '24px' } }, h(UDataTableVirtual, { headers, items, height: 260, mobile: false, width: state.width, search: state.search, label: '虚拟工作区列表' })); } }).use(ui).mount('#app');
</script></body></html>`;
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'virtual-table-fixture',
    configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
            if (request.url !== '/__virtual-table.html') { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await server.transformIndexHtml('/__virtual-table.html', fixture));
        });
    }
}] });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__virtual-table.html` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
await page.emulateMedia({ reducedMotion: 'reduce' });
const errors = [];
const reports = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
});
async function capture(name) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.waitForTimeout(150);
    const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
try {
    const table = page.locator('.u-data-table-virtual');
    await table.waitFor();
    function geometry(element) {
        const viewport = element.querySelector('.ui-scroll-viewport') || element;
        const outer = element.getBoundingClientRect();
        const inner = element.querySelector('table').getBoundingClientRect();
        return { gap: outer.right - parseFloat(getComputedStyle(element).borderRightWidth) - inner.right, viewportWidth: viewport.clientWidth, tableWidth: inner.width, height: outer.height };
    }
    if (process.argv.includes('--baseline')) {
        const baseline = await table.evaluate(geometry);
        await capture('baseline');
        console.log(JSON.stringify({ evidence, baseline }));
    } else {
        const viewport = table.locator('.ui-scroll-viewport');
        for (const [name, width, zoom, dark] of [['light-wide', 1200, 1, false], ['dark-narrow', 600, 1, true], ['light-zoom125', 900, 1.25, false], ['dark-mobile', 390, 1, true]]) {
            await app.evaluate(({ BrowserWindow }, { width, zoom }) => {
                const window = BrowserWindow.getAllWindows()[0];
                window.setContentSize(width, 700);
                window.webContents.setZoomFactor(zoom);
            }, { width, zoom });
            await page.evaluate(dark => window.virtualFixture.theme.change(dark ? 'dark' : 'light'), dark);
            const metrics = await table.evaluate(geometry);
            assert.ok(Math.abs(metrics.gap) < 1, `${name}: row/header fills frame without scrollbar gutter`);
            assert.ok(Math.abs(metrics.height - 260) < 1, `${name}: public height retains outer frame size`);
            assert.ok(await table.locator('tbody tr:not([aria-hidden])').count() < 30, '10000 records remain virtualized');
            reports.push({ name, ...metrics });
            await capture(name);
        }
        await viewport.focus();
        await page.keyboard.press('PageDown');
        await page.waitForFunction(() => document.querySelector('.ui-scroll-viewport').scrollTop > 50);
        const first = await table.locator('tbody tr:not([aria-hidden]) td').first().textContent();
        await page.keyboard.press('Control+End');
        await page.waitForFunction(() => document.querySelector('.u-data-table tbody').textContent.includes('工作区 10000'));
        assert.ok((await table.locator('tbody').textContent()).includes('工作区 10000'), 'keyboard reaches last virtual record');
        const sticky = await table.evaluate(element => {
            const viewport = element.querySelector('.ui-scroll-viewport').getBoundingClientRect();
            return Math.abs(element.querySelector('th').getBoundingClientRect().top - viewport.top);
        });
        assert.ok(sticky < 1, 'header remains at top while virtual rows scroll');
        await capture('keyboard-end');
        await viewport.evaluate(element => element.scrollTop = 0);
        await page.waitForFunction(() => document.querySelector('.ui-scroll-viewport').scrollTop === 0);
        await table.getByRole('button', { name: /任务数/ }).click();
        await table.getByRole('button', { name: /任务数/ }).click();
        await page.waitForFunction(() => document.querySelector('.u-data-table tbody').textContent.includes('工作区 10000'));
        await capture('sorted-descending');
        await viewport.hover();
        await page.mouse.wheel(0, 600);
        await page.waitForFunction(() => document.querySelector('.ui-scroll-viewport').scrollTop > 100);
        const thumb = table.locator('.ui-scroll-track.is-vertical .ui-scroll-thumb');
        await thumb.waitFor();
        const box = await thumb.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100, { steps: 5 });
        await page.mouse.up();
        await page.waitForFunction(() => document.querySelector('.ui-scroll-viewport').scrollTop > 10000);
        await viewport.evaluate(element => { element.scrollTop = 0; });
        await page.evaluate(() => window.virtualFixture.state.width = 1000);
        await page.waitForFunction(() => document.querySelector('.ui-scroll-viewport').scrollWidth > document.querySelector('.ui-scroll-viewport').clientWidth);
        await viewport.evaluate(element => element.scrollLeft = 200);
        await page.waitForFunction(() => document.querySelector('.ui-scroll-viewport').scrollLeft === 200);
        await table.locator('.ui-scroll-track.is-horizontal').waitFor();
        await capture('horizontal-scroll');
        assert.deepEqual(errors, []);
        await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ reports, keyboardFirst: first.trim(), passed: ['frame geometry', '10000 rows remain virtualized', 'keyboard end and sticky header', 'descending sort', 'wheel scrolling', 'overlay thumb drag', 'horizontal overflow'], errors }, null, 4));
        console.log(JSON.stringify({ evidence, reports, errors }, null, 4));
    }
} catch (error) {
    console.error(JSON.stringify({ evidence, reports, errors, tracks: await page.locator('.ui-scroll-track').evaluateAll(nodes => nodes.map(node => ({ class: node.className, rect: node.getBoundingClientRect().toJSON(), style: getComputedStyle(node).visibility }))) }));
    await capture('failure');
    throw error;
} finally { await app.close(); await server.close(); }
