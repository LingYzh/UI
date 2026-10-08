import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/checkbox-switch-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });
const screenshotDirectory = path.join(evidence, 'screenshots');
await mkdir(screenshotDirectory, { recursive: true });

const productSources = [
    'src/ui/UiCheckbox.vue',
    'src/ui/UiSwitch.vue',
    'src/ui/UCheckboxGroup.vue',
    'src/ui/USelectionControlGroup.vue',
    'src/ui/UiForm.vue',
    'src/ui/UiControlFrame.vue',
    'src/ui/form.ts',
    'src/ui/selection.ts',
    'src/ui/selection-context.ts',
    'src/ui/index.ts',
    'src/ui/styles.css',
    'src/components/Icon.vue',
    'src/ui/button-colors.ts'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(productSources.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const sourceSha256 = await hashSources();
const html = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>Checkbox and Switch protocols</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/full-alignment/checkbox-switch-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import CheckboxSwitchFixture from './CheckboxSwitchFixture.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';

createApp(CheckboxSwitchFixture).use(createUI()).mount('#app');
`;

const fixture = `<script setup>
import { computed, isRef, nextTick, reactive, ref } from 'vue';
import { UiForm, UCheckbox, UCheckboxGroup, USwitch } from '/src/ui/index.ts';
import SwitchProtocolsDemo from '/src/ui/docs/SwitchProtocolsDemo.vue';

const state = reactive({
    deepModel: [{ id: 'deep', nested: { enabled: true }, tags: ['a', 'b'] }],
    dynamicModel: [{ id: 'Alpha' }],
    dynamicSwitchModel: 'active',
    useCaseComparator: true,
    checkboxModel: 'ON',
    switchModel: 'ACTIVE',
    uncontrolledModel: false,
    keyboardModel: false,
    keyboardIndeterminate: true,
    fixedModel: false,
    disabledModel: false,
    readonlyModel: false,
    switchUncontrolledModel: false,
    switchKeyboardModel: false,
    switchKeyboardIndeterminate: true,
    switchFixedModel: false,
    switchDisabledModel: false,
    switchReadonlyModel: false,
    switchGroupModel: ['FIRST'],
    switchGroupDisabled: false,
    switchGroupReadonly: false,
    switchGroupIndeterminateModel: ['mixed'],
    switchGroupIndeterminate: true,
    protocolSwitchModel: false,
    loaderSlotModel: false,
    loaderSlotLoading: true,
    thumbColorModel: false,
    flatThumbModel: false,
    messageModel: false,
    validationGroupModel: ['accepted'],
    formCheckbox: true,
    formSwitch: true
});
const events = reactive({
    keyboardIndeterminate: [],
    fixedIndeterminate: [],
    disabledModel: [],
    disabledIndeterminate: [],
    readonlyModel: [],
    readonlyIndeterminate: [],
    switchKeyboardIndeterminate: [],
    switchFixedIndeterminate: [],
    switchDisabledModel: [],
    switchDisabledIndeterminate: [],
    switchReadonlyModel: [],
    switchReadonlyIndeterminate: [],
    switchGroupIndeterminate: [],
    protocolSwitchModel: [],
    loaderSlotModel: []
});
const refs = { form: ref(), groupCheckbox: ref(), protocolSwitch: ref() };
const deepValue = { id: 'deep', nested: { enabled: true }, tags: ['a', 'b'] };
const dynamicValue = { id: 'ALPHA' };
const caseComparator = (left, right) => left?.id?.toLowerCase() === right?.id?.toLowerCase();
const strictComparator = (left, right) => left === right;
const dynamicComparator = computed(() => state.useCaseComparator ? caseComparator : strictComparator);
const dynamicStringComparator = computed(() => state.useCaseComparator
    ? (left, right) => String(left).toLowerCase() === String(right).toLowerCase()
    : strictComparator);
const groupComparator = (left, right) => String(left).toLowerCase() === String(right).toLowerCase();
const groupRule = value => Array.isArray(value) && value.includes('accepted') ? true : 'checkbox group value missing';
const requiredTrue = value => value === true ? true : 'must be true';
async function flush() { await nextTick(); await nextTick(); }
function validateGroupCheckbox() { return refs.groupCheckbox.value.validate(); }
function validateProtocolSwitch() { return refs.protocolSwitch.value.validate(); }
function resetForm() { return refs.form.value.reset(); }
window.__checkboxSwitch = { state, events, refs, flush, validateGroupCheckbox, validateProtocolSwitch, resetForm };
</script>

<template>
    <main>
        <section id="standalone-controls">
            <UCheckbox id="deep-checkbox" v-model="state.deepModel" :value="deepValue">Deep object</UCheckbox>
            <UCheckbox id="dynamic-checkbox" v-model="state.dynamicModel" :value="dynamicValue" :value-comparator="dynamicComparator">Dynamic comparator</UCheckbox>
            <USwitch id="dynamic-switch" v-model="state.dynamicSwitchModel" true-value="ACTIVE" false-value="INACTIVE" :value-comparator="dynamicStringComparator" label="Dynamic switch comparator" />
            <UCheckbox id="checkbox-true-false" v-model="state.checkboxModel" value="entry" true-value="ON" false-value="OFF">Checkbox values</UCheckbox>
            <USwitch id="switch-true-false" v-model="state.switchModel" value="entry" true-value="ACTIVE" false-value="INACTIVE" label="Switch values" />
            <UCheckbox id="uncontrolled-indeterminate" v-model="state.uncontrolledModel" :indeterminate="true">Mouse clears mixed state</UCheckbox>
            <UCheckbox id="keyboard-indeterminate" v-model="state.keyboardModel" v-model:indeterminate="state.keyboardIndeterminate" @update:indeterminate="events.keyboardIndeterminate.push($event)">Space clears mixed state</UCheckbox>
            <UCheckbox id="fixed-indeterminate" :model-value="state.fixedModel" @update:model-value="state.fixedModel = $event" :indeterminate="true" @update:indeterminate="events.fixedIndeterminate.push($event)">Controlled mixed state</UCheckbox>
            <UCheckbox id="disabled-indeterminate" v-model="state.disabledModel" :indeterminate="true" disabled @update:model-value="events.disabledModel.push($event)" @update:indeterminate="events.disabledIndeterminate.push($event)">Disabled mixed state</UCheckbox>
            <UCheckbox id="readonly-indeterminate" v-model="state.readonlyModel" :indeterminate="true" readonly @update:model-value="events.readonlyModel.push($event)" @update:indeterminate="events.readonlyIndeterminate.push($event)">Readonly mixed state</UCheckbox>
            <USwitch id="switch-uncontrolled-indeterminate" v-model="state.switchUncontrolledModel" :indeterminate="true" label="Uncontrolled mixed switch" />
            <USwitch id="switch-keyboard-indeterminate" v-model="state.switchKeyboardModel" v-model:indeterminate="state.switchKeyboardIndeterminate" @update:indeterminate="events.switchKeyboardIndeterminate.push($event)" label="Keyboard mixed switch" />
            <USwitch id="switch-fixed-indeterminate" :model-value="state.switchFixedModel" @update:model-value="state.switchFixedModel = $event" :indeterminate="true" @update:indeterminate="events.switchFixedIndeterminate.push($event)" label="Controlled mixed switch" />
            <USwitch id="switch-disabled-indeterminate" v-model="state.switchDisabledModel" :indeterminate="true" disabled @update:model-value="events.switchDisabledModel.push($event)" @update:indeterminate="events.switchDisabledIndeterminate.push($event)" label="Disabled mixed switch" />
            <USwitch id="switch-readonly-indeterminate" v-model="state.switchReadonlyModel" :indeterminate="true" readonly @update:model-value="events.switchReadonlyModel.push($event)" @update:indeterminate="events.switchReadonlyIndeterminate.push($event)" label="Readonly mixed switch" />
        </section>

        <UCheckboxGroup
            id="switch-group"
            v-model="state.switchGroupModel"
            name="switch-group-name"
            :value-comparator="groupComparator"
            :disabled="state.switchGroupDisabled"
            :readonly="state.switchGroupReadonly">
            <USwitch id="group-switch-first" value="first" label="First switch" />
            <USwitch id="group-switch-second" value="second" label="Second switch" />
        </UCheckboxGroup>

        <UCheckboxGroup id="switch-indeterminate-group" v-model="state.switchGroupIndeterminateModel" name="switch-indeterminate-group-name">
            <USwitch id="switch-group-indeterminate" value="mixed" v-model:indeterminate="state.switchGroupIndeterminate" @update:indeterminate="events.switchGroupIndeterminate.push($event)" label="Grouped mixed switch" />
        </UCheckboxGroup>

        <section id="switch-slot-contracts">
            <USwitch id="protocol-switch" :ref="refs.protocolSwitch" v-model="state.protocolSwitchModel" @update:model-value="events.protocolSwitchModel.push($event)" label="Slot switch label" :rules="[value => value || 'Switch must be on']" validate-on="input" loading color="primary" true-icon="check" false-icon="close">
                <template #label="scope"><span id="protocol-label-slot" :data-label="scope.label" :data-model-ref="String(isRef(scope.model))" :data-model-value="String(scope.model.value)" :data-valid-ref="String(isRef(scope.isValid))" :data-is-valid="String(scope.isValid.value)">{{ scope.label }}</span></template>
                <template #track-true="scope"><span id="protocol-track-true" :data-model-ref="String(isRef(scope.model))" :data-model-value="String(scope.model.value)" :data-valid-ref="String(isRef(scope.isValid))" :data-is-valid="String(scope.isValid.value)">true track</span></template>
                <template #track-false="scope"><span id="protocol-track-false" :data-model-ref="String(isRef(scope.model))" :data-model-value="String(scope.model.value)" :data-valid-ref="String(isRef(scope.isValid))" :data-is-valid="String(scope.isValid.value)">false track</span></template>
                <template #thumb="scope"><span id="protocol-thumb" :data-icon="scope.icon ?? ''" :data-model-ref="String(isRef(scope.model))" :data-model-value="String(scope.model.value)" :data-valid-ref="String(isRef(scope.isValid))" :data-is-valid="String(scope.isValid.value)">custom thumb</span></template>
                <template #loader="scope"><span id="protocol-thumb-loader" :data-active="String(scope.isActive)" :data-color="scope.color ?? ''">thumb loader</span></template>
                <template #details="scope"><span id="protocol-details-slot" :data-model-ref="String(isRef(scope.model))" :data-model-value="String(scope.model.value)" :data-valid-ref="String(isRef(scope.isValid))" :data-is-valid="String(scope.isValid.value)">switch details</span></template>
            </USwitch>

            <USwitch id="loader-fallback-switch" :model-value="state.loaderSlotModel" @update:model-value="state.loaderSlotModel = $event; events.loaderSlotModel.push($event)" :loading="state.loaderSlotLoading" color="primary" true-icon="check" false-icon="close" label="Loader fallback">
                <template #loader="scope"><span id="loader-slot-contract" :data-active="String(scope.isActive)" :data-color="scope.color ?? ''">fallback loader</span></template>
            </USwitch>
            <USwitch id="thumb-color-switch" v-model="state.thumbColorModel" thumb-color="primary" label="Selected thumb color" />
            <USwitch id="flat-thumb-switch" v-model="state.flatThumbModel" flat label="Flat custom thumb"><template #thumb><span>flat</span></template></USwitch>
            <USwitch id="message-slot-switch" v-model="state.messageModel" label="Message slot" :messages="['Protocol message']">
                <template #message="scope"><span id="protocol-message-slot" :data-message="scope.message">{{ scope.message }}</span></template>
            </USwitch>
        </section>

        <SwitchProtocolsDemo />

        <UCheckboxGroup id="validation-group" v-model="state.validationGroupModel" name="validation-group-name">
            <UCheckbox :ref="refs.groupCheckbox" id="validation-group-checkbox" value="accepted" :rules="[groupRule]" validate-on="lazy">Group value validator</UCheckbox>
        </UCheckboxGroup>

        <UForm :ref="refs.form" validate-on="lazy">
            <UCheckbox id="form-checkbox" v-model="state.formCheckbox" :rules="[requiredTrue]">Form checkbox</UCheckbox>
            <USwitch id="form-switch" v-model="state.formSwitch" :rules="[requiredTrue]" label="Form switch" />
        </UForm>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'CheckboxSwitchFixture.vue'), fixture, 'utf8');

