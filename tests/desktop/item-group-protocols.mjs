import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/item-group-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UItem.vue',
    'src/ui/UItemGroup.vue',
    'src/ui/UChip.vue',
    'src/ui/UChipGroup.vue',
    'src/ui/UBtnToggle.vue',
    'src/ui/UiButton.vue',
    'src/ui/UiForm.vue',
    'src/ui/form.ts',
    'src/ui/item-group-state.ts',
    'src/ui/item-group-context.ts',
    'src/ui/selection-context.ts',
    'src/ui/selection.ts',
    'src/ui/button-group.ts',
    'src/ui/index.ts',
    'src/ui/plugin.ts',
    'src/ui/docs/component-examples/item.vue',
    'src/ui/docs/component-examples/item-group.vue',
    'src/ui/docs/component-examples/chip-group.vue'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(productSources.map(async (file) => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const sourceSha256 = await hashSources();

const html = `<!doctype html>
<html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>Item group protocol fixture</title>
        <style>
            html, body, #app { height: auto !important; min-height: 0; margin: 0; overflow: visible !important; }
            #app { padding: 20px; }
            #demo-examples { display: grid; gap: 24px; width: min(100%, 960px); margin: 0 auto; }
            #demo-examples > section { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; }
            #probe-groups { display: grid; gap: 12px; margin-block-end: 24px; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/item-group-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import ItemGroupFixture from './ItemGroupFixture.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';
import '/src/ui/docs/docs.css';

const ui = createUI({ defaults: { UItemGroup: { tag: 'aside' } } });
(window as any).__itemUi = ui;
createApp(ItemGroupFixture).use(ui).mount('#app');
`;

const fixtureVue = `<script setup>
import { reactive, ref, toRaw } from 'vue';
import { UButton, UBtnToggle, UChip, UChipGroup, UForm, UItem, UItemGroup } from '/src/ui/index.ts';
import ItemDemo from '/src/ui/docs/component-examples/item.vue';
import ItemGroupDemo from '/src/ui/docs/component-examples/item-group.vue';
import ChipGroupDemo from '/src/ui/docs/component-examples/chip-group.vue';

const state = reactive({
    contractModel: 'alpha',
    contractDisabled: false,
    contractReadonly: false,
    itemDisabled: false,
    contractEvents: [],
    indexModel: 0,
    objectModel: { id: 'object-value', source: 'outside' },
    arrayModel: ['left', 'right'],
    mandatoryModel: undefined,
    forceModel: undefined,
    disabledForceModel: undefined,
    readonlyForceModel: undefined,
    defaultModel: undefined,
    maxModel: ['one', 'two'],
    navModel: undefined,
    navMultipleModel: ['nav-a', 'nav-c'],
    reverseModel: 0,
    reverseItems: [{ key: 'first' }, { key: 'second' }, { key: 'third' }],
    buttonModel: [0],
    chipModel: [0],
    formModel: undefined,
    formValidity: null
});
const contractItems = [
    { key: 'alpha', label: 'Alpha', value: 'alpha' },
    { key: 'beta', label: 'Beta renderless', value: 'beta' },
    { key: 'object', label: 'Object item', value: { id: 'object-value', source: 'inside' } }
];
const objectItemValue = { id: 'object-value', source: 'inside' };
const arrayItemValue = ['left', 'right'];
const indexNullValue = null;
const formRule = (value) => value === 'accepted' || 'Choose an accepted value';
const contractComparator = (left, right) => {
    if (left && right && typeof left === 'object' && typeof right === 'object' && 'id' in left && 'id' in right) return left.id === right.id;
    return JSON.stringify(left) === JSON.stringify(right);
};
const groups = {
    contract: ref(),
    index: ref(),
    object: ref(),
    array: ref(),
    mandatory: ref(),
    force: ref(),
    disabledForce: ref(),
    readonlyForce: ref(),
    max: ref(),
    nav: ref(),
    navMultiple: ref(),
    reverse: ref(),
    button: ref(),
    chip: ref(),
    form: ref(),
    formRoot: ref(),
    defaults: ref()
};

function recordContractEvent(key, context) {
    state.contractEvents.push({ key, value: context.value });
}

function serialize(value) {
    return JSON.stringify(value) ?? String(value);
}

(window).__itemGroupProbe = { state, groups, contractItems, objectItemValue, arrayItemValue, toRaw };
</script>

<template>
    <main id="fixture-root">
        <div id="probe-groups">
            <UItemGroup :ref="groups.contract" v-model="state.contractModel" tag="section" theme="dark" id="contract-root"
                class="native-group-class" data-native-token="preserved" style="--native-probe: 7px"
                selected-class="group-selected" :disabled="state.contractDisabled" :readonly="state.contractReadonly"
                :value-comparator="contractComparator">
                <template #default="{ selected, selectedValues, isValueSelected, toggle }">
                    <output id="contract-selected-ids">{{ serialize(selected) }}</output>
                    <output id="contract-selected-values">{{ serialize(selectedValues) }}</output>
                    <output id="contract-alpha-value-selected">{{ String(isValueSelected('alpha')) }}</output>
                    <button id="legacy-toggle-alpha" type="button" @click="toggle('alpha')">Legacy value toggle</button>
                    <template v-for="item in contractItems" :key="item.key">
                        <UItem v-if="item.key === 'beta'" :value="item.value" :tag="false" selected-class="own-selected"
                            :data-item-key="item.key" @group:selected="recordContractEvent(item.key, $event)" v-slot="itemScope">
                            <button type="button" data-action="renderless-toggle" :data-item-key="item.key"
                                :data-slot-id="itemScope.id" :data-slot-selected="String(itemScope.selected)"
                                :data-slot-is-selected="String(itemScope.isSelected)" :data-slot-value="serialize(itemScope.value)"
                                :data-slot-disabled="String(itemScope.disabled)" :data-slot-class="itemScope.selectedClass.join(' ')"
                                @click="itemScope.toggle">{{ item.label }}</button>
                            <button type="button" data-action="renderless-select" :data-slot-id="itemScope.id"
                                @click="itemScope.select(true)">Select beta by slot API</button>
                        </UItem>
                        <UItem v-else :value="item.value" :disabled="item.key === 'object' && state.itemDisabled"
                            :data-item-key="item.key" selected-class="own-selected"
                            @group:selected="recordContractEvent(item.key, $event)" v-slot="itemScope">
                            <span :data-item-key="item.key" :data-slot-id="itemScope.id"
                                :data-slot-selected="String(itemScope.selected)" :data-slot-is-selected="String(itemScope.isSelected)"
                                :data-slot-value="serialize(itemScope.value)" :data-slot-disabled="String(itemScope.disabled)"
                                :data-slot-class="itemScope.selectedClass.join(' ')">{{ item.label }}</span>
                        </UItem>
                    </template>
                </template>
            </UItemGroup>

            <UItemGroup :ref="groups.index" v-model="state.indexModel" id="index-group" tag="div" selected-class="index-selected">
                <template #default="{ selected, selectedValues, isValueSelected }">
                    <output id="index-selected-ids">{{ serialize(selected) }}</output>
                    <output id="index-selected-values">{{ serialize(selectedValues) }}</output>
                    <output id="index-null-value-selected">{{ String(isValueSelected(null)) }}</output>
                    <UItem data-index-key="implicit" v-slot="itemScope">
                        <span data-index-item="implicit" :data-slot-id="itemScope.id" :data-slot-value="serialize(itemScope.value)"
                            :data-slot-selected="String(itemScope.selected)" :data-slot-class="itemScope.selectedClass.join(' ')">Implicit index</span>
                    </UItem>
                    <UItem :value="indexNullValue" data-index-key="null" v-slot="itemScope">
                        <span data-index-item="null" :data-slot-id="itemScope.id" :data-slot-value="serialize(itemScope.value)"
                            :data-slot-selected="String(itemScope.selected)">Explicit null</span>
                    </UItem>
                    <UItem data-index-key="second-implicit" v-slot="itemScope">
                        <span data-index-item="second-implicit" :data-slot-id="itemScope.id" :data-slot-value="serialize(itemScope.value)">Second implicit</span>
                    </UItem>
                </template>
            </UItemGroup>

            <UItemGroup :ref="groups.object" v-model="state.objectModel" tag="div" :value-comparator="contractComparator">
                <template #default="{ selected, selectedValues }">
                    <output id="object-selected-ids">{{ serialize(selected) }}</output>
                    <output id="object-selected-values">{{ serialize(selectedValues) }}</output>
                    <UItem :value="objectItemValue" data-object-key="object" v-slot="itemScope">
                        <span data-object-item="object" :data-slot-id="itemScope.id" :data-slot-selected="String(itemScope.selected)">Object value</span>
                    </UItem>
                </template>
            </UItemGroup>

            <UItemGroup :ref="groups.array" v-model="state.arrayModel" tag="div">
                <template #default="{ selected, selectedValues }">
                    <output id="array-selected-ids">{{ serialize(selected) }}</output>
                    <output id="array-selected-values">{{ serialize(selectedValues) }}</output>
                    <UItem :value="arrayItemValue" data-array-key="array" v-slot="itemScope">
                        <span data-array-item="array" :data-slot-id="itemScope.id" :data-slot-selected="String(itemScope.selected)">Array value</span>
                    </UItem>
                </template>
            </UItemGroup>

            <UItemGroup :ref="groups.mandatory" v-model="state.mandatoryModel" tag="div" mandatory>
                <UItem value="mandatory-a" data-mandatory="a">Mandatory A</UItem>
                <UItem value="mandatory-b" data-mandatory="b">Mandatory B</UItem>
            </UItemGroup>

            <UItemGroup :ref="groups.force" v-model="state.forceModel" tag="div" mandatory="force">
                <UItem value="force-disabled" disabled>Force disabled</UItem>
                <UItem value="force-active">Force active</UItem>
            </UItemGroup>
            <UItemGroup :ref="groups.disabledForce" v-model="state.disabledForceModel" tag="div" mandatory="force" disabled>
                <UItem value="disabled-force">Disabled force</UItem>
            </UItemGroup>
            <UItemGroup :ref="groups.readonlyForce" v-model="state.readonlyForceModel" tag="div" mandatory="force" readonly>
                <UItem value="readonly-force">Readonly force</UItem>
            </UItemGroup>

            <UItemGroup :ref="groups.max" v-model="state.maxModel" tag="div" multiple :max="2" selected-class="max-selected">
                <template #default="{ selectedValues }">
                    <output id="max-selected-values">{{ serialize(selectedValues) }}</output>
                    <UItem value="one" data-max-key="one">One</UItem>
                    <UItem value="two" data-max-key="two">Two</UItem>
                    <UItem value="three" data-max-key="three">Three</UItem>
                </template>
            </UItemGroup>

            <UItemGroup :ref="groups.nav" v-model="state.navModel" tag="div">
                <UItem value="nav-a" data-nav-key="a">Nav A</UItem>
                <UItem value="nav-disabled" disabled data-nav-key="disabled">Nav disabled</UItem>
                <UItem value="nav-c" data-nav-key="c">Nav C</UItem>
            </UItemGroup>
            <UItemGroup :ref="groups.navMultiple" v-model="state.navMultipleModel" tag="div" multiple>
                <UItem value="nav-a" data-nav-multiple="a">Nav A</UItem>
                <UItem value="nav-disabled" disabled data-nav-multiple="disabled">Nav disabled</UItem>
                <UItem value="nav-c" data-nav-multiple="c">Nav C</UItem>
            </UItemGroup>

            <UItemGroup :ref="groups.reverse" v-model="state.reverseModel" tag="div">
                <template #default="{ selected, selectedValues }">
                    <output id="reverse-selected-ids">{{ serialize(selected) }}</output>
                    <output id="reverse-selected-values">{{ serialize(selectedValues) }}</output>
                    <UItem v-for="item in state.reverseItems" :key="item.key" v-slot="itemScope">
                        <span :data-reverse-key="item.key" :data-reverse-id="itemScope.id"
                            :data-reverse-value="serialize(itemScope.value)" :data-reverse-selected="String(itemScope.selected)">{{ item.key }}</span>
                    </UItem>
                </template>
            </UItemGroup>
            <button id="reverse-items" type="button" @click="state.reverseItems.reverse()">Reverse keyed items</button>
            <button id="remove-middle-item" type="button" @click="state.reverseItems.splice(1, 1)">Remove middle item</button>

            <UBtnToggle :ref="groups.button" v-model="state.buttonModel" tag="div" multiple :max="2" selected-class="button-selected">
                <UButton data-button-key="first">Button first by index</UButton>
                <UButton data-button-key="second">Button second by index</UButton>
                <UButton value="button-third" data-button-key="third">Button explicit</UButton>
                <UButton value="button-disabled" data-button-key="disabled" disabled>Button disabled</UButton>
            </UBtnToggle>

            <UChipGroup :ref="groups.chip" v-model="state.chipModel" tag="div" multiple :max="2" selected-class="chip-selected">
                <UChip data-chip-key="first">Chip first by index</UChip>
                <UChip value="chip-explicit" data-chip-key="second">Chip explicit</UChip>
                <UChip value="chip-disabled" data-chip-key="disabled" disabled>Chip disabled</UChip>
            </UChipGroup>

            <UForm :ref="groups.formRoot" v-model="state.formValidity">
                <UItemGroup :ref="groups.form" v-model="state.formModel" tag="div" :rules="[formRule]" validate-on="manual">
                    <UItem value="accepted" data-form-key="accepted">Accepted</UItem>
                </UItemGroup>
            </UForm>

            <UItemGroup :ref="groups.defaults" v-model="state.defaultModel" id="defaults-provider-root">
                <UItem value="default">Default provider tag</UItem>
            </UItemGroup>
        </div>

        <div id="demo-examples">
            <section>
                <h2>Real UItem example</h2>
                <ItemDemo />
            </section>
            <section>
                <h2>Real UItemGroup example</h2>
                <ItemGroupDemo />
            </section>
            <section>
                <h2>Real UChipGroup example</h2>
                <ChipGroupDemo />
            </section>
        </div>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'ItemGroupFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__item-group-protocols';
const fixturePlugin = {
    name: 'item-group-protocol-fixture',
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
        entries: ['artifacts/component-audit-root/item-group-protocols/fixture/main.ts'],
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
    fixture: 'item-group-protocols',
    method: 'Vite source fixture imports the public src/ui/index.ts entry and renders real SFCs and examples; headless Chromium runtime.',
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
        'No Electron renderer, full project build, full test suite, or visual design acceptance was run.',
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
    return page.evaluate((name) => (window).__itemGroupProbe.state[name], key);
}

async function captureDemo(name, theme, width, height) {
    await page.setViewportSize({ width, height });
    await page.evaluate(async (themeName) => window.__itemUi.theme.change(themeName, false), theme);
    await settle();
    const target = page.locator('#demo-examples');
    const bounds = await target.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth }));
    assert.equal(viewport.documentWidth, viewport.width, `${name} screenshot has no horizontal page overflow`);
    await target.screenshot({ path: path.join(evidence, `${name}.png`), animations: 'disabled', caret: 'hide' });
    report.screenshots.push({ file: `${name}.png`, theme, viewport, targetBounds: bounds, backend: report.backend });
}

async function selectById(groupName, id, active = true) {
    return page.evaluate(([name, itemId, selected]) => (window).__itemGroupProbe.groups[name].value.select(itemId, selected), [groupName, id, active]);
}

try {
    await server.listen();
    const baseUrl = server.resolvedUrls.local[0];
    const url = new URL(virtualRoute.slice(1), baseUrl).href;
    const mainUrl = new URL('/artifacts/component-audit-root/item-group-protocols/fixture/main.ts', baseUrl).href;
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
    page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
    page.on('console', (message) => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    page.on('response', (response) => {
        if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
    });
    page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('#demo-examples [data-demo-component="UItemGroup"]').waitFor();
    await page.waitForFunction(() => (window).__itemGroupProbe.state.forceModel === 'force-active');
    await settle();

    assert.equal(await page.locator('#contract-root').evaluate((element) => element.tagName), 'SECTION');
    assert.equal(await page.locator('#contract-root').getAttribute('id'), 'contract-root');
    assert.equal(await page.locator('#contract-root').getAttribute('data-native-token'), 'preserved');
    assert.ok((await page.locator('#contract-root').getAttribute('class')).includes('native-group-class'));
    assert.equal(await page.locator('#contract-root').evaluate((element) => getComputedStyle(element).getPropertyValue('--native-probe').trim()), '7px');
    assert.equal(await page.locator('#contract-root').getAttribute('data-ui-theme'), 'dark');
    const alpha = page.locator('[data-item-key="alpha"][data-slot-id]');
    const alphaId = await alpha.getAttribute('data-slot-id');
    assert.ok(alphaId);
    assert.equal(await alpha.getAttribute('data-slot-selected'), 'true');
    assert.equal(await alpha.getAttribute('data-slot-is-selected'), 'true');
    assert.equal(await alpha.getAttribute('data-slot-value'), '"alpha"');
    assert.equal(await alpha.getAttribute('data-slot-disabled'), 'false');
    assert.ok((await alpha.getAttribute('data-slot-class')).includes('group-selected'));
    assert.equal(await page.locator('#contract-selected-ids').textContent(), JSON.stringify([alphaId]));
    assert.equal(await page.locator('#contract-selected-values').textContent(), '["alpha"]');
    assert.equal(await page.locator('#contract-alpha-value-selected').textContent(), 'true');
    assert.equal(await page.locator('#defaults-provider-root').evaluate((element) => element.tagName), 'ASIDE', 'omitted tag uses the createUI UItemGroup default provider');
    passed('public entry, native attrs/theme/tag, default provider, and UItem slot scope', 'The real SFC root kept attrs/style/theme/tag and the default provider; selected IDs and public selected values are distinct, and all UItem slot fields were rendered.');

    const betaToggle = page.locator('[data-action="renderless-toggle"]');
    const betaSelect = page.locator('[data-action="renderless-select"]');
    const betaId = await betaToggle.getAttribute('data-slot-id');
    assert.ok(betaId);
    assert.equal(await page.locator('#contract-root > .u-item').count(), 2, 'default UItem renders a button wrapper while tag=false UItem is renderless');
    assert.equal(await betaToggle.getAttribute('data-slot-selected'), 'false');
    await betaSelect.click();
    assert.equal(await readState('contractModel'), 'beta', 'slot select(true) writes the item public value');
    assert.deepEqual(JSON.parse((await page.locator('#contract-selected-ids').textContent()) ?? '[]'), [betaId]);
    assert.equal(await page.evaluate((id) => (window).__itemGroupProbe.groups.contract.value.isSelected(id), betaId), true, 'isSelected is keyed by the registered item ID');
    assert.equal(await page.evaluate(() => (window).__itemGroupProbe.groups.contract.value.isSelected('beta')), false, 'a public value is not treated as an item ID');
    await betaToggle.click();
    assert.equal(await readState('contractModel'), undefined, 'renderless slot toggle toggles the selected item off');
    await page.locator('#legacy-toggle-alpha').click();
    assert.equal(await readState('contractModel'), 'alpha', 'legacy slot toggle remains value-based');
    assert.equal(await page.locator('#contract-alpha-value-selected').textContent(), 'true', 'legacy isValueSelected remains available through the slot');
    assert.ok((await readState('contractEvents')).some((event) => event.value === false));
    assert.ok((await readState('contractEvents')).some((event) => event.value === true));
    passed('legacy/default and renderless UItem, id-based API, legacy value API, and group:selected payload', 'Default button and tag=false slots worked; isSelected/select use IDs while toggle/isValueSelected retain their value contract, and group:selected carried { value }.');

    assert.equal(await readState('indexModel'), 0, 'an omitted value defaults to its current registration index');
    assert.equal(await page.locator('[data-index-item="implicit"]').getAttribute('data-slot-value'), '0');
    const implicitId = await page.locator('[data-index-item="implicit"]').getAttribute('data-slot-id');
    const nullItem = page.locator('[data-index-key="null"]');
    const nullId = await nullItem.locator('[data-index-item="null"]').getAttribute('data-slot-id');
    assert.ok(implicitId && nullId);
    await nullItem.click();
    assert.equal(await readState('indexModel'), null, 'explicit null remains a selectable value rather than an index fallback');
    assert.equal(await page.locator('#index-null-value-selected').textContent(), 'true');
    assert.deepEqual(JSON.parse((await page.locator('#index-selected-ids').textContent()) ?? '[]'), [nullId]);
    assert.equal(await page.locator('#index-selected-values').textContent(), '[null]');

    const objectItem = page.locator('[data-object-item="object"]');
    const objectId = await objectItem.getAttribute('data-slot-id');
    assert.ok(objectId);
    assert.equal(await objectItem.getAttribute('data-slot-selected'), 'true', 'custom comparator selects an object with a distinct representation');
    assert.deepEqual(JSON.parse((await page.locator('#object-selected-ids').textContent()) ?? '[]'), [objectId]);
    assert.equal(await page.evaluate((id) => (window).__itemGroupProbe.groups.object.value.isSelected(id), objectId), true);

    const arrayItem = page.locator('[data-array-item="array"]');
    assert.equal(await arrayItem.getAttribute('data-slot-selected'), 'true', 'an array value remains one selected value in single mode');
    assert.deepEqual(JSON.parse((await page.locator('#array-selected-values').textContent()) ?? '[]'), [['left', 'right']]);
    await arrayItem.click();
    assert.equal(await readState('arrayModel'), undefined, 'clicking a selected array-valued single item clears the scalar model');
    passed('implicit index, explicit null, object comparator, and single array-valued item', 'Distinct value shapes selected their matching item without treating a single array model as a multiple-selection array.');

    assert.equal(await readState('mandatoryModel'), undefined, 'mandatory boolean does not force an initial selection');
    await page.locator('[data-mandatory="a"]').click();
    assert.equal(await readState('mandatoryModel'), 'mandatory-a');
    await page.locator('[data-mandatory="a"]').click();
    assert.equal(await readState('mandatoryModel'), 'mandatory-a', 'mandatory boolean prevents removing the last selection');
    await page.locator('[data-mandatory="b"]').click();
    assert.equal(await readState('mandatoryModel'), 'mandatory-b', 'mandatory permits replacing the selected value');
    assert.equal(await readState('forceModel'), 'force-active', 'mandatory force chooses the first enabled item at mount');
    assert.equal(await readState('disabledForceModel'), undefined, 'a disabled force group does not write an initial model');
    assert.equal(await readState('readonlyForceModel'), undefined, 'a readonly force group does not write an initial model');
    passed('mandatory boolean and force behavior with disabled/readonly guards', 'Boolean mandatory blocks deselection without initializing; force chooses the first enabled entry only when the group is interactive.');

    assert.deepEqual(await readState('maxModel'), ['one', 'two']);
    await page.locator('[data-max-key="three"]').click();
    assert.deepEqual(await readState('maxModel'), ['one', 'two'], 'max blocks selection beyond the configured count');
    await page.locator('[data-max-key="one"]').click();
    await page.locator('[data-max-key="three"]').click();
    assert.deepEqual(await readState('maxModel'), ['two', 'three']);

    const contractObject = page.locator('[data-item-key="object"][data-slot-id]');
    const contractObjectId = await contractObject.getAttribute('data-slot-id');
    assert.ok(contractObjectId);
    await page.evaluate(() => { (window).__itemGroupProbe.state.contractModel = 'alpha'; });
    await page.evaluate(() => { (window).__itemGroupProbe.state.itemDisabled = true; });
    await settle();
    assert.equal(await contractObject.getAttribute('data-slot-disabled'), 'true');
    await selectById('contract', contractObjectId, true);
    assert.equal(await readState('contractModel'), 'alpha', 'disabled item blocks explicit id selection');
    await page.evaluate(() => { (window).__itemGroupProbe.state.itemDisabled = false; });
    await page.evaluate(() => { (window).__itemGroupProbe.state.contractDisabled = true; });
    await settle();
    assert.equal(await page.locator('#contract-root > .u-item[data-item-key="alpha"]').isDisabled(), true, 'group disabled reaches the default native button');
    await selectById('contract', betaId, true);
    assert.equal(await readState('contractModel'), 'alpha', 'group disabled blocks selection');
    await page.evaluate(() => { (window).__itemGroupProbe.state.contractDisabled = false; (window).__itemGroupProbe.state.contractReadonly = true; });
    await settle();
    assert.equal(await page.locator('#contract-root > .u-item[data-item-key="alpha"]').isDisabled(), false, 'readonly remains distinct from native disabled');
    await selectById('contract', betaId, true);
    assert.equal(await readState('contractModel'), 'alpha', 'group readonly blocks selection');
    await page.evaluate(() => { (window).__itemGroupProbe.state.contractReadonly = false; });
    await selectById('contract', contractObjectId, true);
    assert.deepEqual(await readState('contractModel'), { id: 'object-value', source: 'inside' });
    passed('max, dynamic item/group disabled, and readonly guards', 'Selection respected max and live item/group disabled/readonly state without conflating readonly with the native disabled attribute.');

    await page.evaluate(() => (window).__itemGroupProbe.groups.nav.value.next());
    assert.equal(await readState('navModel'), 'nav-a', 'empty next selects the first enabled item');
    await page.evaluate(() => (window).__itemGroupProbe.groups.nav.value.next());
    assert.equal(await readState('navModel'), 'nav-c', 'next skips disabled entries');
    await page.evaluate(() => (window).__itemGroupProbe.groups.nav.value.next());
    assert.equal(await readState('navModel'), 'nav-a', 'next cycles at the end');
    await page.evaluate(() => (window).__itemGroupProbe.groups.nav.value.prev());
    assert.equal(await readState('navModel'), 'nav-c', 'previous cycles at the beginning');
    await page.evaluate(() => (window).__itemGroupProbe.groups.navMultiple.value.next());
    assert.deepEqual(await readState('navMultipleModel'), ['nav-c'], 'multiple navigation replaces the model with one target');
    await page.evaluate(() => { (window).__itemGroupProbe.state.navMultipleModel = []; });
    await page.evaluate(() => (window).__itemGroupProbe.groups.navMultiple.value.prev());
    assert.deepEqual(await readState('navMultipleModel'), ['nav-a'], 'empty multiple navigation starts at the first enabled item');
    passed('next/previous empty, cyclic, disabled skipping, and multiple model behavior', 'Public exposed navigation skipped disabled entries, wrapped, initialized empty selection, and reduced multiple selection to the target item.');

    const reverseBefore = await page.locator('[data-reverse-key]').evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.dataset.reverseKey, node.dataset.reverseId])));
    await page.locator('#reverse-items').click();
    await settle();
    const reverseAfter = await page.locator('[data-reverse-key]').evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.dataset.reverseKey, node.dataset.reverseId])));
    assert.deepEqual(reverseAfter, reverseBefore, 'keyed child identity remains stable through reversal');
    assert.equal(await page.locator('[data-reverse-key="third"]').getAttribute('data-reverse-value'), '0');
    assert.equal(await page.locator('[data-reverse-key="third"]').getAttribute('data-reverse-selected'), 'true', 'omitted-value selection follows the new rendered order');
    await page.evaluate(() => (window).__itemGroupProbe.groups.reverse.value.next());
    assert.equal(await readState('reverseModel'), 1);
    assert.equal(await page.locator('[data-reverse-key="second"]').getAttribute('data-reverse-selected'), 'true', 'navigation follows the reversed keyed order without remounting');
    await page.locator('#remove-middle-item').click();
    await settle();
    assert.equal(await page.locator('[data-reverse-key="first"]').getAttribute('data-reverse-value'), '1', 'removal recalculates the omitted-value index');
    assert.equal(await page.locator('[data-reverse-key="first"]').getAttribute('data-reverse-selected'), 'true', 'selection remaps to the current index after removal');
    await page.evaluate(() => (window).__itemGroupProbe.groups.reverse.value.next());
    assert.equal(await readState('reverseModel'), 0, 'navigation wraps across the current post-removal order');
    passed('keyed reorder, stable identity, omitted-index recalculation, and navigation order', 'Reversing keyed children did not remount them; state order, fallback indices, selection and navigation followed rendered order and removal.');

    assert.equal(await page.locator('[data-button-key="first"]').getAttribute('aria-pressed'), 'true', 'UBtnToggle registers a no-value button at index zero');
    assert.ok((await page.locator('[data-button-key="first"]').getAttribute('class')).includes('button-selected'));
    await page.locator('[data-button-key="second"]').click();
    assert.deepEqual(await readState('buttonModel'), [0, 1], 'UBtnToggle preserves the group model for index-valued buttons');
    await page.locator('[data-button-key="third"]').click();
    assert.deepEqual(await readState('buttonModel'), [0, 1], 'UBtnToggle max is respected for explicit values');
    assert.equal(await page.locator('[data-button-key="disabled"]').isDisabled(), true);
    await page.locator('[data-button-key="first"]').click();
    assert.deepEqual(await readState('buttonModel'), [1]);

    const firstChip = page.locator('[data-chip-key="first"]');
    assert.equal(await firstChip.locator('button').getAttribute('aria-pressed'), 'true', 'UChipGroup registers a no-value chip at index zero');
    assert.ok((await firstChip.getAttribute('class')).includes('chip-selected'));
    await page.locator('[data-chip-key="second"] button').click();
    assert.deepEqual(await readState('chipModel'), [0, 'chip-explicit']);
    assert.equal(await page.locator('[data-chip-key="disabled"] button').isDisabled(), true);
    await page.locator('[data-chip-key="first"] button').click();
    assert.deepEqual(await readState('chipModel'), ['chip-explicit']);
    passed('UBtnToggle and UChipGroup integration', 'Button and chip registrations preserved index/explicit values, max, disabled state, selected classes, and their public v-model arrays.');

    const formValidation = await page.evaluate(() => (window).__itemGroupProbe.groups.form.value.validate());
    assert.equal(formValidation.valid, false, 'UItemGroup exposed validation rejects the initial empty value');
    const formRootValidation = await page.evaluate(() => (window).__itemGroupProbe.groups.formRoot.value.validate());
    assert.equal(formRootValidation.valid, false, 'UiForm receives the UItemGroup validation result');
    await page.locator('[data-form-key="accepted"]').click();
    assert.equal(await readState('formModel'), 'accepted');
    assert.equal((await page.evaluate(() => (window).__itemGroupProbe.groups.form.value.validate())).valid, true);
    await page.evaluate(() => (window).__itemGroupProbe.groups.form.value.reset());
    assert.equal(await readState('formModel'), undefined, 'UItemGroup exposed reset restores its initial model');
    await page.locator('[data-form-key="accepted"]').click();
    await page.evaluate(() => (window).__itemGroupProbe.groups.formRoot.value.reset());
    assert.equal(await readState('formModel'), undefined, 'UiForm reset reaches the registered UItemGroup');
    passed('UItemGroup form validation and reset integration', 'The group rejected invalid input, validated after selection, and restored its setup-time model through both group and form reset APIs.');

    const itemDemo = page.locator('#demo-examples [data-demo-component="UItem"]');
    const customDemoButton = itemDemo.getByRole('button', { name: '自定义按钮', exact: true });
    assert.equal(await itemDemo.getByRole('button', { name: '保留默认按钮', exact: true }).getAttribute('aria-pressed'), 'true');
    await customDemoButton.click();
    assert.match((await itemDemo.locator('output').textContent()) ?? '', /当前值："b"/);
    assert.match((await itemDemo.locator('output').textContent()) ?? '', /选择状态变化 [1-9]/);
    await itemDemo.getByRole('button', { name: '保留默认按钮', exact: true }).click();
    assert.match((await itemDemo.locator('output').textContent()) ?? '', /当前值："a"/);

    const itemGroupDemo = page.locator('#demo-examples [data-demo-component="UItemGroup"]');
    await itemGroupDemo.getByLabel('多选，最多两项', { exact: true }).check();
    await itemGroupDemo.getByRole('button', { name: '详情', exact: true }).click();
    assert.match((await itemGroupDemo.locator('output').last().textContent()) ?? '', /当前值：\["a","b"\]/);
    await itemGroupDemo.getByRole('button', { name: '设置', exact: true }).click();
    assert.match((await itemGroupDemo.locator('output').last().textContent()) ?? '', /当前值：\["a","b"\]/, 'the real example enforces max=2');
    await itemGroupDemo.getByRole('button', { name: '详情', exact: true }).click();
    await itemGroupDemo.getByLabel('只读', { exact: true }).check();
    await itemGroupDemo.getByRole('button', { name: '详情', exact: true }).click();
    assert.match((await itemGroupDemo.locator('output').last().textContent()) ?? '', /当前值：\["a"\]/, 'readonly blocks selection without setting native disabled');
    await itemGroupDemo.getByLabel('只读', { exact: true }).uncheck();
    await itemGroupDemo.getByLabel('禁用', { exact: true }).check();
    assert.equal(await itemGroupDemo.getByRole('button', { name: '概览', exact: true }).isDisabled(), true);
    await itemGroupDemo.getByLabel('禁用', { exact: true }).uncheck();
    await itemGroupDemo.getByRole('button', { name: '下一项', exact: true }).click();
    assert.match((await itemGroupDemo.locator('.item-navigation output').textContent()) ?? '', /\["b"\]/);
    await itemGroupDemo.getByRole('button', { name: '下一项', exact: true }).click();
    assert.match((await itemGroupDemo.locator('.item-navigation output').textContent()) ?? '', /\["c"\]/, 'demo navigation skips the disabled item');

    const chipDemo = page.locator('#demo-examples [data-demo-component="UChipGroup"]');
    await chipDemo.getByRole('button', { name: '详情', exact: true }).click();
    assert.equal(await chipDemo.getByRole('button', { name: '详情', exact: true }).getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errors, [], 'no Vue errors, recursive updates, or page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser console errors occurred');
    assert.deepEqual(httpErrors, [], 'all fixture requests succeeded');
    assert.deepEqual(requestFailures, [], 'no fixture requests failed');
    report.demoInteractions.push('real UItem default/renderless controls and group:selected counter; UItemGroup multi/max/navigation/disabled/readonly controls; UChipGroup selection');
    passed('real item/item-group/chip demos', 'The shipped examples were clicked through model changes, max, navigation, disabled/readonly guards, and chip selection.');

    await captureDemo('item-group-wide-light', 'light', 1280, 1100);
    await captureDemo('item-group-wide-dark', 'dark', 1280, 1100);
    await captureDemo('item-group-narrow-390', 'light', 390, 844);

    assert.deepEqual(errors, [], 'item group fixture has no page errors or recursive updates');
    assert.deepEqual(consoleErrors, [], 'item group fixture has no console errors');
    assert.deepEqual(httpErrors, [], 'item group fixture has no HTTP failures');
} catch (error) {
    report.failure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    report.stack = error instanceof Error ? error.stack : undefined;
    if (page) {
        try {
            report.pageStateAtFailure = await page.evaluate(() => ({
                url: location.href,
                title: document.title,
                bodyText: document.body.innerText.slice(0, 5000),
                pageErrors: (window).__itemGroupProbe?.errors ?? null,
                state: (window).__itemGroupProbe ? JSON.parse(JSON.stringify((window).__itemGroupProbe.state)) : null
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
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
    if (browser) await browser.close();
    await server.close();
}

console.log(`Evidence: ${path.join(evidence, 'report.json')}`);
console.log(`Screenshots: ${report.screenshots.map((screenshot) => screenshot.file).join(', ')}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else {
    console.log(`PASS ${report.checks.length} item group checks on ${report.backend}`);
}
