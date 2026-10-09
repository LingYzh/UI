import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.join(root, 'artifacts/component-audit-root/overlay-container-protocols');
const fixturePath = path.join(evidence, 'fixture');
const sourceFiles = [
    'src/ui/UOverlay.vue',
    'src/ui/UiDialog.vue',
    'src/ui/UiMenu.vue',
    'src/ui/UiOverlayHost.vue',
    'src/ui/overlay-container.ts',
    'src/ui/overlay-focus.ts',
    'src/ui/overlay-lifecycle.ts',
    'src/ui/overlay-position.ts',
    'src/ui/overlay-back.ts',
    'src/ui/overlay-props.ts',
    'src/ui/overlay-appearance.ts',
    'src/ui/overlay-transition.ts',
    'src/ui/styles.css',
    'src/ui/layout-components.css',
    'src/ui/feedback.css'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async (file) => [
        file,
        createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')
    ])));
}

await mkdir(fixturePath, { recursive: true });
const fixture = [
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><style>',
    'html, body { min-height: 100%; } body { margin: 0; overflow: visible; } #app { min-height: 100%; overflow: visible; }',
    '.local-container { position: relative; width: 360px; height: 220px; margin: 18px; border: 1px solid #aaa; }',
    '#scrollbox { width: 520px; height: 230px; overflow: auto; margin: 20px; } #scroll-content { height: 900px; padding-top: 420px; }',
    '#scroll-target { display: block; width: 80px; height: 36px; }',
    '</style></head><body><div id="app"></div><script type="module">',
    'import { createApp, defineComponent, h, KeepAlive, markRaw, nextTick, reactive, shallowRef, ref } from "vue";',
    'import * as UI from "/src/ui/index.ts";',
    'import "/src/ui/styles.css";',
    'import { createRouter, createWebHistory } from "/artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js";',
    'const state = reactive({',
    '    attachOverlay: false, attachDialog: false, attachMenu: false,',
    '    appearanceOverlay: false, appearanceDialog: false, appearanceScrim: undefined, appearanceOpacity: undefined,',
    '    containerOverlay: false, containerDialog: false, containerMenu: false,',
    '    containedOverlay: false, absoluteOverlay: false, containedDialog: false, absoluteDialog: false, containedMenu: false, absoluteMenu: false,',
    '    focusDialog: false, emptyDialog: false, freeDialog: false, passiveOverlay: false, childMenu: false,',
    '    tabMenu: false, panelMenu: false,',
    '    stackOverlay: false, stackDialog: false, stackOverlayZ: 6400, stackDialogZ: 900,',
    '    geometryOverlay: false, geometryDialog: false, geometryMenu: false,',
    '    keepActive: false, keepOverlay: false, keepDialog: false, freshOverlay: false,',
    '    rapidMounted: false, rapidMenu: false',
    '});',
    'const attachTarget = shallowRef();',
    'const attachOverlayRef = ref(); const attachDialogRef = ref(); const attachMenuRef = ref();',
    'const geometryOverlayRef = ref(); const geometryDialogRef = ref(); const geometryMenuRef = ref();',
    'const pendingTransitionCallbacks = { enter: 0, leave: 0 };',
    'const slowTransition = markRaw({',
    '    css: false,',
    '    onEnter(_element, done) { pendingTransitionCallbacks.enter++; setTimeout(() => { pendingTransitionCallbacks.enter--; done(); }, 180); },',
    '    onLeave(_element, done) { pendingTransitionCallbacks.leave++; setTimeout(() => { pendingTransitionCallbacks.leave--; done(); }, 180); }',
    '});',
    'function model(key) { return { modelValue: state[key], "onUpdate:modelValue": value => { state[key] = value; } }; }',
    'const KeepView = defineComponent({ name: "OverlayContainerKeepView", setup() {',
    '    return function renderKeepView() { return h("section", { id: "keep-view" }, [',
    '        h(UI.UOverlay, { ...model("keepOverlay"), zIndex: 9000, scrollStrategy: "locked", contentProps: { id: "keep-overlay-surface" } }, { default: () => h("button", { id: "keep-overlay-action" }, "Keep overlay") }),',
    '        h(UI.UDialog, { ...model("keepDialog"), zIndex: 10000, scrollStrategy: "locked", retainFocus: false, contentProps: { id: "keep-dialog-surface" } }, { default: () => h("button", { id: "keep-dialog-action" }, "Keep dialog") })',
    '    ]); };',
    '}});',
    'const EmptyView = defineComponent({ name: "OverlayContainerEmptyView", setup() { return () => h("div", { id: "keep-empty-view" }); } });',
    'const Root = defineComponent({ name: "OverlayContainerFixture", setup() {',
    '    return function renderRoot() { return h("main", { id: "main-root" }, [',
    '        h("button", { id: "outside-focus", type: "button" }, "Outside focus"),',
    '        h("button", { id: "after-panel", type: "button" }, "After panel"),',
    '        h("div", { id: "attach-a" }), h("div", { id: "attach-b" }),',
    '        h(UI.UOverlay, { ...model("attachOverlay"), ref: attachOverlayRef, attach: attachTarget.value, zIndex: 3110, retainFocus: false, contentProps: { id: "attach-overlay-surface" } }, { default: () => h("button", { id: "attach-overlay-action" }, "Attach overlay") }),',
    '        h(UI.UDialog, { ...model("attachDialog"), ref: attachDialogRef, attach: attachTarget.value, zIndex: 3120, retainFocus: false, contentProps: { id: "attach-dialog-surface" } }, { default: () => h("button", { id: "attach-dialog-action" }, "Attach dialog") }),',
    '        h(UI.UMenu, { ...model("attachMenu"), ref: attachMenuRef, attach: attachTarget.value, zIndex: 3130, openDelay: 0, closeDelay: 0, contentProps: { id: "attach-menu-surface" } }, {',
    '            activator: scope => h("button", { ...scope.props, id: "attach-menu-trigger" }, "Attach menu"),',
    '            default: () => h("button", { id: "attach-menu-action", role: "menuitem" }, "Attach menu action")',
    '        }),',
    '        h("section", { id: "container-overlay-host", class: "local-container" }, [',
    '            h(UI.UOverlay, { ...model("containerOverlay"), contained: state.containedOverlay, absolute: state.absoluteOverlay, retainFocus: false, contentProps: { id: "container-overlay-surface" } }, { default: () => h("button", { id: "container-overlay-action" }, "Contained overlay") })',
    '        ]),',
    '        h("section", { id: "container-dialog-host", class: "local-container" }, [',
    '            h(UI.UDialog, { ...model("containerDialog"), contained: state.containedDialog, absolute: state.absoluteDialog, retainFocus: false, contentProps: { id: "container-dialog-surface" } }, { default: () => h("button", { id: "container-dialog-action" }, "Contained dialog") })',
    '        ]),',
    '        h("section", { id: "container-menu-host", class: "local-container" }, [',
    '            h(UI.UMenu, { ...model("containerMenu"), contained: state.containedMenu, absolute: state.absoluteMenu, openDelay: 0, closeDelay: 0, contentProps: { id: "container-menu-surface" } }, {',
    '                activator: scope => h("button", { ...scope.props, id: "container-menu-trigger" }, "Contained menu"),',
    '                default: () => h("button", { id: "container-menu-action", role: "menuitem" }, "Contained menu action")',
    '            })',
    '        ]),',
    '        h(UI.UOverlay, { ...model("appearanceOverlay"), scrim: state.appearanceScrim, opacity: state.appearanceOpacity, contentProps: { id: "appearance-overlay-surface" } }, { default: () => h("button", "Appearance overlay") }),',
    '        h(UI.UDialog, { ...model("appearanceDialog"), scrim: state.appearanceScrim, opacity: state.appearanceOpacity, retainFocus: false, contentProps: { id: "appearance-dialog-surface" } }, { default: () => h("button", "Appearance dialog") }),',
    '        h(UI.UDialog, { ...model("focusDialog"), contentProps: { id: "focus-dialog-surface" } }, { default: () => [',
    '            h("button", { id: "focus-first", type: "button" }, "First focus stop"),',
    '            h(UI.UMenu, { ...model("childMenu"), openDelay: 0, closeDelay: 0, closeOnContentClick: false, contentProps: { id: "child-menu-surface" } }, {',
    '                activator: scope => h("button", { ...scope.props, id: "child-menu-trigger", type: "button" }, "Child menu"),',
    '                default: () => [h("button", { id: "child-menu-first", role: "menuitem" }, "Child first"), h("button", { id: "child-menu-last", role: "menuitem" }, "Child last")]',
    '            }),',
    '            h("button", { id: "focus-last", type: "button" }, "Last focus stop")',
    '        ] }),',
    '        h(UI.UDialog, { ...model("emptyDialog"), contentProps: { id: "empty-dialog-surface" } }, { default: () => [] }),',
    '        h(UI.UDialog, { ...model("freeDialog"), retainFocus: false, contentProps: { id: "free-dialog-surface" } }, { default: () => h("button", { id: "free-dialog-action" }, "Free dialog") }),',
    '        h(UI.UOverlay, { ...model("passiveOverlay"), contentProps: { id: "passive-overlay-surface" } }, { default: () => h("button", { id: "passive-overlay-action" }, "Passive overlay") }),',
    '        h(UI.UMenu, { ...model("tabMenu"), openDelay: 0, closeDelay: 0, closeOnContentClick: false, contentProps: { id: "tab-menu-surface" } }, {',
    '            activator: scope => h("button", { ...scope.props, id: "tab-menu-trigger" }, "Tab menu"),',
    '            default: () => [h("button", { id: "tab-menu-first", role: "menuitem" }, "Menu first"), h("button", { id: "tab-menu-last", role: "menuitem" }, "Menu last")]',
    '        }),',
    '        h(UI.UMenu, { ...model("panelMenu"), panel: true, openDelay: 0, closeDelay: 0, closeOnContentClick: false, contentProps: { id: "panel-menu-surface" } }, {',
    '            activator: scope => h("button", { ...scope.props, id: "panel-menu-trigger" }, "Panel menu"),',
    '            default: () => [h("button", { id: "panel-menu-first" }, "Panel first"), h("button", { id: "panel-menu-last" }, "Panel last")]',
    '        }),',
    '        h(UI.UOverlay, { ...model("stackOverlay"), zIndex: state.stackOverlayZ, retainFocus: false, contentProps: { id: "stack-overlay-surface" } }, { default: () => h("button", { id: "stack-overlay-action" }, "Stack overlay") }),',
    '        h(UI.UDialog, { ...model("stackDialog"), zIndex: state.stackDialogZ, retainFocus: false, contentProps: { id: "stack-dialog-surface" } }, { default: () => h("button", { id: "stack-dialog-action" }, "Stack dialog") }),',
    '        h("div", { id: "scrollbox" }, [h("div", { id: "scroll-content" }, [h("button", { id: "scroll-target" }, "Geometry target")])]),',
    '        h(UI.UOverlay, { ...model("geometryOverlay"), ref: geometryOverlayRef, location: "bottom-start", locationStrategy: "connected", target: "#scroll-target", offset: 6, scrim: false, width: 180, contentProps: { id: "geometry-overlay-surface" } }, { default: () => h("button", "Geometry overlay") }),',
    '        h(UI.UDialog, { ...model("geometryDialog"), ref: geometryDialogRef, location: "bottom-start", locationStrategy: "connected", target: "#scroll-target", offset: 6, scrim: false, retainFocus: false, width: 180, contentProps: { id: "geometry-dialog-surface" } }, { default: () => h("button", "Geometry dialog") }),',
    '        h(UI.UMenu, { ...model("geometryMenu"), ref: geometryMenuRef, location: "bottom-start", locationStrategy: "connected", target: "#scroll-target", offset: 6, width: 180, openDelay: 0, closeDelay: 0, contentProps: { id: "geometry-menu-surface" } }, {',
    '            activator: scope => h("button", { ...scope.props, id: "geometry-menu-trigger" }, "Geometry menu"),',
    '            default: () => h("button", { id: "geometry-menu-action", role: "menuitem" }, "Geometry action")',
    '        }),',
    '        h(KeepAlive, null, { default: () => h(state.keepActive ? KeepView : EmptyView) }),',
    '        h(UI.UOverlay, { ...model("freshOverlay"), contentProps: { id: "fresh-overlay-surface" } }, { default: () => h("button", { id: "fresh-overlay-action" }, "Fresh overlay") }),',
    '        state.rapidMounted ? h(UI.UMenu, { ...model("rapidMenu"), transition: slowTransition, scrollStrategy: "locked", openDelay: 0, closeDelay: 0, contentProps: { id: "rapid-menu-surface" } }, {',
    '            activator: scope => h("button", { ...scope.props, id: "rapid-menu-trigger" }, "Rapid menu"),',
    '            default: () => h("button", { id: "rapid-menu-action", role: "menuitem" }, "Rapid action")',
    '        }) : null',
    '    ]); };',
    '}});',
    'const router = createRouter({ history: createWebHistory("/__overlay_container__/"), routes: [{ path: "/:page", component: defineComponent({ render: () => null }) }] });',
    'const app = createApp(Root); app.use(UI.createUI()).use(router).mount("#app");',
    'await router.isReady();',
    'window.overlayContainerProbe = {',
    '    state, router, attachTarget, attachOverlayRef, attachDialogRef, attachMenuRef,',
    '    geometryOverlayRef, geometryDialogRef, geometryMenuRef, pendingTransitionCallbacks, capturedAttachSurfaces: null,',
    '    setAttach(value) { attachTarget.value = value; },',
    '    captureAttachSurfaces() { this.capturedAttachSurfaces = { overlay: attachOverlayRef.value.contentEl, dialog: attachDialogRef.value.contentEl, menu: attachMenuRef.value.surface }; },',
    '    attachSurfacesAreSame() { return { overlay: this.capturedAttachSurfaces.overlay === attachOverlayRef.value.contentEl, dialog: this.capturedAttachSurfaces.dialog === attachDialogRef.value.contentEl, menu: this.capturedAttachSurfaces.menu === attachMenuRef.value.surface }; },',
    '    updateLocation(which) { this[which].value.updateLocation(); },',
    '    async flush() { await nextTick(); await nextTick(); await new Promise(resolve => setTimeout(resolve, 0)); },',
    '    app',
    '};',
    '</script></body></html>'
].join('\n');

