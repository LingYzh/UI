import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const baseline = process.argv.includes('--baseline');
await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/focus-modality-'));
const report = { status: 'running', baseline, observations: [], issues: [], pageErrors: [] };
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const base = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${base}#/slider` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    const page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => report.pageErrors.push(error.message));

    const cases = [
        { route: 'slider', example: 'component-slider', selector: '.ui-slider-control input[type="range"]', name: 'USlider', all: true },
        { route: 'range-slider', example: 'component-range-slider', selector: '.ui-range-slider-track input[type="range"]', name: 'URangeSlider thumb', all: true },
        { route: 'color-picker', example: 'component-color-picker', selector: '.ui-color-channel input[type="range"]', name: 'UColorPicker channel', all: true },
    ];

    for (const item of cases) {
        await openExample(page, item.route, item.example);
        const candidates = page.locator(item.selector);
        const count = item.all ? await candidates.count() : Math.min(1, await candidates.count());
        assert.ok(count > 0, `${item.name}: expected at least one native range input`);
        for (let index = 0; index < count; index++) {
            const name = count > 1 ? `${item.name} ${index + 1}` : item.name;
            const target = candidates.nth(index);
            const pointerStart = await moveThumb(page, target, 12);
            const pointerDown = await snapshot(target);
            await page.mouse.move(pointerStart.goalX, pointerStart.y, { steps: 8 });
            await page.waitForTimeout(40);
            const pointerDrag = await snapshot(target);
            await page.mouse.up();
            await page.waitForTimeout(80);
            const pointerReleased = await snapshot(target);
            report.observations.push({ component: name, sequence: 'pointer-only-drag', before: pointerStart.value, after: Number(pointerReleased.value), pointerDown, pointerDrag, pointerReleased });
            assert.notEqual(Number(pointerReleased.value), pointerStart.value, `${name}: real pointer drag should update its value`);
            assert.equal(pointerReleased.activeElement.matchesTarget, true, `${name}: native range keeps focus after pointer drag`);
            assert.equal(hasOutline(pointerReleased), false, `${name}: pointer drag must not show a native outline`);

            await openExample(page, item.route, item.example);
            const keyboardTarget = page.locator(item.selector).nth(index);
            const keyboardSeed = await moveThumb(page, keyboardTarget, 10);
            await page.mouse.up();
            await page.keyboard.press('Shift+Tab');
            const afterShiftTab = await snapshot(keyboardTarget);
            await page.keyboard.press('Tab');
            const keyboardFocused = await snapshot(keyboardTarget);
            const beforeArrow = Number(await keyboardTarget.inputValue());
            await page.keyboard.press('ArrowRight');
            await page.waitForFunction(({ selector, previous, index }) => {
                const elements = document.querySelectorAll(selector);
                return elements[index] && Number(elements[index].value) !== previous;
            }, { selector: item.selector, previous: beforeArrow, index }, { timeout: 3000 });
            const afterArrow = await snapshot(keyboardTarget);

            const afterKeyboard = await moveThumb(page, keyboardTarget, 10);
            await page.mouse.move(afterKeyboard.goalX, afterKeyboard.y, { steps: 8 });
            await page.waitForTimeout(40);
            const keyboardThenPointer = await snapshot(keyboardTarget);
            await page.mouse.up();
            await page.waitForTimeout(60);
            const pointerAfterKeyboard = await snapshot(keyboardTarget);
            const beforeSecondArrow = Number(pointerAfterKeyboard.value);
            await page.keyboard.press('ArrowRight');
            await page.waitForFunction(({ selector, previous, index }) => {
                const elements = document.querySelectorAll(selector);
                return elements[index] && Number(elements[index].value) !== previous;
            }, { selector: item.selector, previous: beforeSecondArrow, index }, { timeout: 3000 });
            const keyboardAgain = await snapshot(keyboardTarget);
            report.observations.push({ component: name, sequence: 'pointer-ShiftTab-Tab-Arrow-pointer-drag-Arrow', keyboardSeed, afterShiftTab, keyboardFocused, afterArrow, keyboardThenPointer, pointerAfterKeyboard, keyboardAgain });
            assert.equal(keyboardFocused.activeElement.matchesTarget, true, `${name}: real Tab reaches the native range input`);
            assert.equal(afterArrow.activeElement.matchesTarget, true, `${name}: ArrowRight preserves native range focus`);
            assert.equal(keyboardThenPointer.activeElement.matchesTarget, true, `${name}: pointer drag after keyboard preserves native focus`);
            assert.equal(hasOutline(keyboardThenPointer), false, `${name}: pointer modality suppresses the outline even if native :focus-visible is sticky`);
            assert.equal(keyboardAgain.activeElement.matchesTarget, true, `${name}: keyboard editing still works after pointer drag`);
            assert.equal(keyboardAgain.focusVisible, true, `${name}: keyboard modality restores focus-visible after pointer drag`);
            assert.equal(keyboardAgain.pointerFocusAttribute, false, `${name}: key input clears pointer modality`);
            if (name.startsWith('USlider') || name.startsWith('UColorPicker')) assert.equal(keyboardAgain.outline.width, '2px', `${name}: keyboard returns the visible outline`);
        }
    }

    await auditSelectionControls(page, report);
    await auditButtonAndList(page, report);
    await auditTextInputs(page, report);
    await auditNativeColorAndFiles(page, report);

    assert.deepEqual(report.pageErrors, [], 'focus modality audit should not produce page errors');
    report.status = report.issues.length ? (baseline ? 'baseline-issues-recorded' : 'failed') : 'passed';
    if (!baseline) assert.deepEqual(report.issues, [], 'pointer interactions should not leave a keyboard focus ring');
} catch (error) {
    report.status = 'failed';
    report.failure = error instanceof Error ? error.stack : String(error);
    process.exitCode = 1;
} finally {
    if (app) await app.close();
    await new Promise(resolve => server.httpServer.close(resolve));
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, baseline, observations: report.observations.length, issues: report.issues, failure: report.failure, evidence }, null, 2));
}

