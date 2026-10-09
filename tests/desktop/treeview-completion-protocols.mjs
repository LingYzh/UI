import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/treeview-completion-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UTreeview.vue',
    'src/ui/treeview-state.ts',
    'tests/treeview-state.test.ts',
    'tests/desktop/treeview-completion-protocols.mjs',
    'tests/tsconfig.treeview-completion.json'
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
        <title>UTreeview completion protocols</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/treeview-completion-protocols/fixture/main.ts"></script>
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
import { reactive } from 'vue';
import { UTreeview } from '/src/ui/index.ts';

const state = reactive({
    search: 'needle',
    mode: 'union',
    customKeyItems: [],
    customFilterItems: [],
    accentQuery: 'eclair',
    accentSide: 'target',
    openEvents: [],
    selectEvents: [],
    selected: [],
    openAllItems: [
        { id: 'auto-root', title: 'Auto root', children: [{ id: 'auto-child', title: 'Auto child' }] }
    ],
    openAllLoaderCalls: [],
    openAllLoaderResolve: undefined,
    loaderResolve: undefined,
    loaderCalls: [],
    readonlySelectionEvents: 0,
    disabledOpenEvents: 0,
    noFilterSearch: 'absent'
});

const filterItems = [{
    id: 'filter-root',
    title: 'Filter root',
    children: [
        { id: 'needle-row', title: 'Needle row', code: 1 },
        { id: 'accent-row', title: 'Accent row', code: 2 },
        { id: 'quiet-row', title: 'Quiet row', code: 3 }
    ]
}];
const pathItems = [{
    id: 'path-root',
    title: 'Path root',
    children: [{ id: 'path-group', title: 'Path group', children: [{ id: 'path-leaf', title: 'Path leaf' }] }]
}];
const accentItems = [{
    id: 'accent-root',
    title: 'Accent root',
    children: [
        { id: 'accented-target', title: 'Éclair' },
        { id: 'plain-target', title: 'Eclair' }
    ]
}];
const typeItems = [
    { id: 'type-head', title: 'Type heading', type: 'subheader' },
    { id: 'type-divider', type: 'divider' },
    { id: 'type-item', title: 'Type item' }
];
const loadItems = [{ id: 'lazy-root', title: 'Lazy root', children: [] }];
const openAllLazyItems = [{ id: 'open-all-lazy-root', title: 'Open all lazy root', children: [] }];

function filterKey(value, query, item) {
    state.customKeyItems.push({ value, query, id: item.id });
    return item.id === 'accent-row';
}

function customFilter(value, query, item) {
    state.customFilterItems.push({ value, query, id: item.id });
    return item.id === 'needle-row' ? [[0, 3]] : [];
}

function loadChildren(item) {
    state.loaderCalls.push(item.id);
    return new Promise((resolve) => { state.loaderResolve = resolve; });
}

function loadOpenAllChildren(item) {
    state.openAllLoaderCalls.push(item.id);
    return new Promise((resolve) => { state.openAllLoaderResolve = resolve; });
}

function recordOpen(payload) {
    state.openEvents.push({ id: payload.id, value: payload.value, path: payload.path, eventType: payload.event?.type });
}

function recordSelect(payload) {
    state.selectEvents.push({ id: payload.id, value: payload.value, path: payload.path, eventType: payload.event?.type });
}

window.treeviewCompletion = { state };
</script>

