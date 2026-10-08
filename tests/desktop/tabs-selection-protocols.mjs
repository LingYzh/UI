import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/tabs-selection-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const targetSources = [
    'src/ui/UiTabs.vue',
    'src/ui/UiTab.vue',
    'src/ui/tabs.ts',
    'src/ui/UiTabsWindow.vue',
    'src/ui/UiTabsWindowItem.vue',
    'src/ui/tabs-window-context.ts',
    'tests/desktop/tabs-selection-protocols.mjs',
    'tests/tsconfig.tabs-selection.json'
];
const protectedSources = [
    'src/ui/index.ts',
    'src/ui/UWindow.vue',
    'src/ui/UWindowItem.vue',
    'src/ui/window-state.ts',
    'src/ui/group-state.ts',
    'src/ui/item-group-state.ts',
    'src/ui/router.ts',
    'src/ui/styles.css'
];

async function hashFiles(files) {
    return Object.fromEntries(await Promise.all(files.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const targetSourceSha256Before = await hashFiles(targetSources);
const protectedSourceSha256Before = await hashFiles(protectedSources);
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" href="data:,"><title>Tabs selection protocols</title></head>
<body><div id="app"></div><script type="module" src="/artifacts/full-alignment/tabs-selection-protocols/fixture/main.ts"></script></body></html>`;

const main = `import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from '/artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js';
import TabsSelectionFixture from './TabsSelectionFixture.vue';
import '/src/ui/styles.css';

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/route/home', component: { render: () => null } },
        { path: '/route/other', component: { render: () => null } },
        { path: '/route/blocked', component: { render: () => null } }
    ]
});
await router.push('/route/home');
createApp(TabsSelectionFixture).use(router).mount('#app');
window.__tabsRouter = router;
`;

const fixture = `<script setup>
import { reactive, ref } from 'vue';
import { UTab, UTabs, UTabsWindow, UTabsWindowItem } from '/src/ui/index.ts';

const objectOne = { id: 'one', nested: ['x', 1] };
const objectOneCopy = { id: 'one', nested: ['x', 1] };
const objectTwo = { id: 'two', nested: ['y', 2] };
const objectTwoCopy = { id: 'two', nested: ['y', 2] };
const arrayValue = ['array', { rank: 2 }];
const arrayValueCopy = ['array', { rank: 2 }];
const customValue = { code: 'Alpha' };
const customComparator = (left, right) => left?.code?.toLowerCase() === right?.code?.toLowerCase();
const state = reactive({
    single: 'a',
    optional: undefined,
    roving: 'selected',
    rovingRows: [{ id: 'selected', disabled: false }, { id: 'focus', disabled: false }, { id: 'other', disabled: false }],
    nullItemModel: null,
    nullTabItems: [{ key: 'null', value: null, text: 'Null item' }, { key: 'other', value: 'other', text: 'Other item' }],
    styleSelection: ['marker-a', 'marker-b'],
    markerHideSlider: false,
    multiple: [1],
    emptyTrue: undefined,
    emptyForce: undefined,
    readonly: true,
    readOnlyModel: 'left',
    dynamicDisabled: true,
    dynamicModel: 'open',
    nullable: null,
    object: { id: 'one', nested: ['x', 1] },
    arraySingle: ['array', { rank: 2 }],
    custom: { code: 'alpha' },
    external: 'left',
    implicit: 1,
    implicitRows: [{ id: 'alpha' }, { id: 'beta' }, { id: 'gamma' }],
    multiObject: [{ id: 'one', nested: ['x', 1] }, { id: 'two', nested: ['y', 2] }],
    windowBound: false,
    windowModel: null,
    automatic: 'first',
    manualRtl: 'rtl-a',
    routeModel: undefined,
    events: [],
    onceEvents: []
});
const refs = {
    single: ref(), singleA: ref(), optional: ref(), roving: ref(), nullItems: ref(), nullItemTab: ref(), nullItemOther: ref(), multiple: ref(), nullable: ref(), object: ref(),
    arraySingle: ref(), custom: ref(), automatic: ref(), manualRtl: ref(),
    window: ref(), windowItems: {},
};

window.__tabsSelection = { state, refs, objectOne, objectOneCopy, objectTwo, objectTwoCopy, arrayValue, arrayValueCopy };
</script>

