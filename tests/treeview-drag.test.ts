import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compileScript, parse } from '@vue/compiler-sfc';
import {
    canTreeviewDrop,
    moveTreeviewItem,
    type TreeviewDropPosition,
    type TreeviewItemAccess
} from '../src/ui/treeview-drag';

interface Item {
    id: string;
    children?: Item[];
    nodes?: Item[];
    disabled?: boolean;
}

const access: TreeviewItemAccess<Item> = {
    getValue: (item) => item.id,
    childrenKey: 'children'
};

function deepFreeze<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value as Record<string, unknown>).forEach((child) => deepFreeze(child));
    }
    return value;
}

function ids(items: readonly Item[], childrenKey = 'children'): unknown[] {
    return items.flatMap((item) => [item.id, ...ids(childrenKey === 'children' ? item.children ?? [] : item.nodes ?? [], childrenKey)]);
}

test('treeview drag reorders siblings before and after without mutating frozen inputs', () => {
    const items = deepFreeze<Item[]>([
        { id: 'a' },
        { id: 'b' },
        { id: 'c' }
    ]);

    const before = moveTreeviewItem(items, 'c', 'a', 'before', access);
    assert.equal(before.changed, true);
    assert.deepEqual(before.items.map((item) => item.id), ['c', 'a', 'b']);
    assert.equal(before.items[0], items[2], 'the moved item keeps its object identity');
    assert.equal(before.items[2], items[1], 'unchanged siblings keep their object identity');

    const after = moveTreeviewItem(items, 'a', 'b', 'after', access);
    assert.equal(after.changed, true);
    assert.deepEqual(after.items.map((item) => item.id), ['b', 'a', 'c']);
    assert.deepEqual(items.map((item) => item.id), ['a', 'b', 'c']);
});

test('treeview drag appends into root and nested targets using immutable child paths', () => {
    const source = { id: 'source' };
    const target = { id: 'target', children: [{ id: 'existing' }] };
    const untouched = { id: 'untouched' };
    const items = deepFreeze<Item[]>([source, target, untouched]);

    const moved = moveTreeviewItem(items, 'source', 'target', 'inner', access);
    assert.equal(moved.changed, true);
    assert.deepEqual(moved.items.map((item) => item.id), ['target', 'untouched']);
    assert.deepEqual(moved.items[0]?.children?.map((item) => item.id), ['existing', 'source']);
    assert.notEqual(moved.items[0], target);
    assert.equal(moved.items[0]?.children?.[1], source);
    assert.equal(moved.items[1], untouched);
    assert.deepEqual(target.children?.map((item) => item.id), ['existing']);

    const emptyTarget = { id: 'empty' };
    const rootMove = moveTreeviewItem([source, emptyTarget], 'source', 'empty', 'inner', access);
    assert.deepEqual(rootMove.items, [{ id: 'empty', children: [source] }]);
});

test('treeview drag relocates targets by id after removing a source before them', () => {
    const items = deepFreeze<Item[]>([
        { id: 'first' },
        { id: 'source' },
        { id: 'middle' },
        { id: 'target' },
        { id: 'last' }
    ]);

    const moved = moveTreeviewItem(items, 'source', 'target', 'before', access);
    assert.deepEqual(moved.items.map((item) => item.id), ['first', 'middle', 'source', 'target', 'last']);
    assert.equal(ids(moved.items).includes('target'), true);
});

test('treeview drag moves across branches and preserves unrelated node references', () => {
    const source = { id: 'source' };
    const leftKeep = { id: 'left-keep' };
    const target = { id: 'target' };
    const untouched = { id: 'untouched' };
    const left = { id: 'left', children: [source, leftKeep] };
    const right = { id: 'right', children: [target] };
    const items = deepFreeze<Item[]>([left, right, untouched]);

    const moved = moveTreeviewItem(items, 'source', 'target', 'after', access);
    assert.equal(moved.changed, true);
    assert.deepEqual(ids(moved.items), ['left', 'left-keep', 'right', 'target', 'source', 'untouched']);
    assert.notEqual(moved.items[0], left);
    assert.notEqual(moved.items[1], right);
    assert.equal(moved.items[2], untouched);
    assert.equal(moved.items[0]?.children?.[0], leftKeep);
    assert.equal(moved.items[1]?.children?.[1], source);
    assert.deepEqual(left.children?.map((item) => item.id), ['source', 'left-keep']);
    assert.deepEqual(right.children?.map((item) => item.id), ['target']);
});

