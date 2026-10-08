import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/treeview-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UTreeview.vue',
    'src/ui/nested-strategies.ts',
    'src/ui/treeview-state.ts',
    'tests/nested-strategies.test.ts',
    'tests/treeview-state.test.ts',
    'tests/desktop/treeview-protocols.mjs',
    'tests/tsconfig.treeview.json'
];

const sourceSha256 = Object.fromEntries(await Promise.all(productSources.map(async (file) => [
    file,
    createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
])));

const html = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>UTreeview protocol fixture</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/treeview-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import TreeviewFixture from './TreeviewFixture.vue';
import '/src/ui/styles.css';

createApp(TreeviewFixture).use(createUI()).mount('#app');
`;

const fixtureVue = `<script setup>
import { reactive, ref } from 'vue';
import { ULocaleProvider, UTreeview } from '/src/ui/index.ts';

const state = reactive({
    defaultModel: ['branch'],
    defaultSelected: ['leaf-a'],
    defaultOpened: [],
    defaultModelUpdates: [],
    defaultSelectedUpdates: [],
    openedUpdates: [],
    legacySelected: [],
    branchSelected: [],
    pathOpened: [],
    pathSelected: [],
    keyboardOpened: [],
    rtlOpened: ['rtl-root'],
    returnSelected: [{ key: 'object-leaf' }],
    returnUpdates: [],
    activationUpdates: [],
    defaultActivationUpdates: [],
    readonlySelected: [],
    search: '',
    lazyOpened: [],
    lazyItems: [
        { key: 'returned', label: 'Returned', nodes: [] },
        { key: 'mutated', label: 'Mutated', nodes: [] },
        { key: 'stale', label: 'Stale', nodes: [] },
        { key: 'error', label: 'Error', nodes: [] },
        { key: 'unmount', label: 'Unmount', nodes: [] }
    ],
    staleResolve: undefined,
    unmountResolve: undefined,
    showLazy: true
});

const refs = { defaultTree: ref(), lazyTree: ref() };
const treeItems = [
    { value: 'branch', title: 'Branch', children: [
        { value: 'leaf-a', title: 'Leaf A' },
        { value: 'leaf-b', title: 'Leaf B' }
    ] }
];
const pathItems = [
    { value: 'outer', title: 'Outer', children: [
        { value: 'inner', title: 'Inner', children: [{ value: 'deep-leaf', title: 'Deep leaf' }] }
    ] }
];
const activationItems = [{ value: 'activation-leaf', title: 'Activation leaf' }];
const selectorItems = [
    { key: 'root', meta: { label: 'Selector root' }, ui: {}, nodes: [
        { key: 'blocked', meta: { label: 'Blocked node' }, ui: { disabled: true } },
        { key: 'allowed', meta: { label: 'Allowed node' }, ui: {} }
    ] }
];
const objectItems = [
    { key: 'object-leaf', title: 'Object leaf' },
    { key: 'object-other', title: 'Object other' }
];
const searchItems = [
    { key: 'search-root', meta: { label: 'Root folder' }, nodes: [
        { key: 'search-group', meta: { label: 'Group folder' }, nodes: [
            { key: 'needle', meta: { label: 'Find this needle' } },
            { key: 'quiet', meta: { label: 'Quiet row' } }
        ] },
        { key: 'other', meta: { label: 'Unrelated row' } }
    ] }
];
const treeFilter = (value, query) => String(value ?? '').toLocaleLowerCase().includes(query.toLocaleLowerCase());
const sameByKey = (left, right) => left?.key === right?.key;
const getNodes = (item) => item.nodes;
const getUIProps = (item) => item.ui;
const returnedChild = { key: 'returned-child', label: 'Returned child' };
const mutatedChild = { key: 'mutated-child', label: 'Mutated child' };

function loadChildren(item) {
    if (item.key === 'returned') return Promise.resolve([returnedChild]);
    if (item.key === 'mutated') return Promise.resolve().then(() => { item.nodes.push(mutatedChild); });
    if (item.key === 'stale') return new Promise((resolve) => { state.staleResolve = resolve; });
    if (item.key === 'error') return Promise.reject(new Error('lazy load failed'));
    if (item.key === 'unmount') return new Promise((resolve) => { state.unmountResolve = resolve; });
    return Promise.resolve([]);
}

window.treeProbe = { state, refs };
</script>

