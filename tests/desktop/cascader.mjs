import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'cascader-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const previewUrl = server.resolvedUrls.local[0] + 'index.html';
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: previewUrl + '#/cascader' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const passed = [];
let demo;
let trigger;
let panel;
let pathOutput;
page.on('pageerror', error => errors.push(error.message));

async function setWindow(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(size.zoom);
        window.setContentSize(size.width, size.height);
    }, { width, height, zoom });
    await page.waitForTimeout(120);
    await page.waitForFunction(size => Math.abs(innerWidth - Math.round(size.width / size.zoom)) <= 1 && Math.abs(innerHeight - Math.round(size.height / size.zoom)) <= 1, { width, height, zoom });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const target = theme === 'dark';
    const checked = await toggle.isChecked();
    const currentTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    if (checked === target && currentTheme !== theme) {
        await toggle.setChecked(!target);
        await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, target ? 'light' : 'dark');
    }
    await toggle.setChecked(target);
    await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme);
}

async function capture(name, expectedSize) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), contentSize: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    const actualSize = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    assert.deepEqual(captured.contentSize, [expectedSize.width, expectedSize.height], `${name} Electron content size`);
    assert.deepEqual(actualSize, expectedSize, `${name} PNG dimensions`);
    await writeFile(path.join(evidence, `${name}.png`), png);
}

async function waitPopover(open) {
    const element = await panel.elementHandle();
    await page.waitForFunction(({ element, open }) => element.matches(':popover-open') === open, { element, open });
}

async function assertPath(expected, context) {
    await page.waitForFunction(value => document.querySelector('.cascader-demo-value code')?.textContent === JSON.stringify(value), expected);
    assert.equal(await demo.locator('.cascader-demo-value code').textContent(), JSON.stringify(expected), context);
}

async function assertFocus(locator, context) {
    assert.equal(await locator.evaluate(element => document.activeElement === element), true, `${context} focus`);
}

async function assertNoDocumentOverflow(context) {
    const metrics = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(metrics.document <= metrics.viewport + 1, `${context}: document overflow ${JSON.stringify(metrics)}`);
    assert.ok(metrics.body <= metrics.viewport + 1, `${context}: body overflow ${JSON.stringify(metrics)}`);
}

async function assertClosedAndOutsideFocus(context) {
    await waitPopover(false);
    assert.equal(await page.evaluate(element => element.contains(document.activeElement), await panel.elementHandle()), false, `${context} must leave focus outside the closed popup`);
    assert.equal(await page.evaluate(() => document.activeElement !== document.body), true, `${context} must not drop focus to body`);
}

