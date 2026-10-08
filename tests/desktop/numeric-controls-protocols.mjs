import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/numeric-controls-protocols');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Numeric controls protocol</title><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module">
import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/styles.css';

const state = reactive({
    number: 1234,
    localized: 1234.5,
    hiddenVariant: 4,
    hiddenInput: 5,
    slider: 0,
    reversedSlider: 5,
    rtlReversedSlider: 5,
    readonlySlider: 4,
    disabledSlider: 6,
    noKeyboardSlider: 7,
    range: [25, 75],
    readonlyRange: [20, 80],
    disabledRange: [10, 90],
    noKeyboardRange: [15, 85],
    otp: undefined,
    patternOtp: '',
    readonlyOtp: 'R',
    disabledOtp: 'D',
    numericOtp: '1',
    passwordOtp: 'X',
    maskedOtp: 'M',
    placeholderOtp: '',
    autoOtp: '',
    resizeOtp: 'ABCD',
    resizeLength: 4,
    resizeAutofocus: false,
    staleOtp: '',
    staleLength: 4,
    fieldsOtp: undefined,
    defaultLoaderOtp: 'L'
});
const names = Object.keys(state).filter(key => !['resizeLength', 'staleLength', 'resizeAutofocus'].includes(key));
const refs = Object.fromEntries(names.map(key => [key, ref()]));
const events = reactive({ sliderStart: [], sliderEnd: [], rangeStart: [], rangeEnd: [], otpFinish: [], patternFinish: [], staleFinish: [] });
const ui = UI.createUI();
const Root = defineComponent({
    setup() {
        function bind(key, extra = {}) {
            return {
                id: key,
                name: key,
                ref: refs[key],
                modelValue: state[key],
                'onUpdate:modelValue': value => { state[key] = value; },
                ...extra
            };
        }
        window.numericControlsProtocol = {
            registry: {
                UNumberInput: Boolean(UI.UNumberInput),
                USlider: Boolean(UI.USlider),
                URangeSlider: Boolean(UI.URangeSlider),
                UOtpInput: Boolean(UI.UOtpInput)
            },
            async flush() { await nextTick(); await nextTick(); await new Promise(resolve => setTimeout(resolve, 0)); },
            set(key, value) { state[key] = value; },
            reset(key) { return refs[key].value.reset(); },
            snapshot() {
                return {
                    ...Object.fromEntries(names.map(key => [key, state[key] === undefined ? '__undefined__' : state[key]])),
                    events: Object.fromEntries(Object.entries(events).map(([key, values]) => [key, [...values]])),
                    refs: Object.fromEntries(['otp', 'resizeOtp', 'staleOtp'].map(key => {
                        const exposed = refs[key].value;
                        const inputs = exposed?.inputs;
                        return [key, { count: Array.isArray(inputs) ? inputs.length : Array.isArray(inputs?.value) ? inputs.value.length : 0 }];
                    }))
                };
            }
        };
        return () => h('main', { id: 'fixture' }, [
            h(UI.UNumberInput, bind('number', { min: 0, max: 5000, step: 1 })),
            h(UI.UNumberInput, bind('localized', { locale: 'de-DE', grouping: true, precision: 2, minFractionDigits: 2, decimalSeparator: ',', groupSeparator: '.', inset: true })),
            h(UI.UNumberInput, bind('hiddenVariant', { controlVariant: 'hidden', label: 'Hidden controls' })),
            h(UI.UNumberInput, bind('hiddenInput', { hideInput: true, hideDetails: true, label: 'Visually hidden value', hint: 'Details are hidden' })),
            h(UI.USlider, bind('slider', {
                min: 0, max: 10, step: 0, showTicks: 'always', ticks: [0, 5, 10], labels: ['low', 'middle', 'high'],
                thumbLabel: 'always', thumbSize: 24, tickSize: 8,
                onStart: value => events.sliderStart.push(value), onEnd: value => events.sliderEnd.push(value)
            }), {
                'tick-label': ({ tick }) => h('b', { class: 'slider-tick-slot' }, tick.label),
                'thumb-label': ({ value }) => h('b', { class: 'slider-thumb-slot' }, String(value))
            }),
            h('section', { dir: 'rtl' }, [
                h(UI.USlider, bind('reversedSlider', { min: 0, max: 10, step: 1, reverse: true, direction: 'vertical', label: 'Reverse test' })),
                h(UI.USlider, bind('rtlReversedSlider', { min: 0, max: 10, step: 1, reverse: true, label: 'RTL reverse test' }))
            ]),
            h(UI.USlider, bind('readonlySlider', { min: 0, max: 10, step: 1, readonly: true })),
            h(UI.USlider, bind('disabledSlider', { min: 0, max: 10, step: 1, disabled: true })),
            h(UI.USlider, bind('noKeyboardSlider', { min: 0, max: 10, step: 1, noKeyboard: true })),
            h('section', { dir: 'rtl' }, [h(UI.URangeSlider, bind('range', {
                min: 0, max: 100, step: 0, showTicks: true, ticks: [0, 50, 100], labels: ['min', 'mid', 'max'],
                thumbLabel: 'always', thumbSize: 22, tickSize: 7,
                onStart: value => events.rangeStart.push(value), onEnd: value => events.rangeEnd.push(value)
            }), {
                'tick-label': ({ tick }) => h('i', { class: 'range-tick-slot' }, tick.label),
                'thumb-label': ({ value }) => h('b', { class: 'range-thumb-slot' }, String(value))
            })]),
            h(UI.URangeSlider, bind('readonlyRange', { min: 0, max: 100, step: 1, readonly: true })),
            h(UI.URangeSlider, bind('disabledRange', { min: 0, max: 100, step: 1, disabled: true })),
            h(UI.URangeSlider, bind('noKeyboardRange', { min: 0, max: 100, step: 1, noKeyboard: true })),
            h('section', { dir: 'rtl', id: 'rtl-otps' }, [
                h(UI.UOtpInput, bind('otp', { length: 4, focusAll: true, divider: '|', onFinish: value => events.otpFinish.push(value) }), {
                    divider: ({ index }) => h('b', { class: 'otp-divider-slot', 'data-divider-index': index }, ':'),
                    default: () => h('span', { class: 'otp-default-slot' }, 'OTP helper content')
                }),
                h(UI.UOtpInput, bind('patternOtp', { length: 2, pattern: '^[A-Z]$', loading: true, onFinish: value => events.patternFinish.push(value) }), {
                    loader: () => h('span', { class: 'otp-loader-slot' }, 'Loading')
                }),
                h(UI.UOtpInput, bind('readonlyOtp', { length: 2, readonly: true })),
                h(UI.UOtpInput, bind('disabledOtp', { length: 2, disabled: true })),
                h(UI.UOtpInput, bind('numericOtp', { type: 'number', length: 2, pattern: '[0-9]' })),
                h(UI.UOtpInput, bind('passwordOtp', { type: 'password', length: 2 })),
                h(UI.UOtpInput, bind('maskedOtp', { type: 'text', masked: true, length: 2 })),
                h(UI.UOtpInput, bind('placeholderOtp', { placeholder: '•', length: 2 })),
                h(UI.UOtpInput, bind('autoOtp', { autofocus: true, length: 2 })),
                h(UI.UOtpInput, bind('resizeOtp', { length: state.resizeLength, autofocus: state.resizeAutofocus })),
                h(UI.UOtpInput, bind('staleOtp', { length: state.staleLength, onFinish: value => events.staleFinish.push(value) })),
                h(UI.UOtpInput, bind('fieldsOtp', { length: 2 }), {
                    fields: ({ cells, focusAll, update }) => h('button', { class: 'otp-fields-slot', onClick: () => update(0, 'Z') }, cells.join('|') + ':' + focusAll)
                }),
                h(UI.UOtpInput, bind('defaultLoaderOtp', { length: 1, loading: true }))
            ])
        ]);
    }
});
createApp(Root).use(ui).mount('#app');
</script></body></html>`;

const server = await createServer({
    root,
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
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    logLevel: 'error',
    plugins: [{
        name: 'numeric-controls-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use('/__numeric_controls_protocols', async (_request, response) => {
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__numeric_controls_protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/UNumberInput.vue',
    'src/ui/USlider.vue',
    'src/ui/URangeSlider.vue',
    'src/ui/UOtpInput.vue',
    'src/ui/specialized-inputs.ts',
    'src/ui/form.ts',
    'src/ui/index.ts',
    'src/ui/forms-components.css'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')
])));
const report = { sourceSha256, checks: [], observations: {}, warnings: [], errors: [] };
let browser;
let app;

try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.on('console', message => {
        if (message.type() === 'warning') report.warnings.push(message.text());
        if (message.type() === 'error') report.errors.push(message.text());
    });
    page.on('pageerror', error => report.errors.push(error.stack ?? String(error)));
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__numeric_controls_protocols`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.numericControlsProtocol?.registry?.UOtpInput));
    const flush = () => page.evaluate(() => window.numericControlsProtocol.flush());
    const snapshot = () => page.evaluate(() => window.numericControlsProtocol.snapshot());
    const set = (key, value) => page.evaluate(([name, next]) => window.numericControlsProtocol.set(name, next), [key, value]);
    await flush();

    const registry = await page.evaluate(() => window.numericControlsProtocol.registry);
    assert.deepEqual(registry, { UNumberInput: true, USlider: true, URangeSlider: true, UOtpInput: true });
    let state = await snapshot();
    assert.equal(state.otp, '__undefined__', 'the local OTP model starts undefined');
    assert.equal(await page.locator('.ui-otp-input').nth(8).locator('input').first().evaluate(input => document.activeElement === input), true, 'autofocus focuses the first field on mount');
    const numberInputs = page.locator('.ui-number-input input');
    assert.equal(await numberInputs.nth(0).inputValue(), '1234', 'default number display stays a raw decimal string');
    assert.equal(await numberInputs.nth(1).inputValue(), '1.234,50', 'explicit German locale formatting applies grouping and precision');
    assert.equal(await page.locator('.ui-number-input[data-control-variant="hidden"] .ui-control-step').count(), 0);
    assert.equal(await page.locator('.ui-number-input.is-input-hidden input').count(), 0);
    assert.equal(await page.locator('.ui-number-input.is-input-hidden').getAttribute('data-control-variant'), 'stacked');
    assert.equal(await page.locator('.ui-number-input[data-inset="true"]').count(), 1);
    assert.equal(await page.locator('.ui-number-input.is-input-hidden').locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " ui-field ")]').locator('.ui-field-details').count(), 0);
    report.checks.push('public entry exports, raw default number display, explicit locale formatting, controlVariant, hideInput, inset and inherited hideDetails binding');

    const localized = numberInputs.nth(1);
    await localized.fill('1.234,75');
    await flush();
    assert.equal((await snapshot()).localized, 1234.75);
    await localized.fill('bad-number');
    assert.equal(await localized.getAttribute('aria-invalid'), 'true');
    await localized.evaluate(input => input.blur());
    await flush();
    assert.equal((await snapshot()).localized, 1234.75, 'invalid locale text does not enter the model');
    assert.equal(await localized.inputValue(), '1.234,75', 'blur restores the current formatted model');
    const numberValue = (await snapshot()).number;
    await page.locator('.ui-number-input').nth(0).locator('.ui-control-step[aria-label="增加数值"]').click();
    await flush();
    assert.equal((await snapshot()).number, numberValue + 1, 'one native click after pointerdown produces only one step');
    report.checks.push('locale-aware number parse/commit, invalid text rollback and pointer step deduplication');

    const slider = page.locator('.ui-slider-control input[type="range"]').nth(0);
    assert.equal(await slider.getAttribute('step'), 'any', 'step zero remains continuous in the native control');
    assert.equal(await slider.getAttribute('name'), 'slider');
    assert.equal(await slider.getAttribute('aria-valuemin'), '0');
    assert.equal(await slider.getAttribute('aria-valuemax'), '10');
    assert.equal(await slider.getAttribute('aria-orientation'), 'horizontal');
    assert.deepEqual(await page.locator('.ui-slider-control').nth(0).locator('.slider-tick-slot').allTextContents(), ['low', 'middle', 'high']);
    assert.equal(await page.locator('.ui-slider-control').nth(0).locator('.slider-thumb-slot').textContent(), '0');
    assert.equal(await page.locator('.ui-slider-control').nth(0).evaluate(el => getComputedStyle(el).getPropertyValue('--ui-slider-thumb-size').trim()), '24px');
    assert.equal(await page.locator('.ui-slider-control').nth(0).evaluate(el => getComputedStyle(el).getPropertyValue('--ui-slider-tick-size').trim()), '8px');
    assert.equal(await page.locator('.ui-slider-thumb-label').evaluate(el => el.style.getPropertyValue('--ui-slider-thumb-position')), '0%');
    await slider.press('ArrowRight');
    await flush();
    state = await snapshot();
    assert.equal(state.slider, 0.1, 'continuous keyboard arrows use the 0.1 virtual increment');
    assert.deepEqual(state.events.sliderStart, [0]);
    assert.deepEqual(state.events.sliderEnd, [0.1]);
    await slider.evaluate(input => {
        input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }));
    });
    await slider.evaluate(input => {
        input.value = '2.25';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await flush();
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' })));
    await flush();
    state = await snapshot();
    assert.equal(state.slider, 2.25);
    assert.deepEqual(state.events.sliderStart, [0, 0.1]);
    assert.deepEqual(state.events.sliderEnd, [0.1, 2.25]);
    assert.equal(await page.locator('.ui-slider-control').nth(1).locator('input').getAttribute('aria-orientation'), 'vertical');
    assert.equal(await page.locator('.ui-slider-control').nth(1).getAttribute('data-reverse'), 'true');
    await page.locator('.ui-slider-control').nth(1).locator('input').press('ArrowRight');
    await flush();
    assert.equal((await snapshot()).reversedSlider, 6, 'vertical keyboard movement ignores inherited RTL when reversing');
    await page.locator('.ui-slider-control').nth(2).locator('input').press('ArrowRight');
    await flush();
    assert.equal((await snapshot()).rtlReversedSlider, 6, 'horizontal reverse keyboard movement uses the control locale direction');
    for (const [id, index] of [['readonlySlider', 3], ['disabledSlider', 4]]) {
        const input = page.locator('.ui-slider-control').nth(index).locator('input');
        const before = (await snapshot())[id];
        await input.evaluate(node => { node.value = '9'; node.dispatchEvent(new Event('input', { bubbles: true })); });
        await input.press('ArrowRight').catch(() => undefined);
        await flush();
        assert.equal((await snapshot())[id], before, `${id} rejects native input and keyboard updates`);
        assert.equal(await input.inputValue(), String(before), `${id} restores its rendered value`);
    }
    await page.locator('.ui-slider-control').nth(5).locator('input').press('ArrowRight');
    await flush();
    assert.equal((await snapshot()).noKeyboardSlider, 7, 'noKeyboard prevents keyboard model changes');
    report.checks.push('slider continuous keyboard step, pointer/key start/end, ticks/slots/sizes, direction/reverse, ARIA/name and disabled/readonly rollback');

    const rangeControl = page.locator('.ui-range-slider-control').nth(0);
    const rangeInputs = rangeControl.locator('input[type="range"]');
    assert.equal(await rangeInputs.nth(0).getAttribute('step'), 'any');
    assert.equal(await rangeInputs.nth(0).getAttribute('aria-valuemax'), '75');
    assert.equal(await rangeInputs.nth(1).getAttribute('aria-valuemin'), '25');
    assert.equal(await rangeInputs.nth(0).getAttribute('name'), 'range');
    assert.deepEqual(await rangeControl.locator('.range-tick-slot').allTextContents(), ['min', 'mid', 'max']);
    assert.deepEqual(await rangeControl.locator('.range-thumb-slot').allTextContents(), ['25', '75']);
    assert.equal(await rangeControl.evaluate(el => getComputedStyle(el).getPropertyValue('--ui-slider-thumb-size').trim()), '22px');
    assert.equal(await rangeControl.evaluate(el => getComputedStyle(el).getPropertyValue('--ui-slider-tick-size').trim()), '7px');
    assert.deepEqual(await rangeControl.locator('.ui-range-slider-thumb-labels output').evaluateAll(els => els.map(el => el.style.getPropertyValue('--ui-slider-thumb-position'))), ['25%', '75%']);
    await rangeInputs.nth(0).press('ArrowLeft');
    await flush();
    assert.deepEqual((await snapshot()).range, [25.1, 75], 'horizontal range keyboard movement uses inherited RTL from the control root');
    await set('range', [25, 75]);
    await flush();
    await rangeInputs.nth(0).evaluate(input => {
        input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }));
    });
    await rangeInputs.nth(0).evaluate(input => {
        input.value = '40.25';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await flush();
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' })));
    await flush();
    state = await snapshot();
    assert.deepEqual(state.range, [40.25, 75]);
    assert.deepEqual(state.events.rangeStart, [[25, 75], [25, 75]]);
    assert.deepEqual(state.events.rangeEnd, [[25.1, 75], [40.25, 75]]);
    for (const [id, index] of [['readonlyRange', 1], ['disabledRange', 2]]) {
        const input = page.locator('.ui-range-slider-control').nth(index).locator('input').first();
        const before = (await snapshot())[id];
        await input.evaluate(node => { node.value = '95'; node.dispatchEvent(new Event('input', { bubbles: true })); });
        await input.press('ArrowRight').catch(() => undefined);
        await flush();
        assert.deepEqual((await snapshot())[id], before, `${id} rejects pointer and keyboard updates`);
        assert.equal(await input.inputValue(), String(before[0]));
    }
    const noKeyboardRangeInput = page.locator('.ui-range-slider-control').nth(3).locator('input').first();
    await noKeyboardRangeInput.press('ArrowRight');
    await flush();
    assert.deepEqual((await snapshot()).noKeyboardRange, [15, 85]);
    report.checks.push('range continuous model, handle ARIA boundaries, tick/thumb slots, pointer start/end and disabled/readonly rollback');

    const otp = page.locator('.ui-otp-input').nth(0);
    const otpInputs = otp.locator('input[data-otp-index]');
    assert.equal(await otpInputs.count(), 4);
    assert.equal(await otp.locator('.otp-divider-slot').count(), 3);
    assert.equal(await otp.locator('.otp-default-slot').textContent(), 'OTP helper content');
    await otpInputs.nth(0).focus();
    await flush();
    assert.equal(await otp.getAttribute('data-focus-all'), 'true');
    const focusTransition = await otpInputs.nth(0).evaluate(input => ({
        duration: getComputedStyle(input).transitionDuration,
        properties: getComputedStyle(input).transitionProperty
    }));
    assert.ok(focusTransition.duration && focusTransition.duration !== '0s');
    report.observations.otpFocusTransition = focusTransition;
    await otpInputs.nth(0).fill('A');
    await otpInputs.nth(1).fill('B');
    await otpInputs.nth(2).fill('C');
    await otpInputs.nth(3).fill('D');
    await flush();
    state = await snapshot();
    assert.equal(state.otp, 'ABCD', 'default OTP text mode accepts letters and emits strings');
    assert.deepEqual(state.events.otpFinish, ['ABCD']);
    await set('otp', undefined);
    await set('otp', 'EFGH');
    await flush();
    assert.deepEqual((await snapshot()).events.otpFinish, ['ABCD', 'EFGH']);
    await otpInputs.nth(0).evaluate(input => {
        const transfer = new DataTransfer();
        transfer.setData('text/plain', 'JKLM');
        input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
    });
    await flush();
    assert.equal((await snapshot()).otp, 'JKLM');
    await set('otp', 'AB');
    await flush();
    await otpInputs.nth(0).press('ArrowLeft');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-otp-index')), '1', 'RTL ArrowLeft advances to the next logical OTP field');
    await otpInputs.nth(1).press('Delete');
    await flush();
    assert.equal((await snapshot()).otp, 'A', 'Delete removes the current character');
    await otpInputs.nth(0).press('Backspace');
    await flush();
    assert.equal((await snapshot()).otp, '__undefined__', 'clearing the last character returns the local model to undefined');
    await page.evaluate(() => window.numericControlsProtocol.reset('otp'));
    await flush();
    assert.equal((await snapshot()).otp, null, 'form-control reset restores the established null empty value');

    const patternControl = page.locator('.ui-otp-input').nth(1);
    const patternInputs = patternControl.locator('input');
    await patternInputs.first().fill('a');
    await flush();
    assert.equal((await snapshot()).patternOtp, '', 'custom pattern rejects unmatched lower-case input');
    await patternInputs.first().fill('X');
    await patternInputs.nth(1).fill('Y');
    await flush();
    assert.equal((await snapshot()).patternOtp, 'XY');
    assert.deepEqual((await snapshot()).events.patternFinish, ['XY']);
    assert.equal(await patternInputs.first().getAttribute('type'), 'text');
    assert.equal(await page.locator('.ui-otp-input').nth(4).locator('input').first().getAttribute('type'), 'number');
    assert.equal(await page.locator('.ui-otp-input').nth(4).locator('input').first().getAttribute('inputmode'), 'numeric');
    await page.locator('.ui-otp-input').nth(4).locator('input').nth(1).fill('2');
    await flush();
    const numericOtpValue = (await snapshot()).numericOtp;
    assert.equal(numericOtpValue, '12');
    assert.equal(typeof numericOtpValue, 'string', 'number-like OTP input still emits the standard string model');
    assert.equal(await page.locator('.ui-otp-input').nth(5).locator('input').first().getAttribute('type'), 'password');
    assert.equal(await page.locator('.ui-otp-input').nth(6).locator('input').first().getAttribute('type'), 'password');
    assert.equal(await page.locator('.ui-otp-input').nth(7).locator('input').first().getAttribute('placeholder'), '•');
    assert.equal(await page.locator('.ui-otp-input').nth(7).locator('input').nth(1).getAttribute('placeholder'), '•', 'placeholder is consumed on every field');
    assert.equal(await patternControl.locator('.otp-loader-slot').textContent(), 'Loading');

    for (const [id, index] of [['readonlyOtp', 2], ['disabledOtp', 3]]) {
        const input = page.locator('.ui-otp-input').nth(index).locator('input').first();
        const before = (await snapshot())[id];
        await input.evaluate(node => {
            node.value = 'X';
            node.dispatchEvent(new Event('input', { bubbles: true }));
            const transfer = new DataTransfer();
            transfer.setData('text/plain', 'YZ');
            node.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
        });
        await flush();
        assert.equal((await snapshot())[id], before, `${id} rejects input and paste`);
        assert.equal(await input.inputValue(), before[0]);
    }
    await set('resizeAutofocus', true);
    await flush();
    assert.equal(await page.locator('.ui-otp-input').nth(9).locator('input').first().evaluate(input => document.activeElement === input), true, 'enabling autofocus focuses the first mounted field');
    await set('resizeLength', 2);
    await flush();
    assert.equal(await page.locator('.ui-otp-input').nth(9).locator('input').count(), 2);
    assert.equal((await snapshot()).refs.resizeOtp.count, 2, 'removed OTP fields release their refs when length shrinks');
    assert.equal(await page.locator('.ui-otp-input').nth(9).locator('input').first().evaluate(input => document.activeElement === input), true, 'autofocus follows a length change');
    await page.locator('.ui-otp-input').nth(10).locator('input').first().evaluate(input => {
        input.value = 'WXYZ';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        window.numericControlsProtocol.set('staleLength', 5);
    });
    await flush();
    state = await snapshot();
    assert.equal(state.staleOtp, 'WXYZ');
    assert.deepEqual(state.events.staleFinish, [], 'a queued completion is canceled when the length changes before it can finish');
    const customFields = page.locator('.ui-otp-input').nth(11).locator('.otp-fields-slot');
    assert.equal(await customFields.textContent(), '|:false');
    await customFields.click();
    await flush();
    assert.equal((await snapshot()).fieldsOtp, 'Z', 'the fields slot receives its update function and current cells');
    const fallbackLoader = page.locator('.ui-otp-input').nth(12).locator('.ui-otp-loader .u-progress-circular');
    assert.equal(await fallbackLoader.count(), 1);
    assert.equal(await fallbackLoader.getAttribute('class').then(value => value.includes('is-indeterminate')), true);
    assert.equal(await fallbackLoader.evaluate(el => el.style.width), '24px');
    assert.equal(await page.locator('.ui-otp-input').nth(12).getAttribute('aria-busy'), 'true');
    report.checks.push('OTP text/number/password/masked types, placeholder per field, custom pattern, focusAll/divider/default/fields/custom and fallback loader slots, RTL movement, deletion, paste, finish, autofocus, guards, length refs and stale completion cancellation');

    assert.deepEqual(report.warnings, [], 'fixture should have no Vue warnings');
    assert.deepEqual(report.errors, [], 'fixture should have no runtime errors');
} catch (error) {
    report.failure = error instanceof Error ? error.stack : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    if (browser) await browser.close();
    await server.close();
}

process.stdout.write(JSON.stringify({ checks: report.checks.length, evidence: path.relative(root, evidence).split(path.sep).join('/'), sources: sourceFiles.length }));
