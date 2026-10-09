import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/navigation-surfaces-protocols');
await mkdir(evidence, { recursive: true });

const ownedSources = [
    'src/ui/UBottomNavigation.vue',
    'src/ui/UBottomSheet.vue',
    'src/ui/UStepperWindow.vue',
    'src/ui/UStepperWindowItem.vue',
    'src/ui/stepper-window-context.ts',
    'tests/desktop/navigation-surfaces-protocols.mjs',
    'tests/tsconfig.navigation-surfaces.json'
];
const dependencySources = [
    'src/ui/UOverlay.vue',
    'src/ui/overlay-props.ts',
    'src/ui/overlay-back.ts',
    'src/ui/overlay-lifecycle.ts',
    'src/ui/UWindow.vue',
    'src/ui/UWindowItem.vue',
    'src/ui/window-state.ts',
    'src/ui/group-state.ts',
    'src/ui/UStepper.vue',
    'src/ui/UStepperItem.vue',
    'src/ui/stepper-state.ts',
    'src/ui/UItemGroup.vue',
    'src/ui/item-group-state.ts',
    'src/ui/button-group.ts',
    'src/ui/UiButton.vue',
    'src/ui/bottom-navigation.ts',
    'src/ui/layout-completion.ts'
];
const hashSources = async files => Object.fromEntries(await Promise.all(files.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
])));

