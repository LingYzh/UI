import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/tabs-window-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const targetSources = [
    'src/ui/UiTabsWindow.vue',
    'src/ui/UiTabsWindowItem.vue',
    'src/ui/tabs-window-context.ts',
    'src/ui/tabs.ts',
    'tests/desktop/tabs-window-protocols.mjs',
    'tests/tsconfig.tabs-window.json'
];
const protectedSources = [
    'src/ui/index.ts',
    'src/ui/UiTabs.vue',
    'src/ui/UiTab.vue',
    'src/ui/UWindow.vue',
    'src/ui/UWindowItem.vue',
    'src/ui/window-state.ts',
    'src/ui/group-state.ts',
    'src/ui/defaults.ts',
    'src/ui/styles.css',
    'src/ui/layout-components.css'
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
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" href="data:,"><title>Tabs Window protocols</title>
<style>html,body,#app{margin:0;min-height:100%;font-family:Arial,sans-serif}#app{padding:24px}.fixture{margin:16px 0;padding:12px;border:1px solid #aaa}.u-window{min-height:90px}.u-window-item{min-height:40px}.window-test-enter-active,.window-test-leave-active,.reverse-test-enter-active,.reverse-test-leave-active{transition:opacity 180ms linear}.window-test-enter-from,.window-test-leave-to,.reverse-test-enter-from,.reverse-test-leave-to{opacity:0}</style></head>
<body><div id="app"></div><script type="module" src="/artifacts/full-alignment/tabs-window-protocols/fixture/main.ts"></script></body></html>`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import TabsWindowFixture from './TabsWindowFixture.vue';
import '/src/ui/styles.css';

createApp(TabsWindowFixture).use(createUI()).mount('#app');
window.__tabsWindowApp = true;
`;

const fixture = `<script setup>
import { defineComponent, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { UTab, UTabs, UTabsWindow, UTabsWindowItem } from '/src/ui/index.ts';

const state = reactive({
    nestedTab: 'beta', betaDisabled: false, gammaDisabled: false,
    groupEvents: [], panelClicks: 0, scopeValue: 'scope-b', scopeDisabled: false, scopeUpdates: [],
    controlledWindow: null, controlledBound: false, controlledUpdates: [],
    adjacentValue: 'adj-b', legacyValue: 'legacy-b',
    autoValue: 0, autoRows: [{ id: 'alpha' }, { id: 'beta' }, { id: 'gamma' }], autoContinuous: false,
    eagerValue: 'eager-a', eagerParent: true, verticalValue: 'v0'
});
const refs = { panelAlpha: ref(), panelBeta: ref(), panelGamma: ref(), scope: ref(), controlled: ref(), adjacent: ref(), auto: ref(), autoItems: reactive({}), eager: ref(), vertical: ref() };
const counts = reactive({ mounted: {}, unmounted: {} });
function count(bucket, name) { bucket[name] = (bucket[name] ?? 0) + 1; }
const Probe = defineComponent({
    name: 'TabsWindowProbe',
    props: { name: { type: String, required: true } },
    setup(props, { slots }) {
        onMounted(() => count(counts.mounted, props.name));
        onBeforeUnmount(() => count(counts.unmounted, props.name));
        return () => h('span', { class: 'probe', id: 'probe-' + props.name }, slots.default?.());
    }
});

window.__tabsWindow = { state, refs, counts };
</script>

<template>
    <section id="nested-fixture" class="fixture">
        <output id="nested-tab-model">{{ state.nestedTab }}</output>
        <UTabs v-model="state.nestedTab" id-prefix="nested" direction="vertical" aria-label="Nested tabs">
            <UTab value="alpha">Alpha</UTab>
            <UTab value="beta" :disabled="state.betaDisabled">Beta</UTab>
            <UTab value="gamma" :disabled="state.gammaDisabled">Gamma</UTab>
            <template #window>
                <UTabsWindowItem :ref="refs.panelAlpha" value="alpha" @group:selected="state.groupEvents.push('alpha:' + $event.value)">
                    <template #default="{ selected, isSelected, disabled, value, element }">
                        <Probe name="alpha">Alpha:{{ selected.value }}:{{ isSelected.value }}:{{ disabled.value }}:{{ value.value }}:{{ element.value?.classList.contains('ui-tab-panel') }}</Probe>
                    </template>
                </UTabsWindowItem>
                <UTabsWindowItem :ref="refs.panelBeta" value="beta" class="consumer-panel" style="padding: 13px" data-consumer="beta" title="Panel details" @click="state.panelClicks += 1" @group:selected="state.groupEvents.push('beta:' + $event.value)">
                    <template #default="{ selected, disabled, value }"><Probe name="beta">Beta:{{ selected.value }}:{{ disabled.value }}:{{ value.value }}</Probe></template>
                </UTabsWindowItem>
                <UTabsWindowItem :ref="refs.panelGamma" value="gamma" :disabled="false" @group:selected="state.groupEvents.push('gamma:' + $event.value)">
                    <template #default="{ selected, disabled, value }"><Probe name="gamma">Gamma:{{ selected.value }}:{{ disabled.value }}:{{ value.value }}</Probe></template>
                </UTabsWindowItem>
            </template>
        </UTabs>
    </section>

    <section id="scope-fixture" class="fixture">
        <output id="scope-model">{{ state.scopeValue }}</output>
        <UTabsWindow :ref="refs.scope" v-model="state.scopeValue" :disabled="state.scopeDisabled" id-prefix="scope" tag="section" direction="vertical" reverse height="240px" label="Standalone panels" show-arrows @update:model-value="state.scopeUpdates.push($event)">
            <template #default="{ modelValue, next, prev, group }">
                <output id="scope-contract">{{ modelValue }}|{{ group.selected.value }}|{{ group.values.join(',') }}|{{ group.disabled }}</output>
                <button id="scope-next-action" type="button" @click.stop="next">Next scope</button>
                <button id="scope-prev-action" type="button" @click.stop="prev">Previous scope</button>
                <UTabsWindowItem value="scope-a" transition="window-test" reverse-transition="reverse-test"><span id="scope-a">Scope A</span></UTabsWindowItem>
                <UTabsWindowItem value="scope-b"><span id="scope-b">Scope B</span></UTabsWindowItem>
                <UTabsWindowItem value="scope-c"><span id="scope-c">Scope C</span></UTabsWindowItem>
            </template>
            <template #additional="{ modelValue, group }"><output id="scope-additional">{{ modelValue }}|{{ group.values.join(',') }}</output></template>
            <template #prev="{ props }"><button id="scope-prev-slot" type="button" v-bind="props">Previous panel</button></template>
            <template #next="{ props }"><button id="scope-next-slot" type="button" v-bind="props">Next panel</button></template>
        </UTabsWindow>
    </section>

    <section id="controlled-fixture" class="fixture">
        <UTabs v-model="state.nestedTab" id-prefix="controlled" aria-label="Controlled tabs">
            <UTab value="alpha">Alpha</UTab><UTab value="beta">Beta</UTab>
            <template #window>
                <UTabsWindow :ref="refs.controlled" v-bind="state.controlledBound ? { modelValue: state.controlledWindow } : {}" @update:model-value="state.controlledUpdates.push($event)">
                    <template #default="{ next }">
                        <button id="controlled-next" type="button" @click="next">Next controlled</button>
                        <UTabsWindowItem value="alpha" :transition="false"><span id="controlled-alpha">Alpha controlled</span></UTabsWindowItem>
                        <UTabsWindowItem value="beta"><span id="controlled-beta">Beta controlled</span></UTabsWindowItem>
                    </template>
                </UTabsWindow>
            </template>
        </UTabs>
    </section>

    <section id="adjacent-fixture" class="fixture">
        <UTabs v-model="state.adjacentValue" id-prefix="adjacent" aria-label="Adjacent tabs"><UTab value="adj-a">A</UTab><UTab value="adj-b">B</UTab></UTabs>
        <UTabsWindow :ref="refs.adjacent" v-model="state.adjacentValue" id-prefix="adjacent">
            <UTabsWindowItem value="adj-a"><span id="adjacent-a">A panel</span></UTabsWindowItem>
            <UTabsWindowItem value="adj-b"><span id="adjacent-b">B panel</span></UTabsWindowItem>
        </UTabsWindow>
    </section>

    <section id="legacy-fixture" class="fixture">
        <UTabs v-model="state.legacyValue" :items="[{ id: 'legacy-a', label: 'Legacy A' }, { id: 'legacy-b', label: 'Legacy B' }]" id-prefix="legacy" aria-label="Legacy tabs" />
        <UTabsWindow v-model="state.legacyValue" id-prefix="legacy">
            <UTabsWindowItem value="legacy-a"><span id="legacy-a-panel">Legacy A panel</span></UTabsWindowItem>
            <UTabsWindowItem value="legacy-b"><span id="legacy-b-panel">Legacy B panel</span></UTabsWindowItem>
        </UTabsWindow>
    </section>

    <section id="reorder-fixture" class="fixture">
        <output id="auto-model">{{ state.autoValue }}</output>
        <UTabsWindow :ref="refs.auto" v-model="state.autoValue" :continuous="state.autoContinuous">
            <UTabsWindowItem v-for="row in state.autoRows" :key="row.id" :ref="instance => { if (instance) refs.autoItems[row.id] = instance }">
                <template #default="{ value, selected }"><span class="auto-row" :id="'auto-' + row.id">{{ value.value }}:{{ selected.value }}</span></template>
            </UTabsWindowItem>
        </UTabsWindow>
    </section>

    <section id="eager-fixture" class="fixture">
        <UTabsWindow :ref="refs.eager" v-model="state.eagerValue" :eager="state.eagerParent">
            <UTabsWindowItem value="eager-a"><Probe name="eager-a">Eager A</Probe></UTabsWindowItem>
            <UTabsWindowItem value="eager-b" :eager="false" :transition="false"><Probe name="eager-b">Lazy B</Probe></UTabsWindowItem>
        </UTabsWindow>
    </section>

    <section id="vertical-fixture" class="fixture">
        <UTabsWindow :ref="refs.vertical" v-model="state.verticalValue" id-prefix="vertical" direction="vertical" label="Vertical panels">
            <UTabsWindowItem value="v0"><span id="vertical-v0">Zero panel</span></UTabsWindowItem>
            <UTabsWindowItem value="v1"><span id="vertical-v1">One panel</span></UTabsWindowItem>
            <UTabsWindowItem value="v2"><span id="vertical-v2">Two panel</span></UTabsWindowItem>
        </UTabsWindow>
    </section>
</template>`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'TabsWindowFixture.vue'), fixture, 'utf8');

