import assert from 'node:assert/strict';
import test from 'node:test';
import { getCalendarFirstDayOfWeek, getCalendarWeekNumber } from '../src/ui/calendar';

test('week numbering follows locale-specific week start and minimum week size', () => {
    // Fixed outputs independently checked against the pinned Vuetify 4.2.4 weekInfo/getWeek runtime.
    const cases: Array<[string, string, number]> = [
        ['2022-12-31', 'en-US', 53],
        ['2023-01-01', 'en-US', 1],
        ['2023-01-01', 'en-GB', 52],
        ['2021-01-01', 'en-GB', 53],
        ['2021-01-04', 'en-GB', 1],
        ['2022-12-26', 'zh-CN', 1],
        ['2023-01-01', 'zh-CN', 1],
        ['2022-12-31', 'zh-HK', 53],
        ['2023-01-01', 'zh-HK', 1]
    ];

    for (const [date, locale, expected] of cases) {
        assert.equal(getCalendarWeekNumber(date, locale), expected, `${locale} ${date}`);
    }
});

test('explicit week start and first-day threshold override locale defaults', () => {
    assert.equal(getCalendarWeekNumber('2022-12-26', 'en-US'), 53);
    assert.equal(getCalendarWeekNumber('2022-12-26', 'en-US', 1), 1);

    // Monday plus Thursday threshold is ISO week numbering, including week 53.
    assert.equal(getCalendarWeekNumber('2020-12-31', 'en-US', 1, 4), 53);
    assert.equal(getCalendarWeekNumber('2021-01-01', 'en-US', 1, '4'), 53);
    assert.equal(getCalendarWeekNumber('2021-01-03', 'en-US', 1, 4), 53);
    assert.equal(getCalendarWeekNumber('2021-01-04', 'en-US', 1, 4), 1);

    // Zero is a valid weekday threshold; a numeric string has the same meaning.
    assert.equal(getCalendarWeekNumber('2023-01-01', 'en-GB'), 52);
    assert.equal(getCalendarWeekNumber('2023-01-01', 'en-GB', 1, 0), 1);
    assert.equal(getCalendarWeekNumber('2023-01-01', 'en-GB', 1, '0'), 1);
});

test('locale fallback retains week-start mapping and region minimum-day rules without Intl week info', () => {
    const localeDescriptor = Object.getOwnPropertyDescriptor(Intl, 'Locale');
    assert.ok(localeDescriptor);

    try {
        Object.defineProperty(Intl, 'Locale', { ...localeDescriptor, value: class {} });
        assert.equal(getCalendarFirstDayOfWeek('en-GB'), 1);
        assert.equal(getCalendarFirstDayOfWeek('zh-HK'), 1);
        assert.equal(getCalendarFirstDayOfWeek('ar-AE'), 6);
        assert.equal(getCalendarFirstDayOfWeek('dv-MV'), 5);
        assert.equal(getCalendarFirstDayOfWeek('fr-XX'), 1);
        assert.equal(getCalendarWeekNumber('2021-01-01', 'en-GB'), 53);
        assert.equal(getCalendarWeekNumber('2023-01-01', 'en-US'), 1);
    } finally {
        Object.defineProperty(Intl, 'Locale', localeDescriptor);
    }
});

test('UTC week arithmetic keeps local Date fields correct across a daylight-saving transition', () => {
    const previousTimezone = process.env.TZ;
    try {
        process.env.TZ = 'America/New_York';
        const dayBefore = new Date(2024, 2, 9, 12);
        const transitionDay = new Date(2024, 2, 10, 12);
        assert.equal(dayBefore.getTimezoneOffset(), 300);
        assert.equal(transitionDay.getTimezoneOffset(), 240);
        assert.equal(getCalendarWeekNumber(transitionDay, 'en-US'), 11);
        assert.equal(getCalendarWeekNumber(transitionDay, 'en-US'), getCalendarWeekNumber('2024-03-10', 'en-US'));
        assert.equal(getCalendarWeekNumber(new Date(2024, 2, 17, 12), 'en-US'), 12);
    } finally {
        if (previousTimezone === undefined) delete process.env.TZ;
        else process.env.TZ = previousTimezone;
    }
});
