import assert from 'node:assert/strict';
import test from 'node:test';
import {
    addCalendarDays,
    addCalendarMinutes,
    buildAllDayEventSpans,
    buildCalendarCategoryDays,
    buildCalendarView,
    buildTimedEventSlices,
    calendarTimedEventOnDate,
    createCalendarIntervals,
    daysInCalendarMonth,
    filterCalendarCategories,
    getCalendarEventsForCategory,
    getCalendarFirstDayOfWeek,
    layoutCalendarTimedEvents,
    moveCalendarDate,
    normalizeCalendarWeekdays,
    parseCalendarCategories,
    parseCalendarEvents,
    parseCalendarTimestamp,
    parseCalendarTime,
    resolveCalendarCategories,
    type CalendarDay,
    type CalendarTimestamp
} from '../src/ui/calendar';

function timestamp(value: string): CalendarTimestamp {
    const parsed = parseCalendarTimestamp(value);
    assert.ok(parsed, `expected valid timestamp: ${value}`);
    return parsed;
}

function day(value: string): CalendarDay {
    const parsed = buildCalendarView({ type: 'day', modelValue: value, now: value });
    assert.equal(parsed.days.length, 1);
    return parsed.days[0];
}

test('timestamp parsing uses local calendar fields, validates leap dates, and rejects rollover', () => {
    assert.equal(daysInCalendarMonth(2000, 2), 29);
    assert.equal(daysInCalendarMonth(1900, 2), 28);
    assert.equal(parseCalendarTimestamp('2024-02-29')?.date, '2024-02-29');
    assert.equal(parseCalendarTimestamp('2023-02-29'), null);
    assert.equal(parseCalendarTimestamp('2024-02-30'), null);
    assert.equal(parseCalendarTimestamp('2024-13-01'), null);
    assert.equal(parseCalendarTimestamp('2024-02-29 24:00'), null);
    assert.equal(parseCalendarTimestamp('2024-02-29 12:60'), null);
    assert.equal(parseCalendarTimestamp('2024-02-29T09:07:05')?.time, '09:07');

    const local = new Date(2024, 1, 29, 14, 5, 6);
    const fromDate = parseCalendarTimestamp(local);
    const fromEpoch = parseCalendarTimestamp(local.getTime());
    assert.deepEqual(fromDate, fromEpoch);
    assert.deepEqual(
        [fromDate?.year, fromDate?.month, fromDate?.day, fromDate?.hour, fromDate?.minute, fromDate?.second, fromDate?.weekday],
        [local.getFullYear(), local.getMonth() + 1, local.getDate(), local.getHours(), local.getMinutes(), local.getSeconds(), local.getDay()]
    );
    assert.deepEqual(parseCalendarTimestamp('2024-02-29 09:30', '2024-02-29 10:00') && {
        past: parseCalendarTimestamp('2024-02-29 09:30', '2024-02-29 10:00')?.past,
        present: parseCalendarTimestamp('2024-02-29 09:30', '2024-02-29 10:00')?.present,
        future: parseCalendarTimestamp('2024-02-29 09:30', '2024-02-29 10:00')?.future
    }, { past: true, present: false, future: false });
    assert.deepEqual(
        [timestamp('2024-02-29').weekday, timestamp('2024-03-01').weekday],
        [4, 5]
    );
});

test('weekday arithmetic matches native local Date for every date from 1900 through 2100', () => {
    let checked = 0;
    for (let year = 1900; year <= 2100; year += 1) {
        for (let month = 1; month <= 12; month += 1) {
            for (let date = 1; date <= daysInCalendarMonth(year, month); date += 1) {
                const input = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                const parsed = parseCalendarTimestamp(input);
                assert.ok(parsed, `expected a valid calendar date: ${input}`);
                assert.equal(parsed.weekday, new Date(year, month - 1, date).getDay(), input);
                checked += 1;
            }
        }
    }
    assert.ok(checked > 73_000);
});

test('date arithmetic crosses month and year boundaries without mutating its input', () => {
    const leapEve = timestamp('2024-02-28');
    assert.equal(addCalendarDays(leapEve, 1).date, '2024-02-29');
    assert.equal(addCalendarDays(leapEve, 2).date, '2024-03-01');
    assert.equal(addCalendarDays(timestamp('2023-12-31'), 1).date, '2024-01-01');
    assert.equal(addCalendarDays(timestamp('2024-01-01'), -1).date, '2023-12-31');
    assert.equal(addCalendarMinutes(timestamp('2024-12-31 23:30'), 90).date, '2025-01-01');
    assert.equal(addCalendarMinutes(timestamp('2024-12-31 23:30'), 90).time, '01:00');
    assert.equal(leapEve.date, '2024-02-28');
});

