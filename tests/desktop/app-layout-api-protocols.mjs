import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/app-layout-api-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const sources = [
    'src/ui/UApp.vue',
    'src/ui/ULayout.vue',
    'src/ui/UAppBar.vue',
    'src/ui/USystemBar.vue',
    'src/ui/UFooter.vue',
    'src/ui/UBottomNavigation.vue',
    'src/ui/UNavigationDrawer.vue',
    'src/ui/UiSpacer.vue',
    'src/ui/layout-completion.ts',
    'src/ui/dimensions.ts',
    'src/ui/index.ts',
    'src/ui/styles.css',
    'src/ui/layout-components.css',
    'tests/desktop/app-layout-api-protocols.mjs',
    'tests/tsconfig.app-layout-api.json'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(sources.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const sourceSha256Before = await hashSources();
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" href="data:,"><title>App layout API protocols</title></head>
<body><div id="app"></div><script type="module" src="/artifacts/full-alignment/app-layout-api-protocols/fixture/main.ts"></script></body></html>`;

const main = `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import AppLayoutApiFixture from './AppLayoutApiFixture.vue';
import '/src/ui/styles.css';

const app = createApp(AppLayoutApiFixture);
app.use(createUI({ locale: { locale: 'en' } }));
app.mount('#app');
window.appLayoutApi = { app };
`;

const fixture = `<script setup>
import { reactive, ref } from 'vue';
import {
    UApp, UAppBar, UBottomNavigation, UFooter, ULayout,
    UNavigationDrawer, USpacer, USystemBar
} from '/src/ui/index.ts';

const state = reactive({
    chromeMounted: true,
    layoutItemMounted: true,
    appBarHeight: 50,
    systemCustomHeight: '38px',
    footerHeight: 44,
    footerApp: true,
    unreservedFooterHeight: 70,
    bottomHeight: 56,
    drawerWidth: 100
});
const refs = {
    app: ref(),
    shortApp: ref(),
    layout: ref(),
    systemWindow: ref(),
    systemNormal: ref(),
    systemCustom: ref(),
    drawer: ref(),
    bottom: ref(),
    appbar: ref(),
    footer: ref(),
    freeFooter: ref(),
    layoutDrawer: ref()
};
window.appLayoutApiFixture = { state, refs };
</script>

<template>
    <UApp :ref="refs.app" id="public-app" tag="main" theme="dark">
        <template v-if="state.chromeMounted">
            <USystemBar :ref="refs.systemWindow" id="system-window" name="system-window" window order="0">Window status</USystemBar>
            <USystemBar :ref="refs.systemNormal" id="system-normal" name="system-normal" order="1">Normal status</USystemBar>
            <USystemBar :ref="refs.systemCustom" id="system-custom" name="system-custom" :height="state.systemCustomHeight" order="2">Custom status</USystemBar>
            <UNavigationDrawer :ref="refs.drawer" id="named-drawer" name="named-drawer" location="left" :width="state.drawerWidth" order="3">Drawer</UNavigationDrawer>
            <UBottomNavigation :ref="refs.bottom" id="named-bottom" name="named-bottom" :height="state.bottomHeight" order="4" fixed label="Bottom controls">Bottom</UBottomNavigation>
            <UAppBar :ref="refs.appbar" id="named-appbar" name="named-appbar" :height="state.appBarHeight" order="10">App bar</UAppBar>
            <UFooter :ref="refs.footer" id="named-footer" name="named-footer" :height="state.footerHeight" :app="state.footerApp" order="10">Reserved footer</UFooter>
            <UFooter :ref="refs.freeFooter" id="unreserved-footer" name="unreserved-footer" :height="state.unreservedFooterHeight" :app="false" order="12">Unreserved footer</UFooter>
        </template>

        <USpacer id="spacer-content" tag="section">Accessible spacer content</USpacer>
        <USpacer id="spacer-empty" tag="aside" />

        <UApp :ref="refs.shortApp" id="short-app" tag="section" theme="light" :full-height="false" />
        <ULayout
            :ref="refs.layout"
            id="public-layout"
            tag="article"
            width="80%"
            :min-width="220"
            :max-width="800"
            :height="380"
            :min-height="200"
            max-height="60vh"
            :full-height="true"
        >
            <UNavigationDrawer
                v-if="state.layoutItemMounted"
                :ref="refs.layoutDrawer"
                id="layout-drawer"
                name="layout-drawer"
                location="start"
                :width="77"
                permanent
            >Nested layout drawer</UNavigationDrawer>
        </ULayout>
    </UApp>
</template>`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
await writeFile(path.join(fixtureDirectory, 'AppLayoutApiFixture.vue'), fixture, 'utf8');

const report = {
    fixture: 'app-layout-api-protocols',
    method: 'Mounts the actual public App/Layout/chrome components from src/ui/index.ts in Chromium and checks their exposed layout API and DOM offsets.',
    sourceSha256Before,
    checks: [],
    contractMismatches: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    visualAcceptance: false,
    limits: ['Focused public API/runtime acceptance only; no CSS or visual appearance changes are made.']
};
function noteMismatch(contract, actual, expected, selector) {
    if (actual !== expected) report.contractMismatches.push({ contract, actual, expected, selector });
}
const vite = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/full-alignment/app-layout-api-protocols/fixture/main.ts'],
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
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    logLevel: 'error'
});

let browser;
try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.consoleWarnings.push(message.text());
    });
    page.on('response', response => {
        if (response.status() >= 400) report.httpErrors.push({ status: response.status(), url: response.url() });
    });
    page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto('http://127.0.0.1:' + vite.httpServer.address().port + '/artifacts/full-alignment/app-layout-api-protocols/fixture/index.html');
    await page.waitForFunction(() => !!window.appLayoutApiFixture && !!window.appLayoutApi);
    await page.waitForFunction(() => {
        const app = window.appLayoutApiFixture.refs.app.value;
        return app.getLayoutItem('system-window')?.size === document.querySelector('#system-window').offsetHeight
            && app.getLayoutItem('system-normal')?.size === document.querySelector('#system-normal').offsetHeight
            && app.getLayoutItem('system-custom')?.size === document.querySelector('#system-custom').offsetHeight
            && app.getLayoutItem('named-appbar')?.size === document.querySelector('#named-appbar').offsetHeight
            && app.getLayoutItem('named-footer')?.size === document.querySelector('#named-footer').offsetHeight
            && app.getLayoutItem('named-bottom')?.size === document.querySelector('#named-bottom').offsetHeight
            && document.querySelector('#named-appbar .ui-toolbar-content').style.height === '50px'
            && document.querySelector('#system-custom').style.minHeight === '38px'
            && document.querySelector('#named-footer').style.minHeight === '44px'
            && document.querySelector('#named-bottom').style.minHeight === '56px';
    });

    const appBasics = await page.evaluate(() => {
        const refs = window.appLayoutApiFixture.refs;
        const app = refs.app.value;
        const layout = refs.layout.value;
        const shortApp = refs.shortApp.value.element;
        const nested = refs.layoutDrawer.value;
        return {
            appTag: app.element.tagName,
            appClass: app.element.classList.contains('is-full-height'),
            appThemeName: app.element.getAttribute('data-ui-theme'),
            appThemeMode: app.element.getAttribute('data-theme'),
            appHasMethods: typeof app.getLayoutItem === 'function' && Array.isArray(app.items),
            nestedAppTag: shortApp.tagName,
            nestedAppFullHeight: shortApp.classList.contains('is-full-height'),
            nestedAppMinHeight: getComputedStyle(shortApp).minHeight,
            layoutTag: layout.element.tagName,
            layoutFullHeight: layout.element.classList.contains('is-full-height'),
            layoutStyle: {
                width: layout.element.style.width,
                minWidth: layout.element.style.minWidth,
                maxWidth: layout.element.style.maxWidth,
                height: layout.element.style.height,
                minHeight: layout.element.style.minHeight,
                maxHeight: layout.element.style.maxHeight
            },
            appExposedRect: app.mainRect,
            appExposedItems: app.items.length,
            appDrawerQuery: app.getLayoutItem('named-drawer')?.id,
            layoutExposedRect: layout.mainRect,
            layoutExposedItems: layout.items.length,
            layoutDrawerQuery: layout.getLayoutItem('layout-drawer')?.id,
            nestedDrawerRef: nested.element.id
        };
    });
    console.log('App/Layout initial snapshot: ' + JSON.stringify(appBasics));
    assert.equal(appBasics.appTag, 'MAIN');
    assert.equal(appBasics.appClass, true, 'UApp fullHeight defaults to true');
    assert.equal(appBasics.appThemeName, 'dark');
    assert.equal(appBasics.appThemeMode, 'dark');
    assert.equal(appBasics.appHasMethods, true, 'UApp exposes live layout items and query methods');
    assert.equal(appBasics.nestedAppTag, 'SECTION');
    assert.equal(appBasics.nestedAppFullHeight, false, 'explicit fullHeight=false removes the full-height class');
    assert.equal(appBasics.nestedAppMinHeight, '0px');
    assert.equal(appBasics.layoutTag, 'ARTICLE');
    assert.equal(appBasics.layoutFullHeight, true);
    assert.deepEqual(appBasics.layoutStyle, {
        width: '80%',
        minWidth: '220px',
        maxWidth: '800px',
        height: '380px',
        minHeight: '200px',
        maxHeight: '60vh'
    });
    assert.equal(appBasics.appDrawerQuery, 'named-drawer');
    assert.equal(appBasics.layoutDrawerQuery, 'layout-drawer');
    assert.equal(appBasics.nestedDrawerRef, 'layout-drawer');
    assert.equal(appBasics.layoutExposedItems, 1);
    assert.equal(appBasics.layoutExposedRect.left, 77);
    report.checks.push('UApp/ULayout custom tags, theme/fullHeight defaults, dimensions, refs and exposed layout APIs');

    const spacers = await page.evaluate(() => ['spacer-content', 'spacer-empty'].map(id => {
        const element = document.getElementById(id);
        return { tag: element.tagName, ariaHidden: element.getAttribute('aria-hidden'), text: element.textContent.trim() };
    }));
    assert.deepEqual(spacers, [
        { tag: 'SECTION', ariaHidden: null, text: 'Accessible spacer content' },
        { tag: 'ASIDE', ariaHidden: 'true', text: '' }
    ]);
    report.checks.push('USpacer custom tag and accessible-content/empty aria-hidden behavior');

    const layoutBefore = await page.evaluate(() => {
        const app = window.appLayoutApiFixture.refs.app.value;
        const ids = app.items.map(item => item.id);
        const topSizes = ['system-window', 'system-normal', 'system-custom', 'named-appbar'].map(name => app.getLayoutItem(name).size);
        const bottomNav = app.getLayoutItem('named-bottom');
        const footer = app.getLayoutItem('named-footer');
        const freeFooter = app.getLayoutItem('unreserved-footer');
        return {
            ids,
            topSizes,
            bottom: app.mainRect.bottom,
            drawer: app.getLayoutItem('named-drawer'),
            appbarBeforeFooter: ids.indexOf('named-appbar') < ids.indexOf('named-footer'),
            bottomNavSize: bottomNav.size,
            bottomNavDomHeight: document.querySelector('#named-bottom').offsetHeight,
            bottomNavMinHeight: document.querySelector('#named-bottom').style.minHeight,
            bottomNavBorderTop: getComputedStyle(document.querySelector('#named-bottom')).borderTopWidth,
            footerSize: footer.size,
            freeFooterSize: freeFooter.size,
            footerOffset: footer.bottom,
            freeFooterOffset: freeFooter.bottom,
            systemStyles: {
                windowMinHeight: document.querySelector('#system-window').style.minHeight,
                normalMinHeight: document.querySelector('#system-normal').style.minHeight,
                customMinHeight: document.querySelector('#system-custom').style.minHeight
            },
            domHeights: {
                window: document.querySelector('#system-window').offsetHeight,
                normal: document.querySelector('#system-normal').offsetHeight,
                custom: document.querySelector('#system-custom').offsetHeight
            },
            footerFixed: document.querySelector('#named-footer').classList.contains('is-fixed'),
            freeFooterFixed: document.querySelector('#unreserved-footer').classList.contains('is-fixed'),
            drawerStyle: {
                top: document.querySelector('#named-drawer').style.top,
                bottom: document.querySelector('#named-drawer').style.bottom,
                left: document.querySelector('#named-drawer').style.left
            },
            mainRect: app.mainRect
        };
    });
    console.log('App/Layout item snapshot: ' + JSON.stringify(layoutBefore));
    assert.deepEqual(layoutBefore.ids, ['system-window', 'system-normal', 'system-custom', 'named-drawer', 'named-bottom', 'named-appbar', 'named-footer', 'unreserved-footer']);
    assert.equal(layoutBefore.appbarBeforeFooter, true, 'equal string orders remain stable in mount order');
    assert.deepEqual(layoutBefore.systemStyles, { windowMinHeight: '32px', normalMinHeight: '24px', customMinHeight: '38px' });
    assert.equal(layoutBefore.topSizes[0], layoutBefore.domHeights.window, 'window SystemBar reserves its measured outer height');
    assert.equal(layoutBefore.topSizes[1], layoutBefore.domHeights.normal, 'normal SystemBar reserves its measured outer height');
    assert.equal(layoutBefore.topSizes[2], layoutBefore.domHeights.custom, 'string-height SystemBar reserves its measured outer height');
    assert.equal(layoutBefore.footerFixed, true, 'app=true attaches the footer to layout and fixed positioning');
    assert.equal(layoutBefore.freeFooterFixed, false, 'app=false leaves the footer unreserved and non-fixed');
    noteMismatch('BottomNavigation reserves its measured outer DOM height', layoutBefore.bottomNavSize, layoutBefore.bottomNavDomHeight, '#named-bottom');
    assert.equal(layoutBefore.mainRect.bottom, layoutBefore.bottomNavSize + layoutBefore.footerSize, 'app=true footer and active bottom navigation reserve their measured heights');
    assert.ok(layoutBefore.freeFooterSize > 0, 'app=false footer remains queryable even though it is not reserved');
    assert.equal(layoutBefore.freeFooterOffset, layoutBefore.mainRect.bottom, 'unreserved footer does not add another bottom offset');
    assert.equal(layoutBefore.drawer.position, 'left');
    assert.equal(layoutBefore.drawer.size, 100);
    assert.equal(layoutBefore.drawerStyle.left, '0px');
    assert.equal(layoutBefore.drawerStyle.top, layoutBefore.mainRect.top + 'px', 'drawer starts below all active top layout items');
    assert.equal(layoutBefore.drawerStyle.bottom, layoutBefore.mainRect.bottom + 'px', 'drawer stops above all active bottom layout items');
    assert.equal(layoutBefore.drawerStyle.left, layoutBefore.drawer.left + 'px');
    noteMismatch('Drawer bottom offset covers actual active bottom chrome', Number.parseFloat(layoutBefore.drawerStyle.bottom), layoutBefore.bottomNavDomHeight + layoutBefore.footerSize, '#named-drawer');
    report.checks.push('named layout registration/query, stable string ordering, SystemBar sizes, Footer reservation and legacy drawer cross-edge geometry');
    await page.evaluate(initialSize => { window.appLayoutApiFixture.initialAppBarSize = initialSize; }, layoutBefore.topSizes[3]);

    await page.evaluate(() => {
        const state = window.appLayoutApiFixture.state;
        state.appBarHeight = 64;
        state.systemCustomHeight = '42px';
        state.footerHeight = 54;
        state.bottomHeight = 72;
        state.drawerWidth = 132;
    });
    await page.waitForFunction(() => {
        const refs = window.appLayoutApiFixture.refs;
        const app = refs.app.value;
        return app.getLayoutItem('named-appbar')?.size > window.appLayoutApiFixture.initialAppBarSize
            && document.querySelector('#named-appbar').offsetHeight > window.appLayoutApiFixture.initialAppBarSize
            && app.getLayoutItem('named-appbar')?.size === document.querySelector('#named-appbar').offsetHeight
            && app.getLayoutItem('system-custom')?.size === document.querySelector('#system-custom').offsetHeight
            && app.getLayoutItem('named-footer')?.size === document.querySelector('#named-footer').offsetHeight
            && app.getLayoutItem('named-bottom')?.size === document.querySelector('#named-bottom').offsetHeight
            && document.querySelector('#named-appbar .ui-toolbar-content').style.height === '64px'
            && document.querySelector('#system-custom').style.minHeight === '42px'
            && document.querySelector('#named-footer').style.minHeight === '54px'
            && document.querySelector('#named-bottom').style.minHeight === '72px'
            && app.getLayoutItem('named-drawer')?.size === 132;
    });
    const updated = await page.evaluate(() => {
        const app = window.appLayoutApiFixture.refs.app.value;
        return {
            appbar: app.getLayoutItem('named-appbar').size,
            appbarDomHeight: document.querySelector('#named-appbar').offsetHeight,
            appbarContentHeight: window.appLayoutApiFixture.refs.appbar.value.contentHeight,
            appbarToolbarHeight: document.querySelector('#named-appbar .ui-toolbar').offsetHeight,
            appbarToolbarContentHeight: document.querySelector('#named-appbar .ui-toolbar-content').offsetHeight,
            systemCustom: app.getLayoutItem('system-custom').size,
            footer: app.getLayoutItem('named-footer').size,
            bottom: app.getLayoutItem('named-bottom').size,
            bottomDomHeight: document.querySelector('#named-bottom').offsetHeight,
            bottomMinHeight: document.querySelector('#named-bottom').style.minHeight,
            bottomBorderTop: getComputedStyle(document.querySelector('#named-bottom')).borderTopWidth,
            footerDomHeight: document.querySelector('#named-footer').offsetHeight,
            drawer: app.getLayoutItem('named-drawer').size,
            mainRect: app.mainRect,
            drawerStyle: {
                top: document.querySelector('#named-drawer').style.top,
                bottom: document.querySelector('#named-drawer').style.bottom
            }
        };
    });
    console.log('App/Layout updated snapshot: ' + JSON.stringify(updated));
    assert.ok(updated.appbar > layoutBefore.topSizes[3]);
    assert.ok(updated.systemCustom > layoutBefore.topSizes[2]);
    assert.ok(updated.footer > layoutBefore.footerSize);
    assert.ok(updated.bottom > layoutBefore.bottomNavSize);
    assert.equal(updated.drawer, 132);
    assert.equal(updated.drawerStyle.top, updated.mainRect.top + 'px');
    assert.equal(updated.drawerStyle.bottom, updated.mainRect.bottom + 'px');
    noteMismatch('updated BottomNavigation reserves its measured outer DOM height', updated.bottom, updated.bottomDomHeight, '#named-bottom');
    noteMismatch('updated Drawer bottom offset covers actual active bottom chrome', Number.parseFloat(updated.drawerStyle.bottom), updated.bottomDomHeight + updated.footerDomHeight, '#named-drawer');
    report.checks.push('reactive named AppBar/SystemBar/Footer/BottomNavigation/Drawer updates feed live offsets and DOM positioning');

    await page.evaluate(() => { window.appLayoutApiFixture.state.footerApp = false; });
    await page.waitForFunction(() => !document.querySelector('#named-footer').classList.contains('is-fixed'));
    const footerOff = await page.evaluate(() => {
        const app = window.appLayoutApiFixture.refs.app.value;
        return {
            bottom: app.mainRect.bottom,
            expected: app.getLayoutItem('named-bottom').size,
            footerSize: app.getLayoutItem('named-footer').size,
            footerOffset: app.getLayoutItem('named-footer').bottom
        };
    });
    assert.equal(footerOff.bottom, footerOff.expected, 'app=false stops reserving the footer size');
    assert.ok(footerOff.footerSize > 0);
    assert.equal(footerOff.footerOffset, footerOff.expected);
    report.checks.push('changing Footer app from true to false removes only its measured reservation');

    await page.evaluate(() => {
        window.appLayoutApiFixture.state.chromeMounted = false;
        window.appLayoutApiFixture.state.layoutItemMounted = false;
    });
    await page.waitForFunction(() => {
        const refs = window.appLayoutApiFixture.refs;
        const app = refs.app.value;
        const layout = refs.layout.value;
        return app.items.length === 0 && layout.items.length === 0
            && app.mainRect.top === 0 && app.mainRect.right === 0 && app.mainRect.bottom === 0 && app.mainRect.left === 0
            && layout.mainRect.left === 0 && app.getLayoutItem('named-appbar') === undefined
            && layout.getLayoutItem('layout-drawer') === undefined;
    });
    report.checks.push('named layout registrations and exposed geometry are removed on unmount');

    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.consoleWarnings, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.requestFailures, []);
    report.sourceSha256After = await hashSources();
    assert.deepEqual(report.sourceSha256After, sourceSha256Before, 'product, test and tsconfig source hashes remain stable during browser checks');
    report.sourcesUnchanged = true;
    await page.screenshot({ path: path.join(evidence, 'app-layout-api.png'), fullPage: true });
    report.screenshots = ['app-layout-api.png'];
    assert.deepEqual(report.contractMismatches, [], 'all named vertical layout items reserve their actual outer DOM height');
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log('app layout API protocols: ' + report.checks.length + ' groups passed');
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    report.sourceSha256After = await hashSources();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    throw error;
} finally {
    if (browser) await browser.close();
    await vite.close();
}
