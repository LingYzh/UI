import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const evidence = path.resolve('artifacts/component-audit-root/tooltip-back-protocols');
const routerFixture = path.resolve('artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js');
await mkdir(evidence, { recursive: true });
const sourcePaths = [
    'src/ui/UiTooltip.vue',
    'src/ui/overlay-back.ts',
    'src/ui/overlay-lifecycle.ts'
];
const sourceHashes = async () => Object.fromEntries(await Promise.all(sourcePaths.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.resolve(file))).digest('hex')
])));
const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="attach-target"></div><div id="app"></div><script type="module">
    import { createApp, h, KeepAlive, mergeProps, nextTick, reactive } from 'vue';
    import { createRouter, createWebHistory } from '/artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js';
    import * as UI from '/src/ui/index.ts';
    import '/src/ui/styles.css';

    const noRouter = new URLSearchParams(location.search).has('no-router');
    const router = createRouter({ history: createWebHistory('/__tooltip_back__/'), routes: [{ path: '/:page', component: { render: () => null } }] });
    const state = reactive({
        tooltip: false,
        closeOnBack: 'enabled',
        persistent: false,
        tooltipUpdates: [],
        contained: false,
        attach: false,
        eager: true,
        dialog: false,
        menu: false,
        dialogUpdates: [],
        menuUpdates: [],
        cachedMounted: true,
        cachedActive: true,
        cachedTooltip: false,
        cachedUpdates: [],
        lowerTooltip: false,
        topTooltip: false,
        lowerUpdates: [],
        topUpdates: []
    });

    function tooltipNode(id, modelName, updateName, options = {}) {
        const props = {
            id,
            standardProtocol: true,
            modelValue: state[modelName],
            persistent: options.persistent === undefined ? state.persistent : options.persistent,
            openOnHover: false,
            openOnFocus: false,
            openOnClick: false,
            contained: options.contained ?? state.contained,
            attach: options.attach ?? state.attach,
            eager: options.eager ?? state.eager,
            scrollStrategy: options.scrollStrategy ?? 'none',
            'onUpdate:modelValue': value => {
                state[modelName] = value;
                state[updateName].push(value);
            }
        };
        if (options.closeOnBack !== 'omitted') props.closeOnBack = options.closeOnBack === undefined ? state.closeOnBack === 'enabled' : options.closeOnBack;
        return h(UI.UTooltip, props, {
            activator: scope => h('button', mergeProps(scope.props, { id: id + '-trigger', ref: scope.activatorRef }), 'tooltip trigger'),
            default: () => h('span', { id: id + '-content' }, 'tooltip content')
        });
    }

    const app = createApp({
        render() {
            const dialog = h(UI.UDialog, {
                contentProps: { id: 'back-dialog' },
                modelValue: state.dialog,
                closeOnBack: true,
                scrollStrategy: 'none',
                'onUpdate:modelValue': value => { state.dialog = value; state.dialogUpdates.push(value); }
            }, {
                default: () => [
                    h('button', { id: 'dialog-content' }, 'dialog content'),
                    h(UI.UMenu, {
                        contentProps: { id: 'back-menu' },
                        modelValue: state.menu,
                        closeOnBack: true,
                        panel: true,
                        'onUpdate:modelValue': value => { state.menu = value; state.menuUpdates.push(value); }
                    }, { default: () => h('button', { id: 'menu-content' }, 'menu content') })
                ]
            });
            const cached = state.cachedMounted ? h(KeepAlive, null, {
                default: () => state.cachedActive ? tooltipNode('cached-tooltip', 'cachedTooltip', 'cachedUpdates', { closeOnBack: true, scrollStrategy: 'block' }) : null
            }) : null;
            return h('main', [
                dialog,
                tooltipNode('back-tooltip', 'tooltip', 'tooltipUpdates', { closeOnBack: state.closeOnBack === 'default' ? 'omitted' : state.closeOnBack === 'enabled', persistent: state.persistent }),
                cached,
                tooltipNode('lower-tooltip', 'lowerTooltip', 'lowerUpdates', { closeOnBack: true }),
                tooltipNode('top-tooltip', 'topTooltip', 'topUpdates', { closeOnBack: true })
            ]);
        }
    });
    if (!noRouter) app.use(router);
    app.use(UI.createUI()).mount('#app');
    if (!noRouter) await router.isReady();
    window.tooltipBackProbe = {
        state,
        router,
        flush: async () => { await nextTick(); await nextTick(); },
        read: () => ({
            route: noRouter ? location.pathname : router.currentRoute.value.fullPath,
            tooltip: document.querySelector('#back-tooltip')?.getAttribute('aria-hidden') === 'false',
            tooltipPopover: document.querySelector('#back-tooltip')?.matches(':popover-open') ?? false,
            dialog: state.dialog,
            menu: state.menu,
            cachedTooltip: document.querySelector('#cached-tooltip')?.getAttribute('aria-hidden') === 'false',
            cachedPopover: document.querySelector('#cached-tooltip')?.matches(':popover-open') ?? false,
            lowerTooltip: document.querySelector('#lower-tooltip')?.getAttribute('aria-hidden') === 'false',
            topTooltip: document.querySelector('#top-tooltip')?.getAttribute('aria-hidden') === 'false',
            bodyOverflow: document.body.style.overflow,
            attachedParent: document.querySelector('#back-tooltip')?.parentElement?.id ?? '',
            tooltipExists: !!document.querySelector('#back-tooltip')
        })
    };
