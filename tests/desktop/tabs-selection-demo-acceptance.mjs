import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/tabs-selection-demo-acceptance');
const fixtureDirectory = path.join(evidence, 'fixture');
await mkdir(fixtureDirectory, { recursive: true });

const sources = [
    'src/ui/docs/TabsSelectionDemo.vue',
    'src/ui/index.ts',
    'src/ui/plugin.ts',
    'src/ui/component-registry.ts',
    'src/ui/styles.css',
    'src/ui/tokens.css',
    'src/ui/UiTabs.vue',
    'src/ui/UiTab.vue',
    'src/ui/tabs.ts',
    'src/ui/UiTabsWindow.vue',
    'src/ui/UiTabsWindowItem.vue',
    'src/ui/tabs-window-context.ts',
    'src/ui/UiSwitch.vue',
    'src/ui/UiButton.vue',
    'src/ui/UiInput.vue',
    'src/ui/item-group-state.ts',
    'tests/desktop/tabs-selection-demo-acceptance.mjs'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(sources.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const sourceSha256Before = await hashSources();
const html = `<!doctype html>
<html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" href="data:,"><title>Tabs selection demo acceptance</title>
<style>html,body,#app{min-height:100%;margin:0}body{box-sizing:border-box;padding:20px;background:var(--background);color:var(--text);font-family:Arial,sans-serif}#app{width:min(100%,1100px);margin-inline:auto}@media(max-width:600px){body{padding:12px}}</style></head>
<body><div id="app"></div><script type="module" src="/artifacts/full-alignment/tabs-selection-demo-acceptance/fixture/main.ts"></script></body></html>`;

await writeFile(path.join(fixtureDirectory, 'index.html'), html, 'utf8');
await writeFile(path.join(fixtureDirectory, 'main.ts'), `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import TabsSelectionDemo from '/src/ui/docs/TabsSelectionDemo.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';

const ui = createUI();
createApp(TabsSelectionDemo).use(ui).mount('#app');
window.__tabsSelectionDemo = { theme: value => ui.theme.change(value, false) };
`, 'utf8');

const report = {
    fixture: 'tabs-selection-demo-acceptance',
    method: 'Mounts the root-authored TabsSelectionDemo.vue SFC with createUI and the public component registry in Chromium.',
    sourceSha256Before,
    checks: [],
    viewports: [],
    screenshots: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    visualAcceptance: false,
    limits: ['Chromium renderer only; this is diagnostic UI and interaction evidence, not final visual acceptance.']
};

const server = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        entries: ['artifacts/full-alignment/tabs-selection-demo-acceptance/fixture/main.ts'],
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
const record = (name, details) => report.checks.push({ name, details });

async function captureViewport(page, name, theme, width, height, zoom) {
    await page.evaluate(async ({ theme: selectedTheme, zoom: selectedZoom }) => {
        await window.__tabsSelectionDemo.theme(selectedTheme);
        document.body.style.zoom = selectedZoom;
    }, { theme, zoom });
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(180);
    const metrics = await page.evaluate(() => {
        const demo = document.querySelector('[data-tabs-selection-demo]');
        const bounds = demo?.getBoundingClientRect();
        return {
            theme: document.documentElement.dataset.theme,
            viewportWidth: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            demoBounds: bounds ? { left: bounds.left, right: bounds.right, width: bounds.width } : null,
            selectedTabCount: document.querySelectorAll('.ui-tab[aria-selected="true"]').length,
            activePanelCount: document.querySelectorAll('[role="tabpanel"][aria-hidden="false"]').length
        };
    });
    assert.equal(metrics.theme, theme, `${name} applies its requested theme`);
    assert.ok(metrics.documentWidth <= metrics.viewportWidth, `${name} has no horizontal document overflow: ${JSON.stringify(metrics)}`);
    assert.ok(metrics.demoBounds && metrics.demoBounds.left >= -1 && metrics.demoBounds.right <= metrics.viewportWidth + 1,
        `${name} keeps the real demo inside the viewport: ${JSON.stringify(metrics)}`);
    assert.equal(metrics.selectedTabCount, 2, `${name} preserves the two selected multi-value tabs`);
    assert.equal(metrics.activePanelCount, 1, `${name} displays only the first matching selected panel`);
    report.viewports.push({ name, width, height, zoom, ...metrics });
    const screenshotPath = path.join(evidence, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    report.screenshots.push({ name, path: screenshotPath });
}

try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.consoleWarnings.push(message.text());
    });
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ status: response.status(), url: response.url() }); });
    page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));

    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/artifacts/full-alignment/tabs-selection-demo-acceptance/fixture/index.html`);
    await page.waitForFunction(() => window.__tabsSelectionDemo && document.querySelector('[data-tabs-selection-demo] .ui-tab[aria-selected="true"]'));
    assert.equal(await page.getByRole('status').textContent(), '模型：null', 'the actual demo begins with its force-selected null value');
    assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-multiselectable'), null, 'single selection is exposed as the default');

    await page.getByRole('button', { name: '选择对象副本' }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === '模型：{"id":"docs"}');
    const docsTab = page.getByRole('tab', { name: '文档' });
    assert.equal(await docsTab.getAttribute('aria-selected'), 'true', 'deep comparison matches the demo’s object-copy selection');
    assert.match(await page.locator('[role="tabpanel"][aria-hidden="false"]').innerText(), /文档面板/);
    record('actual SFC, default null, deep object-copy model and panel ARIA', 'Mounted TabsSelectionDemo.vue from docs; its object-copy action selects the matching registered object tab and linked panel.');

    await page.getByRole('checkbox', { name: '多选，最多两项' }).check();
    await page.waitForTimeout(50);
    await page.getByRole('button', { name: '选择对象副本' }).click();
    await page.getByRole('tab', { name: '验收' }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === '模型：[\u007b"id":"docs"\u007d,["tests","visual"]]');
    assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-multiselectable'), 'true');
    assert.equal(await page.locator('.ui-tab[aria-selected="true"]').count(), 2, 'the real demo selects two array/object values');
    assert.equal(await docsTab.getAttribute('aria-selected'), 'true');
    assert.equal(await page.getByRole('tab', { name: '验收' }).getAttribute('aria-selected'), 'true');
    assert.match(await page.locator('[role="tabpanel"][aria-hidden="false"]').innerText(), /文档面板/,
        'multiple selection displays the first registered matching Window');
    const modelAtMax = await page.getByRole('status').textContent();
    await page.getByRole('tab', { name: '未命名' }).click();
    assert.equal(await page.getByRole('status').textContent(), modelAtMax, 'the third selection is blocked by max=2');
    await docsTab.click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === '模型：[["tests","visual"]]');
    assert.equal(await page.locator('.ui-tab[aria-selected="true"]').count(), 1, 'mandatory allows removing one of multiple selected values');
    record('actual SFC multiselect, max and selected Window projection', 'The real demo preserves object/array values, enforces max=2, renders the first matching panel, and permits removing one value while mandatory retains another.');

    await page.getByRole('button', { name: '选择对象副本' }).click();
    await page.getByRole('tab', { name: '验收' }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === '模型：[\u007b"id":"docs"\u007d,["tests","visual"]]');
    await captureViewport(page, 'wide-light-1280', 'light', 1280, 960, '100%');
    await captureViewport(page, 'narrow-dark-390', 'dark', 390, 844, '100%');
    await captureViewport(page, 'narrow-light-css-zoom-125', 'light', 390, 844, '125%');
    record('wide/light, narrow/dark and narrow/CSS-zoom viewport checks', 'Each capture verifies no horizontal overflow, two selected tabs, one active paired panel, and the resolved theme on the actual docs SFC.');

    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.consoleWarnings, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.requestFailures, []);
    report.sourceSha256After = await hashSources();
    assert.deepEqual(report.sourceSha256After, sourceSha256Before, 'the product/demo/API sources remained unchanged during the fixture');
    report.sourcesUnchanged = true;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4) + '\n', 'utf8');
    console.log(`tabs selection demo acceptance: ${report.checks.length} interaction groups, ${report.viewports.length} viewport captures`);
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    report.sourceSha256After = await hashSources();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4) + '\n', 'utf8');
    throw error;
} finally {
    if (browser) await browser.close();
    await server.close();
}
