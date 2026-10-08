import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/pagination-breadcrumbs');
await mkdir(evidence, { recursive: true });
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixtureScript = String.raw`
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/docs-base.css';
import '/src/ui/styles.css';

const activeLocale = ref('en');
const startUpdates = [];
const controlled = ref(1);
const controlledUpdates = [];
const disabledUpdates = [];
const negativeUpdates = [];
const controlEvents = [];
const navigationDisabled = ref(false);
const manualDisabled = ref(false);
const slotState = { controls: {}, items: [], events: [] };
const componentRefs = { pagination: null, breadcrumbs: null, divider: null, item: null };
const messages = {
    en: { pagination: { label: 'Scoped pagination', previous: 'Scoped previous', next: 'Scoped next', page: 'Scoped page {page}', currentPage: 'Scoped current {page}', first: 'Scoped first', last: 'Scoped last', token: 'Token pagination', tokenPrevious: 'Token previous' } },
    zh: { pagination: { label: '作用域分页', previous: '作用域上一页', next: '作用域下一页', page: '作用域第 {page} 页', currentPage: '作用域当前第 {page} 页', first: '作用域第一页', last: '作用域最后一页', token: '令牌分页', tokenPrevious: '令牌上一页' } }
};

const app = createApp(defineComponent({
    setup() {
        window.paginationBreadcrumbsProtocol = {
            registry: {
                pagination: Boolean(UI.UiPagination),
                breadcrumbs: Boolean(UI.UBreadcrumbs),
                item: Boolean(UI.UBreadcrumbsItem),
                divider: Boolean(UI.UBreadcrumbsDivider)
            },
            setLocale(value) { activeLocale.value = value; },
            setNavigationDisabled(value) { navigationDisabled.value = value; },
            setManualDisabled(value) { manualDisabled.value = value; },
            get startUpdates() { return startUpdates.slice(); },
            get controlledValue() { return controlled.value; },
            get controlledUpdates() { return controlledUpdates.slice(); },
            setControlled(value) { controlled.value = value; },
            get disabledUpdates() { return disabledUpdates.slice(); },
            get negativeUpdates() { return negativeUpdates.slice(); },
            get controlEvents() { return controlEvents.slice(); },
            get slotState() {
                return {
                    controls: Object.fromEntries(Object.entries(slotState.controls).map(([name, props]) => [name, {
                        icon: props.icon,
                        disabled: props.disabled,
                        ariaLabel: props['aria-label'],
                        ariaDisabled: props['aria-disabled']
                    }])),
                    items: slotState.items
                };
            },
            get refTags() {
                return Object.fromEntries(Object.entries(componentRefs).map(([key, instance]) => [key, instance?.$el?.tagName?.toLowerCase()]));
            },
            async flush() { await nextTick(); await nextTick(); }
        };

        return () => h('main', [
            h(UI.ULocaleProvider, { locale: activeLocale.value, messages }, {
                default: () => h('section', { id: 'locale-pagination' }, [
                    h(UI.UiPagination, { id: 'scoped-pagination', length: 5, ref: instance => { componentRefs.pagination = instance; } }),
                    h(UI.UiPagination, { id: 'legacy-labels', length: 5, label: 'Manual label', ariaLabel: 'Ignored aria label', prevLabel: 'Manual previous', previousAriaLabel: 'Ignored previous' }),
                    h(UI.UiPagination, { id: 'token-labels', length: 5, ariaLabel: '$vuetify.pagination.token', previousAriaLabel: '$vuetify.pagination.tokenPrevious' }),
                    h(UI.UiPagination, { id: 'start-pagination', start: '5', length: '8', totalVisible: 5, 'onUpdate:modelValue': value => startUpdates.push(value) }),
                    h(UI.UiPagination, { id: 'controlled-pagination', start: 10, length: 3, modelValue: controlled.value, 'onUpdate:modelValue': value => { controlledUpdates.push(value); controlled.value = value; } }),
                    h(UI.UiPagination, { id: 'negative-start-pagination', start: -2, length: 3, modelValue: 99, 'onUpdate:modelValue': value => negativeUpdates.push(value) }),
                    h(UI.UiPagination, { id: 'disabled-pagination', length: 5, disabled: true, modelValue: 2, 'onUpdate:modelValue': value => disabledUpdates.push(value) }),
                    h(UI.UiPagination, {
                        id: 'controls-pagination', start: 5, length: 8, modelValue: 7, showFirstLastPage: true,
                        onFirst: value => controlEvents.push(['first', value]),
                        onPrev: value => controlEvents.push(['prev', value]),
                        onNext: value => controlEvents.push(['next', value]),
                        onLast: value => controlEvents.push(['last', value])
                    }),
                    h(UI.UiPagination, { id: 'only-first-pagination', length: 4, showFirstLastPage: 'only-first' }),
                    h(UI.UiPagination, { id: 'custom-tag-pagination', length: 10, tag: 'section', showFirstLastPage: true }, {
                        first: props => { slotState.controls.first = props; return h('button', { id: 'slot-first', ...props }, 'First'); },
                        prev: props => { slotState.controls.prev = props; return h('button', { id: 'slot-prev', ...props }, 'Prev'); },
                        next: props => { slotState.controls.next = props; return h('button', { id: 'slot-next', ...props }, 'Next'); },
                        last: props => { slotState.controls.last = props; return h('button', { id: 'slot-last', ...props }, 'Last'); },
                        item: item => { slotState.items.push({ page: item.page, value: item.value, isActive: item.isActive, key: item.key, disabled: item.props.disabled, ariaLabel: item.props['aria-label'], hasClick: typeof item.props.onClick === 'function' }); return h('button', { id: 'slot-page-' + item.page, ...item.props }, item.page); }
                    }),
                    h(UI.ULocaleProvider, { locale: 'ar' }, {
                        default: () => h(UI.UiPagination, { id: 'rtl-pagination', length: 5, modelValue: 3 })
                    })
                ])
            }),
            h('section', { id: 'breadcrumbs-region' }, [
                h(UI.UBreadcrumbs, {
                    id: 'auto-breadcrumbs', tag: 'section', ariaLabel: 'Auto path', divider: '>',
                    disabled: navigationDisabled.value,
                    ref: instance => { componentRefs.breadcrumbs = instance; },
                    items: [
                        { title: 'Home', href: '#home' },
                        { title: 'Explicit enabled', href: '#enabled', disabled: false },
                        { title: 'Current', href: '#current' }
                    ]
                }, {
                    prepend: () => h('b', { id: 'crumb-prepend' }, 'Start'),
                    divider: ({ index }) => h('span', { class: 'slot-divider', 'data-divider-index': index }, 'separator')
                }),
                h(UI.UBreadcrumbs, { id: 'manual-breadcrumbs', disabled: manualDisabled.value, divider: '::' }, {
                    default: () => [
                        h(UI.UBreadcrumbsItem, { id: 'manual-inherited', href: '#manual', title: 'Manual' }),
                        h(UI.UBreadcrumbsDivider, { id: 'manual-divider', ref: instance => { componentRefs.divider = instance; } }),
                        h(UI.UBreadcrumbsItem, { id: 'manual-explicit', href: '#explicit', disabled: false, title: 'Explicit' })
                    ]
                }),
                h(UI.UBreadcrumbs, { id: 'divider-override', divider: '-' }, {
                    default: () => [
                        h(UI.UBreadcrumbsItem, { title: 'One' }),
                        h(UI.UBreadcrumbsDivider, { id: 'slot-divider-owner', divider: '|' }, { default: () => h('strong', { id: 'divider-slot-content' }, 'Slot wins') }),
                        h(UI.UBreadcrumbsItem, { title: 'Two' })
                    ]
                }),
                h(UI.UBreadcrumbs, { id: 'route-breadcrumb' }, {
                    default: () => h(UI.UBreadcrumbsItem, { id: 'route-crumb', href: '#route-target', title: 'Route target' })
                }),
                h(UI.UBreadcrumbsItem, { id: 'custom-item-tag', tag: 'span', title: 'Tag item', ref: instance => { componentRefs.item = instance; } })
            ])
        ]);
    }
}));
app.use(UI.createUI());
app.mount('#app');
`;

