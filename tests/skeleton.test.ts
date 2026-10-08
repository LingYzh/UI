import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSkeletonTree, resolveSkeletonTree, rootTypes } from '../src/ui/skeleton';

test('root skeleton patterns match the complete Vuetify 4.2.4 table', () => {
    assert.deepEqual(rootTypes, {
        actions: 'button@2',
        article: 'heading, paragraph',
        avatar: 'avatar',
        button: 'button',
        card: 'image, heading',
        'card-avatar': 'image, list-item-avatar',
        chip: 'chip',
        'chip-group': 'chip@8',
        'date-picker': 'list-item, heading, divider, date-picker-options, date-picker-days, actions',
        'date-picker-options': 'text, avatar@2',
        'date-picker-days': 'avatar@28',
        divider: 'divider',
        heading: 'heading',
        image: 'image',
        'list-item': 'text',
        'list-item-avatar': 'avatar, text',
        'list-item-two-line': 'sentences',
        'list-item-avatar-two-line': 'avatar, sentences',
        'list-item-three-line': 'paragraph',
        'list-item-avatar-three-line': 'avatar, paragraph',
        ossein: 'ossein',
        paragraph: 'text@3',
        sentences: 'text@2',
        subtitle: 'text',
        table: 'table-heading, table-thead, table-tbody, table-tfoot',
        'table-heading': 'heading, text',
        'table-thead': 'heading@6',
        'table-tbody': 'table-row-divider@6',
        'table-row-divider': 'table-row, divider',
        'table-row': 'table-cell@6',
        'table-cell': 'text',
        'table-tfoot': 'text@2, avatar@2',
        text: 'text'
    });
});

test('comma expressions, @repeat, and array inputs expand to ordered pure trees', () => {
    assert.deepEqual(buildSkeletonTree('text@3, avatar'), [
        { type: 'text', children: [] },
        { type: 'text', children: [] },
        { type: 'text', children: [] },
        { type: 'avatar', children: [] }
    ]);
    assert.deepEqual(buildSkeletonTree(['button@2', 'heading']), [
        { type: 'button', children: [] },
        { type: 'button', children: [] },
        { type: 'heading', children: [] }
    ]);
    assert.deepEqual(buildSkeletonTree('card'), [
        {
            type: 'card',
            children: [
                { type: 'image', children: [] },
                { type: 'heading', children: [] }
            ]
        }
    ]);
    assert.deepEqual(buildSkeletonTree('table').map(node => node.type), ['table']);
    assert.deepEqual(buildSkeletonTree('table')[0].children.map(node => node.type), [
        'table-heading', 'table-thead', 'table-tbody', 'table-tfoot'
    ]);
    assert.equal(buildSkeletonTree('date-picker-days')[0].children.length, 28);
});

test('custom type definitions override built-ins and self-referencing basics remain leaves', () => {
    assert.deepEqual(buildSkeletonTree('text', { types: { text: 'avatar@2' } }), [
        {
            type: 'text',
            children: [
                { type: 'avatar', children: [] },
                { type: 'avatar', children: [] }
            ]
        }
    ]);
    assert.deepEqual(buildSkeletonTree('avatar'), [{ type: 'avatar', children: [] }]);
    assert.deepEqual(buildSkeletonTree('my-bone', { types: { 'my-bone': 'my-bone' } }), [{ type: 'my-bone', children: [] }]);
});

test('unknown bones fall back to leaves and report the unknown names', () => {
    const result = resolveSkeletonTree('missing, known', { types: { known: 'known' } });
    assert.deepEqual(result.tree, [
        { type: 'missing', children: [] },
        { type: 'known', children: [] }
    ]);
    assert.deepEqual(result.unknownTypes, ['missing']);
    assert.equal(result.truncated, false);
});

test('custom reference cycles stop at the repeated reference and mark truncation', () => {
    const result = resolveSkeletonTree('a', { types: { a: 'b', b: 'a' } });
    assert.deepEqual(result.tree, [{ type: 'a', children: [{ type: 'b', children: [] }] }]);
    assert.equal(result.truncated, true);
    assert.deepEqual(result.unknownTypes, []);
});

test('node and depth limits bound repeated and chained custom patterns', () => {
    const repeated = resolveSkeletonTree('avatar@1000', { maxNodes: 4 });
    assert.equal(repeated.tree.length, 4);
    assert.equal(repeated.truncated, true);

    const deep = resolveSkeletonTree('a', {
        types: { a: 'b', b: 'c', c: 'avatar' },
        maxDepth: 1
    });
    assert.deepEqual(deep.tree, [{ type: 'a', children: [{ type: 'b', children: [] }] }]);
    assert.equal(deep.truncated, true);
});
