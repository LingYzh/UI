import test from 'node:test';
import assert from 'node:assert/strict';
import { isCascaderPathValid, resolveCascaderPath, type CascaderItem } from '../src/ui/cascader';

const items: CascaderItem[] = [
    { value: 'a', label: 'A', children: [{ value: 0, label: 'Zero' }, { value: 'locked', label: 'Locked', disabled: true }] },
    { value: 'b', label: 'B', children: [{ value: 0, label: 'Other zero' }] },
    { value: 'locked-branch', label: 'Locked branch', disabled: true, children: [{ value: 'leaf', label: 'Leaf' }] }
];

test('cascader paths resolve values within each branch and preserve numeric zero', () => {
    assert.deepEqual(resolveCascaderPath(items, ['a', 0]).map(item => item.label), ['A', 'Zero']);
    assert.deepEqual(resolveCascaderPath(items, ['b', 0]).map(item => item.label), ['B', 'Other zero']);
    assert.equal(isCascaderPathValid(items, ['a', 0]), true);
    assert.equal(isCascaderPathValid(items, ['a', '0']), false);
});

test('cascader rejects incomplete, stale, disabled and overlong paths', () => {
    assert.equal(isCascaderPathValid(items, []), true, 'required is handled separately by form validation');
    assert.equal(isCascaderPathValid(items, ['a']), false);
    assert.equal(isCascaderPathValid(items, ['a'], true), true);
    for (const path of [['a', 'locked'], ['locked-branch', 'leaf'], ['missing'], ['a', 0, 'extra']]) {
        assert.equal(isCascaderPathValid(items, path), false);
    }
    assert.equal(isCascaderPathValid([], ['a', 0]), false, 'removed items invalidate prior selections');
});
