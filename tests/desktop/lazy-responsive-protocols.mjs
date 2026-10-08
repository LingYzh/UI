import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/lazy-responsive-protocols');
await mkdir(evidence, { recursive: true });
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
    body { min-height: 2200px; margin: 0; padding: 24px; }
    #app { width: min(1200px, 100%); margin: 0 auto; }
    main { display: grid; gap: 20px; min-width: 0; }
    .fixture-panel { display: grid; gap: 16px; min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    .fixture-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }
    .fixture-grid > * { min-width: 0; }
    .responsive-probe { min-width: 0; }
    .responsive-probe .u-responsive { background: var(--soft); }
    .content-probe { min-width: 0; min-height: 24px; }
    .custom-transition { min-width: 0; }
    #real-demos { display: grid; gap: 24px; min-width: 0; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    @media (max-width: 640px) { body { padding: 12px; } .fixture-grid { grid-template-columns: minmax(0, 1fr); } }
</style></head><body><div id="observer-root"></div><div id="observer-root-next"></div><div id="app"></div><script type="module">
    import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import TooltipDemo from '/src/ui/docs/component-examples/tooltip.vue';
    import LazyDemo from '/src/ui/docs/component-examples/lazy.vue';
    import ResponsiveDemo from '/src/ui/docs/component-examples/responsive.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const NativeIntersectionObserver = window.IntersectionObserver;
    class ControlledObserver {
        static instances = [];
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.target = undefined;
            this.connected = true;
            this.nativeObserver = undefined;
            ControlledObserver.instances.push(this);
        }
        observe(target) {
            this.target = target;
            if (target.closest('[data-demo-component="ULazy"]') && NativeIntersectionObserver) {
                this.nativeObserver = new NativeIntersectionObserver(this.callback, this.options);
                this.nativeObserver.observe(target);
            }
        }
        disconnect() { this.connected = false; this.nativeObserver?.disconnect(); }
        fire(isIntersecting, force = false) {
            if (!this.target || !this.connected && !force) return;
            this.callback([{ target: this.target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }], this);
        }
    }
    window.ControlledObserver = ControlledObserver;
    window.IntersectionObserver = ControlledObserver;

    const state = reactive({
        lazyModel: false,
        lazyOnceModel: false,
        lazyDisabled: true,
        lazyDisabledModel: false,
        cleanupMounted: true,
        noIoMounted: false,
        lazyOptions: { root: document.querySelector('#observer-root'), rootMargin: '12px', threshold: 0.25 },
        lazyOnceOptions: { root: document.querySelector('#observer-root'), rootMargin: '20px', threshold: 0.5 },
        lazyUpdates: [],
        lazyIntersections: [],
        onceUpdates: [],
        disabledUpdates: [],
        counterObjectActive: false,
        counterStringActive: false,
        counterFalseActive: true,
        counterCustomActive: true,
        counterReducedActive: false,
        transitionEvents: [],
        reducedTransitionEvents: []
    });
    const CustomTransition = defineComponent({
        name: 'FixtureCustomTransition',
        props: { disabled: Boolean, appear: Boolean },
        setup(props, { slots }) {
            return () => h('div', {
                class: 'custom-transition',
                'data-disabled': String(props.disabled),
                'data-appear': String(props.appear)
            }, slots.default?.());
        }
    });

    function lazy(id, props, updateKey, extraSlots = {}) {
        return h(UI.ULazy, {
            key: id,
            id,
            class: 'lazy-extra-class',
            'data-native-attr': 'kept',
            ...props,
            'onUpdate:modelValue': value => { if (updateKey) state[updateKey] = value; if (updateKey === 'lazyModel') state.lazyUpdates.push(value); if (updateKey === 'lazyOnceModel') state.onceUpdates.push(value); if (updateKey === 'lazyDisabledModel') state.disabledUpdates.push(value); },
            onIntersect: entry => { if (updateKey === 'lazyModel') state.lazyIntersections.push({ id: entry.target.id, intersecting: entry.isIntersecting }); }
        }, {
            default: ({ visible }) => h('span', { id: id + '-content', class: 'content-probe', 'data-visible': String(visible) }, id + ' content'),
            placeholder: () => h('span', { id: id + '-placeholder', class: 'content-probe' }, id + ' placeholder'),
            ...extraSlots
        });
    }
    function responsive(id, props, options = {}) {
        return h(UI.UResponsive, { key: id, id, class: 'responsive-probe', ...props }, {
            default: scope => h('span', { id: id + '-content', 'data-ratio': scope.ratio == null ? '' : String(scope.ratio) }, id + ' content'),
            additional: () => h('span', { id: id + '-additional' }, id + ' additional'),
            ...options
        });
    }

    const app = createApp({ render() {
        return h('main', [
            h(TooltipDemo),
            h('section', { id: 'real-demos' }, [h(LazyDemo), h(ResponsiveDemo)]),
            h('section', { class: 'fixture-panel fixture-grid', id: 'lazy-contracts' }, [
                lazy('lazy-controlled', { tag: 'section', modelValue: state.lazyModel, once: false, options: state.lazyOptions, width: 320, height: '84px', minWidth: '240', maxWidth: 360, minHeight: 64, maxHeight: '96px' }, 'lazyModel'),
                lazy('lazy-once', { modelValue: state.lazyOnceModel, once: true, options: state.lazyOnceOptions }, 'lazyOnceModel'),
                lazy('lazy-disabled', { modelValue: state.lazyDisabledModel, disabled: state.lazyDisabled, once: true }, 'lazyDisabledModel'),
                state.cleanupMounted ? lazy('lazy-cleanup', { once: false }) : null,
                state.noIoMounted ? lazy('lazy-no-io', { once: false, transition: false }) : null,
                lazy('lazy-transition-false', { disabled: true, transition: false }),
                lazy('lazy-transition-string', { transition: 'u-scale' }),
                lazy('lazy-transition-object', { disabled: true, transition: { component: CustomTransition } })
            ]),
            h('section', { class: 'fixture-panel', id: 'responsive-contracts' }, [
                h('div', { id: 'responsive-inline-row' }, [
                    responsive('responsive-numeric', { aspectRatio: 1.5, width: 300, height: 200, minWidth: 100, maxWidth: '360px', minHeight: 50, maxHeight: '300', contentClass: ['ratio-array', { 'ratio-object': true, 'ratio-disabled': false }], inline: true }),
                    h('span', { id: 'responsive-inline-text' }, ' next to inline content '),
                    h('span', { id: 'responsive-inline-peer', style: { display: 'inline-block', width: '32px', height: '24px', verticalAlign: 'middle' } }, 'peer')
                ]),
                h('div', { class: 'fixture-grid', id: 'responsive-display-cases' }, [
                    responsive('responsive-string', { aspectRatio: '16/9', width: '320', minWidth: '280px' }),
                    responsive('responsive-inferred', { width: 400, height: 200 }),
                    responsive('responsive-invalid', { aspectRatio: '0/3', width: 'auto', height: 'fit-content' }),
                    responsive('responsive-invalid-text', { aspectRatio: 'not-a-ratio' })
                ])
            ]),
            h('section', { class: 'fixture-panel fixture-grid', id: 'counter-contracts' }, [
                h('div', { id: 'counter-default-host' }, h(UI.UCounter, { id: 'counter-default', value: 8, max: 8 }, {})),
                h('div', { id: 'counter-unicode-host' }, h(UI.UCounter, { id: 'counter-unicode', value: 'A😀B', max: 2 }, {})),
                h('div', { id: 'counter-value-host' }, h(UI.UCounter, { id: 'counter-value', value: '剩余 8 个', max: 10, displayMode: 'value' }, {})),
                h('div', { id: 'counter-disabled-host' }, h(UI.UCounter, { id: 'counter-disabled', value: 4, max: 2, disabled: true }, {})),
                h('div', { id: 'counter-slot-host' }, h(UI.UCounter, { id: 'counter-slot', value: 'A😀B', max: 5 }, {
                    default: ({ counter, max, value }) => h('output', { id: 'counter-slot-output', 'data-counter': counter, 'data-max': String(max), 'data-value': String(value) }, 'slot')
                })),
                h('div', { id: 'counter-object-host' }, h(UI.UCounter, { id: 'counter-object', active: state.counterObjectActive, value: 2, transition: {
                    css: false,
                    onEnter: (_element, done) => { state.transitionEvents.push('enter'); done(); },
                    onLeave: (_element, done) => { state.transitionEvents.push('leave'); done(); }
                } }, {})),
                h('div', { id: 'counter-string-host' }, h(UI.UCounter, { id: 'counter-string', active: state.counterStringActive, value: 2, transition: 'u-scale' }, {})),
                h('div', { id: 'counter-false-host' }, h(UI.UCounter, { id: 'counter-false', active: state.counterFalseActive, value: 2, transition: false }, {})),
                h('div', { id: 'counter-custom-host' }, h(UI.UCounter, { id: 'counter-custom', active: state.counterCustomActive, value: 2, transition: { component: CustomTransition } }, {})),
                h('div', { id: 'counter-reduced-host' }, h(UI.UCounter, { id: 'counter-reduced', active: state.counterReducedActive, value: 2, transition: {
                    name: 'u-fade',
                    onEnter: (element, done) => { state.reducedTransitionEvents.push({ type: 'enter', className: element.className }); done(); }
                } }, {}))
            ]),
            h('section', { class: 'fixture-panel fixture-grid', id: 'appearance-contracts' }, [
                h('div', { id: 'appearance-field-number-host' }, h(UI.UField, { id: 'appearance-field-number', rounded: 8 }, { default: ({ props }) => h('input', { ...props, 'aria-label': 'numeric rounded field' }) })),
                h('div', { id: 'appearance-field-corners-host' }, h(UI.UField, { id: 'appearance-field-corners', rounded: 's-lg te-pill' }, { default: ({ props }) => h('input', { ...props, 'aria-label': 'corner rounded field' }) })),
                h('div', { id: 'appearance-picker-host' }, h(UI.UPicker, { id: 'appearance-picker', border: 's-md e-lg', rounded: 'ts-lg be-pill', width: 260, title: 'picker styles' }, { default: () => h('span', 'picker content') })),
                h('div', { id: 'appearance-hotkey-host' }, h(UI.UHotkey, { id: 'appearance-hotkey', keys: 'Ctrl+K', platform: 'windows', displayMode: 'text', listen: false, border: 't-sm b-lg', rounded: 'circle' }))
            ])
        ]);
    } });
    const ui = UI.createUI();
    app.use(ui);
    const lazyStringTransitionClasses = [];
    const lazyStringTransitionObserver = new MutationObserver(records => {
        for (const record of records) {
            const root = document.getElementById('lazy-transition-string');
            const className = String(record.target.className);
            if (root && root.contains(record.target) && (className.includes('u-scale-enter-') || className.includes('u-scale-appear-'))) lazyStringTransitionClasses.push(className);
        }
    });
    lazyStringTransitionObserver.observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] });
    app.mount('#app');

    window.lazyResponsiveProtocol = {
        state,
        lazyStringTransitionClasses: () => [...new Set(lazyStringTransitionClasses)],
        registry: {
            publicExports: ['ULazy', 'UResponsive', 'UCounter', 'UField', 'UPicker', 'UHotkey', 'UTooltip'].every(name => Boolean(UI[name])),
            globalNames: ['u-lazy', 'u-responsive', 'u-counter', 'u-field', 'u-picker', 'u-hotkey', 'u-tooltip'].map(name => [name, Boolean(app.component(name))])
        },
        observers: id => ControlledObserver.instances.filter(observer => observer.target?.id === id).map(observer => ({ connected: observer.connected, root: observer.options.root?.id ?? null, rootMargin: observer.options.rootMargin, threshold: observer.options.threshold })),
        realLazyObservers: () => ControlledObserver.instances.filter(observer => observer.target?.closest('[data-demo-component="ULazy"]')).map(observer => ({
            connected: observer.connected,
            rootClass: observer.options.root?.className ?? null,
            rootMargin: observer.options.rootMargin,
            threshold: observer.options.threshold
        })),
        fire(id, index, isIntersecting, force = false) {
            const observer = ControlledObserver.instances.filter(item => item.target?.id === id)[index];
            if (!observer) throw new Error('Missing observer ' + id + ':' + index);
            observer.fire(isIntersecting, force);
        },
        async flush() { await nextTick(); await nextTick(); },
        async mountWithoutObserver() {
            const original = window.IntersectionObserver;
            window.IntersectionObserver = undefined;
            state.noIoMounted = true;
            await nextTick(); await nextTick();
            window.IntersectionObserver = original;
        },
        unmountCleanup() { state.cleanupMounted = false; },
        setReducedMotion(value) { document.documentElement.dataset.reducedMotion = String(value); },
        async activateStringCounter() {
            const host = document.querySelector('#counter-string-host');
            const classes = [];
            const observer = new MutationObserver(() => {
                const counter = host.querySelector('.ui-counter');
                if (counter) classes.push(counter.className);
            });
            observer.observe(host, { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] });
            state.counterStringActive = true;
            await nextTick();
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            observer.disconnect();
            return [...new Set(classes)];
        },
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
        name: 'lazy-responsive-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__lazy-responsive-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__lazy-responsive-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/ULazy.vue',
    'src/ui/UResponsive.vue',
    'src/ui/UiMaybeTransition.vue',
    'src/ui/UCounter.vue',
    'src/ui/appearance.ts',
    'src/ui/UField.vue',
    'src/ui/UPicker.vue',
    'src/ui/UHotkey.vue',
    'src/ui/UiScrollArea.vue',
    'src/ui/UiSwitch.vue',
    'src/ui/UImg.vue',
    'src/ui/UNoSsr.vue',
    'src/ui/UiTooltip.vue',
    'src/ui/docs/component-examples/tooltip.vue',
    'src/ui/docs/component-examples/lazy.vue',
    'src/ui/docs/component-examples/responsive.vue'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));
