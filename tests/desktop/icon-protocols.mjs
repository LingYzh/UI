import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import { mdiCircle, mdiPageFirst, mdiPageLast } from '@mdi/js';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/icon-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
const reportPath = path.join(evidence, 'report.json');
await mkdir(fixtureDirectory, { recursive: true });

const targetSources = [
    'src/components/Icon.vue',
    'src/ui/icon-config.ts',
    'src/ui/icon-renderers.ts',
    'src/ui/local-icon-names.ts',
    'src/ui/plugin.ts',
    'src/ui/icons.ts',
    'src/ui/iconsets/mdi-svg.ts',
    'src/ui/index.ts',
    'src/ui/docs/IconProtocolsDemo.vue',
    'src/ui/docs/LayoutDemo.vue',
    'src/ui/docs/layoutContent.js',
    'src/ui/UiButton.vue',
    'src/ui/UiInput.vue',
    'src/ui/UiCard.vue',
    'src/ui/UiPagination.vue',
    'src/ui/UCarousel.vue',
    'src/ui/UCarouselItem.vue',
    'src/ui/UStepper.vue',
    'src/ui/UStepperItem.vue',
    'src/ui/UStepperVertical.vue',
    'src/ui/UStepperVerticalItem.vue',
    'src/ui/UField.vue',
    'src/ui/UiSwitch.vue',
    'src/ui/UHotkey.vue',
    'src/ui/hotkey.ts',
    'src/ui/data-table-types.ts',
    'src/ui/UDataTable.vue',
    'src/ui/UDataTableVirtual.vue',
    'src/ui/UiDataTableServer.vue',
    'src/ui/styles.css',
    'src/ui/layout-components.css',
    'src/assets/icons/copy.svg',
    'src/assets/icons/file.svg',
    'tests/icon-consumers.test.ts',
    'tests/icon-types.fixture.vue',
    'tests/tsconfig.icons.json',
    'tests/desktop/icon-protocols.mjs'
];

