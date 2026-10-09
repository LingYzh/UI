import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/tree-registration-protocols');
await mkdir(evidence, { recursive: true });

const productSources = [
    'src/ui/UTreeview.vue',
    'src/ui/nested-strategies.ts',
    'src/ui/treeview-state.ts',
    'tests/desktop/tree-registration-protocols.mjs',
    'tests/tsconfig.tree-registration.json',
    '.Codex/memory/tree-registration.md'
];
const sourceSha256 = Object.fromEntries(await Promise.all(productSources.map(async (file) => [
    file,
    createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
])));

const route = '/__tree_registration_protocols';
const fixture = `<!doctype html>
<html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>UTreeview registration protocols</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module">
            import { createApp, h, nextTick, reactive, ref } from 'vue';
            import UTreeview from '/src/ui/UTreeview.vue';
            import { createLocale } from '/src/ui/locale-context.ts';
            import { localeKey } from '/src/ui/locale.ts';
            import '/src/ui/styles.css';

            const language = ref('zh');
            const localeMessages = {
                zh: { '$vuetify.noDataText': '当前范围没有树节点' },
                en: { '$vuetify.noDataText': 'No tree nodes in this scope' }
            };
            const state = reactive({
                renderSelected: [],
                propsSelected: [],
                classicSelected: [],
                classicOpened: [],
                leafSelected: [],
                singleLeafSelected: [],
                dynamicSelected: [],
                dynamicOpened: [],
                dynamicRegistration: 'render',
                dynamicSearch: '',
                dynamicSelectionEvents: [],
                activeDefault: [],
                activeIndependent: [],
                activeLeaf: [],
                activeSingleLeaf: [],
                activeMandatory: [],
                activeReadonly: [],
                readonlySelected: [],
                activeSlot: [],
                activeHidden: [],
                activeRegistration: 'render',
                objectSelected: [{ uid: 'object-child' }],
                objectActivated: [{ uid: 'object-child' }],
                objectItems: [
                    { id: 'object-root', uid: 'object-root', title: 'Object root', children: [
                        { id: 'object-child', uid: 'object-child', title: 'Object child' }
                    ] }
                ],
                openAllCalls: [],
                openAllResolve: undefined,
                noDataSearch: 'missing needle'
            });
            const refs = Object.create(null);

            const renderItems = [{ id: 'render-root', title: 'Render branch', children: [
                { id: 'render-child', title: 'Render child', children: [{ id: 'render-grandchild', title: 'Render grandchild' }] }
            ] }];
            const propsItems = [{ id: 'props-root', title: 'Props branch', children: [
                { id: 'props-child', title: 'Props child', children: [{ id: 'props-grandchild', title: 'Props grandchild' }] }
            ] }];
            const dynamicItems = [{ id: 'dynamic-root', title: 'Dynamic branch', children: [
                { id: 'dynamic-child', title: 'Match child' },
                { id: 'dynamic-other', title: 'Other child' }
            ] }];
            const activeItems = [
                { id: 'active-first', title: 'Active first' },
                { id: 'active-second', title: 'Active second' },
                { id: 'active-disabled', title: 'Active disabled', disabled: true }
            ];
            const activeBranchItems = [{ id: 'active-branch', title: 'Active branch', children: [
                { id: 'active-leaf-first', title: 'Active leaf first' },
                { id: 'active-leaf-second', title: 'Active leaf second' }
            ] }];
            const mandatoryActiveItems = [{ id: 'mandatory-active', title: 'Mandatory active' }];
            const activeSlotItems = [{ id: 'active-slot-row', title: 'Active slot row' }];
            const classicItems = [{ id: 'classic-root', title: 'Classic branch', children: [
                { id: 'classic-leaf', title: 'Classic leaf' },
                { id: 'classic-sibling', title: 'Classic sibling' },
                { id: 'classic-disabled', title: 'Classic disabled', disabled: true, children: [
                    { id: 'classic-disabled-leaf', title: 'Classic disabled leaf' }
                ] }
            ] }];
            const leafItems = [{ id: 'leaf-root', title: 'Leaf branch', children: [
                { id: 'leaf-first', title: 'Leaf first' },
                { id: 'leaf-second', title: 'Leaf second' }
            ] }];
            const noDataItems = [{ id: 'no-data-item', title: 'Present tree item' }];
            const openAllItems = [{ id: 'open-all-root', title: 'Open all root', children: [] }];

            function tree(id, props, slots) {
                if (!refs[id]) refs[id] = ref(null);
                return h(UTreeview, { key: id, itemValue: 'id', id, ref: refs[id], ...props }, slots);
            }

            function byUid(left, right) {
                return left?.uid === right?.uid;
            }

            const app = createApp({
                render() {
                    return h('main', [
                        tree('render-tree', {
                            items: renderItems,
                            selectable: true,
                            multiple: true,
                            openOnClick: false,
                            selected: state.renderSelected,
                            'onUpdate:selected': value => { state.renderSelected = value; }
                        }),
                        tree('props-tree', {
                            items: propsItems,
                            itemsRegistration: 'props',
                            selectable: true,
                            multiple: true,
                            openOnClick: false,
                            selected: state.propsSelected,
                            'onUpdate:selected': value => { state.propsSelected = value; }
                        }),
                        tree('dynamic-tree', {
                            items: dynamicItems,
                            itemsRegistration: state.dynamicRegistration,
                            selectable: true,
                            selectStrategy: 'independent',
                            openOnClick: false,
                            opened: state.dynamicOpened,
                            search: state.dynamicSearch,
                            selected: state.dynamicSelected,
                            'onUpdate:opened': value => { state.dynamicOpened = value; },
                            'onUpdate:selected': value => {
                                state.dynamicSelected = value;
                                state.dynamicSelectionEvents.push([...value]);
                            }
                        }),
                        tree('active-default', {
                            items: activeItems,
                            activatable: true,
                            activated: state.activeDefault,
                            'onUpdate:activated': value => { state.activeDefault = value; }
                        }),
                        tree('active-independent', {
                            items: activeItems,
                            activatable: true,
                            activeStrategy: 'independent',
                            activated: state.activeIndependent,
                            'onUpdate:activated': value => { state.activeIndependent = value; }
                        }),
                        tree('active-leaf', {
                            items: activeBranchItems,
                            opened: ['active-branch'],
                            activatable: true,
                            activeStrategy: 'leaf',
                            activated: state.activeLeaf,
                            'onUpdate:activated': value => { state.activeLeaf = value; }
                        }),
                        tree('active-single-leaf', {
                            items: activeBranchItems,
                            opened: ['active-branch'],
                            activatable: true,
                            activeStrategy: 'single-leaf',
                            activated: state.activeSingleLeaf,
                            'onUpdate:activated': value => { state.activeSingleLeaf = value; }
                        }),
                        tree('active-mandatory', {
                            items: mandatoryActiveItems,
                            activatable: true,
                            mandatory: true,
                            activated: state.activeMandatory,
                            'onUpdate:activated': value => { state.activeMandatory = value; }
                        }),
                        tree('active-readonly', {
                            items: activeItems,
                            activatable: true,
                            selectable: true,
                            readonly: true,
                            activated: state.activeReadonly,
                            selected: state.readonlySelected,
                            selectStrategy: 'independent',
                            'onUpdate:activated': value => { state.activeReadonly = value; },
                            'onUpdate:selected': value => { state.readonlySelected = value; }
                        }),
                        tree('active-slot', {
                            items: activeSlotItems,
                            activatable: true,
                            activated: state.activeSlot,
                            'onUpdate:activated': value => { state.activeSlot = value; }
                        }, {
                            item: scope => h('button', { id: 'active-slot-button', type: 'button', onClick: scope.activate }, scope.isActivated ? 'Active slot' : 'Inactive slot')
                        }),
                        tree('active-hidden', {
                            items: activeBranchItems,
                            itemsRegistration: state.activeRegistration,
                            activatable: true,
                            activated: state.activeHidden,
                            'onUpdate:activated': value => { state.activeHidden = value; }
                        }),
                        tree('classic-tree', {
                            items: classicItems,
                            itemsRegistration: 'props',
                            opened: state.classicOpened,
                            selectable: true,
                            selectStrategy: 'classic',
                            mandatory: true,
                            selected: state.classicSelected,
                            'onUpdate:opened': value => { state.classicOpened = value; },
                            'onUpdate:selected': value => { state.classicSelected = value; }
                        }),
                        tree('leaf-tree', {
                            items: leafItems,
                            itemsRegistration: 'props',
                            opened: ['leaf-root'],
                            selectable: true,
                            selectStrategy: 'leaf',
                            selected: state.leafSelected,
                            'onUpdate:selected': value => { state.leafSelected = value; }
                        }),
                        tree('single-leaf-tree', {
                            items: leafItems,
                            itemsRegistration: 'props',
                            opened: ['leaf-root'],
                            selectable: true,
                            selectStrategy: 'single-leaf',
                            selected: state.singleLeafSelected,
                            'onUpdate:selected': value => { state.singleLeafSelected = value; }
                        }),
                        tree('object-tree', {
                            items: state.objectItems,
                            itemsRegistration: 'props',
                            itemValue: 'id',
                            returnObject: true,
                            valueComparator: byUid,
                            opened: ['object-root'],
                            selectable: true,
                            selectStrategy: 'independent',
                            activatable: true,
                            activeStrategy: 'independent',
                            selected: state.objectSelected,
                            activated: state.objectActivated,
                            'onUpdate:selected': value => { state.objectSelected = value; },
                            'onUpdate:activated': value => { state.objectActivated = value; }
                        }),
                        tree('empty-default', { items: [] }),
                        tree('empty-fallback', { items: [], noDataText: '$vuetify.missingTreeText' }),
                        tree('empty-hidden', { items: [], hideNoData: true }),
                        tree('empty-slot', { items: [], search: state.noDataSearch }, {
                            'no-data': ({ search }) => h('strong', { id: 'empty-slot-label' }, 'Slot: ' + search)
                        }),
                        tree('search-empty', {
                            items: noDataItems,
                            search: state.noDataSearch
                        }),
                        tree('open-all-tree', {
                            items: openAllItems,
                            openAll: true,
                            loadChildren: item => {
                                state.openAllCalls.push(item.id);
                                return new Promise(resolve => { state.openAllResolve = resolve; });
                            }
                        })
                    ]);
                }
            });
            app.provide(localeKey, createLocale({ messages: localeMessages }, language));
            app.mount('#app');

            window.treeRegistrationProbe = {
                state,
                refs,
                flush: async () => { await nextTick(); await nextTick(); },
                call: (treeId, method, ...args) => refs[treeId]?.value?.[method]?.(...args),
                setLanguage: value => { language.value = value; }
            };
        </script>
    </body>
</html>
`;

