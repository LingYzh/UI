import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeItems } from '../src/ui/selection';
import { filterSelectionItems, matchesSelectionItem } from '../src/ui/selection-filter';

const items = normalizeItems([
    { title: 'Café Alpha', score: 10, nested: { code: 'A-10' } },
    { title: 'Beta', score: 3, nested: { code: 'B-03' } }
]);

test('selection default filtering supports case-insensitive accent matching and nested keys', () => {
    assert.deepEqual(filterSelectionItems(items, 'cafe', { ignoreAccents: true }).map(item => item.title), ['Café Alpha']);
    assert.deepEqual(filterSelectionItems(items, 'A-10', { filterKeys: ['nested.code'] }).map(item => item.title), ['Café Alpha']);
    assert.deepEqual(filterSelectionItems(items, 'ALPHA').map(item => item.title), ['Café Alpha']);
});

test('custom filters accept booleans, positions and match ranges', () => {
    const positional = (value: unknown) => value === 'Café Alpha' ? 5 : -1;
    const ranged = (value: unknown) => value === 'Beta' ? [0, 2] as const : false;
    assert.deepEqual(filterSelectionItems(items, 'Alpha', { customFilter: positional }).map(item => item.title), ['Café Alpha']);
    assert.deepEqual(filterSelectionItems(items, 'Be', { customFilter: ranged }).map(item => item.title), ['Beta']);
    assert.equal(matchesSelectionItem(items[0], 'anything', { customFilter: () => -1 }), false);
});

test('custom key filters compose according to the standard filter modes', () => {
    const options = {
        filterKeys: ['title', 'score'],
        customKeyFilter: { score: (value: unknown) => Number(value) >= 8 }
    };
    assert.deepEqual(filterSelectionItems(items, '8', { ...options, filterMode: 'union' }).map(item => item.title), ['Café Alpha']);
    assert.deepEqual(filterSelectionItems(items, '8', { ...options, filterMode: 'some' }).map(item => item.title), ['Café Alpha']);
    assert.deepEqual(filterSelectionItems(items, '8', { ...options, filterMode: 'every' }), []);
    assert.deepEqual(filterSelectionItems(items, '8', { ...options, filterMode: 'intersection' }), []);
    assert.deepEqual(filterSelectionItems(items, 'Alpha', { filterKeys: ['title', 'score'], filterMode: 'every' }), []);
});

test('legacy item/query filter remains active and gates standard filtering when both are supplied', () => {
    const legacy = (item: typeof items[number], query: string) => item.title.startsWith('Café') || query === 'allow';
    assert.deepEqual(filterSelectionItems(items, 'Beta', {}, legacy), ['Café Alpha'].map(title => items.find(item => item.title === title)!));
    assert.deepEqual(filterSelectionItems(items, '8', {
        filterKeys: ['score'],
        customFilter: value => Number(value) >= 8
    }, legacy), [items[0]]);
    assert.deepEqual(filterSelectionItems(items, 'blocked', { noFilter: true }, () => false), items);
});
