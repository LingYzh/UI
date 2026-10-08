import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/selection-menu-protocols');
const fixtureDirectory = path.join(evidence, 'fixture');
const screenshotDirectory = path.join(evidence, 'screenshots');
await mkdir(fixtureDirectory, { recursive: true });
await mkdir(screenshotDirectory, { recursive: true });

const sourceFiles = [
    'src/ui/UAutocomplete.vue',
    'src/ui/UCombobox.vue',
    'src/ui/UiSelect.vue',
    'src/ui/UiSelectNative.vue',
    'src/ui/UDateInput.vue',
    'src/ui/UDatePicker.vue',
    'src/ui/UiMenu.vue',
    'src/ui/UVirtualScroll.vue',
    'src/ui/autocomplete-props.ts',
    'src/ui/selection.ts',
    'src/ui/selection-filter.ts',
    'src/ui/use-virtual-scroll.ts',
    'src/ui/date-model.ts',
    'src/ui/date-input-format.ts',
    'src/ui/overlay-position.ts',
    'src/ui/overlay-back.ts',
    'src/ui/overlay-lifecycle.ts',
    'src/ui/dimensions.ts',
    'src/ui/docs/SelectionMenuDemo.vue',
    'src/ui/docs/LiveExample.vue',
    'src/ui/index.ts',
    'src/ui/styles.css',
    'src/ui/forms-components.css',
    'src/ui/data-components.css',
    'src/docs-base.css'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

const sourceSha256 = await hashSources();
const html = `<!doctype html>
<html lang="zh-Hant">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="data:,">
        <title>Selection menu protocols</title>
        <style>
            html, body, #app { height: auto !important; min-height: 100%; overflow: visible !important; }
            body { min-height: 2200px; padding: 18px; }
            #fixture-main { display: grid; gap: 20px; max-width: 1100px; margin: 0 auto; min-width: 0; }
            .fixture-controls { display: grid; gap: 16px; min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
            #position-target { position: absolute; top: 600px; left: 600px; width: 160px; height: 32px; }
            #close-target { position: absolute; top: 1150px; left: 40px; width: 140px; height: 30px; }
            #block-target { position: absolute; top: 1300px; left: 40px; width: 140px; height: 30px; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/artifacts/full-alignment/selection-menu-protocols/fixture/main.ts"></script>
    </body>
</html>`;

const main = `import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';
import { createRouter, createWebHistory } from '/artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js';
import * as UI from '/src/ui/index.ts';
import SelectionMenuDemo from '/src/ui/docs/SelectionMenuDemo.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';

const state = reactive({ advanced: 'v-90', advancedSearch: '', eager: null, close: null, block: null, listPointer: 0, noAutoScroll: false });
const router = createRouter({
    history: createWebHistory('/__selection_menu__/'),
    routes: [{ path: '/:page', component: { render: () => null } }]
});
const items = Array.from({ length: 160 }, (_, index) => ({ title: 'Option ' + index, value: 'v-' + index }));
const advancedRef = ref();
const eagerRef = ref();
const closeRef = ref();
const blockRef = ref();
const focusDate = ref(new Date(2026, 9, 9));
const persistentDate = ref(new Date(2026, 9, 9));
const persistentDateRef = ref();
const Root = defineComponent({
    setup() {
        return () => h('main', { id: 'fixture-main' }, [
            h(SelectionMenuDemo),
            h('section', { class: 'fixture-controls', 'data-fixture-controls': '' }, [
                h('div', { id: 'position-target', 'aria-hidden': 'true' }),
                h('div', { id: 'close-target', 'aria-hidden': 'true' }),
                h('div', { id: 'block-target', 'aria-hidden': 'true' }),
                h('button', { id: 'outside-click', type: 'button' }, 'Outside click target'),
                h(UI.UAutocomplete, {
                    ref: advancedRef,
                    modelValue: state.advanced,
                    'onUpdate:modelValue': value => state.advanced = value,
                    search: state.advancedSearch,
                    'onUpdate:search': value => state.advancedSearch = value,
                    items,
                    label: 'Advanced selection',
                    style: { width: '220px' },
                    autoSelectFirst: false,
                    noAutoScroll: state.noAutoScroll,
                    'data-advanced-autocomplete': '',
                    menuProps: {
                        location: 'bottom-start', locationStrategy: 'connected', target: '#position-target',
                        offset: [12, 4], width: 280, maxHeight: 180, viewportMargin: 12,
                        contentClass: 'selection-custom-surface', contentProps: { 'data-content-probe': 'advanced' },
                        scrollStrategy: 'reposition', closeOnBack: false, eager: false
                    },
                    listProps: {
                        role: 'listbox', 'aria-label': 'Advanced option list', class: 'selection-custom-list',
                        'data-list-probe': 'advanced',
                        onPointerdownCapture: () => state.listPointer++
                    }
                }),
                h(UI.UAutocomplete, {
                    ref: eagerRef,
                    modelValue: state.eager,
                    'onUpdate:modelValue': value => state.eager = value,
                    items: [{ title: 'Eager option', value: 'eager' }, { title: 'Second eager option', value: 'eager-2' }],
                    label: 'Eager content',
                    'data-eager-autocomplete': '',
                    menuProps: { eager: true, scrollStrategy: 'block', closeOnBack: false, location: 'bottom-start', locationStrategy: 'connected' }
                }),
                h(UI.UAutocomplete, {
                    ref: closeRef,
                    modelValue: state.close,
                    'onUpdate:modelValue': value => state.close = value,
                    items: [{ title: 'Close on scroll', value: 'close' }],
                    label: 'Close on scroll',
                    'data-close-autocomplete': '',
                    menuProps: { scrollStrategy: 'close', location: 'bottom-start', locationStrategy: 'connected' }
                }),
                h(UI.UAutocomplete, {
                    ref: blockRef,
                    modelValue: state.block,
                    'onUpdate:modelValue': value => state.block = value,
                    items: [{ title: 'Block scroll', value: 'block' }],
                    label: 'Block scroll',
                    'data-block-autocomplete': '',
                    menuProps: { eager: true, scrollStrategy: 'block', closeOnBack: false, location: 'bottom-start', locationStrategy: 'connected' }
                }),
                h(UI.UDateInput, {
                    modelValue: focusDate.value,
                    'onUpdate:modelValue': value => focusDate.value = value,
                    label: 'Open date on input focus', openOnFocus: true, hideActions: false,
                    'data-focus-date': '',
                    menuProps: { location: 'bottom-start', locationStrategy: 'connected', closeOnBack: false }
                }),
                h(UI.UDateInput, {
                    ref: persistentDateRef,
                    modelValue: persistentDate.value,
                    'onUpdate:modelValue': value => persistentDate.value = value,
                    label: 'Persistent date', hideActions: false,
                    'data-persistent-date': '',
                    menuProps: { persistent: true, location: 'bottom-start', locationStrategy: 'connected', closeOnBack: false }
                }),
                h(UI.UiSelect, {
                    id: 'native-select-control', label: 'Native select compatibility',
                    items: [{ value: 'legacy', label: 'Legacy label' }, { value: 'other', label: 'Other label' }],
                    modelValue: 'legacy', 'onUpdate:modelValue': () => {}, 'data-native-select': ''
                })
            ])
        ]);
    }
});
const ui = UI.createUI();
const app = createApp(Root);
app.use(ui);
app.use(router);
app.mount('#app');
await router.isReady();
window.selectionMenuProbe = {
    state, router, app,
    closePersistentDate: () => persistentDateRef.value?.cancel(),
    setNoAutoScroll: value => { state.noAutoScroll = value; },
    theme: value => ui.theme.change(value, false),
    flush: async () => { await nextTick(); await nextTick(); },
    read: () => ({ ...state, route: router.currentRoute.value.fullPath })
};`;

await writeFile(path.join(fixtureDirectory, 'main.ts'), main, 'utf8');
const vite = await createServer({
    appType: 'custom',
    logLevel: 'error',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json',
            'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist',
            'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'
        ]
    },
    server: { host: '127.0.0.1', port: 0, hmr: false }
});
vite.middlewares.use('/__selection_menu__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await vite.transformIndexHtml('/__selection_menu__', html));
});