const fixture = `<!doctype html>
<html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"></head>
    <body><div id="app"></div><script type="module">
        import { createApp, h, nextTick, reactive, ref } from 'vue';
        import * as UI from '/src/ui/index.ts';
        import '/src/ui/styles.css';

        const objects = { a: { id: 'a' }, b: { id: 'b' }, c: { id: 'c' } };
        const state = reactive({
            navModel: [], navActive: true, navDisabled: false, navReadonly: false, navMandatory: false,
            navADisabled: false, navBDisabled: false, navCDisabled: false,
            secondNavActive: true,
            sheetOpen: false, sheetUpdates: 0, sheetOutside: 0, sheetKeydown: 0, sheetEnter: 0, sheetLeave: 0,
            sheetEagerOpen: false,
            stepperValue: 'step-a', windowModel: null, showStepB: true,
            standaloneModel: null,
            inheritedEagerModel: null,
            keyedOrder: ['key-a', 'key-b', 'key-c'], keyedModel: 1,
            keyedExplicitEager: true
        });
        const refs = {
            nav: ref(), navSecond: ref(), absoluteNav: ref(), sheet: ref(), eagerSheet: ref(),
            stepWindow: ref(), standaloneWindow: ref(), keyedWindow: ref()
        };
        const compareObjects = (left, right) => left?.id === right?.id;

        function mainNavigation() {
            return h(UI.UBottomNavigation, {
                id: 'nav-main', ref: refs.nav, tag: 'section',
                modelValue: state.navModel, 'onUpdate:modelValue': value => { state.navModel = value; },
                active: state.navActive, 'onUpdate:active': value => { state.navActive = value; },
                multiple: true, max: 2, valueComparator: compareObjects,
                disabled: state.navDisabled, readonly: state.navReadonly,
                mandatory: state.navMandatory, selectedClass: 'is-protocol-selected',
                fixed: true, order: 10, height: 56, density: 'comfortable', grow: true, mode: 'shift', label: 'Primary navigation'
            }, {
                default: scope => [
                    h('output', { id: 'nav-slot-values' }, JSON.stringify(scope.selectedValues.map(value => value?.id ?? value))),
                    h(UI.UiButton, { id: 'nav-a', value: objects.a, disabled: state.navADisabled }, { default: () => 'Alpha' }),
                    h(UI.UiButton, { id: 'nav-b', value: objects.b, disabled: state.navBDisabled }, { default: () => 'Beta' }),
                    h(UI.UiButton, { id: 'nav-c', value: objects.c, disabled: state.navCDisabled }, { default: () => 'Gamma' }),
                    h('button', { id: 'nav-next', type: 'button', onClick: scope.next }, 'Next group value')
                ]
            });
        }

        function secondNavigation() {
            return h(UI.UBottomNavigation, {
                id: 'nav-second', ref: refs.navSecond, tag: 'footer', active: state.secondNavActive,
                fixed: true, order: 20, height: 44, label: 'Secondary navigation'
            }, { default: () => [] });
        }

        function absoluteNavigation() {
            return h(UI.UBottomNavigation, {
                id: 'nav-absolute', ref: refs.absoluteNav, tag: 'aside', absolute: true,
                height: '3rem', density: 'compact', mode: 'horizontal', label: 'Absolute navigation',
                style: { pointerEvents: 'none' }
            }, { default: () => [] });
        }

        function defaultNavigation() {
            return h(UI.UBottomNavigation, { id: 'nav-default' }, {
                default: () => h(UI.UiButton, { value: 'default' }, { default: () => 'Default active' })
            });
        }

        function bottomSheets() {
            return [
                h(UI.UBottomSheet, {
                    id: 'sheet-dialog', ref: refs.sheet,
                    modelValue: state.sheetOpen,
                    'onUpdate:modelValue': value => { state.sheetOpen = value; state.sheetUpdates++; },
                    'onClick:outside': () => { state.sheetOutside++; },
                    onKeydown: () => { state.sheetKeydown++; },
                    onAfterEnter: () => { state.sheetEnter++; },
                    onAfterLeave: () => { state.sheetLeave++; },
                    height: 180, maxHeight: '60vh', inset: true,
                    contentProps: { 'data-content-prop': 'forwarded' }
                }, {
                    activator: ({ props }) => h('button', { ...props, id: 'sheet-open', type: 'button' }, 'Open sheet'),
                    default: ({ isActive, close }) => h('div', { id: 'sheet-inner' }, [
                        h('output', { id: 'sheet-active' }, String(isActive.value)),
                        h('button', { id: 'sheet-close', type: 'button', onClick: close }, 'Close sheet')
                    ])
                }),
                h(UI.UBottomSheet, {
                    id: 'sheet-eager-dialog', ref: refs.eagerSheet, eager: true,
                    modelValue: state.sheetEagerOpen, 'onUpdate:modelValue': value => { state.sheetEagerOpen = value; },
                    height: 'auto', maxHeight: 220, inset: false
                }, { default: () => h('output', { id: 'sheet-eager-content' }, 'Eager content') })
            ];
        }

        function stepperWindows() {
            const primary = h(UI.UStepper, {
                modelValue: state.stepperValue,
                'onUpdate:modelValue': value => { state.stepperValue = value; }
            }, {
                default: () => [
                    h(UI.UStepperItem, { value: 'step-a', title: 'Step A' }),
                    h(UI.UStepperItem, { value: 'step-b', title: 'Step B', disabled: true }),
                    h(UI.UStepperItem, { value: 'step-c', title: 'Step C' }),
                    h(UI.UStepperWindow, {
                        id: 'step-window', ref: refs.stepWindow,
                        modelValue: state.windowModel,
                        'onUpdate:modelValue': value => { state.windowModel = value; },
                        height: 120, tag: 'section', label: 'Main step window',
                        onKeydown: undefined
                    }, {
                        default: scope => [
                            h('output', { id: 'step-window-slot-model' }, String(scope.modelValue ?? 'null')),
                            h('output', { id: 'step-window-values' }, JSON.stringify(scope.group.values)),
                            h('button', { id: 'step-window-next', type: 'button', onClick: scope.next }, 'Next window item'),
                            h(UI.UStepperWindowItem, { value: 'step-a' }, { default: () => h('output', { id: 'panel-step-a' }, 'Step panel A') }),
                            state.showStepB ? h(UI.UStepperWindowItem, { value: 'step-b', disabled: true }, { default: () => h('output', { id: 'panel-step-b' }, 'Step panel B') }) : null,
                            h(UI.UStepperWindowItem, { value: 'step-c' }, { default: () => h('output', { id: 'panel-step-c' }, 'Step panel C') })
                        ]
                    })
                ]
            });

            const standalone = h(UI.UWindow, {
                id: 'standalone-window', ref: refs.standaloneWindow,
                modelValue: state.standaloneModel,
                'onUpdate:modelValue': value => { state.standaloneModel = value; },
                mandatory: false, touch: false, height: 90, tag: 'article'
            }, {
                default: scope => [
                    h('output', { id: 'standalone-window-values' }, JSON.stringify(scope.group.values)),
                    h('button', { id: 'standalone-next', type: 'button', onClick: scope.next }, 'Next standalone'),
                    h(UI.UStepperWindowItem, { id: 'standalone-item-zero' }, { default: () => h('output', { id: 'standalone-panel-zero' }, 'Standalone zero') }),
                    h(UI.UStepperWindowItem, { id: 'standalone-item-one' }, { default: () => h('output', { id: 'standalone-panel-one' }, 'Standalone one') })
                ]
            });

            const inheritedEager = h(UI.UWindow, {
                id: 'inherited-eager-window', modelValue: state.inheritedEagerModel,
                'onUpdate:modelValue': value => { state.inheritedEagerModel = value; },
                mandatory: false, eager: true
            }, {
                default: () => [
                    h(UI.UStepperWindowItem, { value: 'eager-off', eager: false }, { default: () => h('output', { id: 'eager-panel-off' }, 'Explicit eager false') }),
                    h(UI.UStepperWindowItem, { value: 'eager-on' }, { default: () => h('output', { id: 'eager-panel-on' }, 'Inherited eager true') })
                ]
            });

            const keyed = h(UI.UStepper, { mandatory: false }, {
                default: () => h(UI.UStepperWindow, {
                    id: 'keyed-window', ref: refs.keyedWindow,
                    modelValue: state.keyedModel,
                    'onUpdate:modelValue': value => { state.keyedModel = value; },
                    mandatory: false
                }, {
                    default: scope => [
                        h('output', { id: 'keyed-window-values' }, JSON.stringify(scope.group.values)),
                        h('button', { id: 'keyed-reorder', type: 'button', onClick: () => { state.keyedOrder = ['key-b', 'key-a', 'key-c']; } }, 'Reorder keyed items'),
                        ...state.keyedOrder.map(key => h(UI.UStepperWindowItem, {
                            key,
                            eager: key === 'key-a' ? state.keyedExplicitEager : undefined
                        }, { default: () => h('output', { 'data-keyed-panel': key }, key) }))
                    ]
                })
            });

            return [primary, standalone, inheritedEager, keyed];
        }

        const app = createApp({
            setup() {
                window.navigationSurfacesProbe = {
                    UI,
                    state,
                    refs,
                    async flush() { await nextTick(); await nextTick(); await new Promise(resolve => setTimeout(resolve, 80)); await nextTick(); },
                    selectedIds() { return refs.nav.value?.selectedIds ?? []; },
                    selectedValues() { return refs.nav.value?.selectedValues ?? []; },
                    windowValues() { return refs.stepWindow.value?.$?.exposed?.modelValue ?? null; }
                };
                return () => h(UI.UApp, { id: 'ui-app' }, {
                    default: () => h('main', { id: 'fixture-main' }, [
                        mainNavigation(), secondNavigation(), absoluteNavigation(), defaultNavigation(),
                        ...bottomSheets(),
                        ...stepperWindows()
                    ])
                });
            }
        });
        app.use(UI.createUI()).mount('#app');
    </script></body>
</html>`;