<template>
    <main>
        <section id="default-fixture">
            <output id="default-state">{{ JSON.stringify({ selected: state.defaultSelected, opened: state.defaultOpened }) }}</output>
            <UTreeview
                id="default-tree"
                :ref="refs.defaultTree"
                :items="treeItems"
                selectable
                :model-value="state.defaultModel"
                :selected="state.defaultSelected"
                :opened="state.defaultOpened"
                @update:modelValue="state.defaultModelUpdates.push($event)"
                @update:selected="(state.defaultSelected = $event, state.defaultSelectedUpdates.push($event))"
                @update:opened="(state.defaultOpened = $event, state.openedUpdates.push($event))"
            />
        </section>
        <section id="legacy-fixture">
            <UTreeview :items="treeItems" selectable multiple :selected="state.legacySelected" @update:selected="state.legacySelected = $event" />
        </section>
        <section id="open-false-fixture">
            <UTreeview :items="treeItems" selectable :open-on-click="false" />
        </section>
        <section id="branch-fixture">
            <UTreeview :items="treeItems" selectable select-strategy="branch" :selected="state.branchSelected" @update:selected="state.branchSelected = $event" />
        </section>
        <section id="path-fixture">
            <UTreeview :ref="refs.defaultTree" :items="pathItems" selectable :opened="state.pathOpened" :selected="state.pathSelected" @update:opened="state.pathOpened = $event" @update:selected="state.pathSelected = $event" />
        </section>
        <section id="selector-fixture">
            <UTreeview :items="selectorItems" item-title="meta.label" item-value="key" :item-children="getNodes" :item-props="getUIProps" selectable />
        </section>
        <section id="return-fixture">
            <UTreeview :items="objectItems" selectable return-object :value-comparator="sameByKey" :selected="state.returnSelected" @update:selected="(state.returnSelected = $event, state.returnUpdates.push($event))" />
        </section>
        <section id="activation-default-fixture">
            <UTreeview :items="activationItems" @update:activated="state.defaultActivationUpdates.push($event)" />
        </section>
        <section id="activation-fixture">
            <UTreeview :items="activationItems" activatable :activated="'activation-leaf'" @update:activated="state.activationUpdates.push($event)" />
        </section>
        <section id="readonly-fixture">
            <UTreeview :items="activationItems" selectable readonly :selected="state.readonlySelected" @update:selected="state.readonlySelected = $event" />
        </section>
        <section id="disabled-fixture">
            <UTreeview :items="activationItems" selectable disabled />
        </section>
        <section id="search-fixture">
            <UTreeview :items="searchItems" item-title="meta.label" item-value="key" item-children="nodes" :search="state.search" :filter-keys="['meta.label']" :custom-filter="treeFilter" />
        </section>
        <section id="keyboard-fixture">
            <UTreeview :items="[{ value: 'first', title: 'First', children: [{ value: 'first-child', title: 'First child' }] }, { value: 'second', title: 'Second', children: [{ value: 'second-child', title: 'Second child' }] }, { value: 'blocked-root', title: 'Blocked root', disabled: true, children: [{ value: 'blocked-child', title: 'Blocked child' }] } ]" :opened="state.keyboardOpened" @update:opened="state.keyboardOpened = $event" />
        </section>
        <section id="rtl-fixture">
            <ULocaleProvider locale="ar">
                <UTreeview :items="[{ value: 'rtl-root', title: 'RTL root', children: [{ value: 'rtl-child', title: 'RTL child' }] }]" :opened="state.rtlOpened" @update:opened="state.rtlOpened = $event" />
            </ULocaleProvider>
        </section>
        <section id="lazy-fixture" v-if="state.showLazy">
            <UTreeview
                id="lazy-tree"
                :ref="refs.lazyTree"
                :items="state.lazyItems"
                item-title="label"
                item-value="key"
                item-children="nodes"
                :load-children="loadChildren"
                :opened="state.lazyOpened"
                @update:opened="state.lazyOpened = $event"
            >
                <template #title="{ title, loading, error }">
                    <span :data-loading="loading ? 'true' : 'false'">{{ title }}</span>
                    <output v-if="error" class="tree-load-error">{{ error.message ?? error }}</output>
                </template>
            </UTreeview>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'TreeviewFixture.vue'), fixtureVue, 'utf8');

const route = '/__treeview_protocols';
const fixturePlugin = {
    name: 'treeview-protocols-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== route) { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await viteServer.transformIndexHtml(route, html));
        });
    }
};

