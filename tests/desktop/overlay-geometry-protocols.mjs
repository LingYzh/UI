import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/overlay-geometry-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/overlay-position.ts',
    'src/ui/overlay-props.ts',
    'src/ui/dimensions.ts',
    'src/ui/UOverlay.vue',
    'src/ui/UiMenu.vue',
    'src/ui/UiDialog.vue',
    'src/ui/overlay-lifecycle.ts',
    'src/ui/menu.ts',
    'src/ui/feedback.css',
    'src/ui/layout-components.css',
    'src/ui/styles.css'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(productSources.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const sourceSha256 = await hashSources();
const html = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>Overlay geometry protocols</title>
        <style>
            * { box-sizing: border-box; }
            body { margin: 0; min-height: 1200px; }
            #target-a, #target-b { position: fixed; display: block; height: 40px; }
            #target-a { left: 120px; top: 100px; width: 120px; }
            #target-b { left: 500px; top: 220px; width: 100px; }
            #parent-target { position: fixed; left: 330px; top: 80px; width: 160px; height: 48px; }
            #parent-trigger { width: 100%; height: 100%; }
            #legacy-slot-trigger { position: fixed; left: 70px; top: 40px; width: 120px; height: 30px; }
            #native-trigger { position: fixed; left: 600px; top: 80px; width: 130px; height: 32px; }
            #static-trigger { position: fixed; left: 600px; top: 170px; width: 130px; height: 32px; }
            #scroll-box { position: fixed; left: 40px; top: 300px; width: 280px; height: 170px; overflow: auto; }
            #scroll-spacer { height: 220px; }
            #scroll-target { display: block; width: 110px; height: 28px; }
        </style>
    </head>
    <body>
        <button id="target-a" type="button">Target A</button>
        <button id="target-b" type="button">Target B</button>
        <div id="parent-target"><button id="parent-trigger" type="button">Parent activator</button></div>
        <button id="legacy-trigger" type="button">Legacy anchor</button>
        <button id="native-trigger" type="button">Native menu</button>
        <button id="static-trigger" type="button">Static menu</button>
        <div id="scroll-box"><div id="scroll-spacer"></div><button id="scroll-target" type="button">Scroll target</button></div>
        <div id="app"></div>
        <script type="module" src="/artifacts/full-alignment/overlay-geometry-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import OverlayGeometryFixture from './OverlayGeometryFixture.vue';
import '/src/ui/styles.css';

createApp(OverlayGeometryFixture).use(createUI()).mount('#app');
`;

const fixture = `<script setup>
import { onMounted, reactive, ref } from 'vue';
import { UOverlay, UMenu, UiDialog } from '/src/ui/index.ts';

const state = reactive({
    overlayTarget: '#target-a', overlayLocation: 'bottom-start', overlayOpen: true,
    menuTarget: null, menuLocation: 'bottom-start', menuOpen: true,
    dialogTarget: [260, 180], dialogOpen: false,
    legacyOpen: false, parentOpen: false, cursorClick: [0, 0],
    centerOverlayOpen: false, centerDialogOpen: false, endDialogOpen: false,
    staticMenuOpen: false, staticTopOverlayOpen: false, staticBottomOverlayOpen: false,
    staticTopDialogOpen: false, staticBottomDialogOpen: false, fullscreen: false
});
const refs = { overlay: ref(), menu: ref(), dialog: ref(), legacy: ref(), parent: ref(), cursor: ref(), centerOverlay: ref(), centerDialog: ref(), endDialog: ref() };
state.menuTarget = document.querySelector('#target-a');
window.__overlayGeometry = { state, refs };
</script>

<template>
    <main>
        <UOverlay
            :ref="refs.overlay"
            v-model="state.overlayOpen"
            :persistent="true"
            :scrim="false"
            :retain-focus="false"
            location-strategy="connected"
            :location="state.overlayLocation"
            :target="state.overlayTarget"
            :offset="[6, 4]"
            :viewport-margin="8"
            width="220" min-width="200" max-width="250"
            height="110" min-height="100" max-height="130"
            scroll-strategy="none"
            content-class="geometry-overlay-class">
            <template #default><div id="geometry-overlay-content">Overlay position target consumer</div></template>
        </UOverlay>

        <UMenu
            :ref="refs.menu"
            v-model:open="state.menuOpen"
            :target="state.menuTarget"
            :location="state.menuLocation"
            location-strategy="connected"
            :offset="[5, 3]"
            :viewport-margin="8"
            width="200" min-width="180" max-width="240"
            height="100" min-height="90" max-height="120"
            scroll-strategy="reposition"
            content-class="geometry-menu-class">
            <template #default><div id="geometry-menu-content">Menu position target consumer</div></template>
        </UMenu>

        <UiDialog
            :ref="refs.dialog"
            :open="state.dialogOpen"
            @update:open="state.dialogOpen = $event"
            :retain-focus="false"
            location-strategy="connected"
            location="bottom-start"
            :target="state.dialogTarget"
            :offset="[7, 2]"
            :viewport-margin="8"
            width="210" min-width="205" max-width="230"
            height="120" min-height="110" max-height="140"
            scroll-strategy="block"
            :content-props="{ class: 'geometry-dialog-class' }">
            <template #default><div id="geometry-dialog-content">Dialog position target consumer</div></template>
        </UiDialog>

        <UOverlay
            :ref="refs.legacy"
            location="anchor"
            width="100" height="60"
            :scrim="false" :retain-focus="false"
            open-on-click>
            <template #activator="scope"><button id="legacy-slot-trigger" type="button" v-bind="scope.props">Legacy slot activator</button></template>
            <template #default><div id="legacy-slot-content">Legacy default anchor</div></template>
        </UOverlay>

        <UOverlay
            :ref="refs.parent"
            activator="#parent-trigger"
            target="parent"
            location-strategy="connected"
            location="bottom-start"
            :offset="0"
            :viewport-margin="0"
            width="100" height="60"
            :scrim="false" :retain-focus="false"
            open-on-click>
            <template #default><div id="parent-target-content">Parent target content</div></template>
        </UOverlay>

        <UOverlay
            :ref="refs.cursor"
            location-strategy="connected"
            target="cursor"
            location="bottom-start"
            :offset="0"
            :viewport-margin="0"
            width="100" height="60"
            :scrim="false" :retain-focus="false"
            open-on-click>
            <template #activator="scope"><button id="cursor-trigger" type="button" v-bind="scope.props" @click="state.cursorClick = [$event.clientX, $event.clientY]" style="position:fixed;left:400px;top:360px">Cursor target activator</button></template>
            <template #default><div id="cursor-target-content">Cursor target content</div></template>
        </UOverlay>

        <UOverlay :ref="refs.centerOverlay" v-model="state.centerOverlayOpen" :fullscreen="state.fullscreen" width="120" height="80" :scrim="false" :retain-focus="false" content-class="center-probe-overlay">
            <template #default><div id="center-overlay-content">Centered overlay</div></template>
        </UOverlay>

        <UMenu activator="#native-trigger" label="Native default menu">
            <template #default><div id="native-menu-content">Native menu</div></template>
        </UMenu>
        <UMenu activator="#static-trigger" v-model:open="state.staticMenuOpen" location-strategy="static" location="bottom-start" content-class="static-menu-class" label="Static menu">
            <template #default><div id="static-menu-content">Static menu</div></template>
        </UMenu>

        <UOverlay v-model="state.staticTopOverlayOpen" location-strategy="static" location="top" width="120" height="80" :scrim="false" :retain-focus="false" content-class="static-top-overlay-class">
            <template #default><div id="static-top-overlay-content">Static top Overlay</div></template>
        </UOverlay>
        <UOverlay v-model="state.staticBottomOverlayOpen" location-strategy="static" location="bottom" width="120" height="80" :scrim="false" :retain-focus="false" content-class="static-bottom-overlay-class">
            <template #default><div id="static-bottom-overlay-content">Static bottom Overlay</div></template>
        </UOverlay>

        <UiDialog :ref="refs.centerDialog" :open="state.centerDialogOpen" :fullscreen="state.fullscreen" @update:open="state.centerDialogOpen = $event" :retain-focus="false" scroll-strategy="none" width="160" height="90">
            <template #default><div id="center-dialog-content">Default centered dialog</div></template>
        </UiDialog>
        <UiDialog :ref="refs.endDialog" :open="state.endDialogOpen" @update:open="state.endDialogOpen = $event" placement="end" :retain-focus="false" scroll-strategy="none">
            <template #default><div id="end-dialog-content">End placement dialog</div></template>
        </UiDialog>
        <UiDialog :open="state.staticTopDialogOpen" @update:open="state.staticTopDialogOpen = $event" location-strategy="static" location="top" :retain-focus="false" scroll-strategy="none" width="160" height="90" :content-props="{ class: 'static-top-dialog-class' }">
            <template #default><div id="static-top-dialog-content">Static top Dialog</div></template>
        </UiDialog>
        <UiDialog :open="state.staticBottomDialogOpen" @update:open="state.staticBottomDialogOpen = $event" location-strategy="static" location="bottom" :retain-focus="false" scroll-strategy="none" width="160" height="90" :content-props="{ class: 'static-bottom-dialog-class' }">
            <template #default><div id="static-bottom-dialog-content">Static bottom Dialog</div></template>
        </UiDialog>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'OverlayGeometryFixture.vue'), fixture, 'utf8');