await writeFile(path.join(fixturePath, 'index.html'), fixture, 'utf8');

const report = {
    generatedAt: new Date().toISOString(),
    browserChannel: 'chrome',
    routerVersion: '4.6.3',
    checks: [],
    pageErrors: [],
    windowErrors: [],
    unhandledRejections: [],
    consoleErrors: [],
    consoleWarnings: [],
    vueWarnings: [],
    sourceFiles,
    sourceSha256Before: await hashSources()
};

const vite = await createServer({
    root,
    appType: 'custom',
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'warn',
    optimizeDeps: {
        noDiscovery: true,
        entries: [path.relative(root, path.join(fixturePath, 'index.html'))],
        include: [
            'highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json',
            'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist',
            'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'
        ]
    },
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } }
});
vite.middlewares.use('/__overlay_container__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await vite.transformIndexHtml('/__overlay_container__', fixture));
});

let browser;
let page;

async function setState(values) {
    await page.evaluate(async (next) => {
        Object.assign(window.overlayContainerProbe.state, next);
        await window.overlayContainerProbe.flush();
    }, values);
}

async function openSurface(key, selector) {
    await setState({ [key]: true });
    await page.waitForFunction(query => document.querySelector(query)?.getAttribute('data-state') === 'open', selector);
}

async function closeSurface(key, selector) {
    await setState({ [key]: false });
    await page.waitForFunction(query => document.querySelector(query)?.getAttribute('data-state') === 'closed', selector);
}

