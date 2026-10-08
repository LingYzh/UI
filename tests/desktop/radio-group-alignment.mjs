import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
await mkdir(path.resolve(root, 'artifacts'), { recursive: true });
const evidence = await mkdtemp(path.resolve(root, 'artifacts', 'radio-group-alignment-'));
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

await writeFile(path.join(fixtureDirectory, 'index.html'), `<!doctype html>
<html lang="en">
    <head><meta charset="UTF-8"><title>Radio group alignment</title></head>
    <body><div id="app"></div><script type="module" src="./main.ts"></script></body>
</html>
`, 'utf8');

await writeFile(path.join(fixtureDirectory, 'main.ts'), `import { createApp } from 'vue';
import RadioFixture from './RadioFixture.vue';
import '/src/ui/styles.css';

createApp(RadioFixture).mount('#app');
`, 'utf8');

await writeFile(path.join(fixtureDirectory, 'RadioFixture.vue'), `<script setup>
import { onMounted, ref } from 'vue';
import UiForm from '/src/ui/UiForm.vue';
import UiRadio from '/src/ui/UiRadio.vue';
import UiRadioGroup from '/src/ui/URadioGroup.vue';
import USelectionControl from '/src/ui/USelectionControl.vue';
import USelectionControlGroup from '/src/ui/USelectionControlGroup.vue';

const standalone = ref('string-a');
const standaloneObject = ref({ id: 'object-a', source: 'initial' });
const defaultTrueValue = ref(false);
const groupValue = ref({ id: 'group-a', source: 'initial' });
const selectionGroupValue = ref({ id: 'selection-a', source: 'initial' });
const selectionStandalone = ref({ id: 'standalone-selection', source: 'initial' });
const radioDisabled = ref(false);
const radioReadonly = ref(false);
const groupDisabled = ref(false);
const groupReadonly = ref(false);
const selectionDisabled = ref(false);
const selectionReadonly = ref(false);
const selectionGroupDisabled = ref(false);
const selectionGroupReadonly = ref(false);
const checkboxValue = ref(['terms']);
const switchValue = ref('off');
const formValue = ref(null);
const formValidity = ref(null);
const validationRadio = ref();
const standaloneRadio = ref();
const radioGroup = ref();
const selectionGroup = ref();
const radioForm = ref();
const byId = (left, right) => left?.id === right?.id;
const acceptedRule = value => value === 'accepted' || 'Choose an accepted value.';
const validationRules = [acceptedRule];

onMounted(() => {
    window.__radioTest = {
        snapshot: () => ({
            standalone: standalone.value,
            standaloneObject: standaloneObject.value,
            defaultTrueValue: defaultTrueValue.value,
            groupValue: groupValue.value,
            selectionGroupValue: selectionGroupValue.value,
            selectionStandalone: selectionStandalone.value,
            checkboxValue: checkboxValue.value,
            switchValue: switchValue.value,
            formValue: formValue.value,
            formValidity: formValidity.value
        }),
        setFlag: (name, value) => {
            ({ radioDisabled, radioReadonly, groupDisabled, groupReadonly, selectionDisabled, selectionReadonly, selectionGroupDisabled, selectionGroupReadonly })[name].value = value;
        },
        resetStandalone: () => standaloneRadio.value.reset(),
        resetRadioGroup: () => radioGroup.value.reset(),
        resetSelectionGroup: () => selectionGroup.value.reset(),
        validateRadio: () => validationRadio.value.validate(),
        validateForm: () => radioForm.value.validate(),
        validationErrors: () => validationRadio.value.errors,
        resetValidation: () => validationRadio.value.resetValidation(),
        resetFormRadio: () => validationRadio.value.reset(),
        resetForm: () => radioForm.value.reset()
    };
});
</script>

<template>
    <main>
        <section aria-label="Standalone UiRadio">
            <UiRadio ref="standaloneRadio" v-model="standalone" value="string-a" name="standalone-string">String A</UiRadio>
            <UiRadio v-model="standalone" value="string-b" name="standalone-string" :disabled="radioDisabled" :readonly="radioReadonly">String B</UiRadio>
            <UiRadio v-model="standaloneObject" :true-value="{ id: 'object-a' }" :false-value="{ id: 'object-off' }" :value-comparator="byId" name="standalone-object">Object true value</UiRadio>
            <UiRadio v-model="standaloneObject" value="ignored-object-value" :true-value="{ id: 'object-b' }" :value-comparator="byId" name="standalone-object">Object true value B</UiRadio>
            <UiRadio v-model="defaultTrueValue" name="default-radio-value">Default true value</UiRadio>
        </section>

        <UiRadioGroup
            ref="radioGroup"
            v-model="groupValue"
            name="group-radio-name"
            label="Object radio group"
            :value-comparator="byId"
            :disabled="groupDisabled"
            :readonly="groupReadonly"
        >
            <UiRadio :value="{ id: 'group-a', source: 'option' }" name="ignored-child-name">Group A</UiRadio>
            <UiRadio :value="{ id: 'ignored-group-value' }" :true-value="{ id: 'group-b', source: 'option' }" name="ignored-child-name">Group B</UiRadio>
        </UiRadioGroup>

        <USelectionControlGroup
            ref="selectionGroup"
            v-model="selectionGroupValue"
            name="selection-group-name"
            label="Object selection group"
            :value-comparator="byId"
            :disabled="selectionGroupDisabled"
            :readonly="selectionGroupReadonly"
        >
            <USelectionControl type="radio" :value="{ id: 'selection-a' }" label="Selection A" name="ignored-selection-name" />
            <USelectionControl type="radio" :true-value="{ id: 'selection-b' }" label="Selection B" name="ignored-selection-name" />
        </USelectionControlGroup>

        <section aria-label="Standalone selection controls">
            <USelectionControl
                v-model="selectionStandalone"
                type="radio"
                :value="{ id: 'standalone-selection' }"
                :value-comparator="byId"
                name="standalone-selection-name"
                label="Standalone selection radio"
                :disabled="selectionDisabled"
                :readonly="selectionReadonly"
            />
            <USelectionControl
                v-model="selectionStandalone"
                type="radio"
                :true-value="{ id: 'standalone-selection-b' }"
                :value-comparator="byId"
                name="standalone-selection-name"
                label="Standalone selection radio B"
            />
            <USelectionControl v-model="checkboxValue" value="terms" label="Terms checkbox" />
            <USelectionControl v-model="switchValue" type="switch" value="preference" true-value="on" false-value="off" label="Preference switch" />
        </section>

        <UiForm ref="radioForm" v-model="formValidity" label="Radio validation form">
            <UiRadio
                ref="validationRadio"
                v-model="formValue"
                value="accepted"
                :rules="validationRules"
            >Accepted</UiRadio>
        </UiForm>
    </main>
</template>
`, 'utf8');

