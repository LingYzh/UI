import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'table-footer-'));
const fixture = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
    import { createApp, h, reactive } from 'vue';
    import { UDataTableServer, createUI } from '/src/ui/index.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';
    const ui = createUI();
    const state = reactive({ total: 2, size: 10, page: 1, loading: false, variants: false });
    const headers = [{ key: 'name', title: '项目' }, { key: 'status', title: '状态' }, { key: 'count', title: '文件数', align: 'end' }];
    const items = [{ id: 1, name: '工作区 01', status: '进行中', count: 12 }, { id: 2, name: '工作区 02', status: '就绪', count: 49 }];
    window.footerFixture = { state, theme: ui.theme };
    createApp({ render() {
        const variants = state.variants ? [{}, { dense: true }, { ghost: true }, { rounded: false }] : [{}];
        return h('div', { style: { padding: '24px', display: 'grid', gap: '16px' } }, variants.map((variant, index) => h(UDataTableServer, { ...variant, headers, items, itemsLength: state.total, itemsPerPageOptions: [10, 25, 50, 10000], itemsPerPage: state.size, 'onUpdate:itemsPerPage': value => state.size = value, page: state.page, 'onUpdate:page': value => state.page = value, loading: state.loading, label: '分页测试 ' + index })));
    } }).use(ui).mount('#app');
</script></body></html>`;
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'table-footer-fixture',
    configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
            if (request.url !== '/__table-footer.html') { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await server.transformIndexHtml('/__table-footer.html', fixture));
        });
    }
}] });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__table-footer.html` };
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
    await page.waitForTimeout(150);
    const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
async function checkFooters(name) {
    const metrics = await page.locator('.ui-table-footer').evaluateAll(footers => footers.map(footer => {
        const select = footer.querySelector('select');
        const content = select.querySelector('selectedcontent');
        const selected = select.selectedOptions[0];
        const style = getComputedStyle(select);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = style.font;
        const textWidth = context.measureText(selected.textContent.trim()).width;
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const range = footer.querySelector('.ui-table-range');
        const children = [...footer.children].map(element => element.getBoundingClientRect());
        const overlap = children.some((rect, index) => children.slice(index + 1).some(other => rect.left < other.right - 1 && other.left < rect.right - 1 && rect.top < other.bottom - 1 && other.top < rect.bottom - 1));
        return { text: selected.textContent.trim(), textWidth, selectWidth: select.getBoundingClientRect().width, selectionWidth: content?.getBoundingClientRect().width, selectionOverflow: content ? content.scrollWidth > content.clientWidth + 1 : select.clientWidth < textWidth + padding + 16, range: range.textContent.trim(), rangeOverflow: range.scrollWidth > range.clientWidth + 1, footerOverflow: footer.scrollWidth > footer.clientWidth + 1, overlap };
    }));
    for (const row of metrics) {
        assert.equal(row.selectionOverflow, false, `${name}: ${row.text} fits without ellipsis`);
        assert.equal(row.rangeOverflow, false, `${name}: range text remains complete`);
        assert.equal(row.footerOverflow, false, `${name}: footer stays within frame`);
        assert.equal(row.overlap, false, `${name}: controls do not overlap`);
    }
    reports.push({ name, metrics });
}
try {
    const select = page.locator('.ui-table-page-size select').first();
    await select.waitFor();
    for (const [name, width, zoom, dark] of [['light-wide', 900, 1, false], ['dark-mobile', 390, 1, true], ['light-zoom125', 800, 1.25, false], ['light-320', 320, 1, false]]) {
        await app.evaluate(({ BrowserWindow }, { width, zoom }) => {
            const window = BrowserWindow.getAllWindows()[0];
            window.setContentSize(width, 760);
            window.webContents.setZoomFactor(zoom);
        }, { width, zoom });
        await page.evaluate(dark => window.footerFixture.theme.change(dark ? 'dark' : 'light'), dark);
        await checkFooters(name);
        await capture(name);
    }
    await page.evaluate(() => { const state = window.footerFixture.state; state.total = 10000; state.page = 2; });
    await page.waitForFunction(() => document.querySelector('.ui-table-range').textContent.includes('10000'));
    await select.selectOption('10000');
    await page.waitForFunction(() => window.footerFixture.state.size === 10000 && window.footerFixture.state.page === 1);
    await checkFooters('long-option-320');
    await capture('long-option-320');
    await page.evaluate(() => window.footerFixture.state.loading = true);
    await page.waitForFunction(() => document.querySelector('.ui-table-page-size select').disabled);
    assert.equal(await page.locator('.ui-pagination button:not(:disabled)').count(), 0);
    await page.evaluate(() => { const state = window.footerFixture.state; state.loading = false; state.total = 0; });
    await page.waitForFunction(() => document.querySelector('.ui-table-range').textContent.includes('0'));
    await checkFooters('empty-320');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(900, 1000));
    await page.evaluate(() => { const state = window.footerFixture.state; state.variants = true; state.total = 2; state.size = 10; });
    await page.waitForFunction(() => document.querySelectorAll('.ui-table-footer').length === 4);
    await checkFooters('four-variants');
    await capture('four-variants');
    assert.deepEqual(errors, []);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ reports, passed: ['complete selected labels', 'complete range text', 'wrapping without overlap', 'page-size resets page', 'loading disables controls', 'empty count', 'default/dense/ghost/square'], errors }, null, 4));
    console.log(JSON.stringify({ evidence, groups: reports.length, errors }, null, 4));
} catch (error) {
    console.error(JSON.stringify({ evidence, errors, html: (await page.locator('body').innerHTML()).slice(0, 1800) }));
    await capture('failure');
    throw error;
} finally { await app.close(); await server.close(); }
