import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'ripple-'));
const report = { assertions: 0, checks: [], screenshots: [], pageErrors: [] };
let server;
let app;

function check(description, actual, expected) {
    assert.deepEqual(actual, expected, description);
    report.assertions++;
    report.checks.push(description);
}

async function screenshot(page, name) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const image = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    const file = path.join(evidence, name);
    await writeFile(file, Buffer.from(image.split(',')[1], 'base64'));
    report.screenshots.push(file);
}

async function geometry(target, clientX, clientY, centered) {
    return target.evaluate((element, { clientX, clientY, centered }) => {
        const layer = element.querySelector('.ui-ripple-layer');
        const wave = layer?.querySelector('.ui-ripple-wave');
        const targetRect = element.getBoundingClientRect();
        const layerRect = layer?.getBoundingClientRect();
        const radius = wave ? Number.parseFloat(wave.style.width) / 2 : NaN;
        const waveX = wave ? Number.parseFloat(wave.style.left) + radius : NaN;
        const waveY = wave ? Number.parseFloat(wave.style.top) + radius : NaN;
        return {
            targetClass: element.classList.contains('ui-ripple-target'),
            position: getComputedStyle(element).position,
            parentIsTarget: layer?.offsetParent === element,
            layerInside: !!layerRect && layerRect.left >= targetRect.left - 1 && layerRect.top >= targetRect.top - 1
                && layerRect.right <= targetRect.right + 1 && layerRect.bottom <= targetRect.bottom + 1,
            waveAtClick: Math.abs(waveX - (centered ? element.clientWidth / 2 : clientX - targetRect.left)) < 1
                && Math.abs(waveY - (centered ? element.clientHeight / 2 : clientY - targetRect.top)) < 1
        };
    }, { clientX, clientY, centered });
}

async function pointerHold(page, target, label, centered, captureName) {
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    assert.ok(bounds, `${label} has a visible bounding box`);
    const clientX = bounds.x + bounds.width * .28;
    const clientY = bounds.y + bounds.height * .37;
    await page.mouse.move(clientX, clientY);
    await page.mouse.down();
    try {
        await target.locator('.ui-ripple-layer').waitFor();
        check(`${label}: held ripple geometry`, await geometry(target, clientX, clientY, centered), {
            targetClass: true, position: 'relative', parentIsTarget: true, layerInside: true, waveAtClick: true
        });
        if (captureName) await screenshot(page, captureName);
    } finally {
        await page.mouse.up();
    }
    await target.locator('.ui-ripple-layer').waitFor({ state: 'detached' });
    check(`${label}: release clears layer`, await target.locator('.ui-ripple-layer').count(), 0);
}

async function keyboardHold(page, target, key) {
    await target.focus();
    await page.keyboard.down(key);
    try {
        await target.locator('.ui-ripple-layer').waitFor();
        const bounds = await target.boundingBox();
        check(`${key}: keyboard ripple is centered`, await geometry(target, bounds.x, bounds.y, true), {
            targetClass: true, position: 'relative', parentIsTarget: true, layerInside: true, waveAtClick: true
        });
    } finally {
        await page.keyboard.up(key);
    }
    await target.locator('.ui-ripple-layer').waitFor({ state: 'detached' });
    check(`${key}: key release clears layer`, await target.locator('.ui-ripple-layer').count(), 0);
}

async function quickReleaseFrame(page, target, theme) {
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(theme === 'dark');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1440, 900));
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')));
    await target.scrollIntoViewIfNeeded();
    const bounds = await target.boundingBox();
    await page.mouse.move(bounds.x + bounds.width * .18, bounds.y + bounds.height * .4);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(90);
    check(`${theme}: quick release still renders its wave`, await target.locator('.ui-ripple-wave').count(), 1);
    check(`${theme}: pointer blur does not retain focus`, await target.evaluate(element => element === document.activeElement), false);
    check(`${theme}: quick release wave has visible opacity`, await target.locator('.ui-ripple-wave').evaluate(element => Number(getComputedStyle(element).opacity) > 0), true);
    const captured = await app.evaluate(async ({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        return { png: (await window.webContents.capturePage()).toPNG().toString('base64'), size: window.getContentSize() };
    });
    const png = Buffer.from(captured.png, 'base64');
    check(`${theme}: native capture dimensions`, [png.readUInt32BE(16), png.readUInt32BE(20), ...captured.size], [1440, 900, 1440, 900]);
    const file = path.join(evidence, `ripple-${theme}-quick-release.png`);
    await writeFile(file, png);
    report.screenshots.push(file);
    await target.locator('.ui-ripple-layer').waitFor({ state: 'detached' });
}

