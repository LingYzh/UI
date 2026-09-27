import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/textarea-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + 'index.html#/textarea' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
try {
    const page = await app.firstWindow();
    await page.getByLabel('Agent 指令', { exact: true }).fill('你是代码审阅助手。\n请先阅读上下文，再输出结论。');
    assert.equal(await page.getByLabel('禁用指令').isDisabled(), true);
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        await page.waitForTimeout(200);
        const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
        await writeFile(path.join(evidence, theme + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    }
    console.log(evidence);
} finally { await app.close(); await server.close(); }
