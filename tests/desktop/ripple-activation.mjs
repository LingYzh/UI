import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'ripple-activation-'));
const report = { assertions: 0, checks: [], pageErrors: [] };
let server;
let app;
let page;

function check(description, actual, expected) {
    assert.deepEqual(actual, expected, description);
    report.assertions++;
    report.checks.push(description);
}

function ok(description, condition) {
    assert.ok(condition, description);
    report.assertions++;
    report.checks.push(description);
}

async function waveCount(target) {
    return target.locator('.ui-ripple-wave').count();
}

async function ownWaveCount(target) {
    return target.evaluate((element) => element.querySelectorAll(':scope > .ui-ripple-layer > .ui-ripple-wave').length);
}

async function animationDurations(target) {
    return target.evaluate((element) => element.getAnimations({ subtree: true })
        .map((animation) => animation.effect?.getTiming().duration)
        .filter((duration) => typeof duration === 'number'));
}

async function boxCenter(target, xRatio = .5, yRatio = .5) {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    assert.ok(bounds, 'ripple target has a visible bounding box');
    return { x: bounds.x + bounds.width * xRatio, y: bounds.y + bounds.height * yRatio };
}

async function pointerTap(target, xRatio = .5, yRatio = .5) {
    const point = await boxCenter(target, xRatio, yRatio);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await target.locator('.ui-ripple-wave').first().waitFor({ timeout: 1000 });
    await page.mouse.up();
    return point;
}

async function waitUntilClear(target, description) {
    const handle = await target.elementHandle();
    assert.ok(handle, 'ripple target remains mounted while its waves exit');
    await page.waitForFunction((element) => !element.querySelector('.ui-ripple-layer'), handle, { timeout: 2500 });
    check(description, await waveCount(target), 0);
}

async function quickClickSurvivesFocusBlur(target) {
    const start = Date.now();
    await pointerTap(target, .27, .34);
    await page.waitForTimeout(120);
    ok('quick pointer release and focus blur leave the ripple visible', await waveCount(target) >= 1);
    await page.waitForTimeout(220);
    const opacity = await target.locator('.ui-ripple-wave').first().evaluate((wave) => Number.parseFloat(getComputedStyle(wave).opacity));
    ok('quick ripple remains visible through the minimum display interval', await waveCount(target) >= 1 && opacity > 0);
    await waitUntilClear(target, 'quick pointer ripple eventually completes its exit');
    ok('quick ripple includes entrance, hold, and exit time', Date.now() - start >= 450);
}