</script></body></html>`;

const vite = await createServer({
    appType: 'custom',
    logLevel: 'error',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: { noDiscovery: true, include: ['highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] },
    server: { host: '127.0.0.1', port: 0, hmr: false }
});
vite.middlewares.use('/__tooltip_back__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await vite.transformIndexHtml('/__tooltip_back__', fixture));
});

const report = {
    generatedAt: new Date().toISOString(),
    fixturePath: path.relative(process.cwd(), routerFixture).replaceAll(path.sep, '/'),
    fixtureSha256: createHash('sha256').update(await readFile(routerFixture)).digest('hex'),
    sourceSha256: await sourceHashes(),
    checks: [],
    errors: [],
    warnings: []
};
async function captureBrowserErrors(page) {
    await page.addInitScript(() => {
        window.__tooltipBackErrors = [];
        window.__tooltipBackPhase = 'startup';
        window.addEventListener('error', event => {
            window.__tooltipBackErrors.push({ kind: 'error', phase: window.__tooltipBackPhase, message: event.message, file: event.filename, line: event.lineno });
        });
        window.addEventListener('unhandledrejection', event => {
            const reason = event.reason;
            window.__tooltipBackErrors.push({ kind: 'unhandledrejection', phase: window.__tooltipBackPhase, message: reason instanceof Error ? reason.message : String(reason) });
        });
    });
}
let browser;
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();
    await captureBrowserErrors(page);
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.warnings.push(message.text());
    });
    const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
    await page.goto(`${base}/__tooltip_back__/one`);
    await page.waitForFunction(() => !!window.tooltipBackProbe);
    const read = () => page.evaluate(() => window.tooltipBackProbe.read());
    const set = async values => {
        await page.evaluate(async values => {
            Object.assign(window.tooltipBackProbe.state, values);
            await window.tooltipBackProbe.flush();
        }, values);
        await page.waitForTimeout(220);
    };
    const push = async route => page.evaluate(route => window.tooltipBackProbe.router.push(route), route);
    const back = async () => {
        await page.evaluate(() => history.back());
        await page.waitForTimeout(320);
    };
    const waitTooltip = async (id, visible = true) => page.waitForFunction(({ id, visible }) => {
        const tooltip = document.getElementById(id);
        return !!tooltip && (tooltip.getAttribute('aria-hidden') === 'false') === visible;
    }, { id, visible });
    const mark = async phase => page.evaluate(phase => { window.__tooltipBackPhase = phase; }, phase);

    await mark('router-close');
    await push('/two');
    await set({ tooltip: true, closeOnBack: 'enabled', persistent: false });
    await waitTooltip('back-tooltip');
    assert.equal((await read()).tooltipPopover, true);
    await back();
    assert.equal((await read()).route, '/two');
    assert.equal((await read()).tooltip, false);
    assert.deepEqual(await page.evaluate(() => window.tooltipBackProbe.state.tooltipUpdates), [false]);
    await back();
    assert.equal((await read()).route, '/one');
    report.checks.push('closeOnBack=true cancels a real history back, closes the tooltip, and lets the next back navigate.');

    await mark('default-disabled');
    await push('/two');
    await set({ dialog: true, tooltip: true, closeOnBack: 'default' });
    await page.waitForFunction(() => document.querySelector('#back-dialog')?.open === true);
    await waitTooltip('back-tooltip');
    await back();
    assert.equal((await read()).route, '/one');
    assert.equal((await read()).tooltip, true);
    assert.equal((await read()).dialog, true);
    report.checks.push('Omitted closeOnBack keeps its false default, allows router navigation, and leaves a lower Dialog open.');
    await set({ tooltip: false, dialog: false });
    await page.waitForFunction(() => document.querySelector('#back-dialog')?.open === false);

    await mark('persistent');
    await push('/two');
    await set({ tooltip: true, closeOnBack: 'enabled', persistent: true });
    await waitTooltip('back-tooltip');
    await back();
    assert.equal((await read()).route, '/two');
    assert.equal((await read()).tooltip, true);
    assert.deepEqual(await page.evaluate(() => window.tooltipBackProbe.state.tooltipUpdates), [false]);
    report.checks.push('persistent tooltip cancels router back and remains open without emitting a close.');
    await set({ tooltip: false, persistent: false });
    await back();
    assert.equal((await read()).route, '/one');

    await mark('attach-contained-and-recreated-bubble');
    await push('/two');
    await set({ tooltip: true, closeOnBack: 'enabled', eager: false, attach: '#attach-target', contained: false });
    await waitTooltip('back-tooltip');
    await mark('attached-visible');
    assert.equal((await read()).attachedParent, 'attach-target');
    await page.evaluate(() => { window.tooltipBackProbe.previousBubble = document.querySelector('#back-tooltip'); });
    await set({ contained: true });
    await mark('contained-visible');
    assert.equal((await read()).tooltipPopover, false);
    assert.notEqual((await read()).attachedParent, 'attach-target');
    await mark('contained-close');
    await back();
    assert.equal((await read()).route, '/two');
    await page.waitForFunction(() => !document.querySelector('#back-tooltip'));
    await mark('eager-false-bubble-removed');
    assert.equal((await read()).tooltipExists, false);
    await set({ tooltip: true, attach: false, contained: false });
    await waitTooltip('back-tooltip');
    await mark('eager-false-bubble-recreated');
    assert.equal(await page.evaluate(() => window.tooltipBackProbe.previousBubble !== document.querySelector('#back-tooltip')), true);
    await back();
    assert.equal((await read()).route, '/two');
    await back();
    assert.equal((await read()).route, '/one');
    report.checks.push('Changing attach/contained resets presentation state, and an eager=false bubble can be replaced and registered again.');
    await set({ tooltip: false, attach: false, contained: false, eager: true });

    await mark('tooltip-menu-dialog-order');
    await push('/two');
    await set({ dialog: true });
    await page.waitForFunction(() => document.querySelector('#back-dialog')?.open === true);
    await set({ menu: true });
    await page.waitForFunction(() => document.querySelector('#back-menu')?.dataset.state === 'open');
    await set({ tooltip: true, closeOnBack: 'enabled' });
    await waitTooltip('back-tooltip');
    await back();
    assert.equal((await read()).route, '/two');
    assert.equal((await read()).tooltip, false);
    assert.equal((await read()).menu, true);
    assert.equal((await read()).dialog, true);
    await back();
    assert.equal((await read()).menu, false);
    assert.equal((await read()).dialog, true);
    await back();
    assert.equal((await read()).dialog, false);
    report.checks.push('Tooltip above Menu and Dialog closes first; each back closes only the current top overlay.');
    await back();
    assert.equal((await read()).route, '/one');

    await mark('keepalive-lifecycle');
    await push('/two');
    await set({ dialog: true, cachedMounted: true, cachedActive: true, cachedTooltip: true });
    await page.waitForFunction(() => document.querySelector('#back-dialog')?.open === true && document.querySelector('#cached-tooltip')?.matches(':popover-open') === true);
    assert.equal((await read()).bodyOverflow, 'hidden');
    await set({ cachedActive: false });
    assert.equal((await read()).cachedPopover, false);
    assert.equal((await read()).bodyOverflow, '');
    await back();
    assert.equal((await read()).route, '/two');
    assert.equal((await read()).dialog, false);
    assert.equal((await read()).cachedTooltip, false);
    await set({ dialog: true, cachedActive: true, cachedTooltip: true });
    await page.waitForFunction(() => document.querySelector('#cached-tooltip')?.matches(':popover-open') === true);
    assert.equal((await read()).bodyOverflow, 'hidden');
    await back();
    assert.equal((await read()).cachedTooltip, false);
    assert.equal((await read()).dialog, true);
    await set({ cachedTooltip: true });
    await page.waitForFunction(() => document.querySelector('#cached-tooltip')?.matches(':popover-open') === true);
    await set({ cachedMounted: false });
    assert.equal((await read()).cachedPopover, false);
    assert.equal((await read()).bodyOverflow, '');
    await back();
    assert.equal((await read()).dialog, false);
    report.checks.push('KeepAlive deactivation releases the stack and scroll lock; reactivation restores the controlled tooltip; unmount cleans it again.');

    const fallbackPage = await browser.newPage();
    await captureBrowserErrors(fallbackPage);
    fallbackPage.on('pageerror', error => report.errors.push(error.message));
    fallbackPage.on('console', message => {
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.warnings.push(message.text());
    });
    await fallbackPage.goto(`${base}/__tooltip_back__/standalone?no-router`);
    await fallbackPage.waitForFunction(() => !!window.tooltipBackProbe);
    await fallbackPage.evaluate(() => { window.__tooltipBackPhase = 'no-router-popstate-fallback'; });
    await fallbackPage.evaluate(async () => {
        Object.assign(window.tooltipBackProbe.state, { lowerTooltip: true });
        await window.tooltipBackProbe.flush();
    });
    await fallbackPage.waitForFunction(() => document.querySelector('#lower-tooltip')?.matches(':popover-open') === true);
    await fallbackPage.evaluate(async () => {
        Object.assign(window.tooltipBackProbe.state, { topTooltip: true });
        await window.tooltipBackProbe.flush();
    });
    await fallbackPage.waitForFunction(() => document.querySelector('#top-tooltip')?.matches(':popover-open') === true);
    await fallbackPage.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
    await fallbackPage.waitForFunction(() => document.querySelector('#top-tooltip')?.getAttribute('aria-hidden') === 'true');
    assert.equal(await fallbackPage.locator('#lower-tooltip').getAttribute('aria-hidden'), 'false');
    report.checks.push('Without Vue Router, synthetic popstate closes only the top tooltip through the fallback handler.');
    report.browserErrors = await Promise.all([page, fallbackPage].map(target => target.evaluate(() => window.__tooltipBackErrors ?? [])));
    for (const errors of report.browserErrors) {
        report.errors.push(...errors.map(error => `${error.kind} [${error.phase}] ${error.message}${error.file ? ` (${error.file}:${error.line})` : ''}`));
    }
    await fallbackPage.close();

    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.warnings, []);
} catch (error) {
    report.errors.push(error instanceof Error ? error.stack ?? error.message : String(error));
    throw error;
} finally {
    report.sourceSha256After = await sourceHashes();
    report.sourceStableDuringRun = JSON.stringify(report.sourceSha256) === JSON.stringify(report.sourceSha256After);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    await browser?.close();
    await vite.close();
}

process.stdout.write(`tooltip back protocols: ${report.checks.length} checks passed; ${report.errors.length} errors; report ${path.join(evidence, 'report.json')}\n`);
