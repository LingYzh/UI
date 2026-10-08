import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/locale-consumers');
await mkdir(evidence, { recursive: true });
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixtureScript = [
    'import { createApp, h, nextTick, ref } from "vue";',
    'import * as UI from "/src/ui/index.ts";',
    'import LocaleProviderDemo from "/src/ui/docs/component-examples/locale-provider.vue";',
    'import "/src/docs-base.css";',
    'import "/src/ui/styles.css";',
    '',
    'const scopedMessages = {',
    '    en: {',
    '        pagination: { label: "Scoped pagination", previous: "Scoped previous", next: "Scoped next", page: "Scoped page {page}", tokenLabel: "Explicit token pagination", tokenPrevious: "Explicit token previous" },',
    '        hotkey: { label: "Shortcut {keys}", separator: { combination: ", ", or: "OR EN", then: "THEN EN" }, ctrl: "Control EN", meta: "Meta EN", shift: "Shift EN" }',
    '    },',
    '    zh: {',
    '        pagination: { label: "父级分页", previous: "父级上一页", next: "父级下一页", page: "父级第 {page} 页", tokenLabel: "父级令牌分页", tokenPrevious: "父级令牌上一页" },',
    '        hotkey: { label: "父级快捷键 {keys}", separator: { combination: "，", or: "或", then: "然后" }, ctrl: "控制键", meta: "命令键", shift: "Shift 键" }',
    '    }',
    '};',
    'const independentMessages = {',
    '    zh: {',
    '        pagination: { label: "独立分页", previous: "独立上一页", next: "独立下一页", page: "独立第 {page} 页" },',
    '        hotkey: { label: "独立快捷键 {keys}", separator: { combination: "，", or: "或者", then: "接着" }, ctrl: "独立控制键" }',
    '    }',
    '};',
    'const keyMap = {',
    '    ctrl: { default: { text: "$vuetify.hotkey.ctrl", symbol: "⌃", icon: "mdi-apple-keyboard-control" } },',
    '    meta: { default: { text: "$vuetify.hotkey.meta", symbol: "⌘", icon: "mdi-apple-keyboard-command" } },',
    '    shift: { default: { text: "$vuetify.hotkey.shift", symbol: "⇧", icon: "mdi-apple-keyboard-shift" } }',
    '};',
    'const rootLocale = ref("en");',
    'const ui = UI.createUI();',
    'const app = createApp({',
    '    setup() {',
    '        window.localeConsumerProtocol = {',
    '            registry: {',
    '                localeProvider: Boolean(UI.ULocaleProvider),',
    '                pagination: Boolean(UI.UiPagination),',
    '                hotkey: Boolean(UI.UHotkey),',
    '                useLocale: typeof UI.useLocale === "function"',
    '            },',
    '            setLocale(value) { rootLocale.value = value; },',
    '            async setTheme(value) { await ui.theme.change(value, false); },',
    '            async flush() { await nextTick(); await nextTick(); }',
    '        };',
    '        return () => h("main", [',
    '            h("section", { id: "real-locale-demo", class: "fixture-panel" }, [',
    '                h("h2", "Real locale provider demo"),',
    '                h(LocaleProviderDemo)',
    '            ]),',
    '            h("section", { id: "global-panel", class: "fixture-panel" }, [',
    '                h("h2", "Global default"),',
    '                h(UI.UiPagination, { id: "global-pagination", length: 5, modelValue: 2 }),',
    '                h(UI.UHotkey, { id: "global-hotkey", keys: "ctrl", displayMode: "text", listen: false })',
    '            ]),',
    '            h(UI.ULocaleProvider, { locale: "en" }, {',
    '                default: () => h("section", { id: "builtin-en-panel", class: "fixture-panel" }, [',
    '                    h("h2", "Built-in English"),',
    '                    h(UI.UiPagination, { id: "builtin-en-pagination", length: 5, modelValue: 2 }),',
    '                    h(UI.UHotkey, { id: "builtin-en-hotkey", keys: "ctrl+k/meta+p-shift+enter", displayMode: "text", listen: false })',
    '                ])',
    '            }),',
    '            h(UI.ULocaleProvider, { locale: rootLocale.value, messages: scopedMessages }, {',
    '                default: () => h("section", { id: "scope-panel", class: "fixture-panel" }, [',
    '                    h("h2", "Nested scope and explicit labels"),',
    '                    h(UI.UiPagination, { id: "scope-pagination", length: 5, modelValue: 2 }),',
    '                    h(UI.UiPagination, { id: "scope-ordinary-label", length: 5, modelValue: 2, label: "Manual pagination", prevLabel: "Manual previous", nextLabel: "Manual next" }),',
    '                    h(UI.UiPagination, { id: "scope-token-label", length: 5, modelValue: 2, label: "$vuetify.pagination.tokenLabel", prevLabel: "$vuetify.pagination.tokenPrevious", nextLabel: "Manual token next" }),',
    '                    h(UI.UHotkey, { id: "scope-hotkey-text", keys: "ctrl+meta/shift-ctrl", keyMap, displayMode: "text", listen: false }),',
    '                    h(UI.UHotkey, { id: "scope-hotkey-symbol", keys: "ctrl", keyMap, displayMode: "symbol", listen: false }),',
    '                    h(UI.UHotkey, { id: "scope-hotkey-icon", keys: "ctrl", keyMap, displayMode: "icon", listen: false }),',
    '                    h(UI.ULocaleProvider, { id: "nested-provider", tag: "section" }, {',
    '                        default: () => h(UI.UiPagination, { id: "inherited-pagination", length: 5, modelValue: 2 })',
    '                    })',
    '                ])',
    '            }),',
    '            h(UI.ULocaleProvider, { locale: "zh", messages: independentMessages }, {',
    '                default: () => h("section", { id: "independent-panel", class: "fixture-panel" }, [',
    '                    h("h2", "Independent Chinese scope"),',
    '                    h(UI.UiPagination, { id: "independent-pagination", length: 5, modelValue: 2 }),',
    '                    h(UI.UHotkey, { id: "independent-hotkey", keys: "ctrl", keyMap, displayMode: "text", listen: false })',
    '                ])',
    '            })',
    '        ]);',
    '    }',
    '});',
    'app.use(ui);',
    'app.mount("#app");'
].join('\n');

