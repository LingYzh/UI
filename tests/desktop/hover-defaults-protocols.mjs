import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/hover-defaults-protocols');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>
    html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; }
    body { margin: 0; padding: 20px; background: var(--surface); color: var(--text); }
    main { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; width: min(1200px, 100%); margin: 0 auto; }
    .fixture-panel { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    .protocol-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: start; }
    .hover-target { min-width: 180px; min-height: 64px; padding: 18px; border: 1px solid var(--border); border-radius: 8px; }
    @media (max-width: 640px) { body { padding: 12px; } main { grid-template-columns: minmax(0, 1fr); gap: 12px; } .fixture-panel { padding: 12px; } }
</style></head><body><div id="app"></div><script type="module">
    import { createApp, defineComponent, h, nextTick, reactive } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import HoverDemo from '/src/ui/docs/component-examples/hover.vue';
    import DefaultsDemo from '/src/ui/docs/component-examples/defaults-provider.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        modelValue: null,
        disabled: false,
        openDelay: '90',
        closeDelay: '70',
        updates: [],
        uncontrolledUpdates: [],
        cancelableUpdates: [],
        showCancelable: true
    });
    const ui = UI.createUI({ defaults: { UButton: { size: 36 } } });
    let extensionEnter;
    let extensionLeave;

    function hoverContracts() {
        return h('div', { class: 'protocol-row' }, [
            h(UI.UHover, {
                modelValue: state.modelValue,
                disabled: state.disabled,
                openDelay: state.openDelay,
                closeDelay: state.closeDelay,
                'onUpdate:modelValue': value => {
                    state.updates.push(value);
                    state.modelValue = value;
                }
            }, {
                default: scope => {
                    extensionEnter = scope.onEnter;
                    extensionLeave = scope.onLeave;
                    return h('div', {
                        ...scope.props,
                        id: 'controlled-hover',
                        class: 'hover-target',
                        tabindex: 0,
                        'data-hover': String(scope.isHovering)
                    }, String(scope.isHovering));
                }
            }),
            h(UI.UHover, {
                'onUpdate:modelValue': value => state.uncontrolledUpdates.push(value)
            }, {
                default: scope => h('div', {
                    ...scope.props,
                    id: 'uncontrolled-hover',
                    class: 'hover-target',
                    'data-hover': String(scope.isHovering)
                }, String(scope.isHovering))
            }),
            state.showCancelable ? h(UI.UHover, {
                openDelay: 110,
                'onUpdate:modelValue': value => state.cancelableUpdates.push(value)
            }, {
                default: scope => h('div', {
                    ...scope.props,
                    id: 'cancelable-hover',
                    class: 'hover-target'
                }, 'Unmount before the delayed entry')
            }) : null
        ]);
    }

    function defaultsContracts() {
        return h('div', { class: 'protocol-row' }, [
            h(UI.UDefaultsProvider, { defaults: { UButton: { size: 'large' } } }, {
                default: () => [
                    h(UI.UButton, { id: 'defaulted-button' }, () => 'Inherited large'),
                    h(UI.UButton, { id: 'explicit-button', size: 'x-large' }, () => 'Explicit x-large'),
                    h(UI.UDefaultsProvider, { defaults: { UButton: { size: undefined } } }, {
                        default: () => h(UI.UButton, { id: 'undefined-inherits-button' }, () => 'Undefined inherits')
                    })
                ]
            }),
            h(UI.UDefaultsProvider, { defaults: { named: { UButton: { size: 'x-large' } } } }, {
                default: () => h(UI.UDefaultsProvider, { root: 'named' }, {
                    default: () => h(UI.UButton, { id: 'named-root-button' }, () => 'Named root default')
                })
            })
        ]);
    }

    const app = createApp(defineComponent({
        render() {
            return h('main', [
                h('section', { id: 'real-hover-demo', class: 'fixture-panel' }, [h(HoverDemo)]),
                h('section', { id: 'real-defaults-demo', class: 'fixture-panel' }, [h(DefaultsDemo)]),
                h('section', { id: 'hover-contracts', class: 'fixture-panel' }, [hoverContracts()]),
                h('section', { id: 'defaults-contracts', class: 'fixture-panel' }, [defaultsContracts()])
            ]);
        }
    }));
    app.use(ui);
    app.mount('#app');

    window.hoverDefaultsProtocol = {
        registry: {
            publicHover: Boolean(UI.UHover),
            publicDefaultsProvider: Boolean(UI.UDefaultsProvider),
            registeredHover: Boolean(app.component('u-hover')),
            registeredDefaultsProvider: Boolean(app.component('u-defaults-provider'))
        },
        snapshot() {
            return {
                modelValue: state.modelValue,
                disabled: state.disabled,
                updates: [...state.updates],
                uncontrolledUpdates: [...state.uncontrolledUpdates],
                cancelableUpdates: [...state.cancelableUpdates]
            };
        },
        async flush() {
            await nextTick();
            await nextTick();
        },
        setTheme(name) { return ui.theme.change(name, false); },
        setDisabled(value) { state.disabled = value; },
        setDelays(openDelay, closeDelay) {
            state.openDelay = openDelay;
            state.closeDelay = closeDelay;
        },
        clearUpdates() { state.updates.splice(0); },
        callEnter() { extensionEnter?.(); },
        callLeave() { extensionLeave?.(); },
        unmountCancelable() { state.showCancelable = false; }
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
        name: 'hover-defaults-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__hover-defaults-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__hover-defaults-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/defaults.ts',
    'src/ui/UHover.vue',
    'src/ui/UDefaultsProvider.vue',
    'src/ui/docs/component-examples/hover.vue',
    'src/ui/docs/component-examples/defaults-provider.vue'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));