const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; }
body { margin: 0; padding: 20px; }
#app { width: min(1200px, 100%); margin: 0 auto; overflow: visible !important; }
main { display: grid; gap: 18px; min-width: 0; }
section { min-width: 0; }
#locale-pagination { display: grid; gap: 12px; }
#breadcrumbs-region { display: grid; gap: 12px; }
</style></head><body><div id="app"></div><script type="module">${fixtureScript}</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
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
    plugins: [{
        name: 'pagination-breadcrumbs-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__pagination-breadcrumbs') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__pagination-breadcrumbs', fixture));
            });
        }
    }]
});

const sources = [
    'src/ui/UiPagination.vue', 'src/ui/UBreadcrumbs.vue', 'src/ui/UBreadcrumbsItem.vue',
    'src/ui/UBreadcrumbsDivider.vue', 'src/ui/breadcrumbs-completion.ts', 'src/ui/router.ts',
    'src/ui/locale.ts', 'src/ui/locale-context.ts', 'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sources.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));

await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + '__pagination-breadcrumbs' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
const errors = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + Electron Chromium',
    sourceSha256,
    registry: {},
    pagination: {},
    breadcrumbs: {},
    keyboard: {},
    route: {},
    errors
};

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.paginationBreadcrumbsProtocol.flush());
}

