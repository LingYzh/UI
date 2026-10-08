import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const artifactRoot = path.resolve(root, 'artifacts/component-audit-root/navigation-wrapper-protocols');
const fixtureRoot = path.join(artifactRoot, 'fixture');
await mkdir(fixtureRoot, { recursive: true });

const sources = [
    'src/ui/UNavigationDrawer.vue',
    'src/ui/UiTabsWindowItem.vue',
    'src/ui/UCarouselItem.vue',
    'tests/desktop/navigation-wrapper-protocols.mjs',
    'tests/tsconfig.navigation-wrappers.json',
];
const sourceSha256 = Object.fromEntries(await Promise.all(sources.map(async (file) => [
    file,
    createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex'),
])));

const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" href="data:,"><title>Navigation wrapper protocols</title>
<style>html,body,#app{margin:0;min-height:100%;font-family:Arial,sans-serif}#app{min-height:3000px}#outside{position:absolute;top:1100px;left:30px}#carousel-zone{margin-top:1900px;padding:24px}.ui-navigation-drawer{min-height:160px}</style></head>
<body><div id="app"></div><script type="module" src="/artifacts/component-audit-root/navigation-wrapper-protocols/fixture/main.ts"></script></body></html>`;

const main = `import { createApp, ref } from 'vue';
import { createUI } from '/src/ui/index.ts';
import NavigationWrapperFixture from './NavigationWrapperFixture.vue';
import '/src/ui/styles.css';

const route = ref({ path: '/first' });
const app = createApp(NavigationWrapperFixture);
app.config.globalProperties.$router = { currentRoute: route };
app.use(createUI({ locale: { locale: 'en' } }));
app.mount('#app');
window.navigationWrapperProbe = { app, route };
`;

const fixture = `<script setup>
import { reactive, ref } from 'vue';
import {
    UCarousel, UCarouselItem, ULayout, ULocaleProvider, UNavigationDrawer,
    UTab, UTabs, UTabsWindow, UTabsWindowItem,
} from '/src/ui/index.ts';

const iconImage = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8"><rect width="12" height="8" fill="red"/></svg>');
const state = reactive({
    rail: true,
    temporary: true,
    routeOpen: true,
    routeDisabledOpen: true,
    permanentModel: false,
    statelessClosed: false,
    resizeDisabledOpen: false,
    gestureOpen: false,
    touchless: false,
    tab: 'two',
    tabTwoDisabled: false,
    carouselValue: null,
    carouselNextDisabled: false,
    outsideCount: 0,
    railUpdates: [],
    mainUpdates: [],
});
const refs = {
    drawer: ref(),
    nextDrawer: ref(),
    persistent: ref(),
    routeDrawer: ref(),
    routeDisabledDrawer: ref(),
    permanent: ref(),
    stateless: ref(),
    resizeDisabled: ref(),
    gesture: ref(),
    panelTwo: ref(),
    carouselItem: ref(),
    carouselNext: ref(),
};
const lifecycle = { windowAdded: [], windowRemoved: [], documentAdded: [], documentRemoved: [] };
const trackedTypes = new Set(['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click', 'keydown']);
const nativeWindowAdd = window.addEventListener.bind(window);
const nativeWindowRemove = window.removeEventListener.bind(window);
const nativeDocumentAdd = document.addEventListener.bind(document);
const nativeDocumentRemove = document.removeEventListener.bind(document);
window.addEventListener = function (type, listener, options) {
    if (trackedTypes.has(type)) lifecycle.windowAdded.push({ type, listener, name: listener?.name ?? '' });
    return nativeWindowAdd(type, listener, options);
};
window.removeEventListener = function (type, listener, options) {
    if (trackedTypes.has(type)) lifecycle.windowRemoved.push({ type, listener, name: listener?.name ?? '' });
    return nativeWindowRemove(type, listener, options);
};
document.addEventListener = function (type, listener, options) {
    if (trackedTypes.has(type)) lifecycle.documentAdded.push({ type, listener, name: listener?.name ?? '' });
    return nativeDocumentAdd(type, listener, options);
};
document.removeEventListener = function (type, listener, options) {
    if (trackedTypes.has(type)) lifecycle.documentRemoved.push({ type, listener, name: listener?.name ?? '' });
    return nativeDocumentRemove(type, listener, options);
};

