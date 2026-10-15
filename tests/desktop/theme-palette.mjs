import { chromium } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const evidence = path.resolve('artifacts/theme-palette');
await mkdir(evidence, { recursive: true });
// Use real components without compiling the entire documentation application.
const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#app{height:auto;overflow:visible}</style></head><body><div id="app"></div><script type="module">
    import { createApp, h, ref } from 'vue';
    import UButton from '/src/ui/UiButton.vue';
    import USwitch from '/src/ui/UiSwitch.vue';
    import UTextField from '/src/ui/UiInput.vue';
    import USelect from '/src/ui/UiSelect.vue';
    import UDataTableServer from '/src/ui/UiDataTableServer.vue';
    import UToolbar from '/src/ui/UToolbar.vue';
    import USnackbar from '/src/ui/USnackbar.vue';
    import UCheckbox from '/src/ui/UiCheckbox.vue';
    import URadio from '/src/ui/UiRadio.vue';
    import UChip from '/src/ui/UChip.vue';
    import UAvatar from '/src/ui/UAvatar.vue';
    import UBadge from '/src/ui/UBadge.vue';
    import USheet from '/src/ui/USheet.vue';
    import UPicker from '/src/ui/UPicker.vue';
    import UHotkey from '/src/ui/UHotkey.vue';
    import UField from '/src/ui/UField.vue';
    import UiTooltip from '/src/ui/UiTooltip.vue';
    import Icon from '/src/components/Icon.vue';
    import { createUiTheme } from '/src/ui/theme.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';
    const theme = createUiTheme({ transition: false, themes: { ocean: { colors: { primary: '#246a91' } }, pale: { colors: { primary: '#ffeeba' } } } });
    const enabled = ref(true);
    window.palette = { theme };
    createApp({ setup() { return () => h('main', { style: 'padding:24px;max-width:1080px;margin:auto;display:grid;gap:24px' }, [
        h('header', [h('h1', '主题配色 · 陶土色与暖白'), h('p', { style: 'color:var(--muted)' }, '真实按钮、筛选控件、开关与服务端表格')]),
        h('section', { style: 'display:flex;gap:12px;flex-wrap:wrap' }, ['background', 'sidebar', 'accent', 'accent-text', 'accent-soft'].map(key => h('div', { style: 'display:grid;gap:8px' }, [h('span', { style: 'width:96px;height:48px;border:1px solid var(--border);border-radius:8px;background:var(--' + key + ')' }), h('small', key)]))),
        h('section', { style: 'padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:grid;gap:16px' }, [
            h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap' }, ['flat', 'elevated', 'tonal', 'outlined', 'text'].map(variant => h(UButton, { variant, color: 'primary', 'data-variant': variant }, () => '保存修改'))),
            h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;--ui-button-surface:#00ff00;--ui-button-on-surface:#ff00ff' }, ['success', 'warning', 'danger', 'info'].map(color => h(UButton, { variant: 'flat', color, 'data-tone': color }, () => ({ success:'新增', warning:'同步', danger:'删除', info:'查看' }[color])))),
            h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap' }, [h(UButton, { variant:'flat', color:'primary', loading:true }, () => '正在保存'), h(UButton, { variant:'flat', color:'primary', disabled:true }, () => '暂不可用'), h(USwitch, { modelValue:enabled.value, 'onUpdate:modelValue':value=>enabled.value=value, label:'正常' })]),
            h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:16px' }, [h(UTextField, { label:'名称', modelValue:'示例名称' }), h(USelect, { label:'类型', modelValue:'all', items:[{ title:'全部类型', value:'all' }, { title:'普通类型', value:'normal' }] })])
        ]),
        h(UDataTableServer, { headers:[{key:'name',title:'名称'}, {key:'status',title:'状态'}, {key:'actions',title:'操作',fixed:'end'}], items:[{id:1,name:'示例记录',status:'正常'}], itemsLength:1, itemValue:'id', loading:true, color:'primary' }, { 'item.actions':() => h(UButton, { color:'primary',variant:'text',dense:true }, ()=>'修改') }),
        h('section', { id:'roles', style:'display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))' }, [
            h(UToolbar, { color:'primary', title:'主色工具栏', 'data-role':'toolbar' }, () => [h(UButton, { 'data-role':'toolbar-action' }, ()=>'操作'), h(UButton, {color:'danger',variant:'flat','data-role':'toolbar-danger'},()=> '删除')]),
            h('div', { style:'position:relative;min-height:120px' }, [h(USnackbar, { modelValue:true, attach:false, contained:true, color:'primary', timeout:-1, closable:true, loading:true, text:'主题色消息' })]),
            h(USheet, { color:'primary', style:'padding:16px', 'data-role':'sheet' }, ()=>'主色面板'),
            h(UPicker, { color:'primary', title:'选择器标题', 'data-role':'picker' }, ()=>'内容使用普通表面'),
            h('div', { style:'display:flex;gap:16px;align-items:center;flex-wrap:wrap' }, [h(UChip,{color:'primary',variant:'flat','data-role':'chip'},()=> '主色标签'), h(UAvatar,{color:'primary',text:'NC','data-role':'avatar'}), h(UBadge,{color:'primary',content:3,'data-role':'badge'},()=>h('span','通知'))]),
            h(UHotkey,{keys:'ctrl+k',variant:'flat',color:'primary',listen:false,'data-role':'hotkey'}),
            h('div', {style:'display:flex;gap:16px;flex-wrap:wrap'}, [h(UCheckbox,{modelValue:true,color:'primary',label:'主色勾选','data-role':'checkbox'}),h(UCheckbox,{modelValue:true,color:'#ffeeba',label:'自定义浅色','data-role':'pale-checkbox'}),h(URadio,{modelValue:'yes',value:'yes',color:'primary',label:'主色单选','data-role':'radio'}),h(USwitch,{modelValue:true,color:'primary',label:'主色开关','data-role':'switch',thumbColor:'primary',trueIcon:'check'})]),
            h(UField,{bgColor:'primary',label:'主色字段',dirty:true,prependInnerIcon:'check','data-role':'field'},()=>h('input',{value:'主色字段',style:'color:inherit;background:transparent;border:0;min-width:0;width:100%'})),
            h('div',{style:'display:flex;gap:12px;flex-wrap:wrap'},[h('span',{class:'bg-primary',style:'padding:12px','data-role':'bg-primary'},'背景工具类'),h('span',{class:'text-primary','data-role':'text-primary'},'文字工具类'),h(Icon,{name:'check',color:'#246a91','data-role':'raw-icon'})]),
            h(UiTooltip,{text:'主色提示',color:'primary',modelValue:true,attach:false,'data-role':'tooltip'},()=>h('button','提示触发器'))
        ])
    ]); } }).use(theme).mount('#app');
