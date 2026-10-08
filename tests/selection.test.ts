import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultValueComparator, normalizeItems } from '../src/ui/selection';

test('normalizeItems consumes the default nested props bag and preserves selector overrides', () => {
    const item = { id: 'locked', title: 'Locked', value: 'locked', props: { disabled: true }, children: [] };

    const defaults = normalizeItems([item])[0];
    assert.equal(defaults.disabled, true);
    assert.deepEqual(defaults.props, { disabled: true });

    const disabledMapping = normalizeItems([item], { itemProps: false })[0];
    assert.equal(disabledMapping.disabled, false);
    assert.deepEqual(disabledMapping.props, {});

    const customPath = normalizeItems([{ title: 'Mapped', value: 2, settings: { disabled: true } }], { itemProps: 'settings' })[0];
    assert.equal(customPath.disabled, true);
    assert.deepEqual(customPath.props, { disabled: true });

    const customFunction = normalizeItems([item], { itemProps: raw => (raw as typeof item).props })[0];
    assert.equal(customFunction.disabled, true);
    assert.deepEqual(customFunction.props, { disabled: true });
});

test('defaultValueComparator recursively compares objects and handles cyclic references', () => {
    const left: { nested: { value: number }; self?: unknown } = { nested: { value: 1 } };
    const right: { nested: { value: number }; self?: unknown } = { nested: { value: 1 } };
    left.self = left;
    right.self = right;

    assert.equal(defaultValueComparator(left, right), true);
    assert.equal(defaultValueComparator({ nested: { value: 1 }, extra: true }, { nested: { value: 1 } }), false);
    assert.equal(defaultValueComparator(new Date('2026-10-08T00:00:00.000Z'), new Date('2026-10-08T00:00:00.000Z')), true);
    assert.equal(defaultValueComparator(new Date('2026-10-08T00:00:00.000Z'), new Date('2026-10-09T00:00:00.000Z')), false);
});
