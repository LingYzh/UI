import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.join(root, 'artifacts/full-alignment/overlay-presentation-protocols');
const fixture = path.join(evidence, 'fixture');
await mkdir(fixture, { recursive: true });
await writeFile(path.join(fixture, 'index.html'), '<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><div id="app"></div><script type="module" src="./main.ts"></script>');
await writeFile(path.join(fixture, 'main.ts'), `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import Fixture from './Fixture.vue';
import '/src/ui/styles.css';
createApp(Fixture).use(createUI()).mount('#app');`);
await writeFile(path.join(fixture, 'Fixture.vue'), `<script setup>
import { reactive, ref, markRaw, defineComponent, h, Transition } from 'vue';
import { UApp, UOverlay, UDialog, UMenu, UTooltip, UButton } from '/src/ui/index.ts';
import OverlayPresentationDemo from '/src/ui/docs/OverlayPresentationDemo.vue';
const state = reactive({ dark: false, overlay: false, dialog: false, menu: false, tooltip: false, tooltipEnters: 0, tooltipLeaves: 0, scrim: undefined, opacity: undefined, transition: undefined, overlayEnters: 0, overlayLeaves: 0, dialogEnters: 0, dialogLeaves: 0, hooks: [] });
const overlay = ref();
const dialog = ref();
const menu = ref();
const tooltip = ref();
const customTransition = markRaw(defineComponent({ inheritAttrs: false, setup(_, { attrs, slots }) { return () => h(Transition, { ...attrs, css: false }, slots); } }));
window.overlayPresentation = { state, overlay, dialog, menu, tooltip, jsTransition: { css: false, onBeforeEnter: () => state.hooks.push('beforeEnter'), onEnter: (el, done) => { state.hooks.push('enter'); setTimeout(done, 35); }, onAfterEnter: () => state.hooks.push('afterEnter'), onBeforeLeave: () => state.hooks.push('beforeLeave'), onLeave: (el, done) => { state.hooks.push('leave'); setTimeout(done, 35); }, onAfterLeave: () => state.hooks.push('afterLeave') } };
window.overlayPresentation.customTransition = customTransition;
</script>
<template>
    <UApp :theme="state.dark ? 'dark' : 'light'" :full-height="false"><main>
        <OverlayPresentationDemo />
        <UButton id="opener" @click="state.overlay = true">Open Overlay</UButton>
        <UOverlay ref="overlay" v-model="state.overlay" :scrim="state.scrim" :opacity="state.opacity" :transition="state.transition" :width="320" retain-focus content-class="presentation-overlay" @after-enter="state.overlayEnters++" @after-leave="state.overlayLeaves++">
            <p>Overlay content</p><UButton @click="state.overlay = false">Close</UButton>
        </UOverlay>
        <UDialog ref="dialog" v-model="state.dialog" :scrim="state.scrim" :opacity="state.opacity" :transition="state.transition" :width="320" @after-enter="state.dialogEnters++" @after-leave="state.dialogLeaves++">
            <p>Dialog content</p><UButton @click="state.dialog = false">Close</UButton>
        </UDialog>
        <UMenu ref="menu" v-model="state.menu" :transition="state.transition" :close-on-content-click="false">
            <template #activator="{ props }"><UButton id="menu-opener" v-bind="props">Menu</UButton></template>
            <button role="menuitem">First action</button><button role="menuitem">Second action</button>
        </UMenu>
        <UTooltip ref="tooltip" v-model="state.tooltip" :transition="state.transition" standard-protocol :open-on-hover="false" :open-on-focus="false" @after-enter="state.tooltipEnters++" @after-leave="state.tooltipLeaves++"><template #activator="{ props }"><UButton v-bind="props">Tooltip</UButton></template>Tooltip content</UTooltip>
    </main></UApp>
</template>`);
const report = { checks: [], errors: [], warnings: [], sourceSha256: Object.fromEntries(await Promise.all(['src/ui/UOverlay.vue', 'src/ui/UiDialog.vue', 'src/ui/UiMenu.vue', 'src/ui/UiTooltip.vue', 'src/ui/overlay-transition.ts', 'src/ui/overlay-appearance.ts', 'src/ui/UiMaybeTransition.vue', 'src/ui/styles.css', 'src/ui/feedback.css', 'src/ui/layout-components.css'].map(async file => [file, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])) ) };
const vite = await createServer({ root, appType: 'mpa', cacheDir: path.join(evidence, 'vite-cache'), logLevel: 'error', optimizeDeps: { noDiscovery: true, entries: [path.relative(root, path.join(fixture, 'main.ts'))], include: ['highlight.js/lib/core', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] }, resolve: { dedupe: ['vue'] }, server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } } });
let browser;
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (['warning', 'error'].includes(message.type())) report.warnings.push(message.text()); });
    await page.addInitScript(() => {
        window.presentationErrors = [];
        window.addEventListener('error', event => window.presentationErrors.push(event.message));
        window.addEventListener('unhandledrejection', event => window.presentationErrors.push(String(event.reason)));
    });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/full-alignment/overlay-presentation-protocols/fixture/index.html`);
    await page.waitForFunction(() => !!window.overlayPresentation?.overlay.value);
    async function set(values) { await page.evaluate(values => Object.assign(window.overlayPresentation.state, values), values); }
    async function open(which) {
        await set({ [which]: true });
        await page.waitForFunction(which => which === 'tooltip' ? window.overlayPresentation.state.tooltipEnters > window.overlayPresentation.state.tooltipLeaves : window.overlayPresentation[which].value.contentEl?.dataset.state === 'open', which);
    }
    async function close(which) {
        await set({ [which]: false });
        await page.waitForFunction(which => which === 'tooltip' ? window.overlayPresentation.state.tooltipEnters === window.overlayPresentation.state.tooltipLeaves : window.overlayPresentation[which].value.contentEl?.dataset.state === 'closed', which);
    }
    async function appearance(which) {
        return page.evaluate(which => {
            const el = window.overlayPresentation[which].value.contentEl;
            const scrim = el.closest('.ui-overlay-layer')?.querySelector('.ui-overlay-scrim');
            const css = scrim ? getComputedStyle(scrim) : getComputedStyle(el, '::backdrop');
            return { color: css.backgroundColor, opacity: css.opacity, blur: css.backdropFilter, modal: el.matches(':modal'), display: getComputedStyle(el).display };
        }, which);
    }
    for (const which of ['overlay', 'dialog', 'menu', 'tooltip']) {
        if (which === 'menu' || which === 'tooltip') continue;
        await open(which);
        let css = await appearance(which);
        assert.equal(css.modal, false);
        assert.match(css.color, /^rgba\(38, 38, 36, 0\.2[34]\d?\)$/);
        await set({ scrim: '#a02030', opacity: 0.4 });
        css = await appearance(which);
        assert.equal(css.color, 'rgb(160, 32, 48)');
        assert.equal(css.opacity, '0.4');
        await set({ scrim: false });
        css = await appearance(which);
        assert.equal(css.color, 'rgba(0, 0, 0, 0)');
        assert.equal(css.blur, 'none');
        await close(which);
        await set({ scrim: undefined, opacity: undefined });
        report.checks.push(`${which}: default backdrop preserved; explicit string, opacity and false consumed`);
    }
    for (const which of ['overlay', 'dialog', 'menu', 'tooltip']) {
        for (const transition of [false, 'scale-transition']) {
            await set({ transition });
            await open(which);
            assert.notEqual((await appearance(which)).display, 'none');
            await close(which);
        }
        await page.evaluate(() => { window.overlayPresentation.state.transition = window.overlayPresentation.jsTransition; window.overlayPresentation.state.hooks = []; });
        await open(which);
        await close(which);
        const hooks = await page.evaluate(() => [...window.overlayPresentation.state.hooks]);
        assert.deepEqual(hooks, ['beforeEnter', 'enter', 'afterEnter', 'beforeLeave', 'leave', 'afterLeave']);
        await page.evaluate(() => {
            const api = window.overlayPresentation;
            api.state.hooks = [];
            api.state.transition = { ...api.jsTransition, component: api.customTransition };
        });
        await open(which);
        await close(which);
        assert.deepEqual(await page.evaluate(() => [...window.overlayPresentation.state.hooks]), hooks);
        report.checks.push(`${which}: false, named and JS object transitions complete before lifecycle events`);
    }
    report.errors.push(...await page.evaluate(() => window.presentationErrors));
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.warnings, []);
    await page.screenshot({ path: path.join(evidence, 'wide.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.overlayPresentation.state.dark = true);
    await page.waitForFunction(() => document.querySelector('.ui-app')?.dataset.theme === 'dark');
    await page.waitForTimeout(220);
    await page.screenshot({ path: path.join(evidence, 'narrow-dark.png'), fullPage: true });
    await page.getByRole('button', { name: '打开对话框', exact: true }).click();
    await page.locator('.ui-dialog[data-state="open"]').waitFor();
    await page.screenshot({ path: path.join(evidence, 'narrow-dark-dialog.png'), fullPage: true });
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await page.waitForFunction(() => [...document.querySelectorAll('.ui-dialog')].every(el => !el.open));
    console.log(`overlay presentation protocols: ${report.checks.length} groups passed`);
} catch (error) {
    report.failure = error.stack ?? String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    await browser?.close();
    await vite.close();
}
