import assert from 'node:assert/strict';
import test from 'node:test';
import { effectScope, shallowReactive, shallowRef, ref, nextTick } from 'vue';
import {
    useDataIteratorState,
    type DataIteratorEmit,
    type DataIteratorItem,
    type DataIteratorModels,
    type DataIteratorOptions,
    type DataIteratorProps,
    type DataIteratorSelectionStrategy
} from '../src/ui/data-iterator-state';

const numericPageModel: DataIteratorModels['page'] = ref(1);
const numericItemsPerPageModel: DataIteratorModels['itemsPerPage'] = ref(10);
void numericPageModel;
void numericItemsPerPageModel;

const sourceItems = [
    { id: 'a', title: 'Éclair', score: 2, category: 'A', selectable: true },
    { id: 'b', title: 'Zulu', score: 4, category: 'A', selectable: false },
    { id: 'c', title: 'Alpha', score: 8, category: 'B', selectable: true },
    { id: 'd', title: 'Beta', score: 2, category: 'B', selectable: true }
];

type ModelValues = Partial<{
    page: number | string;
    itemsPerPage: number | string;
    sortBy: DataIteratorModels['sortBy']['value'];
    groupBy: DataIteratorModels['groupBy']['value'];
    modelValue: unknown[];
    expanded: unknown[];
    opened: string[];
}>;

function setup(extra: Partial<DataIteratorProps> = {}, overrides: ModelValues = {}) {
    const scope = effectScope();
    const props = shallowReactive<DataIteratorProps>({ items: sourceItems, ...extra });
    const models: DataIteratorModels = {
        page: ref(overrides.page ?? 1),
        itemsPerPage: ref(overrides.itemsPerPage ?? 2),
        sortBy: ref(overrides.sortBy ?? []),
        groupBy: ref(overrides.groupBy ?? []),
        modelValue: shallowRef(overrides.modelValue ?? []),
        expanded: shallowRef(overrides.expanded ?? []),
        opened: ref(overrides.opened ?? [])
    };
    const events: { options: DataIteratorOptions[]; currentItems: unknown[][] } = { options: [], currentItems: [] };
    const emit: DataIteratorEmit = (event, value) => {
        if (event === 'update:options') events.options.push(value as DataIteratorOptions);
        else events.currentItems.push(value as unknown[]);
    };
    const state = scope.run(() => useDataIteratorState(() => props, models, emit))!;
    return { state, props, models, events, dispose: () => scope.stop() };
}

test('legacy and standard slot protocols preserve raw identity and stable internal keys', async () => {
    const recordWithoutId = { title: 'No id' };
    const recordWithId = { id: 'row-1', title: 'Record' };
    const items = [7, 'primitive', false, null, recordWithoutId, recordWithId, recordWithoutId];
    const legacy = setup({ items });
    assert.deepEqual(legacy.state.allItems.value.map(item => item.value), [7, 'primitive', false, null, undefined, 'row-1', undefined]);
    assert.equal(legacy.state.allItems.value[4].raw, recordWithoutId);
    assert.notEqual(legacy.state.allItems.value[4].key, legacy.state.allItems.value[6].key);
    assert.equal(new Set(legacy.state.allItems.value.map(item => item.key)).size, items.length);
    assert.deepEqual(legacy.state.slotProps.value.items, items.slice(0, 2));
    assert.deepEqual(legacy.state.slotProps.value.allItems, items);
    assert.equal(legacy.state.slotProps.value.internalItems[5].raw, recordWithId);
    const stableKey = legacy.state.allItems.value[4].key;
    legacy.props.items = [recordWithId, recordWithoutId, recordWithoutId];
    await nextTick();
    assert.equal(legacy.state.allItems.value[1].key, stableKey);
    legacy.dispose();

    const standard = setup({ items, standardProtocol: true }, { itemsPerPage: -1 });
    const slotItems = standard.state.slotProps.value.items as DataIteratorItem[];
    assert.equal(slotItems[0].type, 'item');
    assert.equal(slotItems[4].raw, recordWithoutId);
    assert.equal(standard.state.slotProps.value.internalItems[0].type, 'item');
    standard.dispose();
});

