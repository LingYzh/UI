import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildNestedIndex,
    createOpenStrategy,
    createSelectStrategy,
    type NestedIndex,
    type NestedOpenStrategy,
    type NestedSelectStrategy,
    type NestedSelectionState
} from '../src/ui/nested-strategies';

type Id = string | number | boolean | null;
interface Item {
    id: Id;
    children?: Item[];
    disabled?: boolean;
    title?: string;
}

function index(items: Item[], options: Parameters<typeof buildNestedIndex<Item, Id>>[1] = {}): NestedIndex<Item, Id> {
    return buildNestedIndex<Item, Id>(items, options);
}

function selectArgs(tree: NestedIndex<Item, Id>) {
    return { children: tree.children, parents: tree.parents, disabled: tree.disabled };
}

function select(
    tree: NestedIndex<Item, Id>,
    selected: Map<Id, NestedSelectionState>,
    id: Id,
    value: boolean,
    strategy = createSelectStrategy<Id>('classic')
) {
    return strategy.select({ id, value, selected, ...selectArgs(tree) });
}

function out(tree: NestedIndex<Item, Id>, selected: ReadonlyMap<Id, NestedSelectionState>, strategy: NestedSelectStrategy<Id>) {
    return strategy.out(selected, tree.children, tree.parents, tree.disabled);
}

test('index builder preserves falsy ids and constructs parent, child, and inherited disabled maps', () => {
    const tree = index([
        { id: 0, children: [{ id: 'leaf', children: [{ id: false }] }] },
        { id: 'disabled-root', disabled: true, children: [{ id: 'inherited-disabled' }] }
    ]);

    assert.deepEqual(tree.roots, [0, 'disabled-root']);
    assert.deepEqual(tree.children.get(0), ['leaf']);
    assert.deepEqual(tree.children.get('leaf'), [false]);
    assert.equal(tree.parents.get('leaf'), 0);
    assert.equal(tree.parents.has('leaf'), true);
    assert.equal(tree.parents.get(false), 'leaf');
    assert.equal(tree.parents.has(0), false);
    assert.deepEqual([...tree.disabled], ['disabled-root', 'inherited-disabled']);
    assert.equal(tree.nodes.get('inherited-disabled')?.disabled, true);
    assert.equal(tree.children.has(false), false, 'leaf ids are absent as keys in the branch map');
});

test('an explicit empty children array remains a branch for lazy tree items', () => {
    const tree = index([{ id: 'lazy', children: [] }, { id: 'leaf' }]);
    assert.equal(tree.children.has('lazy'), true);
    assert.deepEqual(tree.children.get('lazy'), []);

    const singleLeaf = createSelectStrategy<Id>('single-leaf');
    const selected = singleLeaf.in(['lazy'], tree.children, tree.parents, tree.disabled);
    assert.deepEqual(out(tree, selected, singleLeaf), []);
    assert.equal(singleLeaf.select({ id: 'lazy', value: true, selected, ...selectArgs(tree) }).get('lazy'), undefined);
});

test('index builder accepts custom accessors and can disable inheritance explicitly', () => {
    const tree = buildNestedIndex<{ key: Id; nested?: { key: Id }[]; inactive?: boolean }, Id>([
        { key: 0, inactive: true, nested: [{ key: 'child' }] }
    ], {
        getId: (item) => item.key,
        getChildren: (item) => item.nested,
        isDisabled: (item) => Boolean(item.inactive),
        inheritDisabled: false
    });

    assert.deepEqual([...tree.disabled], [0]);
    assert.equal(tree.nodes.get('child')?.disabled, false);
    assert.equal(tree.parents.get('child'), 0);
});

test('index builder rejects missing and duplicate ids, direct item cycles, and child-list cycles', () => {
    assert.throws(() => buildNestedIndex([{ title: 'missing' }]), /has no id or value/);
    assert.throws(() => index([{ id: 0 }, { id: 0 }]), /Duplicate nested item id: 0/);

    const itemCycle: Item = { id: 'cycle' };
    itemCycle.children = [itemCycle];
    assert.throws(() => index([itemCycle]), /Cycle detected in nested item references/);

    const listRoot: Item = { id: 'list-root' };
    const listChild: Item = { id: 'list-child' };
    const children = [listChild];
    listRoot.children = children;
    listChild.children = children;
    assert.throws(() => index([listRoot]), /Cycle detected in nested item children/);
});

test('independent strategy toggles any id without mutating the supplied map', () => {
    const tree = index([{ id: 0 }, { id: 'other' }]);
    const strategy = createSelectStrategy<Id>('independent');
    const initial = strategy.in([], tree.children, tree.parents, tree.disabled);
    const selected = select(tree, initial, 0, true, strategy);
    assert.deepEqual(out(tree, selected, strategy), [0]);
    assert.equal(initial.size, 0, 'select returns a new map');
    assert.deepEqual(out(tree, select(tree, selected, 0, false, strategy), strategy), []);
});

