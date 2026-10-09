import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateStepperValue, normalizeStepperItems } from '../src/ui/stepper-selection';

test('normalizes stepper items from title, value and props paths', () => {
    const source = [
        { labels: { step: 'Account' }, ids: { key: 'account' }, props: { disabled: true } },
        { labels: { step: 'Review' }, ids: {}, props: { icon: 'mdi-check' } }
    ];

    assert.deepEqual(normalizeStepperItems(source, {
        itemTitle: 'labels.step',
        itemValue: 'ids.key',
        itemProps: 'props'
    }), [
        { raw: source[0], title: 'Account', value: 'account', props: { disabled: true } },
        { raw: source[1], title: 'Review', value: 2, props: { icon: 'mdi-check' } }
    ]);
});

test('supports computed fields and boolean itemProps modes', () => {
    const source = [{ key: 'custom', label: 'Custom', children: [], extra: 4 }];

    assert.deepEqual(normalizeStepperItems(source, {
        itemTitle: item => (item as { label: string }).label.toUpperCase(),
        itemValue: item => (item as { key: string }).key,
        itemProps: true
    })[0], {
        raw: source[0],
        title: 'CUSTOM',
        value: 'custom',
        props: { key: 'custom', label: 'Custom', extra: 4 }
    });
    assert.deepEqual(normalizeStepperItems(source, { itemProps: false })[0].props, {});
});

test('assigns missing item values by one-based position and avoids registered numeric values', () => {
    assert.deepEqual(normalizeStepperItems(['One', 'Two']).map(item => item.value), [1, 2]);
    assert.equal(allocateStepperValue([]), 1);
    assert.equal(allocateStepperValue([1, 3]), 4);
});
