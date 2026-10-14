// 在运行中的文档源码服务验收设计器所需控件，不隐式构建。
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = process.env.UI_DOCS_URL || 'http://127.0.0.1:5174';
const evidence = fileURLToPath(new URL('../../.Codex/evidence/designer-controls/', import.meta.url));
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: process.env.UI_QA_BROWSER || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
page.setDefaultTimeout(10000);
const errors = [];
const results = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (['warning', 'error'].includes(message.type())) errors.push(`${message.text()} ${message.location().url || ''}`.trim()); });
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
async function open(id, component) {
    await page.goto(`${base}/#/${id}`);
    const demo = page.locator(`[data-demo-component=${component}]`).last();
    await demo.waitFor();
    return demo;
}
async function snap(name) { await page.screenshot({ path: `${evidence}/${name}.png` }); }
try {
    let demo = await open('cascader', 'UCascader');
    let multi = demo.locator('.ui-cascader').nth(1);
    await multi.getByRole('combobox').fill('宁波');
    await page.locator('.ui-cascader-search-result:visible input[type=checkbox]').click();
    assert.match(await demo.locator('output').last().textContent(), /"east","zhejiang","ningbo"/);
    assert.equal(await multi.locator('.ui-cascader-chip').count(), 1);
    await multi.getByRole('button', { name: '清除选择' }).click();
    await multi.getByRole('combobox').fill('华东');
    await page.locator('.ui-cascader-search-result:visible').first().waitFor();
    assert.equal(await page.locator('.ui-cascader-search-result:visible').count(), 3, '普通模式仅列出可选叶节点');
    await page.keyboard.press('Escape');
    await multi.getByRole('combobox').click();
    await page.locator('.ui-cascader-option-row:visible').filter({ has: page.getByText('华东', { exact: true }) }).locator('input[type=checkbox]').click();
    await page.keyboard.press('Escape');
    await demo.getByRole('checkbox', { name: '折叠已选标签' }).check();
    await multi.getByText('+2', { exact: true }).waitFor();
    assert.equal(await multi.locator('.ui-cascader-chip').count(), 2, '一条路径和一个折叠计数');
    await snap('cascader-collapsed');
    await demo.getByRole('checkbox', { name: '严格模式：父节点独立选择' }).check();
    await multi.getByRole('button', { name: '清除选择' }).click();
    await multi.getByRole('combobox').fill('华东');
    await page.locator('.ui-cascader-search-result:visible').first().waitFor();
    assert.ok(await page.locator('.ui-cascader-search-result:visible').count() > 3);
    await page.locator('.ui-cascader-search-result:visible').filter({ has: page.getByText('华东', { exact: true }) }).locator('input[type=checkbox]').click();
    assert.match(await demo.locator('output').last().textContent(), /\[\["east"\]\]/);
    await page.keyboard.press('Escape');
    await multi.getByRole('combobox').focus();
    await page.keyboard.press('Backspace');
    assert.match(await demo.locator('output').last().textContent(), /：\s*\[\]/);
    results.push({ check: 'cascader-inline-search-paths-collapse-strict-keyboard' });

    demo = await open('time-input', 'UTimeInput');
    let time = demo.locator('.u-time-input').first();
    assert.equal(await time.locator('input').getAttribute('readonly'), '');
    await time.getByRole('button', { name: '打开时间选择' }).click();
    let menu = page.locator('.u-time-input-menu:visible');
    await menu.locator('select').first().selectOption('15');
    await menu.getByRole('button', { name: '取消', exact: true }).click();
    assert.equal(await time.locator('input').inputValue(), '14:30');
    await time.getByRole('button', { name: '打开时间选择' }).click();
    menu = page.locator('.u-time-input-menu:visible');
    await menu.locator('select').first().selectOption('15');
    await menu.getByRole('button', { name: '确定', exact: true }).click();
    assert.equal(await time.locator('input').inputValue(), '15:30');
    await time.getByRole('button', { name: '清空时间' }).click();
    assert.equal(await time.locator('input').inputValue(), '');
    await demo.locator('.u-time-input').nth(1).getByRole('button', { name: '打开时间选择' }).click();
    menu = page.locator('.u-time-input-menu:visible');
    await menu.locator('select').first().selectOption('18');
    assert.equal(await menu.getByRole('button', { name: '确定', exact: true }).isDisabled(), true);
    await snap('time-reversed-range');
    await page.keyboard.press('Escape');
    await demo.locator('.u-time-input').nth(2).getByRole('button', { name: '打开时间选择' }).click();
    menu = page.locator('.u-time-input-menu:visible');
    const disabledHours = await menu.locator('select').first().locator('option:disabled').evaluateAll(options => options.map(option => Number(option.value)));
    assert.ok(disabledHours.includes(8) && disabledHours.includes(12) && !disabledHours.includes(9));
    await menu.getByRole('button', { name: '确定', exact: true }).click();
    assert.equal(await demo.locator('.u-time-input').nth(2).locator('input').inputValue(), '09:15:20');
    assert.equal(await demo.locator('.u-time-input').nth(4).getByRole('button', { name: '打开时间选择' }).isDisabled(), true);
    results.push({ check: 'time-draft-cancel-save-clear-range-order-disjoint-readonly' });

    demo = await open('date-input', 'UDateInput');
    const dates = demo.locator('.u-date-input');
    assert.equal(await dates.first().locator('input').getAttribute('readonly'), '');
    const values = await dates.locator('input').evaluateAll(inputs => inputs.map(input => input.value));
    assert.ok(values.includes('2026-10-06 至 2026-10-10'));
    assert.ok(values.some(value => value.includes('09:00:00 ~ 2026-10-10 17:30:00')));
    await dates.first().locator('input').click();
    await page.locator('.u-date-input-menu:visible [data-date="2026-10-07"]').click();
    assert.equal(await dates.first().locator('input').inputValue(), '2026-10-07');
    await dates.nth(3).locator('input').click();
    assert.equal(await page.locator('.u-date-input-menu:visible .u-date-picker-options button').count(), 12);
    await page.keyboard.press('Escape');
    await dates.nth(5).locator('input').click();
    assert.equal(await page.locator('.u-date-input-menu:visible').getByRole('button', { name: '确定', exact: true }).count(), 1, '日期时间默认需要确认');
    await page.keyboard.press('Escape');
    await snap('date-modes-separators');
    results.push({ check: 'date-default-readonly-immediate-period-datetime-custom-separators' });

    demo = await open('color-input', 'UColorInput');
    await demo.locator('.ui-color-input').nth(4).locator('button').click();
    menu = page.locator('.ui-color-input-menu:visible');
    assert.deepEqual(await menu.locator('input[type=number]').evaluateAll(inputs => inputs.map(input => input.getAttribute('aria-label'))), ['色相', '饱和度', '明度']);
    await menu.locator('input[type=number]').first().fill('120');
    await menu.locator('input[type=number]').first().press('Tab');
    await snap('hsv-channels');
    await menu.getByRole('button', { name: '确定', exact: true }).click();
    assert.match(await demo.locator('output').first().textContent(), /hsv\(120/);
    await demo.locator('.ui-color-input').nth(5).locator('button').click();
    menu = page.locator('.ui-color-input-menu:visible');
    await menu.locator('input[type=number]').last().fill('0.6');
    await menu.locator('input[type=number]').last().press('Tab');
    await menu.getByRole('button', { name: '确定', exact: true }).click();
    assert.match(await demo.locator('output').first().textContent(), /hsva\([^)]*0\.6\)/);
    results.push({ check: 'hsv-and-hsva-source-format-preserved' });

    demo = await open('checkbox-group', 'UCheckboxGroup');
    assert.equal(await demo.locator('.ui-checkbox.is-bordered').count(), 4, 'label 属性也应渲染为完整的带边框选项');
    await demo.getByRole('checkbox', { name: '第一项', exact: true }).click();
    assert.equal(await demo.getByRole('checkbox', { name: '第一项', exact: true }).isChecked(), true);
    await demo.getByRole('checkbox', { name: '第三项', exact: true }).check();
    await demo.getByRole('checkbox', { name: '第四项', exact: true }).click();
    assert.equal(await demo.getByRole('checkbox', { name: '第四项', exact: true }).isChecked(), false);
    await snap('bordered-choices-min-max');
    results.push({ check: 'checkbox-min-max-borders' });

    demo = await open('file-upload', 'UFileUpload');
    await demo.locator('input[type=file]').first().setInputFiles('E:/WebstormProjects/NC_Admin/public/tabLogo.png');
    await demo.getByRole('button', { name: '预览 tabLogo.png' }).click();
    await page.locator('.ui-image-viewer:visible').waitFor();
    await page.keyboard.press('Escape');
    await demo.getByRole('combobox').first().click();
    await page.getByRole('option', { name: '图片卡片', exact: true }).click();
    await demo.locator('.ui-upload-files.is-picture-card').waitFor();
    await snap('upload-picture-card');
    await demo.getByRole('button', { name: '移除 tabLogo.png' }).click();
    assert.equal(await demo.getByRole('button', { name: '预览 tabLogo.png' }).count(), 0);
    results.push({ check: 'upload-picture-viewer-card-remove' });

    for (const [id, component] of [['cascader', 'UCascader'], ['time-input', 'UTimeInput'], ['date-input', 'UDateInput'], ['checkbox-group', 'UCheckboxGroup'], ['file-upload', 'UFileUpload']]) {
        demo = await open(id, component);
        await page.setViewportSize({ width: 390, height: 844 });
        await demo.scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await snap(`${id}-mobile`);
        results.push({ check: 'mobile-layout', id });
        await page.setViewportSize({ width: 1440, height: 1000 });
    }
    assert.deepEqual(errors, []);
    console.log(`designer-controls: ${results.length}/${results.length}, zero console errors`);
} finally {
    await writeFile(`${evidence}/results.json`, JSON.stringify({ results, errors }, null, 4));
    await browser.close();
}
