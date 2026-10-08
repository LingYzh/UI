import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/color-protocols');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html>
<html><head><meta charset="utf-8"></head><body><div id="app"></div>
<script type="module">
    import { createApp, h, nextTick, reactive, ref } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import '/src/ui/styles.css';

    const state = reactive({
        pickerRgb: { r: 12, g: 34, b: 56, a: 0.4 },
        pickerHsv: { h: 35, s: 0.6, v: 0.7, a: 0.5 },
        pickerHsl: { h: 275, s: 0, l: 0.5, a: 0.2 },
        pickerRgba: 'rgba(10 20 30 / 0.4)',
        pickerHsla: 'hsla(275 0% 50% / 0.2)',
        pickerHexa: '#11223380',
        pickerMode: 'hex',
        pickerModes: ['hex', 'rgba', 'hsl'],
        canvasColor: { h: 0, s: 0, v: 0.5, a: 1 },
        readonlyColor: { h: 120, s: 0.5, v: 0.5, a: 0.6 },
        disabledColor: { h: 240, s: 0.5, v: 0.5, a: 0.3 },
        swatchColor: '#000000',
        inputEmpty: '#445566',
        inputRgb: { r: 10, g: 20, b: 30, a: 0.5 },
        inputHsv: { h: 35, s: 0.5, v: 0.8, a: 0.4 },
        inputHsl: { h: 275, s: 0, l: 0.5, a: 0.25 },
        inputCssRgb: 'rgba(10 20 30 / 0.5)',
        inputCssHsl: 'hsla(275 0% 50% / 0.25)',
        inputInvalid: '#112233',
        inputShort: '#000000',
        inputNative: { h: 210, s: 0.6, v: 0.7, a: 0.35 },
        inputDisabled: '#123456',
        inputReadonly: '#abcdef',
        inputReset: '#334455',
        formColor: '#123456',
        formFocused: false,
        formFocusEvents: [],
        formDisabled: true,
        formReadonly: true,
        locale: 'en',
        dropperColor: '#111111',
        dropperDisabled: false,
        dropperBehavior: 'resolve',
        dropperCalls: 0,
        dropperAborted: false,
        showDropper: true
    });

    window.EyeDropper = class MockEyeDropper {
        open({ signal }) {
            state.dropperCalls++;
            signal.addEventListener('abort', () => { state.dropperAborted = true; }, { once: true });
            if (state.dropperBehavior === 'cancel') return Promise.reject(new DOMException('cancelled', 'AbortError'));
            if (state.dropperBehavior === 'pending') {
                return new Promise((resolve, reject) => {
                    signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
                });
            }
            return Promise.resolve({ sRGBHex: '#ABCDEF' });
        }
    };

    const pickerModeRef = ref();
    const defaultPickerRef = ref();
    const canvasPickerRef = ref();
    const dropperPickerRef = ref();
    const formRef = ref();
    const resetInputRef = ref();
    const ui = UI.createUI();
    const localeMessages = {
        en: { color: { hex: 'Scoped hex label', dropper: 'Scoped dropper' } },
        zh: { color: { hex: '范围内的十六进制', dropper: '范围内取色' } }
    };
    const inputModelProps = key => ({
        modelValue: state[key],
        'onUpdate:modelValue': value => { state[key] = value; }
    });

    window.colorProtocol = {
        state,
        registry: {
            colorInput: Boolean(UI.UColorInput),
            colorPicker: Boolean(UI.UColorPicker),
            form: Boolean(UI.UForm),
            localeProvider: Boolean(UI.ULocaleProvider)
        },
        async flush() { await nextTick(); await nextTick(); },
        async validateForm() { return await formRef.value.validate(); },
        async resetForm() { await formRef.value.reset(); await nextTick(); },
        async resetInput() { await resetInputRef.value.reset(); await nextTick(); },
        async pickDropper() { await dropperPickerRef.value.pickColor(); },
        startPendingDropper() { dropperPickerRef.value.pickColor(); },
        getDefaultMode() { return defaultPickerRef.value.mode; },
        getPickerMode() { return pickerModeRef.value.mode; },
        getCanvasHsv() { return canvasPickerRef.value.hsv; }
    };

    createApp({
        render() {
            return h('main', [
                h('section', { id: 'picker-default-panel' }, [
                    h(UI.UColorPicker, { id: 'picker-default', ref: defaultPickerRef, hideEyeDropper: true })
                ]),
                h('section', { id: 'picker-object-panels' }, [
                    h(UI.UColorPicker, { id: 'picker-rgb', modelValue: state.pickerRgb, 'onUpdate:modelValue': value => { state.pickerRgb = value; }, hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-hsv', modelValue: state.pickerHsv, 'onUpdate:modelValue': value => { state.pickerHsv = value; }, hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-hsl', modelValue: state.pickerHsl, 'onUpdate:modelValue': value => { state.pickerHsl = value; }, mode: 'hsl', hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-rgba', modelValue: state.pickerRgba, 'onUpdate:modelValue': value => { state.pickerRgba = value; }, hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-hsla', modelValue: state.pickerHsla, 'onUpdate:modelValue': value => { state.pickerHsla = value; }, mode: 'hsla', hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-hexa', modelValue: state.pickerHexa, 'onUpdate:modelValue': value => { state.pickerHexa = value; }, hideEyeDropper: true })
                ]),
                h('section', { id: 'picker-mode-panel' }, [
                    h(UI.UColorPicker, {
                        id: 'picker-mode', ref: pickerModeRef,
                        modelValue: state.pickerHsv, 'onUpdate:modelValue': value => { state.pickerHsv = value; },
                        mode: state.pickerMode, 'onUpdate:mode': value => { state.pickerMode = value; },
                        modes: state.pickerModes, showInputs: true, hideEyeDropper: true
                    })
                ]),
                h('section', { id: 'picker-canvas-panel' }, [
                    h(UI.UColorPicker, {
                        id: 'picker-canvas', ref: canvasPickerRef,
                        modelValue: state.canvasColor, 'onUpdate:modelValue': value => { state.canvasColor = value; },
                        hideCanvas: false, hideEyeDropper: true
                    }),
                    h(UI.UColorPicker, {
                        id: 'picker-readonly', modelValue: state.readonlyColor,
                        'onUpdate:modelValue': value => { state.readonlyColor = value; },
                        readonly: true, hideCanvas: false, hideEyeDropper: true
                    }),
                    h(UI.UColorPicker, {
                        id: 'picker-disabled', modelValue: state.disabledColor,
                        'onUpdate:modelValue': value => { state.disabledColor = value; },
                        disabled: true, hideCanvas: false, hideEyeDropper: true
                    })
                ]),
                h('section', { id: 'picker-options-panel' }, [
                    h(UI.UColorPicker, {
                        id: 'picker-swatches', modelValue: state.swatchColor,
                        'onUpdate:modelValue': value => { state.swatchColor = value; },
                        swatches: ['#ff0000', ['#00ff00']], showSwatches: true, hideEyeDropper: true
                    }),
                    h(UI.UColorPicker, { id: 'picker-no-swatches', swatches: ['#ff0000'], showSwatches: false, hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-hidden-controls', hideInputs: true, hideSliders: true, hideEyeDropper: true }),
                    h(UI.UColorPicker, { id: 'picker-hidden-labels', mode: 'rgba', hideInputLabels: true, hideEyeDropper: true })
                ]),
                h('section', { id: 'input-panels' }, [
                    h(UI.UColorInput, { id: 'input-default', allowEmpty: true }),
                    h(UI.UColorInput, { id: 'input-empty', allowEmpty: true, ...inputModelProps('inputEmpty') }),
                    h(UI.UColorInput, { id: 'input-rgb', ...inputModelProps('inputRgb') }),
                    h(UI.UColorInput, { id: 'input-hsv', ...inputModelProps('inputHsv') }),
                    h(UI.UColorInput, { id: 'input-hsl', ...inputModelProps('inputHsl') }),
                    h(UI.UColorInput, { id: 'input-css-rgb', ...inputModelProps('inputCssRgb') }),
                    h(UI.UColorInput, { id: 'input-css-hsl', ...inputModelProps('inputCssHsl') }),
                    h(UI.UColorInput, { id: 'input-invalid', ...inputModelProps('inputInvalid') }),
                    h(UI.UColorInput, { id: 'input-short', ...inputModelProps('inputShort') }),
                    h(UI.UColorInput, { id: 'input-native', nativePicker: true, ...inputModelProps('inputNative') }),
                    h(UI.UColorInput, { id: 'input-disabled', nativePicker: true, modelValue: state.inputDisabled, 'onUpdate:modelValue': value => { state.inputDisabled = value; }, disabled: true }),
                    h(UI.UColorInput, { id: 'input-readonly', nativePicker: true, modelValue: state.inputReadonly, 'onUpdate:modelValue': value => { state.inputReadonly = value; }, readonly: true }),
                    h(UI.UColorInput, { id: 'input-reset', ref: resetInputRef, ...inputModelProps('inputReset') })
                ]),
                h(UI.UForm, {
                    id: 'color-form', ref: formRef, validateOn: 'submit',
                    modelValue: null, 'onUpdate:modelValue': () => {}
                }, {
                    default: () => h('div', [
                        h(UI.UColorInput, {
                            name: 'form-color', label: 'Form color', modelValue: state.formColor,
                            rules: [value => Boolean(value) || 'Pick a color'],
                            'onUpdate:modelValue': value => { state.formColor = value; },
                            focused: state.formFocused,
                            'onUpdate:focused': value => { state.formFocused = value; state.formFocusEvents.push(value); }
                        }),
                        h('button', { id: 'form-reset', type: 'button', onClick: () => formRef.value.reset() }, 'Reset')
                    ])
                }),
                h(UI.UForm, { id: 'disabled-form', disabled: state.formDisabled }, {
                    default: () => h(UI.UColorInput, { id: 'form-disabled-input', modelValue: '#123456' })
                }),
                h(UI.UForm, { id: 'readonly-form', readonly: state.formReadonly }, {
                    default: () => h(UI.UColorInput, { id: 'form-readonly-input', modelValue: '#123456' })
                }),
                h(UI.ULocaleProvider, { locale: state.locale, messages: localeMessages }, {
                    default: () => h('section', { id: 'locale-scope' }, [
                        h(UI.UColorInput, { id: 'locale-input', modelValue: '#123456' }),
                        state.showDropper ? h(UI.UColorPicker, {
                            id: 'locale-picker', ref: dropperPickerRef,
                            modelValue: state.dropperColor, 'onUpdate:modelValue': value => { state.dropperColor = value; },
                            disabled: state.dropperDisabled, hideCanvas: true
                        }) : null
                    ])
                })
            ]);
        }
    }).use(ui).mount('#app');
</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'highlight.js/lib/core',
            'highlight.js/lib/languages/xml',
            'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript',
            'highlight.js/lib/languages/css',
            'highlight.js/lib/languages/json',
            'markdown-it',
            'markdown-it-footnote',
            'markdown-it-task-lists',
            'markdown-it-deflist',
            'markdown-it-mark',
            'markdown-it-sub',
            'markdown-it-sup'
        ]
    },
    resolve: { dedupe: ['vue'] },
    server: {
        host: '127.0.0.1',
        port: 0,
        hmr: false,
        watch: { ignored: ['**/artifacts/**'] }
    },
    plugins: [{
        name: 'color-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__color-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__color-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/UColorInput.vue',
    'src/ui/UColorPicker.vue',
    'src/ui/color-model.ts',
    'src/ui/form.ts',
    'src/ui/locale.ts',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));

await server.listen();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
});