async function openExample(page, route, example) {
    const search = `?focus-audit=${encodeURIComponent(example)}-${Date.now()}`;
    await page.goto(`${base}${search}#/${route}`);
    await page.locator('.docs-shell').waitFor({ state: 'visible' });
    await page.locator(`.docs-example[aria-labelledby="${example}-heading"]`).waitFor({ state: 'visible' });
}

async function auditSelectionControls(page, report) {
    await openExample(page, 'switch', 'layout-focus');
    const scope = page.locator('.docs-example[aria-labelledby="layout-focus-heading"]');
    for (const item of [
        { name: 'USwitch', selector: 'input.ui-switch', label: '开关' },
        { name: 'UCheckbox', selector: 'input.ui-checkbox-control', label: '复选框' },
    ]) {
        const target = scope.locator(item.selector).first();
        await tabToReal(page, target);
        const beforeKeyboard = await target.evaluate(element => element.checked);
        await page.keyboard.press('Space');
        await page.waitForTimeout(30);
        const keyboard = await snapshot(target);
        assert.notEqual(keyboard.checked, beforeKeyboard, `${item.name}: Space toggles the control`);
        assert.equal(keyboard.activeElement.matchesTarget, true, `${item.name}: Space preserves focus`);
        assert.equal(keyboard.focusVisible, true, `${item.name}: keyboard activation keeps visible focus`);

        const labelClick = await clickAssociatedLabelText(page, scope, target, item.label);
        await page.waitForTimeout(40);
        const pointer = await snapshot(target);
        assert.notEqual(pointer.checked, keyboard.checked, `${item.name}: clicking label text toggles the control`);
        assert.equal(pointer.activeElement.matchesTarget, false, `${item.name}: pointer activation releases focus`);
        report.observations.push({ component: item.name, sequence: 'Tab-Space-label-pointer-Tab-Space', labelClick, keyboard, pointer });

        await tabToReal(page, target);
        await page.keyboard.press('Space');
        const keyboardAgain = await snapshot(target);
        assert.notEqual(keyboardAgain.checked, pointer.checked, `${item.name}: keyboard remains operable after pointer activation`);
        assert.equal(keyboardAgain.activeElement.matchesTarget, true, `${item.name}: focus returns through Tab after pointer activation`);
        assert.equal(keyboardAgain.focusVisible, true, `${item.name}: focus indicator returns after keyboard activation`);
        report.observations.push({ component: item.name, sequence: 'keyboard-after-pointer', keyboardAgain });
    }

    const radios = scope.locator('input.ui-radio-control');
    assert.equal(await radios.count(), 2, 'focus demo exposes a two-option radio group');
    const firstRadio = radios.nth(0);
    const secondRadio = radios.nth(1);
    await tabToReal(page, firstRadio);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(30);
    const keyboardRadio = await snapshot(secondRadio);
    assert.equal(keyboardRadio.checked, true, 'radio ArrowRight selects the next option');
    assert.equal(keyboardRadio.activeElement.matchesTarget, true, 'radio ArrowRight keeps focus on the newly selected option');
    assert.equal(keyboardRadio.focusVisible, true, 'radio keyboard navigation shows focus');

    const labelClick = await clickAssociatedLabelText(page, scope, firstRadio, '选项 A');
    await page.waitForTimeout(40);
    const pointerRadio = await snapshot(firstRadio);
    assert.equal(pointerRadio.checked, true, 'clicking radio label text selects that option');
    assert.equal(pointerRadio.activeElement.matchesTarget, false, 'radio pointer activation releases focus');
    await tabToReal(page, firstRadio);
    await page.keyboard.press('ArrowRight');
    const radioAgain = await snapshot(secondRadio);
    assert.equal(radioAgain.checked, true, 'radio direction keys still change selection after pointer activation');
    assert.equal(radioAgain.activeElement.matchesTarget, true, 'radio direction keys retain focus after pointer activation');
    report.observations.push({ component: 'URadio', sequence: 'Tab-ArrowRight-label-pointer-Tab-ArrowRight', labelClick, keyboardRadio, pointerRadio, radioAgain });
}