function passed(description) {
    report.checks.push(description);
    process.stdout.write('PASS ' + description + '\n');
}

async function captureFailureState() {
    if (!page) return;
    try {
        report.failureState = await page.evaluate(() => ({
            url: location.href,
            activeElement: document.activeElement?.id || document.activeElement?.tagName,
            bodyOverflow: document.body.style.overflow,
            route: window.overlayContainerProbe?.router.currentRoute.value.fullPath,
            surfaces: [...document.querySelectorAll('[data-state]')].filter(element => element.matches('.ui-overlay, .ui-dialog, .ui-menu-surface')).map(element => {
                const bounds = element.getBoundingClientRect();
                const layer = element.closest('.ui-overlay-layer');
                return {
                    id: element.id,
                    state: element.getAttribute('data-state'),
                    open: element instanceof HTMLDialogElement ? element.open : undefined,
                    parent: layer?.parentElement?.id || layer?.parentElement?.tagName,
                    zIndex: layer ? getComputedStyle(layer).zIndex : undefined,
                    bounds: { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom }
                };
            })
        }));
    } catch (error) {
        report.failureStateError = error instanceof Error ? error.stack ?? error.message : String(error);
    }
}

try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    page.on('pageerror', error => report.pageErrors.push(error.stack ?? error.message));
    page.on('console', message => {
        if (message.type() === 'warning') {
            report.consoleWarnings.push(message.text());
            if (message.text().includes('[Vue warn]')) report.vueWarnings.push(message.text());
        }
        if (message.type() === 'error') report.consoleErrors.push(message.text());
    });
    await page.addInitScript(() => {
        window.__overlayContainerRuntime = { errors: [], rejections: [] };
        window.addEventListener('error', event => window.__overlayContainerRuntime.errors.push(event.error?.stack ?? event.message));
        window.addEventListener('unhandledrejection', event => window.__overlayContainerRuntime.rejections.push(String(event.reason)));
    });
    await page.goto('http://127.0.0.1:' + vite.httpServer.address().port + '/__overlay_container__/one');
    await page.waitForFunction(() => !!window.overlayContainerProbe);

    for (const [key, selector] of [
        ['attachOverlay', '#attach-overlay-surface'],
        ['attachDialog', '#attach-dialog-surface'],
        ['attachMenu', '#attach-menu-surface']
    ]) {
        await openSurface(key, selector);
        const target = await page.locator(selector).evaluate(element => element.closest('.ui-overlay-layer')?.parentElement === document.body);
        assert.equal(target, true, selector + ' defaults to a body-level DOM layer');
        const presentation = await page.locator(selector).evaluate(element => ({
            modal: element.matches(':modal'),
            popover: element.matches(':popover-open'),
            layerModal: element.closest('.ui-overlay-layer').matches(':modal'),
            layerPopover: element.closest('.ui-overlay-layer').matches(':popover-open')
        }));
        assert.deepEqual(presentation, { modal: false, popover: false, layerModal: false, layerPopover: false }, selector + ' is not shown through native modal or popover presentation');
    }
    await page.evaluate(() => window.overlayContainerProbe.captureAttachSurfaces());
    await page.evaluate(() => window.overlayContainerProbe.setAttach('#attach-a'));
    await page.waitForFunction(() => ['attach-overlay-surface', 'attach-dialog-surface', 'attach-menu-surface'].every(id => document.getElementById(id)?.closest('.ui-overlay-layer')?.parentElement?.id === 'attach-a'));
    assert.deepEqual(await page.evaluate(() => window.overlayContainerProbe.attachSurfacesAreSame()), { overlay: true, dialog: true, menu: true }, 'selector attach moves the existing surface instances');
    const explicitZIndexes = await page.evaluate(() => ['attach-overlay-surface', 'attach-dialog-surface', 'attach-menu-surface'].map(id => Number(getComputedStyle(document.getElementById(id).closest('.ui-overlay-layer')).zIndex)));
    assert.deepEqual(explicitZIndexes, [3110, 3120, 3130], 'explicit zIndex is consumed by every public surface layer');
    await page.locator('#attach-b').evaluate(element => window.overlayContainerProbe.setAttach(element));
    await page.waitForFunction(() => ['attach-overlay-surface', 'attach-dialog-surface', 'attach-menu-surface'].every(id => document.getElementById(id)?.closest('.ui-overlay-layer')?.parentElement?.id === 'attach-b'));
    assert.deepEqual(await page.evaluate(() => window.overlayContainerProbe.attachSurfacesAreSame()), { overlay: true, dialog: true, menu: true }, 'HTMLElement attach moves the existing surface instances');
    await page.evaluate(async () => { window.overlayContainerProbe.setAttach(true); await window.overlayContainerProbe.flush(); });
    await page.waitForFunction(() => {
        const overlayParent = document.querySelector('#attach-overlay-surface')?.closest('.ui-overlay-layer')?.parentElement;
        const dialogParent = document.querySelector('#attach-dialog-surface')?.closest('.ui-overlay-layer')?.parentElement;
        const menuParent = document.querySelector('#attach-menu-surface')?.closest('.ui-overlay-layer')?.parentElement;
        return overlayParent?.id === 'main-root' && dialogParent?.id === 'main-root' && menuParent?.classList.contains('ui-menu');
    });
    await page.evaluate(async () => { window.overlayContainerProbe.setAttach(undefined); await window.overlayContainerProbe.flush(); });
    await page.waitForFunction(() => ['attach-overlay-surface', 'attach-dialog-surface', 'attach-menu-surface'].every(id => document.getElementById(id)?.closest('.ui-overlay-layer')?.parentElement === document.body));
    assert.deepEqual(await page.evaluate(() => window.overlayContainerProbe.attachSurfacesAreSame()), { overlay: true, dialog: true, menu: true }, 'attach=true stays in place and later attach changes preserve each instance');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#attach-menu-surface')?.dataset.state === 'closed');
    assert.equal(await page.locator('#attach-dialog-surface').getAttribute('data-state'), 'open', 'a dynamic attach leaves the menu stack entry above the Dialog');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#attach-dialog-surface')?.dataset.state === 'closed');
    assert.equal(await page.locator('#attach-overlay-surface').getAttribute('data-state'), 'open', 'the next Escape closes the next layer without a stale stack entry');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#attach-overlay-surface')?.dataset.state === 'closed');
    passed('Overlay, Dialog and Menu share default, selector, HTMLElement and inline attach behavior with stable instances and explicit zIndex');

    for (const item of [
        { key: 'containerOverlay', selector: '#container-overlay-surface', contained: 'containedOverlay', absolute: 'absoluteOverlay', host: '#container-overlay-host', scrim: true },
        { key: 'containerDialog', selector: '#container-dialog-surface', contained: 'containedDialog', absolute: 'absoluteDialog', host: '#container-dialog-host', scrim: true },
        { key: 'containerMenu', selector: '#container-menu-surface', contained: 'containedMenu', absolute: 'absoluteMenu', host: '#container-menu-host', scrim: false }
    ]) {
        await setState({ [item.contained]: true, [item.absolute]: false });
        await openSurface(item.key, item.selector);
        const contained = await page.locator(item.selector).evaluate((element, hostSelector) => {
            const layer = element.closest('.ui-overlay-layer');
            const host = document.querySelector(hostSelector);
            const layerRect = layer.getBoundingClientRect();
            const hostRect = host.getBoundingClientRect();
            const scrim = layer.querySelector('.ui-overlay-scrim');
            const scrimRect = scrim?.getBoundingClientRect();
            const hostClientRect = [
                hostRect.left + host.clientLeft,
                hostRect.top + host.clientTop,
                host.clientWidth,
                host.clientHeight
            ];
            return {
                containedByHost: host.contains(layer),
                offsetParentIsHost: layer.offsetParent === host,
                position: getComputedStyle(layer).position,
                layerRect: [layerRect.left, layerRect.top, layerRect.width, layerRect.height],
                hostClientRect,
                hasScrim: !!scrim,
                scrimRect: scrimRect && [scrimRect.left, scrimRect.top, scrimRect.width, scrimRect.height]
            };
        }, item.host);
        assert.equal(contained.containedByHost, true, item.selector + ' remains within its containing DOM host');
        assert.equal(contained.offsetParentIsHost, true, item.selector + ' uses its containing DOM host as the positioning parent');
        assert.equal(contained.position, 'absolute', item.selector + ' contained layer uses absolute positioning');
        assert.deepEqual(contained.layerRect, contained.hostClientRect, item.selector + ' fills the containing host client box');
        assert.equal(contained.hasScrim, item.scrim, item.selector + ' uses its shared container scrim behavior');
        if (item.scrim) assert.deepEqual(contained.scrimRect, contained.layerRect, item.selector + ' scrim covers the containing host');

        await setState({ [item.contained]: false, [item.absolute]: true });
        await page.waitForFunction(({ query, hostSelector }) => {
            const layer = document.querySelector(query)?.closest('.ui-overlay-layer');
            const host = document.querySelector(hostSelector);
            return !!host?.contains(layer) && layer?.offsetParent === host && getComputedStyle(layer).position === 'absolute';
        }, { query: item.selector, hostSelector: item.host });
        await setState({ [item.contained]: false, [item.absolute]: false });
        await page.waitForFunction(query => document.querySelector(query)?.closest('.ui-overlay-layer')?.parentElement === document.body, item.selector);
        assert.equal(await page.locator(item.selector).evaluate(element => getComputedStyle(element.closest('.ui-overlay-layer')).position), 'fixed', item.selector + ' returns to the viewport layer when neither container flag is enabled');
        await closeSurface(item.key, item.selector);
    }
    passed('contained and absolute keep all three public surfaces in an absolute parent layer, with Overlay/Dialog scrims matching the container');

    for (const [key, selector] of [
        ['appearanceOverlay', '#appearance-overlay-surface'],
        ['appearanceDialog', '#appearance-dialog-surface']
    ]) {
        await openSurface(key, selector);
        const defaults = await page.locator(selector).evaluate(element => {
            const layer = element.closest('.ui-overlay-layer');
            return { scrim: !!layer.querySelector('.ui-overlay-scrim'), color: getComputedStyle(layer.querySelector('.ui-overlay-scrim')).backgroundColor };
        });
        assert.equal(defaults.scrim, true, selector + ' supplies its default scrim');
        assert.notEqual(defaults.color, 'rgba(0, 0, 0, 0)', selector + ' keeps the visible default scrim');
        await setState({ appearanceScrim: '#a02030', appearanceOpacity: 0.4 });
        const custom = await page.locator(selector).evaluate(element => {
            const scrim = element.closest('.ui-overlay-layer').querySelector('.ui-overlay-scrim');
            return { color: getComputedStyle(scrim).backgroundColor, opacity: getComputedStyle(scrim).opacity };
        });
        assert.deepEqual(custom, { color: 'rgb(160, 32, 48)', opacity: '0.4' }, selector + ' consumes scrim color and opacity');
        await setState({ appearanceScrim: false, appearanceOpacity: undefined });
        assert.equal(await page.locator(selector).evaluate(element => !!element.closest('.ui-overlay-layer').querySelector('.ui-overlay-scrim')), false, selector + ' removes a false scrim');
        await closeSurface(key, selector);
        await setState({ appearanceScrim: undefined, appearanceOpacity: undefined });
    }
    passed('Overlay and Dialog preserve default scrims and consume false, custom color and opacity values');

    await page.locator('#outside-focus').focus();
    await openSurface('focusDialog', '#focus-dialog-surface');
    await page.waitForFunction(() => document.activeElement.id === 'focus-first');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'focus-first', 'retained Dialog initially focuses its first focusable');
    await page.locator('#focus-last').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'focus-first', 'retained Dialog wraps Tab from its last focusable to its first');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'focus-last', 'retained Dialog wraps Shift+Tab from its first focusable to its last');
    await page.locator('#outside-focus').evaluate(element => element.focus());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'focus-first', 'programmatic focus outside a retained Dialog returns to its first focusable');
    const parentLayerZ = await page.locator('#focus-dialog-surface').evaluate(element => Number(getComputedStyle(element.closest('.ui-overlay-layer')).zIndex));
    await page.locator('#child-menu-trigger').focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.querySelector('#child-menu-surface')?.dataset.state === 'open');
    await page.waitForFunction(() => document.activeElement.id === 'child-menu-first');
    const childLayerZ = await page.locator('#child-menu-surface').evaluate(element => Number(getComputedStyle(element.closest('.ui-overlay-layer')).zIndex));
    assert.equal(childLayerZ, parentLayerZ + 10, 'default nested child layers advance by one stack step');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'child-menu-first', 'the retained parent does not pull focus out of its child Menu');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#child-menu-surface')?.dataset.state === 'closed');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'child-menu-trigger', 'closing the child Menu restores focus to its activator');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#focus-dialog-surface')?.dataset.state === 'closed');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'outside-focus', 'closing the retained parent restores its previous focus');
    passed('Dialog focus retention wraps and redirects; nested Menu receives focus, stacks above its parent and restores focus');

    await openSurface('emptyDialog', '#empty-dialog-surface');
    assert.equal(await page.locator('#empty-dialog-surface').evaluate(element => document.activeElement === element), true, 'empty retained Dialog receives fallback focus');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#empty-dialog-surface').evaluate(element => document.activeElement === element), true, 'Tab remains on the empty Dialog fallback');
    await closeSurface('emptyDialog', '#empty-dialog-surface');
    await openSurface('freeDialog', '#free-dialog-surface');
    await page.locator('#outside-focus').evaluate(element => element.focus());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'outside-focus', 'retainFocus=false allows programmatic focus outside Dialog');
    await closeSurface('freeDialog', '#free-dialog-surface');
    await openSurface('passiveOverlay', '#passive-overlay-surface');
    await page.locator('#outside-focus').evaluate(element => element.focus());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'outside-focus', 'default UOverlay does not trap focus');
    await closeSurface('passiveOverlay', '#passive-overlay-surface');
    passed('empty Dialog fallback focus works; retainFocus=false and default Overlay do not trap focus');

    await openSurface('tabMenu', '#tab-menu-surface');
    await page.locator('#tab-menu-first').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'tab-menu-last', 'Menu Tab advances to its next focusable');
    await page.keyboard.press('Tab');
    await page.waitForFunction(() => document.querySelector('#tab-menu-surface')?.dataset.state === 'closed');
    assert.equal(await page.evaluate(() => window.overlayContainerProbe.state.tabMenu), false, 'Menu closes when Tab reaches its forward boundary');
    await openSurface('tabMenu', '#tab-menu-surface');
    await page.locator('#tab-menu-first').focus();
    await page.keyboard.press('Shift+Tab');
    await page.waitForFunction(() => document.querySelector('#tab-menu-surface')?.dataset.state === 'closed');
    assert.equal(await page.evaluate(() => window.overlayContainerProbe.state.tabMenu), false, 'Menu closes when Shift+Tab reaches its reverse boundary');
    await openSurface('panelMenu', '#panel-menu-surface');
    await page.locator('#panel-menu-first').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'panel-menu-last', 'panel Menu leaves Tab navigation to the browser');
    assert.equal(await page.evaluate(() => window.overlayContainerProbe.state.panelMenu), true, 'panel Menu remains open during its natural Tab sequence');
    await closeSurface('panelMenu', '#panel-menu-surface');
    passed('Menu moves focus through items and closes at either Tab boundary; panel Menu uses natural Tab navigation');

    await setState({ stackOverlayZ: 6400, stackDialogZ: 900 });
    await openSurface('stackOverlay', '#stack-overlay-surface');
    await openSurface('stackDialog', '#stack-dialog-surface');
    const escapeStack = await page.evaluate(() => ({
        overlay: Number(getComputedStyle(document.querySelector('#stack-overlay-surface').closest('.ui-overlay-layer')).zIndex),
        dialog: Number(getComputedStyle(document.querySelector('#stack-dialog-surface').closest('.ui-overlay-layer')).zIndex)
    }));
    assert.ok(escapeStack.overlay > escapeStack.dialog, 'explicit high Overlay remains above a Dialog opened later with lower zIndex');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#stack-overlay-surface')?.dataset.state === 'closed');
    assert.equal(await page.locator('#stack-dialog-surface').getAttribute('data-state'), 'open', 'Escape closes only the highest zIndex surface');
    await closeSurface('stackDialog', '#stack-dialog-surface');

    await setState({ stackOverlayZ: 800, stackDialogZ: 7200 });
    await openSurface('stackDialog', '#stack-dialog-surface');
    await openSurface('stackOverlay', '#stack-overlay-surface');
    const outsideStack = await page.evaluate(() => ({
        overlay: Number(getComputedStyle(document.querySelector('#stack-overlay-surface').closest('.ui-overlay-layer')).zIndex),
        dialog: Number(getComputedStyle(document.querySelector('#stack-dialog-surface').closest('.ui-overlay-layer')).zIndex)
    }));
    assert.ok(outsideStack.dialog > outsideStack.overlay, 'explicit high Dialog remains above a lower Overlay opened later');
    await page.mouse.click(12, 12);
    await page.waitForFunction(() => document.querySelector('#stack-dialog-surface')?.dataset.state === 'closed');
    assert.equal(await page.locator('#stack-overlay-surface').getAttribute('data-state'), 'open', 'outside click closes only the highest zIndex surface');
    await closeSurface('stackOverlay', '#stack-overlay-surface');

    await page.evaluate(() => window.overlayContainerProbe.router.push('/two'));
    await page.waitForFunction(() => window.overlayContainerProbe.router.currentRoute.value.fullPath === '/two');
    await setState({ stackOverlayZ: 1200, stackDialogZ: 7300 });
    await openSurface('stackOverlay', '#stack-overlay-surface');
    await openSurface('stackDialog', '#stack-dialog-surface');
    await page.evaluate(() => history.back());
    await page.waitForFunction(() => document.querySelector('#stack-dialog-surface')?.dataset.state === 'closed');
    assert.equal(await page.evaluate(() => window.overlayContainerProbe.router.currentRoute.value.fullPath), '/two', 'Router back is cancelled while the top surface closes');
    assert.equal(await page.locator('#stack-overlay-surface').getAttribute('data-state'), 'open', 'Router back closes only the highest zIndex surface');
    await closeSurface('stackOverlay', '#stack-overlay-surface');
    await page.evaluate(() => history.back());
    await page.waitForFunction(() => window.overlayContainerProbe.router.currentRoute.value.fullPath === '/one');
    passed('Escape, outside click and Vue Router back close only the highest zIndex surface across reversed opening orders');

    const scrollBox = page.locator('#scrollbox');
    const targetBeforeScroll = await page.locator('#scroll-target').boundingBox();
    await scrollBox.evaluate(element => { element.scrollTop = 210; });
    const targetAfterScroll = await page.locator('#scroll-target').boundingBox();
    assert.ok(
        targetBeforeScroll && targetAfterScroll && Math.abs((targetBeforeScroll.y - targetAfterScroll.y) - 210) <= 1,
        'the connected target rect reflects the nested container scroll'
    );
    await page.evaluate(() => { document.documentElement.style.zoom = '125%'; });
    await page.waitForTimeout(50);
    await page.locator('#scroll-target').evaluate(element => element.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(50);
    const targetViewportState = await page.locator('#scroll-target').evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return { top: bounds.top, bottom: bounds.bottom, center: (bounds.top + bounds.bottom) / 2, viewportHeight: window.innerHeight };
    });
    assert.ok(
        targetViewportState.top >= 0 && targetViewportState.bottom <= targetViewportState.viewportHeight - 150,
        'the scrolled connected target is visible with room below it in the zoomed viewport; top=' + targetViewportState.top + ', bottom=' + targetViewportState.bottom + ', viewportHeight=' + targetViewportState.viewportHeight
    );
    for (const [key, selector, refName] of [
        ['geometryOverlay', '#geometry-overlay-surface', 'geometryOverlayRef'],
        ['geometryDialog', '#geometry-dialog-surface', 'geometryDialogRef'],
        ['geometryMenu', '#geometry-menu-surface', 'geometryMenuRef']
    ]) {
        await openSurface(key, selector);
        await page.evaluate(name => window.overlayContainerProbe.updateLocation(name), refName);
        const geometry = await page.locator(selector).evaluate(element => {
            const target = document.querySelector('#scroll-target').getBoundingClientRect();
            const surface = element.getBoundingClientRect();
            return { target: { left: target.left, bottom: target.bottom }, surface: { left: surface.left, top: surface.top } };
        });
        assert.ok(Math.abs(geometry.surface.left - geometry.target.left) <= 1.5, selector + ' aligns to the scrolled target at CSS zoom');
        const expectedTop = geometry.target.bottom + 7.5;
        assert.ok(
            Math.abs(geometry.surface.top - expectedTop) <= 2,
            selector + ' applies the connected offset in zoomed client coordinates; target.bottom=' + geometry.target.bottom + ', surface.top=' + geometry.surface.top + ', expected=' + expectedTop
        );
        await closeSurface(key, selector);
    }
    await page.evaluate(() => { document.documentElement.style.zoom = ''; document.querySelector('#scrollbox').scrollTop = 0; });
    passed('connected target positioning follows real scroll geometry and 125% CSS zoom for Overlay, Dialog and Menu');

    await setState({ keepActive: true });
    await page.waitForSelector('#keep-view', { state: 'attached' });
    await openSurface('keepOverlay', '#keep-overlay-surface');
    await openSurface('keepDialog', '#keep-dialog-surface');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'KeepAlive Overlay and Dialog hold independent scroll locks');
    await setState({ keepActive: false });
    await page.waitForSelector('#keep-empty-view', { state: 'attached' });
    await page.waitForFunction(() => document.body.style.overflow === '');
    await openSurface('freshOverlay', '#fresh-overlay-surface');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#fresh-overlay-surface')?.dataset.state === 'closed');
    assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'deactivation releases all KeepAlive scroll locks');
    passed('KeepAlive deactivation removes retained stack entries and releases both scroll locks');

    await setState({ rapidMounted: true });
    await page.waitForSelector('#rapid-menu-trigger');
    await setState({ rapidMenu: true });
    await page.waitForFunction(() => window.overlayContainerProbe.pendingTransitionCallbacks.enter > 0);
    await setState({ rapidMenu: false });
    await page.waitForFunction(() => window.overlayContainerProbe.pendingTransitionCallbacks.leave > 0);
    await setState({ rapidMenu: true });
    await page.waitForFunction(() => document.querySelector('#rapid-menu-surface')?.dataset.state === 'open');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'reopening during leave retains one active Menu lock');
    await setState({ rapidMounted: false });
    await page.waitForFunction(() => !document.querySelector('#rapid-menu-surface'));
    await page.waitForTimeout(220);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'unmount during the reversed transition releases the Menu lock');
    assert.equal(await page.evaluate(() => document.querySelectorAll('#rapid-menu-surface').length), 0, 'a completed pending transition does not recreate an unmounted Menu');
    assert.deepEqual(await page.evaluate(() => window.overlayContainerProbe.pendingTransitionCallbacks), { enter: 0, leave: 0 }, 'custom transition callbacks finish after the Menu unmount');

    await setState({ rapidMounted: true });
    await page.waitForSelector('#rapid-menu-trigger');
    await page.evaluate(async () => {
        const probe = window.overlayContainerProbe;
        probe.state.rapidMenu = true;
        probe.state.rapidMenu = false;
        await probe.flush();
    });
    await page.waitForFunction(() => {
        const surface = document.querySelector('#rapid-menu-surface');
        return !surface || surface.dataset.state === 'closed';
    });
    await page.waitForTimeout(220);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'same-tick Menu open/close leaves no scroll lock');
    assert.equal(await page.evaluate(() => document.querySelectorAll('#rapid-menu-surface[data-state="opening"], #rapid-menu-surface[data-state="open"], #rapid-menu-surface[data-state="closing"]').length), 0, 'same-tick Menu open/close leaves no active presentation');
    assert.deepEqual(await page.evaluate(() => window.overlayContainerProbe.pendingTransitionCallbacks), { enter: 0, leave: 0 }, 'same-tick Menu open/close leaves no pending transition callbacks');
    await setState({ rapidMounted: false });
    await page.waitForFunction(() => !document.querySelector('#rapid-menu-trigger'));
    passed('Menu transition reversal, unmount and same-tick open/close finish without a stale presentation, stack entry, callback or scroll lock');

    report.windowErrors = await page.evaluate(() => [...window.__overlayContainerRuntime.errors]);
    report.unhandledRejections = await page.evaluate(() => [...window.__overlayContainerRuntime.rejections]);
    assert.deepEqual(report.pageErrors, [], 'page errors: ' + report.pageErrors.join('\n'));
    assert.deepEqual(report.windowErrors, [], 'window errors: ' + report.windowErrors.join('\n'));
    assert.deepEqual(report.unhandledRejections, [], 'unhandled rejections: ' + report.unhandledRejections.join('\n'));
    assert.deepEqual(report.consoleErrors, [], 'console errors: ' + report.consoleErrors.join('\n'));
    assert.deepEqual(report.consoleWarnings, [], 'console warnings, including Vue warnings: ' + report.consoleWarnings.join('\n'));
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    await captureFailureState();
} finally {
    try {
        report.sourceSha256After = await hashSources();
        report.sourceStable = JSON.stringify(report.sourceSha256Before) === JSON.stringify(report.sourceSha256After);
        if (page) {
            report.windowErrors ??= await page.evaluate(() => [...(window.__overlayContainerRuntime?.errors ?? [])]).catch(() => []);
            report.unhandledRejections ??= await page.evaluate(() => [...(window.__overlayContainerRuntime?.rejections ?? [])]).catch(() => []);
        }
    } catch (error) {
        report.sourceHashFailure = error instanceof Error ? error.stack ?? error.message : String(error);
    }
    await browser?.close();
    await vite.close();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4) + '\n', 'utf8');
}

process.stdout.write('Evidence: ' + path.join(evidence, 'report.json') + '\n');
if (report.failure) {
    process.stderr.write(report.failure + '\n');
    process.exitCode = 1;
} else if (!report.sourceStable) {
    process.stderr.write('A product source file changed during the DOM overlay run.\n');
    process.exitCode = 1;
} else {
    process.stdout.write('PASS ' + report.checks.length + ' DOM overlay container protocol groups.\n');
}
