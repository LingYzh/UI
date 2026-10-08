import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/textarea-protocols');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html>
<html><head><meta charset="utf-8"></head><body><div id="app"></div>
<script type="module">
    import { createApp, h, nextTick, reactive, ref } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import '/src/ui/styles.css';

    const state = reactive({
        customClear: 'draft',
        customClearEvents: [],
        persistentEmpty: '',
        iconClear: 'icon draft',
        disabledValue: 'disabled value',
        disabledEvents: 0,
        readonlyValue: 'readonly value',
        readonlyEvents: 0,
        utf16: 'A😀',
        numericStringCounter: 'A😀',
        functionCounter: 'A😀',
        numericCounterValue: 'x',
        resetValue: 'reset me',
        growValue: 'line one',
        imeValue: '',
        formValue: 'valid',
        formDisabled: false,
        formReadonly: false,
        showGrow: true,
        formFocusEvents: []
    });

    const NativeResizeObserver = window.ResizeObserver;
    window.resizeObserverRecords = [];
    window.ResizeObserver = class TrackedResizeObserver extends NativeResizeObserver {
        constructor(callback) {
            super(callback);
            this.record = { observed: 0, disconnected: false };
            window.resizeObserverRecords.push(this.record);
        }
        observe(target, options) {
            this.record.observed++;
            return super.observe(target, options);
        }
        disconnect() {
            this.record.disconnected = true;
            return super.disconnect();
        }
    };

    const resetRef = ref();
    const formRef = ref();
    const formTextareaRef = ref();
    const ui = UI.createUI();
    const modelProps = (key) => ({
        modelValue: state[key],
        'onUpdate:modelValue': value => { state[key] = value; }
    });
    window.textareaProtocol = {
        state,
        registry: {
            textarea: Boolean(UI.UTextarea),
            form: Boolean(UI.UForm),
            publicEntry: typeof UI.createUI === 'function'
        },
        async flush() { await nextTick(); await nextTick(); },
        async resetTextarea() { await resetRef.value.reset(); await nextTick(); await nextTick(); },
        async validateForm() { return await formRef.value.validate(); },
        async resetForm() { await formRef.value.reset(); await nextTick(); await nextTick(); },
        exposeSnapshot() {
            return {
                focused: formTextareaRef.value?.focused,
                isPristine: formTextareaRef.value?.isPristine,
                isValidating: formTextareaRef.value?.isValidating,
                errors: formTextareaRef.value?.errors
            };
        }
    };

    createApp({
        render() {
            return h('main', [
                h('section', { id: 'clear-cases' }, [
                    h(UI.UTextarea, {
                        id: 'default-clear-disabled',
                        modelValue: 'no clear by default',
                        'aria-label': 'default clear behavior'
                    }),
                    h(UI.UTextarea, {
                        id: 'custom-clear-textarea',
                        ...modelProps('customClear'),
                        clearable: true,
                        persistentClear: true,
                        clearIcon: 'mdi-close',
                        ripple: false,
                        'onClick:clear': event => state.customClearEvents.push(event.type)
                    }, {
                        clear: ({ props }) => h('button', { ...props, id: 'custom-clear', type: 'button' }, 'Clear custom')
                    }),
                    h(UI.UTextarea, {
                        id: 'persistent-empty-textarea',
                        ...modelProps('persistentEmpty'),
                        clearable: true,
                        persistentClear: true,
                        ripple: false
                    }),
                    h(UI.UTextarea, {
                        id: 'icon-clear-textarea',
                        ...modelProps('iconClear'),
                        clearable: true,
                        clearIcon: 'mdi-close',
                        ripple: false
                    }),
                    h(UI.UTextarea, {
                        id: 'disabled-clear-textarea',
                        ...modelProps('disabledValue'),
                        disabled: true,
                        clearable: true,
                        persistentClear: true,
                        ripple: false,
                        'onClick:clear': () => { state.disabledEvents++; }
                    }),
                    h(UI.UTextarea, {
                        id: 'readonly-clear-textarea',
                        ...modelProps('readonlyValue'),
                        readonly: true,
                        clearable: true,
                        persistentClear: true,
                        ripple: false,
                        'onClick:clear': () => { state.readonlyEvents++; }
                    })
                ]),
                h('section', { id: 'counter-cases' }, [
                    h(UI.UTextarea, { id: 'utf16-counter', ...modelProps('utf16'), counter: true, maxlength: '4' }),
                    h(UI.UTextarea, { id: 'numeric-string-counter', ...modelProps('numericStringCounter'), counter: '2' }),
                    h(UI.UTextarea, {
                        id: 'function-counter',
                        ...modelProps('functionCounter'),
                        counter: true,
                        maxlength: '3',
                        counterValue: value => Array.from(value).length
                    }, {
                        counter: ({ counter, max, value }) => h('span', {
                            id: 'custom-counter-slot',
                            'data-counter': String(counter),
                            'data-max': String(max)
                        }, counter + '|' + max + '|' + value)
                    }),
                    h(UI.UTextarea, {
                        id: 'numeric-counter-value',
                        ...modelProps('numericCounterValue'),
                        counter: '5',
                        counterValue: 7
                    }),
                    h(UI.UTextarea, { id: 'value-only-counter', modelValue: 'value only', counterValue: 9 }),
                    h(UI.UTextarea, { id: 'slot-only-counter', modelValue: 'slot only' }, {
                        counter: ({ counter, max, value }) => h('span', {
                            id: 'slot-only-counter-content',
                            'data-max': String(max),
                            'data-value': String(value)
                        }, counter)
                    })
                ]),
                h('section', { id: 'loader-cases' }, [
                    h(UI.UTextarea, { id: 'default-loader', loading: true }),
                    h(UI.UTextarea, { id: 'custom-loader', loading: true }, {
                        loader: () => h('span', { id: 'custom-loader-slot', role: 'status' }, 'Waiting')
                    })
                ]),
                h('section', { id: 'reset-case' }, [
                    h(UI.UTextarea, { id: 'reset-textarea', ref: resetRef, ...modelProps('resetValue') })
                ]),
                h('section', { id: 'grow-host' }, [
                    state.showGrow ? h(UI.UTextarea, {
                        id: 'grow-textarea',
                        ...modelProps('growValue'),
                        width: 320,
                        autoGrow: true,
                        rows: 2,
                        maxRows: 3,
                        noResize: true,
                        counter: true,
                        clearable: true,
                        ripple: false
                    }) : null,
                    h(UI.UTextarea, { id: 'ime-textarea', ...modelProps('imeValue'), counter: true })
                ]),
                h(UI.UForm, { id: 'textarea-form', ref: formRef, validateOn: 'input' }, {
                    default: () => [
                        h(UI.UTextarea, {
                            id: 'form-textarea',
                            ref: formTextareaRef,
                            name: 'form-notes',
                            label: 'Notes',
                            hint: 'Inherited form control',
                            modelValue: state.formValue,
                            'onUpdate:modelValue': value => { state.formValue = value; },
                            'onUpdate:focused': value => state.formFocusEvents.push(value),
                            rules: [value => Boolean(value) || 'Text required']
                        }),
                        h(UI.UTextarea, {
                            id: 'form-disabled-textarea',
                            name: 'disabled-notes',
                            modelValue: 'locked',
                            disabled: state.formDisabled
                        }),
                        h(UI.UTextarea, {
                            id: 'form-readonly-textarea',
                            name: 'readonly-notes',
                            modelValue: 'fixed',
                            readonly: state.formReadonly
                        })
                    ]
                })
            ]);
        }
    }).use(ui).mount('#app');
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
    resolve: { dedupe: ['vue'] },
    server: {
        host: '127.0.0.1',
        port: 0,
        hmr: false,
        watch: { ignored: ['**/artifacts/**'] }
    },
    plugins: [{
        name: 'textarea-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__textarea-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__textarea-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/UiTextarea.vue',
    'src/ui/UiInput.vue',
    'src/ui/form.ts',
    'src/ui/defaults.ts',
    'src/ui/ripple.ts',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));

