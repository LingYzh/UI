import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'forms-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const previewUrl = server.resolvedUrls.local[0] + 'index.html';
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: previewUrl + '#/form' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const passed = [];
let mainFrameNavigations = 0;
page.on('pageerror', (error) => errors.push(error.message));
page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) mainFrameNavigations++; });

async function setWindow(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(size.zoom);
        window.setContentSize(size.width, size.height);
    }, { width, height, zoom });
    await page.waitForTimeout(120);
    if (zoom === 1) {
        await page.waitForFunction((size) => window.innerWidth === size.width && window.innerHeight === size.height, { width, height });
    }
    await page.evaluate(async () => { await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const target = theme === 'dark';
    const current = await toggle.isChecked();
    const actual = await page.evaluate(() => document.documentElement.dataset.theme);
    if (current === target && actual !== theme) {
        await toggle.setChecked(!target);
        await page.waitForFunction((expected) => document.documentElement.dataset.theme === expected, target ? 'light' : 'dark');
    }
    await toggle.setChecked(target);
    await page.waitForFunction((expected) => document.documentElement.dataset.theme === expected, theme);
}

async function openExample(route, example) {
    await page.goto(previewUrl + '#/' + route);
    await page.locator('.docs-shell').waitFor();
    await page.locator('.docs-page-heading h1').waitFor();
    const demo = page.locator('.docs-example[aria-labelledby="' + example + '-heading"] .layout-demo');
    await demo.waitFor();
    return demo;
}

async function assertNoHorizontalOverflow(context) {
    const dimensions = await page.evaluate(() => {
        const content = document.querySelector('.docs-content-scroll');
        const demo = document.querySelector('.layout-demo');
        return {
            viewport: innerWidth,
            document: document.documentElement.scrollWidth,
            content: content ? { width: content.clientWidth, scrollWidth: content.scrollWidth } : null,
            demo: demo ? { width: demo.clientWidth, scrollWidth: demo.scrollWidth } : null
        };
    });
    assert.ok(dimensions.document <= dimensions.viewport + 1, context + ': document overflows ' + JSON.stringify(dimensions));
    if (dimensions.content) assert.ok(dimensions.content.scrollWidth <= dimensions.content.width + 1, context + ': docs content overflows ' + JSON.stringify(dimensions));
    if (dimensions.demo) assert.ok(dimensions.demo.scrollWidth <= dimensions.demo.width + 1, context + ': demo overflows ' + JSON.stringify(dimensions));
}

async function capture(name, expectedSize) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), contentSize: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    const actualSize = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    assert.deepEqual(captured.contentSize, [expectedSize.width, expectedSize.height], name + ' window content size');
    assert.deepEqual(actualSize, expectedSize, name + ' PNG dimensions');
    await writeFile(path.join(evidence, name + '.png'), png);
}

async function assertBlurred(locator, context) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await locator.evaluate((element) => document.activeElement === element), false, context + ' releases pointer focus');
}

async function assertFocused(locator, context) {
    assert.equal(await locator.evaluate((element) => document.activeElement === element), true, context + ' retains keyboard focus');
}