test('weekday normalization rotates around the requested week start and rejects malformed lists', () => {
    assert.equal(getCalendarFirstDayOfWeek('en-GB'), 1);
    assert.equal(getCalendarFirstDayOfWeek('en-US'), 0);
    assert.deepEqual(normalizeCalendarWeekdays([0, 1, 2, 3, 4, 5, 6], 1), [1, 2, 3, 4, 5, 6, 0]);
    assert.deepEqual(normalizeCalendarWeekdays('1,3,5', 1), [1, 3, 5]);
    assert.deepEqual(normalizeCalendarWeekdays([1, 1], 1), []);
    assert.deepEqual(normalizeCalendarWeekdays('7', 0), []);
});

test('month and weekly views include selected weekdays, outside padding, and bounded custom ranges', () => {
    const february = buildCalendarView({ type: 'month', modelValue: '2024-02-15', now: '2024-02-15', firstDayOfWeek: 0 });
    assert.equal(february.start.date, '2024-02-01');
    assert.equal(february.end.date, '2024-02-29');
    assert.equal(february.days.length, 35);
    assert.equal(february.weeks.length, 5);
    assert.equal(february.days[0].date, '2024-01-28');
    assert.equal(february.days[0].outside, true);
    assert.equal(february.days[34].date, '2024-03-02');
    assert.equal(february.days[34].outside, true);
    assert.equal(february.weeks[0][0].weekIndex, 0);
    assert.equal(february.weeks[0][0].firstWeekday, 0);

    const selected = buildCalendarView({
        type: 'custom-weekly', start: '2024-01-01', end: '2024-01-07', now: '2024-01-01',
        weekdays: [1, 3, 5], firstDayOfWeek: 1
    });
    assert.deepEqual(selected.days.map(item => item.date), ['2024-01-01', '2024-01-03', '2024-01-05', '2024-01-08', '2024-01-10', '2024-01-12']);
    assert.equal(selected.weeks.length, 2);

    const capped = buildCalendarView({
        type: 'custom-daily', start: '2024-01-01', end: '2024-01-10', maxDays: 2, now: '2024-01-01'
    });
    assert.deepEqual(capped.days.map(item => item.date), ['2024-01-01', '2024-01-02']);
    const emptyLimit = buildCalendarView({
        type: 'custom-daily', start: '2024-01-03', end: '2024-01-01', maxDays: 0, now: '2024-01-03'
    });
    assert.equal(emptyLimit.days.length, 0);

    const dateOnlyDefault = buildCalendarView({ now: new Date(2024, 1, 29, 14, 30) });
    assert.equal(dateOnlyDefault.anchor.date, '2024-02-29');
    assert.equal(dateOnlyDefault.anchor.hasTime, false);
});

test('daily, four-day, category views and navigation use their respective range lengths', () => {
    const four = buildCalendarView({ type: '4day', modelValue: '2024-01-03', now: '2024-01-03' });
    assert.deepEqual(four.days.map(item => item.date), ['2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06']);
    const one = buildCalendarView({ type: 'day', modelValue: '2024-01-03', now: '2024-01-03' });
    assert.equal(one.maxDays, 1);
    assert.equal(one.days.length, 1);
    const category = buildCalendarView({ type: 'category', modelValue: '2024-01-03', categoryDays: 3, now: '2024-01-03' });
    assert.deepEqual(category.days.map(item => item.date), ['2024-01-03', '2024-01-04', '2024-01-05']);

    assert.equal(moveCalendarDate('2024-01-31', 'month')?.date, '2024-02-01');
    assert.equal(moveCalendarDate('2024-03-15', 'month', -1)?.date, '2024-02-29');
    assert.equal(moveCalendarDate('2023-12-31', 'month')?.date, '2024-01-01');
    assert.equal(moveCalendarDate('2024-01-01', 'week')?.date, '2024-01-08');
    assert.equal(moveCalendarDate('2024-01-01', 'category', 1, 3)?.date, '2024-01-04');
    assert.equal(moveCalendarDate('2024-01-01', 'custom-daily')?.date, '2024-01-01');
});

