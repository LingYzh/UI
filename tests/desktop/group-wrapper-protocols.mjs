import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/group-wrapper-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UChipGroup.vue',
    'src/ui/UBtnToggle.vue',
    'src/ui/UItemGroup.vue',
    'src/ui/UItem.vue',
    'src/ui/UChip.vue',
    'src/ui/UiButton.vue',
    'src/ui/UiForm.vue',
    'src/ui/form.ts',
    'src/ui/item-group-state.ts',
    'src/ui/item-group-context.ts',
    'src/ui/selection-context.ts',
    'src/ui/selection.ts',
    'src/ui/button-group.ts',
    'src/ui/group-props.ts',
    'src/ui/index.ts',
    'src/ui/docs/component-examples/chip-group.vue',
    'src/ui/docs/component-examples/btn-toggle.vue'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(productSources.map(async (file) => [
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
        <title>Group wrapper protocol fixture</title>
        <style>
            html, body, #app { height: auto !important; min-height: 0; margin: 0; overflow: visible !important; }
            #app { padding: 20px; }
            #fixture-root { display: grid; gap: 20px; width: min(100%, 880px); margin: 0 auto; }
            #fixture-root > section { display: grid; gap: 12px; min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; }
            #real-demos { display: grid; gap: 20px; width: min(100%, 960px); margin: 0 auto; }
            #real-demos > section { display: grid; gap: 12px; min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; }
            .fixture-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/group-wrapper-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import GroupWrapperFixture from './GroupWrapperFixture.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';

const ui = createUI();
(window).__groupWrapperUi = ui;
createApp(GroupWrapperFixture).use(ui).mount('#app');
`;

const fixtureVue = `<script setup>
import { reactive, ref } from 'vue';
import { UButton, UBtnToggle, UChip, UChipGroup, UForm } from '/src/ui/index.ts';
import ChipGroupDemo from '/src/ui/docs/component-examples/chip-group.vue';
import BtnToggleDemo from '/src/ui/docs/component-examples/btn-toggle.vue';

const state = reactive({
    chipModel: ['chip-a', 'chip-c'],
    chipAcceptUpdates: false,
    chipUpdates: [],
    chipMandatory: true,
    chipDisabled: false,
    buttonModel: ['button-a'],
    buttonMandatory: true,
    formModel: undefined,
    buttonFormModel: undefined,
    formValidity: null
});
const groups = {
    chip: ref(),
    button: ref(),
    form: ref(),
    buttonForm: ref(),
    formRoot: ref()
};
const required = (value) => value === 'accepted' || 'Choose the accepted item';

function recordChipUpdate(value) {
    state.chipUpdates.push(value);
    if (state.chipAcceptUpdates) state.chipModel = value;
}

(window).__groupWrapperProbe = { state, groups };
</script>

<template>
    <main id="fixture-root">
        <section>
            <h2>Chip group public scope and ref</h2>
            <UChipGroup
                :ref="groups.chip"
                :model-value="state.chipModel"
                multiple
                :mandatory="state.chipMandatory"
                :disabled="state.chipDisabled"
                :max="2"
                tag="div"
                @update:model-value="recordChipUpdate"
            >
                <template #default="scope">
                    <div class="fixture-row">
                        <output id="chip-selected-ids">{{ JSON.stringify(scope.selected) }}</output>
                        <output id="chip-selected-values">{{ JSON.stringify(scope.selectedValues) }}</output>
                        <output id="chip-id-check">{{ String(scope.selected.length > 0 && scope.isSelected(scope.selected[0])) }}</output>
                        <output id="chip-value-check">{{ String(scope.isValueSelected('chip-a')) }}</output>
                    </div>
                    <div class="fixture-row">
                        <button id="chip-slot-remove-second" type="button" @click="scope.select(scope.selected[1], false)">Remove second by ID</button>
                        <button id="chip-slot-toggle-a" type="button" @click="scope.toggle('chip-a')">Toggle A by value</button>
                        <button id="chip-slot-next" type="button" @click="scope.next">Next from slot</button>
                        <button id="chip-slot-prev" type="button" @click="scope.prev">Previous from slot</button>
                    </div>
                    <div class="fixture-row">
                        <UChip value="chip-a" data-chip="a">Chip A</UChip>
                        <UChip value="chip-disabled" data-chip="disabled" disabled>Disabled chip</UChip>
                        <UChip value="chip-c" data-chip="c">Chip C</UChip>
                        <UChip value="chip-d" data-chip="d">Chip D</UChip>
                    </div>
                </template>
            </UChipGroup>
        </section>

        <section>
            <h2>Button toggle public scope and ref</h2>
            <UBtnToggle
                :ref="groups.button"
                v-model="state.buttonModel"
                multiple
                :mandatory="state.buttonMandatory"
                :max="2"
                tag="div"
            >
                <template #default="scope">
                    <div class="fixture-row">
                        <output id="button-selected-ids">{{ JSON.stringify(scope.selected) }}</output>
                        <output id="button-selected-values">{{ JSON.stringify(scope.selectedValues) }}</output>
                        <output id="button-id-check">{{ String(scope.selected.length > 0 && scope.isSelected(scope.selected[0])) }}</output>
                        <output id="button-value-check">{{ String(scope.isValueSelected('button-a')) }}</output>
                    </div>
                    <div class="fixture-row">
                        <button id="button-slot-remove-second" type="button" @click="scope.select(scope.selected[1], false)">Remove second by ID</button>
                        <button id="button-slot-toggle-a" type="button" @click="scope.toggle('button-a')">Toggle A by value</button>
                        <button id="button-slot-next" type="button" @click="scope.next">Next from slot</button>
                        <button id="button-slot-prev" type="button" @click="scope.prev">Previous from slot</button>
                    </div>
                    <div class="fixture-row">
                        <UButton value="button-a" data-button="a">Button A</UButton>
                        <UButton value="button-disabled" data-button="disabled" disabled>Disabled button</UButton>
                        <UButton value="button-c" data-button="c">Button C</UButton>
                        <UButton value="button-d" data-button="d">Button D</UButton>
                    </div>
                </template>
            </UBtnToggle>
        </section>

        <section>
            <h2>Chip group form ref</h2>
            <UForm :ref="groups.formRoot" v-model="state.formValidity">
                <UChipGroup
                    :ref="groups.form"
                    v-model="state.formModel"
                    tag="section"
                    :rules="[required]"
                    validate-on="manual"
                >
                    <UChip value="accepted" data-form-chip>Accepted</UChip>
                </UChipGroup>
                <UBtnToggle
                    :ref="groups.buttonForm"
                    v-model="state.buttonFormModel"
                    tag="div"
                    :rules="[required]"
                    validate-on="manual"
                >
                    <UButton value="accepted" data-button-form>Accepted button</UButton>
                </UBtnToggle>
            </UForm>
        </section>

        <div id="real-demos">
            <section>
                <h2>Shipped UChipGroup example</h2>
                <ChipGroupDemo />
            </section>
            <section>
                <h2>Shipped UBtnToggle example</h2>
                <BtnToggleDemo />
            </section>
        </div>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'GroupWrapperFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__group-wrapper-protocols';
const fixturePlugin = {
    name: 'group-wrapper-protocol-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== virtualRoute) {
                next();
                return;
            }
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
        entries: ['artifacts/component-audit-root/group-wrapper-protocols/fixture/main.ts'],
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
        strictPort: false,
        hmr: false,
        watch: { ignored: ['**/artifacts/**'] }
    },
    plugins: [fixturePlugin]
});

