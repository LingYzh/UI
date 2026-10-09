import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.join(root, 'artifacts/full-alignment/layout-order-protocols');
const fixture = path.join(evidence, 'fixture');
await mkdir(fixture, { recursive: true });
await writeFile(path.join(fixture, 'index.html'), '<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><div id="app"></div><script type="module" src="./main.ts"></script>');
await writeFile(path.join(fixture, 'main.ts'), `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import Fixture from './Fixture.vue';
import '/src/ui/styles.css';
createApp(Fixture).use(createUI()).mount('#app');`);
await writeFile(path.join(fixture, 'Fixture.vue'), `<script setup>
import { reactive, ref, defineComponent, h, KeepAlive } from 'vue';
import { UApp, ULayout, UAppBar, UFooter, UMain, UNavigationDrawer } from '/src/ui/index.ts';
import LayoutOrderDemo from '/src/ui/docs/LayoutOrderDemo.vue';
const state = reactive({ mode: 'legacy', sideOrder: 0, width: 100, side: true, overlaps: [], cache: true, demoOnly: false, dark: false });
const app = ref();
const nested = ref();
const CachedBar = defineComponent({ setup() { return () => h(UAppBar, { id: 'cache-bar', name: 'cache', order: 50, height: 20 }); } });
window.layoutOrder = { state, app, nested };
</script>
<template>
    <UApp v-if="!state.demoOnly" ref="app" :layout-mode="state.mode" :overlaps="state.overlaps">
        <UNavigationDrawer id="side" name="side" :model-value="state.side" :width="state.width" :order="state.sideOrder" :mobile-breakpoint="0">Side</UNavigationDrawer>
        <UAppBar id="bar" name="bar" :height="40" order="10">Top</UAppBar>
        <UFooter id="footer" name="footer" :height="30" order="30" app>Bottom</UFooter>
        <UMain id="main">
            <ULayout ref="nested" id="nested" layout-mode="ordered" :height="240" :min-height="0" :width="400" class="nested-fixture">
                <UNavigationDrawer id="nested-side" name="nested-side" :width="80" order="0" permanent absolute>Nested</UNavigationDrawer>
                <UAppBar id="nested-bar" name="nested-bar" :height="36" order="10" absolute>Nested top</UAppBar>
                <UFooter id="nested-footer" name="nested-footer" :height="28" app absolute>Nested bottom</UFooter>
                <UMain id="nested-main">Inner main</UMain>
            </ULayout>
            <div id="demo"><LayoutOrderDemo /></div>
        </UMain>
        <KeepAlive><CachedBar v-if="state.cache" /></KeepAlive>
    </UApp>
    <UApp v-else :full-height="false" :theme="state.dark ? 'dark' : 'light'"><div id="demo"><LayoutOrderDemo /></div></UApp>
</template>
<style>
html, body { margin: 0; }
.nested-fixture { overflow: hidden; border: 1px solid var(--border); }
#demo { max-width: 720px; padding: 16px; }
</style>`);

