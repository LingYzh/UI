import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { typography } from '../../src/ui/typography.js';
import { typographyPage } from '../../src/ui/docs/typographyContent.js';

const expectedRoles = [
    ['display-large', 57, 64, 400], ['display-medium', 45, 52, 400], ['display-small', 36, 44, 400],
    ['headline-large', 32, 40, 400], ['headline-medium', 28, 36, 400], ['headline-small', 24, 32, 400],
    ['title-large', 22, 28, 400], ['title-medium', 16, 24, 500], ['title-small', 14, 20, 500],
    ['body-large', 16, 24, 400], ['body-medium', 14, 20, 400], ['body-small', 12, 16, 400],
    ['label-large', 14, 20, 500], ['label-medium', 12, 16, 500], ['label-small', 11, 16, 500]
];
const expectedButtons = [['x-small', 10], ['small', 12], ['default', 14], ['large', 16], ['x-large', 18]];

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'typography-'));
const passed = [];
const pageErrors = [];
const consoleDiagnostics = [];
let server;
let app;
let page;
let failure;

assert.deepEqual(typography.map(role => [role.name, role.size, role.lineHeight, role.weight]), expectedRoles, 'published typography data retains the 15-role scale');

async function setWindow(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.webContents.setZoomFactor(size.zoom);
        window.setContentSize(size.width, size.height);
    }, { width, height, zoom });
    await page.waitForFunction(({ width, zoom }) => Math.abs(innerWidth * zoom - width) <= 2 || zoom === 1 && innerWidth === width, { width, zoom }, { timeout: 10000 });
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