const report = {
    generatedAt: new Date().toISOString(),
    routerVersion: '4.6.3',
    checks: [],
    screenshots: [],
    errors: [],
    warnings: [],
    sourceSha256,
    visualAcceptance: false
};
let browser;
let page;
function passed(name, evidenceText) {
    report.checks.push({ name, evidence: evidenceText });
}
function assertWithinViewport(rect, width, height, margin = 1) {
    assert.ok(rect.width > 0 && rect.height > 0, `menu must be visible: ${JSON.stringify(rect)}`);
    assert.ok(rect.left >= -margin && rect.top >= -margin, `menu starts outside viewport: ${JSON.stringify(rect)}`);
    assert.ok(rect.right <= width + margin && rect.bottom <= height + margin, `menu ends outside viewport: ${JSON.stringify(rect)}`);
}

try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => report.errors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') report.errors.push(line);
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.warnings.push(line);
    });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/__selection_menu__/one`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.selectionMenuProbe);
    await page.waitForSelector('[data-selection-menu-demo]');
    const demo = page.locator('[data-selection-menu-demo]');
    const openSurface = () => page.locator('.ui-menu-surface:popover-open').last();
    const currentSurfaceRect = async () => openSurface().evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    const checkDemoPopup = async (field, kind) => {
        const input = demo.locator(field);
        if (kind === 'date') {
            await demo.locator('.u-date-input button[aria-label="打开日历"]').click();
        } else if (kind === 'select') {
            await input.click();
        } else {
            await input.focus();
        }
        await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open'));
        const surface = openSurface();
        const bounds = await currentSurfaceRect();
        assertWithinViewport(bounds, 1200, 900, 2);
        const font = await surface.evaluate(element => getComputedStyle(element).fontFamily);
        assert.ok(font && !/Times New Roman/i.test(font), `${kind} popup should use docs typography, got ${font}`);
        if (kind !== 'date') {
            assert.equal(await input.evaluate(element => document.activeElement === element), true, `${kind} trigger keeps focus on its input`);
            assert.equal(await input.getAttribute('aria-haspopup'), 'listbox');
            assert.equal(await input.evaluate(element => element.getAttribute('aria-activedescendant')), null, `${kind} starts without an active descendant`);
            assert.equal(await surface.locator('.is-active').count(), 0, `${kind} does not highlight a first item by default`);
            const controls = await input.getAttribute('aria-controls');
            const actualList = page.locator(`#${controls}`);
            assert.equal(await actualList.getAttribute('role'), 'listbox', `${kind} aria-controls points at the rendered listbox`);
        } else {
            const active = await page.evaluate(() => document.activeElement?.outerHTML ?? '');
            assert.ok(active && active !== '<body></body>', 'date activator keeps focus in the date control or popup');
        }
        return { input, surface, bounds, font };
    };

    assert.equal(await page.locator('[data-native-select]').evaluate(element => element.tagName), 'SELECT', 'plain label/value select still uses the native select path');
    passed('public fixture mounts the live demo and preserves the native select branch', 'SelectionMenuDemo.vue is mounted through the public index; simple label/value items without menuProps remain a native SELECT.');

    const auto = await checkDemoPopup('input[data-menu-autocomplete]', 'autocomplete');
    assert.equal(await auto.surface.getAttribute('data-menu-demo'), 'autocomplete');
    await auto.input.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    assert.equal(await auto.input.evaluate(element => document.activeElement === element), true, 'Escape leaves focus on the autocomplete input');
    await auto.input.click();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open[data-menu-demo="autocomplete"]'));
    passed('autocomplete reopens by clicking its already-focused input', 'Escape closes the popup without moving focus; a real click on that same focused input reopens it.');
    await auto.input.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.ui-menu-surface')).every(element => element.getAttribute('data-state') === 'closed'));
    const combo = await checkDemoPopup('input[data-menu-combobox]', 'combobox');
    await combo.input.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    assert.equal(await combo.input.evaluate(element => document.activeElement === element), true, 'Escape leaves focus on the combobox input');
    await combo.input.click();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open[aria-multiselectable="true"]'));
    passed('combobox reopens by clicking its already-focused input', 'Escape closes the popup without moving focus; a real click on that same focused input reopens it.');
    await combo.input.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.ui-menu-surface')).every(element => element.getAttribute('data-state') === 'closed'));
    const select = await checkDemoPopup('input[data-menu-select]', 'select');
    assert.equal(await select.input.getAttribute('readonly'), '');
    await select.input.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.ui-menu-surface')).every(element => element.getAttribute('data-state') === 'closed'));
    const date = await checkDemoPopup('input[data-menu-date]', 'date');
    assert.equal(await demo.locator('input[data-menu-date]').inputValue(), '2026-10-09');
    await date.surface.locator('[data-date="2026-10-12"]').click();
    await date.surface.locator('[data-date="2026-10-14"]').click();
    assert.equal(await demo.locator('input[data-menu-date]').inputValue(), '2026-10-09', 'date picker edits a draft before Save');
    await date.surface.getByRole('button', { name: '取消', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    assert.equal(await demo.locator('input[data-menu-date]').inputValue(), '2026-10-09', 'Cancel restores the committed Date model');
    assert.match(await demo.locator('output').innerText(), /2026[\/.]10[\/.]9/);
    passed('real demo opens all four public consumers and cancels a date draft', 'Autocomplete, Combobox, menu-backed UiSelect, and UDateInput popups fit the 1200×900 viewport and use docs typography; list inputs retain focus with no default active option, and date Cancel leaves 2026-10-09 committed.');

    const focusDateInput = page.locator('input[data-focus-date]');
    await focusDateInput.click();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open')?.classList.contains('u-date-input-menu'));
    assert.equal(await focusDateInput.getAttribute('aria-expanded'), null, 'DateInput relies on its activator button, not a fabricated combobox role');
    await page.locator('#outside-click').click();
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('.ui-menu-surface:popover-open')).some(element => element.classList.contains('u-date-input-menu')));
    await focusDateInput.click();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.ui-menu-surface:popover-open')).some(element => element.classList.contains('u-date-input-menu')));
    await focusDateInput.press('Escape');
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('.ui-menu-surface:popover-open')).some(element => element.classList.contains('u-date-input-menu')));
    const persistentDateInput = page.locator('input[data-persistent-date]');
    await page.locator('[data-persistent-date]').locator('..').locator('button[aria-label="打开日历"]').click();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.ui-menu-surface:popover-open')).some(element => element.classList.contains('u-date-input-menu')));
    await page.locator('#outside-click').click();
    assert.equal(await page.locator('.u-date-input-menu:popover-open').count(), 1, 'persistent DateInput remains open after outside click');
    await persistentDateInput.press('Escape');
    assert.equal(await page.locator('.u-date-input-menu:popover-open').count(), 1, 'persistent DateInput remains open after Escape');
    await page.evaluate(() => window.selectionMenuProbe.closePersistentDate());
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('.u-date-input-menu:popover-open')).length);
    passed('DateInput focus opening, custom outside/Escape closing, and persistent guard', 'A pointer click that focuses the input keeps its openOnFocus menu; outside click and Escape close a normal menu, while persistent=true rejects both close requests.');

    const advanced = page.locator('input[data-advanced-autocomplete]');
    await advanced.focus();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open[data-list-probe="advanced"]'));
    const advancedSurface = page.locator('.ui-menu-surface:popover-open[data-list-probe="advanced"]');
    const advancedList = advancedSurface;
    assert.equal(await advancedList.getAttribute('role'), 'listbox');
    assert.equal(await advancedList.getAttribute('aria-label'), 'Advanced option list');
    assert.ok((await advancedList.getAttribute('class')).includes('selection-custom-list'));
    assert.equal(await advancedSurface.getAttribute('data-content-probe'), 'advanced');
    assert.ok((await advancedSurface.getAttribute('class')).includes('selection-custom-surface'));
    const advancedControls = await advanced.getAttribute('aria-controls');
    assert.equal(await advancedSurface.getAttribute('id'), advancedControls, 'aria-controls resolves to the actual generated listbox id');
    assert.equal(await advancedSurface.getAttribute('role'), 'listbox');
    await page.waitForFunction(() => {
        const surface = document.querySelector('.ui-menu-surface:popover-open');
        return surface?.scrollTop > 0 && surface.querySelector('[data-index="90"]');
    });
    assert.equal(await advanced.getAttribute('aria-activedescendant'), null, 'selected-item auto-scroll does not mark it active');
    assert.equal(await advancedSurface.locator('.is-active').count(), 0);
    await advanced.press('ArrowDown');
    await page.waitForFunction(() => {
        const input = document.querySelector('input[data-advanced-autocomplete]');
        const active = input?.getAttribute('aria-activedescendant');
        return active && document.getElementById(active)?.getAttribute('data-index') === '0';
    });
    assert.equal(await advancedSurface.locator('[data-index="0"]').getAttribute('role'), 'option', 'keyboard active descendant remains mounted by virtual scrolling');
    passed('keyboard navigation scrolls virtualized options without moving focus', 'ArrowDown sets the real option as aria-activedescendant and virtual scrolling mounts it while focus remains in the combobox input.');
    const advancedGeometry = await currentSurfaceRect();
    assert.ok(Math.abs(advancedGeometry.width - 280) < 2, `menu width prop is consumed: ${JSON.stringify(advancedGeometry)}`);
    assert.ok(advancedGeometry.height <= 182, `maxHeight bounds the real menu: ${JSON.stringify(advancedGeometry)}`);
    await advancedSurface.locator('[role="option"]').first().dispatchEvent('pointerdown');
    assert.equal(await page.evaluate(() => window.selectionMenuProbe.state.listPointer), 1, 'listProps custom pointer event reaches the actual menu list');
    passed('menuProps and listProps are consumed by the rendered listbox', 'The live surface reflects target, offset, width/maxHeight, contentClass/contentProps, list role/ARIA/class, and custom pointer capture; selected option 90 scrolls into view without becoming the active option.');

    await page.evaluate(() => {
        document.querySelector('#position-target').style.top = `${window.scrollY + 500}px`;
        window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(80);
    const initialScrollY = await page.evaluate(() => window.scrollY);
    const initialTarget = await page.locator('#position-target').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, left: rect.left };
    });
    const beforeScrollRect = await currentSurfaceRect();
    assert.ok(Math.abs((beforeScrollRect.top - initialTarget.bottom) - 12) < 2, `offset main-axis gap is honored: ${JSON.stringify({ beforeScrollRect, initialTarget })}`);
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.waitForFunction(previousY => window.scrollY !== previousY, initialScrollY);
    await page.waitForTimeout(80);
    const scrolledY = await page.evaluate(() => window.scrollY);
    const scrolledTarget = await page.locator('#position-target').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, left: rect.left };
    });
    const afterScrollRect = await currentSurfaceRect();
    assert.ok(Math.abs((scrolledTarget.top - initialTarget.top) + (scrolledY - initialScrollY)) < 3, 'absolute target rect changes by the document scroll amount');
    assert.ok(Math.abs((afterScrollRect.top - beforeScrollRect.top) - (scrolledTarget.top - initialTarget.top)) < 3, `reposition follows its external target through scroll: ${JSON.stringify({ beforeScrollRect, afterScrollRect, initialTarget, scrolledTarget, initialScrollY, scrolledY })}`);
    assert.ok(Math.abs(afterScrollRect.left - scrolledTarget.left) < 5, 'external selector target controls horizontal alignment');
    passed('connected positioning follows an external target during document scroll', `Target movement ${scrolledTarget.top - initialTarget.top}px produced the same menu movement ${afterScrollRect.top - beforeScrollRect.top}px.`);

    await page.evaluate(() => window.selectionMenuProbe.router.push('/__selection_menu__/two'));
    await page.waitForFunction(() => window.selectionMenuProbe.read().route.endsWith('/two'));
    await page.evaluate(() => history.back());
    await page.waitForFunction(() => window.selectionMenuProbe.read().route.endsWith('/one'));
    assert.equal(await page.locator('.ui-menu-surface:popover-open').count(), 1, 'closeOnBack=false keeps the menu open while browser history navigates');
    passed('menu closeOnBack=false leaves navigation in control', 'Vue Router 4.6.3 returned to the previous route while the menu stayed open.');

    await page.evaluate(() => {
        const target = document.querySelector('#position-target');
        target.style.top = `${window.scrollY + window.innerHeight - 28}px`;
        target.style.left = '880px';
        window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(100);
    const flipTarget = await page.locator('#position-target').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
    });
    const flipped = await currentSurfaceRect();
    assert.ok(flipped.bottom <= flipTarget.top + 1, `connected menu flips above a near-bottom target: ${JSON.stringify({ flipped, flipTarget })}`);
    await page.setViewportSize({ width: 390, height: 700 });
    await page.evaluate(() => {
        const target = document.querySelector('#position-target');
        target.style.left = '210px';
        window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(100);
    const narrowRect = await currentSurfaceRect();
    assertWithinViewport(narrowRect, 390, 700, 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'narrow menu does not cause horizontal document overflow');
    passed('connected placement flips and clamps after resize', `Near-bottom target flipped above itself; after resizing to 390×700, the menu stayed within ${JSON.stringify(narrowRect)}.`);

    await advanced.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.waitForTimeout(350);
    assert.equal(await advancedSurface.locator('[role="option"]').count(), 0, 'lazy menu unmounts option slot content after leave');
    passed('lazy content is removed after the leave transition', 'The menu surface remains available for the activator protocol while its option slot content is unmounted after 350 ms.');

    await page.evaluate(() => window.selectionMenuProbe.setNoAutoScroll(true));
    await advanced.evaluate(element => element.blur());
    await advanced.focus();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open [data-index="0"]'));
    await page.waitForTimeout(80);
    assert.equal(await advancedSurface.evaluate(element => element.scrollTop), 0, 'noAutoScroll leaves the virtual list at its initial position');
    assert.equal(await advancedSurface.locator('[data-index="90"]').count(), 0, 'noAutoScroll does not jump to the selected distant item');
    await advanced.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.waitForTimeout(350);
    await page.evaluate(() => window.selectionMenuProbe.setNoAutoScroll(false));
    passed('noAutoScroll suppresses selected-item virtual scrolling', 'With value v-90 selected, enabling noAutoScroll keeps scrollTop at zero and leaves that distant row outside the rendered window.');

    const eager = page.locator('input[data-eager-autocomplete]');
    const eagerSurface = () => page.locator('.ui-menu-surface').filter({ has: page.getByText('Eager option', { exact: true }) }).first();
    assert.equal(await page.getByText('Eager option', { exact: true }).count(), 1, 'eager content is rendered before opening');
    await eager.focus();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open [role="option"]'));
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'block scroll strategy locks body scrolling while open');
    await eager.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.waitForTimeout(350);
    assert.equal(await page.getByText('Eager option', { exact: true }).count(), 1, 'eager menu retains slot content after leave');
    assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'block scroll strategy restores body overflow after leave');
    assert.ok(await eagerSurface().count());
    passed('eager and block policies survive close', 'Eager option DOM exists both before open and after leave; block temporarily locks body overflow and restores it.');

    const closeOnScroll = page.locator('input[data-close-autocomplete]');
    await closeOnScroll.focus();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open [data-index="0"]'));
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    passed('scrollStrategy=close responds to page scroll', 'An open menu with close strategy closes when the document scrolls.');

    await demo.locator('input[data-menu-autocomplete]').focus();
    await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open'));
    const dpr1 = await page.evaluate(() => window.devicePixelRatio);
    assert.equal(dpr1, 1, 'CSS zoom coverage uses normal DPR so it does not conflate pixel density with CSS zoom');
    await demo.locator('input[data-menu-autocomplete]').press('Escape');
    await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.evaluate(() => window.selectionMenuProbe.theme('light'));
    const lightPath = path.join(screenshotDirectory, 'selection-menu-light-1200.png');
    await demo.screenshot({ path: lightPath });
    report.screenshots.push({ name: 'light-1200', path: lightPath, viewport: '1200x900 CSS px, DPR 1' });

    await page.evaluate(() => window.selectionMenuProbe.theme('dark'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(120);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'real demo has no horizontal overflow at 390 CSS px');
    const darkPath = path.join(screenshotDirectory, 'selection-menu-dark-390.png');
    await demo.screenshot({ path: darkPath });
    report.screenshots.push({ name: 'dark-390', path: darkPath, viewport: '390x844 CSS px, DPR 1' });

    await page.evaluate(() => {
        document.querySelector('.fixture-controls').style.display = 'none';
        window.selectionMenuProbe.theme('light');
        document.body.style.zoom = '125%';
    });
    await page.waitForTimeout(120);
    const zoomMetrics = await page.evaluate(() => {
        const demo = document.querySelector('[data-selection-menu-demo]');
        const rect = demo.getBoundingClientRect();
        return {
            viewportWidth: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            demoLeft: rect.left,
            demoRight: rect.right,
            demoWidth: rect.width,
            zoom: getComputedStyle(document.body).zoom
        };
    });
    assert.equal(zoomMetrics.zoom, '1.25');
    assert.ok(zoomMetrics.documentWidth <= zoomMetrics.viewportWidth, `real demo overflows horizontally at CSS zoom: ${JSON.stringify(zoomMetrics)}`);
    assert.ok(zoomMetrics.bodyWidth <= zoomMetrics.viewportWidth, `body overflows horizontally at CSS zoom: ${JSON.stringify(zoomMetrics)}`);
    assert.ok(zoomMetrics.demoLeft >= 0 && zoomMetrics.demoRight <= zoomMetrics.viewportWidth, `demo leaves viewport at CSS zoom: ${JSON.stringify(zoomMetrics)}`);
    const zoomPath = path.join(screenshotDirectory, 'selection-menu-light-390-csszoom125.png');
    await demo.screenshot({ path: zoomPath });
    report.screenshots.push({ name: 'light-390-csszoom125', path: zoomPath, viewport: '390x844 CSS px, DPR 1, body CSS zoom 125%' });
    passed('real docs demo fits mobile CSS zoom', JSON.stringify(zoomMetrics));
    await page.evaluate(() => { document.body.style.zoom = ''; });

    const captureOpenDemo = async ({ name, theme, width, height, selector, date = false, zoom = false }) => {
        await page.setViewportSize({ width, height });
        await page.evaluate(({ nextTheme, nextZoom }) => {
            window.selectionMenuProbe.theme(nextTheme);
            document.body.style.zoom = nextZoom ? '125%' : '';
            window.scrollTo(0, 0);
        }, { nextTheme: theme, nextZoom: zoom });
        await page.waitForTimeout(120);
        const activator = demo.locator(selector);
        await activator.scrollIntoViewIfNeeded();
        if (date) {
            await demo.locator('button[aria-label="打开日历"]').click();
        } else {
            await activator.click();
        }
        await page.waitForFunction(() => !!document.querySelector('.ui-menu-surface:popover-open'));
        const surface = openSurface();
        await page.waitForFunction(() => document.querySelector('.ui-menu-surface:popover-open')?.getAttribute('data-state') === 'open');
        await page.waitForTimeout(250);
        const visibleContentCount = date
            ? await surface.locator('[data-date]').count()
            : await surface.locator('[role="option"]').count();
        assert.ok(visibleContentCount > 0, `${name} popup has rendered selectable content before capture`);
        const evidence = await surface.evaluate(element => {
            const rect = element.getBoundingClientRect();
            const token = getComputedStyle(document.documentElement).getPropertyValue('--font').trim()
                || getComputedStyle(document.body).getPropertyValue('--font').trim();
            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                fontFamily: getComputedStyle(element).fontFamily,
                bodyFontFamily: getComputedStyle(document.body).fontFamily,
                fontToken: token,
                zoom: getComputedStyle(document.body).zoom
            };
        });
        assertWithinViewport(evidence, width, height, 2);
        assert.ok(evidence.fontToken, `--font token is defined for ${name}`);
        assert.equal(evidence.fontFamily, evidence.bodyFontFamily, `${name} popup inherits the docs --font family`);
        const screenshotPath = path.join(screenshotDirectory, `${name}.png`);
        await page.screenshot({ path: screenshotPath });
        report.screenshots.push({
            name,
            path: screenshotPath,
            viewport: `${width}x${height} CSS px, DPR 1${zoom ? ', body CSS zoom 125%' : ''}`,
            theme,
            popupOpen: true,
            visibleContentCount,
            fontFamily: evidence.fontFamily,
            fontToken: evidence.fontToken,
            popupBounds: { left: evidence.left, top: evidence.top, right: evidence.right, bottom: evidence.bottom }
        });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('.ui-menu-surface:popover-open'));
        await page.waitForTimeout(350);
        return evidence;
    };

    const openPopupFonts = [];
    openPopupFonts.push(await captureOpenDemo({
        name: 'selection-menu-autocomplete-open-light-1200', theme: 'light', width: 1200, height: 900,
        selector: 'input[data-menu-autocomplete]'
    }));
    openPopupFonts.push(await captureOpenDemo({
        name: 'selection-menu-combobox-open-light-390', theme: 'light', width: 390, height: 844,
        selector: 'input[data-menu-combobox]'
    }));
    openPopupFonts.push(await captureOpenDemo({
        name: 'selection-menu-select-open-light-390-csszoom125', theme: 'light', width: 390, height: 844,
        selector: 'input[data-menu-select]', zoom: true
    }));
    openPopupFonts.push(await captureOpenDemo({
        name: 'selection-menu-date-open-dark-390', theme: 'dark', width: 390, height: 844,
        selector: 'input[data-menu-date]', date: true
    }));
    passed('open real-demo popovers are captured in viewport screenshots', JSON.stringify(openPopupFonts.map(({ fontFamily, fontToken, zoom }) => ({ fontFamily, fontToken, zoom }))));

    assert.deepEqual(report.errors, [], 'no browser runtime errors occurred');
    assert.deepEqual(report.warnings, [], 'no Vue warnings occurred');
    const finalHashes = await hashSources();
    assert.deepEqual(finalHashes, sourceSha256, 'product sources stayed unchanged during the test');
    report.sourceStable = true;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    process.stdout.write(`selection menu protocols: ${report.checks.length} checks passed; screenshots=${report.screenshots.length}; evidence=${evidence}\n`);
} catch (error) {
    report.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    if (page) {
        try {
            report.failureState = await page.evaluate(() => ({
                route: window.selectionMenuProbe?.read().route,
                openMenus: Array.from(document.querySelectorAll('.ui-menu-surface:popover-open')).map(element => ({
                    id: element.id, role: element.getAttribute('role'), className: element.className,
                    rect: (() => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; })()
                })),
                selectionInputs: Array.from(document.querySelectorAll('input[data-menu-autocomplete], input[data-menu-combobox], input[data-menu-select], input[data-menu-date]')).map(element => ({
                    html: element.outerHTML,
                    parent: element.parentElement?.parentElement?.outerHTML.slice(0, 2400),
                    wrapperText: element.closest('.ui-control-frame')?.innerText
                })),
                menuSurfaces: Array.from(document.querySelectorAll('.ui-menu-surface')).map(element => ({
                    id: element.id, role: element.getAttribute('role'), className: element.className,
                    open: element.matches(':popover-open'), text: element.innerText.slice(0, 180), children: element.children.length
                })),
                activeElement: document.activeElement?.outerHTML,
                state: window.selectionMenuProbe?.read()
            }));
        } catch (stateError) {
            report.failureStateError = stateError instanceof Error ? stateError.message : String(stateError);
        }
    }
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    throw error;
} finally {
    await browser?.close();
    await vite.close();
}