let baselineRadioSource = execFileSync('git', ['show', 'HEAD:src/ui/UiRadio.vue'], { cwd: root, encoding: 'utf8' });
const sourceImport = file => path.relative(evidence, path.join(root, 'src/ui', file)).split(path.sep).join('/');
for (const [from, file] of [
    ["from './ripple'", 'ripple.ts'],
    ["from './pointer-focus'", 'pointer-focus.ts'],
    ["from './UiControlFrame.vue'", 'UiControlFrame.vue'],
    ["from './form'", 'form.ts']
]) baselineRadioSource = baselineRadioSource.replaceAll(from, `from '${sourceImport(file)}'`);
assert.equal(/from ['"]\.\//.test(baselineRadioSource), false, 'baseline imports resolve to the live source tree');
const baselineRadioPath = path.join(evidence, 'UiRadioBaseline.vue');
await writeFile(baselineRadioPath, baselineRadioSource, 'utf8');

for (const [name, radioImport] of [
    ['current', '/src/ui/UiRadio.vue'],
    ['baseline', '../UiRadioBaseline.vue']
]) {
    for (const rulesMode of ['stable', 'inline', 'inline-callback']) {
        const rulesBinding = rulesMode === 'stable'
            ? ':rules="rules"'
            : rulesMode === 'inline'
                ? ':rules="[acceptedRule]"'
                : `:rules="[(value) => !!value || '请选择']"`;
        await writeFile(path.join(fixtureDirectory, `FormProbe-${name}-${rulesMode}.vue`), `<script setup>
import { onMounted, ref } from 'vue';
import UiForm from '/src/ui/UiForm.vue';
import ProbeRadio from '${radioImport}';

const value = ref(null);
const valid = ref(null);
const form = ref();
const radio = ref();
const acceptedRule = model => model === 'accepted' || 'Choose an accepted value.';
const rules = [acceptedRule];

onMounted(() => {
    window.__formProbeErrors = [];
    window.addEventListener('unhandledrejection', event => window.__formProbeErrors.push(String(event.reason?.message ?? event.reason)));
    window.addEventListener('error', event => window.__formProbeErrors.push(event.message));
    window.__formProbe = {
        snapshot: () => ({ value: value.value, valid: valid.value, errors: radio.value?.errors ?? [] }),
        validateForm: () => form.value.validate(),
        validateRadio: () => radio.value.validate(),
        reset: () => form.value.reset()
    };
});
</script>

<template>
    <main>
        <UiForm ref="form" v-model="valid" label="Form probe">
            <ProbeRadio ref="radio" v-model="value" value="accepted" ${rulesBinding}>Accepted</ProbeRadio>
        </UiForm>
    </main>
</template>
`, 'utf8');
        await writeFile(path.join(fixtureDirectory, `FormProbe-${name}-${rulesMode}-main.ts`), `import { createApp } from 'vue';
import FormProbe from './FormProbe-${name}-${rulesMode}.vue';
import '/src/ui/styles.css';

createApp(FormProbe).mount('#app');
`, 'utf8');
        await writeFile(path.join(fixtureDirectory, `form-${name}-${rulesMode}.html`), `<!doctype html>
<html lang="en">
    <head><meta charset="UTF-8"><title>Radio form probe ${name} ${rulesMode}</title></head>
    <body><div id="app"></div><script type="module" src="./FormProbe-${name}-${rulesMode}-main.ts"></script></body>
</html>
`, 'utf8');
    }
}

await writeFile(path.join(fixtureDirectory, 'FormProbeMutable.vue'), `<script setup>
import { onMounted, ref } from 'vue';
import UiForm from '/src/ui/UiForm.vue';
import UiRadio from '/src/ui/UiRadio.vue';

const value = ref(null);
const valid = ref(null);
const form = ref();
const radio = ref();
function createRule(expected, message) {
    return model => model === expected || message;
}
const firstRule = createRule('first', 'Choose the first value.');
const secondRule = createRule('second', 'Choose the second value.');
const rules = ref([firstRule]);
const initialRulesArray = rules.value;

onMounted(() => {
    window.__formProbeErrors = [];
    window.addEventListener('unhandledrejection', event => window.__formProbeErrors.push(String(event.reason?.message ?? event.reason)));
    window.addEventListener('error', event => window.__formProbeErrors.push(event.message));
    window.__formProbe = {
        snapshot: () => ({
            value: value.value,
            valid: valid.value,
            errors: radio.value?.errors ?? [],
            sameRulesArray: rules.value === initialRulesArray,
            sameRuleBody: firstRule.toString() === secondRule.toString(),
            differentRuleIdentity: firstRule !== secondRule
        }),
        validateForm: () => form.value.validate(),
        replaceRule: () => rules.value.splice(0, 1, secondRule)
    };
});
</script>

<template>
    <main>
        <UiForm ref="form" v-model="valid" label="Mutable rules probe">
            <UiRadio ref="radio" v-model="value" value="second" :rules="rules">Second</UiRadio>
        </UiForm>
    </main>
</template>
`, 'utf8');
await writeFile(path.join(fixtureDirectory, 'FormProbe-mutable-main.ts'), `import { createApp } from 'vue';
import FormProbe from './FormProbeMutable.vue';
import '/src/ui/styles.css';

createApp(FormProbe).mount('#app');
`, 'utf8');
await writeFile(path.join(fixtureDirectory, 'form-mutable.html'), `<!doctype html>
<html lang="en">
    <head><meta charset="UTF-8"><title>Mutable form rules probe</title></head>
    <body><div id="app"></div><script type="module" src="./FormProbe-mutable-main.ts"></script></body>
</html>
`, 'utf8');

const server = await createServer({
    root,
    configFile: false,
    plugins: [vue()],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
    optimizeDeps: { noDiscovery: true },
    appType: 'mpa'
});
await server.listen();
const address = server.httpServer.address();
assert(address && typeof address === 'object');
const fixturePath = path.relative(root, path.join(fixtureDirectory, 'index.html')).split(path.sep).join('/');
const fixtureUrl = `http://127.0.0.1:${address.port}/${fixturePath}`;
const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: fixtureUrl
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: root, env });
const page = await app.firstWindow();
page.setDefaultTimeout(8000);
const errors = [];
let activeProbe;
page.on('pageerror', error => {
    errors.push(error.message);
    activeProbe?.pageErrors.push(error.message);
});
page.on('console', message => {
    if (message.type() === 'warning' || message.type() === 'error') {
        activeProbe?.consoleMessages.push(`${message.type()}: ${message.text()}`);
        if (message.type() === 'error') {
            activeProbe?.consoleErrors.push(message.text());
            console.error(`BROWSER ${message.text()}`);
        }
    }
});
page.on('requestfailed', request => console.error(`REQUEST ${request.url()} ${request.failure()?.errorText ?? ''}`));

