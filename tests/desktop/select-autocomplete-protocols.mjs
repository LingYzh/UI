import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/select-autocomplete-protocols');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Select and autocomplete protocol fixture</title></head><body><div id="app"></div><script type="module">
import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/tokens.css';
import '/src/ui/styles.css';

const state = reactive({
    native: 'legacy',
    select: null,
    selectMenu: false,
    skip: null,
    skipMenu: false,
    controlled: null,
    controlledSearch: '',
    controlledMenu: false,
    summary: ['one', 'two'],
    combo: [],
    comboSearch: '',
    comboMenu: false,
    comboCreated: [],
    blurValue: null,
    blurSearch: '',
    orphan: { id: 'orphan', title: 'Orphan title' },
    orphanItems: [{ id: 'orphan', title: 'Orphan title' }],
    filterMode: 'intersection',
    noFilter: false,
    multiSearch: '',
    multiModel: [],
    objectModel: { id: 'same', title: 'Same object' },
    clearComboValue: null,
    clearComboSearch: '',
    locale: 'en',
    clearValue: 'alpha',
    clearClicks: 0,
    clearMenu: false,
    closableValue: 'known',
    closableRemoved: [],
    virtualMounted: true,
    virtualValue: null,
    added: [],
    removed: [],
    optionPropsClicks: 0,
    selectedRaw: [],
    selectionSlotRecords: [],
    summarySlotValue: '',
    focused: false
});
const nestedItems = [{
    title: 'Group',
    children: [
        { id: 'locked', title: 'Locked item', value: 'locked', props: { disabled: true } },
        { title: 'Inner group', children: [
            { id: 'nested', title: 'Nested item', value: 'nested', props: { onClick: () => state.optionPropsClicks++, 'data-item-prop': 'kept' } },
            { id: 'legacy-fallback', label: 'Legacy label fallback', value: 'legacy-fallback' }
        ] }
    ]
}];
const filterItems = [
    { title: 'Alpha', code: 'X-9' },
    { title: 'Beta', code: 'B-3' }
];
const localeMessages = {
    en: { noDataText: 'Scoped no matches' },
    zh: { noDataText: '范围内无匹配项' }
};
const autoRef = ref(null);
const virtualItems = Array.from({ length: 160 }, (_, index) => ({ title: 'Virtual ' + index, value: 'v' + index }));

window.selectAutocompleteProtocol = {
    state,
    registry: {
        select: Boolean(UI.UiSelect),
        autocomplete: Boolean(UI.UAutocomplete),
        combobox: Boolean(UI.UCombobox),
        localeProvider: Boolean(UI.ULocaleProvider),
        publicFactory: typeof UI.createUI === 'function'
    },
    autoRef,
    async flush() { await nextTick(); await nextTick(); }
};

