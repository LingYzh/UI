import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const evidence = path.resolve('artifacts/component-audit-root/tooltip-protocols');
await mkdir(evidence, { recursive: true });
const sourceSha256 = createHash('sha256').update(await readFile(path.resolve('src/ui/UiTooltip.vue'))).digest('hex');
const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
    body { min-height: 1800px; }
    #app { max-width: 1100px; margin: 0 auto; padding: 24px; }
    main { display: grid; gap: 24px; }
    .tooltip-contracts { display: grid; gap: 20px; padding-top: 24px; }
    .tooltip-contracts > section { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
    #legacy-default-region { padding-top: 120px; }
    #position-anchor { position: absolute; left: 150px; top: 900px; width: 100px; height: 36px; pointer-events: none; }
</style></head><body><div id="attach-destination"></div><div id="app"></div><script type="module">
    import { createApp, h, isRef, mergeProps, reactive, ref } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import TooltipDemo from '/src/ui/docs/component-examples/tooltip.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        legacyPersistentMounted: true,
        legacyContentActive: false,
        standardUpdates: [], standardClicks: 0, standardKeys: [], standardAfterEnter: 0, standardAfterLeave: 0,
        dynamicDisabled: true, dynamicUpdates: [],
        delayUpdates: [], delayedUnmountMounted: true, delayedUnmountUpdates: [],
        disabledTimer: false, disabledTimerUpdates: [],
        closeContentUpdates: [], outsideEvents: 0, outsideTargets: [], outsideUpdates: [],
        persistentOutsideEvents: 0, persistentUpdates: [], backUpdates: [],
        controlledVisible: false, controlledUpdates: [],
        externalMounted: true, externalUpdates: [],
        positionLocation: 'bottom start', positionUpdates: [],
        coordinateUpdates: [], noneUpdates: [],
        blockAVisible: false, blockBVisible: false,
        attachVisible: false, containedVisible: false, lazyVisible: false, staticVisible: false
    });
    const refs = { persistent: ref(), lazy: ref(), position: ref() };
    const scopes = {};
    function standardButton(scope, id, label, onClick) {
        const ownProps = { id, ref: scope.activatorRef };
        if (onClick) ownProps.onClick = onClick;
        return h('button', mergeProps(scope.props, ownProps), label);
    }
    function legacyDefault() {
        return h(UI.UTooltip, { id: 'legacy-default-tip', text: 'legacy default text' }, {
            default: () => h('button', { id: 'legacy-default-trigger' }, 'legacy hover and focus trigger')
        });
    }
    function legacyPersistent() {
        return state.legacyPersistentMounted ? h(UI.UTooltip, { id: 'legacy-persistent-tip', text: 'legacy persistent text', persistent: true }, {
            default: () => h('button', { id: 'legacy-persistent-trigger' }, 'legacy persistent trigger')
        }) : null;
    }
    function legacyNamedContent() {
        return h(UI.UTooltip, { id: 'legacy-content-tip', text: 'legacy fallback text', openOnClick: true, openOnHover: false, openOnFocus: false }, {
            default: () => h('button', { id: 'legacy-content-trigger' }, 'legacy named-content trigger'),
            content: ({ isActive }) => {
                state.legacyContentActive = isActive;
                return h('span', { id: 'legacy-named-content' }, 'legacy named content');
            }
        });
    }
    function standardTooltip() {
        return h(UI.UTooltip, {
            id: 'standard-tip', standardProtocol: true, openOnHover: false, openOnFocus: false, openOnClick: true,
            scrollStrategy: 'none',
            'onUpdate:modelValue': value => state.standardUpdates.push(value),
            onKeydown: event => state.standardKeys.push(event.key),
            onAfterEnter: () => state.standardAfterEnter++, onAfterLeave: () => state.standardAfterLeave++
        }, {
            activator: scope => {
                scopes.standardActivator = scope;
                scope.targetRef(document.querySelector('#position-anchor'));
                return standardButton(scope, 'standard-trigger', 'standard click trigger', () => state.standardClicks++);
            },
            default: scope => {
                scopes.standardContent = scope;
                return h('div', { id: 'standard-content' }, 'standard content scope');
            }
        });
    }
    function dynamicDisabledTooltip() {
        return h(UI.UTooltip, {
            id: 'dynamic-disabled-tip', standardProtocol: true, disabled: state.dynamicDisabled,
            openOnHover: false, openOnFocus: false, openOnClick: true,
            'onUpdate:modelValue': value => state.dynamicUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'dynamic-disabled-trigger', 'dynamic disabled trigger'),
            default: () => h('span', { id: 'dynamic-disabled-content' }, 'dynamic disabled content')
        });
    }
    function delayedTooltip() {
        return h(UI.UTooltip, {
            id: 'delay-tip', standardProtocol: true, openDelay: 80, closeDelay: 90, openOnFocus: false,
            'onUpdate:modelValue': value => state.delayUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'delay-trigger', 'delayed hover trigger'),
            default: () => h('span', { id: 'delay-content' }, 'delayed content')
        });
    }
    function disabledTimerTooltip() {
        return h(UI.UTooltip, {
            id: 'disabled-timer-tip', standardProtocol: true, disabled: state.disabledTimer, openDelay: 70, openOnFocus: false,
            'onUpdate:modelValue': value => state.disabledTimerUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'disabled-timer-trigger', 'disabled timer trigger'),
            default: () => h('span', { id: 'disabled-timer-content' }, 'disabled timer content')
        });
    }
    function delayedUnmountTooltip() {
        return state.delayedUnmountMounted ? h(UI.UTooltip, {
            id: 'unmount-delay-tip', standardProtocol: true, openDelay: 100, openOnFocus: false,
            'onUpdate:modelValue': value => state.delayedUnmountUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'unmount-delay-trigger', 'unmount delayed trigger'),
            default: () => h('span', { id: 'unmount-delay-content' }, 'unmount delayed content')
        }) : null;
    }
    function interactiveTooltip() {
        return h(UI.UTooltip, {
            id: 'interactive-tip', standardProtocol: true, interactive: true, openOnFocus: false, closeDelay: 45
        }, {
            activator: scope => standardButton(scope, 'interactive-trigger', 'interactive hover trigger'),
            default: () => h('div', { id: 'interactive-content' }, [
                h('span', 'interactive content'), h('button', { id: 'interactive-content-button' }, 'interactive action')
            ])
        });
    }
    function closeOnContentTooltip() {
        return h(UI.UTooltip, {
            id: 'close-content-tip', standardProtocol: true, interactive: true, openOnHover: false,
            openOnFocus: false, openOnClick: true, closeOnContentClick: true,
            'onUpdate:modelValue': value => state.closeContentUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'close-content-trigger', 'close on content trigger'),
            default: () => h('button', { id: 'close-content-action' }, 'close on content action')
        });
    }
    function outsideTooltip() {
        return h(UI.UTooltip, {
            id: 'outside-tip', standardProtocol: true, openOnHover: false, openOnFocus: false, openOnClick: true,
            'onClick:outside': event => { state.outsideEvents++; state.outsideTargets.push(event.target instanceof Element ? event.target.id : ''); },
            'onUpdate:modelValue': value => state.outsideUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'outside-trigger', 'outside close trigger'),
            default: () => h('span', { id: 'outside-content' }, 'outside close content')
        });
    }
    function persistentStandardTooltip() {
        return h(UI.UTooltip, {
            ref: refs.persistent, id: 'persistent-standard-tip', standardProtocol: true, persistent: true,
            closeOnBack: true, openOnHover: false, openOnFocus: false, openOnClick: true,
            'onClick:outside': () => state.persistentOutsideEvents++,
            'onUpdate:modelValue': value => state.persistentUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'persistent-standard-trigger', 'persistent standard trigger'),
            default: () => h('span', { id: 'persistent-standard-content' }, 'persistent standard content')
        });
    }
    function backTooltip() {
        return h(UI.UTooltip, {
            id: 'back-tip', standardProtocol: true, closeOnBack: true, openOnHover: false,
            openOnFocus: false, openOnClick: true, 'onUpdate:modelValue': value => state.backUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'back-trigger', 'back close trigger'),
            default: () => h('span', { id: 'back-content' }, 'back close content')
        });
    }
    function controlledTooltip() {
        return h(UI.UTooltip, {
            id: 'controlled-tip', standardProtocol: true, modelValue: state.controlledVisible,
            openOnHover: false, openOnFocus: false, openOnClick: true,
            'onUpdate:modelValue': value => state.controlledUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'controlled-trigger', 'controlled trigger'),
            default: () => h('span', { id: 'controlled-content' }, 'controlled content')
        });
    }
    function externalTooltip() {
        return state.externalMounted ? h(UI.UTooltip, {
            id: 'external-tip', standardProtocol: true, activator: '#external-activator',
            activatorProps: { title: 'temporary activator title', 'data-bound': 'yes' },
            openOnHover: false, openOnFocus: false, openOnClick: true,
            'onUpdate:modelValue': value => state.externalUpdates.push(value)
        }, { default: () => h('span', { id: 'external-content' }, 'external activator content') }) : null;
    }
    function positionTooltip() {
        return h(UI.UTooltip, {
            ref: refs.position,
            id: 'position-tip', standardProtocol: true, target: '#position-anchor', location: state.positionLocation,
            offset: [10, 12], width: 120, height: 40, minWidth: 100, minHeight: 30, maxWidth: 180, maxHeight: 60,
            color: 'rebeccapurple', theme: 'dark', contentProps: { title: 'position content title', 'data-content-attr': 'preserved' },
            scrollStrategy: 'reposition', openOnHover: false, openOnFocus: false, openOnClick: true,
            'onUpdate:modelValue': value => state.positionUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'position-trigger', 'position trigger'),
            default: () => h('div', { id: 'position-content' }, 'position content')
        });
    }
    function coordinateTooltip() {
        return h(UI.UTooltip, {
            id: 'coordinate-tip', standardProtocol: true, target: [3, 10], location: 'top', offset: 8,
            width: 100, height: 40, openOnHover: false, openOnFocus: false, openOnClick: true,
            'onUpdate:modelValue': value => state.coordinateUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'coordinate-trigger', 'coordinate trigger'),
            default: () => h('span', { id: 'coordinate-content' }, 'coordinate content')
        });
    }
    function scrollNoneTooltip() {
        return h(UI.UTooltip, {
            id: 'none-tip', standardProtocol: true, scrollStrategy: 'none', openOnHover: false,
            openOnFocus: false, openOnClick: true, 'onUpdate:modelValue': value => state.noneUpdates.push(value)
        }, {
            activator: scope => standardButton(scope, 'none-trigger', 'no scroll strategy trigger'),
            default: () => h('span', { id: 'none-content' }, 'no scroll strategy content')
        });
    }
    function blockTooltip(id, visibleKey) {
        return h(UI.UTooltip, {
            id, standardProtocol: true, modelValue: state[visibleKey], scrollStrategy: 'block',
            openOnHover: false, openOnFocus: false,
            'onUpdate:modelValue': value => { state[visibleKey] = value; }
        }, {
            activator: scope => standardButton(scope, id + '-trigger', id + ' trigger'),
            default: () => h('span', { id: id + '-content' }, id + ' content')
        });
    }
    function attachedTooltip() {
        return h(UI.UTooltip, {
            id: 'attach-tip', standardProtocol: true, attach: '#attach-destination', modelValue: state.attachVisible,
            openOnHover: false, openOnFocus: false, 'onUpdate:modelValue': value => state.attachVisible = value
        }, {
            activator: scope => standardButton(scope, 'attach-trigger', 'attached trigger'),
            default: () => h('span', { id: 'attach-content' }, 'attached content')
        });
    }
    function containedTooltip() {
        return h(UI.UTooltip, {
            id: 'contained-tip', standardProtocol: true, contained: true, modelValue: state.containedVisible,
            openOnHover: false, openOnFocus: false, 'onUpdate:modelValue': value => state.containedVisible = value
        }, {
            activator: scope => standardButton(scope, 'contained-trigger', 'contained trigger'),
            default: () => h('span', { id: 'contained-content' }, 'contained content')
        });
    }
    function lazyTooltip() {
        return h(UI.UTooltip, {
            ref: refs.lazy, id: 'lazy-tip', standardProtocol: true, eager: false, openOnHover: false,
            openOnFocus: false, openOnClick: true, 'onUpdate:modelValue': value => state.lazyVisible = value
        }, {
            activator: scope => standardButton(scope, 'lazy-trigger', 'lazy trigger'),
            default: () => h('span', { id: 'lazy-content' }, 'lazy content')
        });
    }
    function staticTooltip() {
        return h(UI.UTooltip, {
            id: 'static-tip', standardProtocol: true, modelValue: state.staticVisible, locationStrategy: 'static',
            openOnHover: false, openOnFocus: false, 'onUpdate:modelValue': value => state.staticVisible = value
        }, {
            activator: scope => standardButton(scope, 'static-trigger', 'static strategy trigger'),
            default: () => h('span', { id: 'static-content' }, 'static strategy content')
        });
    }

    const app = createApp({ render() {
        return h('main', [
            h(TooltipDemo),
            h('section', { id: 'external-controls' }, [
                h('button', { id: 'external-activator', title: 'original activator title', 'aria-describedby': 'existing-description' }, 'external activator'),
                h('button', { id: 'outside-area' }, 'outside target'),
                h('button', { id: 'position-anchor' }, 'geometry anchor'),
            ]),
            h('section', { class: 'tooltip-contracts', id: 'tooltip-contracts' }, [
                h('section', { id: 'legacy-default-region', tabindex: -1 }, [legacyDefault(), h('output', { id: 'legacy-state' })]),
                h('section', [legacyPersistent(), legacyNamedContent()]),
                h('section', [standardTooltip(), dynamicDisabledTooltip(), delayedTooltip(), disabledTimerTooltip(), delayedUnmountTooltip()]),
                h('section', [interactiveTooltip(), closeOnContentTooltip(), outsideTooltip(), persistentStandardTooltip(), backTooltip()]),
                h('section', [controlledTooltip(), externalTooltip(), positionTooltip(), coordinateTooltip(), scrollNoneTooltip()]),
                h('section', [blockTooltip('block-a-tip', 'blockAVisible'), blockTooltip('block-b-tip', 'blockBVisible'), attachedTooltip(), containedTooltip(), lazyTooltip(), staticTooltip()])
            ])
        ]);
    } });
    app.use(UI.createUI());
    window.tooltipProtocol = {
        state,
        registry: {
            namedComponent: UI.UTooltip === app.component('UTooltip'),
            globalName: Boolean(app.component('u-tooltip'))
        },
        readStandardScope: () => ({
            activatorActive: scopes.standardActivator?.isActive,
            propsDescribedBy: scopes.standardActivator?.props?.['aria-describedby'],
            activatorRefType: typeof scopes.standardActivator?.activatorRef,
            targetRefType: typeof scopes.standardActivator?.targetRef,
            contentIsRef: isRef(scopes.standardContent?.isActive),
            contentActive: scopes.standardContent?.isActive?.value
        }),
        closeStandard: () => { if (scopes.standardContent?.isActive) scopes.standardContent.isActive.value = false; },
        closePersistent: () => refs.persistent.value?.close(),
        closeLazy: () => refs.lazy.value?.close(),
        openPosition: () => refs.position.value?.open(),
        closePosition: () => refs.position.value?.close()
    };
    app.mount('#app');
