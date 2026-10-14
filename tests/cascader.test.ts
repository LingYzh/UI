import test from 'node:test';
import assert from 'node:assert/strict';
import {
    areCascaderPathsEqual,
    canToggleCascaderPath,
    collectCascaderLeafPaths,
    getCascaderSelectionState,
    hasCascaderPath,
    isCascaderPathDisabled,
    isCascaderPathValid,
    isCascaderPathsValid,
    normalizeCascaderPaths,
    resolveCascaderPath,
    searchCascaderPaths,
    searchSelectableCascaderPaths,
    toggleCascaderPath,
    type CascaderItem,
    type CascaderPaths
} from '../src/ui/cascader';

const items: CascaderItem[] = [
    {
        value: 'north',
        label: 'North',
        children: [
            { value: 'shared', label: 'Shared leaf' },
            {
                value: 'nested',
                label: 'Nested',
                children: [
                    { value: 'first', label: 'First' },
                    { value: 'locked', label: 'Locked leaf', disabled: true }
                ]
            },
            {
                value: 'blocked',
                label: 'Blocked branch',
                disabled: true,
                children: [{ value: 'hidden', label: 'Hidden leaf' }]
            }
        ]
    },
    { value: 'south', label: 'South', children: [{ value: 'shared', label: 'Shared leaf' }] },
    { value: 'empty', label: 'No selectable leaves', children: [{ value: 'only-locked', label: 'Only locked', disabled: true }] },
    { value: 'alone', label: 'Alone' },
    { value: 'locked-root', label: 'Locked root', disabled: true, children: [{ value: 'hidden-root', label: 'Hidden root leaf' }] }
];

test('single cascader paths resolve within each branch, preserve numeric zero, and keep legacy validation', () => {
    const singleItems: CascaderItem[] = [
        { value: 'a', label: 'A', children: [{ value: 0, label: 'Zero' }, { value: 'locked', label: 'Locked', disabled: true }] },
        { value: 'b', label: 'B', children: [{ value: 0, label: 'Other zero' }] },
        { value: 'locked-branch', label: 'Locked branch', disabled: true, children: [{ value: 'leaf', label: 'Leaf' }] }
    ];
    assert.deepEqual(resolveCascaderPath(singleItems, ['a', 0]).map(item => item.label), ['A', 'Zero']);
    assert.deepEqual(resolveCascaderPath(singleItems, ['b', 0]).map(item => item.label), ['B', 'Other zero']);
    assert.equal(isCascaderPathValid(singleItems, ['a', 0]), true);
    assert.equal(isCascaderPathValid(singleItems, ['a', '0']), false);
    assert.equal(isCascaderPathValid(singleItems, []), true, 'required is handled separately by form validation');
    assert.equal(isCascaderPathValid(singleItems, ['a']), false);
    assert.equal(isCascaderPathValid(singleItems, ['a'], true), true);
    for (const path of [['a', 'locked'], ['locked-branch', 'leaf'], ['missing'], ['a', 0, 'extra']]) {
        assert.equal(isCascaderPathValid(singleItems, path), false);
    }
    assert.equal(isCascaderPathValid([], ['a', 0]), false, 'removed items invalidate previous selections');
});

test('normalizing multiple values compares full paths and preserves stale paths without mutating input', () => {
    const original: CascaderPaths = [
        ['north', 'shared'],
        ['south', 'shared'],
        ['north', 'shared'],
        ['removed', 'branch']
    ];
    const normalized = normalizeCascaderPaths(original);
    assert.deepEqual(normalized, [['north', 'shared'], ['south', 'shared'], ['removed', 'branch']]);
    assert.notEqual(normalized, original);
    assert.notEqual(normalized[0], original[0]);
    assert.equal(areCascaderPathsEqual(['north', 'shared'], ['south', 'shared']), false);
    assert.equal(hasCascaderPath(normalized, ['south', 'shared']), true);
    assert.equal(hasCascaderPath(normalized, ['north', 'shared']), true);
    assert.equal(isCascaderPathsValid(items, [['removed', 'branch']]), false, 'stale model paths remain invalid');
    assert.deepEqual(original[0], ['north', 'shared']);
});

test('enabled leaf collection excludes disabled nodes and disabled subtrees', () => {
    assert.deepEqual(collectCascaderLeafPaths(items), [
        ['north', 'shared'],
        ['north', 'nested', 'first'],
        ['south', 'shared'],
        ['alone']
    ]);
    assert.equal(isCascaderPathDisabled(items, ['north', 'blocked', 'hidden']), true);
    assert.equal(isCascaderPathDisabled(items, ['locked-root', 'hidden-root']), true);
    assert.equal(isCascaderPathDisabled(items, ['north', 'shared']), false);
});

test('parent selection reports checked and indeterminate state and toggles only enabled leaves', () => {
    const partial: CascaderPaths = [['north', 'shared']];
    const half = getCascaderSelectionState(items, ['north'], partial);
    assert.equal(half.checked, false);
    assert.equal(half.indeterminate, true);
    assert.equal(half.disabled, false);

    const selected = toggleCascaderPath(items, partial, ['north']);
    assert.equal(selected.accepted, true);
    assert.deepEqual(selected.paths, [['north', 'shared'], ['north', 'nested', 'first']]);
    assert.deepEqual(getCascaderSelectionState(items, ['north'], selected.paths), {
        checked: true,
        indeterminate: false,
        disabled: false,
        selectionPaths: [['north', 'shared'], ['north', 'nested', 'first']]
    });

    const cleared = toggleCascaderPath(items, selected.paths, ['north']);
    assert.deepEqual(cleared.paths, []);
    assert.equal(getCascaderSelectionState(items, ['north', 'blocked'], partial).disabled, true);
    assert.equal(getCascaderSelectionState(items, ['empty'], []).disabled, true, 'a parent with no selectable leaves is disabled');
    assert.equal(toggleCascaderPath(items, partial, ['north', 'blocked']).accepted, false);
});