try {
    server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'userData'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}index.html#/ripple` };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.on('pageerror', (error) => report.pageErrors.push(error.message));
    await page.getByRole('heading', { name: '涟漪反馈', level: 1 }).waitFor();

    const demo = page.locator('#section-demo');
    const enabled = demo.locator('#ripple-enabled');
    const pointerButton = demo.getByRole('button', { name: '指针位置扩散', exact: true });

    await enabled.check();
    const timingPoint = await boxCenter(pointerButton, .4, .4);
    await page.mouse.move(timingPoint.x, timingPoint.y);
    await page.mouse.down();
    await pointerButton.locator('.ui-ripple-wave').first().waitFor();
    const entranceDurations = await animationDurations(pointerButton);
    ok('mouse expansion uses the specified 250 ms animation', entranceDurations.includes(250));
    ok('mouse opacity entrance uses the specified 100 ms animation', entranceDurations.includes(100));
    await page.mouse.up();
    await waitUntilClear(pointerButton, 'timing sample wave exits');
    await quickClickSurvivesFocusBlur(pointerButton);

    // Two closely spaced taps must coexist in the same layer until each exits.
    const point = await boxCenter(pointerButton, .63, .41);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await pointerButton.locator('.ui-ripple-wave').first().waitFor();
    await page.mouse.up();
    await page.waitForTimeout(70);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await pointerButton.locator('.ui-ripple-wave').nth(1).waitFor({ timeout: 1000 });
    await page.mouse.up();
    check('a second quick click keeps the previous wave and adds another', await waveCount(pointerButton), 2);
    await waitUntilClear(pointerButton, 'overlapping click waves all complete their exits');

    // Repeated Enter/Space keydowns do not stack waves; blur releases a held keyboard wave.
    for (const key of ['Enter', 'Space']) {
        await pointerButton.focus();
        await page.keyboard.down(key);
        await pointerButton.locator('.ui-ripple-wave').first().waitFor();
        await page.keyboard.down(key);
        await page.keyboard.down(key);
        check(`${key} auto-repeat does not create duplicate waves`, await waveCount(pointerButton), 1);
        await pointerButton.evaluate((element) => element.blur());
        await waitUntilClear(pointerButton, `${key} blur releases the held wave`);
        await page.keyboard.up(key);
    }

    // Touch uses the touch pointer path: a short tap is delayed but still receives a full ripple.
    const touchTarget = demo.getByRole('button', { name: '居中扩散', exact: true });
    const touchPoint = await boxCenter(touchTarget, .5, .5);
    await touchTarget.evaluate((target, { x, y }) => {
        target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 71, pointerType: 'touch', isPrimary: true, button: 0, clientX: x, clientY: y }));
    }, touchPoint);
    await page.waitForTimeout(40);
    check('touch ripple respects the delayed start', await waveCount(touchTarget), 0);
    await touchTarget.evaluate((target, { x, y }) => {
        target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 71, pointerType: 'touch', isPrimary: true, button: 0, clientX: x, clientY: y }));
    }, touchPoint);
    await touchTarget.locator('.ui-ripple-wave').first().waitFor({ timeout: 600 });
    await touchTarget.evaluate((target, { x, y }) => {
        target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: x, clientY: y }));
        target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, clientX: x, clientY: y }));
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0, clientX: x, clientY: y }));
    }, touchPoint);
    check('touch compatibility mouse events do not add a duplicate wave', await waveCount(touchTarget), 1);
    await page.waitForTimeout(300);
    ok('short touch tap remains visible after release', await waveCount(touchTarget) >= 1);
    await waitUntilClear(touchTarget, 'short touch tap eventually exits');

    // A touch scroll cancelled before the delay must not start a wave.
    const swipePoint = await boxCenter(touchTarget, .45, .5);
    await touchTarget.evaluate((target, { x, y }) => {
        target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 72, pointerType: 'touch', isPrimary: true, button: 0, clientX: x, clientY: y }));
        target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 72, pointerType: 'touch', isPrimary: true, button: 0, clientX: x + 45, clientY: y + 3 }));
        target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 72, pointerType: 'touch', isPrimary: true, button: 0, clientX: x + 45, clientY: y + 3 }));
    }, swipePoint);
    await page.waitForTimeout(140);
    check('touch movement before the delay cancels the ripple', await waveCount(touchTarget), 0);

    // Modifier behavior: centered/circular feedback and stop only blocks ancestor ripples.
    const options = page.locator('#section-options');
    const outer = options.locator('[data-ripple="outer"]');
    const inner = options.locator('[data-ripple="inner"]');
    const stop = options.locator('[data-ripple="stop"]');
    ok('nested ripple example places inner inside outer', await outer.evaluate((element, child) => element.contains(document.querySelector(child)), '[data-ripple="inner"]'));
    await pointerTap(inner, .13, .22);
    ok('inner click starts its own wave', await ownWaveCount(inner) >= 1);
    check('ordinary nested directive keeps the ancestor wave clear', await ownWaveCount(outer), 0);
    await waitUntilClear(inner, 'inner wave exits');
    await waitUntilClear(outer, 'ancestor wave exits');

    await options.evaluate((element) => {
        const outerTarget = element.querySelector('[data-ripple="outer"]');
        outerTarget.dataset.bubbledClicks = '0';
        outerTarget.addEventListener('click', () => { outerTarget.dataset.bubbledClicks = String(Number(outerTarget.dataset.bubbledClicks) + 1); });
    });
    await stop.click();
    await page.waitForTimeout(100);
    check('stop modifier does not create its own ripple', await ownWaveCount(stop), 0);
    check('stop modifier prevents the ancestor ripple', await ownWaveCount(outer), 0);
    check('stop modifier preserves click bubbling', await outer.getAttribute('data-bubbled-clicks'), '1');

    const circle = options.getByRole('button', { name: '圆形指令波纹', exact: true });
    const circlePoint = await pointerTap(circle, .12, .18);
    const circleGeometry = await circle.locator('.ui-ripple-wave').first().evaluate((wave, point) => {
        const host = wave.parentElement.parentElement;
        const width = host.clientWidth;
        const height = host.clientHeight;
        const radius = Number.parseFloat(wave.style.width) / 2;
        return {
            centered: Math.abs(Number.parseFloat(wave.style.left) + radius - width / 2) < 2
                && Math.abs(Number.parseFloat(wave.style.top) + radius - height / 2) < 2,
            circular: getComputedStyle(wave).borderRadius === '50%',
            point
        };
    }, circlePoint);
    check('center/circle modifier centers a circular wave', circleGeometry, { centered: true, circular: true, point: circlePoint });
    await waitUntilClear(circle, 'center/circle wave exits');

    const colorButton = options.getByRole('button', { name: '指定反馈颜色', exact: true });
    const colorPoint = await boxCenter(colorButton, .35, .45);
    await page.mouse.move(colorPoint.x, colorPoint.y);
    await page.mouse.down();
    await colorButton.locator('.ui-ripple-wave').first().waitFor();
    const color = await colorButton.locator('.ui-ripple-wave').first().evaluate((wave) => getComputedStyle(wave).backgroundColor);
    const buttonColor = await colorButton.evaluate((element) => getComputedStyle(element).color);
    ok('object color option supplies a concrete wave color', color !== 'rgba(0, 0, 0, 0)' && color !== buttonColor);
    await page.mouse.up();
    await waitUntilClear(colorButton, 'colored wave exits');

    const customKeys = options.getByRole('button', { name: '自定义按键反馈', exact: true });
    await customKeys.focus();
    await page.keyboard.press('Enter');
    check('custom keys omit the default Enter trigger', await waveCount(customKeys), 0);
    await page.keyboard.down('a');
    await customKeys.locator('.ui-ripple-wave').first().waitFor();
    await page.keyboard.down('a');
    check('custom key triggers one wave despite repeat', await waveCount(customKeys), 1);
    await customKeys.evaluate((element) => element.blur());
    await waitUntilClear(customKeys, 'custom key blur releases its wave');
    await page.keyboard.up('a');

    // Dynamic false/true updates must take effect without remounting the target.
    await enabled.uncheck();
    await pointerButton.click();
    check('ripple=false takes effect on the mounted button', await waveCount(pointerButton), 0);
    await enabled.check();
    await pointerTap(pointerButton);
    ok('re-enabling ripple creates a new wave', await waveCount(pointerButton) >= 1);
    await waitUntilClear(pointerButton, 're-enabled wave exits');

    const disabled = demo.getByRole('button', { name: '禁用反馈', exact: true });
    await disabled.click({ force: true });
    check('disabled button has no wave', await waveCount(disabled), 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await pointerButton.click();
    check('reduced motion suppresses waves', await waveCount(pointerButton), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    const heldPoint = await boxCenter(pointerButton, .5, .5);
    await page.mouse.move(heldPoint.x, heldPoint.y);
    await page.mouse.down();
    await pointerButton.locator('.ui-ripple-wave').first().waitFor();
    await page.waitForTimeout(300);
    check('long pointer hold keeps its wave active', await waveCount(pointerButton), 1);
    await page.mouse.up();
    await page.waitForTimeout(30);
    const exitDurations = await animationDurations(pointerButton);
    ok('pointer exit uses the specified 300 ms animation', exitDurations.includes(300));
    await waitUntilClear(pointerButton, 'long-held wave completes its exit');

    const unmountPoint = await boxCenter(pointerButton, .5, .5);
    await page.mouse.move(unmountPoint.x, unmountPoint.y);
    await page.mouse.down();
    await pointerButton.locator('.ui-ripple-wave').first().waitFor();
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/button`);
    await page.mouse.up();
    await page.getByRole('heading', { name: /按钮/, level: 1 }).waitFor();
    check('unmount removes active ripple layers', await page.locator('.ui-ripple-layer').count(), 0);
    check('no renderer errors', report.pageErrors, []);
} catch (error) {
    report.failure = error.stack || String(error);
} finally {
    if (app) await app.close();
    if (server) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
}

console.log(`Ripple activation assertions: ${report.assertions}; evidence: ${evidence}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
}
