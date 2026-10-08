import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/selection-consumers');
const profile = path.join(evidence, 'profile');
await mkdir(profile, { recursive: true });

const fixture = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Selection consumer protocols</title></head>
<body><div id="app"></div><script type="module">
import { createApp, h, nextTick, ref, shallowRef } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/styles.css';

const state = {
    inferredModel: ref(['alpha']),
    explicitSingleModel: ref(['alpha']),
    dynamicMultiple: ref(undefined),
    dynamicModel: ref(['alpha']),
    standaloneModel: shallowRef({ id: 'same' }),
    standaloneArrayModel: ref([{ id: 'array-value' }]),
    autocompleteModel: ref('safe'),
    autocompleteUpdates: [],
    defaultComboModel: shallowRef(null),
    defaultComboUpdates: [],
    scalarComboModel: ref(null),
    scalarComboUpdates: []
};
const standaloneOption = { id: 'same' };
const standaloneNextOption = { id: 'next', extra: { retained: true } };
const arrayOption = { id: 'array-value' };
const objectOption = { id: 'object-value', title: 'Object choice', value: 'object-value' };
const disabledItems = [
    { title: 'Safe option', value: 'safe' },
    { title: 'Locked option', value: 'locked', props: { disabled: true } }
];

function selectionGroup(id, model, extraProps = {}) {
    return h(UI.USelectionControlGroup, {
        id,
        modelValue: model.value,
        'onUpdate:modelValue': value => { model.value = value; },
        ...extraProps
    }, {
        default: () => [
            h(UI.USelectionControl, { type: 'checkbox', value: 'alpha', label: id + ' alpha' }),
            h(UI.USelectionControl, { type: 'checkbox', value: 'beta', label: id + ' beta' }),
            h(UI.USelectionControl, { type: 'checkbox', value: 'gamma', label: id + ' gamma' })
        ]
    });
}

const app = createApp({
    setup() {
        window.selectionConsumerProtocol = {
            registry: {
                USelectionControl: Boolean(UI.USelectionControl),
                USelectionControlGroup: Boolean(UI.USelectionControlGroup),
                UAutocomplete: Boolean(UI.UAutocomplete),
                UCombobox: Boolean(UI.UCombobox)
            },
            setDynamicMultiple(value) { state.dynamicMultiple.value = value; },
            componentProps(id) {
                const input = document.getElementById(id);
                const components = [];
                let instance = input?.__vueParentComponent;
                while (instance) {
                    components.push({ name: instance.type.name ?? instance.type.__name, returnObject: instance.props.returnObject, itemProps: instance.props.itemProps, multiple: instance.props.multiple });
                    instance = instance.parent;
                }
                return components;
            },
            async flush() { await nextTick(); await nextTick(); },
            snapshot() {
                return {
                    inferredModel: state.inferredModel.value,
                    explicitSingleModel: state.explicitSingleModel.value,
                    dynamicMultiple: state.dynamicMultiple.value,
                    dynamicModel: state.dynamicModel.value,
                    standaloneModel: state.standaloneModel.value,
                    standaloneIsRawOption: state.standaloneModel.value === standaloneNextOption,
                    standaloneUpdatesAreRaw: state.standaloneUpdates?.map(value => value === standaloneNextOption),
                    standaloneArrayModel: state.standaloneArrayModel.value,
                    autocompleteModel: state.autocompleteModel.value,
                    autocompleteUpdates: state.autocompleteUpdates,
                    defaultComboModel: state.defaultComboModel.value,
                    defaultComboIsRawOption: state.defaultComboModel.value === objectOption,
                    defaultComboUpdatesAreRaw: state.defaultComboUpdates.map(value => value === objectOption),
                    scalarComboModel: state.scalarComboModel.value,
                    scalarComboUpdates: state.scalarComboUpdates
                };
            }
        };

        return () => h('main', [
            selectionGroup('inferred-group', state.inferredModel),
            selectionGroup('explicit-single-group', state.explicitSingleModel, { multiple: false }),
            selectionGroup('dynamic-group', state.dynamicModel, { multiple: state.dynamicMultiple.value }),
            h(UI.USelectionControl, {
                id: 'standalone-equal-object', type: 'radio',
                modelValue: state.standaloneModel.value,
                value: standaloneOption,
                label: 'Standalone equal object',
                'onUpdate:modelValue': value => { state.standaloneModel.value = value; }
            }),
            h(UI.USelectionControl, {
                id: 'standalone-next-object', type: 'radio',
                modelValue: state.standaloneModel.value,
                value: standaloneNextOption,
                label: 'Standalone next object',
                'onUpdate:modelValue': value => { state.standaloneModel.value = value; state.standaloneUpdates ??= []; state.standaloneUpdates.push(value); }
            }),
            h(UI.USelectionControl, {
                id: 'standalone-array-object', type: 'checkbox',
                modelValue: state.standaloneArrayModel.value,
                value: arrayOption,
                label: 'Standalone array object',
                'onUpdate:modelValue': value => { state.standaloneArrayModel.value = value; }
            }),
            h(UI.UAutocomplete, {
                id: 'disabled-autocomplete', items: disabledItems,
                modelValue: state.autocompleteModel.value,
                'onUpdate:modelValue': value => { state.autocompleteUpdates.push(value); state.autocompleteModel.value = value; }
            }),
            h(UI.UCombobox, {
                id: 'object-combobox', items: [objectOption],
                modelValue: state.defaultComboModel.value,
                'onUpdate:modelValue': value => { state.defaultComboUpdates.push(value); state.defaultComboModel.value = value; }
            }),
            h(UI.UCombobox, {
                id: 'scalar-combobox', items: [objectOption], returnObject: false,
                modelValue: state.scalarComboModel.value,
                'onUpdate:modelValue': value => { state.scalarComboUpdates.push(value); state.scalarComboModel.value = value; }
            })
        ]);
    }
});

