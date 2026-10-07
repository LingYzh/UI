import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pages } from '../../src/ui/docs/content.js';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'code-source-'));
const passed = [];
const pageErrors = [];
const consoleDiagnostics = [];
let server;
let app;
let page;
let currentRoute = 'startup';
let failure;

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

async function openDoc(id, expectedTitle) {
    currentRoute = id;
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/${id}`);
    const heading = page.locator('.docs-page-heading h1');
    await heading.waitFor({ timeout: 10000 });
    if (expectedTitle) assert.ok((await heading.textContent()).includes(expectedTitle), `route ${id} should show ${expectedTitle}`);
}

async function capture(name) {
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
    await writeFile(path.join(evidence, name), png);
    return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), contentSize: captured.contentSize };
}

try {
    const codeDoc = pages.find(doc => doc.id === 'code-block');
    const heightExample = codeDoc?.examples?.find(example => example.id === 'code-height');
    const appDoc = pages.find(doc => doc.id === 'app');
    const appExample = appDoc?.examples?.find(example => example.id === 'component-app');
    assert.ok(heightExample, 'code-block documentation must include the code-height example');
    assert.ok(appExample?.code, 'the app page must provide the actual component-app source');

    server = await preview({
        build: { outDir: path.resolve('dist/docs') },
        preview: { host: '127.0.0.1', port: 0, strictPort: false }
    });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile') };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    env.UAH_UI_PREVIEW_URL = `${server.resolvedUrls.local[0]}index.html#/code-block`;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => pageErrors.push(`${currentRoute}: ${error.message}`));
    page.on('console', message => {
        if (message.type() === 'warning' || message.type() === 'error') consoleDiagnostics.push({ route: currentRoute, type: message.type(), text: message.text() });
    });

    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    await setWindow(1440, 900);
    await setTheme('light');
    await openDoc('code-block', '代码块');
    const example = page.locator('.docs-example[aria-labelledby="code-height-heading"]');
    await example.waitFor({ timeout: 10000 });
    const unboundedSection = example.locator('[data-code-height="unbounded"]');
    const boundedSection = example.locator('[data-code-height="bounded"]');
    const unboundedBlock = unboundedSection.locator('.ui-code-block');
    const boundedBlock = boundedSection.locator('.ui-code-block');
    const unboundedViewport = unboundedBlock.locator('.ui-scroll-viewport');
    const boundedViewport = boundedBlock.locator('.ui-scroll-viewport');
    const unboundedCode = unboundedBlock.locator('pre code');
    const boundedCode = boundedBlock.locator('pre code');

    await unboundedCode.waitFor({ state: 'visible', timeout: 10000 });
    const fullSource = await unboundedCode.textContent();
    assert.equal(await boundedCode.textContent(), fullSource, 'bounded and unbounded samples show the same complete source');
    const sourceLines = fullSource.trimEnd().split('\n');
    assert.equal(sourceLines.length, 48, `height example should retain all 48 lines, found ${sourceLines.length}`);
    assert.ok(sourceLines.at(-1).includes('末行可见'), 'the sample has a distinct final line for end-of-content checks');

    const unboundedMetrics = await unboundedViewport.evaluate(element => ({
        maxHeight: getComputedStyle(element).maxHeight,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowY: getComputedStyle(element).overflowY,
        overflowX: getComputedStyle(element).overflowX
    }));
    assert.equal(unboundedMetrics.maxHeight, 'none', `default viewport must not retain a maximum height: ${JSON.stringify(unboundedMetrics)}`);
    assert.ok(unboundedMetrics.scrollHeight <= unboundedMetrics.clientHeight + 1, `default code content should expand instead of vertically overflowing: ${JSON.stringify(unboundedMetrics)}`);
    assert.ok(unboundedMetrics.scrollWidth > unboundedMetrics.clientWidth + 1, `long source lines remain horizontally scrollable by default: ${JSON.stringify(unboundedMetrics)}`);
    assert.match(unboundedMetrics.overflowX, /auto|scroll/, 'the default code viewport exposes horizontal scrolling');
    assert.ok(sourceLines[1].length > 100, 'the sample includes a genuinely long source line');
    const boundedMetrics = await boundedViewport.evaluate(element => ({
        maxHeight: getComputedStyle(element).maxHeight,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight
    }));
    assert.equal(boundedMetrics.maxHeight, '240px', `explicit max-height is applied to the scroll viewport: ${JSON.stringify(boundedMetrics)}`);
    assert.ok(boundedMetrics.clientHeight <= 240, `bounded viewport stays within 240px: ${JSON.stringify(boundedMetrics)}`);
    assert.ok(boundedMetrics.scrollHeight > boundedMetrics.clientHeight, 'explicit max-height creates real vertical overflow');
    const boundedHandle = await boundedViewport.elementHandle();
    await boundedViewport.evaluate(element => { element.scrollTop = element.scrollHeight; });
    await page.waitForFunction(element => element.scrollTop >= element.scrollHeight - element.clientHeight - 1, boundedHandle, { timeout: 10000 });
    const endPosition = await page.evaluate(({ viewport, pre }) => {
        const view = viewport.getBoundingClientRect();
        const content = pre.getBoundingClientRect();
        return { top: viewport.scrollTop, max: viewport.scrollHeight - viewport.clientHeight, contentBottom: content.bottom, viewportBottom: view.bottom };
    }, { viewport: boundedHandle, pre: await boundedBlock.locator('pre').elementHandle() });
    assert.ok(endPosition.top >= endPosition.max - 1, `bounded sample reaches its actual scroll end: ${JSON.stringify(endPosition)}`);
    assert.ok(Math.abs(endPosition.contentBottom - endPosition.viewportBottom) <= 3, `final code line reaches the viewport bottom: ${JSON.stringify(endPosition)}`);
    await unboundedSection.locator('h4').scrollIntoViewIfNeeded();
    const wideCapture = await capture('code-height-unbounded-light-1440x900.png');
    assert.deepEqual(wideCapture, { width: 1440, height: 900, contentSize: [1440, 900] }, 'wide native screenshot has the expected full dimensions');
    passed.push('default CodeBlock expands all 48 lines with no vertical overflow or max-height; explicit 240px remains bounded and scrolls to the last line');

    const wrapButton = unboundedBlock.getByRole('button', { name: '自动换行', exact: true });
    const wrapButtonHandle = await wrapButton.elementHandle();
    await wrapButton.click();
    await page.waitForFunction(button => button.getAttribute('aria-pressed') === 'true', wrapButtonHandle, { timeout: 10000 });
    const wrappedMetrics = await unboundedBlock.locator('pre').evaluate(element => ({
        whiteSpace: getComputedStyle(element).whiteSpace,
        overflowWrap: getComputedStyle(element).overflowWrap,
        classWrapped: element.classList.contains('is-wrapped')
    }));
    assert.equal(wrappedMetrics.whiteSpace, 'pre-wrap', 'wrap toggle switches code to pre-wrap');
    assert.equal(wrappedMetrics.overflowWrap, 'anywhere', 'long tokens can wrap without a horizontal page overflow');
    assert.equal(wrappedMetrics.classWrapped, true);
    const wrappedScroll = await unboundedViewport.evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    assert.ok(wrappedScroll.scrollWidth <= wrappedScroll.clientWidth + 1, `wrapped code no longer needs horizontal scrolling: ${JSON.stringify(wrappedScroll)}`);
    await setTheme('dark');
    await setWindow(390, 844);
    await boundedSection.locator('h4').scrollIntoViewIfNeeded();
    const narrowOverflow = await page.evaluate(() => ({ viewport: innerWidth, root: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(narrowOverflow.root <= narrowOverflow.viewport + 1 && narrowOverflow.body <= narrowOverflow.viewport + 1, `bounded code remains inside a narrow viewport: ${JSON.stringify(narrowOverflow)}`);
    const narrowCapture = await capture('code-height-bounded-dark-390x844.png');
    assert.deepEqual(narrowCapture, { width: 390, height: 844, contentSize: [390, 844] }, 'narrow native screenshot has the expected full dimensions');
    passed.push('a genuinely long code line scrolls horizontally by default and wraps when the real toolbar control is activated');

    await openDoc('app', '应用容器');
    await setWindow(1440, 900);
    await setTheme('light');
    const appCard = page.locator('.docs-example[aria-labelledby="component-app-heading"]');
    await appCard.waitFor({ timeout: 10000 });
    await appCard.getByRole('tab', { name: '源码', exact: true }).click();
    const appCode = appCard.locator('.ui-code-block pre code');
    await appCode.waitFor({ state: 'visible', timeout: 10000 });
    const renderedSource = await appCode.textContent();
    assert.equal(renderedSource, appExample.code, 'source tab displays the exact document example code, including whitespace');
    const lines = renderedSource.split('\n');
    const appLine = lines.findIndex(line => /^\s*<u-app>$/.test(line));
    const appBarLine = lines.findIndex(line => /^\s*<u-app-bar\b/.test(line));
    const mainLine = lines.findIndex(line => /^\s*<u-main>/.test(line));
    assert.ok(appLine >= 0 && appBarLine > appLine && mainLine > appBarLine, 'nested layout tags appear in parent-to-child source order');
    const indent = line => line.length - line.trimStart().length;
    assert.equal(indent(appBarLine >= 0 ? lines[appBarLine] : ''), indent(lines[appLine]) + 4, 'u-app-bar is on its own line one nesting level inside u-app');
    assert.equal(indent(lines[mainLine]), indent(lines[appLine]) + 4, 'u-main is a separately indented sibling of u-app-bar');
    const copyButton = appCard.getByRole('button', { name: '复制源码', exact: true });
    await copyButton.click();
    await appCard.getByRole('button', { name: '已复制', exact: true }).waitFor({ timeout: 10000 });
    const copiedSource = (await app.evaluate(({ clipboard }) => clipboard.readText())).replace(/\r\n/g, '\n');
    assert.equal(copiedSource, appExample.code, 'copy writes the exact formatted example text without syntax-highlight markup');
    const appViewport = appCard.locator('.ui-code-block .ui-scroll-viewport');
    assert.equal(await appViewport.evaluate(element => getComputedStyle(element).maxHeight), 'none', 'the app source code block is not capped by the former default 580px limit');
    await appCard.locator('h3').scrollIntoViewIfNeeded();
    const appCapture = await capture('code-source-app-light-1440x900.png');
    assert.deepEqual(appCapture, { width: 1440, height: 900, contentSize: [1440, 900] }, 'app source native screenshot has the expected full dimensions');
    passed.push('app source tab and copy preserve the exact four-space nested source; default code block has no 580px cap and narrow viewport does not overflow');

    const runtimeErrors = consoleDiagnostics.filter(item => item.type === 'error' || /\[Vue warn\]|Vue warn|Failed to resolve component|Failed to resolve directive|Property .* (?:was accessed|is not defined)|is not defined on instance/i.test(item.text));
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(runtimeErrors, [], `console errors / Vue warnings: ${JSON.stringify(runtimeErrors)}`);
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
