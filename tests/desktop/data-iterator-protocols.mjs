import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron, chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/data-iterator-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });
const profileDirectory = await mkdtemp(path.join(os.tmpdir(), 'ui-data-iterator-profile-'));
const chromiumOnly = process.argv.includes('--chromium-only');
let previousElectronAttempt;
try {
    const previousReport = JSON.parse(await readFile(path.join(evidence, 'report.json'), 'utf8'));
    previousElectronAttempt = {
        failure: previousReport.electronAttempt?.failure ?? previousReport.failure ?? 'No prior Electron attempt detail was recorded.',
        startup: previousReport.electronAttempt?.startup ?? previousReport.startup,
        diagnostics: previousReport.electronAttempt?.diagnostics ?? previousReport.startup?.diagnostics,
        launchConfig: previousReport.electronAttempt?.launchConfig,
        startupDiagnostics: previousReport.electronAttempt?.startupDiagnostics,
        sourceChangedDuringRun: previousReport.electronAttempt?.sourceChangedDuringRun ?? previousReport.sourceChangedDuringRun ?? false
    };
} catch {}

const productSources = [
    'src/ui/UDataIterator.vue',
    'src/ui/data-iterator-state.ts',
    'src/ui/docs/component-examples/data-iterator.vue',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(productSources.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
])));

const html = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>Data iterator protocol fixture</title>
        <style>
            html, body, #app { height: auto !important; min-height: 0; margin: 0; overflow: visible !important; }
            #app { padding: 20px; }
            #fixture-root { display: grid; gap: 28px; max-width: 1120px; margin: 0 auto; }
            #fixture-root > section { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; }
            #iterator-root, #defaults-root { display: grid; gap: 12px; }
            .fixture-cards { display: grid; gap: 8px; }
            .fixture-controls { display: flex; flex-wrap: wrap; gap: 8px; padding-block: 8px; }
            .fixture-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/data-iterator-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import IteratorFixture from './IteratorFixture.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';
import '/src/ui/docs/docs.css';

const ui = createUI({ defaults: { UDataIterator: { standardProtocol: true } } });
window.iteratorUi = ui;
createApp(IteratorFixture).use(ui).mount('#app');
`;

const electronMain = `const { app, BrowserWindow } = require('electron');
const diagnostics = [];
globalThis.__iteratorHostDiagnostics = diagnostics;
app.disableHardwareAcceleration();
function record(stage, details = {}) {
    diagnostics.push({ stage, ...details });
}
record('host-entered', { argv: process.argv, cwd: process.cwd(), userData: process.env.UAH_DATA_DIR });
app.setPath('userData', process.env.UAH_DATA_DIR);
function createWindow() {
    record('create-window-start');
    const window = new BrowserWindow({
        show: false,
        width: 1280,
        height: 1100,
        webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false }
    });
    record('window-created', { destroyed: window.isDestroyed() });
    window.webContents.on('did-fail-load', (_event, code, description, url) => {
        record('did-fail-load', { code, description, url });
        console.error('Renderer navigation failed', code, description, url);
    });
}
function startWhenReady() {
    record('ready-resolved');
    try {
        createWindow();
    } catch (error) {
        record('create-window-error', { message: error.message, stack: error.stack });
        console.error('Electron fixture failed to create window', error);
    }
}
if (app.isReady()) {
    record('already-ready');
    startWhenReady();
} else {
    app.whenReady().then(startWhenReady).catch(error => {
        record('ready-error', { message: error.message, stack: error.stack });
        console.error('Electron fixture readiness failed', error);
    });
}
app.on('window-all-closed', () => app.quit());
`;

const fixtureVue = `<script setup>
import { reactive, ref, toRaw } from 'vue';
import { UDataIterator } from '/src/ui/index.ts';
import DataIteratorDemo from '/src/ui/docs/component-examples/data-iterator.vue';

const items = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: 'Workspace ' + (index + 1),
    count: index,
    category: index < 6 ? 'A' : 'B',
    selectable: index !== 1,
    detail: 'Details for workspace ' + (index + 1)
}));
const headers = [
    { key: 'title', title: 'Workspace' },
    { key: 'count', title: 'Count' },
    { key: 'category', title: 'Category' }
];
const state = reactive({
    showDemo: false,
    legacyPage: 1,
    legacySearch: '',
    legacyOptions: [],
    legacyCurrentEvents: [],
    page: '1',
    itemsPerPage: '2',
    sortBy: [],
    groupBy: [],
    selected: [],
    expanded: [],
    opened: [],
    search: '',
    itemsLength: undefined,
    loading: false,
    protocol: true,
    tag: 'section',
    returnObject: false,
    comparator: undefined,
    itemSelectable: 'selectable',
    openAll: false,
    initialSortOrder: 'desc',
    mustSort: true,
    options: [],
    currentEvents: []
});
const legacyRef = ref();
const standardRef = ref();
const defaultsRef = ref();
window.iteratorProtocol = {
    state,
    items,
    headers,
    refs: { legacy: legacyRef, standard: standardRef, defaults: defaultsRef },
    toRaw
};
</script>

