import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/navigation-final-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/USlideGroup.vue',
    'src/ui/UExpansionPanels.vue',
    'src/ui/UCarousel.vue',
    'src/ui/UWindow.vue',
    'src/ui/group-state.ts',
    'src/ui/slide-group.ts',
    'src/ui/window-state.ts',
    'tests/desktop/navigation-final-protocols.mjs',
    'tests/tsconfig.navigation-final.json'
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
        <title>Navigation final protocols</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/full-alignment/navigation-final-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import NavigationFinalFixture from './NavigationFinalFixture.vue';
import '/src/ui/styles.css';

createApp(NavigationFinalFixture).use(createUI()).mount('#app');
`;

const fixtureVue = `<script setup>
import { reactive, ref } from 'vue';
import {
    UCarousel, UCarouselItem,
    UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels,
    USlideGroup, USlideGroupItem,
    UWindow, UWindowItem
} from '/src/ui/index.ts';

const state = reactive({
    slideValue: null,
    slideFirstDisabled: true,
    slideSecondDisabled: false,
    slideThirdDisabled: false,
    expValue: null,
    expFirstDisabled: true,
    carouselValue: null,
    carouselFirstDisabled: true,
    carouselHideDelimiters: false,
    carouselUpdates: 0,
    customPrevClicks: 0,
    customNextClicks: 0,
    windowValue: null,
    windowFirstDisabled: true,
    windowTouchValue: 'touch-a',
    windowTouchCalls: 0,
    timerValue: null,
    showTimer: true,
    timerArmed: false,
    timerNextDisabled: false
});
const refs = { slide: ref(), expansion: ref(), carousel: ref(), window: ref(), defaultWindow: ref(), timer: ref() };
const customTouch = { onLeft: () => { state.windowTouchCalls++; } };
window.__navigationFinalProbe = { state, refs };
</script>

