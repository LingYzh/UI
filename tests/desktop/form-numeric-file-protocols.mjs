import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/form-numeric-file-protocols');
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixture = `<!doctype html>
<html lang="zh">
<head><meta charset="utf-8"><title>Numeric and file consumer protocols</title></head>
<body><div id="app"></div><script type="module">
import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/styles.css';

const state = reactive({
    number: null,
    slider: 42,
    range: [20, 80],
    rating: 0,
    otp: '12',
    fileInput: null,
    fileUpload: [],
    acceptOnlyInput: null,
    precedenceInput: null,
    dynamicFilterInput: null,
    dynamicFilterByType: 'image/*',
    readonlyFileInput: null,
    readonlyFileUpload: [],
    disabledFileInput: null,
    disabledFileUpload: []
});
const refs = Object.fromEntries(Object.keys(state).map(key => [key, ref()]));
const defaultRefs = {
    number: ref(),
    range: ref(),
    singleFileInput: ref(),
    multipleFileInput: ref(),
    fileUpload: ref(),
    multipleFileUpload: ref(),
    legacyArrayFileUpload: ref()
};
const formRef = ref();
const events = reactive({
    otpFinish: [],
    fileInputRejected: [],
    fileInputRejectedDetails: [],
    fileInputChanges: [],
    fileUploadRejected: [],
    fileUploadRejectedDetails: [],
    fileUploadChanges: [],
    acceptOnlyInputChanges: [],
    precedenceInputRejected: [],
    dynamicFilterInputRejected: [],
    singleUploadModels: [],
    singleUploadRejected: [],
    singleUploadRejectedDetails: [],
    singleUploadChanges: [],
    multipleUploadModels: [],
    multipleUploadChanges: [],
    legacyArrayUploadModels: []
});
function names(value) {
    return value == null ? null : (Array.isArray(value) ? value : [value]).map(file => file.name);
}
function rejectedNames(files) { return files.map(file => file.name); }
function rejectedDetails(entries) { return entries.map(({ file, reason }) => ({ name: file.name, reason })); }
function uploadOutput(value) { return value == null ? null : Array.isArray(value) ? value.map(file => file.name) : value.name; }
function bind(key, extra = {}) {
    return {
        id: key.replace(/[A-Z]/g, match => '-' + match.toLowerCase()),
        ref: refs[key],
        modelValue: state[key],
        'onUpdate:modelValue': value => { state[key] = value; },
        ...extra
    };
}
const Root = defineComponent({
    setup() {
        window.formNumericFileProtocol = {
            registry: {
                UNumberInput: Boolean(UI.UNumberInput),
                USlider: Boolean(UI.USlider),
                URangeSlider: Boolean(UI.URangeSlider),
                URating: Boolean(UI.URating),
                UOtpInput: Boolean(UI.UOtpInput),
                UFileInput: Boolean(UI.UFileInput),
                UFileUpload: Boolean(UI.UFileUpload)
            },
            modelDefaults() {
                const read = instanceRef => instanceRef.value.$.setupState.model;
                return {
                    number: read(defaultRefs.number),
                    numberPrecision: defaultRefs.number.value.$.props.precision,
                    range: [...read(defaultRefs.range)],
                    singleFileInput: read(defaultRefs.singleFileInput),
                    multipleFileInput: [...read(defaultRefs.multipleFileInput)],
                    fileUpload: read(defaultRefs.fileUpload),
                    multipleFileUpload: read(defaultRefs.multipleFileUpload)
                };
            },
            async flush() { await nextTick(); await nextTick(); },
            set(key, value) { state[key] = value; },
            reset(key) { return refs[key].value.reset(); },
            resetForm() { return formRef.value.reset(); },
            receiveDefault(key, files) { return defaultRefs[key].value.receive(files); },
            callDefault(key, method, ...args) { return defaultRefs[key].value[method](...args); },
            resetDefault(key) { return defaultRefs[key].value.reset(); },
            async dropThenReset() {
                const file = new File(['slow'], 'late.png', { type: 'image/png' });
                const entry = {
                    isFile: true,
                    name: file.name,
                    file(success) { setTimeout(() => success(file), 120); }
                };
                const event = {
                    preventDefault() {},
                    dataTransfer: {
                        items: [{ kind: 'file', webkitGetAsEntry: () => entry }],
                        files: []
                    }
                };
                const pendingDrop = refs.fileUpload.value.drop(event);
                await new Promise(resolve => setTimeout(resolve, 10));
                await refs.fileUpload.value.reset();
                await pendingDrop;
                await nextTick();
            },
            async dropInputThenReset() {
                const file = new File(['slow'], 'late.png', { type: 'image/png' });
                const entry = {
                    isFile: true,
                    name: file.name,
                    file(success) { setTimeout(() => success(file), 120); }
                };
                const transfer = new DataTransfer();
                Object.defineProperty(transfer.items.add(file), 'webkitGetAsEntry', { value: () => entry });
                document.querySelector('#file-input').closest('.ui-file-input').dispatchEvent(new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: transfer
                }));
                await new Promise(resolve => setTimeout(resolve, 10));
                await refs.fileInput.value.reset();
                await new Promise(resolve => setTimeout(resolve, 140));
                await nextTick();
            },
            receive(key, files) { return refs[key].value.receive(files); },
            snapshot() {
                const fileNames = value => value == null ? [] : (Array.isArray(value) ? value : [value]).map(file => file.name);
                return {
                    number: state.number,
                    slider: state.slider,
                    range: state.range,
                    rating: state.rating,
                    otp: state.otp,
                    fileInput: fileNames(state.fileInput),
                    fileUpload: fileNames(state.fileUpload),
                    acceptOnlyInput: fileNames(state.acceptOnlyInput),
                    precedenceInput: fileNames(state.precedenceInput),
                    dynamicFilterInput: fileNames(state.dynamicFilterInput),
                    readonlyFileInput: fileNames(state.readonlyFileInput),
                    readonlyFileUpload: fileNames(state.readonlyFileUpload),
                    disabledFileInput: fileNames(state.disabledFileInput),
                    disabledFileUpload: fileNames(state.disabledFileUpload),
                    events: {
                        otpFinish: [...events.otpFinish],
                        fileInputRejected: [...events.fileInputRejected],
                        fileInputRejectedDetails: [...events.fileInputRejectedDetails],
                        fileInputChanges: [...events.fileInputChanges],
                        fileUploadRejected: [...events.fileUploadRejected],
                        fileUploadRejectedDetails: [...events.fileUploadRejectedDetails],
                        fileUploadChanges: [...events.fileUploadChanges],
                        acceptOnlyInputChanges: [...events.acceptOnlyInputChanges],
                        precedenceInputRejected: [...events.precedenceInputRejected],
                        dynamicFilterInputRejected: [...events.dynamicFilterInputRejected],
                        singleUploadModels: [...events.singleUploadModels],
                        singleUploadRejected: [...events.singleUploadRejected],
                        singleUploadRejectedDetails: [...events.singleUploadRejectedDetails],
                        singleUploadChanges: [...events.singleUploadChanges],
                        multipleUploadModels: [...events.multipleUploadModels],
                        multipleUploadChanges: [...events.multipleUploadChanges],
                        legacyArrayUploadModels: [...events.legacyArrayUploadModels]
                    }
                };
            }
        };
        return () => h('main', [
            h(UI.UNumberInput, bind('number', { min: 5, max: 8, step: 0.5, precision: 1 })),
            h(UI.USlider, bind('slider')),
            h(UI.URangeSlider, bind('range', { min: 10, max: 90 })),
            h(UI.URating, bind('rating', { length: 2.5, precision: 0.5, clearable: true })),
            h(UI.UOtpInput, bind('otp', { length: 4, numeric: true, onFinish: value => events.otpFinish.push(value) })),
            h(UI.UForm, { ref: formRef }, { default: () => [
                h(UI.UFileInput, bind('fileInput', { accept: 'image/*', filterByType: 'image/*', maxSize: 4, onRejected: files => events.fileInputRejected.push(rejectedNames(files)), onRejectedDetails: entries => events.fileInputRejectedDetails.push(rejectedDetails(entries)), onChange: files => events.fileInputChanges.push(rejectedNames(files)) })),
                h(UI.UFileUpload, bind('fileUpload', { accept: 'image/*', filterByType: 'image/*', multiple: true, maxSize: 4, 'onUpdate:modelValue': value => { state.fileUpload = value; events.multipleUploadModels.push(uploadOutput(value)); }, onRejected: files => events.fileUploadRejected.push(rejectedNames(files)), onRejectedDetails: entries => events.fileUploadRejectedDetails.push(rejectedDetails(entries)), onChange: files => events.fileUploadChanges.push(rejectedNames(files)) }))
            ] }),
            h(UI.UFileInput, bind('acceptOnlyInput', { accept: 'image/*', onChange: files => events.acceptOnlyInputChanges.push(rejectedNames(files)) })),
            h(UI.UFileInput, bind('precedenceInput', { accept: 'text/plain', filterByType: '.png', onRejected: files => events.precedenceInputRejected.push(rejectedNames(files)) })),
            h(UI.UFileInput, bind('dynamicFilterInput', { accept: 'image/*', filterByType: state.dynamicFilterByType, onRejected: files => events.dynamicFilterInputRejected.push(rejectedNames(files)) })),
            h(UI.UFileInput, bind('readonlyFileInput', { readonly: true, accept: 'image/*', filterByType: 'image/*' })),
            h(UI.UFileUpload, bind('readonlyFileUpload', { readonly: true, accept: 'image/*', filterByType: 'image/*', multiple: true })),
            h(UI.UFileInput, bind('disabledFileInput', { disabled: true, accept: 'image/*', filterByType: 'image/*' })),
            h(UI.UFileUpload, bind('disabledFileUpload', { disabled: true, accept: 'image/*', filterByType: 'image/*', multiple: true })),
            h(UI.URangeSlider, { ref: defaultRefs.range, id: 'omitted-range' }),
            h(UI.UFileInput, { ref: defaultRefs.singleFileInput, id: 'omitted-file-single' }),
            h(UI.UFileInput, { ref: defaultRefs.multipleFileInput, id: 'omitted-file-multiple', multiple: true }),
            h(UI.UFileUpload, { ref: defaultRefs.fileUpload, id: 'omitted-file-upload', 'onUpdate:modelValue': value => events.singleUploadModels.push(uploadOutput(value)), onRejected: files => events.singleUploadRejected.push(rejectedNames(files)), onRejectedDetails: entries => events.singleUploadRejectedDetails.push(rejectedDetails(entries)), onChange: files => events.singleUploadChanges.push(rejectedNames(files)) }),
            h(UI.UFileUpload, { ref: defaultRefs.multipleFileUpload, id: 'omitted-file-upload-multiple', multiple: true, 'onUpdate:modelValue': value => events.multipleUploadModels.push(uploadOutput(value)), onChange: files => events.multipleUploadChanges.push(rejectedNames(files)) }),
            h(UI.UFileUpload, { ref: defaultRefs.legacyArrayFileUpload, id: 'legacy-array-file-upload', multiple: false, modelValue: [new File(['legacy'], 'legacy.txt', { type: 'text/plain' })], 'onUpdate:modelValue': value => events.legacyArrayUploadModels.push(uploadOutput(value)) }),
            h(UI.UNumberInput, { ref: defaultRefs.number, id: 'omitted-number' })
        ]);
    }
});
createApp(Root).use(UI.createUI()).mount('#app');
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
        name: 'form-numeric-file-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use('/__form_numeric_file_protocols', async (_request, response) => {
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__form_numeric_file_protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/UNumberInput.vue',
    'src/ui/USlider.vue',
    'src/ui/URangeSlider.vue',
    'src/ui/URating.vue',
    'src/ui/UOtpInput.vue',
    'src/ui/UFileInput.vue',
    'src/ui/UFileUpload.vue',
    'src/ui/file-drop.ts',
    'src/ui/specialized-inputs.ts',
    'src/ui/form.ts',
    'src/ui/index.ts',
    'tests/desktop/form-numeric-file-protocols.mjs',
    'tests/tsconfig.form-numeric-file.json'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')
])));

await server.listen();
const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: `http://127.0.0.1:${server.httpServer.address().port}/__form_numeric_file_protocols`
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
const errors = [];
const warnings = [];
const checks = [];
const report = {
    generatedAt: new Date().toISOString(),
    method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron DOM interactions',
    evidence,
    sourceSha256,
    checks,
    errors,
    warnings
};