const virtualRoute = '/__checkbox-switch-protocols';
const fixturePlugin = {
    name: 'checkbox-switch-protocols-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== virtualRoute) { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await viteServer.transformIndexHtml(virtualRoute, html));
        });
    }
};

const server = await createServer({
    root,
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/full-alignment/checkbox-switch-protocols/fixture/main.ts'],
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
    server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    plugins: [fixturePlugin]
});

const report = {
    fixture: 'checkbox-switch-protocols',
    method: 'Chromium fixture imports UiCheckbox, UiSwitch, UCheckboxGroup, UForm and the real SwitchProtocolsDemo; it checks public slot scopes, input/model behavior, group/form consumption and responsive/reduced-motion evidence.',
    sourceSha256,
    screenshots: [],
    checks: [],
    failures: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    limits: [
        'Chromium public-source fixture only; no Electron or packaged-library acceptance is claimed.',
        'No full build/test run or visual design acceptance is claimed.'
    ]
};
const pageErrors = [];
const consoleErrors = [];
const consoleWarnings = [];
let browser;
let page;
function passed(name, details) { report.checks.push({ name, details }); }
async function flush() { await page.evaluate(() => window.__checkboxSwitch.flush()); }
async function modelValue(key) { return page.evaluate(name => window.__checkboxSwitch.state[name], key); }
async function inputState(id) {
    return page.locator(`#${id}`).evaluate(element => ({
        checked: element.checked,
        indeterminate: element.indeterminate,
        disabled: element.disabled,
        readonly: element.getAttribute('aria-readonly'),
        ariaChecked: element.getAttribute('aria-checked'),
        name: element.name,
        value: element.value
    }));
}
async function expectModel(key, expected, label) {
    assert.deepEqual(await modelValue(key), expected, label);
}
async function forceChange(id) {
    await page.locator(`#${id}`).evaluate(element => {
        element.checked = !element.checked;
        element.indeterminate = false;
        element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await flush();
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, 'fixture document is served');
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => pageErrors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__checkboxSwitch && document.querySelector('#deep-checkbox'));
    await flush();
    await page.waitForSelector('[data-switch-protocol-demo]');

    assert.deepEqual(await page.evaluate(() => ({
        checkbox: Boolean(window.__checkboxSwitch && document.querySelector('#deep-checkbox')),
        switch: Boolean(window.__checkboxSwitch && document.querySelector('#switch-true-false')),
        checkboxGroup: Boolean(document.querySelector('#switch-group')),
        form: Boolean(document.querySelector('.ui-form'))
    })), { checkbox: true, switch: true, checkboxGroup: true, form: true }, 'public controls and group/form consumers mount');
    assert.equal((await inputState('deep-checkbox')).checked, true, 'default comparator deeply matches nested object-array entries');
    await page.locator('#deep-checkbox').click();
    await expectModel('deepModel', [], 'deep-equal array selection removes the existing entry');
    passed('public registry, deep object equality and array toggling', 'UCheckbox resolves nested structural equality through the default comparator and removes the matched array entry.');

    assert.equal((await inputState('dynamic-checkbox')).checked, true, 'custom comparator initially matches array values');
    assert.equal((await inputState('dynamic-switch')).checked, true, 'USwitch custom comparator matches its scalar trueValue');
    await page.evaluate(() => { window.__checkboxSwitch.state.useCaseComparator = false; });
    await flush();
    assert.equal((await inputState('dynamic-checkbox')).checked, false, 'changing the comparator recomputes checked state');
    assert.equal((await inputState('dynamic-switch')).checked, false, 'changing the Switch comparator recomputes scalar checked state');
    await page.evaluate(() => { window.__checkboxSwitch.state.useCaseComparator = true; });
    await flush();
    assert.equal((await inputState('dynamic-checkbox')).checked, true, 'restoring the comparator recomputes checked state');
    assert.equal((await inputState('dynamic-switch')).checked, true, 'restoring the Switch comparator recomputes scalar checked state');
    await page.locator('#dynamic-checkbox').click();
    await expectModel('dynamicModel', [], 'current custom comparator removes the matching entry');
    await page.locator('#dynamic-switch').click();
    await expectModel('dynamicSwitchModel', 'INACTIVE', 'Switch applies its configured falseValue after comparator-based checked state');
    passed('dynamic standalone valueComparator is consumed by checkbox and switch state', 'Reactive custom comparator changes recompute both array and scalar checked state; Checkbox also removes the object array entry.');

    assert.equal((await inputState('checkbox-true-false')).checked, true);
    await page.locator('#checkbox-true-false').click();
    await expectModel('checkboxModel', 'OFF', 'Checkbox writes falseValue when toggled off');
    await page.locator('#checkbox-true-false').click();
    await expectModel('checkboxModel', 'ON', 'Checkbox writes trueValue when toggled on');
    assert.equal((await inputState('switch-true-false')).checked, true);
    await page.locator('#switch-true-false').click();
    await expectModel('switchModel', 'INACTIVE', 'Switch writes falseValue when toggled off');
    await page.locator('#switch-true-false').click();
    await expectModel('switchModel', 'ACTIVE', 'Switch writes trueValue when toggled on');
    passed('standalone checkbox and switch retain trueValue/falseValue model behavior', 'Both controls map scalar checked state to their configured trueValue and falseValue.');

    assert.equal((await inputState('uncontrolled-indeterminate')).indeterminate, true);
    await page.locator('#uncontrolled-indeterminate').locator('xpath=ancestor::label[1]').locator('.ui-checkbox-label').click();
    await expectModel('uncontrolledModel', true, 'label click toggles the checkbox model');
    const uncontrolledState = await inputState('uncontrolled-indeterminate');
    assert.equal(uncontrolledState.checked, true);
    assert.equal(uncontrolledState.indeterminate, false);
    assert.equal(uncontrolledState.ariaChecked, null);
    passed('uncontrolled static indeterminate prop clears after a valid label click', 'A static indeterminate=true prop without an update listener remains locally clearable after user input.');

    assert.equal((await inputState('keyboard-indeterminate')).ariaChecked, 'mixed');
    await page.locator('#keyboard-indeterminate').focus();
    await page.keyboard.press('Space');
    await expectModel('keyboardModel', true, 'Space toggles the checkbox model');
    await expectModel('keyboardIndeterminate', false, 'v-model:indeterminate emits and updates false');
    assert.equal((await inputState('keyboard-indeterminate')).indeterminate, false);
    assert.equal((await inputState('keyboard-indeterminate')).ariaChecked, null, 'aria-checked mixed clears with the DOM state');
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.keyboardIndeterminate), [false]);
    await page.evaluate(() => { window.__checkboxSwitch.state.keyboardIndeterminate = true; });
    await flush();
    assert.equal((await inputState('keyboard-indeterminate')).indeterminate, true, 'external prop changes restore native indeterminate');
    assert.equal((await inputState('keyboard-indeterminate')).ariaChecked, 'mixed', 'external prop changes restore mixed ARIA');
    await page.evaluate(() => { window.__checkboxSwitch.state.keyboardIndeterminate = false; });
    await flush();
    assert.equal((await inputState('keyboard-indeterminate')).indeterminate, false, 'external false clears native indeterminate');
    passed('controlled indeterminate v-model follows keyboard, event and external updates', 'Space emits update:indeterminate=false; later prop changes synchronously update both the DOM property and mixed ARIA state.');

    await page.locator('#fixed-indeterminate').click();
    await expectModel('fixedModel', true, 'controlled checkbox model updates');
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.fixedIndeterminate), [false], 'controlled prop emits a clear request');
    assert.equal((await inputState('fixed-indeterminate')).indeterminate, true, 'without a prop update, controlled indeterminate remains authoritative');
    assert.equal((await inputState('fixed-indeterminate')).ariaChecked, 'mixed');
    passed('controlled indeterminate remains prop-authoritative when the parent declines the clear request', 'The child emits false but restores the still-true controlled DOM and ARIA state.');

    for (const id of ['disabled-indeterminate', 'readonly-indeterminate']) {
        const before = await inputState(id);
        await forceChange(id);
        assert.deepEqual(await inputState(id), before, `${id} rejects input and restores checked/indeterminate state`);
    }
    assert.deepEqual(await page.evaluate(() => ({
        disabledModel: window.__checkboxSwitch.state.disabledModel,
        readonlyModel: window.__checkboxSwitch.state.readonlyModel,
        disabledModelEvents: window.__checkboxSwitch.events.disabledModel,
        disabledIndeterminateEvents: window.__checkboxSwitch.events.disabledIndeterminate,
        readonlyModelEvents: window.__checkboxSwitch.events.readonlyModel,
        readonlyIndeterminateEvents: window.__checkboxSwitch.events.readonlyIndeterminate
    })), {
        disabledModel: false, readonlyModel: false,
        disabledModelEvents: [], disabledIndeterminateEvents: [],
        readonlyModelEvents: [], readonlyIndeterminateEvents: []
    }, 'disabled and readonly rejected changes emit no models');
    passed('disabled and readonly checkbox changes restore both states without emitting', 'Programmatic change events cannot clear indeterminate or alter checked/model state on either guard path.');

    assert.equal((await inputState('switch-uncontrolled-indeterminate')).indeterminate, true);
    await page.locator('label[for="switch-uncontrolled-indeterminate"]').click();
    await expectModel('switchUncontrolledModel', true, 'Switch label toggles the model');
    let switchUncontrolledState = await inputState('switch-uncontrolled-indeterminate');
    assert.equal(switchUncontrolledState.checked, true);
    assert.equal(switchUncontrolledState.indeterminate, false);
    assert.equal(switchUncontrolledState.ariaChecked, null);
    passed('uncontrolled Switch indeterminate clears after a valid label click', 'A static indeterminate=true prop without an update listener remains locally clearable after label input.');

    assert.equal((await inputState('switch-keyboard-indeterminate')).ariaChecked, 'mixed');
    await page.locator('#switch-keyboard-indeterminate').focus();
    await page.keyboard.press('Space');
    await expectModel('switchKeyboardModel', true, 'Space toggles the Switch model');
    await expectModel('switchKeyboardIndeterminate', false, 'Switch v-model:indeterminate emits and updates false');
    assert.equal((await inputState('switch-keyboard-indeterminate')).indeterminate, false);
    assert.equal((await inputState('switch-keyboard-indeterminate')).ariaChecked, null);
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.switchKeyboardIndeterminate), [false]);
    await page.evaluate(() => { window.__checkboxSwitch.state.switchKeyboardIndeterminate = true; });
    await flush();
    assert.equal((await inputState('switch-keyboard-indeterminate')).indeterminate, true, 'external Switch prop changes restore native indeterminate');
    assert.equal((await inputState('switch-keyboard-indeterminate')).ariaChecked, 'mixed', 'external Switch prop changes restore mixed ARIA');
    await page.evaluate(() => { window.__checkboxSwitch.state.switchKeyboardIndeterminate = false; });
    await flush();
    passed('controlled Switch indeterminate follows keyboard, event and external updates', 'Space emits update:indeterminate=false; later prop changes update both native state and mixed ARIA.');

    await page.locator('label[for="switch-fixed-indeterminate"]').click();
    await expectModel('switchFixedModel', true, 'controlled Switch model updates');
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.switchFixedIndeterminate), [false]);
    assert.equal((await inputState('switch-fixed-indeterminate')).indeterminate, true, 'controlled indeterminate remains authoritative without a prop update');
    assert.equal((await inputState('switch-fixed-indeterminate')).ariaChecked, 'mixed');
    passed('controlled Switch indeterminate remains prop-authoritative', 'The clear request emits false while an unchanged true prop keeps native and ARIA state mixed.');

    const groupedMixedBefore = await inputState('switch-group-indeterminate');
    assert.equal(groupedMixedBefore.checked, true);
    assert.equal(groupedMixedBefore.indeterminate, true);
    assert.equal(groupedMixedBefore.name, 'switch-indeterminate-group-name');
    assert.equal(groupedMixedBefore.value, 'mixed');
    await page.locator('label[for="switch-group-indeterminate"]').click();
    await expectModel('switchGroupIndeterminateModel', [], 'valid grouped Switch change updates the group model');
    await expectModel('switchGroupIndeterminate', false, 'valid grouped Switch change clears indeterminate');
    assert.equal((await inputState('switch-group-indeterminate')).checked, false);
    assert.equal((await inputState('switch-group-indeterminate')).indeterminate, false);
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.switchGroupIndeterminate), [false]);
    passed('grouped Switch valid changes clear indeterminate through the shared group model', 'The group selection and indeterminate channels both update from a labeled Switch interaction.');

    for (const id of ['switch-disabled-indeterminate', 'switch-readonly-indeterminate']) {
        const before = await inputState(id);
        await forceChange(id);
        assert.deepEqual(await inputState(id), before, `${id} rejects input and restores checked/indeterminate state`);
    }
    await page.locator('#switch-readonly-indeterminate').focus();
    await page.keyboard.press('Space');
    await flush();
    assert.deepEqual(await page.evaluate(() => ({
        disabledModel: window.__checkboxSwitch.state.switchDisabledModel,
        readonlyModel: window.__checkboxSwitch.state.switchReadonlyModel,
        disabledModelEvents: window.__checkboxSwitch.events.switchDisabledModel,
        disabledIndeterminateEvents: window.__checkboxSwitch.events.switchDisabledIndeterminate,
        readonlyModelEvents: window.__checkboxSwitch.events.switchReadonlyModel,
        readonlyIndeterminateEvents: window.__checkboxSwitch.events.switchReadonlyIndeterminate
    })), {
        disabledModel: false, readonlyModel: false,
        disabledModelEvents: [], disabledIndeterminateEvents: [],
        readonlyModelEvents: [], readonlyIndeterminateEvents: []
    }, 'disabled and readonly Switch inputs reject changes without emitting models');
    assert.equal((await inputState('switch-readonly-indeterminate')).indeterminate, true);
    passed('disabled and readonly Switch changes restore both states without emitting', 'Synthetic change and readonly Space input preserve the model, native mixed property and ARIA state with no events.');

    let firstSwitch = await inputState('group-switch-first');
    let secondSwitch = await inputState('group-switch-second');
    assert.equal(firstSwitch.checked, true);
    assert.equal(firstSwitch.name, 'switch-group-name');
    assert.equal(firstSwitch.value, 'first');
    await expectModel('switchGroupModel', ['FIRST'], 'group comparator matches differing-case parent model values');
    assert.equal(secondSwitch.checked, false);
    assert.equal(secondSwitch.name, 'switch-group-name');
    assert.equal(secondSwitch.value, 'second');
    await page.locator('#group-switch-second').click();
    await expectModel('switchGroupModel', ['FIRST', 'second'], 'group Switch appends the selected value');
    await page.locator('#group-switch-first').click();
    await expectModel('switchGroupModel', ['second'], 'group Switch removes the selected value');
    await page.evaluate(() => { window.__checkboxSwitch.state.switchGroupDisabled = true; });
    await flush();
    secondSwitch = await inputState('group-switch-second');
    assert.equal(secondSwitch.disabled, true, 'dynamic parent group disabled reaches Switch input');
    await forceChange('group-switch-second');
    await expectModel('switchGroupModel', ['second'], 'disabled group Switch leaves its shared model untouched');
    assert.equal((await inputState('group-switch-second')).checked, true, 'disabled group Switch restores checked');
    await page.evaluate(() => {
        window.__checkboxSwitch.state.switchGroupDisabled = false;
        window.__checkboxSwitch.state.switchGroupReadonly = true;
    });
    await flush();
    secondSwitch = await inputState('group-switch-second');
    assert.equal(secondSwitch.disabled, false);
    assert.equal(secondSwitch.readonly, 'true', 'dynamic parent group readonly reaches Switch input');
    await forceChange('group-switch-second');
    await expectModel('switchGroupModel', ['second'], 'readonly group Switch leaves its shared model untouched');
    assert.equal((await inputState('group-switch-second')).checked, true, 'readonly group Switch restores checked');
    passed('Switch consumes selection-group model, name, disabled and readonly dynamically', 'Multiple group state controls both Switch checked/value/name and live interaction guards.');

    const protocolInput = page.locator('#protocol-switch');
    assert.equal(await protocolInput.getAttribute('type'), 'checkbox', 'custom slots keep the native checkbox input');
    assert.equal(await protocolInput.getAttribute('aria-busy'), 'true', 'loading exposes aria-busy');
    assert.equal(await page.locator('#protocol-thumb').count(), 1, 'thumb slot takes precedence over loading and icon fallback');
    assert.equal(await page.locator('#protocol-thumb-loader').count(), 0, 'loader slot is not rendered inside a custom thumb slot');
    assert.equal(await page.locator('#protocol-thumb .prototype-icon').count(), 0, 'built-in icon fallback is not rendered inside a custom thumb slot');
    for (const id of ['protocol-label-slot', 'protocol-track-true', 'protocol-track-false', 'protocol-thumb', 'protocol-details-slot']) {
        assert.equal(await page.locator(`#${id}`).getAttribute('data-model-ref'), 'true', `${id} receives the model Ref`);
        assert.equal(await page.locator(`#${id}`).getAttribute('data-valid-ref'), 'true', `${id} receives the isValid Ref`);
        assert.equal(await page.locator(`#${id}`).getAttribute('data-model-value'), 'false', `${id} initially sees the false model`);
    }
    assert.equal(await page.locator('#protocol-label-slot').getAttribute('data-label'), 'Slot switch label', 'label slot receives the original label');
    assert.equal(await page.locator('#protocol-thumb').getAttribute('data-icon'), 'close', 'thumb scope selects falseIcon while unchecked');
    assert.equal(await page.locator('#protocol-details-slot').textContent(), 'switch details', 'details slot replaces the default details content');
    assert.equal(await page.locator('#protocol-message-slot').getAttribute('data-message'), 'Protocol message', 'message slot receives the message string');
    const failedSlotValidation = await page.evaluate(() => window.__checkboxSwitch.validateProtocolSwitch());
    assert.deepEqual(failedSlotValidation, ['Switch must be on'], 'slot switch reports rule failure through the public ref');
    await page.waitForFunction(() => document.querySelector('#protocol-thumb')?.getAttribute('data-is-valid') === 'false');
    assert.equal(await page.locator('#protocol-track-true').getAttribute('data-is-valid'), 'false', 'track slot receives the current invalid state');
    assert.equal(await page.locator('#protocol-label-slot').getAttribute('data-is-valid'), 'false', 'label slot receives the current invalid state');
    passed('Switch thumb, track, label and details slots forward live Ref scopes', 'All four slots retain model/isValid Refs; label content, falseIcon and invalid validation state reach the custom content.');

    const protocolBox = await protocolInput.boundingBox();
    assert.ok(protocolBox, 'custom Switch input has track coordinates');
    await page.mouse.click(protocolBox.x + protocolBox.width * 0.75, protocolBox.y + protocolBox.height / 2);
    await expectModel('protocolSwitchModel', true, 'track-coordinate click updates the native model');
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.protocolSwitchModel), [true], 'track click emits exactly one model update');
    assert.equal(await page.locator('#protocol-thumb').getAttribute('data-icon'), 'check', 'thumb scope follows trueIcon after checked state changes');
    assert.equal(await page.locator('#protocol-thumb').getAttribute('data-model-value'), 'true', 'thumb scope model Ref updates after track click');
    await page.waitForFunction(() => document.querySelector('#protocol-thumb')?.getAttribute('data-is-valid') === 'true');
    assert.equal(await page.locator('#protocol-track-false').getAttribute('data-is-valid'), 'true', 'track slot validation state updates after valid model change');
    assert.ok(await page.locator('.ui-selection-ripple.is-switch').locator('.ui-ripple-layer').count(), 'pointer track activation creates the configured ripple');
    passed('track coordinate activation retains native input semantics and emits once', 'A pointer click on the input track toggles the model once, switches the icon scope and runs validation.');

    await protocolInput.focus();
    await page.keyboard.press('Space');
    await expectModel('protocolSwitchModel', false, 'Space toggles the native Switch model');
    assert.deepEqual(await page.evaluate(() => window.__checkboxSwitch.events.protocolSwitchModel), [true, false], 'Space adds exactly one model update');
    assert.equal(await page.locator('#protocol-thumb').getAttribute('data-icon'), 'close', 'thumb scope follows falseIcon after Space');
    assert.ok(await page.locator('.ui-selection-ripple.is-switch').locator('.ui-ripple-layer').count(), 'keyboard activation creates the configured ripple');
    passed('Space activation retains native input semantics and emits once', 'Keyboard activation toggles through the input and does not duplicate the model event.');

    assert.equal(await page.locator('#loader-slot-contract').getAttribute('data-active'), 'true', 'loader slot receives isActive=true while loading');
    assert.equal(await page.locator('#loader-slot-contract').getAttribute('data-color'), 'primary', 'loader slot receives the valid control color');
    assert.equal(await page.locator('#loader-fallback-switch').getAttribute('aria-busy'), 'true');
    await page.evaluate(() => { window.__checkboxSwitch.state.loaderSlotLoading = false; });
    await flush();
    assert.equal(await page.locator('#loader-slot-contract').count(), 0, 'loader slot is removed when loading becomes false');
    assert.equal(await page.locator('#loader-fallback-switch').getAttribute('aria-busy'), null, 'aria-busy clears when loading ends');
    assert.equal(await page.locator('#loader-fallback-switch').evaluate(element => element.parentElement.querySelector('.ui-switch-thumb .prototype-icon') ? 1 : 0), 1, 'the state icon renders after loading ends');
    passed('loader slot receives activity/color and disappears after loading', 'The loading fallback reports its active state and color, then yields to the icon when loading ends.');

    assert.equal(await page.locator('#thumb-color-switch').evaluate(element => element.parentElement.querySelector('.ui-switch-thumb').style.backgroundColor), '', 'thumbColor does not apply while unchecked');
    await page.locator('#thumb-color-switch').click();
    const semanticThumbColors = await page.locator('#thumb-color-switch').evaluate(element => {
        const thumb = element.parentElement.querySelector('.ui-switch-thumb');
        const style = getComputedStyle(thumb);
        return { background: style.backgroundColor, foreground: style.color, inlineBackground: thumb.style.backgroundColor, inlineForeground: thumb.style.color };
    });
    assert.match(semanticThumbColors.inlineBackground, /ui-theme-primary|accent/);
    assert.match(semanticThumbColors.inlineForeground, /ui-theme-on-primary|on-primary/);
    assert.notEqual(semanticThumbColors.background, semanticThumbColors.foreground, 'semantic thumb color supplies a contrasting icon foreground');
    const flatThumbShadow = await page.locator('#flat-thumb-switch').evaluate(element => getComputedStyle(element.parentElement.querySelector('.ui-switch-thumb')).boxShadow);
    assert.equal(flatThumbShadow, 'none', 'flat disables custom thumb shadow');
    const flatNativeShadow = await page.locator('[data-flat-switch]').evaluate(element => getComputedStyle(element, '::before').boxShadow);
    assert.equal(flatNativeShadow, 'none', 'the real demo flat variant also removes the native thumb shadow');
    passed('thumbColor is selected-only and flat removes thumb shadows', 'Computed and inline styles confirm selected color application and both custom/native flat thumb shadow removal.');

    await page.waitForTimeout(650);
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await flush();
    const reducedMotionBox = await protocolInput.boundingBox();
    assert.ok(reducedMotionBox);
    await page.mouse.click(reducedMotionBox.x + reducedMotionBox.width / 2, reducedMotionBox.y + reducedMotionBox.height / 2);
    await expectModel('protocolSwitchModel', true, 'reduced-motion pointer input still toggles the model');
    assert.equal(await page.locator('.ui-selection-ripple.is-switch').locator('.ui-ripple-layer').count(), 0, 'reduced motion suppresses ripple creation');
    await page.evaluate(() => { delete document.documentElement.dataset.reducedMotion; });
    await flush();
    passed('reduced-motion setting suppresses ripple without blocking Switch interaction', 'The model still changes while the app reduced-motion flag prevents ripple layers.');

    let groupValidation = await page.evaluate(() => window.__checkboxSwitch.validateGroupCheckbox());
    assert.deepEqual(groupValidation, [], 'child form validation receives the checkbox group array model');
    await page.evaluate(() => { window.__checkboxSwitch.state.validationGroupModel = []; });
    await flush();
    groupValidation = await page.evaluate(() => window.__checkboxSwitch.validateGroupCheckbox());
    assert.deepEqual(groupValidation, ['checkbox group value missing'], 'child validation reads the changed group model rather than its standalone default');
    passed('Checkbox form validation consumes the live group model', 'A child validator passes for the selected group array and fails with its exact message after the group becomes empty.');

    await page.evaluate(() => {
        window.__checkboxSwitch.state.formCheckbox = false;
        window.__checkboxSwitch.state.formSwitch = false;
    });
    await flush();
    await page.evaluate(() => window.__checkboxSwitch.resetForm());
    await flush();
    await expectModel('formCheckbox', null, 'form reset clears checkbox model to null');
    await expectModel('formSwitch', null, 'form reset clears switch model to null');
    assert.equal((await inputState('form-checkbox')).checked, false);
    assert.equal((await inputState('form-switch')).checked, false);
    const formValidation = await page.evaluate(() => window.__checkboxSwitch.refs.form.value.validate());
    assert.equal(formValidation.valid, false, 'Form validate still consumes reset values');
    passed('UForm reset and validate retain null model semantics for both controls', 'The form reset sets both model values to null and validation reports their required-true rules as invalid.');

    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await page.setViewportSize({ width: 1200, height: 900 });
    const demoInput = page.locator('[data-custom-switch]');
    await demoInput.scrollIntoViewIfNeeded();
    const demoBox = await demoInput.boundingBox();
    assert.ok(demoBox, 'real SwitchProtocolsDemo input is visible for pointer interaction');
    await page.mouse.move(demoBox.x + demoBox.width / 2, demoBox.y + demoBox.height / 2);
    await page.mouse.down();
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.parentElement.querySelector('.ui-ripple-layer'));
    const lightPointerPath = path.join(screenshotDirectory, 'switch-light-1200-pointer-ripple.png');
    await page.locator('[data-switch-protocol-demo]').screenshot({ path: lightPointerPath });
    report.screenshots.push({ name: 'light-1200-pointer-ripple', path: lightPointerPath, viewport: '1200x900 CSS px, DPR 1' });
    await page.mouse.up();
    await page.waitForTimeout(300);
    assert.equal(await demoInput.isChecked(), false, 'real demo pointer click toggles the public Switch model');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await demoInput.focus();
    await page.keyboard.down('Space');
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.parentElement.querySelector('.ui-ripple-layer'));
    const darkKeyboardPath = path.join(screenshotDirectory, 'switch-dark-390-keyboard-ripple.png');
    await page.locator('[data-switch-protocol-demo]').screenshot({ path: darkKeyboardPath });
    report.screenshots.push({ name: 'dark-390-keyboard-ripple', path: darkKeyboardPath, viewport: '390x844 CSS px, DPR 1' });
    await page.keyboard.up('Space');
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.checked === true);
    passed('real SwitchProtocolsDemo supports pointer and keyboard activation', 'Captured the actual docs demo at 1200 light and 390 dark while each input path displayed its ripple.');

    const demoDisabledSetting = page.locator('.switch-demo-settings label').filter({ hasText: '禁用示例' });
    await demoDisabledSetting.click();
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.disabled === true);
    const disabledDemoBefore = await demoInput.isChecked();
    await demoInput.evaluate(element => { element.checked = !element.checked; element.dispatchEvent(new Event('change', { bubbles: true })); });
    await flush();
    assert.equal(await demoInput.isChecked(), disabledDemoBefore, 'disabled real-demo input restores the checked state');
    await demoDisabledSetting.click();
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.disabled === false);
    const demoReadonlySetting = page.locator('.switch-demo-settings label').filter({ hasText: '只读示例' });
    await demoReadonlySetting.click();
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.getAttribute('aria-readonly') === 'true');
    const readonlyDemoBefore = await demoInput.isChecked();
    await demoInput.evaluate(element => { element.checked = !element.checked; element.dispatchEvent(new Event('change', { bubbles: true })); });
    await flush();
    assert.equal(await demoInput.isChecked(), readonlyDemoBefore, 'readonly real-demo input restores the checked state');
    passed('real demo disabled and readonly settings block changes', 'The documented controls dynamically put the custom Switch into disabled/readonly state and rejected synthetic native changes.');

    const scaledContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.25, reducedMotion: 'reduce' });
    const scaledPage = await scaledContext.newPage();
    scaledPage.on('pageerror', error => pageErrors.push(error.stack ?? error.message));
    scaledPage.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    await scaledPage.goto(url, { waitUntil: 'networkidle' });
    await scaledPage.waitForSelector('[data-custom-switch]');
    await scaledPage.evaluate(() => { document.documentElement.dataset.theme = 'light'; document.documentElement.dataset.reducedMotion = 'true'; });
    const scaledDemoInput = scaledPage.locator('[data-custom-switch]');
    await scaledDemoInput.scrollIntoViewIfNeeded();
    const scaledDemoBox = await scaledDemoInput.boundingBox();
    assert.ok(scaledDemoBox);
    await scaledPage.mouse.move(scaledDemoBox.x + scaledDemoBox.width / 2, scaledDemoBox.y + scaledDemoBox.height / 2);
    await scaledPage.mouse.down();
    await scaledPage.waitForTimeout(50);
    assert.equal(await scaledDemoInput.evaluate(element => element.parentElement.querySelectorAll('.ui-ripple-layer').length), 0, 'reduced-motion docs demo suppresses pointer ripple');
    const lightScaledPath = path.join(screenshotDirectory, 'switch-light-390-dpr125-reduced-motion.png');
    await scaledPage.locator('[data-switch-protocol-demo]').screenshot({ path: lightScaledPath });
    report.screenshots.push({ name: 'light-390-dpr125-reduced-motion', path: lightScaledPath, viewport: '390x844 CSS px, DPR 1.25, reduced motion' });
    await scaledPage.mouse.up();
    await scaledContext.close();
    passed('real demo remains responsive at 390 CSS px and DPR 1.25 with reduced motion', 'The screenshot records the live docs demo at high-density mobile scale and confirms reduced-motion suppression.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; document.body.style.zoom = '125%'; });
    await demoReadonlySetting.click();
    await page.waitForFunction(() => document.querySelector('[data-custom-switch]')?.getAttribute('aria-readonly') !== 'true');
    await demoInput.scrollIntoViewIfNeeded();
    const cssZoomBefore = await demoInput.isChecked();
    await demoInput.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(before => document.querySelector('[data-custom-switch]')?.checked !== before, cssZoomBefore);
    const cssZoomMetrics = await page.evaluate(() => {
        const input = document.querySelector('[data-custom-switch]');
        const track = input.parentElement;
        const inputRect = input.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        return {
            viewportWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            inputWidth: input.clientWidth,
            inputScrollWidth: input.scrollWidth,
            inputLeft: inputRect.left,
            inputRight: inputRect.right,
            trackLeft: trackRect.left,
            trackRight: trackRect.right,
            trackWidth: track.clientWidth,
            trackScrollWidth: track.scrollWidth,
            focused: document.activeElement === input,
            outlineStyle: getComputedStyle(input).outlineStyle,
            outlineWidth: getComputedStyle(input).outlineWidth,
            after: input.checked
        };
    });
    assert.ok(cssZoomMetrics.documentWidth <= cssZoomMetrics.viewportWidth, `document overflows at CSS zoom: ${JSON.stringify(cssZoomMetrics)}`);
    assert.ok(cssZoomMetrics.bodyWidth <= cssZoomMetrics.viewportWidth, `body overflows at CSS zoom: ${JSON.stringify(cssZoomMetrics)}`);
    assert.ok(cssZoomMetrics.inputScrollWidth <= cssZoomMetrics.inputWidth, `native Switch input overflows: ${JSON.stringify(cssZoomMetrics)}`);
    assert.ok(cssZoomMetrics.trackScrollWidth <= cssZoomMetrics.trackWidth, `Switch track overflows: ${JSON.stringify(cssZoomMetrics)}`);
    assert.ok(cssZoomMetrics.trackLeft >= 0 && cssZoomMetrics.trackRight <= cssZoomMetrics.viewportWidth, `Switch track leaves viewport: ${JSON.stringify(cssZoomMetrics)}`);
    assert.equal(cssZoomMetrics.focused, true, 'Space interaction leaves keyboard focus on the actual Switch input');
    assert.notEqual(cssZoomMetrics.outlineStyle, 'none', 'keyboard focus border remains visible at CSS zoom 125%');
    assert.ok(Number.parseFloat(cssZoomMetrics.outlineWidth) > 0, 'keyboard focus outline retains a visible computed width under CSS zoom');
    assert.notEqual(cssZoomBefore, cssZoomMetrics.after, 'Space toggles the public Switch at CSS zoom 125%');
    const cssZoomPath = path.join(screenshotDirectory, 'switch-light-390-csszoom125.png');
    await page.locator('[data-switch-protocol-demo]').screenshot({ path: cssZoomPath });
    report.screenshots.push({ name: 'light-390-css-zoom-125', path: cssZoomPath, viewport: '390x844 CSS px, body CSS zoom 125%' });
    await page.evaluate(() => { document.body.style.zoom = ''; });
    passed('real demo remains in viewport at CSS zoom 125% with visible keyboard focus', JSON.stringify(cssZoomMetrics));

    assert.deepEqual(pageErrors, [], 'no page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser errors occurred');
    assert.deepEqual(consoleWarnings, [], 'no Vue/runtime warnings occurred');
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    if (page) {
        try {
            report.failureState = await page.evaluate(() => ({
                state: { ...window.__checkboxSwitch?.state },
                events: JSON.parse(JSON.stringify(window.__checkboxSwitch?.events ?? {})),
                inputs: Array.from(document.querySelectorAll('input.ui-checkbox-control, input.ui-switch')).map(element => ({
                    id: element.id, checked: element.checked, indeterminate: element.indeterminate,
                    disabled: element.disabled, readonly: element.getAttribute('aria-readonly'),
                    ariaChecked: element.getAttribute('aria-checked'), name: element.name, value: element.value
                }))
            }));
        } catch (stateError) {
            report.failureStateError = stateError instanceof Error ? stateError.message : String(stateError);
        }
    }
} finally {
    report.pageErrors = pageErrors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    try {
        report.sourceSha256After = await hashSources();
        report.sourceChangedDuringRun = JSON.stringify(report.sourceSha256After) !== JSON.stringify(sourceSha256);
    } catch (error) {
        report.sourceHashFailure = error instanceof Error ? error.message : String(error);
    }
    if (browser) await browser.close();
    await server.close();
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
}

console.log(`Evidence: ${path.join(evidence, 'report.json')}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else if (report.sourceChangedDuringRun) {
    console.error('A product source file changed during the checkbox/switch run.');
    process.exitCode = 1;
} else {
    console.log(`PASS ${report.checks.length} Checkbox and Switch protocol groups.`);
}