async function openTypography() {
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/typography`);
    await page.locator('.docs-shell').waitFor({ timeout: 10000 });
    const demo = page.locator('.typography-demo');
    await demo.waitFor({ timeout: 10000 });
    return demo;
}

async function positionDemo(demo, where) {
    await demo.evaluate((element, position) => {
        const scroller = element.closest('.docs-content-scroll');
        if (!scroller) throw new Error('Typography demo is not inside the documentation scroll viewport');
        if (position === 'bottom') {
            const input = element.querySelector('input');
            const field = input?.closest('.ui-field') || input?.parentElement;
            const buttonRow = element.querySelector('.d-flex.flex-wrap.ga-2');
            if (!field || !buttonRow) throw new Error('Typography bottom controls were not found');
            const viewportTop = scroller.getBoundingClientRect().top + scroller.clientTop;
            scroller.scrollTop += buttonRow.getBoundingClientRect().top - viewportTop - 250;
        } else {
            const demoRect = element.getBoundingClientRect();
            const viewportTop = scroller.getBoundingClientRect().top + scroller.clientTop;
            scroller.scrollTop += demoRect.top - viewportTop - 64;
        }
    }, where);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function assertBottomControlsVisible(demo, context) {
    const measurements = await demo.evaluate(element => {
        const scroller = element.closest('.docs-content-scroll');
        const input = element.querySelector('input');
        const field = input?.closest('.ui-field') || input?.parentElement;
        const buttonRow = element.querySelector('.d-flex.flex-wrap.ga-2');
        const viewport = scroller.getBoundingClientRect();
        const top = viewport.top + scroller.clientTop;
        const bottom = top + scroller.clientHeight;
        const rect = target => {
            const box = target.getBoundingClientRect();
            return { top: box.top, bottom: box.bottom };
        };
        return { top, bottom, field: rect(field), buttons: rect(buttonRow) };
    });
    for (const [name, rect] of [['input field', measurements.field], ['button row', measurements.buttons]]) {
        assert.ok(rect.top >= measurements.top - 1, `${context}: ${name} starts inside the content viewport: ${JSON.stringify(measurements)}`);
        assert.ok(rect.bottom <= measurements.bottom + 1, `${context}: ${name} ends inside the content viewport: ${JSON.stringify(measurements)}`);
    }
}

async function measureRoles(demo) {
    return demo.evaluate(element => [...element.querySelectorAll('[data-font-role]')].map(row => {
        const sample = row.querySelector('div');
        const style = getComputedStyle(sample);
        return {
            name: row.dataset.fontRole,
            fontSize: Number.parseFloat(style.fontSize),
            lineHeight: Number.parseFloat(style.lineHeight),
            weight: Number.parseInt(style.fontWeight, 10)
        };
    }));
}

function assertRoleMeasurements(actual, context) {
    assert.equal(actual.length, 15, `${context}: all 15 role samples render`);
    for (const [name, fontSize, lineHeight, weight] of expectedRoles) {
        const measured = actual.find(role => role.name === name);
        assert.ok(measured, `${context}: ${name} is rendered`);
        assert.equal(measured.fontSize, fontSize, `${context}: ${name} font size`);
        assert.equal(measured.lineHeight, lineHeight, `${context}: ${name} line height`);
        assert.equal(measured.weight, weight, `${context}: ${name} font weight`);
    }
}

async function assertRootFont() {
    const fontSize = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
    assert.equal(fontSize, 16, 'document root remains 16px');
}

async function capture(name, width, height) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        return { png: (await window.webContents.capturePage()).toPNG().toString('base64'), contentSize: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    await writeFile(path.join(evidence, name), png);
    const result = { width: png.readUInt32BE(16), height: png.readUInt32BE(20), contentSize: captured.contentSize };
    assert.deepEqual(result, { width, height, contentSize: [width, height] }, `${name} is a complete native window screenshot`);
}

try {
    server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile') };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    env.UAH_UI_PREVIEW_URL = `${server.resolvedUrls.local[0]}index.html#/typography`;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' || message.type() === 'error') consoleDiagnostics.push({ type: message.type(), text: message.text() });
    });

    const demo = await openTypography();
    assert.equal(typographyPage.apiKind, 'utilities', 'typography documentation describes utility classes, not a component prop API');
    assert.equal(typographyPage.props.length, 15, 'metadata includes all 15 typography utility classes');
    const utilityHeading = page.getByRole('heading', { name: '工具类', exact: true });
    await utilityHeading.waitFor({ timeout: 10000 });
    const utilityRows = utilityHeading.locator('xpath=..').locator('.docs-api-table tbody tr');
    assert.equal(await utilityRows.count(), 15, 'the rendered utility table contains all 15 reference rows');
    assert.equal(await page.getByRole('heading', { name: 'Props', exact: true }).count(), 0, 'utility guide omits an empty Props block');
    assert.equal(await page.getByRole('heading', { name: 'Emits', exact: true }).count(), 0, 'utility guide omits an empty Emits block');
    assert.equal(await page.locator('.docs-api-empty').count(), 0, 'utility guide contains no empty API placeholders');
    await setWindow(1440, 900);
    await setTheme('light');
    await assertRootFont();
    assertRoleMeasurements(await measureRoles(demo), 'wide light');
    const responsive = demo.locator('[data-font-responsive]');
    assert.equal(await responsive.evaluate(element => getComputedStyle(element).fontSize), '22px', 'responsive title role grows to 22px on wide viewports');

    const input = demo.getByRole('textbox', { name: '表单标签 16px', exact: true });
    assert.equal(await input.evaluate(element => getComputedStyle(element).fontSize), '16px', 'text input uses 16px body text');
    assert.equal(await demo.locator('.ui-field-label').evaluate(element => getComputedStyle(element).fontSize), '16px', 'form label uses 16px body text');
    const hint = demo.getByText('辅助说明 12px', { exact: true });
    assert.equal(await hint.evaluate(element => getComputedStyle(element).fontSize), '12px', 'persistent hint uses 12px helper text');
    for (const [name, size] of expectedButtons) {
        const button = demo.getByRole('button', { name, exact: true });
        assert.equal(await button.evaluate(element => getComputedStyle(element).fontSize), `${size}px`, `${name} button uses ${size}px type`);
    }
    await positionDemo(demo, 'top');
    await capture('typography-light-1440-top.png', 1440, 900);
    await setTheme('dark');
    assertRoleMeasurements(await measureRoles(demo), 'wide dark');
    await positionDemo(demo, 'bottom');
    await assertBottomControlsVisible(demo, 'dark 1440 bottom');
    await capture('typography-dark-1440-bottom.png', 1440, 900);
    passed.push('15 typography roles match their font-size/line-height/weight contracts; wide responsive role is 22px, labels/input/hint and five button sizes match');

    await setWindow(390, 844);
    await setTheme('light');
    await assertRootFont();
    assertRoleMeasurements(await measureRoles(demo), 'narrow light');
    assert.equal(await responsive.evaluate(element => getComputedStyle(element).fontSize), '16px', 'responsive role falls back to 16px below the sm breakpoint');
    await positionDemo(demo, 'top');
    await capture('typography-light-390-top.png', 390, 844);
    await setTheme('dark');
    assertRoleMeasurements(await measureRoles(demo), 'narrow dark');
    await positionDemo(demo, 'bottom');
    await assertBottomControlsVisible(demo, 'dark 390 bottom');
    await capture('typography-dark-390-bottom.png', 390, 844);
    passed.push('narrow viewports retain all type roles, switch the responsive sample to 16px, and render in both themes');

    await setWindow(900, 700, 1.25);
    await setTheme('light');
    await assertRootFont();
    const zoomMetrics = await app.evaluate(({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        return { zoom: window.webContents.getZoomFactor(), size: window.getContentSize() };
    });
    assert.equal(zoomMetrics.zoom, 1.25, 'Electron applies real 125% page zoom');
    assert.deepEqual(zoomMetrics.size, [900, 700], '125% zoom retains the native window content size');
    const zoomTitle = await responsive.evaluate(element => ({ fontSize: getComputedStyle(element).fontSize, innerWidth }));
    assert.equal(zoomTitle.fontSize, '22px', `125% zoom keeps responsive type based on the 720px CSS viewport: ${JSON.stringify(zoomTitle)}`);
    assert.equal(await demo.getByRole('button', { name: 'default', exact: true }).evaluate(element => getComputedStyle(element).fontSize), '14px');
    await positionDemo(demo, 'bottom');
    await assertBottomControlsVisible(demo, '125% zoom bottom');
    await capture('typography-zoom125-900x700.png', 900, 700);
    passed.push('real 125% Electron zoom preserves the 16px CSS root, responsive title role, button type and full native capture');

    await page.goto(`${server.resolvedUrls.local[0]}index.html#/data-table`);
    const tableDemo = page.locator('.component-demo[data-demo-component="UDataTable"]');
    await tableDemo.waitFor({ timeout: 10000 });
    const table = tableDemo.locator('.u-data-table table');
    await table.waitFor({ timeout: 10000 });
    assert.equal(await table.evaluate(element => getComputedStyle(element).fontSize), '14px', 'data-table uses 14px text');
    passed.push('UDataTable body typography computes to 14px; Typography guide renders 15 utility rows without empty Props/Emits blocks');

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
