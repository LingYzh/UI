import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/media-containers-protocols');
await mkdir(evidence, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ui-media-containers-'));
const sourceFiles = [
    'src/ui/UParallax.vue',
    'src/ui/UPullToRefresh.vue',
    'src/ui/UImg.vue',
    'src/ui/pull-refresh-state.ts',
    'src/ui/docs/component-examples/parallax.vue',
    'src/ui/docs/component-examples/pull-to-refresh.vue'
];

async function sourceHashes() {
    const hashes = {};
    for (const file of sourceFiles) {
        hashes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
    }
    return hashes;
}

const initialHashes = await sourceHashes();
const requests = [];
const assets = {
    '/__media__/direct-fallback.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#b6846e"/></svg>',
    '/__media__/picture-slow.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#879b82"/></svg>',
    '/__media__/source-1x.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#9187a0"/></svg>',
    '/__media__/source-2x.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640"><rect width="1280" height="640" fill="#9187a0"/></svg>',
    '/__media__/event-direct.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#7b998a"/></svg>',
    '/__media__/preview.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect width="320" height="160" fill="#d9c8ae"/></svg>',
    '/__media__/broken.svg': 'this is not a decodable svg image',
    '/__media__/speed.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#a7b7a5"/><circle cx="500" cy="100" r="60" fill="#bd6749"/></svg>',
    '/__media__/object.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#d0a775"/></svg>',
    '/__media__/object-1x.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#d0a775"/></svg>',
    '/__media__/object-2x.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640"><rect width="1280" height="640" fill="#d0a775"/></svg>',
    '/__media__/object-preview.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect width="320" height="160" fill="#eadbc5"/></svg>',
    '/__media__/slot-background.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#799080"/></svg>'
};
let releaseSlowResponse;
let signalSlowRequest;
const slowRequestStarted = new Promise(resolve => { signalSlowRequest = resolve; });
const slowResponse = new Promise(resolve => { releaseSlowResponse = resolve; });
let releaseObjectResponse;
let signalObjectRequest;
const objectImageRequestStarted = new Promise(resolve => { signalObjectRequest = resolve; });
const objectImageResponse = new Promise(resolve => { releaseObjectResponse = resolve; });

const fixture = [
    '<!doctype html><html style="height:auto;overflow:visible"><head><meta charset="utf-8"><style>',
    '    html, body { margin: 0; min-height: 2400px; height: auto; overflow: visible; }',
    '    body { padding: 20px; color: var(--text); background: var(--background); }',
    '    #app { width: min(1200px, 100%); margin: 0 auto; }',
    '    main { display: grid; gap: 28px; min-width: 0; }',
    '    section, article { min-width: 0; }',
    '    .protocol-section { display: grid; gap: 20px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }',
    '    .probe-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: start; }',
    '    .probe-card { min-width: 0; padding: 12px; border: 1px solid var(--border); border-radius: 8px; }',
    '    .scroll-probe { height: 280px; overflow-y: auto; border: 1px solid var(--border); }',
    '    .probe-spacer { display: grid; place-items: center; height: 180px; color: var(--muted); }',
    '    .probe-after { height: 560px; }',
    '    #scale-scene { height: 140px; }',
    '    #speed-scene { height: 180px; }',
    '    .scene-copy { padding: 12px; border: 1px solid var(--border); background: var(--surface); }',
    '    #local-pull-scroll { height: 220px; overflow-y: auto; border: 1px solid var(--border); }',
    '    #local-pull-spacer { height: 100px; }',
    '    #local-pull-after { height: 260px; }',
    '    .pull-content { height: 620px; padding: 12px; }',
    '    .visual-demos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start; }',
    '    .visual-demos article { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }',
    '    .visual-demos h2 { margin: 0 0 16px; font-size: 18px; }',
    '    .direct-content-slot, .object-content-slot, .speed-content-slot { display: grid; place-items: center; min-height: 36px; }',
    '    @media (max-width: 700px) { body { padding: 12px; } .probe-grid, .visual-demos { grid-template-columns: minmax(0, 1fr); } }',
    '</style></head><body><div id="app"></div><script type="module">',
    "import { createApp, h, nextTick, reactive, ref } from 'vue';",
    "import * as UI from '/src/ui/index.ts';",
    "import ParallaxDemo from '/src/ui/docs/component-examples/parallax.vue';",
    "import PullRefreshDemo from '/src/ui/docs/component-examples/pull-to-refresh.vue';",
    "import '/src/docs-base.css';",
    "import '/src/ui/styles.css';",
    'const state = reactive({',
    "    scale: 0.5, tile: false, speedDisabled: false, cleanupMounted: true, localParentScrollable: true, localRootScrollable: true, localPullDisabled: false,",
    '    rerender: 0,',
    "    imageEvents: { direct: [], source: [], broken: [], object: [] },",
    "    pullEvents: { legacy: [], modernLoad: [], modernRefresh: [], defaults: [] }",
    '});',
    'const refs = { direct: ref(), url: ref(), broken: ref(), object: ref(), speed: ref(), scale: ref(), custom: ref(), cleanup: ref(), modern: ref(), legacy: ref(), defaults: ref() };',
    'let legacyIndicatorScope;',
    'let modernPanelScope;',
    'const listenerStats = { added: 0, removed: 0, active: new Set() };',
    'const nativeAddEventListener = window.addEventListener.bind(window);',
    'const nativeRemoveEventListener = window.removeEventListener.bind(window);',
    'window.addEventListener = function(type, listener, options) {',
    "    if (type === 'scroll' && (options === true || options && typeof options === 'object' && options.capture)) { listenerStats.added++; listenerStats.active.add(listener); }",
    '    return nativeAddEventListener(type, listener, options);',
    '};',
    'window.removeEventListener = function(type, listener, options) {',
    "    if (type === 'scroll' && listenerStats.active.delete(listener)) listenerStats.removed++;",
    '    return nativeRemoveEventListener(type, listener, options);',
    '};',
    'function pullContent(id) { return h("div", { id: id + "-content", class: "pull-content" }, [h("strong", "Scrollable pull content"), h("p", "Content used to exercise the component scroll root.")]); }',
    'function speedProbe() {',
    '    return h("div", { id: "speed-scroll", class: "scroll-probe" }, [',
    '        h("div", { class: "probe-spacer" }, "Nested scroll before scene"),',
    '        h(UI.UParallax, { id: "speed-scene", ref: refs.speed, speed: 0.6, disabled: state.speedDisabled }, {',
    '            background: () => h(UI.UImg, { src: "/__media__/speed.svg", alt: "Speed protocol background", transition: false }),',
    '            default: ({ offset, ratio }) => h("div", { id: "speed-slot", class: "scene-copy", "data-offset": String(offset), "data-ratio": String(ratio) }, "Legacy speed and named background slot")',
    '        }),',
    '        h("div", { class: "probe-after" }, "Nested scroll after scene")',
    '    ]);',
    '}',
    'function scaleProbe() {',
    '    return h("div", { id: "scale-scroll", class: "scroll-probe" }, [',
    '        h("div", { class: "probe-spacer" }, "Scale viewport spacer"),',
    '        h(UI.UParallax, { id: "scale-scene", ref: refs.scale, scale: state.scale, src: "/__media__/direct-fallback.svg", alt: "Scale formula image", width: "420", height: "140" }, {',
    '            default: ({ offset, ratio }) => h("div", { id: "scale-slot", "data-offset": String(offset), "data-ratio": String(ratio) }, "scale formula foreground")',
    '        }),',
    '        h("div", { class: "probe-after" }, "Scale scene trailing content")',
    '    ]);',
    '}',
    'function directImageProbe() {',
    '    return h(UI.UParallax, {',
    "        id: 'direct-parallax', ref: refs.direct, scale: state.scale, src: '/__media__/direct-fallback.svg',",
    "        srcset: '/__media__/source-1x.svg 1x, /__media__/source-2x.svg 2x', sizes: '50vw', alt: 'Direct image protocol',",
    "        lazySrc: '/__media__/preview.svg', lazy: false, eager: true, options: { rootMargin: '0px' },",
    "        aspectRatio: '16 / 9', width: '420', height: '220', minWidth: '180', maxWidth: '600', minHeight: '120', maxHeight: '320',",
    "        color: '#faf0e6', gradient: '90deg, rgba(0, 0, 0, 0.15), transparent', position: 'right top', imageClass: 'direct-image-class',",
    "        rounded: 8, tile: state.tile, crossorigin: 'anonymous', referrerpolicy: 'no-referrer', draggable: false, transition: false,",
    "        contentClass: 'direct-content-class',",
    "        onLoadstart: url => state.imageEvents.source.push({ type: 'loadstart', url }),",
    "        onLoad: url => state.imageEvents.source.push({ type: 'load', url }),",
    "        onError: url => state.imageEvents.source.push({ type: 'error', url })",
    '    }, {',
    "        sources: () => h('source', { id: 'direct-source', media: '(min-width: 0px)', srcset: '/__media__/picture-slow.svg' }),",
    "        placeholder: ({ loading, error }) => h('span', { id: 'direct-placeholder', 'data-loading': String(loading), 'data-error': String(error) }, 'Direct image placeholder'),",
    "        error: () => h('span', { id: 'direct-error-slot' }, 'Direct image error'),",
    "        default: ({ offset, ratio }) => h('div', { id: 'direct-content-slot', class: 'direct-content-slot', 'data-offset': String(offset), 'data-ratio': String(ratio) }, 'Parallax foreground content')",
    '    });',
    '}',
    'function urlImageProbe() {',
    '    return h(UI.UParallax, {',
    "        id: 'url-parallax', ref: refs.url, src: '/__media__/event-direct.svg', alt: 'Direct source URL event protocol', eager: true, transition: false,",
    "        onLoadstart: url => state.imageEvents.direct.push({ type: 'loadstart', url }),",
    "        onLoad: url => state.imageEvents.direct.push({ type: 'load', url }),",
    "        onError: url => state.imageEvents.direct.push({ type: 'error', url })",
    '    }, { default: ({ offset, ratio }) => h("span", { id: "url-content", "data-offset": String(offset), "data-ratio": String(ratio) }, "Direct URL event foreground") });',
    '}',
    'function brokenImageProbe() {',
    '    return h(UI.UParallax, {',
    "        id: 'broken-parallax', ref: refs.broken, src: '/__media__/broken.svg', alt: 'Broken image protocol', eager: true, transition: false,",
    "        onLoadstart: url => state.imageEvents.broken.push({ type: 'loadstart', url }),",
    "        onLoad: url => state.imageEvents.broken.push({ type: 'load', url }),",
    "        onError: url => state.imageEvents.broken.push({ type: 'error', url })",
    '    }, {',
    "        placeholder: () => h('span', { id: 'broken-placeholder' }, 'Broken image loading'),",
    "        error: () => h('span', { id: 'broken-error-slot' }, 'Broken image error slot'),",
    "        default: ({ offset, ratio }) => h('div', { 'data-offset': String(offset), 'data-ratio': String(ratio) }, 'Broken source foreground')",
    '    });',
    '}',
    'function objectImageProbe() {',
    '    return h(UI.UParallax, {',
    "        id: 'object-parallax', ref: refs.object,",
    "        src: { src: '/__media__/object.svg', srcset: '/__media__/object-1x.svg 1x, /__media__/object-2x.svg 2x', lazySrc: '/__media__/object-preview.svg', aspect: 1.5 },",
    "        alt: 'ImageSource object protocol', transition: false,",
    "        onLoadstart: url => state.imageEvents.object.push({ type: 'loadstart', url }),",
    "        onLoad: url => state.imageEvents.object.push({ type: 'load', url }),",
    "        onError: url => state.imageEvents.object.push({ type: 'error', url })",
    '    }, { default: ({ offset, ratio }) => h("div", { id: "object-content", class: "object-content-slot", "data-offset": String(offset), "data-ratio": String(ratio) }, "ImageSource foreground") });',
    '}',
    'function customBackgroundProbe() {',
    '    return h(UI.UParallax, { id: "custom-background-scene", ref: refs.custom, src: "/__media__/must-not-load.svg", speed: 0.3 }, {',
    '        background: () => h("div", { id: "custom-background" }, "Custom background slot wins"),',
    '        default: ({ offset, ratio }) => h("div", { id: "custom-background-content", "data-offset": String(offset), "data-ratio": String(ratio) }, "Custom background content")',
    '    });',
    '}',
    'function cleanupProbe() {',
    '    return state.cleanupMounted ? h(UI.UParallax, { id: "cleanup-scene", ref: refs.cleanup, speed: 0.4 }, { default: () => h("span", "Unmount cleanup probe") }) : null;',
    '}',
    'function modernPullProbe() {',
    '    return h("div", { id: "local-pull-scroll", style: { overflowY: state.localParentScrollable ? "auto" : "visible" } }, [',
    '        h("div", { id: "local-pull-spacer" }),',
    '        h(UI.UPullToRefresh, {',
    "            id: 'modern-pull', ref: refs.modern,",
    "            style: { height: state.localRootScrollable ? '140px' : 'auto', overflowY: state.localRootScrollable ? 'auto' : 'visible' },",
    '            threshold: 90, pullDownThreshold: 30, resistance: 1, disabled: state.localPullDisabled,',
    '            onLoad: context => state.pullEvents.modernLoad.push(context),',
    '            onRefresh: context => state.pullEvents.modernRefresh.push(context)',
    '        }, {',
    '            default: () => pullContent("modern"),',
    '            pullDownPanel: scope => {',
    '                modernPanelScope = { canRefresh: scope.canRefresh, goingUp: scope.goingUp, refreshing: scope.refreshing };',
    '                return h("span", { id: "modern-panel", "data-can-refresh": String(scope.canRefresh), "data-going-up": String(scope.goingUp), "data-refreshing": String(scope.refreshing) }, scope.refreshing ? "Refreshing" : scope.canRefresh ? "Release" : scope.goingUp ? "Return upward" : "Pull down");',
    '            }',
    '        }),',
    '        h("div", { id: "local-pull-after" })',
    '    ]);',
    '}',
    'function legacyPullProbe() {',
    '    return h(UI.UPullToRefresh, { id: "legacy-pull", ref: refs.legacy, style: { height: "180px", overflowY: "auto" }, threshold: 24, resistance: 1, onRefresh: context => state.pullEvents.legacy.push(context) }, {',
    '        default: () => pullContent("legacy"),',
    '        indicator: scope => {',
    '            legacyIndicatorScope = { distance: scope.distance, refreshing: scope.refreshing };',
    '            return h("span", { id: "legacy-indicator", "data-distance": String(scope.distance), "data-refreshing": String(scope.refreshing) }, "Legacy indicator");',
    '        }',
    '    });',
    '}',
    'function defaultPullProbe() {',
    '    return h(UI.UPullToRefresh, { id: "default-pull", ref: refs.defaults, style: { height: "200px", overflowY: "auto" }, onRefresh: context => state.pullEvents.defaults.push(context) }, {',
    '        default: () => pullContent("defaults"),',
    '        indicator: scope => h("span", { id: "default-indicator", "data-distance": String(scope.distance), "data-refreshing": String(scope.refreshing) }, "Default threshold indicator")',
    '    });',
    '}',
    'const ui = UI.createUI();',
    'const app = createApp({ render: () => h("main", [',
    '    h("h1", "Media container protocol probes"),',
    '    h("section", { id: "pull-probes", class: "protocol-section" }, [',
    '        h("h2", "Pull to refresh protocol probes"),',
    '        h("p", "The document is the scroll fallback after local containers are disabled."),',
    '        modernPullProbe(), legacyPullProbe(), defaultPullProbe()',
    '    ]),',
    '    h("section", { id: "parallax-probes", class: "protocol-section" }, [',
    '        h("h2", "Parallax and image protocol probes"),',
    '        h("div", { class: "probe-grid" }, [',
    '            h("article", { class: "probe-card" }, [h("h3", "Direct image source and props"), directImageProbe(), urlImageProbe()]),',
    '            h("article", { class: "probe-card" }, [h("h3", "Image error"), brokenImageProbe()]),',
    '            h("article", { class: "probe-card" }, [h("h3", "ImageSource object"), objectImageProbe()]),',
    '            h("article", { class: "probe-card" }, [h("h3", "Custom background precedence"), customBackgroundProbe()]),',
    '            h("article", { class: "probe-card" }, [h("h3", "Legacy speed and nested scroll"), speedProbe()]),',
    '            h("article", { class: "probe-card" }, [h("h3", "Standard scale formula"), scaleProbe(), cleanupProbe()])',
    '        ])',
    '    ]),',
    '    h("section", { id: "real-demos", class: "visual-demos" }, [',
    '        h("article", [h("h2", "Real UParallax documentation example"), h(ParallaxDemo)]),',
    '        h("article", [h("h2", "Real UPullToRefresh documentation example"), h(PullRefreshDemo)])',
    '    ])',
    ']) });',
    'app.use(ui).mount("#app");',
    'window.mediaContainersProtocol = {',
    '    state, ui, refs, listenerStats, modernPanelScope, legacyIndicatorScope,',
    '    async setScale(value) { state.scale = value; await nextTick(); },',
    '    async setTile(value) { state.tile = value; await nextTick(); },',
    '    async setSpeedDisabled(value) { state.speedDisabled = value; await nextTick(); },',
    '    async setCleanupMounted(value) { state.cleanupMounted = value; await nextTick(); },',
    '    async setLocalScrollability(parent, root) { state.localParentScrollable = parent; state.localRootScrollable = root; await nextTick(); },',
    '    async setModernDisabled(value) { state.localPullDisabled = value; await nextTick(); },',
    '    async rerender() { state.rerender++; await nextTick(); },',
    '    async setTheme(name) { await ui.theme.change(name, false); },',
    '    completeModern(index, repeat = 1) { for (let count = 0; count < repeat; count++) state.pullEvents.modernLoad[index].done(); },',
    '    resetModern() { refs.modern.value.reset(); },',
    '    completeLegacy(index) { state.pullEvents.legacy[index].done(); },',
    '    completeDefault(index) { state.pullEvents.defaults[index].done(); },',
    '    readListeners() { return { added: listenerStats.added, removed: listenerStats.removed, active: listenerStats.active.size }; }',
    '};',
    '</script></body></html>'
].join('\n');

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(temporaryDirectory, 'vite-cache'),
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
        name: 'media-containers-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                let pathname;
                try {
                    pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
                } catch {
                    next();
                    return;
                }
                if (pathname === '/__media-containers.html') {
                    response.setHeader('Content-Type', 'text/html; charset=utf-8');
                    response.end(await viteServer.transformIndexHtml('/__media-containers.html', fixture));
                    return;
                }
                if (pathname.startsWith('/__media__/')) {
                    requests.push(pathname);
                    if (pathname === '/__media__/picture-slow.svg') {
                        signalSlowRequest();
                        await slowResponse;
                    }
                    if (pathname === '/__media__/object.svg' || pathname === '/__media__/object-1x.svg' || pathname === '/__media__/object-2x.svg') {
                        signalObjectRequest();
                        await objectImageResponse;
                    }
                    const body = assets[pathname];
                    response.statusCode = body ? 200 : 404;
                    response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
                    response.setHeader('Cache-Control', 'no-store');
                    response.end(body ?? 'missing local fixture asset');
                    return;
                }
                next();
            });
        }
    }]
});

