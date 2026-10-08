import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const artifactRoot = path.resolve('artifacts');
await mkdir(artifactRoot, { recursive: true });
const evidence = await mkdtemp(path.join(artifactRoot, 'virtual-scroll-protocols-'));
const fixturePath = path.join(evidence, 'fixture.html');
const fixture = `<!doctype html>
<html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>
html, body, #app { margin: 0; min-height: 100%; font-family: Arial, sans-serif; }
main { display: grid; gap: 16px; padding: 12px; }
#standard-viewport { width: min(640px, calc(100vw - 24px)); overflow-anchor: none; }
#renderless-viewport { width: min(640px, calc(100vw - 24px)); height: 180px; overflow: auto; overflow-anchor: none; }
.virtual-test-row { box-sizing: border-box; width: 100%; overflow: hidden; border-bottom: 1px solid #ddd; }
</style></head><body><div id="app"></div><script type="module">
import { createApp, defineComponent, h, reactive, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/styles.css';

const standardItems = reactive(Array.from({ length: 48 }, (_, index) => ({
    id: 'row-' + index,
    label: 'Standard row ' + index,
    height: 28 + (index % 4) * 8,
})));
const renderlessItems = reactive(Array.from({ length: 16 }, (_, index) => ({
    id: 'renderless-' + index,
    label: 'Renderless row ' + index,
    height: 24 + (index % 3) * 10,
})));
const state = reactive({ standardItems, renderlessItems, standardHeight: 220, renderlessMounted: true, missingItemRef: [], renderlessAttached: [], renderlessDetached: [] });
const refs = { standard: ref(), renderless: ref() };

function bindItemRef(slotRef, id) {
    if (!slotRef) state.missingItemRef.push(id);
    return element => {
        if (element) state.renderlessAttached.push(id);
        else state.renderlessDetached.push(id);
        if (typeof slotRef === 'function') slotRef(element);
        else if (slotRef && typeof slotRef === 'object' && 'value' in slotRef) slotRef.value = element;
    };
}

function describe(target) {
    if (target.id) return target.id;
    const standard = target.matches?.('[data-standard-id]') ? target : target.querySelector?.('[data-standard-id]');
    if (standard) return 'standard:' + standard.dataset.standardId;
    const renderless = target.matches?.('[data-renderless-id]') ? target : target.querySelector?.('[data-renderless-id]');
    if (renderless) return 'renderless:' + renderless.dataset.renderlessId;
    return target.className?.toString?.() || target.tagName;
}

const nativeResizeObserver = window.ResizeObserver;
const resizeTrace = { observed: [], unobserved: [], disconnects: 0, callbacks: [] };
window.ResizeObserver = class TrackedResizeObserver {
    constructor(callback) {
        this.observer = new nativeResizeObserver(entries => {
            for (const entry of entries) resizeTrace.callbacks.push({
                target: describe(entry.target),
                width: entry.target.clientWidth,
                height: entry.target.clientHeight,
                offsetHeight: entry.target.offsetHeight,
                rectHeight: entry.target.getBoundingClientRect().height,
                contentHeight: entry.contentRect.height,
                borderBoxHeight: Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0]?.blockSize : entry.borderBoxSize?.blockSize,
            });
            callback(entries);
        });
    }
    observe(target, options) { resizeTrace.observed.push(describe(target)); this.observer.observe(target, options); }
    unobserve(target) { resizeTrace.unobserved.push(describe(target)); this.observer.unobserve(target); }
    disconnect() { resizeTrace.disconnects++; this.observer.disconnect(); }
};

const Root = defineComponent({
    setup() {
        return () => h('main', [
            h(UI.UVirtualScroll, {
                id: 'standard-viewport',
                ref: refs.standard,
                items: state.standardItems,
                height: state.standardHeight,
                overscan: 2,
                itemKey: 'id',
            }, {
                default: ({ item, index }) => h('div', {
                    class: 'virtual-test-row',
                    'data-standard-id': item.id,
                    'data-index': index,
                    style: { height: item.height + 'px' },
                }, item.label),
            }),
            state.renderlessMounted ? h('div', { id: 'renderless-viewport' }, h(UI.UVirtualScroll, {
                ref: refs.renderless,
                renderless: true,
                items: state.renderlessItems,
                itemHeight: 28,
                height: 180,
                overscan: 1,
                itemKey: 'id',
            }, {
                default: ({ item, index, itemRef }) => h('div', {
                    ref: bindItemRef(itemRef, item.id),
                    class: 'virtual-test-row',
                    'data-renderless-id': item.id,
                    'data-index': index,
                    style: { height: item.height + 'px' },
                }, item.label),
            })) : null,
        ]);
    },
});

window.virtualScrollFixture = { state, refs, resizeTrace };
createApp(Root).use(UI.createUI()).mount('#app');
</script></body></html>`;

