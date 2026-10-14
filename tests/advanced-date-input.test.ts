import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import vue from '@vitejs/plugin-vue';
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc';
import {
    cloneAdvancedDateSelection,
    combineCalendarDatesWithTimes,
    createAdvancedDateInputFormat,
    dateSelectionForCalendar,
    dateTimeBoundsForDate,
    dateTimeDraftTimes,
    endOfDatePeriod,
    formatAdvancedDate,
    formatTimeOfDay,
    isAdvancedDateSelectionAllowed,
    isAllowedDatePeriod,
    mergeDateAndTime,
    normalizeDateToGranularity,
    parseAdvancedDate,
    selectDateForGranularity,
    selectedDatesForGranularity,
    startOfDatePeriod,
    type AdvancedDateInputOptions
} from '../src/ui/advanced-date-input';
import { getCalendarFirstDayOfWeek } from '../src/ui/calendar';
import { selectDate, selectedDates, type DateSelection } from '../src/ui/date-model';

function localDate(value: string): Date {
    const date = parseAdvancedDate(value);
    assert.ok(date, `Expected ${value} to parse`);
    return date;
}

function key(value: Date | null | undefined): string | null {
    if (!value) return null;
    return `${String(value.getFullYear()).padStart(4, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function dateValues(value: DateSelection): Date[] {
    return Array.isArray(value) ? value as Date[] : value instanceof Date ? [value] : [];
}

test('advanced ISO parsing clones Date values, supports year/month/day and rejects rollover', () => {
    assert.equal(key(parseAdvancedDate('2024')), '2024-01-01');
    assert.equal(key(parseAdvancedDate('2024-02')), '2024-02-01');
    assert.equal(key(parseAdvancedDate('2024-02-29')), '2024-02-29');
    assert.equal(parseAdvancedDate('2023-02-29'), null);
    assert.equal(parseAdvancedDate('2024-02-30'), null);
    assert.equal(parseAdvancedDate('2024-13'), null);

    const source = new Date(2024, 1, 29, 23, 45, 6, 250);
    const parsed = parseAdvancedDate(source);
    assert.ok(parsed);
    assert.notEqual(parsed, source);
    assert.equal(parsed.getTime(), source.getTime());
    assert.equal(source.getTime(), new Date(2024, 1, 29, 23, 45, 6, 250).getTime());
});

test('date-time parsing and formatting retain seconds and reject invalid times', () => {
    const options: AdvancedDateInputOptions = {
        datetime: true,
        inputFormat: 'YYYY-MM-DD HH:mm:ss',
        displayFormat: 'YYYY-MM-DD HH:mm:ss'
    };
    const value = parseAdvancedDate('2024-02-29T23:45:06', options);
    assert.ok(value);
    assert.equal(formatAdvancedDate(value, options), '2024-02-29 23:45:06');
    assert.equal(parseAdvancedDate('2024-02-29 24:00:00', options), null);
    assert.equal(parseAdvancedDate('2024-02-29 23:60:00', options), null);
    assert.equal(parseAdvancedDate('2024-02-29 23:45:60', options), null);

    let callbackValue: Date | null = null;
    assert.equal(formatAdvancedDate(value, { datetime: true, displayFormat: date => {
        callbackValue = date;
        return String(date.getHours());
    } }), '23');
    assert.ok(callbackValue);
    assert.notEqual(callbackValue, value);
    assert.equal(callbackValue.getSeconds(), 6);
});

test('week selection uses the locale week boundary and calendar week numbering', () => {
    const options: AdvancedDateInputOptions = { locale: 'zh-CN', granularity: 'week', inputFormat: 'YYYY 第 ww 周', displayFormat: 'YYYY 第 ww 周' };
    assert.equal(getCalendarFirstDayOfWeek('zh-CN'), 1);

    const weekStart = startOfDatePeriod(new Date(2024, 0, 7, 14, 30), 'week', options);
    assert.equal(key(weekStart), '2024-01-01');
    assert.equal(weekStart?.getHours(), 0);
    assert.equal(key(endOfDatePeriod(new Date(2024, 0, 7), 'week', options)), '2024-01-07');

    const text = formatAdvancedDate(new Date(2024, 0, 3), options);
    assert.equal(text, '2024 第 01 周');
    assert.equal(key(parseAdvancedDate(text, options)), '2024-01-01');
    assert.equal(parseAdvancedDate('2024 第 54 周', options), null);
});

test('default day selection and range expansion keep the existing Date model behavior', () => {
    const first = selectDate(null, '2024-02-28', 'range');
    const range = selectDate(first, '2024-03-01', 'range');
    assert.deepEqual(dateValues(range).map(key), ['2024-02-28', '2024-03-01']);
    assert.deepEqual(selectedDates(range, 'range'), ['2024-02-28', '2024-02-29', '2024-03-01']);
    assert.deepEqual(selectedDatesForGranularity(range, 'range', 'day'), selectedDates(range, 'range'));
    assert.equal(key(selectDateForGranularity(null, '2024-02-29', 'single', 'day') as Date), '2024-02-29');
});

test('month and year selections normalize to their starting dates and preserve full period ranges', () => {
    const month = selectDateForGranularity(null, '2024-02-18', 'single', 'month');
    assert.equal(key(month instanceof Date ? month : null), '2024-02-01');
    const year = normalizeDateToGranularity(new Date(2024, 5, 15, 9, 30), 'year', {}, false);
    assert.equal(key(year), '2024-01-01');
    assert.equal(year.getHours(), 0);

    const range = selectDateForGranularity(null, '2024-02-18', 'range', 'month');
    const selected = selectDateForGranularity(range, '2024-04-07', 'range', 'month');
    assert.deepEqual(dateValues(selected).map(key), ['2024-02-01', '2024-04-01']);
    const highlighted = selectedDatesForGranularity(selected, 'range', 'month');
    assert.equal(highlighted[0], '2024-02-01');
    assert.equal(highlighted.at(-1), '2024-04-30');
    assert.equal(highlighted.length, 90);

    const years = selectedDatesForGranularity([new Date(2023, 11, 10), new Date(2025, 0, 1)], 'range', 'year');
    assert.equal(years[0], '2023-01-01');
    assert.equal(years.at(-1), '2025-12-31');
});

test('period min/max validation accepts overlapping periods instead of comparing only their starts', () => {
    assert.equal(isAllowedDatePeriod(new Date(2024, 0, 1), new Date(2024, 10, 15), new Date(2024, 11, 1), 'year'), true);
    assert.equal(isAllowedDatePeriod(new Date(2023, 0, 1), new Date(2024, 10, 15), undefined, 'year'), false);
    assert.equal(isAllowedDatePeriod(new Date(2024, 1, 1), new Date(2024, 1, 15), new Date(2024, 2, 5), 'month'), true);
    assert.equal(isAllowedDatePeriod(new Date(2024, 0, 1), new Date(2024, 1, 15), undefined, 'month'), false);
});

test('calendar date proxy preserves each range endpoint time and datetime drafts stay ordered', () => {
    const original: DateSelection = [new Date(2024, 1, 3, 16, 20, 30), new Date(2024, 1, 1, 8, 10, 5)];
    const calendarValue = dateSelectionForCalendar(original, 'range', { datetime: true });
    assert.deepEqual(dateValues(calendarValue).map(date => [key(date), formatTimeOfDay(date)]), [
        ['2024-02-01', '00:00:00'],
        ['2024-02-03', '00:00:00']
    ]);

    const times = dateTimeDraftTimes(original, 'range', { datetime: true });
    assert.deepEqual(times, { start: '08:10:05', end: '16:20:30' });
    const next = combineCalendarDatesWithTimes(calendarValue, times, 'range', { datetime: true });
    assert.deepEqual(dateValues(next).map(date => [key(date), formatTimeOfDay(date)]), [
        ['2024-02-01', '08:10:05'],
        ['2024-02-03', '16:20:30']
    ]);
    assert.equal(mergeDateAndTime(new Date(2024, 1, 29, 20), '00:00:00')?.getHours(), 0);

    const cloned = cloneAdvancedDateSelection(next, 'range', { datetime: true });
    assert.deepEqual(dateValues(cloned).map(date => date.getTime()), dateValues(next).map(date => date.getTime()));
});

test('datetime input ranges validate order, seconds and date-time boundaries', () => {
    const options: AdvancedDateInputOptions = { datetime: true, mode: 'range' };
    const format = createAdvancedDateInputFormat(options);
    const valid = format.parseInput('2024-02-29 09:15:20 - 2024-02-29 17:30:10', 'range');
    assert.equal(valid.valid, true);
    assert.ok(Array.isArray(valid.value));
    assert.equal(format.formatSelection(valid.value, 'range'), '2024-02-29 09:15:20 - 2024-02-29 17:30:10');
    assert.equal(format.parseInput('2024-02-29 17:30:10 - 2024-02-29 09:15:20', 'range').valid, false);

    const range = valid.value as Date[];
    assert.equal(isAdvancedDateSelectionAllowed(range, { ...options, min: '2024-02-29 09:15:20', max: '2024-02-29 17:30:10' }), true);
    assert.equal(isAdvancedDateSelectionAllowed(range, { ...options, min: '2024-02-29 09:15:21' }), false);
    assert.equal(isAdvancedDateSelectionAllowed([new Date(2024, 1, 29, 17, 30, 11)], { ...options, mode: 'single', max: '2024-02-29 17:30:10' }), false);

    const bounds = dateTimeBoundsForDate(new Date(2024, 1, 29), '2024-02-29 09:15:20', '2024-02-29 17:30:10');
    assert.deepEqual(bounds, { min: '09:15:20', max: '17:30:10', allowed: true });
    assert.equal(dateTimeBoundsForDate(new Date(2024, 2, 1), '2024-02-29 09:15:20', '2024-02-29 17:30:10').allowed, false);
});

test('advanced range formatters share literal separators across day, week, month, year and datetime modes', () => {
    const cases: Array<{ options: AdvancedDateInputOptions; values: Date[] }> = [
        { options: { mode: 'range', granularity: 'day', rangeSeparator: '至' }, values: [new Date(2024, 0, 2), new Date(2024, 0, 5)] },
        { options: { mode: 'range', granularity: 'week', rangeSeparator: ' -> ', firstDayOfWeek: 1 }, values: [new Date(2024, 0, 3), new Date(2024, 0, 17)] },
        { options: { mode: 'range', granularity: 'month', rangeSeparator: '.*' }, values: [new Date(2024, 1, 17), new Date(2024, 3, 8)] },
        { options: { mode: 'range', granularity: 'year', rangeSeparator: ' 至 ' }, values: [new Date(2022, 5, 3), new Date(2024, 8, 7)] },
        { options: { mode: 'range', datetime: true, inputFormat: 'YYYY-MM-DD HH:mm:ss', rangeSeparator: '-' }, values: [new Date(2024, 0, 2, 9, 15, 20), new Date(2024, 0, 4, 17, 30, 10)] }
    ];

    for (const { options, values } of cases) {
        const format = createAdvancedDateInputFormat(options);
        const separator = options.rangeSeparator!;
        const text = format.joinDates(values, 'range');
        assert.equal(format.separators.range, separator);
        assert.equal(format.separators.join, separator);
        assert.equal(format.separators.multiple, ', ');
        assert.ok(format.placeholder.includes(separator));
        assert.equal(format.formatSelection(values, 'range'), text);
        const parsed = format.parseInput(text, 'range');
        assert.equal(parsed.valid, true, 'advanced mode must parse its own formatted range');
        assert.equal(format.formatSelection(parsed.value, 'range'), text);
    }

    const blank = createAdvancedDateInputFormat({ mode: 'range', granularity: 'month', rangeSeparator: '   ' });
    assert.equal(blank.separators.range, ' - ');
    assert.equal(blank.placeholder, 'YYYY-MM - YYYY-MM');

    const multiple = createAdvancedDateInputFormat({ mode: 'multiple', granularity: 'month', rangeSeparator: ' -> ' });
    const monthlyValues = [new Date(2024, 1, 1), new Date(2024, 3, 1)];
    assert.equal(multiple.joinDates(monthlyValues, 'multiple'), '2024-02, 2024-04');
    assert.equal(multiple.parseInput('2024-02, 2024-04', 'multiple').valid, true);
});

test('UDateInput keeps mode-specific hideActions defaults in Vue runtime props', { timeout: 120_000 }, async () => {
    const viteServer = await createServer({
        root: process.cwd(),
        configFile: false,
        plugins: [vue()],
        optimizeDeps: { noDiscovery: true, include: [] },
        appType: 'custom',
        // 纯编译/SSR 测试无需监听工作区，避免碰到 Electron 验收 profile 的锁文件。
        server: { middlewareMode: true, watch: null },
        resolve: { dedupe: ['vue'] },
        logLevel: 'silent'
    });
    try {
        const component = (await viteServer.ssrLoadModule('/src/ui/UDateInput.vue')).default as { props: Record<string, unknown> };
        const Probe = defineComponent({
            props: component.props as any,
            setup(props: { hideActions?: boolean; datetime?: boolean }) {
                return () => h('span', {
                    'data-hide-actions-unset': String(props.hideActions === undefined),
                    'data-effective-hide-actions': String(props.hideActions ?? !props.datetime)
                });
            }
        });
        const dayMarkup = await renderToString(createSSRApp(h(Probe)));
        const dateTimeMarkup = await renderToString(createSSRApp(h(Probe, { datetime: true })));
        assert.match(dayMarkup, /data-hide-actions-unset="true"/);
        assert.match(dayMarkup, /data-effective-hide-actions="true"/);
        assert.match(dateTimeMarkup, /data-hide-actions-unset="true"/);
        assert.match(dateTimeMarkup, /data-effective-hide-actions="false"/);
    } finally {
        await viteServer.close();
    }
});

test('UDateInput and UDatePicker script setup and templates compile with imported types', () => {
    const fs = { fileExists: existsSync, readFile: (path: string) => readFileSync(path, 'utf8') };
    for (const component of ['UDateInput.vue', 'UDatePicker.vue']) {
        const filename = join(process.cwd(), 'src', 'ui', component);
        const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename });
        assert.deepEqual(errors, [], `${component} should parse`);
        assert.ok(descriptor.template, `${component} should include a template`);
        const id = component.replace(/\.vue$/, '').toLowerCase();
        const script = compileScript(descriptor, { id, fs });
        const template = compileTemplate({
            source: descriptor.template.content,
            filename,
            id,
            compilerOptions: { bindingMetadata: script.bindings }
        });
        assert.deepEqual(template.errors, [], `${component} template should compile`);
    }
});
