import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc';
import { buildNestedIndex, createSelectStrategy } from '../src/ui/nested-strategies';
import { getItemProperty } from '../src/ui/data-pipeline';
import { findTreeSelectItem, mapTreeSelectItems, treeSelectAncestors, treeSelectDisplayValue } from '../src/ui/tree-select';

test('tree select maps nested fields using the public ItemProperty path and fallback semantics', () => {
    const items = mapTreeSelectItems([
        {
            record: { id: 0, label: 'Company' },
            branch: {
                units: [
                    { record: { id: 'team', label: 'Team' }, view: { row: { 'data-kind': 'team' } } },
                    { record: { id: 'fallback' } }
                ]
            },
            view: { row: { disabled: false, 'data-kind': 'company' } }
        }
    ], {
        itemTitle: (item, fallback) => getItemProperty(item, ['record', 'label'], fallback),
        itemValue: (item, fallback) => getItemProperty(item, ['record', 'id'], fallback),
        itemChildren: ['branch', 'units'],
        itemProps: ['view', 'row']
    });

    assert.equal(items[0].value, 0);
    assert.equal(items[0].title, 'Company');
    assert.deepEqual(items[0].props, { disabled: false, 'data-kind': 'company' });
    assert.equal(items[0].children?.[0].value, 'team');
    assert.equal(items[0].children?.[0].title, 'Team');
    assert.deepEqual(items[0].children?.[0].props, { 'data-kind': 'team' });
    assert.equal(items[0].children?.[1].title, 'fallback');
});

test('default fields preserve parent items as selectable IDs and generate stable missing-value fallbacks', () => {
    const items = mapTreeSelectItems([
        {
            title: 'Department',
            value: 8,
            children: [{ title: 'Team', value: 'team' }, { title: 'Unkeyed' }]
        },
        { title: 'Unkeyed root' }
    ]);

    assert.equal(findTreeSelectItem(items, 8)?.title, 'Department');
    assert.equal(items[0].children?.[1].value, '8:1');
    assert.equal(items[1].value, 'root:1');
});

test('opening expands each ancestor of the current node in root-to-leaf order', () => {
    const items = mapTreeSelectItems([
        { title: 'Root', value: 'root', children: [{ title: 'Group', value: 'group', children: [{ title: 'Leaf', value: 'leaf' }] }] }
    ]);

    assert.deepEqual(treeSelectAncestors(items, 'leaf'), ['root', 'group']);
    assert.deepEqual(treeSelectAncestors(items, 'root'), []);
    assert.deepEqual(treeSelectAncestors(items, 'missing'), []);
});

test('disabled parents disable their whole subtree and single-independent cannot activate a disabled child', () => {
    const items = mapTreeSelectItems([
        {
            title: 'Locked department',
            value: 'locked',
            props: { disabled: true },
            children: [{ title: 'Team', value: 'locked-team' }]
        },
        { title: 'Available department', value: 'available', children: [{ title: 'Open team', value: 'open-team' }] }
    ]);
    const index = buildNestedIndex(items, {
        getId: (item) => item.value,
        getChildren: (item) => item.children,
        isDisabled: (item) => Boolean(item.props.disabled ?? item.disabled),
        inheritDisabled: true
    });
    const activeStrategy = createSelectStrategy<unknown>('single-independent');
    const activated = activeStrategy.select({
        id: 'locked-team',
        value: true,
        selected: new Map(),
        children: index.children,
        parents: index.parents,
        disabled: index.disabled
    });

    assert.deepEqual([...index.disabled], ['locked', 'locked-team']);
    assert.deepEqual([...activated], []);
});

test('display preserves numeric and string IDs and shows an unknown external ID without changing it', () => {
    const items = mapTreeSelectItems([
        { title: 'Number zero', value: 0 },
        { title: 'String zero', value: '0' },
        { title: 'False ID', value: false }
    ]);
    const unknownId = 41;

    assert.equal(treeSelectDisplayValue(items, 0), 'Number zero');
    assert.equal(treeSelectDisplayValue(items, '0'), 'String zero');
    assert.equal(treeSelectDisplayValue(items, false), 'False ID');
    assert.equal(treeSelectDisplayValue(items, unknownId), '41');
    assert.equal(unknownId, 41);
    assert.equal(treeSelectDisplayValue(items, null), undefined);
});

test('UTreeSelect script and template compile as a Vue SFC', () => {
    const filename = join(process.cwd(), 'src', 'ui', 'UTreeSelect.vue');
    const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename });
    assert.deepEqual(errors, []);
    assert.ok(descriptor.template);

    const fs = { fileExists: existsSync, readFile: (path: string) => readFileSync(path, 'utf8') };
    const script = compileScript(descriptor, { id: 'u-tree-select', fs });
    const template = compileTemplate({
        source: descriptor.template.content,
        filename,
        id: 'u-tree-select',
        compilerOptions: { bindingMetadata: script.bindings }
    });

    assert.deepEqual(template.errors, []);
});
