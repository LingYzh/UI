import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/slide-display-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const targetSources = [
    'src/ui/USlideGroup.vue',
    'src/ui/USlideGroupItem.vue',
    'src/ui/slide-group.ts',
    'tests/desktop/slide-display-protocols.mjs',
    'tests/tsconfig.slide-display.json'
];
const protectedSources = [
    'src/ui/styles.css',
    'src/ui/alignment-components.css',
    'src/ui/index.ts',
    'src/ui/display.ts',
    'src/ui/router.ts'
];

async function hashFiles(files) {
    return Object.fromEntries(await Promise.all(files.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const fixtureHtml = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>Slide display protocols</title>
        <style>
            html, body, #app { min-height: 0; height: auto; overflow: visible; }
            body { margin: 0; padding: 16px; }
            main, section { min-width: 0; display: grid; gap: 12px; }
            .slide-size { width: 160px; height: 36px; flex: 0 0 160px; }
            .scope-probe { position: absolute; width: 1px; height: 1px; overflow: hidden; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/full-alignment/slide-display-protocols/fixture/main.ts"></script>
    </body>
</html>
`;

const fixtureMain = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import SlideDisplayFixture from './SlideDisplayFixture.vue';
import '/src/ui/styles.css';

const ui = createUI();
window.__slideDisplay = ui.display;
createApp(SlideDisplayFixture).use(ui).mount('#app');
`;

const fixtureVue = `<script setup lang="ts">
import { reactive, ref } from 'vue';
import { USlideGroup, USlideGroupItem } from '/src/ui/index.ts';

const state = reactive({
    mobile: null as boolean | null,
    mobileBreakpoint: undefined as number | string | undefined,
    disabledModel: 'disabled-a',
    multipleModel: [] as string[],
    edgeModel: 'edge-a',
    edgeEvents: [] as string[]
});
const refs = { disabled: ref(), edge: ref() };
window.__slideDisplayProbe = {
    state,
    refs,
    setMobile(value: boolean | null) { state.mobile = value; },
    setBreakpoint(value: number | string | undefined) { state.mobileBreakpoint = value; },
    get edgeEvents() { return state.edgeEvents.slice(); },
    get disabledModel() { return state.disabledModel; },
    get multipleModel() { return [...state.multipleModel]; },
    get edgeRefMethods() { return { scrollTo: typeof refs.edge.value?.scrollTo, isOverflowing: typeof refs.edge.value?.isOverflowing }; }
};
</script>

<template>
    <main>
        <section id="default-fixture">
            <USlideGroup id="default-arrows-group" style="width: 230px">
                <USlideGroupItem value="default-a"><div class="slide-size">A</div></USlideGroupItem>
                <USlideGroupItem value="default-b"><div class="slide-size">B</div></USlideGroupItem>
                <USlideGroupItem value="default-c"><div class="slide-size">C</div></USlideGroupItem>
            </USlideGroup>
            <USlideGroup id="explicit-false-group" :show-arrows="false" style="width: 230px">
                <USlideGroupItem value="false-a"><div class="slide-size">A</div></USlideGroupItem>
                <USlideGroupItem value="false-b"><div class="slide-size">B</div></USlideGroupItem>
                <USlideGroupItem value="false-c"><div class="slide-size">C</div></USlideGroupItem>
            </USlideGroup>
            <USlideGroup id="always-arrows-group" tag="section" show-arrows="always" prev-icon="mdi-star" next-icon="mdi-home" style="width: 230px">
                <USlideGroupItem value="always-a"><div class="slide-size">A</div></USlideGroupItem>
                <USlideGroupItem value="always-b"><div class="slide-size">B</div></USlideGroupItem>
                <USlideGroupItem value="always-c"><div class="slide-size">C</div></USlideGroupItem>
            </USlideGroup>
            <USlideGroup id="mobile-config-group" :mobile="state.mobile" :mobile-breakpoint="state.mobileBreakpoint" show-arrows="desktop" style="width: 230px">
                <USlideGroupItem value="mobile-a"><div class="slide-size">A</div></USlideGroupItem>
                <USlideGroupItem value="mobile-b"><div class="slide-size">B</div></USlideGroupItem>
                <USlideGroupItem value="mobile-c"><div class="slide-size">C</div></USlideGroupItem>
            </USlideGroup>
            <USlideGroup id="disabled-group" :ref="refs.disabled" disabled show-arrows="always" v-model="state.disabledModel" style="width: 230px">
                <USlideGroupItem value="disabled-a"><template #default="{ toggle }"><button id="disabled-a" @click="toggle">A</button></template></USlideGroupItem>
                <USlideGroupItem value="disabled-b"><template #default="{ toggle }"><button id="disabled-b" @click="toggle">B</button></template></USlideGroupItem>
            </USlideGroup>
            <USlideGroup id="multiple-group" v-model="state.multipleModel" multiple :max="2" :show-arrows="false" style="width: 230px">
                <USlideGroupItem value="multiple-a"><template #default="{ toggle, selectedClass }"><button id="multiple-a" :class="selectedClass" @click="toggle">A</button></template></USlideGroupItem>
                <USlideGroupItem value="multiple-b"><template #default="{ toggle, selectedClass }"><button id="multiple-b" :class="selectedClass" @click="toggle">B</button></template></USlideGroupItem>
                <USlideGroupItem value="multiple-c"><template #default="{ toggle, selectedClass }"><button id="multiple-c" :class="selectedClass" @click="toggle">C</button></template></USlideGroupItem>
            </USlideGroup>
            <USlideGroup id="edge-group" :ref="refs.edge" v-model="state.edgeModel" show-arrows="always" @edge="state.edgeEvents.push($event)" style="width: 230px">
                <template #default="scope">
                    <div class="scope-probe">
                        <output id="scope-selected-ids">{{ scope.selected.value.join('|') }}</output>
                        <output id="scope-overflow">{{ scope.isOverflowing.value }}</output>
                        <output id="scope-scroll-type">{{ typeof scope.scrollTo }}</output>
                        <button id="scope-next" @click="scope.next">Select next</button>
                        <button id="scope-scroll-next" @click="scope.scrollTo('next')">Scroll next</button>
                    </div>
                    <USlideGroupItem value="edge-a"><div class="slide-size">A</div></USlideGroupItem>
                    <USlideGroupItem value="edge-b"><div class="slide-size">B</div></USlideGroupItem>
                    <USlideGroupItem value="edge-c"><div class="slide-size">C</div></USlideGroupItem>
                    <USlideGroupItem value="edge-d"><div class="slide-size">D</div></USlideGroupItem>
                </template>
                <template #prev="scope"><span id="prev-slot-scope">{{ typeof scope.prev }}|{{ typeof scope.scrollTo }}|{{ scope.selected.value.length }}|{{ scope.isOverflowing.value }}</span></template>
                <template #next="scope"><span id="next-slot-scope">{{ typeof scope.next }}|{{ typeof scope.scrollTo }}|{{ scope.selected.value.length }}|{{ scope.isOverflowing.value }}</span></template>
            </USlideGroup>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), fixtureHtml, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), fixtureMain, 'utf8');
await writeFile(path.join(fixtureDirectory, 'SlideDisplayFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__slide-display-protocols';
const fixturePlugin = {
    name: 'slide-display-protocols-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== virtualRoute) { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await viteServer.transformIndexHtml(virtualRoute, fixtureHtml));
        });
    }
};

const server = await createServer({
    root,
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/full-alignment/slide-display-protocols/fixture/main.ts'],
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

const sourceSha256 = await hashFiles([...targetSources, ...protectedSources]);
const targetSourceSha256Before = Object.fromEntries(targetSources.map(file => [file, sourceSha256[file]]));
const report = {
    fixture: 'slide-display-protocols',
    method: 'Vite fixture imports public src/ui/index.ts and exercises canonical USlideGroup in Playwright Chromium.',
    sourceSha256,
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    limits: [
        'Chromium browser renderer only; no Electron renderer acceptance is claimed.',
        'Screenshot is diagnostic only; no visual acceptance is claimed.',
        'No full project build or full test suite was run.'
    ]
};

let browser;
function passed(name, details) { report.checks.push({ name, details }); }
async function settle(page, delay = 80) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (delay) await page.waitForTimeout(delay);
}
async function waitFor(page, assertion) {
    let lastError;
    for (let attempt = 0; attempt < 40; attempt++) {
        try { await assertion(); return; }
        catch (error) { lastError = error; await page.waitForTimeout(50); }
    }
    throw lastError;
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    browser = await chromium.launch({ headless: true });
    report.backend = 'playwright-chromium';
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', error => report.pageErrors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') report.consoleErrors.push(line);
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.consoleWarnings.push(line);
    });
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ status: response.status(), url: response.url() }); });
    page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('#default-arrows-group').waitFor();
    await settle(page, 250);

    assert.equal(await page.locator('#default-arrows-group').evaluate(element => element.tagName.toLowerCase()), 'div');
    await waitFor(page, async () => assert.equal(await page.locator('#default-arrows-group .u-slide-group-prev').count(), 1));
    assert.equal(await page.locator('#explicit-false-group .u-slide-group-prev, #explicit-false-group .u-slide-group-next').count(), 0);
    assert.equal(await page.locator('#always-arrows-group').evaluate(element => element.tagName.toLowerCase()), 'section');
    assert.equal(await page.locator('#always-arrows-group .u-slide-group-prev').count(), 1);
    assert.equal(await page.locator('#always-arrows-group .u-slide-group-next').count(), 1);
    const defaultPrevPath = await page.locator('#default-arrows-group .u-slide-group-prev svg path').getAttribute('d');
    const defaultNextPath = await page.locator('#default-arrows-group .u-slide-group-next svg path').getAttribute('d');
    const customPrevPath = await page.locator('#always-arrows-group .u-slide-group-prev svg path').getAttribute('d');
    const customNextPath = await page.locator('#always-arrows-group .u-slide-group-next svg path').getAttribute('d');
    assert.notEqual(customPrevPath, defaultPrevPath, 'prevIcon overrides the default path');
    assert.notEqual(customNextPath, defaultNextPath, 'nextIcon overrides the default path');
    passed('tag, default/explicit arrow modes, and custom icon paths', 'Default tag is div; custom tag is rendered; omitted arrows retain desktop overflow behavior while explicit false hides them; icon props override the existing paths.');

    assert.equal(await page.locator('#scope-overflow').textContent(), 'true');
    assert.equal(await page.locator('#scope-scroll-type').textContent(), 'function');
    const selectedIds = (await page.locator('#scope-selected-ids').textContent()).split('|').filter(Boolean);
    const registeredIds = await page.locator('#edge-group [data-u-slide-item]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-u-slide-item')));
    assert.equal(selectedIds.length, 1);
    assert.ok(registeredIds.includes(selectedIds[0]), 'slot selected ref contains an internal item ID');
    assert.equal(await page.locator('#edge-group').evaluate(element => typeof element.__vueParentComponent?.exposed?.scrollTo), 'function');
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeRefMethods), { scrollTo: 'function', isOverflowing: 'boolean' });
    assert.equal(await page.locator('#prev-slot-scope').textContent(), 'function|function|1|true');
    assert.equal(await page.locator('#next-slot-scope').textContent(), 'function|function|1|true');
    passed('default slot scope', 'selected remains a Ref of internal item IDs; isOverflowing remains a Ref; scrollTo remains exposed and callable.');

    const edgeViewport = page.locator('#edge-group .u-slide-group-viewport');
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeEvents), [], 'initial mount and measurement do not emit edges');
    await edgeViewport.evaluate(element => { element.scrollLeft = element.scrollWidth; element.dispatchEvent(new Event('scroll', { bubbles: true })); });
    await settle(page, 100);
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeEvents), ['end']);
    await edgeViewport.evaluate(element => element.dispatchEvent(new Event('scroll', { bubbles: true })));
    await settle(page, 80);
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeEvents), ['end'], 'repeated scroll at the end emits no duplicate');
    await edgeViewport.evaluate(element => { element.scrollLeft = 0; element.dispatchEvent(new Event('scroll', { bubbles: true })); });
    await settle(page, 100);
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeEvents), ['end', 'start']);
    await page.evaluate(() => { window.__slideDisplayProbe.state.edgeEvents.splice(0); document.querySelector('#edge-group').style.width = '340px'; window.dispatchEvent(new Event('resize')); });
    await settle(page, 250);
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeEvents), [], 'ResizeObserver/measure does not emit edge');
    const scrollBefore = await edgeViewport.evaluate(element => element.scrollLeft);
    await page.locator('#scope-scroll-next').evaluate(element => element.click());
    await waitFor(page, async () => assert.ok((await edgeViewport.evaluate(element => element.scrollLeft)) > scrollBefore + 1));
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.edgeEvents), [], 'slot scrollTo is callable without producing a false edge');
    passed('edge events', 'Only scroll transitions from hadNext/hadPrev to the corresponding edge emit once; measurement and resize emit none.');

    const disabledFocus = await page.evaluate(() => window.__slideDisplayProbe.refs.disabled.value.focus());
    assert.equal(disabledFocus, false);
    await page.locator('#disabled-a').evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    await settle(page);
    assert.equal(await page.evaluate(() => window.__slideDisplayProbe.disabledModel), 'disabled-a');
    passed('disabled group guard', 'Disabled group focus API returns false and child toggle cannot change its model.');

    await page.locator('#multiple-a').click();
    await page.locator('#multiple-b').click();
    await page.locator('#multiple-c').click();
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.multipleModel), ['multiple-a', 'multiple-b']);
    await page.locator('#multiple-a').click();
    await settle(page);
    assert.deepEqual(await page.evaluate(() => window.__slideDisplayProbe.multipleModel), ['multiple-b']);
    passed('selection contract', 'Multiple selection honors max=2 and still toggles existing selected values off.');

    await page.setViewportSize({ width: 390, height: 900 });
    await waitFor(page, async () => assert.equal(await page.evaluate(() => window.__slideDisplay.width.value), 390));
    await settle(page, 180);
    assert.equal(await page.locator('#default-arrows-group .u-slide-group-prev').count(), 0, 'default mobile follows useDisplay mobile');
    await page.evaluate(() => window.__slideDisplayProbe.setMobile(false));
    await settle(page);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 1, 'mobile=false without breakpoint forces desktop mode');
    await page.evaluate(() => window.__slideDisplayProbe.setBreakpoint(700));
    await settle(page);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 0, 'numeric breakpoint overrides mobile=false');
    await page.setViewportSize({ width: 800, height: 900 });
    await waitFor(page, async () => assert.equal(await page.evaluate(() => window.__slideDisplay.width.value), 800));
    await settle(page, 180);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 1, 'numeric breakpoint updates after viewport resize');
    await page.evaluate(() => window.__slideDisplayProbe.setBreakpoint('md'));
    await settle(page);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 0, 'named md breakpoint uses its threshold');
    await page.evaluate(() => window.__slideDisplayProbe.setBreakpoint('unknown'));
    await page.setViewportSize({ width: 390, height: 900 });
    await waitFor(page, async () => assert.equal(await page.evaluate(() => window.__slideDisplay.width.value), 390));
    await settle(page, 180);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 0, 'unknown named threshold falls back to display.mobile without NaN');
    await page.evaluate(() => window.__slideDisplayProbe.setBreakpoint(Number.NaN));
    await settle(page);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 0, 'invalid numeric threshold falls back to display.mobile');
    await page.evaluate(() => { window.__slideDisplayProbe.setBreakpoint(700); window.__slideDisplayProbe.setMobile(true); });
    await page.setViewportSize({ width: 1280, height: 900 });
    await waitFor(page, async () => assert.equal(await page.evaluate(() => window.__slideDisplay.width.value), 1280));
    await settle(page, 180);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 0, 'mobile=true overrides desktop width');
    await page.evaluate(() => window.__slideDisplayProbe.setMobile(null));
    await settle(page);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 1, 'mobile=null defers to the configured breakpoint');
    await page.evaluate(() => window.__slideDisplayProbe.setBreakpoint(undefined));
    await settle(page);
    assert.equal(await page.locator('#mobile-config-group .u-slide-group-prev').count(), 1, 'mobile=null falls back to display.mobile at desktop width');
    report.checks.push({ name: 'mobile and breakpoint resolution', details: 'Boolean override, numeric and named thresholds, resize reactivity, and invalid-threshold fallback to useDisplay all passed.' });

    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.consoleWarnings, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.requestFailures, []);
    await page.screenshot({ path: path.join(evidence, 'slide-display-protocols.png'), fullPage: true });

    report.targetSourceSha256After = await hashFiles(targetSources);
    report.protectedSourceSha256After = await hashFiles(protectedSources);
    assert.deepEqual(report.targetSourceSha256After, targetSourceSha256Before, 'product and test sources remained unchanged during the browser run');
    assert.deepEqual(report.protectedSourceSha256After, Object.fromEntries(protectedSources.map(file => [file, sourceSha256[file]])), 'protected shared styling, public exports, display and router sources remained unchanged');
    report.protectedSourcesUnchanged = true;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(`slide display protocols: ${report.checks.length} groups passed`);
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    report.targetSourceSha256After = await hashFiles(targetSources);
    report.protectedSourceSha256After = await hashFiles(protectedSources);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    throw error;
} finally {
    if (browser) await browser.close();
    await server.close();
}