<template>
    <section id="single-fixture">
        <output id="single-model">{{ state.single }}</output>
        <UTabs :ref="refs.single" v-model="state.single" id-prefix="single" :mandatory="true" selected-class="picked" aria-label="Single mandatory tabs">
            <UTab :ref="refs.singleA" value="a" @group:selected="state.events.push('a:' + $event.value)">Alpha</UTab>
            <UTab id="single-b" value="b" @group:selected="state.events.push('b:' + $event.value)">Beta</UTab>
        </UTabs>
    </section>

    <section id="optional-fixture">
        <UTabs :ref="refs.optional" v-model="state.optional" id-prefix="optional" :mandatory="false" aria-label="Optional tabs">
            <UTab value="optional-a">Optional A</UTab><UTab value="optional-b">Optional B</UTab>
        </UTabs>
    </section>

    <section id="roving-fixture">
        <UTabs :ref="refs.roving" v-model="state.roving" id-prefix="roving" :mandatory="false" aria-label="Roving tab stop">
            <UTab v-for="row in state.rovingRows" :key="row.id" :value="row.id" :disabled="row.disabled" :data-row="row.id">{{ row.id }}</UTab>
        </UTabs>
    </section>

    <section id="null-item-fixture">
        <UTabs :ref="refs.nullItems" v-model="state.nullItemModel" :items="state.nullTabItems" id-prefix="null-items" :mandatory="false" aria-label="Null item reorder">
            <template #tab="{ item }">
                <UTab :ref="item.key === 'null' ? refs.nullItemTab : refs.nullItemOther" :value="item.value" :data-null-value="item.key">{{ item.text }}</UTab>
            </template>
            <template #window>
                <UTabsWindowItem v-for="item in state.nullTabItems" :key="item.key" :value="item.value"><span :id="'null-item-panel-' + item.key">{{ item.text }} panel</span></UTabsWindowItem>
            </template>
        </UTabs>
    </section>

    <section id="marker-fixture">
        <UTabs v-model="state.styleSelection" id-prefix="marker" multiple :hide-slider="state.markerHideSlider" aria-label="Multiple underline markers">
            <UTab value="marker-a">Marker A</UTab><UTab value="marker-b">Marker B</UTab><UTab value="marker-c">Marker C</UTab>
        </UTabs>
    </section>

    <section id="multiple-fixture">
        <output id="multiple-model">{{ JSON.stringify(state.multiple) }}</output>
        <UTabs :ref="refs.multiple" v-model="state.multiple" id-prefix="multiple" multiple :max="2" :mandatory="true" aria-label="Multiple tabs">
            <UTab :value="1" @group:selected="state.onceEvents.push('one:' + $event.value)">One</UTab>
            <UTab :value="2" @group:selected="state.onceEvents.push('two:' + $event.value)">Two</UTab>
            <UTab :value="3" @group:selected="state.onceEvents.push('three:' + $event.value)">Three</UTab>
        </UTabs>
    </section>

    <section id="mandatory-fixture">
        <UTabs v-model="state.emptyTrue" id-prefix="mandatory-true" :mandatory="true" aria-label="Mandatory but not forced">
            <UTab value="true-a">True A</UTab><UTab value="true-b">True B</UTab>
        </UTabs>
        <UTabs v-model="state.emptyForce" id-prefix="mandatory-force" :mandatory="'force'" aria-label="Forced mandatory">
            <UTab value="force-a">Force A</UTab><UTab value="force-b">Force B</UTab>
        </UTabs>
    </section>

    <section id="readonly-fixture">
        <UTabs v-model="state.readOnlyModel" id-prefix="readonly" :readonly="state.readonly" :mandatory="false" aria-label="Readonly tabs">
            <UTab value="left">Left</UTab><UTab value="right">Right</UTab>
        </UTabs>
    </section>

    <section id="disabled-fixture">
        <UTabs v-model="state.dynamicModel" id-prefix="dynamic" :mandatory="false" aria-label="Dynamic disabled tabs">
            <UTab value="open">Open</UTab><UTab value="blocked" :disabled="state.dynamicDisabled">Blocked</UTab>
        </UTabs>
    </section>

    <section id="nullable-fixture">
        <output id="nullable-model">{{ state.nullable === undefined ? 'undefined' : JSON.stringify(state.nullable) }}</output>
        <UTabs :ref="refs.nullable" v-model="state.nullable" id-prefix="nullable" :mandatory="false" aria-label="Null is a value">
            <UTab :value="null" @group:selected="state.events.push('null:' + $event.value)">Null value</UTab>
            <UTab value="other">Other value</UTab>
            <template #window>
                <UTabsWindowItem :value="null"><span id="nullable-panel">Null panel</span></UTabsWindowItem>
                <UTabsWindowItem value="other"><span id="other-panel">Other panel</span></UTabsWindowItem>
            </template>
        </UTabs>
    </section>

    <section id="object-fixture">
        <UTabs :ref="refs.object" v-model="state.object" id-prefix="object" :mandatory="false" aria-label="Deep object values">
            <UTab :value="objectOne" data-object-tab="one">Object one</UTab>
            <UTab :value="objectTwo" data-object-tab="two">Object two</UTab>
            <template #window>
                <UTabsWindowItem :value="objectOneCopy"><span id="object-one-panel">Object one panel</span></UTabsWindowItem>
                <UTabsWindowItem :value="objectTwoCopy"><span id="object-two-panel">Object two panel</span></UTabsWindowItem>
            </template>
        </UTabs>
    </section>

    <section id="array-single-fixture">
        <UTabs :ref="refs.arraySingle" v-model="state.arraySingle" id-prefix="array-single" :mandatory="false" aria-label="Array as a single value">
            <UTab :value="arrayValue" data-array-tab>Array value</UTab>
        </UTabs>
    </section>

    <section id="custom-comparator-fixture">
        <UTabs :ref="refs.custom" v-model="state.custom" id-prefix="custom" :mandatory="false" :value-comparator="customComparator" aria-label="Custom comparator">
            <UTab :value="customValue" data-custom-tab>Custom value</UTab>
        </UTabs>
    </section>

    <section id="external-fixture">
        <UTabs v-model="state.external" id-prefix="external" :mandatory="false" aria-label="External model">
            <UTab value="left">External left</UTab><UTab value="right">External right</UTab>
        </UTabs>
    </section>

    <section id="implicit-fixture">
        <output id="implicit-model">{{ state.implicit }}</output>
        <UTabs v-model="state.implicit" id-prefix="implicit" :mandatory="false" aria-label="Implicit positions">
            <UTab v-for="row in state.implicitRows" :key="row.id" :data-row="row.id">{{ row.id }}</UTab>
        </UTabs>
    </section>

    <section id="multiple-window-fixture">
        <UTabs v-model="state.multiObject" id-prefix="multi-object" multiple aria-label="Multiple object windows">
            <UTab :value="objectOne" data-multi-tab="one">One</UTab><UTab :value="objectTwo" data-multi-tab="two">Two</UTab>
            <template #window>
                <UTabsWindowItem :value="objectOneCopy"><span id="multi-one-panel">One panel</span></UTabsWindowItem>
                <UTabsWindowItem :value="objectTwoCopy"><span id="multi-two-panel">Two panel</span></UTabsWindowItem>
            </template>
        </UTabs>
    </section>

    <section id="explicit-window-fixture">
        <UTabs v-model="state.external" id-prefix="explicit-window" :mandatory="false" aria-label="Window paired tabs">
            <UTab value="left">Left</UTab><UTab :value="null">Null</UTab>
        </UTabs>
        <UTabsWindow v-bind="state.windowBound ? { modelValue: state.windowModel } : {}" id-prefix="explicit-window">
            <UTabsWindowItem value="left"><span id="explicit-left-panel">Left explicit panel</span></UTabsWindowItem>
            <UTabsWindowItem :value="null"><span id="explicit-null-panel">Null explicit panel</span></UTabsWindowItem>
        </UTabsWindow>
    </section>

    <section id="automatic-fixture">
        <UTabs :ref="refs.automatic" v-model="state.automatic" id-prefix="automatic" activation="automatic" :mandatory="false" aria-label="Automatic activation">
            <UTab value="first">First</UTab><UTab value="disabled" disabled>Disabled</UTab><UTab value="last">Last</UTab>
        </UTabs>
    </section>

    <section id="rtl-fixture" dir="rtl">
        <UTabs :ref="refs.manualRtl" v-model="state.manualRtl" id-prefix="rtl" activation="manual" :mandatory="false" aria-label="Manual RTL tabs">
            <UTab value="rtl-a">RTL A</UTab><UTab value="rtl-b">RTL B</UTab><UTab value="rtl-c">RTL C</UTab>
        </UTabs>
    </section>

    <section id="route-fixture">
        <UTabs v-model="state.routeModel" id-prefix="route" :mandatory="false" aria-label="Router tabs">
            <UTab value="home" to="/route/home" data-route-tab="home">Home route</UTab>
            <UTab value="other" to="/route/other" data-route-tab="other">Other route</UTab>
            <UTab value="blocked" to="/route/blocked" data-route-tab="blocked" @click.prevent>Prevented route</UTab>
        </UTabs>
    </section>