window.navigationWrapperFixture = { state, refs, lifecycle };
</script>

<template>
    <ULayout>
        <UNavigationDrawer id="drawer-main" :ref="refs.drawer" location="start" :width="230" :rail="state.rail" :rail-width="64" expand-on-hover @update:rail="state.railUpdates.push($event)" @update:model-value="state.mainUpdates.push($event)">
            <template #prepend="{ isActive, toggle, rail }"><span id="drawer-prepend">{{ isActive }}:{{ rail }}</span><button id="drawer-prepend-toggle" type="button" @click="toggle">Toggle</button></template>
            <template #default="{ isActive, toggle, close, open, expanded, rail }">
                <button id="drawer-toggle" type="button" @click="toggle">{{ isActive }}:{{ expanded }}:{{ rail }}</button>
                <button id="drawer-slot-close" type="button" @click="close">Close</button>
                <button id="drawer-slot-open" type="button" @click="open">Open</button>
            </template>
            <template #append="{ isActive, rail }"><span id="drawer-append">{{ isActive }}:{{ rail }}</span></template>
        </UNavigationDrawer>
        <UNavigationDrawer id="drawer-next" :ref="refs.nextDrawer" location="left" :width="110" :order="1">Next</UNavigationDrawer>
        <UNavigationDrawer id="drawer-persistent" :ref="refs.persistent" v-model="state.temporary" temporary persistent absolute @click:outside="state.outsideCount++">Persistent</UNavigationDrawer>
        <UNavigationDrawer id="drawer-route" :ref="refs.routeDrawer" v-model="state.routeOpen" temporary persistent absolute>Route closes</UNavigationDrawer>
        <UNavigationDrawer id="drawer-route-disabled" :ref="refs.routeDisabledDrawer" v-model="state.routeDisabledOpen" temporary persistent absolute disable-route-watcher>Route stays</UNavigationDrawer>
        <UNavigationDrawer id="drawer-permanent" :ref="refs.permanent" v-model="state.permanentModel" permanent absolute>
            <template #default="{ close }"><button id="permanent-close" type="button" @click="close">Close</button></template>
        </UNavigationDrawer>
        <UNavigationDrawer id="drawer-stateless" :ref="refs.stateless" stateless absolute>
            <template #default="{ close, open }"><button id="stateless-close" type="button" @click="close">Close</button><button id="stateless-open" type="button" @click="open">Open</button></template>
        </UNavigationDrawer>
        <UNavigationDrawer id="drawer-resize-disabled" :ref="refs.resizeDisabled" disable-resize-watcher absolute>Resize stays</UNavigationDrawer>
        <UNavigationDrawer id="drawer-gesture" :ref="refs.gesture" v-model="state.gestureOpen" temporary absolute :touchless="state.touchless">Gesture</UNavigationDrawer>
        <ULocaleProvider locale="ar">
            <UNavigationDrawer id="drawer-rtl" location="start" :width="200" absolute>RTL</UNavigationDrawer>
        </ULocaleProvider>

        <UTabs v-model="state.tab" mandatory="force">
            <UTab value="one" data-wrapper-tab="one">One</UTab>
            <UTab value="two" data-wrapper-tab="two" :disabled="state.tabTwoDisabled">Two</UTab>
            <template #window>
                <UTabsWindow v-model="state.tab">
                    <UTabsWindowItem value="one"><span id="panel-one">One panel</span></UTabsWindowItem>
                    <UTabsWindowItem :ref="refs.panelTwo" value="two"><template #default="{ selected, disabled, value }"><span id="panel-two">{{ selected }}:{{ disabled }}:{{ value }}</span></template></UTabsWindowItem>
                </UTabsWindow>
            </template>
        </UTabs>

        <button id="outside" type="button">Outside target</button>
        <div id="carousel-zone">
            <UCarousel v-model="state.carouselValue" :cycle="false" :interval="0" label="Wrapper test carousel">
                <UCarouselItem :ref="refs.carouselItem" :src="iconImage" alt="Delayed carousel image" lazy>
                    <template #default="{ selected, select, disabled, loading, state: imageState }">
                        <button id="carousel-image-select" type="button" :aria-pressed="selected" :disabled="disabled" @click="select">{{ loading }}:{{ imageState }}</button>
                    </template>
                </UCarouselItem>
                <UCarouselItem :ref="refs.carouselNext" id="carousel-next-item" value="next" :disabled="state.carouselNextDisabled">
                    <template #default="{ selected, select, disabled }"><button id="carousel-next-select" type="button" :aria-pressed="selected" :disabled="disabled" @click="select">Next</button></template>
                </UCarouselItem>
            </UCarousel>
        </div>
    </ULayout>