<template>
    <main>
        <section id="slide-fixture">
            <output id="slide-model">{{ state.slideValue ?? 'null' }}</output>
            <USlideGroup :ref="refs.slide" v-model="state.slideValue" mandatory="force" :show-arrows="false" style="width: 190px">
                <USlideGroupItem value="slide-first" :disabled="state.slideFirstDisabled">
                    <template #default="scope"><button id="slide-first" class="slide-target" :class="scope.selectedClass" :disabled="state.slideFirstDisabled" style="width: 160px">First</button></template>
                </USlideGroupItem>
                <USlideGroupItem value="slide-second" :disabled="state.slideSecondDisabled">
                    <template #default="scope"><div class="slide-target" :class="scope.selectedClass" style="width: 160px"><button id="slide-second">Second</button><div id="slide-editable" contenteditable="true">Edit here</div></div></template>
                </USlideGroupItem>
                <USlideGroupItem value="slide-third" :disabled="state.slideThirdDisabled">
                    <template #default="scope"><button id="slide-third" class="slide-target" :class="scope.selectedClass" style="width: 160px">Third</button></template>
                </USlideGroupItem>
            </USlideGroup>
            <input id="slide-input" aria-label="Slide text input">
        </section>

        <section id="expansion-fixture">
            <output id="expansion-model">{{ state.expValue ?? 'null' }}</output>
            <UExpansionPanels :ref="refs.expansion" v-model="state.expValue" mandatory="force">
                <template #default="scope">
                    <output id="expansion-scope-selected">{{ scope.selected.value ?? 'null' }}</output>
                    <button id="expansion-next" type="button" @click="scope.next">Next panel</button>
                    <button id="expansion-prev" type="button" @click="scope.prev">Previous panel</button>
                    <button id="expansion-select-disabled" type="button" @click="scope.select('exp-first')">Select disabled</button>
                    <UExpansionPanel value="exp-first" :disabled="state.expFirstDisabled"><UExpansionPanelTitle>First panel</UExpansionPanelTitle><UExpansionPanelText>First content</UExpansionPanelText></UExpansionPanel>
                    <UExpansionPanel value="exp-second"><UExpansionPanelTitle>Second panel</UExpansionPanelTitle><UExpansionPanelText>Second content</UExpansionPanelText></UExpansionPanel>
                    <UExpansionPanel value="exp-third"><UExpansionPanelTitle>Third panel</UExpansionPanelTitle><UExpansionPanelText>Third content</UExpansionPanelText></UExpansionPanel>
                </template>
            </UExpansionPanels>
            <UExpansionPanels id="expansion-defaults">
                <UExpansionPanel value="loose-panel"><UExpansionPanelTitle>Loose panel</UExpansionPanelTitle></UExpansionPanel>
            </UExpansionPanels>
        </section>

        <section id="window-fixture">
            <output id="window-model">{{ state.windowValue ?? 'null' }}</output>
            <UWindow :ref="refs.window" v-model="state.windowValue" :continuous="false" show-arrows tag="section" :height="240" direction="vertical" reverse aria-label="Vertical window">
                <template #default="scope">
                    <output id="window-scope-selected">{{ scope.group.selected.value ?? 'null' }}</output>
                    <input id="window-input" aria-label="Window text input">
                    <UWindowItem value="window-first" :disabled="state.windowFirstDisabled"><button id="window-first">First window</button></UWindowItem>
                    <UWindowItem value="window-second"><button id="window-second">Second window</button></UWindowItem>
                    <UWindowItem value="window-third"><button id="window-third">Third window</button></UWindowItem>
                </template>
                <template #prev="{ props }"><button id="window-prev" v-bind="props" @click="">Previous</button></template>
                <template #next="{ props }"><button id="window-next" v-bind="props" @click="">Next</button></template>
            </UWindow>
            <output id="window-default-arrows">{{ refs.defaultWindow ? 'mounted' : 'pending' }}</output>
            <UWindow :ref="refs.defaultWindow"><UWindowItem value="default-a">A</UWindowItem><UWindowItem value="default-b">B</UWindowItem></UWindow>
        </section>

        <section id="touch-window-fixture">
            <output id="window-touch-model">{{ state.windowTouchValue }}</output>
            <UWindow v-model="state.windowTouchValue" :touch="customTouch" continuous>
                <UWindowItem value="touch-a">Touch A</UWindowItem>
                <UWindowItem value="touch-b">Touch B</UWindowItem>
            </UWindow>
        </section>

        <section id="carousel-fixture">
            <output id="carousel-model">{{ state.carouselValue ?? 'null' }}</output>
            <output id="carousel-updates">{{ state.carouselUpdates }}</output>
            <UCarousel :ref="refs.carousel" v-model="state.carouselValue" :cycle="false" :continuous="false" interval="1200" :hide-delimiters="state.carouselHideDelimiters" :hide-delimiter-background="true" delimiter-icon="mdi-star" vertical-delimiters="left" :height="220" label="Protocol carousel" @update:model-value="state.carouselUpdates++">
                <template #default="scope">
                    <output id="carousel-scope-model">{{ scope.modelValue ?? 'null' }}</output>
                    <UCarouselItem value="carousel-first" :disabled="state.carouselFirstDisabled"><button id="carousel-first">First carousel item</button></UCarouselItem>
                    <UCarouselItem value="carousel-second"><button id="carousel-second">Second carousel item</button></UCarouselItem>
                    <UCarouselItem value="carousel-third"><button id="carousel-third">Third carousel item</button></UCarouselItem>
                </template>
                <template #prev="{ props }"><button id="carousel-prev" v-bind="props" @click="state.customPrevClicks++">Previous custom</button></template>
                <template #next="{ props }"><button id="carousel-next" v-bind="props" @click="state.customNextClicks++">Next custom</button></template>
                <template #item="{ item, index, props }"><button v-bind="props" :data-delimiter-index="index" :data-item-value="item.value" :data-item-disabled="item.disabled">Dot {{ index + 1 }}</button></template>
            </UCarousel>
        </section>

        <section id="timer-fixture">
            <output id="timer-model">{{ state.timerValue ?? 'null' }}</output>
            <button id="timer-outside" type="button">Outside timer carousel</button>
            <UCarousel v-if="state.showTimer && state.timerArmed" :ref="refs.timer" v-model="state.timerValue" interval="1000" :disabled="state.timerNextDisabled" label="Timer carousel">
                <UCarouselItem value="timer-a">Timer A</UCarouselItem>
                <UCarouselItem value="timer-b">Timer B</UCarouselItem>
            </UCarousel>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'NavigationFinalFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__navigation-final-protocols';