<template>
    <DataIteratorDemo v-if="state.showDemo" />
    <main v-else id="fixture-root">
        <section id="legacy-panel" aria-label="Legacy iterator">
            <h2>Legacy iterator</h2>
            <UDataIterator
                ref="legacyRef"
                v-model:page="state.legacyPage"
                :items="items"
                :search="state.legacySearch"
                :standard-protocol="false"
                @update:options="state.legacyOptions.push($event)"
                @update:current-items="state.legacyCurrentEvents.push($event)"
            >
                <template #header="{ page, pageCount }">
                    <header data-order="legacy-header">
                        <output id="legacy-page">{{ page }} / {{ pageCount }}</output>
                    </header>
                </template>
                <template #default="{ items: current, pageCount }">
                    <div id="legacy-default" data-order="legacy-default">
                        <output id="legacy-items-type">{{ current[0]?.type ?? 'raw' }}</output>
                        <output id="legacy-items">{{ current.map(item => item.id).join(',') }}</output>
                        <output id="legacy-page-count">{{ pageCount }}</output>
                        <div class="fixture-cards">
                            <div v-for="item in current" :key="item.id" :data-legacy-id="item.id">{{ item.title }}</div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <footer data-order="legacy-footer">Legacy footer</footer>
                </template>
            </UDataIterator>
        </section>

        <section id="standard-panel" aria-label="Standard iterator">
            <h2>Standard iterator</h2>
            <UDataIterator
                ref="standardRef"
                v-model="state.selected"
                v-model:page="state.page"
                v-model:items-per-page="state.itemsPerPage"
                v-model:sort-by="state.sortBy"
                v-model:group-by="state.groupBy"
                v-model:opened="state.opened"
                v-model:expanded="state.expanded"
                :items="items"
                :headers="headers"
                :search="state.search"
                :items-length="state.itemsLength"
                :standard-protocol="state.protocol"
                :tag="state.tag"
                :item-selectable="state.itemSelectable"
                :return-object="state.returnObject"
                :value-comparator="state.comparator"
                :loading="state.loading"
                :open-all="state.openAll"
                :initial-sort-order="state.initialSortOrder"
                :must-sort="state.mustSort"
                id="iterator-root"
                class="protocol-root"
                data-protocol-root="iterator"
                @update:options="state.options.push($event)"
                @update:current-items="state.currentEvents.push($event)"
            >
                <template #header="{ selectAll, toggleSort, itemsCount }">
                    <header data-order="header">
                        <div class="fixture-controls">
                            <button id="fixture-select-all" type="button" @click="selectAll(true)">Select page</button>
                            <button id="fixture-sort" type="button" @click="toggleSort('count')">Sort count</button>
                            <span id="fixture-items-count">{{ itemsCount }}</span>
                        </div>
                    </header>
                </template>
                <template #default="{ items: current, groupedItems, isSelected, toggleSelect, isExpanded, toggleExpand, isGroupOpen, toggleGroup }">
                    <div id="standard-default" data-order="default">
                        <output id="standard-items-type">{{ current[0]?.type === 'item' ? 'item' : current.length ? 'raw' : 'empty' }}</output>
                        <output id="standard-items">{{ current.map(item => item.type === 'item' ? item.raw.id : item.id).join(',') }}</output>
                        <div class="fixture-cards">
                            <template v-for="row in groupedItems" :key="row.type === 'group' ? row.id : row.key">
                                <button
                                    v-if="row.type === 'group'"
                                    type="button"
                                    :data-group-id="row.id"
                                    :aria-expanded="isGroupOpen(row)"
                                    @click="toggleGroup(row)"
                                >
                                    Group {{ row.value }}
                                </button>
                                <article
                                    v-else
                                    class="fixture-row"
                                    :data-standard-item-id="row.raw.id"
                                    :data-selectable="row.selectable"
                                    :data-selected="isSelected(row)"
                                    :data-expanded="isExpanded(row)"
                                >
                                    <span>{{ row.raw.title }}</span>
                                    <button type="button" :disabled="!row.selectable" @click="toggleSelect(row)">Toggle select</button>
                                    <button type="button" @click="toggleExpand(row)">Expand detail</button>
                                    <span v-if="isExpanded(row)" data-expanded-detail>{{ row.raw.detail }}</span>
                                </article>
                            </template>
                        </div>
                    </div>
                </template>
                <template #loader="{ isActive, color }">
                    <div id="standard-loader" data-order="loader" :data-active="isActive" :data-color="color">Loading {{ color }}</div>
                </template>
                <template #no-data>
                    <div id="standard-no-data" data-order="no-data">No standard results</div>
                </template>
                <template #footer="{ page, pageCount, prevPage, nextPage, setPage, setItemsPerPage }">
                    <footer data-order="footer">
                        <div class="fixture-controls">
                            <button id="fixture-prev" type="button" @click="prevPage">Previous</button>
                            <output id="standard-page">{{ page }} / {{ pageCount }}</output>
                            <button id="fixture-next" type="button" @click="nextPage">Next</button>
                            <button id="fixture-set-page" type="button" @click="setPage(2)">Set page 2</button>
                            <button id="fixture-set-size" type="button" @click="setItemsPerPage(3)">Set size 3</button>
                        </div>
                    </footer>
                </template>
            </UDataIterator>
        </section>

        <section id="defaults-panel" aria-label="Defaults provider">
            <h2>Defaults provider</h2>
            <UDataIterator ref="defaultsRef" id="defaults-root" :items="items" @update:current-items="state.currentEvents.push($event)">
                <template #default="{ items: current, pageCount }">
                    <div id="defaults-scope">
                        <output id="defaults-items-type">{{ current[0]?.type === 'item' ? 'item' : 'raw' }}</output>
                        <output id="defaults-page-count">{{ pageCount }}</output>
                    </div>
                </template>
            </UDataIterator>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'IteratorFixture.vue'), fixtureVue, 'utf8');