app.use(UI.createUI());
app.mount('#app');
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
        name: 'selection-consumer-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__selection-consumers') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__selection-consumers', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/selection.ts',
    'src/ui/USelectionControl.vue',
    'src/ui/USelectionControlGroup.vue',
    'src/ui/UAutocomplete.vue',
    'src/ui/UCombobox.vue',
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
    UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__selection-consumers`
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let appProcess;
let page;
const errors = [];
const warnings = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron',
    evidence: path.relative(root, evidence).split(path.sep).join('/'),
    sourceSha256,
    registry: {},
    initial: {},
    interactionResults: {},
    errors,
    warnings
};

try {
    appProcess = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: root, env });
    page = await appProcess.firstWindow();
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
        else if (message.type() === 'warning' || message.text().includes('[Vue warn]')) warnings.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.selectionConsumerProtocol));

    const flush = async () => page.evaluate(() => window.selectionConsumerProtocol.flush());
    const snapshot = async () => page.evaluate(() => window.selectionConsumerProtocol.snapshot());
    const inferred = page.locator('#inferred-group');
    const explicitSingle = page.locator('#explicit-single-group');
    const dynamic = page.locator('#dynamic-group');

    report.registry = await page.evaluate(() => window.selectionConsumerProtocol.registry);
    assert.deepEqual(report.registry, {
        USelectionControl: true,
        USelectionControlGroup: true,
        UAutocomplete: true,
        UCombobox: true
    });

    report.initial = {
        inferredRole: await inferred.getAttribute('role'),
        inferredAlphaChecked: await inferred.getByRole('checkbox', { name: 'inferred-group alpha' }).isChecked(),
        explicitSingleRole: await explicitSingle.getAttribute('role'),
        dynamicRole: await dynamic.getAttribute('role'),
        standaloneEqualObjectChecked: await page.getByRole('radio', { name: 'Standalone equal object' }).isChecked(),
        standaloneArrayObjectChecked: await page.getByRole('checkbox', { name: 'Standalone array object' }).isChecked()
    };
    assert.equal(report.initial.inferredRole, 'group', 'omitted multiple infers multiple from array model');
    assert.equal(report.initial.inferredAlphaChecked, true);
    assert.equal(report.initial.explicitSingleRole, 'radiogroup', 'explicit multiple=false overrides array model');
    assert.equal(report.initial.dynamicRole, 'group');
    assert.equal(report.initial.standaloneEqualObjectChecked, true, 'standalone object values use deep comparison by default');
    assert.equal(report.initial.standaloneArrayObjectChecked, true, 'standalone array selection compares object entries deeply');

    await page.getByRole('checkbox', { name: 'inferred-group beta' }).click();
    assert.deepEqual((await snapshot()).inferredModel, ['alpha', 'beta'], 'inferred group updates its public model as an array');
    await page.getByRole('checkbox', { name: 'explicit-single-group beta' }).click();
    assert.equal((await snapshot()).explicitSingleModel, 'beta', 'explicit single group updates its public model as a scalar');

    await page.getByRole('checkbox', { name: 'dynamic-group beta' }).click();
    assert.deepEqual((await snapshot()).dynamicModel, ['alpha', 'beta']);
    await page.evaluate(() => window.selectionConsumerProtocol.setDynamicMultiple(false));
    await flush();
    assert.equal(await dynamic.getAttribute('role'), 'radiogroup', 'multiple=false changes an inferred group to single mode');
    await page.getByRole('checkbox', { name: 'dynamic-group gamma' }).click();
    assert.equal((await snapshot()).dynamicModel, 'gamma');
    await page.evaluate(() => window.selectionConsumerProtocol.setDynamicMultiple(true));
    await flush();
    assert.equal(await dynamic.getAttribute('role'), 'group', 'multiple=true changes a scalar model to multiple mode');
    await page.getByRole('checkbox', { name: 'dynamic-group alpha' }).click();
    assert.deepEqual((await snapshot()).dynamicModel, ['alpha']);

    await page.getByRole('radio', { name: 'Standalone next object' }).click();
    let state = await snapshot();
    assert.equal(state.standaloneIsRawOption, true, 'standalone update emits the original option object');
    assert.deepEqual(state.standaloneUpdatesAreRaw, [true], 'update:modelValue exposes the original option reference');
    await page.getByRole('checkbox', { name: 'Standalone array object' }).click();
    assert.deepEqual((await snapshot()).standaloneArrayModel, [], 'deep comparator removes an equal cloned object from standalone array model');

    const disabledAutocomplete = page.locator('#disabled-autocomplete');
    await disabledAutocomplete.fill('Locked');
    const lockedOption = page.getByRole('option', { name: 'Locked option' });
    await lockedOption.waitFor();
    report.lockedOption = await lockedOption.evaluate(element => ({ html: element.outerHTML, text: element.textContent }));
    assert.equal(await lockedOption.getAttribute('aria-disabled'), 'true', `default itemProps path reads raw.props.disabled: ${JSON.stringify(report.lockedOption)}`);
    await lockedOption.click({ force: true });
    state = await snapshot();
    assert.equal(state.autocompleteModel, 'safe', 'disabled raw.props item cannot change the v-model');
    assert.deepEqual(state.autocompleteUpdates, [], 'disabled item does not emit update:modelValue');

    const defaultCombo = page.locator('#object-combobox');
    await defaultCombo.fill('Object choice');
    await page.locator('.u-autocomplete').filter({ has: defaultCombo }).getByRole('option', { name: 'Object choice' }).click();
    state = await snapshot();
    assert.equal(state.defaultComboModel?.id, 'object-value');
    assert.equal(state.defaultComboIsRawOption, true, 'UCombobox defaults to returning the raw object');
    assert.deepEqual(state.defaultComboUpdatesAreRaw, [true], 'combobox update:modelValue keeps the source object reference');

    const scalarCombo = page.locator('#scalar-combobox');
    await scalarCombo.fill('Object choice');
    report.scalarComboComponentProps = await page.evaluate(() => window.selectionConsumerProtocol.componentProps('scalar-combobox'));
    await page.locator('.u-autocomplete').filter({ has: scalarCombo }).getByRole('option', { name: 'Object choice' }).click();
    state = await snapshot();
    assert.equal(state.scalarComboModel, 'object-value', `explicit returnObject=false returns the configured item value; component props=${JSON.stringify(report.scalarComboComponentProps)}`);
    assert.deepEqual(state.scalarComboUpdates, ['object-value']);

    assert.deepEqual(errors, [], 'selection fixture has no page or console errors');
    const unexpectedWarnings = warnings.filter(message =>
        !message.includes('Component emitted event "update:focused"')
        && !message.includes('Electron Security Warning (Insecure Content-Security-Policy)')
    );
    assert.deepEqual(unexpectedWarnings, [], 'selection fixture has no component warnings beyond the shared focused-event declaration gap');
    report.interactionResults = {
        inferredMultipleModel: (await snapshot()).inferredModel,
        explicitSingleModel: (await snapshot()).explicitSingleModel,
        dynamicMultipleModel: (await snapshot()).dynamicModel,
        standaloneObjectReferencePreserved: state.standaloneIsRawOption,
        disabledItemModel: state.autocompleteModel,
        defaultComboboxRawObject: state.defaultComboIsRawOption,
        explicitScalarComboboxValue: state.scalarComboModel
    };
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
    if (appProcess) {
        const closed = await Promise.race([
            appProcess.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) appProcess.process().kill();
    }
    await server.close();
}
