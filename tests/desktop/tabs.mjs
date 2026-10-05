import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'tabs-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const previewUrl = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${previewUrl}#/tabs` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const passed = [];
page.on('pageerror', error => errors.push(error.message));

async function setWindow(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(size.zoom);
        window.setContentSize(size.width, size.height);
    }, { width, height, zoom });
    await page.waitForFunction(size => Math.abs(innerWidth - Math.round(size.width / size.zoom)) <= 1
        && Math.abs(innerHeight - Math.round(size.height / size.zoom)) <= 1, { width, height, zoom });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const target = theme === 'dark';
    const checked = await toggle.isChecked();
    const current = await page.evaluate(() => document.documentElement.dataset.theme);
    if (checked === target && current !== theme) {
        await toggle.setChecked(!target);
        await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, target ? 'light' : 'dark');
    }
    await toggle.setChecked(target);
    await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme);
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')));
}

async function hoverStyle(tab, unchanged, context) {
    await tab.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 75);
    async function style() {
        return tab.evaluate(async element => {
            await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
            const computed = getComputedStyle(element);
            return { background: computed.backgroundColor, color: computed.color, selected: element.getAttribute('aria-selected') };
        });
    }
    const before = await style();
    await tab.hover();
    assert.equal(await tab.evaluate(element => element.matches(':hover')), true, `${context}: pointer really hovers the tab`);
    const after = await style();
    assert.equal(after.selected, before.selected, `${context}: hovering does not change selection`);
    if (unchanged) assert.deepEqual(after, before, `${context}: active/disabled appearance survives hover`);
    else assert.notEqual(after.background, before.background, `${context}: an inactive enabled tab still has hover feedback`);
}

async function openExample(example) {
    await page.goto(`${previewUrl}#/tabs`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    const demo = page.locator(`.docs-example[aria-labelledby="${example}-heading"] .live-example .tabs-demo`);
    await demo.waitFor();
    return demo;
}

async function capture(name, expectedSize, expectedTheme) {
    const namedTheme = name.match(/-(light|dark)(?:-|$)/)?.[1];
    assert.equal(namedTheme, expectedTheme, `${name} filename theme`);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), expectedTheme, `${name} rendered theme`);
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
    const actual = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    assert.deepEqual(captured.contentSize, [expectedSize.width, expectedSize.height], `${name} window content size`);
    assert.deepEqual(actual, expectedSize, `${name} PNG dimensions`);
    await writeFile(path.join(evidence, `${name}.png`), png);
}

