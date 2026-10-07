import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pages } from '../../src/ui/docs/content.js';
import { componentApi } from '../../src/ui/docs/apiReference.js';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'toolbar-'));
const passed = [];
const pageErrors = [];
const consoleDiagnostics = [];
let server;
let app;
let page;
let failure;

async function checkContractsAndExamples() {
    const expectedProps = {
        UToolbar: ['density', 'height', 'extensionHeight', 'extended', 'title', 'color', 'image', 'absolute', 'collapse', 'collapsePosition', 'flat', 'floating', 'elevation', 'border', 'rounded', 'location', 'tag', 'theme'],
        UToolbarTitle: ['text', 'tag'],
        UToolbarItems: ['color', 'variant']
    };
    for (const [name, props] of Object.entries(expectedProps)) {
        assert.deepEqual(componentApi[name].props.map(prop => prop.name), props, `${name} API props remain documented`);
    }
    const names = name => componentApi[name].slots.map(slot => slot.name);
    for (const slot of ['image', 'prepend', 'title', 'default', 'actions', 'append', 'extension', 'text']) {
        assert.ok(names('UToolbar').includes(slot), `UToolbar documents the ${slot} slot`);
    }
    assert.deepEqual(names('UToolbarTitle'), ['text', 'default']);
    assert.deepEqual(names('UToolbarItems'), ['default']);
    const fallback = (name, prop) => componentApi[name].props.find(item => item.name === prop)?.declaredDefault?.source;
    assert.equal(fallback('UToolbar', 'density'), "'default'");
    assert.equal(fallback('UToolbar', 'height'), '64');
    assert.equal(fallback('UToolbar', 'extensionHeight'), '48');
    assert.equal(fallback('UToolbar', 'extended'), 'null');
    assert.equal(fallback('UToolbarItems', 'variant'), "'text'");
    assert.equal(fallback('UToolbarTitle', 'tag'), "'div'");

    const demos = [
        ['UToolbar', 'toolbar', 'component-toolbar'],
        ['UToolbarTitle', 'toolbar-title', 'component-toolbar-title'],
        ['UToolbarItems', 'toolbar-items', 'component-toolbar-items']
    ];
    for (const [name, file, exampleId] of demos) {
        const pageData = pages.find(item => item.name === name);
        assert.ok(pageData, `${name} has a documentation page`);
        const example = pageData.examples.find(item => item.id === exampleId);
        assert.ok(example, `${name} page references ${exampleId}`);
        const source = await readFile(path.resolve(`src/ui/docs/component-examples/${file}.vue`), 'utf8');
        assert.equal(example.code, source.replaceAll("'../../index'", "'@lingyzh/ui'"), `${name} displayed source matches its authored Vue demo`);
    }
}

async function setWindow(width, height) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(1);
        window.setContentSize(size.width, size.height);
    }, { width, height });
    await page.waitForFunction(({ width, height }) => innerWidth === width && innerHeight === height, { width, height }, { timeout: 10000 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setTheme(theme) {
    const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const checked = theme === 'dark';
    if (await toggle.isChecked() !== checked) await toggle.setChecked(checked);
    await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme, { timeout: 10000 });
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')), null, { timeout: 10000 });
    await page.waitForTimeout(180);
}

async function openPage(route, component) {
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/${route}`);
    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    const demo = page.locator(`.component-demo[data-demo-component="${component}"]`);
    await demo.waitFor({ timeout: 10000 });
    await demo.evaluate(element => {
        const scroller = element.closest('.docs-content-scroll');
        if (!scroller) throw new Error('Toolbar demo is not inside the documentation scroll viewport');
        const demoRect = element.getBoundingClientRect();
        const scrollRect = scroller.getBoundingClientRect();
        scroller.scrollTop += demoRect.top - scrollRect.top - 80;
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return demo;
}

async function settle() {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.waitForTimeout(100);
}

async function positionInDocs(target, top = 100) {
    await target.evaluate((element, desiredTop) => {
        const scroller = element.closest('.docs-content-scroll');
        if (!scroller) throw new Error('Toolbar screenshot target is outside the documentation scroll viewport');
        const targetRect = element.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        scroller.scrollTop += targetRect.top - scrollerRect.top - desiredTop;
    }, top);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function capture(name, expectedWidth, expectedHeight) {
    await settle();
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        const image = await window.webContents.capturePage();
        return { png: image.toPNG().toString('base64'), contentSize: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    await writeFile(path.join(evidence, name), png);
    const result = { width: png.readUInt32BE(16), height: png.readUInt32BE(20), contentSize: captured.contentSize };
    assert.deepEqual(result, { width: expectedWidth, height: expectedHeight, contentSize: [expectedWidth, expectedHeight] }, `${name} is a complete native window capture`);
    return result;
}

async function toolbarMetrics(toolbar) {
    return toolbar.evaluate(element => {
        const content = element.querySelector('.ui-toolbar-content');
        const extension = element.querySelector('.ui-toolbar-extension');
        const collapse = element.querySelector('.ui-collapse');
        return {
            density: element.dataset.density,
            contentHeight: Number.parseFloat(content?.style.height ?? '0'),
            extensionHeight: Number.parseFloat(extension?.style.height ?? '0'),
            toolbarHeight: element.getBoundingClientRect().height,
            collapseHeight: collapse?.getBoundingClientRect().height ?? 0,
            extensionOpen: collapse?.classList.contains('is-open') ?? false,
            extensionInert: collapse?.inert ?? false,
            maxWidth: Number.parseFloat(getComputedStyle(element).maxWidth),
            titleDisplay: element.querySelector('.ui-toolbar-title') ? getComputedStyle(element.querySelector('.ui-toolbar-title')).display : 'none'
        };
    });
}

async function assertNear(actual, expected, message, tolerance = 0.75) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}px, got ${actual}px`);
}

