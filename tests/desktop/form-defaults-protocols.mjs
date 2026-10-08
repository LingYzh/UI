import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/form-defaults-protocols');
const profile = path.join(evidence, 'profile');
await mkdir(profile, { recursive: true });

const fixture = `<!doctype html>
<html lang="zh">
<head><meta charset="utf-8"><title>Form consumer protocols</title></head>
<body><div id="app"></div><script type="module">
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/docs-base.css';
import '/src/ui/styles.css';

const initialValues = {
    checkbox: true,
    switch: true,
    radio: 'selected',
    checkboxGroup: ['selected'],
    radioGroup: 'selected',
    selectionGroup: 'selected',
    selectNative: 'selected',
    selectClearable: 'selected',
    autocomplete: 'selected',
    combobox: 'selected',
    cascader: ['selected'],
    colorInput: '#ff0000',
    colorPicker: '#ff0000',
    colorSwatches: '#c2553f',
    fileInput: null,
    fileUpload: [],
    number: 7,
    otp: '123',
    slider: 25,
    rangeSlider: [20, 80],
    rating: 3,
    asyncValidation: ''
};
const models = Object.fromEntries(Object.entries(initialValues).map(([key, value]) => [key, ref(value)]));
const componentRefs = Object.fromEntries(Object.keys(initialValues).map(key => [key, ref()]));
const focusValues = Object.fromEntries(Object.keys(initialValues).map(key => [key, ref(false)]));
const focusEvents = Object.fromEntries(Object.keys(initialValues).map(key => [key, []]));
const revision = ref(0);

function bind(id, extra = {}) {
    return {
        id,
        ref: componentRefs[id],
        modelValue: models[id].value,
        'onUpdate:modelValue': value => { models[id].value = value; },
        focused: focusValues[id].value,
        'onUpdate:focused': value => { focusEvents[id].push(value); focusValues[id].value = value; },
        ...extra
    };
}

function renderConsumers() {
    // Recreate this array and callback on every parent render. Equivalent inline
    // validators must survive that child update while a validation is pending.
    const asyncRules = [async value => {
        await new Promise(resolve => setTimeout(resolve, 120));
        return value ? true : 'async required';
    }];
    return h('main', { 'data-revision': revision.value }, [
        h('section', { id: 'consumer-fields', class: 'fixture-panel' }, [
            h('h2', 'Public form consumers'),
            h(UI.UCheckbox, bind('checkbox', { value: 'selected' }), () => 'Checkbox'),
            h(UI.USwitch, bind('switch', { value: 'selected' }), () => 'Switch'),
            h(UI.URadio, bind('radio', { value: 'selected' }), () => 'Radio'),
            h(UI.UCheckboxGroup, bind('checkboxGroup'), { default: () => [h(UI.USelectionControl, { type: 'checkbox', value: 'selected', label: 'Checkbox group option' })] }),
            h(UI.URadioGroup, bind('radioGroup'), { default: () => [h(UI.USelectionControl, { type: 'radio', value: 'selected', label: 'Radio group option' })] }),
            h(UI.USelectionControlGroup, bind('selectionGroup'), { default: () => [h(UI.USelectionControl, { type: 'radio', value: 'selected', label: 'Selection group option' })] }),
            h(UI.USelect, bind('selectNative', { items: [{ value: 'selected', label: 'Selected item' }, { value: 'other', label: 'Other item' }] })),
            h(UI.USelect, bind('selectClearable', { items: [{ value: 'selected', label: 'Selected item' }], clearable: true })),
            h(UI.UAutocomplete, bind('autocomplete', { items: [{ value: 'selected', label: 'Selected item' }], clearable: true })),
            h(UI.UCombobox, bind('combobox', { items: [{ value: 'selected', label: 'Selected item' }] })),
            h(UI.UCascader, bind('cascader', { items: [{ value: 'selected', label: 'Selected item' }], clearable: true })),
            h(UI.UColorInput, bind('colorInput')),
            h(UI.UColorPicker, bind('colorPicker')),
            h(UI.UColorSwatches, bind('colorSwatches')),
            h(UI.UFileInput, bind('fileInput')),
            h(UI.UFileUpload, bind('fileUpload')),
            h(UI.UNumberInput, bind('number')),
            h(UI.UOtpInput, bind('otp', { length: 4 })),
            h(UI.USlider, bind('slider')),
            h(UI.URangeSlider, bind('rangeSlider')),
            h(UI.URating, bind('rating')),
            h(UI.UAutocomplete, bind('asyncValidation', {
                rules: asyncRules,
                validateOn: 'submit lazy'
            }))
        ]),
        h('section', { id: 'defaults-fields', class: 'fixture-panel' }, [
            h('h2', 'Scoped defaults'),
            h(UI.UDefaultsProvider, { defaults: {
                UTextField: { label: 'Inherited text label', hint: 'Inherited text hint', prefix: '@' },
                USelect: { label: 'Inherited select label', hint: 'Inherited select hint', compact: true, inline: true },
                UAutocomplete: { label: 'Inherited autocomplete label', hint: 'Inherited autocomplete hint', clearable: true }
            } }, { default: () => [
                h(UI.UTextField, { id: 'inherited-text', modelValue: 'text', 'onUpdate:modelValue': () => {} }),
                h(UI.USelect, { id: 'inherited-native-select', items: [{ value: 'selected', label: 'Selected item' }], modelValue: 'selected', 'onUpdate:modelValue': () => {} }),
                h(UI.UAutocomplete, { id: 'inherited-autocomplete', items: [{ value: 'selected', label: 'Selected item' }], modelValue: 'selected', 'onUpdate:modelValue': () => {} }),
                h(UI.UAutocomplete, { id: 'explicit-autocomplete', label: 'Explicit label wins', items: [{ value: 'selected', label: 'Selected item' }], modelValue: 'selected', clearable: false, 'onUpdate:modelValue': () => {} })
            ] })
        ])
    ]);
}

const Root = defineComponent({
    setup() {
        window.formDefaultsProtocol = {
            registry: {
                UDefaultsProvider: Boolean(UI.UDefaultsProvider),
                UTextField: Boolean(UI.UTextField),
                USelect: Boolean(UI.USelect),
                UAutocomplete: Boolean(UI.UAutocomplete),
                UFileUpload: Boolean(UI.UFileUpload),
                UOtpInput: Boolean(UI.UOtpInput),
                URangeSlider: Boolean(UI.URangeSlider),
                UCascader: Boolean(UI.UCascader)
            },
            async flush() { await nextTick(); await nextTick(); },
            focusAll() {
                for (const [key, component] of Object.entries(componentRefs)) {
                    if (key === 'asyncValidation') continue;
                    component.value?.focus?.();
                }
            },
            async resetAll() {
                await Promise.all(Object.entries(componentRefs)
                    .filter(([key]) => key !== 'asyncValidation')
                    .map(([, component]) => component.value?.reset?.()));
                await nextTick();
                await nextTick();
            },
            async validateInline() { return componentRefs.asyncValidation.value.validate(); },
            bump() { revision.value++; },
            snapshot() {
                return {
                    models: Object.fromEntries(Object.entries(models).map(([key, model]) => [key, model.value])),
                    focusEvents: Object.fromEntries(Object.entries(focusEvents).map(([key, events]) => [key, [...events]])),
                    focusValues: Object.fromEntries(Object.entries(focusValues).map(([key, value]) => [key, value.value]))
                };
            }
        };
        return renderConsumers;
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
    plugins: [{
        name: 'form-defaults-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__form-defaults-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__form-defaults-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/defaults.ts',
    'src/ui/form.ts',
    'src/ui/UiCheckbox.vue',
    'src/ui/UiSwitch.vue',
    'src/ui/UiRadio.vue',
    'src/ui/USelectionControlGroup.vue',
    'src/ui/UiSelectNative.vue',
    'src/ui/UAutocomplete.vue',
    'src/ui/UiCascader.vue',
    'src/ui/UColorInput.vue',
    'src/ui/UColorPicker.vue',
    'src/ui/UiColorSwatches.vue',
    'src/ui/UFileInput.vue',
    'src/ui/UFileUpload.vue',
    'src/ui/UNumberInput.vue',
    'src/ui/UOtpInput.vue',
    'src/ui/USlider.vue',
    'src/ui/URangeSlider.vue',
    'src/ui/URating.vue',
    'src/ui/UiSelect.vue',
    'src/ui/UCheckboxGroup.vue',
    'src/ui/URadioGroup.vue',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')
])));

await server.listen();
const env = {
    ...process.env,
    UAH_DATA_DIR: profile,
    UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__form-defaults-protocols`
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
const errors = [];
const warnings = [];
const checks = [];
try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: root, env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
        if (message.type() === 'warning' || message.text().includes('[Vue warn]')) warnings.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.formDefaultsProtocol));

    const registry = await page.evaluate(() => window.formDefaultsProtocol.registry);
    assert.deepEqual(registry, {
        UDefaultsProvider: true,
        UTextField: true,
        USelect: true,
        UAutocomplete: true,
        UFileUpload: true,
        UOtpInput: true,
        URangeSlider: true,
        UCascader: true
    });
    checks.push('real public index exports mount through createUI');

    assert.equal(await page.locator('label[for="inherited-text"]').textContent(), 'Inherited text label');
    await page.getByText('Inherited text hint', { exact: true }).waitFor();
    await page.locator('#inherited-text').locator('xpath=..').getByText('@', { exact: true }).waitFor();
    assert.equal(await page.locator('label[for="inherited-native-select"]').textContent(), 'Inherited select label');
    await page.getByText('Inherited select hint', { exact: true }).waitFor();
    assert.equal(await page.locator('#inherited-native-select').evaluate(node => node.classList.contains('is-compact')), true);
    assert.equal(await page.locator('#inherited-native-select').evaluate(node => node.classList.contains('is-inline')), true);
    assert.equal(await page.locator('label[for="inherited-autocomplete"]').textContent(), 'Inherited autocomplete label');
    await page.getByText('Inherited autocomplete hint', { exact: true }).first().waitFor();
    assert.equal(await page.locator('#inherited-autocomplete').locator('xpath=..').locator('.u-autocomplete-clear').count(), 1);
    assert.equal(await page.locator('label[for="explicit-autocomplete"]').textContent(), 'Explicit label wins');
    assert.equal(await page.locator('#explicit-autocomplete').locator('xpath=..').locator('.u-autocomplete-clear').count(), 0);
    checks.push('scoped label/hint/prefix/compact/inline/clearable defaults reach public consumers; explicit props win');

    await page.evaluate(() => window.formDefaultsProtocol.focusAll());
    await page.evaluate(() => window.formDefaultsProtocol.flush());
    const focused = await page.evaluate(() => window.formDefaultsProtocol.snapshot().focusEvents);
    const expectedFocusable = [
        'checkbox', 'switch', 'radio', 'checkboxGroup', 'radioGroup', 'selectionGroup',
        'selectNative', 'selectClearable', 'autocomplete', 'combobox', 'cascader',
        'colorInput', 'colorPicker', 'colorSwatches', 'fileInput', 'fileUpload',
        'number', 'otp', 'slider', 'rangeSlider', 'rating'
    ];
    for (const key of expectedFocusable) assert.equal(focused[key].includes(true), true, `${key} emits update:focused on actual focus`);
    assert.equal(warnings.some(message => /update:focused/i.test(message)), false, 'focused events are declared instead of falling through as attributes');
    checks.push('every focusable form consumer emits update:focused without Vue event warnings');

    await page.evaluate(() => window.formDefaultsProtocol.resetAll());
    const resetModels = await page.evaluate(() => window.formDefaultsProtocol.snapshot().models);
    for (const key of expectedFocusable) assert.equal(resetModels[key], null, `${key} preserves null reset model`);
    assert.equal(resetModels.asyncValidation, '');
    assert.deepEqual(errors, []);
    checks.push('public consumer reset leaves null models safe to render, including cascader/file upload/OTP/color/range projections');

    const inlineValidation = await page.evaluate(() => {
        const pending = window.formDefaultsProtocol.validateInline();
        setTimeout(() => window.formDefaultsProtocol.bump(), 20);
        return pending;
    });
    assert.deepEqual(inlineValidation, ['async required']);
    await page.evaluate(() => window.formDefaultsProtocol.flush());
    assert.deepEqual(errors, []);
    assert.equal(warnings.some(message => /update:focused/i.test(message)), false);
    checks.push('re-rendered equivalent inline async rules finish their active validation');

    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({
        generatedAt: new Date().toISOString(),
        method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron',
        checks,
        registry,
        resetModels,
        focusedConsumers: expectedFocusable,
        warnings: warnings.filter(message => !message.includes('Content Security Policy')),
        errors,
        sourceSha256
    }, null, 4));
    process.stdout.write(JSON.stringify({ checks: checks.length, evidence: path.relative(root, evidence).split(path.sep).join('/'), sources: sourceFiles.length }));
} finally {
    await app?.close();
    await server.close();
}
