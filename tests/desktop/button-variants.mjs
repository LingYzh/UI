import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/button-variants-'));
const report = { status: 'running', assertions: 0, checks: [], pageErrors: [], vueWarnings: [] };
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
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' && /vue warn|failed to resolve|invalid prop|extraneous/i.test(message.text())) {
            report.vueWarnings.push(message.text());
        }
    });
    await page.goto(`${server.resolvedUrls.local[0]}index.html#/button`);
    await page.locator('.docs-shell').waitFor({ state: 'visible' });
    await page.getByRole('heading', { name: /按钮/, level: 1 }).waitFor({ state: 'visible' });

    const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];
    const colors = ['primary', 'danger', 'secondary', 'default'];
    const appearance = page.locator('.docs-example[aria-labelledby="button-variant-color-heading"] [data-button-appearance]');
    await appearance.waitFor({ state: 'visible' });
    const previewButton = appearance.locator('[data-button-preview]');
    const colorField = appearance.getByRole('textbox', { name: '按钮颜色', exact: true });
    const variantField = appearance.getByRole('combobox', { name: '样式变体', exact: true });
    const disabledSwitch = appearance.getByRole('checkbox', { name: '禁用按钮', exact: true });
    const loadingSwitch = appearance.getByRole('checkbox', { name: '加载按钮', exact: true });
    const matrix = appearance.locator('button[data-button-variant][data-button-color]');
    const cssColors = appearance.locator('button[data-css-color]');
    const actionButtons = appearance.locator('button[data-button-preview], button[data-button-variant], button[data-css-color]');
    const output = appearance.getByRole('status');

    const defaultExample = page.locator('.docs-example[aria-labelledby="button-variants-heading"] .live-example');
    const defaultButton = defaultExample.getByRole('button', { name: '次要操作', exact: true });
    await setTheme(page, 'light');
    const defaultStyle = await snapshot(defaultButton);
    equal('button with no variant uses the outlined default', defaultStyle.variant, 'outlined');
    equal('default outlined button has no fill', defaultStyle.background, 'rgba(0, 0, 0, 0)');
    equal('default outlined button retains its neutral border', defaultStyle.border, await resolvedTokenColor(page, 'border', 'border-top-color'));
    equal('default outlined button has no elevation', defaultStyle.boxShadow, 'none');

    const pairs = await matrix.evaluateAll(elements => elements.map(element => [element.dataset.buttonVariant, element.dataset.buttonColor]));
    deepEqual('appearance matrix contains every variant/color combination in order', pairs,
        variants.flatMap(variant => colors.map(color => [variant, color])));
    equal('appearance matrix has 24 samples', await matrix.count(), 24);
    equal('custom CSS color matrix has ten samples', await cssColors.count(), 10);
    equal('preview, variant matrix, and CSS color samples are actionable buttons', await actionButtons.count(), 35);

    for (const variant of variants) {
        for (const color of colors) {
            const button = appearance.locator(`button[data-button-variant="${variant}"][data-button-color="${color}"]`);
            const state = await snapshot(button);
            equal(`${variant}/${color} uses its canonical variant class`, state.variant, variant);
            equal(`${variant}/${color} is enabled initially`, state.disabled, false);
        }
    }

    for (const variant of ['elevated', 'flat', 'tonal']) {
        for (const color of colors) {
            const button = appearance.locator(`button[data-button-variant="${variant}"][data-button-color="${color}"]`);
            const outlined = appearance.locator(`button[data-button-variant="outlined"][data-button-color="${color}"]`);
            const [solidGeometry, outlinedGeometry] = await Promise.all([
                button.evaluate(element => {
                    const style = getComputedStyle(element);
                    const rect = element.getBoundingClientRect();
                    return {
                        borderWidth: style.borderWidth,
                        paddingBlock: [style.paddingTop, style.paddingBottom],
                        paddingInline: [style.paddingLeft, style.paddingRight],
                        width: rect.width,
                        height: rect.height,
                    };
                }),
                outlined.evaluate(element => {
                    const rect = element.getBoundingClientRect();
                    return { width: rect.width, height: rect.height };
                }),
            ]);
            equal(`${variant}/${color} removes the physical border`, solidGeometry.borderWidth, '0px');
            equal(`${variant}/${color} restores standard button padding`, solidGeometry.paddingBlock, ['8px', '8px']);
            equal(`${variant}/${color} restores standard horizontal padding`, solidGeometry.paddingInline, ['14px', '14px']);
            deepEqual(`${variant}/${color} preserves outlined outer dimensions`,
                [solidGeometry.width, solidGeometry.height], [outlinedGeometry.width, outlinedGeometry.height]);
        }
    }
    pass('elevated, flat and tonal variants preserve outlined outer geometry across all four colors');

    const rippleSample = appearance.locator('button[data-button-variant="flat"][data-button-color="primary"]');
    await rippleSample.scrollIntoViewIfNeeded();
    const rippleBounds = await rippleSample.boundingBox();
    assert.ok(rippleBounds, 'solid button is available for a real pointer ripple');
    await page.mouse.move(rippleBounds.x + 1, rippleBounds.y + rippleBounds.height / 2);
    const rippleStarted = Date.now();
    await page.mouse.down();
    const rippleLayer = rippleSample.locator(':scope > .ui-ripple-layer');
    await rippleLayer.waitFor({ state: 'visible' });
    await page.waitForTimeout(70);
    const rippleGeometry = await rippleSample.evaluate(button => {
        const host = button.getBoundingClientRect();
        const layer = button.querySelector(':scope > .ui-ripple-layer');
        if (!layer) throw new Error('direct ripple layer is missing');
        const rect = layer.getBoundingClientRect();
        const wave = layer.querySelector('.ui-ripple-wave');
        return {
            host: { top: host.top, right: host.right, bottom: host.bottom, left: host.left },
            layer: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
            waveCount: layer.querySelectorAll('.ui-ripple-wave').length,
            waveAnimating: [...(wave?.getAnimations() ?? [])].some(animation => animation.playState === 'running'),
        };
    });
    for (const edge of ['top', 'right', 'bottom', 'left']) {
        ok(`held solid-button ripple covers the host ${edge} edge`, Math.abs(rippleGeometry.layer[edge] - rippleGeometry.host[edge]) <= 0.5,
            JSON.stringify({ host: rippleGeometry.host[edge], layer: rippleGeometry.layer[edge] }));
    }
    equal('held solid button has one direct ripple wave', rippleGeometry.waveCount, 1);
    ok('ripple wave is actively animating at the held mid-frame', rippleGeometry.waveAnimating);
    await page.mouse.up();
    await page.waitForTimeout(100);
    equal('quick pointer release keeps its ripple visible through the minimum hold', await rippleLayer.count(), 1);
    equal('quick pointer release keeps the wave node until its exit finishes', await rippleSample.locator('.ui-ripple-wave').count(), 1);
    await rippleLayer.waitFor({ state: 'detached', timeout: 2000 });
    const rippleElapsed = Date.now() - rippleStarted;
    ok('quick release completes the full visible and exit lifecycle', rippleElapsed >= 500 && rippleElapsed < 2000, `${rippleElapsed}ms`);
    pass('real held pointer ripple covers borderless button edges and survives quick release until exit completes');

    await page.mouse.move(1, 1);
    await page.waitForTimeout(220);
    const elevation = await Promise.all(colors.map(color => snapshot(appearance.locator(`button[data-button-variant="elevated"][data-button-color="${color}"]`))));
    ok('elevated buttons share the same non-none shadow across all colors',
        elevation[0].boxShadow !== 'none' && elevation.every(state => state.boxShadow === elevation[0].boxShadow),
        JSON.stringify(elevation.map(state => state.boxShadow)));
    const flat = await Promise.all(colors.map(color => snapshot(appearance.locator(`button[data-button-variant="flat"][data-button-color="${color}"]`))));
    ok('flat buttons have no shadow across all colors', flat.every(state => state.boxShadow === 'none'), JSON.stringify(flat.map(state => state.boxShadow)));

    for (const color of colors) {
        const button = appearance.locator(`button[data-button-variant="flat"][data-button-color="${color}"]`);
        const measured = await button.evaluate((element) => {
            const token = element.dataset.buttonColor === 'default' ? '--ui-theme-surface' : `--ui-theme-${element.dataset.buttonColor}`;
            const probe = document.createElement('span');
            probe.style.backgroundColor = `var(${token})`;
            document.body.append(probe);
            const expectedBackground = getComputedStyle(probe).backgroundColor;
            probe.remove();
            const style = getComputedStyle(element);
            const onToken = element.dataset.buttonColor === 'default' ? '--ui-theme-text' : `--ui-theme-on-${element.dataset.buttonColor}`;
            const textProbe = document.createElement('span');
            textProbe.style.color = `var(${onToken})`;
            document.body.append(textProbe);
            const expectedText = getComputedStyle(textProbe).color;
            textProbe.remove();
            return { background: style.backgroundColor, color: style.color, expectedBackground, expectedText };
        });
        equal(`flat/${color} resolves its theme background token`, measured.background, measured.expectedBackground);
        equal(`flat/${color} resolves its on-color token`, measured.color, measured.expectedText);
    }

    for (const color of ['primary', 'danger', 'secondary']) {
        const outlined = await snapshot(appearance.locator(`button[data-button-variant="outlined"][data-button-color="${color}"]`));
        equal(`outlined/${color} uses the selected color for text`, outlined.color, await resolvedTokenColor(page, color, 'color'));
        equal(`outlined/${color} uses the selected color for its border`, outlined.border, await resolvedTokenColor(page, color, 'border-top-color'));
    }
    const defaultOutlined = await snapshot(appearance.locator('button[data-button-variant="outlined"][data-button-color="default"]'));
    equal('outlined without a color uses a neutral theme border', defaultOutlined.border, await resolvedTokenColor(page, 'border', 'border-top-color'));

    const customColors = ['success', 'error', 'warning', 'info', '#f4d78b', '#213547', 'rgb(90, 65, 135)', 'hsl(175 55% 28%)', 'teal', 'var(--ui-theme-primary)'];
    deepEqual('custom color samples cover semantic, CSS, and theme-variable values',
        await cssColors.evaluateAll(elements => elements.map(element => element.dataset.cssColor)), customColors);
    const colorSamples = await cssColors.evaluateAll(elements => elements.map(element => {
        const source = element.dataset.cssColor;
        const probe = document.createElement('span');
        const expectedSource = ['success', 'error', 'warning', 'info'].includes(source) ? `var(--ui-theme-${source})` : source;
        probe.style.backgroundColor = expectedSource;
        document.body.append(probe);
        const expectedBackground = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const style = getComputedStyle(element);
        return { source, expectedBackground, background: style.backgroundColor, color: style.color };
    }));
    for (const sample of colorSamples) {
        equal(`${sample.source} CSS color resolves in the flat button background`, sample.background, sample.expectedBackground);
        ok(`${sample.source} automatic foreground meets 4.5:1 contrast`, contrastRatio(sample.color, sample.background) >= 4.5,
            `${sample.color} on ${sample.background}: ${contrastRatio(sample.color, sample.background).toFixed(2)}:1`);
    }

    const aliases = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return {
            danger: style.getPropertyValue('--ui-theme-danger').trim(),
            error: style.getPropertyValue('--ui-theme-error').trim(),
            onDanger: style.getPropertyValue('--ui-theme-on-danger').trim(),
            onError: style.getPropertyValue('--ui-theme-on-error').trim(),
        };
    });
    equal('danger theme token defaults to error', aliases.danger, aliases.error);
    equal('on-danger theme token defaults to on-error', aliases.onDanger, aliases.onError);

    await chooseVariant(variantField, page, 'flat');
    await fillColor(colorField, page, 'error');
    const errorPreview = await snapshot(previewButton);
    await fillColor(colorField, page, 'danger');
    const dangerPreview = await snapshot(previewButton);
    for (const key of ['background', 'border', 'color', 'opacity', 'boxShadow']) {
        equal(`danger and error aliases render the same ${key}`, dangerPreview[key], errorPreview[key]);
    }

    const priorTokens = await page.evaluate(() => {
        const style = document.documentElement.style;
        return {
            danger: style.getPropertyValue('--ui-theme-danger'),
            onDanger: style.getPropertyValue('--ui-theme-on-danger'),
        };
    });
    await page.evaluate(() => {
        document.documentElement.style.setProperty('--ui-theme-danger', 'rgb(23, 87, 129)');
        document.documentElement.style.setProperty('--ui-theme-on-danger', 'rgb(247, 237, 220)');
    });
    await settle(page);
    await fillColor(colorField, page, 'danger');
    let customDanger = await snapshot(previewButton);
    equal('explicit danger override is applied independently', customDanger.background, 'rgb(23, 87, 129)');
    equal('explicit on-danger override is applied independently', customDanger.color, 'rgb(247, 237, 220)');
    await page.evaluate(tokens => {
        const style = document.documentElement.style;
        if (tokens.danger) style.setProperty('--ui-theme-danger', tokens.danger); else style.removeProperty('--ui-theme-danger');
        if (tokens.onDanger) style.setProperty('--ui-theme-on-danger', tokens.onDanger); else style.removeProperty('--ui-theme-on-danger');
    }, priorTokens);
    await settle(page);

    const selectedTheme = await page.getByRole('checkbox', { name: '深色主题', exact: true });
    await fillColor(colorField, page, 'primary');
    await selectedTheme.setChecked(false);
    await waitTheme(page, 'light');
    const lightPrimary = await readThemeColor(previewButton, page, 'primary');
    await selectedTheme.setChecked(true);
    await waitTheme(page, 'dark');
    const darkPrimary = await readThemeColor(previewButton, page, 'primary');
    ok('theme switching changes the resolved primary color dynamically', lightPrimary.background !== darkPrimary.background,
        `${lightPrimary.background} → ${darkPrimary.background}`);

    await fillColor(colorField, page, 'success');
    const successPreview = await snapshot(previewButton);
    await fillColor(colorField, page, 'warning');
    const warningPreview = await snapshot(previewButton);
    ok('editing the color field updates the live preview without changing its variant',
        successPreview.background !== warningPreview.background && successPreview.variant === warningPreview.variant,
        `${successPreview.background} → ${warningPreview.background}; ${warningPreview.variant}`);

    await fillColor(colorField, page, 'var(--ui-theme-primary)');
    const themeVariableDark = await readThemeColor(previewButton, page, 'primary');
    await selectedTheme.setChecked(false);
    await waitTheme(page, 'light');
    const themeVariableLight = await readThemeColor(previewButton, page, 'primary');
    ok('a CSS variable color follows the active theme without remounting',
        themeVariableDark.background !== themeVariableLight.background,
        `${themeVariableDark.background} → ${themeVariableLight.background}`);

    await setTheme(page, 'light');
    await fillColor(colorField, page, 'primary');
    const initialCount = parseActionCount(await output.textContent());
    await previewButton.click();
    await waitActionCount(output, page, initialCount + 1);
    const enabledSample = appearance.locator('button[data-button-variant="outlined"][data-button-color="primary"]');
    await enabledSample.click();
    await waitActionCount(output, page, initialCount + 2);
    pass('enabled preview and matrix buttons emit their actions');

    await disabledSwitch.check();
    await page.waitForFunction(() => {
        const buttons = [...document.querySelectorAll('[data-button-appearance] button[data-button-preview], [data-button-appearance] button[data-button-variant], [data-button-appearance] button[data-css-color]')];
        return buttons.length === 35 && buttons.every(button => button.disabled && getComputedStyle(button).opacity === '0.6');
    }, null, { timeout: 10000 });
    await previewButton.scrollIntoViewIfNeeded();
    const disabledBounds = await previewButton.boundingBox();
    await page.mouse.click(disabledBounds.x + disabledBounds.width / 2, disabledBounds.y + disabledBounds.height / 2);
    equal('disabled preview does not emit its action', parseActionCount(await output.textContent()), initialCount + 2);
    pass('disabled state reaches the preview, all 24 variants, and ten CSS color buttons');
    const neutralDisabled = await snapshot(appearance.locator('button[data-button-variant="outlined"][data-button-color="default"]'));
    equal('disabled colorless outlined button keeps a neutral border', neutralDisabled.border, await resolvedTokenColor(page, 'border', 'border-top-color'));
    await disabledSwitch.uncheck();
    await page.waitForTimeout(220);

    const beforeLoading = await snapshotAll(actionButtons);
    await loadingSwitch.check();
    await page.waitForFunction(() => {
        const buttons = [...document.querySelectorAll('[data-button-appearance] button[data-button-preview], [data-button-appearance] button[data-button-variant], [data-button-appearance] button[data-css-color]')];
        return buttons.length === 35 && buttons.every(button => button.getAttribute('aria-busy') === 'true');
    }, null, { timeout: 10000 });
    await page.waitForTimeout(220);
    const duringLoading = await snapshotAll(actionButtons);
    for (let index = 0; index < beforeLoading.length; index += 1) {
        const before = beforeLoading[index];
        const after = duringLoading[index];
        equal(`${before.key} keeps one loader while loading`, after.loaderCount, 1);
        equal(`${before.key} is disabled while loading`, after.disabled, true);
        equal(`${before.key} exposes aria-busy while loading`, after.busy, 'true');
        equal(`${before.key} keeps its canonical loading opacity`, after.opacity, before.variant === 'plain' ? '0.62' : '1');
        for (const key of ['variant', 'width', 'height', 'background', 'border', 'color', 'opacity', 'boxShadow']) {
            equal(`${before.key} loading preserves ${key}`, after[key], before[key]);
        }
    }
    const actionBeforeLoadingClick = parseActionCount(await output.textContent());
    const loadingButton = appearance.locator('button[data-button-variant="flat"][data-button-color="primary"]');
    await loadingButton.scrollIntoViewIfNeeded();
    const loadingBounds = await loadingButton.boundingBox();
    await page.mouse.click(loadingBounds.x + loadingBounds.width / 2, loadingBounds.y + loadingBounds.height / 2);
    equal('loading sample does not emit its action', parseActionCount(await output.textContent()), actionBeforeLoadingClick);
    await loadingSwitch.uncheck();
    await page.waitForFunction(() => {
        const buttons = [...document.querySelectorAll('[data-button-appearance] button[data-button-preview], [data-button-appearance] button[data-button-variant], [data-button-appearance] button[data-css-color]')];
        return buttons.length === 35 && buttons.every(button => button.getAttribute('aria-busy') !== 'true' && !button.querySelector('.ui-button-loader'));
    }, null, { timeout: 10000 });
    const afterLoading = await snapshotAll(actionButtons);
    for (let index = 0; index < beforeLoading.length; index += 1) {
        const before = beforeLoading[index];
        const after = afterLoading[index];
        equal(`${before.key} restores its original appearance after loading`, pickVisual(after), pickVisual(before));
        equal(`${before.key} re-enables after loading`, after.disabled, false);
        equal(`${before.key} removes its loader`, after.loaderCount, 0);
    }
    pass('loading preserves color, opacity, dimensions, and variant, blocks activation, then restores all samples');

    const textSample = appearance.locator('button[data-button-variant="text"][data-button-color="primary"]');
    await page.mouse.move(1, 1);
    await page.waitForTimeout(200);
    const textIdle = await snapshot(textSample);
    await textSample.hover();
    await page.waitForTimeout(200);
    const textHover = await snapshot(textSample);
    equal('text hover keeps its variant class', textHover.variant, 'text');
    equal('text hover keeps the real button background transparent', textHover.background, 'rgba(0, 0, 0, 0)');
    equal('text hover keeps its actual border transparent', textHover.border, 'rgba(0, 0, 0, 0)');
    equal('text hover leaves the actual border width unchanged', textHover.borderWidth, textIdle.borderWidth);
    equal('text idle ::before layer uses currentColor', textIdle.beforeBackground, textIdle.color);
    equal('text hover layer uses currentColor', textHover.beforeBackground, textHover.color);
    equal('text idle state-layer opacity starts at zero', textIdle.beforeOpacity, 0);
    equal('text hover leaves button dimensions unchanged', [textHover.width, textHover.height], [textIdle.width, textIdle.height]);
    ok('text hover raises the separate pseudo-element layer opacity', textHover.beforeOpacity > textIdle.beforeOpacity,
        `${textIdle.beforeOpacity} → ${textHover.beforeOpacity}`);

    const plainSample = appearance.locator('button[data-button-variant="plain"][data-button-color="primary"]');
    await page.mouse.move(1, 1);
    await page.waitForTimeout(200);
    const plainIdle = await snapshot(plainSample);
    equal('plain button starts at its reduced opacity', plainIdle.opacity, '0.62');
    equal('plain variant removes its pseudo-element layer', plainIdle.beforeDisplay, 'none');
    await plainSample.hover();
    await page.waitForTimeout(200);
    const plainHover = await snapshot(plainSample);
    equal('plain hover keeps its variant class', plainHover.variant, 'plain');
    equal('plain hover restores full opacity', plainHover.opacity, '1');
    equal('plain hover still has no pseudo-element', plainHover.beforeDisplay, 'none');

    await previewButton.focus();
    let reachedPlainByKeyboard = false;
    for (let index = 0; index < 40; index += 1) {
        await page.keyboard.press('Tab');
        if (await plainSample.evaluate(element => element === document.activeElement)) {
            reachedPlainByKeyboard = true;
            break;
        }
    }
    pass('keyboard Tab order reaches the plain variant sample', reachedPlainByKeyboard);
    equal('keyboard-focused plain button uses visible opacity', await plainSample.evaluate(element => getComputedStyle(element).opacity), '1');
    equal('plain keyboard focus retains its variant class',
        await plainSample.evaluate(element => [...element.classList].find(name => name.startsWith('ui-button--variant-'))?.replace('ui-button--variant-', '')), 'plain');

    await setWindow(app, page, 390, 844);
    const overflow = await page.evaluate(() => {
        const content = document.querySelector('.docs-content-scroll');
        const demo = document.querySelector('[data-button-appearance]');
        const box = demo.getBoundingClientRect();
        return {
            viewport: innerWidth,
            document: document.documentElement.scrollWidth,
            content: content ? { width: content.clientWidth, scrollWidth: content.scrollWidth } : null,
            demo: demo ? { width: demo.clientWidth, scrollWidth: demo.scrollWidth, left: box.left, right: box.right } : null,
            buttons: [...demo.querySelectorAll('button[data-button-preview], button[data-button-variant], button[data-css-color]')].map(button => {
                const rect = button.getBoundingClientRect();
                return { left: rect.left, right: rect.right };
            })
        };
    });
    ok('390px button page has no document overflow', overflow.document <= overflow.viewport + 1, JSON.stringify(overflow));
    ok('390px appearance demo owns no horizontal overflow', overflow.demo.scrollWidth <= overflow.demo.width + 1, JSON.stringify(overflow.demo));
    ok('390px matrix and color samples remain inside their demo', overflow.buttons.every(button => button.left >= overflow.demo.left - 1 && button.right <= overflow.demo.right + 1), JSON.stringify(overflow.demo));

    assert.deepEqual(report.pageErrors, [], 'no uncaught renderer errors');
    assert.deepEqual(report.vueWarnings, [], 'no Vue warnings');
    report.status = 'passed';
} catch (error) {
    report.status = 'failed';
    report.failure = error.stack || String(error);
    process.exitCode = 1;
} finally {
    try {
        if (app) await app.close();
    } finally {
        await server.close();
        await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
        console.log(`Button variants: ${report.assertions} assertions; ${report.status}; evidence: ${evidence}`);
        if (report.failure) console.error(report.failure);
    }
}