async function captureMidTransition(wrapper, toggle, opening) {
    const handle = await wrapper.elementHandle();
    await wrapper.evaluate(element => {
        element.dataset.motionProbe = 'waiting';
        element.dataset.motionExpectedOpen = 'false';
        const onRun = event => {
            if (event.propertyName !== 'grid-template-rows') return;
            const transition = element.getAnimations().find(animation => animation.transitionProperty === event.propertyName);
            if (!transition) return;
            element.removeEventListener('transitionrun', onRun);
            transition.pause();
            const duration = Number(transition.effect?.getTiming().duration) || 180;
            transition.currentTime = duration / 2;
            element.dataset.motionProbe = 'paused';
        };
        element.addEventListener('transitionrun', onRun);
    });
    await wrapper.evaluate((element, expectedOpen) => { element.dataset.motionExpectedOpen = String(expectedOpen); }, opening);
    await toggle.click();
    await page.waitForFunction(element => element.dataset.motionProbe === 'paused', handle, { timeout: 3000 });
    const mid = await wrapper.evaluate(element => ({
        height: element.getBoundingClientRect().height,
        opacity: Number(getComputedStyle(element).opacity),
        inert: element.inert,
        open: element.classList.contains('is-open'),
        extent: element.querySelector('.ui-toolbar-extension')?.getBoundingClientRect().height ?? 0
    }));
    assert.ok(mid.height > 1 && mid.height < mid.extent - 1, `toolbar extension has an intermediate height: ${JSON.stringify(mid)}`);
    assert.equal(mid.open, opening, 'open state changes immediately while the height transition runs');
    assert.equal(mid.inert, !opening, 'closed extension becomes inert throughout its exit transition');
    await wrapper.evaluate(async element => {
        const transition = element.getAnimations().find(animation => animation.transitionProperty === 'grid-template-rows' && animation.playState === 'paused');
        if (transition) { transition.play(); await transition.finished; }
    });
    await page.waitForFunction(element => {
        const expectedOpen = element.dataset.motionExpectedOpen === 'true';
        const open = element.classList.contains('is-open');
        const height = element.getBoundingClientRect().height;
        return open === expectedOpen && (expectedOpen ? height > 0 : height < 0.5);
    }, handle, { timeout: 3000 });
    return mid;
}

async function expectedColor(button) {
    return button.evaluate(element => {
        const style = getComputedStyle(element);
        const probe = document.createElement('span');
        probe.style.color = style.getPropertyValue('--ui-button-color').trim();
        probe.style.position = 'fixed';
        probe.style.visibility = 'hidden';
        element.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return { actual: style.color, resolved, variant: [...element.classList].find(name => name.startsWith('ui-button--variant-')), borderRadius: style.borderRadius, height: element.getBoundingClientRect().height };
    });
}

async function buttonVariant(button) {
    return button.evaluate(element => [...element.classList].find(name => name.startsWith('ui-button--variant-')));
}

