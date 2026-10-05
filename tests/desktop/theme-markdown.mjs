import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'theme-markdown-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0 } });
const url = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${url}#/theme` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const passed = [];
page.on('pageerror', error => errors.push(error.message));
const demo = id => page.locator(`.docs-example[aria-labelledby="${id}-heading"] .live-example`);
async function route(id) { await page.goto(`${url}#/${id}`); await page.locator('.docs-page-heading h1').waitFor(); }
async function frames() { await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); }
async function windowSize(width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => { const window = BrowserWindow.getAllWindows()[0]; window.webContents.setZoomFactor(size.zoom); window.setContentSize(size.width, size.height); }, { width, height, zoom });
    await page.waitForFunction(size => Math.abs(innerWidth - Math.round(size.width / size.zoom)) <= 1, { width, zoom });
    await frames();
}
async function capture(name, width = 1440, height = 900) {
    const namedTheme = name.match(/-(light|dark)(?:-|$)/)?.[1];
    if (namedTheme) assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), namedTheme, `${name}: actual theme`);
    await page.waitForTimeout(160);
    const captured = await app.evaluate(async ({ BrowserWindow }) => { const window = BrowserWindow.getAllWindows()[0]; const image = await window.webContents.capturePage(); return { png: image.toPNG().toString('base64'), size: window.getContentSize() }; });
    const png = Buffer.from(captured.png, 'base64');
    assert.deepEqual(captured.size, [width, height]);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [width, height]);
    await writeFile(path.join(evidence, `${name}.png`), png);
}
async function color(locator) { return locator.evaluate(element => getComputedStyle(element).color); }
async function centerDelta(locator) { return locator.evaluate(element => { const bounds = element.getBoundingClientRect(); return Math.abs((bounds.top + bounds.bottom) / 2 - innerHeight / 2); }); }
try {
    await page.locator('.docs-shell').waitFor();
    await windowSize(1440, 900);
    const global = demo('theme-switch');
    const select = global.getByRole('combobox', { name: '全局主题', exact: true });
    await select.selectOption('dark');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(230, 160, 134)');
    assert.equal(await color(global.locator('.ui-markdown mark')), 'rgb(230, 160, 134)');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--background').trim()), '#262624');
    await select.selectOption('light');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'light');
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(163, 79, 54)');
    passed.push('default light/dark palette and primary Markdown code/mark');
    await capture('theme-light');

    await select.selectOption('ocean');
    await page.waitForTimeout(240);
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(36, 106, 145)');
    assert.equal(await global.locator('.ui-button.primary').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(36, 106, 145)');
    await demo('theme-custom').getByLabel('海蓝主题主色', { exact: true }).fill('#e0b040');
    await frames();
    await page.waitForTimeout(240);
    assert.equal(await color(global.locator('.ui-markdown code')), 'rgb(224, 176, 64)');
    assert.equal(await color(global.locator('.ui-button.primary')), 'rgb(0, 0, 0)');
    assert.equal(await color(demo('theme-custom').locator('.bg-primary')), 'rgb(0, 0, 0)');
    passed.push('reactive custom primary, filled primary, on-color and color utilities');

    await page.emulateMedia({ colorScheme: 'dark' });
    await select.selectOption('system');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    assert.match(await global.getByRole('status').textContent(), /模式 system · 当前 dark/);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'light');
    assert.match(await global.getByRole('status').textContent(), /模式 system · 当前 light/);
    passed.push('system mode remains selected and follows OS appearance changes');

    assert.equal(await global.getByRole('checkbox', { name: '减少动态效果', exact: true }).isChecked(), false);
    await select.selectOption('dark');
    await page.waitForFunction(() => document.documentElement.dataset.uiTheme === 'dark');
    await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await select.selectOption('light');
    assert.equal(await page.evaluate(() => [...document.head.querySelectorAll('style')].filter(style => style.textContent.includes('@keyframes ui-theme-reveal')).length), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('default theme transition cleanup and reduced-motion bypass');

    const scoped = demo('theme-scoped');
    await scoped.scrollIntoViewIfNeeded();
    const cards = scoped.locator('.theme-demo-scope > .ui-row > .ui-col > .ui-card');
    assert.equal(await color(cards.nth(0).locator('.ui-markdown code')), 'rgb(230, 160, 134)');
    assert.equal(await color(cards.nth(1).locator(':scope > .ui-card-content > .ui-markdown code')), 'rgb(163, 79, 54)');
    assert.equal(await color(scoped.locator('.theme-demo-nested code')), 'rgb(142, 204, 233)');
    await scoped.getByRole('button', { name: '打开继承主题弹窗' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await color(dialog.locator('code')), 'rgb(230, 160, 134)');
    await dialog.getByRole('button', { name: '关闭', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.uiTheme), 'light');
    passed.push('local provider, nested Card override, deeper custom theme and inherited dialog');
    await capture('theme-scoped-light');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).check();
    await capture('theme-scoped-dark');
    await windowSize(390, 844);
    await scoped.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await capture('theme-scoped-dark-mobile', 390, 844);
    await windowSize(1440, 900, 1.25);
    await scoped.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await capture('theme-scoped-dark-zoom');
    passed.push('responsive theme scopes at mobile width and 125% zoom');

    await windowSize(1440, 900);
    const diagrams = demo('theme-diagrams');
    await diagrams.scrollIntoViewIfNeeded();
    await page.waitForFunction(element => element.querySelectorAll('.ui-markdown-diagram-svg svg').length === 2, await diagrams.elementHandle());
    await writeFile(path.join(evidence, 'diagrams.json'), JSON.stringify(await diagrams.locator('.ui-markdown-diagram-svg svg').evaluateAll(elements => elements.map(element => element.outerHTML))));
    const svgColors = await diagrams.locator('.ui-markdown-diagram-svg svg').evaluateAll(elements => elements.map(element => ({ fill: getComputedStyle(element.querySelector('.node rect')).fill, text: element.querySelector('.node text').textContent, unsafe: element.querySelectorAll('foreignObject, script, a').length })));
    assert.deepEqual(svgColors.map(item => item.fill), ['rgb(244, 243, 237)', 'rgb(45, 45, 41)']);
    for (const item of svgColors) { assert.ok(item.text.includes('主题颜色')); assert.equal(item.unsafe, 0); }
    const firstSvg = diagrams.locator('.ui-markdown-diagram-svg svg').first();
    const previousId = await firstSvg.getAttribute('id');
    await demo('theme-custom').getByLabel('海蓝主题主色', { exact: true }).fill('#246a91');
    await page.waitForFunction(({ element, id }) => element.querySelector('.ui-markdown-diagram-svg svg')?.id !== id, { element: await diagrams.elementHandle(), id: previousId });
    await diagrams.scrollIntoViewIfNeeded();
    await capture('theme-diagrams-dark');
    passed.push('parallel scoped Mermaid diagrams use independent palettes, visible SVG labels and reactive theme updates');

    await windowSize(1440, 900);
    await route('markdown');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).uncheck();
    const markdown = demo('markdown-navigation');
    const scroller = markdown.locator('.ui-scroll-viewport');
    const details = markdown.locator('details');
    const summary = details.locator('summary');
    await summary.scrollIntoViewIfNeeded();
    const closed = await details.evaluate(element => element.getBoundingClientRect().height);
    await summary.click();
    await page.waitForFunction(element => element.getAnimations().length > 0, await details.elementHandle());
    const duringOpen = await details.evaluate(element => ({ height: element.getBoundingClientRect().height, end: parseFloat(element.getAnimations()[0].effect.getKeyframes().at(-1).height) }));
    assert.ok(duringOpen.end > closed + 20);
    assert.ok(duringOpen.height < duringOpen.end);
    await page.waitForFunction(element => element.open && element.getAnimations().length === 0, await details.elementHandle());
    const open = await details.evaluate(element => element.getBoundingClientRect().height);
    await summary.click();
    await page.waitForFunction(element => element.open && element.getAnimations().length > 0, await details.elementHandle());
    assert.ok(await details.evaluate(element => element.getBoundingClientRect().height) > closed);
    await page.waitForFunction(element => !element.open && element.getAnimations().length === 0, await details.elementHandle());
    assert.ok(open > closed + 20);
    passed.push('details has real height transitions for opening and closing');
    await summary.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(element => element.open && element.getAnimations().length === 0, await details.elementHandle());
    await page.keyboard.press('Space');
    await page.waitForFunction(element => !element.open && element.getAnimations().length === 0, await details.elementHandle());
    await summary.evaluate(element => { element.click(); element.click(); element.click(); });
    await page.waitForFunction(element => element.open && element.getAnimations().length === 0, await details.elementHandle());
    passed.push('details keyboard activation and rapid reversal retain the final requested state');
    await capture('markdown-navigation-light');

    const reference = markdown.locator('.footnote-ref a');
    const destination = markdown.locator('.footnotes li');
    await reference.scrollIntoViewIfNeeded();
    const before = await scroller.evaluate(element => element.scrollTop);
    await reference.click();
    const early = await scroller.evaluate(element => element.scrollTop);
    await page.waitForFunction(element => Math.abs((element.getBoundingClientRect().top + element.getBoundingClientRect().bottom) / 2 - innerHeight / 2) < 3, await destination.elementHandle());
    const after = await scroller.evaluate(element => element.scrollTop);
    assert.ok(after > before + 100);
    assert.ok(early < after - 50, 'footnotes scroll smoothly instead of jumping instantly');
    assert.ok(await centerDelta(destination) < 3);
    assert.equal(await destination.evaluate(element => element === document.activeElement), true);
    await markdown.locator('.footnote-backref').click();
    // markdown-it assigns the return target id to the reference link.
    const returnTarget = reference;
    await page.waitForFunction(element => Math.abs((element.getBoundingClientRect().top + element.getBoundingClientRect().bottom) / 2 - innerHeight / 2) < 3, await returnTarget.elementHandle());
    assert.equal(await returnTarget.evaluate(element => element === document.activeElement), true);
    passed.push('footnote and return smoothly center the destination in the viewport and transfer focus');

    await markdown.getByRole('checkbox', { name: '减少动态效果', exact: true }).check();
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    assert.equal(await details.evaluate(element => element.open), false);
    assert.equal(await details.evaluate(element => element.getAnimations().length), 0);
    await reference.scrollIntoViewIfNeeded();
    await reference.click();
    assert.ok(await centerDelta(destination) < 3);
    await markdown.getByRole('checkbox', { name: '减少动态效果', exact: true }).uncheck();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    assert.equal(await details.evaluate(element => element.open), true);
    assert.equal(await details.evaluate(element => element.getAnimations().length), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    passed.push('manual and system reduced motion disable details and footnote animations');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).check();
    await summary.scrollIntoViewIfNeeded();
    await capture('markdown-navigation-dark');
    await route('theme-provider');
    await demo('theme-scoped').waitFor();
    assert.deepEqual(errors, []);
    passed.push('all new component routes render without renderer errors');
    console.log(JSON.stringify({ evidence, passed, errors }, null, 2));
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ evidence, passed, errors }, null, 2));
} catch (error) {
    await writeFile(path.join(evidence, 'failure.json'), JSON.stringify({ error: String(error), passed, errors }, null, 2));
    console.error(`Evidence: ${evidence}`);
    throw error;
} finally { await app.close(); await server.close(); }