async function auditButtonAndList(page, report) {
    await openExample(page, 'button', 'button-variant-color');
    const buttonScope = page.locator('.docs-example[aria-labelledby="button-variant-color-heading"]');
    const action = buttonScope.locator('[data-button-preview]');
    await tabToReal(page, action);
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('.docs-example[aria-labelledby="button-variant-color-heading"] output')?.textContent?.includes('1 次'));
    const keyboard = await snapshot(action);
    assert.equal(keyboard.activeElement.matchesTarget, true, 'button Space executes and keeps focus');
    assert.equal(keyboard.focusVisible, true, 'keyboard button activation shows focus');

    await clickTarget(page, action);
    await page.waitForFunction(() => document.querySelector('.docs-example[aria-labelledby="button-variant-color-heading"] output')?.textContent?.includes('2 次'));
    await page.waitForTimeout(40);
    const pointer = await snapshot(action);
    assert.equal(pointer.activeElement.matchesTarget, false, 'button pointer activation releases focus');
    assert.equal(hasOutline(pointer), false, 'button pointer activation does not leave an outline');

    await tabToReal(page, action);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('.docs-example[aria-labelledby="button-variant-color-heading"] output')?.textContent?.includes('3 次'));
    const keyboardAgain = await snapshot(action);
    assert.equal(keyboardAgain.activeElement.matchesTarget, true, 'button Enter keeps focus after pointer activation');
    assert.equal(keyboardAgain.focusVisible, true, 'button keyboard focus indicator returns');
    report.observations.push({ component: 'UButton', sequence: 'Tab-Space-pointer-Tab-Enter', keyboard, pointer, keyboardAgain });

    await openExample(page, 'list-item', 'component-list-item');
    const listScope = page.locator('.docs-example[aria-labelledby="component-list-item-heading"]');
    const settings = listScope.locator('.ui-list-item').filter({ hasText: '设置' }).first();
    const overview = listScope.locator('.ui-list-item').filter({ hasText: '概览' }).first();
    await tabToReal(page, settings);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('.docs-example[aria-labelledby="component-list-item-heading"] output')?.textContent?.includes('settings'));
    const keyboardList = await snapshot(settings);
    assert.equal(keyboardList.activeElement.matchesTarget, true, 'list item Enter selects and retains keyboard focus');
    assert.equal(keyboardList.focusVisible, true, 'list item keyboard activation shows focus');

    await clickTarget(page, overview);
    await page.waitForFunction(() => document.querySelector('.docs-example[aria-labelledby="component-list-item-heading"] output')?.textContent?.includes('overview'));
    await page.waitForTimeout(40);
    const pointerList = await snapshot(overview);
    assert.equal(pointerList.activeElement.matchesTarget, false, 'list item pointer activation releases focus');

    await tabToReal(page, settings);
    await page.keyboard.press('Enter');
    const keyboardListAgain = await snapshot(settings);
    assert.equal(keyboardListAgain.activeElement.matchesTarget, true, 'list item keyboard activation remains available after pointer use');
    report.observations.push({ component: 'UListItem', sequence: 'Tab-Enter-pointer-Tab-Enter', keyboardList, pointerList, keyboardListAgain });
}

