import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/window-lifecycle-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UWindow.vue',
    'src/ui/UWindowItem.vue',
    'src/ui/UCarousel.vue',
    'src/ui/UCarouselItem.vue',
    'src/ui/window-state.ts',
    'src/ui/group-state.ts',
    'src/ui/motion.ts',
    'src/ui/UTransition.vue',
    'src/ui/styles.css',
    'src/ui/layout-components.css'
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
        <title>Window lifecycle protocols</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/full-alignment/window-lifecycle-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import WindowLifecycleFixture from './WindowLifecycleFixture.vue';
import '/src/ui/styles.css';

createApp(WindowLifecycleFixture).use(createUI()).mount('#app');
`;

const fixture = `<script setup>
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { UCarousel, UCarouselItem, UWindow, UWindowItem } from '/src/ui/index.ts';

const state = reactive({
    windowValue: 'wa', windowEager: true, eagerWindowValue: 'ewa',
    carouselValue: 'ca', carouselEager: true, eagerCarouselValue: 'eca',
    verticalValue: 'v0', rightValue: 'r0', looseValue: null, forceValue: null, timerValue: 't0', timerUpdates: 0,
    windowItemEvents: []
});
const refs = { window: ref(), eagerWindow: ref(), carousel: ref(), eagerCarousel: ref(), vertical: ref(), right: ref(), timer: ref() };
const counts = reactive({ mounted: {}, unmounted: {} });
function count(bucket, name) { bucket[name] = (bucket[name] ?? 0) + 1; }
const Probe = defineComponent({
    name: 'LifecycleProbe',
    props: { name: { type: String, required: true } },
    setup(props) {
        onMounted(() => count(counts.mounted, props.name));
        onBeforeUnmount(() => count(counts.unmounted, props.name));
        return () => h('span', { class: 'lifecycle-probe', id: 'probe-' + props.name }, props.name);
    }
});
function selected(item, event) { state.windowItemEvents.push({ item, value: event.value }); }
async function rapidWindowChange() { state.windowValue = 'wc'; await nextTick(); state.windowValue = 'wb'; }
async function rapidCarouselChange() { state.carouselValue = 'cc'; await nextTick(); state.carouselValue = 'cb'; }
window.__windowLifecycle = { state, refs, counts, rapidWindowChange, rapidCarouselChange };
</script>

<template>
    <main>
        <output id="window-model">{{ state.windowValue }}</output>
        <UWindow :ref="refs.window" v-model="state.windowValue" :continuous="true" :mandatory="false">
            <template #default>
                <UWindowItem value="wa" @group:selected="selected('wa', $event)"><Probe name="wa" /></UWindowItem>
                <UWindowItem value="wb" @group:selected="selected('wb', $event)"><Probe name="wb" /></UWindowItem>
                <UWindowItem value="wc" @group:selected="selected('wc', $event)"><Probe name="wc" /></UWindowItem>
            </template>
        </UWindow>

        <UWindow :ref="refs.eagerWindow" v-model="state.eagerWindowValue" :eager="state.windowEager" :mandatory="false">
            <template #default>
                <UWindowItem value="ewa"><Probe name="ewa" /></UWindowItem>
                <UWindowItem value="ewb"><Probe name="ewb" /></UWindowItem>
                <UWindowItem value="ewc" :eager="false"><Probe name="ewc" /></UWindowItem>
            </template>
        </UWindow>

        <output id="carousel-model">{{ state.carouselValue }}</output>
        <UCarousel :ref="refs.carousel" v-model="state.carouselValue" :cycle="false" :continuous="true" :mandatory="false" :eager="false" interval="5000">
            <template #default>
                <UCarouselItem value="ca"><Probe name="ca" /></UCarouselItem>
                <UCarouselItem value="cb"><Probe name="cb" /></UCarouselItem>
                <UCarouselItem value="cc"><Probe name="cc" /></UCarouselItem>
            </template>
        </UCarousel>

        <UCarousel :ref="refs.eagerCarousel" v-model="state.eagerCarouselValue" :cycle="false" :mandatory="false" :eager="state.carouselEager" interval="5000">
            <template #default>
                <UCarouselItem value="eca"><Probe name="eca" /></UCarouselItem>
                <UCarouselItem value="ecb"><Probe name="ecb" /></UCarouselItem>
                <UCarouselItem value="ecc" :eager="false"><Probe name="ecc" /></UCarouselItem>
            </template>
        </UCarousel>

        <output id="vertical-model">{{ state.verticalValue }}</output>
        <UCarousel
            id="vertical-carousel"
            :ref="refs.vertical"
            v-model="state.verticalValue"
            tag="article"
            direction="vertical"
            vertical-delimiters="left"
            show-arrows
            :cycle="false"
            :continuous="false"
            :mandatory="false"
            height="auto"
            tabindex="0"
            aria-label="Vertical protocol carousel">
            <template #default>
                <UCarouselItem value="v0"><button id="vertical-item-0" type="button">Vertical zero</button></UCarouselItem>
                <UCarouselItem value="v1"><button id="vertical-item-1" type="button">Vertical one</button></UCarouselItem>
                <UCarouselItem value="v2"><button id="vertical-item-2" type="button">Vertical two</button></UCarouselItem>
            </template>
        </UCarousel>

        <output id="right-model">{{ state.rightValue }}</output>
        <UCarousel
            id="right-carousel"
            :ref="refs.right"
            v-model="state.rightValue"
            direction="vertical"
            vertical-delimiters="right"
            show-arrows
            :cycle="false"
            :continuous="false"
            :mandatory="false"
            height="auto">
            <template #default>
                <UCarouselItem value="r0"><span>Right zero</span></UCarouselItem>
                <UCarouselItem value="r1"><span>Right one</span></UCarouselItem>
            </template>
        </UCarousel>

        <output id="loose-model">{{ state.looseValue ?? 'null' }}</output>
        <UCarousel id="loose-carousel" v-model="state.looseValue" :cycle="false" :mandatory="false">
            <UCarouselItem value="loose-a">Loose A</UCarouselItem>
            <UCarouselItem value="loose-b">Loose B</UCarouselItem>
        </UCarousel>

        <output id="force-model">{{ state.forceValue ?? 'null' }}</output>
        <UCarousel id="force-carousel" v-model="state.forceValue" :cycle="false" mandatory="force">
            <UCarouselItem value="force-disabled" disabled>Disabled force candidate</UCarouselItem>
            <UCarouselItem value="force-enabled">Enabled force candidate</UCarouselItem>
        </UCarousel>

        <output id="timer-model">{{ state.timerValue }}</output>
        <UCarousel
            id="timer-carousel"
            :ref="refs.timer"
            v-model="state.timerValue"
            interval="70"
            :style="{ position: 'fixed', left: '-500px', top: '0' }"
            @update:model-value="state.timerUpdates++"
            aria-label="Short interval timer carousel">
            <UCarouselItem value="t0">Timer zero</UCarouselItem>
            <UCarouselItem value="t1">Timer one</UCarouselItem>
        </UCarousel>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'WindowLifecycleFixture.vue'), fixture, 'utf8');

