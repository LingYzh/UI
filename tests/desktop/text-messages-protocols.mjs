import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/text-messages-protocols');
await mkdir(evidence, { recursive: true });
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
    html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; }
    body { min-height: 100vh !important; margin: 0; padding: 24px; }
    #app { width: min(1200px, 100%); margin: 0 auto; overflow: visible !important; }
    main { display: grid; gap: 24px; min-width: 0; overflow: visible; }
    .fixture-panel { display: grid; gap: 16px; min-width: 0; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    #real-demos { display: grid; gap: 24px; min-width: 0; overflow: visible; }
    #messages-layout { max-width: 100%; min-width: 0; }
    #messages-layout .ui-messages { min-width: 0; }
    #label-native-input, #provider-input, #provider-explicit-input { width: min(100%, 360px); min-height: 36px; padding: 7px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; }
    @media (max-width: 640px) { body { padding: 12px; } .fixture-panel { padding: 12px; } }
</style></head><body><div id="app"></div><script type="module">
    import { createApp, defineComponent, h, nextTick, reactive } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import MessagesDemo from '/src/ui/docs/component-examples/messages.vue';
    import LabelDemo from '/src/ui/docs/component-examples/label.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const frozenMessages = Object.freeze(['readonly first', 'readonly second']);
    const state = reactive({
        dynamicMessages: ['dynamic first', 'dynamic second'],
        falseTransitionActive: true,
        objectTransitionActive: true,
        transitionEvents: []
    });
    const ui = UI.createUI();
    const app = createApp({ render() {
        return h('main', [
            h('section', { id: 'real-demos', class: 'fixture-panel' }, [h(MessagesDemo), h(LabelDemo)]),
            h('section', { id: 'messages-contracts', class: 'fixture-panel' }, [
                h(UI.UMessages, { id: 'messages-default', messages: ['default first', 'default second'] }),
                h(UI.UMessages, { id: 'messages-frozen', messages: frozenMessages, error: true, color: 'primary' }, {
                    message: ({ message }) => h('strong', { class: 'message-scope', 'data-message': message }, message)
                }),
                h(UI.UMessages, { id: 'messages-css-color', messages: 'CSS color message', color: 'rgb(12, 34, 56)' }),
                h(UI.UMessages, { id: 'messages-no-color', messages: 'No explicit color' }),
                h(UI.UMessages, { id: 'messages-dynamic', messages: state.dynamicMessages }),
                h(UI.UMessages, { id: 'messages-empty', messages: '' }),
                h(UI.UMessages, { id: 'messages-default-overridden', messages: ['fallback one', 'fallback two'] }, {
                    default: () => h('strong', { id: 'legacy-default-slot' }, 'legacy default content')
                }),
                h(UI.UMessages, { id: 'messages-layout', messages: ['first layout line', 'second layout line'] }),
                h(UI.UMessages, { id: 'messages-transition-false', active: state.falseTransitionActive, messages: 'false transition', transition: false }),
                h(UI.UMessages, {
                    id: 'messages-transition-hooks',
                    active: state.objectTransitionActive,
                    messages: 'object transition',
                    transition: {
                        css: false,
                        onEnter: (_element, done) => { state.transitionEvents.push('enter'); done(); },
                        onLeave: (_element, done) => { state.transitionEvents.push('leave'); done(); }
                    }
                })
            ]),
            h('section', { id: 'label-contracts', class: 'fixture-panel' }, [
                h(UI.ULabel, { id: 'label-probe', for: 'label-native-input', text: 'Name ', required: true, 'data-kept': 'native attribute' }, {
                    default: () => h('span', { id: 'label-probe-slot' }, 'middle slot')
                }),
                h('input', { id: 'label-native-input', 'aria-label': 'label focus target' }),
                h(UI.ULabel, { id: 'label-disabled', for: 'disabled-target', text: 'Disabled label', disabled: true, required: true, 'data-extra': 'kept' }),
                h('input', { id: 'disabled-target', 'aria-label': 'disabled label associated target' }),
                h(UI.UDefaultsProvider, { defaults: {
                    UMessages: { active: false, error: true, color: 'primary' },
                    ULabel: { required: true, disabled: true }
                } }, {
                    default: () => h('div', { id: 'provider-inherited' }, [
                        h(UI.UMessages, { id: 'provider-inherited-message', messages: 'inherited inactive message' }),
                        h(UI.ULabel, { id: 'provider-inherited-label', for: 'provider-input', text: 'Inherited label' }, {
                            default: () => h('span', { id: 'provider-label-slot' }, 'provider slot')
                        }),
                        h('input', { id: 'provider-input', 'aria-label': 'provider label target' })
                    ])
                }),
                h(UI.UDefaultsProvider, { defaults: {
                    UMessages: { active: true, error: true, color: 'accent' },
                    ULabel: { required: true, disabled: true }
                } }, {
                    default: () => h('div', { id: 'provider-explicit-false' }, [
                        h(UI.UMessages, { id: 'provider-explicit-false-message', active: false, error: false, messages: 'explicit false message' }),
                        h(UI.ULabel, { id: 'provider-explicit-false-label', for: 'provider-explicit-input', text: 'Explicit false label', required: false, disabled: false }),
                        h('input', { id: 'provider-explicit-input', 'aria-label': 'explicit false label target' })
                    ])
                })
            ])
        ]);
    } });
    app.use(ui);
    app.mount('#app');
    window.textMessagesProtocol = {
        state,
        readonlyMessages: frozenMessages,
        registry: {
            publicExports: ['UMessages', 'ULabel', 'UDefaultsProvider'].every(name => Boolean(UI[name])),
            globalNames: ['u-messages', 'u-label', 'u-defaults-provider'].map(name => [name, Boolean(app.component(name))])
        },
        async flush() { await nextTick(); await nextTick(); },
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
        name: 'text-messages-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__text-messages-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__text-messages-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/UMessages.vue',
    'src/ui/ULabel.vue',
    'src/ui/UiMaybeTransition.vue',
    'src/ui/defaults.ts',
    'src/ui/UDefaultsProvider.vue',
    'src/ui/plugin.ts',
    'src/ui/component-registry.ts',
    'src/ui/index.ts',
    'src/ui/layout-components.css',
    'src/ui/docs/component-examples/messages.vue',
    'src/ui/docs/component-examples/label.vue'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));
