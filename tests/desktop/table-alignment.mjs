import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'table-alignment-'));
const demos = ['layout', 'columns', 'filter-sort', 'selection-expand', 'grouping', 'slots', 'server', 'virtual'];
const fixture = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
    import { createApp, h, ref, reactive } from 'vue';
    import { UTable, UDataTable, UDataTableServer, UDataTableVirtual, createUI } from '/src/ui/index.ts';
    import UiPreview from '/src/ui/UiPreview.vue';
    import '/src/docs-base.css'; import '/src/ui/styles.css'; import '/src/ui/docs/docs.css';
    ${demos.map(name => `import Demo_${name.replaceAll('-', '_')} from '/src/ui/docs/table-examples/${name}.vue';`).join('\n')}
    const demos = { ${demos.map(name => `'${name}': Demo_${name.replaceAll('-', '_')}`).join(', ')} };
    const ui = createUI();
    const core = ref();
    const state = reactive({ mode: 'client', demo: '', nested: false, wide: false, customHeader: false, standardSlots: false, replaceBody: false, customControls: false, legacyExpanded: false, props: { mobile: false, showSelect: true, showExpand: true, itemSelectable: 'allowed', selectStrategy: 'page', expandStrategy: 'single', expandOnClick: true, multiSort: true, height: 320, itemHeight: 40, width: undefined, showCurrentPage: true }, page: 1, size: 5, selected: [], expanded: [], opened: [], groupBy: [], sortBy: [], options: [], events: [] });
    const small = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, title: '工作区 ' + (index + 1), category: index < 6 ? '开发' : '设计', count: index, allowed: index !== 1, description: index % 7 ? '短说明' : '长说明可以自动换行，实际行高需要参加虚拟测量。'.repeat(4) }));
    const large = Array.from({ length: 10000 }, (_, index) => ({ ...small[index % 12], id: index + 1, title: '工作区 ' + (index + 1), count: index }));
    const flat = [{ key: 'title', title: '工作区', width: 150 }, { key: 'category', title: '分类', width: 100 }, { key: 'count', title: '任务数', align: 'end', width: 100 }];
    const nested = [{ key: 'title', title: '工作区', width: 150, fixed: 'start' }, { title: '统计', children: [{ key: 'category', title: '分类', width: 130 }, { key: 'count', title: '任务数', width: 120 }] }, { key: 'description', title: '说明', minWidth: 300, sortable: false }, { key: 'action', value: 'count', title: '操作', width: 100, fixed: 'end' }];
    window.tableFixture = { state, theme: ui.theme, core, small, large };
    createApp({ render() {
        if (state.docs) return h(UiPreview);
        if (state.demo) return h('main', { style: { padding: '24px' } }, h(demos[state.demo]));
        const component = state.mode === 'server' ? UDataTableServer : state.mode === 'virtual' ? UDataTableVirtual : UDataTable;
        const items = state.mode === 'virtual' ? large : state.mode === 'server' ? [...small.slice(0, 5)].reverse() : small;
        const props = { ...state.props, ref: core, headers: state.nested ? nested : flat, items, itemsLength: 100, label: '表格专项', itemsPerPageOptions: [5, 10, { value: -1, title: '全部数据' }], page: state.page, itemsPerPage: state.size, modelValue: state.selected, expanded: state.expanded, opened: state.opened, sortBy: state.sortBy, groupBy: state.groupBy,
            rowProps: ({ item }) => ({ 'data-raw-id': item.id }), cellProps: ({ column }) => ({ 'data-cell-key': column.key }),
            'onUpdate:page': value => state.page = value, 'onUpdate:itemsPerPage': value => state.size = value, 'onUpdate:modelValue': value => state.selected = value, 'onUpdate:expanded': value => state.expanded = value, 'onUpdate:opened': value => state.opened = value, 'onUpdate:sortBy': value => state.sortBy = value, 'onUpdate:groupBy': value => state.groupBy = value, 'onUpdate:options': value => state.options.push(value), 'onUpdate:currentItems': value => state.currentItems = value, 'onClick:row': (event, context) => state.events.push(['click', context.item.id]), 'onDblclick:row': (event, context) => state.events.push(['dblclick', context.item.id]), 'onContextmenu:row': (event, context) => state.events.push(['contextmenu', context.item.id]), 'onClick:groupHeader': (event, context) => state.events.push(['group-click', context.item.value]), 'onDblclick:groupHeader': (event, context) => state.events.push(['group-dblclick', context.item.value]), 'onContextmenu:groupHeader': (event, context) => state.events.push(['group-contextmenu', context.item.value]) };
        const slots = { 'expanded-row': ({ item, columns }) => state.legacyExpanded ? h('p', '旧正文 ' + item.title) : h('tr', { class: 'custom-expanded' }, h('td', { colspan: columns.length }, [h('p', '标准展开 ' + item.title), h('p', { style: { padding: '24px 0' } }, '可变高度展开详情')])) };
        if (state.customHeader) slots['header.count'] = ({ column }) => h('strong', { 'data-custom-header': true }, column.title);
        if (state.customControls) {
            slots['item.data-table-expand'] = ({ props }) => h('button', { ...props, 'aria-label': '自定义展开', class: 'custom-expand' }, '详情');
            slots['item.data-table-select'] = ({ props }) => h('input', { type: 'checkbox', checked: props.modelValue, disabled: props.disabled, onClick: props.onClick, 'aria-label': '自定义选择' });
        }
        if (state.standardSlots) {
            slots.caption = () => h('caption', '结构插槽表格'); slots.colgroup = () => h('colgroup', [h('col'),h('col'),h('col')]);
            slots['body.prepend'] = ({ columns }) => h('tr', { class: 'before-row' }, h('td', { colspan: columns.length }, '前置行'));
            slots['body.append'] = ({ columns }) => h('tr', { class: 'after-row' }, h('td', { colspan: columns.length }, '后置行'));
            slots.tfoot = ({ columns }) => h('tfoot', h('tr', h('td', { colspan: columns.length }, '固定汇总')));
            slots['footer.prepend'] = () => h('small', '页脚前置');
            slots['group-summary'] = ({ item, columns, extractRows }) => h('tr', { class: 'group-summary-test' }, h('td', { colspan: columns.length }, '汇总 ' + extractRows(item.items).length));
        }
        if (state.replaceBody) slots.body = ({ columns, items }) => h('tr', { class: 'replacement-body' }, h('td', { colspan: columns.length }, '替换 ' + items.length));
        return h('main', { style: { padding: '24px' } }, h(component, props, slots));
    } }).use(ui).mount('#app');
