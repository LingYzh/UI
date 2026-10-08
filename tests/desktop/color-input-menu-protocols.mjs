import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/color-input-menu-protocols');
await mkdir(evidence, { recursive: true });

const sourceFiles = [
    'src/ui/UColorInput.vue',
    'src/ui/UColorPicker.vue',
    'src/ui/UConfirmEdit.vue',
    'src/ui/UiMenu.vue',
    'src/ui/UiControlFrame.vue',
    'src/ui/form.ts',
    'src/ui/color-model.ts',
    'src/ui/index.ts'
];

async function sourceHashes() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
        file,
        createHash('sha256').update(await readFile(file)).digest('hex')
    ])));
}

const fixture = `<!doctype html>
<html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="app"></div>
<script type="module">
    import { createApp, defineComponent, h, reactive, ref, nextTick } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        main: { r: 20, g: 40, b: 60, a: 0.4 },
        mainMenu: false,
        mainEvents: [],
        live: { r: 40, g: 80, b: 120, a: 0.4 },
        liveHideActions: false,
        blocked: { r: 25, g: 50, b: 75, a: 0.5 },
        blockedDisabled: false,
        blockedReadonly: false,
        slot: '#123456',
        slotMenu: false,
        native: { r: 10, g: 20, b: 30, a: 0.35 },
        unmountFocus: false
    });
    const originalMain = state.main;
    const refs = {
        main: ref(),
        live: ref(),
        blocked: ref(),
        custom: ref(),
        native: ref(),
        tab: ref(),
        cleanup: ref()
    };
    const activeDocumentFocusListeners = new Set();
    const originalAddEventListener = document.addEventListener;
    const originalRemoveEventListener = document.removeEventListener;
    document.addEventListener = function(type, listener, options) {
        if (type === 'focusin' && listener) activeDocumentFocusListeners.add(listener);
        return originalAddEventListener.call(this, type, listener, options);
    };
    document.removeEventListener = function(type, listener, options) {
        if (type === 'focusin' && listener) activeDocumentFocusListeners.delete(listener);
        return originalRemoveEventListener.call(this, type, listener, options);
    };

    const stateObject = value => value && value.__v_isRef ? value.value : value;
    const getPicker = name => refs[name].value?.picker;
    const pickerHsv = name => stateObject(getPicker(name)?.hsv);
    const pickerMode = name => stateObject(getPicker(name)?.mode);
    const app = createApp(defineComponent({
        setup() {
            return () => h('main', { id: 'color-input-fixture' }, [
                h('section', { id: 'main-region' }, [
                    h(UI.UColorInput, {
                        id: 'main-input',
                        ref: refs.main,
                        label: 'Draft color',
                        modelValue: state.main,
                        'onUpdate:modelValue': value => { state.main = value; },
                        menu: state.mainMenu,
                        'onUpdate:menu': value => { state.mainMenu = value; },
                        openOnFocus: true,
                        pipLocation: 'append-inner',
                        pickerProps: { mode: 'rgba', hideCanvas: true, hideEyeDropper: true, showSwatches: false },
                        menuProps: {
                            openDelay: 0,
                            placement: 'top-end',
                            scrollStrategy: 'none',
                            contentProps: { class: 'main-menu-custom', 'data-color-menu': 'main', 'aria-label': 'Main color menu' }
                        },
                        cancelText: 'Discard color',
                        okText: 'Apply color',
                        onSave: value => { state.mainEvents.push({ type: 'save', value }); },
                        onCancel: () => { state.mainEvents.push({ type: 'cancel' }); }
                    }),
                    h('button', { id: 'after-main', type: 'button' }, 'After main input')
                ]),
                h('section', { id: 'live-region' }, [
                    h(UI.UColorInput, {
                        id: 'live-input',
                        ref: refs.live,
                        modelValue: state.live,
                        'onUpdate:modelValue': value => { state.live = value; },
                        hideActions: state.liveHideActions,
                        pickerProps: { mode: 'rgba', hideCanvas: true, hideEyeDropper: true, showSwatches: false },
                        menuProps: { openDelay: 0 }
                    })
                ]),
                h('section', { id: 'blocked-region' }, [
                    h(UI.UColorInput, {
                        id: 'blocked-input',
                        ref: refs.blocked,
                        modelValue: state.blocked,
                        'onUpdate:modelValue': value => { state.blocked = value; },
                        disabled: state.blockedDisabled,
                        readonly: state.blockedReadonly,
                        pickerProps: { mode: 'rgba', hideCanvas: true, hideEyeDropper: true, showSwatches: false },
                        menuProps: { openDelay: 0 }
                    })
                ]),
                h('section', { id: 'custom-region' }, [
                    h(UI.UColorInput, {
                        id: 'custom-input',
                        ref: refs.custom,
                        modelValue: state.slot,
                        'onUpdate:modelValue': value => { state.slot = value; },
                        menu: state.slotMenu,
                        'onUpdate:menu': value => { state.slotMenu = value; },
                        menuProps: {
                            openDelay: 0,
                            location: 'bottom-end',
                            scrollStrategy: 'none',
                            contentProps: { class: 'slot-menu-custom', 'data-color-menu': 'slot' }
                        },
                        pickerProps: { mode: 'rgba' }
                    }, {
                        picker: scope => h('div', { class: 'custom-picker-slot' }, [
                            h('output', { id: 'custom-picker-model' }, JSON.stringify(stateObject(scope.model))),
                            h('button', {
                                id: 'custom-picker-update',
                                type: 'button',
                                onClick: () => scope.update({ r: 70, g: 90, b: 110, a: 0.65 })
                            }, 'Update custom draft')
                        ]),
                        actions: scope => h('div', { class: 'custom-color-actions' }, [
                            h('button', { id: 'custom-cancel', type: 'button', onClick: scope.cancel }, 'Slot cancel'),
                            h('button', { id: 'custom-save', type: 'button', onClick: scope.save }, 'Slot save')
                        ])
                    })
                ]),
                h('section', { id: 'native-region' }, [
                    h(UI.UColorInput, {
                        id: 'native-input',
                        ref: refs.native,
                        nativePicker: true,
                        modelValue: state.native,
                        'onUpdate:modelValue': value => { state.native = value; }
                    })
                ]),
                h('section', { id: 'hidden-pip-region' }, [
                    h(UI.UColorInput, { id: 'hidden-pip-input', hidePip: true, modelValue: '#224466' })
                ]),
                h('section', { id: 'tab-region' }, [
                    h(UI.UColorInput, {
                        id: 'tab-input',
                        ref: refs.tab,
                        openOnFocus: true,
                        pickerProps: { hideCanvas: true, hideSliders: true, hideInputs: true, hideEyeDropper: true, modes: [] },
                        menuProps: { openDelay: 0 }
                    }),
                    h('button', { id: 'tab-outside', type: 'button' }, 'Outside tab target')
                ]),
                state.unmountFocus ? null : h('section', { id: 'cleanup-region' }, [
                    h(UI.UColorInput, {
                        id: 'cleanup-input',
                        ref: refs.cleanup,
                        openOnFocus: true,
                        hideActions: true,
                        pickerProps: { hideCanvas: true, hideSliders: true, hideInputs: true, hideEyeDropper: true, modes: [] },
                        menuProps: { openDelay: 0 }
                    })
                ]),
                h('button', { id: 'outside-focus', type: 'button' }, 'Outside focus')
            ]);
        }
    }));
    app.config.errorHandler = (error, instance, info) => {
        window.__vueErrors.push({ message: String(error?.message || error), info });
    };
    app.config.warnHandler = message => window.__vueWarnings.push(String(message));
    window.__vueErrors = [];
    window.__vueWarnings = [];
    app.use(UI.createUI());
    app.mount('#app');

    window.colorInputProtocol = {
        state,
        registry: { colorInput: Boolean(UI.UColorInput), colorPicker: Boolean(UI.UColorPicker), menu: Boolean(UI.UMenu), confirmEdit: Boolean(UI.UConfirmEdit) },
        async flush() { await nextTick(); await nextTick(); await new Promise(resolve => setTimeout(resolve, 0)); },
        mainReferenceIsOriginal() { return state.main === originalMain; },
        mainPickerMode() { return pickerMode('main'); },
        mainPickerHsv() { return pickerHsv('main'); },
        livePickerHsv() { return pickerHsv('live'); },
        updateMainPicker(value) { return getPicker('main')?.update(value); },
        updateLivePicker(value) { return getPicker('live')?.update(value); },
        updateBlockedPicker(value) { return getPicker('blocked')?.update(value); },
        updateNative(value) { return refs.native.value?.updateNative(value); },
        updateBlocked(value) { Object.assign(state, value); },
        activeFocusListenerCount() { return activeDocumentFocusListeners.size; },
        isExposed(name) { return Boolean(refs[name].value); }
    };
</script></body></html>`;

