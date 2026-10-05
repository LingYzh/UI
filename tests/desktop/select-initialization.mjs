import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'select-initialization-'));
await writeFile(path.join(evidence, 'index.html'), '<html data-theme="light"><head><link rel="stylesheet" href="/src/ui/styles.css"></head><body><div id="app"></div><script type="module" src="./fixture.js"></script></body></html>');
await writeFile(path.join(evidence, 'fixture.js'), `
import { createApp, defineComponent, h, ref, watch } from 'vue';
import { UiDialog, UiField, UiSelect, UiButton, UiScrollArea } from '/src/ui/index.ts';
const App = defineComponent({
    setup() {
        const open = ref(false);
        const values = ref({});
        const fields = Array.from({length: 8}, (_, index) => '能力 ' + index);
        watch(open, value => { if (value) values.value = Object.fromEntries(fields.map(name => [name, 'inherit'])); });
        const option = (value, label) => h('option', {value}, label);
        return () => h('div', [
            h(UiDialog, {open: true, scrollable: true, 'aria-label': '设置'}, {
                header: () => h('h2', '设置'),
                default: () => h(UiScrollArea, {label: '模型目录', maxHeight: '180px'}, {
                    default: () => h(UiButton, {onClick: () => { open.value = true; }}, () => '编辑能力')
                })
            }),
            h(UiDialog, {open: open.value, scrollable: true, 'aria-label': '能力设置', 'onUpdate:open': value => { open.value = value; }}, {
                header: () => h('h2', '能力设置'),
                default: () => fields.map((name, index) => h(UiField, {key: name, label: name, for: 'ability-' + index, description: '使用接口声明或手动设置'}, {
                    default: ({controlAttrs}) => h(UiSelect, {...controlAttrs, modelValue: values.value[name], 'onUpdate:modelValue': value => { values.value[name] = value; }}, {
                        default: () => [option('inherit', '使用接口声明'), option('true', '支持'), option('false', '不支持')]
                    })
                })),
                footer: () => h(UiButton, {onClick: () => { open.value = false; }}, () => '关闭能力设置')
            })
        ]);
    }
});
createApp(App).mount('#app');
`);
const server = await createServer({ server: { host: '127.0.0.1', port: 0, strictPort: false } });
await server.listen();
const fixtureUrl = server.resolvedUrls.local[0] + path.relative(process.cwd(), path.join(evidence, 'index.html')).replaceAll('\\', '/');
const env = { ...process.env, UAH_UI_PREVIEW_URL: fixtureUrl, UAH_DATA_DIR: path.join(evidence, 'profile') };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env, timeout: 5000 });
const errors = [];
const watchdog = setTimeout(() => {
    console.error('Nested select initialization exceeded the test deadline');
    void app.evaluate(({ app }) => app.exit(1)).catch(() => {});
}, 20000);
try {
    const page = await app.firstWindow({ timeout: 5000 });
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    const parent = page.getByRole('dialog', { name: '设置', exact: true });
    const child = page.getByRole('dialog', { name: '能力设置', exact: true });
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        await parent.getByRole('button', { name: '编辑能力', exact: true }).click();
        await child.waitFor();
        assert.equal(await child.getByRole('combobox').count(), 8);
        for (const select of await child.getByRole('combobox').all()) assert.equal(await select.inputValue(), 'inherit');
        const first = child.getByRole('combobox', { name: '能力 0', exact: true });
        await first.selectOption('true');
        assert.equal(await first.inputValue(), 'true');
        await child.evaluate(async element => {
            await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})));
        });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const capture = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toPNG().toString('base64'));
        await writeFile(path.join(evidence, theme + '.png'), Buffer.from(capture, 'base64'));
        await child.getByRole('button', { name: '关闭能力设置', exact: true }).click();
        await child.waitFor({ state: 'hidden' });
        assert.equal(await parent.isVisible(), true);
    }
    assert.deepEqual(errors, []);
    console.log('PASS hidden selects initialize inside nested dialogs, remain responsive, select and reopen without observer update loops');
    console.log('Evidence: ' + evidence);
} finally {
    clearTimeout(watchdog);
    await app.close();
    await server.close();
}