let app;
let page;
const errors = [];
const requestUrls = [];
const mouseAttempts = [];
const report = {
    acceptanceScope: [
        'UParallax legacy speed/background/nested scroll and reduced-motion lifecycle',
        'UParallax explicit scale 0/0.5/1 geometry, imageScale, overscan, dimensions and rounded/tile',
        'UParallax direct image URL events, UImg props/slots/source/error and custom background precedence',
        'UPullToRefresh legacy threshold/refresh/indicator and load/pullDownPanel aliases',
        'UPullToRefresh real mouse/touch gestures, disabled/reset stale done and nearest scroll boundary',
        'real documentation demos, image decoding, async refresh and responsive evidence'
    ],
    environment: {
        serverMode: 'Vite development server; HMR disabled to pin the loaded source snapshot',
        browser: 'Electron renderer controlled through Playwright',
        assetNetwork: 'local SVG fixture endpoints and data URI demo assets only'
    },
    sourceSha256: initialHashes,
    screenshots: [],
    parallax: {},
    pullToRefresh: {},
    demos: {},
    requests: [],
    errors,
    limitations: [
        'Screenshots preserve the actual documentation demo components; aesthetic acceptance is left to Root.',
        'No full build, full test suite, dependency installation, or external image request was run.'
    ]
};

