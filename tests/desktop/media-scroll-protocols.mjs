import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/media-scroll-protocols');
await mkdir(evidence, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ui-media-scroll-protocols-'));

const assets = {
    '/__media__/source-base.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#d9c8ae"/></svg>' },
    '/__media__/inline-object.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#9da98e"/></svg>' },
    '/__media__/source-1x.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#c8b59b"/></svg>' },
    '/__media__/source-2x.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640"><rect width="1280" height="640" fill="#c8b59b"/></svg>' },
    '/__media__/prop-1x.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#9caa92"/></svg>' },
    '/__media__/prop-2x.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640"><rect width="1280" height="640" fill="#9caa92"/></svg>' },
    '/__media__/preview-object.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#e8d9c8"/></svg>' },
    '/__media__/preview-prop.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#ddd0c1"/></svg>' },
    '/__media__/natural.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#ad8c78"/></svg>' },
    '/__media__/picture-fallback.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#c3a58f"/></svg>' },
    '/__media__/picture-source.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#869582"/></svg>' },
    '/__media__/invalid.svg': { body: 'not a decodable SVG image' },
    '/__media__/old-slow.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#bc7771"/></svg>' },
    '/__media__/new-fast.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#7c9a8b"/></svg>' },
    '/__media__/disabled.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#a2af9a"/></svg>' },
    '/__media__/absolute.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#ad8b7c"/></svg>' },
    '/__media__/lazy.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#8e9f8a"/></svg>' },
    '/__media__/lazy-eager.svg': { body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#7b9286"/></svg>' }
};
const mediaRequests = [];
let releasePropResponse;
let signalPropRequestStarted;
const propRequestStarted = new Promise(resolve => { signalPropRequestStarted = resolve; });
let releaseOldResponse;
let signalOldRequestStarted;
const oldRequestStarted = new Promise(resolve => { signalOldRequestStarted = resolve; });
let releaseNewResponse;
let signalNewRequestStarted;
const newRequestStarted = new Promise(resolve => { signalNewRequestStarted = resolve; });

