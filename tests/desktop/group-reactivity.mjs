import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const evidence = path.resolve('artifacts/component-audit-root/group-reactivity');
await mkdir(evidence, { recursive: true });
const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
    #app { max-width: 980px; margin: 0 auto; padding: 24px; }
    main { display: flex; flex-direction: column; gap: 18px; }
</style></head><body><div id="app"></div><script type="module">
    import { createApp, h, reactive, ref } from 'vue';
    import UCarousel from '/src/ui/UCarousel.vue';
    import UCarouselItem from '/src/ui/UCarouselItem.vue';
    import UExpansionPanel from '/src/ui/UExpansionPanel.vue';
    import UExpansionPanels from '/src/ui/UExpansionPanels.vue';
    import UStepper from '/src/ui/UStepper.vue';
    import UStepperItem from '/src/ui/UStepperItem.vue';
    import UWindow from '/src/ui/UWindow.vue';
    import UWindowItem from '/src/ui/UWindowItem.vue';
    import '/src/docs-base.css';
    import '/src/ui/data-components.css';
    const state = reactive({ windowValue: 'a', windowDisabled: false, carouselValue: 'a', carouselDisabled: false, panelValue: null, panelDisabled: false, fallbackValue: 'x', showFallbackFirst: true, stepperValue: 'a', stepperMandatory: true, initialWindowValue: null, initialWindowUpdates: 0, initialPanelValue: null, initialPanelUpdates: 0, initialStepperValue: null, initialStepperUpdates: 0, optionalPanelValue: null, optionalPanelUpdates: 0 });
    const windowComponent = ref();
    window.groupFixture = { state, windowNext: () => windowComponent.value.next() };

    function windowItems() { return ['a', 'b', 'c'].map(value => h(UWindowItem, { key: value, value }, () => value)); }
    function carouselItems() { return ['a', 'b', 'c'].map(value => h(UCarouselItem, { key: value, value }, () => value)); }
    function expansionPanels() {
        return h(UExpansionPanels, { modelValue: state.panelValue, disabled: state.panelDisabled, 'onUpdate:modelValue': value => state.panelValue = value }, {
            default: () => ['a', 'b'].map(value => h(UExpansionPanel, { key: value, value }, ({ toggle }) => h('button', { 'data-panel-toggle': value, onClick: toggle }, value)))
        });
    }
    function fallbackPanels() {
        return h(UExpansionPanels, { modelValue: state.fallbackValue, mandatory: true, 'onUpdate:modelValue': value => state.fallbackValue = value }, {
            default: () => [
                state.showFallbackFirst ? h(UExpansionPanel, { key: 'x', value: 'x' }, () => 'X') : null,
                h(UExpansionPanel, { key: 'y', value: 'y' }, () => 'Y')
            ]
        });
    }
    function initialPanels() {
        return h(UExpansionPanels, { modelValue: state.initialPanelValue, mandatory: true, 'onUpdate:modelValue': value => { state.initialPanelValue = value; state.initialPanelUpdates++; } }, {
            default: () => ['first', 'last'].map(value => h(UExpansionPanel, { key: value, value }, () => value))
        });
    }
    function optionalPanels() {
        return h(UExpansionPanels, { modelValue: state.optionalPanelValue, mandatory: false, 'onUpdate:modelValue': value => { state.optionalPanelValue = value; state.optionalPanelUpdates++; } }, {
            default: () => ['first', 'last'].map(value => h(UExpansionPanel, { key: value, value }, () => value))
        });
    }

    createApp({ render() {
        return h('main', [
            h(UWindow, { id: 'window-reactivity', ref: windowComponent, modelValue: state.windowValue, 'onUpdate:modelValue': value => state.windowValue = value, disabled: state.windowDisabled, keyboard: true, touch: true }, windowItems),
            h(UCarousel, { id: 'carousel-reactivity', modelValue: state.carouselValue, 'onUpdate:modelValue': value => state.carouselValue = value, disabled: state.carouselDisabled, cycle: false, interval: 0, keyboard: true, touch: true }, carouselItems),
            expansionPanels(),
            fallbackPanels(),
            h(UWindow, { modelValue: state.initialWindowValue, 'onUpdate:modelValue': value => { state.initialWindowValue = value; state.initialWindowUpdates++; } }, () => ['first', 'last'].map(value => h(UWindowItem, { key: value, value }, () => value))),
            initialPanels(),
            optionalPanels(),
            h(UStepper, { modelValue: state.initialStepperValue, mandatory: true, 'onUpdate:modelValue': value => { state.initialStepperValue = value; state.initialStepperUpdates++; } }, {
                default: () => ['first', 'last'].map(value => h(UStepperItem, { key: value, value, title: value }))
            }),
            h(UStepper, { id: 'stepper-reactivity', modelValue: state.stepperValue, 'onUpdate:modelValue': value => state.stepperValue = value, mandatory: state.stepperMandatory }, {
                default: () => ['a', 'b'].map(value => h(UStepperItem, { key: value, value, title: value }))
            })
        ]);
    } }).mount('#app');
