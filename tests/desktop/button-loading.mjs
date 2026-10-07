import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/button-loading-'));
const passed = [];
const errors = [];
const server = await preview({
    build: { outDir: path.resolve('dist/docs') },
    preview: { host: '127.0.0.1', port: 0, strictPort: false },
});
const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}index.html#/button`,
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    const page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    await page.getByRole('heading', { name: /按钮/, level: 1 }).waitFor();

    const statesExample = page.locator('.docs-example').filter({
        has: page.getByRole('heading', { name: '尺寸、图标与等待态', exact: true }),
    });
    const states = statesExample.getByRole('tabpanel', { name: '交互示例', exact: true });
    const savingButton = states.locator('button.ui-button').filter({ hasText: /模拟保存|正在保存/ });
    assert.equal(await savingButton.count(), 1, 'button-states exposes one simulated save button');
    const initialButtonSize = await measureOne(savingButton);
    const saveStartedAt = Date.now();
    await savingButton.click();
    await savingButton.locator('.ui-button-loader').waitFor();
    await page.waitForFunction(element => element.getAttribute('aria-busy') === 'true', await savingButton.elementHandle());
    assert.equal(await savingButton.isDisabled(), true, 'loading blocks another activation');
    assert.equal(await savingButton.locator('.ui-button-loader').count(), 1, 'the simulated save has exactly one loader');
    assert.equal(await savingButton.locator('.ui-button-content').getAttribute('class').then(value => value.includes('is-loading')), true);
    assert.equal(await savingButton.locator('.ui-button-content').evaluate(element => getComputedStyle(element).opacity), '0');
    assert.equal(await savingButton.locator('.ui-button-content .prototype-icon').count(), 1, 'the original check icon remains in the hidden content');
    assert.match(await savingButton.innerText(), /正在保存/);
    assertSameGeometry(initialButtonSize, await measureOne(savingButton), 'button-states loading preserves its measured box');
    await savingButton.locator('.ui-button-loader').waitFor({ state: 'detached', timeout: 5000 });
    const saveElapsed = Date.now() - saveStartedAt;
    assert.ok(saveElapsed >= 1250 && saveElapsed < 3000, `the demo loading state lasts about 1400ms (${saveElapsed}ms)`);
    assert.equal(await savingButton.getAttribute('aria-busy'), null, 'the simulated save clears aria-busy');
    assert.equal(await savingButton.isDisabled(), false, 'the simulated save re-enables the button');
    assertSameGeometry(initialButtonSize, await measureOne(savingButton), 'button-states restores its original box');
    assert.equal(await states.getByRole('button', { name: '不可用', exact: true }).evaluate(element => getComputedStyle(element).opacity), '0.6', 'a separately disabled button keeps its disabled appearance');
    passed.push('button-states loading hides its icon and text, exposes one loader and busy/disabled state, retains measured size for 1400ms, then restores');

    const loadingExample = page.locator('.docs-example').filter({
        has: page.locator('[data-loading-variant]'),
    });
    const loadingDemo = loadingExample.locator('.button-loading-demo');
    await loadingDemo.waitFor();
    const startAll = loadingDemo.getByRole('button', { name: '开始全部加载', exact: true });
    const endAll = loadingDemo.getByRole('button', { name: '结束全部加载', exact: true });
    const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain', 'custom-color', 'text-danger'];
    const caseNames = ['plain', 'compact', 'icon', 'explicit', 'custom-loader'];

    for (const theme of ['light', 'dark']) {
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        await page.waitForTimeout(240);

        const variantButtons = loadingDemo.locator('[data-loading-variant]');
        const caseButtons = loadingDemo.locator('[data-loading-case]');
        assert.deepEqual(await variantButtons.evaluateAll(elements => elements.map(element => element.dataset.loadingVariant)), variants, `${theme}: all eight canonical variant/color cases are present in order`);
        assert.deepEqual(await caseButtons.evaluateAll(elements => elements.map(element => element.dataset.loadingCase)), caseNames, `${theme}: all five content and loader cases are present`);

        const initialVariants = await measureMany(variantButtons);
        const initialCases = await measureMany(caseButtons);
        for (const state of initialVariants) {
            assert.ok(state.text.length > 0, `${theme}/${state.key} starts with button content`);
        }

        await startAll.click();
        await page.waitForFunction(() => {
            const buttons = [...document.querySelectorAll('[data-loading-variant], [data-loading-case]')];
            return buttons.length === 13 && buttons.every(button => button.getAttribute('aria-busy') === 'true');
        });
        await page.waitForTimeout(220);

        const loadingVariants = await measureMany(variantButtons);
        const loadingCases = await measureMany(caseButtons);
        for (let index = 0; index < initialVariants.length; index += 1) {
            const before = initialVariants[index];
            const after = loadingVariants[index];
            assert.equal(after.loaderCount, 1, `${theme}/${before.key} has one loader`);
            assert.equal(after.disabled, true, `${theme}/${before.key} is disabled while loading`);
            assert.equal(after.busy, 'true', `${theme}/${before.key} exposes aria-busy`);
            assert.equal(after.contentOpacity, '0', `${theme}/${before.key} hides the original content`);
            assert.equal(after.opacity, before.key === 'plain' ? '0.62' : '1', `${theme}/${before.key} preserves its intended loading opacity`);
            assert.ok(after.text.length > before.text.length, `${theme}/${before.key} grows its loading text`);
            assertSameVisualState(before, after, `${theme}/${before.key} keeps color, opacity and size while loading`);
        }
        for (let index = 0; index < initialCases.length; index += 1) {
            const before = initialCases[index];
            const after = loadingCases[index];
            assert.equal(after.loaderCount, 1, `${theme}/${before.key} has one loader`);
            assert.equal(after.disabled, true, `${theme}/${before.key} is disabled while loading`);
            assert.equal(after.busy, 'true', `${theme}/${before.key} exposes aria-busy`);
            assert.equal(after.contentOpacity, '0', `${theme}/${before.key} hides the original content`);
            assertSameGeometry(before, after, `${theme}/${before.key} preserves its box while loading`);
            if (before.key !== 'icon' && before.key !== 'custom-loader') {
                assert.ok(after.text.length > before.text.length, `${theme}/${before.key} grows its loading text`);
            }
            if (before.key === 'custom-loader') {
                assert.equal(after.defaultLoaderCount, 0, `${theme}: custom loader replaces the default spinner`);
                assert.equal(after.customLoaderIconCount, 1, `${theme}: custom loader slot remains rendered`);
            }
        }

        await loadingDemo.evaluate(element => element.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(160);
        await capture(app, `${theme}-loading.png`);

        await endAll.click();
        await page.waitForFunction(() => {
            const buttons = [...document.querySelectorAll('[data-loading-variant], [data-loading-case]')];
            return buttons.length === 13 && buttons.every(button => button.getAttribute('aria-busy') !== 'true' && !button.querySelector('.ui-button-loader'));
        });
        const restoredVariants = await measureMany(variantButtons);
        const restoredCases = await measureMany(caseButtons);
        for (let index = 0; index < initialVariants.length; index += 1) {
            assertSameVisualState(initialVariants[index], restoredVariants[index], `${theme}/${initialVariants[index].key} restores its original appearance and size`);
            assert.equal(restoredVariants[index].disabled, false, `${theme}/${initialVariants[index].key} is enabled after loading`);
            assert.equal(restoredVariants[index].text, initialVariants[index].text, `${theme}/${initialVariants[index].key} restores its original content`);
        }
        for (let index = 0; index < initialCases.length; index += 1) {
            assertSameGeometry(initialCases[index], restoredCases[index], `${theme}/${initialCases[index].key} restores its original box`);
            assert.equal(restoredCases[index].disabled, false, `${theme}/${initialCases[index].key} is enabled after loading`);
            assert.equal(restoredCases[index].loaderCount, 0, `${theme}/${initialCases[index].key} removes its loader`);
        }
        passed.push(`${theme} loading preserves eight variant/color combinations and five size/loader boundaries, then restores`);
    }

    assert.deepEqual(errors, []);
} catch (error) {
    errors.push(error.stack || String(error));
    process.exitCode = 1;
} finally {
    try {
        if (app) await app.close();
    } finally {
        await server.close();
        await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ passed, errors }, null, 4));
        console.log(JSON.stringify({ evidence, passed, errors }, null, 4));
    }
}