test('treeview drag rejects cycles, self-drops, unknown ids, and unchanged adjacent positions', () => {
    const items = deepFreeze<Item[]>([
        { id: 'parent', children: [{ id: 'child', children: [{ id: 'grandchild' }] }] },
        { id: 'before' },
        { id: 'after' }
    ]);
    const positions: TreeviewDropPosition[] = ['before', 'inner', 'after'];

    for (const position of positions) {
        const selfDrop = moveTreeviewItem(items, 'child', 'child', position, access);
        const descendantDrop = moveTreeviewItem(items, 'parent', 'grandchild', position, access);
        assert.equal(selfDrop.changed, false);
        assert.equal(selfDrop.items, items);
        assert.equal(descendantDrop.changed, false);
        assert.equal(descendantDrop.items, items);
        assert.equal(canTreeviewDrop(items, 'parent', 'grandchild', position, access), false);
    }

    const missing = moveTreeviewItem(items, 'missing', 'before', 'before', access);
    assert.equal(missing.changed, false);
    assert.equal(missing.items, items);

    const missingTarget = moveTreeviewItem(items, 'before', 'missing', 'after', access);
    assert.equal(missingTarget.changed, false);
    assert.equal(missingTarget.items, items);

    const siblings = deepFreeze<Item[]>([{ id: 'one' }, { id: 'two' }]);
    const adjacentBefore = moveTreeviewItem(siblings, 'one', 'two', 'before', access);
    const adjacentAfter = moveTreeviewItem(siblings, 'two', 'one', 'after', access);
    assert.equal(adjacentBefore.changed, false);
    assert.equal(adjacentBefore.items, siblings);
    assert.equal(adjacentAfter.changed, false);
    assert.equal(adjacentAfter.items, siblings);

    const alreadyInside = deepFreeze<Item[]>([{ id: 'target', children: [{ id: 'source' }] }]);
    const innerNoOp = moveTreeviewItem(alreadyInside, 'source', 'target', 'inner', access);
    assert.equal(innerNoOp.changed, false);
    assert.equal(innerNoOp.items, alreadyInside);
});

test('treeview drop guard rejects disabled nodes and an allowDrop veto', () => {
    const source = { id: 'source' };
    const target = { id: 'target' };
    const disabled = { id: 'disabled', disabled: true };
    const items: Item[] = [source, target, disabled];
    const calls: Array<{ source: Item; target: Item; position: TreeviewDropPosition }> = [];

    const allowed = canTreeviewDrop(items, 'source', 'target', 'after', {
        ...access,
        allowDrop: (dragRaw, targetRaw, position) => {
            calls.push({ source: dragRaw, target: targetRaw, position });
            return false;
        }
    });
    assert.equal(allowed, false);
    assert.deepEqual(calls, [{ source, target, position: 'after' }]);

    const disabledTarget = canTreeviewDrop(items, 'source', 'disabled', 'inner', {
        ...access,
        isDisabled: (item) => item.disabled === true
    });
    assert.equal(disabledTarget, false);
});

test('treeview drag helper supports the configured string children field', () => {
    const source = { id: 'source' };
    const items = deepFreeze<Item[]>([
        source,
        { id: 'target', nodes: [] }
    ]);
    const moved = moveTreeviewItem(items, 'source', 'target', 'inner', {
        getValue: (item) => item.id,
        childrenKey: 'nodes'
    });

    assert.equal(moved.changed, true);
    assert.deepEqual(moved.items, [{ id: 'target', nodes: [source] }]);
});

test('UTreeview drag handlers compile from the real SFC source', async () => {
    const filename = fileURLToPath(new URL('../src/ui/UTreeview.vue', import.meta.url));
    const source = await readFile(filename, 'utf8');
    const parsed = parse(source, { filename });
    assert.deepEqual(parsed.errors, []);
    assert.ok(parsed.descriptor.template);

    const compiled = compileScript(parsed.descriptor, { id: 'treeview-drag-test', inlineTemplate: true });
    assert.match(compiled.content, /data-drop-position/);
});
