import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/checkbox-option-picker-protocols');
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
    import { createApp, h, nextTick, reactive } from 'vue';
    import * as UI from '/src/ui/index.ts';

    const state = reactive({
        limited: [{ id: 'alpha' }],
        multiple: [],
        disabled: [],
        readonly: [],
        standalone: false,
        option: ['LOCKED'],
        optionClicks: 0,
        defaultObject: { id: 'same' },
        comparedObject: { id: 'same' }
    });
    const options = [
        { id: 'locked', title: 'Locked option', blocked: true, props: { onClick: () => state.optionClicks++ } },
        { id: 'ready', title: 'Ready option', blocked: false, props: { onClick: () => state.optionClicks++, 'data-item-prop': 'preserved' } }
    ];
    const defaultObjectItems = [{ title: 'Object identity', value: { id: 'same' } }];
    const comparedObjectItems = [{ title: 'Object comparator', value: { id: 'same' } }];

    window.selectionConsumerProtocol = {
        state,
        registry: {
            checkboxGroup: Boolean(UI.UCheckboxGroup),
            checkbox: Boolean(UI.UCheckbox),
            optionPicker: Boolean(UI.UOptionPicker)
        },
        async flush() { await nextTick(); await nextTick(); }
    };

    createApp({
        render() {
            return h('main', [
                h(UI.UCheckboxGroup, {
                    id: 'limited-group', name: 'permissions', mandatory: true, max: 1,
                    valueComparator: (left, right) => left?.id === right?.id,
                    modelValue: state.limited,
                    'onUpdate:modelValue': value => state.limited = value
                }, { default: () => [
                    h(UI.UCheckbox, { id: 'limited-alpha', value: { id: 'alpha' } }, { default: () => 'Alpha' }),
                    h(UI.UCheckbox, { id: 'limited-beta', value: { id: 'beta' } }, { default: () => 'Beta' })
                ] }),
                h(UI.UCheckboxGroup, {
                    id: 'multiple-group', name: 'multiple-permissions', max: 2,
                    modelValue: state.multiple,
                    'onUpdate:modelValue': value => state.multiple = value
                }, { default: () => [
                    h(UI.UCheckbox, { id: 'multiple-one', value: 'one' }, { default: () => 'One' }),
                    h(UI.UCheckbox, { id: 'multiple-two', value: 'two' }, { default: () => 'Two' })
                ] }),
                h(UI.UCheckboxGroup, {
                    id: 'disabled-group', name: 'disabled-permissions', disabled: true,
                    modelValue: state.disabled,
                    'onUpdate:modelValue': value => state.disabled = value
                }, { default: () => h(UI.UCheckbox, { id: 'disabled-child', value: 'blocked' }, { default: () => 'Disabled child' }) }),
                h(UI.UCheckboxGroup, {
                    id: 'readonly-group', name: 'readonly-permissions', readonly: true,
                    modelValue: state.readonly,
                    'onUpdate:modelValue': value => state.readonly = value
                }, { default: () => h(UI.UCheckbox, { id: 'readonly-child', value: 'locked' }, { default: () => 'Readonly child' }) }),
                h(UI.UCheckbox, {
                    id: 'standalone-checkbox', indeterminate: true,
                    modelValue: state.standalone,
                    'onUpdate:modelValue': value => state.standalone = value
                }, { default: () => 'Standalone checkbox' }),
                h(UI.UOptionPicker, {
                    id: 'option-picker', items: options, itemTitle: 'title', itemValue: 'id', itemDisabled: 'blocked',
                    multiple: true, modelValue: state.option,
                    valueComparator: (left, right) => String(left).toLowerCase() === String(right).toLowerCase(),
                    'onUpdate:modelValue': value => state.option = value
                }, {
                    item: ({ item, selected, disabled, props }) => h('span', {
                        'data-option-id': item.id,
                        'data-selected': String(selected),
                        'data-disabled': String(disabled),
                        'data-has-onclick': String(typeof props.onClick === 'function')
                    }, item.title),
                    default: ({ choose }) => h('button', {
                        id: 'choose-disabled-option',
                        onClick: () => choose(options[0])
                    }, 'Choose disabled option programmatically')
                }),
                h(UI.UOptionPicker, {
                    id: 'default-object-picker', items: defaultObjectItems, itemValue: 'value',
                    modelValue: state.defaultObject
                }),
                h(UI.UOptionPicker, {
                    id: 'compared-object-picker', items: comparedObjectItems, itemValue: 'value',
                    modelValue: state.comparedObject,
                    valueComparator: (left, right) => left?.id === right?.id
                })
            ]);
        }
    }).mount('#app');
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
        name: 'checkbox-option-picker-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__checkbox-option-picker-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__checkbox-option-picker-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = [
    'src/ui/UCheckboxGroup.vue',
    'src/ui/UiCheckbox.vue',
    'src/ui/USelectionControlGroup.vue',
    'src/ui/USelectionControl.vue',
    'src/ui/UOptionPicker.vue',
    'src/ui/selection-context.ts',
    'src/ui/index.ts'
];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));

await server.listen();
const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + '__checkbox-option-picker-protocols'
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
const errors = [];
const report = {
    method: 'Vite source fixture + public src/ui/index.ts + Electron DOM interactions',
    evidence,
    sourceSha256,
    checks: {},
    errors
};