async function snapshot() {
    return page.evaluate(() => window.__radioTest.snapshot());
}

async function setFlag(name, value) {
    await page.evaluate(([flag, next]) => window.__radioTest.setFlag(flag, next), [name, value]);
}

async function runFormProbe(name, rulesMode) {
    const probe = { component: name, rulesMode, pageErrors: [], consoleErrors: [], consoleMessages: [] };
    activeProbe = probe;
    try {
        const formUrl = fixtureUrl.replace('index.html', `form-${name}-${rulesMode}.html`);
        await page.goto(formUrl);
        await page.locator('main').waitFor();
        await page.waitForFunction(() => Boolean(window.__formProbe));
        await page.waitForTimeout(120);
        probe.initial = await page.evaluate(() => window.__formProbe.snapshot());
        await page.locator('main').screenshot({ path: path.join(evidence, `form-${name}-${rulesMode}-initial.png`) });
        probe.invalidValidation = await page.evaluate(() => window.__formProbe.validateForm());
        probe.afterInvalidValidation = await page.evaluate(() => window.__formProbe.snapshot());
        await page.locator('main').screenshot({ path: path.join(evidence, `form-${name}-${rulesMode}-invalid.png`) });
        await page.getByRole('radio', { name: 'Accepted', exact: true }).click();
        probe.validValidation = await page.evaluate(() => window.__formProbe.validateForm());
        probe.afterValidValidation = await page.evaluate(() => window.__formProbe.snapshot());
        await page.evaluate(() => window.__formProbe.reset());
        probe.afterReset = await page.evaluate(() => window.__formProbe.snapshot());
    }
    catch (error) {
        probe.harnessError = error instanceof Error ? error.message : String(error);
    }
    await page.waitForTimeout(80);
    probe.pageErrors = [...probe.pageErrors];
    probe.consoleErrors = [...probe.consoleErrors];
    probe.consoleMessages = [...probe.consoleMessages];
    probe.windowErrors = await page.evaluate(() => window.__formProbeErrors ?? []).catch(() => []);
    activeProbe = undefined;
    return probe;
}