</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
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
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
        name: 'tooltip-protocol-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__tooltip-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await server.transformIndexHtml('/__tooltip-protocols', fixture));
            });
        }
    }]
});
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__tooltip-protocols` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text()); });
await page.emulateMedia({ reducedMotion: 'reduce' });

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function setState(name, value) {
    await page.evaluate(([key, next]) => { window.tooltipProtocol.state[key] = next; }, [name, value]);
    await settle();
}
async function waitTooltip(id, visible = true) {
    await page.waitForFunction(({ id, visible }) => {
        const tooltip = document.getElementById(id);
        if (!tooltip) return false;
        return (tooltip.getAttribute('aria-hidden') !== 'true') === visible;
    }, { id, visible }, { timeout: 5000 });
}
async function waitCounter(name, minimum) {
    await page.waitForFunction(([key, minimum]) => window.tooltipProtocol.state[key] >= minimum, [name, minimum]);
}
async function prepareCapture(theme, width, height) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width, height });
    await page.evaluate(value => {
        document.documentElement.dataset.theme = value;
        window.scrollTo(0, 0);
        for (const container of document.querySelectorAll('*')) { container.scrollTop = 0; container.scrollLeft = 0; }
    }, theme);
    await settle();
    await page.waitForTimeout(100);
}

const report = { method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron', evidence, sourceSha256, registry: {}, legacy: {}, standard: {}, timing: {}, interactive: {}, outside: {}, controlled: {}, external: {}, positioning: {}, scrolling: {}, placementModes: {}, demo: {}, limits: ['Scrim behavior was not claimed or tested.', 'Function-valued positioning strategies and custom transition objects were not claimed or tested.'], errors, screenshots: [] };
try {
    await page.locator('[data-demo-component="UTooltip"]').waitFor();
    report.registry = await page.evaluate(() => window.tooltipProtocol.registry);
    assert.deepEqual(report.registry, { namedComponent: true, globalName: true }, 'public UTooltip and createUI u-tooltip registration agree');

    const legacyTrigger = page.locator('#legacy-default-trigger');
    const legacyWrapper = legacyTrigger.locator('xpath=..');
    assert.equal(await legacyWrapper.getAttribute('tabindex'), '0', 'legacy default is a focusable trigger');
    await page.locator('#legacy-default-region').focus();
    await page.keyboard.press('Tab');
    assert.equal(await legacyWrapper.evaluate(element => element === document.activeElement), true, 'Tab reaches the legacy wrapper trigger');
    await waitTooltip('legacy-default-tip');
    await page.keyboard.press('Escape');
    await waitTooltip('legacy-default-tip', false);
    report.legacy.tabFocus = true;
    await legacyTrigger.hover();
    await waitTooltip('legacy-default-tip');
    const legacyGeometry = await page.evaluate(() => {
        const trigger = document.querySelector('#legacy-default-trigger').getBoundingClientRect();
        const tooltip = document.querySelector('#legacy-default-tip');
        const rect = tooltip.getBoundingClientRect();
        return { triggerTop: trigger.top, tooltipBottom: rect.bottom, text: tooltip.textContent.trim(), popover: tooltip.getAttribute('popover'), open: tooltip.matches(':popover-open') };
    });
    assert.ok(legacyGeometry.tooltipBottom <= legacyGeometry.triggerTop, 'default legacy location is top when there is room');
    assert.equal(legacyGeometry.text, 'legacy default text');
    assert.equal(legacyGeometry.popover, 'manual');
    assert.equal(legacyGeometry.open, true, 'legacy tooltip retains native popover');
    await page.evaluate(() => document.dispatchEvent(new Event('scroll')));
    await waitTooltip('legacy-default-tip', false);
    report.legacy.defaultTrigger = legacyGeometry;
    report.legacy.scrollClose = true;

    await page.locator('#legacy-persistent-trigger').focus();
    await waitTooltip('legacy-persistent-tip');
    await page.keyboard.press('Escape');
    await waitTooltip('legacy-persistent-tip', false);
    report.legacy.persistentEscapeCloses = true;

    await page.locator('#legacy-content-trigger').click();
    await waitTooltip('legacy-content-tip');
    assert.equal(await page.locator('#legacy-named-content').textContent(), 'legacy named content');
    assert.equal(await page.evaluate(() => window.tooltipProtocol.state.legacyContentActive), true, 'legacy content slot still receives boolean isActive');
    report.legacy.namedContent = true;
    await page.evaluate(() => document.querySelector('#legacy-content-trigger').blur());
    await page.evaluate(() => document.dispatchEvent(new Event('scroll')));
    await waitTooltip('legacy-content-tip', false);

    const initialScope = await page.evaluate(() => window.tooltipProtocol.readStandardScope());
    assert.equal(initialScope.activatorActive, false);
    assert.equal(initialScope.contentIsRef, true, 'standard default slot exposes writable isActive ref');
    assert.equal(initialScope.contentActive, false);
    assert.equal(initialScope.activatorRefType, 'function');
    assert.equal(initialScope.targetRefType, 'function');
    assert.match(initialScope.propsDescribedBy, /standard-tip/);
    await page.locator('#standard-trigger').click();
    await waitTooltip('standard-tip');
    await waitCounter('standardAfterEnter', 1);
    const standardTargetGeometry = await page.evaluate(() => {
        const anchor = document.querySelector('#position-anchor').getBoundingClientRect();
        const tooltip = document.querySelector('#standard-tip').getBoundingClientRect();
        return { anchorTop: anchor.top, tooltipTop: tooltip.top, tooltipHeight: tooltip.height };
    });
    assert.ok(Math.abs(standardTargetGeometry.tooltipTop - (standardTargetGeometry.anchorTop - standardTargetGeometry.tooltipHeight - 8)) <= 1, `targetRef slot scope positions from its element: ${JSON.stringify(standardTargetGeometry)}`);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.standardUpdates), [true], 'standard activator emits one update without wrapper duplicate click');
    assert.equal(await page.evaluate(() => window.tooltipProtocol.state.standardClicks), 1, 'merged activator click callback fires once');
    assert.equal((await page.evaluate(() => window.tooltipProtocol.readStandardScope())).contentActive, true);
    await page.locator('#standard-trigger').press('ArrowDown');
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.standardKeys), ['ArrowDown']);
    await page.evaluate(() => window.tooltipProtocol.closeStandard());
    await waitTooltip('standard-tip', false);
    await waitCounter('standardAfterLeave', 1);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.standardUpdates), [true, false]);
    report.standard = {
        scope: initialScope,
        targetRefGeometry: standardTargetGeometry,
        updates: await page.evaluate(() => window.tooltipProtocol.state.standardUpdates),
        userClicks: await page.evaluate(() => window.tooltipProtocol.state.standardClicks),
        keydown: await page.evaluate(() => window.tooltipProtocol.state.standardKeys),
        afterEnter: await page.evaluate(() => window.tooltipProtocol.state.standardAfterEnter),
        afterLeave: await page.evaluate(() => window.tooltipProtocol.state.standardAfterLeave)
    };

    await page.locator('#dynamic-disabled-trigger').click();
    await waitTooltip('dynamic-disabled-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.dynamicUpdates), [], 'disabled activator cannot open');
    await setState('dynamicDisabled', false);
    await page.locator('#dynamic-disabled-trigger').click();
    await waitTooltip('dynamic-disabled-tip');
    await setState('dynamicDisabled', true);
    await waitTooltip('dynamic-disabled-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.dynamicUpdates), [true, false]);

    await page.locator('#delay-trigger').hover();
    await page.waitForTimeout(25);
    await waitTooltip('delay-tip', false);
    await page.waitForTimeout(85);
    await waitTooltip('delay-tip');
    await page.mouse.move(2, 2);
    await page.waitForTimeout(25);
    await waitTooltip('delay-tip');
    await page.waitForTimeout(90);
    await waitTooltip('delay-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.delayUpdates), [true, false]);

    await page.locator('#disabled-timer-trigger').hover();
    await page.waitForTimeout(20);
    await setState('disabledTimer', true);
    await page.waitForTimeout(90);
    await waitTooltip('disabled-timer-tip', false);
    const disabledTimerUpdates = await page.evaluate(() => window.tooltipProtocol.state.disabledTimerUpdates);
    assert.equal(disabledTimerUpdates.includes(true), false, 'disabling a pending show timer never opens the tooltip');

    await page.locator('#unmount-delay-trigger').hover();
    await page.waitForTimeout(20);
    await setState('delayedUnmountMounted', false);
    await page.waitForTimeout(130);
    assert.equal(await page.locator('#unmount-delay-tip').count(), 0, 'unmounted eager tooltip removes its content');
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.delayedUnmountUpdates), [], 'unmount cancels a pending open timer');
    report.timing = { openDelay: true, closeDelay: true, disabledPendingOpen: { remainsClosed: true, updates: disabledTimerUpdates }, unmountPendingOpen: true };

    await page.locator('#interactive-trigger').hover();
    await waitTooltip('interactive-tip');
    await page.locator('#interactive-content-button').hover();
    await page.waitForTimeout(80);
    await waitTooltip('interactive-tip');
    await page.locator('#interactive-content-button').click();
    await waitTooltip('interactive-tip');
    await page.locator('#interactive-content-button').evaluate(element => element.blur());
    await page.mouse.move(2, 2);
    await page.waitForTimeout(70);
    await waitTooltip('interactive-tip', false);
    await page.locator('#close-content-trigger').click();
    await waitTooltip('close-content-tip');
    await page.locator('#close-content-action').click();
    await waitTooltip('close-content-tip', false);
    const closeContentUpdates = await page.evaluate(() => window.tooltipProtocol.state.closeContentUpdates);
    assert.deepEqual(closeContentUpdates, [true, false], 'one content click produces one close update');
    report.interactive = { contentHoverKeepsOpen: true, contentClickCanClose: true, mouseCanMoveIntoContent: true, closeContentUpdates };

    await page.locator('#outside-trigger').click();
    await waitTooltip('outside-tip');
    await page.locator('#outside-area').click();
    await waitTooltip('outside-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.outsideUpdates), [true, false]);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.outsideTargets), ['outside-area']);

    await page.locator('#persistent-standard-trigger').click();
    await waitTooltip('persistent-standard-tip');
    await page.locator('#outside-area').click();
    await waitTooltip('persistent-standard-tip');
    await page.locator('#persistent-standard-trigger').focus();
    await page.keyboard.press('Escape');
    await waitTooltip('persistent-standard-tip');
    assert.equal(await page.evaluate(() => window.tooltipProtocol.state.persistentOutsideEvents), 1);
    await page.evaluate(() => window.tooltipProtocol.closePersistent());
    await waitTooltip('persistent-standard-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.persistentUpdates), [true, false]);
    report.outside = { outsidePayloadTarget: 'outside-area', nonPersistentCloses: true, persistentIgnoresOutsideAndEscape: true, persistentExposedClose: true };

    await page.locator('#back-trigger').click();
    await waitTooltip('back-tip');
    await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
    await waitTooltip('back-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.backUpdates), [true, false]);
    report.outside.closeOnBack = true;

    await page.locator('#controlled-trigger').click();
    await waitTooltip('controlled-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.controlledUpdates), [true]);
    await setState('controlledVisible', true);
    await waitTooltip('controlled-tip');
    await page.locator('#controlled-trigger').click();
    await waitTooltip('controlled-tip');
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.controlledUpdates), [true, false]);
    await setState('controlledVisible', false);
    await waitTooltip('controlled-tip', false);
    report.controlled = { emitsOpenAndCloseWithoutMutatingParentModel: true, parentModelUpdatesControlVisibility: true };

    const externalBefore = await page.evaluate(() => {
        const element = document.querySelector('#external-activator');
        return { title: element.getAttribute('title'), describedBy: element.getAttribute('aria-describedby'), bound: element.getAttribute('data-bound') };
    });
    assert.deepEqual(externalBefore, { title: 'temporary activator title', describedBy: 'external-tip', bound: 'yes' });
    await page.locator('#external-activator').click();
    await waitTooltip('external-tip');
    assert.equal(await page.locator('#external-activator').getAttribute('aria-describedby'), 'external-tip');
    await page.locator('#outside-area').click();
    await waitTooltip('external-tip', false);
    await setState('externalMounted', false);
    await page.waitForFunction(() => document.querySelector('#external-activator').getAttribute('title') === 'original activator title');
    const externalAfter = await page.evaluate(() => {
        const element = document.querySelector('#external-activator');
        return { title: element.getAttribute('title'), describedBy: element.getAttribute('aria-describedby'), bound: element.getAttribute('data-bound') };
    });
    assert.deepEqual(externalAfter, { title: 'original activator title', describedBy: 'existing-description', bound: null });
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.externalUpdates), [true, false]);
    report.external = { activatorAttrsApplied: externalBefore, originalAttrsRestored: externalAfter, clickOpens: true };

    await page.locator('#position-trigger').click();
    await waitTooltip('position-tip');
    assert.equal(await page.locator('#position-trigger').evaluate(element => document.activeElement === element), true, 'pointer click focuses the activator before its blur');
    await page.locator('#position-trigger').evaluate(element => element.blur());
    await waitTooltip('position-tip');
    await page.mouse.move(2, 2);
    await page.waitForTimeout(30);
    const clickModeSurvivesPointerLeave = await page.locator('#position-tip').getAttribute('aria-hidden') === 'false';
    assert.equal(clickModeSurvivesPointerLeave, true, 'click-open mode survives pointer blur and pointer leave when hover opening is disabled');
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.positionUpdates), [true], 'pointer blur and leave do not emit a close update');
    await page.locator('#position-trigger').click();
    await waitTooltip('position-tip', false);
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.positionUpdates), [true, false], 'a second click closes the click-open tooltip once');
    await page.evaluate(() => window.tooltipProtocol.openPosition());
    await waitTooltip('position-tip');
    const bottomPosition = await page.evaluate(() => {
        const anchor = document.querySelector('#position-anchor').getBoundingClientRect();
        const tooltip = document.querySelector('#position-tip');
        const bounds = tooltip.getBoundingClientRect();
        return {
            anchor: { left: anchor.left, top: anchor.top, bottom: anchor.bottom },
            tooltip: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
            style: { width: tooltip.style.width, height: tooltip.style.height, minWidth: tooltip.style.minWidth, minHeight: tooltip.style.minHeight, maxWidth: tooltip.style.maxWidth, maxHeight: tooltip.style.maxHeight, backgroundColor: tooltip.style.backgroundColor, colorScheme: tooltip.style.colorScheme },
            theme: tooltip.dataset.theme,
            title: tooltip.getAttribute('title'),
            contentAttribute: tooltip.getAttribute('data-content-attr'),
            triggerDescribedBy: document.querySelector('#position-trigger').getAttribute('aria-describedby'),
            role: tooltip.getAttribute('role'),
            ariaHidden: tooltip.getAttribute('aria-hidden')
        };
    });
    assert.ok(Math.abs(bottomPosition.tooltip.top - (bottomPosition.anchor.bottom + 10)) <= 1, `bottom offset applied: ${JSON.stringify(bottomPosition)}`);
    assert.ok(Math.abs(bottomPosition.tooltip.left - (bottomPosition.anchor.left + 12)) <= 1, `start alignment and cross offset applied: ${JSON.stringify(bottomPosition)}`);
    assert.deepEqual(bottomPosition.style, { width: '120px', height: '40px', minWidth: '100px', minHeight: '30px', maxWidth: '180px', maxHeight: '60px', backgroundColor: 'var(--ui-theme-rebeccapurple, rebeccapurple)', colorScheme: 'dark' });
    assert.equal(bottomPosition.theme, 'dark');
    assert.equal(bottomPosition.title, 'position content title');
    assert.equal(bottomPosition.contentAttribute, 'preserved');
    assert.equal(bottomPosition.triggerDescribedBy, 'position-tip');
    assert.deepEqual({ role: bottomPosition.role, ariaHidden: bottomPosition.ariaHidden }, { role: 'tooltip', ariaHidden: 'false' });

    await setState('positionLocation', 'top start');
    const topPosition = await page.evaluate(() => {
        const anchor = document.querySelector('#position-anchor').getBoundingClientRect();
        const tooltip = document.querySelector('#position-tip').getBoundingClientRect();
        return { anchor: { left: anchor.left, top: anchor.top }, tooltip: { left: tooltip.left, top: tooltip.top, height: tooltip.height } };
    });
    assert.ok(Math.abs(topPosition.tooltip.top - (topPosition.anchor.top - topPosition.tooltip.height - 10)) <= 1, `reactive top location updates: ${JSON.stringify(topPosition)}`);
    assert.ok(Math.abs(topPosition.tooltip.left - (topPosition.anchor.left + 12)) <= 1, `reactive start alignment updates: ${JSON.stringify(topPosition)}`);
    const beforeScroll = await page.evaluate(() => ({ top: document.querySelector('#position-tip').getBoundingClientRect().top, anchor: document.querySelector('#position-anchor').getBoundingClientRect().top, styleTop: document.querySelector('#position-tip').style.top, scrollY: window.scrollY }));
    await page.evaluate(() => window.scrollTo(0, 120));
    await page.waitForFunction(previous => document.querySelector('#position-tip').getBoundingClientRect().top < previous.top - 80, beforeScroll);
    const afterScroll = await page.evaluate(() => {
        const tooltip = document.querySelector('#position-tip');
        return { top: tooltip.getBoundingClientRect().top, anchor: document.querySelector('#position-anchor').getBoundingClientRect().top, styleTop: tooltip.style.top, scrollY: window.scrollY, ariaHidden: tooltip.getAttribute('aria-hidden'), popoverOpen: tooltip.matches(':popover-open') };
    });
    report.positioning = { clickModeSurvivesPointerLeave, bottomStartOffsetsAndElementTarget: bottomPosition, reactiveLocation: topPosition, scrollReposition: { before: beforeScroll, after: afterScroll } };
    assert.ok(Math.abs((beforeScroll.anchor - afterScroll.anchor) - (beforeScroll.top - afterScroll.top)) <= 1, `reposition follows the scrolled target: ${JSON.stringify({ beforeScroll, afterScroll })}`);
    await page.evaluate(() => window.tooltipProtocol.closePosition());
    await waitTooltip('position-tip', false);
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.locator('#coordinate-trigger').click();
    await waitTooltip('coordinate-tip');
    const coordinatePosition = await page.evaluate(() => {
        const tooltip = document.querySelector('#coordinate-tip').getBoundingClientRect();
        return { left: tooltip.left, top: tooltip.top, right: tooltip.right, bottom: tooltip.bottom, width: window.innerWidth, height: window.innerHeight };
    });
    assert.ok(coordinatePosition.left >= 8 && coordinatePosition.top >= 8, `coordinate target clamps to viewport inset: ${JSON.stringify(coordinatePosition)}`);
    assert.ok(coordinatePosition.right <= coordinatePosition.width - 8 && coordinatePosition.bottom <= coordinatePosition.height - 8, `coordinate target remains within viewport: ${JSON.stringify(coordinatePosition)}`);
    assert.ok(coordinatePosition.top > 10, `top placement flips below a near-edge coordinate: ${JSON.stringify(coordinatePosition)}`);
    await page.locator('#coordinate-trigger').click();
    await waitTooltip('coordinate-tip', false);
    report.positioning = { clickModeSurvivesPointerLeave, bottomStartOffsetsAndElementTarget: bottomPosition, reactiveLocation: topPosition, scrollReposition: { before: beforeScroll, after: afterScroll }, coordinateFlipAndClamp: coordinatePosition };

    await page.locator('#none-trigger').click();
    await waitTooltip('none-tip');
    await page.evaluate(() => document.dispatchEvent(new Event('scroll')));
    await waitTooltip('none-tip');
    assert.deepEqual(await page.evaluate(() => window.tooltipProtocol.state.noneUpdates), [true]);
    await page.locator('#none-trigger').click();
    await waitTooltip('none-tip', false);

    const originalOverflow = await page.evaluate(() => document.body.style.overflow);
    await setState('blockAVisible', true);
    await waitTooltip('block-a-tip');
    await setState('blockBVisible', true);
    await waitTooltip('block-b-tip');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await setState('blockAVisible', false);
    await waitTooltip('block-a-tip', false);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'one tooltip cannot release a second tooltip scroll lock');
    await setState('blockBVisible', false);
    await waitTooltip('block-b-tip', false);
    assert.equal(await page.evaluate(() => document.body.style.overflow), originalOverflow, 'closing the final blocker restores body overflow');
    report.scrolling = { closeOnScroll: report.legacy.scrollClose, reposition: true, noneRemainsOpen: true, blockLockReferenceCounted: true, originalOverflow };

    await setState('attachVisible', true);
    await waitTooltip('attach-tip');
    assert.equal(await page.locator('#attach-tip').evaluate(element => element.parentElement.id), 'attach-destination');
    assert.equal(await page.locator('#attach-tip').getAttribute('popover'), 'manual');
    await setState('attachVisible', false);
    await waitTooltip('attach-tip', false);

    await setState('containedVisible', true);
    await waitTooltip('contained-tip');
    const containedPlacement = await page.locator('#contained-tip').evaluate(element => ({ popover: element.getAttribute('popover'), contained: element.classList.contains('is-contained'), wrapper: Boolean(element.closest('.ui-tooltip-trigger')), position: getComputedStyle(element).position }));
    assert.deepEqual(containedPlacement, { popover: null, contained: true, wrapper: true, position: 'absolute' });
    await setState('containedVisible', false);
    await waitTooltip('contained-tip', false);

    assert.equal(await page.locator('#lazy-tip').count(), 0, 'lazy tooltip does not render content before opening');
    await page.locator('#lazy-trigger').click();
    await waitTooltip('lazy-tip');
    await page.evaluate(() => window.tooltipProtocol.closeLazy());
    await page.waitForFunction(() => !document.getElementById('lazy-tip'));

    await setState('staticVisible', true);
    await waitTooltip('static-tip');
    const staticPlacement = await page.locator('#static-tip').evaluate(element => ({ left: element.style.left, top: element.style.top, strategy: element.getAttribute('popover') }));
    assert.deepEqual(staticPlacement, { left: '', top: '', strategy: 'manual' });
    await setState('staticVisible', false);
    await waitTooltip('static-tip', false);
    report.placementModes = { attach: '#attach-destination', contained: containedPlacement, eagerFalse: true, staticLocationStrategy: staticPlacement };

    assert.deepEqual(errors, [], 'tooltip protocol fixture has no page errors, console errors, or Vue warnings');
    const screenshotCases = [
        ['wide-light', 'light', 1280, 1500],
        ['wide-dark', 'dark', 1280, 1500],
        ['narrow-light', 'light', 390, 1500]
    ];
    for (const [name, theme, width, height] of screenshotCases) {
        await prepareCapture(theme, width, height);
        await page.locator('[data-demo-component="UTooltip"]').screenshot({ path: path.join(evidence, `demo-${name}.png`), animations: 'disabled', caret: 'hide' });
        report.screenshots.push({ file: `demo-${name}.png`, component: 'UTooltip', capture: 'locator', theme, width, height, zoom: 1 });
    }
    report.demo = { source: 'src/ui/docs/component-examples/tooltip.vue', screenshots: report.screenshots.length };
    assert.deepEqual(errors, [], 'theme/size capture introduced no page errors, console errors, or Vue warnings');
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    await app.close();
    await server.close();
}