const fixture = [
    '<!doctype html><html><head><meta charset="utf-8"><style>',
    'html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; }',
    'body { min-height: 0 !important; margin: 0; padding: 20px; }',
    '#app { width: min(1200px, 100%); margin: 0 auto; overflow: visible !important; }',
    'main { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); gap: 16px; min-width: 0; overflow: visible; }',
    '.fixture-panel { display: grid; justify-items: stretch; gap: 12px; min-width: 0; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }',
    '.fixture-panel > * { min-width: 0; max-width: 100%; }',
    '.fixture-panel h2 { margin: 0; color: var(--text); font-size: 16px; overflow-wrap: anywhere; }',
    '@media (max-width: 640px) { body { padding: 12px; } .fixture-panel { padding: 12px; } }',
    '</style></head><body><div id="app"></div><script type="module">',
    fixtureScript,
    '</script></body></html>'
].join('\n');

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
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
    resolve: { dedupe: ['vue'] },
    server: {
        host: '127.0.0.1',
        port: 0,
        hmr: false,
        watch: { ignored: ['**/artifacts/**'] }
    },
    plugins: [{
        name: 'locale-consumer-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__locale-consumers') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__locale-consumers', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/locale.ts',
    'src/ui/locale-context.ts',
    'src/ui/hotkey.ts',
    'src/ui/UHotkey.vue',
    'src/ui/UiPagination.vue',
    'src/ui/ULocaleProvider.vue',
    'src/ui/docs/component-examples/locale-provider.vue',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));
await server.listen();