<template>
    <main>
        <section id="empty-fixture">
            <UTreeview id="empty-tree" />
        </section>
        <section id="filter-fixture">
            <UTreeview
                :items="filterItems"
                item-value="id"
                :search="state.search"
                :filter-keys="['title', 'code']"
                :custom-key-filter="{ code: filterKey }"
                :custom-filter="customFilter"
                :filter-mode="state.mode"
                @click:open="recordOpen"
                @click:select="recordSelect"
            >
                <template #title="{ item, title }">
                    <span :data-filter-id="item.id">{{ title }}</span>
                </template>
            </UTreeview>
        </section>
        <section id="accent-fixture">
            <UTreeview
                :items="accentItems"
                item-value="id"
                :search="state.accentQuery"
                filter-keys="title"
                :ignore-accents="state.accentSide"
            >
                <template #title="{ item, title }"><span :data-accent-id="item.id">{{ title }}</span></template>
            </UTreeview>
        </section>
        <section id="no-filter-fixture">
            <UTreeview :items="filterItems" item-value="id" :search="state.noFilterSearch" no-filter>
                <template #title="{ item, title }"><span :data-no-filter-id="item.id">{{ title }}</span></template>
            </UTreeview>
        </section>
        <section id="open-all-fixture">
            <UTreeview :items="state.openAllItems" item-value="id" open-all>
                <template #title="{ item, title }"><span :data-open-all-id="item.id">{{ title }}</span></template>
            </UTreeview>
            <UTreeview :items="state.openAllItems" item-value="id" open-all :opened="[]">
                <template #title="{ item, title }"><span :data-controlled-open-id="item.id">{{ title }}</span></template>
            </UTreeview>
            <UTreeview :items="state.openAllItems" item-value="id" open-all return-object>
                <template #title="{ item, title }"><span :data-return-open-id="item.id">{{ title }}</span></template>
            </UTreeview>
        </section>
        <section id="open-all-lazy-fixture">
            <UTreeview :items="openAllLazyItems" item-value="id" open-all :load-children="loadOpenAllChildren">
                <template #title="{ item, title }"><span :data-open-all-lazy-title="item.id">{{ title }}</span></template>
                <template #loader="{ item, loading }"><output :data-open-all-lazy-id="item.id" :data-open-all-lazy-loading="loading" /></template>
            </UTreeview>
        </section>
        <section id="path-fixture">
            <UTreeview
                :items="pathItems"
                item-value="id"
                selectable
                :selected="state.selected"
                @update:selected="state.selected = $event"
                @click:open="recordOpen"
                @click:select="recordSelect"
            >
                <template #prepend="{ item }"><span :data-prepend-id="item.id" /></template>
                <template #toggle="{ item }"><span :data-toggle-id="item.id">Toggle</span></template>
                <template #title="{ item, title, internalItem }">
                    <span :data-title-id="item.id" :data-internal-id="internalItem.id">{{ title }}</span>
                </template>
                <template #append="{ item }"><span :data-append-id="item.id" /></template>
                <template #actions="{ item, select }">
                    <button v-if="item.id === 'path-leaf'" type="button" data-action-select @click.stop="select(true)">Select</button>
                </template>
            </UTreeview>
        </section>
        <section id="item-slot-fixture">
            <UTreeview :items="[{ id: 'item-slot', title: 'Hidden title' }]" item-value="id">
                <template #item="{ item, path }"><span data-full-item-slot :data-item-id="item.id" :data-path="path.join('/')">Custom row</span></template>
            </UTreeview>
        </section>
        <section id="type-fixture">
            <UTreeview :items="typeItems" item-value="id">
                <template #subheader="{ item }"><span :data-subheader-id="item.id">{{ item.title }}</span></template>
            </UTreeview>
        </section>
        <section id="readonly-fixture">
            <UTreeview :items="[{ id: 'readonly-item', title: 'Readonly item' }]" item-value="id" selectable readonly @click:select="state.readonlySelectionEvents++" />
        </section>
        <section id="disabled-fixture">
            <UTreeview :items="[{ id: 'disabled-root', title: 'Disabled root', children: [{ id: 'disabled-child', title: 'Disabled child' }] }]" item-value="id" disabled @click:open="state.disabledOpenEvents++" />
        </section>
        <section id="loader-fixture">
            <UTreeview :items="loadItems" item-value="id" :load-children="loadChildren" @click:open="recordOpen">
                <template #title="{ item, title }"><span :data-loader-title="item.id">{{ title }}</span></template>
                <template #loader="{ item, loading, error }"><output :data-loader-id="item.id" :data-loading="loading" :data-error="Boolean(error)" /></template>
            </UTreeview>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'TreeviewFixture.vue'), fixtureVue, 'utf8');

