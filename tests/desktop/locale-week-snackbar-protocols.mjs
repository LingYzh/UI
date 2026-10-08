import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/locale-week-snackbar-protocols');
await mkdir(evidence, { recursive: true });
const files = ['UDatePicker.vue', 'UCalendar.vue', 'calendar.ts', 'USnackbar.vue', 'snackbar-props.ts', 'directives.ts', 'UiTextarea.vue'];
const hashes = async () => Object.fromEntries(await Promise.all(files.map(async file => [file, createHash('sha256').update(await readFile(path.resolve('src/ui', file))).digest('hex')])));
const before = await hashes();
const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module">
import { createApp, h, nextTick, reactive } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/styles.css';
const state = reactive({ locale: 'zh-CN', first: undefined, explicitLocale: undefined, open: false, persistent: false, preventOutside: false, outsides: 0, maxHeight: 100, grow: true, rows: [] });
const weekProps = () => ({ modelValue: new Date(2026, 9, 7), locale: state.explicitLocale, firstDayOfWeek: state.first });
createApp({ render: () => h('main', { style: 'padding:20px' }, [
    h(UI.ULocaleProvider, { locale: state.locale }, () => [
        h('section', { id: 'picker' }, [h(UI.UDatePicker, { ...weekProps(), showAdjacentMonths: true })]),
        h('section', { id: 'calendar' }, [h(UI.UCalendar, { ...weekProps(), type: 'week' }, { default: scope => h('output', { id: 'calendar-start' }, scope.start.date) })])
    ]),
    h('button', { id: 'outside' }, 'Outside'),
    h(UI.UTextarea, { id: 'capped-textarea', modelValue: Array.from({ length: 20 }, (_, index) => 'Line ' + index).join('\\n'), rows: '2', maxRows: '20', maxHeight: state.maxHeight, autoGrow: state.grow, counter: true, persistentCounter: true, clearable: true, 'onUpdate:rows': value => state.rows.push(value) }),
    h(UI.USnackbar, { modelValue: state.open, 'onUpdate:modelValue': value => state.open = value, persistent: state.persistent, timeout: -1, closable: true, text: 'Notice', 'onClick:outside': event => { state.outsides++; if (state.preventOutside) event.preventDefault(); } })
]) }).use(UI.createUI()).mount('#app');
window.weekSnackProbe = { state, flush: async () => { await nextTick(); await nextTick(); } };
</script></body></html>`;
const vite = await createServer({ appType: 'custom', logLevel: 'error', cacheDir: path.join(evidence, 'cache'), optimizeDeps: { noDiscovery: true, include: ['highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] }, server: { host: '127.0.0.1', port: 0, hmr: false } });
vite.middlewares.use('/__week_snack__', async (_request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(await vite.transformIndexHtml('/__week_snack__', fixture)); });
const report = { generatedAt: new Date().toISOString(), checks: [], errors: [], warnings: [], sourceSha256: before, visualAcceptance: false };
let browser;
try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.warnings.push(message.text()); });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/__week_snack__`);
    await page.waitForFunction(() => !!window.weekSnackProbe);
    const set = async values => { await page.evaluate(async values => { Object.assign(window.weekSnackProbe.state, values); await window.weekSnackProbe.flush(); }, values); };
    const weekday = () => page.locator('#picker [role="columnheader"]').first().textContent();
    const calendarStart = () => page.locator('#calendar-start').textContent();
    assert.match(await weekday(), /一/);
    assert.equal(await calendarStart(), '2026-10-05');
    await set({ locale: 'en-US' });
    assert.match(await weekday(), /Sun/);
    assert.equal(await calendarStart(), '2026-10-04');
    await set({ locale: 'en-GB' });
    assert.match(await weekday(), /Mon/);
    assert.equal(await calendarStart(), '2026-10-05');
    await set({ locale: 'zh-HK' });
    assert.match(await weekday(), /日/);
    assert.equal(await calendarStart(), '2026-10-04');
    report.checks.push('Both public components infer regional week starts and react to nearest locale changes.');
    await set({ locale: 'en-US', explicitLocale: 'en-GB', first: '0' });
    assert.match(await weekday(), /Sun/);
    assert.equal(await calendarStart(), '2026-10-04');
    await set({ first: undefined });
    assert.match(await weekday(), /Mon/);
    await page.locator('#picker [data-date="2026-10-07"]').press('Home');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-date')), '2026-10-05');
    await page.locator('#picker [data-date="2026-10-05"]').press('End');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-date')), '2026-10-11');
    report.checks.push('Explicit week starts override regional inference; Home/End use the inferred week.');
    await set({ open: true });
    await page.locator('.u-notice button').press('Escape');
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.open), false);
    await set({ open: true, persistent: true });
    await page.locator('.u-notice button').press('Escape');
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.open), true);
    await page.locator('#outside').click();
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.open), true);
    assert.ok(await page.evaluate(() => window.weekSnackProbe.state.outsides > 0));
    await page.locator('.u-notice button').click();
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.open), false);
    report.checks.push('Snackbar allows Escape by default; persistent blocks Escape/outside but retains close actions.');
    await set({ open: true, persistent: false, preventOutside: true });
    await page.locator('#outside').click();
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.open), true);
    await set({ preventOutside: false });
    await page.locator('#outside').click();
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.open), false);
    report.checks.push('Outside close emits the original event and respects preventDefault.');
    const height = () => page.locator('#capped-textarea').evaluate(element => element.getBoundingClientRect().height);
    assert.ok(Math.abs(await height() - 100) <= 1);
    const initialRows = await page.evaluate(() => window.weekSnackProbe.state.rows.at(-1));
    assert.ok(initialRows > 2, 'AutoGrow reports its effective row count.');
    await set({ maxHeight: '140px' });
    assert.ok(Math.abs(await height() - 140) <= 1);
    assert.ok(await page.evaluate(() => window.weekSnackProbe.state.rows.at(-1)) > initialRows);
    await set({ maxHeight: 'calc(80px + 40px)' });
    assert.ok(Math.abs(await height() - 120) <= 1);
    await set({ grow: false, maxHeight: '80px' });
    assert.ok(await height() <= 81);
    assert.equal(await page.evaluate(() => window.weekSnackProbe.state.rows.at(-1)), 2);
    report.checks.push('Textarea maxHeight and update:rows react in autoGrow/counter/action branches, accepting numeric strings.');
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.warnings, []);
    assert.deepEqual(await hashes(), before, 'Product changed during validation.');
    await writeFile(path.join(evidence, 'result.json'), JSON.stringify(report, null, 4));
    console.log(`Locale week/Snackbar: ${report.checks.length} groups passed`);
} finally {
    await browser?.close();
    await vite.close();
}
