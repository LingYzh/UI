import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/window-disabled-items');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/group-state.ts',
    'src/ui/UWindow.vue',
    'src/ui/UWindowItem.vue',
    'src/ui/UCarousel.vue',
    'src/ui/UCarouselItem.vue',
    'src/ui/window-state.ts',
    'tests/group-reactivity.test.ts',
    'tests/desktop/window-disabled-items.mjs',
    'tests/tsconfig.window-disabled.json'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(productSources.map(async (file) => [
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
        <title>Window disabled-item fixture</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/window-disabled-items/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import WindowDisabledFixture from './WindowDisabledFixture.vue';
import '/src/ui/styles.css';

createApp(WindowDisabledFixture).use(createUI()).mount('#app');
`;

const fixtureVue = `<script setup>
import { reactive, ref } from 'vue';
import { UCarousel, UCarouselItem, UWindow, UWindowItem } from '/src/ui/index.ts';

const state = reactive({
    windowValue: null,
    windowFirstDisabled: true,
    carouselValue: null,
    carouselFirstDisabled: true
});
const refs = { window: ref(), carousel: ref() };
(window).__windowDisabledProbe = { state, refs };
</script>

<template>
    <main>
        <section id="window-fixture">
            <output id="window-model">{{ state.windowValue ?? 'null' }}</output>
            <UWindow :ref="refs.window" v-model="state.windowValue" continuous>
                <template #default="scope">
                    <output id="window-scope-model">{{ scope.modelValue ?? 'null' }}</output>
                    <button id="window-slot-next" type="button" @click="scope.next">Next</button>
                    <button id="window-slot-prev" type="button" @click="scope.prev">Previous</button>
                    <UWindowItem value="window-first" :disabled="state.windowFirstDisabled"><span data-window-item="first">First</span></UWindowItem>
                    <UWindowItem value="window-second"><span data-window-item="second">Second</span></UWindowItem>
                    <UWindowItem value="window-third"><span data-window-item="third">Third</span></UWindowItem>
                </template>
            </UWindow>
        </section>
        <section id="carousel-fixture">
            <output id="carousel-model">{{ state.carouselValue ?? 'null' }}</output>
            <UCarousel :ref="refs.carousel" v-model="state.carouselValue" :cycle="false" :interval="0" label="Disabled test carousel">
                <template #default="scope">
                    <output id="carousel-scope-model">{{ scope.modelValue ?? 'null' }}</output>
                    <UCarouselItem value="carousel-first" :disabled="state.carouselFirstDisabled"><span data-carousel-item="first">First</span></UCarouselItem>
                    <UCarouselItem value="carousel-second"><span data-carousel-item="second">Second</span></UCarouselItem>
                    <UCarouselItem value="carousel-third"><span data-carousel-item="third">Third</span></UCarouselItem>
                </template>
            </UCarousel>
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'WindowDisabledFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__window-disabled-items';
const fixturePlugin = {
    name: 'window-disabled-items-fixture',
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
        entries: ['artifacts/component-audit-root/window-disabled-items/fixture/main.ts'],
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
    plugins: [fixturePlugin]
});

const report = {
    fixture: 'window-disabled-items',
    method: 'Vite fixture imports canonical UWindow/UWindowItem/UCarousel/UCarouselItem through src/ui/index.ts and exercises the real SFCs in Chromium.',
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
async function settle(page) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.waitForTimeout(60);
}
async function value(page, selector) { return page.locator(selector).textContent(); }
async function callRef(page, name, method) {
    await page.evaluate(([refName, key]) => window.__windowDisabledProbe.refs[refName].value[key](), [name, method]);
    await settle(page);
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, 'fixture document is served');
    browser = await chromium.launch({ headless: true });
    report.backend = 'playwright-chromium';
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
    page.on('console', (message) => {
        const line = message.type() + ': ' + message.text();
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    page.on('response', (item) => { if (item.status() >= 400) httpErrors.push({ status: item.status(), url: item.url() }); });
    page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('#window-model').waitFor();
    await settle(page);

    assert.equal(await value(page, '#window-model'), 'window-second', 'mandatory UWindow initialization skips the disabled first item');
    assert.equal(await value(page, '#window-scope-model'), 'window-second', 'UWindow slot scope reflects the selected item');
    await page.locator('#window-slot-next').click();
    await settle(page);
    assert.equal(await value(page, '#window-model'), 'window-third', 'UWindow slot next advances through enabled items');
    await callRef(page, 'window', 'next');
    assert.equal(await value(page, '#window-model'), 'window-second', 'UWindow ref next wraps and skips a disabled item');
    await callRef(page, 'window', 'prev');
    assert.equal(await value(page, '#window-model'), 'window-third', 'UWindow ref prev skips a disabled item');
    await page.evaluate(() => { window.__windowDisabledProbe.state.windowFirstDisabled = false; });
    await settle(page);
    await callRef(page, 'window', 'prev');
    await callRef(page, 'window', 'prev');
    assert.equal(await value(page, '#window-model'), 'window-first', 'UWindow navigation observes a live item disabled prop');
    await page.evaluate(() => { window.__windowDisabledProbe.state.windowFirstDisabled = true; });
    await settle(page);
    assert.equal(await value(page, '#window-model'), 'window-first', 'changing disabled does not rewrite the selected model');
    await callRef(page, 'window', 'next');
    assert.equal(await value(page, '#window-model'), 'window-second', 'navigation away from a newly disabled selection chooses an enabled item');
    passed('UWindowItem live disabled protocol', 'The public UWindow wrapper skips disabled items for mandatory initialization and next/prev, reads prop changes dynamically, and preserves an already selected model when disabled changes.');

    assert.equal(await value(page, '#carousel-model'), 'carousel-second', 'mandatory UCarousel initialization skips the disabled first item');
    assert.equal(await value(page, '#carousel-scope-model'), 'carousel-second', 'UCarousel slot scope reflects the selected item');
    await page.locator('#carousel-fixture .u-carousel-next').click();
    await settle(page);
    assert.equal(await value(page, '#carousel-model'), 'carousel-third', 'UCarousel next button advances through enabled items');
    await page.locator('#carousel-fixture .u-carousel-next').click();
    await settle(page);
    assert.equal(await value(page, '#carousel-model'), 'carousel-second', 'UCarousel next button skips its disabled item across wrap');
    await page.evaluate(() => { window.__windowDisabledProbe.state.carouselFirstDisabled = false; });
    await settle(page);
    await page.locator('#carousel-fixture .u-carousel-prev').click();
    await settle(page);
    assert.equal(await value(page, '#carousel-model'), 'carousel-first', 'UCarouselItem forwards live disabled prop to UWindowItem registration');
    await page.evaluate(() => { window.__windowDisabledProbe.state.carouselFirstDisabled = true; });
    await settle(page);
    assert.equal(await value(page, '#carousel-model'), 'carousel-first', 'UCarouselItem disabled changes preserve an existing selection');
    await callRef(page, 'carousel', 'next');
    assert.equal(await value(page, '#carousel-model'), 'carousel-second', 'UCarousel ref navigation skips the newly disabled selected item');
    passed('UCarouselItem disabled forwarding', 'The public UCarouselItem wrapper forwards the dynamic disabled state and its built-in navigation continues to select only enabled items.');

    assert.deepEqual(errors, [], 'no Vue or page errors occurred');
    assert.deepEqual(consoleErrors, [], 'no browser console errors occurred');
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
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4) + '\n', 'utf8');
    if (browser) await browser.close();
    await server.close();
}

console.log('Evidence: ' + path.join(evidence, 'report.json'));
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else {
    console.log('PASS ' + report.checks.length + ' window disabled-item checks on ' + report.backend);
}