async function measureOne(locator) {
    return locator.evaluate(snapshot);
}

async function measureMany(locator) {
    const elements = await locator.all();
    return Promise.all(elements.map(element => element.evaluate(snapshot)));
}

async function capture(app, filename) {
    const image = await app.evaluate(async ({ BrowserWindow }) => {
        const data = await BrowserWindow.getAllWindows()[0].capturePage();
        return data.toPNG().toString('base64');
    });
    await writeFile(path.join(evidence, filename), Buffer.from(image, 'base64'));
}

function snapshot(element) {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const content = element.querySelector('.ui-button-content');
    const loader = element.querySelector('.ui-button-loader');
    return {
        key: element.dataset.loadingVariant || element.dataset.loadingCase || 'button',
        width: bounds.width,
        height: bounds.height,
        background: style.backgroundColor,
        border: style.borderTopColor,
        color: style.color,
        opacity: style.opacity,
        disabled: element.disabled,
        busy: element.getAttribute('aria-busy'),
        text: content?.textContent?.trim() || '',
        contentOpacity: content ? getComputedStyle(content).opacity : '',
        loaderCount: element.querySelectorAll('.ui-button-loader').length,
        defaultLoaderCount: loader?.querySelectorAll('.ui-button-loading').length || 0,
        customLoaderIconCount: loader?.querySelectorAll('.prototype-icon').length || 0,
    };
}

function assertSameGeometry(before, after, message) {
    assert.ok(Math.abs(before.width - after.width) <= 0.5, `${message}: width ${before.width} → ${after.width}`);
    assert.ok(Math.abs(before.height - after.height) <= 0.5, `${message}: height ${before.height} → ${after.height}`);
}

function assertSameVisualState(before, after, message) {
    assertSameGeometry(before, after, message);
    for (const key of ['background', 'border', 'color', 'opacity']) {
        assert.equal(after[key], before[key], `${message}: ${key} ${before[key]} → ${after[key]}`);
    }
}
