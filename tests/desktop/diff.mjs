import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/diff-'));
const server = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/artifacts/**'] } } });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + 'index.html#/diff' };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
try {
    const page = await app.firstWindow();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const demo = page.locator('.live-example .ui-diff').first();
    await demo.waitFor();
    assert.equal(await demo.locator('[data-kind="added"]').count(), 2);
    assert.equal(await demo.locator('[data-kind="removed"]').count(), 1);
    await demo.getByRole('button', { name: '自动换行', exact: true }).click();
    assert.equal(await demo.locator('.ui-diff-lines.is-wrapped').count(), 1);
    await page.getByRole('button', { name: '编辑 src/greeting.ts 已完成' }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        await app.evaluate(({ BrowserWindow }) => { const win = BrowserWindow.getAllWindows()[0]; win.setSize(900, 800); win.webContents.setZoomFactor(1.25); });
        await demo.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
        await writeFile(path.join(evidence, `${theme}.png`), Buffer.from(data.split(',')[1], 'base64'));
    }
    assert.deepEqual(errors, []);
    console.log('PASS diff snapshots, context, wrapping, keyboard: ' + evidence);
} finally { await app.close(); await server.close(); }