const fixture = [
    '<!doctype html><html><head><meta charset="utf-8"><style>',
    '    body { margin: 0; padding: 24px; }',
    '    #app { width: min(1200px, 100%); margin: 0 auto; }',
    '    main { display: grid; gap: 24px; min-width: 0; }',
    '    .fixture-panel { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }',
    '    .fixture-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }',
    '    .fixture-grid > * { min-width: 0; }',
    '    .real-demos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }',
    '    .real-demos article { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }',
    '    .real-demos h2 { margin: 0 0 12px; font-size: 18px; }',
    '    .img-host { position: relative; width: 128px; height: 84px; }',
    '    #lazy-probe { position: fixed; top: 12px; left: 12px; z-index: 10000; }',
    '    .test-scroll-list { display: flex; flex: 0 0 auto; flex-direction: column; min-width: 0; }',
    '    .test-scroll-row { display: block; flex: 0 0 32px; height: 32px; line-height: 32px; padding-inline: 8px; }',
    '    .test-scroll-horizontal { display: block; flex: 0 0 auto; width: 900px; height: 60px; }',
    '    @media (max-width: 640px) { body { padding: 12px; } .fixture-grid, .real-demos { grid-template-columns: minmax(0, 1fr); } }',
    '</style></head><body><div id="app"></div><div id="lazy-probe"></div><div id="lazy-cleanup-probe"></div><div id="lazy-eager-probe"></div><script type="module">',
    "import { createApp, h, nextTick, reactive, ref } from 'vue';",
    "import * as UI from '/src/ui/index.ts';",
    "import ImgDemo from '/src/ui/docs/component-examples/img.vue';",
    "import InfiniteScrollDemo from '/src/ui/docs/component-examples/infinite-scroll.vue';",
    "import '/src/docs-base.css';",
    "import '/src/ui/styles.css';",
    'const svgText = "<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"640\\" height=\\"320\\"><rect width=\\"640\\" height=\\"320\\" fill=\\"#a9b69e\\"/></svg>";',
    "const dataSvg = 'data:image/svg+xml,' + encodeURIComponent(svgText);",
    'const nativeObserver = window.IntersectionObserver;',
    'window.lateNativeEvents = [];',
    'window.lateLeaveStates = [];',
    'window.addEventListener("load", event => { if (event.target?.tagName === "IMG" && event.target.closest?.("#late-img")) window.lateNativeEvents.push({ type: "load", currentSrc: event.target.currentSrc, connected: event.target.isConnected }); }, true);',
    'const state = reactive({',
    "    imageEvents: { protocol: [], standard: [], invalid: [], late: [], disabled: [], natural: [], picture: [], dataSvg: [], absolute: [], objectSource: [], geometry: [] },",
    "    source: { src: '/__media__/source-base.svg', srcset: '/__media__/source-1x.svg 1x, /__media__/source-2x.svg 2x', lazySrc: '/__media__/preview-object.svg', aspect: 4 / 3 },",
    '    objectSource: { renderKey: 0, aspect: 2, loadCount: 0 },',
    "    disabledImage: true, lateSource: '/__media__/old-slow.svg', anchorItems: Array.from({ length: 30 }, (_value, index) => 'old-' + String(index + 1).padStart(2, '0')),",
    "    scrollProps: { direction: 'vertical', side: 'both', mode: 'manual', disabled: false },",
    '    scrollEvents: { dual: [], anchor: [], auto: [], horizontal: [], legacyStart: [], legacyEnd: [], defaults: [] }',
    '});',
    'const refs = { protocol: ref(), standard: ref(), invalid: ref(), late: ref(), disabled: ref(), natural: ref(), picture: ref(), dataSvg: ref(), absolute: ref(), objectSource: ref(), geometry: ref(), dualScroll: ref(), anchorScroll: ref(), bothScroll: ref(), horizontalScroll: ref(), autoScroll: ref(), legacyStart: ref(), legacyEnd: ref(), defaultScroll: ref() };',
    'const slotScopes = { dual: { start: null, end: null }, anchor: { start: null, end: null }, horizontal: { start: null, end: null }, defaults: { start: null, end: null }, legacyStart: { start: null, end: null }, legacyEnd: { start: null, end: null } };',
    'const defaultScopes = {};',
    'function snapshotPayload(payload) {',
    '    if (typeof payload === "string") return { kind: "url", value: payload };',
    '    return { kind: "event", type: payload?.type, targetTag: payload?.target?.tagName ?? null, currentSrc: payload?.target?.currentSrc ?? null };',
    '}',
    'function imageHandlers(name) {',
    '    return {',
    '        onLoadstart: (value) => state.imageEvents[name].push({ type: "loadstart", value }),',
    '        onLoad: (payload) => state.imageEvents[name].push({ type: "load", payload: snapshotPayload(payload) }),',
    '        onError: (payload) => state.imageEvents[name].push({ type: "error", payload: snapshotPayload(payload) })',
    '    };',
    '}',
    'function imageProtocol() {',
    '    return h("section", { class: "fixture-panel fixture-grid", id: "image-protocols" }, [',
    "        h('div', { id: 'inline-host' }, h(UI.UImg, {",
    "            ...imageHandlers('protocol'), id: 'protocol-img', ref: refs.protocol, tag: 'section', src: state.source,",
    "            srcset: '/__media__/prop-1x.svg 1x, /__media__/prop-2x.svg 2x', lazySrc: '/__media__/preview-prop.svg', sizes: '180px',",
    "            aspectRatio: '3/2', width: 200, height: 120, minWidth: 180, minHeight: 100, maxWidth: 240, maxHeight: 140,",
    "            cover: false, position: 'top left', imageClass: 'protocol-image-class', contentClass: 'protocol-content-class',",
    "            crossorigin: 'anonymous', referrerpolicy: 'no-referrer', draggable: false, inline: true, rounded: 8, color: '#f0eee8', transition: false",
    '        }, {',
    "            placeholder: ({ loading, error }) => h('span', { id: 'protocol-placeholder' }, 'placeholder:' + String(loading) + ':' + String(error)),",
    "            default: ({ loading, error, state: imageState }) => h('span', { id: 'protocol-default-slot' }, 'default:' + String(loading) + ':' + String(error) + ':' + imageState)",
    '        })),',
    '        h(UI.UImg, { ...imageHandlers("standard"), id: "standard-img", ref: refs.standard, src: "/__media__/source-base.svg", standardProtocol: true, width: 160, height: 80, transition: false }),',
    '        h(UI.UImg, { ...imageHandlers("invalid"), id: "invalid-img", ref: refs.invalid, src: "/__media__/invalid.svg", width: 160, height: 80, transition: false }, {',
    "            error: ({ loading, error }) => h('span', { id: 'invalid-error-slot' }, 'error:' + String(loading) + ':' + String(error)),",
    "            default: ({ state: imageState }) => h('span', { id: 'invalid-default-slot' }, imageState)",
    '        }),',
    '        h(UI.UImg, { ...imageHandlers("late"), id: "late-img", ref: refs.late, src: state.lateSource, width: 160, height: 80, transition: { css: false, onLeave: (element, done) => { window.lateLeaveStates.push({ source: element.getAttribute("src"), connected: element.isConnected }); element.addEventListener("load", event => window.lateNativeEvents.push({ type: "load", currentSrc: event.target.currentSrc, connected: event.target.isConnected, direct: true }), { once: true }); setTimeout(done, 3000); } } }),',
    '        h(UI.UImg, { ...imageHandlers("disabled"), id: "disabled-img", ref: refs.disabled, src: "/__media__/disabled.svg", disabled: state.disabledImage, width: 160, height: 80, transition: false }),',
    '        h(UI.UImg, { ...imageHandlers("natural"), id: "natural-img", ref: refs.natural, src: "/__media__/natural.svg", width: 160, transition: false }),',
    '        h(UI.UImg, { ...imageHandlers("picture"), id: "picture-img", ref: refs.picture, src: "/__media__/picture-fallback.svg", width: 160, height: 80, transition: false }, {',
    "            sources: () => h('source', { id: 'picture-source', srcset: '/__media__/picture-source.svg 1x' }),",
    "            placeholder: ({ loading }) => h('span', { id: 'picture-placeholder' }, String(loading))",
    '        }),',
    '        h(UI.UImg, { ...imageHandlers("dataSvg"), id: "data-svg-img", ref: refs.dataSvg, src: dataSvg, width: 160, height: 80, transition: false }),',
    '        h("div", { class: "img-host", id: "absolute-host" }, h(UI.UImg, {',
    "            ...imageHandlers('absolute'), id: 'absolute-img', ref: refs.absolute, tag: 'figure', src: '/__media__/absolute.svg',",
    "            absolute: true, width: '100%', height: '100%', maxWidth: 128, maxHeight: 84, transition: false",
    '        })),',
    '        h(UI.UImg, {',
    '            ...imageHandlers("objectSource"), id: "object-source-img", ref: refs.objectSource,',
    '            "data-render-key": state.objectSource.renderKey, src: { src: "/__media__/inline-object.svg", aspect: state.objectSource.aspect },',
    '            width: 160, height: 80, transition: false,',
    '            onLoad: payload => { state.imageEvents.objectSource.push({ type: "load", payload: snapshotPayload(payload) }); state.objectSource.loadCount++; }',
    '        }),',
    '        h(UI.UImg, { ...imageHandlers("geometry"), id: "geometry-img", ref: refs.geometry, src: "/__media__/inline-object.svg", width: "240", height: "220", minWidth: "190", rounded: 8, tile: true, transition: false })',
    '    ]);',
    '}',
    'function createScrollSlotSet(name) {',
    '    return {',
    "        'load-more': ({ side, props, load }) => {",
    '            slotScopes[name][side] = { side, props, load };',
    "            return h('button', { id: name + '-load-' + side, type: 'button', disabled: props.disabled, onClick: props.onClick }, 'load ' + side);",
    '        },',
    "        loading: ({ side, props }) => h('span', { id: name + '-loading-' + side, 'data-has-onclick': String(typeof props.onClick === 'function') }, 'loading ' + side),",
    "        empty: ({ side, props }) => h('span', { id: name + '-empty-' + side, 'data-has-onclick': String(typeof props.onClick === 'function') }, 'empty ' + side),",
    "        error: ({ side, props, retry }) => h('button', { id: name + '-error-' + side, type: 'button', disabled: props.disabled, onClick: retry }, 'retry ' + side)",
    '    };',
    '}',
    'function scrollProtocols() {',
    '    return h("section", { class: "fixture-panel", id: "scroll-protocols" }, [',
    "        h(UI.UInfiniteScroll, { id: 'dual-scroll', ref: refs.dualScroll, direction: state.scrollProps.direction, side: state.scrollProps.side, mode: state.scrollProps.mode, disabled: state.scrollProps.disabled, height: 180, width: 360, onLoad: context => state.scrollEvents.dual.push(context) }, {",
    "            ...createScrollSlotSet('dual'),",
    "            default: scope => { defaultScopes.dual = scope; return h('div', { id: 'dual-scroll-content', class: 'test-scroll-list' }, Array.from({ length: 28 }, (_value, index) => h('div', { class: 'test-scroll-row', key: index }, 'dual-' + String(index + 1)))); }",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'anchor-scroll', ref: refs.anchorScroll, direction: 'vertical', side: 'start', mode: 'manual', height: 180, width: 360, onLoad: context => state.scrollEvents.anchor.push(context) }, {",
    "            ...createScrollSlotSet('anchor'),",
    "            default: () => h('div', { id: 'anchor-scroll-content', class: 'test-scroll-list' }, state.anchorItems.map(item => h('div', { class: 'test-scroll-row', key: item, 'data-item-id': item }, item)))",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'both-scroll', ref: refs.bothScroll, direction: 'vertical', side: 'both', mode: 'manual', height: 180, width: 360, onLoad: context => state.scrollEvents.dual.push(context) }, {",
    "            default: () => h('div', { id: 'both-scroll-content', class: 'test-scroll-list' }, Array.from({ length: 32 }, (_value, index) => h('div', { class: 'test-scroll-row', key: index }, 'both-' + String(index + 1))))",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'horizontal-scroll', ref: refs.horizontalScroll, direction: 'horizontal', side: 'both', mode: 'manual', width: 260, height: 100, onLoad: context => state.scrollEvents.horizontal.push(context) }, {",
    "            ...createScrollSlotSet('horizontal'),",
    "            default: () => h('div', { id: 'horizontal-content', class: 'test-scroll-horizontal' }, 'horizontal content')",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'auto-scroll', ref: refs.autoScroll, direction: 'vertical', side: 'end', mode: 'intersect', height: 180, width: 360, onLoad: context => { state.scrollEvents.auto.push(context); context.done('empty'); } }, {",
    "            default: () => h('div', { id: 'auto-scroll-content', class: 'test-scroll-list' }, Array.from({ length: 44 }, (_value, index) => h('div', { class: 'test-scroll-row', key: index }, 'auto-' + String(index + 1))))",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'legacy-start-scroll', ref: refs.legacyStart, direction: 'start', mode: 'manual', height: 180, onLoad: context => state.scrollEvents.legacyStart.push(context) }, {",
    "            ...createScrollSlotSet('legacyStart'),",
    "            default: () => h('div', { class: 'test-scroll-list' }, Array.from({ length: 20 }, (_value, index) => h('div', { class: 'test-scroll-row', key: index }, 'legacy-start-' + String(index + 1))))",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'legacy-end-scroll', ref: refs.legacyEnd, direction: 'end', mode: 'manual', height: 180, onLoad: context => state.scrollEvents.legacyEnd.push(context) }, {",
    "            ...createScrollSlotSet('legacyEnd'),",
    "            default: () => h('div', { class: 'test-scroll-list' }, Array.from({ length: 20 }, (_value, index) => h('div', { class: 'test-scroll-row', key: index }, 'legacy-end-' + String(index + 1))))",
    '        }),',
    "        h(UI.UInfiniteScroll, { id: 'default-scroll', ref: refs.defaultScroll, mode: 'manual', height: 180, onLoad: context => state.scrollEvents.defaults.push(context) }, {",
    "            ...createScrollSlotSet('defaults'),",
    "            default: () => h('div', { class: 'test-scroll-list' }, Array.from({ length: 20 }, (_value, index) => h('div', { class: 'test-scroll-row', key: index }, 'default-' + String(index + 1))))",
    '        })',
    '    ]);',
    '}',
    'const ui = UI.createUI();',
    'const app = createApp({ render: () => h("main", [',
    '    imageProtocol(),',
    '    scrollProtocols(),',
    '    h("section", { class: "fixture-panel real-demos", id: "real-demos" }, [',
    "        h('article', [h('h2', '真实 UImg 文档示例'), h(ImgDemo)]),",
    "        h('article', [h('h2', '真实 UInfiniteScroll 文档示例'), h(InfiniteScrollDemo)])",
    '    ])',
    ']) });',
    'app.use(ui);',
    "app.mount('#app');",
    'window.mediaScrollProtocol = {',
    '    state, ui, refs, slotScopes, nativeObserver,',
    '    snapshotPayload,',
    '    imageEvents(name) { return state.imageEvents[name]; },',
    '    flushVue() { return nextTick(); },',
    '    readImage(name) {',
    '        const instance = refs[name].value;',
    '        const root = instance?.root;',
    '        const image = instance?.element;',
    '        return {',
    "            rootTag: root?.tagName ?? null, imageTag: image?.tagName ?? null, imageAliasMatches: image === instance?.image,",
    '            visible: instance?.visible, loading: instance?.loading, error: instance?.error, state: instance?.state,',
    '            currentSrc: instance?.currentSrc, naturalWidth: instance?.naturalWidth, naturalHeight: instance?.naturalHeight,',
    "            src: image?.getAttribute('src'), srcset: image?.getAttribute('srcset'), sizes: image?.getAttribute('sizes'), alt: image?.getAttribute('alt'),",
    "            crossorigin: image?.getAttribute('crossorigin'), referrerpolicy: image?.getAttribute('referrerpolicy'), draggable: image?.getAttribute('draggable'),",
    "            imageClass: image?.className, objectFit: image ? getComputedStyle(image).objectFit : null, objectPosition: image ? getComputedStyle(image).objectPosition : null,",
    '            style: root ? { width: root.style.width, height: root.style.height, minWidth: root.style.minWidth, minHeight: root.style.minHeight, maxWidth: root.style.maxWidth, maxHeight: root.style.maxHeight, aspectRatio: getComputedStyle(root).aspectRatio, display: getComputedStyle(root).display, position: getComputedStyle(root).position, borderRadius: getComputedStyle(root).borderRadius } : null',
    '        };',
    '    },',
    '    setDisabledImage(value) { state.disabledImage = value; },',
    "    setLateSource(value) { state.lateSource = value; },",
    '    forceObjectSourceRerender() { state.objectSource.renderKey++; },',
    '    setObjectSourceAspect(value) { state.objectSource.aspect = value; },',
    '    setScrollProps(values) { Object.assign(state.scrollProps, values); },',
    '    readScrollScope(name = "dual") {',
    '        const scope = defaultScopes[name];',
    '        return scope && { busy: scope.busy, done: scope.done, error: scope.error, startStatus: scope.startStatus, endStatus: scope.endStatus, hasLoad: typeof scope.load === "function", hasRetry: typeof scope.retry === "function", hasReset: typeof scope.reset === "function" };',
    '    },',
    '    readSlotScope(name, edge) {',
    '        const value = slotScopes[name][edge];',
    '        return value && { side: value.side, disabled: value.props.disabled, color: value.props.color, hasOnClick: typeof value.props.onClick === "function", hasLoad: typeof value.load === "function" };',
    '    },',
    '    scrollRoot(name) { return refs[name].value?.root; },',
    '    scrollStatus(name, edge) { return refs[name].value?.[edge + "Status"]; },',
    '    scrollEventCount(name, edge) { return state.scrollEvents[name].filter(event => event.side === edge).length; },',
    '    async completeScroll(name, edge, status) {',
    '        const event = state.scrollEvents[name].filter(item => item.side === edge).at(-1);',
    "        if (!event) throw new Error('No scroll event for ' + name + ':' + edge);",
    '        if (status === undefined) event.done(); else event.done(status);',
    '        await nextTick();',
    '        await nextTick();',
    '    },',
    '    async prependAnchor() {',
    '        const event = state.scrollEvents.anchor.at(-1);',
    "        if (!event) throw new Error('No anchor load event');",
    "        state.anchorItems = ['new-02', 'new-01', ...state.anchorItems];",
    '        await nextTick();',
    "        event.done('ok');",
    '        await nextTick();',
    '        await nextTick();',
    '    },',
    '    mountLazyProbe() {',
    '        const lazyState = reactive({ disabled: false, options: { rootMargin: "17px", threshold: 0.4 } });',
    '        const lazyRef = ref();',
    '        const lazyApp = createApp({',
    '            render: () => h(UI.UImg, {',
    "                id: 'lazy-img', ref: lazyRef, src: '/__media__/lazy.svg', lazy: true, disabled: lazyState.disabled, options: lazyState.options,",
    '                width: 160, height: 80, transition: false,',
    '                onLoad: payload => window.lazyEvents.push(snapshotPayload(payload))',
    '            })',
    '        });',
    '        lazyApp.use(UI.createUI());',
    '        window.lazyState = lazyState;',
    '        window.lazyRef = lazyRef;',
    '        window.lazyApp = lazyApp;',
    '        window.lazyEvents = [];',
    "        lazyApp.mount('#lazy-probe');",
    '    },',
    '    mountLazyCleanupProbe() {',
    "        const cleanupApp = createApp({ render: () => h(UI.UImg, { src: '/__media__/lazy.svg', lazy: true, width: 120, height: 60, transition: false }) });",
    '        cleanupApp.use(UI.createUI());',
    '        window.lazyCleanupApp = cleanupApp;',
    "        cleanupApp.mount('#lazy-cleanup-probe');",
    '    },',
    '    mountLazyEagerProbe() {',
    '        const count = window.ControlledObserver.instances.filter(observer => observer.target?.closest?.("#lazy-eager-probe")).length;',
    "        const eagerApp = createApp({ render: () => h(UI.UImg, { src: '/__media__/lazy-eager.svg', lazy: true, eager: true, width: 120, height: 60, transition: false }) });",
    '        eagerApp.use(UI.createUI());',
    '        window.lazyEagerApp = eagerApp;',
    '        window.lazyEagerObserverCountBefore = count;',
    "        eagerApp.mount('#lazy-eager-probe');",
    '    },',
    '    async setTheme(name) { await ui.theme.change(name, false); },',
    '};',
    '</script></body></html>'
].join('\n');

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(temporaryDirectory, 'vite-cache'),
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
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
        name: 'media-scroll-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                let pathname;
                try {
                    pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
                } catch {
                    next();
                    return;
                }
                if (pathname === '/__media__/data-svg-not-used.svg') {
                    next();
                    return;
                }
                if (pathname.startsWith('/__media__/')) {
                    mediaRequests.push(pathname);
                    const asset = assets[pathname];
                    if (!asset) {
                        response.statusCode = 404;
                        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
                        response.end('missing fixture image');
                        return;
                    }
                    if (pathname === '/__media__/prop-1x.svg' || pathname === '/__media__/prop-2x.svg') {
                        await new Promise(resolve => {
                            releasePropResponse = resolve;
                            signalPropRequestStarted();
                        });
                    } else if (pathname === '/__media__/old-slow.svg') {
                        await new Promise(resolve => {
                            releaseOldResponse = resolve;
                            signalOldRequestStarted();
                        });
                    } else if (pathname === '/__media__/new-fast.svg') {
                        await new Promise(resolve => {
                            releaseNewResponse = resolve;
                            signalNewRequestStarted();
                        });
                    } else if (asset.delay) await new Promise(resolve => setTimeout(resolve, asset.delay));
                    if (response.destroyed) return;
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
                    response.setHeader('Cache-Control', 'no-store');
                    response.end(asset.body);
                    return;
                }
                if (pathname !== '/__media-scroll-protocols') {
                    next();
                    return;
                }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__media-scroll-protocols', fixture));
            });
        }
    }]
});

