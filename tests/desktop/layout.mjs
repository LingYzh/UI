import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mdiDatabaseOutline } from '@mdi/js';
import { groups as docGroups, pages as docPages } from '../../src/ui/docs/content.js';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'layout-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const previewUrl = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${previewUrl}#/grid` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const passed = [];
let mainFrameNavigations = 0;
page.on('pageerror', (error) => errors.push(error.message));
page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) mainFrameNavigations++; });

async function setWindow(width, height) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(1);
        window.setContentSize(size.width, size.height);
    }, { width, height });
    await page.waitForFunction(({ width, height }) => window.innerWidth === width && window.innerHeight === height, { width, height });
    await page.evaluate(async () => { await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const target = theme === 'dark';
    const current = await toggle.isChecked();
    const actualTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    if (current === target && actualTheme !== theme) {
        await toggle.setChecked(!target);
        await page.waitForFunction((expected) => document.documentElement.dataset.theme === expected, target ? 'light' : 'dark');
    }
    await toggle.setChecked(target);
    await page.waitForFunction((expected) => document.documentElement.dataset.theme === expected, theme);
}

async function openExample(route, example) {
    await page.goto(`${previewUrl}#/${route}`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    const layoutDemo = example.startsWith('layout-') || example === 'textarea-grow';
    const selector = example === 'layout-grid'
        ? '#section-responsive .layout-demo'
        : `.docs-example[aria-labelledby="${example}-heading"] ${layoutDemo ? '.layout-demo' : '.live-example'}`;
    const demo = page.locator(selector);
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
    assert.ok(dimensions.document <= dimensions.viewport + 1, `${context}: document overflows ${JSON.stringify(dimensions)}`);
    if (dimensions.content) assert.ok(dimensions.content.scrollWidth <= dimensions.content.width + 1, `${context}: docs content overflows ${JSON.stringify(dimensions)}`);
    if (dimensions.demo) assert.ok(dimensions.demo.scrollWidth <= dimensions.demo.width + 1, `${context}: demo overflows ${JSON.stringify(dimensions)}`);
}

async function capture(name, expectedSize) {
    await page.evaluate(async () => { await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {}))); });
    await page.waitForTimeout(100);
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), contentSize: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    const actualSize = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    assert.deepEqual(captured.contentSize, [expectedSize.width, expectedSize.height], `${name} window content size`);
    assert.deepEqual(actualSize, expectedSize, `${name} PNG dimensions`);
    await writeFile(path.join(evidence, `${name}.png`), png);
}

