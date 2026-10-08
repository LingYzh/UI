import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive, ref, watchEffect } from 'vue';
import { createItemGroupState } from '../src/ui/item-group-state';
import type { ItemGroupStateEntry, ItemGroupStateProps } from '../src/ui/item-group-state';

function createState(initialModel: unknown, initialProps: ItemGroupStateProps = {}) {
    const model = ref<unknown>(initialModel);
    const props = reactive<ItemGroupStateProps>({ ...initialProps });
    const state = createItemGroupState(model, () => props);

    function register(id: string, value: () => unknown, disabled: () => boolean = () => false) {
        const entry: ItemGroupStateEntry = { id, value, disabled };
        return state.register(entry);
    }

    return { model, props, state, register };
}

test('matches deep objects and treats an array-valued single item as one model value', () => {
    const objectModel = ref<unknown>({ code: 4, label: 'Four' });
    const objectGroup = createItemGroupState(objectModel, () => ({}));
    objectGroup.register({ id: 'four', value: () => ({ code: 4, label: 'Four' }), disabled: () => false });
    assert.deepEqual(objectGroup.selectedIds.value, ['four']);

    const arrayValue = ['north', 'south'];
    const single = createState(arrayValue);
    single.register('directions', () => ['north', 'south']);
    assert.equal(single.state.isSelected('directions'), true);
    single.state.toggle('directions');
    assert.equal(single.model.value, undefined);
});

test('keeps null as an explicit value and uses the live registration index only for undefined values', () => {
    const { model, state, register } = createState(undefined);
    register('null-value', () => null);
    register('index-value', () => undefined);

    assert.equal(state.effectiveValue('null-value'), null);
    assert.equal(state.effectiveValue('index-value'), 1);
    assert.deepEqual(state.selectedIds.value, []);

    model.value = null;
    assert.deepEqual(state.selectedIds.value, ['null-value']);
    model.value = 1;
    assert.deepEqual(state.selectedIds.value, ['index-value']);
});

test('reorders and releases registrations without rewriting the external model', () => {
    const { model, state, register } = createState(2);
    const first = register('first', () => undefined);
    const second = register('second', () => undefined);
    const third = register('third', () => undefined);

    assert.deepEqual([first.index.value, second.index.value, third.index.value], [0, 1, 2]);
    assert.deepEqual(state.selectedIds.value, ['third']);

    state.reorder(['third', 'unknown', 'first']);
    assert.deepEqual([first.index.value, second.index.value, third.index.value], [1, 2, 0]);
    assert.equal(state.effectiveValue('first'), 1);
    assert.equal(model.value, 2);

    third.release();
    third.release();
    assert.equal(third.index.value, -1);
    assert.deepEqual([first.index.value, second.index.value], [0, 1]);
    assert.equal(model.value, 2);
});

test('same-order reorder does not retrigger reactive consumers', () => {
    const { state, register } = createState(1);
    register('first', () => 1);
    register('second', () => 2);
    let runs = 0;
    const stop = watchEffect(() => {
        state.selectedIds.value;
        runs += 1;
    }, { flush: 'sync' });

    assert.equal(runs, 1);
    state.reorder(['first', 'second']);
    assert.equal(runs, 1);
    state.reorder(['second', 'first']);
    assert.equal(runs, 2);
    state.reorder(['second', 'first']);
    assert.equal(runs, 2);
    stop();
});

test('reacts to comparator, multiple, max, group flags and entry disabled state', () => {
    const disabled = ref(false);
    const { model, props, state, register } = createState(['ALPHA'], { multiple: true, max: 2 });
    register('alpha', () => 'alpha', () => disabled.value);
    const caseInsensitive = (a: unknown, b: unknown) => String(a).toLowerCase() === String(b).toLowerCase();
    props.valueComparator = caseInsensitive;
    assert.deepEqual(state.selectedIds.value, ['alpha']);
    assert.deepEqual(state.selectedValues.value, ['alpha']);

    state.select('alpha', false);
    assert.deepEqual(model.value, []);
    state.select('alpha', true);
    assert.deepEqual(model.value, ['alpha']);

    disabled.value = true;
    state.toggle('alpha');
    assert.deepEqual(model.value, ['alpha']);
    disabled.value = false;
    props.readonly = true;
    state.toggle('alpha');
    assert.deepEqual(model.value, ['alpha']);
    props.readonly = false;
    props.disabled = true;
    state.toggle('alpha');
    assert.deepEqual(model.value, ['alpha']);
});

