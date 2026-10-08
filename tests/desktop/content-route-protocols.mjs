import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/content-route-protocols');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html>
<html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="app"></div>
<script type="module">
    import { createApp, computed, h, nextTick, reactive } from 'vue';
    import { createRouter, createMemoryHistory } from '/artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js';
    import * as UI from '/src/ui/index.ts';
    import '/src/ui/styles.css';

    const state = reactive({
        routeChanges: 0,
        lastRoute: '',
        cardHrefClicks: 0,
        cardPreventClicks: 0,
        cardNestedClicks: 0,
        cardNestedButtonClicks: 0,
        cardNestedLinkClicks: 0,
        cardDivClicks: 0,
        cardTagClicks: 0,
        disabledButtonClicks: 0,
        loadingButtonClicks: 0,
        emptyDefaultActions: 0,
        emptySlotActions: 0,
        emptyDisabledActions: 0,
        emptySlotScope: null,
        emptyDisabledScope: null,
        treeDisabled: false,
        treeModel: [],
        treeSelectedUpdates: [],
        treeModelUpdates: [],
        treeActivated: [],
        treeActivatedUpdates: [],
        treeOpenedUpdates: [],
        nestedTitleClicks: 0
    });

    const routes = [
        { path: '/', name: 'home', component: { render: () => null } },
        { path: '/record/:id', name: 'record', component: { render: () => null } },
        { path: '/after', name: 'after', component: { render: () => null } },
        { path: '/replace-target', name: 'replace-target', component: { render: () => null } },
        {
            path: '/base',
            name: 'base',
            component: { render: () => null },
            children: [{ path: 'child', name: 'base-child', component: { render: () => null } }]
        },
        { path: '/empty-default', name: 'empty-default', component: { render: () => null } },
        { path: '/empty-slot', name: 'empty-slot', component: { render: () => null } },
        { path: '/empty-disabled', name: 'empty-disabled', component: { render: () => null } },
        { path: '/tree-route', name: 'tree-route', component: { render: () => null } },
        { path: '/tree-branch', name: 'tree-branch', component: { render: () => null } },
        { path: '/tree-check', name: 'tree-check', component: { render: () => null } },
        { path: '/tree-reactive', name: 'tree-reactive', component: { render: () => null } },
        { path: '/tree-nested', name: 'tree-nested', component: { render: () => null } },
        { path: '/tree-keyboard', name: 'tree-keyboard', component: { render: () => null } }
    ];
    const router = createRouter({ history: createMemoryHistory(), routes });
    await router.push('/');
    router.afterEach(to => {
        state.routeChanges++;
        state.lastRoute = to.fullPath;
    });

    const treeItems = reactive([
        { value: 'tree-route', title: 'Tree route', props: { id: 'tree-route-row', to: { name: 'tree-route' }, exact: true } },
        { value: 'tree-href', title: 'Href row', props: { id: 'tree-href-row', href: '/literal-tree-href' } },
        {
            value: 'tree-branch',
            title: 'Tree branch',
            props: { id: 'tree-branch-row', to: { name: 'tree-branch' } },
            children: [{ value: 'tree-check', title: 'Check child', props: { id: 'tree-check-row', to: { name: 'tree-check' } } }]
        },
        { value: 'tree-reactive', title: 'Reactive route', props: { id: 'tree-reactive-row', to: { name: 'tree-reactive' }, disabled: false } },
        { value: 'tree-nested', title: 'Nested title', props: { id: 'tree-nested-row', to: { name: 'tree-nested' } } },
        { value: 'tree-keyboard', title: 'Keyboard route', props: { id: 'tree-keyboard-row', to: { name: 'tree-keyboard' } } }
    ]);

    const Root = {
        render() {
            return h('main', [
                h('section', { id: 'card-cases' }, [
                    h(UI.UCard, { id: 'card-named', to: { name: 'record', params: { id: 'named' }, query: { source: 'card' } } }, () => 'Named card'),
                    h(UI.UCard, { id: 'card-replace', to: { name: 'replace-target' }, replace: true }, () => 'Replace card'),
                    h(UI.UCard, { id: 'card-active', to: '/base' }, () => 'Active parent'),
                    h(UI.UCard, { id: 'card-exact', to: '/base', exact: true }, () => 'Exact parent'),
                    h(UI.UCard, { id: 'card-exact-query', to: { name: 'base', query: { x: '1' } }, exact: true }, () => 'Exact query'),
                    h(UI.UCard, { id: 'card-disabled', to: { name: 'record', params: { id: 'disabled' } }, disabled: true }, () => 'Disabled card'),
                    h(UI.UCard, { id: 'card-link-false', to: { name: 'record', params: { id: 'off' } }, link: false }, () => 'No link card'),
                    h(UI.UCard, {
                        id: 'card-href-only',
                        href: '/external-only',
                        onClick: event => { state.cardHrefClicks++; event.preventDefault(); }
                    }, () => 'Href card'),
                    h(UI.UCard, {
                        id: 'card-prevent-default',
                        to: { name: 'record', params: { id: 'prevent' } },
                        onClick: event => { state.cardPreventClicks++; event.preventDefault(); }
                    }, () => 'Prevented card'),
                    h(UI.UCard, {
                        id: 'card-nested',
                        to: { name: 'record', params: { id: 'nested' } },
                        onClick: () => { state.cardNestedClicks++; }
                    }, {
                        default: () => [
                            h('span', 'Card content'),
                            h('button', { id: 'card-nested-button', type: 'button', onClick: () => { state.cardNestedButtonClicks++; } }, 'Nested action'),
                            h(UI.UButton, {
                                id: 'card-nested-route-link',
                                to: { name: 'record', params: { id: 'nested-child' } },
                                ripple: false,
                                onClick: () => { state.cardNestedLinkClicks++; }
                            }, () => 'Nested route action')
                        ]
                    }),
                    h(UI.UCard, {
                        id: 'card-as-div',
                        as: 'div',
                        width: 280,
                        minWidth: 180,
                        maxWidth: 320,
                        onClick: () => { state.cardDivClicks++; }
                    }, () => 'Keyboard div'),
                    h(UI.UCard, {
                        id: 'card-tag-button',
                        to: { name: 'record', params: { id: 'tag' } },
                        tag: 'button',
                        onClick: () => { state.cardTagClicks++; }
                    }, () => 'Tag button')
                ]),
                h('section', { id: 'empty-state-cases' }, [
                    h(UI.UEmptyState, {
                        id: 'empty-default',
                        to: { name: 'empty-default' },
                        actionText: 'Open default action',
                        'onClick:action': () => { state.emptyDefaultActions++; }
                    }),
                    h(UI.UEmptyState, {
                        id: 'empty-slot',
                        to: { name: 'empty-slot' },
                        href: '/slot-href-fallback',
                        actionText: 'Unused fallback',
                        'onClick:action': () => { state.emptySlotActions++; }
                    }, {
                        actions: ({ props }) => {
                            state.emptySlotScope = {
                                toName: props.to?.name,
                                href: props.href,
                                disabled: props.disabled ?? false,
                                hasDisabled: Object.hasOwn(props, 'disabled'),
                                hasClick: typeof props.onClick === 'function'
                            };
                            return h(UI.UButton, { ...props, id: 'empty-slot-button', ripple: false }, () => 'Open slot action');
                        }
                    }),
                    h(UI.UEmptyState, {
                        id: 'empty-disabled',
                        to: { name: 'empty-disabled' },
                        disabled: true,
                        actionText: 'Disabled action',
                        'onClick:action': () => { state.emptyDisabledActions++; }
                    }, {
                        actions: ({ props }) => {
                            state.emptyDisabledScope = {
                                toName: props.to?.name,
                                disabled: props.disabled,
                                hasClick: typeof props.onClick === 'function'
                            };
                            return h(UI.UButton, { ...props, id: 'empty-disabled-button', ripple: false }, () => 'Disabled slot action');
                        }
                    })
                ]),
                h('section', { id: 'button-cases' }, [
                    h(UI.UButton, {
                        id: 'button-disabled-to',
                        to: { name: 'record', params: { id: 'disabled-button' } },
                        disabled: true,
                        onClick: () => { state.disabledButtonClicks++; }
                    }, () => 'Disabled route button'),
                    h(UI.UButton, {
                        id: 'button-disabled-href',
                        href: '/external-disabled-button',
                        disabled: true,
                        onClick: () => { state.disabledButtonClicks++; }
                    }, () => 'Disabled href button'),
                    h(UI.UButton, {
                        id: 'button-loading-to',
                        to: { name: 'record', params: { id: 'loading-button' } },
                        loading: true,
                        onClick: () => { state.loadingButtonClicks++; }
                    }, () => 'Loading route button'),
                    h(UI.UButton, {
                        id: 'button-loading-href',
                        href: '/external-loading-button',
                        loading: true,
                        onClick: () => { state.loadingButtonClicks++; }
                    }, () => 'Loading href button')
                ]),
                h('section', { id: 'tree-case' }, [
                    h(UI.UTreeview, {
                        id: 'route-tree',
                        items: treeItems,
                        selectable: true,
                        activatable: true,
                        modelValue: state.treeModel,
                        activated: state.treeActivated,
                        'onUpdate:modelValue': value => {
                            state.treeModel = value;
                            state.treeModelUpdates.push(value);
                        },
                        'onUpdate:selected': value => { state.treeSelectedUpdates.push(value); },
                        'onUpdate:activated': value => {
                            state.treeActivated = value;
                            state.treeActivatedUpdates.push(value);
                        },
                        'onUpdate:opened': value => { state.treeOpenedUpdates.push(value); }
                    }, {
                        title: ({ item, title }) => item.value === 'tree-nested'
                            ? h('button', { id: 'tree-title-button', type: 'button', onClick: () => { state.nestedTitleClicks++; } }, 'Nested title action')
                            : title
                    })
                ])
            ]);
        }
    };
    const app = createApp(Root);
    app.use(router);
    app.use(UI.createUI());
    app.mount('#app');

    window.contentRouteProtocol = {
        state,
        router,
        registry: {
            card: Boolean(UI.UCard),
            button: Boolean(UI.UButton),
            emptyState: Boolean(UI.UEmptyState),
            treeview: Boolean(UI.UTreeview),
            createUI: typeof UI.createUI === 'function',
            routerLink: Boolean(app.component('RouterLink'))
        },
        async flush() { await nextTick(); await nextTick(); },
        async push(path) { await router.push(path); await nextTick(); await nextTick(); },
        async setTreeDisabled(value) {
            state.treeDisabled = value;
            treeItems[3].props.disabled = value;
            await nextTick();
            await nextTick();
        },
        async back() { router.back(); await new Promise(resolve => setTimeout(resolve, 20)); await nextTick(); },
        readPath() { return router.currentRoute.value.fullPath; },
        unmount() { app.unmount(); }
    };