const server = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: 'error',
    cacheDir: path.join(evidence, 'vite-cache'),
    plugins: [
        (await import('@vitejs/plugin-vue')).default(),
        {
            name: 'color-input-menu-protocol-fixture',
            configureServer(vite) {
                vite.middlewares.use((request, response, next) => {
                    if (request.url?.split('?')[0] !== '/color-input-menu-protocols') return next();
                    response.setHeader('Content-Type', 'text/html; charset=utf-8');
                    vite.transformIndexHtml('/color-input-menu-protocols', fixture)
                        .then(html => response.end(html))
                        .catch(next);
                });
            }
        }
    ],
    resolve: { dedupe: ['vue'] },
    optimizeDeps: {
        entries: [],
        noDiscovery: true,
        include: [
            'vue',
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
    server: {
        host: '127.0.0.1',
        port: 0,
        hmr: false,
        watch: { ignored: ['**/artifacts/**', '**/node_modules/**'] }
    }
});

const report = {
    method: 'Vite fixture importing public src/ui/index.ts and Chromium DOM interactions',
    generatedAt: new Date().toISOString(),
    evidence,
    visualAcceptance: false,
    sourceHashesBefore: await sourceHashes(),
    checks: [],
    vueErrors: [],
    vueWarnings: [],
    pageErrors: [],
    browserConsoleIssues: []
};
let browser;