const errors = [];
const warnings = [];
const httpErrors = [];
const requestFailures = [];
const screenshots = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + real Hover/DefaultsProvider demos + Chromium browser',
    evidence,
    sourceSha256,
    backend: null,
    registry: {},
    hover: {},
    defaults: {},
    screenshots,
    errors,
    warnings,
    httpErrors,
    requestFailures
};

let browser;
let page;

async function waitFor(assertion) {
    let lastError;
    for (let attempt = 0; attempt < 40; attempt++) {
        try {
            await assertion();
            return;
        } catch (error) {
            lastError = error;
            await page.waitForTimeout(25);
        }
    }
    throw lastError;
}

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.hoverDefaultsProtocol.flush());
}

async function snapshot() {
    return page.evaluate(() => window.hoverDefaultsProtocol.snapshot());
}

try {
    await server.listen();
    const url = new URL('/__hover-defaults-protocols', server.resolvedUrls.local[0]).href;
    const sourceProbe = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(sourceProbe.status, 200, 'Vite serves the source fixture before browser navigation');

    try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
        report.backend = 'chrome';
    } catch (chromeError) {
        report.chromeLaunchFailure = chromeError instanceof Error ? chromeError.message : String(chromeError);
        browser = await chromium.launch({ channel: 'msedge', headless: true });
        report.backend = 'edge';
    }

    page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    page.on('pageerror', error => errors.push(error.stack ?? error.message));
    page.on('console', message => {
        const line = `${message.type()}: ${message.text()}`;
        if (message.type() === 'error') errors.push(line);
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) warnings.push(line);
    });
    page.on('response', response => {
        if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() });
    });
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.hoverDefaultsProtocol));
    await page.locator('#real-hover-demo [data-demo-component="UHover"]').waitFor();
    await page.locator('#real-defaults-demo [data-demo-component="UDefaultsProvider"]').waitFor();
    await settle();

    report.registry = await page.evaluate(() => window.hoverDefaultsProtocol.registry);
    assert.deepEqual(report.registry, {
        publicHover: true,
        publicDefaultsProvider: true,
        registeredHover: true,
        registeredDefaultsProvider: true
    }, 'public entry exports both components and createUI registers their kebab-case names');

    assert.equal(await page.locator('#controlled-hover').getAttribute('data-hover'), 'null', 'controlled nullable model starts at null');
    assert.equal(await page.locator('#uncontrolled-hover').getAttribute('data-hover'), 'null', 'omitted v-model uses the nullable null default');
    const inheritedSize = await page.locator('#defaulted-button').evaluate(element => element.style.getPropertyValue('--ui-button-height'));
    const explicitSize = await page.locator('#explicit-button').evaluate(element => element.style.getPropertyValue('--ui-button-height'));
    const undefinedInheritedSize = await page.locator('#undefined-inherits-button').evaluate(element => element.style.getPropertyValue('--ui-button-height'));
    const namedRootSize = await page.locator('#named-root-button').evaluate(element => element.style.getPropertyValue('--ui-button-height'));
    assert.equal(inheritedSize, '44px', 'UButton consumes a provider default from the public component');
    assert.equal(explicitSize, '52px', 'an explicit UButton prop overrides provider defaults');
    assert.equal(undefinedInheritedSize, '44px', 'undefined local props retain the inherited component default');
    assert.equal(namedRootSize, '52px', 'root string merges its parent named defaults map where UButton consumes it');
    const realDefaultsDemo = page.locator('#real-defaults-demo [data-demo-component="UDefaultsProvider"]');
    const realDefaultsButtons = realDefaultsDemo.locator('.ui-button');
    const realDefaultsSwitches = realDefaultsDemo.locator('input[type="checkbox"]');
    const innerDefaultsButton = realDefaultsButtons.nth(2);
    const defaultsDemoMetrics = () => innerDefaultsButton.evaluate(element => ({
        heightVariable: element.style.getPropertyValue('--ui-button-height').trim(),
        minHeight: getComputedStyle(element).minHeight
    }));
    assert.equal(await realDefaultsButtons.count(), 3, 'the real DefaultsProvider demo exposes three consumer buttons');
    assert.equal(await realDefaultsSwitches.count(), 3, 'the real DefaultsProvider demo exposes reset, root, and disabled controls');

    let realDemoMetrics = await defaultsDemoMetrics();
    assert.equal(realDemoMetrics.heightVariable, '46px', 'the innermost real demo button consumes its local size initially');

    await realDefaultsSwitches.nth(0).check({ force: true });
    await waitFor(async () => assert.equal((await defaultsDemoMetrics()).heightVariable, '30px'));
    realDemoMetrics = await defaultsDemoMetrics();
    assert.equal(realDemoMetrics.heightVariable, '30px', 'reset=true walks back to the outer 30px defaults layer');
    await realDefaultsSwitches.nth(0).uncheck({ force: true });
    await waitFor(async () => assert.equal((await defaultsDemoMetrics()).heightVariable, '46px'));

    await realDefaultsSwitches.nth(1).check({ force: true });
    await waitFor(async () => assert.equal((await defaultsDemoMetrics()).heightVariable, '36px'));
    realDemoMetrics = await defaultsDemoMetrics();
    assert.equal(realDemoMetrics.heightVariable, '36px', 'root=true reaches the app fixture numeric root size of 36px');
    assert.equal(realDemoMetrics.minHeight, '36px', 'the root size renders as a 36px button height');
    await realDefaultsSwitches.nth(1).uncheck({ force: true });
    await waitFor(async () => assert.equal((await defaultsDemoMetrics()).heightVariable, '46px'));

    await realDefaultsSwitches.nth(2).check({ force: true });
    await waitFor(async () => assert.equal((await defaultsDemoMetrics()).heightVariable, '38px'));
    realDemoMetrics = await defaultsDemoMetrics();
    assert.equal(realDemoMetrics.heightVariable, '38px', 'disabled=true bypasses the local layer and inherits the parent size');
    await realDefaultsSwitches.nth(2).uncheck({ force: true });
    await waitFor(async () => assert.equal((await defaultsDemoMetrics()).heightVariable, '46px'));

    report.defaults = {
        inheritedSize,
        explicitSize,
        undefinedInheritedSize,
        namedRootSize,
        realDemo: {
            initialInnerSize: '46px',
            resetTrueOuterSize: '30px',
            rootTrueFixtureSize: '36px',
            rootTrueRenderedHeight: '36px',
            disabledTrueParentSize: '38px',
            controlsRestoredBeforeScreenshots: true
        }
    };

    const targetBox = await page.locator('#controlled-hover').boundingBox();
    assert.ok(targetBox && targetBox.width > 0 && targetBox.height > 0, 'controlled hover target is visible');

    await page.locator('#controlled-hover').focus();
    await page.waitForTimeout(25);
    assert.equal((await snapshot()).modelValue, null, 'focus is delayed by the string openDelay');
    await waitFor(async () => assert.equal((await snapshot()).modelValue, true));
    await page.locator('#controlled-hover').evaluate(element => element.blur());
    await waitFor(async () => assert.equal((await snapshot()).modelValue, false));

    await page.evaluate(() => window.hoverDefaultsProtocol.setDelays('140', '40'));
    await page.evaluate(() => window.hoverDefaultsProtocol.clearUpdates());
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.waitForTimeout(25);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(170);
    let state = await snapshot();
    assert.equal(state.modelValue, false);
    assert.equal(state.updates.includes(true), false, 'a newer leave cancels a pending open response');

    await page.evaluate(() => window.hoverDefaultsProtocol.setDelays('45', '140'));
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await waitFor(async () => assert.equal((await snapshot()).modelValue, true));
    await page.evaluate(() => window.hoverDefaultsProtocol.clearUpdates());
    await page.mouse.move(0, 0);
    await page.waitForTimeout(25);
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.waitForTimeout(90);
    state = await snapshot();
    assert.equal(state.modelValue, true);
    assert.equal(state.updates.includes(false), false, 'a newer enter cancels a pending close response');
    await page.mouse.move(0, 0);
    await waitFor(async () => assert.equal((await snapshot()).modelValue, false));

    await page.evaluate(() => window.hoverDefaultsProtocol.setDisabled(true));
    await page.evaluate(() => window.hoverDefaultsProtocol.setDelays('25', '25'));
    await page.evaluate(() => window.hoverDefaultsProtocol.clearUpdates());
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.waitForTimeout(60);
    state = await snapshot();
    assert.equal(state.modelValue, false, 'disabled hover tracks entry without updating the controlled value');
    assert.deepEqual(state.updates, []);
    await page.evaluate(() => window.hoverDefaultsProtocol.setDisabled(false));
    await waitFor(async () => assert.equal((await snapshot()).modelValue, true));

    await page.evaluate(() => window.hoverDefaultsProtocol.setDisabled(true));
    await page.evaluate(() => window.hoverDefaultsProtocol.clearUpdates());
    await page.mouse.move(0, 0);
    await page.waitForTimeout(60);
    state = await snapshot();
    assert.equal(state.modelValue, true, 'disabled hover tracks leave without changing the controlled value');
    assert.deepEqual(state.updates, []);
    await page.evaluate(() => window.hoverDefaultsProtocol.setDisabled(false));
    await waitFor(async () => assert.equal((await snapshot()).modelValue, false));

    await page.evaluate(() => window.hoverDefaultsProtocol.callEnter());
    await waitFor(async () => assert.equal((await snapshot()).modelValue, true));
    await page.evaluate(() => window.hoverDefaultsProtocol.callLeave());
    await waitFor(async () => assert.equal((await snapshot()).modelValue, false));

    const cancelableBox = await page.locator('#cancelable-hover').boundingBox();
    assert.ok(cancelableBox && cancelableBox.width > 0);
    await page.mouse.move(cancelableBox.x + cancelableBox.width / 2, cancelableBox.y + cancelableBox.height / 2);
    await page.waitForTimeout(20);
    await page.evaluate(() => window.hoverDefaultsProtocol.unmountCancelable());
    await page.waitForTimeout(140);
    state = await snapshot();
    assert.deepEqual(state.cancelableUpdates, [], 'unmount clears a pending delayed model response');

    report.hover = {
        nullableDefault: 'null',
        focusEnterAndLeave: true,
        controlledModelUpdates: (await snapshot()).updates,
        openAndCloseDelayStringValues: true,
        newEnterAndLeaveCancelOlderTimers: true,
        disabledEntryAndLeaveTrackUntilReenabled: true,
        onEnterAndOnLeaveExtensions: true,
        unmountClearsPendingTimer: true
    };

    await page.mouse.move(0, 0);
    async function captureDemoSet(theme, width, height, zoom, suffix) {
        await page.setViewportSize({ width, height });
        await page.evaluate(value => { document.body.style.zoom = value; }, zoom);
        await page.evaluate(name => window.hoverDefaultsProtocol.setTheme(name), theme);
        await settle();

        for (const [name, selector] of [
            ['hover', '#real-hover-demo'],
            ['defaults', '#real-defaults-demo']
        ]) {
            const target = page.locator(selector);
            const bounds = await target.boundingBox();
            assert.ok(bounds && bounds.width > 0 && bounds.height > 0, `${name} real demo has nonempty geometry at ${suffix}`);
            const file = `hover-defaults-${name}-${suffix}.png`;
            await target.screenshot({ path: path.join(evidence, file), animations: 'disabled', caret: 'hide' });
            screenshots.push({ file, component: name, theme, viewport: { width, height }, zoom });
        }
    }

    await captureDemoSet('light', 1280, 1000, '100%', 'wide-light');
    await captureDemoSet('dark', 1280, 1000, '100%', 'wide-dark');
    await captureDemoSet('light', 390, 1000, '125%', 'narrow-light-125');
    await captureDemoSet('dark', 390, 1000, '125%', 'narrow-dark-125');

    assert.deepEqual(errors, [], 'hover/defaults source fixture has no page errors or console errors');
    assert.deepEqual(warnings, [], 'hover/defaults source fixture has no Vue warnings');
    assert.deepEqual(httpErrors, [], 'hover/defaults source fixture has no failed HTTP responses');
    assert.deepEqual(requestFailures, [], 'hover/defaults source fixture has no failed network requests');
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    if (browser) await browser.close();
    await server.close();
}