</script></body></html>`;

const route = '/__content_route_protocols';
const evidenceSourceFiles = [
    'src/ui/UiCard.vue',
    'src/ui/UiButton.vue',
    'src/ui/UEmptyState.vue',
    'src/ui/UTreeview.vue',
    'src/ui/UiLinkSurface.vue',
    'src/ui/router.ts',
    'src/ui/index.ts'
];

async function sourceHashes() {
    return Object.fromEntries(await Promise.all(evidenceSourceFiles.map(async file => [
        file,
        createHash('sha256').update(await readFile(file)).digest('hex')
    ])));
}

const sourceSha256Before = await sourceHashes();
const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'error',
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
    server: {
        host: '127.0.0.1',
        port: 0,
        strictPort: false,
        hmr: false,
        watch: { ignored: ['**/artifacts/**'] }
    },
    plugins: [{
        name: 'content-route-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== route) { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml(route, fixture));
            });
        }
    }]
});

const report = {
    method: 'Vite source fixture + public src/ui/index.ts + archived vue-router 4.6.3 memory history + Chromium',
    routerVersion: '4.6.3',
    evidence,
    sourceSha256Before,
    sourceSha256After: null,
    checks: [],
    failures: [],
    pageErrors: [],
    consoleErrors: [],
    vueWarnings: []
};
const pageErrors = [];
const consoleErrors = [];
const vueWarnings = [];
const failures = [];
let browser;
let page;

async function check(name, test) {
    try {
        await test();
        report.checks.push(name);
    } catch (error) {
        failures.push({
            check: name,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}

async function flush() {
    await page.evaluate(() => window.contentRouteProtocol.flush());
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function go(pathname) {
    await page.evaluate(value => window.contentRouteProtocol.push(value), pathname);
    await page.waitForFunction(expected => window.contentRouteProtocol.readPath() === expected, pathname);
    await flush();
}

async function currentPath() {
    return page.evaluate(() => window.contentRouteProtocol.readPath());
}

try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) vueWarnings.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}${route}`);
    await page.waitForFunction(() => Boolean(window.contentRouteProtocol));
    await flush();

    await check('public exports and router registration', async () => {
        const registry = await page.evaluate(() => window.contentRouteProtocol.registry);
        assert.deepEqual(registry, { card: true, button: true, emptyState: true, treeview: true, createUI: true, routerLink: true });
    });

    await check('Card named object route and replace history', async () => {
        const namedCard = page.locator('#card-named');
        assert.equal(await namedCard.evaluate(element => element.tagName), 'A');
        assert.equal(await namedCard.getAttribute('href'), '/record/named?source=card');
        await namedCard.click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/record/named?source=card');
        await go('/after');
        await page.locator('#card-replace').click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/replace-target');
        await page.evaluate(() => window.contentRouteProtocol.back());
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/record/named?source=card');
        assert.equal(await currentPath(), '/record/named?source=card', 'replace leaves the prior route as the back destination');
    });

    await check('Card exact/current state', async () => {
        await go('/base/child?x=1');
        const cards = await page.evaluate(() => {
            const active = document.querySelector('#card-active');
            const exact = document.querySelector('#card-exact');
            const exactQuery = document.querySelector('#card-exact-query');
            return {
                activeHref: active?.getAttribute('href'),
                activeCurrent: active?.getAttribute('aria-current'),
                exactCurrentOnChild: exact?.getAttribute('aria-current'),
                exactHref: exact?.getAttribute('href'),
                exactQueryCurrentOnChild: exactQuery?.getAttribute('aria-current')
            };
        });
        assert.equal(cards.activeHref, '/base');
        assert.equal(cards.activeCurrent, 'page');
        assert.equal(cards.exactHref, '/base');
        assert.equal(cards.exactCurrentOnChild, null);
        assert.equal(cards.exactQueryCurrentOnChild, null);
        await go('/base?x=1');
        assert.equal(await page.locator('#card-exact').getAttribute('aria-current'), null, 'path-exact without the same query is not current');
        assert.equal(await page.locator('#card-exact-query').getAttribute('aria-current'), 'page', 'exact compares the stable query as well as the path');
    });

    await check('Card disabled/link=false/href/preventDefault and nested control guards', async () => {
        await go('/');
        const before = await currentPath();
        const disabledCard = page.locator('#card-disabled');
        assert.equal(await disabledCard.getAttribute('href'), null);
        assert.equal(await disabledCard.getAttribute('aria-disabled'), 'true');
        assert.equal(await disabledCard.getAttribute('tabindex'), '-1');
        await disabledCard.evaluate(element => element.click());
        const noLinkCard = page.locator('#card-link-false');
        assert.equal(await noLinkCard.getAttribute('href'), null);
        await noLinkCard.evaluate(element => element.click());
        await page.locator('#card-href-only').click();
        await page.locator('#card-prevent-default').click();
        await page.locator('#card-nested-button').click();
        await flush();
        assert.equal(await currentPath(), before, 'only explicit router links navigate');
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardHrefClicks), 1);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardPreventClicks), 1);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardNestedClicks), 0);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardNestedButtonClicks), 1);
        await page.locator('#card-nested-route-link').click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/record/nested-child');
        await flush();
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardNestedClicks), 0, 'a nested link does not activate its parent card');
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardNestedLinkClicks), 1);
    });

    await check('Card tag/as/size and explicit div keyboard activation', async () => {
        const div = page.locator('#card-as-div');
        assert.equal(await div.evaluate(element => element.tagName), 'DIV');
        assert.equal(await div.getAttribute('role'), 'button');
        assert.equal(await div.getAttribute('tabindex'), '0');
        const sizes = await div.evaluate(element => ({
            width: getComputedStyle(element).width,
            minWidth: getComputedStyle(element).minWidth,
            maxWidth: getComputedStyle(element).maxWidth
        }));
        assert.equal(sizes.width, '280px');
        assert.equal(sizes.minWidth, '180px');
        assert.equal(sizes.maxWidth, '320px');
        await div.focus();
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardDivClicks), 2);
        const tagButton = page.locator('#card-tag-button');
        assert.equal(await tagButton.evaluate(element => element.tagName), 'BUTTON');
        assert.equal(await tagButton.getAttribute('type'), 'button');
        await tagButton.click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/record/tag');
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.cardTagClicks), 1);
    });

    await check('EmptyState default action emits once and navigates once', async () => {
        await go('/');
        const beforeRoutes = await page.evaluate(() => window.contentRouteProtocol.state.routeChanges);
        await page.locator('#empty-default .ui-button').click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/empty-default');
        await flush();
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.emptyDefaultActions), 1);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.routeChanges), beforeRoutes + 1, 'default action causes one router transition');
    });

    await check('EmptyState action slot receives route props and navigates once', async () => {
        await go('/');
        const beforeRoutes = await page.evaluate(() => window.contentRouteProtocol.state.routeChanges);
        await page.locator('#empty-slot-button').click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/empty-slot');
        await flush();
        const slotScope = await page.evaluate(() => window.contentRouteProtocol.state.emptySlotScope);
        assert.deepEqual(slotScope, {
            toName: 'empty-slot',
            href: '/slot-href-fallback',
            disabled: false,
            hasDisabled: true,
            hasClick: true
        });
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.emptySlotActions), 1);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.routeChanges), beforeRoutes + 1, 'slot action causes one router transition');
    });

    await check('EmptyState disabled action slot propagates its router guard', async () => {
        await go('/');
        const disabled = page.locator('#empty-disabled-button');
        assert.equal(await disabled.getAttribute('aria-disabled'), 'true');
        assert.equal(await disabled.getAttribute('href'), null);
        assert.deepEqual(await page.evaluate(() => window.contentRouteProtocol.state.emptyDisabledScope), {
            toName: 'empty-disabled',
            disabled: true,
            hasClick: true
        });
        const before = await currentPath();
        const routeChanges = await page.evaluate(() => window.contentRouteProtocol.state.routeChanges);
        await disabled.evaluate(element => element.click());
        await flush();
        assert.equal(await currentPath(), before);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.routeChanges), routeChanges);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.emptyDisabledActions), 0);
    });

    await check('UButton disabled/loading guards block router and native href clicks', async () => {
        await go('/');
        const before = await currentPath();
        const routeChanges = await page.evaluate(() => window.contentRouteProtocol.state.routeChanges);
        for (const id of ['button-disabled-to', 'button-disabled-href', 'button-loading-to', 'button-loading-href']) {
            const button = page.locator(`#${id}`);
            assert.equal(await button.getAttribute('href'), null, `${id} must not expose a navigable href`);
            assert.equal(await button.getAttribute('aria-disabled'), 'true', `${id} exposes disabled state`);
            assert.equal(await button.getAttribute('tabindex'), '-1', `${id} is removed from sequential focus`);
            await button.evaluate(element => element.click());
            assert.ok(await page.evaluate(() => Boolean(window.contentRouteProtocol)), `${id} must not unload the fixture`);
            assert.equal(await currentPath(), before, `${id} must not change the router route`);
        }
        await flush();
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.routeChanges), routeChanges);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.disabledButtonClicks), 0);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.loadingButtonClicks), 0);
    });

    await check('Treeview itemProps to/href DOM and reactive disabled guard', async () => {
        await go('/');
        const tree = page.locator('#route-tree');
        const rows = await tree.locator('[role="treeitem"]').evaluateAll(elements => elements.map(element => ({
            id: element.id,
            tag: element.tagName,
            role: element.getAttribute('role'),
            tabindex: element.getAttribute('tabindex'),
            href: element.getAttribute('href')
        })));
        assert.equal(rows.length, 6);
        assert.ok(rows.every(row => row.role === 'treeitem' && row.tabindex === '0'));
        assert.ok(rows.every(row => row.tag === 'A'), JSON.stringify(rows));
        assert.equal(await page.locator('#tree-route-row').getAttribute('href'), '/tree-route');
        assert.equal(await page.locator('#tree-href-row').getAttribute('href'), '/literal-tree-href');
        const reactiveRow = page.locator('#tree-reactive-row');
        assert.equal(await reactiveRow.getAttribute('href'), '/tree-reactive');
        await page.evaluate(() => window.contentRouteProtocol.setTreeDisabled(true));
        await flush();
        assert.equal(await reactiveRow.getAttribute('aria-disabled'), 'true');
        assert.equal(await reactiveRow.getAttribute('href'), null);
        assert.equal(await reactiveRow.getAttribute('tabindex'), '-1');
        const before = await currentPath();
        await reactiveRow.evaluate(element => element.click());
        assert.equal(await currentPath(), before);
        await page.evaluate(() => window.contentRouteProtocol.setTreeDisabled(false));
        await flush();
        assert.equal(await reactiveRow.getAttribute('href'), '/tree-reactive');
        assert.equal(await reactiveRow.getAttribute('aria-disabled'), null);
    });

    await check('Treeview route click preserves model selection and activation', async () => {
        await go('/');
        await page.locator('#tree-route-row').click();
        await page.waitForFunction(() => window.contentRouteProtocol.readPath() === '/tree-route');
        await flush();
        assert.equal(await page.locator('#tree-route-row').getAttribute('aria-current'), 'page');
        const state = await page.evaluate(() => window.contentRouteProtocol.state);
        assert.deepEqual(state.treeModel, ['tree-route']);
        assert.deepEqual(state.treeModelUpdates.at(-1), ['tree-route']);
        assert.deepEqual(state.treeSelectedUpdates.at(-1), ['tree-route']);
        assert.deepEqual(state.treeActivated, ['tree-route']);
        assert.deepEqual(state.treeActivatedUpdates.at(-1), ['tree-route']);
    });

    await check('Treeview toggle, checkbox, and nested title controls do not navigate', async () => {
        await go('/');
        await page.evaluate(() => {
            const state = window.contentRouteProtocol.state;
            state.treeModel = [];
            state.treeActivated = [];
            state.treeSelectedUpdates = [];
            state.treeActivatedUpdates = [];
        });
        await flush();
        const tree = page.locator('#route-tree');
        await tree.locator('#tree-branch-row .ui-treeview-toggle').click();
        await flush();
        assert.equal(await currentPath(), '/');
        assert.equal(await page.locator('#tree-branch-row').getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('#tree-check-row').count(), 1);
        await page.locator('#tree-check-row input[type="checkbox"]').click();
        await flush();
        assert.equal(await currentPath(), '/');
        assert.deepEqual(await page.evaluate(() => window.contentRouteProtocol.state.treeModel), ['tree-check']);
        const checkedInput = page.locator('#tree-check-row input[type="checkbox"]');
        const checkedState = await checkedInput.evaluate(element => ({
            checked: element.checked,
            attribute: element.getAttribute('checked'),
            selected: element.closest('[role="treeitem"]')?.getAttribute('aria-selected')
        }));
        assert.equal(await checkedInput.isChecked(), true, JSON.stringify({ checkedState, model: await page.evaluate(() => window.contentRouteProtocol.state.treeModel) }));
        await page.locator('#tree-check-row input[type="checkbox"]').focus();
        await page.keyboard.press('Space');
        await flush();
        assert.equal(await currentPath(), '/', 'Space on the nested checkbox must not activate its parent anchor');
        assert.deepEqual(await page.evaluate(() => window.contentRouteProtocol.state.treeModel), []);
        assert.equal(await page.locator('#tree-check-row input[type="checkbox"]').isChecked(), false);
        const activatedBefore = await page.evaluate(() => window.contentRouteProtocol.state.treeActivatedUpdates.length);
        const selectedBefore = await page.evaluate(() => window.contentRouteProtocol.state.treeSelectedUpdates.length);
        await page.locator('#tree-title-button').click();
        await flush();
        assert.equal(await currentPath(), '/');
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.nestedTitleClicks), 1);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.treeActivatedUpdates.length), activatedBefore);
        assert.equal(await page.evaluate(() => window.contentRouteProtocol.state.treeSelectedUpdates.length), selectedBefore);
    });

    await check('Treeview keyboard navigation skips disabled rows and Enter follows the item route', async () => {
        await go('/');
        await page.evaluate(() => window.contentRouteProtocol.setTreeDisabled(true));
        await flush();
        const tree = page.locator('#route-tree');
        await page.locator('#tree-route-row').focus();
        await page.keyboard.press('ArrowDown');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'tree-href-row', 'ArrowDown focuses the next enabled rendered row');
        await page.evaluate(() => window.contentRouteProtocol.setTreeDisabled(false));
        await flush();
        await page.locator('#tree-keyboard-row').focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(50);
        assert.equal(await currentPath(), '/tree-keyboard', 'Enter on a routed treeitem should activate its router link');
    });

    await check('unmount clears all routed row DOM', async () => {
        await page.evaluate(() => window.contentRouteProtocol.unmount());
        assert.equal(await page.locator('#route-tree [role="treeitem"]').count(), 0);
        assert.equal(await page.locator('#card-cases .ui-card').count(), 0);
    });

    report.sourceSha256After = await sourceHashes();
    await check('component source hashes remain unchanged', async () => {
        assert.deepEqual(report.sourceSha256After, sourceSha256Before);
    });
    report.pageErrors = pageErrors;
    report.consoleErrors = consoleErrors;
    report.vueWarnings = vueWarnings;
    await check('no browser errors or Vue warnings', async () => {
        assert.deepEqual(pageErrors, []);
        assert.deepEqual(consoleErrors, []);
        assert.deepEqual(vueWarnings, []);
    });
    report.failures = failures;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 4), 'utf8');
    process.stdout.write(JSON.stringify({ checks: report.checks, failures, evidence, sourceSha256Before, sourceSha256After: report.sourceSha256After }, null, 2));
    assert.equal(failures.length, 0, `${failures.length} content route check(s) failed`);
} catch (error) {
    report.sourceSha256After ??= await sourceHashes();
    report.pageErrors = pageErrors;
    report.consoleErrors = consoleErrors;
    report.vueWarnings = vueWarnings;
    report.failures = failures;
    report.failure = error instanceof Error ? { message: error.message, stack: error.stack } : String(error);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 4), 'utf8');
    throw error;
} finally {
    await browser?.close();
    await vite.close();
}