const vite = await createServer({
    appType: 'custom',
    logLevel: 'error',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: { noDiscovery: true },
    server: { host: '127.0.0.1', port: 0, hmr: false }
});
vite.middlewares.use(route, async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await vite.transformIndexHtml(route, fixture));
});

const report = {
    generatedAt: new Date().toISOString(),
    sourceSha256,
    checks: [],
    windowErrors: [],
    unhandledRejections: [],
    pageErrors: [],
    console: [],
    vueWarnings: []
};

let browser;
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();
    await page.addInitScript(() => {
        window.__treeRegistrationWindowErrors = [];
        window.__treeRegistrationRejections = [];
        window.addEventListener('error', event => {
            window.__treeRegistrationWindowErrors.push({ message: event.message, file: event.filename, line: event.lineno });
        });
        window.addEventListener('unhandledrejection', event => {
            const reason = event.reason;
            window.__treeRegistrationRejections.push(reason instanceof Error ? reason.message : String(reason));
        });
    });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        const entry = { type: message.type(), text: message.text() };
        report.console.push(entry);
        if (entry.type === 'warning' && entry.text.includes('[Vue warn]')) report.vueWarnings.push(entry);
    });

    const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
    await page.goto(`${base}${route}`);
    await page.waitForFunction(() => !!window.treeRegistrationProbe);
    const flush = () => page.evaluate(() => window.treeRegistrationProbe.flush());
    const call = (treeId, method, ...args) => page.evaluate(({ treeId, method, args }) => window.treeRegistrationProbe.call(treeId, method, ...args), { treeId, method, args });
    const row = (treeId, label) => page.locator(`#${treeId} [role="treeitem"]`).filter({ hasText: label }).first();
    const visibleLabels = async (treeId) => page.locator(`#${treeId} [role="treeitem"]`).evaluateAll((elements) => elements
        .filter((element) => !element.closest('[inert]') && !element.closest('[aria-hidden="true"]'))
        .map((element) => element.textContent?.trim() ?? ''));

    await page.waitForFunction(() => window.treeRegistrationProbe.state.openAllCalls.length === 1);
    await page.evaluate(() => window.treeRegistrationProbe.state.openAllResolve([{ id: 'open-all-child', title: 'Open all loaded child' }]));
    await page.waitForSelector('#open-all-tree [role="treeitem"]:has-text("Open all loaded child")');
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.openAllCalls), ['open-all-root']);
    report.checks.push('openAll discovers the initially empty branch and runs its loader once');

    await row('render-tree', 'Render branch').locator('input[type="checkbox"]').check();
    await row('props-tree', 'Props branch').locator('input[type="checkbox"]').check();
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.renderSelected), ['render-root']);
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.propsSelected), ['props-root', 'props-child', 'props-grandchild']);
    report.checks.push('collapsed branch selection uses visible registration by default and the full items tree in props mode');

    await call('dynamic-tree', 'select', 'dynamic-child');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.dynamicSelected), []);
    report.checks.push('explicit selection of a hidden item waits for render registration');
    await page.evaluate(() => { window.treeRegistrationProbe.state.dynamicRegistration = 'props'; });
    await flush();
    await call('dynamic-tree', 'select', 'dynamic-child');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.dynamicSelected), ['dynamic-child']);
    report.checks.push('props registration allows explicit selection in the complete tree');

    await page.evaluate(() => { window.treeRegistrationProbe.state.dynamicRegistration = 'render'; });
    await flush();
    const dynamicBeforeCollapse = await page.evaluate(() => window.treeRegistrationProbe.state.dynamicSelectionEvents.length);
    await call('dynamic-tree', 'toggleOpen', 'dynamic-root');
    await page.waitForFunction(() => document.querySelectorAll('#dynamic-tree [role="treeitem"]').length === 3);
    await call('dynamic-tree', 'toggleOpen', 'dynamic-root');
    await page.waitForFunction(() => [...document.querySelectorAll('#dynamic-tree [role="treeitem"]')].filter(element => !element.closest('[inert]')).length === 1);
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.dynamicSelected), ['dynamic-child']);
    assert.equal(await page.evaluate(() => window.treeRegistrationProbe.state.dynamicSelectionEvents.length), dynamicBeforeCollapse);
    report.checks.push('expand and collapse update registration without clearing selected model values');

    await page.evaluate(() => {
        window.treeRegistrationProbe.state.dynamicSelected = ['dynamic-other'];
        window.treeRegistrationProbe.state.dynamicSearch = 'Match child';
    });
    await flush();
    assert.deepEqual((await visibleLabels('dynamic-tree')).length, 2);
    await call('dynamic-tree', 'select', 'dynamic-child');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.dynamicSelected), ['dynamic-other', 'dynamic-child']);
    report.checks.push('search registers only the logical visible path and preserves other filtered model IDs on selection');

    await row('active-default', 'Active first').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeDefault), ['active-first']);
    await row('active-default', 'Active first').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeDefault), []);
    await row('active-independent', 'Active first').click();
    await row('active-independent', 'Active second').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeIndependent), ['active-first', 'active-second']);
    await row('active-independent', 'Active first').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeIndependent), ['active-second']);
    report.checks.push('default single-independent activation toggles one item; explicit independent activation toggles multiple items');

    const slotActivateButton = page.locator('#active-slot #active-slot-button');
    assert.equal(await slotActivateButton.count(), 1);
    await slotActivateButton.click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeSlot), ['active-slot-row']);
    await slotActivateButton.click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeSlot), []);
    report.checks.push('item slot activate toggles activation state without the enclosing tree row toggling twice');

    await row('active-leaf', 'Active branch').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeLeaf), []);
    await row('active-leaf', 'Active leaf first').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeLeaf), ['active-leaf-first']);
    await row('active-single-leaf', 'Active branch').click();
    await row('active-single-leaf', 'Active leaf first').click();
    await row('active-single-leaf', 'Active leaf second').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeSingleLeaf), ['active-leaf-second']);
    report.checks.push('leaf and single-leaf activation strategies reject branches and apply their single/multiple rules');

    await row('active-mandatory', 'Mandatory active').click();
    await row('active-mandatory', 'Mandatory active').click();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeMandatory), ['mandatory-active']);
    await row('active-readonly', 'Active first').click();
    await call('active-readonly', 'select', 'active-first');
    await call('active-default', 'activate', 'active-disabled');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeReadonly), []);
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.readonlySelected), []);
    assert.equal(await page.evaluate(() => window.treeRegistrationProbe.state.activeDefault.length), 0);
    assert.equal(await row('active-default', 'Active disabled').getAttribute('aria-disabled'), 'true');
    report.checks.push('mandatory activation cannot clear its last value and readonly/disabled rows cannot activate');

    await call('active-hidden', 'activate', 'active-leaf-first');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeHidden), []);
    await page.evaluate(() => { window.treeRegistrationProbe.state.activeRegistration = 'props'; });
    await flush();
    await call('active-hidden', 'activate', 'active-leaf-first');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeHidden), ['active-leaf-first']);
    await call('active-hidden', 'activate', 'active-leaf-first');
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.activeHidden), []);
    report.checks.push('activate expose toggles a hidden item only under props registration');

    await row('classic-tree', 'Classic branch').locator('input[type="checkbox"]').check();
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.classicSelected), ['classic-leaf', 'classic-sibling']);
    assert.equal(await page.locator('#classic-tree [role="treeitem"]').filter({ hasText: 'Classic disabled' }).count(), 0);
    await call('classic-tree', 'toggleOpen', 'classic-root');
    await page.waitForSelector('#classic-tree [role="treeitem"]:has-text("Classic disabled")');
    assert.equal(await row('classic-tree', 'Classic disabled').getAttribute('aria-disabled'), 'true');
    assert.equal(await row('classic-tree', 'Classic disabled').locator('input[type="checkbox"]').isDisabled(), true);
    await row('classic-tree', 'Classic leaf').locator('input[type="checkbox"]').uncheck();
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.classicSelected), ['classic-sibling']);
    assert.equal(await row('classic-tree', 'Classic branch').locator('input[type="checkbox"]').evaluate(element => element.indeterminate), true);
    await row('classic-tree', 'Classic sibling').locator('input[type="checkbox"]').uncheck();
    await flush();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.classicSelected), ['classic-sibling']);
    report.checks.push('classic selection aggregates parents, emits leaf values, skips disabled descendants, and mandatory protects the last leaf');

    await row('leaf-tree', 'Leaf branch').locator('input[type="checkbox"]').check();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.leafSelected), []);
    await row('leaf-tree', 'Leaf first').locator('input[type="checkbox"]').check();
    await row('leaf-tree', 'Leaf second').locator('input[type="checkbox"]').check();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.leafSelected), ['leaf-first', 'leaf-second']);
    await row('single-leaf-tree', 'Leaf first').locator('input[type="checkbox"]').check();
    await row('single-leaf-tree', 'Leaf second').locator('input[type="checkbox"]').check();
    assert.deepEqual(await page.evaluate(() => window.treeRegistrationProbe.state.singleLeafSelected), ['leaf-second']);
    report.checks.push('leaf selection rejects branches while leaf/single-leaf enforce their respective value counts');

    await page.evaluate(() => window.treeRegistrationProbe.call('object-tree', 'select', 'object-root'));
    await flush();
    const objectSelectedIds = await page.evaluate(() => window.treeRegistrationProbe.state.objectSelected.map(item => item?.uid ?? item));
    assert.deepEqual(objectSelectedIds, ['object-child', 'object-root']);
    assert.equal(await page.evaluate(() => window.treeRegistrationProbe.state.objectSelected.every(item => item.id === item.uid)), true);
    assert.equal(await page.evaluate(() => window.treeRegistrationProbe.state.objectActivated.length), 1);
    await call('object-tree', 'activate', 'object-root');
    await flush();
    const objectActivatedIds = await page.evaluate(() => window.treeRegistrationProbe.state.objectActivated.map(item => item?.uid ?? item));
    assert.deepEqual(objectActivatedIds, ['object-child', 'object-root']);
    assert.equal(await page.evaluate(() => window.treeRegistrationProbe.state.objectActivated.every(item => item.id === item.uid)), true);
    report.checks.push('returnObject and valueComparator map selected/activated inputs to canonical raw item objects independently');

    assert.equal(await page.locator('#empty-default [role="status"]').innerText(), '当前范围没有树节点');
    assert.equal(await page.locator('#empty-fallback [role="status"]').innerText(), '暂无数据');
    assert.equal(await page.locator('#empty-hidden [role="status"]').count(), 0);
    assert.equal(await page.locator('#empty-slot-label').innerText(), 'Slot: missing needle');
    assert.equal(await page.locator('#search-empty [role="status"]').innerText(), '当前范围没有树节点');
    await page.evaluate(() => window.treeRegistrationProbe.setLanguage('en'));
    await flush();
    assert.equal(await page.locator('#empty-default [role="status"]').innerText(), 'No tree nodes in this scope');
    assert.equal(await page.locator('#empty-fallback [role="status"]').innerText(), 'No data');
    assert.equal(await page.locator('#search-empty [role="status"]').innerText(), 'No tree nodes in this scope');
    report.checks.push('empty/search no-data text uses the nearest locale, missing tokens fall back to common.empty, hideNoData and slot scope work');

    await page.evaluate(() => window.treeRegistrationProbe.flush());
    report.windowErrors = await page.evaluate(() => window.__treeRegistrationWindowErrors);
    report.unhandledRejections = await page.evaluate(() => window.__treeRegistrationRejections);
    assert.deepEqual(report.windowErrors, []);
    assert.deepEqual(report.unhandledRejections, []);
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.vueWarnings, []);
    assert.equal(report.console.some(entry => entry.type === 'error'), false);
    report.checks.push('window errors, unhandled rejections, page errors, console errors, and Vue warnings are empty');
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    throw error;
} finally {
    if (browser) await browser.close();
    await vite.close();
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

process.stdout.write(`tree registration protocols: ${report.checks.length} checks passed; ${report.vueWarnings.length} Vue warnings; ${report.windowErrors.length + report.unhandledRejections.length + report.pageErrors.length} runtime errors\n`);