try {
    server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'userData'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}index.html#/ripple` };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    const page = await app.firstWindow();
    page.on('pageerror', (error) => report.pageErrors.push(error.message));
    await page.getByRole('heading', { name: '涟漪反馈', level: 1 }).waitFor();
    const demo = page.locator('#section-demo');
    const dense = demo.locator('#ripple-dense');
    const enabled = demo.locator('#ripple-enabled');
    const targets = [
        ['pointer', demo.getByRole('button', { name: '指针位置扩散', exact: true }), false],
        ['center', demo.getByRole('button', { name: '居中扩散', exact: true }), true],
        ['native', demo.getByRole('button', { name: '原生按钮', exact: true }), false]
    ];
    check('dense switch starts unchecked', await dense.isChecked(), false);
    for (let round = 0; round < 2; round++) {
        for (const active of [true, false]) {
            await dense.setChecked(active);
            check(`round ${round + 1}: dense switch is ${active}`, await dense.isChecked(), active);
            for (const [name, target, centered] of targets) {
                const label = `round ${round + 1}, dense ${active}, ${name}`;
                check(`${label}: directive class after Vue class patch`, await target.evaluate((element) => element.classList.contains('ui-ripple-target')), true);
                const captureName = round === 0 && active && name === 'pointer' ? 'ripple-light-held.png' : undefined;
                await pointerHold(page, target, label, centered, captureName);
            }
        }
    }
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).check();
    await dense.check();
    await pointerHold(page, targets[0][1], 'dark, dense true, pointer', false, 'ripple-dark-held.png');
    for (const [name, target, centered] of targets.slice(1)) await pointerHold(page, target, `dark, dense true, ${name}`, centered);
    await dense.uncheck();
    for (const [name, target, centered] of targets) await pointerHold(page, target, `dark, dense false, ${name}`, centered);
    await keyboardHold(page, targets[0][1], 'Enter');
    await keyboardHold(page, targets[0][1], 'Space');
    await quickReleaseFrame(page, targets[0][1], 'light');
    await quickReleaseFrame(page, targets[0][1], 'dark');
    const loading = demo.getByRole('button', { name: '点击后进入等待', exact: true });
    await loading.click();
    await page.waitForTimeout(90);
    check('action enters disabled loading state', await loading.isDisabled(), true);
    check('action loading does not truncate its quick ripple', await loading.locator('.ui-ripple-wave').count(), 1);
    await loading.locator('.ui-ripple-layer').waitFor({ state: 'detached' });
    const tab = demo.getByRole('tab', { name: '标签二', exact: true });
    await tab.click();
    await page.waitForTimeout(90);
    check('Tab selection class update and blur preserve a quick ripple', await tab.locator('.ui-ripple-wave').count(), 1);
    await tab.locator('.ui-ripple-layer').waitFor({ state: 'detached' });
    check('native static host positioning is restored after feedback', await targets[2][1].evaluate(element => ({ inline: element.style.position, computed: getComputedStyle(element).position })), { inline: '', computed: 'static' });
    const disabled = demo.getByRole('button', { name: '禁用反馈', exact: true });
    await disabled.click({ force: true });
    check('disabled button has no layer', await disabled.locator('.ui-ripple-layer').count(), 0);
    await enabled.uncheck();
    for (const [name, target] of targets) {
        await target.click();
        check(`${name}: ripple=false has no layer`, await target.locator('.ui-ripple-layer').count(), 0);
    }
    await enabled.check();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const [name, target] of targets) {
        await target.click();
        check(`${name}: reduced motion has no layer`, await target.locator('.ui-ripple-layer').count(), 0);
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const last = targets[0][1];
    await last.scrollIntoViewIfNeeded();
    const bounds = await last.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await last.locator('.ui-ripple-layer').waitFor();
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/button`);
    await page.mouse.up();
    await page.getByRole('heading', { name: /按钮/, level: 1 }).waitFor();
    check('navigation unmounts the held ripple layer', await page.locator('.ui-ripple-layer').count(), 0);
    check('no renderer errors', report.pageErrors, []);
} catch (error) {
    report.failure = error.stack || String(error);
} finally {
    if (app) await app.close();
    if (server) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
}

console.log(`Ripple assertions: ${report.assertions}; evidence: ${evidence}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
}