test('itemValue paths and callbacks, itemSelectable paths and null defaults', () => {
    const items = [
        { meta: { key: 'first', enabled: false } },
        { meta: { key: 'second', enabled: true } }
    ];
    const path = setup({ items, itemValue: ['meta', 'key'], itemSelectable: ['meta', 'enabled'] });
    assert.deepEqual(path.state.allItems.value.map(item => item.value), ['first', 'second']);
    assert.deepEqual(path.state.allItems.value.map(item => item.selectable), [false, true]);
    path.dispose();

    const dottedPath = setup({ items, itemValue: 'meta.key' });
    assert.deepEqual(dottedPath.state.allItems.value.map(item => item.value), ['first', 'second']);
    dottedPath.dispose();

    const callback = setup({
        items,
        itemValue: item => (item.meta as { key: string }).key.toUpperCase(),
        itemSelectable: item => (item.meta as { enabled: boolean }).enabled
    });
    assert.deepEqual(callback.state.allItems.value.map(item => item.value), ['FIRST', 'SECOND']);
    assert.deepEqual(callback.state.allItems.value.map(item => item.selectable), [false, true]);
    callback.dispose();

    const unfiltered = setup({ items: [{ id: 'one' }, { id: 'two' }], itemSelectable: null });
    assert.deepEqual(unfiltered.state.allItems.value.map(item => item.selectable), [true, true]);
    unfiltered.dispose();
});

test('standard item transformation follows upstream primitive fallback and selectable truthiness', () => {
    const items = [7, { title: 'No id', selectable: null }, { id: 'row', selectable: 0 }, { id: 'empty', selectable: '' }, { id: 'enabled', selectable: 'yes' }];
    const standard = setup({ items, standardProtocol: true, itemSelectable: 'selectable' }, { itemsPerPage: -1 });
    assert.deepEqual(standard.state.allItems.value.map(item => item.value), [undefined, undefined, 'row', 'empty', 'enabled']);
    assert.deepEqual(standard.state.allItems.value.map(item => item.selectable), [true, false, false, false, true]);
    standard.dispose();

    const explicitNull = setup({ items: [{ id: 'with-id' }, 7], standardProtocol: true, itemValue: null }, { itemsPerPage: -1 });
    assert.deepEqual(explicitNull.state.allItems.value.map(item => item.value), [undefined, undefined]);
    explicitNull.dispose();

    let receivedPrimitive: unknown;
    const callback = setup({
        items: [7],
        standardProtocol: true,
        itemValue: item => {
            receivedPrimitive = item;
            return item;
        }
    });
    assert.equal(receivedPrimitive, 7);
    assert.equal(callback.state.allItems.value[0].value, 7);
    callback.dispose();

    const legacy = setup({ items, itemSelectable: 'selectable' }, { itemsPerPage: -1 });
    assert.deepEqual(legacy.state.allItems.value.map(item => item.value), [7, undefined, 'row', 'empty', 'enabled']);
    assert.deepEqual(legacy.state.allItems.value.map(item => item.selectable), [true, true, true, true, true]);
    legacy.dispose();
});

test('custom filters receive standard wrappers and legacy callbacks retain raw context plus key', () => {
    const item = { id: 'row', title: 'match me' };
    const headers = [{ key: 'title', value: 'title', title: 'Title' }];
    let standardArg: unknown;
    const standard = setup({
        items: [item],
        headers,
        standardProtocol: true,
        search: 'match',
        filterKeys: 'title',
        customFilter: (_value, _query, row) => {
            standardArg = row;
            return true;
        }
    });
    assert.equal(standard.state.filteredItems.value.length, 1);
    assert.equal((standardArg as DataIteratorItem).type, 'item');
    assert.equal((standardArg as DataIteratorItem).raw, item);
    assert.equal((standardArg as DataIteratorItem).value, 'row');
    standard.dispose();

    let legacyArg: unknown;
    let legacyKey = '';
    const legacy = setup({
        items: [item],
        headers,
        search: 'match',
        filterKeys: 'title',
        customFilter: (_value, _query, row, key) => {
            legacyArg = row;
            legacyKey = key;
            return true;
        }
    });
    assert.equal(legacy.state.filteredItems.value.length, 1);
    assert.equal((legacyArg as { raw: unknown }).raw, item);
    assert.equal((legacyArg as { title: string }).title, 'match me');
    assert.equal(legacyKey, 'title');
    legacy.dispose();

    let legacyKeyFilterArg: unknown;
    let legacyKeyFilterKey = '';
    const legacyKeyFilter = setup({
        items: [item],
        headers,
        search: 'match',
        customKeyFilter: {
            title: (_value, _query, row, key) => {
                legacyKeyFilterArg = row;
                legacyKeyFilterKey = key;
                return true;
            }
        }
    });
    assert.equal(legacyKeyFilter.state.filteredItems.value.length, 1);
    assert.equal((legacyKeyFilterArg as { raw: unknown }).raw, item);
    assert.equal(legacyKeyFilterKey, 'title');
    legacyKeyFilter.dispose();

    let keyFilterArg: unknown;
    const keyFilter = setup({
        items: [item],
        headers,
        standardProtocol: true,
        search: 'custom',
        customKeyFilter: {
            title: (_value, _query, row) => {
                keyFilterArg = row;
                return true;
            }
        }
    });
    assert.equal(keyFilter.state.filteredItems.value.length, 1);
    assert.equal((keyFilterArg as DataIteratorItem).raw, item);
    keyFilter.dispose();
});