try {
    await page.locator('.docs-shell').waitFor();
    const demo = await openExample('form', 'layout-form-simple');
    const form = demo.locator('form.ui-form[aria-label="简化验证表单"]');
    const name = form.getByRole('textbox', { name: '名称', exact: true });
    const asyncName = form.getByRole('textbox', { name: '异步名称', exact: true });
    const choice = form.getByRole('combobox', { name: '运行方式', exact: true });
    const description = form.getByRole('textbox', { name: '说明', exact: true });
    const enabled = form.getByRole('checkbox', { name: '启用配置', exact: true });
    const accepted = form.getByRole('checkbox', { name: '使用约定 我已阅读并同意', exact: true });
    const radio = form.getByRole('radio', { name: '单选项 选项 A', exact: true });
    const swatches = form.getByRole('radiogroup', { name: '标记颜色', exact: true });
    const state = demo.locator('p[role="status"]');
    const save = form.getByRole('button', { name: '保存配置', exact: true });
    const reset = form.getByRole('button', { name: '重置', exact: true });
    const validate = form.getByRole('button', { name: '验证表单', exact: true });
    const clearValidation = form.getByRole('button', { name: '清除验证', exact: true });
    const nameField = name.locator('xpath=ancestor::div[contains(@class,"ui-field")][1]');
    const asyncNameField = asyncName.locator('xpath=ancestor::div[contains(@class,"ui-field")][1]');

    await setWindow(1440, 900);
    await setTheme('light');
    assert.match(await state.textContent(), /有效状态：未验证$/, 'form begins in the unknown validation state');
    await demo.scrollIntoViewIfNeeded();
    await capture('form-1440x900-light', { width: 1440, height: 900 });
    await setTheme('dark');
    await capture('form-1440x900-dark', { width: 1440, height: 900 });
    await setTheme('light');
    await setWindow(390, 844);
    await demo.scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow('form narrow viewport');
    await capture('form-390x844-light', { width: 390, height: 844 });
    await setWindow(900, 900, 1.25);
    await demo.scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow('form 125% zoom');
    await capture('form-900x900-zoom125-light', { width: 900, height: 900 });
    await setWindow(1440, 900);
    await setTheme('light');
    passed.push('captured light/dark, narrow and 125% zoom form layouts without horizontal overflow');

    const urlBeforeSubmit = page.url();
    const navigationsBeforeSubmit = mainFrameNavigations;
    await save.click();
    await page.waitForFunction(() => document.querySelector('.form-demo [role="status"]')?.textContent.includes('请修正表单错误'));
    assert.equal(await state.textContent().then((text) => text.includes('已保存配置')), false, 'invalid submit does not save');
    assert.match(await nameField.locator('.ui-field-error').textContent(), /请填写名称。/, 'required rule reports an error');
    await assertFocused(name, 'invalid submit');
    await name.fill('工作区');
    await accepted.check();
    await save.click();
    await page.waitForFunction(() => document.querySelector('.form-demo [role="status"]')?.textContent.includes('已保存配置'));
    assert.match(await state.textContent(), /有效状态：有效$/, 'valid name and agreement permit submit');
    assert.equal(page.url(), urlBeforeSubmit, 'submit remains on the docs page');
    assert.equal(mainFrameNavigations, navigationsBeforeSubmit, 'submit does not reload the page');
    passed.push('invalid submit is blocked and focuses the required name; corrected name plus agreement emits submit without navigation');

    await asyncName.fill('taken');
    await page.waitForTimeout(80);
    await asyncName.fill('free');
    await page.waitForTimeout(520);
    assert.equal(await asyncNameField.locator('.ui-field-error').count(), 0, 'stale taken result cannot overwrite the newer free value');
    assert.match(await state.textContent(), /有效状态：有效$/, 'latest successful async validation restores the valid state');
    passed.push('rapidly replacing taken with free prevents the delayed async error from reappearing');

    await clearValidation.click();
    assert.match(await state.textContent(), /^验证已清除/, 'clear validation gives the cancelled submit a distinguishable baseline');
    await save.click();
    await page.waitForFunction(() => document.querySelector('form[aria-label="简化验证表单"]')?.getAttribute('aria-busy') === 'true');
    await asyncName.fill('taken');
    await asyncNameField.locator('.ui-field-error').waitFor();
    assert.match(await asyncNameField.locator('.ui-field-error').textContent(), /此名称已经被使用。/, 'the latest async value reports its error');
    assert.match(await state.textContent(), /^验证已清除/, 'a cancelled submit does not emit submit or invalid');
    await clearValidation.click();
    await asyncName.fill('free');
    await page.waitForTimeout(450);
    assert.equal(await asyncNameField.locator('.ui-field-error').count(), 0, 'the replacement free value clears the taken error');
    await save.click();
    await page.waitForFunction(() => document.querySelector('.form-demo [role="status"]')?.textContent.includes('已保存配置'));
    assert.match(await state.textContent(), /有效状态：有效$/, 'form can be submitted after the stale validation is cleared');
    passed.push('changing a field during async submit cancels the old submit, reports the newest error, and allows a corrected resubmit');

    await description.fill('需要恢复的说明');
    await choice.selectOption('long');
    await enabled.uncheck();
    await accepted.uncheck();
    await swatches.getByRole('radio').first().click();
    await reset.click();
    await page.waitForFunction(() => document.querySelector('.form-demo [role="status"]')?.textContent.includes('已重置表单'));
    assert.equal(await name.inputValue(), '');
    assert.equal(await asyncName.inputValue(), '');
    assert.equal(await choice.inputValue(), 'short');
    assert.equal(await description.inputValue(), '');
    assert.equal(await enabled.isChecked(), true);
    assert.equal(await accepted.isChecked(), false);
    assert.equal(await radio.isChecked(), true);
    assert.equal(await swatches.getByRole('radio', { checked: true }).count(), 0, 'color returns to its initial unselected value');
    assert.equal(await form.locator('.ui-field-error').count(), 0, 'reset clears previous errors');
    assert.match(await state.textContent(), /有效状态：未验证$/, 'reset restores the unvalidated state');
    passed.push('reset restores the initial model values and clears validation state');

    await name.fill('xy');
    await nameField.locator('.ui-field-error').waitFor();
    await validate.click();
    await page.waitForFunction(() => document.querySelector('.form-demo [role="status"]')?.textContent.includes('发现'));
    assert.ok(await form.locator('.ui-field-error').count() >= 2, 'manual validation reports both the short name and missing agreement');
    await clearValidation.click();
    assert.equal(await name.inputValue(), 'xy', 'resetValidation keeps the edited value');
    assert.equal(await accepted.isChecked(), false, 'resetValidation keeps the agreement value');
    assert.equal(await form.locator('.ui-field-error').count(), 0, 'resetValidation clears validation messages');
    assert.match(await state.textContent(), /有效状态：未验证$/, 'resetValidation returns validity to unknown');
    passed.push('resetValidation removes validation state without resetting field values');

    await name.fill('baseline');
    await asyncName.fill('free');
    await description.fill('baseline text');
    await choice.selectOption('long');
    const enabledField = enabled.locator('xpath=ancestor::div[contains(@class,"ui-field")][1]');
    await enabledField.locator('.ui-field-label label').click();
    assert.equal(await enabled.isChecked(), false, 'clicking the associated switch label changes the value');
    await assertBlurred(enabled, 'switch label click');
    const agreementLabel = form.locator('.ui-checkbox').filter({ hasText: '我已阅读并同意' });
    await agreementLabel.click();
    assert.equal(await accepted.isChecked(), true, 'clicking the checkbox label changes its value');
    await assertBlurred(accepted, 'checkbox label click');
    const radioLabel = form.locator('.ui-radio').filter({ hasText: '选项 A' });
    await radioLabel.click();
    assert.equal(await radio.isChecked(), true);
    await assertBlurred(radio, 'radio label click');
    const swatchInputs = swatches.getByRole('radio');
    await swatches.locator('.ui-swatch').first().click();
    assert.equal(await swatchInputs.first().isChecked(), true, 'clicking a swatch label selects its color');
    await assertBlurred(swatchInputs.first(), 'swatch label click');
    passed.push('switch, checkbox, radio and swatch label clicks change values and release pointer focus');

    const globallyDisabled = demo.getByRole('checkbox', { name: '统一禁用', exact: true });
    await globallyDisabled.check();
    const allFormControls = form.locator('fieldset input, fieldset select, fieldset textarea, fieldset button');
    const disabledState = await allFormControls.evaluateAll((elements) => elements.length > 0 && elements.every((element) => element.matches(':disabled')));
    assert.equal(disabledState, true, 'global disabled applies to every form control and action button');
    await globallyDisabled.uncheck();
    passed.push('global disabled covers text controls, selection controls, swatches and form action buttons');

    const globallyReadonly = demo.getByRole('checkbox', { name: '统一只读', exact: true });
    await globallyReadonly.check();
    assert.equal(await name.evaluate((element) => element.readOnly), true);
    assert.equal(await description.evaluate((element) => element.readOnly), true);
    for (const control of [choice, enabled, accepted, radio]) assert.equal(await control.getAttribute('aria-readonly'), 'true');
    assert.equal(await swatches.getAttribute('aria-readonly'), 'true');

    const originalName = await name.inputValue();
    await name.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('cannot edit');
    assert.equal(await name.inputValue(), originalName, 'readonly input rejects keyboard edits');
    const originalDescription = await description.inputValue();
    await description.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('cannot edit');
    assert.equal(await description.inputValue(), originalDescription, 'readonly textarea rejects keyboard edits');
    const originalChoice = await choice.inputValue();
    await choice.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    assert.equal(await choice.inputValue(), originalChoice, 'readonly select rejects pointer and keyboard changes');
    const switchBeforeReadonly = await enabled.isChecked();
    await enabled.click();
    assert.equal(await enabled.isChecked(), switchBeforeReadonly, 'readonly switch rejects pointer changes');
    await enabled.focus();
    await page.keyboard.press('Space');
    assert.equal(await enabled.isChecked(), switchBeforeReadonly, 'readonly switch rejects Space');
    const agreementBeforeReadonly = await accepted.isChecked();
    await accepted.click();
    assert.equal(await accepted.isChecked(), agreementBeforeReadonly, 'readonly checkbox rejects pointer changes');
    await accepted.focus();
    await page.keyboard.press('Space');
    assert.equal(await accepted.isChecked(), agreementBeforeReadonly, 'readonly checkbox rejects Space');
    const radioBeforeReadonly = await radio.isChecked();
    await radioLabel.click();
    assert.equal(await radio.isChecked(), radioBeforeReadonly, 'readonly radio rejects label clicks');
    await radio.focus();
    await page.keyboard.press('Space');
    assert.equal(await radio.isChecked(), radioBeforeReadonly, 'readonly radio rejects Space');
    assert.equal(await swatchInputs.first().isChecked(), true);
    await swatchInputs.nth(1).click();
    assert.equal(await swatchInputs.first().isChecked(), true, 'readonly swatches reject pointer selection');
    await swatchInputs.nth(1).focus();
    await page.keyboard.press('Space');
    assert.equal(await swatchInputs.first().isChecked(), true, 'readonly swatches reject keyboard selection');
    await globallyReadonly.uncheck();
    passed.push('global readonly preserves input, textarea, select, checkbox, switch, radio and swatch values for pointer and keyboard attempts');

    const denseToggle = demo.getByRole('checkbox', { name: '统一紧凑', exact: true });
    const ghostToggle = demo.getByRole('checkbox', { name: '透明控件', exact: true });
    const roundedToggle = demo.getByRole('checkbox', { name: '圆角', exact: true });
    const inputRoot = name.locator('xpath=..');
    const textareaRoot = description;
    await denseToggle.check();
    await ghostToggle.check();
    await roundedToggle.uncheck();
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const visualClasses = await page.evaluate(() => {
        const input = document.querySelector('[aria-label="简化验证表单"] .ui-input');
        const select = document.querySelector('[aria-label="简化验证表单"] .ui-select');
        const textarea = document.querySelector('[aria-label="简化验证表单"] .ui-textarea');
        const button = document.querySelector('[aria-label="简化验证表单"] .ui-button');
        return {
            inputDense: input.classList.contains('is-dense'),
            selectDense: select.classList.contains('is-dense'),
            textareaDense: textarea.classList.contains('is-dense'),
            inputGhost: input.classList.contains('is-ghost'),
            selectGhost: select.classList.contains('is-ghost'),
            textareaGhost: textarea.classList.contains('is-ghost'),
            inputSquare: input.classList.contains('is-square'),
            selectSquare: select.classList.contains('is-square'),
            textareaSquare: textarea.classList.contains('is-square'),
            buttonDense: button.classList.contains('sm'),
            buttonTextSurface: {
                border: getComputedStyle(button).borderTopColor,
                background: getComputedStyle(button).backgroundColor
            },
            buttonSquare: button.classList.contains('is-square'),
            inputHeight: getComputedStyle(input).minHeight,
            ghostBorder: getComputedStyle(input).borderColor,
            squareRadius: getComputedStyle(input).borderRadius
        };
    });
    assert.equal(visualClasses.inputDense && visualClasses.selectDense && visualClasses.textareaDense && visualClasses.buttonDense, true, 'dense form styling reaches its controls and actions');
    assert.equal(visualClasses.inputGhost && visualClasses.selectGhost && visualClasses.textareaGhost, true, 'ghost form styling reaches its input controls');
    assert.match(visualClasses.buttonTextSurface.border, /rgba\(0, 0, 0, 0\)|transparent/, 'the inherited ghost compatibility prop renders the button as text without a border');
    assert.match(visualClasses.buttonTextSurface.background, /rgba\(0, 0, 0, 0\)|transparent/, 'the inherited ghost compatibility prop renders the button as text without a filled surface');
    assert.equal(visualClasses.inputSquare && visualClasses.selectSquare && visualClasses.textareaSquare && visualClasses.buttonSquare, true, 'square form styling reaches its controls and actions');
    assert.equal(visualClasses.inputHeight, '30px', 'dense class changes the input control height');
    assert.match(visualClasses.ghostBorder, /rgba\(0, 0, 0, 0\)|transparent/, 'ghost class removes the input border');
    assert.equal(visualClasses.squareRadius, '0px', 'square class removes the input radius');
    await denseToggle.uncheck();
    await ghostToggle.uncheck();
    await roundedToggle.check();
    passed.push('unified dense, ghost and rounded settings add their public state classes and apply the corresponding CSS');

    const position = demo.getByRole('combobox', { name: '标签方向', exact: true });
    await position.selectOption('left');
    await page.waitForFunction(() => document.querySelector('[aria-label="简化验证表单"]')?.dataset.layout === 'horizontal');
    const [labelBox, inputBox, detailsBox] = await Promise.all([
        nameField.locator(':scope > .ui-field-label').boundingBox(),
        nameField.locator(':scope > .ui-input').boundingBox(),
        nameField.locator(':scope > .ui-field-details').boundingBox()
    ]);
    assert.ok(inputBox.x > labelBox.x + 80, 'left label uses its own column');
    assert.ok(Math.abs(detailsBox.x - inputBox.x) < 2, 'hint aligns with the control column');
    assert.ok(detailsBox.y >= inputBox.y + inputBox.height - 1, 'hint remains below the control');
    assert.match(await nameField.locator('.ui-field-details').textContent(), /说明始终位于控件下方/, 'the control-column hint remains visible');
    passed.push('left label layout preserves a separate label column and keeps hint beneath the control');

    for (const item of [
        { label: '启用配置', control: ':scope > .ui-selection-ripple.is-switch' },
        { label: '使用约定', control: ':scope > .ui-checkbox' },
        { label: '单选项', control: ':scope > .ui-radio' },
        { label: '标记颜色', control: ':scope > .ui-swatches' }
    ]) {
        const field = form.locator('.ui-field').filter({ hasText: item.label });
        assert.equal(await field.count(), 1, item.label + ' has one field');
        const label = field.locator(':scope > .ui-field-label');
        const control = field.locator(item.control);
        const [labelBox, controlBox] = await Promise.all([label.boundingBox(), control.boundingBox()]);
        assert.ok(Math.abs(labelBox.y - controlBox.y) < 2, item.label + ' label and control align vertically');
        assert.ok(controlBox.x > labelBox.x, item.label + ' control follows the label column');
        const details = field.locator(':scope > .ui-field-details');
        if (await details.count()) {
            const detailsBox = await details.boundingBox();
            assert.ok(Math.abs(detailsBox.x - controlBox.x) < 2, item.label + ' hint begins at the control column');
        }
    }
    await setTheme('light');
    await form.scrollIntoViewIfNeeded();
    await capture('form-left-layout-1440x900-light', { width: 1440, height: 900 });
    await setTheme('dark');
    await capture('form-left-layout-1440x900-dark', { width: 1440, height: 900 });
    await setTheme('light');
    passed.push('checkbox, radio, switch and swatches align with left labels and hints in light/dark screenshots');

    const tooltipDemo = await openExample('tooltip', 'layout-form-tooltip');
    const tooltipWrapper = tooltipDemo.locator('.ui-tooltip-trigger');
    const tooltipTrigger = tooltipDemo.getByRole('button', { name: '提示触发器', exact: true });
    const tooltip = tooltipWrapper.locator('.ui-tooltip');
    const tooltipHandle = await tooltip.elementHandle();
    await tooltipTrigger.scrollIntoViewIfNeeded();
    await page.mouse.move(4, 4);
    await tooltipTrigger.hover();
    await page.waitForFunction((element) => element.matches(':popover-open'), tooltipHandle);
    await tooltipTrigger.click();
    assert.equal(await tooltipDemo.getByRole('status').textContent(), '已点击提示触发器', 'tooltip does not block pointer activation');
    await page.mouse.move(4, 4);
    await page.waitForFunction((element) => !element.matches(':popover-open'), tooltipHandle);
    await tooltipWrapper.evaluate((element) => {
        const selector = 'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(document.querySelectorAll(selector)).filter((item) => item.getClientRects().length);
        const index = focusable.indexOf(element);
        if (index > 0) focusable[index - 1].focus();
    });
    await page.keyboard.press('Tab');
    await assertFocused(tooltipWrapper, 'tooltip Tab');
    await page.waitForFunction((element) => element.matches(':popover-open'), tooltipHandle);
    assert.equal(await tooltip.getAttribute('role'), 'tooltip');
    await page.keyboard.press('Escape');
    await page.waitForFunction((element) => !element.matches(':popover-open'), tooltipHandle);
    passed.push('tooltip allows pointer activation, closes after pointer exit, and opens on keyboard Tab focus');
    for (const route of ['row', 'col', 'form']) {
        const gridDemo = await openExample(route, 'layout-form-grid');
        const gridForm = gridDemo.getByRole('form', { name: '行列表单案例' });
        const row = gridForm.locator('.ui-form-body > .ui-row');
        const cols = row.locator(':scope > .ui-col');
        await setWindow(1440, 900);
        const wide = await Promise.all([cols.nth(0).boundingBox(), cols.nth(1).boundingBox(), cols.nth(2).boundingBox()]);
        assert.ok(Math.abs(wide[0].y - wide[1].y) < 2, route + ' md=6 form columns share a row');
        assert.ok(wide[2].width > wide[0].width * 1.9, route + ' textarea col occupies the full row');
        assert.equal(await gridForm.locator('.ui-form-body').evaluate(element => getComputedStyle(element).display), 'block');
        const density = gridDemo.getByRole('combobox', { name: '表单行间距', exact: true });
        for (const [value, gap] of [['default','24px'], ['comfortable','16px'], ['compact','8px']]) {
            await density.selectOption(value);
            assert.equal(await row.evaluate(element => getComputedStyle(element).gap), gap);
        }
        await gridForm.getByRole('button', { name: '保存行列表单' }).click();
        await gridForm.getByRole('textbox', { name: '项目名称', exact: true }).fill('实际行列表单');
        await gridForm.getByRole('button', { name: '保存行列表单' }).click();
        await page.waitForFunction(() => document.querySelector('[aria-label="行列表单案例"] [role="status"]')?.textContent === '行列表单已保存');
        await setWindow(390, 844);
        const narrow = await Promise.all([cols.nth(0).boundingBox(), cols.nth(1).boundingBox()]);
        assert.ok(narrow[1].y > narrow[0].y + narrow[0].height, route + ' narrow form fields stack');
        for (const theme of ['light', 'dark']) {
            await setTheme(theme);
            await gridDemo.scrollIntoViewIfNeeded();
            await assertNoHorizontalOverflow(route + ' form grid ' + theme);
            await capture(route + '-form-grid-390-' + theme, { width: 390, height: 844 });
        }
        await setWindow(1440, 900);
        await gridDemo.scrollIntoViewIfNeeded();
        await capture(route + '-form-grid-1440-dark', { width: 1440, height: 900 });
    }
    passed.push('Row/Col/Form pages demonstrate explicit form grids, responsive columns, full-width textareas, all three gutters and validation');

} finally {
    await app.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}

assert.deepEqual(errors, []);
for (const item of passed) console.log('PASS ' + item);
console.log('Evidence: ' + evidence);
