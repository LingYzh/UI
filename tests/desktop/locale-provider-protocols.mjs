import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/locale-provider-protocols');
await mkdir(evidence, { recursive: true });
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
    html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; }
    body { min-height: 100vh !important; margin: 0; padding: 24px; }
    #app { width: min(1200px, 100%); margin: 0 auto; overflow: visible !important; }
    main { display: grid; gap: 24px; min-width: 0; overflow: visible; }
    .fixture-panel { min-width: 0; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    @media (max-width: 640px) { body { padding: 12px; } .fixture-panel { padding: 12px; } }
</style></head><body><div id="app"></div><script type="module">
    import { createApp, defineComponent, h, nextTick } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import LocaleProviderDemo from '/src/ui/docs/component-examples/locale-provider.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const ResolveProbe = defineComponent({
        setup() {
            const locale = UI.useLocale();
            return () => h('output', {
                id: 'locale-resolve-probe',
                'data-current': locale.current.value,
                'data-fallback': locale.fallback?.value,
                'data-resolve-en': locale.resolve?.('probe.label', 'en'),
                'data-resolve-zh': locale.resolve?.('probe.label', 'zh')
            }, locale.t('probe.fallback'));
        }
    });
    const fallbackMessages = {
        fr: { 'probe.current': 'French current locale' },
        de: { 'probe.fallback': 'Legacy fallback wins' },
        en: { 'probe.fallback': 'fallbackLocale should lose', 'probe.label': 'English resolved by locale' },
        zh: { 'probe.label': '中文按指定语言解析' }
    };
    const ui = UI.createUI();
    const app = createApp({
        render() {
            return h('main', [
                h('section', { id: 'real-locale-demo', class: 'fixture-panel' }, [h(LocaleProviderDemo)]),
                h('section', { id: 'fallback-contracts', class: 'fixture-panel' }, [
                    h(UI.ULocaleProvider, {
                        locale: 'fr',
                        fallback: 'de',
                        fallbackLocale: 'en',
                        messages: fallbackMessages
                    }, { default: () => h(ResolveProbe) })
                ])
            ]);
        }
    });
    app.use(ui);
    app.mount('#app');

    window.localeProviderProtocol = {
        registry: {
            publicExports: Boolean(UI.ULocaleProvider) && typeof UI.useLocale === 'function',
            globalName: Boolean(app.component('u-locale-provider'))
        },
        async flush() { await nextTick(); await nextTick(); },
        async setTheme(name) { await ui.theme.change(name, false); }
    };
