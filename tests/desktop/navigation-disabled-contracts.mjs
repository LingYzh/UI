import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/navigation-disabled-contracts');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const productSources = [
    'src/ui/UStepperItem.vue',
    'src/ui/UStepper.vue',
    'src/ui/UExpansionPanel.vue',
    'src/ui/UTreeview.vue',
    'src/ui/group-state.ts',
    'tests/desktop/navigation-disabled-contracts.mjs',
    'tests/tsconfig.navigation-disabled.json'
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
        <title>Navigation disabled contracts</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/component-audit-root/navigation-disabled-contracts/fixture/main.ts"></script>
    </body>
</html>
`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import NavigationDisabledFixture from './NavigationDisabledFixture.vue';
import '/src/ui/styles.css';

createApp(NavigationDisabledFixture).use(createUI()).mount('#app');
`;

const fixtureVue = `<script setup>
import { reactive, ref } from 'vue';
import {
    UExpansionPanel,
    UExpansionPanelText,
    UExpansionPanelTitle,
    UExpansionPanels,
    UStepper,
    UStepperItem,
    UTreeview
} from '/src/ui/index.ts';

const state = reactive({
    stepperValue: null,
    stepperDisabled: false,
    firstStepDisabled: true,
    secondStepDisabled: false,
    secondStepValue: 'step-second',
    allDisabledValue: null,
    allDisabledSecond: true,
    nonMandatoryValue: null,
    panelValue: null,
    panelsDisabled: false,
    firstPanelDisabled: true,
    secondPanelDisabled: false,
    secondPanelValue: 'panel-second',
    treeOpened: ['parent']
});
const refs = { stepper: ref(), allDisabledStepper: ref() };
const treeItems = [
    { value: 'disabled-root', title: 'Disabled root', disabled: true, children: [{ value: 'hidden-child', title: 'Hidden child' }] },
    { value: 'parent', title: 'Parent', children: [
        { value: 'disabled-child', title: 'Disabled child', disabled: true },
        { value: 'enabled-child', title: 'Enabled child' }
    ] },
    { value: 'last', title: 'Last enabled' }
];
window.__navigationDisabledProbe = { state, refs };
</script>

<template>
    <main>
        <section id="stepper-fixture">
            <output id="stepper-model">{{ state.stepperValue ?? 'null' }}</output>
            <UStepper :ref="refs.stepper" v-model="state.stepperValue" :disabled="state.stepperDisabled">
                <UStepperItem value="step-first" title="First step" :disabled="state.firstStepDisabled" />
                <UStepperItem :value="state.secondStepValue" title="Second step" :disabled="state.secondStepDisabled" />
                <UStepperItem value="step-third" title="Third step" />
            </UStepper>
        </section>
        <section id="all-disabled-stepper-fixture">
            <output id="all-disabled-stepper-model">{{ state.allDisabledValue ?? 'null' }}</output>
            <UStepper :ref="refs.allDisabledStepper" v-model="state.allDisabledValue">
                <UStepperItem value="all-disabled-first" title="All disabled first" disabled />
                <UStepperItem value="all-disabled-second" title="All disabled second" :disabled="state.allDisabledSecond" />
            </UStepper>
        </section>
        <section id="non-mandatory-stepper-fixture">
            <output id="non-mandatory-stepper-model">{{ state.nonMandatoryValue ?? 'null' }}</output>
            <UStepper v-model="state.nonMandatoryValue" :mandatory="false">
                <UStepperItem value="non-mandatory-step" title="Non-mandatory step" />
            </UStepper>
        </section>
        <section id="expansion-fixture">
            <output id="panel-model">{{ state.panelValue ?? 'null' }}</output>
            <UExpansionPanels v-model="state.panelValue" mandatory :disabled="state.panelsDisabled">
                <UExpansionPanel value="panel-first" :disabled="state.firstPanelDisabled">
                    <UExpansionPanelTitle>First panel</UExpansionPanelTitle>
                    <UExpansionPanelText>First content</UExpansionPanelText>
                </UExpansionPanel>
                <UExpansionPanel :value="state.secondPanelValue" :disabled="state.secondPanelDisabled">
                    <UExpansionPanelTitle>Second panel</UExpansionPanelTitle>
                    <UExpansionPanelText>Second content</UExpansionPanelText>
                </UExpansionPanel>
            </UExpansionPanels>
        </section>
        <section id="tree-fixture">
            <UTreeview :items="treeItems" :opened="state.treeOpened" />
        </section>
    </main>
</template>
`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'NavigationDisabledFixture.vue'), fixtureVue, 'utf8');

