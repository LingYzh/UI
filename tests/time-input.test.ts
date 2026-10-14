import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allowedTimeInput, allowedTimeInputField, displayTimeInput, initialTimeInput, validTimeInputSelection } from '../src/ui/time-input';

test('time ranges honor disjoint intervals and minute/second boundaries', () => {
    const options = { useSeconds: true, allowedRanges: [['09:15:20', '10:30:10'], ['13:00:00', '14:00:00']] as const };
    assert.equal(allowedTimeInput('09:15:19', options), false);
    assert.equal(allowedTimeInput('09:15:20', options), true);
    assert.equal(allowedTimeInput('12:00:00', options), false);
    assert.equal(allowedTimeInput('10:30:11', options), false);
    assert.equal(allowedTimeInputField('hour', 9, '09:00:00', options), true);
    assert.equal(allowedTimeInputField('hour', 12, '09:00:00', options), false);
    assert.equal(allowedTimeInputField('minute', 14, '09:15:20', options), false);
    assert.equal(allowedTimeInputField('second', 19, '09:15:20', options), false);
    assert.equal(initialTimeInput(options), '09:15:20');
    assert.equal(initialTimeInput({ ...options, useSeconds: false }), '09:16');
});

test('range commit requires complete ordered endpoints without altering output protocol', () => {
    assert.equal(validTimeInputSelection(['10:00', '09:00'], true), false);
    assert.equal(validTimeInputSelection(['09:00'], true), false);
    assert.equal(validTimeInputSelection(['09:00', '10:00'], true), true);
    assert.equal(validTimeInputSelection([], true), true);
    assert.equal(validTimeInputSelection('09:00:01', false, { min: '09:00:02', useSeconds: true }), false);
    assert.equal(validTimeInputSelection('25:00', false), false);
    assert.equal(displayTimeInput('14:05:06', { useSeconds: true, displayFormat: 'hh:mm:ss A' }), '02:05:06 PM');
    assert.equal(displayTimeInput('14:05', { format: '12h' }), '02:05 PM');
});