await server.listen();

const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__text-messages-protocols`
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
let app;
let page;
const errors = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron',
    evidence,
    sourceSha256,
    registry: {},
    messages: {},
    labels: {},
    defaults: {},
    realDemos: {},
    screenshots: [],
    errors
};

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function flush() {
    await page.evaluate(() => window.textMessagesProtocol.flush());
    await settle();
}

async function updateState(values) {
    await page.evaluate(next => Object.assign(window.textMessagesProtocol.state, next), values);
    await flush();
}

async function waitFor(expression, argument) {
    await page.waitForFunction(expression, argument, { timeout: 5000 });
}

async function prepareCapture(theme, width, height, file) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width, height });
    await page.evaluate(async name => {
        await window.textMessagesProtocol.setTheme(name);
        window.scrollTo(0, 0);
        for (const element of document.querySelectorAll('*')) {
            element.scrollTop = 0;
            element.scrollLeft = 0;
        }
    }, theme);
    await settle();
    const target = page.locator('#real-demos');
    await target.waitFor({ state: 'visible' });
    const box = await target.boundingBox();
    assert.ok(box && box.width > 0 && box.height > 0, 'real demo screenshot target has nonempty geometry');
    await target.screenshot({ path: path.join(evidence, file), animations: 'disabled', caret: 'hide' });
    report.screenshots.push({ file, theme, viewport: { width, height }, capture: 'real demo locator', target: '#real-demos', zoom: 1 });
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
    await page.waitForFunction(() => Boolean(window.textMessagesProtocol));
    await page.locator('#messages-default').waitFor();

    const registry = await page.evaluate(() => window.textMessagesProtocol.registry);
    assert.equal(registry.publicExports, true, 'public index exposes UMessages, ULabel, and UDefaultsProvider');
    assert.deepEqual(registry.globalNames, [
        ['u-messages', true],
        ['u-label', true],
        ['u-defaults-provider', true]
    ], 'createUI registers canonical u-* component names');
    report.registry = registry;

    const defaultMessages = page.locator('#messages-default');
    assert.equal(await defaultMessages.getAttribute('role'), 'status', 'UMessages defaults to status role');
    assert.equal(await defaultMessages.getAttribute('id'), 'messages-default');
    assert.equal(await defaultMessages.locator('.ui-messages-content > span').count(), 2, 'UMessages defaults active and renders both array messages');
    assert.deepEqual(await defaultMessages.locator('.ui-messages-content > span').allTextContents(), ['default first', 'default second']);
    assert.equal(await defaultMessages.evaluate(element => element.classList.contains('is-error')), false);
    assert.equal(await defaultMessages.evaluate(element => element.style.color), '', 'UMessages leaves color unset unless explicitly supplied');

    const frozenMessages = page.locator('#messages-frozen');
    assert.equal(await frozenMessages.getAttribute('role'), 'alert');
    assert.equal(await frozenMessages.evaluate(element => element.classList.contains('is-error')), true);
    assert.equal(await frozenMessages.locator('.message-scope').count(), 2, 'message slot renders once for each readonly array item');
    assert.deepEqual(await frozenMessages.locator('.message-scope').evaluateAll(elements => elements.map(element => ({ value: element.dataset.message, text: element.textContent }))), [
        { value: 'readonly first', text: 'readonly first' },
        { value: 'readonly second', text: 'readonly second' }
    ], 'message slot receives each exact message string');
    assert.match(await frozenMessages.evaluate(element => element.style.color), /^var\(--ui-theme-primary/);
    assert.deepEqual(await page.evaluate(() => ({ frozen: Object.isFrozen(window.textMessagesProtocol.readonlyMessages), values: [...window.textMessagesProtocol.readonlyMessages] })), {
        frozen: true,
        values: ['readonly first', 'readonly second']
    }, 'readonly values are provided by a frozen array in the fixture');

    const cssColor = page.locator('#messages-css-color');
    assert.equal(await cssColor.evaluate(element => element.style.color), 'rgb(12, 34, 56)', 'arbitrary CSS color is preserved when explicitly set');
    assert.equal(await page.locator('#messages-no-color').evaluate(element => element.style.color), '', 'unset color does not synthesize a CSS color');
    assert.equal(await page.locator('#messages-empty .ui-messages-content').count(), 1);
    assert.equal(await page.locator('#messages-empty .ui-messages-content > span').count(), 0, 'empty message text renders no list items');

    const dynamic = page.locator('#messages-dynamic');
    assert.deepEqual(await dynamic.locator('.ui-messages-content > span').allTextContents(), ['dynamic first', 'dynamic second']);
    await updateState({ dynamicMessages: 'updated string message' });
    assert.deepEqual(await dynamic.locator('.ui-messages-content > span').allTextContents(), ['updated string message'], 'messages accepts and updates from a string');
    await updateState({ dynamicMessages: '' });
    assert.equal(await dynamic.locator('.ui-messages-content > span').count(), 0, 'empty string updates remove list items');

    const defaultOverridden = page.locator('#messages-default-overridden');
    assert.equal(await defaultOverridden.locator('#legacy-default-slot').textContent(), 'legacy default content');
    assert.doesNotMatch(await defaultOverridden.textContent(), /fallback one|fallback two/, 'legacy default slot overrides the generated list');
    assert.equal(await defaultOverridden.locator('.ui-messages-content > span').count(), 0);

    const messagesLayout = await page.locator('#messages-layout').evaluate(element => {
        const content = element.querySelector('.ui-messages-content');
        const items = [...content.children].map(child => child.getBoundingClientRect());
        return {
            rowGap: getComputedStyle(content).rowGap,
            measuredGap: items.length > 1 ? items[1].top - items[0].bottom : null,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth
        };
    });
    assert.equal(messagesLayout.rowGap, '2px', 'messages preserve the normal two-pixel vertical gap');
    assert.ok(Math.abs(messagesLayout.measuredGap - 2) < 0.1, 'two rendered message rows have the configured vertical spacing');
    assert.ok(messagesLayout.scrollWidth <= messagesLayout.clientWidth + 1, 'messages list has no horizontal overflow at desktop width');

    await updateState({ falseTransitionActive: false });
    assert.equal(await page.locator('#messages-transition-false .ui-messages-content').count(), 0, 'transition=false removes inactive content');
    await updateState({ objectTransitionActive: false });
    await waitFor(() => window.textMessagesProtocol.state.transitionEvents.includes('leave'));
    await updateState({ objectTransitionActive: true });
    await waitFor(() => window.textMessagesProtocol.state.transitionEvents.includes('enter'));
    report.messages = {
        defaultActive: true,
        defaultRole: await defaultMessages.getAttribute('role'),
        readonlyArray: await frozenMessages.locator('.message-scope').allTextContents(),
        messageUpdates: ['dynamic first', 'dynamic second', 'updated string message', ''],
        messageSlotScopes: await frozenMessages.locator('.message-scope').evaluateAll(elements => elements.map(element => element.dataset.message)),
        defaultSlotOverridesList: true,
        emptyTextHasNoItems: true,
        errorRoleAndClass: true,
        explicitColors: {
            token: await frozenMessages.evaluate(element => element.style.color),
            css: await cssColor.evaluate(element => element.style.color),
            unset: await defaultMessages.evaluate(element => element.style.color)
        },
        transitions: {
            falseRemovesContent: true,
            objectHooks: await page.evaluate(() => window.textMessagesProtocol.state.transitionEvents)
        },
        layout: messagesLayout
    };

    const labelProbe = page.locator('#label-probe');
    const labelValues = await labelProbe.evaluate(element => {
        const children = [...element.childNodes];
        return {
            tagName: element.tagName.toLowerCase(),
            htmlFor: element.htmlFor,
            id: element.id,
            nativeAttribute: element.getAttribute('data-kept'),
            textPosition: children.findIndex(node => node.nodeType === Node.TEXT_NODE && node.textContent === 'Name '),
            slotPosition: children.findIndex(node => node.nodeType === Node.ELEMENT_NODE && node.id === 'label-probe-slot'),
            requiredPosition: children.findIndex(node => node.nodeType === Node.ELEMENT_NODE && node.classList.contains('ui-label-required')),
            required: element.querySelector('.ui-label-required')?.textContent,
            requiredAriaHidden: element.querySelector('.ui-label-required')?.getAttribute('aria-hidden'),
            disabledClass: element.classList.contains('is-disabled')
        };
    });
    assert.equal(labelValues.tagName, 'label');
    assert.equal(labelValues.htmlFor, 'label-native-input');
    assert.equal(labelValues.nativeAttribute, 'native attribute');
    assert.ok(labelValues.textPosition >= 0 && labelValues.textPosition < labelValues.slotPosition && labelValues.slotPosition < labelValues.requiredPosition, 'ULabel renders text, default slot, then required marker');
    assert.equal(labelValues.required, ' *');
    assert.equal(labelValues.requiredAriaHidden, 'true');
    assert.equal(labelValues.disabledClass, false);
    await labelProbe.click();
    await waitFor(() => document.activeElement?.id === 'label-native-input');

    const disabledLabel = page.locator('#label-disabled');
    assert.equal(await disabledLabel.getAttribute('for'), 'disabled-target');
    assert.equal(await disabledLabel.getAttribute('data-extra'), 'kept');
    assert.equal(await disabledLabel.evaluate(element => element.classList.contains('is-disabled')), true, 'disabled ULabel adds its disabled class');
    assert.equal(await disabledLabel.locator('.ui-label-required').count(), 1);

    const inheritedMessage = page.locator('#provider-inherited-message');
    assert.equal(await inheritedMessage.getAttribute('role'), 'alert', 'defaults provider supplies omitted error=true');
    assert.equal(await inheritedMessage.evaluate(element => element.classList.contains('is-error')), true);
    assert.equal(await inheritedMessage.locator('.ui-messages-content').count(), 0, 'defaults provider supplies omitted active=false');
    assert.match(await inheritedMessage.evaluate(element => element.style.color), /^var\(--ui-theme-primary/);
    const inheritedLabel = page.locator('#provider-inherited-label');
    assert.equal(await inheritedLabel.evaluate(element => element.classList.contains('is-disabled')), true);
    assert.equal(await inheritedLabel.locator('.ui-label-required').count(), 1);

    const explicitMessage = page.locator('#provider-explicit-false-message');
    assert.equal(await explicitMessage.getAttribute('role'), 'status', 'explicit error=false wins over provider defaults');
    assert.equal(await explicitMessage.evaluate(element => element.classList.contains('is-error')), false);
    assert.equal(await explicitMessage.locator('.ui-messages-content').count(), 0, 'explicit active=false wins over provider active=true');
    const explicitLabel = page.locator('#provider-explicit-false-label');
    assert.equal(await explicitLabel.evaluate(element => element.classList.contains('is-disabled')), false);
    assert.equal(await explicitLabel.locator('.ui-label-required').count(), 0, 'explicit required=false wins over provider required=true');
    report.labels = {
        textSlotRequiredOrder: labelValues,
        labelClickFocusesAssociatedInput: await page.evaluate(() => document.activeElement?.id === 'label-native-input'),
        disabled: { class: true, requiredMarker: true, nativeAttr: await disabledLabel.getAttribute('data-extra') }
    };
    report.defaults = {
        inheritedMessages: { active: false, error: true, color: await inheritedMessage.evaluate(element => element.style.color) },
        explicitFalseMessages: { active: false, error: false },
        inheritedLabel: { required: true, disabled: true },
        explicitFalseLabel: { required: false, disabled: false }
    };

    const realMessages = page.locator('[data-demo-component="UMessages"]');
    const realLabels = page.locator('[data-demo-component="ULabel"]');
    assert.equal(await realMessages.locator('.ui-messages').getAttribute('role'), 'status');
    assert.equal(await realMessages.locator('.ui-messages').textContent(), '配置已保存。');
    await realMessages.getByRole('button', { name: '切换错误消息' }).click();
    await waitFor(() => document.querySelector('[data-demo-component="UMessages"] .ui-messages')?.getAttribute('role') === 'alert');
    assert.equal(await realMessages.locator('.ui-messages.is-error strong').textContent(), '请检查输入内容。', 'real Messages demo switches message and error state');
    await realMessages.getByRole('button', { name: '切换错误消息' }).click();
    await waitFor(() => document.querySelector('[data-demo-component="UMessages"] .ui-messages')?.getAttribute('role') === 'status');
    await realMessages.getByRole('button', { name: '隐藏消息' }).click();
    await waitFor(() => !document.querySelector('[data-demo-component="UMessages"] .ui-messages-content'));
    await realMessages.getByRole('button', { name: '显示消息' }).click();
    await waitFor(() => Boolean(document.querySelector('[data-demo-component="UMessages"] .ui-messages-content')));
    assert.equal(await realMessages.locator('.ui-messages').textContent(), '配置已保存。');

    const realLabel = realLabels.locator('.ui-label');
    assert.equal(await realLabel.getAttribute('for'), 'custom-label-demo');
    assert.equal(await realLabel.locator('.ui-label-required').count(), 1);
    await realLabel.click();
    await waitFor(() => document.activeElement?.id === 'custom-label-demo');
    assert.equal(await realLabels.locator('#custom-label-demo').count(), 1, 'real Label demo associates its label with the input');

    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(1);
    }, { width: 390, height: 1000 });
    await settle();
    const narrowLayout = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        realDemoClientWidth: document.querySelector('#real-demos').clientWidth,
        realDemoScrollWidth: document.querySelector('#real-demos').scrollWidth,
        contractsClientWidth: document.querySelector('#messages-contracts').clientWidth,
        contractsScrollWidth: document.querySelector('#messages-contracts').scrollWidth
    }));
    assert.ok(narrowLayout.documentWidth <= narrowLayout.viewportWidth + 1, 'full fixture has no horizontal overflow at the narrow viewport');
    assert.ok(narrowLayout.bodyWidth <= narrowLayout.viewportWidth + 1);
    assert.ok(narrowLayout.realDemoScrollWidth <= narrowLayout.realDemoClientWidth + 1);
    assert.ok(narrowLayout.contractsScrollWidth <= narrowLayout.contractsClientWidth + 1);
    report.realDemos = {
        messages: { statusInitially: true, errorButtonTogglesAlert: true, activeButtonHidesAndRestoresContent: true },
        label: { for: await realLabel.getAttribute('for'), clickFocusesInput: true },
        narrowLayout: narrowLayout
    };

    await prepareCapture('light', 1280, 1000, 'messages-label-wide-light.png');
    await prepareCapture('dark', 1280, 1000, 'messages-label-wide-dark.png');
    await prepareCapture('light', 390, 1000, 'messages-label-narrow-light.png');

    assert.deepEqual(errors, [], 'UMessages and ULabel protocols and real demos have no page errors, console errors, or Vue warnings');
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