test('filtering, custom sorting, noFilter, and client pagination reuse pipeline ordering', async () => {
    const items = [
        { id: 1, meta: { title: 'Éclair' }, score: 2 },
        { id: 2, meta: { title: 'Eclair' }, score: 8 },
        { id: 3, meta: { title: 'Zulu' }, score: 4 }
    ];
    const headers = [{ key: 'name', value: ['meta', 'title'], title: 'Name' }, { key: 'score', title: 'Score' }];
    const state = setup({
        items,
        headers,
        search: 'eclair',
        filterKeys: ['name'],
        ignoreAccents: true,
        customKeySort: { score: (left, right) => Number(right) - Number(left) }
    }, { sortBy: [{ key: 'score', order: 'asc' }], itemsPerPage: 1 });
    assert.deepEqual(state.state.filteredItems.value.map(item => item.raw), [items[1], items[0]]);
    assert.deepEqual(state.state.currentItems.value.map(item => item.raw), [items[1]]);
    assert.equal(state.state.slotProps.value.total, 2);
    state.props.noFilter = true;
    await nextTick();
    assert.deepEqual(state.state.filteredItems.value.map(item => item.raw), [items[1], items[2], items[0]]);
    state.props.disableSort = true;
    await nextTick();
    assert.deepEqual(state.state.filteredItems.value.map(item => item.raw), items);
    state.dispose();
});

test('filterMode union and intersection combine default and custom key filters', async () => {
    const items = [
        { id: 'a', title: 'alpha', score: 1, category: 'x' },
        { id: 'b', title: 'beta', score: 9, category: 'x' },
        { id: 'c', title: 'gamma', score: 9, category: 'y' }
    ];
    const headers = [{ key: 'title' }, { key: 'category' }, { key: 'score' }];
    const state = setup({
        items,
        headers,
        search: 'alpha',
        filterKeys: ['title', 'category', 'score'],
        customKeyFilter: { score: value => Number(value) === 9 },
        filterMode: 'union'
    });
    assert.deepEqual(state.state.filteredItems.value.map(item => item.raw), items);
    state.props.filterMode = 'intersection';
    await nextTick();
    assert.deepEqual(state.state.filteredItems.value, []);
    state.dispose();
});

test('sort cycles honor initialSortOrder, mustSort, and modifier multiSort priority', () => {
    const items = [{ id: 1, title: 'A', score: 1 }, { id: 2, title: 'B', score: 2 }];
    const headers = [{ key: 'title' }, { key: 'score' }];
    const strict = setup({ items, headers, initialSortOrder: 'desc', mustSort: true }, { page: 2 });
    strict.state.toggleSort('score');
    assert.deepEqual(strict.models.sortBy.value, [{ key: 'score', order: 'desc' }]);
    assert.equal(strict.models.page.value, 1);
    strict.state.toggleSort('score');
    assert.deepEqual(strict.models.sortBy.value, [{ key: 'score', order: 'asc' }]);
    strict.state.toggleSort('score');
    assert.deepEqual(strict.models.sortBy.value, [{ key: 'score', order: 'desc' }]);
    strict.dispose();

    const multi = setup({ items, headers, multiSort: { key: 'ctrl', mode: 'append', modifier: 'shift' } });
    multi.state.toggleSort('title');
    multi.state.toggleSort('score', { ctrlKey: true, shiftKey: true } as MouseEvent);
    assert.deepEqual(multi.models.sortBy.value, [{ key: 'score', order: 'asc' }, { key: 'title', order: 'asc' }]);
    multi.dispose();
});