const Root = defineComponent({
    setup() {
        return () => h('main', { id: 'fixture-main' }, [
            h('section', { id: 'native-panel' }, [
                h(UI.UiSelect, {
                    id: 'native-select', items: [{ value: 'legacy', label: 'Legacy label' }, { value: 'other', label: 'Other label' }],
                    modelValue: state.native, 'onUpdate:modelValue': value => state.native = value
                })
            ]),
            h('section', { id: 'extended-panel' }, [
                h(UI.UiSelect, {
                    id: 'extended-select', items: nestedItems, modelValue: state.select,
                    'onUpdate:modelValue': value => state.select = value,
                    menu: state.selectMenu, 'onUpdate:menu': value => state.selectMenu = value,
                    blurOnSelect: false, 'onItem:added': item => state.added.push(item.raw)
                }, {
                    item: ({ item, internalItem, index, props }) => h('button', {
                        ...props,
                        type: 'button',
                        'data-raw-id': item.id || '',
                        'data-internal-title': internalItem.title,
                        'data-item-index': index
                    }, internalItem.title)
                })
            ]),
            h('section', { id: 'keyboard-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'skip-input', items: [
                        { title: 'Blocked', value: 'blocked', props: { disabled: true } },
                        { title: 'Available', value: 'available' }
                    ], modelValue: state.skip, 'onUpdate:modelValue': value => state.skip = value,
                    menu: state.skipMenu, 'onUpdate:menu': value => state.skipMenu = value,
                    ref: autoRef
                })
            ]),
            h('section', { id: 'filter-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'filter-input', items: filterItems, modelValue: null,
                    filterKeys: ['title', 'code'], filterMode: state.filterMode,
                    customKeyFilter: { code: value => String(value).toLowerCase().includes('x-9') },
                    noFilter: state.noFilter
                })
            ]),
            h('section', { id: 'multi-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'multi-input', multiple: true, chips: true,
                    items: [{ title: 'Alpha', value: 'alpha' }, { title: 'Beta', value: 'beta' }],
                    modelValue: state.multiModel, 'onUpdate:modelValue': value => state.multiModel = value,
                    search: state.multiSearch, 'onUpdate:search': value => state.multiSearch = value,
                    blurOnSelect: false
                })
            ]),
            h('section', { id: 'object-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'object-input', items: [{ id: 'same', title: 'Same object' }],
                    modelValue: state.objectModel, returnObject: true
                })
            ]),
            h('section', { id: 'controlled-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'controlled-input', items: [{ title: 'Banana', value: 'banana' }, { title: 'Apple', value: 'apple' }],
                    modelValue: state.controlled, 'onUpdate:modelValue': value => state.controlled = value,
                    search: state.controlledSearch, 'onUpdate:search': value => state.controlledSearch = value,
                    menu: state.controlledMenu, 'onUpdate:menu': value => state.controlledMenu = value,
                    'onUpdate:focused': value => state.focused = value
                })
            ]),
            h('section', { id: 'summary-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'summary-input', multiple: true,
                    items: [{ id: 'one', title: 'One', value: 'one' }, { id: 'two', title: 'Two', value: 'two' }],
                    modelValue: state.summary, 'onUpdate:modelValue': value => state.summary = value
                }, {
                    selection: ({ item, index }) => {
                        state.selectionSlotRecords[index] = item.id;
                        return h('span', { class: 'selection-slot', 'data-selection-index': index, 'data-selection-id': item.id }, item.title);
                    },
                    'selection-summary': ({ items }) => {
                        state.summarySlotValue = items.join('|');
                        return h('span', { id: 'legacy-summary' }, items.join('|'));
                    }
                })
            ]),
            h('section', { id: 'combo-panel' }, [
                h(UI.UCombobox, {
                    id: 'delimiter-combo', multiple: true, chips: true, delimiters: [';'],
                    modelValue: state.combo, 'onUpdate:modelValue': value => state.combo = value,
                    search: state.comboSearch, 'onUpdate:search': value => state.comboSearch = value,
                    menu: state.comboMenu, 'onUpdate:menu': value => state.comboMenu = value,
                    'onItem:created': item => state.comboCreated.push(item.raw)
                }),
                h(UI.UCombobox, {
                    id: 'blur-combo', modelValue: state.blurValue, 'onUpdate:modelValue': value => state.blurValue = value,
                    search: state.blurSearch, 'onUpdate:search': value => state.blurSearch = value
                }),
                h(UI.UCombobox, {
                    id: 'orphan-combo', modelValue: state.orphan, items: state.orphanItems, itemTitle: 'title'
                }),
                h(UI.UCombobox, {
                    id: 'clear-default-combo', items: [{ title: 'Known', value: 'known' }],
                    modelValue: state.clearComboValue, 'onUpdate:modelValue': value => state.clearComboValue = value,
                    search: state.clearComboSearch, 'onUpdate:search': value => state.clearComboSearch = value
                })
            ]),
            h('section', { id: 'locale-panel' }, [
                h(UI.ULocaleProvider, { locale: state.locale, messages: localeMessages }, {
                    default: () => h(UI.UAutocomplete, {
                        id: 'localized-empty', items: [], hideNoData: false, noDataText: '$vuetify.noDataText'
                    })
                })
            ]),
            h('section', { id: 'clear-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'clear-input', clearable: true, modelValue: state.clearValue,
                    'onUpdate:modelValue': value => state.clearValue = value,
                    menu: state.clearMenu, 'onUpdate:menu': value => state.clearMenu = value,
                    items: [{ title: 'Alpha', value: 'alpha' }], 'onClick:clear': () => state.clearClicks++
                })
            ]),
            h('section', { id: 'closable-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'closable-input', chips: true, closableChips: true,
                    items: [{ title: 'Closable', value: 'known' }],
                    modelValue: state.closableValue, 'onUpdate:modelValue': value => state.closableValue = value,
                    'onItem:removed': item => state.closableRemoved.push(item.value)
                })
            ]),
            state.virtualMounted ? h('section', { id: 'virtual-panel' }, [
                h(UI.UAutocomplete, {
                    id: 'virtual-input', items: virtualItems,
                    modelValue: state.virtualValue, 'onUpdate:modelValue': value => state.virtualValue = value
                })
            ]) : null
        ]);
    }
});