const report = { checks: [], pageErrors: [], warnings: [], screenshots: [] };
const vite = await createServer({
    root, appType: 'mpa', cacheDir: path.join(evidence, 'vite-cache'), logLevel: 'error',
    optimizeDeps: { noDiscovery: true, entries: [path.relative(root, path.join(fixture, 'main.ts'))], include: ['highlight.js/lib/core', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] },
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
});
let browser;
function near(actual, expected, message) { assert.ok(Math.abs(actual - expected) < 1.1, `${message}: ${actual} vs ${expected}`); }
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) report.warnings.push(message.text()); });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/full-alignment/layout-order-protocols/fixture/index.html`);
    await page.waitForFunction(() => window.layoutOrder?.app.value?.getLayoutItem('bar')?.size > 0);
    async function geometry() {
        return page.evaluate(() => {
            const rect = id => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
            const app = window.layoutOrder.app.value;
            return { side: rect('side'), bar: rect('bar'), footer: rect('footer'), appRect: app.mainRect, nested: rect('nested'), nestedSide: rect('nested-side'), nestedBar: rect('nested-bar'), nestedFooter: rect('nested-footer'), innerRect: window.layoutOrder.nested.value.mainRect, main: getComputedStyle(document.getElementById('main')).paddingLeft };
        });
    }
    let current = await geometry();
    near(current.bar.x, 0, 'legacy full width top');
    near(current.side.y, current.appRect.top, 'legacy side avoids all top bars');
    near(current.side.bottom, 800 - current.appRect.bottom, 'legacy side avoids footer');
    report.checks.push('legacy default geometry stays intact');

    await page.evaluate(() => { window.layoutOrder.state.mode = 'ordered'; });
    await page.waitForFunction(() => document.getElementById('bar').style.left === '100px');
    current = await geometry();
    near(current.side.y, 0, 'first side starts at top');
    near(current.side.height, 800, 'first side full height');
    near(current.bar.x, 100, 'later bar avoids side');
    near(current.bar.width, 1100, 'later bar shortened');
    near(current.footer.x, 100, 'later footer avoids side');
    assert.equal(current.main, '100px');
    report.checks.push('ordered mode allocates side before top and bottom');

    await page.evaluate(() => { window.layoutOrder.state.sideOrder = 20; });
    await page.waitForFunction(() => document.getElementById('bar').style.left === '0px');
    current = await geometry();
    near(current.side.y, current.bar.height, 'later side avoids earlier bar');
    near(current.side.bottom, 800, 'later footer does not shorten earlier side');
    report.checks.push('changing order recomputes cross-edge geometry');

    await page.evaluate(() => { window.layoutOrder.state.overlaps = ['bar:side']; });
    await page.waitForFunction(() => document.getElementById('bar').style.left === '-100px');
    current = await geometry();
    near(current.side.y, current.bar.height * 2, 'named overlap positive edge adjustment');
    assert.equal(current.appRect.left, 100, 'overlaps leave main reservation intact');
    report.checks.push('named overlaps affect actual DOM and preserve mainRect');

    await page.evaluate(() => { window.layoutOrder.state.overlaps = []; window.layoutOrder.state.side = false; });
    await page.waitForFunction(() => window.layoutOrder.app.value.mainRect.left === 0);
    await page.evaluate(() => { window.layoutOrder.state.side = true; window.layoutOrder.state.width = 140; });
    await page.waitForFunction(() => window.layoutOrder.app.value.mainRect.left === 140);
    report.checks.push('open state and dynamic width update main reservation');

    current = await geometry();
    near(current.nestedSide.x, current.nested.x + 1, 'nested side anchors inside layout');
    near(current.nestedSide.height, current.nested.height - 2, 'nested side fills only inner layout');
    near(current.nestedBar.x, current.nested.x + 81, 'nested bar avoids inner side');
    near(current.nestedBar.right, current.nested.right - 1, 'nested bar remains in container');
    assert.equal(current.innerRect.left, 80);
    assert.ok(current.innerRect.top > 0 && current.innerRect.bottom > 0);
    report.checks.push('nested absolute chrome reserves space and stays in container');

    const topBefore = current.appRect.top;
    await page.evaluate(() => { window.layoutOrder.state.cache = false; });
    await page.waitForFunction(top => window.layoutOrder.app.value.mainRect.top < top, topBefore);
    const topAfter = (await geometry()).appRect.top;
    await page.evaluate(() => { window.layoutOrder.state.cache = true; });
    await page.waitForFunction(top => window.layoutOrder.app.value.mainRect.top > top, topAfter);
    report.checks.push('KeepAlive deactivation removes reservation and reactivation restores it');

    await page.evaluate(() => { window.layoutOrder.state.demoOnly = true; });
    for (const [name, width, dark, zoom] of [['wide', 1200, false, 1], ['narrow-dark', 390, true, 1], ['zoom', 900, false, 1.25]]) {
        await page.setViewportSize({ width, height: 800 });
        await page.evaluate(({ dark, zoom }) => { window.layoutOrder.state.dark = dark; document.getElementById('demo').style.zoom = String(zoom); }, { dark, zoom });
        const demo = page.locator('#demo');
        if (name === 'wide') await demo.locator('input[type="checkbox"]').first().check();
        await page.waitForFunction(() => [...document.querySelectorAll('#demo .ui-navigation-drawer')].every(node => getComputedStyle(node).transform === 'none'));
        const demoGeometry = await demo.evaluate(node => {
            const side = node.querySelector('.ui-navigation-drawer').getBoundingClientRect();
            const bar = node.querySelector('.ui-app-bar').getBoundingClientRect();
            const css = getComputedStyle(node.querySelector('.ui-navigation-drawer'));
            return { side: { left: side.left, right: side.right, width: side.width }, bar: { left: bar.left }, css: { width: css.width, right: css.right, left: css.left, maxWidth: css.maxWidth, flex: css.flex, boxSizing: css.boxSizing }, style: node.querySelector('.ui-navigation-drawer').getAttribute('style'), width: node.clientWidth };
        });
        near(demoGeometry.side.right, demoGeometry.bar.left, `${name} sidebar/bar seam`);
        const overflow = await demo.evaluate(node => node.scrollWidth > node.clientWidth + 1);
        assert.equal(overflow, false, `${name} demo overflow`);
        await demo.screenshot({ path: path.join(evidence, name + '.png') });
        report.screenshots.push(name + '.png');
    }
    report.checks.push('real public demo at wide, 390px dark and CSS zoom 125%');
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.warnings, []);
    console.log(`layout order protocols: ${report.checks.length} groups passed`);
} catch (error) {
    report.failure = error.stack ?? String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    await browser?.close();
    await vite.close();
}
