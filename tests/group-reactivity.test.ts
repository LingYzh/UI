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

test('group item disabled state is read dynamically for mandatory selection and navigation', () => {
    const selected = ref<string | number | Array<string | number> | null>(null);
    const disabled = ref(true);
    const group = createGroup(selected, { mandatory: true });
    group.register('disabled-first', () => disabled.value);
    group.register('second');
    group.register('third');

    assert.equal(selected.value, 'second', 'mandatory initialization skips a disabled first item');
    group.next();
    assert.equal(selected.value, 'third');
    group.next();
    assert.equal(selected.value, 'second', 'navigation wraps and skips the disabled item');
    group.prev();
    assert.equal(selected.value, 'third', 'backward navigation also skips the disabled item');

    disabled.value = false;
    group.prev();
    assert.equal(selected.value, 'second');
    group.prev();
    assert.equal(selected.value, 'disabled-first', 'the live disabled getter makes the item navigable');
    disabled.value = true;
    assert.equal(selected.value, 'disabled-first', 'changing disabled does not rewrite an already selected controlled value');
    group.next();
    assert.equal(selected.value, 'second', 'navigation away from a newly disabled selection finds an enabled item');
});

test('group item disabled state leaves empty selection when no mandatory candidate is enabled', () => {
    const selected = ref<string | number | Array<string | number> | null>(null);
    const firstDisabled = ref(true);
    const secondDisabled = ref(true);
    const group = createGroup(selected, { mandatory: true });
    group.register('first', () => firstDisabled.value);
    group.register('second', () => secondDisabled.value);

    assert.equal(selected.value, null);
    group.next();
    group.prev();
    assert.equal(selected.value, null, 'navigation does not fabricate selection when all registered items are disabled');

    secondDisabled.value = false;
    group.next();
    assert.equal(selected.value, 'second', 'the next action observes a later enabled state');
    group.register('third');
    firstDisabled.value = false;
    assert.equal(selected.value, 'second', 'a later enabled item does not rewrite an existing selection');
});

test('mandatory removal fallback selects the first enabled item', () => {
    const selected = ref<string | number | Array<string | number> | null>('active');
    const disabled = ref(true);
    const group = createGroup(selected, { mandatory: true });
    group.register('disabled', () => disabled.value);
    const unregisterActive = group.register('active');
    group.register('enabled-later');

    unregisterActive();
    assert.equal(selected.value, 'enabled-later', 'unregistration does not choose a disabled fallback');
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