async function runMutableRulesProbe() {
    const probe = { component: 'current', rulesMode: 'same-array-mutation', pageErrors: [], consoleErrors: [], consoleMessages: [] };
    activeProbe = probe;
    try {
        await page.goto(fixtureUrl.replace('index.html', 'form-mutable.html'));
        await page.locator('main').waitFor();
        await page.waitForFunction(() => Boolean(window.__formProbe));
        await page.waitForTimeout(120);
        probe.initial = await page.evaluate(() => window.__formProbe.snapshot());
        probe.invalidValidation = await page.evaluate(() => window.__formProbe.validateForm());
        probe.afterFirstRuleValidation = await page.evaluate(() => window.__formProbe.snapshot());
        await page.locator('main').screenshot({ path: path.join(evidence, 'form-mutable-first-rule-invalid.png') });
        await page.evaluate(() => window.__formProbe.replaceRule());
        await page.waitForFunction(() => window.__formProbe.snapshot().errors.length === 0);
        probe.afterRuleReplacement = await page.evaluate(() => window.__formProbe.snapshot());
        probe.secondRuleValidation = await page.evaluate(() => window.__formProbe.validateForm());
        probe.afterSecondRuleValidation = await page.evaluate(() => window.__formProbe.snapshot());
        await page.locator('main').screenshot({ path: path.join(evidence, 'form-mutable-second-rule-invalid.png') });
        await page.getByRole('radio', { name: 'Second', exact: true }).click();
        probe.acceptedValidation = await page.evaluate(() => window.__formProbe.validateForm());
        probe.afterAcceptedValidation = await page.evaluate(() => window.__formProbe.snapshot());
    }
    catch (error) {
        probe.harnessError = error instanceof Error ? error.message : String(error);
    }
    await page.waitForTimeout(80);
    probe.pageErrors = [...probe.pageErrors];
    probe.consoleErrors = [...probe.consoleErrors];
    probe.consoleMessages = [...probe.consoleMessages];
    probe.windowErrors = await page.evaluate(() => window.__formProbeErrors ?? []).catch(() => []);
    activeProbe = undefined;
    return probe;
}