async function readActive(id) {
    return (await page.locator(`#${id} [aria-current="page"]`).innerText()).trim();
}

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.paginationBreadcrumbsProtocol));
    await settle();

    report.registry = await page.evaluate(() => window.paginationBreadcrumbsProtocol.registry);
    assert.deepEqual(report.registry, { pagination: true, breadcrumbs: true, item: true, divider: true });
    report.refTags = await page.evaluate(() => window.paginationBreadcrumbsProtocol.refTags);
    assert.deepEqual(report.refTags, { pagination: 'nav', breadcrumbs: 'section', divider: 'li', item: 'span' });

    report.pagination.defaultLocale = {
        navTag: await page.locator('#scoped-pagination').evaluate(element => element.tagName.toLowerCase()),
        label: await page.locator('#scoped-pagination').getAttribute('aria-label'),
        previous: await page.locator('#scoped-pagination button').first().getAttribute('aria-label')
    };
    assert.deepEqual(report.pagination.defaultLocale, { navTag: 'nav', label: 'Scoped pagination', previous: 'Scoped previous' });
    assert.equal(await page.locator('#legacy-labels').getAttribute('aria-label'), 'Manual label');
    assert.equal(await page.locator('#legacy-labels button').first().getAttribute('aria-label'), 'Manual previous');
    assert.equal(await page.locator('#token-labels').getAttribute('aria-label'), 'Token pagination');
    assert.equal(await page.locator('#token-labels button').first().getAttribute('aria-label'), 'Token previous');
    assert.equal(await page.locator('#start-pagination [aria-current="page"]').innerText(), '5');
    await page.locator('#start-pagination button[aria-label="Scoped next"]').click();
    await settle();
    assert.equal(await readActive('start-pagination'), '6');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.startUpdates), [6]);

    await page.evaluate(() => window.paginationBreadcrumbsProtocol.setLocale('zh'));
    await settle();
    assert.equal(await page.locator('#scoped-pagination').getAttribute('aria-label'), '作用域分页');
    assert.equal(await page.locator('#scoped-pagination button').first().getAttribute('aria-label'), '作用域上一页');
    await page.evaluate(() => window.paginationBreadcrumbsProtocol.setLocale('en'));
    await settle();

    assert.equal(await readActive('controlled-pagination'), '10', 'model below start clamps to start');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlledUpdates), [10]);
    await page.locator('#controlled-pagination button[aria-label="Scoped next"]').click();
    await settle();
    assert.equal(await readActive('controlled-pagination'), '11');
    assert.equal(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlledValue), 11);
    await page.evaluate(() => window.paginationBreadcrumbsProtocol.setControlled(99));
    await settle();
    assert.equal(await readActive('controlled-pagination'), '12', 'model above end clamps to start + length - 1');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlledUpdates), [10, 11, 12]);
    assert.equal(await readActive('negative-start-pagination'), '0', 'start may define a non-positive numeric page range');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.negativeUpdates), [0]);
    assert.equal(await page.locator('#disabled-pagination button[aria-label="Scoped next"]').isDisabled(), true);
    await page.locator('#disabled-pagination button[aria-label="Scoped next"]').evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    await settle();
    assert.equal(await readActive('disabled-pagination'), '2');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.disabledUpdates), []);

    const ordinaryPageButton = page.locator('#controls-pagination [data-pagination-page="8"]');
    await ordinaryPageButton.click();
    await settle();
    assert.equal(await readActive('controls-pagination'), '8');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlEvents), [], 'ordinary page click does not emit control events');
    await page.locator('#controls-pagination button[aria-label="Scoped first"]').click();
    await settle();
    assert.equal(await readActive('controls-pagination'), '5');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlEvents), [['first', 5]]);
    await page.locator('#controls-pagination button[aria-label="Scoped last"]').click();
    await settle();
    assert.equal(await readActive('controls-pagination'), '12');
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlEvents), [['first', 5], ['last', 12]]);
    await page.locator('#controls-pagination button[aria-label="Scoped previous"]').click();
    await settle();
    await page.locator('#controls-pagination button[aria-label="Scoped next"]').click();
    await settle();
    assert.deepEqual(await page.evaluate(() => window.paginationBreadcrumbsProtocol.controlEvents), [['first', 5], ['last', 12], ['prev', 11], ['next', 12]]);
    assert.equal(await page.locator('#only-first-pagination button[aria-label="Scoped first"]').count(), 1);
    assert.equal(await page.locator('#only-first-pagination button[aria-label="Scoped last"]').count(), 0);
    assert.equal(await page.locator('#custom-tag-pagination').evaluate(element => element.tagName.toLowerCase()), 'section');

    report.pagination.slots = await page.evaluate(() => window.paginationBreadcrumbsProtocol.slotState);
    assert.deepEqual(Object.keys(report.pagination.slots.controls).sort(), ['first', 'last', 'next', 'prev']);
    assert.ok(report.pagination.slots.controls.prev.disabled === true);
    assert.ok(report.pagination.slots.controls.prev.ariaLabel);
    assert.ok(report.pagination.slots.controls.prev.ariaDisabled === true);
    assert.ok(report.pagination.slots.items.some(item => item.page === '1' && item.isActive === true && item.hasClick));
    assert.ok(report.pagination.slots.items.some(item => item.disabled === true), 'ellipsis slots expose disabled item props');
    await page.locator('#slot-next').click();
    await settle();
    assert.equal(await readActive('custom-tag-pagination'), '2');
    const updatedSlotControls = await page.evaluate(() => window.paginationBreadcrumbsProtocol.slotState.controls);
    assert.equal(updatedSlotControls.prev.disabled, false, 'slot button props update after the current page changes');

    const startPage = page.locator('#start-pagination [data-pagination-page="6"]');
    await startPage.focus();
    await page.keyboard.press('Home');
    await settle();
    assert.equal(await readActive('start-pagination'), '5');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-pagination-page')), '5');
    await page.keyboard.press('End');
    await settle();
    assert.equal(await readActive('start-pagination'), '12');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-pagination-page')), '12');
    const rtl = page.locator('#rtl-pagination [data-pagination-page="3"]');
    await rtl.focus();
    await page.keyboard.press('ArrowLeft');
    await settle();
    assert.equal(await readActive('rtl-pagination'), '4', 'RTL left arrow advances to the next page');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-pagination-page')), '4');
    report.keyboard = { ltrHomeEnd: 'passed', rtlArrow: 'passed' };

    assert.equal(await page.locator('#auto-breadcrumbs').evaluate(element => element.tagName.toLowerCase()), 'section');
    assert.equal(await page.locator('#auto-breadcrumbs').getAttribute('aria-label'), 'Auto path');
    assert.equal(await page.locator('#crumb-prepend').innerText(), 'Start');
    assert.equal(await page.locator('#auto-breadcrumbs .slot-divider').count(), 2);
    assert.equal(await page.locator('#auto-breadcrumbs .slot-divider').first().getAttribute('data-divider-index'), '0');
    assert.equal(await page.locator('#auto-breadcrumbs a[href="#home"]').count(), 1);
    assert.equal(await page.locator('#auto-breadcrumbs a[href="#enabled"]').count(), 1);
    assert.equal(await page.locator('#auto-breadcrumbs a[href="#current"]').count(), 0, 'last auto item is disabled by default');
    assert.equal(await page.locator('#manual-breadcrumbs #manual-divider').innerText(), '::');
    assert.equal(await page.locator('#divider-slot-content').innerText(), 'Slot wins');
    assert.equal(await page.locator('#custom-item-tag').evaluate(element => element.tagName.toLowerCase()), 'span');

    await page.evaluate(() => window.paginationBreadcrumbsProtocol.setNavigationDisabled(true));
    await page.evaluate(() => window.paginationBreadcrumbsProtocol.setManualDisabled(true));
    await settle();
    assert.equal(await page.locator('#auto-breadcrumbs a[href="#home"]').count(), 0, 'group disabled propagates to generated items');
    assert.equal(await page.locator('#auto-breadcrumbs a[href="#enabled"]').count(), 1, 'explicit disabled=false overrides group default');
    assert.equal(await page.locator('#manual-breadcrumbs a[href="#manual"]').count(), 0, 'group disabled propagates to hand-written items');
    assert.equal(await page.locator('#manual-breadcrumbs a[href="#explicit"]').count(), 1, 'explicit child disabled=false remains enabled');
    await page.evaluate(() => window.paginationBreadcrumbsProtocol.setManualDisabled(false));
    await settle();
    assert.equal(await page.locator('#manual-breadcrumbs a[href="#manual"]').count(), 1, 'inherited disabled state updates dynamically');

    await page.locator('#route-crumb a').click();
    await page.waitForFunction(() => location.hash === '#route-target');
    report.route = { href: await page.locator('#route-crumb a').getAttribute('href'), current: await page.locator('#route-crumb a').getAttribute('aria-current') };
    assert.equal(report.route.href, '#route-target');

    report.breadcrumbs = {
        autoItems: await page.locator('#auto-breadcrumbs ol > li').count(),
        inheritedDisabledDynamic: true,
        customDivider: await page.locator('#manual-divider').innerText(),
        prepend: await page.locator('#crumb-prepend').innerText(),
        route: await page.locator('#route-crumb a').getAttribute('href')
    };
    assert.deepEqual(errors, [], `browser runtime errors/warnings: ${errors.join(' | ')}`);
    await page.screenshot({ path: path.join(evidence, 'pagination-breadcrumbs.png'), fullPage: true });
    await (await import('node:fs/promises')).writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log('pagination/breadcrumbs protocol checks passed');
} catch (error) {
    report.failure = error instanceof Error ? error.stack : String(error);
    await (await import('node:fs/promises')).writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    throw error;
} finally {
    if (app) await app.close();
    await server.close();
}