test('categories parse, expand into stable day/category columns, and filter matching events', () => {
    const categories = parseCalendarCategories('work, personal');
    assert.deepEqual(categories.map(category => category.categoryName), ['work', 'personal']);
    assert.deepEqual(parseCalendarCategories([{ key: 'focus', text: 'Focus' }], 'text'), [{ key: 'focus', text: 'Focus', categoryName: 'Focus' }]);
    const oneDay = buildCalendarView({ type: 'day', modelValue: '2024-01-01', now: '2024-01-01' }).days;
    assert.deepEqual(buildCalendarCategoryDays(oneDay, categories).map(item => [item.category?.categoryName, item.categoryIndex]), [
        ['work', 0], ['personal', 1]
    ]);
    assert.deepEqual(buildCalendarCategoryDays(oneDay, []).map(item => [item.category, item.categoryIndex]), [[null, 0]]);

    const events = parseCalendarEvents([
        { start: '2024-01-01', category: 'work', title: 'A' },
        { start: '2024-01-01', category: 'personal', title: 'B' },
        { start: '2024-01-01', title: 'C' }
    ]).events;
    assert.deepEqual(getCalendarEventsForCategory(events, categories[0]).map(event => event.name), ['A']);
    assert.deepEqual(getCalendarEventsForCategory(events, null).map(event => event.name), ['C']);
    assert.deepEqual(filterCalendarCategories(categories, events).map(category => category.categoryName), ['work', 'personal']);
    assert.deepEqual(filterCalendarCategories(categories, [], true).map(category => category.categoryName), ['work', 'personal']);
    assert.deepEqual(resolveCalendarCategories('work, unused', events).map(category => category.categoryName), ['work', 'personal']);
    assert.deepEqual(resolveCalendarCategories('work, unused', events, { categoryHideDynamic: true }).map(category => category.categoryName), ['work']);
    assert.deepEqual(resolveCalendarCategories('work, unused', events, { categoryHideDynamic: true, categoryShowAll: true }).map(category => category.categoryName), ['work', 'unused']);
    const invalidCategoryEvent = parseCalendarEvents([{ start: '2024-01-01', category: 123 }]).events;
    const invalidCategories = resolveCalendarCategories([], invalidCategoryEvent, { categoryForInvalid: 'other' });
    assert.deepEqual(invalidCategories.map(category => category.categoryName), ['other']);
    assert.deepEqual(getCalendarEventsForCategory(invalidCategoryEvent, invalidCategories[0], 'other'), invalidCategoryEvent);
});

test('calendar intervals honor firstTime, firstInterval fallback, count clamping, and local day values', () => {
    const intervals = createCalendarIntervals({ firstTime: '23:30', firstInterval: 2, intervalMinutes: 30, intervalCount: 4, intervalHeight: 20, intervalWidth: 50 });
    assert.equal(intervals.firstMinute, 1410);
    assert.equal(intervals.intervalCount, 1);
    assert.equal(intervals.bodyHeight, 20);
    assert.deepEqual(intervals.intervalRange, [1410, 1440]);
    assert.equal(intervals.minutesToPixels(45), 30);
    assert.equal(intervals.timeToY('23:30'), 0);
    assert.equal(intervals.timeToY('23:45'), 10);
    assert.equal(intervals.timeToY('22:00'), 0);

    const fallback = createCalendarIntervals({ firstInterval: 9, intervalMinutes: 30, intervalCount: 4, intervalHeight: 12 });
    assert.equal(fallback.firstMinute, 270);
    assert.equal(fallback.bodyHeight, 48);
    assert.equal(fallback.timeToY('05:30'), 24);
    const sourceDay = timestamp('2024-01-01 17:25');
    assert.deepEqual(fallback.intervalsForDay(sourceDay).slice(0, 2).map(item => item.time), ['04:30', '05:00']);
    assert.equal(sourceDay.time, '17:25');
    assert.equal(parseCalendarTime({ hour: 10, minute: 30 }), 630);
    assert.equal(parseCalendarTime('10:30:45'), 630);
    assert.equal(parseCalendarTime('bad'), false);
    assert.equal(createCalendarIntervals({ intervalCount: '0' }).intervalCount, 0);
});

