import assert from 'node:assert/strict';
import test from 'node:test';
import { getPath, groupRows, itemKey, pageItems, processItems } from '../src/ui/data-pipeline';
import { addDays, addMonths, isAllowedDate, monthDays, parseIsoDate, parseTime, selectDate, selectedDates, validTime } from '../src/ui/date-model';
import { ref } from 'vue';
import { createGroup } from '../src/ui/group-state';

test('data pipeline filters mapped fields, preserves stable multi-sort, and pages after filtering', () => {
    const items = [
        { id: 'a', meta: { name: 'Alpha' }, group: 'x', score: 2 },
        { id: 'b', meta: { name: 'Beta' }, group: 'y', score: 1 },
        { id: 'c', meta: { name: 'Gamma' }, group: 'x', score: 2 },
        { id: 'd', meta: { name: 'Delta' }, group: 'y', score: 2 }
    ];
    assert.equal(getPath(items[0], 'meta.name'), 'Alpha');
    assert.deepEqual(processItems(items, { headers: [{ key: 'name', value: 'meta.name', title: 'Name' }], search: 'ta' }).map((item) => item.id), ['b', 'd']);
    const sorted = processItems(items, { sortBy: [{ key: 'score', order: 'desc' }, { key: 'meta.name', order: 'asc' }] });
    assert.deepEqual(sorted.map((item) => item.id), ['a', 'd', 'c', 'b']);
    assert.deepEqual(pageItems(sorted, 2, 2).map((item) => item.id), ['c', 'b']);
    assert.deepEqual(groupRows(sorted, [{ key: 'group' }]).filter((row) => row.type === 'group').map((row) => row.title), ['x', 'y']);
    const anonymous = { name: 'Stable' };
    assert.equal(itemKey(anonymous), itemKey(anonymous));
});

test('local ISO arithmetic survives month and daylight saving boundaries', () => {
    assert.equal(parseIsoDate('2024-02-30'), null);
    assert.equal(addDays('2024-03-31', 1), '2024-04-01');
    assert.equal(addDays('2024-02-28', 1), '2024-02-29');
    assert.equal(addMonths('2024-01-31', 1), '2024-02-01');
    assert.equal(monthDays('2024-02-15').length, 42);
    assert.equal(monthDays('2024-02-15').filter((day) => day.current).length, 29);
});

test('date range and allowed dates honor the full selected span', () => {
    const range = selectDate(selectDate(null, '2024-04-12', 'range'), '2024-04-10', 'range');
    assert.deepEqual(range, ['2024-04-10', '2024-04-12']);
    assert.deepEqual(selectedDates(range, 'range'), ['2024-04-10', '2024-04-11', '2024-04-12']);
    assert.equal(isAllowedDate('2024-04-11', '2024-04-10', '2024-04-12', (day) => day !== '2024-04-11'), false);
    assert.equal(isAllowedDate('2024-04-13', '2024-04-10', '2024-04-12'), false);
    assert.equal(validTime('23:59'), true);
    assert.equal(validTime('24:00'), false);
    assert.equal(validTime('12:45 PM', '12h'), true);
    assert.equal(parseTime('12:00 AM', '12h')?.minutes, 0);
    assert.equal(parseTime('12:00 PM', '12h')?.minutes, 720);
    assert.equal(parseTime('01:30 PM', '12h')?.minutes, 810);
});

test('group mandatory and multiple selections do not clear the last value', () => {
    const selected = ref<string | number | Array<string | number> | null>(null);
    const group = createGroup(selected, { mandatory: true, multiple: true });
    const removeA = group.register('a');
    group.register('b');
    assert.deepEqual(selected.value, ['a']);
    group.select('a');
    assert.deepEqual(selected.value, ['a']);
    group.select('b');
    assert.deepEqual(selected.value, ['a', 'b']);
    removeA();
    assert.deepEqual(selected.value, ['b']);
});