async function settle(pageToSettle = page) {
    await pageToSettle.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function captureDemo(name) {
    await settle();
    await page.locator('#real-demos').screenshot({ path: path.join(evidence, name + '.png') });
    report.screenshots.push(name + '.png');
}

async function mousePull(selector, distance) {
    const geometry = await page.locator(selector).evaluate(element => {
        const rect = element.getBoundingClientRect();
        const visible = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
        let ancestor = element.parentElement;
        while (ancestor && ancestor instanceof HTMLElement) {
            const style = getComputedStyle(ancestor);
            const ancestorRect = ancestor.getBoundingClientRect();
            if (/^(auto|scroll|hidden|clip)$/.test(style.overflowX)) {
                visible.left = Math.max(visible.left, ancestorRect.left);
                visible.right = Math.min(visible.right, ancestorRect.right);
            }
            if (/^(auto|scroll|hidden|clip)$/.test(style.overflowY)) {
                visible.top = Math.max(visible.top, ancestorRect.top);
                visible.bottom = Math.min(visible.bottom, ancestorRect.bottom);
            }
            ancestor = ancestor.parentElement;
        }
        return {
            root: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
            visible
        };
    });
    const desiredStartY = geometry.root.top + Math.min(80, Math.max(24, geometry.root.height * 0.3));
    const minStartY = Math.max(geometry.root.top + 4, geometry.visible.top + 4);
    const maxStartY = Math.min(geometry.root.bottom - 4, geometry.visible.bottom - distance - 4);
    assert.ok(maxStartY >= minStartY, 'real mouse pull fits within visible root bounds: ' + JSON.stringify({ selector, distance, geometry }));
    // Keep all pointer steps inside the component and its clipping ancestors.
    const startY = Math.min(Math.max(desiredStartY, minStartY), maxStartY);
    const x = Math.min(geometry.visible.right - 4, Math.max(geometry.visible.left + 4, geometry.root.left + geometry.root.width * 0.75));
    const attempt = { selector, distance, geometry, start: { x, y: startY }, end: { x, y: startY + distance }, events: [] };
    await page.evaluate(nextAttempt => {
        window.__pullMouseAttempt = nextAttempt;
        if (window.__pullMouseTraceInstalled) return;
        window.__pullMouseTraceInstalled = true;
        let tracking = false;
        function describe(node) {
            if (!node) return null;
            const className = typeof node.className === 'string' ? node.className : '';
            return node.id || [node.tagName, className].filter(Boolean).join('.');
        }
        function record(event) {
            const current = window.__pullMouseAttempt;
            if (!current) return;
            const root = document.querySelector(current.selector);
            const hit = document.elementFromPoint(event.clientX, event.clientY);
            if (event.type === 'mousedown' && root && (root.contains(event.target) || root.contains(hit))) tracking = true;
            if (!tracking || !root) return;
            const rect = root.getBoundingClientRect();
            current.events.push({
                type: event.type,
                x: event.clientX,
                y: event.clientY,
                buttons: event.buttons,
                target: describe(event.target),
                hit: describe(hit),
                root: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
                visible: current.geometry.visible,
                rootScrollTop: root.scrollTop
            });
            if (event.type === 'mouseup') tracking = false;
        }
        for (const type of ['mousedown', 'mousemove', 'mouseup', 'mouseleave']) document.addEventListener(type, record, true);
    }, attempt);
    await page.mouse.move(x, startY);
    await page.mouse.down();
    await page.mouse.move(x, startY + distance, { steps: 6 });
    await page.mouse.up();
    const completedAttempt = await page.evaluate(() => window.__pullMouseAttempt);
    mouseAttempts.push(completedAttempt);
    return completedAttempt;
}

async function touchPull(selector, distance) {
    const box = await page.locator(selector).boundingBox();
    assert.ok(box, 'touch pull target is attached and visible: ' + selector);
    const session = await page.context().newCDPSession(page);
    const x = Math.round(box.x + Math.min(48, Math.max(24, box.width / 2)));
    const startY = Math.round(box.y + 24);
    try {
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY, id: 7 }] });
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: startY + distance, id: 7 }] });
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } finally {
        await session.detach();
    }
}