const route = '/__navigation-surfaces-protocols';
const server = await createServer({
    appType: 'custom',
    root,
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'error',
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
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    plugins: [{
        name: 'navigation-surfaces-protocols-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== route) { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml(route, fixture));
            });
        }
    }]
});

const report = {
    fixture: 'navigation-surfaces-protocols',
    method: 'Live Vue components are imported through src/ui/index.ts and exercised in Chromium.',
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    httpErrors: [],
    requestFailures: [],
    sourceSha256: await hashSources([...ownedSources, ...dependencySources]),
    limits: [
        'This verifies public-source runtime behavior in Chromium, not the compiled npm package.',
        'Screenshots are test diagnostics only; visual acceptance is not claimed.',
        'No full project build, complete unit suite, or full UI suite was run.'
    ]
};

let browser;
try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) report.consoleWarnings.push(message.text());
    });
    page.on('requestfailed', request => report.requestFailures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push(`${response.status()} ${response.url()}`); });

    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}${route}`);
    await page.waitForFunction(() => Boolean(window.navigationSurfacesProbe));
    const flush = async () => page.evaluate(() => window.navigationSurfacesProbe.flush());
    const read = async expression => page.evaluate(expression);
    await flush();

    assert.equal(await page.locator('#nav-main').evaluate(element => element.tagName), 'SECTION');
    assert.equal(await page.locator('#nav-main').getAttribute('role'), 'navigation');
    assert.equal(await page.locator('#nav-main').getAttribute('aria-label'), 'Primary navigation');
    assert.equal(await page.locator('#nav-main').evaluate(element => element.classList.contains('is-grow') && element.classList.contains('is-shift') && element.classList.contains('is-comfortable')), true);
    assert.equal(await page.locator('#nav-absolute').evaluate(element => element.tagName), 'ASIDE');
    assert.equal(await page.locator('#nav-absolute').evaluate(element => element.classList.contains('is-absolute') && element.classList.contains('is-compact') && element.classList.contains('is-horizontal')), true);
    assert.equal(await page.locator('#nav-default').evaluate(element => getComputedStyle(element).display !== 'none' && element.classList.contains('is-active')), true);
    report.checks.push('BottomNavigation renders tag, role, label, grow/mode/density and absolute/fixed state classes.');

    await page.locator('#nav-a').click();
    await page.locator('#nav-b').click();
    await page.locator('#nav-c').click();
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues().map(value => value.id)), ['a', 'b']);
    assert.equal((await page.locator('#nav-a').getAttribute('class')).includes('is-protocol-selected'), true);
    assert.equal(await page.locator('#nav-slot-values').textContent(), '["a","b"]');
    report.checks.push('BottomNavigation registers public UiButton children, applies comparator/max and exposes selected values/classes through its slot.');

    await page.evaluate(() => { window.navigationSurfacesProbe.state.navModel = [{ id: 'a' }]; });
    await flush();
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedIds().length), 1);
    assert.equal(await page.locator('#nav-a').getAttribute('aria-pressed'), 'true');
    await page.locator('#nav-b').click();
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues().map(value => value.id)), ['a', 'b']);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navMandatory = true; window.navigationSurfacesProbe.state.navModel = [{ id: 'a' }]; });
    await flush();
    await page.locator('#nav-a').click();
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues().map(value => value.id)), ['a']);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navMandatory = false; });
    await flush();
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navReadonly = true; window.navigationSurfacesProbe.state.navModel = []; });
    await flush();
    await page.locator('#nav-a').click();
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues()), []);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navReadonly = false; window.navigationSurfacesProbe.state.navADisabled = true; });
    await flush();
    await page.locator('#nav-a').click({ force: true });
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues()), []);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navADisabled = false; window.navigationSurfacesProbe.state.navDisabled = true; });
    await flush();
    await page.locator('#nav-b').click({ force: true });
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues()), []);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navADisabled = false; window.navigationSurfacesProbe.state.navModel = [{ id: 'a' }]; });
    await flush();
    assert.deepEqual(await read(() => window.navigationSurfacesProbe.selectedValues().map(value => value.id)), ['a']);
    report.checks.push('Comparator state remains selected for equivalent object references; readonly and disabled children reject changes.');

    assert.equal(await page.locator('#nav-second').evaluate(element => Number.parseFloat(getComputedStyle(element).bottom) > 0), true);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navActive = false; });
    await flush();
    assert.equal(await page.locator('#nav-main').evaluate(element => getComputedStyle(element).display === 'none'), true);
    assert.equal(await page.locator('#nav-second').evaluate(element => Number.parseFloat(getComputedStyle(element).bottom) === 0), true);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.navActive = true; });
    await flush();
    assert.equal(await page.locator('#nav-main').evaluate(element => getComputedStyle(element).display !== 'none'), true);
    report.checks.push('active v-model hides/shows navigation and releases/restores the ordered fixed-layout offset.');

    await page.screenshot({ path: path.join(evidence, 'navigation-surfaces.png'), fullPage: true });
    assert.equal(await page.locator('#sheet-inner').count(), 0);
    assert.equal(await page.locator('#sheet-eager-content').count(), 1);
    await page.locator('#sheet-open').click();
    await page.waitForFunction(() => document.querySelector('#sheet-dialog')?.matches('[open][data-state="open"]'));
    await page.waitForFunction(() => window.navigationSurfacesProbe.state.sheetEnter === 1);
    await flush();
    const sheet = page.locator('#sheet-dialog');
    assert.equal(await sheet.getAttribute('data-scroll-strategy'), 'block');
    assert.equal(await sheet.getAttribute('aria-modal'), 'true');
    assert.equal(await sheet.getAttribute('data-content-prop'), 'forwarded');
    assert.equal(await page.locator('#sheet-dialog .ui-bottom-sheet').evaluate(element => element.classList.contains('is-inset')), true);
    assert.equal(await page.locator('#sheet-dialog .ui-bottom-sheet').evaluate(element => getComputedStyle(element).height === '180px'), true);
    assert.equal(await page.locator('#sheet-active').textContent(), 'true');
    assert.equal(await page.locator('#sheet-close').evaluate(element => document.activeElement === element), true);
    assert.equal(await read(() => window.navigationSurfacesProbe.refs.sheet.value?.isActive), true);
    assert.equal(await read(() => window.navigationSurfacesProbe.refs.sheet.value?.contentEl?.tagName), 'DIALOG');
    assert.equal(await read(() => window.navigationSurfacesProbe.refs.sheet.value?.activatorEl?.id), 'sheet-open');
    assert.equal(await read(() => typeof window.navigationSurfacesProbe.refs.sheet.value?.close), 'function');
    assert.equal(await read(() => typeof window.navigationSurfacesProbe.refs.sheet.value?.open), 'function');
    assert.equal(await read(() => typeof window.navigationSurfacesProbe.refs.sheet.value?.updateLocation), 'function');
    report.checks.push('BottomSheet forwards attrs/dimensions/inset/default slot scope, blocks scrolling, captures focus, exposes active and close refs.');
    await page.screenshot({ path: path.join(evidence, 'bottom-sheet-open.png'), fullPage: true });

    await page.locator('#sheet-close').click();
    await page.waitForFunction(() => !document.querySelector('#sheet-dialog')?.open);
    await page.waitForTimeout(250);
    await flush();
    assert.equal(await read(() => window.navigationSurfacesProbe.state.sheetOpen), false);
    assert.equal(await read(() => window.navigationSurfacesProbe.state.sheetUpdates), 2);
    assert.equal(await read(() => window.navigationSurfacesProbe.state.sheetEnter), 1);
    assert.equal(await read(() => window.navigationSurfacesProbe.state.sheetLeave), 1);
    await page.locator('#sheet-open').click();
    await page.waitForFunction(() => document.querySelector('#sheet-dialog')?.open);
    await page.locator('body').click({ position: { x: 4, y: 4 } });
    await page.waitForFunction(() => !document.querySelector('#sheet-dialog')?.open);
    assert.equal(await read(() => window.navigationSurfacesProbe.state.sheetOutside), 1);
    await page.locator('#sheet-open').click();
    await page.waitForFunction(() => document.querySelector('#sheet-dialog')?.open);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#sheet-dialog')?.open);
    await page.waitForTimeout(250);
    assert.equal(await read(() => window.navigationSurfacesProbe.state.sheetKeydown), 1);
    assert.equal(await page.locator('#sheet-open').evaluate(element => document.activeElement === element), true);
    report.checks.push('BottomSheet activator, close, controlled updates, outside event and after-enter/leave events remain connected.');

    assert.equal(await page.locator('#step-window').evaluate(element => element.tagName), 'SECTION');
    assert.equal(await page.locator('#step-window').getAttribute('aria-label'), 'Main step window');
    assert.equal(await page.locator('#step-window').evaluate(element => element.classList.contains('u-stepper-window') && element.classList.contains('u-window')), true);
    assert.equal(await page.locator('#panel-step-a').count(), 1);
    assert.deepEqual(await read(() => JSON.parse(document.querySelector('#step-window-values').textContent)), ['step-a', 'step-b', 'step-c']);
    await page.locator('#step-window-next').click();
    await flush();
    await page.waitForTimeout(350);
    assert.equal(await read(() => window.navigationSurfacesProbe.state.windowModel), 'step-c');
    assert.equal(await read(() => window.navigationSurfacesProbe.state.stepperValue), 'step-a');
    assert.equal(await page.locator('#panel-step-c').count(), 1);
    assert.equal(await page.locator('#panel-step-a').count(), 0);
    assert.equal(await page.locator('#panel-step-b').count(), 0);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.windowModel = null; window.navigationSurfacesProbe.state.stepperValue = 'step-c'; });
    await flush();
    assert.equal(await page.locator('#step-window-slot-model').textContent(), 'step-c');
    assert.equal(await page.locator('#panel-step-c').count(), 1);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.windowModel = 'step-a'; });
    await flush();
    assert.equal(await page.locator('#step-window-slot-model').textContent(), 'step-a');
    report.checks.push('StepperWindow falls back to the injected stepper selection, keeps an independent explicit model, and skips a disabled item.');

    await page.evaluate(() => { window.navigationSurfacesProbe.state.showStepB = false; window.navigationSurfacesProbe.state.windowModel = null; window.navigationSurfacesProbe.state.stepperValue = 'step-a'; });
    await flush();
    assert.deepEqual(await read(() => JSON.parse(document.querySelector('#step-window-values').textContent)), ['step-a', 'step-c']);
    assert.equal(await read(() => typeof window.navigationSurfacesProbe.refs.stepWindow.value?.next), 'function');
    assert.equal(await read(() => typeof window.navigationSurfacesProbe.refs.stepWindow.value?.prev), 'function');
    report.checks.push('Removing an item unregisters it; Window refs expose next/prev.');

    assert.deepEqual(await read(() => JSON.parse(document.querySelector('#standalone-window-values').textContent)), [0, 1]);
    await page.locator('#standalone-next').click();
    await flush();
    assert.equal(await read(() => window.navigationSurfacesProbe.state.standaloneModel), 0);
    assert.equal(await page.locator('#standalone-panel-zero').count(), 1);
    report.checks.push('Standalone UWindow items without values receive positional numeric values.');

    assert.equal(await page.locator('#eager-panel-on').count(), 1);
    assert.equal(await page.locator('#eager-panel-off').count(), 0);
    report.checks.push('UWindow eager is inherited by items, while an explicit item eager=false overrides it.');

    assert.deepEqual(await read(() => JSON.parse(document.querySelector('#keyed-window-values').textContent)), [0, 1, 2]);
    assert.equal(await page.locator('[data-keyed-panel="key-b"]').count(), 1);
    await page.locator('#keyed-reorder').click();
    await flush();
    await page.waitForTimeout(350);
    assert.deepEqual(await read(() => JSON.parse(document.querySelector('#keyed-window-values').textContent)), [0, 1, 2]);
    assert.equal(await page.locator('[data-keyed-panel="key-a"]').count(), 1);
    assert.equal(await page.locator('[data-keyed-panel="key-b"]').count(), 0);
    await page.evaluate(() => { window.navigationSurfacesProbe.state.keyedModel = 2; });
    await flush();
    await page.waitForTimeout(350);
    assert.equal(await page.locator('[data-keyed-panel="key-a"]').count(), 1);
    assert.equal(await page.locator('[data-keyed-panel="key-b"]').count(), 0);
    assert.equal(await page.locator('[data-keyed-panel="key-c"]').count(), 1);
    report.checks.push('Keyed item reorder updates implicit positional values without generated UUIDs; eager remains an item override.');

    await page.screenshot({ path: path.join(evidence, 'stepper-window-selected.png'), fullPage: true });
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.consoleWarnings, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.requestFailures, []);
    const afterOwned = await hashSources(ownedSources);
    assert.deepEqual(afterOwned, Object.fromEntries(ownedSources.map(file => [file, report.sourceSha256[file]])));
    report.ownedSourceStable = true;
    report.completedAt = new Date().toISOString();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    process.stdout.write(`navigation surface protocols: ${report.checks.length} checks passed\n`);
} catch (error) {
    report.failure = String(error?.stack ?? error);
    report.completedAt = new Date().toISOString();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    throw error;
} finally {
    await browser?.close();
    await server.close();
}