const virtualRoute = '/__window-lifecycle-protocols';
const fixturePlugin = {
    name: 'window-lifecycle-protocols-fixture',
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
        entries: ['artifacts/full-alignment/window-lifecycle-protocols/fixture/main.ts'],
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
    fixture: 'window-lifecycle-protocols',
    method: 'A Chromium fixture imports UWindow/UWindowItem/UCarousel/UCarouselItem through the public index and checks slot mount cleanup, group events, navigation, touch and autoplay behavior.',
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
async function settle(delay = 60) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (delay) await page.waitForTimeout(delay);
}
async function count(bucket, name) {
    return page.evaluate(([key, item]) => window.__windowLifecycle.counts[key][item] ?? 0, [bucket, name]);
}
async function modelValue(name) {
    return page.evaluate(key => window.__windowLifecycle.state[key], name);
}
async function setState(name, value) {
    await page.evaluate(([key, next]) => { window.__windowLifecycle.state[key] = next; }, [name, value]);
    await settle(40);
}
async function callRef(name, method) {
    await page.evaluate(([refName, key]) => window.__windowLifecycle.refs[refName].value[key](), [name, method]);
    await settle(40);
}
function dispatchTouch({ selector, startX, startY, endX, endY }) {
    const element = document.querySelector(selector);
    const start = new Touch({ identifier: 19, target: element, clientX: startX, clientY: startY });
    const end = new Touch({ identifier: 19, target: element, clientX: endX, clientY: endY });
    element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [start], changedTouches: [start] }));
    element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], changedTouches: [end] }));
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, 'fixture document is served');
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 1000, height: 900 }, reducedMotion: 'no-preference' });
    page.on('pageerror', error => pageErrors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#probe-wa') && document.querySelector('#probe-ca') && document.querySelector('#probe-ewa') && document.querySelector('#probe-ewb'));
    await page.waitForFunction(() => window.__windowLifecycle.state.forceValue === 'force-enabled');
    await page.waitForFunction(() => window.__windowLifecycle.state.timerUpdates > 0, null, { timeout: 1500 });

    assert.equal(await count('mounted', 'wa'), 1, 'selected Window slot mounts');
    assert.equal(await count('mounted', 'wb'), 0, 'unselected non-eager Window slot stays unmounted');
    assert.equal(await count('mounted', 'ca'), 1, 'selected Carousel slot mounts');
    assert.equal(await count('mounted', 'cb'), 0, 'unselected non-eager Carousel slot stays unmounted');
    assert.equal(await count('mounted', 'ewb'), 1, 'UWindowItem eager=undefined inherits the parent Window eager=true');
    assert.equal(await count('mounted', 'ewc'), 0, 'explicit item eager=false overrides parent eager=true');
    assert.equal(await count('mounted', 'ecb'), 1, 'UCarouselItem eager=undefined inherits parent Carousel eager=true');
    assert.equal(await count('mounted', 'ecc'), 0, 'explicit Carousel item eager=false overrides parent eager=true');
    assert.equal(await modelValue('looseValue'), null, 'mandatory=false preserves an unset carousel model');
    assert.equal(await modelValue('forceValue'), 'force-enabled', 'mandatory=force chooses the first enabled item');
    assert.ok(await modelValue('timerUpdates') > 0, 'string interval below 1000ms drives autoplay');
    passed('initial lazy/eager inheritance and mandatory/autoplay defaults', 'Window and Carousel slots mount on selection unless parent eager is true; item eager=false overrides; false mandatory stays unset; force skips disabled; interval="70" cycles.');

    await callRef('window', 'next');
    await page.waitForFunction(() => document.querySelector('#probe-wb'));
    await page.waitForFunction(() => window.__windowLifecycle.counts.unmounted.wa === 1);
    assert.equal(await modelValue('windowValue'), 'wb');
    const itemEvents = await page.evaluate(() => window.__windowLifecycle.state.windowItemEvents);
    assert.ok(itemEvents.some(event => event.item === 'wa' && event.value === false), 'old item emits group:selected with {value:false}');
    assert.ok(itemEvents.some(event => event.item === 'wb' && event.value === true), 'new item emits group:selected with {value:true}');

    await page.evaluate(() => window.__windowLifecycle.rapidWindowChange());
    await page.waitForFunction(() => window.__windowLifecycle.state.windowValue === 'wb' && document.querySelector('#probe-wb'));
    await page.waitForFunction(() => !document.querySelector('#probe-wc'), null, { timeout: 3000 });
    await page.waitForFunction(() => !document.querySelector('#probe-wa'), null, { timeout: 3000 });
    assert.equal(await count('mounted', 'wb'), 1, 'rapid Window reversal keeps the final active slot mounted exactly once');
    assert.equal(await page.locator('#probe-wc').count(), 0, 'stale leave does not preserve the abandoned Window slot');
    assert.equal(await page.locator('#probe-wa').count(), 0, 'stale leave does not resurrect the earlier Window slot');
    passed('Window change event, non-eager leave cleanup and rapid reversal', 'group:selected emits object payloads; after rapid next/prev, only the latest selected slot remains mounted.');

    await setState('windowEager', false);
    await page.waitForFunction(() => window.__windowLifecycle.counts.unmounted.ewb === 1);
    assert.equal(await page.locator('#probe-ewa').count(), 1, 'selected eager Window item remains mounted after parent eager is disabled');
    report.transitionEvidence = report.transitionEvidence ?? {};
    report.transitionEvidence.window = await page.locator('#probe-ewb').evaluate(element => {
        let node = element;
        while (node && !node.classList.contains('u-window-item')) node = node.parentElement;
        return node ? { className: node.className, transitionDuration: getComputedStyle(node).transitionDuration } : null;
    });
    await page.waitForTimeout(350);
    if (await page.locator('#probe-ewb').count() !== 0) {
        report.protocolFailures.push({ contract: 'hidden inherited Window eager content leaves after transition', details: 'Probe unmount hook ran, but its hidden DOM remained 350ms after eager was disabled.' });
        await page.waitForFunction(() => !document.querySelector('#probe-ewb'), null, { timeout: 3000 });
    }
    assert.equal(await page.locator('#probe-ewb').count(), 0, 'hidden inherited Window slot eventually leaves the DOM');
    await setState('carouselEager', false);
    await page.waitForFunction(() => window.__windowLifecycle.counts.unmounted.ecb === 1);
    assert.equal(await page.locator('#probe-eca').count(), 1);
    report.transitionEvidence.carousel = await page.locator('#probe-ecb').evaluate(element => {
        const windowItem = element.closest('.u-window-item');
        return windowItem ? { className: windowItem.className, transitionDuration: getComputedStyle(windowItem).transitionDuration } : null;
    });
    await page.waitForTimeout(350);
    if (await page.locator('#probe-ecb').count() !== 0) {
        report.protocolFailures.push({ contract: 'hidden inherited Carousel eager content leaves after transition', details: 'Probe unmount hook ran, but its hidden DOM remained 350ms after eager was disabled.' });
        await page.waitForFunction(() => !document.querySelector('#probe-ecb'), null, { timeout: 3000 });
    }
    assert.equal(await page.locator('#probe-ecb').count(), 0, 'hidden inherited Carousel slot eventually leaves the DOM');
    passed('dynamic eager=true to false clears only hidden inherited slots', 'The selected content stays live; unselected inherited eager content unmounts immediately in Window and Carousel.');

    await callRef('carousel', 'next');
    await page.waitForFunction(() => window.__windowLifecycle.state.carouselValue === 'cb' && document.querySelector('#probe-cb'));
    await page.waitForFunction(() => window.__windowLifecycle.counts.unmounted.ca === 1);
    await page.evaluate(() => window.__windowLifecycle.rapidCarouselChange());
    await page.waitForFunction(() => window.__windowLifecycle.state.carouselValue === 'cb' && document.querySelector('#probe-cb'));
    await page.waitForFunction(() => !document.querySelector('#probe-cc'), null, { timeout: 3000 });
    assert.equal(await count('mounted', 'cb'), 1, 'rapid Carousel reversal keeps current content mounted exactly once');
    assert.equal(await page.locator('#probe-cc').count(), 0, 'stale Carousel leave removes abandoned content');
    passed('Carousel non-eager leave and quick toggle generation safety', 'Public next/prev share live group state and stale leave completion does not unmount the current slot.');

    const vertical = page.locator('#vertical-carousel');
    assert.equal(await vertical.evaluate(element => element.tagName), 'ARTICLE', 'tag prop selects the actual root element');
    assert.match(await vertical.getAttribute('class'), /is-vertical/);
    assert.equal(await vertical.evaluate(element => element.style.height), 'auto', 'explicit auto height is consumed without adding a fixed height');
    assert.equal(await vertical.locator('.u-carousel-controls.is-vertical.are-left').count(), 1, 'verticalDelimiters=left reaches the live controls');
    assert.equal(await vertical.locator('.u-carousel-next').count(), 1);
    assert.equal(await vertical.locator('.u-carousel-prev').count(), 1);
    await vertical.locator('.u-carousel-next').click();
    assert.equal(await modelValue('verticalValue'), 'v1', 'vertical next arrow selects the next item');
    await vertical.focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await modelValue('verticalValue'), 'v2', 'vertical keyboard navigation follows direction');
    await setState('verticalValue', 'v0');
    await page.evaluate(dispatchTouch, { selector: '#vertical-carousel', startX: 100, startY: 180, endX: 100, endY: 100 });
    assert.equal(await modelValue('verticalValue'), 'v1', 'vertical upward swipe selects the next item');
    await page.evaluate(dispatchTouch, { selector: '#vertical-carousel', startX: 100, startY: 100, endX: 100, endY: 180 });
    assert.equal(await modelValue('verticalValue'), 'v0', 'vertical downward swipe selects the previous item');
    passed('vertical Carousel tag, arrows, keyboard, swipe and auto height', 'The custom article root consumes direction/tag/height, left delimiters render, both real arrow buttons work, and keyboard/touch update the model.');

    const right = page.locator('#right-carousel');
    assert.equal(await right.locator('.u-carousel-controls.is-vertical.are-left').count(), 0, 'verticalDelimiters=right does not apply left alignment');
    assert.equal(await right.locator('.u-carousel-controls.is-vertical').count(), 1);
    await right.locator('.u-carousel-next').click();
    assert.equal(await modelValue('rightValue'), 'r1', 'right-side vertical carousel arrow is clickable');
    passed('right-side vertical delimiters and arrow controls', 'The right variant keeps vertical controls without the left alignment class and its next button selects an item.');

    assert.deepEqual(pageErrors, [], 'no page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser errors occurred');
    assert.deepEqual(consoleWarnings, [], 'no Vue/runtime warnings occurred');
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    if (page) {
        try {
            report.failureState = await page.evaluate(() => ({
                models: { ...window.__windowLifecycle?.state },
                counts: JSON.parse(JSON.stringify(window.__windowLifecycle?.counts ?? {})),
                probes: Array.from(document.querySelectorAll('.lifecycle-probe')).map(element => element.id),
                carousels: Array.from(document.querySelectorAll('.u-carousel')).map(element => ({ id: element.id, className: element.className, style: element.getAttribute('style'), controls: element.querySelector('.u-carousel-controls')?.className }))
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
    console.error('A product source file changed during the lifecycle run.');
    process.exitCode = 1;
} else if (report.protocolFailures.length) {
    console.error(`${report.protocolFailures.length} lifecycle contract(s) failed: ${JSON.stringify(report.protocolFailures)}`);
    process.exitCode = 1;
} else {
    console.log(`PASS ${report.checks.length} Window and Carousel lifecycle protocol groups.`);
}