async function auditTextInputs(page, report) {
    await openExample(page, 'number-input', 'component-number-input');
    const numberScope = page.locator('.docs-example[aria-labelledby="component-number-input-heading"]');
    const number = numberScope.locator('input[role="spinbutton"]');
    await tabToReal(page, number);
    await replaceActiveText(page, '7');
    await page.waitForTimeout(30);
    const numberKeyboard = await snapshot(number);
    assert.equal(numberKeyboard.value, '7', 'number input accepts keyboard editing');
    assert.equal(numberKeyboard.activeElement.matchesTarget, true, 'number input retains editing focus');
    await clickTarget(page, number);
    await replaceActiveText(page, '8');
    const numberPointerEdit = await snapshot(number);
    assert.equal(numberPointerEdit.value, '8', 'number input remains editable after a pointer click');
    assert.equal(numberPointerEdit.activeElement.matchesTarget, true, 'number input pointer focus is retained for editing');
    report.observations.push({ component: 'UNumberInput', sequence: 'Tab-edit-pointer-edit', numberKeyboard, numberPointerEdit });

    await openExample(page, 'autocomplete', 'component-autocomplete');
    const autocompleteScope = page.locator('.docs-example[aria-labelledby="component-autocomplete-heading"]');
    const autocomplete = autocompleteScope.getByRole('combobox', { name: '搜索工作区' });
    await tabToReal(page, autocomplete);
    await replaceActiveText(page, '默认');
    await page.waitForTimeout(30);
    const autocompleteKeyboard = await snapshot(autocomplete);
    assert.equal(autocompleteKeyboard.activeElement.matchesTarget, true, 'autocomplete preserves keyboard editing focus');
    await clickTarget(page, autocomplete);
    await replaceActiveText(page, '归档');
    const autocompletePointerEdit = await snapshot(autocomplete);
    assert.equal(autocompletePointerEdit.activeElement.matchesTarget, true, 'autocomplete keeps focus after a pointer click so typing can continue');
    assert.match(autocompletePointerEdit.value, /归档/, 'autocomplete still accepts text after pointer focus');
    report.observations.push({ component: 'UAutocomplete', sequence: 'Tab-edit-pointer-edit', autocompleteKeyboard, autocompletePointerEdit });
}