const vite = await createServer({
    root,
    appType: 'custom',
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'error',
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/component-audit-root/treeview-protocols/fixture/main.ts'],
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
    fixture: 'treeview-protocols',
    method: 'Vite fixture imports the real public UTreeview and ULocaleProvider through src/ui/index.ts and exercises the source in Chromium.',
    sourceSha256,
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    limits: [
        'Chromium browser renderer only; no Electron renderer acceptance is claimed.',
        'No full project build, full test suite, or visual design acceptance was run.',
        'The fixture validates local source through the public entry; it does not validate the compiled package bundle.'
    ]
};
const browserErrors = [];
const consoleErrors = [];
const consoleWarnings = [];
let browser;

function passed(name, details) {
    report.checks.push({ name, details });
}

async function settle(page) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.on('pageerror', (error) => browserErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) consoleWarnings.push(message.text());
    });

    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}${route}`);
    await page.waitForSelector('#default-tree .ui-treeview-item');

    const defaultTree = page.locator('#default-tree');
    assert.equal(await defaultTree.getAttribute('aria-multiselectable'), 'false');
    assert.equal(await defaultTree.locator('.ui-treeview-item').filter({ hasText: 'Leaf B' }).count(), 0, 'the selected alias alone controls the model, and unopened descendants stay hidden');
    await defaultTree.locator('.ui-treeview-item').filter({ hasText: 'Branch' }).click();
    await page.waitForFunction(() => window.treeProbe.state.defaultOpened.includes('branch'));
    assert.equal(await defaultTree.locator('.ui-treeview-item').filter({ hasText: 'Leaf B' }).count(), 1);
    assert.equal(await defaultTree.locator('.ui-treeview-item').filter({ hasText: 'Leaf A' }).locator('input[type="checkbox"]').isChecked(), true);
    await defaultTree.locator('.ui-treeview-item').filter({ hasText: 'Leaf B' }).locator('input[type="checkbox"]').check();
    await page.waitForFunction(() => window.treeProbe.state.defaultSelected[0] === 'leaf-b');
    assert.deepEqual(await page.evaluate(() => window.treeProbe.state.defaultModelUpdates.at(-1)), ['leaf-b']);
    assert.deepEqual(await page.evaluate(() => window.treeProbe.state.defaultSelectedUpdates.at(-1)), ['leaf-b']);
    const explicitOpenFalse = page.locator('#open-false-fixture .ui-treeview');
    await explicitOpenFalse.locator('.ui-treeview-item').click();
    assert.equal(await explicitOpenFalse.locator('.ui-treeview-item').getAttribute('aria-expanded'), 'false');
    passed('single-leaf defaults, openOnClick inference, and selected alias priority', 'The tree defaults to a single-leaf strategy, selectable branches open on click, selected wins over modelValue, and selection emits both array aliases.');

    await page.evaluate(() => window.treeProbe.refs.defaultTree.value.open('inner'));
    await page.waitForFunction(() => window.treeProbe.state.pathOpened.includes('outer'));
    assert.deepEqual((await page.evaluate(() => window.treeProbe.state.pathOpened)).sort(), ['inner', 'outer']);
    await page.evaluate(() => window.treeProbe.refs.defaultTree.value.focus('deep-leaf'));
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.includes('Deep leaf')), true);
    await page.evaluate(() => window.treeProbe.refs.defaultTree.value.select('deep-leaf'));
    await page.waitForFunction(() => window.treeProbe.state.pathSelected[0] === 'deep-leaf');
    passed('multiple open strategy adds ancestors', 'The public ref open method emits the opened item and its ancestor path through update:opened.');

    const legacy = page.locator('#legacy-fixture .ui-treeview');
    await legacy.locator('.ui-treeview-item').filter({ hasText: 'Branch' }).locator('input[type="checkbox"]').check();
    await page.waitForFunction(() => window.treeProbe.state.legacySelected.length === 3);
    assert.deepEqual((await page.evaluate(() => window.treeProbe.state.legacySelected)).sort(), ['branch', 'leaf-a', 'leaf-b']);
    passed('legacy multiple cascade compatibility', 'multiple=true without an explicit strategy retains the legacy all-selected-id array output.');

    const branch = page.locator('#branch-fixture .ui-treeview');
    await branch.locator('.ui-treeview-item').filter({ hasText: 'Branch' }).click();
    await branch.locator('.ui-treeview-item').filter({ hasText: 'Leaf A' }).locator('input[type="checkbox"]').check();
    await page.waitForFunction(() => window.treeProbe.state.branchSelected.length >= 1);
    assert.deepEqual((await page.evaluate(() => window.treeProbe.state.branchSelected)).sort(), ['branch', 'leaf-a']);
    assert.equal(await branch.locator('.ui-treeview-item').filter({ hasText: 'Branch' }).locator('input').evaluate((input) => input.indeterminate), true);
    passed('branch strategy and mixed state', 'Explicit branch strategy returns its selected leaf plus its indeterminate branch ancestor.');

    const selector = page.locator('#selector-fixture .ui-treeview');
    await selector.locator('.ui-treeview-item').filter({ hasText: 'Selector root' }).click();
    const blocked = selector.locator('.ui-treeview-item').filter({ hasText: 'Blocked node' });
    assert.equal(await blocked.getAttribute('aria-disabled'), 'true');
    assert.equal(await blocked.getAttribute('tabindex'), '-1');
    assert.equal(await blocked.locator('input').isDisabled(), true);
    assert.equal(await selector.locator('.ui-treeview-item').filter({ hasText: 'Allowed node' }).count(), 1);
    passed('custom item selectors and itemProps disabled', 'Function itemProps, dotted itemTitle, itemValue and itemChildren selectors are consumed; disabled items keep DOM/ARIA state and cannot be focused or selected.');

    const returnTree = page.locator('#return-fixture .ui-treeview');
    assert.equal(await returnTree.locator('.ui-treeview-item').filter({ hasText: 'Object leaf' }).locator('input').isChecked(), true);
    await returnTree.locator('.ui-treeview-item').filter({ hasText: 'Object other' }).locator('input').check();
    await page.waitForFunction(() => window.treeProbe.state.returnSelected[0]?.key === 'object-other');
    assert.equal(await page.evaluate(() => window.treeProbe.state.returnUpdates.at(-1)[0].title), 'Object other');
    passed('returnObject and custom valueComparator', 'A comparator matches cloned model objects by key, and emitted selected arrays contain the original item objects.');

    await page.locator('#activation-default-fixture .ui-treeview-item').filter({ hasText: 'Activation leaf' }).click();
    assert.deepEqual(await page.evaluate(() => window.treeProbe.state.defaultActivationUpdates), []);
    await page.locator('#activation-fixture .ui-treeview-item').filter({ hasText: 'Activation leaf' }).click();
    assert.deepEqual(await page.evaluate(() => window.treeProbe.state.activationUpdates.at(-1)), ['activation-leaf']);
    assert.equal(await page.locator('#activation-fixture .ui-treeview-item').evaluate((row) => row.classList.contains('is-active')), true, 'legacy scalar activated input remains readable');
    passed('activated is opt-in and emits arrays', 'activatable defaults false with no activation event; enabling it emits a one-item array.');

    const readonlyTree = page.locator('#readonly-fixture .ui-treeview');
    assert.equal(await readonlyTree.locator('input').isDisabled(), true);
    await readonlyTree.locator('.ui-treeview-item').click();
    assert.deepEqual(await page.evaluate(() => window.treeProbe.state.readonlySelected), []);
    const disabledTree = page.locator('#disabled-fixture .ui-treeview');
    assert.equal(await disabledTree.locator('.ui-treeview-item').getAttribute('aria-disabled'), 'true');
    assert.equal(await disabledTree.locator('input').isDisabled(), true);
    passed('disabled and readonly guards', 'Top-level disabled removes row interaction; readonly keeps the row but blocks selection.');

    await page.evaluate(() => { window.treeProbe.state.search = 'needle'; });
    const searchTree = page.locator('#search-fixture .ui-treeview');
    await page.waitForFunction(() => document.querySelectorAll('#search-fixture [role="treeitem"]').length === 3);
    assert.equal(await searchTree.locator('.ui-treeview-item').filter({ hasText: 'Find this needle' }).count(), 1);
    assert.equal(await searchTree.locator('.ui-treeview-item').filter({ hasText: 'Unrelated row' }).count(), 0);
    await page.evaluate(() => { window.treeProbe.state.search = ''; });
    await page.waitForFunction(() => document.querySelectorAll('#search-fixture [role="treeitem"]').length === 1);
    passed('search filterKeys and customFilter', 'Custom filtering uses the selected nested key and reveals matching descendants with their ancestor path.');

    const keyboardTree = page.locator('#keyboard-fixture .ui-treeview');
    const firstRow = keyboardTree.locator('.ui-treeview-item').filter({ hasText: 'First' }).first();
    await firstRow.focus();
    await page.keyboard.press('*');
    assert.equal(await keyboardTree.locator('.ui-treeview-item[data-treeview-index="2"]').getAttribute('aria-expanded'), 'true');
    assert.equal(await keyboardTree.locator('.ui-treeview-item[data-treeview-index="4"]').getAttribute('aria-expanded'), 'false');
    await firstRow.focus();
    await page.keyboard.press('End');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.includes('Second child')), true);
    passed('keyboard sibling expansion and disabled navigation', '* expands every enabled sibling branch and End focuses the last enabled rendered treeitem.');

    const rtlTree = page.locator('#rtl-fixture [role="tree"]');
    const rtlRoot = rtlTree.locator('.ui-treeview-item').filter({ hasText: 'RTL root' });
    await rtlRoot.focus();
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.includes('RTL child')), true);
    await rtlRoot.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await rtlRoot.getAttribute('aria-expanded'), 'false');
    passed('locale-aware RTL keyboard model', 'Arabic locale reverses horizontal expand/focus and collapse behavior.');

    await page.evaluate(() => window.treeProbe.refs.lazyTree.value.open('returned'));
    const lazyTree = page.locator('#lazy-tree');
    await page.waitForSelector('#lazy-tree .ui-treeview-item:has-text("Returned child")');
    await page.evaluate(() => window.treeProbe.refs.lazyTree.value.open('mutated'));
    await page.waitForSelector('#lazy-tree .ui-treeview-item:has-text("Mutated child")');
    passed('lazy loader return and mutation protocols', 'Returned child arrays and in-place item.children mutation both rebuild the public tree.');

    await page.evaluate(() => window.treeProbe.refs.lazyTree.value.open('error'));
    await page.waitForSelector('#lazy-tree .tree-load-error');
    assert.equal(await page.locator('#lazy-tree .tree-load-error').textContent(), 'lazy load failed');
    passed('lazy errors reach the title slot', 'Rejected loadChildren calls clear pending state and expose the error to the existing title slot scope.');

    await page.evaluate(() => window.treeProbe.refs.lazyTree.value.open('stale'));
    await page.waitForFunction(() => document.querySelector('#lazy-tree [role="treeitem"] [data-loading="true"]'));
    await page.evaluate(() => { window.treeProbe.state.lazyItems = [{ key: 'stale', label: 'Replacement', nodes: [] }]; });
    await page.waitForFunction(() => !document.querySelector('#lazy-tree [aria-busy="true"]'));
    await page.evaluate(() => window.treeProbe.state.staleResolve([{ key: 'obsolete-child', label: 'Obsolete child' }]));
    await settle(page);
    assert.equal(await page.locator('#lazy-tree').getByText('Obsolete child').count(), 0);
    passed('stale lazy response invalidation', 'Replacing an item with the same key invalidates the in-flight result and clears the pending marker.');

    await page.evaluate(() => window.treeProbe.state.lazyItems = [{ key: 'unmount', label: 'Unmount', nodes: [] }]);
    await page.evaluate(() => window.treeProbe.refs.lazyTree.value.open('unmount'));
    await page.waitForFunction(() => !!window.treeProbe.state.unmountResolve);
    await page.evaluate(() => { window.treeProbe.state.showLazy = false; });
    await page.evaluate(() => window.treeProbe.state.unmountResolve([{ key: 'after-unmount', label: 'After unmount' }]));
    await settle(page);
    assert.deepEqual(browserErrors, []);
    passed('unmount lazy cleanup', 'Unmounting with a pending lazy request does not apply its result or produce a browser error.');

    report.pageErrors = browserErrors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    assert.deepEqual(browserErrors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(consoleWarnings, []);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 4));
    process.stdout.write(`treeview protocols: ${report.checks.length} checks passed\n`);
} catch (error) {
    report.pageErrors = browserErrors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    report.failure = error instanceof Error ? { message: error.message, stack: error.stack } : String(error);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 4));
    throw error;
} finally {
    await browser?.close();
    await vite.close();
}
