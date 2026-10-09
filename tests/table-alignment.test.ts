import assert from 'node:assert/strict';
import test from 'node:test';
import { effectScope, nextTick, reactive, ref } from 'vue';
import { existsSync, readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { filterItems, getItemProperty, internalItems, normalizeHeaders, processItems } from '../src/ui/data-pipeline';
import { useDataTableState } from '../src/ui/data-table-state';
import { extractPublicComponentContracts } from './helpers/component-contracts.mjs';
import type { DataTableProps, TableModels, TablePaginationProps } from '../src/ui/data-table-types';

const items = [
    { id: 1, meta: { title: 'Éclair' }, category: 'A', score: 8, allowed: true },
    { id: 2, meta: { title: 'Zulu' }, category: 'A', score: 4, allowed: false },
    { id: 3, meta: { title: 'Alpha' }, category: 'B', score: 8, allowed: true },
    { id: 4, meta: { title: 'Beta' }, category: 'B', score: 2, allowed: true }
];
const headers = [{ key: 'name', title: 'Name', value: 'meta.title' }, { key: 'score', title: 'Score' }, { key: 'category', title: 'Category' }];
function setup(extra: DataTableProps & TablePaginationProps & { server?: boolean; virtual?: boolean; itemsLength?: number | string } = {}, overrides: Partial<TableModels> = {}) {
    const scope = effectScope();
    const props = reactive({ items, headers, pageBy: 'auto' as const, itemSelectable: 'allowed', ...extra });
    const initial: TableModels = { page: 1, itemsPerPage: 2, sortBy: [], groupBy: [], modelValue: [], expanded: [], opened: [], ...overrides };
    const models = { page: ref(initial.page), itemsPerPage: ref(initial.itemsPerPage), sortBy: ref(initial.sortBy), groupBy: ref(initial.groupBy), modelValue: ref(initial.modelValue), expanded: ref(initial.expanded), opened: ref(initial.opened) };
    const state = scope.run(() => useDataTableState(props, models, () => false))!;
    return { state, props, models, dispose: () => scope.stop() };
}
test('nested headers expose a matrix, leaf value functions and fixed offsets', () => {
    const layout = normalizeHeaders([{ key: 'name', title: 'Name', width: 100, fixed: true }, { title: 'Metrics', children: [{ key: 'score', title: 'Score', width: 80 }, { key: 'double', value: item => Number(item.score) * 2, title: 'Double' }] }, { key: 'action', width: 60, fixed: 'end' }], items, { showSelect: true });
    assert.equal(layout.headers.length, 2);
    assert.equal(layout.headers[0][1].rowspan, 2);
    assert.equal(layout.headers[0][2].colspan, 2);
    assert.equal(layout.columns.at(-1)?.fixedEndOffset, 0);
    assert.equal(internalItems(items, layout.columns, {})[0].columns.double, 16);
    assert.equal(getItemProperty(items[0], ['meta', 'title']), 'Éclair');
    assert.deepEqual(normalizeHeaders(undefined, items).columns.map(column => column.key), Object.keys(items[0]));
});
test('mapped columns, custom value/raw sort, stable ties and disabled sorting', () => {
    assert.deepEqual(processItems(items, { headers, sortBy: [{ key: 'name', order: 'asc' }] }).map(item => item.id), [3, 4, 1, 2]);
    assert.deepEqual(processItems(items, { headers, sortBy: [{ key: 'score', order: 'desc' }, { key: 'name', order: 'asc' }] }).map(item => item.id), [3, 1, 2, 4]);
    assert.deepEqual(processItems(items, { headers, customKeySort: { score: (a, b) => Number(b) - Number(a) }, sortBy: [{ key: 'score', order: 'asc' }] }).map(item => item.id), [1, 3, 2, 4]);
    assert.deepEqual(processItems(items, { headers: [{ key: 'score', sortRaw: (a, b) => Number(b.id) - Number(a.id) }], sortBy: [{ key: 'score', order: 'asc' }] }).map(item => item.id), [4, 3, 2, 1]);
    assert.deepEqual(processItems(items, { headers, customKeySort: { score: () => null }, sortBy: [{ key: 'score', order: 'asc' }, { key: 'name', order: 'asc' }] }).map(item => item.id), [3, 4, 1, 2]);
    assert.deepEqual(processItems(items, { disableSort: true, sortBy: [{ key: 'score', order: 'asc' }] }), items);
});
test('filters handle -1, match ranges, key modes, accents and noFilter', () => {
    assert.deepEqual(processItems(items, { headers, search: 'eclair', ignoreAccents: true }).map(item => item.id), [1]);
    assert.deepEqual(processItems(items, { headers, search: 'A', filterKeys: 'category' }).map(item => item.id), [1, 2]);
    assert.equal(processItems(items, { headers, search: 'missing', noFilter: true }).length, 4);
    const customKeyFilter = { score: (value: unknown) => Number(value) >= 8 };
    assert.deepEqual(processItems(items, { headers, search: 'Alpha', customKeyFilter }).map(item => item.id), [3]);
    assert.deepEqual(processItems(items, { headers, search: 'Beta', customKeyFilter, filterMode: 'union' }).map(item => item.id), [1, 3, 4]);
    assert.equal(processItems(items, { headers, search: 'A', filterMode: 'every' }).length, 0);
    assert.equal(processItems(items, { headers, search: 'x', customFilter: () => -1 }).length, 0);
    assert.deepEqual(filterItems(items, { headers, search: 'Alpha' }).matches.get(items[2])?.name, [[0, 5]]);
    const accents = [{ id: 1, title: 'Éclair Éclair' }];
    assert.deepEqual(filterItems(accents, { headers: [{ key: 'title' }], search: 'eclair', ignoreAccents: 'target' }).matches.get(accents[0])?.title, [[0, 6], [7, 13]]);
    assert.equal(filterItems(accents, { headers: [{ key: 'title' }], search: 'eclair', ignoreAccents: 'query' }).items.length, 0);
    assert.equal(filterItems([{ title: 'Eclair' }], { headers: [{ key: 'title' }], search: 'Éclair', ignoreAccents: 'query' }).items.length, 1);
});
test('sort cycle supports initial desc, mustSort, modifier multi-sort and priority', () => {
    const { state, models, props, dispose } = setup({ initialSortOrder: 'desc', mustSort: true, multiSort: { key: 'ctrl', mode: 'append', modifier: 'shift' } });
    state.toggleSort('score'); state.toggleSort('score'); state.toggleSort('score');
    assert.deepEqual(models.sortBy.value, [{ key: 'score', order: 'desc' }]);
    state.toggleSort('name', { ctrlKey: true, shiftKey: true } as MouseEvent);
    assert.deepEqual(models.sortBy.value.map(sort => sort.key), ['name', 'score']);
    state.toggleSort('score'); state.toggleSort('score');
    assert.deepEqual(models.sortBy.value.map(sort => sort.key), ['name']);
    state.toggleSort('category');
    assert.deepEqual(models.sortBy.value, [{ key: 'category', order: 'desc' }]);
    props.disableSort = true; state.toggleSort('score');
    assert.equal(models.sortBy.value[0].key, 'category');
    dispose();
});
test('page selection preserves other pages, honors selectable rows and shift selection', async () => {
    const { state, models, dispose } = setup();
    state.selectAll(true);
    assert.deepEqual(models.modelValue.value, [1]);
    models.page.value = 2;
    state.selectAll(true);
    assert.deepEqual(models.modelValue.value, [1, 3, 4]);
    state.selectAll(false);
    assert.deepEqual(models.modelValue.value, [1]);
    models.itemsPerPage.value = -1; await nextTick();
    state.toggleSelect(state.allItems.value[2], 2);
    state.toggleSelect(state.allItems.value[3], 3, { shiftKey: true } as MouseEvent);
    assert.deepEqual(models.modelValue.value, [1, 3, 4]);
    dispose();
});
test('single/all/object/custom selection strategies and comparator', () => {
    const single = setup({ selectStrategy: 'single' });
    single.state.toggleSelect(single.state.allItems.value[0]); single.state.toggleSelect(single.state.allItems.value[2]);
    assert.deepEqual(single.models.modelValue.value, [3]); assert.equal(single.state.strategy.value.showSelectAll, false); single.dispose();
    const all = setup({ selectStrategy: 'all' }); all.state.selectAll(true); assert.deepEqual(all.models.modelValue.value, [1, 3, 4]); all.dispose();
    const objects = setup({ returnObject: true }, { modelValue: [{ ...items[0], meta: { ...items[0].meta } }] });
    assert.equal(objects.state.isSelected(objects.state.allItems.value[0]), true);
    objects.state.toggleSelect(objects.state.allItems.value[0]); assert.deepEqual(objects.models.modelValue.value, []); objects.dispose();
    const custom = setup({ selectStrategy: { showSelectAll: true, allSelected: ({ allItems }) => allItems, select: ({ items }) => new Set(items.map(item => item.value)), selectAll: ({ currentPage }) => new Set(currentPage.map(item => item.value)) } });
    custom.state.selectAll(true); assert.deepEqual(custom.models.modelValue.value, [1]); custom.dispose();
});
test('single expansion, external models and disabled guards', () => {
    const { state, models, props, dispose } = setup({ expandStrategy: 'single' });
    state.toggleExpand(state.allItems.value[0]); state.toggleExpand(state.allItems.value[2]);
    assert.deepEqual(models.expanded.value, [3]);
    models.expanded.value = [1]; assert.equal(state.isExpanded(state.allItems.value[0]), true);
    props.disabled = true; state.toggleExpand(state.allItems.value[0]); state.selectAll(true); state.toggleSort('name'); state.setPage(2);
    assert.deepEqual(models.expanded.value, [1]); assert.deepEqual(models.modelValue.value, []); assert.deepEqual(models.sortBy.value, []); assert.equal(models.page.value, 1); dispose();
});
test('group pagination keeps whole groups, opened/openAll remain controlled', async () => {
    const { state, models, props, dispose } = setup({ openAll: true, groupKey: ({ value, parentKey }) => `${parentKey ?? 'root'}:${value}` }, { groupBy: [{ key: 'category' }], itemsPerPage: 1 });
    assert.deepEqual(models.opened.value, ['root:A', 'root:B']);
    assert.equal(state.slotProps.value.itemsLength, 4);
    assert.equal(state.paginatedEntries.value[0].type, 'group');
    assert.equal(state.pageCount.value, 2); assert.deepEqual(state.currentItems.value.map(item => item.raw.id), [1, 2]);
    state.toggleGroup(state.groups.value[0] as never); await nextTick(); assert.deepEqual(state.currentItems.value, []);
    props.items = [...items]; await nextTick(); assert.equal(models.opened.value.includes('root:A'), false);
    models.page.value = 2; assert.deepEqual(state.currentItems.value.map(item => item.raw.id), [3, 4]);
    props.pageBy = 'item' as never; assert.equal(state.pageCount.value, 4); dispose();
});

test('group order is optional and toggling openAll opens the existing groups', async () => {
    assert.deepEqual(processItems([...items].reverse(), { groupBy: [{ key: 'category' }] }).map(item => item.id), [4, 3, 2, 1]);
    const { state, models, props, dispose } = setup({}, { groupBy: [{ key: 'category' }] });
    assert.deepEqual(models.opened.value, []);
    props.openAll = true; await nextTick(); assert.equal(models.opened.value.length, 2);
    state.toggleGroup(state.groups.value[0] as never); await nextTick(); assert.equal(models.opened.value.length, 1);
    props.openAll = false; await nextTick(); props.openAll = true; await nextTick(); assert.equal(models.opened.value.length, 2);
    dispose();
});
test('server total/string size/all preserve incoming ordering and loading page', async () => {
    const { state, models, props, dispose } = setup({ server: true, itemsLength: '100', loading: true, search: 'does not match' }, { page: '5', itemsPerPage: '10', sortBy: [{ key: 'score', order: 'asc' }] });
    assert.deepEqual(state.currentItems.value.map(item => item.raw.id), [1, 2, 3, 4]); assert.equal(state.pageCount.value, 10);
    props.itemsLength = '0'; await nextTick(); assert.equal(models.page.value, '5');
    props.itemsLength = '100'; props.loading = false; await nextTick();
    state.setItemsPerPage(-1); await nextTick(); assert.equal(state.pageCount.value, 1); assert.equal(models.page.value, 1); dispose();
});
test('virtual shares filters/groups/selection without local pagination', () => {
    const { state, dispose } = setup({ virtual: true });
    assert.equal(state.size.value, -1);
    assert.equal(state.pageCount.value, 1);
    assert.equal(state.rows.value.length, 4); state.selectAll(true); assert.equal(state.slotProps.value.allSelected, true); dispose();
});
test('four public table SFC contracts plus shared renderer compile with real imported types', () => {
    for (const name of ['UiTable', 'UDataTable', 'UiDataTableServer', 'UDataTableVirtual', 'DataTableCore']) {
        const filename = `${process.cwd()}/src/ui/${name}.vue`;
        const descriptor = parse(readFileSync(filename, 'utf8'), { filename }).descriptor;
        const script = compileScript(descriptor, { id: name, fs: { fileExists: existsSync, readFile: path => readFileSync(path, 'utf8') } });
        const compiled = compileTemplate({ source: descriptor.template!.content, filename, id: name, compilerOptions: { bindingMetadata: script.bindings } });
        assert.deepEqual(compiled.errors, [], name);
        assert.match(script.content, /fixedFooter:\s*\{/); assert.match(script.content, /gridlines:\s*\{/);
    }
});

test('table public contracts retain the audited stable upstream names', () => {
    const audit = JSON.parse(readFileSync('docs/TABLE-ALIGNMENT-AUDIT-2026-10-08.json', 'utf8'));
    const contracts = extractPublicComponentContracts(process.cwd());
    for (const table of audit.tables) {
        const contract = contracts.find(component => component.name === table.name)!;
        const props = new Set([...contract.props, ...contract.models].map(prop => prop.name));
        const slots = contract.slots.map(slot => slot.pattern ?? slot.name);
        const events = contract.emits.map(event => event.name);
        for (const prop of table.upstreamProps) assert.ok(props.has(prop) || table.inheritedAttributes.includes(prop), `${table.name}.${prop}`);
        for (const slot of table.upstreamSlots) assert.ok(slots.includes(slot) || slots.some(pattern => pattern.endsWith('*') && slot.startsWith(pattern.slice(0, -1))), `${table.name} slot ${slot}`);
        for (const event of table.upstreamEvents) assert.ok(events.includes(event), `${table.name} event ${event}`);
    }
});
test('eight table examples are registered and compile from their real SFC source', async () => {
    const { tableAlignmentExamples } = await import('../src/ui/docs/tableAlignmentContent.js');
    const { pages } = await import('../src/ui/docs/content.js');
    const examples = Object.values(tableAlignmentExamples).flat();
    assert.equal(examples.length, 8);
    for (const example of examples) {
        const name = example.id.replace('table-align-', '');
        const source = readFileSync(`src/ui/docs/table-examples/${name}.vue`, 'utf8');
        assert.equal(example.code.replace(/\r\n?/g, '\n'), source.replaceAll("from '../../index'", "from '@lingyzh/ui'").replace(/\r\n?/g, '\n'));
        assert.ok(pages.some(page => page.examples?.some(entry => entry.id === example.id)));
        const descriptor = parse(source, { filename: `${name}.vue` }).descriptor;
        assert.deepEqual(compileTemplate({ source: descriptor.template!.content, filename: `${name}.vue`, id: name }).errors, []);
    }
});
