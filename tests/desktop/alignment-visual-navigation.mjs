import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const evidence = path.resolve('artifacts/component-audit-root/alignment-visual-navigation');
await mkdir(evidence, { recursive: true });
const names = ['color-input', 'window', 'carousel', 'expansion-panels', 'bottom-navigation', 'bottom-sheet', 'stepper-window'];
const sources = [...names.map(name => `src/ui/docs/component-examples/${name}.vue`), 'src/ui/docs/TextareaProtocolDemo.vue', ...['UColorInput.vue', 'UColorPicker.vue', 'UWindow.vue', 'UWindowItem.vue', 'UCarousel.vue', 'UCarouselItem.vue', 'UBottomNavigation.vue', 'UBottomSheet.vue', 'UStepperWindow.vue', 'UStepperWindowItem.vue', 'UExpansionPanels.vue', 'UExpansionPanel.vue', 'UExpansionPanelTitle.vue', 'UExpansionPanelText.vue', 'UiTextarea.vue', 'UiInput.vue', 'UiMenu.vue', 'UOverlay.vue', 'data-components.css', 'layout-components.css', 'forms-components.css'].map(name => `src/ui/${name}`)];
const hashes = async () => Object.fromEntries(await Promise.all(sources.map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
const before = await hashes();
const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body,#app{height:auto!important;overflow:visible!important}body{margin:0;padding:20px;background:var(--background);color:var(--text)}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;max-width:1100px;margin:auto}section.preview{min-width:0;padding:18px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}h2{font-size:18px;margin:0 0 20px}@media(max-width:650px){body{padding:14px}main{grid-template-columns:minmax(0,1fr)}}.preview .demo-row{display:flex;gap:12px;flex-wrap:wrap}</style></head><body><div id="app"></div><script type="module">
    import {createApp,h} from 'vue';import {createUI} from '/src/ui/index.ts';import '/src/docs-base.css';import '/src/ui/styles.css';
    ${names.map((name, index) => `import Demo${index} from '/src/ui/docs/component-examples/${name}.vue';`).join('\n')}
    import Textarea from '/src/ui/docs/TextareaProtocolDemo.vue';
    const demos=[${names.map((name, index) => `['${name}',Demo${index}]`).join(',')},['textarea',Textarea]];
    const ui=createUI();createApp({render:()=>h('main',demos.map(([id,component])=>h('section',{id,class:'preview'},[h('h2',id),h(component)])))}).use(ui).mount('#app');window.navVisual={theme:value=>ui.theme.change(value,false)};
</script></body></html>`;
const vite = await createServer({ appType: 'custom', cacheDir: path.join(evidence, 'cache'), logLevel: 'error', optimizeDeps: { noDiscovery: true, include: ['highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] }, server: { host: '127.0.0.1', port: 0, hmr: false } });
vite.middlewares.use('/__navigation_visual__', async (_request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(await vite.transformIndexHtml('/__navigation_visual__', fixture)); });
let browser;
const checks = [], errors = [], warnings = [];
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'warning') warnings.push(message.text()); if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/__navigation_visual__`);
    await page.waitForFunction(() => !!window.navVisual);
    await page.locator('#bottom-navigation .ui-bottom-navigation-content .ui-button').nth(1).click();
    assert.match(await page.locator('#bottom-navigation output').textContent(), /search/);
    await page.locator('#expansion-panels .u-expansion-title').nth(1).click();
    await page.waitForTimeout(250);
    assert.match(await page.locator('#expansion-panels output').textContent(), /details/);
    await page.locator('#carousel .u-carousel-next').click();
    await page.waitForTimeout(300);
    assert.match(await page.locator('#carousel .u-carousel-item:visible').textContent(), /第 2 项/);
    await page.locator('#window .u-window').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    assert.match(await page.locator('#window .u-window-item:visible').textContent(), /详情/);
    checks.push('real navigation demos use registered values, keyboard controls, slots and actual selected panels');
    for (const [theme, width, zoom] of [['light', 1200, '100%'], ['dark', 390, '100%'], ['light', 390, '125%']]) {
        await page.evaluate(theme => window.navVisual.theme(theme), theme);
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(zoom => { document.body.style.zoom = zoom; }, zoom);
        await page.waitForTimeout(200);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}/${width}/${zoom} no horizontal page overflow`);
        await page.screenshot({ path: path.join(evidence, `${theme}-${width}-${zoom}.png`), fullPage: true });
        await page.locator('#color-input .ui-color-pip').first().click();
        await page.waitForFunction(() => document.querySelector('.ui-color-input-menu')?.matches('[data-state="open"]'));
        await page.waitForTimeout(200);
        const menu = page.locator('.ui-color-input-menu:visible');
        const bounds = await menu.boundingBox();
        await page.screenshot({ path: path.join(evidence, `color-popup-${theme}-${width}-${zoom}.png`) });
        assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1, `ColorInput popup remains within the viewport: ${JSON.stringify({ theme, width, zoom, bounds })}`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
    }
    checks.push('light/dark/narrow/125% real demos and ColorInput popup geometry');
    await page.evaluate(() => { document.body.style.zoom = '100%'; });
    await page.evaluate(() => window.navVisual.theme('dark'));
    await page.locator('#bottom-sheet .ui-button').first().click();
    await page.waitForFunction(() => document.querySelector('dialog.ui-overlay')?.dataset.state === 'open');
    await page.screenshot({ path: path.join(evidence, 'bottom-sheet-dark-narrow.png') });
    await page.locator('dialog[open]').getByRole('button', { name: '完成', exact: true }).click();
    await page.waitForTimeout(200);
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
    assert.deepEqual(await hashes(), before);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), checks, errors, warnings, sourceHashes: before, visualAcceptance: false }, null, 4));
    process.stdout.write(`navigation visual capture: ${checks.length} groups passed\n`);
} finally {
    await browser?.close();
    await vite.close();
}