try {
    await page.locator('.docs-shell').waitFor();
    await setWindow(1440, 900);

    const nav = page.getByRole('navigation', { name: '文档导航', exact: true });
    for (const group of docGroups) {
        assert.equal(await nav.locator('.docs-nav-group h2').filter({ hasText: group }).count(), 1, `navigation group: ${group}`);
    }
    const componentPages = docPages.filter((entry) => entry.kind === 'component');
    assert.equal(componentPages.length, 47);
    for (const doc of componentPages) {
        const escapedTitle = doc.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const link = nav.getByRole('link', { name: new RegExp(`^${escapedTitle}(?:\\s|$)`) });
        assert.equal(await link.count(), 1, `${doc.name} has one accessible sidebar link`);
        assert.equal(await link.getAttribute('href'), `#/${doc.id}`, `${doc.name} sidebar destination`);
        await link.press('Enter');
        await page.waitForFunction(({ id, title }) => location.hash === `#/${id}`
            && document.querySelector('.docs-page-heading h1')?.textContent.includes(title), { id: doc.id, title: doc.title });
        assert.equal(await link.getAttribute('aria-current'), 'page', `${doc.name} active navigation state`);
    }
    passed.push(`all ${componentPages.length} public component pages have visible named sidebar links and open by keyboard; all ${docGroups.length} groups render`);

    const widthDemo = await openExample('input', 'layout-widths');
    const widthForm = widthDemo.locator('form.ui-form[aria-label="默认宽度演示"]');
    const widthPicker = widthDemo.getByRole('combobox', { name: '控件区域宽度', exact: true });
    const defaultControls = [
        ['#width-input', '.ui-input'],
        ['#width-select', '.ui-select'],
        ['#width-textarea', '.ui-textarea']
    ];
    for (const width of [240, 320, 480]) {
        await widthPicker.selectOption(String(width));
        await page.waitForFunction((expected) => Math.abs(document.querySelector('form[aria-label="默认宽度演示"]')?.getBoundingClientRect().width - expected) < 1, width);
        const formBox = await widthForm.boundingBox();
        assert.ok(Math.abs(formBox.width - width) < 1, `${width}px preview container`);
        for (const [id, controlClass] of defaultControls) {
            const field = widthForm.locator(`.ui-field:has(${id})`);
            const control = field.locator(`:scope > ${controlClass}`);
            const [fieldBox, controlBox, constraints] = await Promise.all([
                field.boundingBox(), control.boundingBox(), control.evaluate((element) => ({
                    minWidth: getComputedStyle(element).minWidth,
                    maxWidth: getComputedStyle(element).maxWidth
                }))
            ]);
            assert.ok(Math.abs(controlBox.width - fieldBox.width) < 1, `${id} fills the ${width}px field`);
            assert.equal(constraints.minWidth, '0px', `${id} can shrink within the field`);
            assert.equal(constraints.maxWidth, '100%', `${id} stays within the field`);
        }
        const limitedField = widthForm.locator('.ui-field:has(#width-limited)');
        const limited = limitedField.locator(':scope > .ui-input');
        const [limitedFieldBox, limitedControlBox, limitedMaxWidth] = await Promise.all([
            limitedField.boundingBox(),
            limited.boundingBox(),
            limitedField.evaluate((element) => getComputedStyle(element).maxWidth)
        ]);
        assert.equal(limitedMaxWidth, '200px', 'field frame owns maxWidth=200px');
        assert.ok(Math.abs(limitedFieldBox.width - 200) < 1, 'container constrains the field frame to 200px');
        assert.ok(limitedControlBox.width <= 200, 'input remains within the constrained field frame');
        const switchBox = await widthForm.locator('.ui-field:has(#width-switch) > .ui-switch').boundingBox();
        assert.ok(switchBox.width < formBox.width / 2, 'switch controls keep their intrinsic width');
        await assertNoHorizontalOverflow(`control sizing in ${width}px container`);
    }
    const inlineInput = widthDemo.locator('.ui-input.is-inline:has(input[aria-label="工具栏输入"])');
    assert.equal(await inlineInput.evaluate((element) => getComputedStyle(element).width), '160px', 'inline input honors explicit width');
    assert.equal(await inlineInput.evaluate((element) => getComputedStyle(element).flexGrow), '0', 'inline input does not grow');
    const inlineSelect = widthDemo.locator('.ui-select.is-inline[aria-label="工具栏选择"]');
    assert.ok((await inlineSelect.boundingBox()).width < (await widthDemo.locator('.layout-demo-toolbar').last().boundingBox()).width);
    passed.push('input, select and textarea fill 240/320/480px containers without min-width overflow; maxWidth and inline sizing hold, and switches stay intrinsic');

    const focusDemo = await openExample('switch', 'layout-focus');
    const assertBlurred = async (locator, context) => {
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
        assert.equal(await locator.evaluate((element) => document.activeElement === element), false, `${context} releases pointer focus`);
    };
    const assertFocused = async (locator, context) => {
        assert.equal(await locator.evaluate((element) => document.activeElement === element), true, `${context} retains keyboard focus`);
    };

    const focusSwitch = focusDemo.getByRole('checkbox', { name: '焦点示例开关', exact: true });
    await focusDemo.locator('label').filter({ hasText: '焦点示例开关' }).click();
    assert.equal(await focusSwitch.isChecked(), false, 'clicking the associated switch label changes its value');
    await assertBlurred(focusSwitch, 'switch label click');
    await focusSwitch.focus();
    await page.keyboard.press('Space');
    assert.equal(await focusSwitch.isChecked(), true, 'Space toggles the focused switch');
    await assertFocused(focusSwitch, 'switch Space');

    const focusCheckbox = focusDemo.getByRole('checkbox', { name: '焦点示例复选框', exact: true });
    await focusDemo.locator('label.ui-checkbox').filter({ hasText: '焦点示例复选框' }).click();
    assert.equal(await focusCheckbox.isChecked(), false, 'clicking a checkbox label toggles its native input');
    await assertBlurred(focusCheckbox, 'checkbox label click');
    await focusCheckbox.focus();
    await page.keyboard.press('Space');
    await assertFocused(focusCheckbox, 'checkbox Space');

    const focusRadio = focusDemo.getByRole('radio', { name: '选项 B', exact: true });
    await focusDemo.locator('label.ui-radio').filter({ hasText: '选项 B' }).click();
    assert.equal(await focusRadio.isChecked(), true);
    await assertBlurred(focusRadio, 'radio label click');

    const actionButton = focusDemo.getByRole('button', { name: '执行动作', exact: true });
    await actionButton.click();
    await assertBlurred(actionButton, 'button click');
    await actionButton.focus();
    await page.keyboard.press('Space');
    await assertFocused(actionButton, 'button Space');
    assert.equal(await focusDemo.getByRole('status').textContent(), '动作已执行');

    const firstTab = focusDemo.getByRole('tab', { name: '第一项', exact: true });
    const secondTab = focusDemo.getByRole('tab', { name: '第二项', exact: true });
    await secondTab.click();
    assert.equal(await secondTab.getAttribute('aria-selected'), 'true', 'pointer click selects the second tab');
    await assertBlurred(secondTab, 'tab click');
    await firstTab.click();
    assert.equal(await firstTab.getAttribute('aria-selected'), 'true', 'pointer click selects the first tab');
    await assertBlurred(firstTab, 'tab click');
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'tab'
        && document.activeElement?.textContent.includes('第二项'));
    await assertFocused(secondTab, 'tab ArrowRight');
    assert.equal(await firstTab.getAttribute('aria-selected'), 'true', 'manual arrow navigation does not change the current selection');
    assert.equal(await secondTab.getAttribute('aria-selected'), 'false');
    await page.keyboard.press('Enter');
    assert.equal(await secondTab.getAttribute('aria-selected'), 'true', 'Enter activates the focused tab');
    await assertFocused(secondTab, 'tab Enter');

    const swatchGroup = focusDemo.getByRole('radiogroup', { name: '焦点示例色板', exact: true });
    const swatch = swatchGroup.getByRole('radio').first();
    await swatch.click();
    await assertBlurred(swatch, 'color swatch click');
    const activityButton = focusDemo.getByRole('button', { name: '焦点示例折叠', exact: true });
    await activityButton.click();
    assert.equal(await activityButton.getAttribute('aria-expanded'), 'true', 'pointer click toggles activity content');
    await assertBlurred(activityButton, 'activity click');
    await activityButton.focus();
    await page.keyboard.press('Space');
    assert.equal(await activityButton.getAttribute('aria-expanded'), 'false');
    await assertFocused(activityButton, 'activity Space');

    const editingInput = focusDemo.getByRole('textbox', { name: '保持编辑焦点', exact: true });
    await editingInput.fill('仍在编辑');
    assert.equal(await editingInput.inputValue(), '仍在编辑');
    await assertFocused(editingInput, 'text editing');
    passed.push('pointer labels, switches, checkboxes, radios, buttons, tabs, swatches and activity release focus; keyboard Space/Arrow navigation keeps focus and text editing stays focused');

    const menuDemo = await openExample('menu-item', 'layout-menu-item');
    const menu = menuDemo.locator('.ui-menu');
    const menuTrigger = menu.getByRole('button', { name: '操作菜单', exact: true });
    const menuSurface = menu.locator('.ui-menu-surface');
    await menuTrigger.click();
    await page.waitForFunction((element) => element.matches(':popover-open'), await menuSurface.elementHandle());
    const closeOnSelect = menuSurface.getByRole('menuitem', { name: '编辑配置', exact: true });
    await closeOnSelect.click();
    await page.waitForFunction((element) => !element.matches(':popover-open'), await menuSurface.elementHandle());
    await assertBlurred(closeOnSelect, 'menu item closing click');
    await assertBlurred(menuTrigger, 'pointer-closed menu trigger');

    await menuTrigger.click();
    await page.waitForFunction((element) => element.matches(':popover-open'), await menuSurface.elementHandle());
    const keepOpen = menuSurface.getByRole('menuitemcheckbox', { name: '启用', exact: true });
    const checkedBeforePointer = await keepOpen.getAttribute('aria-checked');
    await keepOpen.click();
    await page.waitForFunction((element) => element.matches(':popover-open'), await menuSurface.elementHandle());
    assert.notEqual(await keepOpen.getAttribute('aria-checked'), checkedBeforePointer, 'keep-open item applies its action');
    await assertBlurred(keepOpen, 'keep-open menu item click');

    await page.keyboard.press('Escape');
    await page.waitForFunction((element) => !element.matches(':popover-open'), await menuSurface.elementHandle());
    await menuTrigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction((element) => element.matches(':popover-open'), await menuSurface.elementHandle());
    await page.keyboard.press('ArrowDown');
    await assertFocused(keepOpen, 'menu ArrowDown');
    const checkedBeforeSpace = await keepOpen.getAttribute('aria-checked');
    await page.keyboard.press('Space');
    await page.waitForFunction(({ selector, previous }) => document.querySelector(selector)?.getAttribute('aria-checked') !== previous,
        { selector: '.ui-menu-surface [role="menuitemcheckbox"]', previous: checkedBeforeSpace });
    await assertFocused(keepOpen, 'keep-open menu Space');
    await page.keyboard.press('Escape');
    await page.waitForFunction((element) => !element.matches(':popover-open'), await menuSurface.elementHandle());
    await assertFocused(menuTrigger, 'keyboard-closed menu trigger');
    await page.keyboard.press('Enter');
    await page.waitForFunction(element => element.matches(':popover-open'), await menuSurface.elementHandle());
    await menuDemo.getByRole('status').click();
    await page.waitForFunction(element => !element.matches(':popover-open'), await menuSurface.elementHandle());
    await assertBlurred(menuTrigger, 'keyboard-opened menu dismissed by an outside pointer');
    passed.push('menu selection closes after pointer action, keep-open stays open, and keyboard arrow/Space/Escape preserve or restore focus');

    const grid = await openExample('grid', 'layout-grid');
    await setWindow(1440, 900);
    const mainGrid = grid.locator('.layout-demo-main-grid');
    const mainCols = mainGrid.locator(':scope > .ui-col');
    const firstPairWide = await Promise.all([mainCols.nth(0).boundingBox(), mainCols.nth(1).boundingBox()]);
    assert.ok(Math.abs(firstPairWide[0].y - firstPairWide[1].y) < 2, 'md=6 columns share a row above the md breakpoint');
    assert.ok(firstPairWide[1].x > firstPairWide[0].x, 'second grid column follows the first visually');

    const fractionRow = grid.locator('.layout-demo-fractions');
    const fractionCols = fractionRow.locator(':scope > .ui-col');
    const fractionBoxes = await Promise.all([fractionCols.nth(0).boundingBox(), fractionCols.nth(1).boundingBox()]);
    assert.ok(Math.abs(fractionBoxes[0].width / fractionBoxes[1].width - 2 / 3) < 0.02, '2/5 and 3/5 fractions use their own denominator');

    const offsetRow = grid.locator('.layout-demo-offset');
    const offsetBox = await offsetRow.locator(':scope > .ui-col').boundingBox();
    const expectedOffset = await offsetRow.evaluate((row) => {
        const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
        return (row.getBoundingClientRect().width + gap) * 3 / 12;
    });
    const actualOffset = offsetBox.x - (await offsetRow.boundingBox()).x;
    assert.ok(Math.abs(actualOffset - expectedOffset) < 2, 'offset uses the row size and gutter');

    const orderRow = grid.locator('.layout-demo-order');
    const orderBoxes = await Promise.all([
        orderRow.locator(':scope > .ui-col').nth(0).boundingBox(),
        orderRow.locator(':scope > .ui-col').nth(1).boundingBox()
    ]);
    assert.ok(orderBoxes[0].x > orderBoxes[1].x, 'order changes visual placement while preserving DOM order');

    const densitySelect = grid.getByRole('combobox', { name: '栅格密度', exact: true });
    for (const [density, expectedGap] of [['default', '24px'], ['comfortable', '16px'], ['compact', '8px']]) {
        await densitySelect.selectOption(density);
        assert.equal(await mainGrid.evaluate((row) => getComputedStyle(row).columnGap), expectedGap, `${density} grid gutter`);
    }

    await setWindow(900, 900);
    const firstPairMedium = await Promise.all([mainCols.nth(0).boundingBox(), mainCols.nth(1).boundingBox()]);
    assert.ok(firstPairMedium[1].y > firstPairMedium[0].y + 8, 'md=6 falls back to cols=12 below the md breakpoint');
    await setWindow(375, 812);
    const firstPairNarrow = await Promise.all([mainCols.nth(0).boundingBox(), mainCols.nth(1).boundingBox()]);
    assert.ok(firstPairNarrow[1].y > firstPairNarrow[0].y + 8, 'grid columns remain stacked on a narrow viewport');
    passed.push('grid checks actual responsive widths, fraction basis, gutter-aware offset, visual order and 24/16/8px density');

    const formDemo = await openExample('form', 'layout-form');
    await setWindow(1440, 900);
    const form = formDemo.locator('form.ui-form[aria-label="工作区配置"]');
    const name = form.getByRole('textbox', { name: '工作区名称', exact: true });
    const model = form.getByLabel('默认模型', { exact: true });
    const description = form.getByLabel('用途说明', { exact: true });
    const enabled = form.getByLabel('启用工作区', { exact: true });
    assert.equal(await name.inputValue(), 'UAH 工作区');
    assert.equal(await name.evaluate((element) => element.id), 'layout-name');
    assert.ok(await name.evaluate((element) => Array.from(element.labels ?? []).some((label) => label.textContent.includes('工作区名称'))), 'required text input remains associated with its visible label');
    assert.equal(await name.evaluate((element) => element.required), true);
    assert.equal(await model.inputValue(), 'default');
    assert.equal(await description.getAttribute('rows'), '3');
    assert.equal(await description.getAttribute('maxlength'), '200');
    assert.equal(await enabled.isChecked(), true);
    assert.ok(await form.getByRole('group', { name: '基本信息' }).count(), 'form section exposes its legend as a group name');

    const basicSectionBody = form.locator('.ui-form-section-body > .ui-row').first();
    const sectionFields = basicSectionBody.locator(':scope > .ui-col');
    assert.equal(await form.locator('.ui-form-body').evaluate(element => getComputedStyle(element).display), 'block', 'Form does not create a grid');
    assert.equal(await form.getAttribute('columns'), null, 'obsolete columns prop is absent');
    const wideFields = await Promise.all([sectionFields.nth(0).boundingBox(), sectionFields.nth(1).boundingBox()]);
    assert.ok(wideFields[1].x > wideFields[0].x && Math.abs(wideFields[1].y - wideFields[0].y) < 2, 'sm=6 columns share a row on a wide viewport');
    await setWindow(390, 844);
    const narrowFields = await Promise.all([sectionFields.nth(0).boundingBox(), sectionFields.nth(1).boundingBox()]);
    assert.ok(narrowFields[1].y > narrowFields[0].y + 8, 'cols=12 stacks form fields below the sm viewport breakpoint');
    await setWindow(1440, 900);

    await name.fill('');
    assert.equal(await form.evaluate((element) => element.checkValidity()), false, 'required field uses native constraint validation');
    const status = form.locator('span[role="status"]');
    const initialStatus = await status.textContent();
    const save = form.getByRole('button', { name: '保存配置', exact: true });
    await save.click();
    assert.equal(await status.textContent(), initialStatus, 'invalid form does not emit submit');
    assert.equal(await name.evaluate((element) => element.matches(':invalid')), true);
    await name.fill('Automation workspace');
    const urlBeforeSubmit = page.url();
    const navigationsBeforeSubmit = mainFrameNavigations;
    await save.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[aria-label="工作区配置"] [role="status"]')?.textContent.includes('配置已保存'));
    assert.equal(page.url(), urlBeforeSubmit, 'submit stays on the current docs route');
    assert.equal(mainFrameNavigations, navigationsBeforeSubmit, 'valid submit does not reload the document');

    await model.selectOption('custom');
    await description.fill('需要被重置的说明');
    await enabled.uncheck();
    await form.getByRole('button', { name: '重置表单', exact: true }).click();
    assert.equal(await name.inputValue(), 'UAH 工作区');
    assert.equal(await model.inputValue(), 'default');
    assert.equal(await description.inputValue(), '先阅读项目约定，再开始实现。');
    assert.equal(await enabled.isChecked(), true);
    assert.equal(await status.textContent(), '更改只影响此演示');

    const dialogOpener = formDemo.getByRole('button', { name: '在弹窗中预览', exact: true });
    await dialogOpener.click();
    const dialog = page.locator('.ui-dialog[open]');
    await dialog.waitFor();
    assert.equal(await page.getByRole('dialog', { name: '弹窗中的表单', exact: true }).count(), 1, 'preview dialog has an accessible name');
    const dialogForm = dialog.locator('form.ui-form[aria-label="弹窗配置"]');
    await dialogForm.waitFor();
    assert.ok(await dialogForm.getByLabel('安装路径', { exact: true }).count());
    assert.ok(await dialogForm.getByLabel('启动参数', { exact: true }).count());
    await dialogForm.getByRole('button', { name: '关闭预览', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await assertBlurred(dialogOpener, 'pointer-closed dialog trigger');

    await name.focus();
    await dialogOpener.evaluate((element) => element.click());
    await dialog.waitFor();
    await dialogForm.getByRole('button', { name: '关闭预览', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await assertFocused(name, 'text input used as dialog return focus after pointer close');

    const dialogDemo = await openExample('dialog', 'dialog-lifecycle');
    const keyboardDialogTrigger = dialogDemo.getByRole('button', { name: '打开示例弹窗', exact: true });
    await keyboardDialogTrigger.focus();
    await page.keyboard.press('Enter');
    const lifecycleDialog = page.locator('.ui-dialog[open]');
    await lifecycleDialog.waitFor();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-dialog')?.open
        && document.querySelector('#dialog-status')?.textContent.includes('已关闭'));
    await assertFocused(keyboardDialogTrigger, 'keyboard-closed dialog trigger');
    passed.push('forms validate/submit/reset natively; pointer dialog close blurs button triggers, preserves text-input return focus, and keyboard close restores its trigger');

    const horizontalDemo = await openExample('form-section', 'layout-horizontal');
    const horizontalForm = horizontalDemo.locator('form.ui-form[aria-label="安装配置"]');
    const pathField = horizontalForm.locator('.ui-field:has(#layout-path)');
    const pathLabel = pathField.locator('.ui-field-label');
    const pathControl = pathField.locator('.ui-input');
    for (const label of ['安装路径', '启动参数', '允许委派']) assert.equal(await horizontalForm.getByLabel(label, { exact: true }).count(), 1);
    await horizontalForm.evaluate((element) => { element.style.width = '600px'; element.style.maxWidth = 'none'; });
    const horizontalBoxes = await Promise.all([pathLabel.boundingBox(), pathControl.boundingBox()]);
    assert.ok(horizontalBoxes[1].x > horizontalBoxes[0].x + 100, 'horizontal labels and controls use separate columns above 560px');
    await horizontalForm.evaluate((element) => { element.style.width = '540px'; });
    const verticalBoxes = await Promise.all([pathLabel.boundingBox(), pathControl.boundingBox()]);
    assert.ok(Math.abs(verticalBoxes[1].x - verticalBoxes[0].x) < 2, 'horizontal fields share a left edge below 560px');
    assert.ok(verticalBoxes[1].y > verticalBoxes[0].y + verticalBoxes[0].height, 'narrow horizontal fields stack label above control');
    passed.push('horizontal fields switch from side-by-side to stacked using the form container width');

    const iconsDemo = await openExample('icons', 'layout-icons');
    const iconList = iconsDemo.locator('.layout-demo-icons');
    assert.equal(await iconList.locator('.prototype-icon svg').count(), 12, 'built-in MDI aliases render actual SVG elements');
    const listedNames = await iconList.locator('code').allTextContents();
    assert.ok(listedNames.includes('mdi-account') && listedNames.includes('mdi-home-outline') && listedNames.includes('mdi-form-textbox'));
    assert.equal(await iconList.locator('.prototype-icon[aria-hidden="true"]').count(), 12, 'unlabelled icons are hidden from assistive technology');
    const labelledIcon = iconsDemo.getByRole('img', { name: '原型文件夹', exact: true });
    assert.equal(await labelledIcon.locator('svg path').count(), 1);
    const customIcon = iconsDemo.getByRole('img', { name: '数据库', exact: true });
    assert.equal(await customIcon.locator('svg path').getAttribute('d'), mdiDatabaseOutline, 'an imported @mdi/js path renders unchanged');
    assert.equal(await iconsDemo.getByRole('button', { name: '新增配置', exact: true }).count(), 1, 'a decorative button icon does not replace the button name');
    passed.push('icons render actual SVG paths, keep decorative icons hidden, and expose labelled/custom-path icons accessibly');

    const textareaDemo = await openExample('textarea', 'textarea-grow');
    const growForm = textareaDemo.locator('form.ui-form[aria-label="输入样式比较"]');
    const regularTextarea = growForm.getByLabel('多行文本', { exact: true });
    const growTextarea = growForm.getByLabel('自动增高指令', { exact: true });
    assert.equal(await regularTextarea.evaluate((element) => element.parentElement.classList.contains('ui-field')), true, 'without a counter the textarea remains the component root');
    assert.equal(await regularTextarea.evaluate((element) => getComputedStyle(element).resize), 'none', 'noResize is preserved');
    assert.equal(await growTextarea.getAttribute('rows'), '3');
    assert.equal(await growTextarea.getAttribute('maxlength'), '500');
    assert.equal(await growTextarea.evaluate((element) => element.parentElement.classList.contains('ui-textarea-wrap')), true, 'counter mode wraps the textarea');
    const counter = growTextarea.locator('xpath=following-sibling::output');
    assert.equal(await counter.count(), 1, 'counter output is a sibling of the native textarea');
    assert.match((await growTextarea.getAttribute('aria-describedby')) || '', new RegExp(await counter.getAttribute('id')));
    assert.equal(await counter.textContent(), '0 / 500');

    const measure = () => growTextarea.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
            height: element.getBoundingClientRect().height,
            bound: 8 * Number.parseFloat(style.lineHeight)
                + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
                + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth),
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight
        };
    });
    const minimumHeight = (await measure()).height;
    await textareaDemo.getByRole('button', { name: '填入长文本', exact: true }).click();
    await page.waitForFunction(() => {
        const element = document.getElementById('grow-textarea');
        return element && Number.parseFloat(element.style.height) > 0;
    });
    const longMetrics = await measure();
    assert.ok(longMetrics.height > minimumHeight, 'a reactive programmatic model update grows the textarea');
    assert.ok(longMetrics.height <= longMetrics.bound + 2, 'autoGrow respects maxRows=8');
    assert.ok(longMetrics.scrollHeight > longMetrics.clientHeight, 'content beyond maxRows remains scrollable');
    assert.match(await counter.textContent(), /^\d+ \/ 500$/);
    await textareaDemo.getByRole('button', { name: '清空文本', exact: true }).click();
    await page.waitForFunction((minimum) => {
        const element = document.getElementById('grow-textarea');
        return element && element.getBoundingClientRect().height <= minimum + 2;
    }, minimumHeight);

    const textareaWidthForm = growForm;
    const wrappedText = '描述职责、回答方式与任务边界，'.repeat(18);
    await textareaWidthForm.evaluate((element) => { element.style.width = '760px'; element.style.maxWidth = 'none'; });
    await growTextarea.fill(wrappedText);
    const wideTextHeight = (await measure()).height;
    assert.ok(wideTextHeight < (await measure()).bound - 10, 'wide text starts below the maxRows limit');
    await textareaWidthForm.evaluate((element) => { element.style.width = '320px'; });
    await page.waitForFunction((height) => document.getElementById('grow-textarea')?.getBoundingClientRect().height > height + 2, wideTextHeight);
    const narrowTextMetrics = await measure();
    assert.ok(narrowTextMetrics.height <= narrowTextMetrics.bound + 2, 'wrapping after a width change also respects maxRows=8');

    await textareaDemo.getByLabel('禁用', { exact: true }).check();
    assert.equal(await growTextarea.isDisabled(), true);
    await textareaDemo.getByLabel('禁用', { exact: true }).uncheck();
    await textareaDemo.getByLabel('只读', { exact: true }).check();
    assert.equal(await growTextarea.evaluate((element) => element.readOnly), true);
    await textareaDemo.getByLabel('只读', { exact: true }).uncheck();
    await textareaDemo.getByLabel('错误', { exact: true }).check();
    assert.equal(await growTextarea.getAttribute('aria-invalid'), 'true');
    await textareaDemo.getByLabel('错误', { exact: true }).uncheck();
    await textareaDemo.getByLabel('紧凑', { exact: true }).check();
    assert.equal(await growTextarea.evaluate((element) => element.classList.contains('is-dense')), true);
    passed.push('textarea preserves native attributes and counter semantics, grows/shrinks from reactive updates, responds to width, and caps at eight rows');

    const coreRoutes = [
        ['grid', 'layout-grid'], ['form', 'layout-form'], ['form-section', 'layout-horizontal'],
        ['form-actions', 'layout-actions'], ['icons', 'layout-icons'], ['textarea', 'textarea-grow']
    ];
    for (const [route, example] of coreRoutes) {
        const demo = await openExample(route, example);
        for (const theme of ['light', 'dark']) {
            await setTheme(theme);
            for (const [width, height] of [[1440, 900], [900, 900], [375, 812]]) {
                await setWindow(width, height);
                await demo.scrollIntoViewIfNeeded();
                await assertNoHorizontalOverflow(`${route} ${width}x${height} ${theme}`);
                await capture(`${route}-${width}x${height}-${theme}`, { width, height });
            }
        }
        await setWindow(1440, 900);
        await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1.25));
        await page.waitForTimeout(120);
        await setTheme('light');
        await demo.scrollIntoViewIfNeeded();
        await assertNoHorizontalOverflow(`${route} 125% zoom`);
        await capture(`${route}-1440x900-zoom125-light`, { width: 1440, height: 900 });
    }
    passed.push('captured light/dark demos at 1440x900, 900x900 and 375x812 plus 125% zoom; all remain within the viewport');

    const additionalRoutes = [
        ['container', 'layout-container'], ['row', 'layout-row'], ['col', 'layout-col'],
        ['spacer', 'layout-spacer'], ['menu-item', 'layout-menu-item'], ['confirm-host', 'layout-confirm-host']
    ];
    for (const [route, example] of additionalRoutes) {
        const demo = await openExample(route, example);
        await setWindow(1440, 900);
        assert.ok(await demo.isVisible(), `${route} real component demo renders`);
        await assertNoHorizontalOverflow(`${route} wide`);
    }
    passed.push('all additional layout and host component demo routes render from the documentation');

} finally {
    await app.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}

assert.deepEqual(errors, []);
for (const item of passed) console.log(`PASS ${item}`);
console.log(`Evidence: ${evidence}`);
