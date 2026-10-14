import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const browserFixture = String.raw`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/src/ui/styles.css"><title>Tree select form behavior fixture</title></head>
<body>
    <div id="app"></div>
    <script type="module">
        import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';
        import UiForm from '/src/ui/UiForm.vue';
        import UTreeSelect from '/src/ui/UTreeSelect.vue';
        import { createUI } from '/src/ui/plugin.ts';

        const items = [
            { title: 'Engineering', value: 'engineering', children: [
                { title: 'Platform', value: 'platform' },
                { title: 'Mobile', value: 'mobile' }
            ] },
            { title: 'Sales', value: 'sales', children: [
                { title: 'Domestic', value: 'domestic' }
            ] },
            { title: 'Support', value: 'support', children: [
                { title: 'Training', value: 'training' }
            ] }
        ];
        const state = reactive({ model: null, readonly: false, disabled: false, selectStrategy: undefined });
        const field = ref(null);
        const form = ref(null);
        window.treeSelectFixture = {
            getModel() { return state.model; },
            async setReadonly(value) { state.readonly = value; await nextTick(); },
            async setDisabled(value) { state.disabled = value; await nextTick(); },
            async setSelectStrategy(value) { state.selectStrategy = value; await nextTick(); },
            async validate() { return await field.value.validate(); },
            async resetForm() { await form.value.reset(); await nextTick(); }
        };

        const Host = defineComponent({
            setup() {
                return () => h(UiForm, { ref: form, resetMode: 'empty' }, {
                    default: () => h(UTreeSelect, {
                        ref: field,
                        name: 'departments',
                        label: 'Departments',
                        required: true,
                        clearable: true,
                        multiple: true,
                        items,
                        selectStrategy: state.selectStrategy,
                        modelValue: state.model,
                        'onUpdate:modelValue': value => state.model = value,
                        readonly: state.readonly,
                        disabled: state.disabled
                    })
                });
            }
        });

        createApp(Host).use(createUI({ locale: { locale: 'en' } })).mount('#app');
    </script>
</body>
</html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: 'node_modules/.vite-tree-select-form-test',
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
        name: 'tree-select-form-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url?.split('?')[0] !== '/__tree-select-form') {
                    next();
                    return;
                }
                try {
                    response.setHeader('Content-Type', 'text/html; charset=utf-8');
                    response.end(await viteServer.transformIndexHtml('/__tree-select-form', browserFixture));
                } catch (error) {
                    next(error);
                }
            });
        }
    }]
});

let browser;
let context;
const errors = [];
try {
    await server.listen();
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    context = await browser.newContext({ viewport: { width: 900, height: 700 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
    });
    const baseUrl = server.resolvedUrls?.local[0];
    assert.ok(baseUrl, 'Vite should expose a local fixture URL');
    await page.goto(`${baseUrl}__tree-select-form`, { waitUntil: 'domcontentloaded' });

    const trigger = page.getByRole('combobox', { name: 'Departments' });
    async function ensureExpanded(title) {
        const item = tree.locator('.ui-treeview-item').filter({ hasText: title });
        if (await item.getAttribute('aria-expanded') !== 'true') await item.locator('.ui-treeview-toggle').click();
    }
    async function waitForModel(expected) {
        await page.waitForFunction(value => JSON.stringify(window.treeSelectFixture.getModel()) === JSON.stringify(value), expected);
    }
    async function waitForChecked(selector, checked) {
        await page.waitForFunction(({ inputSelector, value }) => document.querySelector(inputSelector)?.checked === value, { inputSelector: selector, value: checked });
    }

    await trigger.waitFor({ state: 'visible' });
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), [], 'multiple mode normalizes an empty scalar model to an array');
    assert.equal(await trigger.getAttribute('aria-required'), 'true');
    assert.ok((await page.evaluate(() => window.treeSelectFixture.validate())).length > 0, 'required rejects the initial empty array');

    await trigger.click();
    const tree = page.getByRole('tree');
    await tree.waitFor({ state: 'visible' });
    assert.equal(await tree.getAttribute('aria-multiselectable'), 'true');
    await ensureExpanded('Support');

    const engineering = tree.locator('input[type="checkbox"][aria-label="Engineering"]');
    const sales = tree.locator('input[type="checkbox"][aria-label="Sales"]');
    await engineering.click({ force: true });
    await waitForModel(['engineering']);
    await waitForChecked('input[type="checkbox"][aria-label="Engineering"]', true);
    assert.equal(await engineering.isChecked(), true);
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), ['engineering']);
    assert.equal(await sales.isChecked(), false, 'selecting a department does not select its same-level sibling');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true', 'multiple selection leaves the menu open');
    await ensureExpanded('Engineering');
    const platform = tree.locator('input[type="checkbox"][aria-label="Platform"]');
    assert.equal(await platform.isChecked(), false, 'independent strategy does not select descendants with a parent');
    await platform.click({ force: true });
    await waitForModel(['engineering', 'platform']);
    await waitForChecked('input[type="checkbox"][aria-label="Platform"]', true);
    assert.equal(await platform.isChecked(), true);
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), ['engineering', 'platform']);
    await platform.click({ force: true });
    await waitForModel(['engineering']);
    await waitForChecked('input[type="checkbox"][aria-label="Platform"]', false);
    assert.equal(await platform.isChecked(), false);
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), ['engineering'], 'toggling one selected value off preserves its independent sibling');
    await platform.click({ force: true });
    await waitForModel(['engineering', 'platform']);
    await waitForChecked('input[type="checkbox"][aria-label="Platform"]', true);
    assert.equal(await platform.isChecked(), true);
    await ensureExpanded('Sales');
    const domestic = tree.locator('input[type="checkbox"][aria-label="Domestic"]');
    await domestic.click({ force: true });
    await waitForModel(['engineering', 'platform', 'domestic']);
    await waitForChecked('input[type="checkbox"][aria-label="Domestic"]', true);
    assert.equal(await domestic.isChecked(), true);
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), ['engineering', 'platform', 'domestic']);
    assert.equal(await page.locator('.ui-tree-select-value').textContent(), 'Engineering、Platform、Domestic');
    await trigger.click();
    await tree.waitFor({ state: 'detached' });
    await trigger.click();
    await tree.waitFor({ state: 'visible' });
    for (const title of ['Engineering', 'Sales', 'Support']) {
        assert.equal(await tree.locator('.ui-treeview-item').filter({ hasText: title }).getAttribute('aria-expanded'), 'true', `${title} stays open across multiple selected ancestors and a manual open`);
    }
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.validate()), [], 'a nonempty multiple value passes required validation');

    await page.locator('.ui-tree-select-clear').click();
    await waitForModel([]);
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), [], 'clear emits an empty array in multiple mode');
    await tree.waitFor({ state: 'detached' });
    assert.ok((await page.evaluate(() => window.treeSelectFixture.validate())).length > 0, 'required rejects an empty array after clearing');

    await page.evaluate(() => window.treeSelectFixture.setSelectStrategy('legacy-cascade'));
    await trigger.click();
    await tree.waitFor({ state: 'visible' });
    await engineering.click({ force: true });
    await page.waitForFunction(() => {
        const model = window.treeSelectFixture.getModel();
        return ['engineering', 'platform', 'mobile'].every(value => model.includes(value));
    });
    assert.deepEqual(
        new Set(await page.evaluate(() => window.treeSelectFixture.getModel())),
        new Set(['engineering', 'platform', 'mobile']),
        'an explicit UTreeview strategy overrides the default independent strategy'
    );

    const beforeReadonly = await page.evaluate(() => window.treeSelectFixture.getModel());
    await page.evaluate(() => window.treeSelectFixture.setReadonly(true));
    await tree.waitFor({ state: 'detached' });
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), beforeReadonly, 'dynamic readonly closes the menu without writing');
    assert.equal(await trigger.getAttribute('aria-readonly'), 'true');
    assert.equal(await page.locator('.ui-tree-select-clear').count(), 0, 'readonly hides the clear action');
    await trigger.click();
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'readonly prevents reopening the menu');

    await page.evaluate(() => window.treeSelectFixture.setReadonly(false));
    await page.evaluate(() => window.treeSelectFixture.setDisabled(true));
    assert.equal(await trigger.isDisabled(), true);
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), beforeReadonly, 'disabled state preserves the model');
    await page.evaluate(() => window.treeSelectFixture.setDisabled(false));
    await page.evaluate(() => window.treeSelectFixture.resetForm());
    assert.deepEqual(await page.evaluate(() => window.treeSelectFixture.getModel()), [], 'form reset preserves the multiple array model');
    assert.deepEqual(errors, [], 'the real component interaction should not log browser errors');
    console.log('tree-select multiple form behavior: passed');
} finally {
    await context?.close();
    await browser?.close();
    await server.close();
}