</script></body></html>`;
const server = await createServer({ cacheDir: path.join(evidence, 'vite-cache'), server: { host: '127.0.0.1', port: 0 }, plugins: [{ name: 'table-alignment-fixture', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
        if (request.url !== '/__table-alignment.html') { next(); return; }
        response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(await server.transformIndexHtml(request.url, fixture));
    });
} }] });
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}__table-alignment.html` };
delete env.ELECTRON_RUN_AS_NODE; delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
await page.emulateMedia({ reducedMotion: 'reduce' });
const errors = [];
const checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text()); });
async function configure(patch, props = {}) {
    await page.evaluate(({ patch, props }) => { Object.assign(window.tableFixture.state, patch); Object.assign(window.tableFixture.state.props, props); }, { patch, props });
    await page.waitForTimeout(100);
}
async function state(key) { return page.evaluate(key => window.tableFixture.state[key], key); }
async function capture(name) {
    await page.waitForTimeout(100);
    const image = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, name + '.png'), Buffer.from(image.split(',')[1], 'base64'));
}
const rows = () => page.locator('tr[data-item-key]');
const viewport = () => page.locator('.u-data-table > .ui-scroll-area > .ui-scroll-viewport');
try {
    await rows().first().waitFor();
    assert.equal(await rows().count(), 5);
    assert.equal((await state('currentItems'))[0].raw.id, 1);
    await page.getByRole('checkbox', { name: '选择所有行' }).check();
    assert.deepEqual(await state('selected'), [1, 3, 4, 5]);
    await configure({ page: 2 });
    await page.getByRole('checkbox', { name: '选择所有行' }).check();
    assert.deepEqual(await state('selected'), [1, 3, 4, 5, 6, 7, 8, 9, 10]);
    await page.getByRole('checkbox', { name: '选择所有行' }).uncheck();
    assert.deepEqual(await state('selected'), [1, 3, 4, 5]); checks.push('page selection keeps other pages and excludes unselectable rows');
    await configure({ page: 1, selected: [] }, { selectStrategy: 'all' });
    await page.getByRole('checkbox', { name: '选择所有行' }).check();
    assert.equal((await state('selected')).length, 11);
    await configure({ selected: [] }, { selectStrategy: 'single' });
    assert.equal(await page.getByRole('checkbox', { name: '选择所有行' }).count(), 0);
    await rows().nth(0).locator('input').check(); await rows().nth(2).locator('input').check();
    assert.deepEqual(await state('selected'), [3]); checks.push('single and all selection strategies');
    await configure({ selected: [], customControls: true }, { selectStrategy: 'page', returnObject: true });
    await page.getByRole('checkbox', { name: '自定义选择' }).first().check();
    assert.equal((await state('selected'))[0].id, 1);
    await page.getByRole('button', { name: '自定义展开' }).first().click();
    assert.deepEqual(await state('expanded'), [await page.evaluate(() => window.tableFixture.small[0])]);
    await page.getByRole('button', { name: '自定义展开' }).nth(2).click();
    assert.equal((await state('expanded')).length, 1); assert.equal((await state('expanded'))[0].id, 3);
    assert.equal(await page.locator('tr.custom-expanded > td').count(), 1);
    await capture('client-controls-object-expand'); checks.push('standard selection/expand control props, returnObject and single expansion');
    await configure({ customControls: false, expanded: [], selected: [], customHeader: true }, { returnObject: false });
    await page.locator('[data-custom-header]').click(); assert.deepEqual(await state('sortBy'), [{ key: 'count', order: 'asc' }]);
    await page.locator('[data-custom-header]').focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.tableFixture.state.sortBy[0]?.order === 'desc');
    await rows().first().locator('td[data-column="title"]').click();
    assert.equal((await state('events'))[0][0], 'click'); assert.equal((await state('expanded')).length, 1);
    await configure({}, { expandOnClick: false });
    await rows().nth(1).locator('td[data-column="title"]').dblclick();
    assert.ok((await state('events')).some(event => event[0] === 'dblclick')); checks.push('custom header sorting and row events');
    await configure({ sortBy: [], expanded: [], nested: true, customHeader: false, standardSlots: true }, { fixedHeader: true, fixedFooter: true, width: 1600, showExpand: false });
    assert.equal(await page.locator('thead tr').count(), 2);
    assert.equal(await page.locator('th:has-text("统计")').getAttribute('colspan'), '2');
    await viewport().evaluate(element => { element.scrollLeft = 350; element.scrollTop = 100; });
    await page.waitForTimeout(150);
    const fixed = await page.locator('table').evaluate(table => {
        const view = table.closest('.ui-scroll-viewport').getBoundingClientRect();
        const first = table.querySelector('tbody tr[data-item-key] td[data-column="title"]').getBoundingClientRect();
        const last = table.querySelector('tbody tr[data-item-key] td[data-column="action"]').getBoundingClientRect();
        const head = table.querySelector('thead th').getBoundingClientRect();
        const foot = table.querySelector('tfoot td').getBoundingClientRect();
        return { start: first.left - view.left, end: last.right - view.right, head: head.top - view.top, foot: foot.bottom - view.bottom };
    });
    assert.ok(Math.abs(fixed.start) < 2 && Math.abs(fixed.end) < 2 && Math.abs(fixed.head) < 2 && Math.abs(fixed.foot) < 2, JSON.stringify(fixed));
    await capture('nested-fixed-columns-footer'); checks.push('nested headers, fixed start/end columns and fixed table footer');
    await configure({ replaceBody: true }); assert.equal(await rows().count(), 0); assert.equal(await page.locator('.replacement-body').count(), 1);
    assert.equal(await page.locator('.before-row').count(), 1); assert.equal(await page.locator('.after-row').count(), 1);
    await configure({ replaceBody: false, nested: false, groupBy: [{ key: 'category' }], page: 1, size: 1, opened: [] }, { openAll: true, pageBy: 'group', width: undefined });
    assert.equal(await rows().count(), 6); assert.equal(await page.locator('.group-summary-test').count(), 1);
    assert.equal((await state('opened')).length, 2);
    assert.equal((await state('currentItems'))[0].type, 'group');
    await page.locator('.u-data-table-group').first().locator('td').last().click();
    await page.locator('.u-data-table-group').first().locator('td').last().dblclick();
    await page.locator('.u-data-table-group').first().locator('td').last().click({ button: 'right' });
    const groupEvents = (await state('events')).map(event => event[0]);
    assert.ok(['group-click', 'group-dblclick', 'group-contextmenu'].every(name => groupEvents.includes(name)));
    await page.locator('.u-data-table-group button').first().click(); assert.equal(await rows().count(), 0);
    await configure({ page: 2 }); assert.equal(await rows().count(), 6); checks.push('structural slots, controlled groups, whole-group pagination and summaries');
    await configure({ mode: 'server', groupBy: [], opened: [], page: 1, size: 5, sortBy: [], standardSlots: false }, { openAll: false, pageBy: 'auto', search: 'missing', showSelect: false, showExpand: false });
    assert.deepEqual(await rows().evaluateAll(nodes => nodes.map(node => Number(node.dataset.itemKey))), [5, 4, 3, 2, 1]);
    await page.locator('.ui-table-page-size select').selectOption('-1'); await page.waitForFunction(() => window.tableFixture.state.size === -1);
    assert.ok((await page.locator('.ui-table-range').textContent()).includes('100'));
    await configure({}, { loading: { color: 'primary', side: 'end' } }); assert.equal(await page.locator('[role="progressbar"]').count(), 1); assert.equal(await page.locator('.ui-table-page-size select').isDisabled(), true);
    assert.equal(await page.locator('tbody [role="progressbar"]').count(), 1);
    await configure({}, { loading: { color: 'primary', side: 'both' } }); assert.equal(await page.locator('[role="progressbar"]').count(), 2);
    await configure({}, { loading: false, search: '' }); checks.push('server skips local pipeline, all pagination, loading config');
    await configure({ mode: 'virtual', size: 5, sortBy: [], expanded: [], nested: true }, { width: 1000, showSelect: true, showExpand: true, expandStrategy: 'multiple', height: 320 });
    assert.equal((await state('options')).at(-1).itemsPerPage, -1);
    assert.ok(await rows().count() < 30);
    await rows().first().locator('td[data-column="data-table-expand"] button').click();
    await page.waitForTimeout(100);
    const height = await page.locator('.custom-expanded').evaluate(element => element.getBoundingClientRect().height);
    assert.ok(height > 70, 'variable expanded row is measured');
    await page.evaluate(() => window.tableFixture.core.value.scrollToIndex(9999));
    await page.waitForFunction(() => document.querySelector('tbody').textContent.includes('工作区 10000'));
    await viewport().focus(); await page.keyboard.press('Control+End');
    assert.ok((await rows().last().textContent()).includes('工作区 10000'));
    await capture('virtual-end-variable-height');
    await configure({}, { search: '工作区 10000' }); await page.waitForFunction(() => document.querySelector('.u-data-table > .ui-scroll-area > .ui-scroll-viewport').scrollTop === 0);
    assert.equal(await rows().count(), 1); checks.push('virtual variable heights, standard expanded rows, public scrollToIndex, end keyboard and filter reset');
    await configure({ mode: 'client', nested: false, expanded: [], legacyExpanded: true, sortBy: [] }, { search: '', mobile: true, width: undefined, showSelect: false, showExpand: true });
    await rows().first().locator('td[data-column="data-table-expand"] button').click(); assert.ok(await page.locator('.u-data-table-details').first().isVisible());
    assert.ok(await page.locator('.u-data-table-mobile-header').isVisible()); checks.push('legacy expanded content and explicit mobile layout');
    for (const demo of demos) {
        await configure({ demo }); await page.locator(`[data-table-demo="${demo}"]`).waitFor();
        if (demo === 'server') await page.waitForFunction(() => !document.querySelector('[data-table-demo="server"] [aria-busy="true"]'));
        assert.ok(await page.locator(`[data-table-demo="${demo}"] table`).count() > 0, demo);
        await capture('demo-' + demo + '-light');
        await page.evaluate(() => window.tableFixture.theme.change('dark'));
        await capture('demo-' + demo + '-dark');
        await page.evaluate(() => window.tableFixture.theme.change('light'));
        if (demo === 'layout') {
            await page.getByLabel('表格密度').selectOption('compact');
            await page.getByLabel('网格线', { exact: true }).selectOption('all');
            assert.equal(await page.locator('.ui-table.is-dense').count(), 1);
            assert.equal(await page.locator('.ui-table[data-gridlines="all"]').count(), 1);
        }
        if (demo === 'filter-sort') {
            await page.getByRole('textbox', { name: '搜索表格' }).fill('eclair');
            await page.waitForFunction(() => document.querySelectorAll('tr[data-item-key]').length === 1);
            assert.ok((await rows().first().textContent()).includes('Éclair'));
            assert.equal(await page.locator('mark').count(), 1);
            await page.getByRole('checkbox', { name: '跳过过滤' }).check();
            await page.waitForFunction(() => document.querySelectorAll('tr[data-item-key]').length === 5);
        }
        if (demo === 'grouping') {
            assert.ok(await page.locator('.u-data-table-group > .table-demo-group-cell').count() > 0);
            assert.equal(await page.locator('td > td').count(), 0);
            await page.getByRole('button', { name: '收起全部' }).click();
            assert.equal(await rows().count(), 0);
            await page.getByRole('button', { name: /切换.*分组/ }).first().click();
            assert.ok(await page.locator('.u-data-table-group').count() > 1);
        }
        if (demo === 'server') {
            await page.getByRole('button', { name: '模拟失败' }).click();
            await page.getByText('请求失败，可重试。', { exact: true }).waitFor();
            await page.getByRole('button', { name: '重试', exact: true }).click();
            await rows().first().waitFor();
            await page.getByRole('textbox', { name: '远程搜索' }).fill('83');
            await page.waitForFunction(() => document.querySelectorAll('tr[data-item-key]').length === 1 && document.querySelector('tr[data-item-key]').textContent.includes('83'));
            await page.locator('.ui-table-page-size select').selectOption('-1');
            await page.getByRole('textbox', { name: '远程搜索' }).fill('');
            await page.waitForFunction(() => document.querySelectorAll('tr[data-item-key]').length === 83);
        }
        if (demo === 'virtual') {
            await rows().first().locator('td[data-column="data-table-expand"] button').click();
            assert.equal(await page.locator('.table-demo-expanded').count(), 1);
            await page.getByRole('button', { name: '滚动到末行' }).click();
            await page.waitForFunction(() => document.querySelector('tbody').textContent.includes('工作区 10000'));
        }
        checks.push('real demo ' + demo);
    }
    for (const [width, zoom] of [[390, 1], [800, 1.25]]) {
        await app.evaluate(({ BrowserWindow }, { width, zoom }) => { const window = BrowserWindow.getAllWindows()[0]; window.setContentSize(width, 950); window.webContents.setZoomFactor(zoom); }, { width, zoom });
        for (const demo of ['selection-expand', 'grouping', 'server', 'virtual']) {
            await configure({ demo });
            if (demo === 'server') await page.waitForFunction(() => !document.querySelector('[data-table-demo="server"] [aria-busy="true"]'));
            const overflow = await page.locator('main').evaluate(element => element.scrollWidth > element.clientWidth + 1);
            assert.equal(overflow, false, `${demo} ${width} outer frame fits`);
            await capture(`demo-${demo}-${width}-zoom${zoom}`);
        }
    }
    checks.push('four complex demos fit 390px and 125%');
    await app.evaluate(({ BrowserWindow }) => { const window = BrowserWindow.getAllWindows()[0]; window.setContentSize(1440, 950); window.webContents.setZoomFactor(1); });
    await configure({ docs: true });
    for (const [route, ids] of [['table', ['layout']], ['data-table', ['columns', 'filter-sort', 'selection-expand', 'grouping', 'slots']], ['data-table-server', ['server']], ['data-table-virtual', ['virtual']]]) {
        await page.evaluate(route => location.hash = '#/' + route, route);
        for (const id of ids) await page.locator(`[data-table-demo="${id}"]`).waitFor();
        const card = page.locator(`.docs-example[aria-labelledby="table-align-${ids[0]}-heading"]`);
        await card.getByRole('tab', { name: '源码', exact: true }).click();
        assert.ok((await card.textContent()).includes('@lingyzh/ui'));
        await card.getByRole('tab', { name: '交互示例', exact: true }).click();
        await page.locator(`[data-table-demo="${ids[0]}"]`).scrollIntoViewIfNeeded();
        await capture('docs-' + route);
    }
    checks.push('four real documentation routes render all eight examples and their source tabs');
    assert.deepEqual(errors, []);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ checks, fixed, errors }, null, 4));
    console.log(JSON.stringify({ evidence, checks: checks.length, errors }, null, 4));
} catch (error) {
    console.error(JSON.stringify({ evidence, checks, errors }));
    await capture('failure'); throw error;
} finally { await app.close(); await server.close(); }
