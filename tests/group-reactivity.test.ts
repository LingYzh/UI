import assert from 'node:assert/strict';
import test from 'node:test';
import { customRef, nextTick, ref } from 'vue';
import { createGroup, type GroupValue } from '../src/ui/group-state';

function delayedModel() {
    const parentValue = ref<GroupValue | GroupValue[] | null | undefined>(null);
    const emitted: Array<GroupValue | GroupValue[] | null | undefined> = [];
    const selected = customRef<GroupValue | GroupValue[] | null | undefined>((track) => ({
        get() {
            track();
            return parentValue.value;
        },
        set(value) {
            emitted.push(value);
        }
    }));
    return { parentValue, emitted, selected };
}

test('group actions read reactive disabled, mandatory, and multiple options at call time', () => {
    const selected = ref<string | number | Array<string | number> | null>(null);
    const disabled = ref(false);
    const mandatory = ref(true);
    const multiple = ref(false);
    const group = createGroup(selected, { disabled, mandatory, multiple });
    const removeA = group.register('a');
    group.register('b');

    assert.equal(selected.value, 'a');
    assert.equal(group.mandatory, true);
    assert.equal(group.multiple, false);
    assert.equal(group.disabled, false);

    disabled.value = true;
    assert.equal(group.disabled, true);
    group.select('b');
    group.next();
    assert.equal(selected.value, 'a');

    disabled.value = false;
    group.select('b');
    assert.equal(selected.value, 'b');
    multiple.value = true;
    assert.equal(group.multiple, true);
    group.select('a');
    assert.deepEqual(selected.value, ['b', 'a']);
    mandatory.value = false;
    assert.equal(group.mandatory, false);
    group.select('a');
    assert.deepEqual(selected.value, ['b']);

    removeA();
    assert.deepEqual(selected.value, ['b']);
});

test('group removal applies current mandatory and multiple options', () => {
    const selected = ref<string | number | Array<string | number> | null>(null);
    const options = { mandatory: true, multiple: false };
    const group = createGroup(selected, options);
    const removeA = group.register('a');
    group.register('b');
    assert.equal(selected.value, 'a');

    options.mandatory = false;
    removeA();
    assert.equal(selected.value, null);

    options.mandatory = true;
    options.multiple = true;
    const second = ref<string | number | Array<string | number> | null>('b');
    const multipleGroup = createGroup(second, options);
    const removeB = multipleGroup.register('b');
    multipleGroup.register('c');
    removeB();
    assert.deepEqual(second.value, ['c']);
});

test('group options continue to accept plain boolean values', () => {
    const selected = ref<string | number | Array<string | number> | null>(null);
    const group = createGroup(selected, { mandatory: true, multiple: true, disabled: false });
    group.register('a');
    assert.deepEqual(selected.value, ['a']);
});

test('controlled mandatory initialization emits only the first synchronous registration', async () => {
    const model = delayedModel();
    const group = createGroup(model.selected, { mandatory: true });
    group.register('first');
    group.register('second');

    assert.deepEqual(model.emitted, ['first']);
    model.parentValue.value = model.emitted[0] as GroupValue;
    await nextTick();
    assert.equal(model.selected.value, 'first');
});

test('removing a pending initial item selects a still-registered fallback', async () => {
    const model = delayedModel();
    const group = createGroup(model.selected, { mandatory: true });
    const unregisterFirst = group.register('first');
    group.register('second');
    unregisterFirst();

    assert.deepEqual(model.emitted, ['first', 'second']);
    model.parentValue.value = model.emitted.at(-1) as GroupValue;
    await nextTick();
    assert.equal(model.selected.value, 'second');
    assert.ok(group.values.includes(model.selected.value as GroupValue));
});
