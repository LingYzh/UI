import assert from 'node:assert/strict';
import test from 'node:test';
import {
    canonicalizeListValue,
    getItemField,
    toggleListValue,
    toggleTreeValues,
    treeSelectionState
} from '../src/ui/list-completion';

test('list values canonicalize to registered objects without coercing primitive types', () => {
    const registered = { id: 7, nested: { enabled: true } };
    assert.equal(canonicalizeListValue({ id: 7, nested: { enabled: true } }, [registered]), registered);
    assert.equal(canonicalizeListValue('7', [7]), '7');
    assert.equal(canonicalizeListValue(7, ['7']), 7);
});

test('list selection helpers compare object values with the shared comparator', () => {
    const first = { id: 'first' };
    const equivalent = { id: 'first' };
    const second = { id: 'second' };
    assert.deepEqual(toggleListValue([first], equivalent, true, false), []);
    assert.deepEqual(toggleListValue([first], second, true, false), [first, second]);
    assert.deepEqual(toggleListValue([first], equivalent, false, true), [first]);
});

test('tree selection helpers accept the same object comparator', () => {
    const compareById = (left: unknown, right: unknown) => {
        return !!left && !!right && typeof left === 'object' && typeof right === 'object'
            && (left as { id?: unknown }).id === (right as { id?: unknown }).id;
    };
    const parent = { id: 'parent' };
    const child = { id: 'child' };
    assert.equal(treeSelectionState([parent, child], [{ id: 'child' }], compareById), 'mixed');
    assert.deepEqual(toggleTreeValues([{ id: 'child' }], [parent, child], true, false, compareById), [
        { id: 'child' },
        parent
    ]);
});

test('list item fields preserve function and nested-path selectors', () => {
    const item = { meta: { id: 12 }, label: 'Twelve' };
    assert.equal(getItemField(item, 'meta.id', 0), 12);
    assert.equal(getItemField(item, (value) => (value as typeof item).label, ''), 'Twelve');
    assert.equal(getItemField(item, 'missing.path', 'fallback'), 'fallback');
});