function pass(label) {
    report.assertions++;
    report.checks.push(label);
}

function ok(label, condition, details = '') {
    assert.ok(condition, details ? `${label}: ${details}` : label);
    pass(label);
}

function equal(label, actual, expected) {
    assert.deepEqual(actual, expected, label);
    pass(label);
}

function deepEqual(label, actual, expected) {
    assert.deepEqual(actual, expected, label);
    pass(label);
}

async function snapshot(locator) {
    return locator.evaluate(snapshotInPage);
}

function snapshotInPage(element) {
    const style = getComputedStyle(element);
    const before = getComputedStyle(element, '::before');
    const rect = element.getBoundingClientRect();
    return {
        key: element.dataset.buttonPreview !== undefined ? 'preview'
            : element.dataset.buttonVariant ? `${element.dataset.buttonVariant}/${element.dataset.buttonColor}`
                : element.dataset.cssColor || 'button',
        variant: [...element.classList].find(name => name.startsWith('ui-button--variant-'))?.replace('ui-button--variant-', '') ?? '',
        width: rect.width,
        height: rect.height,
        background: style.backgroundColor,
        border: style.borderTopColor,
        borderWidth: style.borderTopWidth,
        borderStyle: style.borderTopStyle,
        color: style.color,
        opacity: style.opacity,
        boxShadow: style.boxShadow,
        disabled: element.disabled,
        busy: element.getAttribute('aria-busy'),
        loaderCount: element.querySelectorAll('.ui-button-loader').length,
        beforeBackground: before.backgroundColor,
        beforeOpacity: Number(before.opacity),
        beforeDisplay: before.display,
    };
}