const virtualRoute = '/__navigation-disabled-contracts';
const fixturePlugin = {
    name: 'navigation-disabled-contracts-fixture',
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
        entries: ['artifacts/component-audit-root/navigation-disabled-contracts/fixture/main.ts'],
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
    fixture: 'navigation-disabled-contracts',
    method: 'Vite fixture imports the real public UStepper/UStepperItem/UExpansionPanels/UExpansionPanel/UTreeview SFCs through src/ui/index.ts and exercises them in Chromium.',
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
async function text(page, selector) { return (await page.locator(selector).textContent())?.trim(); }
async function callStepper(page, method, value) {
    await page.evaluate(([key, target]) => {
        const stepper = window.__navigationDisabledProbe.refs.stepper.value;
        if (target === undefined) stepper[key]();
        else stepper[key](target);
    }, [method, value]);
    await settle(page);
}
async function activeTreeTitle(page) {
    return page.evaluate(() => document.activeElement?.querySelector('.ui-treeview-title')?.textContent?.trim() ?? null);
}

try {
    await server.listen();
    const url = new URL(virtualRoute.slice(1), server.resolvedUrls.local[0]).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, 'fixture document is served');
    browser = await chromium.launch({ headless: true });
    report.backend = 'playwright-chromium';
    const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
    page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
    page.on('console', (message) => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') consoleErrors.push(line);
        if (message.type() === 'warning') consoleWarnings.push(line);
    });
    page.on('response', (item) => { if (item.status() >= 400) httpErrors.push({ status: item.status(), url: item.url() }); });
    page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('#stepper-model').waitFor();
    await settle(page);

    assert.equal(await text(page, '#stepper-model'), 'step-second', 'mandatory stepper initialization skips the disabled first item');
    await callStepper(page, 'next');
    assert.equal(await text(page, '#stepper-model'), 'step-third', 'stepper next skips disabled items');
    await callStepper(page, 'prev');
    assert.equal(await text(page, '#stepper-model'), 'step-second', 'stepper prev skips disabled items');
    await page.evaluate(() => { window.__navigationDisabledProbe.state.secondStepDisabled = true; });
    await settle(page);
    assert.equal(await text(page, '#stepper-model'), 'step-second', 'changing the selected step to disabled preserves its current model');
    await callStepper(page, 'next');
    assert.equal(await text(page, '#stepper-model'), 'step-third', 'navigation away from a newly disabled step skips it');
    await page.evaluate(() => { window.__navigationDisabledProbe.state.secondStepValue = 'step-renamed'; });
    await settle(page);
    await page.evaluate(() => { window.__navigationDisabledProbe.state.secondStepDisabled = false; });
    await settle(page);
    await callStepper(page, 'go', 'step-renamed');
    assert.equal(await text(page, '#stepper-model'), 'step-renamed', 'changing a step value re-registers the item with its current disabled state');
    await page.evaluate(() => { window.__navigationDisabledProbe.state.stepperDisabled = true; });
    await settle(page);
    assert.equal(await page.getByRole('button', { name: /Second step/ }).isDisabled(), true, 'parent stepper disabled state updates the child button');
    await callStepper(page, 'go', 'step-third');
    assert.equal(await text(page, '#stepper-model'), 'step-renamed', 'parent stepper disabled state blocks child navigation in the live go guard');
    await callStepper(page, 'next');
    assert.equal(await text(page, '#stepper-model'), 'step-renamed', 'parent stepper disabled state blocks ref navigation in the live move/go guard');

    assert.equal(await text(page, '#all-disabled-stepper-model'), 'null', 'a mandatory stepper with no enabled items stays unselected');
    await page.evaluate(() => { window.__navigationDisabledProbe.state.allDisabledSecond = false; });
    await settle(page);
    await page.evaluate(() => window.__navigationDisabledProbe.refs.allDisabledStepper.value.next());
    await settle(page);
    assert.equal(await text(page, '#all-disabled-stepper-model'), 'all-disabled-second', 'stepper next selects a newly enabled item when no item was previously selected');
    assert.equal(await text(page, '#non-mandatory-stepper-model'), 'null', 'explicit mandatory=false preserves the empty initial model');
    await page.getByRole('button', { name: /Non-mandatory step/ }).click();
    await settle(page);
    assert.equal(await text(page, '#non-mandatory-stepper-model'), 'non-mandatory-step', 'explicit mandatory=false still allows user selection');
    passed('UStepper disabled-item protocol', 'Mandatory initialization, next/prev, dynamic disabled/value changes, all-disabled state, and parent disabled state use live item registration.');

    assert.equal(await text(page, '#panel-model'), 'panel-second', 'mandatory expansion initializes to the first enabled panel');
    await page.evaluate(() => {
        window.__navigationDisabledProbe.state.secondPanelDisabled = true;
        window.__navigationDisabledProbe.state.panelsDisabled = true;
    });
    await settle(page);
    assert.equal(await text(page, '#panel-model'), 'panel-second', 'disabling an already selected panel preserves its current model');
    assert.equal(await page.getByRole('button', { name: 'Second panel' }).isDisabled(), true, 'parent and item disabled states reach panel activation');
    await page.evaluate(() => {
        window.__navigationDisabledProbe.state.secondPanelValue = 'panel-renamed';
        window.__navigationDisabledProbe.state.panelsDisabled = false;
    });
    await settle(page);
    assert.equal(await page.getByRole('button', { name: 'Second panel' }).isDisabled(), true, 'renamed disabled panel remains disabled after re-registration');
    await page.evaluate(() => { window.__navigationDisabledProbe.state.secondPanelDisabled = false; });
    await settle(page);
    await page.getByRole('button', { name: 'Second panel' }).click();
    await settle(page);
    assert.equal(await text(page, '#panel-model'), 'panel-renamed', 'panel value changes re-register with current disabled state and remain selectable when enabled');
    passed('UExpansionPanel disabled-item protocol', 'Mandatory initial selection skips disabled panels; item/parent disabled guards update live; value changes re-register without stale item state.');

    const disabledRoot = page.getByRole('treeitem', { name: 'Disabled root' });
    const disabledChild = page.getByRole('treeitem', { name: 'Disabled child' });
    const parent = page.getByRole('treeitem', { name: 'Parent' });
    const enabledChild = page.getByRole('treeitem', { name: 'Enabled child' });
    const last = page.getByRole('treeitem', { name: 'Last enabled' });
    assert.equal(await disabledRoot.getAttribute('tabindex'), '-1', 'disabled tree nodes are removed from sequential keyboard focus');
    assert.equal(await disabledChild.getAttribute('tabindex'), '-1', 'disabled descendants are removed from sequential keyboard focus');
    await parent.press('ArrowRight');
    assert.equal(await activeTreeTitle(page), 'Enabled child', 'ArrowRight finds the next enabled DOM treeitem, skipping a disabled child');
    await last.press('Home');
    assert.equal(await activeTreeTitle(page), 'Parent', 'Home focuses the first enabled treeitem');
    await parent.press('ArrowDown');
    assert.equal(await activeTreeTitle(page), 'Enabled child', 'ArrowDown skips disabled visible nodes');
    await last.press('ArrowUp');
    assert.equal(await activeTreeTitle(page), 'Enabled child', 'ArrowUp skips disabled visible nodes');
    await parent.press('End');
    assert.equal(await activeTreeTitle(page), 'Last enabled', 'End focuses the last enabled treeitem');
    await enabledChild.press('ArrowLeft');
    assert.equal(await activeTreeTitle(page), 'Parent', 'ArrowLeft resolves the enabled parent by value after disabled filtering');
    passed('UTreeview disabled keyboard protocol', 'Disabled nodes keep their DOM/ARIA representation with tabindex=-1 and are excluded from Home/End, arrow navigation, and focus targets.');

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
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 4)}\n`, 'utf8');
    if (browser) await browser.close();
    await server.close();
}

console.log(`Evidence: ${path.join(evidence, 'report.json')}`);
if (report.failure) {
    console.error(report.failure);
    process.exitCode = 1;
} else {
    console.log(`PASS ${report.checks.length} navigation disabled protocol groups on ${report.backend}`);
}
