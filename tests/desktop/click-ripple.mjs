import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'click-ripple-'));
const report = { status: 'running', assertions: 0, checks: [], screenshots: [], pageErrors: [], vueWarnings: [] };
const manifest = JSON.parse(await readFile('src/ui/docs/componentExampleManifest.json', 'utf8'));
let server;
let app;
let page;
let currentRoute = 'startup';

function check(description, actual, expected) {
    assert.deepEqual(actual, expected, description);
    report.assertions++;
    report.checks.push(description);
}

function ok(description, condition, details = '') {
    assert.ok(condition, details ? `${description}: ${details}` : description);
    report.assertions++;
    report.checks.push(description);
}

async function openExample(route, example) {
    currentRoute = route;
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/${route}`);
    await page.locator('.docs-shell').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('.docs-page-heading h1').waitFor({ state: 'visible', timeout: 10000 });
    const card = page.locator(`.docs-example[aria-labelledby="${example}-heading"]`);
    await card.locator('.live-example').waitFor({ state: 'visible', timeout: 10000 });
    return card.locator('.live-example');
}

async function openComponent(route, name) {
    const entry = manifest.find((item) => item.name === name);
    assert.ok(entry, `manifest example exists for ${name}`);
    return openExample(route, entry.example);
}

async function ownWaveCount(target) {
    return target.evaluate((element) => element.querySelectorAll(':scope > .ui-ripple-layer > .ui-ripple-wave').length);
}

async function ownLayerCount(target) {
    return target.evaluate((element) => element.querySelectorAll(':scope > .ui-ripple-layer').length);
}

async function waitOwnWave(target, count = 1) {
    const handle = await target.elementHandle();
    assert.ok(handle, 'ripple target is mounted');
    const predicate = count > 1
        ? (element) => element.isConnected && element.querySelectorAll(':scope > .ui-ripple-layer > .ui-ripple-wave').length >= 2
        : (element) => element.isConnected && element.querySelectorAll(':scope > .ui-ripple-layer > .ui-ripple-wave').length >= 1;
    await page.waitForFunction(predicate, handle, { timeout: 3000 });
}

async function waitOwnLayerClear(target, label) {
    const handle = await target.elementHandle();
    assert.ok(handle, `${label}: target remains mounted until waves exit`);
    await page.waitForFunction((element) => !element.isConnected || !element.querySelector(':scope > .ui-ripple-layer'),
        handle, { timeout: 3000 });
    check(`${label}: ripple layer clears`, await ownLayerCount(target), 0);
}

async function pointIn(target, xRatio = .5, yRatio = .5) {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    assert.ok(bounds && bounds.width > 0 && bounds.height > 0, 'ripple target has visible geometry');
    return { x: bounds.x + bounds.width * xRatio, y: bounds.y + bounds.height * yRatio };
}

async function pointerPress(target, xRatio = .5, yRatio = .5) {
    const point = await pointIn(target, xRatio, yRatio);
    const targetHandle = await target.elementHandle();
    assert.ok(targetHandle, 'ripple target remains mounted before pointer press');
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await waitOwnWave(target);
    return { point, target, targetHandle };
}

async function pointerRelease(press) {
    await page.mouse.up();
    return press.targetHandle.evaluate((element) => element.querySelectorAll(':scope > .ui-ripple-layer > .ui-ripple-wave').length);
}

async function pointerClickRipple(target, label) {
    const press = await pointerPress(target);
    const heldCount = await ownWaveCount(target);
    await pointerRelease(press);
    ok(`${label}: pointer activation displays a wave`, heldCount >= 1);
    return press;
}

async function mouseClick(target, xRatio = .5, yRatio = .5) {
    const point = await pointIn(target, xRatio, yRatio);
    await page.mouse.click(point.x, point.y);
    return point;
}

async function findTextHost(root, hostSelector, textSelector, exactText) {
    const hosts = root.locator(hostSelector);
    for (let index = 0; index < await hosts.count(); index++) {
        const host = hosts.nth(index);
        const text = (await host.locator(textSelector).innerText()).trim();
        if (text === exactText) return host;
    }
    throw new Error(`Unable to find ${hostSelector} with ${textSelector} text ${JSON.stringify(exactText)}`);
}

async function setWindow(width, height) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(1);
        window.setContentSize(size.width, size.height);
    }, { width, height });
    await page.waitForFunction((size) => Math.abs(innerWidth - size.width) <= 1 && Math.abs(innerHeight - size.height) <= 1,
        { width, height }, { timeout: 10000 });
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const desired = theme === 'dark';
    if (await toggle.isChecked() !== desired) await toggle.setChecked(desired);
    await page.waitForFunction((expected) => document.documentElement.dataset.theme === expected, theme, { timeout: 10000 });
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')]
        .some((style) => style.textContent.includes('@keyframes ui-theme-reveal')), null, { timeout: 10000 });
    await page.waitForTimeout(200);
}

async function captureNative(name, expectedWidth, expectedHeight) {
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), size: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    const actual = [png.readUInt32BE(16), png.readUInt32BE(20)];
    check(`${name}: native screenshot dimensions`, actual, [expectedWidth, expectedHeight]);
    check(`${name}: window content dimensions`, captured.size, [expectedWidth, expectedHeight]);
    const file = path.join(evidence, `${name}.png`);
    await writeFile(file, png);
    report.screenshots.push(file);
}

try {
    server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}index.html#/ripple` };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(10000);
    page.on('pageerror', (error) => report.pageErrors.push(`${currentRoute}: ${error.message}`));
    page.on('console', (message) => {
        const text = message.text();
        if (/\[Vue warn\]|Vue warn|Failed to resolve component|Failed to resolve directive|Property .* (?:was accessed|is not defined)|is not defined on instance/i.test(text)) {
            report.vueWarnings.push(`${currentRoute}: ${text}`);
        }
    });
    await page.locator('.docs-shell').waitFor({ state: 'visible', timeout: 10000 });

    // Capture a held ListItem ripple at both themes and viewport widths for root's visual review.
    const listDemo = await openComponent('list-item', 'UListItem');
    const listItemDemo = listDemo.locator('[data-demo-component="UListItem"]');
    const overview = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '概览');
    for (const [width, height] of [[1440, 900], [390, 844]]) {
        await setWindow(width, height);
        for (const theme of ['light', 'dark']) {
            await setTheme(theme);
            const press = await pointerPress(overview, .32, .5);
            await page.waitForTimeout(120);
            ok(`${theme}/${width}: screenshot target has an active mid-wave`, await ownWaveCount(overview) > 0);
            await captureNative(`list-item-${theme}-${width}x${height}-midwave`, width, height);
            await pointerRelease(press);
            await waitOwnLayerClear(overview, `${theme}/${width} captured wave`);
        }
    }
    await setWindow(1440, 900);
    await setTheme('light');

    // ListItem activation, fast-release lifecycle, overlapping waves and keyboard behavior.
    const selectedOutput = listItemDemo.locator('output');
    check('screenshot taps leave the initial overview selection restored', await selectedOutput.innerText(), '已选：overview · 独立操作：0 次');
    const quick = await pointerPress(overview, .24, .43);
    check('ListItem quick press starts one wave', await ownWaveCount(overview), 1);
    await pointerRelease(quick);
    await page.waitForTimeout(100);
    ok('ListItem quick release keeps the wave visible through blur', await ownWaveCount(overview) >= 1);
    check('ListItem pointer activation toggles its current selection', await selectedOutput.innerText(), '已选： · 独立操作：0 次');
    await waitOwnLayerClear(overview, 'ListItem quick wave');

    const repeatPoint = await pointIn(overview, .68, .52);
    await page.mouse.move(repeatPoint.x, repeatPoint.y);
    await page.mouse.down();
    await waitOwnWave(overview);
    await page.mouse.up();
    await page.waitForTimeout(60);
    await page.mouse.move(repeatPoint.x, repeatPoint.y);
    await page.mouse.down();
    await waitOwnWave(overview, 2);
    check('two fast ListItem activations coexist as separate waves', await ownWaveCount(overview), 2);
    await page.mouse.up();
    await waitOwnLayerClear(overview, 'overlapping ListItem waves');

    await overview.focus();
    await page.keyboard.down('Space');
    await waitOwnWave(overview);
    check('ListItem Space activation creates one keyboard wave', await ownWaveCount(overview), 1);
    await page.keyboard.up('Space');
    check('ListItem keyboard operation retains focus', await overview.evaluate((element) => element === document.activeElement), true);
    check('ListItem keyboard activation keeps selection state', await overview.getAttribute('aria-selected'), 'true');
    await waitOwnLayerClear(overview, 'ListItem keyboard wave');

    const listRippleSwitch = listItemDemo.getByRole('checkbox', { name: '启用列表项涟漪', exact: true });
    const quietRow = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '此项关闭涟漪');
    await mouseClick(quietRow);
    check('per-row ripple=false preserves the ListItem action without feedback', await ownWaveCount(quietRow), 0);
    check('per-row ripple=false still selects its item', await quietRow.getAttribute('aria-selected'), 'true');

    const disabledRow = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '归档');
    const beforeDisabledSelection = await selectedOutput.innerText();
    await mouseClick(disabledRow);
    check('disabled ListItem has no ripple', await ownWaveCount(disabledRow), 0);
    check('disabled ListItem does not change the selected model', await selectedOutput.innerText(), beforeDisabledSelection);

    const customRow = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '居中主题色反馈');
    const customPress = await pointerPress(customRow, .12, .24);
    const customColor = await customRow.evaluate((host) => {
        const layer = host.querySelector(':scope > .ui-ripple-layer');
        const wave = layer?.querySelector('.ui-ripple-wave');
        const expected = getComputedStyle(host).getPropertyValue('--accent-text').trim();
        const probe = document.createElement('span');
        probe.style.color = expected;
        host.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        const hostRect = host.getBoundingClientRect();
        const radius = Number.parseFloat(wave?.style.width ?? '0') / 2;
        const centerX = Number.parseFloat(wave?.style.left ?? 'NaN') + radius;
        const centerY = Number.parseFloat(wave?.style.top ?? 'NaN') + radius;
        return { color: getComputedStyle(layer).color, expected: resolved,
            centered: Math.abs(centerX - host.clientWidth / 2) < 1 && Math.abs(centerY - host.clientHeight / 2) < 1,
            inside: hostRect.width > 0 && hostRect.height > 0 };
    });
    check('object ripple options center the ListItem wave and apply its theme color', customColor,
        { color: customColor.expected, expected: customColor.expected, centered: true, inside: true });
    await pointerRelease(customPress);
    await waitOwnLayerClear(customRow, 'custom ListItem wave');

    const notificationRow = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '列表内选择控件');
    const notificationLabel = notificationRow.locator('label.ui-checkbox');
    const notificationInput = notificationLabel.locator('input[type="checkbox"]');
    await mouseClick(notificationLabel.locator('.ui-checkbox-label'));
    await waitOwnWave(notificationLabel.locator('.ui-selection-ripple'));
    check('nested notification label changes only its checkbox', await notificationInput.isChecked(), true);
    check('nested notification checkbox does not select its parent row', await selectedOutput.innerText(), '已选：center · 独立操作：0 次');
    check('nested notification label does not start a parent ListItem wave', await ownWaveCount(notificationRow), 0);
    check('nested notification checkbox owns its label-forwarded wave', await ownWaveCount(notificationLabel.locator('.ui-selection-ripple')), 1);
    await waitOwnLayerClear(notificationLabel.locator('.ui-selection-ripple'), 'nested ListItem checkbox wave');

    const actionRow = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '设置');
    const childAction = actionRow.getByRole('button', { name: '独立操作', exact: true });
    const parentBeforeAction = await selectedOutput.innerText();
    const childPress = await pointerPress(childAction);
    check('nested ListItem action button owns its wave', await ownWaveCount(childAction), 1);
    await pointerRelease(childPress);
    await page.waitForFunction(() => document.querySelector('.docs-example[aria-labelledby="component-list-item-heading"] output')?.textContent.includes('独立操作：1 次'), null, { timeout: 3000 });
    check('nested action button does not select its ListItem parent', await selectedOutput.innerText(), parentBeforeAction.replace('独立操作：0 次', '独立操作：1 次'));
    check('nested action button does not start a parent ListItem wave', await ownWaveCount(actionRow), 0);
    await waitOwnLayerClear(childAction, 'nested action button wave');

    const quietActionRow = await findTextHost(listItemDemo, '.ui-list-item', '.ui-list-item-title', '带无涟漪按钮的列表项');
    const quietAction = quietActionRow.getByRole('button', { name: '无涟漪操作', exact: true });
    const beforeQuietAction = await selectedOutput.innerText();
    await mouseClick(quietAction);
    check('nested ripple=false action remains clickable but has no wave', await ownWaveCount(quietAction), 0);
    check('nested ripple=false action does not ripple or select its parent', await ownWaveCount(quietActionRow), 0);
    check('nested ripple=false action still emits its action', await selectedOutput.innerText(), beforeQuietAction.replace('独立操作：1 次', '独立操作：2 次'));

    await listRippleSwitch.setChecked(false);
    await mouseClick(overview);
    check('dynamic ListItem ripple=false applies without remounting', await ownWaveCount(overview), 0);
    await listRippleSwitch.setChecked(true);
    const reenabled = await pointerPress(overview);
    check('dynamic ListItem ripple re-enable takes effect', await ownWaveCount(overview), 1);
    await pointerRelease(reenabled);
    await waitOwnLayerClear(overview, 're-enabled ListItem wave');

    // Group headers, custom activators and keep-open menu options remain separate ripple targets.
    const listGroupDemo = await openComponent('list-group', 'UListGroup');
    const groups = listGroupDemo.locator('[data-demo-component="UListGroup"]');
    const defaultGroup = groups.locator('.ui-list-group').nth(0);
    const defaultActivator = defaultGroup.locator(':scope > .ui-list-group-header');
    check('ListGroup starts collapsed', await defaultActivator.getAttribute('aria-expanded'), 'false');
    const groupPress = await pointerPress(defaultActivator);
    await pointerRelease(groupPress);
    check('ListGroup activator expands its children', await defaultActivator.getAttribute('aria-expanded'), 'true');
    check('ListGroup default activator produces its own ripple', await ownWaveCount(defaultActivator), 1);
    await waitOwnLayerClear(defaultActivator, 'ListGroup default activator wave');
    const customActivator = groups.getByRole('button', { name: /自定义分组触发器/ });
    const customGroup = groups.locator('.ui-list-group').filter({ has: customActivator });
    const customGroupPress = await pointerPress(customActivator);
    await pointerRelease(customGroupPress);
    check('custom ListGroup activator toggles the group', await customActivator.getAttribute('aria-expanded'), 'true');
    check('custom ListGroup activator receives provided ripple props', await ownWaveCount(customActivator), 1);
    await waitOwnLayerClear(customActivator, 'custom ListGroup activator wave');
    const disabledGroup = groups.getByRole('button', { name: '禁用分组', exact: true });
    const disabledPoint = await pointIn(disabledGroup);
    await page.mouse.click(disabledPoint.x, disabledPoint.y);
    check('disabled ListGroup activator does not ripple or open', await disabledGroup.getAttribute('aria-expanded'), 'false');
    check('disabled ListGroup activator has no wave', await ownWaveCount(disabledGroup), 0);

    const menuDemo = await openExample('menu', 'menu-items');
    const menus = menuDemo.locator('.ui-menu');
    const keepOpenMenu = menus.nth(1);
    const tagTrigger = keepOpenMenu.getByRole('button');
    await tagTrigger.click();
    const trialTag = page.getByRole('menuitemcheckbox', { name: '试用', exact: true });
    await trialTag.waitFor({ state: 'visible' });
    const trialPress = await pointerPress(trialTag);
    await pointerRelease(trialPress);
    check('keep-open MenuItem toggles its checked value', await trialTag.getAttribute('aria-checked'), 'true');
    check('keep-open MenuItem keeps the DOM menu open', await page.locator('.ui-menu-surface').filter({ has: trialTag }).evaluate((element) => element.matches('[data-state="open"]')), true);
    check('keep-open MenuItem has its own ripple', await ownWaveCount(trialTag), 1);
    await waitOwnLayerClear(trialTag, 'keep-open MenuItem wave');

    // Checkbox, switch and radio use one centered feedback host for direct, label and keyboard activation.
    currentRoute = 'ripple-controls';
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/ripple`);
    const controlsSection = page.locator('#section-controls');
    await controlsSection.waitFor({ state: 'visible' });
    const controls = controlsSection.locator('[data-ripple-controls]');
    const controlRipple = controlsSection.getByRole('checkbox', { name: '启用控件涟漪', exact: true });
    const controlDisabled = controlsSection.getByRole('checkbox', { name: '禁用控件', exact: true });
    const controlReadonly = controlsSection.getByRole('checkbox', { name: '只读控件', exact: true });
    const checkboxInput = controls.locator('#ripple-checkbox');
    const switchInput = controls.locator('#ripple-switch');
    const firstRadio = controls.locator('#ripple-radio-first');
    const secondRadio = controls.locator('#ripple-radio-second');
    const wrapperFor = (input) => input.locator('xpath=..');
    const checkboxRipple = wrapperFor(checkboxInput);
    const switchRipple = wrapperFor(switchInput);
    const radioRipple = wrapperFor(secondRadio);
    const dimensions = await Promise.all([
        [checkboxInput, checkboxRipple, 16, 'checkbox'],
        [secondRadio, radioRipple, 16, 'radio'],
        [switchInput, switchRipple, 36, 'switch']
    ].map(async ([input, wrapper, expectedWidth, name]) => {
        const value = await wrapper.evaluate((element) => {
            const inputElement = element.querySelector('input');
            return { wrapperWidth: element.getBoundingClientRect().width, inputWidth: inputElement.getBoundingClientRect().width,
                wrapperHeight: element.getBoundingClientRect().height, inputHeight: inputElement.getBoundingClientRect().height };
        });
        ok(`${name} ripple host preserves native control dimensions`, Math.abs(value.wrapperWidth - expectedWidth) < 1
            && Math.abs(value.wrapperWidth - value.inputWidth) < 1 && Math.abs(value.wrapperHeight - value.inputHeight) < 1,
        JSON.stringify(value));
        return value;
    }));

    const checkboxPress = await pointerPress(checkboxRipple);
    await pointerRelease(checkboxPress);
    check('direct checkbox input toggles once', await checkboxInput.isChecked(), true);
    check('direct checkbox input creates one wave, not a forwarded duplicate', await ownWaveCount(checkboxRipple), 1);
    await waitOwnLayerClear(checkboxRipple, 'direct checkbox wave');

    await mouseClick(controls.locator('label.ui-checkbox .ui-checkbox-label'));
    await waitOwnWave(checkboxRipple);
    check('checkbox label forwards a single ripple and toggles once', await checkboxInput.isChecked(), false);
    check('checkbox label activation creates one wave', await ownWaveCount(checkboxRipple), 1);
    await waitOwnLayerClear(checkboxRipple, 'checkbox label wave');

    const labelText = controls.locator('label.ui-checkbox .ui-checkbox-label');
    await mouseClick(labelText);
    await mouseClick(labelText);
    await waitOwnWave(checkboxRipple, 2);
    check('rapid checkbox label clicks create independent waves', await ownWaveCount(checkboxRipple), 2);
    check('two checkbox label clicks preserve native toggle behavior', await checkboxInput.isChecked(), false);
    await waitOwnLayerClear(checkboxRipple, 'rapid checkbox label waves');

    await checkboxInput.focus();
    await page.keyboard.press('Enter');
    check('checkbox Enter is not a default ripple key', await ownWaveCount(checkboxRipple), 0);
    await page.keyboard.down('Space');
    await waitOwnWave(checkboxRipple);
    await page.keyboard.up('Space');
    check('checkbox Space changes the value and creates one wave', await checkboxInput.isChecked(), true);
    check('checkbox Space does not create a duplicate label-forwarded wave', await ownWaveCount(checkboxRipple), 1);
    check('checkbox keyboard operation retains focus', await checkboxInput.evaluate((element) => element === document.activeElement), true);
    await waitOwnLayerClear(checkboxRipple, 'checkbox Space wave');

    const switchLabel = controlsSection.getByText('自动同步', { exact: true });
    await mouseClick(switchLabel);
    await waitOwnWave(switchRipple);
    check('switch label toggles and receives one forwarded wave', await switchInput.isChecked(), true);
    check('switch uses one native-sized feedback layer', await ownWaveCount(switchRipple), 1);
    await waitOwnLayerClear(switchRipple, 'switch label wave');

    const secondRadioLabel = controlsSection.getByText('自定义模式', { exact: true });
    await mouseClick(secondRadioLabel);
    await waitOwnWave(radioRipple);
    check('radio label selects its option and receives one wave', await secondRadio.isChecked(), true);
    check('radio label activation does not duplicate waves', await ownWaveCount(radioRipple), 1);
    await waitOwnLayerClear(radioRipple, 'radio label wave');

    await controlRipple.setChecked(false);
    const beforeRippleDisabled = await checkboxInput.isChecked();
    await mouseClick(labelText);
    check('ripple=false leaves checkbox behavior active', await checkboxInput.isChecked(), !beforeRippleDisabled);
    check('ripple=false suppresses checkbox feedback', await ownWaveCount(checkboxRipple), 0);
    await controlRipple.setChecked(true);

    await controlDisabled.setChecked(true);
    check('shared disabled state reaches checkbox/switch/radio', [await checkboxInput.isDisabled(), await switchInput.isDisabled(), await secondRadio.isDisabled()], [true, true, true]);
    const disabledCheckboxBounds = await checkboxRipple.boundingBox();
    await page.mouse.click(disabledCheckboxBounds.x + disabledCheckboxBounds.width / 2, disabledCheckboxBounds.y + disabledCheckboxBounds.height / 2);
    check('disabled choice controls do not ripple', [await ownWaveCount(checkboxRipple), await ownWaveCount(switchRipple), await ownWaveCount(radioRipple)], [0, 0, 0]);
    await controlDisabled.setChecked(false);

    await controlReadonly.setChecked(true);
    const checkedBeforeReadonlyClick = await checkboxInput.isChecked();
    const readonlyBounds = await checkboxRipple.boundingBox();
    await page.mouse.click(readonlyBounds.x + readonlyBounds.width / 2, readonlyBounds.y + readonlyBounds.height / 2);
    check('readonly controls expose aria-readonly and preserve their values', [await checkboxInput.getAttribute('aria-readonly'), await checkboxInput.isChecked()], ['true', checkedBeforeReadonlyClick]);
    check('readonly checkbox/switch/radio do not ripple', [await ownWaveCount(checkboxRipple), await ownWaveCount(switchRipple), await ownWaveCount(radioRipple)], [0, 0, 0]);
    await controlReadonly.setChecked(false);

    // Tree row, disclosure toggle and its independent checkbox must never double-activate each other.
    const treeDemo = await openComponent('treeview', 'UTreeview');
    const tree = treeDemo.locator('[data-demo-component="UTreeview"] .ui-treeview');
    const componentRow = await findTextHost(tree, '.ui-treeview-item[role="treeitem"]', '.ui-treeview-title', '组件库');
    const rowPress = await pointerPress(componentRow, .75, .5);
    await pointerRelease(rowPress);
    check('Treeview row click activates its own row and ripple', await componentRow.evaluate((element) => element.classList.contains('is-active')), true);
    check('Treeview row owns its activation ripple', await ownWaveCount(componentRow), 1);
    await waitOwnLayerClear(componentRow, 'Treeview row wave');

    const toggle = componentRow.locator('.ui-treeview-toggle');
    check('Treeview root branch starts expanded', await toggle.getAttribute('aria-expanded'), 'true');
    const togglePress = await pointerPress(toggle);
    await pointerRelease(togglePress);
    check('Treeview expansion toggle collapses its branch', await toggle.getAttribute('aria-expanded'), 'false');
    check('Treeview toggle owns its ripple, not its row', [await ownWaveCount(toggle), await ownWaveCount(componentRow)], [1, 0]);
    await waitOwnLayerClear(toggle, 'Treeview toggle wave');

    const reopenPress = await pointerPress(toggle);
    await pointerRelease(reopenPress);
    check('Treeview expansion toggle reopens its branch', await toggle.getAttribute('aria-expanded'), 'true');
    await waitOwnLayerClear(toggle, 'Treeview reopen wave');

    const formRow = await findTextHost(tree, '.ui-treeview-item[role="treeitem"]', '.ui-treeview-title', '表单控件');
    const formCheckbox = formRow.locator('input[type="checkbox"]');
    const formCheckboxRipple = formRow.locator('.ui-selection-ripple');
    const checkboxRect = await formCheckbox.boundingBox();
    await page.mouse.click(checkboxRect.x + checkboxRect.width / 2, checkboxRect.y + checkboxRect.height / 2);
    await waitOwnWave(formCheckboxRipple);
    check('Treeview checkbox selects its node', await formCheckbox.isChecked(), true);
    check('Treeview checkbox owns one wave and does not activate the row', [await ownWaveCount(formCheckboxRipple), await formRow.evaluate((element) => element.classList.contains('is-active'))], [1, false]);
    await waitOwnLayerClear(formCheckboxRipple, 'Treeview checkbox wave');

    const archiveRow = await findTextHost(tree, '.ui-treeview-item[role="treeitem"]', '.ui-treeview-title', '归档组件');
    const archiveToggle = archiveRow.locator('.ui-treeview-toggle');
    const archiveRect = await archiveToggle.boundingBox();
    await page.mouse.click(archiveRect.x + archiveRect.width / 2, archiveRect.y + archiveRect.height / 2);
    check('disabled Treeview branch arrow is not interactive or rippled', [await archiveToggle.isDisabled(), await ownWaveCount(archiveToggle), await ownWaveCount(archiveRow)], [true, 0, 0]);

    // A clickable Card ripples; an explicit false Card remains actionable; static Cards stay inert.
    const cardDemo = await openExample('card', 'card-clickable');
    const defaultCard = cardDemo.getByRole('button', { name: '打开工作区 · 默认涟漪', exact: true });
    const defaultCardPress = await pointerPress(defaultCard);
    await pointerRelease(defaultCardPress);
    check('clickable Card has a wave and still runs its action', await cardDemo.locator('output').innerText(), '已打开 1 次');
    check('clickable Card default feedback is attached to the native button', await ownWaveCount(defaultCard), 1);
    await waitOwnLayerClear(defaultCard, 'clickable Card wave');
    const quietCard = cardDemo.getByRole('button', { name: '打开工作区 · 关闭涟漪', exact: true });
    await mouseClick(quietCard);
    check('clickable Card ripple=false still runs its action without a wave', [await ownWaveCount(quietCard), await cardDemo.locator('output').innerText()], [0, '已打开 2 次']);
    const staticCard = cardDemo.getByRole('region', { name: '静态卡片', exact: true });
    await mouseClick(staticCard);
    check('static Card has no actionable ripple', await ownLayerCount(staticCard), 0);

    // Menu keep-open, Autocomplete/Cascader options, calendar and common discrete controls.
    const autocompleteDemo = await openComponent('autocomplete', 'UAutocomplete');
    const autocomplete = autocompleteDemo.locator('[data-demo-component="UAutocomplete"]');
    const autocompleteInput = autocomplete.getByRole('combobox', { name: '搜索工作区' });
    await autocompleteInput.focus();
    const longOption = autocomplete.locator('.u-autocomplete-menu [role="option"]').nth(1);
    await longOption.waitFor({ state: 'visible' });
    const autocompletePress = await pointerPress(longOption);
    check('Autocomplete option produces its own wave while pressed', await ownWaveCount(longOption), 1);
    await pointerRelease(autocompletePress);
    await page.waitForFunction((element) => element.value.includes('完整的很长选项文字'), await autocompleteInput.elementHandle(), { timeout: 3000 });

    const cascaderDemo = await openExample('cascader', 'cascader-form');
    const cascader = cascaderDemo.locator('.cascader-demo');
    const trigger = cascader.locator('.ui-cascader-trigger');
    const triggerPress = await pointerPress(trigger);
    await pointerRelease(triggerPress);
    check('Cascader trigger opens its dialog and ripples', await trigger.getAttribute('aria-expanded'), 'true');
    check('Cascader trigger owns a single wave', await ownWaveCount(trigger), 1);
    await waitOwnLayerClear(trigger, 'Cascader trigger wave');
    const cascaderPanel = cascader.locator('.ui-cascader-panel');
    const east = cascaderPanel.locator('[role="option"][aria-label^="华东"]');
    const eastPress = await pointerPress(east);
    await pointerRelease(eastPress);
    check('Cascader branch navigation option ripples without committing a path', await cascader.locator('.cascader-demo-value code').innerText(), '[]');
    check('Cascader branch option owns its wave', await ownWaveCount(east), 1);
    await waitOwnLayerClear(east, 'Cascader branch wave');
    const zhejiang = cascaderPanel.locator('[data-level="1"] [role="option"][aria-label^="浙江省"]');
    const zhejiangPress = await pointerPress(zhejiang);
    await pointerRelease(zhejiangPress);
    await waitOwnLayerClear(zhejiang, 'Cascader second-level branch wave');
    const hangzhou = cascaderPanel.locator('[data-level="2"] [role="option"][aria-label="杭州市"]');
    const hangzhouPress = await pointerPress(hangzhou);
    await pointerRelease(hangzhouPress);
    check('Cascader leaf selection retains its wave and writes the full path', await cascader.locator('.cascader-demo-value code').innerText(), '["east","zhejiang","hangzhou"]');
    await waitOwnLayerClear(hangzhou, 'Cascader leaf wave');

    const datePickerDemo = await openComponent('date-picker', 'UDatePicker');
    const datePicker = datePickerDemo.locator('[data-demo-component="UDatePicker"] .u-date-picker');
    const dateCell = datePicker.locator('[role="gridcell"]:not(:disabled)').first();
    const datePress = await pointerPress(dateCell);
    await pointerRelease(datePress);
    check('DatePicker day button selects a date and ripples', await dateCell.getAttribute('aria-selected'), 'true');
    check('DatePicker day feedback is attached to the chosen cell', await ownWaveCount(dateCell), 1);
    await waitOwnLayerClear(dateCell, 'DatePicker day wave');

    const numberDemo = await openComponent('number-input', 'UNumberInput');
    const numberInput = numberDemo.getByRole('spinbutton', { name: '执行并发数' });
    const increment = numberDemo.getByRole('button', { name: '增加数值', exact: true });
    const incrementPress = await pointerPress(increment);
    await pointerRelease(incrementPress);
    check('number step button increments and ripples', await numberInput.inputValue(), '6');
    check('number increment wave belongs to its discrete action', await ownWaveCount(increment), 1);
    await waitOwnLayerClear(increment, 'number increment wave');

    const ratingDemo = await openComponent('rating', 'URating');
    const rating = ratingDemo.locator('[data-demo-component="URating"] [role="slider"]');
    const fourthStar = rating.getByRole('button', { name: '4 星', exact: true });
    const ratingPress = await pointerPress(fourthStar);
    await pointerRelease(ratingPress);
    check('Rating star updates its value and ripples', await rating.getAttribute('aria-valuenow'), '4');
    check('Rating star feedback is attached to its button', await ownWaveCount(fourthStar), 1);
    await waitOwnLayerClear(fourthStar, 'Rating star wave');

    const expansionDemo = await openComponent('expansion-panel-title', 'UExpansionPanelTitle');
    const secondExpansion = expansionDemo.locator('.u-expansion-title').nth(1);
    const expansionPress = await pointerPress(secondExpansion);
    await pointerRelease(expansionPress);
    check('ExpansionPanelTitle toggles and ripples', await secondExpansion.getAttribute('aria-expanded'), 'true');
    check('ExpansionPanelTitle owns its wave', await ownWaveCount(secondExpansion), 1);
    await waitOwnLayerClear(secondExpansion, 'ExpansionPanelTitle wave');

    const stepperDemo = await openComponent('stepper-item', 'UStepperItem');
    const stepperSecond = stepperDemo.locator('.u-stepper-item').nth(1);
    const stepperPress = await pointerPress(stepperSecond);
    await pointerRelease(stepperPress);
    check('StepperItem advances and ripples', await stepperSecond.getAttribute('aria-current'), 'step');
    check('StepperItem wave belongs to the selected step', await ownWaveCount(stepperSecond), 1);
    await waitOwnLayerClear(stepperSecond, 'StepperItem wave');

    const tableDemo = await openComponent('data-table', 'UDataTable');
    const table = tableDemo.locator('[data-demo-component="UDataTable"] .u-data-table');
    const sortButton = table.getByRole('button', { name: '工作区排序', exact: true });
    const sortPress = await pointerPress(sortButton);
    await pointerRelease(sortPress);
    check('DataTable sort action changes aria-sort and ripples', await sortButton.locator('xpath=..').getAttribute('aria-sort'), 'ascending');
    check('DataTable sort feedback is on the header action', await ownWaveCount(sortButton), 1);
    await waitOwnLayerClear(sortButton, 'DataTable sort wave');
    const detailButton = table.getByRole('button', { name: '展开 工作区 1', exact: true });
    const detailPress = await pointerPress(detailButton);
    await pointerRelease(detailPress);
    const expandedDetailButton = table.getByRole('button', { name: '收起 工作区 1', exact: true });
    check('DataTable details action expands a row and ripples', await expandedDetailButton.getAttribute('aria-expanded'), 'true');
    check('DataTable detail wave belongs to the expander button', await ownWaveCount(expandedDetailButton), 1);
    await table.locator('.u-data-table-details').filter({ hasText: '开发' }).first().waitFor({ state: 'visible' });
    await waitOwnLayerClear(expandedDetailButton, 'DataTable details wave');

    const carouselDemo = await openComponent('carousel', 'UCarousel');
    const carousel = carouselDemo.locator('[data-demo-component="UCarousel"] .u-carousel');
    const secondDot = carousel.getByRole('button', { name: '前往第 2 项', exact: true });
    const dotBefore = await secondDot.locator('.u-carousel-dot').evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
    });
    check('Carousel dot remains its authored 7px decorative mark', dotBefore, { width: 7, height: 7 });
    const dotPress = await pointerPress(secondDot, .25, .3);
    const dotMetrics = await secondDot.evaluate((button) => {
        const layer = button.querySelector(':scope > .ui-ripple-layer');
        const wave = layer?.querySelector('.ui-ripple-wave');
        const buttonRect = button.getBoundingClientRect();
        const layerRect = layer?.getBoundingClientRect();
        const radius = Number.parseFloat(wave?.style.width ?? '0') / 2;
        const centerX = Number.parseFloat(wave?.style.left ?? 'NaN') + radius;
        const centerY = Number.parseFloat(wave?.style.top ?? 'NaN') + radius;
        const dotRect = button.querySelector('.u-carousel-dot').getBoundingClientRect();
        return {
            layerInsideButton: !!layerRect && layerRect.left >= buttonRect.left - 1 && layerRect.top >= buttonRect.top - 1
                && layerRect.right <= buttonRect.right + 1 && layerRect.bottom <= buttonRect.bottom + 1,
            centeredCircle: Math.abs(centerX - button.clientWidth / 2) < 1 && Math.abs(centerY - button.clientHeight / 2) < 1
                && getComputedStyle(wave).borderRadius === '50%',
            dot: { width: dotRect.width, height: dotRect.height },
            button: { width: buttonRect.width, height: buttonRect.height }
        };
    });
    await pointerRelease(dotPress);
    ok('Carousel dot ripple stays within its button and stays centered/circular', dotMetrics.layerInsideButton && dotMetrics.centeredCircle);
    check('Carousel ripple layer does not resize the decorative dot', dotMetrics.dot, dotBefore);
    check('Carousel dot action selects its slide', await secondDot.getAttribute('aria-pressed'), 'true');
    await waitOwnLayerClear(secondDot, 'Carousel dot wave');

    const actionsDemo = await openExample('message-actions', 'conversation-actions');
    const copyAction = actionsDemo.getByRole('button', { name: '复制回复', exact: true }).first();
    const actionPress = await pointerPress(copyAction);
    await pointerRelease(actionPress);
    check('MessageActions button executes its action and ripples', await actionsDemo.getByRole('status').innerText(), '执行操作：copy');
    check('MessageActions default ripple is attached to its icon button', await ownWaveCount(copyAction), 1);
    await waitOwnLayerClear(copyAction, 'MessageActions copy wave');

    // Manual and system reduced-motion changes clear already-running waves immediately.
    await openExample('list-item', 'component-list-item');
    const motionDemo = page.locator('.docs-example[aria-labelledby="component-list-item-heading"] [data-demo-component="UListItem"]');
    const motionTarget = await findTextHost(motionDemo, '.ui-list-item', '.ui-list-item-title', '概览');
    const manualPress = await pointerPress(motionTarget);
    check('manual reduced-motion scenario starts with an active wave', await ownWaveCount(motionTarget), 1);
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await page.waitForFunction((element) => !element.querySelector(':scope > .ui-ripple-layer'), await motionTarget.elementHandle(), { timeout: 3000 });
    check('manual reduced motion clears the in-flight ripple immediately', await ownLayerCount(motionTarget), 0);
    await page.mouse.up();
    await page.evaluate(() => { delete document.documentElement.dataset.reducedMotion; });
    await page.waitForTimeout(80);

    const systemPress = await pointerPress(motionTarget);
    check('system reduced-motion scenario starts with an active wave', await ownWaveCount(motionTarget), 1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction((element) => !element.querySelector(':scope > .ui-ripple-layer'), await motionTarget.elementHandle(), { timeout: 3000 });
    check('system reduced motion clears the in-flight ripple immediately', await ownLayerCount(motionTarget), 0);
    await page.mouse.up();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const reducedClickPoint = await pointIn(motionTarget);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.click(reducedClickPoint.x, reducedClickPoint.y);
    check('system reduced motion suppresses a new ripple', await ownLayerCount(motionTarget), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    check('no page errors during ripple component interactions', report.pageErrors, []);
    check('no Vue missing-component or undefined-property warnings', report.vueWarnings, []);
    report.status = 'passed';
} catch (error) {
    report.status = 'failed';
    report.failure = error instanceof Error ? error.stack : String(error);
} finally {
    if (app) await app.close();
    if (server) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
}

console.log(`Click ripple: ${report.assertions} assertions; ${report.status}; evidence: ${evidence}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
}
