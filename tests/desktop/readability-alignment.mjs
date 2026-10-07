import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'readability-alignment-'));
const passed = [];
const pageErrors = [];
const consoleDiagnostics = [];
let server;
let app;
let page;
let failure;
let failureDiagnostics;

async function waitForText(locator, text, context = text) {
    const element = await locator.elementHandle();
    await page.waitForFunction(({ node, expected }) => !!node?.textContent?.includes(expected), { node: element, expected: text }, { timeout: 10000 });
    assert.ok((await locator.textContent()).includes(text), context);
}

async function setWindow(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(size.zoom);
        window.setContentSize(size.width, size.height);
    }, { width, height, zoom });
    await page.waitForFunction(size => Math.abs(innerWidth - Math.round(size.width / size.zoom)) <= 1
        && Math.abs(innerHeight - Math.round(size.height / size.zoom)) <= 1, { width, height, zoom }, { timeout: 10000 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const target = theme === 'dark';
    const checked = await toggle.isChecked();
    const current = await page.evaluate(() => document.documentElement.dataset.theme);
    if (checked === target && current !== theme) {
        await toggle.setChecked(!target);
        await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, target ? 'light' : 'dark', { timeout: 10000 });
    }
    await toggle.setChecked(target);
    await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme, { timeout: 10000 });
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')), null, { timeout: 10000 });
}

