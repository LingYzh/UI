import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/activity-'));
const warnings = [];
const server = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/artifacts/**'] } }, customLogger: { info() {}, warn(message) { warnings.push(message); }, warnOnce(message) { warnings.push(message); }, error(message) { throw new Error(message); }, clearScreen() {}, hasErrorLogged() { return false; }, hasWarned: false } });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + 'index.html#/activity' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(8000);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const heading = page.getByRole('button', { name: '思考过程 已完成' });
    await heading.waitFor();
    assert.equal(await heading.getAttribute('aria-expanded'), 'true');
    await heading.focus(); await page.keyboard.press('Enter');
    assert.equal(await heading.getAttribute('aria-expanded'), 'false');
    await page.keyboard.press('Space');
    assert.equal(await heading.getAttribute('aria-expanded'), 'true');
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        await app.evaluate(({ BrowserWindow }) => { const window = BrowserWindow.getAllWindows()[0]; window.setSize(900, 800); window.webContents.setZoomFactor(1.25); });
        await page.waitForTimeout(450);
        await heading.evaluate(el => el.scrollIntoView({ block: 'start' }));
        await page.waitForTimeout(200);
        const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
        await writeFile(path.join(evidence, theme + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    }
    await page.goto(server.resolvedUrls.local[0] + 'index.html#/select');
    await page.getByRole('combobox', { name: 'Permission mode', exact: true }).waitFor();
    assert.equal(warnings.filter(w => /cannot be child|hydration/i.test(w)).length, 0, warnings.join('\n'));
    assert.deepEqual(errors, []);
    console.log('PASS activity keyboard, themes, dev compiler warnings: ' + evidence);
} finally { await app.close(); await server.close(); }