test('single-independent keeps one value and uses the first supplied input id', () => {
    const tree = index([{ id: 'a' }, { id: 'b' }]);
    const strategy = createSelectStrategy<Id>('single-independent');
    const initial = strategy.in(['a', 'b'], tree.children, tree.parents, tree.disabled);
    assert.deepEqual(out(tree, initial, strategy), ['a']);
    assert.deepEqual(out(tree, select(tree, initial, 'b', true, strategy), strategy), ['b']);
});

test('leaf and single-leaf strategies ignore branch ids and emit leaf ids only', () => {
    const tree = index([{ id: 0, children: [{ id: 'a' }, { id: 'b' }] }]);
    const leaf = createSelectStrategy<Id>('leaf');
    let selected = leaf.in([0, 'a', 'b'], tree.children, tree.parents, tree.disabled);
    assert.deepEqual(out(tree, selected, leaf), ['a', 'b']);
    selected = select(tree, selected, 0, false, leaf);
    assert.deepEqual(out(tree, selected, leaf), ['a', 'b'], 'a branch cannot be toggled through a leaf strategy');

    const singleLeaf = createSelectStrategy<Id>('single-leaf');
    selected = singleLeaf.in([0, 'a', 'b'], tree.children, tree.parents, tree.disabled);
    assert.deepEqual(out(tree, selected, singleLeaf), ['a'], 'the first eligible leaf is used for a single input model');
    selected = select(tree, selected, 'b', true, singleLeaf);
    assert.deepEqual(out(tree, selected, singleLeaf), ['b']);
});

test('classic cascades selection, updates ancestors, and emits selected leaves', () => {
    const tree = index([
        { id: 0, children: [
            { id: 'group', children: [{ id: 'a' }, { id: 'b' }] },
            { id: 'sibling' }
        ] }
    ]);
    const strategy = createSelectStrategy<Id>('classic');
    const selected = select(tree, new Map(), 'group', true, strategy);

    assert.equal(selected.get('group'), 'on');
    assert.equal(selected.get('a'), 'on');
    assert.equal(selected.get('b'), 'on');
    assert.equal(selected.get(0), 'indeterminate');
    assert.deepEqual(out(tree, selected, strategy), ['a', 'b']);

    const partial = select(tree, selected, 'a', false, strategy);
    assert.equal(partial.get('group'), 'indeterminate');
    assert.equal(partial.get(0), 'indeterminate');
    assert.deepEqual(out(tree, partial, strategy), ['b']);
});

test('trunk emits only the highest selected branch, including a numeric zero parent', () => {
    const tree = index([{ id: 0, children: [{ id: 'group', children: [{ id: 'leaf' }] }, { id: 'sibling' }] }]);
    const strategy = createSelectStrategy<Id>('trunk');
    const selectedRoot = select(tree, new Map(), 0, true, strategy);
    assert.deepEqual(out(tree, selectedRoot, strategy), [0]);
    const selectedGroup = select(tree, new Map(), 'group', true, strategy);
    assert.deepEqual(out(tree, selectedGroup, strategy), ['group']);
});

test('branch emits on and indeterminate nodes while ignoring group ids during input', () => {
    const tree = index([{ id: 0, children: [{ id: 'group', children: [{ id: 'a' }, { id: 'b' }] }] }]);
    const strategy = createSelectStrategy<Id>('branch');
    assert.deepEqual(out(tree, strategy.in([0, 'group'], tree.children, tree.parents, tree.disabled), strategy), []);

    const selected = strategy.in(['a'], tree.children, tree.parents, tree.disabled);
    assert.equal(selected.get('group'), 'indeterminate');
    assert.equal(selected.get(0), 'indeterminate');
    assert.deepEqual(out(tree, selected, strategy), ['a', 'group', 0]);
});

test('legacy-cascade retains all fully selected ids in its model output', () => {
    const tree = index([{ id: 0, children: [{ id: 'group', children: [{ id: 'a' }, { id: 'b' }] }] }]);
    const strategy = createSelectStrategy<Id>('legacy-cascade');
    const selected = strategy.in([0], tree.children, tree.parents, tree.disabled);
    assert.deepEqual(out(tree, selected, strategy), [0, 'group', 'a', 'b']);

    const partial = select(tree, selected, 'a', false, strategy);
    assert.equal(partial.get(0), 'indeterminate');
    assert.deepEqual(out(tree, partial, strategy), ['b'], 'the compatibility output includes on states but omits mixed ancestors');
});