const virtualRoute = '/__overlay-geometry-protocols';
const fixturePlugin = {
    name: 'overlay-geometry-protocols-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== virtualRoute) { next(); return; }
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
        entries: ['artifacts/full-alignment/overlay-geometry-protocols/fixture/main.ts'],
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
    server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    plugins: [fixturePlugin]
});

const report = {
    fixture: 'overlay-geometry-protocols',
    method: 'A Chromium fixture imports UOverlay, UMenu and UiDialog from the public index and checks computed browser geometry and native positioning behavior.',
    sourceSha256,
    checks: [],
    protocolFailures: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    limits: [
        'Chromium public-source fixture only; no Electron or packaged-library acceptance is claimed.',
        'No full build/test run or visual design acceptance is claimed.'
    ]
};
const pageErrors = [];
const consoleErrors = [];
const consoleWarnings = [];
let browser;
let page;
function passed(name, details) { report.checks.push({ name, details }); }
async function staticStyle(selector) {
    return page.locator(selector).evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return {
            position: element.style.position,
            inset: element.style.inset,
            marginTop: element.style.marginTop,
            marginRight: element.style.marginRight,
            marginBottom: element.style.marginBottom,
            marginLeft: element.style.marginLeft,
            positionAnchor: element.style.getPropertyValue('position-anchor'),
            positionArea: element.style.getPropertyValue('position-area'),
            positionTryFallbacks: element.style.getPropertyValue('position-try-fallbacks'),
            rect: { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom }
        };
    });
}
function recordStaticProtocol(name, actual, expected) {
    const mismatches = Object.fromEntries(Object.entries(expected).filter(([key, value]) => {
        if (key === 'rect') return Object.entries(value).some(([edge, edgeValue]) => Math.abs(actual.rect[edge] - edgeValue) > 1.5);
        return actual[key] !== value;
    }).map(([key]) => [key, { expected: expected[key], actual: actual[key] }]));
    if (Object.keys(mismatches).length) report.protocolFailures.push({ contract: name, mismatches });
}
async function settle(delay = 60) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (delay) await page.waitForTimeout(delay);
}
async function rect(selector) {
    return page.locator(selector).evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom, width: bounds.width, height: bounds.height, style: { left: element.style.left, top: element.style.top, width: element.style.width, minWidth: element.style.minWidth, maxWidth: element.style.maxWidth, height: element.style.height, minHeight: element.style.minHeight, maxHeight: element.style.maxHeight, position: element.style.position } };
    });
}
function closeTo(actual, expected, label, tolerance = 1.5) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected} ± ${tolerance}, got ${actual}`);
}
async function setRef(name, path, value) {
    await page.evaluate(([refName, key, nextValue]) => { window.__overlayGeometry.state[key] = nextValue; }, [name, path, value]);
}
async function callRef(name, method) {
    await page.evaluate(([refName, key]) => window.__overlayGeometry.refs[refName].value[key](), [name, method]);
    await settle();
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, 'fixture document is served');
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    page = await browser.newPage({ viewport: { width: 900, height: 700 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => pageErrors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('dialog.ui-overlay[open]') && document.querySelector('.ui-menu-surface[data-state="open"]'));
    await settle(120);

    const overlay = await rect('dialog.ui-overlay.geometry-overlay-class');
    const menu = await rect('.ui-menu-surface.geometry-menu-class');
    for (const [name, item, expected] of [
        ['Overlay', overlay, { width: '220px', minWidth: '200px', maxWidth: '250px', height: '110px', minHeight: '100px', maxHeight: '130px' }],
        ['Menu', menu, { width: '200px', minWidth: '180px', maxWidth: '240px', height: '100px', minHeight: '90px', maxHeight: '120px' }]
    ]) {
        for (const [property, value] of Object.entries(expected)) assert.equal(item.style[property], value, `${name} consumes ${property}`);
    }
    assert.equal(overlay.style.position, 'absolute');
    assert.equal(menu.style.position, 'absolute');
    assert.equal(await page.locator('#geometry-overlay-content').count(), 1);
    assert.equal(await page.locator('#geometry-menu-content').count(), 1);
    closeTo(overlay.left, 124, 'selector target overlay left');
    closeTo(overlay.top, 146, 'selector target overlay top');
    closeTo(menu.left, 123, 'HTMLElement target menu left');
    closeTo(menu.top, 145, 'HTMLElement target menu top');
    assert.equal(await page.locator('.ui-menu-surface.geometry-menu-class').getAttribute('data-scroll-strategy'), 'reposition');
    assert.equal(await page.locator('dialog.ui-overlay.geometry-overlay-class').getAttribute('data-scroll-strategy'), 'none');
    passed('public Overlay and Menu consume dimensions, contentClass and connected target geometry', 'Selector and HTMLElement targets place the open content at target bounds plus configured offsets; all six dimension props reach live content styles.');

    await page.evaluate(() => { document.body.style.overflow = 'scroll'; window.__overlayGeometry.state.dialogOpen = true; });
    await page.waitForFunction(() => document.querySelector('dialog.ui-dialog.geometry-dialog-class[open]')?.dataset.state === 'open');
    await settle(100);
    const dialog = await rect('dialog.ui-dialog.geometry-dialog-class');
    for (const [property, value] of Object.entries({ width: '210px', minWidth: '205px', maxWidth: '230px', height: '120px', minHeight: '110px', maxHeight: '140px' })) {
        assert.equal(dialog.style[property], value, `Dialog consumes ${property}`);
    }
    closeTo(dialog.left, 262, 'point target dialog left');
    closeTo(dialog.top, 187, 'point target dialog top');
    assert.equal(await page.locator('dialog.ui-dialog.geometry-dialog-class').getAttribute('data-scroll-strategy'), 'block');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Dialog default block strategy locks document scrolling');
    passed('public Dialog consumes point target, dimensions and block scroll strategy', 'A [x,y] target and explicit connected position compute the expected fixed geometry; body lock is visible while open.');

    await page.evaluate(() => {
        const { state } = window.__overlayGeometry;
        state.overlayTarget = '#target-b';
        state.overlayLocation = 'bottom-end';
        state.menuTarget = document.querySelector('#target-b');
        state.menuLocation = 'bottom-end';
        state.dialogTarget = [330, 220];
    });
    await settle(150);
    const migratedOverlay = await rect('dialog.ui-overlay.geometry-overlay-class');
    const migratedMenu = await rect('.ui-menu-surface.geometry-menu-class');
    const migratedDialog = await rect('dialog.ui-dialog.geometry-dialog-class');
    const targetB = await rect('#target-b');
    closeTo(migratedOverlay.left, targetB.right - migratedOverlay.width + 4, 'migrated selector target end alignment');
    closeTo(migratedOverlay.top, targetB.bottom + 6, 'migrated selector target main offset');
    closeTo(migratedMenu.left, targetB.right - migratedMenu.width + 3, 'migrated HTMLElement target end alignment');
    closeTo(migratedMenu.top, targetB.bottom + 5, 'migrated HTMLElement target main offset');
    closeTo(migratedDialog.left, 332, 'migrated point target dialog left');
    closeTo(migratedDialog.top, 227, 'migrated point target dialog top');
    await page.evaluate(() => { window.__overlayGeometry.state.dialogTarget = [350, 240]; });
    await callRef('dialog', 'updateLocation');
    const explicitlyUpdatedDialog = await rect('dialog.ui-dialog.geometry-dialog-class');
    closeTo(explicitlyUpdatedDialog.left, 352, 'Dialog exposed updateLocation left');
    closeTo(explicitlyUpdatedDialog.top, 247, 'Dialog exposed updateLocation top');
    passed('target replacement and public updateLocation refresh all three components', 'Overlay selector, Menu HTMLElement and Dialog point targets can be replaced while open, and Dialog ref updateLocation remeasures the new point.');

    const beforeResizeLeft = migratedMenu.left;
    await page.locator('#target-b').evaluate(element => { element.style.width = '140px'; element.style.height = '52px'; });
    await page.waitForFunction(previous => {
        const menu = document.querySelector('.ui-menu-surface.geometry-menu-class');
        return menu && Math.abs(parseFloat(menu.style.left) - previous) > 20;
    }, beforeResizeLeft);
    const resizedTarget = await rect('#target-b');
    const resizedMenu = await rect('.ui-menu-surface.geometry-menu-class');
    closeTo(resizedMenu.left, resizedTarget.right - resizedMenu.width + 3, 'ResizeObserver target width update');
    closeTo(resizedMenu.top, resizedTarget.bottom + 5, 'ResizeObserver target height update');
    const beforeWindowResize = await rect('dialog.ui-overlay.geometry-overlay-class');
    await page.setViewportSize({ width: 400, height: 500 });
    await settle(120);
    for (const [name, current] of [
        ['Overlay', await rect('dialog.ui-overlay.geometry-overlay-class')],
        ['Menu', await rect('.ui-menu-surface.geometry-menu-class')],
        ['Dialog', await rect('dialog.ui-dialog.geometry-dialog-class')]
    ]) {
        assert.ok(current.left >= 7.5 && current.top >= 7.5, `${name} remains within viewport leading margin after resize`);
        assert.ok(current.right <= 392.5 && current.bottom <= 492.5, `${name} remains within viewport trailing margin after resize`);
    }
    assert.notEqual((await rect('dialog.ui-overlay.geometry-overlay-class')).left, beforeWindowResize.left, 'window resize recomputes connected Overlay geometry');
    passed('target ResizeObserver and viewport resize recompute connected placement', 'Target dimension changes update Menu alignment; window resize keeps all open connected surfaces inside the configured viewport margin.');

    await page.evaluate(() => {
        const { state } = window.__overlayGeometry;
        state.overlayTarget = '#scroll-target';
        state.overlayLocation = 'bottom-start';
        state.menuTarget = document.querySelector('#scroll-target');
        state.menuLocation = 'bottom-start';
    });
    await settle();
    await page.evaluate(() => {
        const box = document.querySelector('#scroll-box');
        box.style.top = '100px';
        box.scrollTop = 80;
    });
    await page.waitForFunction(() => document.querySelector('#scroll-target').getBoundingClientRect().top < 500);
    await settle(120);
    const scrolledTarget = await rect('#scroll-target');
    const menuAfterScroll = await rect('.ui-menu-surface.geometry-menu-class');
    const overlayBeforeExplicitScrollUpdate = await rect('dialog.ui-overlay.geometry-overlay-class');
    closeTo(menuAfterScroll.top, scrolledTarget.bottom + 5, 'Menu reposition scroll strategy follows target scroll');
    assert.notEqual(overlayBeforeExplicitScrollUpdate.top, scrolledTarget.bottom + 6, 'Overlay none strategy does not reposition automatically on scroll');
    await callRef('overlay', 'updateLocation');
    const overlayAfterExplicitScrollUpdate = await rect('dialog.ui-overlay.geometry-overlay-class');
    closeTo(overlayAfterExplicitScrollUpdate.top, scrolledTarget.bottom + 6, 'Overlay explicit updateLocation after scroll');
    passed('scroll strategies preserve none versus reposition behavior', 'Menu follows a scrolled target under reposition; standalone Overlay stays put under none until its public updateLocation is called.');

    await page.evaluate(() => { window.__overlayGeometry.state.dialogOpen = false; });
    await page.waitForFunction(() => !document.querySelector('dialog.ui-dialog.geometry-dialog-class')?.open);
    await page.waitForFunction(() => document.body.style.overflow === 'scroll');

    await page.setViewportSize({ width: 900, height: 700 });
    await page.locator('#legacy-slot-trigger').click();
    await page.waitForFunction(() => document.querySelector('#legacy-slot-content')?.closest('dialog')?.open);
    const legacyAnchor = await rect('dialog:has(#legacy-slot-content)');
    const legacyTrigger = await rect('#legacy-slot-trigger');
    closeTo(legacyAnchor.left, legacyTrigger.left, 'legacy anchor defaults to start alignment');
    closeTo(legacyAnchor.top, legacyTrigger.bottom + 4, 'legacy anchor keeps four pixel offset');
    assert.match(await page.locator('dialog:has(#legacy-slot-content)').getAttribute('class'), /is-anchor/);
    await callRef('legacy', 'close');
    await page.waitForFunction(() => !document.querySelector('#legacy-slot-content')?.closest('dialog')?.open);
    passed('legacy location=anchor keeps the four-pixel offset and anchor class', 'Without locationStrategy, the historical anchor alias remains connected to its activator with a 4px main-axis offset.');

    await page.locator('#parent-trigger').click();
    await page.waitForFunction(() => document.querySelector('#parent-target-content')?.closest('dialog')?.open);
    const parentContent = await rect('dialog:has(#parent-target-content)');
    const parentBox = await rect('#parent-target');
    closeTo(parentContent.left, parentBox.left, 'parent target left');
    closeTo(parentContent.top, parentBox.bottom, 'parent target bottom placement');
    await callRef('parent', 'close');
    await page.waitForFunction(() => !document.querySelector('#parent-target-content')?.closest('dialog')?.open);
    await page.locator('#cursor-trigger').click({ position: { x: 35, y: 15 } });
    await page.waitForFunction(() => document.querySelector('#cursor-target-content')?.closest('dialog')?.open);
    const cursorContent = await rect('dialog:has(#cursor-target-content)');
    const cursorClick = await page.evaluate(() => window.__overlayGeometry.state.cursorClick);
    closeTo(cursorContent.left, cursorClick[0], 'cursor target point x');
    closeTo(cursorContent.top, cursorClick[1], 'cursor target point y');
    passed('public target aliases parent and cursor resolve live browser anchors', 'External activator selector resolves its parent HTMLElement; slot activator click coordinates resolve the cursor point.');

    await page.locator('#native-trigger').click();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface[aria-label="Native default menu"]')?.matches('[data-state=opening], [data-state=open], [data-state=closing]'));
    const nativeMenu = await rect('.ui-menu-surface[aria-label="Native default menu"]');
    const nativeTrigger = await rect('#native-trigger');
    const nativeMarginTop = await page.locator('.ui-menu-surface[aria-label="Native default menu"]').evaluate(element => getComputedStyle(element).marginTop);
    assert.equal(nativeMarginTop, '0px', 'DOM default Menu uses connected placement rather than a CSS anchor margin');
    assert.equal(await page.locator('.ui-menu-surface[aria-label="Native default menu"]').getAttribute('data-placement'), 'bottom-start');
    closeTo(nativeMenu.top - nativeTrigger.bottom, 5, 'native default Menu gap', 3);
    await page.locator('#native-trigger').click();
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface[aria-label="Native default menu"]')?.matches('[data-state=opening], [data-state=open], [data-state=closing]'));
    passed('default DOM Menu keeps bottom-start placement and five-pixel gap', 'Connected placement preserves the established 5px gap without native popover anchoring.');

    await page.evaluate(() => { window.__overlayGeometry.state.staticMenuOpen = true; });
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface.static-menu-class')?.matches('[data-state=opening], [data-state=open], [data-state=closing]'));
    await settle(80);
    recordStaticProtocol('Menu explicit static locationStrategy uses viewport static positioning for a known bottom-start location', await staticStyle('.ui-menu-surface.static-menu-class'), {
        position: 'fixed', inset: '0px', marginTop: 'auto', marginRight: 'auto', marginBottom: '12px', marginLeft: '12px',
        positionAnchor: 'none', positionArea: 'none', positionTryFallbacks: 'none', rect: { left: 12, bottom: 688 }
    });
    await page.evaluate(() => { window.__overlayGeometry.state.staticMenuOpen = false; });
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface.static-menu-class')?.matches('[data-state=opening], [data-state=open], [data-state=closing]'));

    for (const [stateKey, selector, expectedRect] of [
        ['staticTopOverlayOpen', 'dialog.static-top-overlay-class', { top: 12 }],
        ['staticBottomOverlayOpen', 'dialog.static-bottom-overlay-class', { bottom: 688 }]
    ]) {
        await page.evaluate(key => { window.__overlayGeometry.state[key] = true; }, stateKey);
        await page.waitForFunction(query => document.querySelector(query)?.open, selector);
        await settle(40);
        recordStaticProtocol(`Overlay locationStrategy=static consumes ${stateKey.includes('Top') ? 'top' : 'bottom'} as a viewport edge`, await staticStyle(selector), {
            position: 'fixed', inset: '0px', positionAnchor: 'none', positionArea: 'none', positionTryFallbacks: 'none', rect: expectedRect
        });
        await page.evaluate(key => { window.__overlayGeometry.state[key] = false; }, stateKey);
        await page.waitForFunction(query => !document.querySelector(query)?.open, selector);
    }

    for (const [stateKey, selector, expectedRect] of [
        ['staticTopDialogOpen', 'dialog.static-top-dialog-class', { top: 12 }],
        ['staticBottomDialogOpen', 'dialog.static-bottom-dialog-class', { bottom: 688 }]
    ]) {
        await page.evaluate(key => { window.__overlayGeometry.state[key] = true; }, stateKey);
        await page.waitForFunction(query => document.querySelector(query)?.dataset.state === 'open', selector);
        await settle(40);
        recordStaticProtocol(`Dialog locationStrategy=static consumes ${stateKey.includes('Top') ? 'top' : 'bottom'} as a viewport edge`, await staticStyle(selector), {
            position: 'fixed', inset: '0px', positionAnchor: 'none', positionArea: 'none', positionTryFallbacks: 'none', rect: expectedRect
        });
        await page.evaluate(key => { window.__overlayGeometry.state[key] = false; }, stateKey);
        await page.waitForFunction(query => !document.querySelector(query)?.open, selector);
    }
    if (report.protocolFailures.length === 0) passed('explicit static positioning handles Overlay/Menu/Dialog locations', 'Static mode keeps known Menu placement native when defaulted and applies viewport edge positioning when explicitly requested.');

    await page.evaluate(() => { window.__overlayGeometry.state.centerOverlayOpen = true; });
    await page.waitForFunction(() => document.querySelector('dialog.center-probe-overlay')?.open);
    await settle(100);
    const centerOverlay = await rect('dialog.center-probe-overlay');
    assert.match(await page.locator('dialog.center-probe-overlay').getAttribute('class'), /is-center/);
    closeTo(centerOverlay.left + centerOverlay.width / 2, 450, 'default Overlay center x');
    closeTo(centerOverlay.top + centerOverlay.height / 2, 350, 'default Overlay center y');
    await page.evaluate(() => { window.__overlayGeometry.state.centerOverlayOpen = false; });
    await page.waitForFunction(() => !document.querySelector('dialog.center-probe-overlay')?.open);
    passed('default Overlay remains centered when no location is supplied', 'The default class and native dialog bounds center in the viewport.');

    await page.evaluate(() => { window.__overlayGeometry.state.centerDialogOpen = true; });
    await page.waitForFunction(() => document.querySelector('#center-dialog-content')?.closest('dialog')?.dataset.state === 'open');
    const centerDialog = await rect('dialog:has(#center-dialog-content)');
    assert.doesNotMatch(await page.locator('dialog:has(#center-dialog-content)').getAttribute('class'), /ui-dialog--end/);
    closeTo(centerDialog.left + centerDialog.width / 2, 450, 'default Dialog center x');
    closeTo(centerDialog.top + centerDialog.height / 2, 350, 'default Dialog center y');
    await page.evaluate(() => { window.__overlayGeometry.state.centerDialogOpen = false; });
    await page.waitForFunction(() => !document.querySelector('#center-dialog-content')?.closest('dialog')?.open);
    await page.evaluate(() => { window.__overlayGeometry.state.endDialogOpen = true; });
    await page.waitForFunction(() => document.querySelector('#end-dialog-content')?.closest('dialog')?.dataset.state === 'open');
    const endDialog = await rect('dialog:has(#end-dialog-content)');
    assert.match(await page.locator('dialog:has(#end-dialog-content)').getAttribute('class'), /ui-dialog--end/);
    closeTo(endDialog.right, 900, 'Dialog end placement right edge');
    closeTo(endDialog.height, 700, 'Dialog end placement full-height');
    passed('Dialog center and end placements remain available', 'The default center dialog remains viewport centered; placement=end remains a full-height end-aligned drawer.');

    await page.evaluate(() => {
        document.documentElement.style.zoom = '1.25';
        const state = window.__overlayGeometry.state;
        state.endDialogOpen = false;
        state.overlayTarget = '#target-a'; state.overlayLocation = 'bottom-start'; state.overlayOpen = true;
        state.menuTarget = document.querySelector('#target-a'); state.menuLocation = 'bottom-start'; state.menuOpen = true;
    });
    await settle(120);
    await callRef('overlay', 'updateLocation');
    await callRef('menu', 'updateLocation');
    const zoomTarget = await rect('#target-a');
    const zoomOverlay = await rect('dialog.ui-overlay.geometry-overlay-class');
    const zoomMenu = await rect('.ui-menu-surface.geometry-menu-class');
    closeTo(zoomOverlay.left, zoomTarget.left + 4 * 1.25, '125% Overlay anchor left');
    closeTo(zoomOverlay.top, zoomTarget.bottom + 6 * 1.25, '125% Overlay anchor top');
    closeTo(zoomMenu.left, zoomTarget.left + 3 * 1.25, '125% Menu anchor left');
    closeTo(zoomMenu.top, zoomTarget.bottom + 5 * 1.25, '125% Menu anchor top');
    passed('connected placement respects CSS zoom', 'Target client geometry is converted into the content coordinate space at 125% zoom.');
    await page.setViewportSize({ width: 390, height: 700 });
    await page.evaluate(() => { Object.assign(window.__overlayGeometry.state, { overlayOpen: false, menuOpen: false, endDialogOpen: true }); });
    await settle(120);
    const zoomDrawer = await rect('dialog:has(#end-dialog-content)');
    assert.ok(zoomDrawer.left >= -1 && zoomDrawer.right <= 391, 'Zoomed narrow drawer fits horizontal viewport.');
    closeTo(zoomDrawer.height, 700, '125% drawer full height');
    passed('end Dialog stays inside a narrow zoomed viewport', 'Default drawer width and full height remain bounded at 390px/125%.');
    await page.evaluate(() => { Object.assign(window.__overlayGeometry.state, { endDialogOpen: false, fullscreen: true, centerDialogOpen: true }); });
    await settle(120);
    const fullDialog = await rect('dialog:has(#center-dialog-content)');
    closeTo(fullDialog.left, 0, '125% fullscreen Dialog left');
    closeTo(fullDialog.top, 0, '125% fullscreen Dialog top');
    closeTo(fullDialog.width, 390, '125% fullscreen Dialog width');
    closeTo(fullDialog.height, 700, '125% fullscreen Dialog height');
    await page.evaluate(() => { Object.assign(window.__overlayGeometry.state, { centerDialogOpen: false, centerOverlayOpen: true }); });
    await settle(120);
    const fullOverlay = await rect('dialog.center-probe-overlay');
    closeTo(fullOverlay.left, 0, '125% fullscreen Overlay left');
    closeTo(fullOverlay.top, 0, '125% fullscreen Overlay top');
    closeTo(fullOverlay.width, 390, '125% fullscreen Overlay width');
    closeTo(fullOverlay.height, 700, '125% fullscreen Overlay height');
    passed('fullscreen overrides explicit dimensions at CSS zoom', 'Fullscreen Overlay and Dialog fill the visual viewport at 390px/125%.');

    assert.deepEqual(pageErrors, [], 'no page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser errors occurred');
    assert.deepEqual(consoleWarnings, [], 'no Vue/runtime warnings occurred');
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    if (page) {
        try {
            report.failureState = await page.evaluate(() => ({
                viewport: { width: innerWidth, height: innerHeight },
                scrollTop: document.querySelector('#scroll-box')?.scrollTop,
                targets: ['#scroll-target', '#target-b'].map(selector => {
                    const element = document.querySelector(selector);
                    const bounds = element?.getBoundingClientRect();
                    return { selector, bounds: bounds && { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom }, html: element?.outerHTML };
                }),
                surfaces: Array.from(document.querySelectorAll('dialog.ui-overlay, .ui-menu-surface, dialog.ui-dialog')).map(element => {
                    const bounds = element.getBoundingClientRect();
                    return { className: element.className, state: element.getAttribute('data-state'), open: element.open, popover: element.matches('[data-state=opening], [data-state=open], [data-state=closing]'), style: element.getAttribute('style'), bounds: { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom } };
                }),
                bodyOverflow: document.body.style.overflow
            }));
        } catch (stateError) {
            report.failureStateError = stateError instanceof Error ? stateError.message : String(stateError);
        }
    }
} finally {
    report.pageErrors = pageErrors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    try {
        report.sourceSha256After = await hashSources();
        report.sourceChangedDuringRun = JSON.stringify(report.sourceSha256After) !== JSON.stringify(sourceSha256);
    } catch (error) {
        report.sourceHashFailure = error instanceof Error ? error.message : String(error);
    }
    if (browser) await browser.close();
    await server.close();
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
}

console.log(`Evidence: ${path.join(evidence, 'report.json')}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else if (report.sourceChangedDuringRun) {
    console.error('A source file changed during the geometry run.');
    process.exitCode = 1;
} else if (report.protocolFailures.length) {
    console.error(`${report.protocolFailures.length} static positioning protocol(s) failed: ${JSON.stringify(report.protocolFailures)}`);
    process.exitCode = 1;
} else {
    console.log(`PASS ${report.checks.length} overlay geometry protocol groups.`);
}