async function readSceneMetrics(selector) {
    return page.locator(selector).evaluate(element => {
        const slot = element.querySelector('[data-offset]');
        const viewport = element.parentElement;
        const viewportRect = viewport.getBoundingClientRect();
        const scale = viewport.offsetHeight ? viewportRect.height / viewport.offsetHeight : 1;
        const viewportTop = Math.max(0, viewportRect.top + viewport.clientTop * scale);
        const viewportBottom = Math.min(window.innerHeight, viewportTop + viewport.clientHeight * scale);
        const sceneRect = element.getBoundingClientRect();
        const background = element.querySelector('.u-parallax-background');
        const transform = background?.style.transform ?? '';
        const match = transform.match(/scale\(([-\d.]+)\)/);
        return {
            offset: Number(slot?.dataset.offset ?? 0),
            ratio: Number(slot?.dataset.ratio ?? 0),
            viewportTop,
            viewportBottom,
            viewportHeight: Math.max(0, viewportBottom - viewportTop),
            sceneTop: sceneRect.top,
            sceneHeight: sceneRect.height,
            sceneWidth: sceneRect.width,
            viewportCenter: (viewportTop + viewportBottom) / 2,
            imageScale: match ? Number(match[1]) : null,
            transform,
            overscan: getComputedStyle(element).getPropertyValue('--u-parallax-overscan').trim(),
            radius: getComputedStyle(element).borderRadius,
            styles: {
                width: element.style.width,
                height: element.style.height,
                minWidth: element.style.minWidth,
                maxWidth: element.style.maxWidth,
                minHeight: element.style.minHeight,
                maxHeight: element.style.maxHeight,
                aspectRatio: element.style.aspectRatio
            }
        };
    });
}