</script></body></html>`;

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
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
        name: 'locale-provider-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__locale-provider-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__locale-provider-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/locale-context.ts',
    'src/ui/locale.ts',
    'src/ui/ULocaleProvider.vue',
    'src/ui/index.ts',
    'src/ui/docs/component-examples/locale-provider.vue'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));
await server.listen();

const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + '__locale-provider-protocols'
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
let app;
let page;
const errors = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + createUI + real ULocaleProvider demo + Electron',
    evidence,
    sourceSha256,
    registry: {},
    realDemo: {},
    fallbackAndResolve: {},
    screenshot: null,
    errors
};

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.localeProviderProtocol.flush());
}

async function waitFor(assertion) {
    let lastError;
    for (let attempt = 0; attempt < 30; attempt++) {
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

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => Boolean(window.localeProviderProtocol));

    report.registry = await page.evaluate(() => window.localeProviderProtocol.registry);
    assert.deepEqual(report.registry, { publicExports: true, globalName: true }, 'public entry exposes and createUI registers ULocaleProvider');

    const demo = page.locator('[data-demo-component="ULocaleProvider"]');
    const previews = demo.locator('.locale-message-preview');
    assert.equal(await previews.count(), 2, 'real Provider demo renders the parent and nested preview');
    const parentPreview = previews.nth(0);
    const childPreview = previews.nth(1);
    await waitFor(async () => assert.match(await parentPreview.textContent(), /^Hello Ling · Inherited from the outer provider · /));
    await waitFor(async () => assert.match(await childPreview.textContent(), /^Child says hello to Ling · Inherited from the outer provider · /));

    const englishNumber = await page.evaluate(() => new Intl.NumberFormat('en').format(1234.5));
    assert.equal(await parentPreview.textContent(), 'Hello Ling · Inherited from the outer provider · ' + englishNumber);
    assert.equal(await childPreview.textContent(), 'Child says hello to Ling · Inherited from the outer provider · ' + englishNumber);
    const parentProvider = demo.locator('div[lang="en"]');
    const childProvider = demo.locator('section[lang="en"]');
    assert.equal(await parentProvider.count(), 1, 'outer provider defaults to a div tag');
    assert.equal(await childProvider.count(), 1, 'real child provider applies its requested section tag');
    assert.equal(await parentProvider.getAttribute('dir'), 'ltr');
    assert.equal(await childProvider.getAttribute('dir'), 'ltr');

    const controls = demo.locator('input[type="checkbox"]');
    assert.equal(await controls.count(), 2, 'real demo exposes English and RTL switches');
    await controls.nth(0).uncheck({ force: true });
    await waitFor(async () => assert.match(await parentPreview.textContent(), /^你好，Ling · 继承外层的自定义文案 · /));
    assert.equal(await childPreview.textContent(), await parentPreview.textContent(), 'child inherits the parent Chinese message when its English override is absent');
    const chineseNumber = await page.evaluate(() => new Intl.NumberFormat('zh-CN').format(1234.5));
    assert.equal(await parentPreview.textContent(), '你好，Ling · 继承外层的自定义文案 · ' + chineseNumber);
    assert.equal(await demo.locator('div[lang="zh"]').count(), 1, 'English switch updates the outer lang attribute');
    assert.equal(await demo.locator('section[lang="zh"]').count(), 1, 'child follows the parent locale reactively');

    await controls.nth(1).check({ force: true });
    await waitFor(async () => assert.equal(await demo.locator('section[lang="zh"]').getAttribute('dir'), 'rtl'));
    assert.equal(await demo.locator('div[lang="zh"]').getAttribute('dir'), 'rtl');
    await controls.nth(1).uncheck({ force: true });
    await controls.nth(0).check({ force: true });
    await waitFor(async () => assert.equal(await demo.locator('section[lang="en"]').getAttribute('dir'), 'ltr'));

    const probe = page.locator('#locale-resolve-probe');
    assert.equal(await probe.getAttribute('data-current'), 'fr');
    assert.equal(await probe.getAttribute('data-fallback'), 'de', 'legacy fallback prop takes priority over fallbackLocale');
    assert.equal(await probe.getAttribute('data-resolve-en'), 'English resolved by locale', 'resolve(key, locale) selects the requested English messages while current is French');
    assert.equal(await probe.getAttribute('data-resolve-zh'), '中文按指定语言解析', 'resolve(key, locale) selects the requested Chinese messages');
    assert.equal(await probe.textContent(), 'Legacy fallback wins', 't() uses the higher-priority explicit fallback message');

    report.realDemo = {
        english: {
            parent: await parentPreview.textContent(),
            child: await childPreview.textContent(),
            parentTag: await parentProvider.evaluate(element => element.tagName.toLowerCase()),
            childTag: await childProvider.evaluate(element => element.tagName.toLowerCase()),
            number: englishNumber
        },
        chinese: {
            parent: '你好，Ling · 继承外层的自定义文案 · ' + chineseNumber,
            childInheritsParentMessage: true,
            number: chineseNumber
        },
        ancestorRtlInheritedByChild: true,
        parentChildLocaleSwitch: true
    };
    report.fallbackAndResolve = {
        current: await probe.getAttribute('data-current'),
        fallback: await probe.getAttribute('data-fallback'),
        text: await probe.textContent(),
        resolvedEnglish: await probe.getAttribute('data-resolve-en'),
        resolvedChinese: await probe.getAttribute('data-resolve-zh')
    };

    await page.evaluate(() => window.scrollTo(0, 0));
    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width: 1280, height: 900 });
    await page.evaluate(() => window.localeProviderProtocol.setTheme('light'));
    await settle();
    await page.evaluate(() => window.scrollTo(0, 0));
    const target = page.locator('#real-locale-demo');
    const box = await target.boundingBox();
    assert.ok(box && box.width > 0 && box.height > 0, 'real locale demo screenshot has nonempty geometry');
    const screenshot = 'locale-provider-demo-wide-light.png';
    await target.screenshot({ path: path.join(evidence, screenshot), animations: 'disabled', caret: 'hide' });
    report.screenshot = { file: screenshot, theme: 'light', viewport: { width: 1280, height: 900 }, target: '#real-locale-demo' };

    assert.deepEqual(errors, [], 'locale Provider demo has no page errors, console errors, or Vue warnings');
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
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