await writeFile(path.join(fixtureDirectory, 'electron-main.cjs'), electronMain, 'utf8');

const virtualRoute = '/__data-iterator-protocols';
const fixturePlugin = {
    name: 'data-iterator-protocol-fixture',
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
        entries: ['artifacts/component-audit-root/data-iterator-protocols/fixture/main.ts'],
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
    fixture: 'data-iterator-protocols',
    method: 'Vite source fixture + public src/ui/index.ts + createUI defaults; runtime backend is recorded separately.',
    sourceSha256,
    checks: [],
    demo: [],
    screenshots: [],
    errors: [],
    limits: [
        'No full project build, full test suite, or visual design acceptance was run.',
        'Browser assertions use the public source entry and the real component example; no compiled package bundle is involved.'
    ]
};
const errors = [];
const electronOutput = [];
const httpErrors = [];
let app;
let browser;
let page;

function passed(name, details) {
    report.checks.push({ name, details });
}

const realDemoSource = await readFile(path.resolve(root, 'src/ui/docs/component-examples/data-iterator.vue'), 'utf8');
assert.match(realDemoSource, /<u-data-iterator\b[^>]*:standard-protocol="false"/, 'the legacy raw example opts out of the global standard protocol default');
assert.match(html, /html, body, #app\s*\{[^}]*height:\s*auto[^}]*overflow:\s*visible/s, 'the fixture allows the complete demo to extend beyond the viewport');
passed('demo fixture preserves raw example and full capture height', 'The real legacy example explicitly disables the createUI default, and fixture root overflow does not clip the real example screenshot.');

async function setState(key, value) {
    await page.evaluate(([name, next]) => { window.iteratorProtocol.state[name] = next; }, [key, value]);
    await settle();
}

async function readState(key) {
    return page.evaluate(name => window.iteratorProtocol.state[name], key);
}

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.waitForTimeout(70);
}

async function captureDemo(name, theme, width, height) {
    if (app) {
        await app.evaluate(({ BrowserWindow }, size) => {
            const window = BrowserWindow.getAllWindows()[0];
            window.setContentSize(size.width, size.height);
            window.webContents.setZoomFactor(1);
        }, { width, height });
    } else {
        await page.setViewportSize({ width, height });
    }
    await page.evaluate(async value => {
        await window.iteratorUi.theme.change(value, false);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, theme);
    await settle();
    const component = page.locator('[data-demo-component="UDataIterator"]');
    await component.screenshot({ path: path.join(evidence, `${name}.png`), animations: 'disabled', caret: 'hide' });
    const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth }));
    report.screenshots.push({ file: `${name}.png`, theme, viewport, backend: report.backend, target: 'real component example locator' });
}