const checks = [];
async function flush() {
    await page.evaluate(() => window.colorProtocol.flush());
}
async function setInputValue(selector, value) {
    await page.locator(selector).evaluate((element, next) => {
        element.value = next;
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await flush();
}
async function setRange(selector, value, index = 0) {
    await page.locator(selector).nth(index).evaluate((element, next) => {
        element.value = String(next);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await flush();
}

try {
    await page.goto(server.resolvedUrls.local[0] + '__color-protocols');
    await page.waitForFunction(() => Boolean(window.colorProtocol));
    await flush();

    const registry = await page.evaluate(() => window.colorProtocol.registry);
    assert.deepEqual(registry, { colorInput: true, colorPicker: true, form: true, localeProvider: true });
    checks.push('public index exports color input, picker, form and locale provider');

    const defaultPicker = page.locator('#picker-default');
    assert.equal(await defaultPicker.locator('.ui-color-preview span').textContent(), '#000000');
    assert.equal(await defaultPicker.locator('.ui-color-canvas').count(), 0);
    assert.equal(await page.evaluate(() => window.colorProtocol.getDefaultMode()), 'hex');
    checks.push('picker defaults to black, hides the 2D canvas and selects hex mode');

    await setRange('#picker-rgb input[type="range"]', 120);
    const rgbModel = await page.evaluate(() => window.colorProtocol.state.pickerRgb);
    assert.deepEqual(Object.keys(rgbModel).sort(), ['a', 'b', 'g', 'r']);
    assert.equal(rgbModel.a, 0.4);
    assert.ok(rgbModel.g > rgbModel.r && rgbModel.g > rgbModel.b);
    await setRange('#picker-hsv input[type="range"]', 220);
    const hsvModel = await page.evaluate(() => window.colorProtocol.state.pickerHsv);
    assert.deepEqual(Object.keys(hsvModel).sort(), ['a', 'h', 's', 'v']);
    assert.equal(hsvModel.h, 220);
    assert.equal(hsvModel.a, 0.5);
    await setRange('#picker-hsl input[type="range"]', 60, 2);
    const hslModel = await page.evaluate(() => window.colorProtocol.state.pickerHsl);
    assert.deepEqual(Object.keys(hslModel).sort(), ['a', 'h', 'l', 's']);
    assert.equal(hslModel.h, 275);
    assert.equal(hslModel.a, 0.2);
    assert.ok(hslModel.l > 0.5);
    checks.push('RGB, HSV and achromatic HSL objects retain shape, alpha and gray hue during picker edits');

    await setRange('#picker-rgba input[type="range"]', 90);
    const rgbaModel = await page.evaluate(() => window.colorProtocol.state.pickerRgba);
    assert.match(rgbaModel, /^rgb\(/);
    assert.match(rgbaModel, /\/ 0\.4\)$/);
    await setRange('#picker-hsla input[type="range"]', 180);
    const hslaModel = await page.evaluate(() => window.colorProtocol.state.pickerHsla);
    assert.match(hslaModel, /^hsl\(/);
    assert.match(hslaModel, /\/ 0\.2\)$/);
    await setRange('#picker-hexa input[type="range"]', 300);
    const hexaModel = await page.evaluate(() => window.colorProtocol.state.pickerHexa);
    assert.match(hexaModel, /^#[\da-f]{8}$/i);
    assert.equal(hexaModel.slice(-2).toUpperCase(), '80');
    checks.push('CSS RGB/HSL families and eight-digit hex preserve alpha on picker updates');

    await page.locator('#picker-mode select').selectOption('rgba');
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.pickerMode), 'rgba');
    assert.equal(await page.locator('#picker-mode input[type="range"]').count(), 4);
    await page.evaluate(() => {
        window.colorProtocol.state.pickerMode = 'rgba';
        window.colorProtocol.state.pickerModes = ['hsl'];
    });
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.pickerMode), 'hsl');
    await page.evaluate(() => { window.colorProtocol.state.pickerModes = []; });
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.pickerMode), 'hsl');
    checks.push('mode v-model updates and falls back to the first available mode without empty-mode churn');

    const canvas = page.locator('#picker-canvas .ui-color-canvas');
    const canvasBounds = await canvas.boundingBox();
    assert.ok(canvasBounds && canvasBounds.width > 0 && canvasBounds.height > 0);
    await canvas.click({ position: { x: canvasBounds.width * 0.75, y: canvasBounds.height * 0.25 } });
    await flush();
    const pointerColor = await page.evaluate(() => window.colorProtocol.state.canvasColor);
    assert.ok(pointerColor.s > 0.7 && pointerColor.v > 0.7, JSON.stringify(pointerColor));
    await canvas.focus();
    await canvas.press('ArrowLeft');
    await flush();
    const keyboardColor = await page.evaluate(() => window.colorProtocol.state.canvasColor);
    assert.ok(keyboardColor.s < pointerColor.s);
    checks.push('2D canvas pointer and keyboard update saturation/value');

    for (const selector of ['#picker-readonly .ui-color-canvas', '#picker-disabled .ui-color-canvas']) {
        const before = await page.evaluate(id => window.colorProtocol.state[id], selector.includes('readonly') ? 'readonlyColor' : 'disabledColor');
        await page.locator(selector).evaluate(element => {
            const rect = element.getBoundingClientRect();
            element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9, button: 0, clientX: rect.left + rect.width, clientY: rect.top }));
            element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 9, clientX: rect.left + rect.width, clientY: rect.top }));
            element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
        });
        await flush();
        const after = await page.evaluate(id => window.colorProtocol.state[id], selector.includes('readonly') ? 'readonlyColor' : 'disabledColor');
        assert.deepEqual(after, before);
    }
    checks.push('readonly and disabled canvases reject pointer and keyboard changes');

    assert.equal(await page.locator('#picker-swatches .ui-color-picker-swatches button').count(), 2);
    await page.locator('#picker-swatches .ui-color-picker-swatches button').nth(1).click();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.swatchColor), '#00FF00');
    assert.equal(await page.locator('#picker-no-swatches .ui-color-picker-swatches').count(), 0);
    assert.equal(await page.locator('#picker-hidden-controls .ui-color-inputs').count(), 0);
    assert.equal(await page.locator('#picker-hidden-controls .ui-color-channel').count(), 0);
    assert.equal(await page.locator('#picker-hidden-labels .ui-color-number span').count(), 0);
    checks.push('flat and nested swatches, show/hide, hidden controls and labels work');

    const inputRgb = page.locator('#input-rgb');
    assert.equal(await page.locator('#input-default').inputValue(), '');
    assert.equal(await page.locator('#input-default').locator('xpath=preceding-sibling::button').count(), 1);
    assert.equal(await page.locator('#input-default').locator('xpath=preceding-sibling::input[@type="color"]').count(), 0);
    assert.equal(await inputRgb.inputValue(), '#0A141E80');
    await inputRgb.fill('#00ff00');
    await flush();
    const inputRgbModel = await page.evaluate(() => window.colorProtocol.state.inputRgb);
    assert.deepEqual(Object.keys(inputRgbModel).sort(), ['a', 'b', 'g', 'r']);
    assert.equal(inputRgbModel.g, 255);
    assert.equal(inputRgbModel.a, 0.5);

    for (const [id, key, expectedKeys, expectedAlpha] of [
        ['input-hsv', 'inputHsv', ['a', 'h', 's', 'v'], 0.4],
        ['input-hsl', 'inputHsl', ['a', 'h', 'l', 's'], 0.25]
    ]) {
        const input = page.locator('#' + id);
        assert.match(await input.inputValue(), /^#[\da-f]{8}$/i);
        await input.fill('#0000ff');
        await flush();
        const model = await page.evaluate(name => window.colorProtocol.state[name], key);
        assert.deepEqual(Object.keys(model).sort(), expectedKeys);
        assert.equal(model.a, expectedAlpha);
        assert.ok(model.h > 230 && model.h < 250);
    }
    const cssRgbInput = page.locator('#input-css-rgb');
    assert.match(await cssRgbInput.inputValue(), /^#[\da-f]{8}$/i);
    await cssRgbInput.fill('#ff0000');
    await flush();
    assert.match(await page.evaluate(() => window.colorProtocol.state.inputCssRgb), /^rgb\(255 0 0 \/ 0\.5\)$/);
    const cssHslInput = page.locator('#input-css-hsl');
    await cssHslInput.fill('#00ff00');
    await flush();
    assert.match(await page.evaluate(() => window.colorProtocol.state.inputCssHsl), /^hsl\(120 100 50 \/ 0\.25\)$/);
    checks.push('UColorInput renders hex drafts and preserves RGB/HSV/HSL/CSS model family and alpha');

    const invalidInput = page.locator('#input-invalid');
    await invalidInput.fill('#12xz45');
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.inputInvalid), '#112233');
    assert.equal(await invalidInput.getAttribute('aria-invalid'), 'true');
    await invalidInput.blur();
    await flush();
    assert.equal(await invalidInput.inputValue(), '#112233');

    const shortInput = page.locator('#input-short');
    await shortInput.fill('#123');
    await flush();
    assert.equal(await shortInput.inputValue(), '#123');
    assert.equal(await shortInput.evaluate(element => element.selectionStart), 4);
    assert.equal(await page.evaluate(() => window.colorProtocol.state.inputShort), '#112233');
    checks.push('invalid drafts do not update models, blur reverts, and three-digit drafts keep their caret');

    const nativeInput = page.locator('#input-native').locator('xpath=preceding-sibling::input[@type="color"]');
    assert.equal(await nativeInput.inputValue(), '#477db3');
    await nativeInput.evaluate(element => {
        element.value = '#abcdef';
        element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await flush();
    const nativeModel = await page.evaluate(() => window.colorProtocol.state.inputNative);
    assert.deepEqual(Object.keys(nativeModel).sort(), ['a', 'h', 's', 'v']);
    assert.equal(nativeModel.a, 0.35);
    assert.equal(await nativeInput.inputValue(), '#abcdef');
    assert.equal(await page.locator('#input-disabled').isDisabled(), true);
    assert.equal(await page.locator('#input-readonly').getAttribute('readonly'), '');
    for (const [id, key, nextValue] of [
        ['input-disabled', 'inputDisabled', '#ffffff'],
        ['input-readonly', 'inputReadonly', '#ffffff']
    ]) {
        await page.locator('#' + id).evaluate((element, value) => {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }, nextValue);
        await page.locator('#' + id).locator('xpath=preceding-sibling::input[@type="color"]').evaluate(element => {
            element.value = '#ffffff';
            element.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await flush();
        assert.equal(await page.evaluate(name => window.colorProtocol.state[name], key), id === 'input-disabled' ? '#123456' : '#abcdef');
    }
    await page.locator('#input-empty').fill('');
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.inputEmpty), null);
    await page.evaluate(() => window.colorProtocol.resetInput());
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.inputReset), null);
    checks.push('native color input strips alpha visually, preserves alpha/model type, and clear/reset remain null');

    const formInput = page.locator('#form-color');
    assert.equal(await formInput.getAttribute('name'), 'form-color');
    await formInput.focus();
    await flush();
    await formInput.blur();
    await flush();
    assert.deepEqual((await page.evaluate(() => window.colorProtocol.state.formFocusEvents)).slice(0, 2), [true, false]);
    const formValid = await page.evaluate(() => window.colorProtocol.validateForm());
    assert.equal(formValid.valid, true);
    await page.evaluate(() => { window.colorProtocol.state.formColor = null; });
    await flush();
    const formInvalid = await page.evaluate(() => window.colorProtocol.validateForm());
    assert.equal(formInvalid.valid, false);
    assert.deepEqual(formInvalid.errors[0], { id: 'form-color', errorMessages: ['Pick a color'] });
    const formErrorId = await page.locator('#form-color').getAttribute('aria-describedby');
    assert.ok(formErrorId);
    assert.equal(await page.locator('[id="' + formErrorId + '"]').textContent(), 'Pick a color');
    assert.match(await page.locator('#form-color').getAttribute('aria-invalid'), /true/);
    await page.evaluate(() => window.colorProtocol.resetForm());
    await flush();
    assert.equal(await page.evaluate(() => window.colorProtocol.state.formColor), null);
    assert.equal(await page.locator('#form-disabled-input').isDisabled(), true);
    assert.equal(await page.locator('#form-readonly-input').getAttribute('readonly'), '');
    checks.push('form name, validation/displayErrors, focused events, inherited disabled/readonly and null reset work');

    const localeInput = page.locator('#locale-input');
    assert.equal(await localeInput.getAttribute('aria-label'), 'Scoped hex label');
    assert.equal(await page.locator('#locale-picker .ui-color-dropper').textContent(), 'Scoped dropper');
    await page.evaluate(() => { window.colorProtocol.state.locale = 'zh'; });
    await flush();
    assert.equal(await localeInput.getAttribute('aria-label'), '范围内的十六进制');
    assert.equal(await page.locator('#locale-picker .ui-color-dropper').textContent(), '范围内取色');
    await page.evaluate(() => { window.colorProtocol.state.locale = 'en'; });
    await flush();
    checks.push('color input and picker use scoped reactive locale messages');

    const dropperBefore = await page.evaluate(() => window.colorProtocol.state.dropperColor);
    const callsBeforeCancel = await page.evaluate(() => window.colorProtocol.state.dropperCalls);
    await page.evaluate(() => { window.colorProtocol.state.dropperBehavior = 'cancel'; });
    await page.evaluate(() => window.colorProtocol.pickDropper());
    assert.equal(await page.evaluate(() => window.colorProtocol.state.dropperColor), dropperBefore);
    assert.equal(await page.evaluate(() => window.colorProtocol.state.dropperCalls), callsBeforeCancel + 1);
    const callsBeforeDisabled = await page.evaluate(() => window.colorProtocol.state.dropperCalls);
    await page.evaluate(() => { window.colorProtocol.state.dropperDisabled = true; });
    await flush();
    await page.evaluate(() => window.colorProtocol.pickDropper());
    assert.equal(await page.evaluate(() => window.colorProtocol.state.dropperCalls), callsBeforeDisabled);
    await page.evaluate(() => {
        window.colorProtocol.state.dropperDisabled = false;
        window.colorProtocol.state.dropperBehavior = 'pending';
        window.colorProtocol.state.dropperAborted = false;
    });
    await flush();
    await page.evaluate(() => window.colorProtocol.startPendingDropper());
    const pendingCalls = await page.evaluate(() => window.colorProtocol.state.dropperCalls);
    assert.equal(pendingCalls, callsBeforeCancel + 2);
    await page.evaluate(() => { window.colorProtocol.state.showDropper = false; });
    await flush();
    await page.waitForFunction(() => window.colorProtocol.state.dropperAborted, null, { timeout: 5000 });
    assert.equal(await page.evaluate(() => window.colorProtocol.state.dropperColor), dropperBefore);
    checks.push('EyeDropper cancellation, disabled guard and unmount abort preserve the model');

    assert.deepEqual(errors, []);
    await page.screenshot({ path: path.join(evidence, 'color-protocols.png'), fullPage: true });
    const report = {
        method: 'Vite source fixture + public src/ui/index.ts + Chromium interactions',
        evidence,
        visualAcceptance: false,
        sourceSha256,
        checks,
        errors
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    process.stdout.write(JSON.stringify({ checks, evidence, sourceSha256 }, null, 2));
} finally {
    await browser.close();
    await server.close();
}