async function hashFiles(files) {
    return Object.fromEntries(await Promise.all(files.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

function pathDataFromSource(source) {
    return [...source.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(match => match[1]);
}

const sourceSha256Before = await hashFiles(targetSources);
const pathOne = 'M2 2h20v20H2z';
const pathTwo = 'M4 4h16v16H4z';
const customSetPath = 'M7 7h10v10H7z';
const pathArray = `[ '${pathOne}', ['${pathTwo}', 0.35] ]`;

const fixtureHtml = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="data:,">
    <title>Icon protocol fixture</title>
    <style>
        html, body { margin: 0; min-height: 100%; font-family: system-ui, sans-serif; }
        body { padding: 24px; color: var(--text, #17212b); background: var(--background, #f2f5f8); }
        #app-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
        .icon-protocol-root { display: grid; gap: 16px; min-width: 0; padding: 20px; border: 1px solid #aebac6; border-radius: 14px; background: var(--background, #ffffff); }
        .protocol-section { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid #d2d9e0; border-radius: 10px; }
        .protocol-color-host { color: rgb(13, 74, 100); }
        .protocol-stepper { min-width: 0; }
        #docs-demo-shell { margin-top: 24px; min-width: 0; padding: 20px; border: 1px solid #aebac6; border-radius: 14px; background: var(--background, #ffffff); }
        #docs-demo-app { min-width: 0; }
        @media (max-width: 800px) {
            body { padding: 12px; }
            #app-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
            .icon-protocol-root { padding: 14px; }
            #docs-demo-shell { margin-top: 12px; padding: 14px; }
        }
    </style>
</head>
<body>
    <div id="app-grid">
        <div id="left-app"></div>
        <div id="right-app"></div>
    </div>
    <section id="docs-demo-shell" aria-label="Actual icon protocol documentation demo">
        <h2>Documentation demo</h2>
        <div id="docs-demo-app"></div>
    </section>
    <script type="module" src="/artifacts/icon-protocols/fixture/main.ts"></script>
</body>
</html>`;

const fixtureMain = `import { createApp, defineComponent, h } from 'vue';
import { createUI } from '/src/ui/plugin.ts';
import IconProtocolFixture from './IconProtocolFixture.vue';
import IconProtocolsDemo from '/src/ui/docs/IconProtocolsDemo.vue';
import '/src/ui/styles.css';

const pathOne = '${pathOne}';
const pathTwo = '${pathTwo}';
const customSetPath = '${customSetPath}';
const defaultPageFirst = '${mdiPageFirst}';
const defaultPageLast = '${mdiPageLast}';
const defaultDelimiter = '${mdiCircle}';
const layeredPath = [pathOne, [pathTwo, 0.35]];
const MarkerIcon = defineComponent({
    name: 'ProtocolMarkerIcon',
    setup() {
        return function renderMarkerIcon() {
            return h('svg', { class: 'protocol-component-marker', viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M12 2L22 22H2z' })]);
        };
    }
});
const CustomSetRenderer = defineComponent({
    name: 'ProtocolCustomSetRenderer',
    props: {
        icon: { type: [String, Array, Object, Function], default: '' },
        tag: { type: String, default: 'span' },
        attrs: { type: Object, default: () => ({}) }
    },
    setup(props) {
        return function renderCustomSetIcon() {
            const iconValue = typeof props.icon === 'string' ? props.icon : JSON.stringify(props.icon);
            return h(props.tag, {
                ...props.attrs,
                class: 'protocol-custom-set-renderer',
                'data-testid': 'custom-set-renderer',
                'data-rendered-icon': iconValue,
                'data-received-tag': props.tag
            }, [h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: iconValue })])]);
        };
    }
});

function makeUiOptions(sharedPath, locale) {
    return {
        components: false,
        // The icon fixture checks static themes rather than concurrent document view transitions.
        theme: { transition: false },
        locale: { locale },
        icons: {
            defaultSet: 'mdi',
            aliases: {
                shared: sharedPath,
                layered: layeredPath,
                componentAlias: MarkerIcon,
                copyAlias: 'copy',
                pageFirst: pathOne,
                pageLast: pathTwo,
                cycleA: '$cycleB',
                cycleB: '$cycleA'
            },
            sets: {
                protocol: { component: CustomSetRenderer, paths: { device: customSetPath } }
            }
        }
    };
}

const leftUi = createUI(makeUiOptions(pathOne, 'en'));
const rightUi = createUI(makeUiOptions(pathTwo, 'ar'));
const control = {
    apps: Object.create(null),
    docsVueWarnings: [],
    themes: { left: leftUi.theme, right: rightUi.theme },
    markers: { componentIcon: MarkerIcon },
    paths: { one: pathOne, two: pathTwo, customSet: customSetPath, defaultPageFirst, defaultPageLast, defaultDelimiter }
};
window.__iconProtocol = control;

createApp(IconProtocolFixture, { appId: 'left', componentIcon: MarkerIcon }).use(leftUi).mount('#left-app');
createApp(IconProtocolFixture, { appId: 'right', componentIcon: MarkerIcon }).use(rightUi).mount('#right-app');
const docsApp = createApp(IconProtocolsDemo);
docsApp.config.warnHandler = message => {
    control.docsVueWarnings.push(message);
    console.warn('[Vue warn] docs demo: ' + message);
};
docsApp.mount('#docs-demo-app');
control.ready = true;
`;

const fixtureSfc = `<script setup lang="ts">
import { defineComponent, h, onMounted, shallowReactive, nextTick, type Component } from 'vue';
import Icon from '/src/components/Icon.vue';
import UiButton from '/src/ui/UiButton.vue';
import UiInput from '/src/ui/UiInput.vue';
import UiCard from '/src/ui/UiCard.vue';
import UiPagination from '/src/ui/UiPagination.vue';
import UCarousel from '/src/ui/UCarousel.vue';
import UCarouselItem from '/src/ui/UCarouselItem.vue';
import UStepper from '/src/ui/UStepper.vue';
import UStepperItem from '/src/ui/UStepperItem.vue';
import UStepperVertical from '/src/ui/UStepperVertical.vue';
import UField from '/src/ui/UField.vue';
import UiSwitch from '/src/ui/UiSwitch.vue';
import UHotkey from '/src/ui/UHotkey.vue';

const props = defineProps<{ appId: string; componentIcon: Component }>();
const pathOne = 'M2 2h20v20H2z';
const pathTwo = 'M4 4h16v16H4z';
const pathArray = [pathOne, [pathTwo, 0.35]];
const explicitPath = 'M6 6h12v12H6z';
// Component definitions stored as icon values must remain raw Vue objects.
const state = shallowReactive({
    dynamicIcon: '$shared',
    clearValue: 'clear this value',
    page: 3,
    carousel: 'one',
    carouselDefault: 'one',
    horizontalStep: 1,
    verticalStep: 1,
    checked: true
});
const stepItems = [
    { title: 'Profile', value: 1, props: { icon: pathArray } },
    { title: 'Review', value: 2, props: { icon: '$shared' } }
];
const componentHotkeyMap = { ctrl: { default: { text: 'Control', icon: props.componentIcon } } };
const arrayHotkeyMap = { ctrl: { default: { text: 'Control', icon: pathArray } } };
function id(name: string) { return props.appId + '-' + name; }
onMounted(() => {
    const protocol = (window as any).__iconProtocol;
    protocol.apps[props.appId] = { state, flush: () => nextTick() };
});
</script>

<template>
    <main class="icon-protocol-root" :data-app="props.appId">
        <h2>{{ props.appId }} app</h2>
        <section class="protocol-section" :aria-label="props.appId + ' core icon values'">
            <Icon :id="id('shared-icon')" :icon="'$shared'" :size="24" label="Shared icon" />
            <Icon :id="id('layered-icon')" :icon="pathArray" :size="24" />
            <Icon :id="id('layered-alias')" :icon="'$layered'" :size="24" />
            <Icon :id="id('component-icon')" :icon="props.componentIcon" :size="18" />
            <Icon :id="id('component-alias')" :icon="'$componentAlias'" :size="18" />
            <Icon :id="id('forced-svg')" :icon="'svg:' + pathTwo" :size="18" />
            <Icon :id="id('icon-over-name')" name="copy" :icon="pathTwo" :size="18" />
            <Icon :id="id('path-over-icon')" name="copy" :icon="'$shared'" :path="explicitPath" :size="18" />
            <Icon :id="id('copy-direct')" icon="copy" :size="18" />
            <Icon :id="id('copy-alias')" :icon="'$copyAlias'" :size="18" />
            <Icon :id="id('icon-labeled')" :icon="'$shared'" label="Labeled icon" />
            <Icon :id="id('icon-decorative')" :icon="'$shared'" />
            <Icon :id="id('size18')" :icon="'$shared'" :size="18" />
            <Icon :id="id('size24')" :icon="'$shared'" :size="24" />
            <span :id="id('color-host')" class="protocol-color-host"><Icon :icon="'$shared'" :size="18" /></span>
            <Icon :id="id('dynamic-icon')" :icon="state.dynamicIcon" :size="24" />
            <Icon :id="id('custom-set-icon')" name="protocol:device" />
            <template v-if="props.appId === 'left'">
                <Icon :id="id('unknown-alias')" icon="$missingIcon" />
                <Icon :id="id('unknown-name')" name="u-protocol-unknown-name" />
                <Icon :id="id('circular-alias')" icon="$cycleA" />
            </template>
        </section>

        <section class="protocol-section" aria-label="Button icon props and slots">
            <UiButton :id="id('button-icon')" :icon="state.dynamicIcon" aria-label="Icon button" />
            <UiButton :id="id('button-direct-path')" :icon="pathOne" aria-label="Direct path icon button" />
            <UiButton :id="id('button-boolean')" icon aria-label="Boolean appearance only" />
            <UiButton icon aria-label="Boolean icon slot"><Icon :id="id('button-boolean-slot')" :icon="pathTwo" /></UiButton>
            <UiButton :id="id('button-slot-priority')" :icon="pathOne" aria-label="Default slot wins"><Icon :icon="pathTwo" /></UiButton>
            <UiButton :id="id('button-prepend-icon')" :prepend-icon="pathOne">Prepend icon</UiButton>
            <UiButton :id="id('button-append-icon')" :append-icon="pathTwo">Append icon</UiButton>
            <UiButton :id="id('button-prepend-slot')" :prepend-icon="pathOne"><template #prepend><span>Prepend slot wins</span></template>Button</UiButton>
            <UiButton :id="id('button-append-slot')" :append-icon="pathTwo"><template #append><span>Append slot wins</span></template>Button</UiButton>
        </section>

        <section class="protocol-section" aria-label="Input, card, field and switch icons">
            <div :id="id('input-host')">
                <UiInput v-model="state.clearValue" label="Clearable input" clearable :clear-icon="pathArray" />
            </div>
            <UiCard :id="id('card')" title="Card path array" :prepend-icon="pathArray">Card content</UiCard>
            <div :id="id('field')">
                <UField label="Field icons" active dirty clearable :clear-icon="pathOne" :prepend-inner-icon="'$shared'" :append-inner-icon="pathArray">
                    <template #default="{ props: inputProps }"><input v-bind="inputProps" aria-label="Field input" value="field value" /></template>
                </UField>
            </div>
            <div :id="id('switch')">
                <UiSwitch v-model="state.checked" :true-icon="'$shared'" :false-icon="pathArray" label="Switch icon" />
            </div>
        </section>

        <section class="protocol-section" aria-label="Pagination and carousel icons">
            <div :id="id('pagination')">
                <UiPagination
                    v-model="state.page"
                    :length="7"
                    :show-first-last-page="true"
                    :first-icon="props.appId === 'right' ? '$pageFirst' : undefined"
                    :last-icon="props.appId === 'right' ? '$pageLast' : undefined"
                    aria-label="Icon protocol pagination"
                />
            </div>
            <UCarousel :id="id('carousel')" v-model="state.carousel" :delimiter-icon="'$shared'" :show-arrows="false">
                <UCarouselItem value="one">Slide one</UCarouselItem>
                <UCarouselItem value="two">Slide two</UCarouselItem>
            </UCarousel>
            <UCarousel :id="id('carousel-default')" v-model="state.carouselDefault" :show-arrows="false">
                <UCarouselItem value="one">Default slide one</UCarouselItem>
                <UCarouselItem value="two">Default slide two</UCarouselItem>
            </UCarousel>
        </section>

        <section class="protocol-section protocol-stepper" aria-label="Stepper icon paths">
            <UStepperItem :id="id('stepper-standalone')" title="Standalone step" :value="1" :icon="pathArray" />
            <UStepper :id="id('stepper-horizontal')" v-model="state.horizontalStep" :items="stepItems" :hide-actions="true" />
            <UStepperVertical :id="id('stepper-vertical')" v-model="state.verticalStep" :items="stepItems" :hide-actions="true" />
        </section>

        <section class="protocol-section" aria-label="Hotkey component and path array icons">
            <UHotkey :id="id('hotkey-component')" keys="ctrl" display-mode="icon" platform="pc" :listen="false" :key-map="componentHotkeyMap" />
            <UHotkey :id="id('hotkey-array')" keys="ctrl" display-mode="icon" platform="pc" :listen="false" :key-map="arrayHotkeyMap" />
        </section>
    </main>
</template>`;

await writeFile(path.join(fixtureDirectory, 'index.html'), fixtureHtml, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), fixtureMain, 'utf8');
await writeFile(path.join(fixtureDirectory, 'IconProtocolFixture.vue'), fixtureSfc, 'utf8');

const report = {
    status: 'running',
    fixture: 'icon-protocols',
    method: 'Isolated Vite source fixture with direct SFC imports and headless Chrome; no project build.',
    startedAt: new Date().toISOString(),
    sourceFiles: targetSources,
    targetSourceSha256Before: sourceSha256Before,
    targetSourceSha256After: null,
    sourceHashesStable: null,
    screenshots: [],
    checks: [],
    expectedIconWarnings: [],
    vueWarnings: [],
    consoleWarnings: [],
    consoleErrors: [],
    pageErrors: [],
    httpErrors: [],
    requestFailures: [],
    failure: null,
    limits: [
        'Browser renderer only; no Electron renderer acceptance is claimed.',
        'Screenshots are evidence for Root visual review, not an independent CSS redesign.',
        'No full project build, full test suite, publish, or package operation is run.'
    ]
};

const record = (name, details) => report.checks.push({ name, details });
let viteServer;
let browser;
let page;

function getErrorDetails(error) {
    return {
        name: error instanceof Error ? error.name : 'Error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    };
}

async function getPathData(locator) {
    return locator.locator('svg path').evaluateAll(paths => paths.map(element => element.getAttribute('d')));
}

async function assertPathData(selector, expected) {
    const actual = await getPathData(page.locator(selector));
    assert.deepEqual(actual, expected, `${selector} renders expected SVG path data`);
    record('svg-paths', { selector, paths: actual });
    return actual;
}

async function saveScreenshot(name) {
    const file = path.join(evidence, name);
    await page.screenshot({ path: file, fullPage: true });
    report.screenshots.push(path.relative(root, file).replaceAll('\\', '/'));
}

async function settleVisualFrame() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

try {
    viteServer = await createServer({
        root,
        configFile: false,
        plugins: [vue()],
        appType: 'mpa',
        cacheDir: path.join(evidence, 'vite-cache'),
        resolve: { dedupe: ['vue'] },
        optimizeDeps: {
            noDiscovery: true,
            include: [
                'vue',
                '@mdi/js',
                '@vuetify/v0',
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
        server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
        logLevel: 'error'
    });

    await viteServer.listen();
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        const text = message.text();
        if (message.type() === 'error') report.consoleErrors.push(text);
        if (message.type() === 'warning') {
            if (text.startsWith('[UI icons]')) report.expectedIconWarnings.push(text);
            else if (/\[Vue warn\]/i.test(text)) report.vueWarnings.push(text);
            else report.consoleWarnings.push(text);
        }
    });
    page.on('response', response => {
        if (response.status() >= 400) report.httpErrors.push({ status: response.status(), url: response.url() });
    });
    page.on('requestfailed', request => report.requestFailures.push({
        url: request.url(),
        error: request.failure()?.errorText
    }));

    const address = viteServer.httpServer.address();
    assert.ok(address && typeof address === 'object' && 'port' in address, 'Vite binds an ephemeral local port');
    await page.goto(`http://127.0.0.1:${address.port}/artifacts/icon-protocols/fixture/index.html`);
    await page.waitForFunction(() => window.__iconProtocol?.ready === true);
    const docsDemoRoot = page.locator('#docs-demo-app [data-icon-protocol-demo]');
    assert.equal(await docsDemoRoot.count(), 1, 'the real icon protocol docs demo is mounted');
    const docsSvgCount = await docsDemoRoot.locator('svg').count();
    assert.ok(docsSvgCount >= 5, `the docs demo renders its path, array, component, alias, and button examples (${docsSvgCount} SVGs)`);
    assert.deepEqual(await page.evaluate(() => window.__iconProtocol.docsVueWarnings), [], 'the docs demo emits no Vue warnings');
    record('real-docs-icon-protocol-demo', { mounted: true, svgCount: docsSvgCount, vueWarnings: [] });
    await Promise.all([
        page.evaluate(() => window.__iconProtocol.themes.left.change('light')),
        page.evaluate(() => window.__iconProtocol.themes.right.change('light'))
    ]);
    await settleVisualFrame();
    await saveScreenshot('light-wide.png');
    await Promise.all([
        page.evaluate(() => window.__iconProtocol.themes.left.change('dark')),
        page.evaluate(() => window.__iconProtocol.themes.right.change('dark'))
    ]);
    await settleVisualFrame();
    await saveScreenshot('dark-wide.png');
    await Promise.all([
        page.evaluate(() => window.__iconProtocol.themes.left.change('light')),
        page.evaluate(() => window.__iconProtocol.themes.right.change('light'))
    ]);
    await page.setViewportSize({ width: 390, height: 844 });
    await settleVisualFrame();
    const narrowDocsMetrics = await page.evaluate(() => {
        const shell = document.querySelector('#docs-demo-shell');
        const demo = document.querySelector('#docs-demo-app [data-icon-protocol-demo]');
        if (!shell || !demo) throw new Error('The docs demo shell and root must remain mounted.');
        return {
            viewportWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            shellClientWidth: shell.clientWidth,
            shellScrollWidth: shell.scrollWidth,
            shellRight: shell.getBoundingClientRect().right,
            demoClientWidth: demo.clientWidth,
            demoScrollWidth: demo.scrollWidth,
            demoRight: demo.getBoundingClientRect().right
        };
    });
    assert.ok(narrowDocsMetrics.shellScrollWidth <= narrowDocsMetrics.shellClientWidth + 1, `docs demo shell has no horizontal overflow at 390px: ${JSON.stringify(narrowDocsMetrics)}`);
    assert.ok(narrowDocsMetrics.demoScrollWidth <= narrowDocsMetrics.demoClientWidth + 1, `docs demo content has no horizontal overflow at 390px: ${JSON.stringify(narrowDocsMetrics)}`);
    assert.ok(narrowDocsMetrics.shellRight <= narrowDocsMetrics.viewportWidth + 1, `docs demo stays inside the 390px viewport: ${JSON.stringify(narrowDocsMetrics)}`);
    assert.ok(narrowDocsMetrics.demoRight <= narrowDocsMetrics.viewportWidth + 1, `docs demo content stays inside the 390px viewport: ${JSON.stringify(narrowDocsMetrics)}`);
    assert.ok(narrowDocsMetrics.documentWidth <= narrowDocsMetrics.viewportWidth + 1, `the page has no horizontal overflow at 390px: ${JSON.stringify(narrowDocsMetrics)}`);
    record('docs-demo-narrow-overflow', narrowDocsMetrics);
    await saveScreenshot('light-narrow.png');
    await page.setViewportSize({ width: 1280, height: 1100 });
    await settleVisualFrame();
    record('visual-review-screenshots', report.screenshots.slice());

    const leftCopySource = await readFile(path.join(root, 'src/assets/icons/copy.svg'), 'utf8');
    const fileIconSource = await readFile(path.join(root, 'src/assets/icons/file.svg'), 'utf8');
    const copyAssetPaths = pathDataFromSource(leftCopySource);
    const fileAssetPaths = pathDataFromSource(fileIconSource);

    await assertPathData('#left-shared-icon', [pathOne]);
    await assertPathData('#right-shared-icon', [pathTwo]);
    record('same-alias-is-app-scoped', { alias: '$shared', left: pathOne, right: pathTwo });

    await assertPathData('#left-layered-icon', [pathOne, pathTwo]);
    assert.equal(await page.locator('#left-layered-icon svg path').nth(1).getAttribute('fill-opacity'), '0.35');
    await assertPathData('#left-layered-alias', [pathOne, pathTwo]);
    assert.equal(await page.locator('#left-layered-alias svg path').nth(1).getAttribute('fill-opacity'), '0.35');
    record('path-array-opacity', { opacity: '0.35', directAndAlias: true });

    await assertPathData('#left-icon-over-name', [pathTwo]);
    await assertPathData('#left-path-over-icon', ['M6 6h12v12H6z']);
    await assertPathData('#left-forced-svg', [pathTwo]);
    record('legacy-path-icon-name-precedence', { precedence: ['path', 'icon', 'name'], svgPrefix: true });

    const leftComponentMarker = page.locator('#left-component-icon .protocol-component-marker');
    const leftAliasMarker = page.locator('#left-component-alias .protocol-component-marker');
    assert.equal(await leftComponentMarker.count(), 1, 'a direct Vue component IconValue is rendered');
    assert.equal(await leftAliasMarker.count(), 1, 'a component alias is rendered');
    const customSet = page.locator('#left-custom-set-icon .protocol-custom-set-renderer');
    assert.equal(await customSet.evaluate(element => element.tagName), 'SPAN');
    assert.equal(await customSet.getAttribute('data-received-tag'), 'span');
    assert.equal(await customSet.getAttribute('data-rendered-icon'), customSetPath);
    record('component-and-custom-renderers', { componentAlias: true, customRendererReceivesIcon: customSetPath, tag: 'span' });

    assert.ok(copyAssetPaths.length > 0, 'copy.svg contains path geometry');
    assert.notDeepEqual(copyAssetPaths, fileAssetPaths, 'copy.svg and file.svg are distinct local assets');
    await assertPathData('#left-copy-direct', copyAssetPaths);
    await assertPathData('#left-copy-alias', copyAssetPaths);
    assert.equal(
        await page.locator('#left-copy-direct').evaluate(element => element.innerHTML),
        await page.locator('#left-copy-alias').evaluate(element => element.innerHTML),
        'a local icon name and an alias to it render identically'
    );
    record('local-copy-alias-equivalence', { pathCount: copyAssetPaths.length, fallsBackToFile: false });

    for (const unknownId of ['unknown-alias', 'unknown-name', 'circular-alias']) {
        const emptyIcon = page.locator(`#left-${unknownId}`);
        assert.equal(await emptyIcon.evaluate(element => element.childElementCount), 0, `${unknownId} renders no fallback icon`);
        assert.equal(await emptyIcon.textContent(), '', `${unknownId} renders no fallback text`);
    }
    assert.equal(report.expectedIconWarnings.length, 3, JSON.stringify(report.expectedIconWarnings, null, 2));
    assert.ok(report.expectedIconWarnings.some(message => message.includes('Unknown icon alias "$missingIcon"')));
    assert.ok(report.expectedIconWarnings.some(message => message.includes('Unknown legacy icon name "u-protocol-unknown-name"')));
    assert.ok(report.expectedIconWarnings.some(message => message.includes('Circular icon alias "cycleA"')));
    record('expected-development-icon-warnings', report.expectedIconWarnings);

    const booleanButton = page.locator('#left-button-boolean');
    assert.match(await booleanButton.getAttribute('class') ?? '', /is-icon/);
    assert.equal(await booleanButton.locator('svg').count(), 0, 'boolean icon only applies icon button styling');
    await assertPathData('#left-button-boolean-slot', [pathTwo]);
    await assertPathData('#left-button-slot-priority', [pathTwo]);
    await assertPathData('#left-button-icon', [pathOne]);
    await assertPathData('#left-button-direct-path', [pathOne]);
    await assertPathData('#left-button-prepend-icon', [pathOne]);
    await assertPathData('#left-button-append-icon', [pathTwo]);
    assert.equal(await page.locator('#left-button-prepend-slot svg').count(), 0, 'prepend slot takes precedence over prependIcon');
    assert.match((await page.locator('#left-button-prepend-slot').innerText()).trim(), /Prepend slot wins/, 'prepend slot content is present');
    assert.equal(await page.locator('#left-button-append-slot svg').count(), 0, 'append slot takes precedence over appendIcon');
    assert.match((await page.locator('#left-button-append-slot').innerText()).trim(), /Append slot wins/, 'append slot content is present');
    record('button-icon-protocol', { booleanStyle: true, defaultSlotPriority: true, prependAppendSlots: true });

    await assertPathData('#left-input-host .u-input-clear', [pathOne, pathTwo]);
    const input = page.locator('#left-input-host input');
    await input.fill('clear me now');
    await page.locator('#left-input-host .u-input-clear').click();
    assert.equal(await input.inputValue(), '', 'the clear icon button performs the clear action');
    record('input-clear-icon-click', { cleared: true });

    await assertPathData('#left-card .ui-card-prepend', [pathOne, pathTwo]);
    await assertPathData('#left-field', [pathOne, pathOne, pathOne, pathTwo]);
    await assertPathData('#left-switch .ui-switch-thumb', [pathOne]);
    await page.evaluate(async () => {
        const control = window.__iconProtocol.apps.left;
        control.state.checked = false;
        await control.flush();
    });
    await assertPathData('#left-switch .ui-switch-thumb', [pathOne, pathTwo]);
    record('card-field-switch-icons', { cardPathArray: true, fieldIconCount: 3, switchUpdatesBetweenIcons: true });

    const leftPaginationButtons = page.locator('#left-pagination .ui-button');
    assert.ok(await leftPaginationButtons.count() >= 5, 'pagination renders first, previous, page, next, and last controls');
    const leftButtonCount = await leftPaginationButtons.count();
    assert.deepEqual(await getPathData(leftPaginationButtons.first()), [mdiPageFirst], 'default first-page alias renders mdiPageFirst');
    assert.deepEqual(await getPathData(leftPaginationButtons.nth(leftButtonCount - 1)), [mdiPageLast], 'default last-page alias renders mdiPageLast');
    const rightPaginationButtons = page.locator('#right-pagination .ui-button');
    const rightButtonCount = await rightPaginationButtons.count();
    const rtlFirstPaths = await getPathData(rightPaginationButtons.first());
    const rtlLastPaths = await getPathData(rightPaginationButtons.nth(rightButtonCount - 1));
    assert.deepEqual(rtlFirstPaths, [pathTwo], 'RTL first-page control uses the configured last icon');
    assert.deepEqual(rtlLastPaths, [pathOne], 'RTL last-page control uses the configured first icon');
    await assertPathData('#left-carousel .u-carousel-dot', [pathOne, pathOne]);
    await assertPathData('#right-carousel .u-carousel-dot', [pathTwo, pathTwo]);
    await assertPathData('#left-carousel-default .u-carousel-dot', [mdiCircle, mdiCircle]);
    await assertPathData('#right-carousel-default .u-carousel-dot', [mdiCircle, mdiCircle]);
    record('pagination-rtl-and-carousel-alias', { defaultFirst: mdiPageFirst, defaultLast: mdiPageLast, rtlFirst: pathTwo, rtlLast: pathOne, defaultDelimiter: mdiCircle, appScopedDelimiter: true });

    for (const [selector, expectedPaths] of [
        ['#left-stepper-standalone', [pathOne, pathTwo]],
        ['#left-stepper-horizontal', [pathOne, pathTwo, pathOne]],
        ['#left-stepper-vertical', [pathOne, pathTwo, pathOne]]
    ]) {
        await assertPathData(selector, expectedPaths);
        const text = await page.locator(selector).innerText();
        assert.ok(!text.includes(pathOne) && !text.includes(pathTwo), `${selector} does not expose the SVG path as text`);
    }
    record('stepper-icon-rendering', { standalone: [pathOne, pathTwo], horizontalItems: [pathOne, pathTwo, pathOne], verticalItems: [pathOne, pathTwo, pathOne], pathText: false });

    assert.equal(await page.locator('#left-hotkey-component .protocol-component-marker').count(), 1, 'Hotkey renders a custom component icon');
    await assertPathData('#left-hotkey-array .u-hotkey-key', [pathOne, pathTwo]);
    record('hotkey-custom-icon-values', { component: true, pathArray: true });

    for (const [selector, expectedSize] of [['#left-size18 svg', 18], ['#left-size24 svg', 24]]) {
        const bounds = await page.locator(selector).evaluate(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return { width: rect.width, height: rect.height, display: style.display, visibility: style.visibility };
        });
        assert.ok(bounds.width > 0 && bounds.height > 0, `${selector} has visible bounds`);
        assert.ok(Math.abs(bounds.width - expectedSize) <= 1, `${selector} width is ${expectedSize}px: ${JSON.stringify(bounds)}`);
        assert.ok(Math.abs(bounds.height - expectedSize) <= 1, `${selector} height is ${expectedSize}px: ${JSON.stringify(bounds)}`);
        assert.notEqual(bounds.display, 'none');
        assert.notEqual(bounds.visibility, 'hidden');
        record('icon-visible-bounds', { selector, expectedSize, bounds });
    }
    assert.equal(
        await page.locator('#left-color-host svg').evaluate(element => getComputedStyle(element).color),
        'rgb(13, 74, 100)',
        'an SVG icon inherits its current text color'
    );
    assert.equal(await page.locator('#left-icon-labeled').getAttribute('role'), 'img');
    assert.equal(await page.locator('#left-icon-labeled').getAttribute('aria-label'), 'Labeled icon');
    assert.equal(await page.locator('#left-icon-labeled').getAttribute('aria-hidden'), null);
    assert.equal(await page.locator('#left-icon-decorative').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.locator('#left-icon-decorative svg').getAttribute('aria-hidden'), 'true');
    record('icon-color-and-accessibility', { inheritedColor: 'rgb(13, 74, 100)', labeledRole: 'img', decorativeHidden: true });

    const updatePathA = 'M8 8h8v8H8z';
    const updatePathB = 'M10 10h4v4h-4z';
    await page.evaluate(async ({ first, second }) => {
        const control = window.__iconProtocol.apps.left;
        control.state.dynamicIcon = [first, [second, 0.2]];
        await control.flush();
    }, { first: updatePathA, second: updatePathB });
    await assertPathData('#left-dynamic-icon', [updatePathA, updatePathB]);
    await assertPathData('#left-button-icon', [updatePathA, updatePathB]);
    await page.evaluate(async () => {
        const control = window.__iconProtocol.apps.left;
        control.state.dynamicIcon = window.__iconProtocol.markers.componentIcon;
        await control.flush();
    });
    assert.equal(await page.locator('#left-dynamic-icon .protocol-component-marker').count(), 1);
    assert.equal(await page.locator('#left-button-icon .protocol-component-marker').count(), 1);
    await assertPathData('#right-dynamic-icon', [pathTwo]);
    await assertPathData('#right-button-icon', [pathTwo]);
    record('dynamic-icon-prop-updates', { pathArray: true, component: true, rightAppAliasUnaffected: pathTwo });

    assert.deepEqual(report.vueWarnings, [], JSON.stringify(report.vueWarnings, null, 2));
    assert.deepEqual(report.consoleWarnings, [], JSON.stringify(report.consoleWarnings, null, 2));
    assert.deepEqual(report.consoleErrors, [], JSON.stringify(report.consoleErrors, null, 2));
    assert.deepEqual(report.pageErrors, [], JSON.stringify(report.pageErrors, null, 2));
    assert.deepEqual(report.httpErrors, [], JSON.stringify(report.httpErrors, null, 2));
    assert.deepEqual(report.requestFailures, [], JSON.stringify(report.requestFailures, null, 2));

    report.targetSourceSha256After = await hashFiles(targetSources);
    report.sourceHashesStable = JSON.stringify(report.targetSourceSha256Before) === JSON.stringify(report.targetSourceSha256After);
    assert.deepEqual(
        report.targetSourceSha256After,
        report.targetSourceSha256Before,
        'target source hashes stayed stable during Chromium verification'
    );
    report.status = 'passed';
    record('source-hash-stability', { files: targetSources.length, stable: true });
} catch (error) {
    report.status = 'failed';
    report.failure = getErrorDetails(error);
    throw error;
} finally {
    if (browser) await browser.close();
    if (viteServer) await viteServer.close();

    if (!report.targetSourceSha256After) {
        try {
            report.targetSourceSha256After = await hashFiles(targetSources);
            report.sourceHashesStable = JSON.stringify(report.targetSourceSha256Before) === JSON.stringify(report.targetSourceSha256After);
        } catch (error) {
            report.sourceHashError = getErrorDetails(error);
            report.status = 'failed';
        }
    }
    if (report.status === 'running') report.status = 'failed';
    report.finishedAt = new Date().toISOString();
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (report.status === 'passed') {
    console.log(`icon protocols: ${report.checks.length} checks passed; screenshots saved to ${path.relative(root, evidence)}`);
} else {
    console.error(`icon protocols: failed; detailed report saved to ${path.relative(root, reportPath)}`);
}