await server.listen();
const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
const mainUrl = new URL('/artifacts/component-audit-root/data-iterator-protocols/fixture/main.ts', server.resolvedUrls.local[0]).href;
const env = {
    ...process.env,
    UAH_DATA_DIR: profileDirectory,
    UAH_UI_PREVIEW_URL: url
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

try {
    report.previewUrl = url;
    report.sourceMainUrl = mainUrl;
    report.serverProbe = await Promise.all([
        ['virtual-index', url],
        ['main-module', mainUrl]
    ].map(async ([name, target]) => {
        const response = await fetch(target, { signal: AbortSignal.timeout(15000) });
        const body = await response.arrayBuffer();
        return { name, status: response.status, contentType: response.headers.get('content-type'), bytes: body.byteLength };
    }));
    assert.deepEqual(report.serverProbe.map(result => result.status), [200, 200], 'fixture index and main module are served successfully before browser navigation');
    report.launchHost = path.join(fixtureDirectory, 'electron-main.cjs');
    if (chromiumOnly) {
        report.electronAttempt = previousElectronAttempt ?? { skipped: true, reason: '--chromium-only' };
        try {
            browser = await chromium.launch({ channel: 'chrome', headless: true });
            report.backend = 'chrome';
        } catch (chromeError) {
            report.chromeLaunchFailure = chromeError instanceof Error ? chromeError.message : String(chromeError);
            browser = await chromium.launch({ channel: 'msedge', headless: true });
            report.backend = 'edge';
        }
        report.backendLimit = 'Chromium browser fixture only; this fallback does not establish Electron renderer acceptance.';
        page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    } else {
        report.backend = 'electron';
        try {
            app = await electron.launch({ args: ['--disable-gpu', report.launchHost], cwd: root, env });
            app.process().stdout?.on('data', chunk => electronOutput.push(`stdout: ${chunk.toString()}`));
            app.process().stderr?.on('data', chunk => electronOutput.push(`stderr: ${chunk.toString()}`));
            const startupPromise = app.evaluate(({ app: electronApp, BrowserWindow }) => ({
                ready: electronApp.isReady(),
                userData: electronApp.getPath('userData'),
                argv: process.argv,
                diagnostics: globalThis.__iteratorHostDiagnostics,
                windows: BrowserWindow.getAllWindows().map(window => ({ url: window.webContents.getURL(), destroyed: window.isDestroyed() }))
            })).catch(error => ({ error: error instanceof Error ? error.message : String(error) }));
            report.startup = await Promise.race([
                startupPromise,
                new Promise(resolve => setTimeout(() => resolve({ timedOut: true }), 3000))
            ]);
            page = await app.firstWindow({ timeout: 10000 });
        } catch (error) {
            report.electronAttempt = { failure: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
            if (app) {
                const diagnosticsPromise = app.evaluate(({ app: electronApp, BrowserWindow }) => ({
                    ready: electronApp.isReady(),
                    argv: process.argv,
                    diagnostics: globalThis.__iteratorHostDiagnostics,
                    windows: BrowserWindow.getAllWindows().map(window => ({ url: window.webContents.getURL(), destroyed: window.isDestroyed() }))
                })).catch(problem => ({ error: problem instanceof Error ? problem.message : String(problem) }));
                report.electronAttempt.diagnostics = await Promise.race([
                    diagnosticsPromise,
                    new Promise(resolve => setTimeout(() => resolve({ timedOut: true }), 1500))
                ]);
                const process = app.process();
                const closed = await Promise.race([
                    app.close().then(() => true),
                    new Promise(resolve => setTimeout(() => resolve(false), 3000))
                ]);
                if (!closed) process.kill();
                app = null;
            }

            try {
                browser = await chromium.launch({ channel: 'chrome', headless: true });
                report.backend = 'chrome';
            } catch (chromeError) {
                report.chromeLaunchFailure = chromeError instanceof Error ? chromeError.message : String(chromeError);
                browser = await chromium.launch({ channel: 'msedge', headless: true });
                report.backend = 'edge';
            }
            report.backendLimit = 'Chromium browser fixture only; this fallback does not establish Electron renderer acceptance.';
            page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
        }
    }
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(30000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    page.on('response', response => {
        if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
    });
    page.on('requestfailed', request => errors.push(`Request failed: ${request.url()} ${request.failure()?.errorText ?? ''}`));
    if (app) {
        await page.goto(url, { waitUntil: 'commit' });
        report.startupAfterNavigation = await app.evaluate(({ BrowserWindow }) => ({
            diagnostics: globalThis.__iteratorHostDiagnostics,
            windows: BrowserWindow.getAllWindows().map(window => ({ url: window.webContents.getURL(), destroyed: window.isDestroyed() }))
        }));
    } else {
        await page.goto(url, { waitUntil: 'commit' });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#legacy-items').waitFor();
    await page.waitForFunction(() => Boolean(window.iteratorProtocol?.refs?.standard?.value));

    assert.equal(await page.locator('#legacy-items-type').textContent(), 'raw');
    assert.equal(await page.locator('#legacy-items').textContent(), '1,2,3,4,5,6,7,8,9,10');
    assert.equal(await page.locator('#legacy-page-count').textContent(), '2', 'legacy default page size stays ten');
    assert.equal(await page.locator('#legacy-panel .u-data-iterator').count(), 0, 'legacy renderless mode has no wrapper by default');
    assert.deepEqual(await page.locator('#legacy-panel [data-order]').evaluateAll(nodes => nodes.map(node => node.dataset.order)), ['legacy-header', 'legacy-default', 'legacy-footer']);
    await page.evaluate(() => window.iteratorProtocol.refs.legacy.value.nextPage());
    await page.waitForFunction(() => window.iteratorProtocol.state.legacyPage === 2);
    await setState('legacySearch', 'Workspace');
    assert.equal(await readState('legacyPage'), 2, 'legacy external search preserves a valid page');
    assert.equal(await page.locator('#legacy-items').textContent(), '11,12');
    await setState('legacySearch', 'no-legacy-results');
    assert.equal(await page.locator('#legacy-default').count(), 1, 'legacy without no-data slot still invokes the default slot');
    assert.equal(await page.locator('#legacy-panel').getByText('No standard results', { exact: true }).count(), 0);
    passed('legacy renderless/raw/default10/search/no-data behavior', 'Raw rows, 10-item default, page preservation, header/default/footer order, and no-data omission were exercised.');

    assert.equal(await page.locator('#iterator-root').evaluate(element => element.tagName), 'SECTION');
    assert.equal(await page.locator('#iterator-root').getAttribute('id'), 'iterator-root');
    assert.equal(await page.locator('#iterator-root').getAttribute('data-protocol-root'), 'iterator');
    assert.ok((await page.locator('#iterator-root').getAttribute('class')).includes('protocol-root'));
    assert.equal(await page.locator('#standard-items-type').textContent(), 'item');
    assert.equal(await page.locator('#standard-items').textContent(), '1,2');
    assert.deepEqual(await page.locator('#iterator-root [data-order]').evaluateAll(nodes => nodes.map(node => node.dataset.order)), ['header', 'default', 'footer']);
    const initialOptions = await readState('options');
    assert.equal(initialOptions.length, 1, 'standard options emit immediately');
    assert.deepEqual(initialOptions[0], { page: 1, itemsPerPage: 2, sortBy: [], groupBy: [], search: '' });
    const exposedMethods = await page.evaluate(() => {
        const component = window.iteratorProtocol.refs.standard.value;
        return ['setPage', 'setItemsPerPage', 'nextPage', 'prevPage', 'toggleSort', 'isSelected', 'select', 'selectAll', 'toggleSelect', 'isExpanded', 'toggleExpand', 'isGroupOpen', 'toggleGroup']
            .every(name => typeof component[name] === 'function');
    });
    assert.equal(exposedMethods, true, 'all declared page, sort, select, expand, and group methods are exposed');
    assert.equal(await page.locator('#defaults-root').evaluate(element => element.tagName), 'DIV');
    assert.equal(await page.locator('#defaults-items-type').textContent(), 'item', 'createUI default provider enables standard protocol without a prop');
    assert.equal(await page.locator('#defaults-page-count').textContent(), '2');
    passed('standard wrapper, attrs, wrapped slots, immediate options, exposed methods, and createUI defaults', 'Custom tag/attributes and global standardProtocol default were read through the public entry.');

    const currentEventCount = (await readState('currentEvents')).length;
    assert.equal(await page.evaluate(() => window.iteratorProtocol.state.currentEvents[0][0].type), 'item');
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.setPage(3));
    await page.waitForFunction(() => window.iteratorProtocol.state.page === 3);
    assert.equal(await page.locator('#standard-items').textContent(), '5,6');
    await setState('page', '2');
    assert.equal(await page.locator('#standard-items').textContent(), '3,4', 'string-valued page models normalize for slicing');
    await setState('itemsPerPage', '3');
    assert.equal(await readState('itemsPerPage'), '3', 'external size model keeps its string representation');
    assert.equal(await page.locator('#standard-page').textContent(), '2 / 4');
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.nextPage());
    await page.waitForFunction(() => window.iteratorProtocol.state.page === 3);
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.prevPage());
    await page.waitForFunction(() => window.iteratorProtocol.state.page === 2);
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.setItemsPerPage(2));
    await page.waitForFunction(() => window.iteratorProtocol.state.itemsPerPage === 2 && window.iteratorProtocol.state.page === 1);
    assert.equal(await page.locator('#standard-page').textContent(), '1 / 6');
    assert.ok((await readState('currentEvents')).length > currentEventCount);
    passed('standard numeric/string page models, page controls, currentItems rows, and model writeback', 'Numeric helper methods and string-valued external models were exercised against page slices.');

    const countBeforeManual = (await readState('currentEvents')).length;
    await setState('itemsLength', 0);
    assert.equal((await readState('currentEvents')).length, countBeforeManual, 'entering manual mode does not emit local pagination events');
    await setState('search', 'Workspace 1');
    await setState('sortBy', [{ key: 'count', order: 'desc' }]);
    assert.equal(await page.locator('#standard-page').textContent(), '1 / 1');
    assert.equal(await page.locator('#standard-items').textContent(), '12,11,10,1');
    assert.equal((await readState('currentEvents')).length, countBeforeManual, 'manual mode does not emit the local pagination event');
    await setState('itemsLength', '100');
    assert.equal(await page.locator('#standard-page').textContent(), '1 / 50');
    assert.equal(await page.locator('#standard-items').textContent(), '12,11,10,1', 'external length skips slicing while filters and sorting remain active');
    assert.equal((await readState('currentEvents')).length, countBeforeManual);
    await setState('itemsLength', undefined);
    await setState('search', '');
    await setState('sortBy', []);
    await setState('page', '1');
    await settle();
    passed('itemsLength zero/string manual mode', 'Both defined lengths skip local slicing, keep filtering/sorting, and suppress currentItems events.');

    const optionsBeforeDedupe = (await readState('options')).length;
    await setState('sortBy', [{ key: 'count', order: 'desc' }]);
    const optionsAfterSort = (await readState('options')).length;
    await setState('sortBy', [{ key: 'count', order: 'desc' }]);
    assert.equal((await readState('options')).length, optionsAfterSort, 'deep-equal options do not emit twice');
    assert.equal(optionsAfterSort, optionsBeforeDedupe + 1);
    await setState('page', '4');
    const beforeSearchReset = (await readState('options')).length;
    await setState('search', 'Workspace 1');
    assert.equal(await readState('page'), 1, 'standard search change resets the page');
    const searchSnapshots = (await readState('options')).slice(beforeSearchReset);
    assert.equal(searchSnapshots.length, 2, 'search and its page reset each emit their changed option snapshot');
    assert.deepEqual(searchSnapshots.at(-1), { page: 1, itemsPerPage: 2, sortBy: [{ key: 'count', order: 'desc' }], groupBy: [], search: 'Workspace 1' });
    await setState('search', 'Workspace 1');
    assert.equal((await readState('options')).length, beforeSearchReset + 2, 'repeated search value does not emit duplicate options');
    await setState('search', '');
    await setState('sortBy', []);
    await setState('page', '1');
    passed('options deep dedupe and standard search page reset', 'Search reset, numeric option snapshots, and repeat-assignment suppression were checked.');

    await page.evaluate(() => {
        const state = window.iteratorProtocol.state;
        state.selected = [];
        state.returnObject = false;
        state.comparator = undefined;
        state.itemSelectable = 'selectable';
        state.page = '1';
        state.itemsPerPage = '2';
    });
    await settle();
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.selectAll(true));
    await settle();
    assert.deepEqual(await readState('selected'), [1], 'page selection excludes an item marked unselectable');
    await page.evaluate(() => {
        const { items, state } = window.iteratorProtocol;
        state.returnObject = true;
        state.selected = [JSON.parse(JSON.stringify(items[0]))];
    });
    await settle();
    assert.equal(await page.locator('[data-standard-item-id="1"]').getAttribute('data-selected'), 'true', 'default comparator deep-matches returned objects');
    await setState('comparator', undefined);
    await page.evaluate(() => {
        const { state } = window.iteratorProtocol;
        state.comparator = (left, right) => (left?.id ?? left) === (right?.id ?? right);
        state.selected = [{ id: 1, external: true }];
    });
    await settle();
    assert.equal(await page.locator('[data-standard-item-id="1"]').getAttribute('data-selected'), 'true', 'custom comparator matches object values');
    await page.evaluate(() => {
        const component = window.iteratorProtocol.refs.standard.value;
        const rows = component.items;
        component.toggleSelect(rows[0]);
    });
    await settle();
    assert.equal((await readState('selected')).length, 0, 'comparator-based toggle removes a selected object');
    await page.evaluate(() => {
        const component = window.iteratorProtocol.refs.standard.value;
        component.select([component.items[0]], true);
    });
    await settle();
    assert.equal(await page.evaluate(() => window.iteratorProtocol.toRaw(window.iteratorProtocol.state.selected[0]) === window.iteratorProtocol.items[0]), true, 'returnObject writes the original raw item');
    await page.evaluate(() => {
        const component = window.iteratorProtocol.refs.standard.value;
        component.toggleSelect(component.items[1]);
    });
    await settle();
    assert.equal((await readState('selected')).length, 1, 'unselectable items ignore direct selection toggles');
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.toggleExpand(window.iteratorProtocol.refs.standard.value.items[0]));
    await settle();
    assert.equal(await page.evaluate(() => window.iteratorProtocol.toRaw(window.iteratorProtocol.state.expanded[0]) === window.iteratorProtocol.items[0]), true);
    assert.equal(await page.evaluate(() => window.iteratorProtocol.refs.standard.value.isExpanded(window.iteratorProtocol.refs.standard.value.items[0])), true);
    passed('selection, returnObject, comparators, selectable guards, and expansion', 'Page strategy, deep/custom comparison, raw object model values, and expanded model updates were exercised.');

    await page.evaluate(() => {
        const state = window.iteratorProtocol.state;
        state.returnObject = false;
        state.selected = [];
        state.expanded = [];
        state.page = '1';
        state.itemsPerPage = '2';
        state.openAll = false;
        state.groupBy = [];
        state.opened = [];
        state.sortBy = [];
    });
    await settle();
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.toggleSort('count'));
    await settle();
    assert.deepEqual(await readState('sortBy'), [{ key: 'count', order: 'desc' }], 'initialSortOrder writes through the sort model');
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.toggleSort('count'));
    await settle();
    assert.deepEqual(await readState('sortBy'), [{ key: 'count', order: 'asc' }]);
    await page.evaluate(() => window.iteratorProtocol.refs.standard.value.toggleSort('count'));
    await settle();
    assert.deepEqual(await readState('sortBy'), [{ key: 'count', order: 'desc' }], 'mustSort keeps a sort entry after the third click');
    await setState('sortBy', []);
    await page.evaluate(() => {
        const state = window.iteratorProtocol.state;
        state.groupBy = [{ key: 'category', order: 'asc' }];
        state.openAll = true;
    });
    await settle();
    assert.equal((await readState('opened')).length, 2, 'openAll populates the opened model');
    assert.ok(await page.locator('#iterator-root [data-group-id]').count() > 0);
    const groupToggle = page.locator('#iterator-root [data-group-id]').first();
    assert.equal(await groupToggle.getAttribute('aria-expanded'), 'true');
    await groupToggle.click();
    assert.equal(await groupToggle.getAttribute('aria-expanded'), 'false', 'group toggle updates the opened model');
    assert.ok((await readState('currentEvents')).at(-1).some(row => row.type === 'group'), 'standard currentItems event contains paginated group wrappers');
    passed('sort cycles, group model, openAll, and standard group-row event payload', 'Sort models and group open/close were exercised through exposed methods and rendered slots.');

    await setState('groupBy', []);
    await setState('openAll', false);
    await setState('opened', []);
    await setState('search', '');
    await setState('loading', 'primary');
    await page.locator('#standard-loader').waitFor();
    assert.equal(await page.locator('#standard-loader').getAttribute('data-active'), 'true');
    assert.equal(await page.locator('#standard-loader').getAttribute('data-color'), 'primary');
    assert.deepEqual(await page.locator('#iterator-root [data-order]').evaluateAll(nodes => nodes.map(node => node.dataset.order)), ['header', 'loader', 'footer']);
    await setState('loading', { color: 'warning', side: 'end' });
    assert.equal(await page.locator('#standard-loader').getAttribute('data-color'), 'warning');
    await setState('loading', false);
    await setState('search', 'missing-standard-results');
    await page.locator('#standard-no-data').waitFor();
    assert.deepEqual(await page.locator('#iterator-root [data-order]').evaluateAll(nodes => nodes.map(node => node.dataset.order)), ['header', 'no-data', 'footer']);
    await setState('search', '');
    passed('loading string/object colors, slot sequence, and standard no-data slot', 'Loader scope colors and header/loader-or-empty/footer ordering were checked.');

    await setState('protocol', false);
    await setState('tag', undefined);
    assert.equal(await page.locator('#iterator-root').count(), 0, 'runtime protocol switch removes the wrapper without an explicit tag');
    assert.equal(await page.locator('#standard-items-type').textContent(), 'raw', 'runtime legacy mode changes the slot item shape');
    await setState('protocol', true);
    await setState('tag', 'section');
    assert.equal(await page.locator('#iterator-root').evaluate(element => element.tagName), 'SECTION');
    passed('runtime standardProtocol switching', 'The same mounted instance switched between renderless raw slots and tagged standard wrapper slots.');

    await page.evaluate(() => { window.iteratorProtocol.state.showDemo = true; });
    const demo = page.locator('[data-demo-component="UDataIterator"]');
    await demo.waitFor();
    const search = demo.getByLabel('标准迭代器搜索', { exact: true });
    await search.fill('工作区 2');
    await settle();
    const filteredCount = await demo.locator('.u-data-iterator .iterator-actions > span').first().textContent();
    assert.match(filteredCount ?? '', /筛选后\s*11\s*条/);
    await search.fill('');
    await settle();
    const selectableCheckboxes = demo.getByRole('checkbox', { name: '选择此项' });
    assert.equal(await selectableCheckboxes.first().isDisabled(), true, 'real demo disables selection for itemSelectable=false');
    await demo.getByRole('button', { name: '选择本页', exact: true }).click();
    const selectionText = await demo.locator('output').last().textContent();
    assert.match(selectionText ?? '', /已选 [1-4] 项/);
    const groupSwitch = demo.getByLabel('按类别分组', { exact: true });
    await groupSwitch.check();
    const groupButtons = demo.getByRole('button', { name: /分组$/ });
    await groupButtons.first().waitFor();
    assert.equal(await groupButtons.first().getAttribute('aria-expanded'), 'true');
    await groupButtons.first().click();
    assert.equal(await groupButtons.first().getAttribute('aria-expanded'), 'false');
    await groupButtons.first().click();
    await groupSwitch.uncheck();
    const disabledSwitch = demo.getByLabel('禁用选择与分页', { exact: true });
    await disabledSwitch.check();
    assert.equal(await demo.getByRole('button', { name: '选择本页', exact: true }).isDisabled(), true);
    assert.equal(await demo.locator('.u-data-iterator .iterator-actions').last().getByRole('button', { name: '下一页', exact: true }).isDisabled(), true);
    await disabledSwitch.uncheck();
    await demo.getByRole('button', { name: '按任务数排序', exact: true }).click();
    await settle();
    const sortedRows = await demo.locator('.iterator-rows > *').allTextContents();
    assert.ok(sortedRows.length > 0);
    await demo.getByRole('button', { name: '详情', exact: true }).first().click();
    await demo.getByText(/标准包装项包含 raw、value 和/, { exact: false }).first().waitFor();
    await demo.locator('.u-data-iterator .iterator-actions').last().getByRole('button', { name: '下一页', exact: true }).click();
    assert.match((await demo.locator('.u-data-iterator .iterator-actions output').last().textContent()) ?? '', /^2\s*\//);
    await search.fill('no-such-workspace-query');
    await demo.getByText('未找到匹配的工作区。', { exact: true }).waitFor();
    await search.fill('');
    await settle();
    report.demo.push('real example search, unselectable checkbox, page selection, group collapse/expand, disabled controls, sort, detail expansion, pagination, and no-data were exercised');

    await captureDemo('demo-wide-light', 'light', 1280, 1100);
    await captureDemo('demo-wide-dark', 'dark', 1280, 1100);
    await captureDemo('demo-narrow-390', 'light', 390, 844);
    assert.deepEqual(errors, [], 'data iterator fixture has no page errors, console errors, Vue warnings, or failed requests');
    passed('real component example interactions and screenshots', report.screenshots.map(item => item.file));
} catch (error) {
    report.failure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    if (page) {
        try {
            report.pageStateAtFailure = await page.evaluate(() => ({
                url: location.href,
                title: document.title,
                bodyText: document.body.innerText.slice(0, 4000),
                fixtureMarkup: document.querySelector('#fixture-root')?.innerHTML.slice(0, 5000) ?? null,
                pageErrors: window.__iteratorHostDiagnostics ?? null
            }));
        } catch (diagnosticError) {
            report.pageStateCaptureFailure = diagnosticError instanceof Error ? diagnosticError.message : String(diagnosticError);
        }
    }
    throw error;
} finally {
    report.errors = [...errors];
    report.httpErrors = [...httpErrors];
    report.electronOutput = electronOutput;
    if (app && report.electronProcessAtExit === undefined) {
        const process = app.process();
        report.electronProcessAtExit = { exitCode: process.exitCode, signalCode: process.signalCode, killed: process.killed };
    }
    try {
        const currentHashes = Object.fromEntries(await Promise.all(productSources.map(async file => [
            file,
            createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
        ])));
        report.sourceSha256After = currentHashes;
        report.sourceChangedDuringRun = JSON.stringify(currentHashes) !== JSON.stringify(sourceSha256);
    } catch (error) {
        report.sourceHashFailure = error instanceof Error ? error.message : String(error);
    }
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
    if (app) await app.close();
    if (browser) await browser.close();
    await server.close();
    await rm(profileDirectory, { recursive: true, force: true });
}

console.log(`Evidence: ${path.join(evidence, 'report.json')}`);
console.log(`Screenshots: ${report.screenshots.map(item => item.file).join(', ')}`);
