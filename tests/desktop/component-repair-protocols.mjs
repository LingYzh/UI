import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const evidence = path.resolve('artifacts/component-audit-root/component-repair-protocols');
await mkdir(evidence, { recursive: true });
const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
    #app { max-width: 1100px; margin: 0 auto; padding: 24px; }
    main { display: grid; gap: 20px; }
    .repair-demos { display: grid; gap: 24px; }
    .repair-demos > section { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
    .repair-contracts { display: grid; gap: 16px; }
</style></head><body><div id="app"></div><script type="module">
    import { createApp, h, isRef, reactive, ref } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import FieldDemo from '/src/ui/docs/component-examples/field.vue';
    import PickerDemo from '/src/ui/docs/component-examples/picker.vue';
    import HotkeyDemo from '/src/ui/docs/component-examples/hotkey.vue';
    import HotkeyListenerDemo from '/src/ui/docs/component-examples/hotkey-listener.vue';
    import CounterDemo from '/src/ui/docs/component-examples/counter.vue';
    import RadioGroupDemo from '/src/ui/docs/component-examples/radio-group.vue';
    import WindowDemo from '/src/ui/docs/component-examples/window.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        fieldValue: '协议值', fieldFocused: false, fieldDisabled: false, fieldDirty: false, fieldActive: false, fieldVariant: 'outlined', fieldModelUpdates: [], fieldClearEvents: 0, fieldPrependEvents: 0, fieldAppendEvents: 0,
        pickerLandscape: true, pickerHideTitle: false, pickerHideHeader: false, pickerListValue: 'alpha', pickerStringValue: 'Alpha', pickerObjectValue: 'a', pickerReturnedObject: { id: 'alpha', title: 'Alpha' }, pickerMultipleValue: ['red'], pickerReadonlyValue: 'locked',
        hotkeyDisabled: false, hotkeyTriggers: 0, nonListeningTriggers: 0, listenerDisabled: false, listenerTriggers: 0, inputGuardTriggers: 0, allowInputTriggers: 0, cleanupMounted: true, cleanupTriggers: 0,
        counterUnicode: 'A😀B', counterValue: '剩余 8 个名额',
        stringDemoValue: '',
    });
    const fieldRef = ref();
    let fieldScope;
    let pickerListScope;
    const protocol = {
        state,
        readFieldScope: () => fieldScope && ({
            isActive: fieldScope.isActive.value,
            isFocused: fieldScope.isFocused.value,
            scopeControlRefIsRef: isRef(fieldScope.controlRef),
            scopeControlClass: fieldScope.controlRef.value?.className,
            props: { ...fieldScope.props },
            controlAttrs: { ...fieldScope.controlAttrs }
        }),
        fieldFocus: () => fieldRef.value.focus(),
        fieldBlur: () => fieldRef.value.blur(),
        readExposedControlClass: () => {
            const exposed = fieldRef.value.controlRef;
            return (isRef(exposed) ? exposed.value : exposed)?.className;
        },
        readPickerListScope: () => pickerListScope && ({ count: pickerListScope.items.length, modelValue: pickerListScope.modelValue, canChoose: typeof pickerListScope.choose === 'function', selectedAlpha: pickerListScope.selected('alpha') })
    };
    window.componentRepair = protocol;

    function fieldContract() {
        return h(UI.UField, {
            ref: fieldRef,
            id: 'protocol-field-input',
            label: '字段契约输入',
            description: '字段说明文本',
            error: '字段错误文本',
            details: true,
            theme: 'dark',
            variant: state.fieldVariant,
            active: state.fieldActive,
            dirty: state.fieldDirty,
            disabled: state.fieldDisabled,
            focused: state.fieldFocused,
            clearable: true,
            prependInnerIcon: 'mdi-chevron-left',
            appendInnerIcon: 'mdi-chevron-right',
            'onUpdate:focused': value => state.fieldFocused = value,
            'onUpdate:modelValue': value => state.fieldModelUpdates.push(value),
            'onClick:clear': () => state.fieldClearEvents++,
            'onClick:prependInner': () => state.fieldPrependEvents++,
            'onClick:appendInner': () => state.fieldAppendEvents++
        }, {
            default: scope => {
                fieldScope = scope;
                return h('input', { ...scope.props, value: state.fieldValue, disabled: state.fieldDisabled, 'aria-label': '字段契约输入', onInput: event => state.fieldValue = event.target.value });
            }
        });
    }
    function formFieldCompatibilityContract() {
        return h(UI.UFormField, {
            for: 'legacy-field-input', label: '旧字段标签', description: '旧字段说明', error: '旧字段错误', layout: 'horizontal'
        }, {
            default: ({ controlAttrs }) => h('input', { ...controlAttrs, 'aria-label': '旧字段输入' })
        });
    }
    function pickerSlots() {
        return h(UI.UPicker, {
            id: 'picker-slot-contract', tag: 'section', title: '默认标题', landscape: state.pickerLandscape, divided: true,
            hideTitle: state.pickerHideTitle, hideHeader: state.pickerHideHeader, width: 260, minWidth: 220, maxWidth: 320,
            height: 180, minHeight: 160, maxHeight: 220, border: true, theme: 'dark'
        }, {
            title: () => h('strong', { id: 'picker-title-slot' }, '标题插槽'),
            header: () => h('em', { id: 'picker-header-slot' }, '头部插槽'),
            default: () => h('div', { id: 'picker-default-slot' }, '默认内容插槽'),
            actions: () => h(UI.UButton, { id: 'picker-action-button' }, () => '动作按钮')
        });
    }
    function pickerList() {
        return h(UI.UPicker, {
            id: 'picker-list-contract', title: '项目选择', items: [{ id: 'alpha', title: 'Alpha' }, { id: 'beta', title: 'Beta' }],
            itemTitle: 'title', itemValue: 'id', modelValue: state.pickerListValue, 'onUpdate:modelValue': value => state.pickerListValue = value
        }, {
            item: ({ item, selected }) => h('span', { class: 'picker-item-scope' }, String(item.title) + ':' + String(selected)),
            default: scope => {
                pickerListScope = scope;
                return h('output', { id: 'picker-list-default-scope' }, String(scope.items.length) + '/' + String(scope.modelValue));
            }
        });
    }
    function optionPickerProtocols() {
        return h('div', { class: 'repair-contracts', id: 'option-picker-contracts' }, [
            h(UI.UOptionPicker, { id: 'string-options', items: ['Alpha', 'Beta'], modelValue: state.pickerStringValue, 'onUpdate:modelValue': value => state.pickerStringValue = value }),
            h(UI.UOptionPicker, { id: 'object-options', items: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }], itemTitle: 'title', itemValue: 'id', modelValue: state.pickerObjectValue, 'onUpdate:modelValue': value => state.pickerObjectValue = value }),
            h(UI.UOptionPicker, { id: 'object-return-options', items: [{ id: 'alpha', title: 'Alpha' }, { id: 'beta', title: 'Beta' }], itemTitle: 'title', itemValue: 'id', returnObject: true, modelValue: state.pickerReturnedObject, 'onUpdate:modelValue': value => state.pickerReturnedObject = value }),
            h(UI.UOptionPicker, { id: 'multiple-options', items: ['red', 'blue'], multiple: true, modelValue: state.pickerMultipleValue, 'onUpdate:modelValue': value => state.pickerMultipleValue = value }),
            h(UI.UOptionPicker, { id: 'readonly-options', items: ['locked', 'open'], readonly: true, modelValue: state.pickerReadonlyValue, 'onUpdate:modelValue': value => state.pickerReadonlyValue = value })
        ]);
    }
    function hotkeyProtocols() {
        return h('div', { id: 'hotkey-contracts' }, [
            h(UI.UHotkey, {
                id: 'hotkey-contract', keys: 'ctrl+shift+k', displayMode: 'text', platform: 'pc',
                keyMap: {
                    ctrl: { default: { text: 'Control' }, mac: { text: 'Command' } },
                    shift: { default: { text: 'Shift' }, mac: { text: 'Shift' } },
                    k: { default: { text: 'Key-K' }, mac: { text: 'Key-K' } }
                }, prefix: '前缀', suffix: '后缀',
                disabled: state.hotkeyDisabled, 'onTrigger': () => state.hotkeyTriggers++
            }),
            h(UI.UHotkey, {
                id: 'hotkey-mac-contract', keys: 'ctrl+k', displayMode: 'text', platform: 'mac',
                keyMap: { ctrl: { default: { text: 'Control' }, mac: { text: 'Command' } }, k: { default: { text: 'Key-K' } } }
            }),
            h(UI.UHotkey, { id: 'hotkey-no-listen', keys: 'ctrl+alt+o', displayMode: 'text', listen: false, prefix: '静态前缀', suffix: '静态后缀', 'onTrigger': () => state.nonListeningTriggers++ }),
            h(UI.UHotkey, { id: 'hotkey-slot-override', keys: 'ctrl+o', listen: false, prefix: '不显示前缀', suffix: '不显示后缀' }, {
                default: ({ keys }) => h('span', { id: 'hotkey-legacy-slot' }, 'legacy:' + keys)
            }),
            h('div', { id: 'listener-contract' }, h(UI.UHotkeyListener, { keys: 'ctrl+shift+l', disabled: state.listenerDisabled, 'onTrigger': () => state.listenerTriggers++ }, {
                default: ({ keys }) => h('span', { id: 'listener-legacy-slot' }, 'legacy:' + keys)
            })),
            h('div', { id: 'listener-input-guard' }, h(UI.UHotkeyListener, { keys: 'ctrl+shift+i', 'onTrigger': () => state.inputGuardTriggers++ })),
            h('div', { id: 'listener-allow-input' }, h(UI.UHotkeyListener, { keys: 'ctrl+shift+a', allowInput: true, preventDefault: false, 'onTrigger': () => state.allowInputTriggers++ })),
            state.cleanupMounted ? h('div', { id: 'listener-cleanup' }, h(UI.UHotkeyListener, { key: 'cleanup', keys: 'ctrl+alt+j', 'onTrigger': () => state.cleanupTriggers++ })) : null,
            h('input', { id: 'hotkey-input-guard', 'aria-label': '快捷键输入守卫' })
        ]);
    }
    function counterProtocols() {
        return h('div', { id: 'counter-contracts' }, [
            h(UI.UCounter, { id: 'counter-unicode', value: state.counterUnicode, max: 2 }),
            h(UI.UCounter, { id: 'counter-value-mode', value: state.counterValue, displayMode: 'value' }),
            h(UI.UCounter, { id: 'counter-disabled', value: 'long', max: 1, disabled: true }),
            h(UI.UCounter, { id: 'counter-slot', value: state.counterUnicode, max: 2 }, {
                default: ({ counter, max, value }) => h('span', { id: 'counter-slot-content' }, String(counter) + '|' + String(max) + '|' + String(value))
            }),
            h(UI.UCounter, { id: 'counter-inactive', value: 'hidden', active: false })
        ]);
    }

    const app = createApp({ render() {
        return h('main', [
            h('section', { class: 'repair-demos', id: 'real-component-demos' }, [
                h('section', [h('h2', 'UField demo'), h(FieldDemo)]),
                h('section', [h('h2', 'UPicker demo'), h(PickerDemo)]),
                h('section', [h('h2', 'UHotkey demo'), h(HotkeyDemo), h(HotkeyListenerDemo)]),
                h('section', [h('h2', 'URadioGroup demo'), h(RadioGroupDemo)]),
                h('section', [h('h2', 'UWindow demo'), h(WindowDemo)]),
                h('section', [h('h2', 'UCounter demo'), h(CounterDemo)])
            ]),
            h('section', { class: 'repair-contracts', id: 'field-contracts' }, [fieldContract()]),
            h('section', { class: 'repair-contracts', id: 'form-field-compat-contract' }, [formFieldCompatibilityContract()]),
            h('section', { class: 'repair-contracts', id: 'picker-contracts' }, [pickerSlots(), pickerList(), optionPickerProtocols(), h(UI.UButton, { id: 'outside-picker-button' }, () => '外部按钮')]),
            h('section', { class: 'repair-contracts', id: 'hotkey-section' }, [hotkeyProtocols()]),
            h('section', { class: 'repair-contracts', id: 'counter-section' }, [counterProtocols()])
        ]);
    } });
    app.use(UI.createUI());
    const canonical = Object.keys(app._context.components).filter(name => /^U[A-Z]/.test(name));
    const globalNames = ['u-field', 'u-form-field', 'u-picker', 'u-option-picker', 'u-hotkey', 'u-hotkey-listener', 'u-counter'];
    const allGlobalNames = canonical.map(name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/^U(?=[A-Z])/, 'U-').toLowerCase());
    protocol.registry = {
        canonicalRegisteredCount: canonical.length,
        requiredGlobalNames: Object.fromEntries(globalNames.map(name => [name, Boolean(app.component(name))])),
        missingCanonicalGlobalNames: allGlobalNames.filter(name => !app.component(name)),
        formFieldAliasIdentity: UI.UFormField === UI.UiField
    };
    app.mount('#app');
    window.componentRepair.app = app;
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
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'component-repair-protocol-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__component-repair-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await server.transformIndexHtml('/__component-repair-protocols', fixture));
            });
        }
    }]
});
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__component-repair-protocols` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text()); });
await page.emulateMedia({ reducedMotion: 'reduce' });

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function setState(name, value) {
    await page.evaluate(([key, next]) => { window.componentRepair.state[key] = next; }, [name, value]);
    await settle();
}
async function dispatchKey(key, modifiers = {}, selector) {
    return page.evaluate(({ key, modifiers, selector }) => {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
        const target = selector ? document.querySelector(selector) : window;
        const dispatched = target.dispatchEvent(event);
        return { defaultPrevented: event.defaultPrevented, dispatched };
    }, { key, modifiers, selector });
}
async function prepareCapture(theme, width, height, zoom = 1) {
    await app.evaluate(({ BrowserWindow }, size) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setContentSize(size.width, size.height);
        mainWindow.setBounds({ ...mainWindow.getBounds(), width: size.width, height: size.height });
        mainWindow.webContents.setZoomFactor(size.zoom);
    }, { width, height, zoom });
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    await page.evaluate(() => {
        window.scrollTo(0, 0);
        for (const container of document.querySelectorAll('*')) {
            container.scrollTop = 0;
            container.scrollLeft = 0;
        }
    });
    await settle();
    await page.waitForTimeout(100);
}
async function capture(name, theme, width, height, zoom = 1) {
    await prepareCapture(theme, width, height, zoom);
    const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
async function captureLocator(name, selector, theme, width, height, zoom = 1, beforeCapture) {
    await prepareCapture(theme, width, height, zoom);
    if (beforeCapture) await beforeCapture();
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.screenshot({ path: path.join(evidence, `${name}.png`), animations: 'disabled', caret: 'hide' });
}

const report = { method: 'Vite source fixture + public src/ui/index.ts + createUI + Electron', evidence, registry: {}, field: {}, picker: {}, hotkey: {}, counter: {}, demos: {}, errors };
try {
    await page.locator('[data-demo-component="UField"]').waitFor();
    await page.locator('[data-demo-component="UPicker"]').waitFor();
    await page.locator('[data-demo-component="UHotkey"]').waitFor();
    await page.locator('[data-demo-component="UCounter"]').waitFor();

    report.registry = await page.evaluate(() => window.componentRepair.registry);
    assert.equal(report.registry.formFieldAliasIdentity, true, 'UFormField keeps the exact UiField alias');
    assert.equal(report.registry.canonicalRegisteredCount, 156, 'createUI registers all 156 canonical components');
    assert.deepEqual(report.registry.requiredGlobalNames, { 'u-field': true, 'u-form-field': true, 'u-picker': true, 'u-option-picker': true, 'u-hotkey': true, 'u-hotkey-listener': true, 'u-counter': true });
    assert.deepEqual(report.registry.missingCanonicalGlobalNames, [], 'every registered canonical component also has its u-* global name');
    report.registry.formFieldCompatibility = await page.evaluate(() => {
        const field = document.querySelector('#form-field-compat-contract .ui-field');
        const label = field?.querySelector('label');
        const input = field?.querySelector('input');
        return {
            layout: field?.getAttribute('data-layout'),
            labelFor: label?.htmlFor,
            inputId: input?.id,
            describedBy: input?.getAttribute('aria-describedby'),
            details: [...(field?.querySelectorAll('.ui-field-details p') ?? [])].map(element => element.textContent)
        };
    });
    assert.equal(report.registry.formFieldCompatibility.layout, 'horizontal');
    assert.equal(report.registry.formFieldCompatibility.labelFor, 'legacy-field-input');
    assert.equal(report.registry.formFieldCompatibility.inputId, 'legacy-field-input');
    assert.match(report.registry.formFieldCompatibility.describedBy, /-description/);
    assert.match(report.registry.formFieldCompatibility.describedBy, /-error/);
    assert.deepEqual(report.registry.formFieldCompatibility.details, ['旧字段说明', '旧字段错误']);

    const fieldDemo = page.locator('[data-demo-component="UField"]');
    const variantSelect = fieldDemo.getByRole('combobox', { name: '字段变体' });
    const variants = ['outlined', 'filled', 'underlined', 'plain', 'solo', 'solo-inverted', 'solo-filled'];
    for (const variant of variants) {
        await variantSelect.click();
        await page.getByRole('option', { name: variant, exact: true }).click();
        await assertClass(fieldDemo.locator('.u-field-surface'), `is-${variant}`);
    }
    const demoInput = fieldDemo.getByRole('textbox', { name: '自定义原生输入' });
    const labelFor = await fieldDemo.locator('.u-field-label').getAttribute('for');
    assert.equal(labelFor, await demoInput.getAttribute('id'), 'real field demo associates label and input');
    await demoInput.fill('测试清除');
    await assertClass(fieldDemo.locator('.u-field-surface'), 'is-dirty');
    await assertClass(fieldDemo.locator('.u-field-surface'), 'is-active');
    await demoInput.focus();
    assert.match(await fieldDemo.locator('output').textContent(), /焦点：有/);
    await fieldDemo.getByRole('button', { name: '清除' }).click();
    assert.match(await fieldDemo.locator('output').textContent(), /当前值：空/);
    assert.equal(await fieldDemo.locator('.u-field-surface').evaluate(element => element.classList.contains('is-dirty')), false);
    await fieldDemo.getByRole('checkbox', { name: '禁用字段' }).check();
    assert.equal(await demoInput.isDisabled(), true);
    await assertClass(fieldDemo.locator('.u-field-surface'), 'is-disabled');
    report.demos.field = { variants, labelFor, valueAfterClear: await demoInput.inputValue(), disabledInput: await demoInput.isDisabled() };

    report.field = await page.evaluate(() => {
        const scope = window.componentRepair.readFieldScope();
        const input = document.querySelector('#field-contracts input[aria-label="字段契约输入"]');
        const label = [...document.querySelectorAll('#field-contracts label')].find(element => element.textContent.includes('字段契约输入'));
        return {
            scope: { isActive: scope.isActive, isFocused: scope.isFocused, scopeControlRefIsRef: scope.scopeControlRefIsRef, scopeControlClass: scope.scopeControlClass },
            props: scope.props,
            controlAttrs: scope.controlAttrs,
            inputId: input?.id,
            labelFor: label?.htmlFor,
            descriptions: [...document.querySelectorAll('#field-contracts .ui-field-details p')].map(element => ({ id: element.id, text: element.textContent })),
            theme: document.querySelector('#field-contracts .ui-theme-provider')?.dataset.theme,
            exposedControlClass: window.componentRepair.readExposedControlClass()
        };
    });
    assert.equal(report.field.inputId, 'protocol-field-input');
    assert.equal(report.field.labelFor, report.field.inputId);
    assert.equal(report.field.scope.scopeControlRefIsRef, true, 'slot scope exposes its controlRef as a ref');
    assert.match(report.field.props.class, /u-field-input/);
    assert.equal(report.field.props.id, report.field.inputId);
    assert.equal(report.field.controlAttrs.id, report.field.inputId);
    assert.match(report.field.controlAttrs.class, /u-field-input/);
    assert.equal(report.field.controlAttrs['aria-describedby'], report.field.props['aria-describedby']);
    assert.equal(report.field.props['aria-describedby'], report.field.controlAttrs['aria-describedby']);
    assert.match(report.field.props['aria-describedby'], /-description/);
    assert.match(report.field.props['aria-describedby'], /-error/);
    assert.deepEqual(report.field.descriptions.map(item => item.text), ['字段说明文本', '字段错误文本']);
    assert.equal(report.field.theme, 'dark');
    assert.match(report.field.exposedControlClass, /u-field-surface/);
    await page.evaluate(() => window.componentRepair.fieldFocus());
    await settle();
    assert.equal((await page.evaluate(() => window.componentRepair.readFieldScope())).isFocused, true);
    assert.equal(await page.evaluate(() => window.componentRepair.state.fieldFocused), true);
    await page.evaluate(() => window.componentRepair.fieldBlur());
    await settle();
    assert.equal((await page.evaluate(() => window.componentRepair.readFieldScope())).isFocused, false);
    assert.equal(await page.evaluate(() => window.componentRepair.state.fieldFocused), false);
    await setState('fieldActive', true);
    assert.equal((await page.evaluate(() => window.componentRepair.readFieldScope())).isActive, true);
    await setState('fieldActive', false);
    await setState('fieldDirty', true);
    assert.equal((await page.evaluate(() => window.componentRepair.readFieldScope())).isActive, true, 'dirty state also activates the field scope');
    await page.locator('#field-contracts .u-field-icon[aria-label="前置操作"]').click();
    await page.locator('#field-contracts .u-field-icon[aria-label="后置操作"]').click();
    await page.locator('#field-contracts .u-field-icon[aria-label="清除"]').click();
    const fieldEvents = await page.evaluate(() => ({
        prepend: window.componentRepair.state.fieldPrependEvents,
        append: window.componentRepair.state.fieldAppendEvents,
        clear: window.componentRepair.state.fieldClearEvents,
        modelUpdates: window.componentRepair.state.fieldModelUpdates
    }));
    assert.deepEqual(fieldEvents, { prepend: 1, append: 1, clear: 1, modelUpdates: [null] });
    await setState('fieldDisabled', true);
    const beforeBlockedFocus = (await page.evaluate(() => window.componentRepair.readFieldScope())).isFocused;
    await page.evaluate(() => window.componentRepair.fieldFocus());
    assert.equal((await page.evaluate(() => window.componentRepair.readFieldScope())).isFocused, beforeBlockedFocus, 'disabled field refuses exposed focus');
    report.field.events = fieldEvents;
    report.field.disabledFocusRemains = beforeBlockedFocus;

    const pickerDemo = page.locator('[data-demo-component="UPicker"]');
    await pickerDemo.getByRole('option', { name: '文档', exact: true }).click();
    await pickerDemo.getByRole('button', { name: '确认', exact: true }).click();
    assert.match(await pickerDemo.locator('output').textContent(), /已确认：文档/);
    await pickerDemo.getByRole('checkbox', { name: '横向布局' }).check();
    await assertClass(pickerDemo.locator('.u-picker-container'), 'is-landscape');
    await pickerDemo.getByRole('checkbox', { name: '隐藏标题区域' }).check();
    assert.equal(await pickerDemo.locator('.u-picker-header').count(), 0);
    const pickerBodyWidth = await pickerDemo.locator('.u-picker-container').evaluate(root => {
        const body = root.querySelector('.u-picker-body');
        return { containerClientWidth: root.clientWidth, bodyWidth: body?.getBoundingClientRect().width };
    });
    assert.ok(Math.abs(pickerBodyWidth.containerClientWidth - pickerBodyWidth.bodyWidth) <= 1, `landscape picker body fills its headerless container: ${JSON.stringify(pickerBodyWidth)}`);
    report.demos.picker = {
        selected: await pickerDemo.locator('output').textContent(),
        landscape: true,
        hiddenHeaderCount: await pickerDemo.locator('.u-picker-header').count(),
        bodyFullWidth: pickerBodyWidth
    };

    report.picker.slots = await page.evaluate(() => {
        const root = document.querySelector('#picker-slot-contract');
        const actions = root?.querySelector('#picker-action-button');
        const outside = document.querySelector('#outside-picker-button');
        return {
            tag: root?.tagName,
            classes: root?.className,
            width: root?.style.width,
            minWidth: root?.style.minWidth,
            maxWidth: root?.style.maxWidth,
            height: root?.style.height,
            minHeight: root?.style.minHeight,
            maxHeight: root?.style.maxHeight,
            theme: root?.dataset.theme,
            title: root?.querySelector('#picker-title-slot')?.textContent,
            header: root?.querySelector('#picker-header-slot')?.textContent,
            body: root?.querySelector('#picker-default-slot')?.textContent,
            actionClass: actions?.className,
            outsideClass: outside?.className
        };
    });
    assert.equal(report.picker.slots.tag, 'SECTION');
    assert.match(report.picker.slots.classes, /is-landscape/);
    assert.match(report.picker.slots.classes, /is-divided/);
    assert.equal(report.picker.slots.width, '260px');
    assert.equal(report.picker.slots.minWidth, '220px');
    assert.equal(report.picker.slots.maxWidth, '320px');
    assert.equal(report.picker.slots.height, '180px');
    assert.equal(report.picker.slots.minHeight, '160px');
    assert.equal(report.picker.slots.maxHeight, '220px');
    assert.equal(report.picker.slots.theme, 'dark');
    assert.equal(report.picker.slots.title, '标题插槽');
    assert.equal(report.picker.slots.header, '头部插槽');
    assert.equal(report.picker.slots.body, '默认内容插槽');
    assert.match(report.picker.slots.actionClass, /variant-text/);
    assert.match(report.picker.slots.outsideClass, /variant-outlined/);
    await setState('pickerHideTitle', true);
    assert.equal(await page.locator('#picker-slot-contract .u-picker-title').count(), 0);
    assert.equal(await page.locator('#picker-slot-contract .u-picker-header').count(), 1, 'hideTitle preserves a separately supplied header slot');
    await setState('pickerHideHeader', true);
    assert.equal(await page.locator('#picker-slot-contract .u-picker-header').count(), 0);
    assert.equal(await page.locator('#picker-list-contract .picker-item-scope').filter({ hasText: 'Beta:false' }).count(), 1);
    await page.getByRole('option', { name: 'Beta:false' }).click();
    assert.equal(await page.locator('#picker-list-contract .picker-item-scope').filter({ hasText: 'Beta:true' }).count(), 1, 'item slot receives the updated selected scope');
    assert.equal(await page.evaluate(() => window.componentRepair.state.pickerListValue), 'beta');
    report.picker.listScope = await page.evaluate(() => window.componentRepair.readPickerListScope());
    assert.equal(report.picker.listScope.count, 2);
    assert.equal(report.picker.listScope.modelValue, 'beta');
    assert.equal(report.picker.listScope.canChoose, true);
    assert.equal(report.picker.listScope.selectedAlpha, false);
    await page.locator('#string-options').getByRole('option', { name: 'Beta', exact: true }).click();
    assert.equal(await page.evaluate(() => window.componentRepair.state.pickerStringValue), 'Beta');
    await page.locator('#object-options').getByRole('option', { name: 'B', exact: true }).click();
    assert.equal(await page.evaluate(() => window.componentRepair.state.pickerObjectValue), 'b');
    await page.locator('#object-return-options').getByRole('option', { name: 'Beta', exact: true }).click();
    assert.equal(await page.evaluate(() => window.componentRepair.state.pickerReturnedObject.id), 'beta');
    await page.locator('#multiple-options').getByRole('option', { name: 'blue', exact: true }).click();
    await page.locator('#multiple-options').getByRole('option', { name: 'red', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.componentRepair.state.pickerMultipleValue), ['blue']);
    assert.equal(await page.locator('#readonly-options').getByRole('option').nth(1).isDisabled(), true);
    await page.locator('#readonly-options').getByRole('option', { name: 'open', exact: true }).dispatchEvent('click');
    assert.equal(await page.evaluate(() => window.componentRepair.state.pickerReadonlyValue), 'locked');
    report.picker.models = await page.evaluate(() => ({
        string: window.componentRepair.state.pickerStringValue,
        objectValue: window.componentRepair.state.pickerObjectValue,
        returnedObject: window.componentRepair.state.pickerReturnedObject,
        multiple: window.componentRepair.state.pickerMultipleValue,
        readonly: window.componentRepair.state.pickerReadonlyValue
    }));

    const listener = page.locator('#listener-contract');
    assert.equal(await listener.locator('#listener-legacy-slot').textContent(), 'legacy:ctrl+shift+l');
    const listenerEvent = await dispatchKey('L', { ctrlKey: true, shiftKey: true });
    assert.equal(listenerEvent.defaultPrevented, true, 'UHotkeyListener keeps preventDefault=true by default');
    assert.equal(await page.evaluate(() => window.componentRepair.state.listenerTriggers), 1);
    await setState('listenerDisabled', true);
    await dispatchKey('L', { ctrlKey: true, shiftKey: true });
    assert.equal(await page.evaluate(() => window.componentRepair.state.listenerTriggers), 1, 'disabled listener ignores a matching combo');
    await setState('listenerDisabled', false);
    await dispatchKey('I', { ctrlKey: true, shiftKey: true }, '#hotkey-input-guard');
    assert.equal(await page.evaluate(() => window.componentRepair.state.inputGuardTriggers), 0, 'input-focused combo is ignored by default');
    await dispatchKey('A', { ctrlKey: true, shiftKey: true }, '#hotkey-input-guard');
    assert.equal(await page.evaluate(() => window.componentRepair.state.allowInputTriggers), 1, 'allowInput=true restores the combo in inputs');
    await dispatchKey('J', { ctrlKey: true, altKey: true });
    assert.equal(await page.evaluate(() => window.componentRepair.state.cleanupTriggers), 1);
    await setState('cleanupMounted', false);
    await dispatchKey('J', { ctrlKey: true, altKey: true });
    assert.equal(await page.evaluate(() => window.componentRepair.state.cleanupTriggers), 1, 'unmounted listener removes its global handler');
    assert.equal(await page.locator('#hotkey-legacy-slot').textContent(), 'legacy:ctrl+o');
    assert.equal(await page.locator('#hotkey-slot-override .u-hotkey-prefix').count(), 0);
    assert.match(await page.locator('#hotkey-mac-contract').getAttribute('aria-label'), /Command/);
    await dispatchKey('O', { ctrlKey: true, altKey: true });
    assert.equal(await page.evaluate(() => window.componentRepair.state.nonListeningTriggers), 0, 'listen=false only displays the combo');
    await dispatchKey('K', { ctrlKey: true, shiftKey: true });
    assert.equal(await page.evaluate(() => window.componentRepair.state.hotkeyTriggers), 1);
    await setState('hotkeyDisabled', true);
    await dispatchKey('K', { ctrlKey: true, shiftKey: true });
    assert.equal(await page.evaluate(() => window.componentRepair.state.hotkeyTriggers), 1, 'disabled UHotkey suppresses its trigger');
    report.hotkey = await page.evaluate(() => ({
        platform: 'pc',
        macAriaLabel: document.querySelector('#hotkey-mac-contract')?.getAttribute('aria-label'),
        text: document.querySelector('#hotkey-contract')?.textContent,
        ariaLabel: document.querySelector('#hotkey-contract')?.getAttribute('aria-label'),
        disabledClass: document.querySelector('#hotkey-contract')?.className,
        listenerPreventDefault: true,
        listenerDisabledTriggers: window.componentRepair.state.listenerTriggers,
        inputGuardTriggers: window.componentRepair.state.inputGuardTriggers,
        allowInputTriggers: window.componentRepair.state.allowInputTriggers,
        cleanupTriggers: window.componentRepair.state.cleanupTriggers,
        nonListeningTriggers: window.componentRepair.state.nonListeningTriggers,
        hotkeyTriggers: window.componentRepair.state.hotkeyTriggers
    }));
    assert.match(report.hotkey.text, /前缀/);
    assert.match(report.hotkey.text, /后缀/);
    assert.match(report.hotkey.text, /Control/);
    assert.match(report.hotkey.text, /Key-K/);
    assert.match(report.hotkey.disabledClass, /is-disabled/);

    const hotkeyDemo = page.locator('[data-demo-component="UHotkey"]');
    const displaySelect = hotkeyDemo.getByRole('combobox', { name: '快捷键显示方式' });
    await displaySelect.click();
    await page.getByRole('option', { name: 'text', exact: true }).click();
    const platformSelect = hotkeyDemo.getByRole('combobox', { name: '平台' });
    await platformSelect.click();
    await page.getByRole('option', { name: 'pc', exact: true }).click();
    const hotkeyDemoDisplay = hotkeyDemo.locator('.u-hotkey-display').first();
    assert.ok(await hotkeyDemoDisplay.getAttribute('aria-label'));
    const demoOutput = hotkeyDemo.locator('output');
    const beforeDemoTrigger = Number((await demoOutput.textContent()).match(/已触发 (\d+) 次/)?.[1]);
    await dispatchKey('K', { ctrlKey: true, shiftKey: true });
    const enabledOutput = await demoOutput.textContent();
    assert.match(enabledOutput, new RegExp('已触发 ' + String(beforeDemoTrigger + 1) + ' 次'));
    await hotkeyDemo.getByRole('checkbox', { name: '禁用快捷键' }).check();
    await dispatchKey('K', { ctrlKey: true, shiftKey: true });
    assert.equal(await demoOutput.textContent(), enabledOutput, 'disabled demo shortcut keeps its prior trigger count');
    report.demos.hotkey = { displayMode: 'text', platform: 'pc', triggered: enabledOutput };
    report.demos.hotkeyListener = { triggerOutput: await page.locator('[data-demo-component="UHotkeyListener"] output').textContent() };

    const counterDemo = page.locator('[data-demo-component="UCounter"]');
    const counterInput = counterDemo.getByRole('textbox', { name: '名称' });
    await counterInput.fill('A😀B');
    assert.match(await counterDemo.locator('.ui-counter').first().textContent(), /3 \/ 20/);
    report.demos.counter = { value: await counterInput.inputValue(), counter: await counterDemo.locator('.ui-counter').first().textContent() };
    assert.equal(await page.locator('#counter-unicode').textContent(), '3 / 2');
    await assertClass(page.locator('#counter-unicode'), 'is-over');
    assert.equal(await page.locator('#counter-value-mode').textContent(), '剩余 8 个名额');
    assert.equal(await page.locator('#counter-disabled').textContent(), '4 / 1');
    assert.equal(await page.locator('#counter-disabled').evaluate(element => element.classList.contains('is-over')), false);
    assert.equal(await page.locator('#counter-slot-content').textContent(), '3 / 2|2|A😀B');
    assert.equal(await page.locator('#counter-inactive').count(), 0);
    report.counter = { unicodeCodepoints: await page.locator('#counter-unicode').textContent(), valueMode: await page.locator('#counter-value-mode').textContent(), disabledOver: false, slot: await page.locator('#counter-slot-content').textContent(), activeDefault: true };

    const radioDemo = page.locator('[data-demo-component="URadioGroup"]');
    await radioDemo.getByRole('radio', { name: '自定义', exact: true }).check();
    assert.match(await radioDemo.locator('output').textContent(), /当前选择：b/);
    await radioDemo.getByRole('checkbox', { name: '禁用整组' }).check();
    assert.equal(await radioDemo.getByRole('radio', { name: '默认', exact: true }).isDisabled(), true);
    await radioDemo.getByRole('checkbox', { name: '禁用整组' }).uncheck();
    await radioDemo.getByRole('checkbox', { name: '整组只读' }).check();
    assert.equal(await radioDemo.getByRole('radio', { name: '默认', exact: true }).getAttribute('aria-readonly'), 'true');
    report.demos.radioGroup = { selected: await radioDemo.locator('output').textContent(), readonly: true };

    const windowDemo = page.locator('[data-demo-component="UWindow"]');
    await windowDemo.getByRole('button', { name: '调用下一项', exact: true }).click();
    assert.match(await windowDemo.locator('output').textContent(), /当前面板：b/);
    await windowDemo.getByRole('checkbox', { name: '禁用窗口交互' }).check();
    await windowDemo.getByRole('button', { name: '调用下一项', exact: true }).click();
    assert.match(await windowDemo.locator('output').textContent(), /当前面板：b/);
    report.demos.window = { afterNextAndDisabledNext: await windowDemo.locator('output').textContent() };

    assert.deepEqual(errors, []);
    const screenshots = [
        ['wide-light', 'light', 1280, 1800, 1],
        ['wide-dark', 'dark', 1280, 1800, 1],
        ['narrow-light', 'light', 390, 1800, 1],
        ['zoom125-light', 'light', 900, 1600, 1.25]
    ];
    for (const [name, theme, width, height, zoom] of screenshots) await capture(name, theme, width, height, zoom);
    const demoScreenshotTargets = [
        ['field', '[data-demo-component="UField"]'],
        ['picker', '[data-demo-component="UPicker"]'],
        ['hotkey', '[data-demo-component="UHotkey"]']
    ];
    const demoScreenshots = [];
    for (const [component, selector] of demoScreenshotTargets) {
        for (const [size, theme, width, height] of [
            ['wide', 'light', 1280, 1800],
            ['wide', 'dark', 1280, 1800],
            ['narrow', 'light', 390, 1800]
        ]) {
            const name = `demo-${component}-${size}-${theme}`;
            const inspectNarrowField = component === 'field' && size === 'narrow' ? async () => {
                const geometry = await page.locator('[data-demo-component="UField"] .ui-field:has(> .u-field-surface)').evaluate(wrapper => {
                    const surface = wrapper.querySelector('.u-field-surface')?.getBoundingClientRect();
                    const details = wrapper.querySelector('.ui-field-details')?.getBoundingClientRect();
                    return {
                        layout: wrapper.getAttribute('data-layout'),
                        surface: surface && { top: surface.top, bottom: surface.bottom, width: surface.width },
                        description: details && { top: details.top, width: details.width }
                    };
                });
                assert.equal(geometry.layout, 'vertical');
                assert.ok(geometry.surface && geometry.description, 'narrow UField demo includes its description block');
                assert.ok(geometry.description.top >= geometry.surface.bottom, `description follows the field surface: ${JSON.stringify(geometry)}`);
                assert.ok(Math.abs(geometry.surface.width - geometry.description.width) <= 1, `description and surface share width: ${JSON.stringify(geometry)}`);
                report.demos.field.narrowGeometry = geometry;
            } : undefined;
            await captureLocator(name, selector, theme, width, height, 1, inspectNarrowField);
            demoScreenshots.push({ file: `${name}.png`, component, capture: 'locator', size, theme, width, height, zoom: 1 });
        }
    }
    const pickerLandscapeScreenshot = 'picker-landscape-hidden-header-wide-light';
    await captureLocator(pickerLandscapeScreenshot, '[data-demo-component="UPicker"]', 'light', 1280, 1800);
    demoScreenshots.push({ file: `${pickerLandscapeScreenshot}.png`, component: 'picker', capture: 'locator', landscape: true, headerHidden: true, size: 'wide', theme: 'light', width: 1280, height: 1800, zoom: 1 });
    report.screenshots = [
        ...screenshots.map(([name, theme, width, height, zoom]) => ({ file: `${name}.png`, capture: 'window', theme, width, height, zoom })),
        ...demoScreenshots
    ];
    console.log(JSON.stringify(report, null, 4));
} finally {
    if (!report.screenshots) {
        const screenshots = [
            ['wide-light', 'light', 1280, 1800, 1],
            ['wide-dark', 'dark', 1280, 1800, 1],
            ['narrow-light', 'light', 390, 1800, 1],
            ['zoom125-light', 'light', 900, 1600, 1.25]
        ];
        report.screenshots = [];
        for (const [name, theme, width, height, zoom] of screenshots) {
            try {
                await capture(name, theme, width, height, zoom);
                report.screenshots.push({ file: `${name}.png`, theme, width, height, zoom });
            } catch (error) {
                report.screenshotError = String(error);
                break;
            }
        }
    }
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    await app.close();
    await server.close();
}

async function assertClass(locator, className) {
    const classes = await locator.getAttribute('class');
    assert.ok(classes?.split(/\s+/).includes(className), `expected class ${className} on ${await locator.evaluate(element => element.tagName)}`);
}