test('strict checking treats parent and child paths as independent selections', () => {
    const selectedChild: CascaderPaths = [['north', 'shared']];
    const parentState = getCascaderSelectionState(items, ['north'], selectedChild, true);
    assert.equal(parentState.checked, false);
    assert.equal(parentState.indeterminate, false);

    const selectedParent = toggleCascaderPath(items, selectedChild, ['north'], { checkStrictly: true });
    assert.deepEqual(selectedParent.paths, [['north', 'shared'], ['north']]);
    assert.equal(isCascaderPathsValid(items, selectedParent.paths, true), true);
    assert.equal(isCascaderPathsValid(items, [['north']], false), false);
    assert.equal(isCascaderPathsValid(items, [['north', 'blocked', 'hidden']], true), false);
});

test('max rejects an oversized parent selection atomically but still permits deselection', () => {
    const empty: CascaderPaths = [];
    assert.equal(canToggleCascaderPath(items, empty, ['north'], { max: 1 }), false);
    const rejected = toggleCascaderPath(items, empty, ['north'], { max: 1 });
    assert.equal(rejected.accepted, false);
    assert.equal(rejected.reason, 'max');
    assert.deepEqual(rejected.paths, []);

    const overLimit: CascaderPaths = [['north', 'shared'], ['north', 'nested', 'first'], ['removed']];
    const deselected = toggleCascaderPath(items, overLimit, ['north'], { max: 1 });
    assert.equal(deselected.accepted, true);
    assert.deepEqual(deselected.paths, [['removed']]);
    const zeroIsUnlimited = toggleCascaderPath(items, empty, ['north'], { max: 0 });
    assert.deepEqual(zeroIsUnlimited.paths, [['north', 'shared'], ['north', 'nested', 'first']]);
});

test('search matches complete label paths case-insensitively and reports empty results', () => {
    const shared = searchCascaderPaths(items, 'sHaReD');
    assert.deepEqual(shared.map(option => option.labels.join(' / ')), ['North / Shared leaf', 'South / Shared leaf']);
    assert.deepEqual(shared.map(option => option.path), [['north', 'shared'], ['south', 'shared']]);
    const north = searchCascaderPaths(items, 'north');
    assert.ok(north.some(option => option.labels.join(' / ') === 'North / Nested / First'));
    assert.equal(north.find(option => option.labels.join(' / ') === 'North / Blocked branch')?.disabled, true);
    assert.deepEqual(searchCascaderPaths(items, 'missing-label'), []);
    assert.deepEqual(searchCascaderPaths(items, '   '), []);
});

test('selectable search keeps ordinary matches on leaves, allows strict parents, and omits disabled paths', () => {
    const ordinary = searchSelectableCascaderPaths(items, 'north');
    assert.deepEqual(ordinary.map(option => option.labels.join(' / ')), [
        'North / Shared leaf',
        'North / Nested / First'
    ]);
    assert.equal(ordinary.some(option => option.disabled), false);

    const strict = searchSelectableCascaderPaths(items, 'north', ' / ', { multiple: true, checkStrictly: true });
    assert.ok(strict.some(option => option.labels.join(' / ') === 'North'));
    assert.ok(strict.some(option => option.labels.join(' / ') === 'North / Nested'));
    assert.equal(strict.some(option => option.labels.join(' / ').includes('Blocked')), false);
    assert.equal(strict.some(option => option.labels.join(' / ').includes('Locked')), false);

    const singleChangeOnSelect = searchSelectableCascaderPaths(items, 'north', ' / ', { changeOnSelect: true });
    assert.ok(singleChangeOnSelect.some(option => option.labels.join(' / ') === 'North'));
    const multipleChangeOnSelect = searchSelectableCascaderPaths(items, 'north', ' / ', { multiple: true, changeOnSelect: true });
    assert.deepEqual(multipleChangeOnSelect.map(option => option.path), ordinary.map(option => option.path));
    assert.deepEqual(searchSelectableCascaderPaths(items, 'hidden'), []);
    assert.deepEqual(searchSelectableCascaderPaths(items, 'missing-label'), []);
});

test('selection helpers do not mutate frozen item trees or model paths', () => {
    const frozenItems = Object.freeze([
        Object.freeze({
            value: 'branch',
            label: 'Branch',
            children: Object.freeze([
                Object.freeze({ value: 'one', label: 'One' }),
                Object.freeze({ value: 'two', label: 'Two' })
            ])
        })
    ]) as readonly CascaderItem[];
    const frozenModel = Object.freeze([Object.freeze(['branch', 'one'])]) as CascaderPaths;
    const beforeItems = JSON.stringify(frozenItems);
    const beforeModel = JSON.stringify(frozenModel);
    const result = toggleCascaderPath(frozenItems, frozenModel, ['branch']);
    assert.deepEqual(result.paths, [['branch', 'one'], ['branch', 'two']]);
    assert.notEqual(result.paths, frozenModel);
    assert.notEqual(result.paths[0], frozenModel[0]);
    assert.equal(JSON.stringify(frozenItems), beforeItems);
    assert.equal(JSON.stringify(frozenModel), beforeModel);
});