test('only standard search changes reset external page state; legacy model updates preserve it', async () => {
    const items = [
        { id: 1, title: 'matching row', score: 4, category: 'A' },
        { id: 2, title: 'matching row', score: 3, category: 'A' },
        { id: 3, title: 'matching row', score: 2, category: 'B' },
        { id: 4, title: 'matching row', score: 1, category: 'B' }
    ];
    const legacy = setup({ items, search: 'match' }, { page: 2, itemsPerPage: 1 });
    legacy.props.search = 'matching';
    await nextTick();
    assert.equal(legacy.models.page.value, 2);
    legacy.models.sortBy.value = [{ key: 'score', order: 'desc' }];
    legacy.models.itemsPerPage.value = 2;
    await nextTick();
    assert.equal(legacy.models.page.value, 2);
    legacy.dispose();

    const standard = setup({ items, search: 'match', standardProtocol: true }, { page: 2, itemsPerPage: 1 });
    standard.props.search = 'matching';
    await nextTick();
    assert.equal(standard.models.page.value, 1);
    standard.models.page.value = 2;
    standard.models.sortBy.value = [{ key: 'score', order: 'desc' }];
    standard.models.groupBy.value = [{ key: 'id' }];
    standard.models.itemsPerPage.value = 2;
    await nextTick();
    assert.equal(standard.models.page.value, 2);
    standard.dispose();
});

test('manual itemsLength skips local slicing but retains filtering, sorting, grouping, and external page count', () => {
    const items = [
        { id: 1, title: 'keep one', category: 'A' },
        { id: 2, title: 'skip', category: 'A' },
        { id: 3, title: 'keep three', category: 'B' }
    ];
    const zeroLength = setup({ items, itemsLength: 0, search: 'keep' }, { page: 1, itemsPerPage: 1 });
    assert.equal(zeroLength.state.pageCount.value, 1);
    assert.deepEqual(zeroLength.state.currentItems.value.map(item => item.raw), [items[0], items[2]]);
    assert.equal(zeroLength.state.slotProps.value.total, 2);
    zeroLength.dispose();

    const grouped = setup({
        items,
        itemsLength: '100',
        search: 'keep',
        groupKey: ({ key, value, parentKey }) => `${parentKey ?? 'root'}/${key}:${value}`
    }, {
        page: 4,
        itemsPerPage: 1,
        groupBy: [{ key: 'category' }],
        opened: ['root/category:A', 'root/category:B']
    });
    assert.equal(grouped.state.pageCount.value, 100);
    assert.deepEqual(grouped.state.currentItems.value.map(item => item.raw), [items[0], items[2]]);
    assert.equal(grouped.state.flatRows.value.length, 4);
    assert.equal(grouped.state.slotProps.value.itemsLength, 100);
    grouped.dispose();
});

test('group sorting, visible-row pagination, wrapper children, openAll, and group actions', async () => {
    const items = [
        { id: 'a1', category: 'A' },
        { id: 'a2', category: 'A' },
        { id: 'b1', category: 'B' }
    ];
    const state = setup({
        items,
        openAll: true,
        groupKey: ({ key, value, parentKey }) => `${parentKey ?? 'root'}/${key}:${value}`
    }, {
        itemsPerPage: 2,
        groupBy: [{ key: 'category', order: 'desc' }],
        sortBy: [{ key: 'id', order: 'desc' }]
    });
    await nextTick();
    assert.deepEqual(state.state.groups.value.map(row => row.type === 'group' ? row.value : row.value), ['B', 'A']);
    assert.deepEqual(state.state.groupedItems.value.map(row => row.value), ['B', 'b1']);
    assert.deepEqual(state.models.opened.value, ['root/category:B', 'root/category:A']);
    assert.equal(state.state.pageCount.value, 3);
    assert.deepEqual(state.state.currentItems.value.map(item => item.raw), [items[2]]);
    const group = state.state.groupedItems.value[0];
    assert.equal(group.type, 'group');
    if (group.type === 'group') {
        assert.equal(group.items[0].type, 'item');
        assert.equal(group.items[0].raw, items[2]);
        state.state.toggleGroup(group);
        await nextTick();
        assert.equal(state.state.isGroupOpen(group), false);
    }
    const secondGroup = state.state.groups.value[1];
    if (secondGroup.type === 'group') {
        assert.ok(secondGroup.items.every(item => item.type === 'item'));
        assert.deepEqual(secondGroup.items.map(item => item.type === 'item' ? item.raw : null), [items[1], items[0]]);
    }
    assert.equal(state.state.slotProps.value.expandOnClick, false);
    state.dispose();
});

