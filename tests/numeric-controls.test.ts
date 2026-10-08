import assert from 'node:assert/strict';
import test from 'node:test';
import {
    filterOtpText,
    formatLocalizedNumber,
    insertOtpText,
    normalizeOtp,
    normalizeRange,
    normalizeSlider,
    otpArrowDelta,
    otpCharacters,
    parseLocalizedNumber,
    resolveOtpPattern,
    sliderKeyboardValue,
    sliderTicks
} from '../src/ui/specialized-inputs';

test('number formatting and parsing use explicit locale separators without mutating input', () => {
    const german = { locale: 'de-DE', grouping: true, precision: 2, minFractionDigits: 2 } as const;
    assert.equal(formatLocalizedNumber(1234.5, german), '1.234,50');
    assert.equal(parseLocalizedNumber('1.234,75', german), 1234.75);
    assert.equal(parseLocalizedNumber('1.234,75', german, 0, 1000), 1000);
    assert.equal(parseLocalizedNumber('12,34,56', german), undefined);
    assert.equal(parseLocalizedNumber('  ', german), null);

    const french = { locale: 'fr-FR', grouping: true, precision: 2 } as const;
    const formatted = formatLocalizedNumber(1234.5, french);
    assert.equal(formatted, '1\u202f234,5');
    assert.equal(parseLocalizedNumber(formatted, french), 1234.5);
    assert.equal(formatLocalizedNumber(1234.5, { locale: 'en-US', grouping: false }), '1234.5');
    assert.equal(formatLocalizedNumber(12.345, { locale: 'en-US', precision: 1 }), '12.3');
});

test('localized parser accepts locale digits, bidi marks and explicit separator overrides', () => {
    assert.equal(parseLocalizedNumber('١٬٢٣٤٫٥', { locale: 'ar-EG' }), 1234.5);
    assert.equal(parseLocalizedNumber('\u200f-1.234,5', { locale: 'de-DE' }), -1234.5);
    assert.equal(parseLocalizedNumber('1_234;5', {
        locale: 'en-US',
        decimalSeparator: ';',
        groupSeparator: '_'
    }), 1234.5);
});

test('slider keyboard movement matches the continuous and stepped thumb protocol', () => {
    assert.equal(normalizeSlider(8.8125, 0, 10, 0), 8.8125);
    assert.equal(sliderKeyboardValue(0, 'ArrowRight', { min: 0, max: 10, step: 0 }), 0.1);
    assert.equal(sliderKeyboardValue(0.1, 'ArrowRight', { min: 0, max: 10, step: 0, shiftKey: true }), 1.1);
    assert.equal(sliderKeyboardValue(0.1, 'ArrowRight', { min: 0, max: 10, step: 0, ctrlKey: true }), 0.6);
    assert.equal(sliderKeyboardValue(50, 'PageUp', { min: 0, max: 100, step: 1 }), 60);
    assert.equal(sliderKeyboardValue(50, 'PageDown', { min: 0, max: 100, step: 1 }), 40);
    assert.equal(sliderKeyboardValue(10, 'Home', { min: 10, max: 20, step: 0 }), 10);
    assert.equal(sliderKeyboardValue(10, 'End', { min: 10, max: 20, step: 0 }), 20);
    assert.equal(sliderKeyboardValue(5, 'ArrowLeft', { min: 0, max: 10, step: 1, reverse: true }), 6);
    assert.equal(sliderKeyboardValue(5, 'ArrowLeft', { min: 0, max: 10, step: 1, rtl: true }), 6);
    assert.equal(sliderKeyboardValue(5, 'ArrowDown', { min: 0, max: 10, step: 1, direction: 'vertical' }), 4);
    assert.equal(sliderKeyboardValue(5, 'ArrowDown', { min: 0, max: 10, step: 1, direction: 'vertical', reverse: true }), 6);
    assert.equal(sliderKeyboardValue(4, 'ArrowRight', { min: 0, max: 10, step: 0.5, ctrlKey: true }), 5);
    assert.equal(sliderKeyboardValue(4, 'ArrowRight', { min: 0, max: 10, step: 0.5, shiftKey: true }), 5.5);
    assert.equal(sliderKeyboardValue(4, 'Tab', { min: 0, max: 10 }), undefined);
});

test('slider tick data supports explicit values, maps, labels and generated steps', () => {
    assert.deepEqual(sliderTicks(0, 4, 2, true).map(({ value, position }) => [value, position]), [[0, 0], [2, 50], [4, 100]]);
    assert.deepEqual(sliderTicks(0, 10, 0, 'always', [2, 8]).map(({ value, label }) => [value, label]), [[2, '2'], [8, '8']]);
    assert.deepEqual(sliderTicks(0, 10, 0, true, { 2: 'low', 8: 'high' }).map(({ value, label }) => [value, label]), [[2, 'low'], [8, 'high']]);
    assert.deepEqual(sliderTicks(0, 10, 0, true, undefined, ['low', 'mid', 'high']).map(({ value, label }) => [value, label]), [[0, 'low'], [5, 'mid'], [10, 'high']]);
    assert.deepEqual(sliderTicks(0, 10, 0, false, [0, 10]), []);
    assert.deepEqual(sliderTicks(0, 10, 0, true), []);
});

test('range model normalization preserves continuous fractions and handle boundaries', () => {
    assert.deepEqual(normalizeRange([1.125, 2.375], 0, 10, 0), [1.125, 2.375]);
    assert.deepEqual(normalizeRange([8, 2], 0, 10, 1), [2, 8]);
    assert.deepEqual(normalizeRange([8, 2], 0, 10, 1, 0), [2, 2]);
    assert.deepEqual(normalizeRange([2, 1], 0, 10, 1, 1), [2, 2]);
    assert.deepEqual(normalizeRange([-1, 12], 0, 10, 0), [0, 10]);
});

test('OTP filters custom patterns, preserves graphemes and inserts without mutating source', () => {
    assert.equal(normalizeOtp('A1b2', 3, true), '12');
    assert.equal(normalizeOtp('A1b2', 3, false, /^[A-Z0-9]$/), 'A12');
    assert.equal(filterOtpText('Aé1', '^[A-Z]$'), 'A');
    assert.equal(resolveOtpPattern('unicode-alpha')?.test('字'), true);
    assert.deepEqual(otpCharacters('A🙂e\u0301'), ['A', '🙂', 'e\u0301']);
    assert.equal(normalizeOtp('🙂Ae\u0301', 2), '🙂A');
    assert.equal(insertOtpText('12', 1, '345', 4), '1345');
    assert.equal(insertOtpText('AB', 1, 'x9', 4, /^[A-Z0-9]$/), 'A9');
    assert.equal(otpArrowDelta('ArrowLeft', false), -1);
    assert.equal(otpArrowDelta('ArrowLeft', true), 1);
    assert.equal(otpArrowDelta('ArrowRight', true), -1);
    assert.equal(otpArrowDelta('Home', true), undefined);
});
