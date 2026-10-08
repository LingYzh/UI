import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/component-audit-root/input-counter-protocols');
await mkdir(evidence, { recursive: true });

const sourceFiles = [
    'src/ui/index.ts',
    'src/ui/UiInput.vue',
    'src/ui/UiTextarea.vue',
    'src/ui/UAutocomplete.vue',
    'src/ui/UCombobox.vue',
    'src/ui/autocomplete-props.ts',
    'src/ui/form.ts',
    'src/ui/locale-context.ts',
    'tests/desktop/input-counter-protocols.mjs',
    'tests/tsconfig.input-counter.json'
];

const fixture = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><title>Input counter protocols</title></head>
<body><div id="app"></div><script type="module">
import { createApp, h, isRef, nextTick, reactive, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/styles.css';

const state = reactive({
    fieldCounter: 'A😀',
    textareaCounter: 'A😀',
    fieldPersistent: 'A😀',
    textareaPersistent: 'A😀',
    fieldCounterOff: 'A😀',
    textareaCounterOff: 'A😀',
    fieldFunction: 'A😀',
    textareaFunction: 'A😀',
    fieldNumericOverride: 'A😀',
    textareaNumericOverride: 'A😀',
    enabledFieldClear: 'clear field',
    enabledTextareaClear: 'clear textarea',
    disabledFieldClear: 'disabled field',
    disabledTextareaClear: 'disabled textarea',
    readonlyFieldClear: 'readonly field',
    readonlyTextareaClear: 'readonly textarea',
    disabledField: false,
    disabledTextarea: false,
    readonlyField: false,
    readonlyTextarea: false,
    clearEvents: { field: [], textarea: [], disabledField: [], disabledTextarea: [], readonlyField: [], readonlyTextarea: [] },
    autocompleteMenu: false,
    comboboxMenu: false,
    firstMenu: false,
    exactMenu: false,
    exactSearch: 'Alph',
    autocompleteValue: null,
    comboboxValue: null,
    exactValue: null,
    exactMenuValue: null
});
const slotSnapshots = {};
const clearHandlers = {};
const resetField = ref();
const resetTextarea = ref();
const resetModels = reactive({ field: 'field reset', textarea: 'textarea reset' });
const resetFieldProps = () => ({
    id: 'reset-field', ref: resetField, modelValue: resetModels.field,
    'onUpdate:modelValue': value => { resetModels.field = value; }
});
const resetTextareaProps = () => ({
    id: 'reset-textarea', ref: resetTextarea, modelValue: resetModels.textarea,
    'onUpdate:modelValue': value => { resetModels.textarea = value; }
});
const modelProps = key => ({ modelValue: state[key], 'onUpdate:modelValue': value => { state[key] = value; } });
const slotRecorder = name => scope => {
    const control = scope.controlRef;
    const focused = scope.isFocused;
    const controlIsRef = isRef(control);
    const focusedIsRef = isRef(focused);
    const element = controlIsRef ? control.value : control;
    const isFocused = focusedIsRef ? focused.value : focused;
    slotSnapshots[name] = {
        controlRefIsRef: controlIsRef,
        isFocusedIsRef: focusedIsRef,
        controlId: element?.id ?? null,
        focused: typeof isFocused === 'boolean' ? isFocused : null
    };
    return null;
};
const clearSlot = name => ({ props }) => {
    clearHandlers[name] = props.onClick;
    return h('button', { ...props, id: name, type: 'button' }, 'Custom clear');
};
const items = [
    { title: 'Disabled first', value: 'disabled-first', props: { disabled: true } },
    { title: 'Alpha', value: 'alpha' },
    { title: 'Beta', value: 'beta' },
    { title: 'Disabled last', value: 'disabled-last', props: { disabled: true } }
];
const exactItems = [
    { title: 'Alpha', value: 'alpha' },
    { title: 'Alphabet', value: 'alphabet' }
];
const ui = UI.createUI({ locale: { locale: 'en' } });
window.inputCounterProtocol = {
    state,
    resetModels,
    registry: {
        UTextField: Boolean(UI.UTextField), UTextarea: Boolean(UI.UTextarea),
        UAutocomplete: Boolean(UI.UAutocomplete), UCombobox: Boolean(UI.UCombobox)
    },
    async flush() { await nextTick(); await nextTick(); await new Promise(resolve => setTimeout(resolve, 0)); },
    slot(name) { return slotSnapshots[name] ?? null; },
    invokeClear(name) { return clearHandlers[name]?.(new MouseEvent('click', { bubbles: true })); },
    async reset() {
        await resetField.value.reset();
        await resetTextarea.value.reset();
        await nextTick(); await nextTick();
    },
    setMenu(name, value) { state[name] = value; }
};

createApp({
    render() {
        return h('main', [
            h('section', { id: 'counter-cases' }, [
                h(UI.UTextField, { id: 'field-counter', ...modelProps('fieldCounter'), counter: '2', maxlength: '5' }, {
                    default: slotRecorder('field'),
                    counter: ({ counter, max, value }) => h('span', { id: 'field-counter-slot', 'data-max': String(max), 'data-value': String(value) }, counter + '|' + max + '|' + value)
                }),
                h(UI.UTextarea, { id: 'textarea-counter', ...modelProps('textareaCounter'), counter: '2', maxlength: '5' }, {
                    default: slotRecorder('textarea'),
                    counter: ({ counter, max, value }) => h('span', { id: 'textarea-counter-slot', 'data-max': String(max), 'data-value': String(value) }, counter + '|' + max + '|' + value)
                }),
                h(UI.UTextField, { id: 'field-persistent', ...modelProps('fieldPersistent'), counter: true, maxlength: '5', persistentCounter: true }),
                h(UI.UTextarea, { id: 'textarea-persistent', ...modelProps('textareaPersistent'), counter: true, maxlength: '5', persistentCounter: true }),
                h(UI.UTextField, { id: 'field-counter-off', ...modelProps('fieldCounterOff'), counter: false, counterValue: 9, persistentCounter: true }, {
                    counter: ({ counter }) => h('span', { id: 'field-counter-off-slot' }, counter)
                }),
                h(UI.UTextarea, { id: 'textarea-counter-off', ...modelProps('textareaCounterOff'), counter: false, counterValue: 9, persistentCounter: true }, {
                    counter: ({ counter }) => h('span', { id: 'textarea-counter-off-slot' }, counter)
                }),
                h(UI.UTextField, { id: 'field-function-counter', ...modelProps('fieldFunction'), counter: true, maxlength: '4', counterValue: value => Array.from(value).length }, {
                    counter: ({ counter, max, value }) => h('span', { id: 'field-function-slot', 'data-max': String(max), 'data-value': String(value) }, counter + '|' + max + '|' + value)
                }),
                h(UI.UTextarea, { id: 'textarea-function-counter', ...modelProps('textareaFunction'), counter: true, maxlength: '4', counterValue: value => Array.from(value).length }, {
                    counter: ({ counter, max, value }) => h('span', { id: 'textarea-function-slot', 'data-max': String(max), 'data-value': String(value) }, counter + '|' + max + '|' + value)
                }),
                h(UI.UTextField, { id: 'field-numeric-override', ...modelProps('fieldNumericOverride'), counter: '9', counterValue: 7 }),
                h(UI.UTextarea, { id: 'textarea-numeric-override', ...modelProps('textareaNumericOverride'), counter: '9', counterValue: 7 })
            ]),
            h('section', { id: 'clear-cases' }, [
                h(UI.UTextField, { id: 'enabled-field-clear-control', ...modelProps('enabledFieldClear'), clearable: true, persistentClear: true, 'onClick:clear': event => state.clearEvents.field.push(event.type) }, { clear: clearSlot('enabled-field-clear') }),
                h(UI.UTextarea, { id: 'enabled-textarea-clear-control', ...modelProps('enabledTextareaClear'), clearable: true, persistentClear: true, 'onClick:clear': event => state.clearEvents.textarea.push(event.type) }, { clear: clearSlot('enabled-textarea-clear') }),
                h(UI.UTextField, { id: 'disabled-field-clear-control', ...modelProps('disabledFieldClear'), disabled: state.disabledField, clearable: true, persistentClear: true, 'onClick:clear': event => state.clearEvents.disabledField.push(event.type) }, { clear: clearSlot('disabled-field-clear') }),
                h(UI.UTextarea, { id: 'disabled-textarea-clear-control', ...modelProps('disabledTextareaClear'), disabled: state.disabledTextarea, clearable: true, persistentClear: true, 'onClick:clear': event => state.clearEvents.disabledTextarea.push(event.type) }, { clear: clearSlot('disabled-textarea-clear') }),
                h(UI.UTextField, { id: 'readonly-field-clear-control', ...modelProps('readonlyFieldClear'), readonly: state.readonlyField, clearable: true, persistentClear: true, 'onClick:clear': event => state.clearEvents.readonlyField.push(event.type) }, { clear: clearSlot('readonly-field-clear') }),
                h(UI.UTextarea, { id: 'readonly-textarea-clear-control', ...modelProps('readonlyTextareaClear'), readonly: state.readonlyTextarea, clearable: true, persistentClear: true, 'onClick:clear': event => state.clearEvents.readonlyTextarea.push(event.type) }, { clear: clearSlot('readonly-textarea-clear') }),
                h(UI.UTextField, { id: 'field-locale-clear', modelValue: 'clear me', clearable: true }),
                h(UI.UTextarea, { id: 'textarea-locale-clear', modelValue: 'clear me', clearable: true }),
                h(UI.UTextField, { id: 'field-loading', loading: true }),
                h(UI.UTextarea, { id: 'textarea-loading', loading: true }),
                h(UI.UTextField, resetFieldProps()),
                h(UI.UTextarea, resetTextareaProps())
            ]),
            h('section', { id: 'selection-cases' }, [
                h(UI.UAutocomplete, {
                    id: 'autocomplete-default', items, hideNoData: false,
                    modelValue: state.autocompleteValue, 'onUpdate:modelValue': value => { state.autocompleteValue = value; },
                    menu: state.autocompleteMenu, 'onUpdate:menu': value => { state.autocompleteMenu = value; }
                }),
                h(UI.UCombobox, {
                    id: 'combobox-default', items,
                    modelValue: state.comboboxValue, 'onUpdate:modelValue': value => { state.comboboxValue = value; },
                    menu: state.comboboxMenu, 'onUpdate:menu': value => { state.comboboxMenu = value; }
                }),
                h(UI.UAutocomplete, {
                    id: 'autocomplete-first', items, menu: state.firstMenu, hideNoData: false, autoSelectFirst: true,
                    'onUpdate:menu': value => { state.firstMenu = value; }
                }),
                h(UI.UCombobox, {
                    id: 'combobox-exact', items: exactItems, menu: state.exactMenu, search: state.exactSearch,
                    'onUpdate:menu': value => { state.exactMenu = value; },
                    'onUpdate:search': value => { state.exactSearch = value; },
                    modelValue: state.exactMenuValue, 'onUpdate:modelValue': value => { state.exactMenuValue = value; },
                    autoSelectFirst: 'exact'
                })
            ])
        ]);
    }
}).use(ui).mount('#app');
</script></body></html>`;

const virtualRoute = '/__input-counter-protocols';
const fixturePlugin = {
    name: 'input-counter-protocol-fixture',
    configureServer(viteServer) {
        viteServer.middlewares.use(async (request, response, next) => {
            if (request.url !== virtualRoute) { next(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await viteServer.transformIndexHtml(virtualRoute, fixture));
        });
    }
};

const server = await createServer({
    root,
    configFile: path.resolve(root, 'vite.config.js'),
    plugins: [fixturePlugin],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
    appType: 'custom',
    logLevel: 'error'
});
let browser;
const checks = [];
const failures = [];
const runtimeIssues = [];
async function verify(name, assertion) {
    try {
        await assertion();
        checks.push(name);
    } catch (error) {
        failures.push({ name, error: error instanceof Error ? error.message : String(error) });
    }
}
async function flush(page) {
    await page.evaluate(() => window.inputCounterProtocol.flush());
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function counterVisible(page, id) {
    return page.locator(`output[for="${id}"]`).evaluate(element => getComputedStyle(element).display !== 'none');
}
async function activeIndex(page, inputId) {
    return page.locator(`#${inputId}`).evaluate(element => {
        const activeId = element.getAttribute('aria-activedescendant');
        return activeId ? document.getElementById(activeId)?.getAttribute('data-index') ?? null : null;
    });
}