try {
    try {
        await page.locator('main').waitFor();
    }
    catch (error) {
        console.error(`Fixture URL: ${page.url()}`);
        console.error(`Fixture body: ${(await page.locator('body').innerText()).slice(0, 1000)}`);
        throw error;
    }
    const standaloneA = page.getByRole('radio', { name: 'String A', exact: true });
    const standaloneB = page.getByRole('radio', { name: 'String B', exact: true });
    const objectRadio = page.getByRole('radio', { name: 'Object true value', exact: true });
    const objectRadioB = page.getByRole('radio', { name: 'Object true value B', exact: true });
    const defaultTrueRadio = page.getByRole('radio', { name: 'Default true value', exact: true });
    const groupA = page.getByRole('radio', { name: 'Group A', exact: true });
    const groupB = page.getByRole('radio', { name: 'Group B', exact: true });
    const selectionA = page.getByRole('radio', { name: 'Selection A', exact: true });
    const selectionB = page.getByRole('radio', { name: 'Selection B', exact: true });
    const selectionStandalone = page.getByRole('radio', { name: 'Standalone selection radio', exact: true });
    const selectionStandaloneB = page.getByRole('radio', { name: 'Standalone selection radio B', exact: true });
    const checkbox = page.getByRole('checkbox', { name: 'Terms checkbox', exact: true });
    const preferenceSwitch = page.getByRole('checkbox', { name: 'Preference switch', exact: true });

    assert.equal(await standaloneA.isChecked(), true, 'standalone string value starts selected');
    assert.equal(await objectRadio.isChecked(), true, 'trueValue-only object selection uses its comparator');
    assert.equal(await objectRadioB.isChecked(), false, 'trueValue takes precedence over value for standalone radios');
    assert.equal(await defaultTrueRadio.isChecked(), false, 'a radio with no value defaults to true');
    assert.equal(await groupA.isChecked(), true, 'UiRadio reads the group-owned object model');
    assert.equal(await selectionA.isChecked(), true, 'USelectionControl reads the group-owned object model');
    assert.equal(await selectionStandalone.isChecked(), true, 'standalone selection radio compares its object value');
    assert.equal(await standaloneA.getAttribute('name'), 'standalone-string', 'standalone UiRadio preserves its name');
    assert.equal(await groupA.getAttribute('name'), 'group-radio-name', 'UiRadio uses the injected group name');
    assert.equal(await selectionA.getAttribute('name'), 'selection-group-name', 'USelectionControl uses the injected group name');
    assert.equal(await selectionStandalone.getAttribute('name'), 'standalone-selection-name', 'standalone USelectionControl preserves its name');
    await page.screenshot({ path: path.join(evidence, 'radio-initial.png'), fullPage: true });

    await standaloneB.click();
    assert.equal((await snapshot()).standalone, 'string-b', 'standalone string selection updates v-model');
    assert.equal(await standaloneB.isChecked(), true);
    await standaloneB.click();
    assert.equal((await snapshot()).standalone, 'string-b', 'clicking an already selected radio does not deselect it');
    await setFlag('radioReadonly', true);
    await standaloneB.click();
    assert.equal((await snapshot()).standalone, 'string-b', 'standalone UiRadio readonly blocks a change');
    await setFlag('radioReadonly', false);
    await setFlag('radioDisabled', true);
    assert.equal(await standaloneB.isDisabled(), true, 'standalone UiRadio disabled reaches the native input');
    await standaloneB.click({ force: true });
    assert.equal((await snapshot()).standalone, 'string-b', 'disabled standalone UiRadio keeps its model');
    await setFlag('radioDisabled', false);
    await page.evaluate(() => window.__radioTest.resetStandalone());
    assert.equal((await snapshot()).standalone, 'string-a', 'standalone exposed reset restores its initial model');
    assert.equal(await standaloneA.isChecked(), true);

    const objectBeforeClick = (await snapshot()).standaloneObject;
    await objectRadio.click();
    assert.deepEqual((await snapshot()).standaloneObject, objectBeforeClick, 'active object radio does not rewrite or deselect its model');
    await objectRadioB.click();
    assert.equal((await snapshot()).standaloneObject.id, 'object-b', 'standalone trueValue object selection updates the model');
    await objectRadioB.click();
    assert.equal((await snapshot()).standaloneObject.id, 'object-b', 'active standalone object radio stays selected');
    await defaultTrueRadio.click();
    assert.equal((await snapshot()).defaultTrueValue, true, 'a radio without value selects boolean true');

    await groupB.click();
    assert.equal((await snapshot()).groupValue.id, 'group-b', 'UiRadio toggles the group with its object value');
    assert.equal(await groupB.isChecked(), true);
    await groupB.click();
    assert.equal((await snapshot()).groupValue.id, 'group-b', 'active UiRadio group item stays selected');
    await page.evaluate(() => window.__radioTest.resetRadioGroup());
    assert.equal((await snapshot()).groupValue.id, 'group-a', 'URadioGroup reset restores its group-owned initial model');
    assert.equal(await groupA.isChecked(), true);
    await setFlag('groupReadonly', true);
    await groupB.click();
    assert.equal((await snapshot()).groupValue.id, 'group-a', 'group readonly blocks a UiRadio update');
    await setFlag('groupReadonly', false);
    await setFlag('groupDisabled', true);
    assert.equal(await groupB.isDisabled(), true, 'group disabled state reaches the native UiRadio');
    assert.equal((await snapshot()).groupValue.id, 'group-a');
    await setFlag('groupDisabled', false);

    await selectionB.click();
    assert.equal((await snapshot()).selectionGroupValue.id, 'selection-b', 'USelectionControl toggles the group with its object value');
    await selectionB.click();
    assert.equal((await snapshot()).selectionGroupValue.id, 'selection-b', 'active USelectionControl group radio stays selected');
    await page.evaluate(() => window.__radioTest.resetSelectionGroup());
    assert.equal((await snapshot()).selectionGroupValue.id, 'selection-a', 'selection group reset restores its group-owned initial model');
    await setFlag('selectionGroupReadonly', true);
    await selectionB.click();
    assert.equal((await snapshot()).selectionGroupValue.id, 'selection-a', 'selection group readonly blocks radio updates');
    await setFlag('selectionGroupReadonly', false);
    await setFlag('selectionGroupDisabled', true);
    assert.equal(await selectionB.isDisabled(), true, 'selection group disabled state reaches its native radio');
    await setFlag('selectionGroupDisabled', false);

    await selectionStandalone.click();
    assert.equal((await snapshot()).selectionStandalone.id, 'standalone-selection', 'standalone object radio does not toggle to false');
    await selectionStandaloneB.click();
    assert.equal((await snapshot()).selectionStandalone.id, 'standalone-selection-b', 'standalone USelectionControl radio uses trueValue before value');
    await selectionStandaloneB.click();
    assert.equal((await snapshot()).selectionStandalone.id, 'standalone-selection-b', 'active standalone selection radio stays selected');
    await setFlag('selectionReadonly', true);
    await selectionStandalone.click();
    assert.equal((await snapshot()).selectionStandalone.id, 'standalone-selection-b', 'standalone selection readonly blocks the radio');
    await setFlag('selectionReadonly', false);
    await setFlag('selectionDisabled', true);
    assert.equal(await selectionStandalone.isDisabled(), true, 'standalone disabled reaches the native radio');
    await setFlag('selectionDisabled', false);

    await checkbox.click();
    assert.deepEqual((await snapshot()).checkboxValue, [], 'standalone checkbox array selection removes its value');
    await checkbox.click();
    assert.deepEqual((await snapshot()).checkboxValue, ['terms'], 'standalone checkbox array selection adds its value');
    await preferenceSwitch.click();
    assert.equal((await snapshot()).switchValue, 'on', 'switch trueValue remains supported');
    await preferenceSwitch.click();
    assert.equal((await snapshot()).switchValue, 'off', 'switch falseValue remains supported');

    const failedValidation = await page.evaluate(() => window.__radioTest.validateRadio());
    assert.equal(failedValidation.valid, false, 'exposed field validation checks the current model');
    assert.match((await page.evaluate(() => window.__radioTest.validationErrors().join(' '))), /Choose an accepted value/);
    const failedFormValidation = await page.evaluate(() => window.__radioTest.validateForm());
    assert.equal(failedFormValidation.valid, false, 'UiForm collects and reports the radio validation result');
    await page.getByRole('radio', { name: 'Accepted', exact: true }).click();
    assert.equal((await snapshot()).formValue, 'accepted', 'radio selection updates the form model');
    const validValidation = await page.evaluate(() => window.__radioTest.validateRadio());
    assert.equal(validValidation.valid, true, 'exposed field validation accepts the selected value');
    const validFormValidation = await page.evaluate(() => window.__radioTest.validateForm());
    assert.equal(validFormValidation.valid, true, 'UiForm accepts the radio after its model becomes valid');
    await page.evaluate(() => window.__radioTest.resetValidation());
    assert.deepEqual(await page.evaluate(() => window.__radioTest.validationErrors()), [], 'resetValidation clears exposed field errors');
    await page.getByRole('radio', { name: 'Accepted', exact: true }).click();
    await page.evaluate(() => window.__radioTest.resetForm());
    assert.equal((await snapshot()).formValue, null, 'exposed field reset restores its initial value');

    assert.deepEqual(errors, [], 'fixture has no uncaught Vue errors');
    const probes = {
        currentStable: await runFormProbe('current', 'stable'),
        baselineStable: await runFormProbe('baseline', 'stable'),
        currentInline: await runFormProbe('current', 'inline'),
        baselineInline: await runFormProbe('baseline', 'inline'),
        currentInlineCallback: await runFormProbe('current', 'inline-callback'),
        baselineInlineCallback: await runFormProbe('baseline', 'inline-callback'),
        currentSameArrayMutation: await runMutableRulesProbe()
    };
    const recursiveErrors = probe => [...new Set([...probe.pageErrors, ...probe.consoleErrors]
        .concat(probe.consoleMessages, probe.windowErrors)
        .filter(message => /Maximum recursive updates|Unhandled rejection/i.test(message))
        .map(message => message.split('\n')[0].trim()))];
    const report = {
        fixture: 'radio-group-alignment',
        source: 'Vite serves local SFCs directly; no build or preview bundle',
        baselineSource: path.relative(root, baselineRadioPath).split(path.sep).join('/'),
        formProbeTrigger: 'UiForm v-model; each probe validates null, selects accepted, validates again, then resets.',
        inlineRulesTrigger: 'The inline case binds :rules="[acceptedRule]"; inlineCallback binds :rules="[(value) => !!value || \'请选择\']" exactly, both recreating rules arrays during renders. The stable case binds a setup-level rules array.',
        inPlaceRulesTrigger: 'The mutable probe validates a failing first rule, replaces it with a different closure produced by the same function body using splice on the same array, checks old errors clear, revalidates against the new captured value/message, then accepts the rule after selecting its value.',
        probes,
        recursiveUpdateErrors: {
            currentStable: recursiveErrors(probes.currentStable),
            baselineStable: recursiveErrors(probes.baselineStable),
            currentInline: recursiveErrors(probes.currentInline),
            baselineInline: recursiveErrors(probes.baselineInline),
            currentInlineCallback: recursiveErrors(probes.currentInlineCallback),
            baselineInlineCallback: recursiveErrors(probes.baselineInlineCallback),
            currentSameArrayMutation: recursiveErrors(probes.currentSameArrayMutation)
        },
        captures: [
            'radio-initial.png',
            'form-current-stable-initial.png',
            'form-current-stable-invalid.png',
            'form-current-inline-initial.png',
            'form-current-inline-invalid.png',
            'form-current-inline-callback-initial.png',
            'form-current-inline-callback-invalid.png',
            'form-baseline-stable-initial.png',
            'form-baseline-inline-initial.png',
            'form-baseline-inline-callback-initial.png',
            'form-mutable-first-rule-invalid.png',
            'form-mutable-second-rule-invalid.png'
        ]
    };
    await writeFile(path.join(evidence, 'form-probes.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
    assert.deepEqual(recursiveErrors(probes.currentStable), recursiveErrors(probes.baselineStable), 'stable rules produce the same UiForm error outcome on current and HEAD UiRadio');
    assert.deepEqual(recursiveErrors(probes.currentInline), recursiveErrors(probes.baselineInline), 'inline rules produce the same UiForm error outcome on current and HEAD UiRadio');
    assert.equal(probes.currentInline.invalidValidation?.valid, probes.baselineInline.invalidValidation?.valid, 'inline rules produce the same invalid form result on current and HEAD UiRadio');
    assert.equal(probes.currentInline.validValidation?.valid, probes.baselineInline.validValidation?.valid, 'inline rules produce the same valid form result on current and HEAD UiRadio');
    assert.deepEqual(recursiveErrors(probes.currentInline), [], 'inline rules do not trigger a recursive update');
    assert.deepEqual(recursiveErrors(probes.currentInlineCallback), recursiveErrors(probes.baselineInlineCallback), 'fresh inline callback rules produce the same UiForm error outcome on current and HEAD UiRadio');
    assert.equal(probes.currentInlineCallback.invalidValidation?.valid, false, 'fresh inline callback rejects the initial null value');
    assert.equal(probes.currentInlineCallback.validValidation?.valid, true, 'fresh inline callback accepts the selected value');
    assert.deepEqual(recursiveErrors(probes.currentInlineCallback), [], 'fresh inline callback rules do not trigger a recursive update');
    assert.deepEqual(recursiveErrors(probes.currentSameArrayMutation), [], 'same-array rule replacement does not trigger a recursive update');
    assert.equal(probes.currentSameArrayMutation.invalidValidation?.valid, false, 'the first in-place array rule rejects the initial value');
    assert.match(probes.currentSameArrayMutation.afterFirstRuleValidation?.errors?.join(' '), /first value/);
    assert.equal(probes.currentSameArrayMutation.afterRuleReplacement?.sameRulesArray, true, 'the rule replacement keeps the original array identity');
    assert.equal(probes.currentSameArrayMutation.afterRuleReplacement?.sameRuleBody, true, 'the replaced callbacks have the same source body');
    assert.equal(probes.currentSameArrayMutation.afterRuleReplacement?.differentRuleIdentity, true, 'the replaced callbacks are distinct closure instances');
    assert.deepEqual(probes.currentSameArrayMutation.afterRuleReplacement?.errors, [], 'changing the rule in place clears the previous validation error');
    assert.equal(probes.currentSameArrayMutation.secondRuleValidation?.valid, false, 'revalidation runs the replacement rule');
    assert.match(probes.currentSameArrayMutation.afterSecondRuleValidation?.errors?.join(' '), /second value/);
    assert.equal(probes.currentSameArrayMutation.acceptedValidation?.valid, true, 'the replacement rule accepts the new selected value');
    console.log('PASS standalone/group radio values and guards, selection-control trueValue-only values, exposed form validation/reset, fresh inline callbacks, and same-array rule replacement');
    console.log(`Form probes: current stable=${probes.currentStable.harnessError ? 'error' : 'completed'}, baseline stable=${probes.baselineStable.harnessError ? 'error' : 'completed'}, current inline=${probes.currentInline.harnessError ? 'error' : 'completed'}, current inline callback=${probes.currentInlineCallback.harnessError ? 'error' : 'completed'}, same-array mutation=${probes.currentSameArrayMutation.harnessError ? 'error' : 'completed'}`);
    console.log(`Evidence: ${evidence}`);
} finally {
    await app.close();
    await server.close();
}