test('standard grouping separates full tree, page rows, extracted items, and wrapped currentItems events', async () => {
    const items = [
        { id: 'a1', category: 'A' },
        { id: 'a2', category: 'A' },
        { id: 'b1', category: 'B' }
    ];
    const state = setup({ items, standardProtocol: true }, {
        itemsPerPage: 1,
        groupBy: [{ key: 'category' }]
    });
    await nextTick();

    assert.equal(state.state.groups.value.length, 2);
    assert.deepEqual(state.state.groupedItems.value.map(row => row.type), ['group']);
    const collapsedGroup = state.state.groupedItems.value[0];
    assert.equal(collapsedGroup.type, 'group');
    if (collapsedGroup.type === 'group') {
        assert.deepEqual(collapsedGroup.items.map(row => row.type), ['item', 'item']);
    }
    assert.deepEqual((state.state.slotProps.value.items as DataIteratorItem[]).map(item => item.raw), [items[0], items[1]]);
    assert.deepEqual(state.state.currentItems.value.map(item => item.raw), [items[0], items[1]]);
    assert.deepEqual(state.events.currentItems[0].map(row => (row as DataIteratorItem).type), ['group']);

    state.models.opened.value = ['root_category_A'];
    state.state.setItemsPerPage(2);
    await nextTick();
    assert.deepEqual(state.state.groupedItems.value.map(row => row.type), ['group', 'item']);
    assert.deepEqual((state.state.slotProps.value.items as DataIteratorItem[]).map(item => item.raw), [items[0], items[1]]);
    assert.deepEqual(state.state.currentItems.value.map(item => item.raw), [items[0], items[1]]);
    assert.deepEqual(state.events.currentItems.at(-1)?.map(row => (row as DataIteratorItem).type), ['group', 'item']);
    const eventCount = state.events.currentItems.length;
    state.state.setPage(1);
    await nextTick();
    assert.equal(state.events.currentItems.length, eventCount);
    state.dispose();

    const manual = setup({ items, standardProtocol: true, itemsLength: 3 }, {
        itemsPerPage: 1,
        groupBy: [{ key: 'category' }]
    });
    assert.equal(manual.events.currentItems.length, 0);
    assert.deepEqual((manual.state.slotProps.value.items as DataIteratorItem[]).map(item => item.raw), items);
    manual.dispose();
});

test('selection strategies use selectable source/page wrappers and deep comparison', () => {
    const items = [
        { id: 'a', meta: { rank: 1 }, selectable: true },
        { id: 'b', meta: { rank: 2 }, selectable: false },
        { id: 'c', meta: { rank: 3 }, selectable: true }
    ];
    const page = setup({ items, itemSelectable: 'selectable' }, { itemsPerPage: 1 });
    page.state.selectAll(true);
    assert.deepEqual(page.models.modelValue.value, ['a']);
    page.models.page.value = 3;
    page.state.selectAll(true);
    assert.deepEqual(page.models.modelValue.value, ['a', 'c']);
    page.state.selectAll(false);
    assert.deepEqual(page.models.modelValue.value, ['a']);
    page.dispose();

    const all = setup({ items, itemSelectable: 'selectable', selectStrategy: 'all', search: 'not found' }, { itemsPerPage: 1 });
    all.state.selectAll(true);
    assert.deepEqual(all.models.modelValue.value, ['a', 'c']);
    assert.equal(all.state.slotProps.value.allSelected, true);
    all.dispose();

    const selectedClone = { id: 'a', meta: { rank: 1 }, selectable: true };
    const object = setup({ items, returnObject: true }, { modelValue: [selectedClone] });
    assert.equal(object.state.isSelected(object.state.allItems.value[0]), true);
    object.state.toggleSelect(object.state.allItems.value[0]);
    assert.deepEqual(object.models.modelValue.value, []);
    object.state.select([object.state.allItems.value[2]], true);
    assert.equal(object.models.modelValue.value[0], items[2]);
    object.dispose();

    const comparator = setup({
        items,
        returnObject: true,
        valueComparator: (left, right) => (left as { id: string }).id === (right as { id: string }).id
    }, { modelValue: [{ id: 'a', source: 'external' }] });
    assert.equal(comparator.state.isSelected(comparator.state.allItems.value[0]), true);
    comparator.dispose();

    let seenWrapper: DataIteratorItem | undefined;
    const strategy: DataIteratorSelectionStrategy = {
        showSelectAll: true,
        allSelected: ({ allItems }) => allItems,
        select: ({ items: candidates }) => {
            seenWrapper = candidates[0];
            return new Set(candidates.map(item => item.value));
        },
        selectAll: ({ currentPage }) => new Set(currentPage.map(item => item.value))
    };
    const custom = setup({ items, selectStrategy: strategy }, { itemsPerPage: -1 });
    custom.state.toggleSelect(custom.state.allItems.value[0]);
    assert.equal(seenWrapper?.raw, items[0]);
    assert.deepEqual(custom.models.modelValue.value, ['a']);
    custom.dispose();
});