</template>`;

await writeFile(path.join(fixtureRoot, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureRoot, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureRoot, 'NavigationWrapperFixture.vue'), fixture, 'utf8');

const checks = [];
const errors = [];
const consoleErrors = [];
const consoleWarnings = [];
const httpErrors = [];
const requestFailures = [];
const reportPath = path.join(artifactRoot, 'report.json');
const vite = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(artifactRoot, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/component-audit-root/navigation-wrapper-protocols/fixture/main.ts'],
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
            'markdown-it-sup',
        ],
    },
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    logLevel: 'error',
});

let browser;
let failure;
const record = (name) => checks.push({ name, passed: true });
const settle = (page) => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) consoleWarnings.push(message.text());
    });
    page.on('response', response => { if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() }); });
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/component-audit-root/navigation-wrapper-protocols/fixture/index.html`);
    await page.waitForFunction(() => !!window.navigationWrapperFixture && !!window.navigationWrapperProbe);
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'false');

    assert.equal(await page.locator('#drawer-main').getAttribute('data-location'), 'left');
    assert.equal(await page.locator('#drawer-main').evaluate(element => element.style.width), '64px');
    assert.equal(await page.locator('#drawer-next').evaluate(element => element.style.left), '64px');
    assert.equal(await page.locator('#drawer-rtl').getAttribute('data-location'), 'right');
    assert.equal(await page.locator('#drawer-rtl').evaluate(element => element.style.right), '0px');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.element.id), 'drawer-main');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.size), 64);
    assert.equal(await page.locator('#drawer-prepend').textContent(), 'true:true');
    assert.equal(await page.locator('#drawer-append').textContent(), 'true:true');
    assert.equal(await page.locator('#drawer-toggle').textContent(), 'true:false:true');
    record('public drawer registration, default desktop state, ref element/size, layout offset, and RTL physical start');

    await page.locator('#drawer-main').dispatchEvent('mouseenter');
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.style.width === '230px');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.expanded), true);
    assert.equal(await page.locator('#drawer-next').evaluate(element => element.style.left), '64px');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.state.railUpdates.at(-1)), false);
    await page.locator('#drawer-main').dispatchEvent('mouseleave');
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.style.width === '64px');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.state.railUpdates.at(-1)), true);
    record('rail hover expands visual width, keeps compact layout size, emits update:rail, and restores');

    await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.close());
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'true');
    await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.open());
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'false');
    await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.toggle());
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'true');
    assert.ok(await page.evaluate(() => window.navigationWrapperFixture.state.mainUpdates.includes(false)));
    assert.ok(await page.evaluate(() => window.navigationWrapperFixture.state.mainUpdates.includes(true)));
    await page.evaluate(() => window.navigationWrapperFixture.refs.drawer.value.open());
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'false');
    record('drawer public open/close/toggle update internal state and emit model updates');

    await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForFunction(() => window.navigationWrapperFixture.state.outsideCount === 1);
    assert.equal(await page.locator('#drawer-persistent').getAttribute('aria-hidden'), 'false');
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(await page.locator('#drawer-persistent').getAttribute('aria-hidden'), 'false');
    await page.evaluate(() => { window.navigationWrapperProbe.route.value = { path: '/second' }; });
    await page.waitForFunction(() => document.querySelector('#drawer-route')?.getAttribute('aria-hidden') === 'true');
    assert.equal(await page.locator('#drawer-route-disabled').getAttribute('aria-hidden'), 'false');
    assert.equal(await page.locator('#drawer-permanent').getAttribute('aria-hidden'), 'false');
    await page.locator('#permanent-close').evaluate(element => element.click());
    assert.equal(await page.locator('#drawer-permanent').getAttribute('aria-hidden'), 'false');
    record('persistent outside/Escape, click:outside emission, optional route watcher, and permanent close guard');

    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.panelTwo.value.selected), true);
    await page.evaluate(() => { window.navigationWrapperFixture.state.tabTwoDisabled = true; });
    await page.waitForFunction(() => window.navigationWrapperFixture.refs.panelTwo.value.disabled === true);
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.state.tab), 'two', 'disabling an externally selected tab does not rewrite the controlled model');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.panelTwo.value.disabled), true);
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.panelTwo.value.selected), true, 'the disabled tab remains selected while the external model still names it');
    const tabOne = page.locator('[data-wrapper-tab="one"]');
    const tabTwo = page.locator('[data-wrapper-tab="two"]');
    assert.equal(await tabTwo.getAttribute('aria-selected'), 'true');
    assert.equal(await tabTwo.getAttribute('tabindex'), '-1', 'a disabled selected tab is removed from the roving keyboard stop');
    assert.equal(await tabOne.getAttribute('tabindex'), '0', 'the first enabled tab becomes the roving stop');
    assert.equal(await page.locator('#panel-two').evaluate(element => element.closest('[role="tabpanel"]').getAttribute('aria-disabled')), 'true');
    assert.equal(await page.locator('#panel-two').textContent(), 'true:true:two');
    await page.evaluate(() => { window.navigationWrapperFixture.state.tab = 'one'; });
    await page.waitForFunction(() => window.navigationWrapperFixture.refs.panelTwo.value.selected === false);
    assert.equal(await tabOne.getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#panel-two').evaluate(element => element.closest('[role="tabpanel"]').getAttribute('aria-hidden')), 'true');
    assert.equal(await page.locator('#panel-two').textContent(), 'false:true:two');
    record('disabled selected Tabs keep controlled model/ARIA, leave roving stop, and Window follows explicit model change');

    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.carouselItem.value.value), 0);
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.carouselItem.value.selected), true);
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.carouselItem.value.disabled), false);
    const image = page.locator('#carousel-zone img.u-img-main');
    assert.equal(await image.getAttribute('alt'), 'Delayed carousel image');
    assert.equal(await image.getAttribute('src'), null);
    await page.locator('#carousel-zone .u-img').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#carousel-zone img.u-img-main')?.getAttribute('src')?.startsWith('data:image/svg+xml,'));
    await page.waitForFunction(() => document.querySelector('#carousel-zone img.u-img-main')?.naturalWidth === 12);
    assert.equal(await image.evaluate(element => getComputedStyle(element).objectFit), 'cover');
    await page.evaluate(() => { window.navigationWrapperFixture.state.carouselNextDisabled = true; });
    await page.waitForFunction(() => window.navigationWrapperFixture.refs.carouselNext.value.disabled === true);
    await page.evaluate(() => window.navigationWrapperFixture.refs.carouselNext.value.select());
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.state.carouselValue), 0);
    await page.evaluate(() => { window.navigationWrapperFixture.state.carouselNextDisabled = false; });
    await page.waitForFunction(() => window.navigationWrapperFixture.refs.carouselNext.value.disabled === false);
    await page.evaluate(() => window.navigationWrapperFixture.refs.carouselNext.value.select());
    await page.waitForFunction(() => window.navigationWrapperFixture.state.carouselValue === 'next');
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.refs.carouselNext.value.selected), true);
    await page.waitForFunction(() => window.navigationWrapperFixture.refs.carouselNext.value.element?.id === 'carousel-next-item');
    record('carousel item registers omitted values by group index, forwards selection, lazy image src/alt/cover, and slot/ref state');

    await page.setViewportSize({ width: 500, height: 900 });
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'true');
    await page.waitForFunction(() => document.querySelector('#drawer-stateless')?.getAttribute('aria-hidden') === 'false');
    assert.equal(await page.locator('#drawer-resize-disabled').getAttribute('aria-hidden'), 'false');
    await page.locator('#stateless-close').evaluate(element => element.click());
    await page.waitForFunction(() => document.querySelector('#drawer-stateless')?.getAttribute('aria-hidden') === 'true');
    await page.locator('#stateless-open').evaluate(element => element.click());
    await page.waitForFunction(() => document.querySelector('#drawer-stateless')?.getAttribute('aria-hidden') === 'false');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForFunction(() => document.querySelector('#drawer-main')?.getAttribute('aria-hidden') === 'false');
    record('mobile resize closes/reopens default drawer; stateless and disableResizeWatcher block automation but preserve user controls');

    const dispatchSwipe = (page, id, start, end) => page.evaluate(({ id, start, end }) => {
        const dispatch = (type, x) => window.dispatchEvent(new PointerEvent(type, {
            pointerId: id, pointerType: 'touch', isPrimary: true, clientX: x, clientY: 100, bubbles: true, cancelable: true,
        }));
        dispatch('pointerdown', start);
        dispatch('pointermove', end);
        dispatch('pointerup', end);
    }, { id, start, end });
    await dispatchSwipe(page, 201, 5, 100);
    await page.waitForFunction(() => window.navigationWrapperFixture.state.gestureOpen === true);
    await page.evaluate(() => { window.navigationWrapperFixture.state.gestureOpen = false; window.navigationWrapperFixture.state.touchless = true; });
    await dispatchSwipe(page, 202, 5, 100);
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.navigationWrapperFixture.state.gestureOpen), false);
    record('touch edge gesture opens the drawer; touchless blocks the gesture');

    const expectedListenerNames = new Set(['onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerCancel', 'closeFromOutside', 'onDocumentKeydown']);
    const beforeUnmount = await page.evaluate(expectedNames => {
        const { lifecycle } = window.navigationWrapperFixture;
        return [...lifecycle.windowAdded, ...lifecycle.documentAdded].filter(item => expectedNames.includes(item.name)).map(item => item.name);
    }, [...expectedListenerNames]);
    await page.evaluate(() => window.navigationWrapperProbe.app.unmount());
    const listenerCleanup = await page.evaluate(expectedNames => {
        const { lifecycle } = window.navigationWrapperFixture;
        const added = [...lifecycle.windowAdded, ...lifecycle.documentAdded].filter(item => expectedNames.includes(item.name));
        const removed = [...lifecycle.windowRemoved, ...lifecycle.documentRemoved];
        return added.map(item => ({
            name: item.name,
            removed: removed.some(candidate => candidate.type === item.type && candidate.listener === item.listener),
        }));
    }, [...expectedListenerNames]);
    assert.ok(beforeUnmount.length >= 10);
    assert.ok(listenerCleanup.length >= 10);
    assert.ok(listenerCleanup.every(item => item.removed), JSON.stringify(listenerCleanup));
    record('drawer document and pointer listeners are removed on unmount');

    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(consoleWarnings, []);
    assert.deepEqual(httpErrors, []);
    assert.deepEqual(requestFailures, []);
    record('public entry produced no page, Vue, HTTP, or request errors');
} catch (error) {
    failure = error;
    throw error;
} finally {
    if (browser) await browser.close();
    await vite.close();
    await writeFile(reportPath, JSON.stringify({
        fixture: 'navigation-wrapper-protocols',
        method: 'Vite fixture imports the public src/ui/index.ts entry and drives real Drawer, TabsWindowItem, and CarouselItem SFCs in Chromium.',
        sourceSha256,
        checks,
        failed: failure ? String(failure.stack ?? failure) : null,
        pageErrors: errors,
        consoleErrors,
        consoleWarnings,
        httpErrors,
        requestFailures,
    }, null, 2) + '\n', 'utf8');
    console.log(`Navigation wrapper report: ${reportPath}`);
    console.log(`Navigation wrapper checks: ${checks.length}`);
}
