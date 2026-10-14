import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// Focused source-demo regression: requires a running docs server, never builds the library.
const base = process.env.UI_DOCS_URL || 'http://127.0.0.1:5174/';
const channel = process.env.UI_QA_BROWSER || (process.platform === 'win32' ? 'msedge' : 'chromium');
const browser = await chromium.launch(channel === 'chromium' ? { headless: true } : { headless: true, channel });
const output = new URL('../../.Codex/evidence/drawer-2026-10-12/', import.meta.url);
const results = [];
const errors = [];
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(8000);
    page.on('pageerror', (error) => errors.push(error.message));
    await mkdir(output, { recursive: true });
    await page.goto(new URL('#/drawer', base).href);
    const trigger = page.getByRole('button', { name: '打开详情抽屉', exact: true });
    const panel = page.getByRole('dialog');
    const close = page.getByRole('button', { name: '关闭详情抽屉', exact: true });
    async function waitClosed() {
        await page.waitForFunction(() => !document.querySelector('.ui-drawer[open]'));
    }
    async function triggerHasFocus() {
        await page.waitForFunction(() => document.activeElement?.textContent?.trim() === '打开详情抽屉');
    }
    await trigger.click();
    await panel.waitFor();
    const desktop = await panel.boundingBox();
    assert.equal(desktop.x + desktop.width, 1440);
    assert.equal(desktop.height, 1000);
    assert.equal(await panel.getAttribute('aria-modal'), 'true');
    await panel.screenshot({ path: new URL('desktop.png', output).pathname.replace(/^\/([A-Z]:)/i, '$1') });
    results.push('desktop edge geometry and modal semantics');

    await close.focus();
    await page.keyboard.press('Tab');
    assert.equal(await panel.evaluate((element) => element.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    await waitClosed();
    await triggerHasFocus();
    results.push('keyboard focus containment and Escape return');

    await trigger.click();
    await close.click();
    await waitClosed();
    await triggerHasFocus();
    results.push('pointer close returns to trigger');

    await page.getByRole('checkbox', { name: '阻止 Esc 和遮罩关闭', exact: true }).check();
    await trigger.click();
    await page.keyboard.press('Escape');
    assert.equal(await panel.count(), 1);
    await page.mouse.click(20, 500);
    assert.equal(await panel.count(), 1);
    await close.click();
    await waitClosed();
    await page.getByRole('checkbox', { name: '阻止 Esc 和遮罩关闭', exact: true }).uncheck();
    results.push('persistent blocks Escape and scrim, explicit close remains available');

    await trigger.click();
    await page.mouse.click(20, 500);
    await waitClosed();
    await triggerHasFocus();
    results.push('scrim dismissal and trigger return');

    await page.setViewportSize({ width: 390, height: 844 });
    await trigger.click();
    const mobile = await panel.boundingBox();
    assert.equal(mobile.x, 0);
    assert.equal(mobile.width, 390);
    assert.equal(mobile.height, 844);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    await panel.screenshot({ path: new URL('mobile.png', output).pathname.replace(/^\/([A-Z]:)/i, '$1') });
    await close.click();
    await waitClosed();
    results.push('390px panel fits viewport without horizontal overflow');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await trigger.click();
    assert.equal(await panel.evaluate((element) => getComputedStyle(element).animationName), 'ui-drawer-in');
    const scrim = page.locator('.ui-overlay-layer:has(.ui-drawer) > .ui-overlay-scrim');
    await page.waitForFunction(() => {
        const element = document.querySelector('.ui-overlay-layer:has(.ui-drawer) > .ui-overlay-scrim');
        const opacity = element ? Number(getComputedStyle(element).opacity) : 0;
        return opacity > 0 && opacity < 1;
    });
    assert.equal(await scrim.evaluate((element) => element.getAnimations().some((animation) => animation instanceof CSSTransition)), true);
    await page.waitForFunction(() => document.querySelector('.ui-drawer')?.getAttribute('data-state') === 'open');
    await close.click();
    assert.equal(await page.locator('.ui-drawer').evaluate((element) => getComputedStyle(element).animationName), 'ui-drawer-out');
    assert.equal(await scrim.evaluate((element) => element.getAnimations().some((animation) => animation instanceof CSSTransition)), true);
    await waitClosed();
    await triggerHasFocus();
    results.push('panel slide and scrim fade lifecycle with motion enabled');

    assert.deepEqual(errors, []);
    await writeFile(new URL('results.json', output), JSON.stringify({ base, results, errors }, null, 4));
    console.log(JSON.stringify({ passed: results.length, results, errors }, null, 4));
} finally {
    await browser.close();
}