await writeFile(fixturePath, fixture, 'utf8');
const vite = await createServer({
    root: process.cwd(),
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/artifacts/**'] } },
    resolve: { dedupe: ['vue'] },
    optimizeDeps: {
        entries: [fixturePath],
        noDiscovery: true,
        include: [
            'vue',
            'highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json',
            'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist',
            'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup',
        ],
    },
    logLevel: 'error',
});

let browser;
try {
    await vite.listen();
    const relativeFixture = path.relative(process.cwd(), fixturePath).split(path.sep).join('/');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    const errors = [];
    const warnings = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) warnings.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/${relativeFixture}`);
    await page.waitForFunction(() => !!window.virtualScrollFixture?.refs.standard.value?.scrollToIndex);
    await page.waitForFunction(() => document.querySelector('#standard-viewport') && document.querySelector('#renderless-viewport'));

    const settle = async () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(async () => {
        const { refs, state } = window.virtualScrollFixture;
        for (let index = 0; index < state.standardItems.length; index++) {
            refs.standard.value.scrollToIndex(index, 'start');
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }
    });
    await settle();

const viewportMetrics = async () => page.locator('#standard-viewport').evaluate(viewport => ({
        top: viewport.getBoundingClientRect().top + viewport.clientTop,
        bottom: viewport.getBoundingClientRect().bottom - (viewport.offsetHeight - viewport.clientHeight - viewport.clientTop),
        height: viewport.clientHeight,
        rectHeight: viewport.getBoundingClientRect().height,
        scrollTop: viewport.scrollTop,
    }));
    const itemGeometry = async id => page.locator(`[data-standard-id="${id}"]`).evaluate(item => ({
        top: item.getBoundingClientRect().top,
        bottom: item.getBoundingClientRect().bottom,
        height: item.getBoundingClientRect().height,
    }));
    const checks = [];
    const geometry = {};

    await page.evaluate(() => { window.virtualScrollFixture.refs.standard.value.scrollToIndex(20, 'start'); });
    await page.waitForFunction(() => !!document.querySelector('[data-standard-id="row-20"]'));
    await settle();
    let viewport = await viewportMetrics();
    let row = await itemGeometry('row-20');
    assert.ok(Math.abs(row.top - viewport.top) < 2, `start aligns row top: ${JSON.stringify({ viewport, row })}`);
    assert.ok(Math.abs(row.height - (28 + (20 % 4) * 8)) < 1, 'the measured row keeps its variable height');
    geometry.start = { viewport, row };
    checks.push('variable row height measurement and scrollToIndex(start)');

    await page.evaluate(() => { window.virtualScrollFixture.refs.standard.value.scrollToIndex(21, 'center'); });
    await page.waitForFunction(() => !!document.querySelector('[data-standard-id="row-21"]'));
    await settle();
    viewport = await viewportMetrics();
    row = await itemGeometry('row-21');
    assert.ok(Math.abs((row.top + row.bottom) / 2 - (viewport.top + viewport.bottom) / 2) < 2, `center aligns row center: ${JSON.stringify({ viewport, row })}`);
    geometry.center = { viewport, row };
    checks.push('scrollToIndex(center)');

    await page.evaluate(() => { window.virtualScrollFixture.refs.standard.value.scrollToIndex(22, 'end'); });
    await page.waitForFunction(() => !!document.querySelector('[data-standard-id="row-22"]'));
    await settle();
    viewport = await viewportMetrics();
    row = await itemGeometry('row-22');
    assert.ok(Math.abs(row.bottom - viewport.bottom) < 2, `end aligns row bottom: ${JSON.stringify({ viewport, row })}`);
    geometry.end = { viewport, row };
    checks.push('scrollToIndex(end)');

    await page.evaluate(() => { window.virtualScrollFixture.refs.standard.value.scrollToIndex(22, 'nearest'); });
    await settle();
    viewport = await viewportMetrics();
    assert.ok(Math.abs(viewport.scrollTop - geometry.end.viewport.scrollTop) < 1, 'nearest leaves a fully visible row in place');
    checks.push('scrollToIndex(nearest)');

    await page.evaluate(async () => {
        const { refs, state } = window.virtualScrollFixture;
        refs.standard.value.scrollToIndex(20, 'start');
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const viewport = document.querySelector('#standard-viewport');
        viewport.scrollTop += 11;
        viewport.dispatchEvent(new Event('scroll'));
    });
    await settle();
    const anchorBefore = await itemGeometry('row-20');
    await page.evaluate(() => {
        window.virtualScrollFixture.state.standardItems.unshift({ id: 'prepended-row', label: 'Prepended', height: 57 });
    });
    await page.waitForFunction(() => !!document.querySelector('[data-standard-id="row-20"]'));
    await settle();
    const anchorAfter = await itemGeometry('row-20');
    assert.ok(Math.abs(anchorAfter.top - anchorBefore.top) < 2, `prepend preserves the keyed visible anchor: ${JSON.stringify({ anchorBefore, anchorAfter })}`);
    checks.push('prepend anchor continuity by stable itemKey');

    await page.evaluate(() => { window.virtualScrollFixture.refs.standard.value.scrollToIndex(0, 'start'); });
    await page.waitForFunction(() => !!document.querySelector('[data-standard-id="prepended-row"]'));
    await settle();
    const prependedGeometry = await itemGeometry('prepended-row');
    assert.ok(Math.abs(prependedGeometry.height - 57) < 1, 'the newly prepended row is measured');

    const renderlessSnapshot = await page.evaluate(() => {
        const state = window.virtualScrollFixture.state;
        const trace = window.virtualScrollFixture.resizeTrace;
        return {
            attached: state.renderlessAttached.length,
            missingItemRef: state.missingItemRef.slice(),
            observedRows: trace.observed.filter(value => value.startsWith('renderless:')),
        };
    });
    assert.ok(renderlessSnapshot.attached > 0, 'renderless items bind the provided itemRef scope');
    assert.deepEqual(renderlessSnapshot.missingItemRef, [], 'the public renderless slot supplies itemRef');
    assert.ok(renderlessSnapshot.observedRows.length > 0, 'renderless rows are observed for variable height');
    checks.push('renderless itemRef reaches real DOM rows');

    const renderlessRemovedId = await page.locator('#renderless-viewport [data-renderless-id]').first().getAttribute('data-renderless-id');
    await page.evaluate(() => { window.virtualScrollFixture.state.renderlessItems.splice(0, 1); });
    await settle();
    const renderlessCleanup = await page.evaluate((id) => ({
        unobserved: window.virtualScrollFixture.resizeTrace.unobserved,
        detached: window.virtualScrollFixture.state.renderlessDetached,
    }), renderlessRemovedId);
    assert.ok(renderlessCleanup.unobserved.includes(`renderless:${renderlessRemovedId}`), 'removed renderless rows are unobserved');
    assert.ok(renderlessCleanup.detached.includes(renderlessRemovedId), 'removed rows receive the null itemRef callback');
    checks.push('removed renderless row ref is detached');

    const beforeResize = await page.evaluate(() => window.virtualScrollFixture.resizeTrace.callbacks.filter(entry => entry.target.includes('standard-viewport')).length);
    await page.evaluate(() => {
        const state = window.virtualScrollFixture.state;
        state.standardHeight = 180;
        document.documentElement.style.zoom = '125%';
    });
    await page.waitForFunction(previous => window.virtualScrollFixture.resizeTrace.callbacks.filter(entry => entry.target.includes('standard-viewport')).length > previous, beforeResize);
    await settle();
    viewport = await viewportMetrics();
    assert.ok(Math.abs(viewport.height - 180) < 2, `ResizeObserver follows height under 125% zoom: ${JSON.stringify(viewport)}`);
    await page.evaluate(() => { window.virtualScrollFixture.refs.standard.value.scrollToIndex(23, 'end'); });
    await settle();
    viewport = await viewportMetrics();
    row = await itemGeometry('row-22');
    assert.ok(Math.abs(row.bottom - viewport.bottom) < 2, `end placement uses the resized viewport: ${JSON.stringify({ viewport, row, callbacks: (await page.evaluate(() => window.virtualScrollFixture.resizeTrace.callbacks)).slice(-8) })}`);
    checks.push('ResizeObserver viewport resize under 125% zoom');

    await page.screenshot({ path: path.join(evidence, 'final.png'), fullPage: true });
    await page.evaluate(() => { window.virtualScrollFixture.state.renderlessMounted = false; });
    await settle();
    const afterUnmount = await page.evaluate(() => window.virtualScrollFixture.resizeTrace.disconnects);
    assert.ok(afterUnmount >= 1, 'the renderless observer disconnects on unmount');
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
    checks.push('ResizeObserver and scroll listener cleanup on unmount');

    const hashes = {};
    for (const file of ['src/ui/UVirtualScroll.vue', 'src/ui/virtual-scroll.ts', 'src/ui/use-virtual-scroll.ts', 'src/ui/index.ts']) {
        hashes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
    }
    const report = {
        generatedAt: new Date().toISOString(),
        browser: browser.version(),
        checks,
        geometry,
        renderlessSnapshot,
        renderlessRemovedId,
        resizeViewport: viewport,
        errors,
        warnings,
        sourceSha256: hashes,
        evidence,
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    process.stdout.write(`virtual-scroll protocols: ${checks.length} checks passed\n${evidence}\n`);
} catch (error) {
    if (browser) {
        const pages = browser.contexts().flatMap(context => context.pages());
        if (pages[0]) await pages[0].screenshot({ path: path.join(evidence, 'failure.png'), fullPage: true }).catch(() => {});
    }
    await writeFile(path.join(evidence, 'failure.json'), JSON.stringify({ error: error instanceof Error ? error.stack ?? error.message : String(error), evidence }, null, 4), 'utf8');
    throw error;
} finally {
    await browser?.close();
    await vite.close();
}