async function auditNativeColorAndFiles(page, report) {
    for (const item of [
        { route: 'color-input', example: 'component-color-input', selector: 'input[type="color"]', name: 'UColorInput native color' },
        { route: 'file-input', example: 'component-file-input', selector: 'input[type="file"]', name: 'UFileInput' },
        { route: 'file-upload', example: 'component-file-upload', selector: 'input[type="file"]', name: 'UFileUpload' },
    ]) {
        await openExample(page, item.route, item.example);
        const target = page.locator(`.docs-example[aria-labelledby="${item.example}-heading"] ${item.selector}`).first();
        const idleColorGeometry = item.name === 'UColorInput native color'
            ? await colorInputGeometry(target)
            : null;
        if (idleColorGeometry) assertColorInputGeometry(idleColorGeometry, 'idle');
        const pointer = await pointerDownCancelClick(page, target);
        const pointerState = await snapshot(target);
        const pointerColorGeometry = item.name === 'UColorInput native color'
            ? await colorInputGeometry(target)
            : null;
        if (pointerColorGeometry) assertColorInputGeometry(pointerColorGeometry, 'pointer');
        report.observations.push({ component: item.name, sequence: 'pointer-down-drag-away-up', pointer, pointerState });
        assert.equal(hasOutline(pointerState), false, `${item.name}: pointer focus must not leave a native outline`);
        const pointerCapture = await captureNative(`${item.example}-pointer-cancel`);

        await openExample(page, item.route, item.example);
        const keyboardTarget = page.locator(`.docs-example[aria-labelledby="${item.example}-heading"] ${item.selector}`).first();
        await tabToReal(page, keyboardTarget);
        const keyboardState = await snapshot(keyboardTarget);
        const keyboardColorGeometry = item.name === 'UColorInput native color'
            ? await colorInputGeometry(keyboardTarget)
            : null;
        if (keyboardColorGeometry) assertColorInputGeometry(keyboardColorGeometry, 'keyboard');
        assert.equal(keyboardState.activeElement.matchesTarget, true, `${item.name}: native input is keyboard reachable`);
        assert.equal(keyboardState.focusVisible, true, `${item.name}: keyboard focus is recognized`);
        if (item.name === 'UFileInput') assert.equal(keyboardState.outline.width, '2px', 'file input shows keyboard outline');
        const keyboardCapture = await captureNative(`${item.example}-keyboard-tab`);
        if (item.name === 'UFileUpload') {
            const upload = await keyboardTarget.evaluate(element => {
                const wrapper = element.closest('.ui-file-upload');
                const style = wrapper ? getComputedStyle(wrapper) : null;
                return style ? { borderColor: style.borderColor, backgroundColor: style.backgroundColor, pointerFocus: element.hasAttribute('data-ui-pointer-focus') } : null;
            });
            assert.ok(upload, 'upload field has a focusable visual wrapper');
            assert.equal(upload.pointerFocus, false, 'keyboard input clears pointer modality on the file control');
            const pointerWrapper = pointerState.ancestors.find(ancestor => ancestor.className.includes('ui-file-upload'));
            assert.ok(pointerWrapper && (pointerWrapper.borderColor !== upload.borderColor || pointerWrapper.backgroundColor !== upload.backgroundColor), 'keyboard focus visibly highlights the upload wrapper');
        }
        report.observations.push({
            component: item.name,
            sequence: 'pointer-cancel-Tab-focus',
            pointerState,
            keyboardState,
            pointerCapture,
            keyboardCapture,
            colorGeometry: idleColorGeometry ? { idle: idleColorGeometry, pointer: pointerColorGeometry, keyboard: keyboardColorGeometry } : undefined,
        });
    }

    await openExample(page, 'color-input', 'component-color-input');
    const colorScope = page.locator('.docs-example[aria-labelledby="component-color-input-heading"]');
    const colorText = colorScope.locator('input:not([type="color"])');
    await tabToReal(page, colorText);
    await replaceActiveText(page, '#12abef');
    const colorKeyboard = await snapshot(colorText);
    assert.equal(colorKeyboard.activeElement.matchesTarget, true, 'color text input retains keyboard editing focus');
    assert.equal(colorKeyboard.value.toLowerCase(), '#12abef', 'color text input accepts a valid value');
    await clickTarget(page, colorText);
    await replaceActiveText(page, '#23bcde');
    const colorPointerEdit = await snapshot(colorText);
    assert.equal(colorPointerEdit.activeElement.matchesTarget, true, 'color text input retains editing focus after pointer interaction');
    assert.equal(colorPointerEdit.value.toLowerCase(), '#23bcde', 'color text input remains editable after pointer interaction');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(40);
    const colorBlurred = await snapshot(colorText);
    assert.equal(colorBlurred.activeElement.matchesTarget, false, 'Tab moves focus away and commits the color text');
    assert.equal(colorBlurred.value.toLowerCase(), '#23bcde', 'blur commit preserves the normalized color value');

    const nativeColor = colorScope.locator('input[type="color"]');
    await nativeColor.fill('#a1b2c3');
    await page.waitForFunction(() => {
        const scope = document.querySelector('.docs-example[aria-labelledby="component-color-input-heading"]');
        return scope?.querySelector('input[type="color"]')?.value.toLowerCase() === '#a1b2c3'
            && scope?.querySelector('input:not([type="color"])')?.value.toLowerCase() === '#a1b2c3';
    });
    const nativeColorUpdate = { native: await nativeColor.inputValue(), text: await colorText.inputValue(), state: await snapshot(colorText) };
    assert.equal(nativeColorUpdate.text.toLowerCase(), '#a1b2c3', 'native color input updates the shared text model');
    assert.equal(nativeColorUpdate.state.activeElement.matchesTarget, false, 'updating the color swatch does not steal focus into the text field');
    report.observations.push({ component: 'UColorInput text', sequence: 'Tab-edit-pointer-edit-Tab-commit-native-color-update', colorKeyboard, colorPointerEdit, colorBlurred, nativeColorUpdate });
}