const route = '/__treeview_completion_protocols';
const fixturePlugin = {
    name: 'treeview-completion-protocols-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== route) { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await viteServer.transformIndexHtml(route, html));
        });
    }
};

const report = {
    fixture: 'treeview-completion-protocols',
    method: 'Vite dev server imports the real public UTreeview from src/ui/index.ts and drives it in installed Chrome.',
    sourceSha256,
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    limits: [
        'Chrome browser renderer only; no Electron renderer acceptance is claimed.',
        'No full project build or full test suite was run.',
        'The fixture validates source through the public entry and does not validate the compiled package bundle.'
    ]
};
const pageErrors = [];
const consoleErrors = [];
const consoleWarnings = [];
let vite;
let browser;

function passed(name, details) {
    report.checks.push({ name, details });
}

try {
    vite = await createServer({
        root,
        appType: 'custom',
        cacheDir: path.join(evidence, 'vite-cache'),
        logLevel: 'error',
        optimizeDeps: {
            noDiscovery: true,
            entries: ['artifacts/component-audit-root/treeview-completion-protocols/fixture/main.ts'],
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
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    page.setDefaultNavigationTimeout(5000);
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) consoleWarnings.push(message.text());
    });

    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}${route}`);
    await page.waitForSelector('#empty-fixture [role="tree"]');
    assert.equal(await page.locator('#empty-tree .ui-treeview-item').count(), 0, 'items can be omitted safely');
    passed('optional items default to an empty tree', 'The public component mounts without an items prop and renders no rows.');

    const filterTree = page.locator('#filter-fixture [role="tree"]');
    await page.waitForTimeout(200);
    const initialFilterRows = await page.locator('#filter-fixture [data-filter-id]').evaluateAll((elements) => elements.map((element) => element.getAttribute('data-filter-id')));
    assert.deepEqual(initialFilterRows, ['filter-root', 'needle-row', 'accent-row'], `unexpected filter result: ${JSON.stringify({ text: await filterTree.innerText(), state: await page.evaluate(() => window.treeviewCompletion.state) })}`);
    assert.equal(await filterTree.locator('[data-filter-id="needle-row"]').count(), 1);
    assert.equal(await filterTree.locator('[data-filter-id="accent-row"]').count(), 1);
    assert.ok(await page.evaluate(() => window.treeviewCompletion.state.customKeyItems.some((entry) => entry.id === 'accent-row')));
    assert.ok(await page.evaluate(() => window.treeviewCompletion.state.customFilterItems.every((entry) => ['needle-row', 'accent-row', 'quiet-row', 'filter-root'].includes(entry.id))));
    await page.evaluate(() => { window.treeviewCompletion.state.mode = 'intersection'; });
    await page.waitForFunction(() => document.querySelectorAll('#filter-fixture [role="treeitem"]').length === 0);
    assert.equal(await filterTree.locator('[data-filter-id="needle-row"]').count(), 0);
    assert.equal(await filterTree.locator('[data-filter-id="accent-row"]').count(), 0);
    passed('filter modes invoke raw item callbacks', 'Union keeps default or custom-key matches; intersection requires the custom-key match and a default match, and both callbacks receive original item objects.');

    const accentTree = page.locator('#accent-fixture [role="tree"]');
    await page.waitForFunction(() => document.querySelectorAll('#accent-fixture [data-accent-id]').length === 3);
    await page.evaluate(() => {
        window.treeviewCompletion.state.accentSide = 'query';
    });
    await page.waitForFunction(() => document.querySelectorAll('#accent-fixture [data-accent-id]').length === 2);
    assert.equal(await accentTree.locator('[data-accent-id="plain-target"]').count(), 1);
    assert.equal(await accentTree.locator('[data-accent-id="accented-target"]').count(), 0);
    passed('ignoreAccents honors query and target sides in the public component', 'Target folding matches both spellings for an unaccented query; query-only mode leaves the accented target unmatched.');

    const noFilterTree = page.locator('#no-filter-fixture [role="tree"]');
    assert.equal(await noFilterTree.locator('[data-no-filter-id="filter-root"]').count(), 1);
    assert.equal(await noFilterTree.locator('[data-no-filter-id="needle-row"]').count(), 0, 'noFilter does not open branches');
    assert.equal(await noFilterTree.locator('[role="treeitem"]').first().getAttribute('aria-expanded'), 'false');
    passed('noFilter ignores search without expanding branches', 'All root rows remain available while descendants stay collapsed.');

    const openAllTree = page.locator('#open-all-fixture [role="tree"]').first();
    const controlledTree = page.locator('#open-all-fixture [role="tree"]').nth(1);
    const returnObjectTree = page.locator('#open-all-fixture [role="tree"]').nth(2);
    await page.waitForSelector('#open-all-fixture [data-open-all-id="auto-child"]');
    assert.equal(await controlledTree.locator('[data-controlled-open-id="auto-child"]').count(), 0, 'explicit opened=[] takes priority');
    assert.equal(await returnObjectTree.locator('[data-return-open-id="auto-child"]').count(), 1, 'openAll writes opened values using returnObject semantics');
    await page.evaluate(() => window.treeviewCompletion.state.openAllItems.push({ id: 'auto-added', title: 'Added branch', children: [{ id: 'auto-added-child', title: 'Added child' }] }));
    await page.waitForSelector('#open-all-fixture [data-open-all-id="auto-added-child"]');
    assert.equal(await openAllTree.locator('[data-open-all-id="auto-added-child"]').count(), 1);
    passed('openAll expands initial and newly added branches only when opened is uncontrolled', 'An explicit empty opened model remains closed, returnObject values stay compatible, and uncontrolled openAll follows later data additions.');

    await page.waitForFunction(() => window.treeviewCompletion.state.openAllLoaderCalls.includes('open-all-lazy-root'));
    await page.waitForSelector('#open-all-lazy-fixture [data-open-all-lazy-id="open-all-lazy-root"][data-open-all-lazy-loading="true"]', { state: 'attached' });
    await page.evaluate(() => window.treeviewCompletion.state.openAllLoaderResolve([{ id: 'open-all-lazy-child', title: 'Open all lazy child' }]));
    await page.waitForSelector('#open-all-lazy-fixture [data-open-all-lazy-title="open-all-lazy-child"]');
    passed('initial openAll can start loadChildren during setup', 'The immediate openAll watcher loads the initial empty branch and renders its resolved child without a setup-time initialization error.');

    const pathTree = page.locator('#path-fixture [role="tree"]');
    assert.equal(await pathTree.locator('[data-prepend-id="path-root"]').count(), 1);
    assert.equal(await pathTree.locator('[data-append-id="path-root"]').count(), 1);
    assert.equal(await pathTree.locator('[data-title-id="path-root"]').getAttribute('data-internal-id'), 'path-root', 'the existing title slot still exposes internalItem');
    await pathTree.locator('[data-title-id="path-root"]').click();
    await pathTree.locator('.ui-treeview-toggle').nth(1).click();
    await pathTree.locator('[data-toggle-id="path-group"]').waitFor();
    await pathTree.locator('[data-action-select]').click();
    await page.waitForFunction(() => window.treeviewCompletion.state.selected.includes('path-leaf'));
    const openEvents = await page.evaluate(() => window.treeviewCompletion.state.openEvents.filter((entry) => entry.id.startsWith('path-')));
    const selectEvents = await page.evaluate(() => window.treeviewCompletion.state.selectEvents.filter((entry) => entry.id.startsWith('path-')));
    assert.deepEqual(openEvents.map((entry) => entry.path), [['path-root'], ['path-root', 'path-group']]);
    assert.equal(openEvents[0].eventType, 'click');
    assert.deepEqual(selectEvents.at(-1).path, ['path-root', 'path-group', 'path-leaf']);
    assert.equal(selectEvents.at(-1).eventType, undefined, 'slot-driven selection has no originating DOM event');
    assert.equal(await page.locator('#item-slot-fixture [data-full-item-slot]').getAttribute('data-path'), 'item-slot');
    assert.equal(await page.locator('#item-slot-fixture').getByText('Hidden title').count(), 0, 'the full item slot replaces default row content');
    passed('item and detail slots retain title scope and emit ID paths', 'Prepend, append, toggle, title, item, and actions slots render; open events carry click events and selection events carry the original root-to-item ID path.');

    const typeTree = page.locator('#type-fixture [role="tree"]');
    assert.equal(await typeTree.locator('[role="treeitem"]').count(), 1);
    assert.equal(await typeTree.locator('.ui-list-subheader').count(), 1);
    assert.equal(await typeTree.locator('.ui-divider').count(), 1);
    passed('itemType renders divider and subheader rows as presentation content', 'Only item entries participate in treeitem focus and selection semantics.');

    const readonlyTree = page.locator('#readonly-fixture [role="tree"]');
    assert.equal(await readonlyTree.locator('input[type="checkbox"]').isDisabled(), true);
    await readonlyTree.locator('.ui-treeview-item').click();
    assert.equal(await page.evaluate(() => window.treeviewCompletion.state.readonlySelectionEvents), 0);
    const disabledTree = page.locator('#disabled-fixture [role="tree"]');
    await disabledTree.locator('.ui-treeview-item').evaluate((element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    assert.equal(await disabledTree.locator('[role="treeitem"]').count(), 1);
    assert.equal(await page.evaluate(() => window.treeviewCompletion.state.disabledOpenEvents), 0);
    passed('readonly and disabled guards suppress selection and opening callbacks', 'Readonly blocks selection; disabled blocks branch interaction and its click event.');

    const loaderTree = page.locator('#loader-fixture [role="tree"]');
    await loaderTree.locator('.ui-treeview-toggle').click();
    await page.waitForFunction(() => window.treeviewCompletion.state.loaderCalls.includes('lazy-root'));
    await page.waitForSelector('#loader-fixture [data-loader-id="lazy-root"][data-loading="true"]', { state: 'attached' });
    await page.evaluate(() => window.treeviewCompletion.state.loaderResolve([{ id: 'lazy-child', title: 'Lazy child' }]));
    await page.waitForSelector('#loader-fixture [data-loader-title="lazy-child"]');
    passed('loader slot tracks the existing lazy-load lifecycle', 'Opening an empty branch invokes loadChildren, reports loading through the loader slot, then renders loaded children.');

    assert.deepEqual(pageErrors, [], `browser page errors: ${pageErrors.join('\n')}`);
    assert.deepEqual(consoleErrors, [], `browser console errors: ${consoleErrors.join('\n')}`);
    assert.deepEqual(consoleWarnings, [], `Vue warnings: ${consoleWarnings.join('\n')}`);
} catch (error) {
    process.exitCode = 1;
    report.checks.push({ name: 'FAIL', details: error instanceof Error ? error.stack : String(error) });
} finally {
    if (browser) await browser.close();
    if (vite) await vite.close();
    report.status = process.exitCode ? 'failed' : 'passed';
    report.pageErrors = pageErrors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    console.log(JSON.stringify({
        evidence,
        status: report.status,
        checkCount: report.checks.filter((check) => check.name !== 'FAIL').length,
        failures: report.checks.filter((check) => check.name === 'FAIL'),
        pageErrors,
        consoleErrors,
        consoleWarnings
    }, null, 4));
}