const fixturePlugin = {
    name: 'navigation-final-protocols-fixture',
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
        entries: ['artifacts/full-alignment/navigation-final-protocols/fixture/main.ts'],
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
    fixture: 'navigation-final-protocols',
    method: 'Vite fixture imports canonical USlideGroup, UExpansionPanels, UCarousel and UWindow through src/ui/index.ts and exercises their live SFCs in Chromium.',
    sourceSha256,
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    limits: [
        'Chromium browser renderer only; no Electron renderer acceptance is claimed.',
        'No full project build, full test suite, or visual design acceptance was run.',
        'The fixture validates local source through the public entry; it does not validate the compiled package bundle.'
    ]
};
const errors = [];
const consoleErrors = [];
const consoleWarnings = [];
const httpErrors = [];
const requestFailures = [];
let browser;

function passed(name, details) { report.checks.push({ name, details }); }
async function settle(page, delay = 60) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (delay) await page.waitForTimeout(delay);
}
async function text(page, selector) { return (await page.locator(selector).textContent())?.trim(); }
async function callRef(page, name, method, ...args) {
    await page.evaluate(([refName, key, values]) => window.__navigationFinalProbe.refs[refName].value[key](...values), [name, method, args]);
    await settle(page);
}
function touchEventScript() {
    return ({ selector, startX = 120, endX = 30 }) => {
        const element = document.querySelector(selector);
        const touchStart = new Touch({ identifier: 71, target: element, clientX: startX, clientY: 40 });
        const touchEnd = new Touch({ identifier: 71, target: element, clientX: endX, clientY: 40 });
        element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touchStart], changedTouches: [touchStart] }));
        element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [touchEnd] }));
    };
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, 'fixture document is served');
    browser = await chromium.launch({ headless: true });
    report.backend = 'playwright-chromium';
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    page.on('pageerror', error => errors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    page.on('response', item => { if (item.status() >= 400) httpErrors.push({ status: item.status(), url: item.url() }); });
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('#slide-model').waitFor();
    await settle(page, 150);

    assert.equal(await text(page, '#slide-model'), 'slide-second', 'mandatory force selects the first enabled SlideGroup item');
    await callRef(page, 'slide', 'focus');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'slide-second', 'public focus(first) skips the currently disabled first item and focuses a real descendant');
    await callRef(page, 'slide', 'focus', 'next');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'slide-third', 'public focus(next) advances from the currently focused item');
    await page.locator('#slide-third').press('ArrowRight');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'slide-second', 'keyboard navigation calls the same enabled-item focus path and wraps');
    await callRef(page, 'slide', 'focus', 'last');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'slide-third', 'public focus(last) selects the final enabled descendant');
    await callRef(page, 'slide', 'focus', 'prev');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'slide-second', 'public focus(prev) uses the currently focused item');
    await page.waitForTimeout(250);
    assert.ok(await page.locator('.u-slide-group-viewport').evaluate(element => element.scrollLeft > 0), 'focus scrolls the selected descendant into the viewport');
    await page.evaluate(() => { window.__navigationFinalProbe.state.slideSecondDisabled = true; });
    await settle(page);
    await callRef(page, 'slide', 'focus', 'first');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'slide-third', 'focus reads current item disabled props');
    await page.locator('#slide-editable').focus();
    const editablePrevented = await page.locator('#slide-editable').evaluate(element => { const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }); element.dispatchEvent(event); return event.defaultPrevented; });
    assert.equal(editablePrevented, false, 'contenteditable retains its arrow keys');
    await page.locator('#slide-input').focus();
    const inputPrevented = await page.locator('#slide-input').evaluate(element => { const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }); element.dispatchEvent(event); return event.defaultPrevented; });
    assert.equal(inputPrevented, false, 'form controls retain their arrow keys');
    await page.evaluate(() => {
        const probe = window.__navigationFinalProbe;
        probe.state.slideFirstDisabled = true;
        probe.state.slideSecondDisabled = true;
        probe.state.slideThirdDisabled = true;
        probe.state.slideValue = null;
    });
    await settle(page);
    assert.equal(await text(page, '#slide-model'), 'null', 'mandatory force preserves an empty model while every item is disabled');
    await page.evaluate(() => { window.__navigationFinalProbe.state.slideThirdDisabled = false; });
    await settle(page);
    assert.equal(await text(page, '#slide-model'), 'slide-third', 'mandatory force reacts when an item becomes enabled');
    passed('USlideGroup public focus and keyboard', 'focus(first/next/last/prev) and arrows use enabled registrations, focus an actual descendant, skip reactive disabled entries, scroll the focused item, and leave editable controls alone.');

    assert.equal(await text(page, '#expansion-model'), 'exp-second', 'mandatory force selects an enabled panel on registration');
    assert.equal(await text(page, '#expansion-scope-selected'), 'exp-second', 'default slot receives the selected model ref');
    await page.locator('#expansion-next').click();
    await settle(page);
    assert.equal(await text(page, '#expansion-model'), 'exp-third', 'default slot next advances the group');
    await page.locator('#expansion-prev').click();
    await settle(page);
    assert.equal(await text(page, '#expansion-model'), 'exp-second', 'default slot prev moves backward');
    await page.locator('#expansion-select-disabled').click();
    await settle(page);
    assert.equal(await text(page, '#expansion-model'), 'exp-second', 'select slot method respects the live disabled item');
    await page.evaluate(() => window.__navigationFinalProbe.refs.expansion.value.select('exp-third'));
    await settle(page);
    assert.equal(await text(page, '#expansion-model'), 'exp-third', 'public ref exposes select alongside next/prev/selected');
    assert.equal(await page.locator('#expansion-defaults .u-expansion-panel.is-open').count(), 0, 'unspecified mandatory default remains non-mandatory');
    passed('UExpansionPanels force and group slot', 'mandatory="force" is accepted; default slot receives next/prev/select/selected/group, the public ref exposes the same group operations, and unspecified mandatory behavior is unchanged.');

    assert.equal(await text(page, '#window-model'), 'window-second', 'Window mandatory initialization skips the disabled first item');
    assert.equal(await page.locator('#window-prev').getAttribute('aria-label'), '上一项', 'prev slot receives standard control props');
    assert.equal(await page.locator('#window-prev').isDisabled(), true, 'non-continuous window disables prev at the first enabled item');
    assert.equal(await page.locator('#window').count(), 0, 'no stale selector');
    assert.equal(await page.locator('#window-fixture section.u-window').getAttribute('data-direction'), 'vertical', 'direction is consumed on the dynamic tag');
    assert.equal(await page.locator('#window-fixture section.u-window').getAttribute('data-reverse'), 'true', 'reverse is consumed on the dynamic tag');
    const windowDimensions = await page.locator('#window-fixture section.u-window').evaluate(element => ({ style: element.getAttribute('style'), height: getComputedStyle(element).height, tag: element.tagName }));
    assert.equal(windowDimensions.height, '240px', `explicit height reaches the window root (${JSON.stringify(windowDimensions)})`);
    await page.locator('#window-next').click();
    await settle(page);
    assert.equal(await text(page, '#window-model'), 'window-third', 'custom next slot invokes the live movement guard');
    assert.equal(await page.locator('#window-next').isDisabled(), true, 'non-continuous window disables next at the end');
    const beforeInputKey = await text(page, '#window-model');
    await page.locator('#window-input').focus();
    const windowInputPrevented = await page.locator('#window-input').evaluate(element => { const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }); element.dispatchEvent(event); return event.defaultPrevented; });
    assert.equal(windowInputPrevented, false, 'Window does not hijack text field arrows');
    assert.equal(await text(page, '#window-model'), beforeInputKey, 'text-field arrow does not move the Window');
    await page.locator('#window-third').press('ArrowUp');
    await settle(page);
    assert.equal(await text(page, '#window-model'), 'window-second', 'vertical keyboard navigation uses the same current enabled guard');
    await page.evaluate(() => { window.__navigationFinalProbe.state.windowFirstDisabled = false; });
    await settle(page);
    await callRef(page, 'window', 'prev');
    assert.equal(await text(page, '#window-model'), 'window-first', 'public prev sees an item that became enabled');
    await callRef(page, 'window', 'prev');
    assert.equal(await text(page, '#window-model'), 'window-first', 'non-continuous public prev does not wrap');
    assert.equal(await page.locator('#window-default-arrows + .u-window .u-window-controls').count(), 0, 'Window keeps its local hidden-arrows default');
    await page.evaluate(touchEventScript(), { selector: '#touch-window-fixture .u-window' });
    await settle(page);
    assert.equal(await text(page, '#window-touch-model'), 'touch-a', 'custom touch onLeft callback overrides Window movement');
    assert.equal(await page.evaluate(() => window.__navigationFinalProbe.state.windowTouchCalls), 1, 'touch onLeft alias receives one gesture');
    passed('UWindow slots, boundaries and touch', 'Control slots expose props and disabled state; explicit tag/height/direction/reverse are consumed; keyboard/ref/touch respect live registrations; default arrows remain hidden.');

    assert.equal(await text(page, '#carousel-model'), 'carousel-second', 'Carousel mandatory initialization skips its disabled first item');
    assert.equal(await page.locator('#carousel-prev').getAttribute('aria-label'), '上一项', 'Carousel prev slot receives standard control props');
    assert.equal(await page.locator('#carousel-prev').isDisabled(), true, 'non-continuous Carousel disables prev at its first enabled item');
    assert.equal(await page.locator('[data-delimiter-index="0"]').getAttribute('data-item-value'), 'carousel-first', 'delimiter item slot receives the registered item and index');
    assert.equal(await page.locator('[data-delimiter-index="0"]').getAttribute('data-item-disabled'), 'true', 'delimiter slot item reflects its live disabled flag');
    const carouselHeight = await page.locator('#carousel-fixture .u-carousel').evaluate(element => getComputedStyle(element).height);
    assert.equal(carouselHeight, '220px', 'explicit Carousel height reaches the root');
    assert.equal(await page.locator('#carousel-fixture .u-carousel').getAttribute('data-vertical-delimiters'), 'left', 'verticalDelimiters is consumed as a root attribute');
    assert.equal(await page.locator('#carousel-fixture .u-carousel').getAttribute('class')?.then(value => value?.includes('hide-delimiter-background')), true, 'hideDelimiterBackground is consumed as a root class');
    const updateBaseline = Number(await text(page, '#carousel-updates'));
    await page.locator('#carousel-next').click();
    await settle(page);
    assert.equal(await text(page, '#carousel-model'), 'carousel-third', 'custom next control advances exactly one enabled item');
    assert.equal(await page.evaluate(() => window.__navigationFinalProbe.state.customNextClicks), 1, 'custom next slot click handler runs once without a duplicate fallback');
    assert.equal(Number(await text(page, '#carousel-updates')), updateBaseline + 1, 'custom next slot emits one model update');
    assert.equal(await page.locator('#carousel-next').isDisabled(), true, 'continuous=false disables next at the final enabled item');
    await page.locator('#carousel-prev').click();
    await settle(page);
    assert.equal(await text(page, '#carousel-model'), 'carousel-second', 'custom prev slot invokes the same enabled movement logic');
    await page.locator('[data-delimiter-index="1"]').click();
    await settle(page);
    assert.equal(await text(page, '#carousel-model'), 'carousel-second', 'custom delimiter uses its provided props without fallback double dispatch');
    await page.evaluate(() => { window.__navigationFinalProbe.state.carouselFirstDisabled = false; });
    await settle(page);
    await page.locator('#carousel-prev').click();
    await settle(page);
    assert.equal(await text(page, '#carousel-model'), 'carousel-first', 'Carousel navigation reads item disabled changes without re-registering stale state');
    await page.locator('#carousel-first').press('ArrowRight');
    await settle(page);
    assert.equal(await text(page, '#carousel-model'), 'carousel-second', 'Carousel keyboard navigation shares the enabled-item movement guard');
    await page.evaluate(touchEventScript(), { selector: '#carousel-fixture .u-carousel' });
    await settle(page);
    assert.equal(await text(page, '#carousel-model'), 'carousel-third', 'default touch navigation shares the enabled-item movement guard');
    await page.evaluate(() => { window.__navigationFinalProbe.state.carouselHideDelimiters = true; });
    await settle(page);
    assert.equal(await page.locator('#carousel-fixture .u-carousel-controls').count(), 0, 'hideDelimiters removes the controls');
    passed('UCarousel slots, protocol props and enabled movement', 'Custom prev/next and item slots receive standard props, disabled items and no wrapper double-fire; interval string, hide/delimiter/vertical/height props and continuous=false are consumed.');

    await page.evaluate(() => { window.__navigationFinalProbe.state.timerArmed = true; });
    await settle(page);
    assert.equal(await text(page, '#timer-model'), 'timer-a', 'timer Carousel initializes its controlled model');
    await page.locator('#timer-fixture .u-carousel').hover();
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), 'timer-a', 'hover pauses and clears the autoplay timer');
    await page.locator('#timer-outside').hover();
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), 'timer-b', 'string interval restarts autoplay after hover leaves');
    await page.waitForTimeout(550);
    assert.equal(await text(page, '#timer-model'), 'timer-b', 'a model change restarts a one-shot timer instead of retaining the old deadline');
    await page.waitForTimeout(600);
    assert.equal(await text(page, '#timer-model'), 'timer-a', 'the restarted timer advances after one full interval');
    await page.evaluate(() => { window.__navigationFinalProbe.state.timerNextDisabled = true; });
    await settle(page);
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), 'timer-a', 'disabled clears and blocks autoplay');
    await page.evaluate(() => { window.__navigationFinalProbe.state.timerNextDisabled = false; });
    await settle(page);
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), 'timer-b', 'autoplay resumes when disabled clears');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await settle(page);
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), 'timer-b', 'reduced-motion clears and blocks autoplay');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'false'; });
    await settle(page);
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), 'timer-a', 'autoplay resumes when reduced-motion is removed');
    await page.evaluate(() => { window.__navigationFinalProbe.state.showTimer = false; });
    await settle(page);
    const unmountedTimerModel = await text(page, '#timer-model');
    await page.waitForTimeout(1150);
    assert.equal(await text(page, '#timer-model'), unmountedTimerModel, 'unmount clears the active autoplay timeout');
    passed('UCarousel timer lifecycle', 'Default cycling and string intervals pause on hover, disabled and reduced-motion states; model changes restart the deadline, state restoration resumes, and unmount clears the timeout.');

    assert.deepEqual(errors, [], 'no Vue or page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser console errors occurred');
    assert.deepEqual(consoleWarnings, [], 'no Vue or browser warnings occurred');
    assert.deepEqual(httpErrors, [], 'all fixture responses succeeded');
    assert.deepEqual(requestFailures, [], 'no fixture requests failed');
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    errors.push(report.failure);
} finally {
    report.pageErrors = errors;
    report.consoleErrors = consoleErrors;
    report.consoleWarnings = consoleWarnings;
    report.httpErrors = httpErrors;
    report.requestFailures = requestFailures;
    try {
        report.sourceSha256After = await hashSources();
        report.sourceChangedDuringRun = JSON.stringify(report.sourceSha256After) !== JSON.stringify(sourceSha256);
    } catch (error) {
        report.sourceHashFailure = error instanceof Error ? error.message : String(error);
    }
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
    if (browser) await browser.close();
    await server.close();
}

console.log(`Evidence: ${path.join(evidence, 'report.json')}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else {
    console.log(`PASS ${report.checks.length} navigation final protocol groups on ${report.backend}`);
}