async function tabToReal(page, target, limit = 500) {
    await target.scrollIntoViewIfNeeded();
    if (await target.evaluate(element => document.activeElement === element)) return 0;
    for (let step = 1; step <= limit; step++) {
        await page.keyboard.press('Tab');
        if (await target.evaluate(element => document.activeElement === element)) return step;
    }
    throw new Error(`real Tab traversal did not reach target within ${limit} steps`);
}

async function clickTarget(page, target) {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    assert.ok(bounds && bounds.width > 0 && bounds.height > 0, 'pointer target must have visible geometry');
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

async function replaceActiveText(page, value) {
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+End');
    await page.keyboard.type(value);
}

async function colorInputGeometry(target) {
    await target.scrollIntoViewIfNeeded();
    return target.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { width: rect.width, height: rect.height, flexGrow: style.flexGrow, computedWidth: style.width, computedHeight: style.height };
    });
}

function assertColorInputGeometry(geometry, state) {
    assert.ok(Math.abs(geometry.width - 26) < 0.5, `native color input ${state} width should remain 26px; got ${JSON.stringify(geometry)}`);
    assert.ok(Math.abs(geometry.height - 26) < 0.5, `native color input ${state} height should remain 26px; got ${JSON.stringify(geometry)}`);
    assert.equal(geometry.flexGrow, '0', `native color input ${state} flex-grow should stay disabled`);
}

async function captureNative(name) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), size: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    const file = path.join(evidence, `${name}.png`);
    await writeFile(file, png);
    return { file, size: captured.size, pixels: [png.readUInt32BE(16), png.readUInt32BE(20)] };
}