try {
    await page.locator('.docs-shell').waitFor();
    await page.locator('.docs-page-heading h1').waitFor();
    demo = page.locator('.docs-example[aria-labelledby="cascader-form-heading"] .cascader-demo');
    await demo.waitFor();
    const form = demo.locator('form.ui-form[aria-label="级联选择表单"]');
    trigger = form.getByRole('combobox', { name: '所属区域', exact: true });
    // A closed native popover is absent from the accessibility tree, so use
    // its stable DOM root for open/closed state and role assertions while open.
    panel = page.locator('.ui-cascader-panel');
    const field = demo.locator('.ui-field:has(.ui-cascader)');
    const name = form.getByRole('textbox', { name: '项目名称', exact: true });
    const save = form.getByRole('button', { name: '保存区域', exact: true });
    const reset = form.getByRole('button', { name: '重置级联表单', exact: true });
    const state = form.locator('.ui-form-actions-leading [role="status"]');
    pathOutput = demo.locator('.cascader-demo-value code');
    const option = (level, label) => panel.locator(`.ui-cascader-column[data-level="${level}"]`).getByRole('option', { name: label, exact: true });
    const columns = panel.locator('.ui-cascader-column');

    await setWindow(1440, 900);
    await setTheme('light');
    assert.match(await state.textContent(), /尚未提交 · 未验证$/, 'cascader form starts unvalidated');
    await demo.scrollIntoViewIfNeeded();
    await capture('cascader-1440x900-light', { width: 1440, height: 900 });

    await save.click();
    await page.waitForFunction(() => document.querySelector('.cascader-demo .ui-form-actions-leading [role="status"]')?.textContent.includes('请先选择区域'));
    await field.locator('.ui-field-error').waitFor();
    assert.match(await field.locator('.ui-field-error').textContent(), /请选择完整路径。/, 'required validation requires a path');
    await assertFocus(trigger, 'invalid form submit');
    passed.push('required validation blocks submit and focuses the cascader trigger');

    await page.keyboard.press('ArrowDown');
    await waitPopover(true);
    assert.equal(await panel.getAttribute('role'), 'dialog', 'open popup has dialog semantics');
    assert.equal(await panel.getAttribute('aria-label'), '所属区域 可选项', 'open popup has an accessible name');
    await page.getByRole('dialog', { name: '所属区域 可选项', exact: true }).waitFor();
    await assertFocus(option(0, '华东 含下级选项'), 'ArrowDown opens on the first option');
    await page.keyboard.press('Tab');
    await assertClosedAndOutsideFocus('Tab');
    await assertFocus(name, 'Tab closes the popup and advances to the next form field');
    await assertPath([], 'Tab does not change the model');
    passed.push('Tab closes the popup and advances to the next form field without changing the value');

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await waitPopover(true);
    await name.click();
    await waitPopover(false);
    await assertFocus(name, 'pointer outside click receives focus after the popup closes');
    assert.equal(await trigger.evaluate(element => document.activeElement === element), false, 'pointer outside click releases trigger focus after keyboard open');
    await assertPath([], 'outside click does not change the model');
    passed.push('pointer outside click closes a keyboard-opened popup and releases trigger focus');

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await waitPopover(true);
    await assertFocus(option(0, '华东 含下级选项'), 'ArrowDown reopens on the first option');
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('Escape');
    await assertFocus(trigger, 'Escape restores the trigger');
    await assertPath([], 'Escape does not change the model');

    await page.keyboard.press('ArrowDown');
    await waitPopover(true);
    await page.keyboard.press('End');
    await assertFocus(option(0, '其他区域（数字值 0）'), 'End selects the last enabled root option');
    await page.keyboard.press('Home');
    await assertFocus(option(0, '华东 含下级选项'), 'Home selects the first root option');
    await page.keyboard.press('ArrowDown');
    await assertFocus(option(0, '华南 含下级选项'), 'ArrowDown advances and skips the disabled branch');
    await page.keyboard.press('ArrowUp');
    await assertFocus(option(0, '华东 含下级选项'), 'ArrowUp moves to the prior enabled option');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 2);
    await assertFocus(option(1, '浙江省 含下级选项'), 'ArrowRight opens the child column');
    await assertPath([], 'navigating a branch leaves the model unchanged');
    await page.keyboard.press('ArrowLeft');
    await assertFocus(option(0, '华东 含下级选项'), 'ArrowLeft returns to the parent column');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 2);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 3);
    await assertFocus(option(2, '杭州市'), 'ArrowRight opens the third level');
    await page.keyboard.press('End');
    await assertFocus(option(2, '宁波市'), 'End selects the final enabled leaf');
    await page.keyboard.press('Home');
    await assertFocus(option(2, '杭州市'), 'Home selects the first leaf');
    await page.keyboard.press('ArrowDown');
    await assertFocus(option(2, '宁波市'), 'ArrowDown moves to the next leaf');
    await page.keyboard.press('ArrowUp');
    await assertFocus(option(2, '杭州市'), 'ArrowUp returns to the first leaf');
    await assertPath([], 'keyboard navigation does not commit a branch path');
    await page.keyboard.press('Enter');
    await assertClosedAndOutsideFocus('Enter leaf selection');
    await assertFocus(trigger, 'keyboard selection restores the trigger');
    await assertPath(['east', 'zhejiang', 'hangzhou'], 'Enter commits the full leaf value path');
    assert.equal(await trigger.locator('.ui-cascader-value').textContent(), '华东 / 浙江省 / 杭州市');
    passed.push('keyboard navigation covers Down/Right/Left/Up, Home/End, Enter and Escape; branch navigation never commits until a leaf is selected');

    const clear = demo.getByRole('button', { name: '清除选择', exact: true });
    await clear.click();
    await assertPath([], 'clear empties the model');
    await field.locator('.ui-field-error').waitFor();
    assert.match(await field.locator('.ui-field-error').textContent(), /请选择完整路径。/, 'clearing revalidates the required field');
    passed.push('clear button empties the value and reruns required validation');

    await reset.click();
    await page.waitForFunction(() => document.querySelector('.cascader-demo .ui-form-actions-leading [role="status"]')?.textContent.includes('未验证'));
    await assertPath([], 'form reset restores the initially empty path');
    assert.equal(await name.inputValue(), '', 'form reset restores the sibling input');
    assert.equal(await field.locator('.ui-field-error').count(), 0, 'form reset clears validation messages');

    await trigger.click();
    await waitPopover(true);
    assert.equal(await option(0, '暂未开放的区域').isDisabled(), true, 'disabled root branch is a disabled native button');
    await option(0, '华东 含下级选项').click();
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 2);
    await option(1, '江苏省 含下级选项').click();
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 3);
    const disabledLeaf = option(2, '苏州市');
    assert.equal(await disabledLeaf.isDisabled(), true, 'disabled leaf is a disabled native button');
    assert.equal(await pathOutput.textContent(), '[]', 'opening a disabled branch or leaf does not commit a value');
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('close after disabled-option checks');
    await assertPath([], 'disabled options leave the model empty');
    passed.push('disabled branch and leaf options cannot be selected and do not change the model');

    const changeOnSelect = demo.getByRole('checkbox', { name: '允许选择父级', exact: true });
    await changeOnSelect.check();
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await waitPopover(true);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 2);
    await assertPath([], 'Right remains navigation even when parent selection is enabled');
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('cancel parent navigation');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await waitPopover(true);
    await page.keyboard.press('ArrowDown');
    await assertFocus(option(0, '华南 含下级选项'), 'ArrowDown reaches the next parent');
    await page.keyboard.press('Space');
    await assertClosedAndOutsideFocus('Space parent selection');
    await assertFocus(trigger, 'Space selection restores the trigger');
    await assertPath(['south'], 'changeOnSelect commits an explicitly selected parent path');
    assert.equal(await trigger.locator('.ui-cascader-value').textContent(), '华南');
    passed.push('changeOnSelect commits a parent on Space while ArrowRight remains navigation only');

    await clear.click();
    await assertPath([], 'clearing the parent selection empties the model');
    await changeOnSelect.uncheck();
    await trigger.click();
    await waitPopover(true);
    await option(0, '华东 含下级选项').click();
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 2);
    await option(1, '浙江省 含下级选项').click();
    await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 3);
    await assertPath([], 'pointer branch navigation does not commit the model');
    await option(2, '杭州市').click();
    await waitPopover(false);
    assert.equal(await trigger.evaluate(element => document.activeElement === element), false, 'pointer leaf selection does not leave focus on the trigger');
    await assertPath(['east', 'zhejiang', 'hangzhou'], 'pointer leaf selection commits the full path');
    passed.push('pointer branch navigation leaves the model alone; leaf selection commits without persistent trigger focus');

    await clear.click();
    await assertPath([], 'clear restores the empty path before numeric selection');
    await trigger.click();
    await waitPopover(true);
    await option(0, '其他区域（数字值 0）').click();
    await waitPopover(false);
    await assertPath([0], 'numeric zero remains a numeric value and is not treated as empty');
    assert.equal(await trigger.locator('.ui-cascader-value').textContent(), '其他区域（数字值 0）');
    passed.push('numeric option value 0 is preserved in the v-model path');

    await name.fill('需重置');
    await reset.click();
    await page.waitForFunction(() => document.querySelector('.cascader-demo .ui-form-actions-leading [role="status"]')?.textContent.includes('未验证'));
    await assertPath([], 'reset clears a selected numeric path');
    assert.equal(await name.inputValue(), '', 'reset restores the sibling input value');
    assert.equal(await field.locator('.ui-field-error').count(), 0, 'reset removes current validation errors');
    passed.push('form reset restores initial values and clears cascade validation');

    const readonly = demo.getByRole('checkbox', { name: '统一只读', exact: true });
    await trigger.click();
    await waitPopover(true);
    await option(0, '其他区域（数字值 0）').click();
    await waitPopover(false);
    await readonly.check();
    assert.equal(await trigger.getAttribute('aria-readonly'), 'true', 'form readonly reaches the cascader trigger');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'readonly keyboard activation cannot open the popup');
    await trigger.click();
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'readonly pointer activation cannot open the popup');
    await assertPath([0], 'readonly mode preserves the selected value');
    assert.equal(await demo.getByRole('button', { name: '清除选择', exact: true }).count(), 0, 'readonly mode hides the clear action');
    await readonly.uncheck();

    const disabled = demo.getByRole('checkbox', { name: '统一禁用', exact: true });
    await disabled.check();
    assert.equal(await trigger.isDisabled(), true, 'form disabled reaches the cascader trigger');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'disabled trigger stays closed');
    assert.equal(await demo.getByRole('button', { name: '清除选择', exact: true }).isDisabled(), true, 'form disabled reaches the clear action');
    await disabled.uncheck();
    passed.push('form readonly preserves the value and blocks popup/clear; form disabled disables trigger and clear action');

    const dense = demo.getByRole('checkbox', { name: '紧凑控件', exact: true });
    const ghost = demo.getByRole('checkbox', { name: '透明控件', exact: true });
    const rounded = demo.getByRole('checkbox', { name: '圆角', exact: true });
    await dense.check();
    await ghost.check();
    await rounded.uncheck();
    await name.focus();
    const inheritedStyle = await page.evaluate(() => {
        const root = document.querySelector('.ui-cascader');
        const trigger = root.querySelector('.ui-cascader-trigger');
        return {
            dense: root.classList.contains('is-dense'), ghost: root.classList.contains('is-ghost'), square: root.classList.contains('is-square'),
            minHeight: getComputedStyle(trigger).minHeight, borderRadius: getComputedStyle(trigger).borderRadius
        };
    });
    assert.equal(inheritedStyle.dense && inheritedStyle.ghost && inheritedStyle.square, true, 'UiForm appearance settings inherit into UiCascader');
    assert.equal(inheritedStyle.minHeight, '30px');
    assert.equal(inheritedStyle.borderRadius, '0px');
    await dense.uncheck();
    await ghost.uncheck();
    await rounded.check();
    passed.push('dense, ghost and rounded appearance inherit from UiForm and affect cascader classes and computed styles');

    await reset.click();
    await page.waitForFunction(() => document.querySelector('.cascader-demo .ui-form-actions-leading [role="status"]')?.textContent.includes('未验证'));

    async function openThreeLevels() {
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        await waitPopover(true);
        await option(0, '华东 含下级选项').click();
        await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 2);
        await option(1, '浙江省 含下级选项').click();
        await page.waitForFunction(() => document.querySelectorAll('.ui-cascader-column').length === 3);
        await option(2, '杭州市').waitFor();
    }

    await setWindow(1440, 900);
    await setTheme('light');
    await openThreeLevels();
    await assertNoDocumentOverflow('1440px open cascader');
    await capture('cascader-1440x900-light-3levels-open', { width: 1440, height: 900 });
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('close light screenshot popup');

    await setTheme('dark');
    await openThreeLevels();
    await assertNoDocumentOverflow('1440px dark open cascader');
    await capture('cascader-1440x900-dark-3levels-open', { width: 1440, height: 900 });
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('close dark screenshot popup');

    await setWindow(390, 844);
    await setTheme('light');
    await openThreeLevels();
    await assertNoDocumentOverflow('narrow cascader');
    const narrow = await page.evaluate(() => {
        const panel = document.querySelector('.ui-cascader-panel');
        const rect = panel.getBoundingClientRect();
        return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, panel: { left: rect.left, right: rect.right, width: rect.width, clientWidth: panel.clientWidth, scrollWidth: panel.scrollWidth, scrollLeft: panel.scrollLeft, overflowX: getComputedStyle(panel).overflowX, maxHeight: getComputedStyle(panel).maxHeight }, documentLeft: document.documentElement.scrollLeft };
    });
    assert.ok(narrow.panel.left >= -1 && narrow.panel.right <= narrow.viewport + 1, `narrow popover remains in the viewport: ${JSON.stringify(narrow)}`);
    assert.ok(narrow.panel.scrollWidth > narrow.panel.clientWidth, `narrow popover owns horizontal overflow: ${JSON.stringify(narrow)}`);
    await panel.evaluate(element => { element.scrollLeft = element.scrollWidth; });
    const scrolled = await page.evaluate(() => ({ panelLeft: document.querySelector('.ui-cascader-panel').scrollLeft, documentLeft: document.documentElement.scrollLeft, documentWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(scrolled.panelLeft > 0, 'horizontal movement scrolls inside the popup');
    assert.equal(scrolled.documentLeft, narrow.documentLeft, 'popup scrolling does not move the document horizontally');
    assert.ok(scrolled.documentWidth <= scrolled.viewport + 1, 'popup scrolling does not overflow the document');
    assert.equal(await columns.first().evaluate(element => getComputedStyle(element).overflowY), 'auto', 'each option column owns vertical scrolling');
    await capture('cascader-390x844-light-3levels-open', { width: 390, height: 844 });
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('close narrow popup');
    passed.push('390px popover stays in the viewport, scrolls within its own panel/columns, and does not overflow or horizontally move the document');

    await setWindow(900, 900, 1.25);
    await setTheme('dark');
    await openThreeLevels();
    await assertNoDocumentOverflow('125% zoom cascader');
    await capture('cascader-900x900-zoom125-dark-3levels-open', { width: 900, height: 900 });
    await page.keyboard.press('Escape');
    await assertClosedAndOutsideFocus('close zoom screenshot popup');
    passed.push('captured a complete native 900x900 PNG at 125% zoom with three levels open and no document overflow');
} finally {
    await app.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}

assert.deepEqual(errors, []);
for (const item of passed) console.log(`PASS ${item}`);
console.log(`Evidence: ${evidence}`);
