import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/usage-meter-'));
const warnings = [];
const server = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/artifacts/**'] } }, customLogger: { info() {}, warn(message) { warnings.push(message); }, warnOnce(message) { warnings.push(message); }, error(message) { throw new Error(message); }, clearScreen() {}, hasErrorLogged() { return false; }, hasWarned: false } });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + 'index.html#/usage-meter' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const trigger = page.getByRole('button', { name: '上下文：12.4%，本地估算，查看详情', exact: true });
    await trigger.waitFor();
    await trigger.click();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    assert.equal(await page.getByRole('status').filter({ hasText: '已查看' }).innerText(), '已查看 3 次');
    assert.equal(await page.getByRole('button', { name: '容量未上报：容量未知，查看详情', exact: true }).innerText(), '1.2K · 容量未知');
    assert.equal(await page.getByRole('button', { name: '未知用量：未统计，查看详情', exact: true }).innerText(), '未统计');
    assert.equal(await page.getByRole('button', { name: '无效用量：未统计，查看详情', exact: true }).innerText(), '未统计');
    const over = page.getByRole('button', { name: '超出容量：120%，查看详情', exact: true });
    assert.equal(await over.locator('.ui-usage-progress').getAttribute('stroke-dasharray'), '100 100');
    assert.equal(await page.getByRole('button', { name: '零用量：0%，查看详情', exact: true }).locator('.ui-usage-progress').getAttribute('stroke-dasharray'), '0 100');
    assert.equal(await page.getByRole('button', { name: '禁用：20%，查看详情', exact: true }).isDisabled(), true);
    assert.match(await page.locator('.ui-usage-composition').innerText(), /合计 24,200（部分未统计）/);
    assert.equal(await page.locator('.ui-usage-legend li').last().innerText(), '压缩摘要\n未统计');
    await page.getByRole('button', { name: '更新用量', exact: true }).click();
    await page.getByRole('button', { name: '上下文：20%，本地估算，查看详情', exact: true }).waitFor();
    assert.match(await page.locator('.ui-usage-heading').innerText(), /40,000/);
    await page.getByRole('button', { name: '更新用量', exact: true }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await trigger.locator('.ui-usage-progress').evaluate(element => getComputedStyle(element).transitionDuration), '0s');
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        for (const [width, zoom] of [[1440, 1], [900, 1], [900, 1.25]]) {
            await app.evaluate(({ BrowserWindow }, { width, zoom }) => {
                const window = BrowserWindow.getAllWindows()[0];
                window.setSize(width, 1000);
                window.webContents.setZoomFactor(zoom);
            }, { width, zoom });
            await page.waitForTimeout(250);
            await trigger.evaluate(element => element.scrollIntoView({ block: 'center' }));
            await trigger.focus();
            await page.waitForTimeout(100);
            const overflow = await page.locator('.usage-demo').evaluate(element => element.scrollWidth > element.clientWidth + 1);
            assert.equal(overflow, false, `${theme} ${width} ${zoom}: demo overflow`);
            const image = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
            await writeFile(path.join(evidence, `${theme}-${width}-${zoom}.png`), Buffer.from(image.split(',')[1], 'base64'));
        }
    }
    assert.deepEqual(errors, []);
    assert.equal(warnings.filter(message => /cannot be child|hydration/i.test(message)).length, 0);
    console.log('PASS usage meter: keyboard/click, zero, unknown, invalid, disabled, overflow, separate composition, updates, reduced motion, light/dark 1440/900/125%: ' + evidence);
} finally {
    await app.close();
    await server.close();
}