createApp(Root).use(UI.createUI()).mount('#app');
</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'vue',
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
    plugins: [{
        name: 'select-autocomplete-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__select-autocomplete-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__select-autocomplete-protocols', fixture));
            });
        }
    }],
    logLevel: 'error'
});

const sourceFiles = [
    'src/ui/UiSelect.vue',
    'src/ui/UAutocomplete.vue',
    'src/ui/UCombobox.vue',
    'src/ui/autocomplete-props.ts',
    'src/ui/selection-filter.ts',
    'src/ui/selection.ts',
    'src/ui/UVirtualScroll.vue',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));

await server.listen();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
const errors = [];
const warnings = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning' && message.text().includes('[Vue warn]')) warnings.push(message.text());
});
const report = {
    method: 'Vite fixture imports the public src/ui/index.ts and exercises real Vue components in Chromium',
    evidence,
    sourceSha256,
    checks: {},
    errors,
    warnings
};

try {
    await page.goto(server.resolvedUrls.local[0] + '__select-autocomplete-protocols');
    await page.waitForFunction(() => window.selectAutocompleteProtocol?.registry.publicFactory === true);
    await page.waitForFunction(() => document.querySelector('#native-select'));
    const flush = () => page.evaluate(() => window.selectAutocompleteProtocol.flush());
    const protocol = () => page.evaluate(() => ({
        registry: window.selectAutocompleteProtocol.registry,
        state: JSON.parse(JSON.stringify(window.selectAutocompleteProtocol.state))
    }));

    const registry = await page.evaluate(() => window.selectAutocompleteProtocol.registry);
    assert.deepEqual(registry, { select: true, autocomplete: true, combobox: true, localeProvider: true, publicFactory: true });
    report.checks.publicExports = registry;

    assert.equal(await page.locator('#native-select').evaluate(element => element.tagName), 'SELECT');
    await page.locator('#native-select').selectOption('other');
    assert.equal((await protocol()).state.native, 'other');
    report.checks.nativeSimpleSelect = 'Simple label/value items retain the native select path and update the model.';

    await page.locator('#extended-select').focus();
    await flush();
    assert.equal((await protocol()).state.selectMenu, true);
    assert.equal(await page.locator('#extended-select').getAttribute('readonly'), '');
    assert.equal(await page.locator('#extended-select').getAttribute('aria-autocomplete'), 'none');
    assert.equal(await page.locator('[data-raw-id="locked"]').getAttribute('disabled'), '');
    assert.equal(await page.locator('[data-raw-id="nested"]').getAttribute('data-internal-title'), 'Nested item');
    assert.equal(await page.locator('[data-raw-id="nested"]').getAttribute('data-item-prop'), 'kept');
    await page.locator('[data-raw-id="locked"]').evaluate(button => button.click());
    await flush();
    assert.equal((await protocol()).state.select, null);
    await page.locator('[data-raw-id="nested"]').click();
    await flush();
    assert.equal((await protocol()).state.select, 'nested');
    assert.equal((await protocol()).state.selectMenu, false);
    assert.deepEqual((await protocol()).state.added.map(item => item.id), ['nested']);
    assert.equal((await protocol()).state.optionPropsClicks, 1);
    await page.locator('#extended-select').focus();
    await flush();
    await page.locator('[data-raw-id="legacy-fallback"]').evaluate(button => button.click());
    await flush();
    assert.equal((await protocol()).state.select, 'legacy-fallback');
    assert.equal((await protocol()).state.selectMenu, false);
    report.checks.extendedSelect = 'Extended UiSelect is select-only, flattens nested groups, keeps disabled props on item slots, uses title with a legacy label fallback, and selects the raw item exactly once.';

    await page.locator('#skip-input').focus();
    await flush();
    assert.equal(await page.locator('#skip-input').getAttribute('aria-activedescendant'), null);
    await page.locator('#skip-input').press('ArrowDown');
    await flush();
    assert.match(await page.locator('#skip-input').getAttribute('aria-activedescendant'), /-1$/);
    await page.locator('#skip-input').press('Enter');
    await flush();
    assert.equal((await protocol()).state.skip, 'available');
    await page.evaluate(async () => {
        window.selectAutocompleteProtocol.autoRef.value.reset();
        await window.selectAutocompleteProtocol.flush();
    });
    assert.equal((await protocol()).state.skip, null);
    report.checks.disabledKeyboardSkipping = 'Opening does not highlight a row by default; ArrowDown skips the disabled first row before Enter selection.';
    report.checks.nullReset = 'Reset restores a null model and the component remains usable.';

    await page.locator('#filter-input').focus();
    await page.locator('#filter-input').fill('x-9');
    await flush();
    assert.equal(await page.locator('#filter-panel .u-autocomplete-option').count(), 0);
    await page.evaluate(() => { window.selectAutocompleteProtocol.state.filterMode = 'union'; });
    await flush();
    assert.deepEqual(await page.locator('#filter-panel .u-autocomplete-option').allTextContents(), ['Alpha']);
    await page.evaluate(() => { window.selectAutocompleteProtocol.state.noFilter = true; });
    await flush();
    assert.deepEqual(await page.locator('#filter-panel .u-autocomplete-option').allTextContents(), ['Alpha', 'Beta']);
    await page.locator('#filter-input').press('Escape');
    await flush();
    report.checks.standardFiltering = 'customKeyFilter and filterKeys work with intersection/union modes; noFilter returns every item.';

    assert.equal(await page.locator('#object-input').getAttribute('aria-activedescendant'), null);
    await page.locator('#object-input').focus();
    await flush();
    assert.equal(await page.locator('#object-panel .u-autocomplete-option').getAttribute('aria-selected'), 'true');
    await page.locator('#object-input').press('Escape');
    await flush();
    report.checks.objectComparator = 'returnObject selections use the existing deep comparator to match structurally equal objects.';

    await page.locator('#multi-input').fill('Al');
    await flush();
    await page.locator('#multi-panel .u-autocomplete-option').click();
    await flush();
    assert.deepEqual((await protocol()).state.multiModel, ['alpha']);
    assert.equal((await protocol()).state.multiSearch, 'Al');
    assert.equal(await page.locator('#multi-panel .u-autocomplete-chip button').count(), 0);
    await page.locator('#multi-input').press('Escape');
    await flush();
    report.checks.standardDefaults = 'Autocomplete preserves its default search after selection; chips are not closable unless closableChips is explicitly enabled.';

    await page.evaluate(() => { window.selectAutocompleteProtocol.state.controlledMenu = true; });
    await flush();
    assert.equal(await page.locator('#controlled-input').getAttribute('aria-expanded'), 'true');
    await page.locator('#controlled-input').fill('Ban');
    await flush();
    assert.equal((await protocol()).state.controlledSearch, 'Ban');
    assert.deepEqual(await page.locator('#controlled-panel .u-autocomplete-option').allTextContents(), ['Banana']);
    assert.equal(await page.locator('#controlled-input').getAttribute('aria-activedescendant'), null);
    await page.locator('#controlled-input').press('ArrowDown');
    await page.locator('#controlled-input').press('Enter');
    await flush();
    assert.equal((await protocol()).state.controlled, 'banana');
    assert.equal((await protocol()).state.controlledMenu, false);
    assert.equal((await protocol()).state.focused, true);
    report.checks.controlledModelsAndFocus = 'Controlled search/menu models update, single selection closes the menu, and focused emits without Vue warnings.';

    assert.deepEqual(await page.locator('.selection-slot').evaluateAll(elements => elements.map(element => element.dataset.selectionId)), ['one', 'two']);
    assert.equal(await page.locator('#legacy-summary').textContent(), 'One|Two');
    report.checks.selectionSlots = 'selection slots receive one raw item/index each; selection-summary retains the old aggregate items payload.';

    await page.locator('#delimiter-combo').fill('alpha;beta');
    await flush();
    assert.deepEqual((await protocol()).state.combo, ['alpha', 'beta']);
    assert.deepEqual((await protocol()).state.comboCreated, ['alpha', 'beta']);
    assert.equal((await protocol()).state.comboSearch, '');
    assert.equal(await page.locator('#delimiter-combo').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#delimiter-combo').locator('xpath=..').locator('.u-autocomplete-chip button').count(), 0);
    await page.locator('#clear-default-combo').focus();
    await page.locator('#clear-default-combo').fill('Know');
    await flush();
    await page.locator('#combo-panel .u-autocomplete-option').filter({ hasText: 'Known' }).click();
    await flush();
    assert.deepEqual((await protocol()).state.clearComboValue, { title: 'Known', value: 'known' });
    assert.equal((await protocol()).state.clearComboSearch, '');
    await page.locator('#blur-combo').fill('blur-created');
    await page.locator('#native-select').focus();
    await flush();
    assert.equal((await protocol()).state.blurValue, 'blur-created');
    await page.evaluate(async () => {
        window.selectAutocompleteProtocol.state.orphanItems = [];
        await window.selectAutocompleteProtocol.flush();
    });
    assert.equal(await page.locator('#orphan-combo').inputValue(), 'Orphan title');
    report.checks.comboboxProtocol = 'Configured delimiters create trimmed values, clearOnSelect and hideNoData use the standard defaults, blur commits free text, and removed object items keep their raw title.';

    await page.locator('#localized-empty').focus();
    await flush();
    assert.equal(await page.locator('#locale-panel .u-autocomplete-empty').textContent(), 'Scoped no matches');
    await page.evaluate(() => { window.selectAutocompleteProtocol.state.locale = 'zh'; });
    await flush();
    assert.equal(await page.locator('#locale-panel .u-autocomplete-empty').textContent(), '范围内无匹配项');
    report.checks.scopedLocale = 'Explicit $vuetify.noDataText resolves from the nearest provider and updates when its locale changes.';

    await page.locator('#clear-input').focus();
    await page.locator('#clear-panel .u-autocomplete-clear').click();
    await flush();
    assert.equal((await protocol()).state.clearValue, null);
    assert.equal((await protocol()).state.clearClicks, 1);
    assert.equal(await page.locator('#clear-input').evaluate(element => document.activeElement === element), true);
    await page.locator('#clear-input').press('Escape');
    await flush();
    report.checks.clearAndFocus = 'Clear emits click:clear, resets the model, and restores input focus.';

    await page.locator('#closable-panel .u-autocomplete-chip button').click();
    await flush();
    assert.equal((await protocol()).state.closableValue, null);
    assert.deepEqual((await protocol()).state.closableRemoved, ['known']);
    report.checks.closableChipOverride = 'Explicit closableChips=true removes a single-value chip and emits item:removed.';

    await page.locator('#virtual-input').focus();
    await flush();
    assert.ok(await page.locator('#virtual-panel .u-autocomplete-option').count() < 160);
    for (let index = 0; index < 40; index++) await page.locator('#virtual-input').press('ArrowDown');
    await flush();
    const activeDescendant = await page.locator('#virtual-input').getAttribute('aria-activedescendant');
    assert.ok(activeDescendant);
    assert.equal(await page.locator('[id="' + activeDescendant + '"]').count(), 1);
    assert.ok(await page.locator('#virtual-panel .u-autocomplete-option').count() < 160);
    await page.evaluate(() => { window.selectAutocompleteProtocol.state.virtualMounted = false; });
    await flush();
    assert.equal(await page.locator('#virtual-input').count(), 0);
    report.checks.virtualizationAndUnmount = 'A 160-item list renders a bounded window, keyboard active-descendant scrolls into the window, and conditional unmount removes the consumer.';

    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
    report.checks.console = 'No browser errors or Vue warnings.';
    await page.screenshot({ path: path.join(evidence, 'select-autocomplete-protocols.png'), fullPage: true });
} catch (error) {
    report.failure = String(error?.stack || error);
    throw error;
} finally {
    report.warnings = warnings;
    report.errors = errors;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    await browser.close();
    await server.close();
}

console.log(JSON.stringify({ evidence, checks: Object.keys(report.checks), sourceSha256 }, null, 2));