const report = {
    baseline: 'Vuetify 4.2.4 source package at artifacts/upstream-table-audit/package',
    browser: 'Electron with local Vite fixture; all image endpoints are local and deterministic',
    image: {},
    infiniteScroll: {},
    screenshots: [],
    requests: [],
    errors: []
};
const protocolFailures = [];
let app;
try {
    await server.listen();
    const productSourcePaths = [
        'src/ui/UImg.vue',
        'src/ui/UInfiniteScroll.vue',
        'src/ui/infinite-scroll-state.ts',
        'src/ui/docs/component-examples/img.vue',
        'src/ui/docs/component-examples/infinite-scroll.vue'
    ];
    report.productSourceSha256 = Object.fromEntries(await Promise.all(productSourcePaths.map(async file => [
        file,
        createHash('sha256').update(await readFile(file)).digest('hex')
    ])));
    const previewUrl = server.resolvedUrls.local[0] + '__media-scroll-protocols';
    const environment = {
        ...process.env,
        UAH_DATA_DIR: path.join(temporaryDirectory, 'profile'),
        UAH_UI_PREVIEW_URL: previewUrl
    };
    delete environment.ELECTRON_RUN_AS_NODE;
    delete environment.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env: environment });
    const page = await app.firstWindow();
    page.setDefaultTimeout(5000);
    page.setDefaultNavigationTimeout(5000);
    const errors = [];
    const requestedUrls = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    page.on('request', request => requestedUrls.push(request.url()));
    await page.waitForFunction(() => Boolean(window.mediaScrollProtocol));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('protocol').some(event => event.type === 'loadstart'));
    await Promise.race([
        propRequestStarted,
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('srcset-selected image request did not reach the local gate')), 5000))
    ]);

    const protocolBeforeLoad = await page.evaluate(() => window.mediaScrollProtocol.readImage('protocol'));
    assert.equal(protocolBeforeLoad.rootTag, 'SECTION', 'tag prop changes the UImg root element');
    assert.equal(protocolBeforeLoad.imageTag, 'IMG');
    assert.equal(protocolBeforeLoad.imageAliasMatches, true, 'both exposed image refs point to the actual image element');
    assert.equal(protocolBeforeLoad.visible, true);
    assert.equal(protocolBeforeLoad.loading, true, 'real delayed image keeps loading state active until its load event');
    assert.equal(protocolBeforeLoad.error, false);
    assert.equal(protocolBeforeLoad.src, '/__media__/source-base.svg');
    assert.equal(protocolBeforeLoad.srcset, '/__media__/prop-1x.svg 1x, /__media__/prop-2x.svg 2x');
    assert.equal(protocolBeforeLoad.sizes, '180px');
    assert.equal(protocolBeforeLoad.alt, '');
    assert.equal(protocolBeforeLoad.crossorigin, 'anonymous');
    assert.equal(protocolBeforeLoad.referrerpolicy, 'no-referrer');
    assert.equal(protocolBeforeLoad.draggable, 'false');
    assert.match(protocolBeforeLoad.imageClass, /protocol-image-class/);
    assert.equal(protocolBeforeLoad.objectFit, 'contain');
    assert.equal(protocolBeforeLoad.objectPosition, '0% 0%');
    assert.equal(protocolBeforeLoad.style.width, '200px');
    assert.equal(protocolBeforeLoad.style.height, '120px');
    assert.equal(protocolBeforeLoad.style.minWidth, '180px');
    assert.equal(protocolBeforeLoad.style.minHeight, '100px');
    assert.equal(protocolBeforeLoad.style.maxWidth, '240px');
    assert.equal(protocolBeforeLoad.style.maxHeight, '140px');
    assert.match(protocolBeforeLoad.style.aspectRatio, /1\.5/);
    assert.equal(protocolBeforeLoad.style.display, 'inline-block');
    assert.equal(protocolBeforeLoad.style.borderRadius, '8px', 'numeric rounded value is interpreted in pixels');
    assert.ok(await page.locator('#protocol-img').evaluate(element => element.classList.contains('is-inline')));
    assert.ok(await page.locator('#protocol-img').evaluate(element => element.classList.contains('has-ratio')));
    assert.ok(await page.locator('#protocol-img .u-img-preview').getAttribute('src').then(value => value.endsWith('/__media__/preview-prop.svg')), 'prop lazySrc overrides the source object preview');
    assert.equal(await page.locator('#protocol-placeholder').textContent(), 'placeholder:true:false');
    assert.equal(await page.locator('#protocol-default-slot').textContent(), 'default:true:false:loading');
    releasePropResponse?.();

    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('protocol').some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('standard').some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('natural').some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('picture').some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('dataSvg').some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('invalid').some(event => event.type === 'error'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('disabled').length === 0);

    const protocolAfterLoad = await page.evaluate(() => window.mediaScrollProtocol.readImage('protocol'));
    const protocolEvents = await page.evaluate(() => window.mediaScrollProtocol.imageEvents('protocol'));
    assert.deepEqual(protocolEvents.map(event => event.type), ['loadstart', 'load'], 'loadstart precedes the single real load event');
    assert.equal(typeof protocolEvents[0].value, 'string', 'loadstart emits a URL before the load payload');
    assert.ok(protocolEvents[0].value.includes('/__media__/source-base.svg'), 'loadstart uses the source URL before currentSrc selection settles');
    assert.equal(protocolEvents[1].payload.kind, 'event', 'native Event remains the default load payload');
    assert.equal(protocolEvents[1].payload.type, 'load');
    assert.equal(protocolEvents[1].payload.targetTag, 'IMG');
    assert.equal(protocolEvents[1].payload.currentSrc, protocolAfterLoad.currentSrc);
    assert.match(protocolAfterLoad.currentSrc, /\/__media__\/prop-[12]x\.svg$/, 'prop srcset takes precedence over the source object srcset');
    assert.equal(protocolAfterLoad.loading, false);
    assert.equal(protocolAfterLoad.error, false);
    assert.equal(protocolAfterLoad.state, 'loaded');
    assert.equal(await page.locator('#protocol-placeholder').count(), 0, 'placeholder slot leaves after load');
    assert.equal(await page.locator('#protocol-default-slot').textContent(), 'default:false:false:loaded');
    console.log('[media-scroll] image contracts');

    const standardEvents = await page.evaluate(() => window.mediaScrollProtocol.imageEvents('standard'));
    const standardImage = await page.evaluate(() => window.mediaScrollProtocol.readImage('standard'));
    assert.deepEqual(standardEvents.map(event => event.type), ['loadstart', 'load']);
    assert.equal(standardEvents[1].payload.kind, 'url', 'standardProtocol opts into the URL payload');
    assert.equal(typeof standardEvents[0].value, 'string');
    assert.equal(standardEvents[1].payload.value, standardImage.currentSrc);

    const natural = await page.evaluate(() => window.mediaScrollProtocol.readImage('natural'));
    assert.equal(natural.naturalWidth, 640);
    assert.equal(natural.naturalHeight, 320);
    assert.match(natural.style.aspectRatio, /2/);
    const picture = await page.evaluate(() => window.mediaScrollProtocol.readImage('picture'));
    assert.ok(picture.currentSrc.endsWith('/__media__/picture-source.svg'), 'sources slot supplies the selected picture source');
    assert.equal(await page.locator('#picture-img picture source').count(), 1);
    const dataSvgEvents = await page.evaluate(() => window.mediaScrollProtocol.imageEvents('dataSvg'));
    assert.equal(dataSvgEvents.at(-1).type, 'load', 'valid SVG data URI is decoded by the browser');

    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('objectSource').some(event => event.type === 'load'));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('geometry').some(event => event.type === 'load'));
    const objectSourceBeforeRerender = await page.evaluate(() => ({
        loadCount: window.mediaScrollProtocol.state.objectSource.loadCount,
        events: window.mediaScrollProtocol.imageEvents('objectSource').map(event => event.type),
        image: window.mediaScrollProtocol.readImage('objectSource')
    }));
    assert.equal(objectSourceBeforeRerender.loadCount, 1, 'inline source-object load updates its parent exactly once');
    assert.deepEqual(objectSourceBeforeRerender.events, ['loadstart', 'load']);
    assert.match(objectSourceBeforeRerender.image.style.aspectRatio, /2/);
    const objectRequestCountBeforeRerender = mediaRequests.filter(request => request === '/__media__/inline-object.svg').length;
    assert.ok(objectRequestCountBeforeRerender >= 1, 'inline source object made a real local image request');
    await page.evaluate(async () => {
        window.mediaScrollProtocol.forceObjectSourceRerender();
        await window.mediaScrollProtocol.flushVue();
    });
    await page.waitForTimeout(250);
    assert.deepEqual((await page.evaluate(() => window.mediaScrollProtocol.imageEvents('objectSource').map(event => event.type))), ['loadstart', 'load'], 'external parent rerender does not restart a loaded inline source object');
    assert.equal(mediaRequests.filter(request => request === '/__media__/inline-object.svg').length, objectRequestCountBeforeRerender, 'rerender does not request the same image again');
    await page.evaluate(async () => {
        window.mediaScrollProtocol.setObjectSourceAspect(3);
        await window.mediaScrollProtocol.flushVue();
    });
    const objectSourceAfterAspect = await page.evaluate(() => window.mediaScrollProtocol.readImage('objectSource'));
    assert.match(objectSourceAfterAspect.style.aspectRatio, /3/, 'source-object aspect updates the image geometry');
    assert.deepEqual((await page.evaluate(() => window.mediaScrollProtocol.imageEvents('objectSource').map(event => event.type))), ['loadstart', 'load'], 'aspect-only source-object update does not restart the image request');
    assert.equal(mediaRequests.filter(request => request === '/__media__/inline-object.svg').length, objectRequestCountBeforeRerender, 'aspect-only update does not issue another image request');

    const geometry = await page.evaluate(() => window.mediaScrollProtocol.readImage('geometry'));
    assert.equal(geometry.style.width, '240px');
    assert.equal(geometry.style.height, '220px', 'numeric string height is converted to pixels');
    assert.equal(geometry.style.minWidth, '190px');
    assert.equal(geometry.style.borderRadius, '0px', 'tile takes priority over rounded');
    assert.equal(await page.locator('#geometry-img').evaluate(element => Math.round(element.getBoundingClientRect().height)), 220);

    const invalid = await page.evaluate(() => window.mediaScrollProtocol.readImage('invalid'));
    const invalidEvents = await page.evaluate(() => window.mediaScrollProtocol.imageEvents('invalid'));
    assert.equal(invalid.error, true);
    assert.equal(invalid.state, 'error');
    assert.equal(invalidEvents.at(-1).payload.kind, 'event');
    assert.equal(invalidEvents.at(-1).payload.type, 'error', 'invalid image emits the native error Event by default');
    assert.equal(await page.locator('#invalid-error-slot').textContent(), 'error:false:true');
    assert.equal(await page.locator('#invalid-default-slot').textContent(), 'error');

    const absolute = await page.evaluate(() => window.mediaScrollProtocol.readImage('absolute'));
    assert.equal(absolute.rootTag, 'FIGURE');
    assert.equal(absolute.style.position, 'absolute');
    assert.ok(await page.locator('#absolute-img').evaluate(element => element.classList.contains('is-absolute')));
    assert.equal(absolute.style.width, '100%');
    assert.equal(absolute.style.height, '100%');

    await page.evaluate(() => window.mediaScrollProtocol.setDisabledImage(false));
    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('disabled').some(event => event.type === 'load'));
    const disabledImage = await page.evaluate(() => window.mediaScrollProtocol.readImage('disabled'));
    assert.equal(disabledImage.state, 'loaded', 'reenabling a disabled image resumes a real image request');
    assert.deepEqual((await page.evaluate(() => window.mediaScrollProtocol.imageEvents('disabled'))).map(event => event.type), ['loadstart', 'load']);

    await page.waitForFunction(() => window.mediaScrollProtocol.imageEvents('late').some(event => event.type === 'loadstart'));
    await Promise.race([oldRequestStarted, new Promise((_resolve, reject) => setTimeout(() => reject(new Error('old source request did not reach the controlled response gate')), 5000))]);
    const lateEventsBeforeSourceChange = await page.evaluate(() => window.mediaScrollProtocol.imageEvents('late').slice());
    assert.deepEqual(lateEventsBeforeSourceChange.map(event => event.type), ['loadstart'], 'old source is still loading when the source change begins');
    await page.evaluate(() => window.mediaScrollProtocol.setLateSource('/__media__/new-fast.svg'));
    await Promise.race([newRequestStarted, new Promise((_resolve, reject) => setTimeout(() => reject(new Error('new source request did not reach the controlled response gate')), 5000))]);
    releaseOldResponse?.();
    try {
        await page.waitForFunction(() => window.lateNativeEvents.some(event => event.type === 'load' && event.currentSrc.endsWith('/__media__/old-slow.svg')), undefined, { timeout: 5000 });
    } catch (error) {
        report.image.oldLoadTimeout = await page.evaluate(() => ({
            events: window.mediaScrollProtocol.imageEvents('late').slice(),
            nativeEvents: window.lateNativeEvents.slice(),
            leaveStates: window.lateLeaveStates.slice(),
            outgoingImages: [...document.querySelectorAll('#late-img img')].map(image => ({ src: image.getAttribute('src'), currentSrc: image.currentSrc, connected: image.isConnected, complete: image.complete }))
        }));
        throw error;
    }
    const lateDuringNewLoad = await page.evaluate(() => ({
        image: window.mediaScrollProtocol.readImage('late'),
        events: window.mediaScrollProtocol.imageEvents('late').slice(),
        nativeEvents: window.lateNativeEvents.slice()
    }));
    report.image.lateDuringNewLoad = lateDuringNewLoad;
    if (lateDuringNewLoad.image.state !== 'loading') protocolFailures.push(`UImg changed state before the new image response was released: ${lateDuringNewLoad.image.state}`);
    if (JSON.stringify(lateDuringNewLoad.events.map(event => event.type)) !== JSON.stringify(['loadstart', 'loadstart'])) {
        protocolFailures.push(`UImg emitted a component event for the old native image while the new source was loading: ${JSON.stringify(lateDuringNewLoad.events)}`);
    }
    await page.waitForFunction(() => [...document.querySelectorAll('#late-img img')].some(image => image.getAttribute('src')?.endsWith('/__media__/new-fast.svg')));
    await page.evaluate(() => {
        const image = [...document.querySelectorAll('#late-img img')].find(element => element.getAttribute('src')?.endsWith('/__media__/new-fast.svg'));
        image.addEventListener('load', event => window.lateNativeEvents.push({ type: 'load', currentSrc: event.target.currentSrc, connected: event.target.isConnected, directNew: true }), { once: true });
    });
    releaseNewResponse?.();
    await page.waitForFunction(() => window.lateNativeEvents.some(event => event.type === 'load' && event.currentSrc.endsWith('/__media__/new-fast.svg')), undefined, { timeout: 5000 });
    await page.evaluate(() => window.mediaScrollProtocol.flushVue());
    const lateImage = await page.evaluate(() => window.mediaScrollProtocol.readImage('late'));
    const lateEvents = await page.evaluate(() => window.mediaScrollProtocol.imageEvents('late'));
    if (lateImage.state !== 'loaded') protocolFailures.push(`UImg did not reach loaded state after the new native image loaded: ${lateImage.state}`);
    if (!lateImage.currentSrc.endsWith('/__media__/new-fast.svg')) protocolFailures.push(`UImg exposed stale currentSrc after the source changed: ${lateImage.currentSrc}`);
    const lateLoadSources = lateEvents.filter(event => event.type === 'load').map(event => event.payload.currentSrc);
    const staleLoadSources = lateLoadSources.filter(value => value !== lateImage.currentSrc);
    if (staleLoadSources.length) protocolFailures.push(`UImg emitted stale load payloads after src changed: ${JSON.stringify(staleLoadSources)}`);
    report.image.lateEventSequence = lateEvents;
    report.image.lateLoadSources = lateLoadSources;
    report.image.lateNativeEvents = await page.evaluate(() => window.lateNativeEvents.slice());
    if (lateEvents.filter(event => event.type === 'error').length) protocolFailures.push(`UImg emitted an unexpected source-race error: ${JSON.stringify(lateEvents.filter(event => event.type === 'error'))}`);
    if (lateEvents.filter(event => event.type === 'loadstart').length !== 2) protocolFailures.push(`UImg emitted ${lateEvents.filter(event => event.type === 'loadstart').length} loadstart events for two source revisions`);
    console.log('[media-scroll] source race');

    const originalObserver = await page.evaluate(() => window.mediaScrollProtocol.nativeObserver ? 'available' : 'missing');
    assert.equal(originalObserver, 'available');
    await page.evaluate(() => {
        class ControlledObserver {
            static instances = [];
            constructor(callback, options) {
                this.callback = callback;
                this.options = options;
                this.target = undefined;
                this.connected = true;
                ControlledObserver.instances.push(this);
            }
            observe(target) { this.target = target; }
            disconnect() { this.connected = false; }
            trigger(isIntersecting) {
                if (this.connected && this.target) this.callback([{ target: this.target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }], this);
            }
        }
        window.ControlledObserver = ControlledObserver;
        window.IntersectionObserver = ControlledObserver;
    });
    await page.evaluate(() => window.mediaScrollProtocol.mountLazyProbe());
    let lazyStats = await page.evaluate(() => ({
        visible: document.querySelector('#lazy-img')?.querySelector('.u-img-main')?.getAttribute('src') !== null,
        observers: window.ControlledObserver.instances.map(observer => ({ options: observer.options, connected: observer.connected }))
    }));
    assert.equal(lazyStats.visible, false, 'lazy image holds the main src until intersection');
    assert.equal(lazyStats.observers.length, 1);
    assert.equal(lazyStats.observers[0].options.rootMargin, '17px');
    assert.equal(lazyStats.observers[0].options.threshold, 0.4);
    await page.evaluate(async () => {
        window.lazyState.disabled = true;
        await window.mediaScrollProtocol.flushVue();
    });
    assert.equal((await page.evaluate(() => window.ControlledObserver.instances[0].connected)), false, 'disabled lazy image disconnects its observer');
    await page.evaluate(async () => {
        window.lazyState.options = { rootMargin: '31px', threshold: 0.75 };
        await window.mediaScrollProtocol.flushVue();
        window.lazyState.disabled = false;
        await window.mediaScrollProtocol.flushVue();
    });
    lazyStats = await page.evaluate(() => window.ControlledObserver.instances.map(observer => ({ options: observer.options, connected: observer.connected })));
    assert.equal(lazyStats.length, 2, 'reactive options create a replacement observer');
    assert.equal(lazyStats[1].options.rootMargin, '31px');
    assert.equal(lazyStats[1].options.threshold, 0.75);
    await page.evaluate(async () => {
        window.ControlledObserver.instances[1].trigger(true);
        await window.mediaScrollProtocol.flushVue();
    });
    await page.waitForTimeout(700);
    const lazyAfterTrigger = await page.evaluate(() => ({
        visible: window.lazyRef.value?.visible,
        loading: window.lazyRef.value?.loading,
        state: window.lazyRef.value?.state,
        source: document.querySelector('#lazy-img .u-img-main')?.getAttribute('src'),
        currentSrc: document.querySelector('#lazy-img .u-img-main')?.currentSrc,
        events: window.lazyEvents.slice(),
        observers: window.ControlledObserver.instances.map(observer => ({ connected: observer.connected, options: observer.options }))
    }));
    report.image.lazyAfterTrigger = lazyAfterTrigger;
    const lazyLoaded = lazyAfterTrigger.events.some(event => event.type === 'load');
    if (!lazyLoaded) {
        protocolFailures.push(`UImg lazy image reached visible=true and bound its src, but browser did not request or load it (state=${lazyAfterTrigger.state}, requestStarted=${mediaRequests.includes('/__media__/lazy.svg')})`);
    }
    assert.equal(await page.evaluate(() => window.ControlledObserver.instances[1].connected), false, 'intersection disconnects after visibility');
    if (lazyLoaded) assert.equal(lazyAfterTrigger.events.at(-1).kind, 'event', 'native load payload remains the lazy default');

    await page.evaluate(() => window.mediaScrollProtocol.mountLazyCleanupProbe());
    const cleanupObserverState = await page.evaluate(() => {
        window.lazyCleanupObserver = window.ControlledObserver.instances.find(observer => observer.target?.closest?.('#lazy-cleanup-probe'));
        return { found: Boolean(window.lazyCleanupObserver), connected: window.lazyCleanupObserver?.connected };
    });
    assert.equal(cleanupObserverState.found, true, 'cleanup probe has an active observer for its root');
    assert.equal(cleanupObserverState.connected, true);
    console.log('[media-scroll] cleanup observer registered');
    await page.evaluate(() => window.lazyCleanupApp.unmount());
    assert.equal(await page.evaluate(() => window.lazyCleanupObserver.connected), false, 'unmount cleans up an active lazy observer');
    console.log('[media-scroll] cleanup observer disconnected');
    await page.evaluate(() => window.mediaScrollProtocol.mountLazyEagerProbe());
    console.log('[media-scroll] eager probe mounted');
    await page.waitForFunction(() => document.querySelector('#lazy-eager-probe .u-img-main')?.complete === true, undefined, { timeout: 5000 });
    console.log('[media-scroll] eager probe completed');
    assert.equal(await page.evaluate(() => window.ControlledObserver.instances.filter(observer => observer.target?.closest?.('#lazy-eager-probe')).length), await page.evaluate(() => window.lazyEagerObserverCountBefore), 'eager skips observer setup');
    await page.evaluate(() => {
        window.lazyEagerApp.unmount();
        window.lazyApp.unmount();
        window.IntersectionObserver = window.mediaScrollProtocol.nativeObserver;
    });
    console.log('[media-scroll] probes unmounted');
    console.log('[media-scroll] lazy observer');

    assert.equal(await page.locator('[data-demo-component="UImg"]').count(), 1, 'real UImg documentation demo is mounted');
    assert.equal(await page.locator('[data-demo-component="UInfiniteScroll"]').count(), 1, 'real UInfiniteScroll documentation demo is mounted');
    console.log('[media-scroll] docs demos mounted');
    await Promise.race([
        page.evaluate(() => document.querySelector('[data-demo-component="UImg"]')?.scrollIntoView({ block: 'center' })),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('renderer did not complete docs demo scrollIntoView')), 5000))
    ]);
    console.log('[media-scroll] docs demo scrolled into view');
    report.image.demoAfterScroll = await Promise.race([
        page.evaluate(() => {
            const demo = document.querySelector('[data-demo-component="UImg"]');
            const root = demo?.querySelector('.u-img');
            const image = demo?.querySelector('.u-img-main');
            return {
                rootClasses: root?.className,
                rootRect: root?.getBoundingClientRect().toJSON(),
                imageSrc: image?.getAttribute('src'),
                currentSrc: image?.currentSrc,
                complete: image?.complete,
                naturalWidth: image?.naturalWidth,
                imageDisplay: image ? getComputedStyle(image).display : null,
                scroll: { top: window.scrollY, height: document.documentElement.scrollHeight, viewport: window.innerHeight }
            };
        }),
        new Promise(resolve => setTimeout(() => resolve({ pageEvaluationTimedOut: true }), 1500))
    ]);
    try {
        await page.waitForFunction(() => {
            const image = document.querySelector('[data-demo-component="UImg"] .u-img-main');
            return image && image.complete && image.naturalWidth > 0;
        }, undefined, { timeout: 5000 });
    } catch (error) {
        report.image.demoImageTimeout = { message: error.message, pageEvaluationSkipped: true };
        throw error;
    }

    const imageDemoGeometry = await page.locator('[data-demo-component="UImg"] .u-img').evaluate(element => ({
        height: getComputedStyle(element).height,
        rectHeight: element.getBoundingClientRect().height,
        imageCurrentSrc: element.querySelector('.u-img-main')?.currentSrc,
        imageComplete: element.querySelector('.u-img-main')?.complete,
        naturalWidth: element.querySelector('.u-img-main')?.naturalWidth
    }));
    assert.equal(imageDemoGeometry.height, '220px', 'real UImg documentation demo height="220" is honored as pixels');
    assert.ok(Math.abs(imageDemoGeometry.rectHeight - 220) <= 1, 'real UImg documentation demo occupies 220 CSS pixels');
    assert.equal(imageDemoGeometry.imageComplete, true);
    assert.ok(imageDemoGeometry.naturalWidth > 0, 'real UImg documentation demo lazy image decoded after scrolling into view');
    report.image.demoAtScrollStart = report.image.demoAfterScroll;
    delete report.image.demoAfterScroll;
    report.image.demoAfterLoad = imageDemoGeometry;

    const scrollDemo = page.locator('[data-demo-component="UInfiniteScroll"]');
    const initialDemoScroll = await scrollDemo.locator('.u-infinite-scroll').evaluate(element => ({
        height: getComputedStyle(element).height,
        rectHeight: element.getBoundingClientRect().height,
        direction: element.className
    }));
    assert.equal(initialDemoScroll.height, '260px', 'real UInfiniteScroll documentation demo height="260" is honored as pixels');
    assert.ok(Math.abs(initialDemoScroll.rectHeight - 260) <= 1);
    const demoSelects = scrollDemo.locator('select');
    const demoDirectionController = await scrollDemo.evaluate(element => {
        const instance = element.__vueParentComponent;
        return {
            component: instance?.type?.__name ?? null,
            direction: instance?.setupState?.direction ?? null,
            keys: Object.keys(instance?.setupState ?? {}),
            selectCount: element.querySelectorAll('select').length,
            controls: [...element.querySelectorAll('button, select, input')].map(control => ({
                tag: control.tagName,
                text: control.textContent?.trim(),
                type: control.getAttribute('type'),
                value: control.value
            }))
        };
    });
    report.infiniteScroll.demoDirectionController = demoDirectionController;
    if (await demoSelects.count()) {
        await demoSelects.nth(0).selectOption('horizontal');
    } else {
        const directionUpdated = await scrollDemo.evaluate(element => {
            const direction = element.__vueParentComponent?.setupState?.direction;
            if (!direction) return false;
            element.__vueParentComponent.setupState.direction = 'horizontal';
            return true;
        });
        assert.equal(directionUpdated, true, 'real InfiniteScroll demo exposes its direction state through the mounted Vue component');
    }
    await page.waitForFunction(() => document.querySelector('[data-demo-component="UInfiniteScroll"] .u-infinite-scroll')?.classList.contains('is-horizontal'));
    const horizontalDemo = await scrollDemo.locator('.u-infinite-scroll').evaluate(element => {
        const firstItem = element.querySelector('.records.is-horizontal .record');
        return {
            height: getComputedStyle(element).height,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            initialScrollLeft: element.scrollLeft,
            itemWidth: firstItem ? getComputedStyle(firstItem).width : null,
            itemRectWidth: firstItem?.getBoundingClientRect().width ?? null
        };
    });
    assert.equal(horizontalDemo.height, '260px');
    assert.ok(horizontalDemo.scrollWidth > horizontalDemo.clientWidth, 'real horizontal demo content overflows inside its own scroll root');
    assert.equal(horizontalDemo.itemWidth, '180px', 'real horizontal demo records retain the documented 180px width');
    assert.equal(horizontalDemo.itemRectWidth, 180);
    await scrollDemo.locator('.u-infinite-scroll').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    const horizontalDemoScrolled = await scrollDemo.locator('.u-infinite-scroll').evaluate(element => element.scrollLeft);
    assert.ok(horizontalDemoScrolled > 0, 'real horizontal demo can scroll on its internal horizontal axis');

    const defaultScroll = await page.locator('#default-scroll').evaluate(element => ({
        classes: element.className,
        actions: [...element.querySelectorAll('[id^="defaults-load-"]')].map(button => button.id)
    }));
    assert.match(defaultScroll.classes, /is-vertical/);
    assert.deepEqual(defaultScroll.actions, ['defaults-load-end'], 'default direction/side remain vertical/end');
    console.log('[media-scroll] real demos and defaults');
    const legacyStart = await page.locator('#legacy-start-scroll').evaluate(element => ({
        classes: element.className,
        actions: [...element.querySelectorAll('[id^="legacyStart-load-"]')].map(button => button.id)
    }));
    assert.match(legacyStart.classes, /is-vertical/);
    assert.deepEqual(legacyStart.actions, ['legacyStart-load-start'], 'legacy direction=start selects the vertical start edge');
    const legacyEnd = await page.locator('#legacy-end-scroll').evaluate(element => ({
        classes: element.className,
        actions: [...element.querySelectorAll('[id^="legacyEnd-load-"]')].map(button => button.id)
    }));
    assert.match(legacyEnd.classes, /is-vertical/);
    assert.deepEqual(legacyEnd.actions, ['legacyEnd-load-end'], 'legacy direction=end selects the vertical end edge');
    await page.locator('#default-scroll').evaluate(element => element.scrollTop = element.scrollHeight);
    await page.evaluate(() => window.mediaScrollProtocol.refs.defaultScroll.value.load());
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('defaults', 'end') === 1);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('defaults', 'end', 'empty'));
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollStatus('defaultScroll', 'end')), 'empty');

    const dualScope = await page.evaluate(() => window.mediaScrollProtocol.readSlotScope('dual', 'start'));
    assert.deepEqual(dualScope, { side: 'start', disabled: false, color: undefined, hasOnClick: true, hasLoad: true }, 'load-more slot receives side and action props');
    assert.deepEqual(await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual')), {
        busy: false,
        done: false,
        error: false,
        startStatus: 'ok',
        endStatus: 'ok',
        hasLoad: true,
        hasRetry: true,
        hasReset: true
    }, 'default slot retains load/retry/reset scopes plus per-edge statuses');
    await page.locator('#dual-load-start').click();
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('dual', 'start') === 1);
    assert.equal(await page.locator('#dual-loading-start').textContent(), 'loading start');
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual').busy), true);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('dual', 'start', 'empty'));
    console.log('[media-scroll] manual dual-edge lifecycle');
    assert.equal(await page.locator('#dual-empty-start').textContent(), 'empty start');
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollStatus('dualScroll', 'start')), 'empty');

    await page.locator('#dual-load-end').click();
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('dual', 'end') === 1);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('dual', 'end', 'error'));
    assert.equal(await page.locator('#dual-error-end').textContent(), 'retry end');
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual').error), true);
    await page.locator('#dual-error-end').click();
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('dual', 'end') === 2);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('dual', 'end', 'empty'));
    let dualScopeState = await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual'));
    assert.equal(dualScopeState.done, true);
    await page.evaluate(() => window.mediaScrollProtocol.refs.dualScroll.value.reset());
    dualScopeState = await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual'));
    assert.equal(dualScopeState.startStatus, 'ok');
    assert.equal(dualScopeState.endStatus, 'ok', 'no-argument reset restores both enabled edges');

    await page.evaluate(() => window.mediaScrollProtocol.refs.dualScroll.value.load('end'));
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('dual', 'end') === 3);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('dual', 'end', 'loading'));
    const doneLoadingRuntime = await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual'));
    assert.equal(doneLoadingRuntime.endStatus, 'loading', 'runtime accepts done("loading") and keeps that edge loading');
    assert.equal(doneLoadingRuntime.busy, true, 'done("loading") keeps combined busy true');
    await page.evaluate(() => window.mediaScrollProtocol.refs.dualScroll.value.reset('end'));
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollStatus('dualScroll', 'end')), 'ok', 'explicit reset recovers an edge completed as loading');

    await page.evaluate(() => {
        const component = window.mediaScrollProtocol.refs.dualScroll.value;
        component.load('start');
    });
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('dual', 'start') === 2);
    await page.evaluate(() => {
        const component = window.mediaScrollProtocol.refs.dualScroll.value;
        const event = window.mediaScrollProtocol.state.scrollEvents.dual.filter(item => item.side === 'start').at(-1);
        component.reset('start');
        event.done('error');
    });
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollStatus('dualScroll', 'start')), 'ok', 'reset invalidates the pending component load callback');

    await page.evaluate(() => window.mediaScrollProtocol.setScrollProps({ disabled: true }));
    assert.equal(await page.locator('#dual-load-start').isDisabled(), true, 'disabled is passed to action props');
    const priorEndCount = await page.evaluate(() => window.mediaScrollProtocol.scrollEventCount('dual', 'end'));
    await page.evaluate(() => window.mediaScrollProtocol.refs.dualScroll.value.load('end'));
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollEventCount('dual', 'end')), priorEndCount, 'disabled component blocks explicit new loads');
    await page.evaluate(() => window.mediaScrollProtocol.setScrollProps({ disabled: false }));
    await page.locator('#dual-load-start').click();
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('dual', 'start') === 3);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('dual', 'start', 'empty'));

    const horizontal = await page.locator('#horizontal-scroll').evaluate(element => ({
        classes: element.className,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        actions: [...element.querySelectorAll('[id^="horizontal-load-"]')].map(button => button.id)
    }));
    assert.match(horizontal.classes, /is-horizontal/);
    assert.ok(horizontal.scrollWidth > horizontal.clientWidth, 'horizontal manual mode has a real horizontal scroll axis');
    assert.deepEqual(horizontal.actions, ['horizontal-load-start', 'horizontal-load-end']);
    await page.locator('#horizontal-load-start').click();
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('horizontal', 'start') === 1);
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('horizontal', 'start', 'empty'));
    await page.locator('#horizontal-load-end').click();
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('horizontal', 'end') === 1);
    assert.equal((await page.evaluate(() => window.mediaScrollProtocol.state.scrollEvents.horizontal.at(-1).side)), 'end');
    await page.evaluate(() => window.mediaScrollProtocol.completeScroll('horizontal', 'end', 'empty'));
    console.log('[media-scroll] horizontal manual mode');

    const bothRoot = page.locator('#both-scroll');
    const beforeBoth = await bothRoot.evaluate(element => ({ scrollTop: element.scrollTop, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
    assert.ok(Math.abs(beforeBoth.scrollTop - (beforeBoth.scrollHeight - beforeBoth.clientHeight) / 2) <= 2, 'mounted both-edge component centers its actual scroll viewport');
    const anchorRoot = page.locator('#anchor-scroll');
    const beforeAnchor = await anchorRoot.evaluate(element => ({ scrollTop: element.scrollTop, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
    assert.ok(Math.abs(beforeAnchor.scrollTop - (beforeAnchor.scrollHeight - beforeAnchor.clientHeight)) <= 2, 'mounted start-edge component starts at the actual content end');
    const visibleAnchorBefore = await anchorRoot.evaluate(element => {
        const host = element.getBoundingClientRect();
        const visible = [...element.querySelectorAll('[data-item-id^="old-"]')].find(item => {
            const rect = item.getBoundingClientRect();
            return rect.bottom > host.top + 2 && rect.top < host.bottom - 2;
        });
        return visible ? { id: visible.dataset.itemId, top: visible.getBoundingClientRect().top } : null;
    });
    assert.ok(visibleAnchorBefore, 'start-edge fixture has an existing visible anchor before prepend');
    await page.evaluate(() => window.mediaScrollProtocol.refs.anchorScroll.value.load());
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('anchor', 'start') === 1);
    await page.evaluate(() => window.mediaScrollProtocol.prependAnchor());
    const afterAnchor = await anchorRoot.evaluate(element => {
        const host = element.getBoundingClientRect();
        const visible = [...element.querySelectorAll('[data-item-id^="old-"]')].find(item => {
            const rect = item.getBoundingClientRect();
            return rect.bottom > host.top + 2 && rect.top < host.bottom - 2;
        });
        return { scrollTop: element.scrollTop, visible: visible ? { id: visible.dataset.itemId, top: visible.getBoundingClientRect().top } : null };
    });
    assert.equal(afterAnchor.visible?.id, visibleAnchorBefore.id, 'prepend keeps the same old list item visible');
    assert.ok(Math.abs(afterAnchor.visible.top - visibleAnchorBefore.top) <= 2, 'prepend keeps that item at the same viewport coordinate');
    assert.equal(afterAnchor.scrollTop, beforeAnchor.scrollTop + 64, 'start prepend adjusts actual scrollTop by the two inserted rows');
    console.log('[media-scroll] mount positioning and prepend anchor');

    const autoRoot = page.locator('#auto-scroll');
    const initialAutoCount = await page.evaluate(() => window.mediaScrollProtocol.scrollEventCount('auto', 'end'));
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollEventCount('auto', 'end')), initialAutoCount, 'internal end sentinel remains outside the root margin before scrolling');
    await autoRoot.evaluate(element => element.scrollTop = element.scrollHeight);
    await page.waitForFunction(() => window.mediaScrollProtocol.scrollEventCount('auto', 'end') === 1, undefined, { timeout: 3000 });
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => window.mediaScrollProtocol.scrollEventCount('auto', 'end')), 1, 'native IntersectionObserver triggers one load and empty status stops retries');
    console.log('[media-scroll] native auto-intersection');

    const origin = new URL(previewUrl).origin;
    const mediaRequestPaths = mediaRequests.slice();
    assert.ok(mediaRequestPaths.includes('/__media__/invalid.svg'), 'invalid source was fetched from the local fixture');
    assert.ok(mediaRequestPaths.includes('/__media__/old-slow.svg') && mediaRequestPaths.includes('/__media__/new-fast.svg'), 'source-race endpoints were requested locally');
    assert.ok(requestedUrls.every(url => url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')), 'browser requested no external network assets');

    await page.evaluate(() => window.mediaScrollProtocol.setTheme('light'));
    await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setContentSize(size.width, size.height), { width: 1280, height: 1050 });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.locator('#real-demos').screenshot({ path: path.join(evidence, 'wide-light.png') });
    report.screenshots.push('wide-light.png');
    await page.evaluate(() => window.mediaScrollProtocol.setTheme('dark'));
    await page.locator('#real-demos').screenshot({ path: path.join(evidence, 'wide-dark.png') });
    report.screenshots.push('wide-dark.png');
    await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setContentSize(size.width, size.height), { width: 390, height: 900 });
    await page.waitForTimeout(80);
    assert.ok(await page.locator('#real-demos').evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'real docs demos fit narrow width');
    await page.locator('#real-demos').screenshot({ path: path.join(evidence, 'narrow-dark.png') });
    report.screenshots.push('narrow-dark.png');
    await page.evaluate(() => window.mediaScrollProtocol.setTheme('light'));
    await page.locator('#real-demos').screenshot({ path: path.join(evidence, 'narrow-light.png') });
    report.screenshots.push('narrow-light.png');
    console.log('[media-scroll] screenshots');

    report.image = {
        ...report.image,
        defaultPayload: 'native Event',
        standardProtocolPayload: 'currentSrc URL string',
        loadOrder: protocolEvents.map(event => event.type),
        currentSrc: protocolAfterLoad.currentSrc,
        sourceObjectPropertyOverrides: { srcset: true, lazySrc: true, aspectRatio: true },
        inlineSourceRerender: {
            events: objectSourceBeforeRerender.events,
            parentLoadCount: objectSourceBeforeRerender.loadCount,
            requestsBeforeAndAfterRerender: objectRequestCountBeforeRerender,
            aspectAfterUpdate: objectSourceAfterAspect.style.aspectRatio
        },
        geometry: {
            width: geometry.style.width,
            height: geometry.style.height,
            minWidth: geometry.style.minWidth,
            tileBorderRadius: geometry.style.borderRadius
        },
        realDemo: {
            height: imageDemoGeometry.height,
            rectHeight: imageDemoGeometry.rectHeight,
            imageCurrentSrc: imageDemoGeometry.imageCurrentSrc,
            naturalWidth: imageDemoGeometry.naturalWidth,
            complete: imageDemoGeometry.imageComplete
        },
        naturalAspect: natural.style.aspectRatio,
        pictureCurrentSrc: picture.currentSrc,
        invalidPayload: invalidEvents.at(-1).payload,
        lateSource: { currentSrc: lateImage.currentSrc, eventTypes: lateEvents.map(event => event.type), loadSources: lateLoadSources, staleLoadSources },
        exposed: { elementAlias: protocolAfterLoad.imageAliasMatches, visible: protocolAfterLoad.visible, loading: protocolAfterLoad.loading, error: protocolAfterLoad.error },
        lazyObserver: { optionsReplaced: lazyStats.length === 2, disconnectedOnDisabled: true, disconnectedOnIntersect: true, cleanedOnUnmount: true, eagerSkippedObserver: true, loadedAfterIntersection: lazyLoaded, requestStarted: mediaRequests.includes('/__media__/lazy.svg') }
    };
    report.infiniteScroll = {
        defaults: { defaultScroll: defaultScroll.classes, legacyStart: legacyStart.classes, legacyEnd: legacyEnd.classes },
        defaultSlotScope: await page.evaluate(() => window.mediaScrollProtocol.readScrollScope('dual')),
        doneLoadingRuntime: { endStatus: doneLoadingRuntime.endStatus, busy: doneLoadingRuntime.busy },
        manualSidePayloads: {
            dual: await page.evaluate(() => window.mediaScrollProtocol.state.scrollEvents.dual.map(event => event.side)),
            horizontal: await page.evaluate(() => window.mediaScrollProtocol.state.scrollEvents.horizontal.map(event => event.side))
        },
        startMount: beforeAnchor,
        bothMount: beforeBoth,
        realDemo: {
            initialHeight: initialDemoScroll.height,
            horizontalHeight: horizontalDemo.height,
            horizontalScrollWidth: horizontalDemo.scrollWidth,
            horizontalClientWidth: horizontalDemo.clientWidth,
            horizontalItemWidth: horizontalDemo.itemWidth,
            horizontalScrolledTo: horizontalDemoScrolled,
            directionUpdateMethod: demoDirectionController.selectCount ? 'native selectOption' : 'mounted Vue demo setupState.direction (demo uses custom controls)'
        },
        statusContractEvidence: {
            local: { file: 'src/ui/infinite-scroll-state.ts', lines: [7, 8, 22], doneTypeExcludesLoading: true },
            upstreamTypes: { file: 'artifacts/upstream-table-audit/package/lib/components/VInfiniteScroll/VInfiniteScroll.d.ts', lines: [4, 220], doneTypeIncludesLoading: true },
            upstreamRuntime: { file: 'artifacts/upstream-table-audit/package/lib/components/VInfiniteScroll/VInfiniteScroll.js', lines: [144, 151] },
            runtimeDoneLoading: { endStatus: doneLoadingRuntime.endStatus, busy: doneLoadingRuntime.busy, resetStatus: 'ok' }
        },
        prepend: { before: visibleAnchorBefore, after: afterAnchor, scrollDelta: afterAnchor.scrollTop - beforeAnchor.scrollTop },
        nativeObserver: { events: await page.evaluate(() => window.mediaScrollProtocol.scrollEventCount('auto', 'end')), status: await page.evaluate(() => window.mediaScrollProtocol.scrollStatus('autoScroll', 'end')) }
    };
    report.requests = mediaRequestPaths;
    report.errors = errors;
    report.protocolFailures = protocolFailures;
    assert.deepEqual(errors, [], 'no browser exceptions, console errors or Vue warnings');
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    assert.deepEqual(protocolFailures, [], 'all image and scroll protocol checks pass');
    console.log(JSON.stringify({ evidence, screenshots: report.screenshots, image: report.image, infiniteScroll: report.infiniteScroll, errors }, null, 4));
} catch (error) {
    report.failure = { message: error.message, stack: error.stack };
    report.requests = mediaRequests.slice();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    throw error;
} finally {
    releasePropResponse?.();
    releaseOldResponse?.();
    releaseNewResponse?.();
    if (app) {
        const closed = await Promise.race([
            app.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) app.process().kill();
    }
    await server.close();
    await rm(temporaryDirectory, { recursive: true, force: true });
}