const report = {
    fixture: 'tabs-window-protocols',
    method: 'Vite fixture imports canonical Tabs/Window components from the public src/ui/index.ts and exercises real SFC behavior in Playwright Chromium.',
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
        'Screenshot is diagnostic only; no visual acceptance is claimed.',
        'No full project build or full test suite was run.'
    ]
};
const vite = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/full-alignment/tabs-window-protocols/fixture/main.ts'],
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
const settle = (page, count = 3) => page.evaluate(frames => new Promise(resolve => {
    const next = remaining => remaining ? requestAnimationFrame(() => next(remaining - 1)) : resolve();
    next(frames);
}), count);

try {
    await vite.listen();
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.consoleWarnings.push(message.text());
    });
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ status: response.status(), url: response.url() }); });
    page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/full-alignment/tabs-window-protocols/fixture/index.html`);
    await page.waitForFunction(() => !!window.__tabsWindow && document.querySelector('#nested-panel-s-beta')?.getAttribute('aria-hidden') === 'false');

    assert.equal(await page.locator('#nested-fixture .u-window').count(), 1, 'UTabs creates one shared Window around direct panel items');
    const tabBeta = page.locator('#nested-tab-s-beta');
    const panelBeta = page.locator('#nested-fixture #nested-panel-s-beta');
    assert.equal(await tabBeta.getAttribute('aria-controls'), 'nested-panel-s-beta');
    assert.equal(await panelBeta.getAttribute('role'), 'tabpanel');
    assert.equal(await panelBeta.getAttribute('aria-labelledby'), 'nested-tab-s-beta');
    assert.equal(await panelBeta.getAttribute('aria-hidden'), 'false');
    assert.ok((await panelBeta.getAttribute('class') ?? '').includes('ui-tabs-window-item'));
    assert.ok((await panelBeta.getAttribute('class') ?? '').includes('consumer-panel'));
    assert.equal(await panelBeta.getAttribute('data-consumer'), 'beta');
    assert.equal(await panelBeta.getAttribute('title'), 'Panel details');
    assert.equal(await panelBeta.evaluate(element => getComputedStyle(element).padding), '13px');
    await panelBeta.click();
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.panelClicks), 1);
    record('native panel attrs and events', 'class, style, native attrs and click listeners reach the semantic panel root.');
    const inactiveAlpha = page.locator('#nested-fixture #nested-panel-s-alpha');
    assert.equal(await inactiveAlpha.getAttribute('inert'), '');
    assert.equal(await inactiveAlpha.getAttribute('tabindex'), '-1');
    await tabBeta.focus();
    await inactiveAlpha.evaluate(element => element.focus());
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'nested-tab-s-beta', 'inert inactive panel cannot receive focus');
    assert.equal(await page.locator('#probe-beta').textContent(), 'Beta:true:false:beta');
    assert.equal(await page.locator('#probe-alpha').count(), 0, 'non-eager inactive content is not mounted before first selection');
    record('nested tab-to-panel ARIA and ref/slot refs', 'tab controls and panel labelledby IDs pair correctly; inactive panels are inert and cannot receive focus; selected, disabled, value and element refs are available to item slots.');

    await page.locator('#nested-fixture #nested-tab-s-alpha').click();
    await settle(page);
    assert.equal(await page.locator('#nested-tab-model').textContent(), 'alpha');
    assert.equal(await page.locator('#nested-fixture #nested-panel-s-alpha').getAttribute('aria-hidden'), 'false', 'the automatic Window follows the nearest Tabs model');
    record('automatic nested Window composition', 'direct panel items inherit the nearest Tabs model and preserve panel ARIA without introducing a second Window.');

    await page.evaluate(() => { window.__tabsWindow.state.betaDisabled = true; });
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsWindow.refs.panelBeta.value.disabled), true, 'disabled inherits the matching Tab registration reactively');
    assert.equal(await page.locator('#nested-fixture #nested-panel-s-beta').getAttribute('aria-disabled'), 'true');
    await page.evaluate(() => { window.__tabsWindow.state.gammaDisabled = true; });
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsWindow.refs.panelGamma.value.disabled), false, 'explicit disabled=false overrides the matching disabled Tab');
    record('reactive disabled inheritance', 'matching Tab disabled state is inherited and explicit item false overrides the disabled Tab registration.');

    const scopeRoot = page.locator('#scope-fixture section.u-window');
    assert.equal(await scopeRoot.count(), 1, 'tag is forwarded to the Window root');
    assert.equal(await scopeRoot.getAttribute('aria-label'), 'Standalone panels');
    assert.equal(await scopeRoot.getAttribute('data-direction'), 'vertical');
    assert.equal(await scopeRoot.getAttribute('data-reverse'), 'true');
    assert.equal(await scopeRoot.evaluate(element => getComputedStyle(element).height), '240px');
    assert.equal(await page.locator('#scope-fixture .u-window-controls').count(), 1, 'explicit showArrows passes through');
    assert.equal(await page.locator('#scope-next-slot').count(), 1, 'next slot receives Window button props');
    assert.equal(await page.locator('#scope-prev-slot').count(), 1, 'prev slot receives Window button props');
    assert.equal(await page.locator('#scope-additional').textContent(), 'scope-b|scope-a,scope-b,scope-c', 'additional slot exposes public model and values');
    assert.equal(await page.locator('#scope-contract').textContent(), 'scope-b|scope-b|scope-a,scope-b,scope-c|false', 'default slot exposes public model, group facade, and disabled state');
    const scopeRefSurface = await page.evaluate(() => ({ present: Boolean(window.__tabsWindow.refs.scope.value), keys: Object.keys(window.__tabsWindow.refs.scope.value ?? {}), nextType: typeof window.__tabsWindow.refs.scope.value?.next, elementType: typeof window.__tabsWindow.refs.scope.value?.element }));
    assert.equal(scopeRefSurface.nextType, 'function', JSON.stringify(scopeRefSurface));
    assert.equal(await page.evaluate(() => window.__tabsWindow.refs.scope.value.element.tagName), 'SECTION');
    await page.locator('#scope-next-action').click();
    await settle(page);
    assert.equal(await page.locator('#scope-model').textContent(), 'scope-c');
    assert.equal(await page.locator('#scope-contract').textContent(), 'scope-c|scope-c|scope-a,scope-b,scope-c|false');
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.scopeUpdates.at(-1)), 'scope-c', 'uncontrolled Window setter emits the public value');
    await page.evaluate(() => { window.__tabsWindow.state.scopeDisabled = true; });
    await settle(page);
    const disabledUpdatesBefore = await page.evaluate(() => window.__tabsWindow.state.scopeUpdates.length);
    await page.locator('#scope-fixture #scope-panel-s-scope-c').focus();
    const disabledKeyPrevented = await page.locator('#scope-fixture #scope-panel-s-scope-c').evaluate(element => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
    });
    assert.equal(disabledKeyPrevented, false, 'disabled group blocks Window keyboard operation');
    await page.locator('#scope-next-action').click();
    assert.equal(await page.locator('#scope-model').textContent(), 'scope-c', 'disabled operation preserves the selected panel');
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.scopeUpdates.length), disabledUpdatesBefore, 'disabled operation emits no model update');
    assert.equal(await page.locator('#scope-contract').textContent(), 'scope-c|scope-c|scope-a,scope-b,scope-c|true');
    await page.evaluate(() => { window.__tabsWindow.state.scopeDisabled = false; });
    await page.locator('#scope-fixture #scope-panel-s-scope-c').press('ArrowUp');
    await settle(page);
    assert.equal(await page.locator('#scope-model').textContent(), 'scope-b', 'vertical keyboard navigation moves to previous enabled item');
    await page.evaluate(() => {
        window.__transitionClassLog = [];
        const observer = new MutationObserver(records => {
            for (const record of records) {
                const element = record.target;
                if (element instanceof HTMLElement) window.__transitionClassLog.push(element.className);
            }
        });
        observer.observe(document.querySelector('#scope-fixture'), { attributes: true, attributeFilter: ['class'], subtree: true });
        window.__transitionObserver = observer;
    });
    await page.locator('#scope-prev-action').click();
    await page.waitForFunction(() => window.__tabsWindow.state.scopeValue === 'scope-a' && window.__transitionClassLog.some(value => value.includes('reverse-test-enter-active')));
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.scopeValue), 'scope-a');
    assert.equal(await page.locator('#scope-model').textContent(), 'scope-a');
    assert.equal(await page.locator('#scope-a').evaluate(element => element.parentElement?.getAttribute('data-direction')), 'backward');
    assert.equal(await page.evaluate(() => window.__transitionClassLog.some(value => value.includes('reverse-test-enter-active'))), true, 'reverseTransition string is selected for backward movement');
    await page.locator('#scope-next-action').click();
    await page.waitForFunction(() => window.__tabsWindow.state.scopeValue === 'scope-b');
    await page.waitForFunction(() => window.__transitionClassLog.some(value => value.includes('window-test-leave-active')));
    assert.equal(await page.locator('#scope-a').count(), 1, 'lazy outgoing content remains mounted while its leave transition runs');
    assert.equal(await page.locator('#scope-panel-s-scope-a').getAttribute('inert'), '');
    assert.equal(await page.evaluate(() => window.__transitionClassLog.some(value => value.includes('window-test-leave-active'))), true, 'transition string is used for forward leave');
    await page.waitForFunction(() => !document.querySelector('#scope-a'));
    assert.equal(await page.locator('#scope-model').textContent(), 'scope-b');
    await page.evaluate(() => window.__transitionObserver.disconnect());
    record('transition direction and lazy leave lifecycle', 'reverseTransition selects its named transition on backward movement; the forward transition keeps lazy content mounted until leave completes while the inactive panel is inert.');
    record('standalone Window props, slots, refs, disabled behavior and keyboard', 'tag, direction, reverse, height, label, arrows, all Window slots, public ref methods, disabled guards and vertical keyboard are exercised.');

    const controlledPanels = page.locator('#controlled-fixture [role="tabpanel"]');
    assert.equal(await controlledPanels.count(), 2);
    assert.equal(await controlledPanels.nth(0).getAttribute('aria-hidden'), 'false', 'an omitted model follows the nearest Tabs model');
    await page.evaluate(() => { window.__tabsWindow.state.controlledBound = true; });
    await settle(page);
    assert.equal(await controlledPanels.nth(0).getAttribute('aria-hidden'), 'true', 'a dynamically added explicit null model overrides selected Tabs model');
    assert.equal(await controlledPanels.nth(1).getAttribute('aria-hidden'), 'true');
    await page.evaluate(() => { window.__tabsWindow.state.controlledWindow = 'alpha'; });
    await settle(page);
    assert.equal(await controlledPanels.nth(0).getAttribute('aria-hidden'), 'false');
    await page.locator('#controlled-next').click();
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.controlledUpdates.length > 0), true, 'controlled selection emits model updates');
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.controlledUpdates.at(-1)), 'beta');
    assert.equal(await controlledPanels.nth(0).getAttribute('aria-hidden'), 'false', 'controlled prop remains authoritative until the owner updates it');
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.nestedTab), 'alpha', 'controlled Window does not mutate Tabs');
    await page.evaluate(() => { window.__tabsWindow.state.controlledBound = false; });
    await settle(page);
    assert.equal(await controlledPanels.nth(0).getAttribute('aria-hidden'), 'false', 'removing the explicit model prop resumes Tabs model fallback');
    record('controlled null and dynamic model props', 'adding explicit null overrides Tabs, controlled updates do not mutate the owner, and removing the prop resumes fallback.');

    const adjacentPanel = page.locator('#adjacent-fixture #adjacent-panel-s-adj-b');
    assert.equal(await adjacentPanel.getAttribute('aria-labelledby'), 'adjacent-tab-s-adj-b', 'adjacent sibling prefix resolves tab/panel IDs');
    assert.equal(await adjacentPanel.getAttribute('aria-hidden'), 'false');
    assert.equal(await page.locator('#adjacent-fixture .u-window-controls').count(), 0, 'showArrows defaults to false');
    const legacyPanel = page.locator('#legacy-fixture #legacy-panel-legacy-b');
    assert.equal(await legacyPanel.getAttribute('aria-labelledby'), 'legacy-tab-legacy-b', 'legacy item IDs retain the unencoded token protocol');
    assert.equal(await legacyPanel.getAttribute('aria-hidden'), 'false');
    record('adjacent prefix and legacy token compatibility', 'adjacent siblings resolve matching IDs and explicit legacy ids remain unchanged; default arrows are hidden.');

    const eagerMounted = await page.evaluate(() => ({ ...window.__tabsWindow.counts.mounted }));
    assert.equal(eagerMounted['eager-a'], 1, 'parent eager mounts inactive Window content');
    assert.equal(eagerMounted['eager-b'] ?? 0, 0, 'item eager=false overrides eager parent');
    await page.evaluate(() => { window.__tabsWindow.state.eagerValue = 'eager-b'; });
    await page.waitForFunction(() => window.__tabsWindow.counts.mounted['eager-b'] === 1);
    await page.evaluate(() => { window.__tabsWindow.state.eagerValue = 'eager-a'; });
    await page.waitForFunction(() => window.__tabsWindow.counts.unmounted['eager-b'] === 1);
    record('eager inheritance, transition=false and after-leave unloading', 'parent eager mounts content, explicit item false overrides it, and transition=false permits inactive lazy content to unload after leave.');

    assert.equal(await page.evaluate(() => window.__tabsWindow.refs.autoItems.alpha.value), 0);
    assert.equal(await page.evaluate(() => window.__tabsWindow.refs.autoItems.beta.value), 1);
    assert.equal(await page.evaluate(() => window.__tabsWindow.refs.autoItems.gamma.value), 2);
    await page.evaluate(() => { window.__tabsWindow.state.autoRows.reverse(); });
    await page.waitForFunction(() => window.__tabsWindow.refs.autoItems.gamma.value === 0 && window.__tabsWindow.refs.autoItems.alpha.value === 2);
    assert.equal(await page.locator('#auto-gamma').textContent(), '0:true', 'hidden permanent markers reorder implicit indexes with keyed children even while inactive content is unmounted');
    assert.equal(await page.locator('#auto-model').textContent(), '0', 'reordering implicit values does not spuriously clear the public model');
    await page.evaluate(() => { window.__tabsWindow.state.autoValue = 2; });
    await settle(page);
    assert.equal(await page.locator('#auto-alpha').textContent(), '2:true');
    await page.evaluate(() => { window.__tabsWindow.state.autoContinuous = true; });
    await page.evaluate(() => window.__tabsWindow.refs.auto.value.next());
    await settle(page);
    assert.equal(await page.locator('#auto-model').textContent(), '0', 'continuous compatibility prop wraps at the end');
    record('implicit values, keyed reorder, and continuous navigation', 'permanent marker refs preserve live DOM order and indexes when lazy panels have no content; the public index model remains stable.');

    await page.locator('#vertical-fixture #vertical-panel-s-v0').focus();
    await page.locator('#vertical-fixture #vertical-panel-s-v0').press('ArrowDown');
    await settle(page);
    assert.equal(await page.evaluate(() => window.__tabsWindow.state.verticalValue), 'v1', 'vertical keyboard movement follows enabled Window registration order');
    record('vertical keyboard behavior', 'the wrapper preserves UWindow vertical keyboard movement.');

    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.consoleWarnings, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.requestFailures, []);
    await page.screenshot({ path: path.join(evidence, 'tabs-window-protocols.png'), fullPage: true });
    report.targetSourceSha256After = await hashFiles(targetSources);
    report.protectedSourceSha256After = await hashFiles(protectedSources);
    assert.deepEqual(report.targetSourceSha256After, targetSourceSha256Before, 'target source hashes stayed stable during Chromium verification');
    assert.deepEqual(report.protectedSourceSha256After, protectedSourceSha256Before, 'protected shared files stayed unchanged during Chromium verification');
    report.protectedSourcesUnchanged = true;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(`tabs/window protocols: ${report.checks.length} groups passed`);
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