const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + '__locale-consumers'
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
const errors = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron',
    displayScope: 'Hotkey combo, alternate and sequence cases use listen:false; this fixture validates display text only.',
    evidence,
    sourceSha256,
    registry: {},
    realDemo: {},
    builtinLocales: {},
    scopedConsumers: {},
    explicitLabels: {},
    hotkeyModes: {},
    inheritanceAndIsolation: {},
    layout: {},
    screenshots: [],
    errors
};

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.localeConsumerProtocol.flush());
}

async function waitFor(assertion) {
    let lastError;
    for (let attempt = 0; attempt < 40; attempt++) {
        try {
            await assertion();
            return;
        } catch (error) {
            lastError = error;
            await page.waitForTimeout(50);
        }
    }
    throw lastError;
}

async function setWindowSize(size) {
    await app.evaluate(({ BrowserWindow }, dimensions) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(dimensions.width, dimensions.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: dimensions.width, height: dimensions.height });
        mainWindow.webContents.setZoomFactor(dimensions.zoom ?? 1);
    }, size);
    await settle();
}

async function captureNativeScreenshot(file) {
    const pngBase64 = await app.evaluate(async ({ BrowserWindow }) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        return (await mainWindow.webContents.capturePage()).toPNG().toString('base64');
    });
    const png = Buffer.from(pngBase64, 'base64');
    await writeFile(path.join(evidence, file), png);
    return {
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20)
    };
}

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => Boolean(window.localeConsumerProtocol));
    await settle();

    report.registry = await page.evaluate(() => window.localeConsumerProtocol.registry);
    assert.deepEqual(report.registry, { localeProvider: true, pagination: true, hotkey: true, useLocale: true });

    const realDemo = page.locator('#real-locale-demo [data-demo-component="ULocaleProvider"]');
    const demoPreviews = realDemo.locator('.locale-message-preview');
    assert.equal(await demoPreviews.count(), 2, 'real locale demo renders parent and nested previews');
    const realPagination = realDemo.locator('.ui-pagination');
    const realHotkey = realDemo.locator('.u-hotkey-display');
    assert.equal(await realPagination.getAttribute('aria-label'), 'Pagination');
    assert.equal(await realPagination.locator('button[aria-label="Previous page"]').count(), 1);
    assert.equal(await realHotkey.getAttribute('aria-label'), 'Keyboard shortcut Save or ENTER then G');
    assert.ok((await demoPreviews.nth(0).textContent()).startsWith('Hello Ling ·'));
    assert.ok((await demoPreviews.nth(1).textContent()).startsWith('Child says hello to Ling ·'));
    report.realDemo.english = {
        parentPreview: await demoPreviews.nth(0).textContent(),
        childPreview: await demoPreviews.nth(1).textContent(),
        pagination: await realPagination.getAttribute('aria-label'),
        hotkey: await realHotkey.getAttribute('aria-label')
    };
    const demoSwitches = realDemo.locator('input[type="checkbox"]');
    assert.equal(await demoSwitches.count(), 2, 'real locale demo exposes language and RTL switches');
    await demoSwitches.nth(0).uncheck({ force: true });
    await waitFor(async () => assert.ok((await demoPreviews.nth(0).textContent()).startsWith('你好，Ling ·')));
    assert.equal(await demoPreviews.nth(1).textContent(), await demoPreviews.nth(0).textContent(), 'nested preview inherits Chinese messages');
    assert.equal(await realPagination.getAttribute('aria-label'), '分页');
    assert.equal(await realPagination.locator('button[aria-label="上一页"]').count(), 1);
    assert.equal(await realPagination.locator('button[aria-label="第 2 页"]').count(), 1);
    assert.equal(await realHotkey.getAttribute('aria-label'), '快捷键 保存 或 ENTER 然后 G');
    report.realDemo.chinese = {
        parentPreview: await demoPreviews.nth(0).textContent(),
        childInheritsParentMessage: await demoPreviews.nth(1).textContent() === await demoPreviews.nth(0).textContent(),
        pagination: await realPagination.getAttribute('aria-label'),
        hotkey: await realHotkey.getAttribute('aria-label')
    };
    await demoSwitches.nth(0).check({ force: true });
    await waitFor(async () => assert.ok((await demoPreviews.nth(0).textContent()).startsWith('Hello Ling ·')));
    assert.equal(await realPagination.getAttribute('aria-label'), 'Pagination');
    assert.equal(await realHotkey.getAttribute('aria-label'), 'Keyboard shortcut Save or ENTER then G');

    const builtinEn = page.locator('#builtin-en-pagination');
    assert.equal(await builtinEn.getAttribute('aria-label'), 'Pagination');
    assert.equal(await builtinEn.locator('button[aria-label="Previous page"]').count(), 1);
    assert.equal(await builtinEn.locator('button[aria-label="Next page"]').count(), 1);
    assert.equal(await builtinEn.locator('button[aria-label="Page 2"]').count(), 1);
    const builtinEnglishHotkey = page.locator('#builtin-en-hotkey');
    assert.equal(await builtinEnglishHotkey.getAttribute('aria-label'), 'Keyboard shortcut Ctrl + K or Ctrl + P then Shift + Enter');
    report.builtinLocales.english = {
        pagination: await builtinEn.getAttribute('aria-label'),
        previous: await builtinEn.locator('button').first().getAttribute('aria-label'),
        page: await builtinEn.locator('button[aria-current="page"]').getAttribute('aria-label'),
        hotkey: await builtinEnglishHotkey.getAttribute('aria-label')
    };

    const globalPagination = page.locator('#global-pagination');
    const globalHotkey = page.locator('#global-hotkey');
    assert.equal(await globalPagination.getAttribute('aria-label'), '分页');
    assert.equal(await globalPagination.locator('button[aria-label="上一页"]').count(), 1);
    assert.equal(await globalPagination.locator('button[aria-label="第 2 页"]').count(), 1);
    assert.equal(await globalHotkey.getAttribute('aria-label'), '快捷键 Ctrl');
    report.builtinLocales.chinese = {
        pagination: await globalPagination.getAttribute('aria-label'),
        previous: await globalPagination.locator('button').first().getAttribute('aria-label'),
        page: await globalPagination.locator('button[aria-current="page"]').getAttribute('aria-label'),
        hotkey: await globalHotkey.getAttribute('aria-label')
    };

    const scopedPagination = page.locator('#scope-pagination');
    const ordinaryLabels = page.locator('#scope-ordinary-label');
    const tokenLabels = page.locator('#scope-token-label');
    const scopedHotkey = page.locator('#scope-hotkey-text');
    assert.equal(await scopedPagination.getAttribute('aria-label'), 'Scoped pagination');
    assert.equal(await scopedPagination.locator('button[aria-label="Scoped previous"]').count(), 1);
    assert.equal(await scopedPagination.locator('button[aria-label="Scoped page 2"]').count(), 1);
    assert.equal(await ordinaryLabels.getAttribute('aria-label'), 'Manual pagination');
    assert.equal(await ordinaryLabels.locator('button[aria-label="Manual previous"]').count(), 1);
    assert.equal(await ordinaryLabels.locator('button[aria-label="Manual next"]').count(), 1);
    assert.equal(await tokenLabels.getAttribute('aria-label'), 'Explicit token pagination');
    assert.equal(await tokenLabels.locator('button[aria-label="Explicit token previous"]').count(), 1);
    assert.equal(await tokenLabels.locator('button[aria-label="Manual token next"]').count(), 1);
    assert.equal(await scopedHotkey.getAttribute('aria-label'), 'Shortcut Control EN + Meta EN OR EN Shift EN THEN EN Control EN');
    assert.deepEqual(await scopedHotkey.locator('.u-hotkey-key').allTextContents(), [
        'Control EN', 'Meta EN', 'Shift EN', 'Control EN'
    ]);
    assert.deepEqual(await scopedHotkey.locator('.u-hotkey-divider').allTextContents(), ['+', 'OR EN', 'THEN EN']);
    report.scopedConsumers.english = {
        pagination: await scopedPagination.getAttribute('aria-label'),
        page: await scopedPagination.locator('button[aria-current="page"]').getAttribute('aria-label'),
        hotkey: await scopedHotkey.getAttribute('aria-label')
    };
    report.explicitLabels.english = {
        ordinary: await ordinaryLabels.getAttribute('aria-label'),
        token: await tokenLabels.getAttribute('aria-label'),
        tokenPrevious: await tokenLabels.locator('button').first().getAttribute('aria-label')
    };

    const symbolKey = page.locator('#scope-hotkey-symbol .u-hotkey-key');
    assert.equal(await symbolKey.textContent(), '⌃');
    assert.equal(await symbolKey.getAttribute('title'), 'Control EN');
    assert.equal(await page.locator('#scope-hotkey-symbol').getAttribute('aria-label'), 'Shortcut Control EN');
    const iconKey = page.locator('#scope-hotkey-icon .u-hotkey-key');
    assert.equal(await iconKey.getAttribute('title'), 'Control EN');
    const iconPathEnglish = await iconKey.locator('svg path').getAttribute('d');
    assert.ok(iconPathEnglish, 'icon mode renders the configured icon path');
    assert.equal(await page.locator('#scope-hotkey-icon').getAttribute('aria-label'), 'Shortcut Control EN');
    report.hotkeyModes.english = {
        symbol: await symbolKey.textContent(),
        symbolTitle: await symbolKey.getAttribute('title'),
        iconTitle: await iconKey.getAttribute('title'),
        iconPath: iconPathEnglish,
        textLabel: await scopedHotkey.getAttribute('aria-label')
    };

    const nestedPagination = page.locator('#inherited-pagination');
    const independentPagination = page.locator('#independent-pagination');
    const independentHotkey = page.locator('#independent-hotkey');
    assert.equal(await nestedPagination.getAttribute('aria-label'), 'Scoped pagination');
    assert.equal(await independentPagination.getAttribute('aria-label'), '独立分页');
    assert.equal(await independentPagination.locator('button[aria-label="独立第 2 页"]').count(), 1);
    assert.equal(await independentHotkey.getAttribute('aria-label'), '独立快捷键 独立控制键');

    await page.evaluate(() => window.localeConsumerProtocol.setLocale('zh'));
    await settle();
    await waitFor(async () => assert.equal(await scopedPagination.getAttribute('aria-label'), '父级分页'));
    assert.equal(await scopedPagination.locator('button[aria-label="父级上一页"]').count(), 1);
    assert.equal(await scopedPagination.locator('button[aria-label="父级第 2 页"]').count(), 1);
    assert.equal(await ordinaryLabels.getAttribute('aria-label'), 'Manual pagination');
    assert.equal(await tokenLabels.getAttribute('aria-label'), '父级令牌分页');
    assert.equal(await tokenLabels.locator('button[aria-label="父级令牌上一页"]').count(), 1);
    assert.equal(await scopedHotkey.getAttribute('aria-label'), '父级快捷键 控制键 + 命令键 或 Shift 键 然后 控制键');
    assert.deepEqual(await scopedHotkey.locator('.u-hotkey-divider').allTextContents(), ['+', '或', '然后']);
    assert.equal(await symbolKey.textContent(), '⌃');
    assert.equal(await symbolKey.getAttribute('title'), '控制键');
    assert.equal(await page.locator('#scope-hotkey-symbol').getAttribute('aria-label'), '父级快捷键 控制键');
    assert.equal(await iconKey.getAttribute('title'), '控制键');
    assert.equal(await iconKey.locator('svg path').getAttribute('d'), iconPathEnglish, 'locale changes do not rewrite the selected icon path');
    assert.equal(await page.locator('#scope-hotkey-icon').getAttribute('aria-label'), '父级快捷键 控制键');
    assert.equal(await nestedPagination.getAttribute('aria-label'), '父级分页', 'child locale inherits its ancestor locale and messages');
    assert.equal(await independentPagination.getAttribute('aria-label'), '独立分页', 'sibling locale remains isolated');
    assert.equal(await independentHotkey.getAttribute('aria-label'), '独立快捷键 独立控制键', 'sibling hotkey messages remain isolated');
    assert.equal(await globalPagination.getAttribute('aria-label'), '分页', 'scoped locale changes do not mutate the global locale');
    assert.equal(await globalHotkey.getAttribute('aria-label'), '快捷键 Ctrl', 'global hotkey language remains independent');
    report.scopedConsumers.chinese = {
        pagination: await scopedPagination.getAttribute('aria-label'),
        page: await scopedPagination.locator('button[aria-current="page"]').getAttribute('aria-label'),
        hotkey: await scopedHotkey.getAttribute('aria-label')
    };
    report.explicitLabels.chinese = {
        ordinary: await ordinaryLabels.getAttribute('aria-label'),
        token: await tokenLabels.getAttribute('aria-label'),
        tokenPrevious: await tokenLabels.locator('button').first().getAttribute('aria-label')
    };
    report.hotkeyModes.chinese = {
        symbol: await symbolKey.textContent(),
        symbolTitle: await symbolKey.getAttribute('title'),
        iconTitle: await iconKey.getAttribute('title'),
        iconPath: await iconKey.locator('svg path').getAttribute('d'),
        textLabel: await scopedHotkey.getAttribute('aria-label')
    };
    report.inheritanceAndIsolation = {
        childInheritsLocaleAndMessages: await nestedPagination.getAttribute('aria-label'),
        independentPagination: await independentPagination.getAttribute('aria-label'),
        independentHotkey: await independentHotkey.getAttribute('aria-label'),
        globalPagination: await globalPagination.getAttribute('aria-label'),
        globalHotkey: await globalHotkey.getAttribute('aria-label')
    };

    await page.evaluate(() => window.localeConsumerProtocol.setTheme('light'));
    await settle();
    await setWindowSize({ width: 1280, height: 900, zoom: 1 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const wideScreenshot = 'locale-consumers-wide-light.png';
    await page.screenshot({ path: path.join(evidence, wideScreenshot), fullPage: true, animations: 'disabled', caret: 'hide' });
    report.screenshots.push({ file: wideScreenshot, viewport: { width: 1280, height: 900 }, theme: 'light', capture: 'fullPage' });

    await page.evaluate(() => window.localeConsumerProtocol.setTheme('dark'));
    await settle();
    await demoSwitches.nth(0).uncheck({ force: true });
    await waitFor(async () => assert.equal(await realPagination.getAttribute('aria-label'), '分页'));
    await setWindowSize({ width: 390, height: 900, zoom: 1.25 });
    report.layout.narrowAt125Percent = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        appHeight: Math.ceil(document.querySelector('#app').getBoundingClientRect().height),
        panelBounds: Array.from(document.querySelectorAll('.fixture-panel')).flatMap(panel => {
            const panelStyle = getComputedStyle(panel);
            const panelRect = panel.getBoundingClientRect();
            const innerRight = panelRect.right
                - parseFloat(panelStyle.borderRightWidth)
                - parseFloat(panelStyle.paddingRight);
            return Array.from(panel.querySelectorAll('h2, .component-demo, .ui-pagination')).map(element => {
                const rect = element.getBoundingClientRect();
                return {
                    panel: panel.id,
                    element: element.matches('h2') ? 'h2' : element.matches('.ui-pagination') ? 'nav' : 'real demo',
                    right: Math.round(rect.right * 100) / 100,
                    innerRight: Math.round(innerRight * 100) / 100,
                    fits: rect.right <= innerRight + 0.5
                };
            });
        }),
        navButtonBounds: Array.from(document.querySelectorAll('.fixture-panel .ui-pagination')).flatMap(nav => {
            const navStyle = getComputedStyle(nav);
            const navRect = nav.getBoundingClientRect();
            const navInnerRight = navRect.right
                - parseFloat(navStyle.borderRightWidth)
                - parseFloat(navStyle.paddingRight);
            return Array.from(nav.querySelectorAll('button')).map((button, index) => {
                const buttonRight = button.getBoundingClientRect().right;
                return {
                    panel: nav.closest('.fixture-panel').id,
                    label: button.getAttribute('aria-label') ?? 'button ' + (index + 1),
                    right: Math.round(buttonRight * 100) / 100,
                    navInnerRight: Math.round(navInnerRight * 100) / 100,
                    fits: buttonRight <= navInnerRight + 0.5
                };
            });
        })
    }));
    await page.evaluate(() => window.scrollTo(0, 0));
    const narrowDiagnostic = 'locale-consumers-390-dark-125-fullpage-diagnostic.png';
    await page.screenshot({ path: path.join(evidence, narrowDiagnostic), fullPage: true, animations: 'disabled', caret: 'hide' });
    report.screenshots.push({
        file: narrowDiagnostic,
        viewport: { width: 390, height: 900 },
        theme: 'dark',
        zoom: 1.25,
        capture: 'Playwright fullPage diagnostic',
        visualAcceptance: false,
        note: 'Zoomed fullPage capture is CSS-clipped; use the native Electron captures for visual acceptance.'
    });

    const nativeTop = 'locale-consumers-390-dark-125-native-top.png';
    const nativeTopSize = await captureNativeScreenshot(nativeTop);
    report.screenshots.push({
        file: nativeTop,
        viewport: { width: 390, height: 900 },
        theme: 'dark',
        zoom: 1.25,
        scrollTarget: 'page top with real locale demo',
        capture: 'Electron webContents.capturePage NativeImage',
        visualAcceptance: true,
        pixelSize: nativeTopSize
    });

    await page.evaluate(() => {
        const target = document.querySelector('#scope-panel');
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
    });
    await settle();
    const nativeScope = 'locale-consumers-390-dark-125-native-scope.png';
    const nativeScopeSize = await captureNativeScreenshot(nativeScope);
    report.screenshots.push({
        file: nativeScope,
        viewport: { width: 390, height: 900 },
        theme: 'dark',
        zoom: 1.25,
        scrollTarget: 'scope panel',
        capture: 'Electron webContents.capturePage NativeImage',
        visualAcceptance: true,
        pixelSize: nativeScopeSize
    });

    await page.evaluate(() => {
        const target = document.querySelector('#independent-panel');
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
    });
    await settle();
    const nativeIndependent = 'locale-consumers-390-dark-125-native-independent.png';
    const nativeIndependentSize = await captureNativeScreenshot(nativeIndependent);
    report.screenshots.push({
        file: nativeIndependent,
        viewport: { width: 390, height: 900 },
        theme: 'dark',
        zoom: 1.25,
        scrollTarget: 'independent scope panel',
        capture: 'Electron webContents.capturePage NativeImage',
        visualAcceptance: true,
        pixelSize: nativeIndependentSize
    });

    assert.ok(
        report.layout.narrowAt125Percent.panelBounds.every(bound => bound.fits),
        'real demo, pagination navigation, and headings fit within each panel at 390px and 125% zoom'
    );
    assert.ok(
        report.layout.narrowAt125Percent.navButtonBounds.every(bound => bound.fits),
        'every pagination button fits within its navigation inner boundary at 390px and 125% zoom'
    );
    assert.deepEqual(errors, [], 'locale consumer fixture has no page errors, console errors, or Vue warnings');
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? error.name + ': ' + error.message : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    if (app) {
        const closed = await Promise.race([
            app.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) app.process().kill();
    }
    await server.close();
}