const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.resolve(root, file))).digest('hex')
])));

try {
    await server.listen();
    const address = server.httpServer.address();
    assert.ok(address && typeof address === 'object');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1200 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => runtimeIssues.push(`pageerror: ${error.message}`));
    page.on('console', message => {
        if (message.type() === 'error' || message.type() === 'warning') runtimeIssues.push(`${message.type()}: ${message.text()}`);
    });
    await page.goto(`http://127.0.0.1:${address.port}${virtualRoute}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.inputCounterProtocol), null, { timeout: 10000 });
    await flush(page);

    await verify('all four controls are available through the public index entry', async () => assert.deepEqual(
        await page.evaluate(() => window.inputCounterProtocol.registry),
        { UTextField: true, UTextarea: true, UAutocomplete: true, UCombobox: true }
    ));

    await verify('counter starts hidden, appears on focus, and hides after blur for both text inputs', async () => {
        assert.equal(await counterVisible(page, 'field-counter'), false);
        assert.equal(await counterVisible(page, 'textarea-counter'), false);
        await page.locator('#field-counter').focus();
        await flush(page);
        assert.equal(await counterVisible(page, 'field-counter'), true);
        await page.locator('#field-counter').evaluate(element => element.blur());
        await flush(page);
        assert.equal(await counterVisible(page, 'field-counter'), false);

        await page.locator('#textarea-counter').focus();
        await flush(page);
        assert.equal(await counterVisible(page, 'textarea-counter'), true);
        await page.locator('#textarea-counter').evaluate(element => element.blur());
        await flush(page);
        assert.equal(await counterVisible(page, 'textarea-counter'), false);
        assert.equal(await counterVisible(page, 'field-persistent'), true);
        assert.equal(await counterVisible(page, 'textarea-persistent'), true);
    });

    await verify('counter=false overrides persistentCounter, slot, and numeric counterValue', async () => {
        assert.equal(await counterVisible(page, 'field-counter-off'), false);
        assert.equal(await counterVisible(page, 'textarea-counter-off'), false);
        assert.equal(await page.locator('#field-counter-off-slot').textContent(), '9');
        assert.equal(await page.locator('#textarea-counter-off-slot').textContent(), '9');
    });

    await verify('string maxlength wins over the counter limit and the default counter slot receives counter/max/value', async () => {
        assert.equal(await page.locator('#field-counter-slot').textContent(), '3 / 5|5|3');
        assert.equal(await page.locator('#textarea-counter-slot').textContent(), '3 / 5|5|3');
        assert.equal(await page.locator('#field-counter-slot').getAttribute('data-max'), '5');
        assert.equal(await page.locator('#field-counter-slot').getAttribute('data-value'), '3');
        assert.equal(await page.locator('#textarea-counter-slot').getAttribute('data-max'), '5');
        assert.equal(await page.locator('#textarea-counter-slot').getAttribute('data-value'), '3');
        assert.equal(await page.locator('#field-function-slot').textContent(), '2 / 4|4|2');
        assert.equal(await page.locator('#textarea-function-slot').textContent(), '2 / 4|4|2');
        assert.equal(await page.locator('#field-numeric-override').locator('xpath=following::output[contains(@class,"u-input-counter")][1]').textContent(), '7 / 9');
        assert.equal(await page.locator('#textarea-numeric-override').locator('xpath=following::output[contains(@class,"ui-textarea-counter")][1]').textContent(), '7 / 9');
    });

    await verify('UTextField default slot exposes live controlRef and isFocused refs', async () => {
        assert.deepEqual(await page.evaluate(() => window.inputCounterProtocol.slot('field')), { controlRefIsRef: true, isFocusedIsRef: true, controlId: 'field-counter', focused: false });
        await page.locator('#field-counter').focus();
        await flush(page);
        assert.equal((await page.evaluate(() => window.inputCounterProtocol.slot('field'))).focused, true);
        await page.locator('#field-counter').evaluate(element => element.blur());
        await flush(page);
    });

    await verify('UTextarea default slot exposes live controlRef and isFocused refs', async () => {
        assert.deepEqual(await page.evaluate(() => window.inputCounterProtocol.slot('textarea')), { controlRefIsRef: true, isFocusedIsRef: true, controlId: 'textarea-counter', focused: false });
        await page.locator('#textarea-counter').focus();
        await flush(page);
        assert.equal((await page.evaluate(() => window.inputCounterProtocol.slot('textarea'))).focused, true);
        await page.locator('#textarea-counter').evaluate(element => element.blur());
        await flush(page);
    });

    await verify('custom clear slots clear to null, emit once, and restore control focus', async () => {
        await page.locator('#enabled-field-clear').click();
        await page.locator('#enabled-textarea-clear').click();
        await flush(page);
        const snapshot = await page.evaluate(() => ({ state: window.inputCounterProtocol.state, active: document.activeElement?.id }));
        assert.equal(snapshot.state.enabledFieldClear, null);
        assert.equal(snapshot.state.enabledTextareaClear, null);
        assert.deepEqual(snapshot.state.clearEvents.field, ['click']);
        assert.deepEqual(snapshot.state.clearEvents.textarea, ['click']);
        assert.equal(snapshot.active, 'enabled-textarea-clear-control');
    });

    await verify('disabled and readonly custom clear handlers remain guarded after the slot is hidden', async () => {
        await page.evaluate(() => {
            const state = window.inputCounterProtocol.state;
            state.disabledField = true;
            state.disabledTextarea = true;
            state.readonlyField = true;
            state.readonlyTextarea = true;
        });
        await flush(page);
        for (const id of ['disabled-field-clear', 'disabled-textarea-clear', 'readonly-field-clear', 'readonly-textarea-clear']) {
            assert.equal(await page.locator(`#${id}`).count(), 0, `${id} slot is suppressed`);
        }
        for (const name of ['disabled-field-clear', 'disabled-textarea-clear', 'readonly-field-clear', 'readonly-textarea-clear']) {
            await page.evaluate(name => window.inputCounterProtocol.invokeClear(name), name);
        }
        await flush(page);
        const state = await page.evaluate(() => window.inputCounterProtocol.state);
        assert.equal(state.disabledFieldClear, 'disabled field');
        assert.equal(state.disabledTextareaClear, 'disabled textarea');
        assert.equal(state.readonlyFieldClear, 'readonly field');
        assert.equal(state.readonlyTextareaClear, 'readonly textarea');
        assert.deepEqual(state.clearEvents.disabledField, []);
        assert.deepEqual(state.clearEvents.disabledTextarea, []);
        assert.deepEqual(state.clearEvents.readonlyField, []);
        assert.deepEqual(state.clearEvents.readonlyTextarea, []);
    });

    await verify('English locale labels clear and loading affordances, and reset writes null', async () => {
        for (const id of ['field-locale-clear', 'textarea-locale-clear']) {
            assert.equal(await page.locator(`#${id}`).locator('xpath=following::button[contains(@class,"u-input-clear")][1]').getAttribute('aria-label'), 'Clear');
        }
        for (const id of ['field-loading', 'textarea-loading']) {
            assert.equal(await page.locator(`#${id}`).locator('xpath=following::*[@role="status"][1]').getAttribute('aria-label'), 'Loading…');
        }
        await page.evaluate(() => window.inputCounterProtocol.reset());
        await flush(page);
        assert.equal(await page.evaluate(() => window.inputCounterProtocol.resetModels.field), null);
        assert.equal(await page.evaluate(() => window.inputCounterProtocol.resetModels.textarea), null);
    });

    await verify('autoSelectFirst defaults off for autocomplete and combobox, while ArrowDown/ArrowUp skip disabled entries', async () => {
        for (const [menu, input] of [['autocompleteMenu', 'autocomplete-default'], ['comboboxMenu', 'combobox-default']]) {
            await page.mouse.move(1279, 1199);
            await page.evaluate(([name]) => window.inputCounterProtocol.setMenu(name, true), [menu]);
            await flush(page);
            assert.equal(await page.locator(`#${input}`).getAttribute('aria-activedescendant'), null, `${input} has no active descendant by default`);
            await page.locator(`#${input}`).focus();
            await page.keyboard.press('ArrowDown');
            await flush(page);
            assert.equal(await activeIndex(page, input), '1', `${input} ArrowDown selects the first enabled option`);
            await page.evaluate(([name]) => window.inputCounterProtocol.setMenu(name, false), [menu]);
            await flush(page);
            await page.evaluate(([name]) => window.inputCounterProtocol.setMenu(name, true), [menu]);
            await flush(page);
            assert.equal(await page.locator(`#${input}`).getAttribute('aria-activedescendant'), null);
            await page.keyboard.press('ArrowUp');
            await flush(page);
            assert.equal(await activeIndex(page, input), '2', `${input} ArrowUp selects the last enabled option`);
        }
    });

    await verify('autoSelectFirst=true and exact select an enabled match, while exact mismatch stays inactive', async () => {
        await page.mouse.move(1200, 1100);
        await page.evaluate(() => window.inputCounterProtocol.setMenu('firstMenu', true));
        await flush(page);
        const active = await activeIndex(page, 'autocomplete-first');
        const options = await page.locator('#autocomplete-first').evaluate(input => {
            const list = input.getAttribute('aria-controls');
            return [...document.querySelectorAll(`#${CSS.escape(list ?? '')} [role="option"]`)].map(option => ({ index: option.getAttribute('data-index'), title: option.textContent, disabled: option.getAttribute('aria-disabled') }));
        });
        assert.equal(active, '1', `autoSelectFirst=true active=${active}, options=${JSON.stringify(options)}`);
        await page.evaluate(() => window.inputCounterProtocol.setMenu('exactMenu', true));
        await flush(page);
        assert.equal(await page.locator('#combobox-exact').getAttribute('aria-activedescendant'), null, 'exact mode does not activate a prefix-only match');
        await page.evaluate(() => { window.inputCounterProtocol.state.exactSearch = 'Alpha'; });
        await flush(page);
        assert.equal(await activeIndex(page, 'combobox-exact'), '0', 'exact mode activates a matching enabled option');
    });

    await verify('no Vue warnings, console errors, or page errors', async () => assert.deepEqual(runtimeIssues, []));

    const report = {
        method: 'Vite source fixture + public src/ui/index.ts + Chromium interactions',
        evidence,
        visualAcceptance: false,
        sourceSha256,
        checks,
        failures,
        runtimeIssues
    };
    await writeFile(path.join(evidence, 'result.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    assert.deepEqual(failures, [], 'input counter protocol assertions');
} finally {
    await browser?.close();
    await server.close();
}
