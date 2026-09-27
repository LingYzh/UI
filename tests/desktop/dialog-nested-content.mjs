import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/dialog-nested-'));
const server = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/artifacts/**'] } } });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + 'index.html#/usage-meter' };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
try {
    const page = await app.firstWindow();
    await page.getByRole('button', { name: '打开嵌套内容弹窗', exact: true }).click();
    await page.getByRole('button', { name: '展开环境内容', exact: true }).click();
    await page.waitForTimeout(500);
    const dialog = page.locator('dialog[open]');
    for (const [theme, width, zoom] of [['light', 1440, 1], ['dark', 1440, 1], ['light', 900, 1.25], ['dark', 900, 1.25]]) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        await app.evaluate(({ BrowserWindow }, { width, zoom }) => { const window = BrowserWindow.getAllWindows()[0]; window.setSize(width, 900); window.webContents.setZoomFactor(zoom); }, { width, zoom });
        await page.waitForTimeout(400);
        await dialog.evaluate(dialog => {
            dialog.querySelector('.ui-dialog-scroll > .ui-scroll-viewport').scrollTop = 0;
            dialog.querySelector('.ui-code-block .ui-scroll-viewport').scrollTop = 0;
        });
        const capture = async suffix => {
            const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
            await writeFile(path.join(evidence, `${theme}-${width}-${zoom}-${suffix}.png`), Buffer.from(data.split(',')[1], 'base64'));
        };
        await page.waitForTimeout(100);
        await capture('expanded');
        const metrics = await dialog.evaluate(dialog => {
            const viewport = dialog.querySelector('.ui-dialog-scroll > .ui-scroll-viewport');
            const entries = [...dialog.querySelectorAll('.ui-scroll-area,.ui-scroll-viewport,.ui-collapse,.ui-collapse-content,.ui-code-block,pre')].map(element => ({ class: element.className, height: element.clientHeight, scroll: element.scrollHeight, scrollTop: element.scrollTop, top: element.getBoundingClientRect().top, bottom: element.getBoundingClientRect().bottom, flex: getComputedStyle(element).flex, maxHeight: getComputedStyle(element).maxHeight }));
            viewport.scrollTop = viewport.scrollHeight;
            return entries;
        });
        if (process.env.UI_DIAGNOSE) console.log(theme, JSON.stringify(metrics));
        await page.waitForTimeout(100);
        if (!process.env.UI_DIAGNOSE) {
            const inner = dialog.locator('.ui-code-block .ui-scroll-viewport');
            assert(await inner.evaluate(element => element.clientHeight >= 300), 'inner code viewport must retain readable height');
            const code = dialog.locator('.ui-code-block code');
            await inner.evaluate(element => element.scrollTop = element.scrollHeight);
            assert.match(await code.innerText(), /环境内容第 100 行/);
            const geometry = await dialog.evaluate(dialog => {
                const outer = dialog.querySelector('.ui-dialog-scroll > .ui-scroll-viewport');
                const after = dialog.querySelector('[data-nested-after]');
                const footer = dialog.querySelector('.ui-dialog-footer');
                const rect = after.getBoundingClientRect();
                const code = dialog.querySelector('.ui-code-block code');
                const text = code.firstChild;
                const range = document.createRange();
                range.setStart(text, text.textContent.indexOf('环境内容第 100 行'));
                range.setEnd(text, text.textContent.length);
                const lastLine = range.getBoundingClientRect();
                const outerRect = outer.getBoundingClientRect();
                return { textVisible: rect.top >= outerRect.top && rect.bottom <= outerRect.bottom, lastLineVisible: lastLine.top >= outerRect.top && lastLine.bottom <= outerRect.bottom, footerVisible: footer.getBoundingClientRect().bottom <= dialog.getBoundingClientRect().bottom + 1, shellScroll: dialog.querySelector('.ui-dialog-scroll').scrollTop, viewportAligned: Math.abs(outerRect.top - dialog.querySelector('.ui-dialog-scroll').getBoundingClientRect().top) < 1 };
            });
            assert.equal(geometry.textVisible, true, 'after-content must actually be painted inside outer viewport');
            assert.equal(geometry.footerVisible, true);
            assert.equal(geometry.lastLineVisible, true, 'last source line must actually be inside visible dialog viewport');
            assert.equal(geometry.shellScroll, 0, 'scroll wrapper must never scroll independently');
            assert.equal(geometry.viewportAligned, true, 'scroll viewport must stay aligned with its shell');
            await page.waitForTimeout(100);
            await capture('scrolled');
        }
    }
    console.log('Evidence: ' + evidence);
} finally { await app.close(); await server.close(); }