async function assertNoDocumentOverflow(context) {
    const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
    }));
    assert.ok(dimensions.document <= dimensions.viewport + 1, `${context}: document overflow ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.body <= dimensions.viewport + 1, `${context}: body overflow ${JSON.stringify(dimensions)}`);
}

const modelText = demo => demo.locator('.tabs-demo-model');
const outputValue = async demo => (await modelText(demo).textContent()).trim();
async function waitForText(locator, text) {
    const element = await locator.elementHandle();
    await page.waitForFunction(({ element, text }) => element?.textContent.includes(text), { element, text });
}
async function waitForEmptySelection(demo) {
    const element = await demo.elementHandle();
    await page.waitForFunction(demo => {
        if (!demo) return false;
        const tabs = [...demo.querySelectorAll('[role="tab"]')];
        return tabs.every(tab => tab.getAttribute('aria-selected') !== 'true')
            && demo.querySelectorAll('.ui-tab-panel.is-active').length === 0;
    }, element);
    const output = await outputValue(demo);
    assert.match(output, /^选中：(?:null · 类型：object|undefined · 类型：undefined)$/, `empty selection model is explicit: ${output}`);
    assert.equal(await demo.locator('[role="tab"][aria-selected="true"]').count(), 0, 'empty model leaves no selected tab');
    assert.equal(await demo.locator('.ui-tab-panel.is-active').count(), 0, 'empty model leaves no visible panel');
    return output;
}

try {
    await page.locator('.docs-shell').waitFor();
    await setWindow(1440, 900);
    await setTheme('light');

    for (const theme of ['light', 'dark']) {
        await setTheme(theme);
        const card = page.locator('.docs-example[aria-labelledby="tabs-declarative-heading"]');
        const list = card.getByRole('tablist', { name: '声明式标签页', exact: true });
        const active = list.getByRole('tab', { name: '详情', exact: true });
        await active.click();
        await hoverStyle(active, true, `${theme}: declarative selected tab`);
        await hoverStyle(list.getByRole('tab', { name: '概览', exact: true }), false, `${theme}: unselected tab`);
        await hoverStyle(list.getByRole('tab', { name: '尚未启用', exact: true }), true, `${theme}: disabled tab`);
        const exampleTabs = card.locator('.docs-example-tabs');
        await hoverStyle(exampleTabs.getByRole('tab', { name: '交互示例', exact: true }), true, `${theme}: selected preview tab uses library styles`);
        const source = exampleTabs.getByRole('tab', { name: '源码', exact: true });
        await hoverStyle(source, false, `${theme}: inactive source tab`);
        await source.click();
        await hoverStyle(source, true, `${theme}: selected source tab uses library styles`);
        await exampleTabs.getByRole('tab', { name: '交互示例', exact: true }).click();
        const variants = page.locator('.docs-example[aria-labelledby="tabs-shared-variants-heading"]');
        for (const variant of ['default', 'dense', 'ghost', 'square']) {
            const sample = variants.locator(`[data-sample="${variant}"]`);
            await hoverStyle(sample.getByRole('tab', { name: '概览', exact: true }), true, `${theme}: selected ${variant}`);
            await hoverStyle(sample.getByRole('tab', { name: '详情', exact: true }), false, `${theme}: unselected ${variant}`);
        }
        const axisExample = page.locator('.docs-example[aria-labelledby="tabs-variants-heading"]');
        await axisExample.getByRole('checkbox', { name: '垂直布局', exact: true }).check();
        await hoverStyle(axisExample.locator('.live-example [role="tab"][aria-selected="true"]'), true, `${theme}: vertical selected tab`);
        await axisExample.getByRole('checkbox', { name: '垂直布局', exact: true }).uncheck();
        await active.hover();
        await capture(`tabs-selected-hover-1440x900-${theme}`, { width: 1440, height: 900 }, theme);
    }
    passed.push('selected tabs retain background and color on hover across light/dark, both axes and all shared variants; inactive tabs still react, disabled tabs do not, and docs preview/source share the library style');
    await page.reload();
    await page.locator('.docs-shell').waitFor();
    await setTheme('light');

    const declarative = await openExample('tabs-declarative');
    const declarativeTabs = declarative.getByRole('tablist', { name: '声明式标签页', exact: true });
    const overview = declarativeTabs.getByRole('tab', { name: '概览', exact: true });
    const unavailable = declarativeTabs.getByRole('tab', { name: '尚未启用', exact: true });
    const details = declarativeTabs.getByRole('tab', { name: '详情', exact: true });
    assert.equal(await overview.getAttribute('aria-selected'), 'true', 'mandatory defaults to the first enabled declaration');
    assert.equal(await unavailable.isDisabled(), true, 'disabled declarations remain disabled');
    assert.equal(await outputValue(declarative), '选中："overview" · 类型：string');
    for (const tab of [overview, unavailable, details]) {
        const panelId = await tab.getAttribute('aria-controls');
        const panel = declarative.locator(`[id="${panelId}"]`);
        assert.equal(await panel.getAttribute('aria-labelledby'), await tab.getAttribute('id'), `${await tab.textContent()} has a reciprocal tab/panel relationship`);
    }
    await declarative.scrollIntoViewIfNeeded();
    await capture('tabs-declarative-1440x900-light', { width: 1440, height: 900 }, 'light');

    await overview.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await details.evaluate(element => element === document.activeElement), true, 'ArrowRight skips the disabled tab in DOM order');
    assert.equal(await overview.getAttribute('aria-selected'), 'true', 'manual navigation moves focus only');
    await page.keyboard.press('Enter');
    assert.equal(await details.getAttribute('aria-selected'), 'true', 'Enter activates the focused tab');
    assert.equal(await outputValue(declarative), '选中："details" · 类型：string');
    await page.keyboard.press('Home');
    assert.equal(await overview.evaluate(element => element === document.activeElement), true, 'Home moves focus to the first enabled tab');
    assert.equal(await details.getAttribute('aria-selected'), 'true', 'Home does not activate in manual mode');
    await page.keyboard.press('End');
    assert.equal(await details.evaluate(element => element === document.activeElement), true, 'End skips disabled tabs');
    await page.keyboard.press('Space');
    assert.equal(await details.getAttribute('aria-selected'), 'true', 'Space activates the focused tab');
    await overview.focus();
    await page.keyboard.press('Enter');
    assert.equal(await overview.getAttribute('aria-selected'), 'true', 'keyboard activation restores the initial visual state');

    await setTheme('dark');
    await declarative.scrollIntoViewIfNeeded();
    await capture('tabs-declarative-1440x900-dark', { width: 1440, height: 900 }, 'dark');
    await setWindow(390, 844);
    await setTheme('light');
    await assertNoDocumentOverflow('declarative tabs at 390px');
    await declarative.scrollIntoViewIfNeeded();
    await capture('tabs-declarative-390x844-light', { width: 390, height: 844 }, 'light');
    passed.push('declarative Tabs start on the first enabled tab, expose reciprocal panel IDs, skip disabled items, and separate manual keyboard focus from selection');

    const windowDemo = await openExample('tabs-window');
    const windowTabs = windowDemo.getByRole('tablist', { name: '声明式标签页', exact: true });
    const mounts = windowDemo.locator('.tabs-demo-mounts');
    await page.waitForFunction(() => document.querySelector('.tabs-demo-mounts')?.textContent.includes('overview'));
    assert.equal((await mounts.textContent()).replace(/^挂载次数：/, ''), '{"overview":1}', 'only the active window mounts initially');
    assert.equal(await windowTabs.getByRole('tab', { name: '详情', exact: true }).getAttribute('aria-selected'), 'false');
    await windowDemo.getByRole('checkbox', { name: '预先挂载内容', exact: true }).check();
    await page.waitForFunction(() => document.querySelector('.tabs-demo-mounts')?.textContent.includes('details'));
    assert.equal((await mounts.textContent()).replace(/^挂载次数：/, ''), '{"overview":1,"details":1}', 'eager mounts each enabled panel before activation');
    const draft = windowDemo.getByRole('textbox', { name: '面板草稿', exact: true });
    await draft.fill('保留的草稿');
    await windowTabs.getByRole('tab', { name: '详情', exact: true }).click();
    await windowTabs.getByRole('tab', { name: '概览', exact: true }).click();
    assert.equal(await draft.inputValue(), '保留的草稿', 'visited window content remains mounted when hidden');
    await windowDemo.getByRole('checkbox', { name: '方向键自动选择', exact: true }).check();
    const windowOverview = windowTabs.getByRole('tab', { name: '概览', exact: true });
    const windowDetails = windowTabs.getByRole('tab', { name: '详情', exact: true });
    await windowOverview.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await windowDetails.evaluate(element => element === document.activeElement), true, 'automatic mode moves focus');
    assert.equal(await windowDetails.getAttribute('aria-selected'), 'true', 'automatic mode selects on focus');
    await windowDemo.getByRole('checkbox', { name: '禁用标签页', exact: true }).check();
    for (const tab of await windowTabs.getByRole('tab').all()) assert.equal(await tab.isDisabled(), true, 'group disabled disables every tab');
    passed.push('Window lazy/eager mount behavior, draft preservation, automatic activation and group disabled state work through the rendered controls');

    const itemsDemo = await openExample('tabs-items');
    const itemsTabs = itemsDemo.getByRole('tablist', { name: '数组标签页', exact: true });
    const firstItemTab = itemsTabs.getByRole('tab', { name: '常规设置', exact: true });
    const lockedItemTab = itemsTabs.getByRole('tab', { name: '尚未启用', exact: true });
    const runtimeTab = itemsTabs.getByRole('tab', { name: '运行设置', exact: true });
    assert.equal(await firstItemTab.getAttribute('aria-selected'), 'true', 'numeric zero is not mistaken for a missing value');
    assert.equal(await outputValue(itemsDemo), '选中：0 · 类型：number');
    assert.equal(await lockedItemTab.isDisabled(), true);
    await itemsDemo.getByRole('button', { name: '外部选择运行设置', exact: true }).click();
    assert.equal(await runtimeTab.getAttribute('aria-selected'), 'true');
    assert.match(await itemsDemo.getByRole('tabpanel').textContent(), /运行设置 · 模型类型为 number/);
    await itemsDemo.getByRole('checkbox', { name: '移除运行标签', exact: true }).check();
    await waitForText(modelText(itemsDemo), '选中：0');
    assert.equal(await itemsTabs.getByRole('tab', { name: '运行设置', exact: true }).count(), 0, 'removed dynamic tab leaves the DOM');
    assert.equal(await itemsDemo.getByRole('button', { name: '外部选择运行设置', exact: true }).isDisabled(), true);
    assert.equal(await firstItemTab.getAttribute('aria-selected'), 'true', 'forced selection falls back to first enabled item');
    await itemsDemo.getByRole('checkbox', { name: '清空标签列表', exact: true }).check();
    await waitForText(modelText(itemsDemo), '选中：undefined');
    assert.equal(await itemsTabs.getByRole('tab').count(), 0, 'an empty items array renders no declarative fallback tabs');
    assert.equal(await outputValue(itemsDemo), '选中：undefined · 类型：undefined');
    assert.equal(await itemsDemo.getByRole('button', { name: '外部选择运行设置', exact: true }).isDisabled(), true);
    await itemsDemo.getByRole('checkbox', { name: '清空标签列表', exact: true }).uncheck();
    await waitForText(modelText(itemsDemo), '选中：0');
    assert.equal(await itemsTabs.getByRole('tab', { name: '常规设置', exact: true }).getAttribute('aria-selected'), 'true', 'restoring a non-empty array applies the mandatory first item');
    passed.push('array items preserve numeric zero, render matching panels, skip disabled entries, recover after removal, and preserve an empty list/model state');

    const valuesDemo = await openExample('tabs-values');
    const valuesTabs = valuesDemo.getByRole('tablist', { name: '索引标签页', exact: true });
    const indexZero = valuesTabs.getByRole('tab', { name: '第一项', exact: true });
    const disabledIndex = valuesTabs.getByRole('tab', { name: '禁用项', exact: true });
    const indexTwo = valuesTabs.getByRole('tab', { name: '第三项', exact: true });
    assert.equal(await indexZero.getAttribute('aria-selected'), 'true', 'implicit index zero is a valid model');
    assert.equal(await outputValue(valuesDemo), '选中：0 · 类型：number');
    assert.equal(await disabledIndex.isDisabled(), true);
    await indexTwo.click();
    assert.equal(await outputValue(valuesDemo), '选中：2 · 类型：number');
    await valuesDemo.getByRole('checkbox', { name: '允许空选择', exact: true }).check();
    await valuesDemo.getByRole('button', { name: '清空模型', exact: true }).click();
    const emptyModelOutput = await waitForEmptySelection(valuesDemo);
    assert.equal(await valuesTabs.getByRole('tab').evaluateAll(elements => elements.filter(element => element.getAttribute('aria-selected') === 'true').length), 0, 'mandatory=false permits no selected tab');
    await indexZero.click();
    assert.equal(await indexZero.getAttribute('aria-selected'), 'true');
    await indexZero.click();
    await waitForEmptySelection(valuesDemo);
    assert.equal(await indexZero.getAttribute('aria-selected'), 'false', 'clicking the selected tab toggles it off when mandatory=false');
    await indexZero.focus();
    await page.keyboard.press('Space');
    assert.equal(await indexZero.getAttribute('aria-selected'), 'true', 'Space reselects an unselected tab');
    await page.keyboard.press('Space');
    await waitForEmptySelection(valuesDemo);
    assert.equal(await indexZero.getAttribute('aria-selected'), 'false', 'Space toggles off a selected tab when mandatory=false');
    await page.keyboard.press('ArrowRight');
    assert.equal(await indexTwo.evaluate(element => element === document.activeElement), true, 'manual arrow order follows DOM, skipping the disabled tab');
    assert.equal(await indexTwo.getAttribute('aria-selected'), 'false', 'manual focus does not restore a selection');
    await setTheme('light');
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).direction), 'rtl');
    const rtlBoxes = await Promise.all([indexZero.boundingBox(), indexTwo.boundingBox()]);
    assert.ok(rtlBoxes[0].x > rtlBoxes[1].x, 'RTL visual order mirrors DOM order');
    await indexZero.focus();
    await page.keyboard.press('ArrowLeft');
    assert.equal(await indexTwo.evaluate(element => document.activeElement === element && element.matches(':focus-visible')), true, 'RTL ArrowLeft follows DOM order and shows visible keyboard focus');
    await page.keyboard.press('ArrowRight');
    assert.equal(await indexZero.evaluate(element => document.activeElement === element && element.matches(':focus-visible')), true, 'RTL ArrowRight returns along DOM order with visible focus');
    assert.equal(await indexZero.getAttribute('aria-selected'), 'false', 'RTL manual arrows move focus without selecting');
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; });
    passed.push(`implicit numeric indices, mandatory=false deselection (${emptyModelOutput}), disabled skipping and RTL keyboard focus work`);

    const scrollDemo = await openExample('tabs-scroll');
    await setWindow(1440, 900);
    await setTheme('light');
    const scrollRegion = scrollDemo.locator('.tabs-demo-scroll');
    const scrollList = scrollRegion.getByRole('tablist', { name: '可滚动标签页', exact: true });
    const previousArrow = scrollRegion.getByRole('button', { name: '向前滚动标签页', exact: true });
    const nextArrow = scrollRegion.getByRole('button', { name: '向后滚动标签页', exact: true });
    await page.waitForFunction(() => {
        const list = document.querySelector('.tabs-demo-scroll .ui-tabs');
        return list && list.scrollWidth > list.clientWidth;
    });
    assert.ok(await nextArrow.isEnabled(), 'next arrow is available at the start of an overflowing list');
    assert.equal(await previousArrow.isDisabled(), true);
    const modelBeforeArrow = await outputValue(scrollDemo);
    const initialScrollLeft = await scrollList.evaluate(element => element.scrollLeft);
    await nextArrow.click();
    await page.waitForFunction(previous => document.querySelector('.tabs-demo-scroll .ui-tabs')?.scrollLeft > previous, initialScrollLeft);
    assert.equal(await outputValue(scrollDemo), modelBeforeArrow, 'scroll arrows do not change selection');
    assert.equal(await previousArrow.isEnabled(), true, 'back arrow activates after scrolling');
    await scrollDemo.scrollIntoViewIfNeeded();
    await capture('tabs-scroll-horizontal-1440x900-light', { width: 1440, height: 900 }, 'light');

    await page.evaluate(() => { const element = document.querySelector('.tabs-demo-scroll .ui-tabs'); if (element) element.scrollLeft = 0; });
    const centerTab = scrollList.getByRole('tab', { name: '工作区配置 5', exact: true });
    await centerTab.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => {
        const list = document.querySelector('.tabs-demo-scroll .ui-tabs');
        const tab = list?.querySelector('[aria-selected="true"]');
        if (!list || !tab) return false;
        const listBox = list.getBoundingClientRect();
        const tabBox = tab.getBoundingClientRect();
        return Math.abs((tabBox.left + tabBox.right) / 2 - (listBox.left + listBox.right) / 2) < 28;
    });
    const centeredModel = await outputValue(scrollDemo);
    await scrollList.evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await page.waitForFunction(() => document.querySelector('.tabs-demo-scroll .ui-tabs')?.scrollLeft > 0);
    await page.waitForFunction(() => document.querySelector('.tabs-demo-scroll .ui-tabs')?.scrollLeft
        >= document.querySelector('.tabs-demo-scroll .ui-tabs')?.scrollWidth - document.querySelector('.tabs-demo-scroll .ui-tabs')?.clientWidth - 1);
    assert.equal(await nextArrow.isDisabled(), true, 'next arrow disables at the end of the list');
    assert.equal(await previousArrow.isEnabled(), true);
    assert.equal(await outputValue(scrollDemo), centeredModel, 'native list scrolling leaves the selected value unchanged');

    await setTheme('dark');
    await page.evaluate(() => { const element = document.querySelector('.tabs-demo-scroll .ui-tabs'); if (element) element.scrollLeft = 0; });
    await scrollDemo.scrollIntoViewIfNeeded();
    await capture('tabs-scroll-horizontal-1440x900-dark', { width: 1440, height: 900 }, 'dark');

    const direction = scrollDemo.getByRole('combobox', { name: '方向', exact: true });
    const alignment = scrollDemo.getByRole('combobox', { name: '标签对齐', exact: true });
    await direction.selectOption('vertical');
    const verticalShell = scrollRegion.locator('.ui-tabs-shell');
    await page.waitForFunction(() => document.querySelector('.tabs-demo-scroll .ui-tabs-shell')?.getAttribute('data-direction') === 'vertical');
    assert.equal(await scrollList.getAttribute('aria-orientation'), 'vertical');
    assert.equal(await verticalShell.evaluate(element => getComputedStyle(element).height), '220px');
    assert.equal(await scrollList.evaluate(element => getComputedStyle(element).overflowY), 'auto', 'vertical tab list owns its scrolling');
    assert.equal(await scrollList.evaluate(element => getComputedStyle(element).overflowX), 'hidden');
    await assertNoDocumentOverflow('vertical tabs');
    await scrollDemo.scrollIntoViewIfNeeded();
    await capture('tabs-scroll-vertical-1440x900-dark', { width: 1440, height: 900 }, 'dark');

    for (const value of ['start', 'center', 'end', 'title']) {
        await alignment.selectOption(value);
        assert.equal(await scrollList.getAttribute('data-align'), value, `${value} alignment is applied`);
    }
    await scrollDemo.getByRole('checkbox', { name: '伸展', exact: true }).check();
    assert.equal(await scrollList.evaluate(element => element.classList.contains('is-grow')), true);
    await scrollDemo.getByRole('checkbox', { name: '等宽上限', exact: true }).check();
    assert.equal(await scrollList.evaluate(element => element.classList.contains('is-fixed')), true);
    const layoutTabs = scrollDemo.getByRole('tablist', { name: '标签布局比较', exact: true });
    assert.ok(await layoutTabs.locator('.ui-tab').evaluateAll(elements => elements.every(element => Number.parseFloat(getComputedStyle(element).maxWidth) <= 300)), 'fixed tabs apply a 300px upper bound');
    await scrollDemo.getByRole('checkbox', { name: '图标在上方', exact: true }).check();
    assert.equal(await layoutTabs.evaluate(element => element.classList.contains('is-stacked')), true);
    await scrollDemo.getByRole('checkbox', { name: '隐藏指示条', exact: true }).check();
    assert.equal(await layoutTabs.locator('.ui-tabs-slider').count(), 0, 'hideSlider removes the decorative slider');
    assert.equal(await scrollList.locator('.ui-tabs-slider').count(), 0);

    await setWindow(390, 844);
    await direction.selectOption('horizontal');
    await scrollDemo.getByRole('checkbox', { name: '伸展', exact: true }).uncheck();
    await scrollDemo.getByRole('checkbox', { name: '等宽上限', exact: true }).uncheck();
    await scrollDemo.getByRole('checkbox', { name: '图标在上方', exact: true }).uncheck();
    await scrollDemo.getByRole('checkbox', { name: '隐藏指示条', exact: true }).uncheck();
    await assertNoDocumentOverflow('horizontal tabs at 390px');
    await setTheme('light');
    await scrollDemo.scrollIntoViewIfNeeded();
    await capture('tabs-scroll-390x844-light', { width: 390, height: 844 }, 'light');
    await setWindow(900, 900, 1.25);
    await setTheme('dark');
    await assertNoDocumentOverflow('125% zoom tabs');
    await scrollDemo.scrollIntoViewIfNeeded();
    await capture('tabs-scroll-900x900-zoom125-dark', { width: 900, height: 900 }, 'dark');
    passed.push('overflow arrows scroll without selecting, centerActive reveals the current tab, vertical lists own scrolling, and all layout flags/alignment modes apply');
} finally {
    await app.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}

assert.deepEqual(errors, [], 'no uncaught renderer errors');
for (const item of passed) console.log(`PASS ${item}`);
console.log(`Evidence: ${evidence}`);
