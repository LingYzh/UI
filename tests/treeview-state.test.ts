import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultValueComparator } from '../src/ui/selection';
import {
    filterTreeviewNodes,
    modelValuesToTreeviewIds,
    resolveTreeviewItemProps,
    treeviewIdsToModelValues,
    type TreeviewFilterNode
} from '../src/ui/treeview-state';

type Id = string | number;
interface Item {
    id: Id;
    title: string;
    metadata?: { name?: string };
    children?: Item[];
    props?: Record<string, unknown>;
    custom?: Record<string, unknown>;
}

const nodes: TreeviewFilterNode<Id>[] = [
    { id: 'root', parent: undefined, children: ['group', 'other'], raw: { id: 'root', title: 'Root' } },
    { id: 'group', parent: 'root', children: ['needle', 'quiet'], raw: { id: 'group', title: 'Group' } },
    { id: 'needle', parent: 'group', children: [], raw: { id: 'needle', title: 'Find me', metadata: { name: 'chosen' } } },
    { id: 'quiet', parent: 'group', children: [], raw: { id: 'quiet', title: 'Quiet' } },
    { id: 'other', parent: 'root', children: [], raw: { id: 'other', title: 'Other' } }
];

test('tree search includes matching items, ancestor paths, and descendants of matching branches', () => {
    const state = filterTreeviewNodes({
        nodes,
        query: 'find',
        filterKeys: ['title'],
        getField: (item, key) => typeof key === 'function' ? key(item) : String(key).split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, item)
    });

    assert.deepEqual([...state.matched], ['needle']);
    assert.deepEqual([...state.visible], ['needle', 'group', 'root']);
    assert.deepEqual([...state.expanded], ['group', 'root']);

    const branch = filterTreeviewNodes({
        nodes,
        query: 'group',
        filterKeys: ['title'],
        getField: (item, key) => (item as Record<string, unknown>)[String(key)]
    });
    assert.deepEqual([...branch.visible], ['group', 'root', 'needle', 'quiet']);
    assert.deepEqual([...branch.expanded], ['root', 'group']);
});

test('tree search supports function selectors, custom filters, and empty-query reset', () => {
    const custom = filterTreeviewNodes({
        nodes,
        query: 'chosen',
        filterKeys: [(item) => (item as Item).metadata?.name],
        getField: (item, key) => typeof key === 'function' ? key(item) : undefined,
        customFilter: (value, query, item) => String(value ?? '').startsWith(query) && Boolean((item as Item).metadata)
    });
    assert.deepEqual([...custom.matched], ['needle']);

    const all = filterTreeviewNodes({
        nodes,
        query: '  ',
        filterKeys: ['title'],
        getField: () => undefined
    });
    assert.deepEqual([...all.visible], nodes.map((node) => node.id));
    assert.equal(all.expanded.size, 0);
});

test('tree search applies Vuetify filter modes and passes the raw item to key filters', () => {
    const rows = [
        { id: 'default-only', title: 'Beta', department: 'Other', rank: 1 },
        { id: 'custom-and-default', title: 'Other', department: 'Beta', rank: 9 },
        { id: 'all', title: 'Beta', department: 'Beta', rank: 9 }
    ];
    const rowNodes: TreeviewFilterNode<string>[] = rows.map((raw) => ({ id: raw.id, parent: undefined, children: [], raw }));
    const rawItems: unknown[] = [];
    const shared = {
        nodes: rowNodes,
        query: 'Beta',
        filterKeys: ['title', 'department', 'rank'],
        getField: (item: unknown, key: string | ((item: unknown) => unknown)) => typeof key === 'function'
            ? key(item)
            : (item as Record<string, unknown>)[key],
        customKeyFilter: {
            rank: (value: unknown, _query: string, item: unknown) => {
                rawItems.push(item);
                return Number(value) >= 8;
            }
        }
    };

    assert.deepEqual([...filterTreeviewNodes({ ...shared, filterMode: 'some' }).matched], ['default-only', 'custom-and-default', 'all']);
    assert.deepEqual([...filterTreeviewNodes({ ...shared, filterMode: 'every' }).matched], ['all']);
    assert.deepEqual([...filterTreeviewNodes({ ...shared, filterMode: 'union' }).matched], ['default-only', 'custom-and-default', 'all']);
    assert.deepEqual([...filterTreeviewNodes({ ...shared, filterMode: 'intersection' }).matched], ['custom-and-default', 'all']);
    assert.ok(rawItems.every((item) => rows.includes(item as typeof rows[number])), 'custom key filters receive original items');
});

