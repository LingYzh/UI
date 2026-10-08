import assert from 'node:assert/strict';
import test from 'node:test';
import {
    convert12HourTo24,
    convert24HourTo12,
    formatTimeDisplay,
    formatTimeValue,
    getDisabledTimeValues,
    getTimePickerItems,
    isTimeValueAllowed,
    moveTimeValue,
    nextTimeViewMode,
    parseTimeInput,
    setTimePeriod,
    stepTimeValue,
    type TimePickerParts
} from '../src/ui/time-picker';

const parts = (hour: number | null, minute: number | null, second: number | null = null): TimePickerParts => ({
    hour,
    minute,
    second,
    period: hour === null || hour < 12 ? 'am' : 'pm'
});

test('canonical output stays 24-hour while legacy AM/PM inputs normalize to 24-hour parts', () => {
    assert.equal(parseTimeInput('00:05')?.canonical, '00:05');
    assert.equal(parseTimeInput('12:00 AM')?.canonical, '00:00');
    assert.equal(parseTimeInput('12:00pm')?.canonical, '12:00');
    assert.equal(parseTimeInput('01:09:08 PM', { useSeconds: true })?.canonical, '13:09:08');
    assert.equal(parseTimeInput('23:59:59', { useSeconds: true })?.canonical, '23:59:59');
    assert.equal(formatTimeValue(parts(23, 59, 8), { useSeconds: true }), '23:59:08');
    assert.equal(convert12HourTo24(12, 'am'), 0);
    assert.equal(convert12HourTo24(12, 'pm'), 12);
    assert.equal(convert24HourTo12(0), 12);
    assert.equal(convert24HourTo12(12), 12);
    assert.equal(convert24HourTo12(23), 11);
});

test('partial fields remain editable but never produce a model value until required fields are present', () => {
    const hourOnly = parseTimeInput('23');
    assert.equal(hourOnly.parts.hour, 23);
    assert.equal(hourOnly.parts.minute, null);
    assert.equal(hourOnly.complete, false);
    assert.equal(hourOnly.canonical, null);

    const missingMinute = parseTimeInput('23:');
    assert.equal(missingMinute.parts.hour, 23);
    assert.equal(missingMinute.parts.minute, null);
    assert.equal(missingMinute.canonical, null);

    const missingSeconds = parseTimeInput('23:05', { useSeconds: true });
    assert.equal(missingSeconds.parts.minute, 5);
    assert.equal(missingSeconds.parts.second, null);
    assert.equal(missingSeconds.complete, false);
    assert.equal(missingSeconds.canonical, null);

    assert.equal(parseTimeInput('23:05').canonical, '23:05');
    assert.equal(formatTimeValue(parts(23, 5), { useSeconds: true }), null);
});

test('parsing validates field ranges, supports explicit display-period input, and rejects malformed text', () => {
    assert.equal(parseTimeInput('25:00').valid, false);
    assert.equal(parseTimeInput('12:60').canonical, null);
    assert.equal(parseTimeInput('13:00 PM').valid, false);
    assert.equal(parseTimeInput('02:30', { format: '12h', inputMode: 'display', period: 'pm' }).canonical, '14:30');
    assert.equal(parseTimeInput('not a time').valid, false);
    assert.equal(parseTimeInput(null).valid, true);
});

test('12-hour display formatting leaves canonical values intact and can move the period label into a title', () => {
    assert.deepEqual(formatTimeDisplay(parts(0, 5), { format: '12h' }), {
        text: '12:05 AM', period: 'AM', periodPlacement: 'inline'
    });
    assert.deepEqual(formatTimeDisplay(parts(12, 30, 4), { format: 'ampm', useSeconds: true, ampmInTitle: true }), {
        text: '12:30:04', period: 'PM', periodPlacement: 'title'
    });
    assert.equal(formatTimeDisplay(parts(23, 59), { format: '24h' })?.text, '23:59');
    assert.equal(formatTimeDisplay(parts(12, 30), { format: '12h' })?.text, '12:30 PM');
});