try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) report.browserConsoleIssues.push(message.text());
    });
    page.on('requestfailed', request => report.browserConsoleIssues.push(`request failed: ${request.url()} ${request.failure()?.errorText || ''}`));
    await page.goto(server.resolvedUrls.local[0] + 'color-input-menu-protocols');
    await page.waitForFunction(() => Boolean(window.colorInputProtocol));

    const flush = () => page.evaluate(() => window.colorInputProtocol.flush());
    const state = () => page.evaluate(() => JSON.parse(JSON.stringify(window.colorInputProtocol.state)));
    const openSurface = async selector => {
        await page.waitForFunction(value => document.querySelector(value)?.matches(':popover-open') === true, selector, { timeout: 5000 });
    };
    const closedSurface = async selector => {
        await page.waitForFunction(value => !document.querySelector(value)?.matches(':popover-open'), selector, { timeout: 5000 });
        await flush();
    };
    const setRange = async (selector, value) => {
        await page.locator(selector).evaluate((element, next) => {
            element.value = String(next);
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);
        await flush();
    };
    const mainSurface = '.ui-color-input-menu[data-color-menu="main"]';

    assert.deepEqual(await page.evaluate(() => window.colorInputProtocol.registry), { colorInput: true, colorPicker: true, menu: true, confirmEdit: true });
    assert.equal(await page.locator('#main-region .ui-color-pip').count(), 1);
    assert.equal(await page.locator('#main-region input[type="color"]').count(), 0);
    assert.equal(await page.locator('#main-region .ui-color-picker').count(), 0, 'picker content is lazy before opening');
    assert.equal(await page.locator('#main-region .ui-color-input').count(), 1);
    assert.ok(await page.locator('#main-region .ui-color-input').evaluate(element => element.classList.contains('is-pip-end')));
    await page.locator('#main-region .ui-color-pip').click();
    await openSurface(mainSurface);
    await flush();
    assert.equal(await page.locator('#main-region .ui-color-picker').count(), 1);
    assert.equal(await page.locator('#main-input').getAttribute('aria-expanded'), 'true');
    assert.equal((await state()).mainMenu, true, 'v-model:menu follows the real popover');
    assert.equal(await page.evaluate(() => window.colorInputProtocol.mainPickerMode()), 'rgba');
    assert.equal(await page.locator(mainSurface).getAttribute('data-placement'), 'top-end');
    assert.equal(await page.locator(mainSurface).getAttribute('data-color-menu'), 'main');
    assert.ok((await page.locator(mainSurface).getAttribute('class')).includes('main-menu-custom'));
    assert.ok(await page.locator(mainSurface).getAttribute('aria-label'), 'the menu keeps an accessible name');
    assert.equal(await page.locator(mainSurface).getAttribute('popover'), 'auto');
    assert.equal(await page.evaluate(() => window.colorInputProtocol.activeFocusListenerCount()), 1, 'open menu installs one document focus listener');
    report.checks.push('default pip opens lazy UiMenu popover; v-model:menu, pickerProps, menuProps content attributes, location and focus listener are live');

    const initialMain = (await state()).main;
    assert.deepEqual(initialMain, { r: 20, g: 40, b: 60, a: 0.4 });
    const mainRanges = '.ui-color-input-menu[data-color-menu="main"] .ui-color-channel input[type="range"]';
    assert.equal(await page.locator(mainRanges).count(), 4, 'rgba mode includes an alpha range');
    await setRange(`${mainRanges} >> nth=3`, 80);
    let draftHsv = await page.evaluate(() => window.colorInputProtocol.mainPickerHsv());
    assert.ok(Math.abs(draftHsv.a - 0.8) < 0.02, `alpha draft was ${draftHsv.a}`);
    assert.deepEqual((await state()).main, initialMain, 'picker changes stay in the edit draft before save');
    assert.equal(await page.evaluate(() => window.colorInputProtocol.mainReferenceIsOriginal()), true, 'nested source model object remains the same reference during draft edits');
    report.checks.push('object RGBA alpha edits use the deep-cloned draft and do not mutate the parent model');

    await page.evaluate(() => { window.colorInputProtocol.state.main = { r: 128, g: 64, b: 32, a: 0.25 }; });
    await flush();
    const externallyUpdated = (await state()).main;
    assert.deepEqual(externallyUpdated, { r: 128, g: 64, b: 32, a: 0.25 });
    draftHsv = await page.evaluate(() => window.colorInputProtocol.mainPickerHsv());
    assert.ok(Math.abs(draftHsv.a - 0.25) < 0.02, 'external model replacement resets the open draft and its alpha');
    await setRange(`${mainRanges} >> nth=3`, 90);
    assert.deepEqual((await state()).main, externallyUpdated, 'new draft still does not mutate externally replaced model');
    await page.getByRole('button', { name: 'Discard color' }).click();
    await closedSurface(mainSurface);
    assert.deepEqual((await state()).main, externallyUpdated, 'cancel restores the latest external model');
    assert.equal((await state()).mainEvents.at(-1).type, 'cancel');
    report.checks.push('external model replacement resets the live draft; cancel restores the latest value and emits cancel');

    await page.locator('#after-main').focus();
    await page.locator('#main-input').focus();
    await openSurface(mainSurface);
    await setRange(`${mainRanges} >> nth=3`, 75);
    await page.getByRole('button', { name: 'Apply color' }).click();
    await closedSurface(mainSurface);
    await page.waitForTimeout(20);
    const savedState = await state();
    assert.ok(Math.abs(savedState.main.a - 0.75) < 0.02, 'save commits the alpha-adjusted object model');
    assert.notEqual(await page.evaluate(() => window.colorInputProtocol.mainReferenceIsOriginal()), true, 'saved value is a cloned object, not the original input object');
    assert.equal(savedState.mainEvents.at(-1).type, 'save');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-input', 'save restores focus to the color input');
    assert.equal(savedState.mainMenu, false, 'openOnFocus does not reopen the popover after save restores focus');
    report.checks.push('save commits the cloned RGBA object, emits save, closes the menu and suppresses openOnFocus during focus restoration');

    const liveSurface = '#live-region .ui-color-input-menu';
    await page.locator('#live-region .ui-color-pip').click();
    await openSurface(liveSurface);
    assert.equal(await page.locator(`${liveSurface} .u-confirm-actions button`).count(), 2);
    await page.evaluate(() => { window.colorInputProtocol.state.liveHideActions = true; });
    await flush();
    assert.equal(await page.locator(`${liveSurface} .u-confirm-actions button`).count(), 0, 'hideActions updates immediately while open');
    const liveRanges = `${liveSurface} .ui-color-channel input[type="range"]`;
    await setRange(`${liveRanges} >> nth=3`, 68);
    assert.ok(Math.abs((await state()).live.a - 0.68) < 0.02, 'hideActions applies picker edits directly to the model');
    await page.keyboard.press('Escape');
    await closedSurface(liveSurface);
    report.checks.push('dynamic hideActions removes buttons immediately and switches picker updates to immediate model writes');

    await page.locator('#blocked-region .ui-color-pip').click();
    const blockedSurface = '#blocked-region .ui-color-input-menu';
    await openSurface(blockedSurface);
    await page.evaluate(() => { window.colorInputProtocol.updateBlocked({ blockedDisabled: true }); });
    await closedSurface(blockedSurface);
    assert.equal(await page.locator('#blocked-region .ui-color-pip').isDisabled(), true);
    assert.equal(await page.locator('#blocked-input').isDisabled(), true);
    await page.evaluate(() => { window.colorInputProtocol.updateBlocked({ blockedDisabled: false }); });
    await flush();
    await page.locator('#blocked-region .ui-color-pip').click();
    await openSurface(blockedSurface);
    await page.evaluate(() => { window.colorInputProtocol.updateBlocked({ blockedReadonly: true }); });
    await closedSurface(blockedSurface);
    assert.equal(await page.locator('#blocked-input').getAttribute('readonly'), '');
    assert.equal(await page.locator('#blocked-region .ui-color-pip').isDisabled(), true);
    assert.deepEqual((await state()).blocked, { r: 25, g: 50, b: 75, a: 0.5 });
    report.checks.push('disabled and readonly changes close the open menu, disable the pip, and preserve the model');

    await page.locator('#custom-region .ui-color-pip').click();
    const slotSurface = '.ui-color-input-menu[data-color-menu="slot"]';
    await openSurface(slotSurface);
    assert.ok((await page.locator(slotSurface).getAttribute('class')).includes('slot-menu-custom'));
    assert.equal(await page.locator(slotSurface).getAttribute('data-placement'), 'bottom-end');
    assert.equal(await page.locator(slotSurface).getAttribute('data-color-menu'), 'slot');
    assert.equal(await page.locator(`${slotSurface} .custom-picker-slot`).count(), 1);
    assert.equal(await page.locator(`${slotSurface} .u-confirm-actions`).count(), 0, 'custom actions replace default actions');
    assert.equal(await page.locator(`${slotSurface} #custom-cancel`).count(), 1);
    assert.equal(await page.locator(`${slotSurface} #custom-save`).count(), 1);
    await page.locator('#custom-picker-update').click();
    assert.equal((await state()).slot, '#123456', 'custom picker slot edits remain a draft');
    assert.match(await page.locator('#custom-picker-model').textContent(), /"a":0\.65/);
    await page.locator('#custom-save').click();
    await closedSurface(slotSurface);
    assert.deepEqual((await state()).slot, { r: 70, g: 90, b: 110, a: 0.65 });
    report.checks.push('picker/actions slots receive the edit scope; custom actions suppress defaults and save through the public menu');

    assert.equal(await page.locator('#hidden-pip-region .ui-color-pip').count(), 0);
    assert.equal(await page.locator('#hidden-pip-region input[type="color"]').count(), 0, 'hidePip hides the pip without enabling native picker');
    assert.equal(await page.locator('#native-region .ui-color-pip').count(), 0);
    assert.equal(await page.locator('#native-region input[type="color"]').count(), 1, 'native color input exists only with explicit nativePicker');
    assert.equal(await page.locator('#native-region .ui-menu-surface').count(), 0, 'nativePicker skips the custom menu');
    await page.evaluate(() => window.colorInputProtocol.updateNative('#336699'));
    await flush();
    const native = (await state()).native;
    assert.deepEqual(Object.keys(native).sort(), ['a', 'b', 'g', 'r']);
    assert.ok(Math.abs(native.r - 51) < 0.1 && Math.abs(native.g - 102) < 0.1 && Math.abs(native.b - 153) < 0.1);
    assert.equal(native.a, 0.35, 'explicit native picker preserves the object model family and alpha');
    report.checks.push('hidePip and pipLocation are consumed; explicit nativePicker keeps the native input and preserves RGBA object/alpha');

    const tabSurface = '#tab-region .ui-color-input-menu';
    await page.locator('#tab-input').focus();
    await openSurface(tabSurface);
    let tabLeft = false;
    for (let index = 0; index < 12; index++) {
        await page.keyboard.press('Tab');
        await flush();
        const activeId = await page.evaluate(() => document.activeElement?.id || '');
        if (activeId === 'tab-outside' || activeId === 'outside-focus') { tabLeft = true; break; }
    }
    assert.equal(tabLeft, true, 'Tab leaves the field and popover');
    await closedSurface(tabSurface);
    await page.locator('#tab-input').focus();
    await openSurface(tabSurface);
    await page.locator('#tab-input').focus();
    await page.keyboard.press('Escape');
    await closedSurface(tabSurface);
    assert.equal((await state()).mainMenu, false);
    report.checks.push('openOnFocus opens on keyboard focus; tabbing fully out and Escape both close the menu');

    const focusBaseline = await page.evaluate(() => window.colorInputProtocol.activeFocusListenerCount());
    await page.locator('#cleanup-input').focus();
    const cleanupSurface = '#cleanup-region .ui-color-input-menu';
    await openSurface(cleanupSurface);
    assert.equal(await page.evaluate(() => window.colorInputProtocol.activeFocusListenerCount()), focusBaseline + 1);
    await page.evaluate(() => { window.colorInputProtocol.state.unmountFocus = true; });
    await flush();
    assert.equal(await page.evaluate(() => window.colorInputProtocol.activeFocusListenerCount()), focusBaseline, 'unmount removes the global focus listener');
    await page.locator('#outside-focus').focus();
    await flush();
    assert.equal(await page.evaluate(() => window.colorInputProtocol.activeFocusListenerCount()), focusBaseline);
    report.checks.push('unmounting an open ColorInput removes its document focusin listener with no ghost handler');

    report.vueErrors = await page.evaluate(() => window.__vueErrors);
    report.vueWarnings = await page.evaluate(() => window.__vueWarnings);
    assert.deepEqual(report.vueErrors, []);
    assert.deepEqual(report.vueWarnings, []);
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.browserConsoleIssues, []);
    report.status = 'passed';
} catch (error) {
    report.status = 'failed';
    report.failure = String(error?.stack || error);
    throw error;
} finally {
    report.sourceHashesAfter = await sourceHashes();
    report.sourceHashesUnchanged = JSON.stringify(report.sourceHashesBefore) === JSON.stringify(report.sourceHashesAfter);
    if (browser) await browser.close();
    await server.close();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    if (report.status === 'passed' && !report.sourceHashesUnchanged) throw new Error('Relevant component sources changed during the protocol run; hashes differ.');
    process.stdout.write(JSON.stringify({ status: report.status, checks: report.checks, evidence, sourceHashesUnchanged: report.sourceHashesUnchanged, vueErrors: report.vueErrors, vueWarnings: report.vueWarnings }, null, 2));
}
