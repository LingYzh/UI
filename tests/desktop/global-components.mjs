// 使用正在运行的真实文档服务，无需全量构建。
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.UI_DOCS_URL || 'http://127.0.0.1:5174';
const evidence = 'artifacts/global-components';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(60000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
    if (message.text().includes('[Vue warn]')) errors.push(message.text());
});

try {
    await page.goto(`${base}/#/getting-started`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox', { name: '项目名称', exact: true }).fill('全局组件示例');
    await page.getByRole('button', { name: '保存 0 次', exact: true }).click();
    await page.getByRole('button', { name: '保存 1 次', exact: true }).waitFor();
    await page.getByText('全局组件示例', { exact: true }).waitFor();
    await page.locator('.global-components-demo').screenshot({ path: `${evidence}/guide-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: '保存 1 次', exact: true }).click();
    await page.getByRole('button', { name: '保存 2 次', exact: true }).waitFor();
    await page.locator('.global-components-demo').screenshot({ path: `${evidence}/guide-narrow.png` });
    assert.deepEqual(errors, []);
    await writeFile(`${evidence}/report.json`, JSON.stringify({ base, desktop: true, narrow: true, errors }, null, 4) + '\n');
    console.log('无组件导入的真实文档 demo：模板解析、输入、按钮点击及 390px 通过，无异常/警告。');
} finally {
    await browser.close();
}
