import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = 'artifacts/tree-select-multiple';
await mkdir(evidence, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } });
await server.listen();
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
const results = [];
try {
    for (const variant of [
        { name: 'desktop', width: 1440, height: 1000, theme: 'light' },
        { name: 'dark', width: 1100, height: 850, theme: 'dark' },
        { name: 'narrow', width: 390, height: 844, theme: 'light' }
    ]) {
        const context = await browser.newContext({ viewport: { width: variant.width, height: variant.height }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${server.resolvedUrls.local[0]}#/tree-select`);
        await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(variant.theme === 'dark');
        assert.equal(await page.getByRole('checkbox', { name: '深色主题', exact: true }).isChecked(), variant.theme === 'dark');
        const trigger = page.getByRole('combobox', { name: '自定义部门', exact: true });
        await trigger.click();
        const tree = page.getByRole('tree').filter({ visible: true });
        await tree.getByRole('checkbox', { name: '前端组', exact: true }).waitFor();
        assert.equal(await tree.getByRole('checkbox', { name: '前端组', exact: true }).isChecked(), true);
        await tree.getByRole('checkbox', { name: '研发部', exact: true }).check();
        assert.equal(await tree.getByRole('checkbox', { name: '后端组', exact: true }).isChecked(), false, '父节点不会授予兄弟子节点');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true', '多选保持展开');
        await tree.getByRole('checkbox', { name: '前端组', exact: true }).uncheck();
        assert.equal(await tree.getByRole('checkbox', { name: '研发部', exact: true }).isChecked(), true, '独立取消不改变父级');
        assert.equal(await tree.getByRole('checkbox', { name: '停用部门', exact: true }).isDisabled(), true);
        await page.screenshot({ path: `${evidence}/${variant.name}-open.png` });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        const field = page.locator('.ui-tree-select').filter({ has: trigger });
        await field.getByRole('button', { name: '清除', exact: true }).click();
        await trigger.click();
        assert.equal(await tree.getByRole('checkbox', { name: '研发部', exact: true }).isChecked(), false, '清空输出空数组');
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        results.push(variant.name);
        await context.close();
    }
    assert.deepEqual(errors, []);
} finally {
    await writeFile(`${evidence}/results.json`, JSON.stringify({ results, errors }, null, 4));
    await browser.close();
    await server.close();
}
console.log(`tree-select multiple: ${results.length} variants passed`);