</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'group-reactivity-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__group-reactivity') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await server.transformIndexHtml('/__group-reactivity', fixture));
            });
        }
    }]
});
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__group-reactivity` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text()); });

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function setState(key, value) {
    await page.evaluate(([name, next]) => { window.groupFixture.state[name] = next; }, [key, value]);
    await settle();
}
async function swipe(selector) {
    await page.locator(selector).evaluate(element => {
        function dispatch(type, x, touches) {
            const event = new Event(type, { bubbles: true, cancelable: true });
            Object.defineProperty(event, 'touches', { value: touches ? [{ clientX: x, clientY: 0 }] : [] });
            Object.defineProperty(event, 'changedTouches', { value: [{ clientX: x, clientY: 0 }] });
            element.dispatchEvent(event);
        }
        dispatch('touchstart', 120, true);
        dispatch('touchend', 20, false);
    });
    await settle();
}

const report = { method: 'Vite source fixture in Electron; no build', window: {}, carousel: {}, expansionPanels: {}, stepper: {}, errors };
async function capture(name, theme, width, height) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.setContentSize(size.width, size.height);
        window.webContents.setZoomFactor(1);
    }, { width, height });
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    await settle();
    await page.waitForTimeout(100);
    const image = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, `${name}.png`), Buffer.from(image.split(',')[1], 'base64'));
}
try {
    await page.locator('.u-window-item').first().waitFor();
    await page.locator('.u-carousel-item').first().waitFor();
    await page.locator('.u-stepper-item').nth(1).waitFor();

    await page.evaluate(() => window.groupFixture.windowNext());
    await settle();
    report.window.enabledExposedNext = await page.evaluate(() => window.groupFixture.state.windowValue);
    await setState('windowValue', 'a');
    await setState('windowDisabled', true);
    await page.evaluate(() => window.groupFixture.windowNext());
    await settle();
    report.window.disabledExposedNext = await page.evaluate(() => window.groupFixture.state.windowValue);
    await page.locator('#window-reactivity').dispatchEvent('keydown', { key: 'ArrowRight', bubbles: true });
    await settle();
    report.window.disabledKeyboard = await page.evaluate(() => window.groupFixture.state.windowValue);
    await swipe('#window-reactivity');
    report.window.disabledTouch = await page.evaluate(() => window.groupFixture.state.windowValue);
    await setState('windowDisabled', false);
    await page.locator('#window-reactivity').dispatchEvent('keydown', { key: 'ArrowRight', bubbles: true });
    await settle();
    report.window.enabledKeyboard = await page.evaluate(() => window.groupFixture.state.windowValue);
    await setState('windowValue', 'a');
    await swipe('#window-reactivity');
    report.window.enabledTouch = await page.evaluate(() => window.groupFixture.state.windowValue);
    assert.equal(report.window.enabledExposedNext, 'b');
    assert.equal(report.window.disabledExposedNext, 'a');
    assert.equal(report.window.disabledKeyboard, 'a');
    assert.equal(report.window.disabledTouch, 'a');
    assert.equal(report.window.enabledKeyboard, 'b');
    assert.equal(report.window.enabledTouch, 'b');

    await setState('carouselDisabled', true);
    await page.locator('#carousel-reactivity').dispatchEvent('keydown', { key: 'ArrowRight', bubbles: true });
    await settle();
    report.carousel.disabledKeyboard = await page.evaluate(() => window.groupFixture.state.carouselValue);
    await swipe('#carousel-reactivity');
    report.carousel.disabledTouch = await page.evaluate(() => window.groupFixture.state.carouselValue);
    await setState('carouselDisabled', false);
    await page.locator('#carousel-reactivity').dispatchEvent('keydown', { key: 'ArrowRight', bubbles: true });
    await settle();
    report.carousel.enabledKeyboard = await page.evaluate(() => window.groupFixture.state.carouselValue);
    await setState('carouselValue', 'a');
    await swipe('#carousel-reactivity');
    report.carousel.enabledTouch = await page.evaluate(() => window.groupFixture.state.carouselValue);
    assert.equal(report.carousel.disabledKeyboard, 'a');
    assert.equal(report.carousel.disabledTouch, 'a');
    assert.equal(report.carousel.enabledKeyboard, 'b');
    assert.equal(report.carousel.enabledTouch, 'b');

    await page.locator('[data-panel-toggle="a"]').click();
    report.expansionPanels.enabledSelect = await page.evaluate(() => window.groupFixture.state.panelValue);
    await setState('panelValue', null);
    await setState('panelDisabled', true);
    report.expansionPanels.disabledClass = await page.locator('.u-expansion-panel').first().getAttribute('class');
    await page.locator('[data-panel-toggle="a"]').click();
    report.expansionPanels.disabledSelect = await page.evaluate(() => window.groupFixture.state.panelValue);
    await setState('panelDisabled', false);
    await page.locator('[data-panel-toggle="a"]').click();
    report.expansionPanels.enabledAgainSelect = await page.evaluate(() => window.groupFixture.state.panelValue);
    assert.equal(report.expansionPanels.enabledSelect, 'a');
    assert.match(report.expansionPanels.disabledClass, /is-disabled/);
    assert.equal(report.expansionPanels.disabledSelect, null);
    assert.equal(report.expansionPanels.enabledAgainSelect, 'a');
    report.expansionPanels.unmountFallbackBefore = await page.evaluate(() => window.groupFixture.state.fallbackValue);
    await setState('showFallbackFirst', false);
    report.expansionPanels.unmountFallbackAfter = await page.evaluate(() => window.groupFixture.state.fallbackValue);
    assert.equal(report.expansionPanels.unmountFallbackBefore, 'x');
    assert.equal(report.expansionPanels.unmountFallbackAfter, 'y');

    report.nullModels = await page.evaluate(() => ({
        windowValue: window.groupFixture.state.initialWindowValue,
        windowUpdates: window.groupFixture.state.initialWindowUpdates,
        panelValue: window.groupFixture.state.initialPanelValue,
        panelUpdates: window.groupFixture.state.initialPanelUpdates,
        stepperValue: window.groupFixture.state.initialStepperValue,
        stepperUpdates: window.groupFixture.state.initialStepperUpdates,
        optionalPanelValue: window.groupFixture.state.optionalPanelValue,
        optionalPanelUpdates: window.groupFixture.state.optionalPanelUpdates
    }));
    assert.equal(report.nullModels.windowValue, 'first');
    assert.equal(report.nullModels.windowUpdates, 1);
    assert.equal(report.nullModels.panelValue, 'first');
    assert.equal(report.nullModels.panelUpdates, 1);
    assert.equal(report.nullModels.stepperValue, 'first');
    assert.equal(report.nullModels.stepperUpdates, 1);
    assert.equal(report.nullModels.optionalPanelValue, null);
    assert.equal(report.nullModels.optionalPanelUpdates, 0);

    report.stepper.mandatoryInitially = await page.locator('#stepper-reactivity .u-stepper-item').nth(1).isDisabled();
    assert.equal(await page.evaluate(() => window.groupFixture.state.stepperValue), 'a');
    await setState('stepperMandatory', false);
    report.stepper.mandatoryFalse = await page.locator('#stepper-reactivity .u-stepper-item').nth(1).isDisabled();
    await page.locator('#stepper-reactivity .u-stepper-item').nth(1).click();
    report.stepper.selectedAfterEnable = await page.evaluate(() => window.groupFixture.state.stepperValue);
    await setState('stepperMandatory', true);
    report.stepper.mandatoryTrueAgain = await page.locator('#stepper-reactivity .u-stepper-item').nth(0).isDisabled();
    assert.equal(report.stepper.mandatoryInitially, true);
    assert.equal(report.stepper.mandatoryFalse, false);
    assert.equal(report.stepper.selectedAfterEnable, 'b');
    assert.equal(report.stepper.mandatoryTrueAgain, true);

    assert.deepEqual(errors, []);
    await page.evaluate(() => {
        const state = window.groupFixture.state;
        state.windowValue = 'a';
        state.windowDisabled = false;
        state.carouselValue = 'a';
        state.carouselDisabled = false;
        state.panelValue = 'a';
        state.panelDisabled = false;
        state.fallbackValue = 'x';
        state.stepperValue = 'a';
        state.stepperMandatory = true;
    });
    await settle();
    const screenshots = [
        ['wide-light', 'light', 1280, 900],
        ['wide-dark', 'dark', 1280, 900],
        ['narrow-light', 'light', 390, 844],
        ['narrow-dark', 'dark', 390, 844]
    ];
    for (const [name, theme, width, height] of screenshots) await capture(name, theme, width, height);
    report.originalObserved = {
        uWindowDisabledExposedNext: 'b (expected a)',
        nullMandatoryExpansionPanels: 'y (expected x)',
        nullMandatoryStepper: 'b (expected a)',
        windowBaselineReference: 'docs/component-audit-2026-10-08/ROOT-RUNTIME.json'
    };
    report.screenshots = screenshots.map(([name, theme, width, height]) => ({ file: `${name}.png`, theme, width, height }));
    report.evidence = evidence;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    console.log(JSON.stringify(report, null, 4));
} finally {
    await app.close();
    await server.close();
}