const report = {
    fixture: 'group-wrapper-protocols',
    method: 'Vite source fixture imports the public src/ui/index.ts entry and renders the real UChipGroup, UBtnToggle, UChip, UButton, and UForm SFCs in headless Chromium.',
    sourceSha256,
    checks: [],
    demoInteractions: [],
    screenshots: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    limits: [
        'Chromium browser renderer only; no Electron renderer acceptance is claimed.',
        'No full project build, full test suite, or visual design acceptance was run.',
        'The fixture validates local source through the public entry; it does not validate the compiled package bundle.'
    ]
};

const errors = [];
const consoleErrors = [];
const consoleWarnings = [];
const httpErrors = [];
const requestFailures = [];
let browser;
let page;

function passed(name, details) {
    report.checks.push({ name, details });
}

async function settle() {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.waitForTimeout(60);
}

async function readState(key) {
    return page.evaluate((name) => (window).__groupWrapperProbe.state[name], key);
}

async function readJson(selector) {
    return JSON.parse((await page.locator(selector).textContent()) ?? 'null');
}

async function exposed(groupName, member) {
    return page.evaluate(([name, key]) => (window).__groupWrapperProbe.groups[name].value[key], [groupName, member]);
}

async function captureDemos(name, theme, width, height, zoom = 100) {
    await page.setViewportSize({ width, height });
    await page.evaluate(async ({ themeName, zoomPercent }) => {
        await (window).__groupWrapperUi.theme.change(themeName, false);
        document.documentElement.style.zoom = String(zoomPercent) + '%';
    }, { themeName: theme, zoomPercent: zoom });
    await settle();
    const target = page.locator('#real-demos');
    const bounds = await target.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth }));
    assert.equal(viewport.documentWidth, viewport.width, name + ' screenshot has no horizontal page overflow');
    const file = name + '.png';
    await target.screenshot({ path: path.join(evidence, file), animations: 'disabled', caret: 'hide' });
    report.screenshots.push({ file, theme, zoom, viewport, targetBounds: bounds, backend: report.backend });
}