try {
    await checkContractsAndExamples();
    passed.push('all three Toolbar APIs, documented defaults/slots, and displayed source stay synchronized with the Vue demos');

    server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile') };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    env.UAH_UI_PREVIEW_URL = `${server.resolvedUrls.local[0]}index.html#/toolbar`;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' || message.type() === 'error') consoleDiagnostics.push({ type: message.type(), text: message.text() });
    });

    let demo = await openPage('toolbar', 'UToolbar');
    const toolbar = demo.locator('[data-toolbar="interactive"]');
    const extensionSwitch = demo.getByRole('checkbox', { name: '显示扩展区', exact: true });
    const collapseSwitch = demo.getByRole('checkbox', { name: '折叠工具栏', exact: true });
    const densityGroup = demo.getByRole('group', { name: '工具栏密度', exact: true });

    for (const [density, content, extension] of [
        ['default', 64, 48], ['comfortable', 56, 44], ['compact', 48, 40], ['prominent', 128, 96]
    ]) {
        await densityGroup.getByRole('button', { name: density, exact: true }).click();
        await page.waitForFunction(({ selector, expected }) => document.querySelector(selector)?.dataset.density === expected, { selector: '[data-toolbar="interactive"]', expected: density }, { timeout: 5000 });
        await settle();
        const metrics = await toolbarMetrics(toolbar);
        await assertNear(metrics.contentHeight, content, `${density} content density`);
        await assertNear(metrics.extensionHeight, extension, `${density} extension density`);
        await assertNear(metrics.toolbarHeight, content + extension, `${density} total density`);
    }
    passed.push('default, comfortable, compact and prominent densities produce the documented content/extension/total heights');

    await densityGroup.getByRole('button', { name: 'default', exact: true }).click();
    await settle();
    const custom = demo.locator('[data-toolbar="custom-height"]');
    const customMetrics = await toolbarMetrics(custom);
    await assertNear(customMetrics.contentHeight, 80, 'custom string content height');
    await assertNear(customMetrics.extensionHeight, 32, 'custom string extension height');
    await assertNear(customMetrics.toolbarHeight, 114, 'custom total height including 1px borders');
    assert.equal((await custom.locator('.ui-toolbar-title-placeholder').textContent()).trim(), '标题插槽优先于 title 属性');
    assert.ok(await custom.getByRole('button', { name: '独立样式', exact: true }).evaluate(element => element.classList.contains('ui-button--variant-outlined')));
    assert.ok((await toolbarMetrics(demo.locator('[data-toolbar="floating"]'))).toolbarHeight > 0, 'floating toolbar remains rendered');
    passed.push('explicit 80/32 heights, title slot priority, custom action variant and floating toolbar remain functional');

    const initialColors = await expectedColor(toolbar.getByRole('button', { name: '刷新', exact: true }));
    const lightToolbarColor = await toolbar.evaluate(element => ({
        background: getComputedStyle(element).backgroundColor,
        foreground: getComputedStyle(element).color,
        theme: element.dataset.theme
    }));
    assert.notEqual(lightToolbarColor.background, 'rgba(0, 0, 0, 0)', 'semantic primary fills the toolbar');
    assert.equal(initialColors.actual, lightToolbarColor.foreground, 'button without its own color inherits toolbar foreground');
    assert.equal(initialColors.variant, 'ui-button--variant-text', 'toolbar actions default to the library text variant');
    assert.ok(initialColors.height < 64 && initialColors.height >= 30, `toolbar action retains regular button height: ${JSON.stringify(initialColors)}`);
    assert.notEqual(initialColors.borderRadius, '0px', 'toolbar action keeps library button rounding');
    const beforeAction = (await demo.locator('output').textContent()).trim();
    await toolbar.getByRole('button', { name: '刷新', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UToolbar"] output')?.textContent?.includes('操作 1 次'));
    assert.notEqual((await demo.locator('output').textContent()).trim(), beforeAction, 'toolbar action invokes the example handler');
    const activity = toolbar.getByRole('tab', { name: '活动', exact: true });
    await activity.click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UToolbar"] output')?.textContent?.includes('activity'));
    assert.equal(await activity.getAttribute('aria-selected'), 'true');
    passed.push('primary toolbar uses semantic fill/foreground inheritance, library text button styling, and real action/tab handlers');
    await toolbar.getByRole('tab', { name: '概览', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UToolbar"] output')?.textContent?.includes('overview'));

    await setWindow(1440, 900);
    await setTheme('light');
    await positionInDocs(toolbar, 90);
    await capture('toolbar-light-1440x900.png', 1440, 900);
    await setTheme('dark');
    const darkColor = await toolbar.evaluate(element => ({ background: getComputedStyle(element).backgroundColor, foreground: getComputedStyle(element).color, theme: element.dataset.theme }));
    assert.equal(darkColor.theme, 'dark');
    assert.notEqual(darkColor.background, lightToolbarColor.background, 'semantic primary resolves against the active dark theme');
    assert.equal(await toolbar.getByRole('button', { name: '刷新', exact: true }).evaluate(element => getComputedStyle(element).color), darkColor.foreground);
    await positionInDocs(toolbar, 90);
    await capture('toolbar-dark-1440x900.png', 1440, 900);
    await setWindow(390, 844);
    await setTheme('light');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'narrow Toolbar page does not add document horizontal overflow');
    await positionInDocs(toolbar, 90);
    await capture('toolbar-light-390x844.png', 390, 844);
    await setTheme('dark');
    await positionInDocs(toolbar, 90);
    await capture('toolbar-dark-390x844.png', 390, 844);
    await setWindow(1440, 900);
    await setTheme('light');
    await positionInDocs(demo.locator('[data-toolbar="custom-height"]'), 90);
    await capture('toolbar-custom-80-32-light-1440x900.png', 1440, 900);
    await positionInDocs(demo.locator('[data-toolbar="floating"]'), 90);
    await capture('toolbar-floating-light-1440x900.png', 1440, 900);
    passed.push('native light/dark screenshots cover 1440px and 390px viewports with semantic theme switching');

    await setWindow(1440, 900);
    await setTheme('light');
    demo = await openPage('toolbar', 'UToolbar');
    const interactive = demo.locator('[data-toolbar="interactive"]');
    const extension = interactive.locator('.ui-collapse');
    const extensionControl = demo.getByRole('checkbox', { name: '显示扩展区', exact: true });
    const closingMid = await captureMidTransition(extension, extensionControl, false);
    const closedMetrics = await toolbarMetrics(interactive);
    await assertNear(closedMetrics.toolbarHeight, closedMetrics.contentHeight, 'closed extension contributes no toolbar height');
    assert.equal(closedMetrics.extensionOpen, false);
    assert.equal(closedMetrics.extensionInert, true);
    assert.equal(await interactive.getByRole('tab', { name: '概览', exact: true }).count(), 0, 'collapsed extension tabs leave the accessible tree');
    const openingMid = await captureMidTransition(extension, extensionControl, true);
    const openMetrics = await toolbarMetrics(interactive);
    await assertNear(openMetrics.toolbarHeight, openMetrics.contentHeight + openMetrics.extensionHeight, 'open extension height');
    assert.equal(openMetrics.extensionInert, false);
    assert.equal(await interactive.getByRole('tab', { name: '概览', exact: true }).isVisible(), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reducedDuration = await extension.evaluate(element => getComputedStyle(element).transitionDuration);
    assert.ok(reducedDuration.split(',').every(value => Number.parseFloat(value) === 0), `system reduced motion removes toolbar extension transitions (${reducedDuration})`);
    await extensionControl.click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const reducedClosed = await toolbarMetrics(interactive);
    await assertNear(reducedClosed.collapseHeight, 0, 'reduced-motion extension closes immediately');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await demo.getByRole('checkbox', { name: '折叠工具栏', exact: true }).click();
    await page.waitForFunction(element => element.classList.contains('is-collapsed'), await interactive.elementHandle(), { timeout: 5000 });
    await settle();
    const collapseMetrics = await toolbarMetrics(interactive);
    await assertNear(collapseMetrics.maxWidth, 112, 'collapsed toolbar max width');
    assert.equal(collapseMetrics.titleDisplay, 'none', 'collapsed toolbar hides the title');
    assert.ok(closingMid.height > 0 && openingMid.height > 0, 'both directions exposed a real paused middle frame');
    passed.push('extension expands/collapses through measurable middle frames, becomes inert at close, and honors reduced motion; collapse is 112px');

    const titleDemo = await openPage('toolbar-title', 'UToolbarTitle');
    await setWindow(390, 844);
    const titleToolbar = titleDemo.locator('.ui-toolbar').first();
    const titleText = titleToolbar.locator('.ui-toolbar-title-placeholder');
    const titleGeometry = await titleText.evaluate(element => ({
        text: element.textContent.trim(),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflow: getComputedStyle(element).textOverflow
    }));
    assert.ok(titleGeometry.scrollWidth > titleGeometry.clientWidth, `narrow title is genuinely clipped: ${JSON.stringify(titleGeometry)}`);
    assert.equal(titleGeometry.overflow, 'ellipsis');
    const refreshButton = titleToolbar.getByRole('button', { name: '刷新', exact: true });
    assert.equal(await refreshButton.isVisible(), true, 'title truncation preserves the action button');
    const placement = await titleToolbar.evaluate(element => {
        const outer = element.getBoundingClientRect();
        const action = element.querySelector('.ui-button').getBoundingClientRect();
        return { toolbarRight: outer.right, buttonRight: action.right, buttonWidth: action.width };
    });
    assert.ok(placement.buttonWidth > 0 && placement.buttonRight <= placement.toolbarRight + 1, `trailing action remains inside the narrow toolbar: ${JSON.stringify(placement)}`);
    const customTitle = titleDemo.locator('h3.ui-toolbar-title');
    assert.equal((await customTitle.textContent()).trim(), '自定义标题内容', 'text slot replaces the title prop while tag selects h3');
    await setTheme('light');
    await positionInDocs(titleToolbar, 90);
    await capture('toolbar-title-light-390x844.png', 390, 844);
    await refreshButton.click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UToolbarTitle"] output')?.textContent?.includes('已刷新 1 次'));
    passed.push('narrow title truncates with ellipsis while preserving its action; text slot/tag and refresh event work');

    const itemsDemo = await openPage('toolbar-items', 'UToolbarItems');
    await setWindow(1440, 900);
    await setTheme('light');
    await positionInDocs(itemsDemo.locator('.ui-toolbar').first(), 90);
    await capture('toolbar-items-light-1440x900.png', 1440, 900);
    const itemsToolbar = itemsDemo.locator('.ui-toolbar').first();
    const itemsGroup = itemsDemo.getByRole('group', { name: '操作区样式', exact: true });
    const save = itemsToolbar.getByRole('button', { name: '保存', exact: true });
    const exportButton = itemsToolbar.getByRole('button', { name: '导出', exact: true });
    const remove = itemsToolbar.getByRole('button', { name: '删除', exact: true });
    assert.equal(await buttonVariant(save), 'ui-button--variant-text');
    await itemsGroup.getByRole('button', { name: 'outlined', exact: true }).click();
    assert.equal(await buttonVariant(save), 'ui-button--variant-outlined', 'ToolbarItems variant reaches child buttons');
    assert.equal(await buttonVariant(exportButton), 'ui-button--variant-outlined');
    assert.equal(await buttonVariant(remove), 'ui-button--variant-text', 'explicit child variant overrides ToolbarItems');
    const saveColor = await expectedColor(save);
    const removeColor = await expectedColor(remove);
    assert.equal(saveColor.actual, saveColor.resolved, 'ToolbarItems color defaults resolve on regular child buttons');
    assert.equal(removeColor.actual, removeColor.resolved, 'explicit danger color resolves on the overriding child');
    assert.notEqual(saveColor.actual, removeColor.actual, 'explicit danger color overrides inherited primary');
    assert.ok(saveColor.height >= 30 && saveColor.height < 60, `ToolbarItems actions keep normal button sizing instead of stretching to the bar: ${JSON.stringify(saveColor)}`);
    assert.notEqual(saveColor.borderRadius, '0px', 'ToolbarItems actions keep the library button radius');
    await save.click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UToolbarItems"] output')?.textContent?.includes('已刷新 1 次'));
    const appendToolbar = itemsDemo.locator('.ui-toolbar').nth(1);
    await appendToolbar.getByRole('button', { name: '刷新', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UToolbarItems"] output')?.textContent?.includes('已刷新 2 次'));
    passed.push('ToolbarItems default/overridden variants and colors, ordinary button geometry, and legacy append actions work');

    const productDiagnostics = consoleDiagnostics.filter(item => item.type === 'error' || /\[Vue warn\]|Vue warn|Failed to resolve component|Failed to resolve directive|Property .* (?:was accessed|is not defined)|is not defined on instance/i.test(item.text));
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(productDiagnostics, [], `console errors / Vue warnings: ${JSON.stringify(productDiagnostics)}`);
} catch (error) {
    failure = error;
} finally {
    const report = {
        status: failure ? 'failed' : 'passed',
        passed,
        passedCount: passed.length,
        pageErrors,
        consoleDiagnostics,
        failure: failure ? { name: failure.name, message: failure.message, stack: failure.stack } : null,
        evidence
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
    if (app) await app.close().catch(() => {});
    if (server) await server.close().catch(() => {});
}

if (failure) throw failure;
console.log(JSON.stringify({ passed, passedCount: passed.length, pageErrors, consoleDiagnostics, evidence }, null, 2));
