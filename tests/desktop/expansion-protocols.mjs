import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/expansion-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UExpansionPanels.vue',
    'src/ui/UExpansionPanel.vue',
    'src/ui/UExpansionPanelTitle.vue',
    'src/ui/UExpansionPanelText.vue',
    'src/ui/expansion-state.ts',
    'src/ui/item-group-state.ts',
    'tests/desktop/expansion-protocols.mjs',
    'tests/tsconfig.expansion.json'
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
        <title>Expansion protocols</title>
        <style>
            html, body, #app { min-height: 0; margin: 0; }
            #app { padding: 20px; }
            main { display: grid; gap: 24px; width: min(100%, 900px); margin: 0 auto; }
            section.fixture { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--border); border-radius: 10px; }
            .controls { display: flex; flex-wrap: wrap; gap: 8px; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/expansion-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import ExpansionFixture from './ExpansionFixture.vue';
import '/src/ui/styles.css';

createApp(ExpansionFixture).use(createUI()).mount('#app');
`;

const fixtureVue = `<script setup>
import { defineComponent, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels } from '/src/ui/index.ts';

const state = reactive({
    single: 'single-b',
    singleUpdates: [],
    panelEvents: [],
    singleDisabled: true,
    singleAOff: false,
    singleReadonly: false,
    localReadonly: true,
    mandatory: 'mand-a',
    force: null,
    multiple: [{ id: 'a' }],
    index: 0,
    order: ['position-first', 'position-second'],
    outer: 'outer-a',
    nested: 'nested-a',
    lazyMounts: 0,
    lazyUnmounts: 0,
    eagerMounts: 0,
    eagerUnmounts: 0,
    inheritedPresentation: 'inherited'
});
const singleRef = ref();
const forcedRef = ref();
const multipleRef = ref();
const indexedRef = ref();
const outerRef = ref();
const nestedRef = ref();
const panelARef = ref();
const refs = { single: singleRef, forced: forcedRef, multiple: multipleRef, indexed: indexedRef, outer: outerRef, nested: nestedRef, panelA: panelARef };
const compareById = (left, right) => left?.id === right?.id;
const Probe = defineComponent({
    props: { kind: { type: String, required: true } },
    setup(props) {
        onMounted(() => { state[props.kind + 'Mounts']++; });
        onBeforeUnmount(() => { state[props.kind + 'Unmounts']++; });
        return () => h('span', { id: props.kind + '-probe' }, props.kind);
    }
});
window.__expansionProtocolProbe = { state, refs };
</script>

<template>
    <main>
        <section id="single-fixture" class="fixture">
            <output id="single-model">{{ state.single ?? 'null' }}</output>
            <output id="single-updates">{{ JSON.stringify(state.singleUpdates) }}</output>
            <output id="single-panel-events">{{ JSON.stringify(state.panelEvents) }}</output>
            <button id="external-single-b" type="button" @click="state.single = 'single-b'">Set B externally</button>
            <button id="external-single-c" type="button" @click="state.single = 'single-c'">Set C externally</button>
            <UExpansionPanels :ref="refs.single" v-model="state.single" :disabled="state.singleDisabled" :readonly="state.singleReadonly" selected-class="group-active" tag="section" @update:model-value="state.singleUpdates.push($event)">
                <template #default="scope">
                    <output id="single-group-raw">{{ scope.group.selected.value ?? 'null' }}</output>
                    <output id="single-selected-ref">{{ scope.selected.value ?? 'null' }}</output>
                    <output id="single-selected-values">{{ JSON.stringify(scope.selectedValues) }}</output>
                    <output id="single-selected-ids">{{ JSON.stringify(scope.selectedIds) }}</output>
                    <output id="single-id-selected">{{ String(scope.selectedIds.length > 0 && scope.isSelected(scope.selectedIds[0])) }}</output>
                    <output id="single-value-selected">{{ String(scope.group.isSelected('single-b')) }}</output>
                    <div class="controls">
                        <button id="single-next" type="button" @click="scope.next">Next</button>
                        <button id="single-prev" type="button" @click="scope.prev">Previous</button>
                        <button id="single-select-c" type="button" @click="scope.select('single-c')">Select C</button>
                        <button id="single-public-select-a" type="button">Public ref select A</button>
                        <button id="toggle-a-disabled" type="button" @click="state.singleAOff = !state.singleAOff">Toggle A disabled</button>
                    </div>
                    <UExpansionPanel :ref="refs.panelA" value="single-a" :disabled="state.singleAOff" selected-class="panel-active" @group:selected="state.panelEvents.push($event)">
                        <UExpansionPanelTitle id="single-title-a">Single A</UExpansionPanelTitle>
                    </UExpansionPanel>
                    <UExpansionPanel value="single-b" tag="article"><UExpansionPanelTitle>Single B</UExpansionPanelTitle></UExpansionPanel>
                    <UExpansionPanel value="single-c" title="Prop title C" text="Prop text C" />
                </template>
            </UExpansionPanels>
        </section>

        <section id="mandatory-fixture" class="fixture">
            <output id="mandatory-model">{{ state.mandatory ?? 'null' }}</output>
            <UExpansionPanels v-model="state.mandatory" mandatory>
                <UExpansionPanel value="mand-a"><UExpansionPanelTitle id="mandatory-title">Mandatory A</UExpansionPanelTitle></UExpansionPanel>
            </UExpansionPanels>
            <output id="force-model">{{ state.force ?? 'null' }}</output>
            <UExpansionPanels :ref="refs.forced" v-model="state.force" mandatory="force">
                <UExpansionPanel value="force-disabled" disabled><UExpansionPanelTitle>Disabled first</UExpansionPanelTitle></UExpansionPanel>
                <UExpansionPanel value="force-b"><UExpansionPanelTitle>Enabled second</UExpansionPanelTitle></UExpansionPanel>
            </UExpansionPanels>
        </section>

        <section id="uncontrolled-fixture" class="fixture">
            <UExpansionPanels>
                <template #default="scope">
                    <output id="uncontrolled-model">{{ scope.selected.value ?? 'null' }}</output>
                    <UExpansionPanel value="uncontrolled"><UExpansionPanelTitle id="uncontrolled-title">Uncontrolled panel</UExpansionPanelTitle></UExpansionPanel>
                </template>
            </UExpansionPanels>
        </section>

        <section id="mandatory-empty-fixture" class="fixture">
            <UExpansionPanels mandatory>
                <template #default="scope">
                    <output id="mandatory-empty-model">{{ scope.selected.value ?? 'null' }}</output>
                    <UExpansionPanel value="mandatory-empty"><UExpansionPanelTitle>Mandatory empty</UExpansionPanelTitle></UExpansionPanel>
                </template>
            </UExpansionPanels>
        </section>

        <section id="multiple-fixture" class="fixture">
            <output id="multiple-model">{{ JSON.stringify(state.multiple.map(item => item.id)) }}</output>
            <UExpansionPanels :ref="refs.multiple" v-model="state.multiple" multiple :max="2" :value-comparator="compareById">
                <UExpansionPanel :value="{ id: 'a' }"><UExpansionPanelTitle>Object A</UExpansionPanelTitle></UExpansionPanel>
                <UExpansionPanel :value="{ id: 'b' }"><UExpansionPanelTitle>Object B</UExpansionPanelTitle></UExpansionPanel>
                <UExpansionPanel :value="{ id: 'c' }"><UExpansionPanelTitle>Object C</UExpansionPanelTitle></UExpansionPanel>
            </UExpansionPanels>
        </section>

        <section id="position-fixture" class="fixture">
            <output id="position-model">{{ state.index }}</output>
            <button id="position-reorder" type="button" @click="state.order = [...state.order].reverse()">Reverse panels</button>
            <button id="position-remove-selected" type="button" @click="state.order = ['position-first']">Remove selected panel</button>
            <UExpansionPanels :ref="refs.indexed" v-model="state.index" mandatory="force">
                <template #default="scope">
                    <output id="position-selected-values">{{ JSON.stringify(scope.selectedValues) }}</output>
                    <UExpansionPanel v-for="name in state.order" :key="name">
                        <template #default="panelScope"><span :id="name" :data-index="panelScope.index" :data-open="panelScope.open">{{ name }} {{ panelScope.index }}</span></template>
                    </UExpansionPanel>
                </template>
            </UExpansionPanels>
        </section>

        <section id="readonly-fixture" class="fixture">
            <output id="readonly-model">{{ state.single }}</output>
            <button id="toggle-parent-readonly" type="button" @click="state.singleReadonly = !state.singleReadonly">Toggle parent readonly</button>
            <button id="toggle-disabled" type="button" @click="state.singleDisabled = !state.singleDisabled">Toggle disabled</button>
            <button id="toggle-local-readonly" type="button" @click="state.localReadonly = !state.localReadonly">Toggle panel readonly</button>
            <UExpansionPanels v-model="state.single" :readonly="state.singleReadonly" :disabled="state.singleDisabled">
                <UExpansionPanel value="readonly-a" :readonly="state.localReadonly"><UExpansionPanelTitle id="readonly-title">Readonly A</UExpansionPanelTitle></UExpansionPanel>
            </UExpansionPanels>
        </section>

        <section id="nested-fixture" class="fixture">
            <UExpansionPanels :ref="refs.outer" v-model="state.outer" mandatory="force">
                <template #default="scope">
                    <output id="outer-selected-count">{{ JSON.stringify(scope.selectedIds) }}</output>
                    <UExpansionPanel value="outer-a">
                    <UExpansionPanels :ref="refs.nested" v-model="state.nested" mandatory="force">
                            <template #default="nestedScope">
                                <output id="nested-selected-count">{{ JSON.stringify(nestedScope.selectedIds) }}</output>
                                <UExpansionPanel value="nested-a"><UExpansionPanelTitle>Nested A</UExpansionPanelTitle></UExpansionPanel>
                                <UExpansionPanel value="nested-b"><UExpansionPanelTitle>Nested B</UExpansionPanelTitle></UExpansionPanel>
                            </template>
                        </UExpansionPanels>
                    </UExpansionPanel>
                    <UExpansionPanel value="outer-b"><UExpansionPanelTitle>Outer B</UExpansionPanelTitle></UExpansionPanel>
                </template>
            </UExpansionPanels>
        </section>

        <section id="content-fixture" class="fixture">
            <output id="content-lifecycle">{{ state.lazyMounts }}/{{ state.lazyUnmounts }};{{ state.eagerMounts }}/{{ state.eagerUnmounts }}</output>
            <UExpansionPanels>
                <UExpansionPanel value="lazy" title="Lazy title">
                    <UExpansionPanelTitle>Lazy toggle</UExpansionPanelTitle>
                    <UExpansionPanelText><Probe kind="lazy" /></UExpansionPanelText>
                </UExpansionPanel>
                <UExpansionPanel value="eager" title="Eager title" eager>
                    <UExpansionPanelTitle>Eager toggle</UExpansionPanelTitle>
                    <UExpansionPanelText><Probe kind="eager" /></UExpansionPanelText>
                </UExpansionPanel>
                <UExpansionPanel value="slot" eager>
                    <template #title="scope"><span id="named-title-slot">Named title {{ scope.value }}</span></template>
                    <template #text="scope"><span id="named-text-slot">Named text {{ scope.value }}</span></template>
                </UExpansionPanel>
            </UExpansionPanels>
        </section>

        <section id="inherited-presentation-fixture" class="fixture">
            <UExpansionPanels v-model="state.inheritedPresentation" eager focusable static>
                <UExpansionPanel value="inherited" title="Inherited title" text="Inherited text" />
                <UExpansionPanel value="overridden" :eager="false" :focusable="false" :static="false" title="Overridden title" text="Overridden text" />
                <UExpansionPanel value="manual-inherited" focusable static>
                    <UExpansionPanelTitle id="manual-inherited-title">Manual inherited title</UExpansionPanelTitle>
                    <UExpansionPanelText id="manual-inherited-text">Manual inherited text</UExpansionPanelText>
                </UExpansionPanel>
                <UExpansionPanel value="manual-overridden" :focusable="false" :static="false" :eager="false">
                    <UExpansionPanelTitle id="manual-overridden-title">Manual overridden title</UExpansionPanelTitle>
                    <UExpansionPanelText id="manual-overridden-text">Manual overridden text</UExpansionPanelText>
                </UExpansionPanel>
            </UExpansionPanels>
            <output id="inherited-presentation-model">{{ state.inheritedPresentation }}</output>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'ExpansionFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__expansion-protocols';
const fixturePlugin = {
    name: 'expansion-protocol-fixture',
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
    configFile: path.resolve(root, 'vite.config.js'),
    plugins: [fixturePlugin],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
    appType: 'custom',
    logLevel: 'error'
});
let browser;
try {
    await server.listen();
    const address = server.httpServer.address();
    assert.ok(address && typeof address === 'object');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const runtimeIssues = [];
    page.on('pageerror', error => runtimeIssues.push(`pageerror: ${error.message}`));
    page.on('console', message => {
        if (message.type() === 'error' || message.type() === 'warning') runtimeIssues.push(`${message.type()}: ${message.text()}`);
    });

    await page.goto(`http://127.0.0.1:${address.port}${virtualRoute}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#force-model')?.textContent === 'force-b', null, { timeout: 10000 }).catch(async error => {
        throw new Error(`${error.message}; runtimeIssues=${JSON.stringify(runtimeIssues)}; body=${await page.locator('body').innerText()}`);
    });

    assert.equal(await page.locator('#force-model').textContent(), 'force-b', 'force selects the first enabled panel after registration');
    assert.equal(await page.locator('#mandatory-model').textContent(), 'mand-a', 'mandatory=true prevents canceling the final selected panel');
    assert.equal(await page.locator('#mandatory-empty-model').textContent(), 'null', 'mandatory=true does not initialize selection');
    assert.equal(await page.locator('#uncontrolled-model').textContent(), 'null', 'uncontrolled model retains the legacy null default');
    assert.equal(await page.locator('#single-group-raw').textContent(), 'single-b', 'legacy group slot keeps the raw model ref');
    assert.equal(await page.locator('#single-selected-ref').textContent(), 'single-b', 'top-level selected slot remains a Ref');
    assert.equal(await page.locator('#single-selected-values').textContent(), '["single-b"]');
    assert.equal(await page.locator('#single-id-selected').textContent(), 'true');
    assert.equal(await page.locator('#single-value-selected').textContent(), 'true');
    assert.ok(await page.locator('#single-selected-ids').evaluate(node => JSON.parse(node.textContent).length === 1));
    assert.equal(await page.locator('#single-fixture .u-expansion-panels').evaluate(node => node.tagName), 'SECTION', 'panels tag prop is consumed');

    await page.locator('#uncontrolled-title').click();
    assert.equal(await page.locator('#uncontrolled-model').textContent(), 'uncontrolled');
    await page.locator('#uncontrolled-title').click();
    assert.equal(await page.locator('#uncontrolled-model').textContent(), 'null', 'deselect writes null to the uncontrolled legacy model');

    await page.locator('#single-title-a').evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-b', 'disabled parent blocks a panel activation');
    await page.locator('#external-single-c').click();
    assert.equal(await page.locator('#single-model').textContent(), 'single-c', 'disabled parent preserves external model changes');
    await page.locator('#toggle-disabled').click();
    await page.locator('#single-title-a').evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-a', 'reactive disabled release permits activation');
    await page.waitForFunction(() => JSON.parse(document.querySelector('#single-panel-events')?.textContent ?? '[]').some(event => event.value === true));
    assert.ok(JSON.parse(await page.locator('#single-panel-events').textContent()).some(event => event.value === true), 'group:selected emits a state payload when selected');
    assert.equal(await page.evaluate(() => window.__expansionProtocolProbe.refs.panelA.value.selected), true, 'panel ref exposes selected');
    assert.ok(await page.evaluate(() => typeof window.__expansionProtocolProbe.refs.panelA.value.groupItem.id === 'string'), 'panel ref exposes groupItem');
    assert.ok(await page.locator('#single-title-a').evaluate(node => node.closest('.u-expansion-panel').classList.contains('panel-active')), 'panel selectedClass is consumed');
    assert.ok(JSON.parse(await page.locator('#single-updates').textContent()).includes('single-a'), 'model update events carry selected public values');
    await page.locator('#toggle-a-disabled').click();
    await page.locator('#single-title-a').evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-a', 'reactive item disabled blocks activation');
    await page.locator('#toggle-a-disabled').click();

    await page.locator('#single-next').click();
    assert.equal(await page.locator('#single-model').textContent(), 'single-b', 'next uses live registration order');
    await page.waitForFunction(() => JSON.parse(document.querySelector('#single-panel-events')?.textContent ?? '[]').some(event => event.value === false));
    assert.ok(JSON.parse(await page.locator('#single-panel-events').textContent()).some(event => event.value === false), 'group:selected emits a state payload when deselected');
    assert.ok(await page.locator('#single-title-a').evaluate(node => !node.closest('.u-expansion-panel').classList.contains('panel-active')));
    assert.ok(await page.locator('#single-fixture article.u-expansion-panel').evaluate(node => node.classList.contains('group-active')), 'group selectedClass applies when a panel has no override');
    assert.equal(await page.locator('#single-fixture article.u-expansion-panel').count(), 1, 'panel tag prop is consumed');
    await page.locator('#single-prev').click();
    assert.equal(await page.locator('#single-model').textContent(), 'single-a');
    await page.locator('#single-select-c').click();
    assert.equal(await page.locator('#single-model').textContent(), 'single-c', 'slot select resolves public values');
    await page.evaluate(() => window.__expansionProtocolProbe.refs.single.value.select('single-a'));
    assert.equal(await page.locator('#single-model').textContent(), 'single-a', 'ref select resolves public values');

    await page.getByRole('button', { name: 'Prop title C' }).evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-c');
    assert.equal(await page.getByText('Prop text C').count(), 1);
    const region = page.getByRole('region').first();
    assert.ok(await region.getAttribute('aria-labelledby'));
    assert.ok(await page.getByRole('button', { name: 'Prop title C' }).getAttribute('aria-controls'));
    await page.getByRole('button', { name: 'Prop title C' }).click();
    await page.locator('#external-single-b').click();
    await page.locator('#toggle-disabled').click();
    await page.locator('#single-title-a').evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-b', 'disabled state blocks activation while external changes remain accepted');
    await page.locator('#external-single-c').click();
    assert.equal(await page.locator('#single-model').textContent(), 'single-c');
    await page.locator('#toggle-disabled').click();
    await page.locator('#single-title-a').click();
    assert.equal(await page.locator('#single-model').textContent(), 'single-a');

    await page.locator('#mandatory-title').click();
    assert.equal(await page.locator('#mandatory-model').textContent(), 'mand-a');
    await page.locator('#multiple-fixture button').filter({ hasText: 'Object B' }).click();
    assert.equal(await page.locator('#multiple-model').textContent(), '["a","b"]', 'comparator matches object values');
    await page.locator('#multiple-fixture button').filter({ hasText: 'Object C' }).click();
    assert.equal(await page.locator('#multiple-model').textContent(), '["a","b"]', 'max prevents adding a third value');
    await page.locator('#multiple-fixture button').filter({ hasText: 'Object A' }).click();
    assert.equal(await page.locator('#multiple-model').textContent(), '["b"]', 'multiple group can remove values');

    await page.locator('#position-reorder').click();
    await page.waitForFunction(() => document.querySelector('#position-second')?.getAttribute('data-index') === '0');
    assert.equal(await page.locator('#position-selected-values').textContent(), '[0]', 'undefined values use the current numeric position');
    assert.equal(await page.locator('#position-second').getAttribute('data-open'), 'true', 'keyed reorder updates selected item position without stale IDs');
    assert.equal(await page.locator('#position-first').getAttribute('data-open'), 'false');
    await page.locator('#position-remove-selected').click();
    assert.equal(await page.locator('#position-first').getAttribute('data-open'), 'true', 'removing a selected indexed item follows the remaining live position');

    await page.locator('#external-single-b').click();
    await page.locator('#toggle-parent-readonly').click();
    await page.getByRole('button', { name: 'Prop title C' }).evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-b', 'parent readonly blocks activation');
    await page.locator('#toggle-parent-readonly').click();
    await page.locator('#readonly-title').evaluate(button => button.click());
    assert.equal(await page.locator('#single-model').textContent(), 'single-b', 'panel readonly blocks activation');
    await page.locator('#toggle-local-readonly').click();
    await page.locator('#readonly-title').click();
    assert.equal(await page.locator('#single-model').textContent(), 'readonly-a', 'clearing local readonly restores activation');

    assert.equal(await page.locator('#outer-selected-count').evaluate(node => JSON.parse(node.textContent).length), 1, 'outer group ignores nested panel registrations');
    assert.equal(await page.locator('#nested-selected-count').evaluate(node => JSON.parse(node.textContent).length), 1, 'nested group has independent registration state');
    assert.equal(await page.locator('#named-title-slot').count(), 1, 'panel title named slot is rendered');
    assert.equal(await page.locator('#named-text-slot').count(), 1, 'panel text named slot is rendered');
    assert.equal(await page.getByRole('button', { name: 'Prop title C' }).count(), 1);

    const inheritedTitle = page.getByRole('button', { name: 'Inherited title', exact: true });
    assert.ok(await inheritedTitle.evaluate(node => node.classList.contains('is-focusable')), 'group focusable setting reaches an autogenerated title');
    assert.ok(await inheritedTitle.evaluate(node => node.classList.contains('is-static')), 'group static setting reaches an autogenerated title');
    assert.equal(await page.getByText('Inherited text', { exact: true }).count(), 1, 'group eager keeps a closed text body mounted');
    const overriddenTitle = page.getByRole('button', { name: 'Overridden title', exact: true });
    assert.ok(await overriddenTitle.evaluate(node => !node.classList.contains('is-focusable') && !node.classList.contains('is-static')), 'panel false values override group presentation settings');
    assert.equal(await page.getByText('Overridden text', { exact: true }).count(), 0, 'panel eager=false overrides group eager');
    assert.ok(await page.locator('#manual-inherited-title').evaluate(node => node.classList.contains('is-focusable') && node.classList.contains('is-static')), 'handwritten title consumes inherited panel context');
    assert.equal(await page.getByText('Manual inherited text', { exact: true }).count(), 1, 'handwritten text consumes inherited eager context');
    assert.ok(await page.locator('#manual-overridden-title').evaluate(node => !node.classList.contains('is-focusable') && !node.classList.contains('is-static')), 'panel presentation overrides reach handwritten title');
    assert.equal(await page.getByText('Manual overridden text', { exact: true }).count(), 0, 'panel eager override reaches handwritten text');

    await page.getByRole('button', { name: 'Lazy toggle' }).click();
    assert.equal(await page.locator('#lazy-probe').count(), 1, 'lazy panel mounts content when opened');
    await page.getByRole('button', { name: 'Lazy toggle' }).click();
    await page.waitForFunction(() => window.__expansionProtocolProbe.state.lazyUnmounts === 1, null, { timeout: 3000 });
    assert.equal(await page.locator('#lazy-probe').count(), 0, 'lazy panel unmounts content after leave');
    await page.getByRole('button', { name: 'Eager toggle' }).click();
    assert.equal(await page.locator('#eager-probe').count(), 1, 'eager panel mounts content when opened');
    await page.getByRole('button', { name: 'Eager toggle' }).click();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#eager-probe').count(), 1, 'eager panel keeps content mounted after leave');

    const motionPage = await browser.newPage({ reducedMotion: 'no-preference' });
    motionPage.on('pageerror', error => runtimeIssues.push(`motion pageerror: ${error.message}`));
    motionPage.on('console', message => {
        if (message.type() === 'error' || message.type() === 'warning') runtimeIssues.push(`motion ${message.type()}: ${message.text()}`);
    });
    await motionPage.goto(`http://127.0.0.1:${address.port}${virtualRoute}`, { waitUntil: 'networkidle' });
    await motionPage.getByRole('button', { name: 'Lazy toggle' }).click();
    await motionPage.locator('#lazy-probe').waitFor();
    await motionPage.getByRole('button', { name: 'Lazy toggle' }).evaluate(button => {
        button.click();
        setTimeout(() => button.click(), 25);
    });
    await motionPage.waitForTimeout(400);
    assert.equal(await motionPage.locator('#lazy-probe').count(), 1, 'reopening during leave preserves the new content instance');
    assert.equal(await motionPage.locator('#content-lifecycle').textContent(), '1/0;1/0', 'cancelled leave does not unmount reopened lazy content');
    await motionPage.close();
    assert.deepEqual(runtimeIssues, [], 'public component entry has no Vue warnings or runtime errors');

    await writeFile(path.join(evidence, 'result.json'), `${JSON.stringify({
        result: 'passed',
        sourceSha256,
        assertions: [
            'mandatory versus force semantics', 'legacy selected/ref slot contract', 'object comparator and max',
            'keyed reorder and position values', 'parent disabled/readonly and panel readonly',
            'public next/prev/select refs and slots', 'nested group isolation', 'title/text props and named slots',
            'group:selected state payload', 'group/panel eager, focusable and static inheritance with local overrides',
            'ARIA region/title relation', 'lazy and eager content lifecycle', 'no Vue warnings/errors'
        ],
        runtimeIssues
    }, null, 2)}\n`, 'utf8');
} finally {
    await browser?.close();
    await server.close();
}