async function clickAssociatedLabelText(page, scope, target, labelText) {
    await target.scrollIntoViewIfNeeded();
    let hit = await target.evaluate((element, expectedText) => {
        const input = element instanceof HTMLInputElement ? element : null;
        const labels = input?.labels ? [...input.labels] : [element.closest('label')].filter(Boolean);
        for (const label of labels) {
            const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const content = node.textContent ?? '';
                const offset = content.indexOf(expectedText);
                if (offset < 0) continue;
                const range = document.createRange();
                range.setStart(node, offset);
                range.setEnd(node, offset + expectedText.length);
                const rect = range.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const hitTarget = document.elementFromPoint(x, y);
                return { x, y, width: rect.width, height: rect.height, hitTag: hitTarget?.tagName, hitClass: typeof hitTarget?.className === 'string' ? hitTarget.className : '' };
            }
        }
        return null;
    }, labelText);
    if (!hit) {
        const text = scope.getByText(labelText, { exact: true }).last();
        if (await text.count() === 0) {
            const details = await target.evaluate(element => ({
                input: element.outerHTML,
                labels: element instanceof HTMLInputElement ? Array.from(element.labels ?? []).map(label => label.outerHTML) : [],
                parent: element.parentElement?.parentElement?.outerHTML,
            }));
            throw new Error(`${labelText}: no associated visible label text; DOM=${JSON.stringify(details)}`);
        }
        await text.waitFor({ state: 'visible' });
        hit = await text.evaluate(element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            const rect = range.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const hitTarget = document.elementFromPoint(x, y);
            return { x, y, width: rect.width, height: rect.height, hitTag: hitTarget?.tagName, hitClass: typeof hitTarget?.className === 'string' ? hitTarget.className : '' };
        });
    }
    assert.ok(hit && hit.width > 0 && hit.height > 0, `${labelText}: expected a visible label text node`);
    await page.mouse.click(hit.x, hit.y);
    return hit;
}

async function pointerDownCancelClick(page, target) {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    assert.ok(bounds && bounds.width > 0 && bounds.height > 0, 'native non-text input must have visible pointer geometry');
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(Math.max(2, bounds.x - 24), Math.max(2, bounds.y - 24), { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(40);
    return { x, y, bounds };
}

async function moveThumb(page, target, delta) {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    assert.ok(bounds, 'range input must have visible geometry');
    const data = await target.evaluate(element => ({ value: Number(element.value), min: Number(element.min), max: Number(element.max) }));
    const usable = Math.max(1, bounds.width - 16);
    const x = bounds.x + 8 + (data.value - data.min) / Math.max(1, data.max - data.min) * usable;
    const next = Math.min(data.max, data.value + delta);
    const goalX = bounds.x + 8 + (next - data.min) / Math.max(1, data.max - data.min) * usable;
    await page.mouse.move(x, bounds.y + bounds.height / 2);
    await page.mouse.down();
    return { value: data.value, x, y: bounds.y + bounds.height / 2, goalX };
}

async function snapshot(target) {
    return target.evaluate(element => {
        const active = document.activeElement;
        const describe = node => node ? {
            tag: node.tagName,
            type: node instanceof HTMLInputElement ? node.type : undefined,
            id: node.id,
            ariaLabel: node.getAttribute('aria-label'),
            className: typeof node.className === 'string' ? node.className : '',
        } : null;
        const style = getComputedStyle(element);
        const thumb = getComputedStyle(element, '::-webkit-slider-thumb');
        const ancestors = [];
        for (let node = element; node && ancestors.length < 5; node = node.parentElement) {
            if (node.matches('.ui-field, .ui-slider-control, .ui-range-slider-control, .ui-range-slider-track, .ui-color-picker, .ui-color-channel, .ui-input, .u-autocomplete-field, .ui-file-input, .ui-file-upload, .ui-selection-ripple, .ui-list-item, .ui-button')) {
                const computed = getComputedStyle(node);
                ancestors.push({
                    className: node.className,
                    focusWithin: node.matches(':focus-within'),
                    outline: computed.outline,
                    boxShadow: computed.boxShadow,
                    borderColor: computed.borderColor,
                    backgroundColor: computed.backgroundColor,
                });
            }
        }
        return {
            value: element.value,
            checked: element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio') ? element.checked : undefined,
            activeElement: { ...describe(active), matchesTarget: active === element },
            focused: element.matches(':focus'),
            focusVisible: element.matches(':focus-visible'),
            pointerFocusAttribute: element.hasAttribute('data-ui-pointer-focus'),
            outline: { value: style.outline, width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor },
            boxShadow: style.boxShadow,
            thumbBoxShadow: thumb.boxShadow,
            ancestors,
        };
    });
}

function hasOutline(state) {
    return state.outline.style !== 'none' && state.outline.width !== '0px';
}