test('disabled nodes are not selectable and classic skips disabled descendants', () => {
    const inherited = index([{ id: 0, disabled: true, children: [{ id: 'child' }] }]);
    const independent = createSelectStrategy<Id>('independent');
    assert.deepEqual(out(inherited, select(inherited, new Map(), 'child', true, independent), independent), []);

    const siblings = index([{ id: 'group', children: [{ id: 'disabled', disabled: true }, { id: 'enabled' }] }]);
    const classic = createSelectStrategy<Id>('classic');
    const selected = select(siblings, new Map(), 'group', true, classic);
    assert.equal(selected.get('disabled'), undefined);
    assert.equal(selected.get('enabled'), 'on');
    assert.deepEqual(out(siblings, selected, classic), ['enabled']);
});

test('mandatory blocks clearing the last on value but permits removing one of several', () => {
    const tree = index([{ id: 'a' }, { id: 'b' }]);
    for (const name of ['independent', 'single-independent', 'leaf', 'single-leaf', 'classic', 'trunk', 'branch', 'legacy-cascade'] as const) {
        const mandatory = createSelectStrategy<Id>(name, true);
        const one = mandatory.in(['a'], tree.children, tree.parents, tree.disabled);
        assert.deepEqual(out(tree, select(tree, one, 'a', false, mandatory), mandatory), ['a'], `${name} keeps its sole selected item`);
    }

    const independent = createSelectStrategy<Id>('independent', true);
    const two = independent.in(['a', 'b'], tree.children, tree.parents, tree.disabled);
    assert.deepEqual(out(tree, select(tree, two, 'a', false, independent), independent), ['b']);
});

test('custom select strategies receive mandatory and unknown names are rejected', () => {
    let mandatoryValue: boolean | undefined;
    const custom: NestedSelectStrategy<Id> = {
        select: ({ id, value, selected }) => new Map([...selected, [id, value ? 'on' : 'off']]),
        in: (values) => new Map((values ?? []).map((id) => [id, 'on'])),
        out: (selected) => [...selected].filter(([, state]) => state === 'on').map(([id]) => id)
    };
    const strategy = createSelectStrategy<Id>((mandatory) => {
        mandatoryValue = mandatory;
        return custom;
    }, true);
    assert.equal(mandatoryValue, true);
    assert.equal(strategy, custom);
    assert.throws(() => createSelectStrategy<Id>('single' as never), /Unknown nested selection strategy/);
});

test('multiple, single, and list open strategies maintain ancestor paths and guard parent cycles', () => {
    const tree = index([{ id: 0, children: [{ id: 'group', children: [{ id: 'leaf' }] }, { id: 'sibling' }] }]);
    const multiple = createOpenStrategy<Id>('multiple');
    const opened = multiple.open({ id: 'leaf', value: true, opened: new Set(), parents: tree.parents });
    assert.deepEqual([...opened], ['leaf', 'group', 0]);
    assert.deepEqual([...multiple.open({ id: 'sibling', value: true, opened, parents: tree.parents })], ['leaf', 'group', 0, 'sibling']);
    assert.deepEqual([...multiple.open({ id: 'group', value: false, opened, parents: tree.parents })], ['leaf', 0]);

    const single = createOpenStrategy<Id>('single');
    assert.deepEqual([...single.open({ id: 'leaf', value: true, opened: new Set(['sibling']), parents: tree.parents })], ['leaf', 'group', 0]);

    const list = createOpenStrategy<Id>('list');
    assert.deepEqual([...(list.select!({ id: 'leaf', value: true, opened, parents: tree.parents }) ?? [])], ['group', 0]);
    assert.deepEqual([...(list.select!({ id: 'leaf', value: false, opened, parents: tree.parents }) ?? [])], [...opened]);

    const cyclicParents = new Map<Id, Id>([['a', 'b'], ['b', 'a']]);
    assert.deepEqual([...multiple.open({ id: 'a', value: true, opened: new Set(), parents: cyclicParents })], ['a', 'b']);
});

test('custom open strategies preserve the standard Set protocol', () => {
    const custom: NestedOpenStrategy<Id> = {
        open: ({ id, value, opened }) => {
            const next = new Set(opened);
            if (value) next.add(id);
            else next.delete(id);
            return next;
        },
        select: ({ id, opened }) => new Set([...opened, id])
    };
    const strategy = createOpenStrategy<Id>(custom);
    assert.deepEqual([...strategy.open({ id: 0, value: true, opened: new Set(), parents: new Map() })], [0]);
    assert.deepEqual([...(strategy.select!({ id: 'x', value: true, opened: new Set(), parents: new Map() }) ?? [])], ['x']);
    assert.throws(() => createOpenStrategy('not-a-strategy' as never), /Unknown nested open strategy/);
});