</template>`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'TabsSelectionFixture.vue'), fixture, 'utf8');

const report = {
    fixture: 'tabs-selection-protocols',
    method: 'Chromium fixture imports the actual public UI index and the pinned Vue Router browser bundle.',
    targetSourceSha256Before,
    protectedSourceSha256Before,
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    limits: [
        'Chromium browser renderer only; no Electron renderer acceptance is claimed.',
        'No visual acceptance is claimed.',
        'No full project build or full test suite was run.'
    ]
};
const vite = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/full-alignment/tabs-selection-protocols/fixture/main.ts'],
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
    logLevel: 'error'
});

let browser;
    const record = (name, details) => report.checks.push({ name, details });
    const settle = (page, count = 4) => page.evaluate(frames => new Promise(resolve => {
        const next = remaining => remaining ? requestAnimationFrame(() => next(remaining - 1)) : resolve();
        next(frames);
    }), count);
    const panelAttribute = (page, selector, attribute) => page.locator(selector).evaluate((element, name) => element.closest('[role="tabpanel"]')?.getAttribute(name) ?? null, attribute);

try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.consoleWarnings.push(message.text());
    });
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ status: response.status(), url: response.url() }); });
    page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/full-alignment/tabs-selection-protocols/fixture/index.html`);
    await page.waitForFunction(() => !!window.__tabsSelection && document.querySelector('#mandatory-force-tab-s-force-a[aria-selected="true"]'));

    assert.equal(await page.locator('#mandatory-true-tab-s-true-a[aria-selected="true"]').count(), 0, 'mandatory=true does not pick an initial tab');
    assert.equal(await page.locator('#mandatory-force-tab-s-force-a[aria-selected="true"]').count(), 1, 'mandatory=force picks the first available tab');
    assert.equal(await page.locator('#multiple-fixture [role="tablist"]').getAttribute('aria-multiselectable'), 'true');
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.events), [], 'no group:selected event fires during initial registration');
    const singleTab = page.locator('#single-fixture #single-tab-s-a');
    assert.ok((await singleTab.getAttribute('class') ?? '').includes('picked'), 'selectedClass applies to selected tabs');
    await singleTab.click();
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.single), 'a', 'mandatory prevents clearing the only selected value');
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.events), [], 'an unchanged mandatory selection emits no group:selected event');
    await page.locator('#single-fixture #single-tab-s-b').click();
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.single), 'b');
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.events), ['a:false', 'b:true'], 'group:selected emits once per real selection-state transition');
    const groupApi = await page.evaluate(() => {
        const group = window.__tabsSelection.refs.single.value;
        return {
            selectedIds: group.selectedIds,
            selectedValues: group.selectedValues,
            isSelectedType: typeof group.isSelected,
            selectType: typeof group.select,
            nextType: typeof group.next,
            prevType: typeof group.prev
        };
    });
    assert.deepEqual(groupApi.selectedValues, ['b']);
    assert.equal(groupApi.selectedIds.length, 1);
    assert.equal(groupApi.isSelectedType, 'function');
    assert.equal(groupApi.selectType, 'function');
    assert.equal(groupApi.nextType, 'function');
    assert.equal(groupApi.prevType, 'function');
    record('single, mandatory, ref and selected event', 'true blocks clearing without selecting initially; force selects after registration; ref methods expose ID-based group state and an actual selection change emits once.');

    assert.equal(await page.locator('#optional-fixture .ui-tab[tabindex="0"]').count(), 1, 'headless roving focus provides a tab stop when optional tabs start empty');
    const optionalA = page.locator('#optional-fixture #optional-tab-s-optional-a');
    const optionalB = page.locator('#optional-fixture #optional-tab-s-optional-b');
    await optionalA.focus();
    await optionalA.press('ArrowRight');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'optional-tab-s-optional-b');
    assert.equal(await optionalB.getAttribute('tabindex'), '0', 'focused unselected manual tab remains the roving tab stop');
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.optional), undefined, 'manual focus does not select an optional tab');
    await optionalB.press('Enter');
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.optional), 'optional-b', 'Enter selects the focused optional tab');
    await optionalB.press('Enter');
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.optional), undefined, 'Enter toggles off the selected optional tab');
    await page.locator('#optional-fixture #optional-tab-s-optional-a').evaluate(element => element.click());
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.optional), 'optional-a', 'a DOM click without pointerdown selects the optional tab');
    await page.locator('#optional-fixture #optional-tab-s-optional-a').evaluate(element => element.click());
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.optional), undefined, 'a repeated DOM click toggles the optional tab off');
    record('optional keyboard and DOM click toggle', 'empty optional tabs retain one headless roving tab stop; manual focus stays unselected, Enter toggles, and DOM clicks without pointerdown toggle once.');

    const multipleTwo = page.locator('#multiple-fixture #multiple-tab-n-2');
    await multipleTwo.focus();
    await multipleTwo.press('Space');
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.multiple), [1, 2], 'Space selects a multiple item');
    assert.equal(await page.locator('#multiple-fixture .ui-tab[tabindex="0"]').count(), 1, 'multiple selection still has exactly one enabled roving tab stop');
    assert.equal(await multipleTwo.getAttribute('tabindex'), '0', 'the focused unselected-then-selected tab is the roving stop');
    assert.equal(await page.locator('#multiple-fixture #multiple-tab-n-1').getAttribute('tabindex'), '-1');
    await multipleTwo.press('Space');
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.multiple), [1], 'Space toggles a multiple item off');
    await page.locator('#multiple-fixture #multiple-tab-n-2').click();
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.multiple), [1, 2]);
    await page.locator('#multiple-fixture #multiple-tab-n-3').click();
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.multiple), [1, 2], 'max blocks additional selections');
    await page.locator('#multiple-fixture #multiple-tab-n-1').click();
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.multiple), [2], 'mandatory permits removing one of several selections');
    await page.locator('#multiple-fixture #multiple-tab-n-2').click();
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.multiple), [2], 'mandatory prevents removing the final multiple selection');
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.state.onceEvents), ['two:true', 'two:false', 'two:true', 'one:false'], 'multiple group:selected emits one event per actual state change');
    record('multiple, max and mandatory', 'multiple IDs follow comparator-aware arrays, max prevents overflow, and mandatory blocks clearing the last selected item.');

    const selectedRovingTab = page.locator('#roving-fixture [data-row="selected"]');
    const focusedRovingTab = page.locator('#roving-fixture [data-row="focus"]');
    const fallbackRovingTab = page.locator('#roving-fixture [data-row="other"]');
    assert.equal(await selectedRovingTab.getAttribute('tabindex'), '0', 'one selected enabled registration starts as the tab stop');
    await focusedRovingTab.focus();
    assert.equal(await focusedRovingTab.getAttribute('tabindex'), '0', 'the current unselected focused registration takes the single tab stop');
    assert.equal(await page.locator('#roving-fixture .ui-tab[tabindex="0"]').count(), 1);
    await page.evaluate(() => { window.__tabsSelection.state.rovingRows[0].disabled = true; });
    await settle(page);
    assert.equal(await selectedRovingTab.getAttribute('aria-selected'), 'true', 'disabled selected state remains represented in ARIA');
    assert.equal(await selectedRovingTab.getAttribute('tabindex'), '-1', 'a disabled selected tab is not the keyboard stop');
    assert.equal(await focusedRovingTab.getAttribute('tabindex'), '0', 'an enabled current focus remains the roving stop');
    await page.evaluate(() => { window.__tabsSelection.state.rovingRows = window.__tabsSelection.state.rovingRows.filter(row => row.id !== 'focus'); });
    await settle(page);
    assert.equal(await fallbackRovingTab.getAttribute('tabindex'), '0', 'removing the focused registration falls back to the first enabled tab');
    assert.equal(await page.locator('#roving-fixture .ui-tab[tabindex="0"]').count(), 1, 'stale focused IDs cannot remove the only tab stop');
    await page.evaluate(() => { window.__tabsSelection.state.rovingRows[0].disabled = false; });
    await settle(page);
    assert.equal(await selectedRovingTab.getAttribute('tabindex'), '0', 'an enabled selected registration takes priority over the first enabled fallback');
    record('single roving stop, disabled selection and stale-focus fallback', 'current enabled focus wins; a disabled selected tab remains selected in ARIA but leaves the tab stop, and removal of the focused item falls back safely.');

    await page.evaluate(() => { window.__tabsSelection.nullItemElement = window.__tabsSelection.refs.nullItemTab.value.element; });
    assert.equal(await page.locator('#null-items-tab-null[aria-selected="true"]').count(), 1, 'null is represented by a stable tab token');
    await page.evaluate(() => { window.__tabsSelection.state.nullTabItems.reverse(); });
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.refs.nullItemTab.value.element === window.__tabsSelection.nullItemElement), true, 'reordering items preserves the keyed null tab instance');
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.nullItemModel), null, 'reordering keeps null as the selected public value');
    assert.equal(await page.locator('#null-items-tab-null[aria-selected="true"]').count(), 1);
    assert.equal(await panelAttribute(page, '#null-item-panel-null', 'aria-labelledby'), 'null-items-tab-null', 'the null panel remains paired with the stable null tab ID');
    assert.equal(await panelAttribute(page, '#null-item-panel-null', 'aria-hidden'), 'false');
    record('null item token and keyed reorder', 'a null-valued item uses a stable key/token across reorder; its component instance, model, and tab-to-panel ARIA association remain intact.');

    await page.locator('#readonly-fixture #readonly-tab-s-right').click();
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.readOnlyModel), 'left', 'readonly prevents pointer selection');
    await page.evaluate(() => { window.__tabsSelection.state.readonly = false; });
    await settle(page);
    await page.locator('#readonly-fixture #readonly-tab-s-right').click();
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.readOnlyModel), 'right', 'readonly is reactive');
    await page.locator('#disabled-fixture #dynamic-tab-s-blocked').dispatchEvent('click');
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.dynamicModel), 'open', 'disabled tab does not change the model');
    assert.equal(await page.locator('#disabled-fixture #dynamic-tab-s-blocked').getAttribute('aria-disabled'), 'true');
    await page.evaluate(() => { window.__tabsSelection.state.dynamicDisabled = false; });
    await settle(page);
    await page.locator('#disabled-fixture #dynamic-tab-s-blocked').click();
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.dynamicModel), 'blocked', 'disabled state updates reactively');
    await page.evaluate(() => { window.__tabsSelection.state.external = 'right'; });
    await settle(page);
    assert.equal(await page.locator('#external-fixture #external-tab-s-right').getAttribute('aria-selected'), 'true', 'external model replacement updates selected IDs');
    record('readonly, disabled and controlled model changes', 'readonly and disabled guard selection, dynamic prop changes take effect, and parent model changes project into ARIA state.');

    assert.equal(await page.locator('#nullable-fixture #nullable-tab-null').getAttribute('aria-selected'), 'true', 'null is matched as a real selected value');
    assert.equal(await panelAttribute(page, '#nullable-panel', 'aria-labelledby'), await page.locator('#nullable-fixture #nullable-tab-null').getAttribute('id'));
    assert.equal(await panelAttribute(page, '#nullable-panel', 'aria-hidden'), 'false', 'null panel follows the selected null tab');
    await page.locator('#nullable-fixture #nullable-tab-null').click();
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.nullable), undefined, 'clearing a single selection emits undefined rather than null');
    assert.equal(await page.locator('#nullable-model').textContent(), 'undefined');
    assert.equal(await panelAttribute(page, '#nullable-panel', 'aria-hidden'), 'true');
    assert.equal(await page.locator('#array-single-fixture [data-array-tab]').getAttribute('aria-selected'), 'true', 'an array is treated as one value when multiple=false');
    assert.deepEqual(await page.evaluate(() => window.__tabsSelection.refs.arraySingle.value.selectedValues), [['array', { rank: 2 }]]);
    assert.equal(await page.locator('#object-fixture [data-object-tab="one"]').getAttribute('aria-selected'), 'true', 'deep object copies compare to registered values');
    const objectTabId = await page.locator('#object-fixture [data-object-tab="one"]').getAttribute('id');
    assert.equal(await panelAttribute(page, '#object-one-panel', 'aria-labelledby'), objectTabId, 'object value token is shared by its tab and panel');
    assert.equal(await panelAttribute(page, '#object-one-panel', 'aria-hidden'), 'false');
    assert.equal(await page.locator('#custom-comparator-fixture [data-custom-tab]').getAttribute('aria-selected'), 'true', 'custom comparator is used for selected value projection');
    record('null, undefined, object, array and comparator values', 'null remains selectable and has its own panel token; an empty single selection writes undefined; deep and custom comparators match object and array values.');

    await page.evaluate(() => { window.__tabsSelection.state.implicitRows.reverse(); });
    await settle(page);
    assert.equal(await page.locator('#implicit-fixture [data-row="beta"]').getAttribute('aria-selected'), 'true', 'keyed reverse reorders registrations while retaining the model index');
    assert.equal(await page.locator('#implicit-fixture [data-row="beta"]').getAttribute('id'), 'implicit-tab-n-1');
    await page.evaluate(() => { window.__tabsSelection.state.implicitRows = window.__tabsSelection.state.implicitRows.filter(row => row.id !== 'beta'); });
    await settle(page);
    assert.equal(await page.locator('#implicit-fixture [data-row="alpha"]').getAttribute('aria-selected'), 'true', 'removing an implicit-value item recomputes the remaining positional value');
    assert.equal(await page.locator('#implicit-model').textContent(), '1', 'the public index model remains stable after keyed removal');
    record('implicit positions, keyed reorder and removal', 'registration order follows DOM order, no-value items use current positions, and model indexes remain public values after reordering/removal.');

    assert.equal(await page.locator('#multiple-window-fixture [role="tablist"]').getAttribute('aria-multiselectable'), 'true');
    assert.equal(await panelAttribute(page, '#multi-one-panel', 'aria-hidden'), 'false', 'multiple Tabs associates the first selected registered value with its Window');
    assert.equal(await page.locator('#multi-two-panel').count(), 0, 'an unselected lazy Window does not render its content');
    await page.evaluate(() => { window.__tabsSelection.state.multiObject = [window.__tabsSelection.objectTwo]; });
    await settle(page);
    assert.equal(await panelAttribute(page, '#multi-two-panel', 'aria-hidden'), 'false', 'the first matching selected value changes the active Window');
    await page.evaluate(() => { window.__tabsSelection.state.windowBound = true; window.__tabsSelection.state.windowModel = null; });
    await settle(page);
    assert.equal(await panelAttribute(page, '#explicit-null-panel', 'aria-hidden'), 'false', 'an explicit Window model null selects a matching null item instead of being treated as empty');
    assert.equal(await page.locator('#explicit-left-panel').count(), 0, 'an unselected lazy explicit Window does not render its content');
    await page.evaluate(() => { window.__tabsSelection.state.windowModel = 'left'; });
    await settle(page);
    assert.equal(await panelAttribute(page, '#explicit-left-panel', 'aria-hidden'), 'false', 'explicit Window model takes priority over the paired Tabs model');
    await page.evaluate(() => { window.__tabsSelection.state.windowBound = false; });
    await settle(page);
    assert.equal(await panelAttribute(page, '#explicit-left-panel', 'aria-hidden'), 'true', 'removing the explicit Window model resumes the unmatched Tabs fallback');
    record('multiple and explicit Window model association', 'multiple nested Tabs display the first matching selected Window; explicit null and other values override fallback, and removing the explicit prop restores pairing.');

    const rtlA = page.locator('#rtl-fixture #rtl-tab-s-rtl-a');
    await rtlA.focus();
    await rtlA.press('ArrowLeft');
    await settle(page);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'rtl-tab-s-rtl-b', 'manual horizontal RTL maps ArrowLeft to the next tab');
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.manualRtl), 'rtl-a', 'manual focus movement does not select a tab');
    await page.locator('#rtl-fixture #rtl-tab-s-rtl-b').press('Enter');
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.manualRtl), 'rtl-b', 'manual Enter selects exactly the focused tab');
    await page.locator('#automatic-fixture #automatic-tab-s-first').focus();
    await page.locator('#automatic-fixture #automatic-tab-s-first').press('ArrowRight');
    await settle(page);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'automatic-tab-s-last', 'automatic arrow navigation skips disabled tabs');
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.automatic), 'last', 'automatic focus selects the enabled target');
    record('manual/automatic keyboard and RTL', 'manual RTL arrows move focus without changing selection until Enter; automatic arrows skip disabled tabs and select on focus.');

    await page.waitForFunction(() => window.__tabsRouter.currentRoute.value.path === '/route/home' && document.querySelector('[data-route-tab="home"]')?.getAttribute('aria-selected') === 'true');
    await page.locator('#route-fixture [data-route-tab="other"]').click();
    await page.waitForFunction(() => window.__tabsRouter.currentRoute.value.path === '/route/other' && document.querySelector('[data-route-tab="other"]')?.getAttribute('aria-selected') === 'true');
    const routeBeforePrevented = await page.evaluate(() => window.__tabsRouter.currentRoute.value.path);
    await page.locator('#route-fixture [data-route-tab="blocked"]').click();
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsRouter.currentRoute.value.path), routeBeforePrevented, 'user preventDefault blocks route navigation');
    assert.equal(await page.evaluate(() => window.__tabsSelection.state.routeModel), 'other', 'prevented navigation does not change the selected route tab');
    record('RouterLink activation and user navigation guard', 'initial active route selects its tab, click navigation follows RouterLink, and user preventDefault preserves route and model.');

    const markerStyles = await page.locator('#marker-fixture .ui-tab').evaluateAll(elements => elements.map(element => {
        const style = getComputedStyle(element, '::after');
        return { selected: element.getAttribute('aria-selected'), content: style.content, height: style.height, color: style.backgroundColor };
    }));
    assert.deepEqual(markerStyles.map(item => item.selected), ['true', 'true', 'false'], 'both selected tabs keep independent selected markers');
    for (const marker of markerStyles.slice(0, 2)) {
        assert.notEqual(marker.content, 'none', 'each selected tab has a generated underline marker');
        assert.equal(marker.height, '3px', 'each selected marker uses the shared underline thickness');
        assert.notEqual(marker.color, 'rgba(0, 0, 0, 0)', 'each selected marker has a visible theme color');
    }
    assert.ok(['none', 'normal'].includes(markerStyles[2].content), 'an unselected tab has no generated marker');
    assert.equal(await page.locator('#marker-fixture .ui-tabs-slider').count(), 0, 'multiple selection does not mount the shared single-selection slider');
    record('independent multi-selection underline markers', 'each selected tab receives its own computed underline marker, while the unselected tab and shared slider remain inactive.');

    await page.evaluate(() => { window.__tabsSelection.state.markerHideSlider = true; });
    await settle(page);
    assert.equal(await page.locator('#marker-fixture .ui-tabs').getAttribute('data-hide-slider'), 'true', 'hideSlider is reflected on the tabs list');
    const hiddenMarkerContents = await page.locator('#marker-fixture .ui-tab').evaluateAll(elements => elements.slice(0, 2).map(element => getComputedStyle(element, '::after').content));
    assert.ok(hiddenMarkerContents.every(content => content === 'none' || content === 'normal'), 'hideSlider suppresses each selected pseudo-element marker');
    record('hideSlider suppresses multi-selection markers', 'the reactive hideSlider prop removes selected pseudo-element indicators without changing selection.');

    const buttonAppearance = await page.locator('#single-fixture .ui-tab[aria-selected="true"]').evaluate(element => {
        const style = getComputedStyle(element);
        return Object.fromEntries(['display', 'alignItems', 'justifyContent', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'height', 'minHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'color', 'backgroundColor', 'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor', 'borderRadius', 'boxSizing'].map(property => [property, style[property]]));
    });
    const anchorAppearance = await page.locator('#route-fixture a.ui-tab[aria-selected="true"]').evaluate(element => {
        const style = getComputedStyle(element);
        return Object.fromEntries(['display', 'alignItems', 'justifyContent', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'height', 'minHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'color', 'backgroundColor', 'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor', 'borderRadius', 'boxSizing'].map(property => [property, style[property]]));
    });
    assert.deepEqual(anchorAppearance, buttonAppearance, 'linked tabs share the same computed visual treatment as button tabs');
    record('linked tab appearance parity', 'a selected RouterLink anchor and selected native button have matching core computed layout, type, color, and border styles.');

    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.consoleWarnings, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.requestFailures, []);
    report.targetSourceSha256After = await hashFiles(targetSources);
    report.protectedSourceSha256After = await hashFiles(protectedSources);
    assert.deepEqual(report.targetSourceSha256After, targetSourceSha256Before, 'source hashes stayed stable during Chromium verification');
    assert.deepEqual(report.protectedSourceSha256After, protectedSourceSha256Before, 'protected sources stayed unchanged during Chromium verification');
    report.protectedSourcesUnchanged = true;
    await page.screenshot({ path: path.join(evidence, 'tabs-selection-protocols.png'), fullPage: true });
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(`tabs selection protocols: ${report.checks.length} groups passed`);
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    report.targetSourceSha256After = await hashFiles(targetSources);
    report.protectedSourceSha256After = await hashFiles(protectedSources);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    throw error;
} finally {
    if (browser) await browser.close();
    await vite.close();
}