await server.listen();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
const errors = [];
const checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
});

async function flush() {
    await page.evaluate(() => window.textareaProtocol.flush());
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

try {
    await page.goto(server.resolvedUrls.local[0] + '__textarea-protocols');
    await page.waitForFunction(() => Boolean(window.textareaProtocol));
    await flush();

    assert.deepEqual(await page.evaluate(() => window.textareaProtocol.registry), {
        textarea: true,
        form: true,
        publicEntry: true
    });
    assert.equal(await page.locator('#default-clear-disabled').locator('xpath=following-sibling::button[contains(@class,"u-input-clear")]').count(), 0, 'clearable defaults to false');
    assert.equal(await page.locator('#custom-clear').count(), 1, 'clear slot renders when clearable and persistent');
    await page.locator('#custom-clear').click();
    await flush();
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.customClear), null, 'clear writes null to the string model');
    assert.deepEqual(await page.evaluate(() => window.textareaProtocol.state.customClearEvents), ['click'], 'custom clear slot receives an onClick handler and emits click:clear');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'custom-clear-textarea', 'clear restores focus to the textarea');
    assert.equal(await page.locator('#custom-clear-textarea').evaluate(element => element.parentElement?.classList.contains('ui-textarea-field')), true, 'action state wraps the textarea in a positioning container');
    assert.equal(await page.locator('#persistent-empty-textarea').locator('xpath=following-sibling::button[contains(@class,"u-input-clear")]').count(), 1, 'persistentClear keeps the button visible for an empty value');
    const iconClear = page.locator('#icon-clear-textarea').locator('xpath=following-sibling::button[contains(@class,"u-input-clear")]');
    assert.equal(await iconClear.locator('svg').count(), 1, 'explicit clearIcon uses the shared Icon component');
    assert.equal(await iconClear.textContent(), '', 'icon clear button does not add the native × text');
    for (const id of ['disabled-clear-textarea', 'readonly-clear-textarea']) {
        assert.equal(await page.locator('#' + id).locator('xpath=following-sibling::button[contains(@class,"u-input-clear")]').count(), 0, id + ' suppresses clear actions');
    }
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.disabledValue), 'disabled value');
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.readonlyValue), 'readonly value');
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.disabledEvents + window.textareaProtocol.state.readonlyEvents), 0);
    checks.push('clear defaults, persistent/custom/icon slots, null model, refocus, and disabled/readonly guards');

    const utf16Counter = page.locator('#utf16-counter').locator('xpath=following-sibling::output');
    const numericStringCounter = page.locator('#numeric-string-counter').locator('xpath=following-sibling::output');
    assert.equal(await utf16Counter.textContent(), '3 / 4', 'default count remains JavaScript UTF-16 length');
    assert.equal(await numericStringCounter.textContent(), '3 / 2', 'numeric counter strings become their limit');
    assert.ok(await numericStringCounter.evaluate(element => element.classList.contains('is-over-limit')));
    assert.equal(await page.locator('#custom-counter-slot').textContent(), '2 / 3|3|2', 'counterValue function and standard counter slot receive formatted count, limit and numeric value');
    assert.equal(await page.locator('#custom-counter-slot').getAttribute('data-counter'), '2 / 3');
    assert.equal(await page.locator('#custom-counter-slot').getAttribute('data-max'), '3');
    const numericValueCounter = page.locator('#numeric-counter-value').locator('xpath=following-sibling::output');
    assert.equal(await numericValueCounter.textContent(), '7 / 5', 'numeric counterValue is consumed');
    assert.ok(await numericValueCounter.evaluate(element => element.classList.contains('is-over-limit')));
    assert.equal(await page.locator('#value-only-counter').locator('xpath=following-sibling::output').textContent(), '9', 'counterValue alone enables the counter');
    assert.equal(await page.locator('#slot-only-counter-content').textContent(), '9', 'counter slot alone enables the counter');
    assert.equal(await page.locator('#slot-only-counter-content').getAttribute('data-value'), '9', 'standard counter slot value is numeric');
    assert.equal(await page.locator('#slot-only-counter-content').getAttribute('data-max'), 'undefined');
    checks.push('maxlength strings, numeric counter strings, UTF-16 default, number/function counterValue and standard slot scopes');

    assert.equal(await page.locator('#default-loader').locator('xpath=following-sibling::span[contains(@class,"u-input-loading")]').count(), 1, 'loading renders the default loader');
    assert.equal(await page.locator('#custom-loader-slot').textContent(), 'Waiting', 'loader slot replaces the default loader');
    assert.ok(await page.locator('#custom-loader-slot').evaluate(element => Boolean(element.closest('.ui-textarea-field'))));
    checks.push('default loader and scoped loader slot are mounted in the action container');

    await page.evaluate(() => window.textareaProtocol.resetTextarea());
    await flush();
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.resetValue), null, 'component reset preserves the approved null model');
    checks.push('component reset writes null');

    const grow = page.locator('#grow-textarea');
    await grow.fill('line one\nline two\nline three\nline four\nline five\nline six\nline seven\nline eight');
    await flush();
    const growBeforeClear = await grow.evaluate(element => {
        const style = getComputedStyle(element);
        const line = parseFloat(style.lineHeight);
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        return {
            width: element.getBoundingClientRect().width,
            height: element.getBoundingClientRect().height,
            maximum: 3 * line + padding + border,
            minimum: 2 * line + padding + border,
            rows: element.rows,
            noResize: element.classList.contains('has-no-resize')
        };
    });
    assert.ok(Math.abs(growBeforeClear.width - 320) < 2, JSON.stringify(growBeforeClear));
    assert.ok(growBeforeClear.height <= growBeforeClear.maximum + 1, JSON.stringify(growBeforeClear));
    assert.ok(growBeforeClear.height >= growBeforeClear.minimum - 1, JSON.stringify(growBeforeClear));
    assert.equal(growBeforeClear.rows, 2);
    assert.equal(growBeforeClear.noResize, true);
    await page.locator('#grow-textarea').focus();
    await grow.locator('xpath=following-sibling::button[contains(@class,"u-input-clear")]').click();
    await flush();
    const growAfterClear = await grow.evaluate(element => ({
        height: element.getBoundingClientRect().height,
        value: element.value,
        focused: document.activeElement === element
    }));
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.growValue), null);
    assert.equal(growAfterClear.value, '');
    assert.equal(growAfterClear.focused, true);
    assert.ok(growAfterClear.height <= growBeforeClear.height, JSON.stringify({ growBeforeClear, growAfterClear }));
    checks.push('autoGrow respects width, rows/maxRows/noResize and recalculates after clear');

    const ime = page.locator('#ime-textarea');
    await ime.evaluate(element => {
        element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' }));
        element.value = '漢';
        element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', data: '漢' }));
    });
    await flush();
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.imeValue), '', 'composition input stays out of the model until composition ends');
    await ime.evaluate(element => element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '漢' })));
    await flush();
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.imeValue), '漢');
    assert.equal(await ime.locator('xpath=following-sibling::output').textContent(), '1');
    checks.push('native IME composition commits once and then updates the counter');

    const formTextarea = page.locator('#form-textarea');
    assert.equal(await formTextarea.getAttribute('name'), 'form-notes');
    await formTextarea.focus();
    await formTextarea.blur();
    await flush();
    assert.deepEqual((await page.evaluate(() => window.textareaProtocol.state.formFocusEvents)).slice(0, 2), [true, false]);
    assert.equal(await page.evaluate(() => window.textareaProtocol.exposeSnapshot()).then(snapshot => snapshot.focused), false);
    await page.evaluate(() => { window.textareaProtocol.state.formValue = ''; });
    await flush();
    await page.evaluate(() => window.textareaProtocol.validateForm());
    await flush();
    assert.match(await formTextarea.getAttribute('aria-invalid') ?? '', /true/);
    const exposed = await page.evaluate(() => window.textareaProtocol.exposeSnapshot());
    assert.equal(exposed.isPristine, false);
    assert.ok(Array.isArray(exposed.errors));
    await page.evaluate(() => { window.textareaProtocol.state.formDisabled = true; window.textareaProtocol.state.formReadonly = true; });
    await flush();
    assert.equal(await page.locator('#form-disabled-textarea').isDisabled(), true);
    assert.equal(await page.locator('#form-readonly-textarea').getAttribute('readonly'), '');
    await page.evaluate(() => window.textareaProtocol.resetForm());
    await flush();
    assert.equal(await page.evaluate(() => window.textareaProtocol.state.formValue), null, 'form reset also preserves null reset semantics');
    checks.push('public form name, focus events/exposed state, validation, inherited disabled/readonly and reset');

    await page.evaluate(() => { window.textareaProtocol.state.showGrow = false; });
    await flush();
    const observerRecords = await page.evaluate(() => window.resizeObserverRecords);
    assert.ok(observerRecords.some(record => record.observed > 0 && record.disconnected), JSON.stringify(observerRecords));
    checks.push('ResizeObserver is disconnected when the auto-growing textarea unmounts');

    assert.deepEqual(errors, [], 'no page errors, console errors, or Vue warnings');
    const report = {
        method: 'Vite source fixture + public src/ui/index.ts + Chromium interactions',
        evidence,
        visualAcceptance: false,
        sourceSha256,
        checks,
        errors
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    process.stdout.write(JSON.stringify({ checks, evidence, sourceSha256 }, null, 2));
} catch (error) {
    const report = {
        method: 'Vite source fixture + public src/ui/index.ts + Chromium interactions',
        evidence,
        visualAcceptance: false,
        sourceSha256,
        checks,
        errors,
        failure: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    throw error;
} finally {
    await browser.close();
    await server.close();
}