async function flush() {
    await page.evaluate(() => window.selectionConsumerProtocol.flush());
}

async function setChecked(id, checked) {
    await page.locator(`#${id}`).evaluate((input, value) => {
        input.checked = value;
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }, checked);
    await flush();
}

async function state() {
    return page.evaluate(() => ({ ...window.selectionConsumerProtocol.state }));
}

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.selectionConsumerProtocol));
    assert.deepEqual(await page.evaluate(() => window.selectionConsumerProtocol.registry), {
        checkboxGroup: true,
        checkbox: true,
        optionPicker: true
    });

    assert.equal(await page.locator('#limited-alpha').isChecked(), true, 'checkbox group comparator matches equivalent object values');
    assert.equal(await page.locator('#limited-beta').getAttribute('name'), 'permissions', 'group name reaches each checkbox input');
    await setChecked('limited-beta', true);
    assert.deepEqual((await state()).limited, [{ id: 'alpha' }], 'max blocks an additional group value');
    assert.equal(await page.locator('#limited-beta').isChecked(), false, 'a rejected max change restores the input state');
    await setChecked('limited-alpha', false);
    assert.deepEqual((await state()).limited, [{ id: 'alpha' }], 'mandatory preserves the final selection');
    assert.equal(await page.locator('#limited-alpha').isChecked(), true, 'a rejected mandatory change restores the input state');

    await setChecked('multiple-one', true);
    await setChecked('multiple-two', true);
    assert.deepEqual((await state()).multiple, ['one', 'two'], 'group multiple mode binds the group model');
    assert.equal(await page.locator('#multiple-one').getAttribute('name'), 'multiple-permissions');
    assert.equal(await page.locator('#multiple-one').getAttribute('value'), 'one', 'group option value reaches the native control');

    assert.equal(await page.locator('#disabled-child').isDisabled(), true, 'group disabled state reaches child controls');
    await setChecked('disabled-child', true);
    assert.deepEqual((await state()).disabled, [], 'disabled group controls reject updates');
    assert.equal(await page.locator('#readonly-child').getAttribute('aria-readonly'), 'true', 'group readonly state reaches child controls');
    await setChecked('readonly-child', true);
    assert.deepEqual((await state()).readonly, [], 'readonly group controls reject updates');

    assert.equal(await page.locator('#standalone-checkbox').isChecked(), false, 'an independent checkbox keeps its false default');
    assert.equal(await page.locator('#standalone-checkbox').evaluate(input => input.indeterminate), true, 'indeterminate remains a DOM property');
    await setChecked('standalone-checkbox', true);
    assert.equal((await state()).standalone, true, 'independent checkbox model updates remain intact');
    report.checks.checkboxGroup = {
        limited: (await state()).limited,
        multiple: (await state()).multiple,
        disabled: (await state()).disabled,
        readonly: (await state()).readonly,
        standalone: (await state()).standalone
    };

    const lockedOption = page.locator('#option-picker [role="option"]').nth(0);
    const readyOption = page.locator('#option-picker [role="option"]').nth(1);
    assert.equal(await lockedOption.isDisabled(), true, 'itemDisabled path disables its option');
    assert.equal(await lockedOption.getAttribute('aria-disabled'), 'true');
    assert.equal(await page.locator('[data-option-id="locked"]').getAttribute('data-disabled'), 'true', 'item slot receives disabled');
    assert.equal(await page.locator('[data-option-id="locked"]').getAttribute('data-has-onclick'), 'true', 'item slot receives props including onClick');
    assert.equal(await lockedOption.getAttribute('aria-selected'), 'true', 'a disabled option can still reflect an externally supplied model value');
    await page.locator('#choose-disabled-option').click();
    assert.deepEqual((await state()).option, ['LOCKED'], 'choose rejects a disabled item without changing its selected model value');
    assert.equal((await state()).optionClicks, 0, 'choosing a disabled item does not run its item click handler');
    assert.equal(await readyOption.getAttribute('data-item-prop'), 'preserved', 'item props are forwarded to the option element');
    await readyOption.click();
    assert.deepEqual((await state()).option, ['LOCKED', 'ready'], 'valueComparator is used when toggling multiple values');
    assert.equal((await state()).optionClicks, 1, 'item props.onClick coexists with the picker choice handler');

    assert.equal(await page.locator('#default-object-picker [role="option"]').getAttribute('aria-selected'), 'false', 'the existing Object.is default remains identity-based');
    assert.equal(await page.locator('#compared-object-picker [role="option"]').getAttribute('aria-selected'), 'true', 'valueComparator opts into structural object matching');
    report.checks.optionPicker = {
        model: (await state()).option,
        itemClickCount: (await state()).optionClicks,
        disabled: await lockedOption.getAttribute('aria-disabled'),
        defaultObjectSelected: await page.locator('#default-object-picker [role="option"]').getAttribute('aria-selected'),
        comparedObjectSelected: await page.locator('#compared-object-picker [role="option"]').getAttribute('aria-selected')
    };

    assert.deepEqual(errors, [], 'selection consumer fixture should have no page errors or Vue warnings');
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? error.stack : String(error);
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