test('single selection, expanded models, disabled/loading action guards, and page helpers', async () => {
    const single = setup({ selectStrategy: 'single', expandStrategy: 'single', expandOnClick: true }, { itemsPerPage: 1 });
    single.state.toggleSelect(single.state.allItems.value[0]);
    single.state.toggleSelect(single.state.allItems.value[2]);
    assert.deepEqual(single.models.modelValue.value, ['c']);
    single.state.toggleExpand(single.state.allItems.value[0]);
    single.state.toggleExpand(single.state.allItems.value[2]);
    assert.deepEqual(single.models.expanded.value, ['c']);
    assert.equal(single.state.isExpanded(single.state.allItems.value[2]), true);
    assert.equal(single.state.slotProps.value.expandOnClick, true);
    single.state.setPage(3);
    await nextTick();
    assert.equal(single.models.page.value, 3);
    single.state.setItemsPerPage(-1);
    await nextTick();
    assert.equal(single.state.size.value, -1);
    assert.equal(single.models.page.value, 1);
    single.state.prevPage();
    assert.equal(single.models.page.value, 1);
    single.state.nextPage();
    assert.equal(single.models.page.value, 1);
    single.dispose();

    for (const props of [{ disabled: true }, { loading: true }]) {
        const blocked = setup(props, { opened: [], expanded: ['a'] });
        blocked.state.selectAll(true);
        blocked.state.toggleExpand(blocked.state.allItems.value[0]);
        blocked.state.toggleSort('title');
        blocked.state.setPage(2);
        blocked.state.setItemsPerPage(1);
        blocked.state.toggleGroup({ type: 'group', id: 'g', key: 'category', title: 'A', value: 'A', depth: 0, items: [] });
        assert.deepEqual(blocked.models.modelValue.value, []);
        assert.deepEqual(blocked.models.expanded.value, ['a']);
        assert.deepEqual(blocked.models.sortBy.value, []);
        assert.equal(blocked.models.page.value, 1);
        assert.equal(blocked.models.itemsPerPage.value, 2);
        assert.deepEqual(blocked.models.opened.value, []);
        blocked.dispose();
    }
});

test('options emit immediately and once per actual deep change; currentItems event contains raw rows', async () => {
    const setupState = setup({}, { itemsPerPage: 1 });
    await nextTick();
    assert.equal(setupState.events.options.length, 1);
    assert.equal(setupState.events.currentItems.length, 1);
    assert.deepEqual(setupState.events.currentItems[0], [sourceItems[0]]);

    setupState.state.setPage(2);
    await nextTick();
    assert.equal(setupState.events.options.length, 2);
    assert.deepEqual(setupState.events.currentItems.at(-1), [sourceItems[1]]);
    setupState.state.setPage(2);
    await nextTick();
    assert.equal(setupState.events.options.length, 2);
    assert.equal(setupState.events.currentItems.length, 2);

    setupState.models.sortBy.value.push({ key: 'score', order: 'desc' });
    await nextTick();
    assert.equal(setupState.events.options.length, 3);
    assert.equal(setupState.events.options.at(-1)?.page, 2);
    assert.deepEqual(setupState.events.options.at(-1)?.sortBy, [{ key: 'score', order: 'desc' }]);
    setupState.models.sortBy.value[0].order = 'asc';
    await nextTick();
    assert.equal(setupState.events.options.length, 4);
    assert.equal(setupState.events.options.at(-1)?.sortBy[0].order, 'asc');

    setupState.props.search = 'Zulu';
    await nextTick();
    assert.equal(setupState.events.options.length, 5);
    assert.equal(setupState.events.options.at(-1)?.page, 1);
    setupState.dispose();
});
