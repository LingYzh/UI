import assert from 'node:assert/strict';
import test from 'node:test';
import {
    autoFixDateYear,
    createDateInputFormat,
    parseDateFormatSpec
} from '../src/ui/date-input-format';

function iso(value: Date | null): string | null {
    if (!value) return null;
    return `${String(value.getFullYear()).padStart(4, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

test('locale inference yields keyboard order and supported separators for US, UK, and Chinese locales', () => {
    const us = createDateInputFormat({ locale: 'en-US' });
    const uk = createDateInputFormat({ locale: 'en-GB' });
    const zh = createDateInputFormat({ locale: 'zh-CN' });

    assert.deepEqual([us.order, us.separator, us.parserFormat], ['mdy', '/', 'mm/dd/yyyy']);
    assert.deepEqual([uk.order, uk.separator, uk.parserFormat], ['dmy', '/', 'dd/mm/yyyy']);
    assert.deepEqual([zh.order, zh.separator, zh.parserFormat], ['ymd', '/', 'yyyy/mm/dd']);
    assert.equal(us.formatDate('2024-03-05'), '03/05/2024');
    assert.equal(uk.formatDate('2024-03-05'), '05/03/2024');
    assert.equal(zh.formatDate('2024-03-05'), '2024/03/05');
});

test('inputFormat parses order and slash, dash, or dot separators and emits padded parser placeholders', () => {
    const dateInput = createDateInputFormat({ locale: 'en-US', inputFormat: 'dd.mm.yyyy' });
    assert.deepEqual(parseDateFormatSpec('yyyy/mm/dd'), { order: 'ymd', separator: '/', format: 'yyyy/mm/dd' });
    assert.deepEqual(parseDateFormatSpec('MM-dd-YYYY'), { order: 'mdy', separator: '-', format: 'mm-dd-yyyy' });
    assert.equal(dateInput.parserFormat, 'dd.mm.yyyy');
    assert.equal(iso(dateInput.parseDate('29.02.2024')), '2024-02-29');
    assert.equal(dateInput.formatDate(new Date(2024, 1, 29)), '29.02.2024');
});

test('strict calendar checks reject rollover dates and accept leap days', () => {
    const dateInput = createDateInputFormat({ inputFormat: 'yyyy/mm/dd' });
    assert.equal(iso(dateInput.parseDate('2024/02/29')), '2024-02-29');
    assert.equal(dateInput.parseDate('2024/02/30'), null);
    assert.equal(dateInput.parseDate('2023/02/29'), null);
    assert.equal(dateInput.parseDate('2024-02-30'), null);
    assert.equal(dateInput.parseDate('2024-13-01'), null);
});

test('ISO strings and Date objects are accepted without mutating source values', () => {
    const dateInput = createDateInputFormat({ locale: 'en-US' });
    const source = new Date(2024, 1, 29, 18, 45, 12);
    const timestamp = source.getTime();
    const parsedDate = dateInput.parseDate(source);
    assert.notEqual(parsedDate, source);
    assert.equal(iso(parsedDate), '2024-02-29');
    assert.equal(source.getTime(), timestamp);
    assert.equal(source.getHours(), 18);
    assert.equal(iso(dateInput.parseDate('2024-02-29')), '2024-02-29');
    assert.equal(dateInput.formatDate('2024-02-29'), '02/29/2024');
});

test('two digit years follow Vuetify autoFixYear using an explicit current-year pivot', () => {
    const dateInput = createDateInputFormat({ inputFormat: 'm/d/y', currentYear: 2026 });
    assert.equal(autoFixDateYear(24, 2026), 2024);
    assert.equal(autoFixDateYear(75, 2026), 1975);
    assert.equal(autoFixDateYear(2024, 2026), 2024);
    assert.equal(iso(dateInput.parseDate('3/4/24')), '2024-03-04');
    assert.equal(iso(dateInput.parseDate('3/4/75')), '1975-03-04');
    assert.equal(dateInput.formatDate('2024-03-04'), '03/04/2024');
});

test('range and multiple values join with their shared separators and parse as Date objects', () => {
    const range = createDateInputFormat({ inputFormat: 'dd.mm.yyyy', mode: 'range' });
    const multiple = createDateInputFormat({ inputFormat: 'mm/dd/yyyy', mode: 'multiple' });
    const days = [new Date(2024, 11, 31), new Date(2024, 0, 1)];

    assert.deepEqual(range.separators, { date: '.', multiple: ', ', range: ' - ', join: ' - ' });
    assert.equal(range.joinDates(days), '31.12.2024 - 01.01.2024');
    const rangeResult = range.parseInput('31.12.2024 - 01.01.2024');
    assert.equal(rangeResult.valid, true);
    assert.ok(Array.isArray(rangeResult.value));
    assert.deepEqual((rangeResult.value as Date[]).map(iso), ['2024-01-01', '2024-12-31']);
    assert.equal(range.placeholder, 'dd.mm.yyyy - dd.mm.yyyy');

    assert.equal(multiple.joinDates(days), '12/31/2024, 01/01/2024');
    const multipleResult = multiple.parseInput('12/31/2024, 01/01/2024');
    assert.equal(multipleResult.valid, true);
    assert.ok(Array.isArray(multipleResult.value));
    assert.deepEqual((multipleResult.value as Date[]).map(iso), ['2024-12-31', '2024-01-01']);
    assert.equal(multiple.placeholder, 'mm/dd/yyyy, ...');
});

test('displayFormat functions and named string formats use locale and cloned Date values', () => {
    const original = new Date(2024, 2, 5, 18, 30);
    const originalTimestamp = original.getTime();
    const byFunction = createDateInputFormat({
        locale: 'en-US',
        displayFormat: date => {
            date.setFullYear(1999);
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
    });
    const byString = createDateInputFormat({ locale: 'en-GB', displayFormat: 'compact', formats: {
        compact: { year: 'numeric', month: '2-digit', day: '2-digit' }
    } });
    const builtin = createDateInputFormat({ locale: 'en-US', displayFormat: 'fullDate' });
    const pattern = createDateInputFormat({ locale: 'en-US', displayFormat: 'yyyy.mm.dd' });

    assert.equal(byFunction.formatDate(original), '1999-3-5');
    assert.equal(original.getTime(), originalTimestamp);
    assert.equal(byString.formatDate('2024-03-05'), '05/03/2024');
    assert.equal(builtin.formatDate('2024-03-05'), 'Mar 5, 2024');
    assert.equal(pattern.formatDate('2024-03-05'), '2024.03.05');
});

test('empty selections and placeholders follow single, multiple, and range modes', () => {
    const single = createDateInputFormat({ mode: 'single', inputFormat: 'yyyy-mm-dd' });
    const multiple = createDateInputFormat({ multiple: true, inputFormat: 'yyyy-mm-dd' });
    const range = createDateInputFormat({ mode: 'range', inputFormat: 'yyyy-mm-dd', placeholder: 'Choose a range' });

    assert.equal(single.empty(), null);
    assert.deepEqual(multiple.empty(), []);
    assert.deepEqual(range.empty(), []);
    assert.notEqual(multiple.empty(), multiple.empty());
    assert.equal(single.placeholder, 'yyyy-mm-dd');
    assert.equal(multiple.placeholder, 'yyyy-mm-dd, ...');
    assert.equal(range.placeholder, 'Choose a range');
    assert.deepEqual(single.parseInput('   '), { valid: true, value: null });
    assert.deepEqual(multiple.parseInput('   '), { valid: true, value: [] });
});

test('range input accepts the local en dash delimiter and rejects extra or invalid values', () => {
    const dateInput = createDateInputFormat({ mode: 'range', inputFormat: 'mm/dd/yyyy' });
    const result = dateInput.parseInput('03/05/2024 – 03/07/2024');
    assert.equal(result.valid, true);
    assert.ok(Array.isArray(result.value));
    assert.deepEqual((result.value as Date[]).map(iso), ['2024-03-05', '2024-03-07']);
    assert.equal(dateInput.parseInput('03/05/2024 - 03/07/2024 - 03/08/2024').valid, false);
    assert.equal(dateInput.parseInput('03/05/2024 - 02/30/2024').valid, false);
});

test('RTL joining reverses a copy and does not mutate the caller array', () => {
    const dateInput = createDateInputFormat({ inputFormat: 'yyyy/mm/dd', mode: 'range', isRtl: true });
    const values = ['2024/01/01', '2024/01/02'];
    assert.equal(dateInput.join(values, 'range'), '2024/01/02 - 2024/01/01');
    assert.deepEqual(values, ['2024/01/01', '2024/01/02']);
});
