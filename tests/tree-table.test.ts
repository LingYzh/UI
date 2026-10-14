import assert from 'node:assert/strict';
import test from 'node:test';
import { treeTableRows } from '../src/ui/tree-table';

test('tree rows retain record identity, sibling order and collapsed descendant state', () => {
    const leaf = { id: 111, name: '三级' };
    const items = [{ id: 1, children: [{ id: 11, children: [leaf] }, { id: 12 }] }, { id: 2 }];
    assert.deepEqual(treeTableRows(items, []).rows.map(row => row.key), [1, 2]);
    const opened = treeTableRows(items, [1, 11]);
    assert.deepEqual(opened.rows.map(row => row.key), [1, 11, 111, 12, 2]);
    assert.deepEqual(opened.rows.map(row => row.depth), [0, 1, 2, 1, 0]);
    assert.equal(opened.rows[2].item, leaf);
    assert.deepEqual(treeTableRows(items, [11]).rows.map(row => row.key), [1, 2]);
    assert.deepEqual(opened.branches, [1, 11]);
});

test('mapped fields preserve ID types and refreshed data never produces stale rows', () => {
    const items = [{ key: '0', nodes: [{ key: 0 }] }];
    assert.deepEqual(treeTableRows(items, ['0'], 'key', 'nodes').rows.map(row => row.key), ['0', 0]);
    assert.deepEqual(treeTableRows([], ['0'], 'key', 'nodes'), { rows: [], branches: [] });
});