test('min/max boundary validation follows the upstream per-view rules and allowed filters compose afterward', () => {
    const options = {
        min: '10:15:30',
        max: '10:16:30',
        allowedHours: [10],
        allowedMinutes: (value: number) => value % 15 === 0,
        allowedSeconds: [0, 30]
    };
    assert.equal(isTimeValueAllowed('hour', 10, parts(null, null), options), true);
    assert.equal(isTimeValueAllowed('hour', 9, parts(null, null), options), false);
    assert.equal(isTimeValueAllowed('minute', 14, parts(10, null), options), false);
    assert.equal(isTimeValueAllowed('minute', 15, parts(10, null), options), true);
    assert.equal(isTimeValueAllowed('minute', 30, parts(10, null), options), false);
    assert.equal(isTimeValueAllowed('second', 29, parts(10, 15), options), false);
    assert.equal(isTimeValueAllowed('second', 30, parts(10, 15), options), true);
    assert.equal(isTimeValueAllowed('second', 30, parts(10, 16), options), true);
    assert.equal(isTimeValueAllowed('second', 31, parts(10, 16), options), false);
});

test('seconds validation mirrors upstream max strings without seconds, where the upper second defaults to zero', () => {
    const maxWithoutSeconds = { max: '10:16' };
    assert.equal(isTimeValueAllowed('second', 59, parts(10, 15), maxWithoutSeconds), true);
    assert.equal(isTimeValueAllowed('second', 0, parts(10, 16), maxWithoutSeconds), true);
    assert.equal(isTimeValueAllowed('second', 1, parts(10, 16), maxWithoutSeconds), false);
    assert.equal(isTimeValueAllowed('second', 0, parts(10, 17), maxWithoutSeconds), false);
});

test('item derivation exposes disabled values in the active display domain', () => {
    const displayItems = getTimePickerItems('hour', parts(14, 0), { format: '12h', min: '13:00' });
    assert.deepEqual(displayItems.slice(0, 2).map(item => [item.value, item.timeValue, item.disabled]), [
        [1, 13, false], [2, 14, false]
    ]);
    assert.equal(displayItems.find(item => item.value === 12)?.timeValue, 12);

    const disabledMinutes = getDisabledTimeValues('minute', parts(10, 0), { allowedMinutes: [0, 30] });
    assert.equal(disabledMinutes.length, 58);
    assert.deepEqual(disabledMinutes.slice(0, 4), [1, 2, 3, 4]);
    assert.equal(getDisabledTimeValues('second', parts(null, null), { allowedSeconds: [5] }).length, 59);
});

test('period changes preserve the displayed 12-hour value and exact moves reject disabled items', () => {
    assert.deepEqual(setTimePeriod(parts(0, 25), 'pm'), parts(12, 25));
    assert.deepEqual(setTimePeriod(parts(13, 25), 'am'), parts(1, 25));
    assert.deepEqual(setTimePeriod(parts(null, 25), 'pm'), { hour: null, minute: 25, second: null, period: 'pm' });
    assert.deepEqual(moveTimeValue(parts(10, 0), 'minute', 30, { allowedMinutes: [0, 30] }), parts(10, 30));
    assert.equal(moveTimeValue(parts(10, 0), 'minute', 31, { allowedMinutes: [0, 30] }), null);
    assert.deepEqual(moveTimeValue(parts(12, 0), 'hour', 1, { format: '12h', period: 'pm' }), parts(13, 0));
});

test('stepping wraps within each view and skips disallowed values without mutating source parts', () => {
    const initial = parts(23, 59, 59);
    assert.deepEqual(stepTimeValue(initial, 'hour', 1), parts(0, 59, 59));
    assert.deepEqual(stepTimeValue(initial, 'minute', 1), parts(23, 0, 59));
    assert.deepEqual(stepTimeValue(initial, 'second', -1), parts(23, 59, 58));
    assert.deepEqual(stepTimeValue(parts(10, 0), 'minute', 1, { allowedMinutes: [0, 20] }), parts(10, 20));
    assert.deepEqual(stepTimeValue(parts(10, 7), 'minute', 1, { allowedMinutes: [] }), parts(10, 7));
    assert.deepEqual(initial, parts(23, 59, 59));
});

test('view progression follows hour, minute, optional second, then stops', () => {
    assert.equal(nextTimeViewMode('hour'), 'minute');
    assert.equal(nextTimeViewMode('minute'), null);
    assert.equal(nextTimeViewMode('minute', true), 'second');
    assert.equal(nextTimeViewMode('second', true), null);
});