</script></body></html>`;
const server = await createServer({
    optimizeDeps: { noDiscovery: true, include: ['vue', '@vuetify/v0'] },
    server: { host: '127.0.0.1', port: 0 },
    plugins: [
        {
            name: 'palette-fixture',
            configureServer(server) {
                server.middlewares.use(async (request, response, next) => {
                    if (request.url !== '/__palette.html') return next();
                    response.setHeader(
                        'Content-Type',
                        'text/html; charset=utf-8',
                    );
                    response.end(
                        await server.transformIndexHtml(
                            '/__palette.html',
                            fixture,
                        ),
                    );
                });
            },
        },
    ],
});
let browser;
const errors = [];
const samples = [];
try {
    await server.listen();
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({
        viewport: { width: 1280, height: 1000 },
        reducedMotion: 'reduce',
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]'))
            errors.push(message.text());
    });
    await page.goto(`${server.resolvedUrls.local[0]}__palette.html`);
    await page.locator('tbody tr').waitFor({ timeout: 60000 });
    await page.addStyleTag({
        content:
            'html,body,#app{height:auto!important;overflow:visible!important}',
    });
    for (const mode of ['light', 'dark', 'ocean']) {
        await page.evaluate(
            (mode) => window.palette.theme.change(mode, false),
            mode,
        );
        await page.waitForTimeout(220);
        const sample = await page.evaluate(() => {
            const read = (selector) => {
                const style = getComputedStyle(
                    document.querySelector(selector),
                );
                return {
                    background: style.backgroundColor,
                    color: style.color,
                };
            };
            return {
                flat: read('[data-variant="flat"]'),
                outlined: read('[data-variant="outlined"]'),
                text: read('[data-variant="text"]'),
            };
        });
        samples.push({ mode, ...sample });
        assert.equal(
            sample.flat.background,
            mode === 'ocean' ? 'rgb(36, 106, 145)' : 'rgb(217, 119, 87)',
        );
        assert.equal(sample.flat.color, 'rgb(255, 255, 255)');
        assert.equal(
            sample.text.color,
            mode === 'dark'
                ? 'rgb(230, 160, 134)'
                : mode === 'ocean'
                  ? 'rgb(36, 106, 145)'
                  : 'rgb(217, 119, 87)',
        );
        assert.equal(sample.outlined.background, 'rgba(0, 0, 0, 0)');
        const surface = sample.flat.background;
        const ink = sample.flat.color;
        for (const selector of [
            '[data-role="toolbar"]',
            '.u-notice',
            '[data-role="sheet"]',
            '.u-picker-header',
            '[data-role="chip"]',
            '.ui-avatar',
            '.ui-attached-badge-content',
            '.u-hotkey-key',
            '[data-role="field"]',
            '[data-role="bg-primary"]',
            '.ui-tooltip',
        ]) {
            const resolved = await page
                .locator(selector)
                .first()
                .evaluate((element) => ({
                    background: getComputedStyle(element).backgroundColor,
                    color: getComputedStyle(element).color,
                }));
            assert.deepEqual(
                resolved,
                { background: surface, color: ink },
                `${mode}: ${selector}`,
            );
        }
        assert.equal(
            await page
                .locator('[data-role="toolbar-action"]')
                .evaluate((element) => getComputedStyle(element).color),
            ink,
        );
        assert.notEqual(
            await page
                .locator('[data-role="toolbar-danger"]')
                .evaluate(
                    (element) => getComputedStyle(element).backgroundColor,
                ),
            surface,
        );
        assert.equal(
            await page
                .locator('[data-role="checkbox"]')
                .evaluate(
                    (element) => getComputedStyle(element).backgroundColor,
                ),
            surface,
        );
        assert.equal(
            await page
                .locator('[data-role="checkbox"]')
                .evaluate(
                    (element) =>
                        getComputedStyle(element, '::after').backgroundColor,
                ),
            ink,
        );
        assert.equal(
            await page
                .locator('[data-role="pale-checkbox"]')
                .evaluate(
                    (element) =>
                        getComputedStyle(element, '::after').backgroundColor,
                ),
            'rgb(0, 0, 0)',
        );
        assert.equal(
            await page
                .locator('[data-role="raw-icon"]')
                .evaluate((element) => getComputedStyle(element).color),
            'rgb(36, 106, 145)',
        );
        assert.equal(
            await page
                .locator('[data-role="text-primary"]')
                .evaluate((element) => getComputedStyle(element).color),
            sample.text.color,
        );
        if (mode !== 'ocean') {
            for (const width of [1280, 390]) {
                await page.setViewportSize({ width, height: 1000 });
                await page.screenshot({
                    path: path.join(evidence, `${mode}-${width}.png`),
                    fullPage: true,
                });
                assert.ok(
                    await page.evaluate(
                        () =>
                            document.documentElement.scrollWidth <= innerWidth,
                    ),
                );
            }
            await page.setViewportSize({ width: 1280, height: 1000 });
        }
    }
    await page.evaluate(() => window.palette.theme.change('light', false));
    await page.getByRole('checkbox', { name: '正常', exact: true }).click();
    assert.equal(
        await page
            .getByRole('checkbox', { name: '正常', exact: true })
            .isChecked(),
        false,
    );
    await page.getByRole('combobox', { name: '类型', exact: true }).click();
    await page.getByRole('option', { name: '普通类型', exact: true }).click();
    await page.screenshot({
        path: path.join(evidence, 'light-selected.png'),
        fullPage: true,
    });
    assert.notEqual(
        await page
            .locator('[data-tone="danger"]')
            .evaluate((element) => getComputedStyle(element).backgroundColor),
        'rgb(0, 255, 0)',
        'a parent surface must not override a child button',
    );
    await page.evaluate(() => window.palette.theme.dispose());
    for (const mode of ['light', 'dark']) {
        await page.evaluate(
            (mode) => (document.documentElement.dataset.theme = mode),
            mode,
        );
        await page.waitForTimeout(220);
        const sample = await page
            .locator('[data-variant="flat"]')
            .evaluate((element) => ({
                background: getComputedStyle(element).backgroundColor,
                color: getComputedStyle(element).color,
            }));
        assert.deepEqual(sample, {
            background: 'rgb(217, 119, 87)',
            color: 'rgb(255, 255, 255)',
        });
        samples.push({ mode: `css-${mode}`, flat: sample });
    }
    assert.deepEqual(errors, []);
    await writeFile(
        path.join(evidence, 'report.json'),
        JSON.stringify({ samples, errors }, null, 4),
    );
    console.log(JSON.stringify({ evidence, samples, errors }));
} finally {
    await browser?.close();
    await server.close();
}