await server.listen();

const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__lazy-responsive-protocols`
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
let app;
let page;
const errors = [];
let lazyStringClasses = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron',
    evidence,
    sourceSha256,
    registry: {},
    lazy: {},
    responsive: {},
    counter: {},
    appearance: {},
    realDemos: {},
    tooltipDemo: {},
    screenshots: [],
    errors
};

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function flush() {
    await page.evaluate(() => window.lazyResponsiveProtocol.flush());
    await settle();
}

async function updateState(values) {
    await page.evaluate(next => Object.assign(window.lazyResponsiveProtocol.state, next), values);
    await flush();
}

async function waitFor(expression, argument) {
    await page.waitForFunction(expression, argument, { timeout: 5000 });
}

async function waitForObserverCount(id, count) {
    await waitFor(({ id, count }) => window.lazyResponsiveProtocol.observers(id).length === count, { id, count });
}

async function prepareTooltipCapture(theme, width, height, file) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width, height });
    await page.evaluate(async name => {
        await window.lazyResponsiveProtocol.setTheme(name);
        window.scrollTo(0, 0);
        for (const element of document.querySelectorAll('*')) {
            element.scrollTop = 0;
            element.scrollLeft = 0;
        }
    }, theme);
    await settle();
    const trigger = page.getByRole('button', { name: '标准插槽提示' });
    await trigger.scrollIntoViewIfNeeded();
    const alreadyOpen = await page.evaluate(() => [...document.querySelectorAll('[data-demo-component="UTooltip"] .ui-tooltip')].some(element => element.getAttribute('aria-hidden') === 'false'));
    if (!alreadyOpen) await trigger.click();
    await page.waitForFunction(() => [...document.querySelectorAll('[data-demo-component="UTooltip"] .ui-tooltip')].some(element => element.getAttribute('aria-hidden') === 'false' && element.textContent.includes('可用 activator 和内容插槽配置提示。')));
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle();
    await page.screenshot({ path: path.join(evidence, file), fullPage: true, animations: 'disabled', caret: 'hide' });
    report.screenshots.push({ file, component: 'UTooltip', state: 'standard activator open', theme, viewport: { width, height }, capture: 'fullPage', zoom: 1 });
}

async function prepareRealDemoCapture(theme, width, height, file) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width, height });
    await page.evaluate(async name => {
        await window.lazyResponsiveProtocol.setTheme(name);
        window.scrollTo(0, 0);
        for (const element of document.querySelectorAll('*')) {
            element.scrollTop = 0;
            element.scrollLeft = 0;
        }
    }, theme);
    await settle();
    const realDemos = page.locator('#real-demos');
    await realDemos.waitFor({ state: 'visible' });
    await realDemos.screenshot({ path: path.join(evidence, file), animations: 'disabled', caret: 'hide' });
    report.screenshots.push({ file, component: 'ULazy + UResponsive', state: 'lazy placeholder after reset; responsive examples visible', theme, viewport: { width, height }, capture: 'locator', zoom: 1 });
}

async function moveRealLazyIntoView(visible) {
    const viewport = page.locator('[data-demo-component="ULazy"] .ui-scroll-viewport');
    await viewport.evaluate((element, shouldBeVisible) => {
        if (!shouldBeVisible) {
            element.scrollTop = 0;
            return;
        }
        const target = element.querySelector('.u-lazy');
        if (!target) throw new Error('Real ULazy demo target is missing');
        const root = element.getBoundingClientRect();
        const child = target.getBoundingClientRect();
        element.scrollTop += child.top - root.top - (element.clientHeight - target.offsetHeight) / 2;
    }, visible);
    await settle();
}

async function waitForRealLazyModel(value) {
    await waitFor(expected => {
        const output = document.querySelector('[data-demo-component="ULazy"] output');
        return Boolean(output && output.textContent.includes(`modelValue：${expected}`));
    }, value);
}

async function exerciseRealDemos() {
    const lazyDemo = page.locator('[data-demo-component="ULazy"]');
    const responsiveDemo = page.locator('[data-demo-component="UResponsive"]');
    const output = lazyDemo.locator('output');
    await lazyDemo.waitFor({ state: 'visible' });
    await responsiveDemo.waitFor({ state: 'visible' });
    await moveRealLazyIntoView(false);
    await waitFor(() => window.lazyResponsiveProtocol.realLazyObservers().some(observer => observer.connected));

    const initial = {
        output: await output.textContent(),
        placeholder: await lazyDemo.getByText('等待进入视口…').count(),
        image: await lazyDemo.locator('img[alt="延迟显示的山丘图形"]').count(),
        observer: await page.evaluate(() => window.lazyResponsiveProtocol.realLazyObservers())
    };
    assert.match(initial.output ?? '', /modelValue：false/);
    assert.equal(initial.placeholder, 1, 'real ULazy demo starts with its placeholder');
    assert.equal(initial.image, 0, 'real ULazy image is not mounted before scrolling into view');
    assert.ok(initial.observer.some(observer => observer.connected && observer.rootClass?.includes('ui-scroll-viewport')), 'real ULazy observer uses its scroll-area viewport as root');

    await moveRealLazyIntoView(true);
    await waitForRealLazyModel(true);
    await page.waitForFunction(() => {
        const image = document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]');
        return Boolean(image && image.complete && image.naturalWidth > 0);
    });
    const firstEntryCount = Number((await output.textContent())?.match(/进入观察区域 (\d+) 次/)?.[1] ?? 0);
    assert.equal(firstEntryCount, 1, 'one real once=false viewport entry emits exactly one intersection');
    assert.equal(await lazyDemo.locator('img[alt="延迟显示的山丘图形"]').count(), 1, 'scrolling the real scroll area mounts and loads its image');

    await moveRealLazyIntoView(false);
    await waitForRealLazyModel(false);
    await waitFor(() => !document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]'));
    const onceFalseExitCount = Number((await output.textContent())?.match(/进入观察区域 (\d+) 次/)?.[1] ?? 0);
    assert.equal(onceFalseExitCount, firstEntryCount, 'once=false unmounts the image when leaving without adding an intersection');

    const switches = lazyDemo.locator('input.ui-switch');
    await switches.nth(0).check();
    await flush();
    await moveRealLazyIntoView(true);
    await waitForRealLazyModel(true);
    await page.waitForFunction(() => {
        const image = document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]');
        return Boolean(image && image.complete && image.naturalWidth > 0);
    });
    await moveRealLazyIntoView(false);
    await page.waitForTimeout(250);
    assert.match((await output.textContent()) ?? '', /modelValue：true/, 'once=true keeps the model visible after leaving the scroll viewport');
    assert.equal(await lazyDemo.locator('img[alt="延迟显示的山丘图形"]').count(), 1, 'once=true keeps its image mounted after leaving');

    await lazyDemo.getByRole('button', { name: '重置可见模型' }).click();
    await waitForRealLazyModel(false);
    await waitFor(() => !document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]'));
    await moveRealLazyIntoView(true);
    await waitForRealLazyModel(true);
    await page.waitForFunction(() => {
        const image = document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]');
        return Boolean(image && image.complete && image.naturalWidth > 0);
    });
    await moveRealLazyIntoView(false);
    await lazyDemo.getByRole('button', { name: '重置可见模型' }).click();
    await waitForRealLazyModel(false);
    await waitFor(() => !document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]'));

    const beforeDisabled = Number((await output.textContent())?.match(/进入观察区域 (\d+) 次/)?.[1] ?? 0);
    await switches.nth(1).check();
    await flush();
    await waitForRealLazyModel(true);
    assert.equal(await lazyDemo.locator('img[alt="延迟显示的山丘图形"]').count(), 1, 'disabled real ULazy renders content immediately while outside the viewport');
    const disabledObservers = await page.evaluate(() => window.lazyResponsiveProtocol.realLazyObservers());
    assert.equal(disabledObservers.some(observer => observer.connected), false, 'disabled real ULazy disconnects its observer');
    const disabledEntryCount = Number((await output.textContent())?.match(/进入观察区域 (\d+) 次/)?.[1] ?? 0);
    assert.equal(disabledEntryCount, beforeDisabled, 'disabled immediate visibility does not emit an intersection');

    await switches.nth(1).uncheck();
    await flush();
    await switches.nth(0).uncheck();
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.realLazyObservers().some(observer => observer.connected));
    await moveRealLazyIntoView(false);
    await waitForRealLazyModel(false);
    await waitFor(() => !document.querySelector('[data-demo-component="ULazy"] img[alt="延迟显示的山丘图形"]'));

    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width: 1280, height: 1000 });
    await page.evaluate(() => { window.scrollTo(0, 0); });
    await settle();

    const responsiveWide = await responsiveDemo.evaluate(element => {
        const roots = [...element.querySelectorAll('.u-responsive')];
        const first = roots[0];
        const inline = roots[1];
        const additional = first.querySelector('.ratio-label');
        return {
            rootMaxWidth: getComputedStyle(first).maxWidth,
            rootWidth: first.getBoundingClientRect().width,
            additionalText: additional?.textContent.trim(),
            additionalDisplay: additional ? getComputedStyle(additional).display : null,
            additionalRect: additional ? { width: additional.getBoundingClientRect().width, height: additional.getBoundingClientRect().height } : null,
            inlineClass: inline.classList.contains('is-inline'),
            inlineWidth: inline.getBoundingClientRect().width,
            inlineHeight: inline.getBoundingClientRect().height
        };
    });
    assert.equal(responsiveWide.rootMaxWidth, '640px', 'real UResponsive demo applies its 640px maximum width');
    assert.ok(responsiveWide.rootWidth <= 640, 'real UResponsive demo geometry stays within max-width');
    assert.equal(responsiveWide.additionalText, 'additional 标记层');
    assert.notEqual(responsiveWide.additionalDisplay, 'none');
    assert.ok(responsiveWide.additionalRect.width > 0 && responsiveWide.additionalRect.height > 0, 'additional slot has visible geometry');
    assert.equal(responsiveWide.inlineClass, true, 'real inline example exposes its inline state class');
    assert.deepEqual({ width: responsiveWide.inlineWidth, height: responsiveWide.inlineHeight }, { width: 180, height: 90 }, 'real inline example keeps its 180 by 90 dimensions');

    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width: 390, height: 1000 });
    await page.evaluate(() => {
        window.scrollTo(0, 0);
        for (const element of document.querySelectorAll('*')) { element.scrollTop = 0; element.scrollLeft = 0; }
    });
    await settle();
    const responsiveNarrow = await responsiveDemo.evaluate(element => {
        const roots = [...element.querySelectorAll('.u-responsive')];
        return {
            containerWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            firstWidth: roots[0].getBoundingClientRect().width,
            inlineWidth: roots[1].getBoundingClientRect().width,
            inlineHeight: roots[1].getBoundingClientRect().height,
            additionalText: roots[0].querySelector('.ratio-label')?.textContent.trim()
        };
    });
    assert.ok(responsiveNarrow.scrollWidth <= responsiveNarrow.containerWidth + 1, 'real responsive demo does not overflow its narrow container');
    assert.equal(responsiveNarrow.inlineWidth, 180);
    assert.equal(responsiveNarrow.inlineHeight, 90);
    assert.equal(responsiveNarrow.additionalText, 'additional 标记层');

    return {
        initial,
        onceFalse: {
            modelUpdatesOnEntry: firstEntryCount,
            exitCount: onceFalseExitCount,
            contentUnmountedOnExit: true,
            oneIntersectPerEntry: firstEntryCount === 1
        },
        onceTrue: { stayedVisibleAfterExit: true, resetModelReobserved: true },
        disabled: {
            modelVisibleImmediately: true,
            disconnectedObservers: disabledObservers,
            noIntersectionEmission: true,
            reenableResetSequence: ['disabled=false', 'external model=false']
        },
        responsiveWide,
        responsiveNarrow
    };
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
    await page.waitForFunction(() => Boolean(window.lazyResponsiveProtocol));
    await page.locator('#lazy-controlled').waitFor();
    const registry = await page.evaluate(() => window.lazyResponsiveProtocol.registry);
    assert.equal(registry.publicExports, true, 'public index exposes each tested component');
    assert.deepEqual(registry.globalNames, [
        ['u-lazy', true],
        ['u-responsive', true],
        ['u-counter', true],
        ['u-field', true],
        ['u-picker', true],
        ['u-hotkey', true],
        ['u-tooltip', true]
    ], 'createUI registers tested canonical u-* names');
    report.registry = registry;
    await waitForObserverCount('lazy-transition-string', 1);
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-transition-string', 0, true));
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.lazyStringTransitionClasses().some(className => className.split(' ').includes('u-scale-enter-active')));
    lazyStringClasses = await page.evaluate(() => window.lazyResponsiveProtocol.lazyStringTransitionClasses());
    assert.ok(lazyStringClasses.some(className => className.split(' ').includes('u-scale-enter-active')), 'ULazy string transition applies named enter classes');

    const lazyRoot = await page.locator('#lazy-controlled').evaluate(element => ({
        tagName: element.tagName.toLowerCase(),
        className: element.className,
        nativeAttribute: element.getAttribute('data-native-attr'),
        style: {
            width: element.style.width,
            height: element.style.height,
            minWidth: element.style.minWidth,
            maxWidth: element.style.maxWidth,
            minHeight: element.style.minHeight,
            maxHeight: element.style.maxHeight
        }
    }));
    assert.deepEqual(lazyRoot, {
        tagName: 'section',
        className: 'u-lazy lazy-extra-class',
        nativeAttribute: 'kept',
        style: { width: '320px', height: '84px', minWidth: '240px', maxWidth: '360px', minHeight: '64px', maxHeight: '96px' }
    }, 'ULazy preserves native attrs/tag and converts numeric dimensions to pixels');

    await waitForObserverCount('lazy-controlled', 1);
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-controlled', 0, true));
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.state.lazyModel === true);
    await waitForObserverCount('lazy-controlled', 1);
    assert.equal(await page.locator('#lazy-controlled-content').count(), 1, 'once=false shows default slot after intersection');
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-controlled', 0, false));
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.state.lazyModel === false);
    await waitForObserverCount('lazy-controlled', 1);
    assert.equal(await page.locator('#lazy-controlled-placeholder').count(), 1, 'once=false restores placeholder after leaving');
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-controlled', 0, true));
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.state.lazyModel === true);
    await waitForObserverCount('lazy-controlled', 1);
    const oldOptionsIndex = 0;
    await page.evaluate(() => Object.assign(window.lazyResponsiveProtocol.state.lazyOptions, {
        root: document.querySelector('#observer-root-next'),
        rootMargin: '28px 4px',
        threshold: [0.1, 0.75]
    }));
    await flush();
    await waitForObserverCount('lazy-controlled', 2);
    const lazyObservers = await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-controlled'));
    assert.deepEqual(lazyObservers.slice(-2), [
        { connected: false, root: 'observer-root', rootMargin: '12px', threshold: 0.25 },
        { connected: true, root: 'observer-root-next', rootMargin: '28px 4px', threshold: [0.1, 0.75] }
    ], 'in-place options changes disconnect the prior observer and use current root/threshold/margin');
    const lazyUpdateCount = await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyUpdates.length);
    await page.evaluate(index => window.lazyResponsiveProtocol.fire('lazy-controlled', index, false, true), oldOptionsIndex);
    await flush();
    assert.equal(await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyModel), true, 'stale observer callbacks after options replacement are ignored');
    assert.equal(await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyUpdates.length), lazyUpdateCount, 'ignored stale callbacks do not emit model updates');
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-controlled', 1, false));
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.state.lazyModel === false);
    assert.deepEqual(await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyIntersections.map(entry => entry.intersecting)), [true, true], 'intersect emits only for visible intersections');
    report.lazy = {
        dimensionsAndAttrs: lazyRoot,
        onceFalseModelUpdates: await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyUpdates),
        intersectPayloads: await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyIntersections),
        observerOptions: lazyObservers,
        staleCallbackIgnored: true
    };

    await waitForObserverCount('lazy-once', 1);
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-once', 0, true));
    await flush();
    await waitFor(() => window.lazyResponsiveProtocol.state.lazyOnceModel === true);
    const onceObservers = await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-once'));
    assert.equal(onceObservers[0].connected, false, 'once=true disconnects after the first intersection');
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-once', 0, false, true));
    await flush();
    assert.equal(await page.locator('#lazy-once-content').count(), 1, 'once=true remains visible after leaving');
    await updateState({ lazyOnceModel: false });
    await waitForObserverCount('lazy-once', 2);
    await page.evaluate(() => window.lazyResponsiveProtocol.fire('lazy-once', 1, true));
    await flush();
    assert.deepEqual(await page.evaluate(() => window.lazyResponsiveProtocol.state.onceUpdates), [true, true], 'once=true observes again after its controlled model resets');

    assert.equal(await page.evaluate(() => window.lazyResponsiveProtocol.state.lazyDisabledModel), true, 'disabled ULazy immediately sets visible and updates its model');
    assert.equal(await page.locator('#lazy-disabled-content').count(), 1);
    assert.deepEqual(await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-disabled')), [], 'disabled ULazy skips IntersectionObserver');
    const disabledAtomicTimeline = await page.evaluate(async values => {
        const protocol = window.lazyResponsiveProtocol;
        const snapshot = phase => ({
            phase,
            disabled: protocol.state.lazyDisabled,
            modelValue: protocol.state.lazyDisabledModel,
            contentMounted: Boolean(document.querySelector('#lazy-disabled-content')),
            observers: protocol.observers('lazy-disabled')
        });
        Object.assign(protocol.state, values);
        const timeline = [snapshot('after assignment')];
        await protocol.flush();
        timeline.push(snapshot('after Vue nextTicks'));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        timeline.push(snapshot('after animation frames'));
        return timeline;
    }, { lazyDisabled: false, lazyDisabledModel: false });
    report.lazy.disabledAtomicUpdate = disabledAtomicTimeline;
    await waitFor(() => window.lazyResponsiveProtocol.observers('lazy-disabled').some(observer => observer.connected));
    const reenabledObservers = await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-disabled'));
    assert.equal(reenabledObservers.filter(observer => observer.connected).length, 1, 'atomic disabled=false/model=false reset leaves one active observer');
    const activeReenabledObserver = reenabledObservers.findIndex(observer => observer.connected);
    await page.evaluate(index => window.lazyResponsiveProtocol.fire('lazy-disabled', index, true), activeReenabledObserver);
    await flush();
    assert.equal(await page.locator('#lazy-disabled-content').count(), 1, 're-enabled observer can make content visible');

    const cleanupBefore = await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-cleanup'));
    assert.equal(cleanupBefore.length, 1);
    await page.evaluate(() => window.lazyResponsiveProtocol.unmountCleanup());
    await flush();
    assert.deepEqual(await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-cleanup').map(observer => observer.connected)), [false], 'unmount disconnects its observer');
    await page.evaluate(() => window.lazyResponsiveProtocol.mountWithoutObserver());
    await flush();
    assert.equal(await page.locator('#lazy-no-io-content').count(), 1, 'missing IntersectionObserver falls back to immediately visible');
    assert.deepEqual(await page.evaluate(() => window.lazyResponsiveProtocol.observers('lazy-no-io')), [], 'missing IntersectionObserver creates no observer');
    assert.equal(await page.locator('#lazy-transition-false-content').count(), 1, 'transition=false retains slot content');
    assert.ok(await page.locator('#lazy-transition-object .custom-transition[data-appear="true"]').count(), 'ULazy forwards object transition and appear to a custom component');
    report.lazy.onceAndFallback = {
        onceModelUpdates: await page.evaluate(() => window.lazyResponsiveProtocol.state.onceUpdates),
        disabledModelUpdates: await page.evaluate(() => window.lazyResponsiveProtocol.state.disabledUpdates),
        disconnectedOnUnmount: true,
        noIntersectionObserverFallback: true,
        transitionFalse: true,
        stringTransitionClasses: lazyStringClasses,
        customTransitionAppear: true
    };

    const responsiveValues = await page.evaluate(() => {
        const style = id => document.getElementById(id).style;
        const content = id => document.querySelector(`#${id} .u-responsive-content`);
        const numericRoot = document.getElementById('responsive-numeric');
        const numericAdditional = document.getElementById('responsive-numeric-additional');
        return {
            numeric: {
                ratio: document.querySelector('#responsive-numeric-content').dataset.ratio,
                style: { aspectRatio: style('responsive-numeric').aspectRatio, width: style('responsive-numeric').width, height: style('responsive-numeric').height, minWidth: style('responsive-numeric').minWidth, maxWidth: style('responsive-numeric').maxWidth, minHeight: style('responsive-numeric').minHeight, maxHeight: style('responsive-numeric').maxHeight },
                contentClasses: content('responsive-numeric').className,
                inline: numericRoot.classList.contains('is-inline'),
                inlineDisplay: getComputedStyle(numericRoot).display,
                inlineStyleRuleLoaded: [...document.styleSheets].some(sheet => {
                    try { return [...sheet.cssRules].some(rule => rule.cssText.includes('.u-responsive.is-inline')); }
                    catch { return false; }
                }),
                inlineWithText: (() => {
                    const root = numericRoot.getBoundingClientRect();
                    const text = document.getElementById('responsive-inline-text').getBoundingClientRect();
                    return text.left >= root.right - 1 && text.top < root.bottom && text.bottom > root.top;
                })(),
                inlineWithPeer: (() => {
                    const root = numericRoot.getBoundingClientRect();
                    const peer = document.getElementById('responsive-inline-peer').getBoundingClientRect();
                    return peer.left >= root.right - 1 && peer.top < root.bottom && peer.bottom > root.top;
                })(),
                additionalSibling: numericAdditional.parentElement === numericRoot,
                additionalOutsideContent: !content('responsive-numeric').contains(numericAdditional)
            },
            string: { ratio: document.querySelector('#responsive-string-content').dataset.ratio, width: style('responsive-string').width, aspectRatio: style('responsive-string').aspectRatio },
            inferred: { ratio: document.querySelector('#responsive-inferred-content').dataset.ratio, aspectRatio: style('responsive-inferred').aspectRatio },
            invalid: { ratio: document.querySelector('#responsive-invalid-content').dataset.ratio, aspectRatio: style('responsive-invalid').aspectRatio, width: style('responsive-invalid').width, height: style('responsive-invalid').height },
            invalidText: { ratio: document.querySelector('#responsive-invalid-text-content').dataset.ratio, aspectRatio: style('responsive-invalid-text').aspectRatio }
        };
    });
    assert.deepEqual(responsiveValues.numeric, {
        ratio: '1.5',
        style: { aspectRatio: '1.5 / 1', width: '300px', height: '200px', minWidth: '100px', maxWidth: '360px', minHeight: '50px', maxHeight: '300px' },
        contentClasses: 'u-responsive-content ratio-array ratio-object',
        inline: true,
        inlineDisplay: 'inline-block',
        inlineStyleRuleLoaded: true,
        inlineWithText: true,
        inlineWithPeer: true,
        additionalSibling: true,
        additionalOutsideContent: true
    }, 'numeric ratio, dimensions, class normalization, inline mode, and additional slot scope are preserved');
    assert.deepEqual(responsiveValues.string, { ratio: '1.7777777777777777', width: '320px', aspectRatio: '1.77778 / 1' });
    assert.deepEqual(responsiveValues.inferred, { ratio: '2', aspectRatio: '2 / 1' }, 'ratio derives from numeric width/height when omitted');
    assert.deepEqual(responsiveValues.invalid, { ratio: '', aspectRatio: '', width: 'auto', height: 'fit-content' }, 'nonpositive ratio is omitted without discarding other dimensions');
    assert.deepEqual(responsiveValues.invalidText, { ratio: '', aspectRatio: '' }, 'invalid ratio text does not create an invalid CSS ratio');
    report.responsive = responsiveValues;

    const counterValues = await page.evaluate(() => ({
        defaultActive: Boolean(document.querySelector('#counter-default-host .ui-counter')),
        defaultText: document.querySelector('#counter-default-host .ui-counter')?.textContent.trim(),
        unicode: { text: document.querySelector('#counter-unicode-host .ui-counter')?.textContent.trim(), over: document.querySelector('#counter-unicode-host .ui-counter')?.classList.contains('is-over'), ariaLabel: document.querySelector('#counter-unicode-host .ui-counter')?.getAttribute('aria-label') },
        valueMode: document.querySelector('#counter-value-host .ui-counter')?.textContent.trim(),
        disabled: { text: document.querySelector('#counter-disabled-host .ui-counter')?.textContent.trim(), over: document.querySelector('#counter-disabled-host .ui-counter')?.classList.contains('is-over') },
        scope: { counter: document.querySelector('#counter-slot-output')?.dataset.counter, max: document.querySelector('#counter-slot-output')?.dataset.max, value: document.querySelector('#counter-slot-output')?.dataset.value }
    }));
    assert.deepEqual(counterValues, {
        defaultActive: true,
        defaultText: '8 / 8',
        unicode: { text: '3 / 2', over: true, ariaLabel: '3 of 2 characters' },
        valueMode: '剩余 8 个 / 10',
        disabled: { text: '4 / 2', over: false },
        scope: { counter: '3 / 5', max: '5', value: 'A😀B' }
    }, 'UCounter default, Unicode code-point length, value mode, disabled over state, and slot scope are stable');

    await updateState({ counterObjectActive: true });
    await waitFor(() => window.lazyResponsiveProtocol.state.transitionEvents.includes('enter'));
    await updateState({ counterObjectActive: false });
    await waitFor(() => window.lazyResponsiveProtocol.state.transitionEvents.includes('leave'));
    const stringClasses = await page.evaluate(() => window.lazyResponsiveProtocol.activateStringCounter());
    assert.ok(stringClasses.some(className => className.split(' ').includes('u-scale-enter-active')), `string transition applies its named active class: ${JSON.stringify(stringClasses)}`);
    await updateState({ counterFalseActive: false });
    assert.equal(await page.locator('#counter-false-host .ui-counter').count(), 0, 'transition=false removes inactive content without a wrapper transition');
    const customTransition = page.locator('#counter-custom-host .custom-transition');
    assert.equal(await customTransition.getAttribute('data-disabled'), 'false');
    await updateState({ counterCustomActive: false });
    assert.equal(await page.locator('#counter-custom-host .ui-counter').count(), 0, 'custom transition component follows active=false');
    await updateState({ counterCustomActive: true });
    assert.equal(await page.locator('#counter-custom-host .ui-counter').count(), 1, 'custom transition component restores the active counter');
    await page.evaluate(() => window.lazyResponsiveProtocol.setReducedMotion(true));
    await waitFor(() => document.querySelector('#counter-custom-host .custom-transition')?.getAttribute('data-disabled') === 'true');
    await updateState({ counterReducedActive: true });
    await waitFor(() => window.lazyResponsiveProtocol.state.reducedTransitionEvents.length === 1);
    const reducedTransition = await page.evaluate(() => window.lazyResponsiveProtocol.state.reducedTransitionEvents[0]);
    assert.doesNotMatch(reducedTransition.className, /u-fade-enter/, 'reduced motion suppresses CSS classes while retaining transition hooks');
    await page.evaluate(() => window.lazyResponsiveProtocol.setReducedMotion(false));
    await flush();
    report.counter = {
        values: counterValues,
        objectTransitionEvents: await page.evaluate(() => window.lazyResponsiveProtocol.state.transitionEvents),
        stringTransitionClasses: stringClasses,
        falseTransitionRemovesContent: true,
        customTransitionDisabledForReducedMotion: true,
        reducedMotionHook: reducedTransition
    };

    const appearanceValues = await page.evaluate(() => {
        const fieldNumber = document.querySelector('#appearance-field-number-host .u-field-surface');
        const fieldCorners = document.querySelector('#appearance-field-corners-host .u-field-surface');
        const picker = document.querySelector('#appearance-picker-host .u-picker-container');
        const hotkey = document.querySelector('#appearance-hotkey-host .u-kbd');
        const css = (element, property) => element.style.getPropertyValue(property);
        return {
            fieldNumber: { radius: css(fieldNumber, 'border-radius') },
            fieldCorners: { startStart: css(fieldCorners, 'border-start-start-radius'), startEnd: css(fieldCorners, 'border-start-end-radius') },
            picker: { startBorder: css(picker, 'border-inline-start-width'), endBorder: css(picker, 'border-inline-end-width'), startStart: css(picker, 'border-start-start-radius'), endEnd: css(picker, 'border-end-end-radius') },
            hotkey: { topBorder: css(hotkey, 'border-top-width'), bottomBorder: css(hotkey, 'border-bottom-width'), radius: css(hotkey, 'border-radius') }
        };
    });
    assert.deepEqual(appearanceValues, {
        fieldNumber: { radius: '8px' },
        fieldCorners: { startStart: '8px', startEnd: '9999px' },
        picker: { startBorder: '2px', endBorder: '4px', startStart: '8px', endEnd: '9999px' },
        hotkey: { topBorder: '1px', bottomBorder: '4px', radius: '50%' }
    }, 'shared appearance helpers preserve numeric and named radii plus directional border widths in real components');
    report.appearance = appearanceValues;

    const realDemoProtocol = await exerciseRealDemos();
    report.realDemos = realDemoProtocol;
    await prepareRealDemoCapture('light', 1280, 1000, 'real-demos-wide-light.png');
    await prepareRealDemoCapture('dark', 1280, 1000, 'real-demos-wide-dark.png');
    await prepareRealDemoCapture('light', 390, 1000, 'real-demos-narrow-light.png');

    await prepareTooltipCapture('dark', 1280, 1000, 'tooltip-open-wide-dark.png');
    await prepareTooltipCapture('light', 390, 1000, 'tooltip-open-narrow-light.png');
    report.tooltipDemo = { source: 'src/ui/docs/component-examples/tooltip.vue', openedBy: 'standard activator click', popupText: '可用 activator 和内容插槽配置提示。' };

    assert.deepEqual(errors, [], 'lazy/responsive/counter/appearance protocols, real demo interactions, and screenshots have no page errors, console errors, or Vue warnings');
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
