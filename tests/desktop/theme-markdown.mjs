import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'theme-markdown-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0 } });
const url = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${url}#/theme` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const passed = [];
page.on('pageerror', error => errors.push(error.message));
const demo = id => page.locator(`.docs-example[aria-labelledby="${id}-heading"] .live-example`);
async function route(id) { await page.goto(`${url}#/${id}`); await page.locator('.docs-page-heading h1').waitFor(); }
async function frames() { await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); }
async function windowSize(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => { const window = BrowserWindow.getAllWindows()[0]; window.webContents.setZoomFactor(size.zoom); window.setContentSize(size.width, size.height); }, { width, height, zoom });
    await page.waitForFunction(size => Math.abs(innerWidth - Math.round(size.width / size.zoom)) <= 1, { width, zoom });
    await frames();
}
async function capture(name, width = 1440, height = 900) {
    const namedTheme = name.match(/-(light|dark)(?:-|$)/)?.[1];
    if (namedTheme) assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), namedTheme, `${name}: actual theme`);
    await page.waitForTimeout(160);
    const captured = await app.evaluate(async ({ BrowserWindow }) => { const window = BrowserWindow.getAllWindows()[0]; const image = await window.webContents.capturePage(); return { png: image.toPNG().toString('base64'), size: window.getContentSize() }; });
    const png = Buffer.from(captured.png, 'base64');
    assert.deepEqual(captured.size, [width, height]);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [width, height]);
    await writeFile(path.join(evidence, `${name}.png`), png);
}
async function color(locator) { return locator.evaluate(element => getComputedStyle(element).color); }
async function centerDelta(locator, scrollerSelector) {
    return locator.evaluate((element, selector) => {
        const scroller = selector === '__document__' ? document.scrollingElement : document.querySelector(selector);
        const bounds = element.getBoundingClientRect();
        const documentScroller = scroller === document.scrollingElement;
        const viewportTop = documentScroller ? 0 : scroller.getBoundingClientRect().top + scroller.clientTop;
        const viewportHeight = documentScroller ? innerHeight : scroller.clientHeight;
        return Math.abs((bounds.top + bounds.bottom) / 2 - (viewportTop + viewportHeight / 2));
    }, scrollerSelector);
}
async function waitCentered(locator, scrollerSelector) {
    const id = await locator.getAttribute('id');
    assert.ok(id, 'footnote destination and reference need stable ids');
    await page.waitForFunction(({ targetId, selector }) => {
        const element = document.getElementById(targetId);
        const scroller = selector === '__document__' ? document.scrollingElement : document.querySelector(selector);
        if (!element || !scroller) return false;
        const bounds = element.getBoundingClientRect();
        const documentScroller = scroller === document.scrollingElement;
        const viewportTop = documentScroller ? 0 : scroller.getBoundingClientRect().top + scroller.clientTop;
        const viewportHeight = documentScroller ? innerHeight : scroller.clientHeight;
        return Math.abs((bounds.top + bounds.bottom) / 2 - (viewportTop + viewportHeight / 2)) < 3;
    }, { targetId: id, selector: scrollerSelector }, { timeout: 10000 });
}
async function layoutSnapshot() {
    return page.evaluate(() => {
        const content = document.querySelector('.docs-content-scroll');
        const sidebar = document.querySelector('.docs-sidebar');
        const header = document.querySelector('.docs-header');
        const rect = header.getBoundingClientRect();
        return {
            contentScrollTop: content?.scrollTop ?? 0,
            sidebarScrollTop: sidebar?.scrollTop ?? 0,
            htmlScrollTop: document.documentElement.scrollTop,
            bodyScrollTop: document.body.scrollTop,
            documentScrollTop: document.scrollingElement?.scrollTop ?? 0,
            windowScrollY: window.scrollY,
            header: { x: rect.x, y: rect.y, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height }
        };
    });
}
async function scrollTop(selector) { return page.locator(selector).evaluate(element => element.scrollTop); }
async function setTheme(theme) {
    const control = page.getByRole('checkbox', { name: '深色主题', exact: true });
    const checked = await control.isChecked();
    if ((theme === 'dark') !== checked) {
        if (theme === 'dark') await control.check(); else await control.uncheck();
    }
    await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme);
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')));
    await frames();
}
async function prepareTargetForPointer(locator, scrollerSelector, label) {
    await locator.evaluate((target, { selector, label }) => {
        const scrollport = document.querySelector(selector);
        const outer = document.querySelector('.docs-content-scroll');
        const header = document.querySelector('.docs-header');
        if (!scrollport || !outer || !header) throw new Error(`${label}: expected documentation scroll containers`);

        if (scrollport !== outer) {
            const safeTop = header.getBoundingClientRect().bottom + 8;
            const safeBottom = innerHeight - 8;
            const bounds = scrollport.getBoundingClientRect();
            if (bounds.top < safeTop) outer.scrollTop += bounds.top - safeTop;
            else if (bounds.bottom > safeBottom) outer.scrollTop += bounds.bottom - safeBottom;
        }

        const bounds = target.getBoundingClientRect();
        const viewport = scrollport.getBoundingClientRect();
        const viewportTop = viewport.top + scrollport.clientTop;
        const viewportBottom = viewportTop + scrollport.clientHeight;
        if (bounds.top < viewportTop) scrollport.scrollTop += bounds.top - viewportTop;
        else if (bounds.bottom > viewportBottom) scrollport.scrollTop += bounds.bottom - viewportBottom;
    }, { selector: scrollerSelector, label });
    await frames();
    const geometry = await locator.evaluate((target, selector) => {
        const scrollport = document.querySelector(selector);
        const outer = document.querySelector('.docs-content-scroll');
        const header = document.querySelector('.docs-header');
        const targetRect = target.getBoundingClientRect();
        const viewportRect = scrollport.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        return {
            target: { left: targetRect.left, right: targetRect.right, top: targetRect.top, bottom: targetRect.bottom },
            viewport: { left: viewportRect.left + scrollport.clientLeft, right: viewportRect.left + scrollport.clientLeft + scrollport.clientWidth, top: viewportRect.top + scrollport.clientTop, bottom: viewportRect.top + scrollport.clientTop + scrollport.clientHeight },
            scrollport: { top: viewportRect.top, bottom: viewportRect.bottom },
            header: { top: headerRect.top, bottom: headerRect.bottom },
            outerScrollTop: outer.scrollTop,
            rootScrollTop: document.scrollingElement?.scrollTop ?? 0,
            windowScrollY: window.scrollY,
            innerWidth,
            innerHeight
        };
    }, scrollerSelector);
    assert.equal(geometry.header.top, 0, `${label}: fixed header remains at the viewport top before pointer input`);
    assert.ok(geometry.target.left >= geometry.viewport.left - 1 && geometry.target.right <= geometry.viewport.right + 1, `${label}: target is visible inside its owning scrollport`);
    assert.ok(geometry.target.top >= geometry.viewport.top - 1 && geometry.target.bottom <= geometry.viewport.bottom + 1, `${label}: target is visible inside its owning scrollport`);
    assert.ok(geometry.target.top >= geometry.header.bottom - 1 && geometry.target.bottom <= geometry.innerHeight + 1, `${label}: target is visible in the window`);
    if (scrollerSelector !== '.docs-content-scroll') {
        assert.ok(geometry.scrollport.top >= geometry.header.bottom - 1 && geometry.scrollport.bottom <= geometry.innerHeight + 1, `${label}: inner reading viewport is fully visible before pointer input`);
    }
    const box = await locator.boundingBox();
    assert.ok(box && box.x >= 0 && box.y >= geometry.header.bottom && box.x + box.width <= geometry.innerWidth && box.y + box.height <= geometry.innerHeight, `${label}: pointer target has an on-screen bounding box`);
    return box;
}
async function jumpToFootnote(markdownDemo, scrollerSelector, { keyboard = false, smooth = false, label = 'footnote' } = {}) {
    const reference = markdownDemo.locator('.footnote-ref a');
    const destination = markdownDemo.locator('.footnotes li');
    assert.equal(await reference.count(), 1, `${label}: exactly one footnote reference`);
    assert.equal(await destination.count(), 1, `${label}: exactly one footnote destination`);
    const pointerBox = await prepareTargetForPointer(reference, scrollerSelector, label);
    if (keyboard) await reference.focus();
    const beforeLayout = await layoutSnapshot();
    const before = await scrollTop(scrollerSelector);
    if (keyboard) await page.keyboard.press('Enter'); else await page.mouse.click(pointerBox.x + pointerBox.width / 2, pointerBox.y + pointerBox.height / 2);
    const early = await scrollTop(scrollerSelector);
    await waitCentered(destination, scrollerSelector);
    const after = await scrollTop(scrollerSelector);
    assert.ok(Math.abs(after - before) > 40, `${label}: the intended scroller moved`);
    if (smooth) {
        assert.ok(after > before + 100, `${label}: destination is below the reference`);
        assert.ok(early < after - 50, `${label}: footnote navigation scrolls smoothly`);
    }
    assert.ok(await centerDelta(destination, scrollerSelector) < 3, `${label}: target centers in its scrollport`);
    assert.equal(await destination.evaluate(element => element === document.activeElement), true, `${label}: focus transfers to destination`);
    await assertScrollIsolation(beforeLayout, scrollerSelector, `${label} forward`);
    return { reference, destination, before, early, after };
}
async function returnFromFootnote(markdownDemo, reference, scrollerSelector, label = 'footnote') {
    const backref = markdownDemo.locator('.footnote-backref');
    const pointerBox = await prepareTargetForPointer(backref, scrollerSelector, `${label} return link`);
    const beforeLayout = await layoutSnapshot();
    const before = await scrollTop(scrollerSelector);
    await page.mouse.click(pointerBox.x + pointerBox.width / 2, pointerBox.y + pointerBox.height / 2);
    await waitCentered(reference, scrollerSelector);
    const after = await scrollTop(scrollerSelector);
    assert.ok(Math.abs(after - before) > 40, `${label}: return scrolls the intended scroller`);
    assert.ok(await centerDelta(reference, scrollerSelector) < 3, `${label}: return target centers in its scrollport`);
    assert.equal(await reference.evaluate(element => element === document.activeElement), true, `${label}: focus returns to reference`);
    await assertScrollIsolation(beforeLayout, scrollerSelector, `${label} return`);
}
async function assertScrollIsolation(before, localSelector, label) {
    const after = await layoutSnapshot();
    assert.deepEqual({
        sidebarScrollTop: after.sidebarScrollTop,
        htmlScrollTop: after.htmlScrollTop,
        bodyScrollTop: after.bodyScrollTop,
        documentScrollTop: after.documentScrollTop,
        windowScrollY: after.windowScrollY,
        header: after.header
    }, {
        sidebarScrollTop: before.sidebarScrollTop,
        htmlScrollTop: before.htmlScrollTop,
        bodyScrollTop: before.bodyScrollTop,
        documentScrollTop: before.documentScrollTop,
        windowScrollY: before.windowScrollY,
        header: before.header
    }, `${label}: sidebar, document, window and fixed header must not move`);
    if (localSelector === '.docs-content-scroll') {
        assert.notEqual(after.contentScrollTop, before.contentScrollTop, `${label}: docs-content-scroll should perform the local scroll`);
    } else {
        assert.equal(after.contentScrollTop, before.contentScrollTop, `${label}: outer docs-content-scroll must stay fixed`);
    }
    return after;
}
try {
    await page.locator('.docs-shell').waitFor();
    await windowSize(1440, 900);
    const global = demo('theme-switch');
    const select = global.getByRole('combobox', { name: '全局主题', exact: true });
    await select.selectOption('dark');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(230, 160, 134)');
    assert.equal(await color(global.locator('.ui-markdown mark')), 'rgb(230, 160, 134)');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--background').trim()), '#262624');
    await select.selectOption('light');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'light');
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(163, 79, 54)');
    passed.push('default light/dark palette and primary Markdown code/mark');
    await capture('theme-light');

    await select.selectOption('ocean');
    await page.waitForTimeout(240);
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(36, 106, 145)');
    assert.equal(await global.locator('.ui-button.primary').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(36, 106, 145)');
    await demo('theme-custom').getByLabel('海蓝主题主色', { exact: true }).fill('#e0b040');
    await frames();
    await page.waitForTimeout(240);
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(224, 176, 64)');
    assert.equal(await color(global.locator('.ui-button.primary')), 'rgb(0, 0, 0)');
    assert.equal(await color(demo('theme-custom').locator('.bg-primary')), 'rgb(0, 0, 0)');
    passed.push('reactive custom primary, filled primary, on-color and color utilities');

    await page.emulateMedia({ colorScheme: 'dark' });
    await select.selectOption('system');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    assert.match(await global.getByRole('status').textContent(), /模式 system · 当前 dark/);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'light');
    assert.match(await global.getByRole('status').textContent(), /模式 system · 当前 light/);
    passed.push('system mode remains selected and follows OS appearance changes');

    assert.equal(await global.getByRole('checkbox', { name: '减少动态效果', exact: true }).isChecked(), false);
    await select.selectOption('dark');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await select.selectOption('light');
    assert.equal(await page.evaluate(() => [...document.head.querySelectorAll('style')].filter(style => style.textContent.includes('@keyframes ui-theme-reveal')).length), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('default theme transition cleanup and reduced-motion bypass');

    const scoped = demo('theme-scoped');
    await scoped.scrollIntoViewIfNeeded();
    const cards = scoped.locator('.theme-demo-scope > .ui-row > .ui-col > .ui-card');
    assert.equal(await color(cards.nth(0).locator('.ui-markdown code')), 'rgb(230, 160, 134)');
    assert.equal(await color(cards.nth(1).locator(':scope > .ui-card-content > .ui-markdown code')), 'rgb(163, 79, 54)');
    assert.equal(await color(scoped.locator('.theme-demo-nested code')), 'rgb(142, 204, 233)');
    await scoped.getByRole('button', { name: '打开继承主题弹窗' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await color(dialog.locator('code')), 'rgb(230, 160, 134)');
    await dialog.getByRole('button', { name: '关闭', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.uiTheme), 'light');
    passed.push('local provider, nested Card override, deeper custom theme and inherited dialog');
    await capture('theme-scoped-light');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).check();
    await capture('theme-scoped-dark');
    await windowSize(390, 844);
    await scoped.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await capture('theme-scoped-dark-mobile', 390, 844);
    await windowSize(1440, 900, 1.25);
    await scoped.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await capture('theme-scoped-dark-zoom');
    passed.push('responsive theme scopes at mobile width and 125% zoom');

    await windowSize(1440, 900);
    const diagrams = demo('theme-diagrams');
    await diagrams.scrollIntoViewIfNeeded();
    await page.waitForFunction(element => element.querySelectorAll('.ui-markdown-diagram-svg svg').length === 2, await diagrams.elementHandle());
    await writeFile(path.join(evidence, 'diagrams.json'), JSON.stringify(await diagrams.locator('.ui-markdown-diagram-svg svg').evaluateAll(elements => elements.map(element => element.outerHTML))));
    const svgColors = await diagrams.locator('.ui-markdown-diagram-svg svg').evaluateAll(elements => elements.map(element => ({ fill: getComputedStyle(element.querySelector('.node rect')).fill, text: element.querySelector('.node text').textContent, unsafe: element.querySelectorAll('foreignObject, script, a').length })));
    assert.deepEqual(svgColors.map(item => item.fill), ['rgb(244, 243, 237)', 'rgb(45, 45, 41)']);
    for (const item of svgColors) { assert.ok(item.text.includes('主题颜色')); assert.equal(item.unsafe, 0); }
    const firstSvg = diagrams.locator('.ui-markdown-diagram-svg svg').first();
    const previousId = await firstSvg.getAttribute('id');
    await demo('theme-custom').getByLabel('海蓝主题主色', { exact: true }).fill('#246a91');
    await page.waitForFunction(({ element, id }) => element.querySelector('.ui-markdown-diagram-svg svg')?.id !== id, { element: await diagrams.elementHandle(), id: previousId });
    await diagrams.scrollIntoViewIfNeeded();
    await capture('theme-diagrams-dark');
    passed.push('parallel scoped Mermaid diagrams use independent palettes, visible SVG labels and reactive theme updates');

    await windowSize(1440, 900);
    await route('markdown');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).uncheck();
    const markdown = demo('markdown-navigation');
    const details = markdown.locator('details');
    const summary = details.locator('summary');
    await summary.scrollIntoViewIfNeeded();
    const closed = await details.evaluate(element => element.getBoundingClientRect().height);
    await summary.click();
    await page.waitForFunction(element => element.getAnimations().length > 0, await details.elementHandle(), { timeout: 10000 });
    const duringOpen = await details.evaluate(element => ({ height: element.getBoundingClientRect().height, end: parseFloat(element.getAnimations()[0].effect.getKeyframes().at(-1).height) }));
    assert.ok(duringOpen.end > closed + 20);
    assert.ok(duringOpen.height < duringOpen.end);
    await page.waitForFunction(element => element.open && element.getAnimations().length === 0, await details.elementHandle(), { timeout: 10000 });
    const open = await details.evaluate(element => element.getBoundingClientRect().height);
    await summary.click();
    await page.waitForFunction(element => element.open && element.getAnimations().length > 0, await details.elementHandle(), { timeout: 10000 });
    assert.ok(await details.evaluate(element => element.getBoundingClientRect().height) > closed);
    await page.waitForFunction(element => !element.open && element.getAnimations().length === 0, await details.elementHandle(), { timeout: 10000 });
    assert.ok(open > closed + 20);
    passed.push('details has real height transitions for opening and closing');
    await summary.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(element => element.open && element.getAnimations().length === 0, await details.elementHandle(), { timeout: 10000 });
    await page.keyboard.press('Space');
    await page.waitForFunction(element => !element.open && element.getAnimations().length === 0, await details.elementHandle(), { timeout: 10000 });
    await summary.evaluate(element => { element.click(); element.click(); element.click(); });
    await page.waitForFunction(element => element.open && element.getAnimations().length === 0, await details.elementHandle(), { timeout: 10000 });
    passed.push('details keyboard activation and rapid reversal retain the final requested state');
    await capture('markdown-navigation-light');

    await markdown.getByRole('checkbox', { name: '减少动态效果', exact: true }).check();
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    assert.equal(await details.evaluate(element => element.open), false);
    assert.equal(await details.evaluate(element => element.getAnimations().length), 0);
    await markdown.getByRole('checkbox', { name: '减少动态效果', exact: true }).uncheck();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    assert.equal(await details.evaluate(element => element.open), true);
    assert.equal(await details.evaluate(element => element.getAnimations().length), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('manual and system reduced motion disable details animations');

    // Reset the docs route after Playwright's native-details scrolling so the
    // footnote checks start with the header at the actual viewport origin.
    await route('markdown');
    await windowSize(1440, 900);
    await setTheme('light');
    const navScrollerSelector = '.docs-example[aria-labelledby="markdown-navigation-heading"] .live-example .ui-scroll-viewport';

    const navigationJump = await jumpToFootnote(markdown, navScrollerSelector, { smooth: true, label: 'markdown-navigation initial' });
    await returnFromFootnote(markdown, navigationJump.reference, navScrollerSelector, 'markdown-navigation initial');
    passed.push('footnote and return smoothly center the destination in the viewport and transfer focus');

    const manualReduceControl = markdown.getByRole('checkbox', { name: '减少动态效果', exact: true });
    let manualReduceBox = await prepareTargetForPointer(manualReduceControl, '.docs-content-scroll', 'manual reduced-motion control');
    await page.mouse.click(manualReduceBox.x + manualReduceBox.width / 2, manualReduceBox.y + manualReduceBox.height / 2);
    assert.equal(await manualReduceControl.isChecked(), true);
    const manualReduceJump = await jumpToFootnote(markdown, navScrollerSelector, { label: 'markdown-navigation manual reduced motion' });
    assert.ok(Math.abs(manualReduceJump.early - manualReduceJump.after) <= 1, 'manual reduced motion jumps without scrolling animation');
    await returnFromFootnote(markdown, manualReduceJump.reference, navScrollerSelector, 'markdown-navigation manual reduced motion');
    manualReduceBox = await prepareTargetForPointer(manualReduceControl, '.docs-content-scroll', 'manual reduced-motion control reset');
    await page.mouse.click(manualReduceBox.x + manualReduceBox.width / 2, manualReduceBox.y + manualReduceBox.height / 2);
    assert.equal(await manualReduceControl.isChecked(), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const systemReduceJump = await jumpToFootnote(markdown, navScrollerSelector, { label: 'markdown-navigation system reduced motion' });
    assert.ok(Math.abs(systemReduceJump.early - systemReduceJump.after) <= 1, 'system reduced motion jumps without scrolling animation');
    await returnFromFootnote(markdown, systemReduceJump.reference, navScrollerSelector, 'markdown-navigation system reduced motion');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('manual and system reduced motion make footnote navigation immediate and keep scroll isolation');

    const viewportCases = [{ suffix: 'wide', width: 1440, height: 900 }, { suffix: '390', width: 390, height: 844 }];
    for (const viewport of viewportCases) {
        await windowSize(viewport.width, viewport.height);
        for (const theme of ['light', 'dark']) {
            await setTheme(theme);
            const jumped = await jumpToFootnote(markdown, navScrollerSelector, { label: `markdown-navigation ${theme} ${viewport.suffix}` });
            await capture(`markdown-navigation-footnote-${theme}-${viewport.suffix}`, viewport.width, viewport.height);
            await returnFromFootnote(markdown, jumped.reference, navScrollerSelector, `markdown-navigation ${theme} ${viewport.suffix}`);
        }
    }
    passed.push('markdown-navigation forward/return isolation and screenshots in light/dark at 1440px and 390px');

    await windowSize(1440, 900);
    await route('markdown');
    const richDemo = demo('markdown-rich');
    const richScrollerSelector = '.docs-content-scroll';
    const richKeyboardJump = await jumpToFootnote(richDemo, richScrollerSelector, { keyboard: true, label: 'markdown-rich Enter' });
    await returnFromFootnote(richDemo, richKeyboardJump.reference, richScrollerSelector, 'markdown-rich Enter');
    passed.push('markdown-rich Enter navigation and return keep the outer page, sidebar and header fixed');

    const currentUrl = page.url();
    const externalLink = richDemo.getByRole('link', { name: 'Markdown 文档', exact: true });
    await externalLink.evaluate(element => element.focus({ preventScroll: true }));
    await page.keyboard.press('Enter');
    await page.getByRole('status').filter({ hasText: '应用收到链接：https://spec.commonmark.org/' }).waitFor();
    assert.equal(page.url(), currentUrl, 'external Markdown links are emitted without browser navigation');
    passed.push('Markdown external link emits link-click without leaving the docs route');

    for (const viewport of viewportCases) {
        await windowSize(viewport.width, viewport.height);
        for (const theme of ['light', 'dark']) {
            await setTheme(theme);
            const jumped = await jumpToFootnote(richDemo, richScrollerSelector, { label: `markdown-rich ${theme} ${viewport.suffix}` });
            await capture(`markdown-rich-footnote-${theme}-${viewport.suffix}`, viewport.width, viewport.height);
            await returnFromFootnote(richDemo, jumped.reference, richScrollerSelector, `markdown-rich ${theme} ${viewport.suffix}`);
        }
    }
    passed.push('markdown-rich forward/return isolation and screenshots in light/dark at 1440px and 390px');

    await route('theme-provider');
    await demo('theme-scoped').waitFor();
    assert.deepEqual(errors, []);
    passed.push('all new component routes render without renderer errors');
    console.log(JSON.stringify({ evidence, passed, errors }, null, 2));
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ evidence, passed, errors }, null, 2));
} catch (error) {
    await writeFile(path.join(evidence, 'failure.json'), JSON.stringify({ error: String(error), passed, errors }, null, 2));
    console.error(`Evidence: ${evidence}`);
    throw error;
} finally { await app.close(); await server.close(); }