async function openExample(route, example, component) {
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/${route}`);
    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    const demo = page.locator(`.docs-example[aria-labelledby="${example}-heading"] .component-demo[data-demo-component="${component}"]`);
    await demo.waitFor({ timeout: 10000 });
    return demo;
}

async function chooseAutocompleteItem(demo, label, value) {
    const combo = demo.getByRole('combobox', { name: label, exact: true });
    await combo.fill(String(value));
    const listbox = demo.getByRole('listbox').last();
    await listbox.waitFor({ state: 'visible', timeout: 10000 });
    await listbox.getByRole('option', { name: String(value), exact: true }).click();
    await listbox.waitFor({ state: 'hidden', timeout: 10000 });
}

async function assertNoHorizontalOverflow(context) {
    const size = await page.evaluate(() => ({ viewport: innerWidth, root: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(size.root <= size.viewport + 1 && size.body <= size.viewport + 1, `${context}: horizontal overflow ${JSON.stringify(size)}`);
}

async function capture(name, expectedSize) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.waitForTimeout(120);
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), contentSize: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    const size = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    assert.deepEqual(captured.contentSize, [expectedSize.width, expectedSize.height], `${name} native content size`);
    assert.deepEqual(size, expectedSize, `${name} native PNG size`);
    await writeFile(path.join(evidence, `${name}.png`), png);
}

async function waitForScroll(view, axis, before, context) {
    const handle = await view.elementHandle();
    await page.waitForFunction(({ node, property, previous }) => Math.abs(node[property] - previous) > 1, { node: handle, property: axis, previous: before }, { timeout: 10000 });
    const after = await view.evaluate((element, property) => element[property], axis);
    assert.ok(Math.abs(after - before) > 1, `${context}: scroll position changed (${before} → ${after})`);
    return after;
}

async function waitForCenteredItem(view, item, context) {
    const viewHandle = await view.elementHandle();
    const itemHandle = await item.elementHandle();
    await page.waitForFunction(({ viewNode, itemNode }) => {
        if (!viewNode || !itemNode) return false;
        const a = viewNode.getBoundingClientRect();
        const b = itemNode.getBoundingClientRect();
        return Math.abs((b.left + b.right) / 2 - (a.left + a.right) / 2) <= 8;
    }, { viewNode: viewHandle, itemNode: itemHandle }, { timeout: 10000 });
    const delta = await page.evaluate(({ viewNode, itemNode }) => {
        const a = viewNode.getBoundingClientRect();
        const b = itemNode.getBoundingClientRect();
        return Math.abs((b.left + b.right) / 2 - (a.left + a.right) / 2);
    }, { viewNode: viewHandle, itemNode: itemHandle });
    assert.ok(delta <= 8, `${context}: active item center is ${delta.toFixed(2)}px from viewport center`);
}

async function assertItemWithinViewport(view, item, context) {
    const rects = await page.evaluate(({ viewNode, itemNode }) => {
        const a = viewNode.getBoundingClientRect();
        const b = itemNode.getBoundingClientRect();
        return { left: b.left, right: b.right, viewportLeft: a.left, viewportRight: a.right };
    }, { viewNode: await view.elementHandle(), itemNode: await item.elementHandle() });
    assert.ok(rects.left >= rects.viewportLeft - 1 && rects.right <= rects.viewportRight + 1, `${context}: last item is clipped at the scroll boundary ${JSON.stringify(rects)}`);
}

async function assertQueuePending(demo, count, context) {
    await page.waitForFunction(expected => document.querySelector('.component-demo[data-demo-component="USnackbarQueue"] > output')?.textContent.startsWith(`等待：${expected}；`), count, { timeout: 10000 });
    assert.match((await demo.locator(':scope > output').textContent()).trim(), new RegExp(`^等待：${count}；`), context);
}

async function assertDistinctQueueTexts(stack, count, context) {
    const texts = (await stack.locator('.u-notice-text').allTextContents()).map(text => text.trim());
    assert.equal(texts.length, count, `${context}: rendered notice count`);
    assert.ok(texts.every(text => /^消息 \d+：/.test(text)), `${context}: each entry retains its own message text (${JSON.stringify(texts)})`);
    assert.equal(new Set(texts).size, count, `${context}: entries must not repeat one message (${JSON.stringify(texts)})`);
}

try {
    server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
    const previewUrl = `${server.resolvedUrls.local[0]}index.html`;
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${previewUrl}#/code` };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' || message.type() === 'error') consoleDiagnostics.push({ type: message.type(), text: message.text() });
    });

    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    await setWindow(1440, 900);
    await setTheme('light');

    const codeDemo = await openExample('code', 'component-code', 'UCode');
    const inlineCode = codeDemo.locator('code.u-code');
    assert.equal(await inlineCode.count(), 2, 'UCode renders each sample as a native inline code element');
    for (const element of await inlineCode.all()) {
        assert.equal(await element.evaluate(node => node.tagName.toLowerCase()), 'code', 'semantic code element is retained');
        const style = await element.evaluate(node => ({ fontSize: Number.parseFloat(getComputedStyle(node).fontSize), display: getComputedStyle(node).display }));
        assert.ok(style.fontSize >= 15, `inline code remains readable at ${style.fontSize}px`);
        assert.equal(style.display, 'inline', 'inline code does not become a block or alter surrounding prose flow');
    }
    const bodyTextSize = await codeDemo.locator('p').first().evaluate(node => Number.parseFloat(getComputedStyle(node).fontSize));
    assert.ok(bodyTextSize >= 15, `ordinary prose remains readable at ${bodyTextSize}px`);
    await capture('code-1440x900-light', { width: 1440, height: 900 });
    await setWindow(390, 844);
    await assertNoHorizontalOverflow('inline code at 390px');
    await capture('code-390x844-light', { width: 390, height: 844 });
    passed.push('UCode retains native inline semantics and prose/code text meets the 15px minimum without narrow-screen overflow');

    await setWindow(1440, 900);
    const slideDemo = await openExample('slide-group', 'component-slide-group', 'USlideGroup');
    const group = slideDemo.locator('.u-slide-group');
    await group.waitFor({ state: 'visible', timeout: 10000 });
    const viewport = slideDemo.locator('.u-slide-group-viewport');
    const items = slideDemo.locator('[data-u-slide-item]');
    assert.equal(await items.count(), 12, 'all twelve registered slide items render');
    assert.equal(await slideDemo.getByRole('button').count(), 14, 'each item contributes one button, with only the two scroll arrows outside the item list');
    for (const item of await items.all()) assert.equal(await item.evaluate(element => element.matches('button')), true, 'slide item registers the actual action button as its root, without adding a wrapper button');
    const output = slideDemo.locator(':scope > output');
    assert.equal((await output.textContent()).trim(), '当前值："project-1"', 'single-selection model begins on project-1');
    const firstButton = slideDemo.getByRole('button', { name: '项目 1', exact: true });
    const secondButton = slideDemo.getByRole('button', { name: '项目 2', exact: true });
    assert.equal(await firstButton.getAttribute('aria-pressed'), 'true', 'selected slide item exposes aria-pressed=true');
    assert.equal(await secondButton.getAttribute('aria-pressed'), 'false', 'unselected slide item exposes aria-pressed=false');
    assert.equal(await slideDemo.getByRole('button', { name: '项目 5 · 禁用', exact: true }).isDisabled(), true, 'fifth item is disabled');
    const previousArrow = slideDemo.getByRole('button', { name: '向前滚动', exact: true });
    const nextArrow = slideDemo.getByRole('button', { name: '向后滚动', exact: true });
    assert.equal(await previousArrow.isDisabled(), true, 'back arrow is disabled at the initial boundary');
    assert.equal(await nextArrow.isDisabled(), false, 'forward arrow is available while content overflows');
    const initialLeft = await viewport.evaluate(element => element.scrollLeft);
    await nextArrow.click();
    const advancedLeft = await waitForScroll(viewport, 'scrollLeft', initialLeft, 'horizontal forward arrow');
    assert.equal(await previousArrow.isDisabled(), false, 'back arrow enables after moving into the content');
    await previousArrow.click();
    await page.waitForFunction(({ node, initial }) => Math.abs(node.scrollLeft - initial) <= 2, { node: await viewport.elementHandle(), initial: initialLeft }, { timeout: 10000 });
    assert.ok(advancedLeft > initialLeft, 'arrow movement advances through actual scrollable content');

    await secondButton.click();
    assert.equal((await output.textContent()).trim(), '当前值："project-2"', 'single mode selects a direct item button');
    assert.equal(await secondButton.getAttribute('aria-pressed'), 'true', 'aria-pressed follows the newly selected item');
    assert.equal(await firstButton.getAttribute('aria-pressed'), 'false', 'aria-pressed clears on the previous item');
    await slideDemo.getByRole('checkbox', { name: '多选（最多3项）', exact: true }).check();
    assert.equal((await output.textContent()).trim(), '当前值：["project-2"]', 'switching to multiple selection preserves the active value');
    await slideDemo.getByRole('button', { name: '项目 3', exact: true }).click();
    await slideDemo.getByRole('button', { name: '项目 4', exact: true }).click();
    assert.equal((await output.textContent()).trim(), '当前值：["project-2","project-3","project-4"]', 'multiple mode appends enabled values');
    assert.equal(await secondButton.getAttribute('aria-pressed'), 'true', 'multi-selected items expose aria-pressed=true');
    await slideDemo.getByRole('button', { name: '项目 6', exact: true }).click();
    assert.equal((await output.textContent()).trim(), '当前值：["project-2","project-3","project-4"]', 'max=3 rejects a fourth selected item');
    assert.equal(await slideDemo.getByRole('button', { name: '项目 6', exact: true }).getAttribute('aria-pressed'), 'false');
    await slideDemo.getByRole('button', { name: '项目 2', exact: true }).click();
    await slideDemo.getByRole('button', { name: '项目 3', exact: true }).click();
    assert.equal((await output.textContent()).trim(), '当前值：["project-4"]');
    await slideDemo.getByRole('button', { name: '项目 4', exact: true }).click();
    assert.equal((await output.textContent()).trim(), '当前值：["project-4"]', 'mandatory prevents clearing the final selected item');
    passed.push('slide group maintains selection, enforces the multiple maximum and mandatory rule, skips disabled values, and scroll arrows change the actual viewport');

    await slideDemo.getByRole('checkbox', { name: '多选（最多3项）', exact: true }).uncheck();
    assert.equal((await output.textContent()).trim(), '当前值："project-4"');
    await slideDemo.getByRole('button', { name: '项目 3', exact: true }).click();
    assert.equal((await output.textContent()).trim(), '当前值："project-3"');
    await firstButton.press('ArrowRight');
    assert.equal(await secondButton.evaluate(element => element === document.activeElement), true, 'ArrowRight moves real keyboard focus to the next item');
    assert.equal((await output.textContent()).trim(), '当前值："project-3"', 'manual arrow navigation does not select until activation');
    await page.keyboard.press('Enter');
    assert.equal((await output.textContent()).trim(), '当前值："project-2"', 'Enter activates the keyboard-focused slide item');
    assert.equal(await secondButton.getAttribute('aria-pressed'), 'true', 'keyboard activation updates aria-pressed');
    const projectFour = slideDemo.getByRole('button', { name: '项目 4', exact: true });
    await projectFour.press('ArrowRight');
    const projectSix = slideDemo.getByRole('button', { name: '项目 6', exact: true });
    assert.equal(await projectSix.evaluate(element => element === document.activeElement), true, 'ArrowRight skips the disabled fifth item');
    assert.equal((await output.textContent()).trim(), '当前值："project-2"', 'arrow focus still does not change the selected model');
    await projectSix.click();
    assert.equal(await projectSix.getAttribute('aria-pressed'), 'true', 'pointer activation sets aria-pressed on the chosen item');
    await waitForCenteredItem(viewport, slideDemo.locator('[data-u-slide-item]').nth(5), 'centerActive after selecting a middle item');
    await slideDemo.getByRole('button', { name: '项目 12', exact: true }).click();
    await assertItemWithinViewport(viewport, slideDemo.locator('[data-u-slide-item]').last(), 'last item at the maximum scroll boundary');
    await slideDemo.getByRole('checkbox', { name: '垂直', exact: true }).check();
    assert.equal(await group.evaluate(element => element.classList.contains('is-vertical')), true, 'vertical control switches the group axis');
    if (await nextArrow.isDisabled()) {
        const endTop = await viewport.evaluate(element => element.scrollTop);
        await previousArrow.click();
        await page.waitForFunction(({ node, previous }) => node.scrollTop < previous - 1, { node: await viewport.elementHandle(), previous: endTop }, { timeout: 10000 });
    }
    const initialTop = await viewport.evaluate(element => element.scrollTop);
    await nextArrow.click();
    await waitForScroll(viewport, 'scrollTop', initialTop, 'vertical forward arrow');
    await slideDemo.getByRole('checkbox', { name: '禁用组', exact: true }).check();
    assert.equal(await group.getAttribute('aria-disabled'), 'true', 'disabled group exposes aria-disabled');
    for (const button of await slideDemo.locator('[data-u-slide-item]').all()) assert.equal(await button.isDisabled(), true, 'disabled group disables every item action');
    assert.equal(await nextArrow.isDisabled(), true, 'disabled group disables scrolling controls');
    await capture('slide-group-1440x900-light', { width: 1440, height: 900 });
    passed.push('slide group keyboard focus/activation, disabled-item skipping, active centering, vertical scrolling and group disabled state work');

    const itemDemo = await openExample('slide-group-item', 'component-slide-group-item', 'USlideGroupItem');
    const itemValue = itemDemo.locator(':scope > output');
    const overview = itemDemo.getByRole('button', { name: '概览', exact: true });
    await overview.click();
    await waitForText(itemValue, '当前：概览；状态变化：1', 'standalone item selects from its slot-provided toggle');
    await overview.click();
    await waitForText(itemValue, '当前：未选择；状态变化：2', 'standalone item toggles off when mandatory is not set');
    passed.push('standalone USlideGroupItem exposes selection and can clear its value');

    const toggleDemo = await openExample('btn-toggle', 'component-btn-toggle', 'UBtnToggle');
    const toggleGroup = toggleDemo.getByRole('group', { name: '视图选择', exact: true });
    const summary = toggleDemo.locator(':scope > output').first();
    const overviewToggle = toggleGroup.getByRole('button', { name: '概览', exact: true });
    const detailsToggle = toggleGroup.getByRole('button', { name: '详情', exact: true });
    const settingsToggle = toggleGroup.getByRole('button', { name: '设置', exact: true });
    assert.equal(await overviewToggle.getAttribute('aria-pressed'), 'true', 'button group registers the initial explicit value');
    await overviewToggle.click();
    assert.equal((await summary.textContent()).trim(), '当前："a"', 'mandatory single selection cannot be cleared');
    await detailsToggle.click();
    assert.equal((await summary.textContent()).trim(), '当前："b"', 'direct UButton values select through UBtnToggle');
    await toggleDemo.getByRole('checkbox', { name: '多选', exact: true }).check();
    assert.equal((await summary.textContent()).trim(), '当前：["b"]', 'switching to multiple mode preserves the active value');
    await overviewToggle.click();
    await settingsToggle.click();
    assert.equal((await summary.textContent()).trim(), '当前：["b","a"]', 'multiple mode obeys max=2');
    assert.equal(await settingsToggle.getAttribute('aria-pressed'), 'false', 'max rejection leaves the third button unselected');
    await overviewToggle.click();
    assert.equal((await summary.textContent()).trim(), '当前：["b"]');
    await toggleDemo.getByRole('checkbox', { name: '多选', exact: true }).uncheck();
    await toggleDemo.getByRole('checkbox', { name: '必须选择', exact: true }).uncheck();
    await detailsToggle.click();
    assert.equal((await summary.textContent()).trim(), '当前：', 'non-mandatory single selection can be cancelled');
    assert.equal(await detailsToggle.getAttribute('aria-pressed'), 'false');
    await toggleDemo.getByRole('checkbox', { name: '必须选择', exact: true }).check();
    await settingsToggle.press('Space');
    assert.equal((await summary.textContent()).trim(), '当前："c"', 'Space activates an enabled direct button and updates aria-pressed');
    assert.equal(await settingsToggle.getAttribute('aria-pressed'), 'true');
    await toggleDemo.getByRole('checkbox', { name: '只读', exact: true }).check();
    await overviewToggle.click();
    assert.equal((await summary.textContent()).trim(), '当前："c"', 'readonly prevents pointer selection without disabling the buttons');
    assert.equal(await overviewToggle.isDisabled(), false, 'readonly remains distinct from disabled');
    await settingsToggle.press('Space');
    assert.equal((await summary.textContent()).trim(), '当前："c"', 'readonly also prevents keyboard selection');
    await toggleDemo.getByRole('checkbox', { name: '禁用', exact: true }).check();
    for (const button of await toggleGroup.getByRole('button').all()) assert.equal(await button.isDisabled(), true, 'disabled group disables child buttons');
    passed.push('UBtnToggle binds direct UButtons, supports mandatory/multiple/max/cancel, preserves keyboard Space semantics, distinguishes readonly from disabled, and exposes aria-pressed');
    const indexGroup = toggleDemo.getByRole('group', { name: '索引选择', exact: true });
    const indexOne = indexGroup.getByRole('button', { name: '索引一', exact: true });
    const indexTwo = indexGroup.getByRole('button', { name: '索引二', exact: true });
    assert.equal((await toggleDemo.locator(':scope > output').last().textContent()).trim(), '索引：0', 'omitted values begin at numeric index zero');
    await indexTwo.click();
    assert.equal((await toggleDemo.locator(':scope > output').last().textContent()).trim(), '索引：1', 'omitted button values resolve to their current group index');
    assert.equal(await indexTwo.getAttribute('aria-pressed'), 'true');
    await indexTwo.click();
    assert.equal((await toggleDemo.locator(':scope > output').last().textContent()).trim(), '索引：', 'index group permits clearing because it is not mandatory');
    assert.equal(await indexOne.getAttribute('aria-pressed'), 'false');
    passed.push('UBtnToggle assigns omitted values by item index, preserves numeric zero and permits clearing when non-mandatory');

    await setWindow(1440, 900);
    const snackbarDemo = await openExample('snackbar', 'component-snackbar', 'USnackbar');
    const snackbarOutput = snackbarDemo.locator(':scope > output');
    const showNotice = snackbarDemo.getByRole('button', { name: '显示消息', exact: true });
    const permanent = snackbarDemo.getByRole('checkbox', { name: '持续显示', exact: true });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：false；已关闭：0$/, 'controlled snackbar starts closed');
    await chooseAutocompleteItem(snackbarDemo, '样式', 'outlined');
    await chooseAutocompleteItem(snackbarDemo, '位置', 'top right');
    await snackbarDemo.getByRole('textbox', { name: '主题/CSS颜色', exact: true }).fill('#43785b');
    await permanent.check();
    await showNotice.click();
    let notice = page.locator('.u-notice-placement .u-notice');
    await notice.waitFor({ state: 'visible', timeout: 10000 });
    assert.equal(await notice.getAttribute('data-variant'), 'outlined', 'selected appearance reaches the snackbar');
    assert.equal(await page.locator('.u-notice-placement').getAttribute('data-position'), 'top-right', 'selected location reaches the placement');
    const noticeStyle = await notice.evaluate(element => getComputedStyle(element).borderTopColor);
    assert.equal(noticeStyle, 'rgb(67, 120, 91)', 'custom CSS color is reflected in the outlined notice border');
    assert.equal(await notice.locator('.u-notice-timer').count(), 0, 'persistent timeout does not render a countdown');
    await page.waitForTimeout(650);
    assert.equal(await notice.isVisible(), true, 'persistent snackbar does not close by timeout');
    await capture('snackbar-1440x900-light', { width: 1440, height: 900 });
    await notice.getByRole('button', { name: '关闭', exact: true }).click();
    await notice.waitFor({ state: 'hidden', timeout: 10000 });
    await page.waitForFunction(() => document.querySelector('.component-demo[data-demo-component="USnackbar"] > output')?.textContent.includes('已关闭：1'), null, { timeout: 10000 });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：false；已关闭：1$/, 'action slot closes the controlled model and emits after-leave');
    await showNotice.click();
    notice = page.locator('.u-notice-placement .u-notice');
    await notice.waitFor({ state: 'visible', timeout: 10000 });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：true；已关闭：1$/, 'the controlled notice can reopen after action close');
    await snackbarDemo.getByRole('button', { name: '隐藏消息', exact: true }).click();
    await notice.waitFor({ state: 'hidden', timeout: 10000 });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：false；已关闭：2$/, 'external model control closes the notice');
    passed.push('controlled snackbar applies variant, CSS color and location, stays open when persistent, closes through its action, and reopens/externally hides cleanly');

    await permanent.uncheck();
    const openControl = snackbarDemo.getByRole('button', { name: '显示消息', exact: true });
    await openControl.click();
    notice = page.locator('.u-notice-placement .u-notice');
    await notice.waitFor({ state: 'visible', timeout: 10000 });
    await notice.hover();
    await page.waitForTimeout(3750);
    assert.equal(await notice.isVisible(), true, 'pointer hover pauses the 3500ms timeout');
    await notice.getByRole('button', { name: '关闭', exact: true }).click();
    await notice.waitFor({ state: 'hidden', timeout: 10000 });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：false；已关闭：3$/);
    await openControl.click();
    notice = page.locator('.u-notice-placement .u-notice');
    await notice.waitFor({ state: 'visible', timeout: 10000 });
    await page.mouse.move(1, 1);
    await notice.getByRole('button', { name: '关闭', exact: true }).focus();
    await page.waitForTimeout(3750);
    assert.equal(await notice.isVisible(), true, 'keyboard focus pauses the 3500ms timeout');
    await page.keyboard.press('Tab');
    assert.equal(await notice.getByRole('button', { name: '关闭', exact: true }).evaluate(element => document.activeElement === element), false, 'Tab leaves the snackbar action while the notice remains open');
    await notice.waitFor({ state: 'hidden', timeout: 6000 });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：false；已关闭：4$/);
    await openControl.click();
    notice = page.locator('.u-notice-placement .u-notice');
    await notice.waitFor({ state: 'visible', timeout: 10000 });
    await notice.hover();
    await notice.getByRole('button', { name: '关闭', exact: true }).click();
    await notice.waitFor({ state: 'hidden', timeout: 10000 });
    await openControl.click();
    notice = page.locator('.u-notice-placement .u-notice');
    await notice.waitFor({ state: 'visible', timeout: 10000 });
    await page.mouse.move(1, 1);
    await notice.waitFor({ state: 'hidden', timeout: 6000 });
    assert.match((await snackbarOutput.textContent()).trim(), /^显示：false；已关闭：6$/, 'closing while hovered clears stale pause state before a later reopen');
    passed.push('3500ms snackbar timeout pauses on pointer and keyboard focus, resumes after exit, and stale hover state cannot freeze a later reopen');

    const queueDemo = await openExample('snackbar-queue', 'component-snackbar-queue', 'USnackbarQueue');
    const queueOutput = queueDemo.locator(':scope > output');
    const stack = queueDemo.locator('.u-notice-stack');
    const addThree = queueDemo.getByRole('button', { name: '加入3条消息', exact: true });
    const clearQueue = queueDemo.getByRole('button', { name: '清空队列', exact: true });
    await assertQueuePending(queueDemo, 0, 'queue starts empty');
    await addThree.click();
    await assertQueuePending(queueDemo, 2, 'hold strategy consumes only the first visible item');
    await page.waitForFunction(() => document.querySelector('.u-notice-stack')?.querySelectorAll('.u-notice').length === 1, null, { timeout: 10000 });
    assert.match(await stack.textContent(), /消息 1：/, 'the first queued notice is visible');
    await stack.getByRole('button', { name: '关闭', exact: true }).click();
    await waitForText(stack, '消息 2：', 'closing a held notice advances the FIFO queue');
    await assertQueuePending(queueDemo, 1, 'second item is consumed and the final pending item remains');
    await stack.getByRole('button', { name: '关闭', exact: true }).click();
    await waitForText(stack, '消息 3：', 'the final held notice follows the second');
    await assertQueuePending(queueDemo, 0, 'all three notices have been consumed after advancing');
    await clearQueue.click();
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack .u-notice'), null, { timeout: 10000 });
    passed.push('hold strategy consumes one visible item at a time and advances FIFO as notices are dismissed');

    await chooseAutocompleteItem(queueDemo, '同时显示数量', '2');
    await queueDemo.getByRole('checkbox', { name: '折叠堆叠', exact: true }).check();
    await addThree.click();
    await assertQueuePending(queueDemo, 1, 'totalVisible=2 leaves one item pending');
    await page.waitForFunction(() => document.querySelectorAll('.u-notice-stack .u-notice').length === 2, null, { timeout: 10000 });
    await assertDistinctQueueTexts(stack, 2, 'totalVisible=2 preserves distinct queued entries');
    assert.equal(await stack.evaluate(element => element.classList.contains('is-collapsed')), true, 'collapsed mode is applied while the stack is idle');
    await stack.hover();
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack')?.classList.contains('is-collapsed'), null, { timeout: 10000 });
    assert.equal(await stack.locator('.u-notice-placement').count(), 2, 'hover expands the full visible stack without dropping notices');
    await page.mouse.move(1, 1);
    await page.waitForFunction(() => document.querySelector('.u-notice-stack')?.classList.contains('is-collapsed'), null, { timeout: 10000 });
    await clearQueue.click();
    await assertQueuePending(queueDemo, 0, 'clear resets pending items regardless of the active limit');
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack .u-notice'), null, { timeout: 10000 });
    passed.push('totalVisible=2, collapsed hover expansion and clear preserve visible/pending queue invariants');

    await chooseAutocompleteItem(queueDemo, '同时显示数量', '3');
    await queueDemo.getByRole('checkbox', { name: '折叠堆叠', exact: true }).uncheck();
    await addThree.click();
    await assertQueuePending(queueDemo, 0, 'totalVisible=3 consumes all three items immediately');
    await page.waitForFunction(() => document.querySelectorAll('.u-notice-stack .u-notice').length === 3, null, { timeout: 10000 });
    await assertDistinctQueueTexts(stack, 3, 'totalVisible=3 preserves distinct queued entries');
    assert.equal(await stack.locator('.u-notice-placement').count(), 3, 'totalVisible=3 displays all three notices');
    await capture('snackbar-queue-3-visible-1440x900-light', { width: 1440, height: 900 });
    await clearQueue.click();
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack .u-notice'), null, { timeout: 10000 });
    passed.push('totalVisible=3 displays all three queued notices at once');

    await chooseAutocompleteItem(queueDemo, '同时显示数量', '1');
    await chooseAutocompleteItem(queueDemo, '队列策略', 'overflow');
    await addThree.click();
    await assertQueuePending(queueDemo, 0, 'overflow strategy consumes and resolves all three appended messages');
    await page.waitForFunction(() => document.querySelectorAll('.u-notice-stack .u-notice').length === 1, null, { timeout: 10000 });
    await waitForText(queueOutput, 'overflow, overflow', 'overflow dismisses the oldest active entries');
    assert.match(await stack.textContent(), /消息 12：/, 'overflow keeps the newest item visible');
    await clearQueue.click();
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack .u-notice'), null, { timeout: 10000 });
    passed.push('overflow strategy dismisses oldest notices and preserves only the newest item at a one-notice limit');

    await chooseAutocompleteItem(queueDemo, '队列策略', 'hold');
    await queueDemo.getByRole('button', { name: '异步成功', exact: true }).click();
    await assertQueuePending(queueDemo, 0, 'promise item is consumed from the pending model immediately');
    await waitForText(stack, '正在保存…', 'async success begins in a loading state');
    await waitForText(stack, '保存成功', 'resolved promise replaces the loading notice with its success result');
    await clearQueue.click();
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack .u-notice'), null, { timeout: 10000 });
    await queueDemo.getByRole('button', { name: '异步失败', exact: true }).click();
    await waitForText(stack, '正在保存…', 'async error begins in a loading state');
    await waitForText(stack, '保存失败，请重试', 'rejected promise uses its error result');
    await assertQueuePending(queueDemo, 0, 'async result notices do not reenter the pending model');
    await capture('snackbar-queue-async-error-1440x900-light', { width: 1440, height: 900 });
    await clearQueue.click();
    await page.waitForFunction(() => !document.querySelector('.u-notice-stack .u-notice'), null, { timeout: 10000 });
    passed.push('queue consumes promise messages and renders the declared success/error result without restoring them to pending');
    await setWindow(390, 844);
    await assertNoHorizontalOverflow('snackbar queue at 390px');
    await capture('snackbar-queue-390x844-light', { width: 390, height: 844 });

    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    const runtimeDiagnostics = consoleDiagnostics.filter(item => item.type === 'error' || /vue warn/i.test(item.text));
    assert.deepEqual(runtimeDiagnostics, [], `console errors / Vue warnings: ${JSON.stringify(runtimeDiagnostics)}`);
} catch (error) {
    failure = error;
    if (page) {
        try {
            failureDiagnostics = await page.evaluate(() => {
                const button = [...document.querySelectorAll('.docs-example[aria-labelledby="component-snackbar-queue-heading"] button')]
                    .find(element => element.textContent?.includes('加入3条消息'));
                if (!button) return { missingQueueButton: true };
                const rect = button.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const hit = document.elementFromPoint(x, y);
                return {
                    button: { rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, disabled: button.disabled, text: button.textContent },
                    hit: hit ? { tag: hit.tagName, className: String(hit.className), text: hit.textContent?.slice(0, 100), sameOrChild: hit === button || button.contains(hit) } : null,
                    scroll: { root: document.documentElement.scrollTop, content: document.querySelector('.docs-content-scroll')?.scrollTop },
                    visibleNotices: [...document.querySelectorAll('.u-notice-placement')].map(node => ({ state: node.dataset.state, text: node.textContent?.slice(0, 80) }))
                };
            });
        } catch {}
    }
} finally {
    const report = {
        passed,
        passedCount: passed.length,
        pageErrors,
        consoleDiagnostics,
        failureDiagnostics,
        failure: failure ? { name: failure.name, message: failure.message, stack: failure.stack } : null,
        evidence
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
    if (app) await app.close().catch(() => {});
    if (server) await server.close().catch(() => {});
}

if (failure) throw failure;
console.log(JSON.stringify({ passed, passedCount: passed.length, pageErrors, evidence }, null, 2));