async function isSelected(groupName, id) {
    return page.evaluate(([name, itemId]) => (window).__groupWrapperProbe.groups[name].value.isSelected(itemId), [groupName, id]);
}

async function callRef(groupName, method, args = []) {
    await page.evaluate(([name, key, values]) => {
        const instance = (window).__groupWrapperProbe.groups[name].value;
        return instance[key](...values);
    }, [groupName, method, args]);
    await settle();
}

try {
    await server.listen();
    const baseUrl = server.resolvedUrls.local[0];
    const url = new URL(virtualRoute.slice(1), baseUrl).href;
    const mainUrl = new URL('/artifacts/component-audit-root/group-wrapper-protocols/fixture/main.ts', baseUrl).href;
    report.previewUrl = url;
    report.serverProbe = await Promise.all([
        ['virtual-index', url],
        ['fixture-module', mainUrl]
    ].map(async ([name, target]) => {
        const response = await fetch(target, { signal: AbortSignal.timeout(15000) });
        const body = await response.arrayBuffer();
        return { name, status: response.status, contentType: response.headers.get('content-type'), bytes: body.byteLength };
    }));
    assert.deepEqual(report.serverProbe.map((probe) => probe.status), [200, 200], 'fixture index and main module load before browser navigation');

    try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
        report.backend = 'chrome';
    } catch (chromeError) {
        report.chromeLaunchFailure = chromeError instanceof Error ? chromeError.message : String(chromeError);
        browser = await chromium.launch({ channel: 'msedge', headless: true });
        report.backend = 'edge';
    }
    report.backendLimit = 'Chromium browser renderer only; no Electron renderer acceptance is claimed.';
    page = await browser.newPage({ viewport: { width: 1120, height: 960 } });
    page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
    page.on('console', (message) => {
        const line = message.type() + ': ' + message.text();
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    page.on('response', (response) => {
        if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
    });
    page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('#chip-selected-ids').waitFor();
    await settle();

    const initialChipIds = await readJson('#chip-selected-ids');
    assert.equal(initialChipIds.length, 2, 'UChipGroup forwarded its selected ID array to the public slot');
    assert.deepEqual(await readJson('#chip-selected-values'), ['chip-a', 'chip-c'], 'UChipGroup forwarded public selected values');
    assert.equal(await page.locator('#chip-id-check').textContent(), 'true', 'UChipGroup forwarded isSelected(id)');
    assert.equal(await page.locator('#chip-value-check').textContent(), 'true', 'UChipGroup forwarded isValueSelected(value)');
    assert.deepEqual(await exposed('chip', 'selected'), initialChipIds, 'UChipGroup selected ref getter matches the live slot IDs');
    assert.deepEqual(await exposed('chip', 'selectedValues'), ['chip-a', 'chip-c'], 'UChipGroup selectedValues ref getter exposes public values');
    passed('UChipGroup slot scope and live refs', 'The public default slot receives selected IDs, selected values, and both ID/value selection predicates; the ref getters match the live child state.');

    await page.locator('#chip-slot-remove-second').click();
    await settle();
    assert.deepEqual(await readState('chipModel'), ['chip-a', 'chip-c'], 'a controlled parent may reject the wrapper update');
    assert.deepEqual((await readState('chipUpdates')).at(-1), ['chip-a'], 'scope select(id, false) emitted the requested controlled update');
    assert.deepEqual(await exposed('chip', 'selected'), initialChipIds, 'rejected controlled update leaves the ref getter in sync with the unchanged prop');
    await page.evaluate(() => { (window).__groupWrapperProbe.state.chipAcceptUpdates = true; });
    await page.locator('#chip-slot-remove-second').click();
    await settle();
    assert.deepEqual(await readState('chipModel'), ['chip-a'], 'the parent can accept the forwarded controlled update');
    assert.deepEqual(await exposed('chip', 'selectedValues'), ['chip-a'], 'selectedValues getter updates after the parent accepts a change');
    assert.equal(await isSelected('chip', initialChipIds[1]), false, 'isSelected(id) ref method reads current child state');
    await callRef('chip', 'select', [initialChipIds[1], true]);
    assert.deepEqual(await readState('chipModel'), ['chip-a', 'chip-c'], 'select(id, true) ref method forwards to the child');
    assert.deepEqual(await exposed('chip', 'selected'), initialChipIds, 'selected getter remains live after ID selection');
    passed('UChipGroup controlled updates and ID ref methods', 'The wrapper ref reads current selection and forwards isSelected/select while scope select emits a controlled model update.');

    const disabledChip = page.locator('[data-chip="disabled"] button');
    assert.equal(await disabledChip.isDisabled(), true, 'disabled chip remains disabled inside the wrapper');
    await disabledChip.evaluate((element) => element.click());
    assert.deepEqual(await readState('chipModel'), ['chip-a', 'chip-c'], 'disabled chip cannot change the model');
    await page.locator('[data-chip="d"] button').click();
    assert.deepEqual(await readState('chipModel'), ['chip-a', 'chip-c'], 'multiple max remains enforced through UChipGroup');
    await page.evaluate(() => { (window).__groupWrapperProbe.state.chipDisabled = true; });
    await settle();
    assert.equal(await page.locator('[data-chip="a"] button').isDisabled(), true, 'group disabled reaches nested chips');
    await page.locator('[data-chip="d"] button').evaluate((element) => element.click());
    assert.deepEqual(await readState('chipModel'), ['chip-a', 'chip-c'], 'group disabled blocks nested selection');
    await page.evaluate(() => { (window).__groupWrapperProbe.state.chipDisabled = false; });
    await callRef('chip', 'select', [initialChipIds[1], false]);
    assert.deepEqual(await readState('chipModel'), ['chip-a'], 'ID selection can remove one item from a multiple model');
    await callRef('chip', 'next');
    assert.deepEqual(await readState('chipModel'), ['chip-c'], 'next ref method skips a disabled entry and selects the next available value');
    await callRef('chip', 'prev');
    assert.deepEqual(await readState('chipModel'), ['chip-a'], 'prev ref method moves to the previous available value');
    await page.locator('#chip-slot-next').click();
    await settle();
    assert.deepEqual(await readState('chipModel'), ['chip-c'], 'slot next forwards to the child');
    await page.locator('#chip-slot-prev').click();
    await settle();
    assert.deepEqual(await readState('chipModel'), ['chip-a'], 'slot prev forwards to the child');
    await callRef('chip', 'select', [initialChipIds[0], false]);
    assert.deepEqual(await readState('chipModel'), ['chip-a'], 'mandatory prevents removal of the final selected item');
    await page.evaluate(() => { (window).__groupWrapperProbe.state.chipMandatory = false; });
    await settle();
    await page.locator('#chip-slot-toggle-a').click();
    assert.deepEqual(await readState('chipModel'), [], 'slot toggle(value) remains available when mandatory is disabled');
    assert.deepEqual(await exposed('chip', 'selected'), [], 'selected getter returns the live empty ID array');
    assert.deepEqual(await exposed('chip', 'selectedValues'), [], 'selectedValues getter returns the live empty value array');
    assert.equal(await isSelected('chip', 'missing-id'), false, 'isSelected returns false for an unknown ID');
    passed('UChipGroup disabled, mandatory, multiple, max, and navigation', 'Disabled entries and groups block changes; max and mandatory remain enforced; multiple values, slot toggle, and ID-based next/prev work through the wrapper.');

    await page.locator('[data-button="c"]').click();
    await settle();
    const initialButtonIds = await readJson('#button-selected-ids');
    assert.equal(initialButtonIds.length, 2, 'UBtnToggle forwarded its selected ID array to the public slot');
    assert.deepEqual(await readJson('#button-selected-values'), ['button-a', 'button-c'], 'UBtnToggle forwarded button values');
    assert.equal(await page.locator('#button-id-check').textContent(), 'true', 'UBtnToggle forwarded isSelected(id)');
    assert.equal(await page.locator('#button-value-check').textContent(), 'true', 'UBtnToggle forwarded isValueSelected(value)');
    assert.deepEqual(await exposed('button', 'selected'), initialButtonIds, 'UBtnToggle selected ref getter matches the live slot IDs');
    assert.deepEqual(await exposed('button', 'selectedValues'), ['button-a', 'button-c'], 'UBtnToggle selectedValues ref getter exposes button values');
    const buttonCId = initialButtonIds[1];
    await page.locator('#button-slot-remove-second').click();
    await settle();
    assert.deepEqual(await readState('buttonModel'), ['button-a'], 'UBtnToggle select(id, false) forwards to the child');
    assert.equal(await isSelected('button', buttonCId), false, 'UBtnToggle isSelected reads the changed child state');
    await callRef('button', 'select', [buttonCId, true]);
    assert.deepEqual(await readState('buttonModel'), ['button-a', 'button-c'], 'UBtnToggle select(id, true) forwards to the child');
    assert.equal(await isSelected('button', buttonCId), true, 'UBtnToggle isSelected reads the reselected child state');
    await page.locator('[data-button="d"]').click();
    assert.deepEqual(await readState('buttonModel'), ['button-a', 'button-c'], 'multiple max remains enforced through UBtnToggle');
    assert.equal(await page.locator('[data-button="disabled"]').isDisabled(), true, 'disabled button remains disabled inside UBtnToggle');
    await page.locator('[data-button="disabled"]').evaluate((element) => element.click());
    assert.deepEqual(await readState('buttonModel'), ['button-a', 'button-c'], 'disabled button cannot change the model');
    await page.locator('#button-slot-next').click();
    await settle();
    assert.deepEqual(await readState('buttonModel'), ['button-c'], 'UBtnToggle slot next skips the disabled button');
    await page.locator('#button-slot-prev').click();
    await settle();
    assert.deepEqual(await readState('buttonModel'), ['button-a'], 'UBtnToggle slot prev forwards to the child');
    await callRef('button', 'next');
    assert.deepEqual(await readState('buttonModel'), ['button-c'], 'UBtnToggle next ref method forwards to the child');
    await callRef('button', 'prev');
    assert.deepEqual(await readState('buttonModel'), ['button-a'], 'UBtnToggle prev ref method forwards to the child');
    await callRef('button', 'select', [initialButtonIds[0], false]);
    assert.deepEqual(await readState('buttonModel'), ['button-a'], 'UBtnToggle mandatory prevents removal of the final item');
    await page.evaluate(() => { (window).__groupWrapperProbe.state.buttonMandatory = false; });
    await settle();
    await page.locator('#button-slot-toggle-a').click();
    assert.deepEqual(await readState('buttonModel'), [], 'UBtnToggle slot toggle(value) remains available');
    assert.deepEqual(await exposed('button', 'selected'), [], 'UBtnToggle selected getter returns the live empty ID array');
    assert.deepEqual(await exposed('button', 'selectedValues'), [], 'UBtnToggle selectedValues getter returns the live empty value array');
    assert.equal(await isSelected('button', 'missing-id'), false, 'UBtnToggle isSelected returns false for an unknown ID');
    passed('UBtnToggle slot/ref scope and selection constraints', 'The wrapper exposes all group slot fields and live ID/value refs; ID selection, value toggle, navigation, disabled, mandatory, multiple, and max behavior pass.');

    assert.equal(await page.evaluate(() => (window).__groupWrapperProbe.groups.form.value.element.tagName), 'SECTION', 'existing element ref remains forwarded');
    const invalid = await page.evaluate(() => (window).__groupWrapperProbe.groups.form.value.validate());
    assert.ok(Array.isArray(invalid) && invalid.length > 0, 'standard validate error-array ref remains forwarded');
    assert.ok((await exposed('form', 'errors')).length > 0, 'existing errors ref remains forwarded');
    await callRef('form', 'resetValidation');
    assert.ok((await exposed('form', 'errors')).length > 0, 'resetValidation retains standard silent errors');
    assert.equal(await page.locator('[data-form-chip]').locator('..').getAttribute('aria-invalid'), null, 'silent resetValidation does not show an invalid state');
    await callRef('form', 'focus');
    await settle();
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('ui-chip-select')), true, 'existing focus ref reaches the first chip control');
    await page.locator('[data-form-chip] button').click();
    assert.equal(await readState('formModel'), 'accepted', 'form-associated chip updates the wrapper model');
    const valid = await page.evaluate(() => (window).__groupWrapperProbe.groups.form.value.validate());
    assert.deepEqual(valid, [], 'validation passes after selecting the accepted value');
    await callRef('form', 'reset');
    assert.equal(await readState('formModel'), null, 'standard reset ref clears the model');
    assert.equal(await page.evaluate(() => (window).__groupWrapperProbe.groups.buttonForm.value.element.tagName), 'DIV', 'existing UBtnToggle element ref remains forwarded');
    const buttonInvalid = await page.evaluate(() => (window).__groupWrapperProbe.groups.buttonForm.value.validate());
    assert.ok(Array.isArray(buttonInvalid) && buttonInvalid.length > 0, 'standard UBtnToggle validate error-array ref remains forwarded');
    assert.ok((await exposed('buttonForm', 'errors')).length > 0, 'existing UBtnToggle errors ref remains forwarded');
    await callRef('buttonForm', 'resetValidation');
    assert.ok((await exposed('buttonForm', 'errors')).length > 0, 'UBtnToggle resetValidation retains standard silent errors');
    await callRef('buttonForm', 'focus');
    await settle();
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('ui-button')), true, 'existing UBtnToggle focus ref reaches the first button');
    await page.locator('[data-button-form]').click();
    assert.equal(await readState('buttonFormModel'), 'accepted', 'form-associated button updates the wrapper model');
    const buttonValid = await page.evaluate(() => (window).__groupWrapperProbe.groups.buttonForm.value.validate());
    assert.deepEqual(buttonValid, [], 'UBtnToggle validation passes after selecting the accepted value');
    await callRef('buttonForm', 'reset');
    assert.equal(await readState('buttonFormModel'), null, 'standard UBtnToggle reset ref clears the model');
    passed('existing ChipGroup and BtnToggle form ref methods', 'element, focus, validate, errors, resetValidation, and reset remain available on both wrappers after adding group selection refs.');

    const chipDemo = page.locator('#real-demos [data-demo-component="UChipGroup"]');
    await chipDemo.waitFor();
    const chipDemoOutputs = chipDemo.locator('output');
    assert.match((await chipDemoOutputs.nth(0).textContent()) ?? '', /作用域已选值：a/);
    assert.match((await chipDemoOutputs.nth(1).textContent()) ?? '', /公开 ref 已选值：a/);
    await chipDemo.getByRole('button', { name: '后一项', exact: true }).click();
    await settle();
    assert.match((await chipDemoOutputs.nth(0).textContent()) ?? '', /作用域已选值：b/);
    assert.match((await chipDemoOutputs.nth(1).textContent()) ?? '', /公开 ref 已选值：b/);
    await chipDemo.getByRole('button', { name: '前一项', exact: true }).click();
    await settle();
    assert.match((await chipDemoOutputs.nth(0).textContent()) ?? '', /作用域已选值：a/);
    assert.match((await chipDemoOutputs.nth(1).textContent()) ?? '', /公开 ref 已选值：a/);

    const buttonDemo = page.locator('#real-demos [data-demo-component="UBtnToggle"]');
    const buttonDemoOutputs = buttonDemo.locator('output');
    assert.match((await buttonDemoOutputs.nth(0).textContent()) ?? '', /当前："a"/);
    assert.match((await buttonDemoOutputs.nth(1).textContent()) ?? '', /公开 ref 已选值：\["a"\]/);
    assert.match((await buttonDemoOutputs.nth(2).textContent()) ?? '', /作用域索引：0/);
    await buttonDemo.getByRole('button', { name: '后一项', exact: true }).click();
    await settle();
    assert.match((await buttonDemoOutputs.nth(0).textContent()) ?? '', /当前："b"/);
    assert.match((await buttonDemoOutputs.nth(1).textContent()) ?? '', /公开 ref 已选值：\["b"\]/);
    await buttonDemo.getByRole('button', { name: '前一项', exact: true }).click();
    await settle();
    await buttonDemo.getByRole('button', { name: '详情', exact: true }).click();
    await settle();
    assert.match((await buttonDemoOutputs.nth(0).textContent()) ?? '', /当前："b"/);
    assert.match((await buttonDemoOutputs.nth(1).textContent()) ?? '', /公开 ref 已选值：\["b"\]/);
    await buttonDemo.getByRole('button', { name: '索引二', exact: true }).click();
    await settle();
    assert.match((await buttonDemoOutputs.nth(2).textContent()) ?? '', /作用域索引：1/);
    assert.match((await buttonDemoOutputs.nth(3).textContent()) ?? '', /索引：1/);
    report.demoInteractions.push('Real UChipGroup and UBtnToggle docs SFCs: next/prev refs stayed consistent with selectedValues scope, explicit selection updated the button ref, and the implicit-index slot scope followed the second button.');
    passed('shipped ChipGroup and BtnToggle examples', 'The real docs examples update their displayed selectedValues scope and wrapper ref together when next/previous and button interactions change selection.');

    assert.deepEqual(errors, [], 'no Vue errors or page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser console errors occurred');
    assert.deepEqual(httpErrors, [], 'all fixture requests succeeded');
    assert.deepEqual(requestFailures, [], 'no fixture requests failed');

    await page.evaluate(() => {
        const { state } = (window).__groupWrapperProbe;
        state.chipModel = ['chip-a', 'chip-c'];
        state.chipMandatory = true;
        state.chipDisabled = false;
        state.buttonModel = ['button-a'];
        state.buttonMandatory = true;
        state.formModel = undefined;
        state.buttonFormModel = undefined;
        state.chipAcceptUpdates = true;
    });
    await captureDemos('group-wrapper-demos-wide-light', 'light', 1280, 1200);
    await captureDemos('group-wrapper-demos-wide-dark', 'dark', 1280, 1200);
    await captureDemos('group-wrapper-demos-390-light', 'light', 390, 844);
    await captureDemos('group-wrapper-demos-390-dark', 'dark', 390, 844);
    await captureDemos('group-wrapper-demos-390-125-light', 'light', 390, 844, 125);
    await captureDemos('group-wrapper-demos-390-125-dark', 'dark', 390, 844, 125);
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    if (page) {
        try {
            report.pageStateAtFailure = await page.evaluate(() => ({
                url: location.href,
                title: document.title,
                bodyText: document.body.innerText.slice(0, 5000),
                state: (window).__groupWrapperProbe ? JSON.parse(JSON.stringify((window).__groupWrapperProbe.state)) : null
            }));
        } catch (diagnosticError) {
            report.pageStateCaptureFailure = diagnosticError instanceof Error ? diagnosticError.message : String(diagnosticError);
        }
    }
    errors.push(report.failure);
} finally {
    report.pageErrors = errors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    report.httpErrors = httpErrors;
    report.requestFailures = requestFailures;
    try {
        report.sourceSha256After = await hashSources();
        report.sourceChangedDuringRun = JSON.stringify(report.sourceSha256After) !== JSON.stringify(sourceSha256);
    } catch (error) {
        report.sourceHashFailure = error instanceof Error ? error.message : String(error);
    }
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4) + '\n', 'utf8');
    if (browser) await browser.close();
    await server.close();
}

console.log('Evidence: ' + path.join(evidence, 'report.json'));
console.log('Screenshots: ' + report.screenshots.map((screenshot) => screenshot.file).join(', '));
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else {
    console.log('PASS ' + report.checks.length + ' group wrapper checks on ' + report.backend);
}
