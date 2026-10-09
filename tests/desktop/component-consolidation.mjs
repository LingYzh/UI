import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/component-consolidation');
const screenshot = path.join(evidence, 'fixture.png');
const sourceFiles = [
    'src/ui/index.ts',
    'src/ui/UiProgress.vue',
    'src/ui/UProgressLinear.vue',
    'src/ui/UiSpinner.vue',
    'src/ui/UProgressCircular.vue',
    'src/ui/controls.css',
    'src/ui/UiMenu.vue',
    'src/ui/UiMenuItem.vue',
    'src/ui/UList.vue',
    'src/ui/UListItem.vue',
    'src/ui/menu.ts',
    'src/ui/overlay-lifecycle.ts',
    'src/ui/UiSnackbarHost.vue',
    'src/ui/USnackbar.vue',
    'src/ui/snackbar.ts',
    'src/ui/UiTabPanel.vue',
    'src/ui/feedback.css',
    'src/ui/styles.css'
];

async function hashSources() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async (file) => [
        file,
        createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
    ])));
}

await mkdir(evidence, { recursive: true });
const sourceSha256Before = await hashSources();
const fixture = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="data:,">
    <title>Component consolidation protocols</title>
    <style>
        html, body { min-height: 100%; margin: 0; }
        body { background: var(--background); color: var(--text); font-family: var(--font); }
        #app { box-sizing: border-box; max-width: 1120px; margin: 0 auto; padding: 28px; }
        .fixture-heading { margin: 0 0 20px; font-size: 24px; }
        .fixture-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .fixture-section { min-width: 0; padding: 18px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); }
        .fixture-section h2 { margin: 0 0 14px; font-size: 16px; }
        .progress-stack, .spinner-stack, .menu-stack, .legacy-panels { display: grid; gap: 14px; }
        .spinner-row { display: flex; align-items: center; gap: 10px; min-height: 28px; }
        .menu-stack { justify-items: start; }
        .fixture-note { margin: 8px 0 0; color: var(--muted); font-size: 13px; }
        .legacy-tabs { display: flex; gap: 8px; margin-bottom: 10px; }
        .legacy-tab { padding: 5px 9px; border: 1px solid var(--line); border-radius: 6px; }
        .legacy-panels { min-height: 50px; }
        .ui-tab-panel { padding: 8px; border-radius: 6px; background: var(--surface-raised); }
        #single-snackbar-zone { margin-top: 18px; }
        @media (max-width: 720px) {
            #app { padding: 16px; }
            .fixture-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <script type="module">
        import { createApp, h, nextTick, reactive } from 'vue';
        import UiProgress from '/src/ui/UiProgress.vue';
        import UiSpinner from '/src/ui/UiSpinner.vue';
        import UiMenu from '/src/ui/UiMenu.vue';
        import UiMenuItem from '/src/ui/UiMenuItem.vue';
        import UList from '/src/ui/UList.vue';
        import UListItem from '/src/ui/UListItem.vue';
        import UiSnackbarHost from '/src/ui/UiSnackbarHost.vue';
        import USnackbar from '/src/ui/USnackbar.vue';
        import UiTabPanel from '/src/ui/UiTabPanel.vue';
        import { snackbar, snackbarState } from '/src/ui/snackbar.ts';
        import '/src/ui/styles.css';

        const UI = {
            UiProgress,
            UiSpinner,
            UMenu: UiMenu,
            UMenuItem: UiMenuItem,
            UList,
            UListItem,
            UiSnackbarHost,
            USnackbar,
            UiTabPanel
        };

        const state = reactive({
            progressValue: 35,
            progressMax: 100,
            progressTone: 'accent',
            adapterOpen: false,
            adapterClicks: [],
            trackedOpen: false,
            trackedClicks: [],
            trackedFocusHistory: [],
            vetoNextArrow: false,
            panelOpen: false,
            panelClicks: [],
            legacyValue: 'first',
            legacyInputValue: 'retained panel state',
            hostMounted: true,
            singleOpen: true,
            singleUpdates: []
        });

        const trackedItems = [
            { value: 'keep', title: 'Keep menu open', props: { 'data-ui-menu-keep-open': '' } },
            { value: 'blocked', title: 'Disabled choice', props: { disabled: true } },
            { value: 'last', title: 'Last choice' }
        ];
        const panelItems = [
            { value: 'first', title: 'First panel row' },
            { value: 'blocked', title: 'Disabled panel row', props: { disabled: true } },
            { value: 'last', title: 'Last panel row' }
        ];
        const serviceTimerProbe = { enabled: false, timers: [] };
        const nativeSetTimeout = window.setTimeout.bind(window);
        const nativeClearTimeout = window.clearTimeout.bind(window);
        window.setTimeout = function (callback, timeout, ...args) {
            const timer = nativeSetTimeout(callback, timeout, ...args);
            if (serviceTimerProbe.enabled && Number(timeout) === 5000) serviceTimerProbe.timers.push({ id: timer, cleared: false });
            return timer;
        };
        window.clearTimeout = function (timer, ...args) {
            const record = serviceTimerProbe.timers.find(item => item.id === timer);
            if (record) record.cleared = true;
            return nativeClearTimeout(timer, ...args);
        };
        document.addEventListener('focusin', event => {
            const target = event.target;
            if (target instanceof HTMLElement && target.matches('.tracked-menu-item')) state.trackedFocusHistory.push(target.id);
        }, true);

        function adapterMenu() {
            return h(UI.UMenu, {
                modelValue: state.adapterOpen,
                'onUpdate:modelValue': value => { state.adapterOpen = value; },
                label: 'Adapter actions',
                contentProps: { id: 'adapter-menu' },
                transition: false
            }, {
                activator: ({ props }) => h('button', { ...props, id: 'adapter-trigger', type: 'button' }, 'Adapter actions'),
                default: () => h('div', { class: 'menu-stack', id: 'adapter-menu-content' }, [
                    h(UI.UMenuItem, {
                        id: 'adapter-keep-open',
                        checked: true,
                        keepOpen: true,
                        'onClick': () => state.adapterClicks.push('keep')
                    }, {
                        default: () => 'Keep checked',
                        icon: () => h('span', { id: 'adapter-icon', 'aria-hidden': 'true' }, '●'),
                        trailing: () => h('kbd', { id: 'adapter-trailing' }, '⌘K')
                    }),
                    h(UI.UMenuItem, {
                        id: 'adapter-unchecked',
                        checked: false,
                        'onClick': () => state.adapterClicks.push('unchecked')
                    }, { default: () => 'Unchecked option' }),
                    h(UI.UMenuItem, {
                        id: 'adapter-disabled',
                        disabled: true,
                        'onClick': () => state.adapterClicks.push('disabled')
                    }, { default: () => 'Disabled option' })
                ])
            });
        }

        function trackedMenu() {
            return h(UI.UMenu, {
                modelValue: state.trackedOpen,
                'onUpdate:modelValue': value => { state.trackedOpen = value; },
                label: 'Tracked list actions',
                contentProps: { id: 'tracked-menu' },
                transition: false,
                onKeydown: event => {
                    if (state.vetoNextArrow && event.key === 'ArrowDown') {
                        event.preventDefault();
                        state.vetoNextArrow = false;
                    }
                }
            }, {
                activator: ({ props }) => h('button', { ...props, id: 'tracked-trigger', type: 'button' }, 'Tracked list actions'),
                default: () => [
                    h(UI.UList, {
                        id: 'tracked-list',
                        role: 'presentation',
                        items: trackedItems,
                        navigationStrategy: 'track',
                        selectable: false,
                        activatable: false
                    }, {
                        item: ({ item, props }) => h(UI.UListItem, {
                            ...props,
                            id: 'tracked-' + item.value,
                            class: 'tracked-menu-item',
                            role: 'menuitem',
                            title: item.title,
                            onClick: event => {
                                props.onClick?.(event);
                                state.trackedClicks.push(item.value);
                            }
                        })
                    }),
                    h('button', { id: 'tracked-menu-inside', type: 'button' }, 'Inside menu Tab stop')
                ]
            });
        }

        function panelListMenu() {
            return h(UI.UMenu, {
                modelValue: state.panelOpen,
                'onUpdate:modelValue': value => { state.panelOpen = value; },
                panel: true,
                label: 'Panel list actions',
                contentProps: { id: 'panel-menu-surface' },
                transition: false
            }, {
                activator: ({ props }) => h('button', { ...props, id: 'panel-trigger', type: 'button' }, 'Panel list actions'),
                default: () => h(UI.UList, {
                    id: 'panel-list',
                    items: panelItems,
                    navigationStrategy: 'track',
                    selectable: false,
                    activatable: false
                }, {
                    item: ({ item, props }) => h(UI.UListItem, {
                        ...props,
                        id: 'panel-' + item.value,
                        class: 'panel-list-item',
                        role: 'option',
                        title: item.title,
                        onClick: event => {
                            props.onClick?.(event);
                            state.panelClicks.push(item.value);
                        }
                    })
                })
            });
        }

        function legacyPanels() {
            return h('section', { class: 'fixture-section', id: 'legacy-panel-section' }, [
                h('h2', 'Retained scalar tab panels'),
                h('div', { class: 'legacy-tabs' }, [
                    h('button', { id: 'legacy-tabs-tab-first', type: 'button', class: 'legacy-tab', onClick: () => { state.legacyValue = 'first'; } }, 'First'),
                    h('button', { id: 'legacy-tabs-tab-second', type: 'button', class: 'legacy-tab', onClick: () => { state.legacyValue = 'second'; } }, 'Second')
                ]),
                h('div', { class: 'legacy-panels' }, [
                    h(UI.UiTabPanel, { idPrefix: 'legacy-tabs', value: 'first', modelValue: state.legacyValue }, () => [
                        h('label', { for: 'legacy-panel-input' }, 'Persistent input'),
                        h('input', { id: 'legacy-panel-input', value: state.legacyInputValue, onInput: event => { state.legacyInputValue = event.target.value; } })
                    ]),
                    h(UI.UiTabPanel, { idPrefix: 'legacy-tabs', value: 'second', modelValue: state.legacyValue }, () => 'Second retained panel')
                ])
            ]);
        }

        function rootView() {
            return h('main', [
                h('h1', { class: 'fixture-heading' }, 'Shared component consolidation'),
                h('div', { class: 'fixture-grid' }, [
                    h('section', { class: 'fixture-section', id: 'progress-section' }, [
                        h('h2', 'Progress'),
                        h('div', { class: 'progress-stack' }, [
                            h(UI.UiProgress, { id: 'progress-main', value: state.progressValue, max: state.progressMax, tone: state.progressTone, label: 'Batch progress' }),
                            h(UI.UiProgress, { id: 'progress-dense', value: 50, max: 100, dense: true, label: 'Dense progress' }),
                            h(UI.UiProgress, { id: 'progress-fallback', value: 50, max: 0, label: 'Fallback progress' })
                        ]),
                        h('p', { class: 'fixture-note' }, 'The linear surface keeps the legacy height and scaled fill.')
                    ]),
                    h('section', { class: 'fixture-section', id: 'spinner-section' }, [
                        h('h2', 'Spinner'),
                        h('div', { class: 'spinner-stack' }, [
                            h('div', { class: 'spinner-row' }, [h(UI.UiSpinner, { id: 'spinner-default' }), h('span', 'Default 16 px')]),
                            h('div', { class: 'spinner-row' }, [h(UI.UiSpinner, { id: 'spinner-labeled', size: 24, label: 'Loading records' }), h('span', 'Custom 24 px')])
                        ])
                    ]),
                    h('section', { class: 'fixture-section', id: 'menu-section' }, [
                        h('h2', 'Menu adapters'),
                        h('div', { class: 'menu-stack' }, [adapterMenu(), trackedMenu(), panelListMenu()])
                    ]),
                    legacyPanels()
                ]),
                h('section', { class: 'fixture-section', id: 'single-snackbar-zone' }, [
                    h('h2', 'Controlled Snackbar'),
                    h(UI.USnackbar, {
                        id: 'single-controlled-snackbar',
                        modelValue: state.singleOpen,
                        timeout: -1,
                        location: 'top center',
                        contained: true,
                        persistent: true,
                        role: 'alert',
                        closable: true,
                        text: 'Controlled alert surface',
                        'onUpdate:modelValue': value => { state.singleOpen = value; state.singleUpdates.push(value); }
                    })
                ]),
                state.hostMounted ? h(UI.UiSnackbarHost, { key: 'service-host' }) : null
            ]);
        }

        const app = createApp({ render: rootView });
        app.mount('#app');
        window.componentConsolidation = {
            state,
            app,
            snackbar,
            flush: () => nextTick(),
            getNotices: () => snackbarState.notices.value.map(notice => ({ ...notice })),
            snackbarTimeoutDefault: UI.USnackbar.props?.timeout?.default,
            serviceTimerProbe
        };
    </script>
</body>
</html>`;

const vite = await createServer({
    root,
    appType: 'custom',
    logLevel: 'error',
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: { noDiscovery: true },
    server: { host: '127.0.0.1', port: 0, hmr: false }
});
vite.middlewares.use('/__component-consolidation__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(await vite.transformIndexHtml('/__component-consolidation__', fixture));
});

const report = {
    generatedAt: new Date().toISOString(),
    runner: { source: 'vite isolated fixture', browser: 'playwright chromium channel=chrome' },
    checks: [],
    runtimeErrors: [],
    vueWarnings: [],
    sourceSha256Before,
    sourceSha256After: null,
    sourceUnchanged: null,
    screenshot: path.relative(root, screenshot),
    visualAcceptance: false
};
let browser;
let page;
let failure;

function check(name) {
    report.checks.push(name);
}

async function setState(values) {
    await page.evaluate(async values => {
        Object.assign(window.componentConsolidation.state, values);
        await window.componentConsolidation.flush();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, values);
}

async function openMenu(trigger, surface) {
    await page.locator(trigger).click();
    await page.locator(surface).waitFor({ state: 'visible' });
}

async function pressAndAssertFocus(key, expectedId) {
    const before = await page.evaluate(() => window.componentConsolidation.state.trackedFocusHistory.length);
    await page.keyboard.press(key);
    await page.waitForFunction(id => document.activeElement?.id === id, expectedId);
    const history = await page.evaluate(() => window.componentConsolidation.state.trackedFocusHistory);
    assert.equal(history.length - before, 1, `${key} must move menu focus once`);
    assert.equal(history.at(-1), expectedId, `${key} must focus the expected enabled menu item`);
}

try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    page.on('pageerror', error => report.runtimeErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.runtimeErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.vueWarnings.push(message.text());
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/__component-consolidation__`);
    await page.waitForFunction(() => !!window.componentConsolidation);

    const progress = page.locator('#progress-main');
    assert.equal(await page.getByRole('progressbar').count(), 3, 'Each UiProgress instance exposes one progressbar; spinner internals remain hidden.');
    assert.equal(await progress.getAttribute('aria-valuenow'), '35');
    assert.equal(await progress.getAttribute('aria-valuemax'), '100');
    await setState({ progressValue: -12 });
    assert.equal(await progress.getAttribute('aria-valuenow'), '0', 'Values below zero clamp to zero.');
    await setState({ progressValue: 140 });
    assert.equal(await progress.getAttribute('aria-valuenow'), '100', 'Values above max clamp to max.');
    await page.evaluate(() => { window.componentConsolidation.state.progressValue = Number.NaN; });
    await page.waitForFunction(() => document.querySelector('#progress-main')?.getAttribute('aria-valuenow') === '0');
    await setState({ progressValue: 30, progressMax: 60 });
    assert.equal(await progress.getAttribute('aria-valuenow'), '30', 'Value updates remain reactive.');
    assert.equal(await progress.getAttribute('aria-valuemax'), '60');
    assert.equal(await page.locator('#progress-fallback').getAttribute('aria-valuemax'), '100', 'Invalid max falls back to 100.');
    assert.equal(await page.locator('#progress-main').evaluate(element => getComputedStyle(element).height), '6px');
    assert.equal(await page.locator('#progress-dense').evaluate(element => getComputedStyle(element).height), '4px');
    await page.waitForFunction(() => {
        const fill = document.querySelector('#progress-main .u-progress-value');
        return !!fill && Math.abs(new DOMMatrixReadOnly(getComputedStyle(fill).transform).a - 0.5) < 0.01;
    }, null, { timeout: 3000 });
    const successFill = await page.locator('#progress-main .u-progress-value').evaluate(element => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return { scaleX: matrix.a, color: getComputedStyle(element).backgroundColor };
    });
    report.diagnostics = { progressFillAtHalf: successFill };
    assert.ok(Math.abs(successFill.scaleX - 0.5) < 0.01, `Progress paints its value with a scaled fill. Actual: ${JSON.stringify(successFill)}`);
    assert.ok(successFill.color && successFill.color !== 'rgba(0, 0, 0, 0)', 'Progress fill has a resolved tone color.');
    await setState({ progressTone: 'error' });
    await page.waitForFunction(() => {
        const root = document.querySelector('#progress-main');
        const fill = root?.querySelector('.u-progress-value');
        return !!root && !!fill && getComputedStyle(fill).backgroundColor === getComputedStyle(root).color;
    }, null, { timeout: 3000 });
    const errorFill = await page.locator('#progress-main .u-progress-value').evaluate(element => getComputedStyle(element).backgroundColor);
    assert.notEqual(errorFill, successFill.color, 'Tone updates the shared fill color.');
    check('UiProgress clamps values, falls back for invalid max, updates value/tone, renders one progressbar per instance, keeps 6/4 px heights, and scales the fill.');

    const defaultSpinner = page.locator('#spinner-default');
    const labeledSpinner = page.locator('#spinner-labeled');
    assert.equal(await defaultSpinner.evaluate(element => getComputedStyle(element).width), '16px');
    assert.equal(await labeledSpinner.evaluate(element => getComputedStyle(element).width), '24px');
    assert.equal(await defaultSpinner.getAttribute('aria-hidden'), 'true');
    assert.equal(await defaultSpinner.getAttribute('role'), null);
    assert.equal(await labeledSpinner.getAttribute('role'), 'status');
    assert.equal(await labeledSpinner.getAttribute('aria-label'), 'Loading records');
    assert.equal(await page.getByRole('status', { name: 'Loading records' }).count(), 1);
    assert.equal(await page.getByRole('progressbar').count(), 3, 'The spinner circle is hidden from accessibility APIs.');
    const spinnerArc = await labeledSpinner.locator('circle.u-progress-value').evaluate(element => {
        const style = getComputedStyle(element);
        return {
            radius: style.r,
            strokeWidth: style.strokeWidth,
            dashArray: style.strokeDasharray.split(/[,\\s]+/).filter(Boolean).map(Number.parseFloat),
            animationDuration: getComputedStyle(element.ownerSVGElement).animationDuration
        };
    });
    assert.equal(spinnerArc.radius, '9px');
    assert.equal(spinnerArc.strokeWidth, '2.5px');
    assert.ok(Math.abs(spinnerArc.dashArray[0] - Math.PI * 9 / 2) < 0.03, 'Spinner paints a quarter-circle arc.');
    assert.ok(Math.abs(spinnerArc.dashArray[1] - Math.PI * 27 / 2) < 0.03, 'Spinner leaves three quarters of the circle empty.');
    assert.equal(spinnerArc.animationDuration, '0.8s');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await labeledSpinner.locator('svg').evaluate(element => getComputedStyle(element).animationDuration), '1.6s');
    check('UiSpinner uses 16/24 px sizing, hides an unlabeled spinner, exposes one named status when labeled, and keeps the 9 px quarter arc, 2.5 px stroke, 800/1600 ms motion.');

    await openMenu('#adapter-trigger', '#adapter-menu');
    assert.equal(await page.locator('#adapter-keep-open').getAttribute('role'), 'menuitemcheckbox');
    assert.equal(await page.locator('#adapter-keep-open').getAttribute('aria-checked'), 'true');
    assert.equal(await page.locator('#adapter-unchecked').getAttribute('aria-checked'), 'false');
    assert.equal(await page.locator('#adapter-keep-open').evaluate(element => element.hasAttribute('data-ui-menu-keep-open')), true);
    assert.equal(await page.locator('#adapter-icon').textContent(), '●');
    assert.equal(await page.locator('#adapter-trailing').textContent(), '⌘K');
    await page.locator('#adapter-keep-open').click();
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.adapterClicks), ['keep']);
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.adapterOpen), true, 'keepOpen retains the menu.');
    await page.locator('#adapter-disabled').dispatchEvent('click', { bubbles: true });
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.adapterClicks), ['keep'], 'Disabled menu items do not emit click.');
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.adapterOpen), true, 'Disabled menu items do not close the menu.');
    await page.locator('#adapter-unchecked').click();
    await page.waitForFunction(() => window.componentConsolidation.state.adapterOpen === false);
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.adapterClicks), ['keep', 'unchecked']);
    check('UiMenuItem adapts checked/disabled/keepOpen, icon and trailing slots; enabled selection closes, keepOpen and disabled selection stay open.');

    await openMenu('#tracked-trigger', '#tracked-menu');
    await page.locator('#tracked-list').focus();
    await setState({ trackedFocusHistory: [] });
    await page.locator('#tracked-list').evaluate(element => element.focus());
    await setState({ trackedFocusHistory: [] });
    await page.evaluate(() => { window.componentConsolidation.state.vetoNextArrow = true; });
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'tracked-list', 'A prevented menu key is not handled again by UiMenu.');
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.trackedFocusHistory), []);
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.activeElement?.id === 'tracked-keep');
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.trackedFocusHistory), ['tracked-keep']);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.componentConsolidation.state.trackedClicks.length === 1);
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.trackedClicks), ['keep'], 'Enter activates a full-row slot once.');
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.trackedOpen), true, 'The full-row keep-open marker is honored.');
    assert.equal(await page.locator('#tracked-keep').evaluate(element => element.hasAttribute('data-ui-menu-keep-open')), true);

    await page.evaluate(() => { window.componentConsolidation.state.trackedFocusHistory = []; });
    await pressAndAssertFocus('ArrowDown', 'tracked-last');
    await pressAndAssertFocus('Home', 'tracked-keep');
    await pressAndAssertFocus('End', 'tracked-last');
    await pressAndAssertFocus('ArrowDown', 'tracked-keep');
    await pressAndAssertFocus('ArrowUp', 'tracked-last');
    const clicksBeforeDisabled = await page.evaluate(() => window.componentConsolidation.state.trackedClicks.length);
    await page.locator('#tracked-blocked').dispatchEvent('click', { bubbles: true });
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.trackedClicks.length), clicksBeforeDisabled, 'Disabled full-row items do not act.');
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.trackedOpen), true, 'Disabled full-row items do not close the menu.');
    await page.locator('#tracked-keep').focus();
    const tabSnapshot = await page.evaluate(() => {
        const surface = document.querySelector('#tracked-menu');
        return {
            activeElementId: document.activeElement?.id,
            surfaceState: surface?.getAttribute('data-state'),
            focusables: [...(surface?.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? [])].map(element => ({
                id: element.id,
                tabIndex: element.tabIndex,
                display: getComputedStyle(element).display,
                rectCount: element.getClientRects().length
            }))
        };
    });
    report.diagnostics.tabBoundaryBefore = tabSnapshot;
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'tracked-menu-inside', `Tab advances past the preceding list root from the current menu row. Snapshot: ${JSON.stringify(tabSnapshot)}`);
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.trackedOpen), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'tracked-list', 'Shift+Tab returns to the preceding real focus target inside the menu.');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'tracked-menu-inside', 'Tab returns to the next real focus target after the tracked list root.');
    await page.keyboard.press('Tab');
    await page.waitForFunction(() => window.componentConsolidation.state.trackedOpen === false);
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('#tracked-menu'))), false, 'Tab leaves the menu at its traversal boundary.');
    check('A tracked UList with a full-row UListItem slot moves focus once, skips disabled rows, honors defaultPrevented, activates once on Enter, keeps marked rows open, and lets Tab leave at the boundary.');

    await openMenu('#panel-trigger', '#panel-menu-surface');
    assert.equal(await page.locator('#panel-menu-surface').getAttribute('role'), 'dialog');
    await page.locator('#panel-list').focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.querySelector('#panel-list')?.getAttribute('aria-activedescendant') === 'panel-first');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'panel-list', 'Panel list track mode keeps focus on its root.');
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.querySelector('#panel-list')?.getAttribute('aria-activedescendant') === 'panel-last');
    await page.keyboard.press('Home');
    await page.waitForFunction(() => document.querySelector('#panel-list')?.getAttribute('aria-activedescendant') === 'panel-first');
    await page.keyboard.press('End');
    await page.waitForFunction(() => document.querySelector('#panel-list')?.getAttribute('aria-activedescendant') === 'panel-last');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.componentConsolidation.state.panelClicks.length === 1);
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.panelClicks), ['last']);
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.panelOpen), true);
    check('Panel UiMenu yields Arrow/Home/End and Enter to UList track navigation while preserving root focus and skipping disabled rows.');
    await page.locator('#panel-trigger').click();
    await page.waitForFunction(() => window.componentConsolidation.state.panelOpen === false);

    await page.locator('#legacy-panel-input').fill('changed while active');
    await page.locator('#legacy-tabs-tab-second').click();
    assert.equal(await page.locator('#legacy-tabs-panel-first').evaluate(element => getComputedStyle(element).display), 'none');
    assert.equal(await page.locator('#legacy-tabs-panel-first').getAttribute('role'), 'tabpanel');
    assert.equal(await page.locator('#legacy-tabs-panel-first').getAttribute('aria-labelledby'), 'legacy-tabs-tab-first');
    assert.equal(await page.locator('#legacy-tabs-panel-second').getAttribute('aria-labelledby'), 'legacy-tabs-tab-second');
    assert.equal(await page.locator('#legacy-panel-input').count(), 1, 'The hidden scalar panel remains mounted.');
    await page.locator('#legacy-tabs-tab-first').click();
    assert.equal(await page.locator('#legacy-panel-input').inputValue(), 'changed while active', 'The retained panel keeps its internal state.');
    check('Legacy UiTabPanel keeps scalar value selection, idPrefix ARIA links, and hidden panel state.');

    assert.equal(await page.evaluate(() => window.componentConsolidation.snackbarTimeoutDefault), 5000, 'USnackbar keeps its raw 5000 ms timeout default.');
    const singleAlert = page.locator('#single-controlled-snackbar');
    assert.equal(await singleAlert.getAttribute('role'), 'alert');
    assert.equal(await singleAlert.getAttribute('aria-live'), 'assertive');
    await page.waitForTimeout(180);
    assert.equal(await page.evaluate(() => window.componentConsolidation.state.singleOpen), true, 'A controlled snackbar with timeout -1 remains open.');
    await singleAlert.getByRole('button').click();
    await page.waitForFunction(() => window.componentConsolidation.state.singleOpen === false);
    assert.deepEqual(await page.evaluate(() => window.componentConsolidation.state.singleUpdates), [false]);
    check('A single controlled USnackbar honors timeout -1 and forwards its role/aria-live attributes.');

    const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    const noticeIds = await page.evaluate(positions => positions.map((position, index) => window.componentConsolidation.snackbar.show(
        'position-' + position,
        { position, duration: 0, tone: index === 2 ? 'error' : index === 1 ? 'success' : 'info' }
    )), positions);
    await page.waitForFunction(() => window.componentConsolidation.getNotices().length === 6);
    for (const position of positions) {
        assert.equal(await page.locator(`.ui-snackbar-stack[data-position="${position}"] .ui-snackbar-service-message`).count(), 1);
    }
    const errorNotice = page.locator('.ui-snackbar-service-message').filter({ hasText: 'position-top-right' }).locator('.u-notice');
    assert.equal(await errorNotice.getAttribute('role'), 'alert');
    assert.equal(await errorNotice.getAttribute('aria-live'), 'assertive');
    const successNotice = page.locator('.ui-snackbar-service-message').filter({ hasText: 'position-top-center' }).locator('.u-notice');
    assert.equal(await successNotice.getAttribute('role'), 'status');
    assert.equal(await successNotice.getAttribute('aria-live'), 'polite');
    await page.waitForTimeout(160);
    assert.equal(await page.evaluate(() => window.componentConsolidation.getNotices().length), 6, 'Duration zero is persistent until manually dismissed.');
    const manuallyDismissed = page.locator('.ui-snackbar-service-message').filter({ hasText: 'position-bottom-center' });
    await manuallyDismissed.getByRole('button').click();
    await page.waitForFunction(id => !window.componentConsolidation.getNotices().some(notice => notice.id === id), noticeIds[4]);
    assert.equal(await page.evaluate(() => window.componentConsolidation.getNotices().length), 5);
    check('SnackbarHost renders all six positions, maps error to alert/assertive and other tones to status/polite, and supports manual dismissal of duration-zero notices.');
    await page.evaluate(() => window.componentConsolidation.snackbar.clear());
    await page.waitForFunction(() => window.componentConsolidation.getNotices().length === 0);

    const shortId = await page.evaluate(() => window.componentConsolidation.snackbar.show('short timeout', { duration: 180, position: 'bottom-center' }));
    await page.waitForFunction(id => window.componentConsolidation.getNotices().some(notice => notice.id === id), shortId);
    await page.waitForFunction(id => !window.componentConsolidation.getNotices().some(notice => notice.id === id), shortId, { timeout: 2000 });
    check('Snackbar service applies a short explicit duration at runtime.');

    // Keep the browser pointer off the toast before checking its unpaused default lifetime.
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement?.blur());
    const defaultId = await page.evaluate(() => window.componentConsolidation.snackbar.show('service default duration'));
    const defaultNotice = await page.evaluate(id => window.componentConsolidation.getNotices().find(notice => notice.id === id), defaultId);
    assert.equal(defaultNotice.duration, 6000, 'Snackbar service default remains 6000 ms.');
    await page.waitForTimeout(5200);
    assert.ok(await page.evaluate(id => window.componentConsolidation.getNotices().some(notice => notice.id === id), defaultId), 'Host surface outlives the raw USnackbar 5000 ms default because the service owns expiry.');
    await page.waitForFunction(id => !window.componentConsolidation.getNotices().some(notice => notice.id === id), defaultId, { timeout: 2000 });
    check('SnackbarHost uses the service 6000 ms default while the reusable USnackbar keeps its separate 5000 ms raw default.');

    const pausedId = await page.evaluate(() => window.componentConsolidation.snackbar.show('independent pause reasons', { duration: 360, position: 'bottom-center' }));
    const pausedMessage = page.locator('.ui-snackbar-service-message').filter({ hasText: 'independent pause reasons' });
    await pausedMessage.waitFor({ state: 'visible' });
    await pausedMessage.locator('.u-notice').dispatchEvent('pointerenter');
    await pausedMessage.getByRole('button').focus();
    await page.waitForTimeout(420);
    assert.ok(await page.evaluate(id => window.componentConsolidation.getNotices().some(notice => notice.id === id), pausedId), 'Pointer and focus together pause expiry.');
    await pausedMessage.locator('.u-notice').dispatchEvent('pointerleave');
    await page.waitForTimeout(420);
    assert.ok(await page.evaluate(id => window.componentConsolidation.getNotices().some(notice => notice.id === id), pausedId), 'Resuming pointer does not resume while focus still holds a pause.');
    await page.evaluate(() => document.activeElement?.blur());
    await page.waitForFunction(id => !window.componentConsolidation.getNotices().some(notice => notice.id === id), pausedId, { timeout: 1500 });
    check('Snackbar pointer and focus pause reasons are independent; resuming one leaves the other pause active.');

    await page.evaluate(() => {
        window.componentConsolidation.serviceTimerProbe.timers.length = 0;
        window.componentConsolidation.serviceTimerProbe.enabled = true;
        window.componentConsolidation.snackbar.show('host unmount cleanup', { duration: 5000 });
    });
    await page.waitForFunction(() => window.componentConsolidation.getNotices().length === 1);
    await setState({ hostMounted: false });
    await page.waitForFunction(() => window.componentConsolidation.getNotices().length === 0);
    const clearedTimers = await page.evaluate(() => window.componentConsolidation.serviceTimerProbe.timers.map(timer => timer.cleared));
    assert.deepEqual(clearedTimers, [true], 'Unmount clears each service timer along with service notices.');
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.componentConsolidation.getNotices().length), 0);
    await setState({ hostMounted: true });
    check('Unmounting SnackbarHost clears service notices and their active timers.');

    await setState({
        progressValue: 62,
        progressMax: 100,
        progressTone: 'accent',
        legacyValue: 'first',
        singleOpen: false,
        hostMounted: true
    });
    await page.evaluate(() => window.componentConsolidation.snackbar.show('Visual QA notice', { position: 'top-right', duration: 0, tone: 'info' }));
    await openMenu('#adapter-trigger', '#adapter-menu');
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });

    assert.deepEqual(report.runtimeErrors, [], 'The isolated fixture must have no runtime errors.');
    assert.deepEqual(report.vueWarnings, [], 'The isolated fixture must have no Vue warnings.');
    report.sourceSha256After = await hashSources();
    report.sourceUnchanged = JSON.stringify(report.sourceSha256After) === JSON.stringify(report.sourceSha256Before);
    assert.equal(report.sourceUnchanged, true, 'Target sources changed during validation.');
} catch (error) {
    failure = error;
    report.failure = { name: error?.name ?? 'Error', message: error?.message ?? String(error) };
} finally {
    report.sourceSha256After ??= await hashSources().catch(error => ({ error: error.message }));
    report.sourceUnchanged ??= JSON.stringify(report.sourceSha256After) === JSON.stringify(report.sourceSha256Before);
    report.screenshotCreated = await readFile(screenshot).then(() => true, () => false);
    await browser?.close();
    await vite.close();
    await writeFile(path.join(evidence, 'result.json'), JSON.stringify(report, null, 4), 'utf8');
}

if (failure) throw failure;
console.log(`Component consolidation: ${report.checks.length} protocol groups passed`);