try {
    await server.listen();
    const baseUrl = server.resolvedUrls.local[0];
    const previewUrl = baseUrl + '__media-containers.html';
    const environment = {
        ...process.env,
        UAH_DATA_DIR: path.join(temporaryDirectory, 'profile'),
        UAH_UI_PREVIEW_URL: previewUrl
    };
    delete environment.ELECTRON_RUN_AS_NODE;
    delete environment.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env: environment });
    page = await app.firstWindow();
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(7000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    page.on('request', request => requestUrls.push(request.url()));
    await page.waitForFunction(() => Boolean(window.mediaContainersProtocol));
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1280, 1100));
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    await Promise.race([
        slowRequestStarted,
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('picture source request did not reach the local gate')), 7000))
    ]);
    assert.equal(await page.locator('#direct-placeholder').isVisible(), true, 'placeholder slot appears while the selected picture source is pending');
    const directProbe = await page.locator('#direct-parallax').evaluate(element => {
        const root = element;
        const image = root.querySelector('.u-img-main');
        const pictureSource = root.querySelector('picture source');
        const preview = root.querySelector('.u-img-preview');
        return {
            rootTag: root.tagName,
            imageTag: image?.tagName ?? null,
            src: image?.getAttribute('src'),
            srcset: image?.getAttribute('srcset'),
            sizes: image?.getAttribute('sizes'),
            alt: image?.getAttribute('alt'),
            crossorigin: image?.getAttribute('crossorigin'),
            referrerpolicy: image?.getAttribute('referrerpolicy'),
            draggable: image?.getAttribute('draggable'),
            imageClass: image?.className,
            objectFit: image ? getComputedStyle(image).objectFit : null,
            objectPosition: image ? getComputedStyle(image).objectPosition : null,
            selectedSource: pictureSource?.getAttribute('srcset'),
            previewSrc: preview?.getAttribute('src'),
            placeholder: root.querySelector('#direct-placeholder')?.textContent,
            gradient: root.querySelector('.u-img-gradient')?.style.backgroundImage,
            contentClass: root.querySelector('.u-parallax-content')?.className,
            contentOffset: Number(root.querySelector('#direct-content-slot')?.dataset.offset),
            contentRatio: Number(root.querySelector('#direct-content-slot')?.dataset.ratio),
            width: root.style.width,
            height: root.style.height,
            minWidth: root.style.minWidth,
            maxWidth: root.style.maxWidth,
            minHeight: root.style.minHeight,
            maxHeight: root.style.maxHeight,
            aspectRatio: root.style.aspectRatio,
            borderRadius: getComputedStyle(root).borderRadius,
            backgroundColor: root.querySelector('.u-img')?.style.backgroundColor
        };
    });
    assert.equal(directProbe.rootTag, 'DIV');
    assert.equal(directProbe.imageTag, 'IMG');
    assert.equal(directProbe.src, '/__media__/direct-fallback.svg');
    assert.match(directProbe.srcset, /source-1x\.svg 1x/);
    assert.equal(directProbe.sizes, '50vw');
    assert.equal(directProbe.alt, 'Direct image protocol');
    assert.equal(directProbe.crossorigin, 'anonymous');
    assert.equal(directProbe.referrerpolicy, 'no-referrer');
    assert.equal(directProbe.draggable, 'false');
    assert.match(directProbe.imageClass, /direct-image-class/);
    assert.equal(directProbe.objectFit, 'cover');
    assert.equal(directProbe.objectPosition, '100% 0%', 'image position resolves to the right top edge');
    assert.equal(directProbe.selectedSource, '/__media__/picture-slow.svg');
    assert.equal(directProbe.previewSrc, '/__media__/preview.svg');
    assert.equal(directProbe.placeholder, 'Direct image placeholder');
    assert.match(directProbe.gradient, /linear-gradient/);
    assert.match(directProbe.contentClass, /direct-content-class/);
    assert.ok(directProbe.contentRatio >= 0 && directProbe.contentRatio <= 1, 'Parallax default slot receives its ratio scope');
    assert.deepEqual({
        width: directProbe.width, height: directProbe.height,
        minWidth: directProbe.minWidth, maxWidth: directProbe.maxWidth,
        minHeight: directProbe.minHeight, maxHeight: directProbe.maxHeight,
        aspectRatio: directProbe.aspectRatio
    }, {
        width: '420px', height: '220px',
        minWidth: '180px', maxWidth: '600px',
        minHeight: '120px', maxHeight: '320px',
        aspectRatio: '16 / 9'
    });
    assert.equal(directProbe.borderRadius, '8px', 'numeric rounded is interpreted as pixels');
    assert.ok(directProbe.backgroundColor.includes('250') || directProbe.backgroundColor.includes('faf0e6'), 'color reaches the inner UImg root');

    releaseSlowResponse();
    await page.waitForFunction(() => window.mediaContainersProtocol.state.imageEvents.direct.some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaContainersProtocol.state.imageEvents.source.some(event => event.type === 'load'));
    const directEventsRaw = await page.evaluate(() => window.mediaContainersProtocol.state.imageEvents.direct.map(event => ({ type: event.type, url: event.url, urlType: typeof event.url })));
    assert.ok(directEventsRaw.every(event => typeof event.url === 'string'), 'direct image events carry URL strings: ' + JSON.stringify(directEventsRaw));
    const directEvents = directEventsRaw.map(event => ({ type: event.type, path: new URL(event.url, previewUrl).pathname }));
    assert.deepEqual(directEvents, [
        { type: 'loadstart', path: '/__media__/event-direct.svg' },
        { type: 'load', path: '/__media__/event-direct.svg' }
    ], 'UParallax forwards direct currentSrc URL events in order');
    const sourceEventsRaw = await page.evaluate(() => window.mediaContainersProtocol.state.imageEvents.source.map(event => ({ type: event.type, url: event.url, urlType: typeof event.url })));
    assert.deepEqual(sourceEventsRaw.map(event => event.type), ['loadstart', 'load'], 'picture source emits one start and one load event');
    assert.ok(sourceEventsRaw.every(event => typeof event.url === 'string'), 'picture source events carry URL strings');
    const sourceEvents = sourceEventsRaw.map(event => ({ type: event.type, path: new URL(event.url, previewUrl).pathname }));
    assert.equal(sourceEvents.at(-1).path, '/__media__/picture-slow.svg', 'load URL is the selected picture source currentSrc');
    const decodedDirectImage = await page.locator('#direct-parallax .u-img-main').evaluate(image => ({
        currentSrc: image.currentSrc,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
    }));
    assert.equal(decodedDirectImage.complete, true);
    assert.equal(decodedDirectImage.naturalWidth, 640);
    assert.equal(decodedDirectImage.naturalHeight, 320);
    const directRequestsBeforeRerender = requests.filter(request => request === '/__media__/picture-slow.svg').length;
    await page.evaluate(() => window.mediaContainersProtocol.rerender());
    await settle();
    assert.equal((await page.evaluate(() => window.mediaContainersProtocol.state.imageEvents.direct.length)), 2, 'parent rerender does not repeat direct URL events');
    assert.equal((await page.evaluate(() => window.mediaContainersProtocol.state.imageEvents.source.length)), 2, 'parent rerender does not repeat picture slot events');
    assert.equal(requests.filter(request => request === '/__media__/picture-slow.svg').length, directRequestsBeforeRerender, 'parent rerender does not issue a duplicate image request');

    await page.waitForFunction(() => window.mediaContainersProtocol.state.imageEvents.broken.some(event => event.type === 'error'));
    const brokenRaw = await page.evaluate(() => ({
        events: window.mediaContainersProtocol.state.imageEvents.broken.map(event => ({ type: event.type, url: event.url, urlType: typeof event.url })),
        slot: document.querySelector('#broken-error-slot')?.textContent,
        state: document.querySelector('#broken-parallax .u-img')?.className
    }));
    assert.ok(brokenRaw.events.every(event => typeof event.url === 'string'), 'broken image events carry URL strings: ' + JSON.stringify(brokenRaw.events));
    const broken = {
        ...brokenRaw,
        events: brokenRaw.events.map(event => ({ type: event.type, path: new URL(event.url, previewUrl).pathname }))
    };
    assert.deepEqual(broken.events, [
        { type: 'loadstart', path: '/__media__/broken.svg' },
        { type: 'error', path: '/__media__/broken.svg' }
    ], 'invalid local image emits an error URL after loadstart');
    assert.equal(broken.slot, 'Broken image error slot');
    assert.match(broken.state, /is-error/);

    await Promise.race([
        objectImageRequestStarted,
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('ImageSource object request did not reach the local gate')), 7000))
    ]);
    const objectImage = await page.locator('#object-parallax').evaluate(element => {
        const root = element.querySelector('.u-img');
        const image = root?.querySelector('.u-img-main');
        const preview = root?.querySelector('.u-img-preview');
        return {
            src: image?.getAttribute('src'),
            srcset: image?.getAttribute('srcset'),
            preview: preview?.getAttribute('src'),
            ratio: root?.style.aspectRatio,
            slotOffset: Number(element.querySelector('#object-content')?.dataset.offset)
        };
    });
    assert.equal(objectImage.src, '/__media__/object.svg');
    assert.match(objectImage.srcset, /object-1x\.svg 1x/);
    assert.equal(objectImage.preview, '/__media__/object-preview.svg');
    assert.match(objectImage.ratio, /^1\.5(?:\s*\/\s*1)?$/, 'ImageSource aspect ratio reaches the image root');
    assert.ok(Number.isFinite(objectImage.slotOffset), 'content slot receives its offset');
    releaseObjectResponse();
    await page.waitForFunction(() => window.mediaContainersProtocol.state.imageEvents.object.some(event => event.type === 'load'));

    const customBackground = await page.locator('#custom-background-scene').evaluate(element => ({
        slot: element.querySelector('#custom-background')?.textContent,
        imageCount: element.querySelectorAll('img').length,
        contentScope: element.querySelector('#custom-background-content') !== null
    }));
    assert.equal(customBackground.slot, 'Custom background slot wins');
    assert.equal(customBackground.imageCount, 0, 'custom background slot replaces the built-in src image');
    assert.equal(customBackground.contentScope, true);
    assert.equal(requests.includes('/__media__/must-not-load.svg'), false, 'src is not requested when the background slot overrides it');

    const roundedBeforeTile = await page.locator('#direct-parallax').evaluate(element => getComputedStyle(element).borderRadius);
    assert.equal(roundedBeforeTile, '8px');
    await page.evaluate(() => window.mediaContainersProtocol.setTile(true));
    assert.equal(await page.locator('#direct-parallax').evaluate(element => getComputedStyle(element).borderRadius), '0px', 'tile overrides rounded');
    await page.evaluate(() => window.mediaContainersProtocol.setTile(false));
    await settle();

    await page.locator('#scale-scroll').scrollIntoViewIfNeeded();
    await page.locator('#scale-scroll').evaluate(element => { element.scrollTop = 120; });
    await settle();
    const scaleMetrics = {};
    for (const scale of [0, 0.5, 1]) {
        await page.evaluate(value => window.mediaContainersProtocol.setScale(value), scale);
        await page.waitForFunction(value => window.mediaContainersProtocol.state.scale === value, scale);
        await settle();
        const metrics = await readSceneMetrics('#scale-scene');
        const sceneCenter = metrics.sceneTop + metrics.sceneHeight / 2;
        const expectedOffset = Math.trunc((metrics.viewportCenter - sceneCenter) * (1 - scale));
        const expectedImageScale = Math.max(1, ((1 - scale) * (metrics.viewportHeight - metrics.sceneHeight) + metrics.sceneHeight) / (metrics.sceneHeight || 1));
        assert.ok(Object.is(metrics.offset, expectedOffset) || metrics.offset === 0 && expectedOffset === 0,
            'standard scale follows the centered Math.trunc formula at scale ' + scale);
        assert.ok(Math.abs(metrics.imageScale - expectedImageScale) < 0.0001, 'background imageScale matches visible viewport at scale ' + scale);
        assert.equal(metrics.overscan, '0%', 'standard scale does not reserve speed-mode overscan');
        scaleMetrics[String(scale)] = { ...metrics, expectedOffset, expectedImageScale };
    }
    assert.ok(scaleMetrics['0'].imageScale > 1);
    assert.ok(scaleMetrics['0.5'].imageScale > 1);
    assert.equal(scaleMetrics['1'].imageScale, 1);

    const directTileMetrics = await page.locator('#direct-parallax').evaluate(element => ({
        radius: getComputedStyle(element).borderRadius,
        ratio: getComputedStyle(element).aspectRatio,
        offset: Number(element.querySelector('#direct-content-slot')?.dataset.offset)
    }));
    assert.equal(directTileMetrics.radius, '8px');
    assert.ok(directTileMetrics.ratio.includes('16 / 9') || directTileMetrics.ratio.includes('1.777'), 'aspect ratio reaches the root');
    assert.ok(Number.isFinite(directTileMetrics.offset));

    await page.locator('#speed-scroll').scrollIntoViewIfNeeded();
    const speedViewport = page.locator('#speed-scroll');
    await speedViewport.evaluate(element => { element.scrollTop = 0; });
    await settle();
    const speedBefore = await readSceneMetrics('#speed-scene');
    const foregroundBefore = await page.locator('#speed-slot').boundingBox();
    await speedViewport.evaluate(element => { element.scrollTop = 150; });
    await settle();
    const speedAfter = await readSceneMetrics('#speed-scene');
    const foregroundAfter = await page.locator('#speed-slot').boundingBox();
    assert.notEqual(speedAfter.offset, speedBefore.offset, 'legacy speed responds to a native nested scroll container');
    assert.notEqual(speedAfter.transform, speedBefore.transform, 'background transform changes as the nested scroll moves');
    assert.ok(Math.abs((foregroundAfter.y - foregroundBefore.y) - (speedAfter.sceneTop - speedBefore.sceneTop)) < 1, 'foreground follows the scene rather than the parallax background');
    assert.equal(speedAfter.overscan, '30%', 'legacy speed reserves cover overscan');
    const speedImage = await page.locator('#speed-scene .u-img-main').evaluate(image => ({ complete: image.complete, naturalWidth: image.naturalWidth }));
    assert.equal(speedImage.complete, true);
    assert.equal(speedImage.naturalWidth, 640);
    await page.evaluate(() => window.mediaContainersProtocol.setSpeedDisabled(true));
    await settle();
    assert.equal((await readSceneMetrics('#speed-scene')).offset, 0, 'disabled clears legacy speed transform');
    await page.evaluate(() => window.mediaContainersProtocol.setSpeedDisabled(false));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => Number(document.querySelector('#speed-slot').dataset.offset) === 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => Number(document.querySelector('#speed-slot').dataset.offset) !== 0);
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await page.waitForFunction(() => Number(document.querySelector('#speed-slot').dataset.offset) === 0);
    await page.evaluate(() => { delete document.documentElement.dataset.reducedMotion; });
    await page.waitForFunction(() => Number(document.querySelector('#speed-slot').dataset.offset) !== 0);
    const listenersBeforeCleanup = await page.evaluate(() => window.mediaContainersProtocol.readListeners());
    await page.evaluate(() => window.mediaContainersProtocol.setCleanupMounted(false));
    await settle();
    const listenersAfterCleanup = await page.evaluate(() => window.mediaContainersProtocol.readListeners());
    assert.equal(listenersAfterCleanup.active, listenersBeforeCleanup.active - 1, 'unmount removes the Parallax window scroll listener');
    assert.equal(listenersAfterCleanup.removed, listenersBeforeCleanup.removed + 1);
    report.parallax = {
        directImage: { events: directEvents, decoded: decodedDirectImage, properties: directProbe, rerenderEventCount: 2 },
        pictureSource: { events: sourceEvents, loadstartPath: sourceEvents[0].path, selectedPath: sourceEvents[1].path },
        brokenImage: broken,
        imageSourceObject: objectImage,
        customBackground,
        standardScale: scaleMetrics,
        legacySpeed: { before: speedBefore, after: speedAfter, image: speedImage },
        reducedMotion: { systemPreferenceTested: true, applicationDataAttributeTested: true },
        disabledOffset: 0,
        listenerCleanup: { before: listenersBeforeCleanup, after: listenersAfterCleanup },
        roundedAndTile: { numericRadius: directTileMetrics.radius, tileRadius: '0px' }
    };

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#legacy-pull').scrollIntoViewIfNeeded();
    const legacyBox = await page.locator('#legacy-pull').boundingBox();
    const legacyX = legacyBox.x + 45;
    const legacyStartY = legacyBox.y + 24;
    await page.mouse.move(legacyX, legacyStartY);
    await page.mouse.down();
    await page.mouse.move(legacyX, legacyStartY + 30, { steps: 3 });
    const legacyIndicator = await page.locator('#legacy-indicator').getAttribute('data-distance');
    assert.equal(Number(legacyIndicator), 30, 'legacy indicator slot receives its distance scope before release');
    await page.mouse.up();
    await page.waitForFunction(() => window.mediaContainersProtocol.state.pullEvents.legacy.length === 1);
    const legacyDone = await page.evaluate(() => {
        const context = window.mediaContainersProtocol.state.pullEvents.legacy[0];
        context.done();
        return window.mediaContainersProtocol.refs.legacy.value.refreshing;
    });
    assert.equal(legacyDone, false);
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.legacy.length), 1, 'legacy refresh event remains functional');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#default-pull').scrollIntoViewIfNeeded();
    await page.locator('#default-pull').evaluate(element => { element.scrollTop = 0; });
    const defaultBox = await page.locator('#default-pull').boundingBox();
    const defaultX = defaultBox.x + defaultBox.width * 0.75;
    const defaultStartY = defaultBox.y + 50;
    await page.mouse.move(defaultX, defaultStartY);
    await page.mouse.down();
    await page.mouse.move(defaultX, defaultStartY + 140, { steps: 6 });
    assert.equal(Number(await page.locator('#default-indicator').getAttribute('data-distance')), 70, 'default resistance is 0.5 and default threshold has not yet been reached at 70px');
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.defaults.length), 0);
    await page.mouse.move(defaultX, defaultStartY + 144, { steps: 2 });
    assert.equal(Number(await page.locator('#default-indicator').getAttribute('data-distance')), 72, 'default threshold remains 72px');
    await page.mouse.up();
    await page.waitForFunction(() => window.mediaContainersProtocol.state.pullEvents.defaults.length === 1);
    await page.evaluate(() => window.mediaContainersProtocol.completeDefault(0));
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.defaults.value.refreshing), false);

    await page.evaluate(() => {
        const root = document.querySelector('#modern-pull');
        const outer = document.querySelector('#local-pull-scroll');
        let tracking = false;
        window.__pullTrace = [];
        window.__resetPullTrace = () => { tracking = false; window.__pullTrace.length = 0; };
        function record(event) {
            const hit = document.elementFromPoint(event.clientX, event.clientY);
            const rootRect = root.getBoundingClientRect();
            const outerRect = outer.getBoundingClientRect();
            const relevant = tracking || event.type === 'mousedown' && (root.contains(event.target) || root.contains(hit));
            if (!relevant) return;
            if (event.type === 'mousedown') tracking = true;
            window.__pullTrace.push({
                type: event.type,
                x: event.clientX,
                y: event.clientY,
                buttons: event.buttons,
                target: event.target?.id || event.target?.className || event.target?.tagName,
                hit: hit?.id || hit?.className || hit?.tagName,
                root: { x: rootRect.x, y: rootRect.y, width: rootRect.width, height: rootRect.height },
                outer: { x: outerRect.x, y: outerRect.y, width: outerRect.width, height: outerRect.height },
                visibleVertical: [Math.max(rootRect.top, outerRect.top), Math.min(rootRect.bottom, outerRect.bottom)],
                rootScrollTop: root.scrollTop,
                outerScrollTop: outer.scrollTop,
                distance: window.mediaContainersProtocol.refs.modern.value.distance,
                refreshing: window.mediaContainersProtocol.refs.modern.value.refreshing
            });
            if (event.type === 'mouseup') tracking = false;
        }
        for (const type of ['mousedown', 'mousemove', 'mouseup', 'mouseleave']) document.addEventListener(type, record, true);
    });

    await page.evaluate(() => window.mediaContainersProtocol.setLocalScrollability(true, true));
    await page.evaluate(() => {
        document.scrollingElement.scrollTop = 50;
        document.querySelector('#local-pull-scroll').scrollTop = 36;
        document.querySelector('#modern-pull').scrollTop = 0;
    });
    await page.locator('#modern-pull').scrollIntoViewIfNeeded();
    let modernBox = await page.locator('#modern-pull').boundingBox();
    const modernX = modernBox.x + modernBox.width * 0.75;
    const modernStartY = modernBox.y + 50;
    await page.mouse.move(modernX, modernStartY);
    await page.mouse.down();
    await page.mouse.move(modernX, modernStartY + 20, { steps: 2 });
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length), 0, 'sub-threshold movement leaves the new load event untouched');
    assert.equal(await page.locator('#modern-panel').getAttribute('data-can-refresh'), 'false');
    await page.mouse.move(modernX, modernStartY + 64, { steps: 4 });
    assert.equal(await page.locator('#modern-panel').getAttribute('data-can-refresh'), 'true', 'pullDownPanel receives canRefresh at the new threshold');
    await page.mouse.move(modernX, modernStartY + 40, { steps: 2 });
    const modernRetreat = await page.locator('#modern-panel').evaluate(element => ({
        goingUp: element.getAttribute('data-going-up'),
        distance: window.mediaContainersProtocol.refs.modern.value.distance,
        exposedGoingUp: window.mediaContainersProtocol.refs.modern.value.goingUp,
        rootRect: document.querySelector('#modern-pull')?.getBoundingClientRect().toJSON(),
        rootScrollTop: document.querySelector('#modern-pull')?.scrollTop,
        outerScrollTop: document.querySelector('#local-pull-scroll')?.scrollTop,
        documentScrollTop: document.scrollingElement.scrollTop
    }));
    assert.equal(modernRetreat.goingUp, 'true', 'pullDownPanel receives goingUp after a retreat: ' + JSON.stringify(modernRetreat));
    assert.equal(modernRetreat.distance, 40, 'retreat distance follows the configured resistance');
    await page.mouse.move(modernX, modernStartY + 70, { steps: 2 });
    await page.mouse.up();
    await page.waitForFunction(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length === 1 && window.mediaContainersProtocol.state.pullEvents.modernRefresh.length === 1);
    const modernPayloadIdentity = await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad[0] === window.mediaContainersProtocol.state.pullEvents.modernRefresh[0]);
    assert.equal(modernPayloadIdentity, true, 'load and refresh aliases receive the same context object');
    assert.equal(await page.locator('#modern-panel').getAttribute('data-refreshing'), 'true');
    await page.evaluate(() => window.mediaContainersProtocol.setModernDisabled(true));
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.modern.value.refreshing), true, 'disabling leaves an in-flight refresh intact');
    await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad[0].done());
    await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad[0].done());
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.modern.value.refreshing), false, 'done is idempotent and settles both event aliases');
    await mousePull('#modern-pull', 40);
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length), 1, 'disabled blocks a new gesture after the prior request settles');
    await page.evaluate(() => window.mediaContainersProtocol.setModernDisabled(false));

    await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.splice(0));
    await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernRefresh.splice(0));
    await page.evaluate(() => window.__resetPullTrace());
    await mousePull('#modern-pull', 40);
    const resetRequestStarted = await page.waitForFunction(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length === 1, undefined, { timeout: 1200 }).then(() => true, () => false);
    const resetRequestSnapshot = await page.evaluate(() => ({
        events: window.mediaContainersProtocol.state.pullEvents.modernLoad.length,
        distance: window.mediaContainersProtocol.refs.modern.value.distance,
        refreshing: window.mediaContainersProtocol.refs.modern.value.refreshing,
        canRefresh: window.mediaContainersProtocol.refs.modern.value.canRefresh,
        rootScrollTop: document.querySelector('#modern-pull')?.scrollTop,
        outerScrollTop: document.querySelector('#local-pull-scroll')?.scrollTop,
        documentScrollTop: document.scrollingElement.scrollTop,
        disabled: document.querySelector('#modern-pull')?.__vueParentComponent?.props?.disabled,
        trace: window.__pullTrace
    }));
    assert.equal(resetRequestStarted, true, 'a new gesture after clearing disabled can start a refresh: ' + JSON.stringify(resetRequestSnapshot));
    await page.evaluate(() => window.mediaContainersProtocol.resetModern());
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.modern.value.refreshing), false, 'reset clears the in-flight refresh');
    await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad[0].done());
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.modern.value.refreshing), false, 'reset invalidates an older done callback');

    await page.evaluate(() => {
        window.mediaContainersProtocol.setLocalScrollability(true, false);
        document.querySelector('#local-pull-scroll').scrollTop = 36;
        document.querySelector('#modern-pull').scrollTop = 0;
    });
    await mousePull('#modern-pull', 40);
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length), 1, 'non-scrollable root is blocked by its nearest scrolled local parent');
    await page.evaluate(() => { document.querySelector('#local-pull-scroll').scrollTop = 0; });
    await mousePull('#modern-pull', 40);
    await page.waitForFunction(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length === 2, undefined, { timeout: 5000 });
    await page.evaluate(() => window.mediaContainersProtocol.completeModern(1));
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.modern.value.refreshing), false, 'local parent at top permits refresh even when document scroll is nonzero');

    await page.evaluate(() => {
        window.mediaContainersProtocol.setLocalScrollability(false, false);
        document.scrollingElement.scrollTop = 50;
    });
    await mousePull('#modern-pull', 40);
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length), 2, 'document scroll blocks when neither root nor local parent scrolls');
    await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
    await mousePull('#modern-pull', 40);
    await page.waitForFunction(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length === 3, undefined, { timeout: 5000 });
    await page.evaluate(() => window.mediaContainersProtocol.completeModern(2));

    await page.evaluate(() => {
        window.mediaContainersProtocol.setLocalScrollability(true, true);
        document.scrollingElement.scrollTop = 0;
        document.querySelector('#local-pull-scroll').scrollTop = 0;
        document.querySelector('#modern-pull').scrollTop = 0;
    });
    const touchStartCount = await page.evaluate(() => window.mediaContainersProtocol.state.pullEvents.modernLoad.length);
    await touchPull('#modern-pull', 40);
    await page.waitForFunction(count => window.mediaContainersProtocol.state.pullEvents.modernLoad.length === count + 1, touchStartCount);
    await page.evaluate(index => window.mediaContainersProtocol.completeModern(index), touchStartCount);
    assert.equal(await page.evaluate(() => window.mediaContainersProtocol.refs.modern.value.refreshing), false, 'real touch gesture emits and completes refresh');

    const demoParallax = page.locator('[data-demo-component="UParallax"]');
    const demoPull = page.locator('[data-demo-component="UPullToRefresh"]');
    await demoParallax.scrollIntoViewIfNeeded();
    const scaleSwitch = demoParallax.getByRole('checkbox').nth(1);
    await scaleSwitch.check({ force: true });
    await page.waitForFunction(() => {
        const demo = document.querySelector('[data-demo-component="UParallax"]');
        return Boolean(demo?.querySelector('.parallax-caption span')?.textContent.includes('已加载'));
    });
    const demoImage = await demoParallax.locator('.u-parallax img').first().evaluate(image => ({
        currentSrc: image.currentSrc,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
    }));
    assert.equal(demoImage.complete, true, 'real Parallax demo image finishes decoding');
    assert.ok(demoImage.naturalWidth > 0);
    const slider = demoParallax.locator('input[type="range"]').first();
    assert.equal(await slider.count(), 1, 'standard demo mode exposes its scale slider');
    await slider.focus();
    await slider.press('Home');
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UParallax"] .parallax-caption span')?.textContent.includes('scale 0'));
    await slider.press('End');
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UParallax"] .parallax-caption span')?.textContent.includes('scale 1'));
    await slider.press('Home');
    for (let index = 0; index < 5; index++) await slider.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UParallax"] .parallax-caption span')?.textContent.includes('scale 0.5'));
    const demoScale = await demoParallax.locator('.parallax-caption span').textContent();
    const demoScroll = demoParallax.locator('.ui-scroll-viewport');
    await demoScroll.evaluate(element => { element.scrollTop = 60; });
    await settle();
    const demoOffsetBefore = await demoParallax.locator('output').textContent();
    await demoScroll.evaluate(element => { element.scrollTop = 220; });
    await page.waitForFunction(previous => document.querySelector('[data-demo-component="UParallax"] output')?.textContent !== previous, demoOffsetBefore);
    assert.notEqual(await demoParallax.locator('output').textContent(), demoOffsetBefore, 'real Parallax demo responds to scrolling after switching scale');

    await demoPull.scrollIntoViewIfNeeded();
    const realPullRoot = demoPull.locator('.u-pull-to-refresh');
    await realPullRoot.evaluate(element => { element.scrollTop = 0; });
    await mousePull('[data-demo-component="UPullToRefresh"] .u-pull-to-refresh', 84);
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UPullToRefresh"] .u-pull-to-refresh')?.getAttribute('aria-busy') === 'true');
    await demoPull.getByRole('button').click();
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UPullToRefresh"] .u-pull-to-refresh')?.getAttribute('aria-busy') === 'false');
    await page.waitForTimeout(450);
    assert.match(await demoPull.locator('.u-pull-to-refresh p').textContent(), /已刷新 0 次/, 'real demo reset invalidates the pending async refresh');

    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1280, 1100));
    await page.evaluate(() => window.mediaContainersProtocol.setTheme('light'));
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await captureDemo('wide-light');
    await page.evaluate(() => window.mediaContainersProtocol.setTheme('dark'));
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await captureDemo('wide-dark');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(390, 900));
    await page.waitForTimeout(100);
    assert.ok(await page.locator('#real-demos').evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'real demos fit the narrow viewport without horizontal overflow');
    await page.evaluate(() => window.mediaContainersProtocol.setTheme('light'));
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await captureDemo('narrow-light');

    const currentHashes = await sourceHashes();
    assert.deepEqual(currentHashes, initialHashes, 'product and demo files stayed stable during HMR-disabled acceptance');
    const origin = new URL(previewUrl).origin;
    assert.ok(requestUrls.every(url => url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')), 'renderer made no external network requests');
    assert.ok(requests.includes('/__media__/broken.svg'), 'invalid image came from the local test server');
    assert.equal(requests.includes('/__media__/must-not-load.svg'), false);
    const finalListenerStats = await page.evaluate(() => window.mediaContainersProtocol.readListeners());
    await page.evaluate(() => window.mediaContainersProtocol.setTheme('light'));

    report.pullToRefresh = {
        legacyThresholdAndSlot: { eventCount: 1, indicatorDistance: Number(legacyIndicator), event: 'refresh' },
        defaultThreshold: { eventCount: 1, distanceBeforeThreshold: 70, thresholdDistance: 72, defaultResistance: 0.5 },
        newProtocol: {
            configuredThreshold: 30,
            legacyThresholdProp: 90,
            loadAndRefreshSameContext: modernPayloadIdentity,
            sharedDoneIdempotence: true,
            disabledNewGestures: 'covered by fixture controls and component state',
            resetLateDone: true,
            localBoundary: 'scrollable root at top ignores outer positions; otherwise only nearest actual scroll ancestor controls; document is fallback'
        },
        touch: { method: 'Chromium CDP Input.dispatchTouchEvent touchStart/touchMove/touchEnd', emitted: true },
        actualMouseAttempts: mouseAttempts,
        actualDemo: { firstRequestTriggered: true, resetCanceledPendingCount: 0 }
    };
    report.demos = {
        parallax: {
            standardModeToggle: true,
            scaleSliderValueDuringScroll: demoScale,
            decodedImage: demoImage,
            nestedScrollOutputChanged: true
        },
        pullToRefresh: { firstRequestTriggered: true, resetCanceledPendingCount: 0 }
    };
    report.requests = requests.slice();
    report.runtime = {
        url: previewUrl,
        userAgent: await page.evaluate(() => navigator.userAgent),
        screenshots: report.screenshots,
        externalRequests: requestUrls.filter(url => !url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:')),
        imageRequests: requests,
        parallaxScrollListenersBeforeUnmount: finalListenerStats
    };
    assert.deepEqual(errors, [], 'no runtime errors, console errors, or Vue warnings');
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    console.log(JSON.stringify({ evidence, screenshots: report.screenshots, parallax: report.parallax, pullToRefresh: report.pullToRefresh, demos: report.demos, errors }, null, 4));
} catch (error) {
    report.failure = { message: error.message, stack: error.stack };
    report.requests = requests.slice();
    report.errors = errors;
    report.pullToRefresh = { ...report.pullToRefresh, actualMouseAttempts: mouseAttempts };
    if (page) {
        try {
            await page.locator('#real-demos').screenshot({ path: path.join(evidence, 'failure.png'), timeout: 3000 });
            report.screenshots.push('failure.png');
        } catch {}
    }
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    throw error;
} finally {
    releaseSlowResponse?.();
    releaseObjectResponse?.();
    if (app) {
        const closed = await Promise.race([
            app.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) app.process().kill();
    }
    await server.close();
    await rm(temporaryDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}