test('tree filter accepts numeric indexes, booleans, match ranges, and rejects empty ranges', () => {
    const node = [nodes[2]];
    const filter = (customFilter: (value: unknown, query: string, item: unknown) => unknown) => filterTreeviewNodes({
        nodes: node,
        query: 'find',
        filterKeys: ['title'],
        getField: (item, key) => (item as Record<string, unknown>)[String(key)],
        customFilter
    });

    assert.deepEqual([...filter(() => 0).matched], ['needle']);
    assert.deepEqual([...filter(() => true).matched], ['needle']);
    assert.deepEqual([...filter(() => [[0, 4]]).matched], ['needle']);
    assert.deepEqual([...filter(() => []).matched], []);
    assert.deepEqual([...filter(() => false).matched], []);
    assert.deepEqual([...filter(() => -1).matched], []);
});

test('tree filter ignores accents on the configured side and noFilter keeps branches closed', () => {
    const accentNodes: TreeviewFilterNode<string>[] = [
        { id: 'accented', parent: undefined, children: [], raw: { title: 'Éclair' } },
        { id: 'plain', parent: undefined, children: [], raw: { title: 'Eclair' } }
    ];
    const filter = (query: string, ignoreAccents: 'query' | 'target' | true) => filterTreeviewNodes({
        nodes: accentNodes,
        query,
        filterKeys: ['title'],
        getField: (item, key) => (item as Record<string, unknown>)[String(key)],
        ignoreAccents
    });

    assert.deepEqual([...filter('eclair', 'target').matched], ['accented', 'plain']);
    assert.deepEqual([...filter('eclair', true).matched], ['accented', 'plain']);
    assert.deepEqual([...filter('Éclair', 'query').matched], ['accented', 'plain']);
    assert.deepEqual([...filter('eclair', 'query').matched], ['plain']);
    assert.deepEqual([...filter('Éclair', 'target').matched], ['accented']);

    const unfiltered = filterTreeviewNodes({
        nodes,
        query: 'missing',
        filterKeys: ['title'],
        getField: (item, key) => (item as Record<string, unknown>)[String(key)],
        customKeyFilter: { title: () => false },
        noFilter: true
    });
    assert.deepEqual([...unfiltered.visible], nodes.map((entry) => entry.id));
    assert.equal(unfiltered.matched.size, 0);
    assert.equal(unfiltered.expanded.size, 0);
});

test('custom itemProps selector supports props field, direct item props, and disabled opt-out', () => {
    assert.deepEqual(resolveTreeviewItemProps({ title: 'one', props: { disabled: true, id: 'row' } }, undefined), { disabled: true, id: 'row' });
    assert.deepEqual(resolveTreeviewItemProps({ title: 'two', disabled: true, children: [] }, true), { title: 'two', disabled: true });
    assert.deepEqual(resolveTreeviewItemProps({ title: 'three', props: { id: 'three' } }, false), {});
    assert.deepEqual(resolveTreeviewItemProps({ config: { id: 'custom' } }, 'config'), { id: 'custom' });
    assert.deepEqual(resolveTreeviewItemProps({ custom: { value: 1 } }, (item) => (item as Item).custom), { value: 1 });
});

test('tree model mapping honors comparators and returnObject values', () => {
    const items: Item[] = [
        { id: 1, title: 'one' },
        { id: 2, title: 'two' }
    ];
    const itemNodes: TreeviewFilterNode<Id>[] = items.map((raw) => ({
        id: raw.id,
        parent: undefined,
        children: [],
        raw
    }));
    const equivalentItem = { id: 1, title: 'one' };
    const ids = modelValuesToTreeviewIds(itemNodes, [equivalentItem], (node) => node.raw, defaultValueComparator);
    assert.deepEqual(ids, [1]);
    assert.deepEqual(treeviewIdsToModelValues(itemNodes, ids, (node) => node.raw), [items[0]]);
    assert.deepEqual(modelValuesToTreeviewIds(itemNodes, [2], (node) => node.id, defaultValueComparator), [2]);
});
