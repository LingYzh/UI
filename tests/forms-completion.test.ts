import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { parse, compileScript } from '@vue/compiler-sfc';
import { checkboxChecked, defaultValueComparator, findSelection, isSelected, normalizeItems, toggleCheckbox, toggleGroupSelection, toggleSelection } from '../src/ui/selection';
import { hexToHsv, hsvToHex, normalizeOtp, normalizeRange, normalizeRating, normalizeSlider, parseNumberInput, stepNumber, validateFiles } from '../src/ui/specialized-inputs';

test('selection normalizes primitive, custom and nested values without losing source objects', () => {
    const source = { id: 7, display: 'Seven', disabled: true, children: [{ id: 8, display: 'Eight' }] };
    const [text, number, object] = normalizeItems(['plain', 2, source], { itemTitle: 'display', itemValue: 'id' });
    assert.deepEqual([text.title, text.value], ['plain', 'plain']);
    assert.deepEqual([number.title, number.value], ['2', 2]);
    assert.equal(object.value, 7);
    assert.equal(object.raw, source);
    assert.equal(object.disabled, true);
    assert.equal(object.children?.[0]?.title, 'Eight');
    assert.equal(findSelection([object], 8, false)?.raw, source.children[0]);
});

test('selection model handles returnObject, multiple, comparator and max', () => {
    const source = { id: 1, title: 'One' };
    const [item] = normalizeItems([source], { itemValue: 'id' });
    assert.equal(toggleSelection(null, item, false, true), source);
    assert.deepEqual(toggleSelection([], item, true, false), [1]);
    assert.deepEqual(toggleSelection([1], item, true, false), []);
    assert.deepEqual(toggleSelection([2], item, true, false, undefined, 1), [2]);
    assert.equal(isSelected([{ id: 1, title: 'One' }], item, true, true), true);
    assert.equal(defaultValueComparator({ a: 1 }, { a: 1 }), true);
    const comparator = (a: unknown, b: unknown) => (a as number) % 10 === (b as number) % 10;
    assert.equal(isSelected([11], item, true, false, comparator), true);
});

test('group selection enforces mandatory and max without mutating input', () => {
    const values = [1, 2];
    assert.deepEqual(toggleGroupSelection(values, 1, { multiple: true }), [2]);
    assert.deepEqual(values, [1, 2]);
    assert.deepEqual(toggleGroupSelection([1], 1, { multiple: true, mandatory: true }), [1]);
    assert.deepEqual(toggleGroupSelection([1], 2, { multiple: true, max: 1 }), [1]);
    assert.equal(toggleGroupSelection(1, 1, { mandatory: true }), 1);
});

test('checkbox scalar and array models honor custom values', () => {
    assert.equal(checkboxChecked('yes', undefined, 'yes'), true);
    assert.equal(toggleCheckbox('yes', false, { trueValue: 'yes', falseValue: 'no' }), 'no');
    assert.equal(checkboxChecked(['a'], 'a'), true);
    assert.deepEqual(toggleCheckbox(['a'], true, { value: 'b' }), ['a', 'b']);
    assert.deepEqual(toggleCheckbox(['a', 'b'], false, { value: 'a' }), ['b']);
});

test('number, range and rating boundaries remain stable', () => {
    assert.equal(stepNumber(0.2, 1, 0.1), 0.3);
    assert.equal(stepNumber(9, 1, 2, 0, 10), 10);
    assert.equal(parseNumberInput(''), null);
    assert.equal(parseNumberInput('1e'), undefined);
    assert.equal(normalizeSlider(8.8, 0, 10, 0.5), 9);
    assert.deepEqual(normalizeRange([8, 2], 0, 10, 1), [2, 8]);
    assert.deepEqual(normalizeRange([8, 2], 0, 10, 1, 0), [2, 2]);
    assert.equal(normalizeRating(3.26, 5, 0.5), 3.5);
});

test('file validation reports each rejection and respects single selection', () => {
    const files = [new File(['ok'], 'one.png', { type: 'image/png' }), new File(['too large'], 'two.png', { type: 'image/png' }), new File(['x'], 'three.txt', { type: 'text/plain' })];
    const result = validateFiles(files, { accept: 'image/*', maxSize: 3 });
    assert.deepEqual(result.accepted, [files[0]]);
    assert.deepEqual(result.rejected.map((entry) => entry.reason), ['size', 'type']);
    assert.equal(validateFiles([files[0], files[0]], { multiple: false }).rejected[0]?.reason, 'multiple');
});

test('OTP and hex/HSV conversion handle valid and invalid boundaries', () => {
    assert.equal(normalizeOtp('1a2b3', 4, true), '123');
    assert.equal(normalizeOtp('ABCDE', 4), 'ABCD');
    assert.equal(hexToHsv('#badhex'), undefined);
    assert.equal(hsvToHex(hexToHsv('#ff8040')!), '#ff8040');
    assert.equal(hsvToHex({ h: 360, s: 1, v: 1 }), '#ff0000');
});

test('combobox publishes both v-model channels for consumers', () => {
    const filename = 'src/ui/UCombobox.vue';
    const descriptor = parse(readFileSync(filename, 'utf8'), { filename }).descriptor;
    const compiled = compileScript(descriptor, { id: 'combobox-contract', fs: { fileExists: existsSync, readFile: (path) => readFileSync(path, 'utf8') } }).content;
    assert.match(compiled, /"modelValue": \{ type: null \}/);
    assert.match(compiled, /"search": \{ type: String/);
    assert.match(compiled, /emits: \["update:modelValue", "update:search"\]/);
});