test('event selectors support local title/color/allDay fields and reject invalid dates', () => {
    const result = parseCalendarEvents([
        { begins: '2024-02-29 09:15', finishes: '2024-02-29 10:00', label: 'Review', color: 'purple', group: 'work', isTimed: true },
        { start: '2024-02-30', title: 'Invalid' },
        { start: '2024-02-29', end: '2024-03-01', title: 'Holiday', allDay: true, color: 'red' }
    ], {
        eventStart: event => (event.begins ?? event.start) as string,
        eventEnd: 'finishes',
        eventTimed: 'isTimed',
        eventName: 'label',
        eventCategory: event => event.group
    });
    assert.equal(result.events.length, 2);
    assert.equal(result.invalid.length, 1);
    assert.equal(result.events[0].name, 'Review');
    assert.equal(result.events[0].color, 'purple');
    assert.equal(result.events[0].category, 'work');
    assert.equal(result.events[0].allDay, false);
    assert.equal(result.events[1].name, 'Holiday');
    assert.equal(result.events[1].color, 'red');
    assert.equal(result.events[1].allDay, true);
    assert.equal(result.events[1].end.date, '2024-03-01');

    const timedless = new Date(2024, 1, 29, 11, 45);
    const fromDate = parseCalendarEvents([{ start: timedless, end: timedless, timed: true }]).events[0];
    const fromNumber = parseCalendarEvents([{ start: timedless.getTime(), end: timedless.getTime(), timed: true }]).events[0];
    assert.equal(fromDate.start.time, '11:45');
    assert.equal(fromNumber.start.time, '11:45');
    assert.equal(fromDate.allDay, false);
    assert.equal(fromNumber.allDay, false);

    const allDayDate = parseCalendarEvents([{ start: timedless, end: timedless, timed: false }]).events[0];
    assert.equal(allDayDate.allDay, true);
    assert.equal(allDayDate.start.hour, 23);
    assert.equal(allDayDate.end.minute, 59);

    const functionSelectors = parseCalendarEvents([{ begins: '2024-03-01 08:30', finishes: '2024-03-01 09:00', isTimed: true, label: 'Standup', group: 'team' }], {
        eventStart: event => event.begins as string,
        eventEnd: event => event.finishes as string,
        eventTimed: event => event.isTimed === true,
        eventName: event => event.label,
        eventCategory: event => event.group
    }).events[0];
    assert.deepEqual([functionSelectors.name, functionSelectors.category, functionSelectors.start.time, functionSelectors.end.time], [
        'Standup', 'team', '08:30', '09:00'
    ]);
});

test('all-day spans include both endpoint dates while timed multi-day ends are exclusive', () => {
    const days = buildCalendarView({ type: 'custom-daily', start: '2024-02-28', end: '2024-03-01', maxDays: 4, now: '2024-02-28' }).days;
    const parsed = parseCalendarEvents([
        { start: '2024-02-28 23:00', end: '2024-02-29 01:00', timed: true, title: 'Overnight' },
        { start: '2024-02-28', end: '2024-03-01', title: 'All day' }
    ]).events;
    const overnight = parsed[0];
    assert.equal(calendarTimedEventOnDate(overnight, days[0]), true);
    assert.equal(calendarTimedEventOnDate(overnight, days[1]), true);
    assert.equal(calendarTimedEventOnDate(overnight, days[2]), false);
    const slices = buildTimedEventSlices([overnight], days, { intervalHeight: 10 });
    assert.deepEqual(slices.map(slice => [slice.day.date, slice.startMinute, slice.endMinute, slice.top, slice.height]), [
        ['2024-02-28', 1380, 1440, 230, 20],
        ['2024-02-29', 0, 60, 0, 20]
    ]);
    const weekly = buildCalendarView({
        type: 'custom-weekly', start: '2024-02-25', end: '2024-03-02', now: '2024-02-28', firstDayOfWeek: 0
    });
    const spans = buildAllDayEventSpans([parsed[1]], weekly.weeks);
    assert.ok(spans.length > 0);
    assert.equal(spans[0].spanDays, 3);
});

test('overlap modes produce stable column geometry without mutating source slices', () => {
    const parsed = parseCalendarEvents([
        { start: '2024-01-01 09:00', end: '2024-01-01 11:00', timed: true, category: 'a' },
        { start: '2024-01-01 09:30', end: '2024-01-01 10:30', timed: true, category: 'b' },
        { start: '2024-01-01 11:00', end: '2024-01-01 12:00', timed: true, category: 'a' }
    ]).events;
    const date = day('2024-01-01');
    const raw = parsed.map((event, index) => ({
        event, day: date,
        startMinute: event.start.hour * 60 + event.start.minute,
        endMinute: event.end.hour * 60 + event.end.minute,
        top: 0, height: 20, left: 0, width: 100, column: 0, columnCount: 1,
        starts: true, ends: true
    }));
    const original = raw.map(slice => ({ ...slice }));
    const columns = layoutCalendarTimedEvents(raw, 'column');
    assert.deepEqual(columns.slice(0, 2).map(slice => [slice.left, slice.width, slice.columnCount]), [[0, 50, 2], [50, 50, 2]]);
    assert.ok(columns.every(slice => Number.isFinite(slice.left) && Number.isFinite(slice.width) && slice.left + slice.width <= 100));
    const stacked = layoutCalendarTimedEvents(raw, 'stack');
    assert.ok(stacked.every(slice => Number.isFinite(slice.left) && Number.isFinite(slice.width) && slice.width > 0));
    assert.deepEqual(layoutCalendarTimedEvents(raw, 'stack'), stacked);
    assert.deepEqual(raw, original);

    const categorySlices = buildTimedEventSlices(parsed.slice(0, 2), [date], {}, { categoryMode: true });
    assert.deepEqual(categorySlices.map(slice => [slice.left, slice.width]), [[0, 100], [0, 100]]);
});