function pickVisual(snapshot) {
    return Object.fromEntries(['variant', 'width', 'height', 'background', 'border', 'color', 'opacity', 'boxShadow'].map(key => [key, snapshot[key]]));
}

function parseRgb(value) {
    const match = value.match(/^rgba?\(([^)]+)\)$/i);
    assert.ok(match, `Expected computed rgb color, received ${value}`);
    return match[1].match(/[\d.]+/g).slice(0, 3).map(Number);
}

function luminance(color) {
    const linear = parseRgb(color).map(channel => {
        const value = channel / 255;
        return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}

function contrastRatio(foreground, background) {
    const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
    return (values[0] + .05) / (values[1] + .05);
}

async function resolvedTokenColor(page, name, property) {
    return page.evaluate(({ name, property }) => {
        const probe = document.createElement('span');
        probe.style.setProperty(property, `var(--ui-theme-${name})`);
        document.body.append(probe);
        const resolved = getComputedStyle(probe).getPropertyValue(property).trim();
        probe.remove();
        return resolved;
    }, { name, property });
}

async function snapshotAll(locator) {
    const elements = await locator.all();
    return Promise.all(elements.map(element => element.evaluate(snapshotInPage)));
}

async function chooseVariant(field, page, value) {
    await field.fill(value);
    const option = page.getByRole('option', { name: value, exact: true });
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    await page.waitForFunction(value => document.querySelector('[data-button-preview]')?.classList.contains(`ui-button--variant-${value}`), value, { timeout: 10000 });
}

async function fillColor(field, page, value) {
    await field.fill(value);
    await settle(page);
    await page.waitForTimeout(220);
}

async function settle(page) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function readThemeColor(button, page, color) {
    const state = await snapshot(button);
    const expected = await page.evaluate(color => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = `var(--ui-theme-${color})`;
        document.body.append(probe);
        const background = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return background;
    }, color);
    equal(`live preview follows the ${color} theme token`, state.background, expected);
    return state;
}

async function waitTheme(page, theme) {
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme, { timeout: 10000 });
    await page.waitForTimeout(500);
}

async function setTheme(page, theme) {
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(theme === 'dark');
    await waitTheme(page, theme);
}

async function waitActionCount(output, page, expected) {
    await page.waitForFunction(expected => {
        const text = document.querySelector('[data-button-appearance] [role="status"]')?.textContent ?? '';
        return Number(text.match(/已执行\s*(\d+)\s*次/)?.[1]) === expected;
    }, expected, { timeout: 10000 });
    equal(`action count reaches ${expected}`, parseActionCount(await output.textContent()), expected);
}

function parseActionCount(value) {
    const count = value?.match(/已执行\s*(\d+)\s*次/)?.[1];
    assert.ok(count !== undefined, `Cannot parse button action count from ${JSON.stringify(value)}`);
    return Number(count);
}

async function setWindow(app, page, width, height) {
    await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setContentSize(size.width, size.height), { width, height });
    await page.waitForFunction(({ width, height }) => Math.abs(innerWidth - width) <= 1 && Math.abs(innerHeight - height) <= 1,
        { width, height }, { timeout: 10000 });
}