async function flush() {
    await page.evaluate(() => window.formNumericFileProtocol.flush());
}

async function setFiles(selector, files) {
    await page.locator(selector).evaluate((input, descriptors) => {
        const transfer = new DataTransfer();
        for (const descriptor of descriptors) {
            transfer.items.add(new File([descriptor.contents], descriptor.name, { type: descriptor.type }));
        }
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, files);
    await flush();
}

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: root, env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
        if (message.type() === 'warning' || message.text().includes('[Vue warn]')) warnings.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.formNumericFileProtocol));
    assert.deepEqual(await page.evaluate(() => window.formNumericFileProtocol.registry), {
        UNumberInput: true,
        USlider: true,
        URangeSlider: true,
        URating: true,
        UOtpInput: true,
        UFileInput: true,
        UFileUpload: true
    });
    checks.push('all seven consumers mount through the public index and createUI');
    assert.deepEqual(await page.evaluate(() => window.formNumericFileProtocol.modelDefaults()), {
        number: null,
        numberPrecision: undefined,
        range: [0, 0],
        singleFileInput: null,
        multipleFileInput: [],
        fileUpload: null,
        multipleFileUpload: null
    }, 'omitted models use the agreed range and file defaults');
    checks.push('range/file model defaults with omitted modelValue');

    const numberButtons = page.locator('.ui-number-input button.ui-control-step');
    assert.equal(await numberButtons.nth(0).isEnabled(), true, 'null number model keeps decrement available before the first value');
    assert.equal(await numberButtons.nth(1).isEnabled(), true, 'null number model keeps increment available before the first value');
    await numberButtons.nth(1).click();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).number, 5, 'first step clamps zero into min instead of adding a step to min');
    await numberButtons.nth(1).dispatchEvent('pointerdown', { pointerId: 9, button: 0, bubbles: true });
    await page.waitForTimeout(625);
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, button: 0, bubbles: true })));
    await numberButtons.nth(1).dispatchEvent('click', { bubbles: true, cancelable: true, detail: 1 });
    await flush();
    const heldNumber = (await page.evaluate(() => window.formNumericFileProtocol.snapshot())).number;
    assert.ok(heldNumber >= 6.5 && heldNumber <= 7.5, `pointer hold should repeat after the initial step, got ${heldNumber}`);
    const numberInput = page.locator('#number');
    await numberInput.fill('invalid');
    await numberInput.blur();
    await flush();
    assert.equal(await numberInput.inputValue(), String(heldNumber), 'blur restores invalid text to the model');
    await numberInput.fill('invalid');
    await page.evaluate(() => window.formNumericFileProtocol.reset('number'));
    await flush();
    assert.equal(await numberInput.inputValue(), '', 'reset clears invalid numeric text instead of preserving it');
    await numberInput.fill('');
    await numberInput.blur();
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).number, null, 'committing an empty number updates the model to null');
    await numberButtons.nth(0).click();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).number, 5, 'either step from null initializes to the clamped zero value');
    checks.push('number min/max null initialization, invalid blur/reset, empty commit, decimal stepping and held repeat');

    await page.evaluate(() => Promise.all([
        window.formNumericFileProtocol.reset('slider'),
        window.formNumericFileProtocol.reset('range')
    ]));
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).slider, null);
    assert.deepEqual(await page.locator('.ui-range-slider-control').first().locator('.ui-range-slider-values output').allTextContents(), ['10', '10'], 'null range reset clears both projected values to the minimum');
    assert.equal(await page.locator('input[type="range"]').first().inputValue(), '0', 'null single-slider reset remains a safe scalar projection');
    checks.push('single and range slider null resets render without array projection errors');
    const sliderInput = page.locator('.ui-slider-control input');
    assert.equal(await sliderInput.getAttribute('step'), 'any');
    await sliderInput.evaluate(input => { input.value = '42.125'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).slider, 42.125);
    await page.evaluate(() => window.formNumericFileProtocol.set('range', [20.125, 80.875]));
    await flush();
    assert.deepEqual(await page.locator('.ui-range-slider-control').first().locator('.ui-range-slider-values output').allTextContents(), ['20.125', '80.875']);
    checks.push('continuous default slider values preserve fractional precision');

    const otpInputs = page.locator('.ui-otp-input input');
    await otpInputs.nth(0).fill('x');
    await flush();
    assert.equal(await otpInputs.nth(0).inputValue(), '1', 'numeric OTP rejects invalid text and restores the rendered cell');
    await otpInputs.nth(0).press('Delete');
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).otp, '2', 'Delete removes the current OTP cell');
    await page.evaluate(() => window.formNumericFileProtocol.set('otp', '12'));
    await flush();
    await otpInputs.nth(0).evaluate(input => {
        const transfer = new DataTransfer();
        transfer.setData('text/plain', ' 3456 ');
        input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
    });
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).otp, '3456');
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.otpFinish, ['3456'], 'paste completion emits once');
    await otpInputs.nth(0).fill('');
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).otp, '456', 'clearing a cell removes its model character');
    checks.push('OTP invalid input restoration, Delete, trimmed paste, completion and cell clearing');

    const ratingButtons = page.locator('.ui-rating button.ui-rating-star');
    await ratingButtons.nth(1).click();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).rating, 2);
    await ratingButtons.nth(1).click();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).rating, 0, 'clearable toggles the selected rating off');
    await page.evaluate(() => window.formNumericFileProtocol.set('rating', 1));
    await flush();
    await page.locator('.ui-rating button[tabindex="0"]').focus();
    await page.keyboard.press('ArrowUp');
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).rating, 1.5, 'fractional precision supports half-step keyboard changes');
    await page.keyboard.press('End');
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).rating, 2.5, 'noninteger length remains the keyboard maximum');
    assert.equal(await page.locator('.ui-rating button[tabindex="0"]').count(), 1, 'noninteger max keeps one visible star in the tab sequence');
    checks.push('rating clearable, half-step precision, fractional maximum and roving tab stop');

    const validFile = [{ name: 'same.png', contents: 'ok', type: 'image/png' }];
    await setFiles('#file-input', validFile);
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileInput, ['same.png']);
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.fileInputChanges.length, 1, 'native input change emits one change event');
    assert.notEqual(await page.locator('#file-input').inputValue(), '', 'accepted file remains selected for native form submission');
    await page.evaluate(() => window.formNumericFileProtocol.resetForm());
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileInput, []);
    assert.equal(await page.locator('#file-input').inputValue(), '', 'reset clears the native file input');
    await setFiles('#file-input', validFile);
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileInput, ['same.png'], 'the same file can be selected again after reset');
    await page.locator('#file-input').dispatchEvent('cancel');
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileInput, ['same.png'], 'cancel preserves the existing selection');
    await setFiles('#file-input', [{ name: 'wrong.txt', contents: 'x', type: 'text/plain' }]);
    const afterRejectedInput = await page.evaluate(() => window.formNumericFileProtocol.snapshot());
    assert.deepEqual(afterRejectedInput.events.fileInputRejected, [['wrong.txt']], 'rejected emits raw File[] names');
    assert.deepEqual(afterRejectedInput.events.fileInputRejectedDetails, [[{ name: 'wrong.txt', reason: 'type' }]], 'rejected-details retains the structured reason');
    assert.equal(await page.locator('#file-input').inputValue(), '', 'a rejected file does not trap the native input value');
    const inputDropState = await page.locator('#file-input').evaluate(input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['drop'], 'dropped.png', { type: 'image/png' }));
        const root = input.closest('.ui-file-input');
        const dragOver = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: transfer });
        root.dispatchEvent(dragOver);
        const drop = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer });
        root.dispatchEvent(drop);
        return { dragOverPrevented: dragOver.defaultPrevented, dropPrevented: drop.defaultPrevented };
    });
    await flush();
    assert.deepEqual(inputDropState, { dragOverPrevented: true, dropPrevented: true });
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileInput, ['dropped.png'], 'file input accepts file drops and retains accepted FileList');
    await page.evaluate(() => window.formNumericFileProtocol.dropInputThenReset());
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileInput, [], 'a slow file-input drop cannot repopulate the model after reset');
    const inputPasteState = await page.locator('#file-input').evaluate(input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['p'], 'pasted.png', { type: 'image/png' }));
        const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer });
        input.dispatchEvent(paste);
        return paste.defaultPrevented;
    });
    assert.equal(inputPasteState, true);
    await page.waitForFunction(() => window.formNumericFileProtocol.snapshot().fileInput.includes('pasted.png'));
    checks.push('file input reset/reselection, cancel preservation, filtering, rejected cleanup, drop/paste and async-reset cancellation');

    await setFiles('#file-upload', validFile);
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileUpload, ['same.png']);
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.fileUploadChanges.length, 1, 'native upload change emits one change event');
    await page.evaluate(() => window.formNumericFileProtocol.reset('fileUpload'));
    await flush();
    assert.equal(await page.locator('#file-upload').inputValue(), '', 'upload reset clears the native input');
    await setFiles('#file-upload', validFile);
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileUpload, ['same.png']);
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.fileUploadChanges.length, 2, 'reselection after reset emits one more change event');
    await page.locator('#file-upload').evaluate(input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['drop'], 'dropped.png', { type: 'image/png' }));
        input.closest('.ui-file-upload').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    });
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileUpload, ['same.png', 'dropped.png'], 'drop accepts valid files and appends in multiple mode');
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.fileUploadChanges.length, 3, 'drop emits one change event');
    const uploadPastePrevented = await page.locator('#file-upload').evaluate(input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['p'], 'pasted.png', { type: 'image/png' }));
        const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer });
        input.dispatchEvent(paste);
        return paste.defaultPrevented;
    });
    assert.equal(uploadPastePrevented, true);
    await page.waitForFunction(() => window.formNumericFileProtocol.snapshot().fileUpload.includes('pasted.png'));
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileUpload, ['same.png', 'dropped.png', 'pasted.png']);
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.fileUploadChanges.length, 4, 'paste emits one change event');
    await page.evaluate(() => window.formNumericFileProtocol.dropThenReset());
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).fileUpload, [], 'a slow asynchronous drop cannot repopulate the model after reset');
    await page.evaluate(() => window.formNumericFileProtocol.receive('readonlyFileInput', [new File(['blocked'], 'blocked.png', { type: 'image/png' })]));
    await page.locator('#readonly-file-upload').evaluate(input => {
        const file = new File(['blocked'], 'blocked.png', { type: 'image/png' });
        input.closest('.ui-file-upload').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: (() => { const transfer = new DataTransfer(); transfer.items.add(file); return transfer; })() }));
    });
    await setFiles('#disabled-file-input', validFile);
    await page.locator('#disabled-file-upload').evaluate(input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['blocked'], 'blocked.png', { type: 'image/png' }));
        input.closest('.ui-file-upload').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    });
    const readonlyFiles = await page.evaluate(() => window.formNumericFileProtocol.snapshot());
    assert.deepEqual(readonlyFiles.readonlyFileInput, []);
    assert.deepEqual(readonlyFiles.readonlyFileUpload, []);
    assert.deepEqual(readonlyFiles.disabledFileInput, []);
    assert.deepEqual(readonlyFiles.disabledFileUpload, []);
    checks.push('file upload reset/reselection, multiple drop, and disabled/readonly selection/drop guards');

    await page.evaluate(() => window.formNumericFileProtocol.receive('acceptOnlyInput', [new File(['text'], 'accepted-by-accept.txt', { type: 'text/plain' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).acceptOnlyInput, ['accepted-by-accept.txt'], 'accept alone configures the native picker but does not reject programmatic/drop input');
    assert.equal(await page.locator('#accept-only-input').getAttribute('accept'), 'image/*');
    await page.evaluate(() => window.formNumericFileProtocol.receive('precedenceInput', [new File(['png'], 'precedence.png', { type: 'text/plain' })]));
    await flush();
    assert.equal(await page.locator('#precedence-input').getAttribute('accept'), '.png', 'filterByType takes precedence over accept for the native picker');
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).precedenceInput, ['precedence.png'], 'filterByType validates extensions independently of MIME');
    await page.evaluate(() => window.formNumericFileProtocol.receive('precedenceInput', [new File(['text'], 'rejected.txt', { type: 'text/plain' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).precedenceInput, []);
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.precedenceInputRejected, [['rejected.txt']]);

    await page.evaluate(() => window.formNumericFileProtocol.receive('dynamicFilterInput', [new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).dynamicFilterInput, ['photo.jpg'], 'MIME wildcard filter accepts its type family');
    await page.evaluate(() => window.formNumericFileProtocol.set('dynamicFilterByType', 'application/json'));
    await flush();
    assert.equal(await page.locator('#dynamic-filter-input').getAttribute('accept'), 'application/json', 'filterByType changes update the native accept value');
    await page.evaluate(() => window.formNumericFileProtocol.receive('dynamicFilterInput', [new File(['{}'], 'data.json', { type: 'application/json' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).dynamicFilterInput, ['data.json'], 'exact MIME type is accepted after a reactive filter change');
    await page.evaluate(() => window.formNumericFileProtocol.set('dynamicFilterByType', '.png'));
    await flush();
    await page.evaluate(() => window.formNumericFileProtocol.receive('dynamicFilterInput', [new File(['bytes'], 'opaque.png', { type: '' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).dynamicFilterInput, ['opaque.png'], 'extension filter accepts files with an empty MIME type');
    await page.evaluate(() => window.formNumericFileProtocol.set('dynamicFilterByType', ''));
    await flush();
    assert.equal(await page.locator('#dynamic-filter-input').getAttribute('accept'), '', 'an explicit empty filter remains the native accept value because filterByType is present');
    await page.evaluate(() => window.formNumericFileProtocol.receive('dynamicFilterInput', [new File(['plain'], 'plain.unknown', { type: '' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).dynamicFilterInput, ['plain.unknown'], 'empty filter accepts files regardless of MIME');

    await page.evaluate(() => window.formNumericFileProtocol.receive('fileInput', [new File(['too large'], 'large.png', { type: 'image/png' })]));
    await page.evaluate(() => window.formNumericFileProtocol.receive('fileUpload', [new File(['wrong'], 'wrong.txt', { type: 'text/plain' })]));
    await page.evaluate(() => window.formNumericFileProtocol.receive('fileUpload', [new File(['too large'], 'large.png', { type: 'image/png' })]));
    await flush();
    const fileRejects = await page.evaluate(() => window.formNumericFileProtocol.snapshot().events);
    assert.ok(fileRejects.fileInputRejected.some(batch => batch.includes('large.png')));
    assert.ok(fileRejects.fileInputRejectedDetails.some(batch => batch.some(item => item.name === 'large.png' && item.reason === 'size')));
    assert.ok(fileRejects.fileUploadRejected.some(batch => batch.includes('wrong.txt')));
    assert.ok(fileRejects.fileUploadRejectedDetails.some(batch => batch.some(item => item.name === 'wrong.txt' && item.reason === 'type')));
    assert.ok(fileRejects.fileUploadRejectedDetails.some(batch => batch.some(item => item.name === 'large.png' && item.reason === 'size')));
    checks.push('accept is picker-only; filterByType overrides it, reacts to changes, supports extension/MIME/wildcard/empty MIME, and rejected channels carry raw files plus detail reasons');

    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('fileUpload', [
        new File(['first'], 'single-first.txt', { type: 'text/plain' }),
        new File(['second'], 'single-extra.txt', { type: 'text/plain' })
    ]));
    await flush();
    const singleUploadState = await page.evaluate(() => window.formNumericFileProtocol.snapshot().events);
    assert.equal(singleUploadState.singleUploadModels.at(-1), 'single-first.txt', 'single upload emits a File model even when the accepted set is an array');
    assert.deepEqual(singleUploadState.singleUploadChanges.at(-1), ['single-first.txt']);
    assert.deepEqual(singleUploadState.singleUploadRejected.at(-1), ['single-extra.txt']);
    assert.deepEqual(singleUploadState.singleUploadRejectedDetails.at(-1), [{ name: 'single-extra.txt', reason: 'multiple' }], 'single-file constraints keep the detail reason while rejected emits raw files');
    assert.equal(singleUploadState.singleUploadChanges.length, 1, 'one receive emits one change event');
    assert.deepEqual(singleUploadState.legacyArrayUploadModels, [], 'legacy array input is accepted before the first write');
    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('legacyArrayFileUpload', [new File(['new'], 'single-output.txt', { type: 'text/plain' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.legacyArrayUploadModels, ['single-output.txt'], 'single output shape follows multiple=false even when the initial model was an array');
    await page.evaluate(() => window.formNumericFileProtocol.callDefault('fileUpload', 'remove', 0));
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.singleUploadModels.at(-1), null, 'single remove emits null');
    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('fileUpload', [new File(['again'], 'single-again.txt', { type: 'text/plain' })]));
    await page.evaluate(() => window.formNumericFileProtocol.callDefault('fileUpload', 'clear'));
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.singleUploadModels.at(-1), null, 'single clear emits null');
    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('fileUpload', [new File(['reset'], 'single-reset.txt', { type: 'text/plain' })]));
    await page.evaluate(() => window.formNumericFileProtocol.resetDefault('fileUpload'));
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.singleUploadModels.at(-1), null, 'single reset returns to the null default');

    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('multipleFileUpload', [new File(['multi'], 'multiple.png', { type: 'image/png' })]));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.multipleUploadModels.at(-1), ['multiple.png'], 'multiple upload emits File[]');
    await page.evaluate(() => window.formNumericFileProtocol.callDefault('multipleFileUpload', 'remove', 0));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.multipleUploadModels.at(-1), []);
    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('multipleFileUpload', [new File(['multi'], 'multiple-again.png', { type: 'image/png' })]));
    await page.evaluate(() => window.formNumericFileProtocol.callDefault('multipleFileUpload', 'clear'));
    await flush();
    assert.deepEqual((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.multipleUploadModels.at(-1), [], 'multiple clear emits an empty array');
    await page.evaluate(() => window.formNumericFileProtocol.receiveDefault('multipleFileUpload', [new File(['multi'], 'multiple-reset.png', { type: 'image/png' })]));
    await page.evaluate(() => window.formNumericFileProtocol.resetDefault('multipleFileUpload'));
    await flush();
    assert.equal((await page.evaluate(() => window.formNumericFileProtocol.snapshot())).events.multipleUploadModels.at(-1), null, 'multiple reset returns to the null default');
    checks.push('single and multiple upload defaults, model outputs, legacy single-array input, remove, clear and reset semantics');

    assert.deepEqual(errors, [], 'fixture should have no runtime errors');
    assert.equal(warnings.some(message => message.includes('[Vue warn]')), false, 'fixture should have no Vue warnings');
    assert.equal(warnings.some(message => /update:focused/i.test(message)), false, 'focused event channel is declared');
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    process.stdout.write(JSON.stringify({ checks: checks.length, evidence: path.relative(root, evidence).split(path.sep).join('/'), sourceCount: sourceFiles.length }));
} catch (error) {
    report.failure = error instanceof Error ? error.stack : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    if (app) {
        const closed = await Promise.race([
            app.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) app.process().kill();
    }
    await server.close();
}