test('explicit selection is idempotent and max blocks only additions', () => {
    const { model, state, register } = createState([], { multiple: true, max: 1 });
    register('one', () => 1);
    register('two', () => 2);

    state.select('one', true);
    const selectedReference = model.value;
    state.select('one', true);
    assert.equal(model.value, selectedReference);
    state.select('two', true);
    assert.deepEqual(model.value, [1]);
    state.select('one', false);
    assert.deepEqual(model.value, []);
    state.select('one', false);
    assert.deepEqual(model.value, []);
});

test('mandatory boolean blocks deselection but does not force initial or replacement selection', () => {
    const { model, state, register } = createState(undefined, { mandatory: true });
    register('one', () => 'one');
    register('two', () => 'two');

    state.ensureMandatory();
    assert.equal(model.value, undefined);
    state.select('one', true);
    state.toggle('one');
    assert.equal(model.value, 'one');
    state.select('two', true);
    assert.equal(model.value, 'two');
    state.select('two', false);
    assert.equal(model.value, 'two');
});

test('mandatory force fills an empty group and refills after a selected entry is released', () => {
    const { model, state, register } = createState(undefined, { mandatory: 'force' });
    register('disabled', () => 'disabled', () => true);
    const first = register('first', () => 'first');
    register('second', () => 'second');

    state.ensureMandatory();
    assert.equal(model.value, 'first');
    first.release();
    assert.equal(model.value, 'second');
});

test('mandatory force does not write while the group is disabled or readonly', () => {
    for (const flag of ['disabled', 'readonly'] as const) {
        const { model, props, state, register } = createState(undefined, { mandatory: 'force', [flag]: true });
        register('first', () => 'first');
        state.ensureMandatory();
        assert.equal(model.value, undefined);

        props[flag] = false;
        state.ensureMandatory();
        assert.equal(model.value, 'first');
    }

    const disabledGroup = createState(undefined, { mandatory: 'force' });
    const first = disabledGroup.register('first', () => 'first');
    disabledGroup.register('second', () => 'second');
    disabledGroup.state.ensureMandatory();
    disabledGroup.props.disabled = true;
    first.release();
    assert.equal(disabledGroup.model.value, 'first');
});

test('multiple max and mandatory enforce a non-empty selection', () => {
    const { model, state, register, props } = createState([1], { multiple: true, mandatory: true, max: 1 });
    register('one', () => 1);
    register('two', () => 2);

    state.toggle('one');
    state.select('two', true);
    assert.deepEqual(model.value, [1]);

    props.max = 2;
    state.select('two', true);
    assert.deepEqual(model.value, [1, 2]);
    state.select('one', false);
    assert.deepEqual(model.value, [2]);
    state.select('two', false);
    assert.deepEqual(model.value, [2]);
});

test('navigation starts at the first enabled item, cycles, and skips disabled items', () => {
    const { model, state, register } = createState(undefined);
    register('first', () => 'first');
    register('disabled', () => 'disabled', () => true);
    register('last', () => 'last');

    state.next();
    assert.equal(model.value, 'first');
    state.next();
    assert.equal(model.value, 'last');
    state.next();
    assert.equal(model.value, 'first');
    state.prev();
    assert.equal(model.value, 'last');
});

test('multiple navigation replaces the model with one target and all-disabled groups stay unchanged', () => {
    const { model, state, register, props } = createState(['first', 'last'], { multiple: true });
    register('first', () => 'first');
    register('disabled', () => 'disabled', () => true);
    register('last', () => 'last');

    state.next();
    assert.deepEqual(model.value, ['last']);
    state.next();
    assert.deepEqual(model.value, ['first']);

    const allDisabled = createState(undefined);
    allDisabled.register('disabled', () => 'disabled', () => true);
    allDisabled.state.next();
    allDisabled.state.prev();
    assert.equal(allDisabled.model.value, undefined);

    props.readonly = true;
    state.next();
    assert.deepEqual(model.value, ['first']);
});

test('selected ids resolve each model value to only its first matching registration', () => {
    const model = ref<unknown>(['same', 'other', 'same']);
    const state = createItemGroupState(model, () => ({ multiple: true }));
    state.register({ id: 'first-same', value: () => 'same', disabled: () => false });
    state.register({ id: 'second-same', value: () => 'same', disabled: () => false });
    state.register({ id: 'other', value: () => 'other', disabled: () => false });

    assert.deepEqual(state.selectedIds.value, ['first-same', 'other']);
    assert.deepEqual(state.selectedValues.value, ['same', 'other']);
    assert.equal(state.isSelected('second-same'), false);
});
