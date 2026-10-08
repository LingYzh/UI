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
