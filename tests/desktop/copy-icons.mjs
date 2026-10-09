import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mdiCheck, mdiContentCopy } from '@mdi/js';

const tokenText = 'eyJhbGciOiJIUzI1NiJ9.demo.signature';
const emailText = 'alice@example.com';
await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'copy-icons-'));
const passed = [];
const pageErrors = [];
const consoleDiagnostics = [];
let server;
let app;
let page;
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

async function openCopyPage() {
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/copy-button`);
    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    await page.getByRole('heading', { name: /复制按钮/, level: 1 }).waitFor({ timeout: 10000 });
    const card = page.getByRole('region', { name: '行内复制', exact: true });
    await card.waitFor({ timeout: 10000 });
    return {
        card,
        token: card.getByRole('button', { name: '复制 Access Token', exact: true }),
        email: card.getByRole('button', { name: '复制邮箱', exact: true })
    };
}

async function iconState(button) {
    return button.evaluate(element => {
        const wrapper = element.querySelector('.ui-copy-button-icon');
        const svg = wrapper?.querySelector('svg');
        const path = svg?.querySelector('path');
        const buttonRect = element.getBoundingClientRect();
        const svgRect = svg?.getBoundingClientRect();
        const style = svg ? getComputedStyle(svg) : null;
        const wrapperStyle = wrapper ? getComputedStyle(wrapper) : null;
        const intersectionWidth = svgRect ? Math.max(0, Math.min(svgRect.right, buttonRect.right) - Math.max(svgRect.left, buttonRect.left)) : 0;
        const intersectionHeight = svgRect ? Math.max(0, Math.min(svgRect.bottom, buttonRect.bottom) - Math.max(svgRect.top, buttonRect.top)) : 0;
        return {
            path: path?.getAttribute('d') ?? '',
            viewBox: svg?.getAttribute('viewBox') ?? '',
            svgWidth: svgRect?.width ?? 0,
            svgHeight: svgRect?.height ?? 0,
            visibleArea: intersectionWidth * intersectionHeight,
            visibility: style?.visibility ?? 'missing',
            opacity: Number(style?.opacity ?? 0) * Number(wrapperStyle?.opacity ?? 0),
            animationName: wrapperStyle?.animationName ?? 'missing',
            color: getComputedStyle(element).color,
            copied: element.classList.contains('is-copied')
        };
    });
}

async function assertIcon(button, path, context) {
    const handle = await button.elementHandle();
    await page.waitForFunction(element => {
        const icon = element.querySelector('.ui-copy-button-icon');
        return !icon || icon.getAnimations().every(animation => animation.playState === 'finished');
    }, handle, { timeout: 3000 });
    const state = await iconState(button);
    assert.equal(state.path, path, `${context}: SVG path matches the requested MDI icon`);
    assert.equal(state.viewBox, '0 0 24 24', `${context}: MDI viewBox is retained`);
    assert.ok(Math.abs(state.svgWidth - 15) <= 0.5 && Math.abs(state.svgHeight - 15) <= 0.5, `${context}: actual SVG box is 15×15 (${JSON.stringify(state)})`);
    assert.ok(state.visibleArea >= 15 * 15 - 1, `${context}: SVG has its full visible area inside the button (${JSON.stringify(state)})`);
    assert.equal(state.visibility, 'visible');
    assert.ok(state.opacity > 0, `${context}: icon is not transparent`);
    return state;
}

async function waitCopied(button) {
    const handle = await button.elementHandle();
    await page.waitForFunction(element => element.classList.contains('is-copied'), handle, { timeout: 10000 });
}

async function assertCopied(button, announcement, expectedText, context) {
    await waitCopied(button);
    assert.equal(await app.evaluate(({ clipboard }) => clipboard.readText()), expectedText, `${context}: clipboard receives the unabridged source`);
    const wrapper = button.locator('xpath=..');
    const status = wrapper.locator('[role="status"]');
    assert.equal(await status.getAttribute('role'), 'status', `${context}: success is announced through a status region`);
    assert.equal((await status.textContent()).trim(), announcement, `${context}: status region announces success`);
    assert.equal(await button.getAttribute('aria-label'), expectedText === tokenText ? '复制 Access Token' : '复制邮箱', `${context}: accessible button label remains stable`);
    const state = await assertIcon(button, mdiCheck, `${context} success`);
    assert.equal(state.copied, true);
    const colors = await button.evaluate(element => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--green)';
        document.body.append(probe);
        const expectedGreen = getComputedStyle(probe).color;
        probe.remove();
        return { actual: getComputedStyle(element).color, expectedGreen };
    });
    assert.equal(colors.actual, colors.expectedGreen, `${context}: copied state uses the success green`);
    return state;
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

async function waitForReset(button, startedAt, context) {
    const handle = await button.elementHandle();
    await page.waitForFunction(element => !element.classList.contains('is-copied'), handle, { timeout: 3000 });
    const elapsed = Date.now() - startedAt;
    assert.ok(elapsed >= 1350 && elapsed <= 2600, `${context}: icon resets after about 1.6s (elapsed ${elapsed}ms)`);
    assert.equal((await button.locator('xpath=..').locator('[role="status"]').textContent()).trim(), '', `${context}: status clears when success state ends`);
    await assertIcon(button, mdiContentCopy, `${context} reset`);
    return elapsed;
}

async function tabToButton(button, maxTabs = 400) {
    const trace = [];
    for (let index = 1; index <= maxTabs; index += 1) {
        await page.keyboard.press('Tab');
        if (await button.evaluate(element => element === document.activeElement)) return index;
        if (index <= 12 || index % 20 === 0) trace.push(await page.evaluate(() => ({
            tag: document.activeElement?.tagName ?? '',
            role: document.activeElement?.getAttribute('role') ?? '',
            label: document.activeElement?.getAttribute('aria-label') ?? '',
            text: document.activeElement?.textContent?.trim().slice(0, 50) ?? '',
            href: document.activeElement?.getAttribute('href') ?? '',
            id: document.activeElement?.id ?? ''
        })));
    }
    throw new Error(`real Tab navigation did not reach ${await button.getAttribute('aria-label')} within ${maxTabs} presses; trace=${JSON.stringify(trace)}`);
}

try {
    server = await preview({
        build: { outDir: path.resolve('dist/docs') },
        preview: { host: '127.0.0.1', port: 0, strictPort: false }
    });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile') };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    env.UAH_UI_PREVIEW_URL = `${server.resolvedUrls.local[0]}index.html#/copy-button`;
    // Match CSS pixel assertions to Electron content size under Windows display scaling.
    app = await electron.launch({ args: ['--force-device-scale-factor=1', 'tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' || message.type() === 'error') consoleDiagnostics.push({ type: message.type(), text: message.text() });
    });

    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    const { card, token, email } = await openCopyPage();
    await setWindow(1440, 900);
    await setTheme('light');
    const initialToken = await assertIcon(token, mdiContentCopy, 'light idle Access Token');
    assert.equal(initialToken.copied, false);
    await capture('copy-light-before-1440x900.png');

    const normalMotion = await iconState(token);
    assert.equal(normalMotion.animationName, 'ui-copy-in', 'copy icon uses the normal entry animation by default');
    const pointerStarted = Date.now();
    await token.click();
    const copiedTokenState = await assertCopied(token, '已复制', tokenText, 'pointer copy of long Access Token');
    assert.equal(copiedTokenState.animationName, 'ui-copy-in', 'success icon retains its entry animation in normal motion');
    await page.mouse.move(1, 1);
    const tokenWrapper = token.locator('xpath=..');
    await page.waitForFunction(element => !element.querySelector('.ui-tooltip')?.matches(':popover-open'), await tokenWrapper.elementHandle(), { timeout: 10000 });
    const pointerFocus = await page.evaluate(({ button, wrapper }) => ({
        buttonFocused: document.activeElement === button,
        wrapperFocused: document.activeElement === wrapper,
        activeTag: document.activeElement?.tagName ?? ''
    }), { button: await token.elementHandle(), wrapper: await tokenWrapper.elementHandle() });
    assert.equal(pointerFocus.buttonFocused || pointerFocus.wrapperFocused, false, `pointer action does not leave tooltip trigger focused: ${JSON.stringify(pointerFocus)}`);
    await capture('copy-light-success-1440x900.png');
    const pointerResetMs = await waitForReset(token, pointerStarted, 'pointer token copy');
    passed.push(`pointer copy writes the complete token, shows a 15px MDI check and green aria-announced state, releases tooltip focus, then resets in ${pointerResetMs}ms`);

    const emailStarted = Date.now();
    await email.click();
    await assertCopied(email, '已复制', emailText, 'pointer copy of short email');
    await page.mouse.move(1, 1);
    await page.waitForFunction(element => !element.querySelector('.ui-tooltip')?.matches(':popover-open'), await email.locator('xpath=..').elementHandle(), { timeout: 10000 });
    await waitForReset(email, emailStarted, 'pointer email copy');
    passed.push('short email copy uses the same visible MDI success icon and restores the copy icon');

    await setWindow(390, 844);
    await setTheme('dark');
    const tokenDisplay = card.locator('.demo-token');
    const clipped = await tokenDisplay.evaluate(element => ({
        text: element.textContent.trim(),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        textOverflow: getComputedStyle(element).textOverflow
    }));
    assert.equal(clipped.text, tokenText, 'the visually shortened token still has the full original text in the DOM');
    assert.ok(clipped.scrollWidth > clipped.clientWidth, `narrow token is actually clipped in its display row: ${JSON.stringify(clipped)}`);
    assert.equal(clipped.textOverflow, 'ellipsis', 'the long token display uses an ellipsis');
    const darkIdle = await assertIcon(token, mdiContentCopy, 'dark narrow idle Access Token');
    assert.equal(darkIdle.copied, false);
    const narrowBefore = await capture('copy-dark-before-390x844.png');
    assert.deepEqual(narrowBefore, { width: 390, height: 844, contentSize: [390, 844] });

    const narrowStarted = Date.now();
    await token.click();
    await assertCopied(token, '已复制', tokenText, 'dark narrow copy of visually truncated Access Token');
    await page.mouse.move(1, 1);
    await page.waitForFunction(element => !element.querySelector('.ui-tooltip')?.matches(':popover-open'), await token.locator('xpath=..').elementHandle(), { timeout: 10000 });
    const narrowSuccess = await capture('copy-dark-success-390x844.png');
    assert.deepEqual(narrowSuccess, { width: 390, height: 844, contentSize: [390, 844] });
    await waitForReset(token, narrowStarted, 'dark narrow token copy');
    passed.push('390px dark layout visually truncates the token while copying its full value and retaining the 15px MDI icon');

    const { token: keyboardToken } = await openCopyPage();
    await setWindow(1440, 900);
    await setTheme('light');
    const tabCount = await tabToButton(keyboardToken);
    assert.ok(tabCount > 0, `keyboard test reached the copy action through ${tabCount} actual Tab presses`);
    assert.equal(await keyboardToken.evaluate(element => element === document.activeElement), true, 'real Tab navigation focuses the copy button');
    const keyboardWrapper = keyboardToken.locator('xpath=..');
    const tooltip = keyboardWrapper.locator('.ui-tooltip');
    await page.waitForFunction(element => element.matches(':popover-open'), await tooltip.elementHandle(), { timeout: 10000 });
    assert.equal((await tooltip.textContent()).trim(), '复制 Access Token', 'keyboard focus opens the labeled tooltip');
    const keyboardStarted = Date.now();
    await page.keyboard.press('Space');
    const keyboardSuccess = await assertCopied(keyboardToken, '已复制', tokenText, 'keyboard Space copy');
    assert.equal(await keyboardToken.evaluate(element => element === document.activeElement), true, 'keyboard activation retains focus');
    await page.waitForFunction(element => element.matches(':popover-open') && element.textContent === '已复制', await tooltip.elementHandle(), { timeout: 10000 });
    assert.equal(keyboardSuccess.path, mdiCheck);
    await waitForReset(keyboardToken, keyboardStarted, 'keyboard copy');
    passed.push('real Tab and Space activate the copy button, announce the result, keep keyboard focus and show a matching tooltip');

    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await keyboardToken.click();
    await assertCopied(keyboardToken, '已复制', tokenText, 'manual reduced-motion copy');
    const manualReduced = await iconState(keyboardToken);
    assert.equal(manualReduced.animationName, 'none', 'manual reduced motion disables the copy icon animation');
    assert.equal(await keyboardToken.evaluate(element => element === document.activeElement), false, 'the reduced-motion interaction is still a pointer action');
    passed.push('manual reduced motion disables the copy/check icon animation');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'false'; });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await email.click();
    await assertCopied(email, '已复制', emailText, 'system reduced-motion copy');
    assert.equal((await iconState(email)).animationName, 'none', 'system reduced motion disables the icon animation');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('system prefers-reduced-motion also disables the copy icon animation');

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
