export type CalendarDateInput = string | number | Date;
export type CalendarViewType = 'month' | 'week' | 'day' | '4day' | 'custom-weekly' | 'custom-daily' | 'category';
export type CalendarOverlapMode = 'stack' | 'column';
export type CalendarSelector<T = unknown> = string | ((input: Record<string, unknown>) => T);

export interface CalendarTimestamp {
    date: string;
    time: string;
    year: number;
    month: number;
    day: number;
    weekday: number;
    hour: number;
    minute: number;
    second: number;
    hasDay: boolean;
    hasTime: boolean;
    past: boolean;
    present: boolean;
    future: boolean;
}

export interface CalendarDay extends CalendarTimestamp {
    index: number;
    outside: boolean;
    weekIndex?: number;
    firstWeekday?: number;
    category?: CalendarCategory;
}

export interface CalendarCategory extends Record<string, unknown> {
    categoryName: string;
}

export interface CalendarViewOptions {
    type?: CalendarViewType;
    start?: CalendarDateInput;
    end?: CalendarDateInput;
    modelValue?: CalendarDateInput;
    now?: CalendarDateInput;
    locale?: string;
    weekdays?: readonly (number | string)[] | string;
    firstDayOfWeek?: number | string;
    minWeeks?: number | string;
    maxDays?: number | string;
    categoryDays?: number | string;
    categories?: string | readonly (string | Record<string, unknown>)[];
    categoryText?: string | ((category: Record<string, unknown>) => unknown);
}

export interface CalendarView {
    type: CalendarViewType;
    anchor: CalendarTimestamp;
    start: CalendarTimestamp;
    end: CalendarTimestamp;
    rangeStart: CalendarTimestamp;
    rangeEnd: CalendarTimestamp;
    weekdays: number[];
    firstDayOfWeek: number;
    maxDays: number;
    days: CalendarDay[];
    weeks: CalendarDay[][];
    categories: CalendarCategory[];
}

const DAYS_IN_WEEK = 7;
const WEEKDAY_MONTH_OFFSETS: readonly number[] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
const DAYS_IN_MONTH: readonly number[] = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAYS_IN_MONTH_LEAP: readonly number[] = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SUNDAY_START_REGIONS = new Set('AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PY SA SG SV TT UM US VE VI WS YE ZA ZW'.split(' '));
const SATURDAY_START_REGIONS = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));
const FOUR_DAY_FIRST_WEEK_REGIONS = new Set('AD AN AT AX BE BG CH CZ DE DK EE ES FI FJ FO FR GB GF GP GR HU IE IS IT LI LT LU MC MQ NL NO PL PT RE RU SE SK SM VA'.split(' '));

function padNumber(value: number, length: number): string {
    return String(value).padStart(length, '0');
}

function dayIdentifier(value: Pick<CalendarTimestamp, 'year' | 'month' | 'day'>): number {
    return value.year * 10000 + value.month * 100 + value.day;
}

function timeIdentifier(value: Pick<CalendarTimestamp, 'hour' | 'minute'>): number {
    return value.hour * 100 + value.minute;
}

function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInCalendarMonth(year: number, month: number): number {
    if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
    return (isLeapYear(year) ? DAYS_IN_MONTH_LEAP : DAYS_IN_MONTH)[month];
}

function weekdayForDate(year: number, month: number, day: number): number {
    const adjustedYear = month < 3 ? year - 1 : year;
    const weekday = adjustedYear
        + Math.floor(adjustedYear / 4)
        - Math.floor(adjustedYear / 100)
        + Math.floor(adjustedYear / 400)
        + WEEKDAY_MONTH_OFFSETS[month - 1]
        + day;
    return ((weekday % 7) + 7) % 7;
}

function formatTimestamp(value: CalendarTimestamp): CalendarTimestamp {
    value.date = `${padNumber(value.year, 4)}-${padNumber(value.month, 2)}${value.hasDay ? `-${padNumber(value.day, 2)}` : ''}`;
    value.time = value.hasTime ? `${padNumber(value.hour, 2)}:${padNumber(value.minute, 2)}` : '';
    return value;
}

function timestampFromParts(parts: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
    hasDay?: boolean;
    hasTime?: boolean;
}): CalendarTimestamp {
    return formatTimestamp({
        date: '',
        time: '',
        year: parts.year,
        month: parts.month,
        day: parts.day,
        weekday: parts.hasDay === false ? 0 : weekdayForDate(parts.year, parts.month, parts.day),
        hour: parts.hour ?? 0,
        minute: parts.minute ?? 0,
        second: parts.second ?? 0,
        hasDay: parts.hasDay ?? true,
        hasTime: parts.hasTime ?? false,
        past: false,
        present: false,
        future: false
    });
}

function validDateParts(year: number, month: number, day: number): boolean {
    return Number.isInteger(year) && year >= 0 && year <= 9999 && Number.isInteger(month) && month >= 1 && month <= 12 && Number.isInteger(day) && day >= 1 && day <= daysInCalendarMonth(year, month);
}

function parseStringTimestamp(value: string): CalendarTimestamp | null {
    const match = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?(?:[^\d]+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/.exec(value.trim());
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const hasDay = match[3] !== undefined;
    const day = hasDay ? Number(match[3]) : 1;
    const hour = match[4] === undefined ? 0 : Number(match[4]);
    const minute = match[5] === undefined ? 0 : Number(match[5]);
    const second = match[6] === undefined ? 0 : Number(match[6]);
    const hasTime = match[4] !== undefined && match[5] !== undefined;
    if (!validDateParts(year, month, day)) return null;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;
    return timestampFromParts({ year, month, day, hour, minute, second, hasDay, hasTime });
}

function updateRelative(timestamp: CalendarTimestamp, now: CalendarTimestamp, compareTime = false): CalendarTimestamp {
    const dateA = dayIdentifier(now);
    const dateB = dayIdentifier(timestamp);
    let a = dateA;
    let b = dateB;
    let present = a === b;
    if (timestamp.hasTime && compareTime && present) {
        a = timeIdentifier(now);
        b = timeIdentifier(timestamp);
        present = a === b;
    }
    timestamp.past = b < a;
    timestamp.present = present;
    timestamp.future = b > a;
    return timestamp;
}

/** Parse a local calendar timestamp. Invalid dates and out-of-range times are rejected without rollover. */
export function parseCalendarTimestamp(value: CalendarDateInput | CalendarTimestamp | null | undefined, now?: CalendarDateInput | CalendarTimestamp): CalendarTimestamp | null {
    if (value == null) return null;
    let timestamp: CalendarTimestamp | null = null;
    if (isCalendarTimestamp(value)) {
        timestamp = cloneCalendarTimestamp(value);
    } else if (value instanceof Date) {
        if (!Number.isFinite(value.getTime())) return null;
        timestamp = timestampFromParts({
            year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate(),
            hour: value.getHours(), minute: value.getMinutes(), second: value.getSeconds(), hasDay: true, hasTime: true
        });
    } else if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
        const date = new Date(value);
        if (!Number.isFinite(date.getTime())) return null;
        timestamp = timestampFromParts({
            year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
            hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds(), hasDay: true, hasTime: true
        });
    } else {
        timestamp = parseStringTimestamp(value);
    }
    if (!timestamp) return null;

    if (now !== undefined) {
        const relativeTo = isCalendarTimestamp(now) ? cloneCalendarTimestamp(now) : parseCalendarTimestamp(now);
        if (relativeTo) updateRelative(timestamp, relativeTo, true);
    }
    return timestamp;
}

function isCalendarTimestamp(value: CalendarDateInput | CalendarTimestamp): value is CalendarTimestamp {
    return typeof value === 'object' && value !== null && 'year' in value && 'month' in value && 'weekday' in value;
}

export function cloneCalendarTimestamp(value: CalendarTimestamp): CalendarTimestamp {
    return { ...value };
}

export function addCalendarDays(value: CalendarTimestamp, amount: number): CalendarTimestamp {
    const result = cloneCalendarTimestamp(value);
    let remaining = Math.trunc(amount);
    const direction = remaining < 0 ? -1 : 1;
    remaining = Math.abs(remaining);
    while (remaining-- > 0) {
        result.day += direction;
        if (direction > 0 && result.day > daysInCalendarMonth(result.year, result.month)) {
            result.day = 1;
            result.month += 1;
            if (result.month > 12) { result.month = 1; result.year += 1; }
        } else if (direction < 0 && result.day < 1) {
            result.month -= 1;
            if (result.month < 1) { result.month = 12; result.year -= 1; }
            result.day = daysInCalendarMonth(result.year, result.month);
        }
        result.weekday = (result.weekday + direction + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    }
    return formatTimestamp(result);
}

export function addCalendarMinutes(value: CalendarTimestamp, amount: number): CalendarTimestamp {
    const result = cloneCalendarTimestamp(value);
    const absolute = result.hour * 60 + result.minute + Math.trunc(amount);
    const dayShift = Math.floor(absolute / 1440);
    const minuteOfDay = ((absolute % 1440) + 1440) % 1440;
    if (dayShift) {
        const next = addCalendarDays(result, dayShift);
        Object.assign(result, next);
    }
    result.hour = Math.floor(minuteOfDay / 60);
    result.minute = minuteOfDay % 60;
    result.hasTime = true;
    return formatTimestamp(result);
}

export function compareCalendarTimestamps(left: CalendarTimestamp, right: CalendarTimestamp, includeTime = true): number {
    const dayDifference = dayIdentifier(left) - dayIdentifier(right);
    if (dayDifference) return dayDifference < 0 ? -1 : 1;
    if (!includeTime) return 0;
    const timeDifference = timeIdentifier(left) - timeIdentifier(right);
    return timeDifference === 0 ? 0 : timeDifference < 0 ? -1 : 1;
}

interface CalendarWeekInfo {
    firstDay: number;
    firstWeekSize: number;
}

function getCalendarFallbackWeekInfo(locale: string): CalendarWeekInfo {
    const region = /-([A-Za-z]{2}|\d{3})(?:-|$)/.exec(locale)?.[1]?.toUpperCase() ?? (locale.toLowerCase().startsWith('en') ? 'US' : '');
    const firstDay = SUNDAY_START_REGIONS.has(region) ? 0 : SATURDAY_START_REGIONS.has(region) ? 6 : region === 'MV' ? 5 : 1;
    const firstWeekSize = locale === 'GB-alt-variant' || FOUR_DAY_FIRST_WEEK_REGIONS.has(region) ? 4 : 1;
    return { firstDay, firstWeekSize };
}

function getCalendarWeekInfo(locale: string): CalendarWeekInfo {
    const fallback = getCalendarFallbackWeekInfo(locale);
    try {
        const LocaleConstructor = Intl.Locale as unknown as new (tag: string) => {
            getWeekInfo?: () => { firstDay: number; minimalDays?: number; firstWeekSize?: number };
            weekInfo?: { firstDay: number; minimalDays?: number; firstWeekSize?: number };
        };
        const localeInfo = new LocaleConstructor(locale);
        const info = localeInfo.getWeekInfo?.() ?? localeInfo.weekInfo;
        if (info && Number.isInteger(info.firstDay)) {
            const minimumDays = info.minimalDays ?? info.firstWeekSize;
            return {
                firstDay: info.firstDay % 7,
                firstWeekSize: Number.isInteger(minimumDays) && minimumDays! >= 1 && minimumDays! <= 7 ? minimumDays! : fallback.firstWeekSize
            };
        }
    } catch { /* fall through to the archived adapter's locale map */ }
    return fallback;
}

export function getCalendarFirstDayOfWeek(locale = 'en-US'): number {
    return getCalendarWeekInfo(locale).firstDay;
}

function normalizeWeekOption(value: number | string | undefined): number | undefined {
    if (value === undefined) return undefined;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : undefined;
}

function utcCalendarDate(year: number, month: number, day: number): Date {
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month - 1, day);
    return date;
}

function addUtcCalendarDays(date: Date, amount: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + amount);
    return result;
}

function startOfUtcCalendarWeek(date: Date, firstDayOfWeek: number): Date {
    const result = new Date(date.getTime());
    const offset = (result.getUTCDay() - firstDayOfWeek + 7) % 7;
    result.setUTCDate(result.getUTCDate() - offset);
    return result;
}

function weeksBetweenUtcCalendarDates(left: Date, right: Date): number {
    return Math.floor((left.getTime() - right.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

/** Return the locale-aware calendar week number; firstDayOfYear is a weekday threshold (0-6), not a day of month. */
export function getCalendarWeekNumber(
    input: CalendarDateInput,
    locale = 'en-US',
    firstDayOfWeek?: number | string,
    firstDayOfYear?: number | string
): number {
    const timestamp = parseCalendarTimestamp(input);
    if (!timestamp) throw new RangeError('Invalid calendar date for week-number calculation.');

    const localeInfo = getCalendarWeekInfo(locale);
    const weekStart = normalizeWeekOption(firstDayOfWeek) ?? localeInfo.firstDay;
    const date = utcCalendarDate(timestamp.year, timestamp.month, timestamp.day);
    const currentWeekStart = startOfUtcCalendarWeek(date, weekStart);
    const currentWeekEnd = addUtcCalendarDays(currentWeekStart, 6);
    const explicitThreshold = normalizeWeekOption(firstDayOfYear);

    if (explicitThreshold !== undefined) {
        const firstDayOfYearOffset = (7 + explicitThreshold - weekStart) % 7;
        const yearStartWeekdayOffset = (year: number) => (7 + utcCalendarDate(year, 1, 1).getUTCDay() - weekStart) % 7;
        let year = currentWeekStart.getUTCFullYear();
        if (year < currentWeekEnd.getUTCFullYear() && yearStartWeekdayOffset(year + 1) <= firstDayOfYearOffset) year += 1;
        const yearStart = utcCalendarDate(year, 1, 1);
        const offset = yearStartWeekdayOffset(year);
        const firstWeekStart = offset <= firstDayOfYearOffset
            ? addUtcCalendarDays(yearStart, -offset)
            : addUtcCalendarDays(yearStart, 7 - offset);
        return 1 + weeksBetweenUtcCalendarDates(currentWeekStart, firstWeekStart);
    }

    const firstWeekSize = (year: number) => {
        const yearStart = utcCalendarDate(year, 1, 1);
        return 7 - Math.floor((yearStart.getTime() - startOfUtcCalendarWeek(yearStart, weekStart).getTime()) / (24 * 60 * 60 * 1000));
    };
    let year = currentWeekStart.getUTCFullYear();
    if (year < currentWeekEnd.getUTCFullYear() && firstWeekSize(year + 1) >= localeInfo.firstWeekSize) year += 1;
    const yearStart = utcCalendarDate(year, 1, 1);
    const size = firstWeekSize(year);
    const firstWeekStart = size >= localeInfo.firstWeekSize
        ? addUtcCalendarDays(yearStart, size - 7)
        : addUtcCalendarDays(yearStart, size);
    return 1 + weeksBetweenUtcCalendarDates(currentWeekStart, firstWeekStart);
}

export function normalizeCalendarWeekdays(input: readonly (number | string)[] | string | undefined, firstDayOfWeek = 0): number[] {
    const raw: (number | string)[] = input === undefined
        ? [0, 1, 2, 3, 4, 5, 6]
        : typeof input === 'string' ? input.split(',') : [...input];
    const values = raw.map(value => typeof value === 'number' ? value : Number.parseInt(value.trim(), 10));
    if (!values.length || values.length > 7 || values.some(value => !Number.isInteger(value) || value < 0 || value > 6) || new Set(values).size !== values.length) return [];
    const sorted = [...values].sort((left, right) => left - right);
    return sorted.filter(value => value >= firstDayOfWeek).concat(sorted.filter(value => value < firstDayOfWeek));
}

export function getCalendarWeekdaySkips(weekdays: readonly number[]): number[] {
    const selected = new Set(weekdays);
    return Array.from({ length: 7 }, (_, weekday) => {
        if (!selected.has(weekday)) return 0;
        for (let step = 1; step <= 7; step += 1) if (selected.has((weekday + step) % 7)) return step;
        return 7;
    });
}

function moveToWeekday(value: CalendarTimestamp, weekday: number, direction: -1 | 1): CalendarTimestamp {
    const result = cloneCalendarTimestamp(value);
    let remaining = 0;
    while (result.weekday !== weekday && remaining++ < 7) {
        Object.assign(result, addCalendarDays(result, direction));
    }
    return result;
}

function startOfMonth(value: CalendarTimestamp): CalendarTimestamp {
    return timestampFromParts({ year: value.year, month: value.month, day: 1, hour: value.hour, minute: value.minute, second: value.second, hasDay: true, hasTime: value.hasTime });
}

function endOfMonth(value: CalendarTimestamp): CalendarTimestamp {
    return timestampFromParts({ year: value.year, month: value.month, day: daysInCalendarMonth(value.year, value.month), hour: value.hour, minute: value.minute, second: value.second, hasDay: true, hasTime: value.hasTime });
}

function createCalendarDays(start: CalendarTimestamp, end: CalendarTimestamp, weekdays: readonly number[], now: CalendarTimestamp, maxDays: number, minimumDays = 0, outsideRange?: { start: CalendarTimestamp; end: CalendarTimestamp }): CalendarDay[] {
    if (compareCalendarTimestamps(end, start, false) < 0) return [];
    const skips = getCalendarWeekdaySkips(weekdays);
    const stopId = dayIdentifier(end);
    let current = cloneCalendarTimestamp(start);
    let stopped = false;
    const days: CalendarDay[] = [];
    while ((!stopped || days.length < minimumDays) && days.length < maxDays) {
        const id = dayIdentifier(current);
        stopped ||= id === stopId;
        if (skips[current.weekday] === 0) {
            current = addCalendarDays(current, 1);
            continue;
        }
        const day = cloneCalendarTimestamp(current) as CalendarDay;
        day.index = days.length;
        day.outside = outsideRange ? id < dayIdentifier(outsideRange.start) || id > dayIdentifier(outsideRange.end) : false;
        updateRelative(day, now, false);
        days.push(day);
        current = addCalendarDays(current, skips[current.weekday]);
    }
    return days;
}

function splitWeeks(days: CalendarDay[], weekdaysPerWeek: number): CalendarDay[][] {
    if (weekdaysPerWeek <= 0) return [];
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += weekdaysPerWeek) {
        const week = days.slice(i, i + weekdaysPerWeek);
        const weekIndex = weeks.length;
        week.forEach((day, index) => {
            day.weekIndex = weekIndex;
            day.firstWeekday = week[0]?.weekday ?? day.weekday;
            day.index = index;
        });
        weeks.push(week);
    }
    return weeks;
}

function normalizeCount(value: number | string | undefined, fallback: number, min = 1): number {
    const parsed = Number.parseInt(String(value ?? fallback), 10);
    return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

function normalizeMaxDays(value: number | string | undefined, fallback: number): number {
    const parsed = Number.parseInt(String(value ?? fallback), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function parseCalendarCategories(categories: CalendarViewOptions['categories'], categoryText?: CalendarViewOptions['categoryText']): CalendarCategory[] {
    const values: readonly (string | Record<string, unknown>)[] = typeof categories === 'string'
        ? categories.split(/\s*,\s*/).filter(Boolean)
        : Array.isArray(categories) ? categories : [];
    return values.map(category => {
        if (typeof category === 'string') return { categoryName: category };
        const getText = typeof categoryText === 'function'
            ? categoryText(category)
            : typeof categoryText === 'string' ? category[categoryText] : undefined;
        const categoryName = typeof category.categoryName === 'string' ? category.categoryName : typeof getText === 'string' ? getText : '';
        return { ...category, categoryName };
    });
}

export function buildCalendarView(options: CalendarViewOptions = {}): CalendarView {
    const type = options.type ?? 'month';
    const now = parseCalendarTimestamp(options.now ?? new Date())!;
    const firstDayOfWeek = options.firstDayOfWeek === undefined
        ? getCalendarFirstDayOfWeek(options.locale ?? 'en-US')
        : Math.max(0, Math.min(6, Number.parseInt(String(options.firstDayOfWeek), 10) || 0));
    const weekdays = normalizeCalendarWeekdays(options.weekdays, firstDayOfWeek);
    const defaultStart = timestampFromParts({ year: now.year, month: now.month, day: now.day, hasDay: true, hasTime: false });
    const startProp = options.start === undefined ? defaultStart : parseCalendarTimestamp(options.start) ?? defaultStart;
    const model = parseCalendarTimestamp(options.modelValue) ?? startProp;
    const defaultEnd = options.end == null ? startProp : parseCalendarTimestamp(options.end) ?? startProp;
    const parsedEnd = compareCalendarTimestamps(defaultEnd, startProp, false) < 0 ? cloneCalendarTimestamp(startProp) : defaultEnd;
    const categoryDays = normalizeCount(options.categoryDays, 1);

    let start: CalendarTimestamp;
    let end: CalendarTimestamp;
    let effectiveWeekdays = weekdays;
    let maxDays = normalizeMaxDays(options.maxDays, 7);
    let weeklyLayout = false;
    let monthRange: { start: CalendarTimestamp; end: CalendarTimestamp } | undefined;

    switch (type) {
        case 'month': {
            start = startOfMonth(model);
            end = endOfMonth(model);
            monthRange = { start: cloneCalendarTimestamp(start), end: cloneCalendarTimestamp(end) };
            weeklyLayout = true;
            maxDays = 42;
            break;
        }
        case 'week': {
            const first = effectiveWeekdays[0] ?? firstDayOfWeek;
            const last = effectiveWeekdays[effectiveWeekdays.length - 1] ?? first;
            start = moveToWeekday(model, first, -1);
            end = moveToWeekday(model, last, 1);
            weeklyLayout = true;
            maxDays = 7;
            break;
        }
        case 'day':
            start = cloneCalendarTimestamp(model);
            end = cloneCalendarTimestamp(model);
            effectiveWeekdays = [model.weekday];
            maxDays = 1;
            break;
        case '4day':
            start = cloneCalendarTimestamp(model);
            end = addCalendarDays(start, 3);
            effectiveWeekdays = Array.from({ length: 4 }, (_, index) => (model.weekday + index) % 7);
            maxDays = 4;
            break;
        case 'custom-weekly':
            start = cloneCalendarTimestamp(startProp);
            end = cloneCalendarTimestamp(parsedEnd);
            weeklyLayout = true;
            maxDays = normalizeMaxDays(options.maxDays, Number.MAX_SAFE_INTEGER);
            break;
        case 'custom-daily':
            start = cloneCalendarTimestamp(startProp);
            end = cloneCalendarTimestamp(parsedEnd);
            break;
        case 'category':
            start = cloneCalendarTimestamp(model);
            end = addCalendarDays(start, categoryDays);
            effectiveWeekdays = Array.from({ length: categoryDays }, (_, index) => (model.weekday + index) % 7);
            maxDays = categoryDays;
            break;
        default:
            throw new Error(`Unsupported calendar type: ${String(type)}`);
    }

    let rangeStart = cloneCalendarTimestamp(start);
    let rangeEnd = cloneCalendarTimestamp(end);
    if (weeklyLayout && effectiveWeekdays.length) {
        const first = effectiveWeekdays[0];
        const last = effectiveWeekdays[effectiveWeekdays.length - 1];
        rangeStart = moveToWeekday(start, first, -1);
        rangeEnd = moveToWeekday(end, last, 1);
    }

    const minWeeks = normalizeCount(options.minWeeks, 1);
    const minimumDays = weeklyLayout ? minWeeks * Math.max(1, effectiveWeekdays.length) : 0;
    const days = effectiveWeekdays.length
        ? createCalendarDays(rangeStart, rangeEnd, effectiveWeekdays, now, maxDays, minimumDays, monthRange)
        : [];
    const weeks = weeklyLayout ? splitWeeks(days, effectiveWeekdays.length) : [];
    const categories = parseCalendarCategories(options.categories, options.categoryText);

    return {
        type,
        anchor: cloneCalendarTimestamp(model),
        start,
        end,
        rangeStart,
        rangeEnd,
        weekdays: [...effectiveWeekdays],
        firstDayOfWeek,
        maxDays,
        days,
        weeks,
        categories
    };
}

export function moveCalendarDate(value: CalendarDateInput | CalendarTimestamp, type: CalendarViewType, amount = 1, categoryDays = 1): CalendarTimestamp | null {
    const current = isCalendarTimestamp(value) ? cloneCalendarTimestamp(value) : parseCalendarTimestamp(value);
    if (!current) return null;
    const steps = Math.abs(Math.trunc(amount));
    const direction = amount < 0 ? -1 : 1;
    let moved = cloneCalendarTimestamp(current);
    for (let index = 0; index < steps; index += 1) {
        switch (type) {
            case 'month': {
                if (direction > 0) {
                    const year = moved.month === 12 ? moved.year + 1 : moved.year;
                    const month = moved.month === 12 ? 1 : moved.month + 1;
                    moved = timestampFromParts({ year, month, day: 1, hour: moved.hour, minute: moved.minute, second: moved.second, hasDay: true, hasTime: moved.hasTime });
                } else {
                    const year = moved.month === 1 ? moved.year - 1 : moved.year;
                    const month = moved.month === 1 ? 12 : moved.month - 1;
                    moved = timestampFromParts({ year, month, day: daysInCalendarMonth(year, month), hour: moved.hour, minute: moved.minute, second: moved.second, hasDay: true, hasTime: moved.hasTime });
                }
                break;
            }
            case 'week': moved = addCalendarDays(moved, direction * 7); break;
            case 'day': moved = addCalendarDays(moved, direction); break;
            case '4day': moved = addCalendarDays(moved, direction * 4); break;
            case 'category': moved = addCalendarDays(moved, direction * normalizeCount(categoryDays, 1)); break;
            case 'custom-weekly':
            case 'custom-daily':
                break;
        }
    }
    return moved;
}

export function moveCalendarView(value: CalendarDateInput | CalendarTimestamp, type: CalendarViewType, amount = 1, categoryDays = 1): { value: CalendarTimestamp | null; direction: 'next' | 'prev'; moved: boolean } {
    const result = moveCalendarDate(value, type, amount, categoryDays);
    return { value: result, direction: amount < 0 ? 'prev' : 'next', moved: type !== 'custom-weekly' && type !== 'custom-daily' && amount !== 0 };
}

export type CalendarTimeInput = number | string | { hour: number; minute: number } | CalendarTimestamp;

export function parseCalendarTime(value: CalendarTimeInput | null | undefined): number | false {
    if (typeof value === 'number') return Number.isFinite(value) ? value : false;
    if (typeof value === 'string') {
        const match = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/.exec(value.trim());
        if (!match) return false;
        return Number(match[1]) * 60 + Number(match[2] ?? 0);
    }
    if (value && typeof value === 'object' && Number.isFinite(value.hour) && Number.isFinite(value.minute)) return value.hour * 60 + value.minute;
    return false;
}

export interface CalendarIntervalOptions {
    firstTime?: CalendarTimeInput;
    firstInterval?: number | string;
    intervalMinutes?: number | string;
    intervalCount?: number | string;
    intervalHeight?: number | string;
    intervalWidth?: number | string;
    maxDays?: number | string;
}

export interface CalendarIntervals {
    firstTime: number | false;
    firstInterval: number;
    firstMinute: number;
    intervalMinutes: number;
    requestedCount: number;
    intervalCount: number;
    intervalHeight: number;
    intervalWidth: number;
    bodyHeight: number;
    maxDays: number;
    intervalRange: [number, number];
    intervalsForDay(day: CalendarTimestamp, now?: CalendarTimestamp): CalendarTimestamp[];
    minutesToPixels(minutes: number): number;
    timeToY(time: CalendarTimeInput, targetDay?: CalendarTimestamp, clamp?: boolean): number | false;
    timeDelta(time: CalendarTimeInput, targetDay?: CalendarTimestamp): number | false;
}

export function createCalendarIntervals(options: CalendarIntervalOptions = {}): CalendarIntervals {
    const parseIntegerProp = (value: number | string | undefined, fallback: number) => {
        const parsed = Number.parseInt(String(value || fallback), 10);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const parseFloatProp = (value: number | string | undefined, fallback: number) => {
        const parsed = Number.parseFloat(String(value || fallback));
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const firstInterval = parseIntegerProp(options.firstInterval, 0);
    const intervalMinutes = parseIntegerProp(options.intervalMinutes, 60);
    const requestedCount = parseIntegerProp(options.intervalCount, 24);
    const intervalHeight = parseFloatProp(options.intervalHeight, 48);
    const intervalWidth = parseFloatProp(options.intervalWidth, 60);
    const maxDays = parseIntegerProp(options.maxDays, 7);
    const firstTime = parseCalendarTime(options.firstTime);
    const firstMinute = firstTime !== false && firstTime >= 0 && firstTime <= 1440
        ? firstTime
        : firstInterval * intervalMinutes;
    const safeMinutes = intervalMinutes > 0 ? intervalMinutes : 60;
    const dayLimit = Math.ceil(Math.max(0, 1440 - firstMinute) / safeMinutes);
    const intervalCount = Math.max(0, Math.min(Math.max(0, requestedCount), dayLimit));
    const bodyHeight = intervalCount * intervalHeight;
    const intervalRange: [number, number] = [firstMinute, firstMinute + intervalCount * safeMinutes];

    function intervalsForDay(day: CalendarTimestamp, now?: CalendarTimestamp): CalendarTimestamp[] {
        return Array.from({ length: intervalCount }, (_, index) => {
            const date = timestampFromParts({
                year: day.year,
                month: day.month,
                day: day.day,
                hour: 0,
                minute: 0,
                second: 0,
                hasDay: day.hasDay,
                hasTime: true
            });
            const value = addCalendarMinutes(date, firstMinute + index * safeMinutes);
            return now ? updateRelative(value, now, true) : value;
        });
    }

    function minutesToPixels(minutes: number): number {
        return minutes / safeMinutes * intervalHeight;
    }

    function timeDelta(time: CalendarTimeInput, targetDay?: CalendarTimestamp): number | false {
        let minutes = parseCalendarTime(time);
        if (minutes === false) return false;
        if (targetDay && typeof time === 'object' && 'day' in time) {
            const timeDay = time as CalendarTimestamp;
            minutes += (dayIdentifier(timeDay) - dayIdentifier(targetDay)) * intervalCount * safeMinutes;
        }
        return (minutes - firstMinute) / (intervalCount * safeMinutes || 1);
    }

    function timeToY(time: CalendarTimeInput, targetDay?: CalendarTimestamp, shouldClamp = true): number | false {
        let y = timeDelta(time, targetDay);
        if (y === false) return false;
        y *= bodyHeight;
        if (shouldClamp) return Math.max(0, Math.min(bodyHeight, y));
        if (y < 0) y += bodyHeight;
        else if (y > bodyHeight) y -= bodyHeight;
        return y;
    }

    return {
        firstTime,
        firstInterval,
        firstMinute,
        intervalMinutes: safeMinutes,
        requestedCount,
        intervalCount,
        intervalHeight,
        intervalWidth,
        bodyHeight,
        maxDays,
        intervalRange,
        intervalsForDay,
        minutesToPixels,
        timeToY,
        timeDelta
    };
}

export interface CalendarEventInput extends Record<string, unknown> {}

export interface ParsedCalendarEvent {
    input: CalendarEventInput;
    index: number;
    start: CalendarTimestamp;
    end: CalendarTimestamp;
    startIdentifier: number;
    endIdentifier: number;
    startTimestampIdentifier: number;
    endTimestampIdentifier: number;
    allDay: boolean;
    timed: boolean;
    name: unknown;
    color: unknown;
    category: unknown;
}

export interface CalendarEventOptions {
    eventStart?: CalendarSelector<CalendarDateInput>;
    eventEnd?: CalendarSelector<CalendarDateInput>;
    eventTimed?: CalendarSelector<boolean>;
    eventName?: CalendarSelector<unknown>;
    eventCategory?: CalendarSelector<unknown>;
}

export interface CalendarEventParseResult {
    events: ParsedCalendarEvent[];
    invalid: Array<{ index: number; input: CalendarEventInput; reason: string }>;
}

function selectEventValue(input: CalendarEventInput, selector: CalendarSelector | undefined, fallbackKey: string): unknown {
    if (typeof selector === 'function') {
        const value = selector(input);
        if (value !== undefined && value !== null) return value;
    } else if (typeof selector === 'string' && selector in input) {
        const value = input[selector];
        if (value !== undefined && value !== null) return value;
    }
    return input[fallbackKey];
}

function timestampIsTimedless(value: unknown): value is Date | number {
    return value instanceof Date || typeof value === 'number' && Number.isFinite(value);
}

function forceAllDay(value: CalendarTimestamp): CalendarTimestamp {
    const result = cloneCalendarTimestamp(value);
    result.hasTime = false;
    result.hour = 23;
    result.minute = 59;
    result.second = 0;
    return formatTimestamp(result);
}

function timestampIdentifier(value: CalendarTimestamp): number {
    return dayIdentifier(value) * 10000 + timeIdentifier(value);
}

export function parseCalendarEvents(events: readonly CalendarEventInput[] = [], options: CalendarEventOptions = {}): CalendarEventParseResult {
    const parsed: ParsedCalendarEvent[] = [];
    const invalid: CalendarEventParseResult['invalid'] = [];
    events.forEach((input, index) => {
        const startInput = selectEventValue(input, options.eventStart ?? 'start', 'start');
        const endSelected = selectEventValue(input, options.eventEnd ?? 'end', 'end');
        const endInput = endSelected ?? startInput;
        const start = parseCalendarTimestamp(startInput as CalendarDateInput | undefined);
        const end = parseCalendarTimestamp(endInput as CalendarDateInput | undefined);
        if (!start || !end) {
            invalid.push({ index, input, reason: 'Event start or end is not a valid local calendar timestamp.' });
            return;
        }

        let timedSetting: unknown;
        if (typeof options.eventTimed === 'function') timedSetting = options.eventTimed(input);
        else if (typeof options.eventTimed === 'string') timedSetting = input[options.eventTimed];
        else timedSetting = input.timed;
        if (typeof timedSetting !== 'boolean' && typeof input.allDay === 'boolean') timedSetting = !input.allDay;
        const configuredTimed = timedSetting === true;
        let normalizedStart = cloneCalendarTimestamp(start);
        let normalizedEnd = cloneCalendarTimestamp(end);
        if (timestampIsTimedless(startInput) && !configuredTimed) normalizedStart = forceAllDay(normalizedStart);
        if (timestampIsTimedless(endInput) && !configuredTimed) normalizedEnd = forceAllDay(normalizedEnd);
        const allDay = !normalizedStart.hasTime || input.allDay === true;
        if (input.allDay === true) {
            normalizedStart = forceAllDay(normalizedStart);
            normalizedEnd = forceAllDay(normalizedEnd);
        }
        if (compareCalendarTimestamps(normalizedEnd, normalizedStart, !allDay) < 0) normalizedEnd = cloneCalendarTimestamp(normalizedStart);

        const name = typeof options.eventName === 'function'
            ? options.eventName(input)
            : typeof options.eventName === 'string' ? input[options.eventName] : input.name;
        const category = typeof options.eventCategory === 'function'
            ? options.eventCategory(input)
            : typeof options.eventCategory === 'string' ? input[options.eventCategory] : input.category;
        parsed.push({
            input,
            index,
            start: normalizedStart,
            end: normalizedEnd,
            startIdentifier: dayIdentifier(normalizedStart),
            endIdentifier: dayIdentifier(normalizedEnd),
            startTimestampIdentifier: timestampIdentifier(normalizedStart),
            endTimestampIdentifier: dayIdentifier(normalizedEnd) * 10000 + (allDay ? 2359 : timeIdentifier(normalizedEnd)),
            allDay,
            timed: !allDay,
            name: name ?? input.title ?? '',
            color: input.color,
            category
        });
    });
    return { events: parsed, invalid };
}

export function calendarEventOnDate(event: ParsedCalendarEvent, day: CalendarTimestamp): boolean {
    const id = dayIdentifier(day);
    if (event.allDay) return id >= event.startIdentifier && id <= event.endIdentifier;
    return id >= event.startIdentifier && id <= event.endIdentifier;
}

export function calendarTimedEventOnDate(event: ParsedCalendarEvent, day: CalendarTimestamp, intervalRange?: readonly [number, number]): boolean {
    if (event.allDay) return false;
    const startDate = dayIdentifier(event.start);
    const endDate = dayIdentifier(event.end);
    const dayId = dayIdentifier(day);
    if (dayId < startDate || dayId > endDate) return false;
    const startMinute = dayId === startDate ? event.start.hour * 60 + event.start.minute : 0;
    const endMinute = dayId === endDate ? event.end.hour * 60 + event.end.minute : 1440;
    if (startMinute >= endMinute) return false;
    if (!intervalRange) return true;
    return startMinute < intervalRange[1] && endMinute > intervalRange[0];
}

export function getCalendarEventsForDay(events: readonly ParsedCalendarEvent[], day: CalendarDay, firstWeekday = day.firstWeekday ?? day.weekday): ParsedCalendarEvent[] {
    const id = dayIdentifier(day);
    return events.filter(event => event.startIdentifier === id || day.weekday === firstWeekday && id >= event.startIdentifier && id <= event.endIdentifier);
}

export interface CalendarAllDaySpan {
    event: ParsedCalendarEvent;
    weekIndex: number;
    startIndex: number;
    endIndex: number;
    spanDays: number;
    starts: boolean;
    ends: boolean;
    row: number;
    rowCount: number;
    widthPercent: number;
}

export function buildAllDayEventSpans(events: readonly ParsedCalendarEvent[], weeks: readonly (readonly CalendarDay[])[]): CalendarAllDaySpan[] {
    const result: CalendarAllDaySpan[] = [];
    weeks.forEach((week, weekIndex) => {
        const included = events.filter(event => event.allDay && week.some(day => calendarEventOnDate(event, day)));
        const lanes: Array<Array<{ start: number; end: number; span: CalendarAllDaySpan }>> = [];
        const spans = included.map(event => {
            const indices = week.flatMap((day, index) => calendarEventOnDate(event, day) ? [index] : []);
            return {
                event,
                weekIndex,
                startIndex: indices[0],
                endIndex: indices[indices.length - 1],
                spanDays: indices.length,
                starts: event.startIdentifier >= dayIdentifier(week[0]),
                ends: event.endIdentifier <= dayIdentifier(week[week.length - 1]),
                row: 0,
                rowCount: 0,
                widthPercent: indices.length ? 95 + 100 * (indices.length - 1) : 0
            };
        }).filter(span => span.spanDays > 0).sort((left, right) => left.startIndex - right.startIndex || right.endIndex - left.endIndex || left.event.index - right.event.index);

        spans.forEach(span => {
            let row = lanes.findIndex(lane => lane.every(entry => span.endIndex < entry.start || span.startIndex > entry.end));
            if (row < 0) { row = lanes.length; lanes.push([]); }
            span.row = row;
            lanes[row].push({ start: span.startIndex, end: span.endIndex, span });
            result.push(span);
        });
        for (const span of spans) span.rowCount = lanes.length;
    });
    return result;
}

export interface CalendarTimedSlice {
    event: ParsedCalendarEvent;
    day: CalendarDay;
    startMinute: number;
    endMinute: number;
    top: number;
    height: number;
    left: number;
    width: number;
    column: number;
    columnCount: number;
    categoryMode?: boolean;
    starts: boolean;
    ends: boolean;
}

export interface CalendarEventLayoutOptions extends CalendarIntervalOptions {
    eventHeight?: number;
    overlapMode?: CalendarOverlapMode;
    overlapThreshold?: number | string;
    categoryMode?: boolean;
}

function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
    return !(aStart >= bEnd || aEnd <= bStart);
}

function assignColumnGeometry(slices: CalendarTimedSlice[]): CalendarTimedSlice[] {
    const sorted = [...slices].sort((left, right) => left.startMinute - right.startMinute || right.endMinute - left.endMinute || left.event.index - right.event.index);
    const output: CalendarTimedSlice[] = [];
    let group: CalendarTimedSlice[] = [];
    let groupEnd = -Infinity;
    const flush = () => {
        if (!group.length) return;
        const lanes: CalendarTimedSlice[][] = [];
        for (const slice of group) {
            let laneIndex = lanes.findIndex(lane => lane.every(item => !intervalsOverlap(slice.startMinute, slice.endMinute, item.startMinute, item.endMinute)));
            if (laneIndex < 0) { laneIndex = lanes.length; lanes.push([]); }
            lanes[laneIndex].push(slice);
            slice.column = laneIndex;
        }
        const count = lanes.length;
        for (const slice of group) {
            slice.columnCount = count;
            slice.left = slice.column * 100 / count;
            slice.width = 100 / count;
            output.push(slice);
        }
        group = [];
        groupEnd = -Infinity;
    };
    for (const slice of sorted) {
        if (group.length && slice.startMinute >= groupEnd) flush();
        group.push(slice);
        groupEnd = Math.max(groupEnd, slice.endMinute);
    }
    flush();
    return output.sort((left, right) => left.startMinute - right.startMinute || left.event.index - right.event.index);
}

interface StackNode {
    visual: CalendarTimedSlice;
    start: number;
    end: number;
    parent: StackNode | null;
    sibling: boolean;
    index: number;
    children: StackNode[];
}

function assignStackGeometry(slices: CalendarTimedSlice[], overlapThreshold: number): CalendarTimedSlice[] {
    const visuals = [...slices].sort((left, right) => left.startMinute - right.startMinute || right.endMinute - left.endMinute || left.event.index - right.event.index);
    const groups: Array<{ start: number; end: number; visuals: CalendarTimedSlice[] }> = [];
    for (const visual of visuals) {
        let group = groups.find(candidate => intervalsOverlap(visual.startMinute, visual.endMinute, candidate.start, candidate.end));
        if (!group) { group = { start: visual.startMinute, end: visual.endMinute, visuals: [] }; groups.push(group); }
        group.visuals.push(visual);
        group.start = Math.min(group.start, visual.startMinute);
        group.end = Math.max(group.end, visual.endMinute);
    }

    for (const group of groups) {
        const nodes: StackNode[] = [];
        for (const visual of group.visuals) {
            const child: StackNode = { visual, start: visual.startMinute, end: visual.endMinute, parent: null, sibling: true, index: 0, children: [] };
            const overlappingIndices = nodes.filter(node => intervalsOverlap(child.start, child.end, node.start, node.end)).map(node => node.index).sort((a, b) => a - b);
            let index: number | false = false;
            for (let i = 0; i < overlappingIndices.length; i += 1) {
                if (i < overlappingIndices[i]) { index = i; break; }
            }
            if (index === false) {
                const parent = nodes.filter(node => intervalsOverlap(child.start, child.end, node.start, node.end)).reduce<StackNode | null>((best, node) => !best || node.index > best.index ? node : best, null);
                if (parent) {
                    child.parent = parent;
                    child.sibling = intervalsOverlap(child.start, child.end, parent.start, Math.min(1440, parent.start + overlapThreshold));
                    child.index = parent.index + 1;
                    parent.children.push(child);
                }
            } else {
                const parent = nodes.find(node => node.index === index - 1 && intervalsOverlap(child.start, child.end, node.start, node.end)) ?? null;
                const children = nodes.filter(node => node.index >= index! + 1 && node.index <= index! + nodes.length && intervalsOverlap(child.start, child.end, node.start, node.end));
                child.children = children;
                child.index = index;
                if (parent) {
                    child.parent = parent;
                    child.sibling = intervalsOverlap(child.start, child.end, parent.start, Math.min(1440, parent.start + overlapThreshold));
                    parent.children.push(child);
                }
                const firstChildColumn = children.length ? Math.min(...children.map(node => node.index)) : -1;
                for (const grand of children.filter(node => node.index === firstChildColumn)) {
                    if (grand.parent === parent) grand.parent = child;
                    const grandNext = grand.index - child.index <= 1;
                    if (grandNext && child.sibling && intervalsOverlap(child.start, Math.min(1440, child.start + overlapThreshold), grand.start, grand.end)) grand.sibling = true;
                }
            }
            nodes.push(child);
        }

        const maxChildIndex = (node: StackNode): number => node.children.reduce((max, child) => Math.max(max, maxChildIndex(child)), node.index);
        const columnWidthMultiplier = (node: StackNode): number => node.children.length ? Math.min(...node.children.map(child => child.index)) - node.index : 1;
        const hasFullWidth = (node: StackNode): boolean => !nodes.some(other => other !== node && other.index > node.index && intervalsOverlap(node.start, Math.min(1440, node.start + overlapThreshold), other.start, other.end));
        for (const node of nodes) {
            const columns = maxChildIndex(node) + 1;
            const spaceLeft = node.parent ? node.parent.visual.left : 0;
            const spaceWidth = 100 - spaceLeft;
            const offset = Math.min(5, 100 / columns);
            const columnOffset = spaceWidth / (columns - node.index + 1);
            const columnWidth = spaceWidth / (columns - node.index + (node.sibling ? 1 : 0)) * columnWidthMultiplier(node);
            if (node.parent) node.visual.left = node.sibling ? spaceLeft + columnOffset : spaceLeft + offset;
            node.visual.width = hasFullWidth(node) ? 100 - node.visual.left : Math.min(100 - node.visual.left, columnWidth * 1.7);
            node.visual.column = node.index;
            node.visual.columnCount = columns;
        }
    }
    return visuals.sort((left, right) => left.left - right.left || left.startMinute - right.startMinute || left.event.index - right.event.index);
}

export function layoutCalendarTimedEvents(slices: readonly CalendarTimedSlice[], mode: CalendarOverlapMode = 'stack', overlapThreshold = 60): CalendarTimedSlice[] {
    const grouped = new Map<string, CalendarTimedSlice[]>();
    for (const slice of slices) {
        const category = slice.categoryMode ? String(slice.event.category ?? '') : '';
        const key = `${slice.day.date}\u0000${category}`;
        const group = grouped.get(key) ?? [];
        group.push({ ...slice });
        grouped.set(key, group);
    }
    const result: CalendarTimedSlice[] = [];
    for (const group of grouped.values()) {
        result.push(...(mode === 'column' ? assignColumnGeometry(group) : assignStackGeometry(group, overlapThreshold)));
    }
    return result.sort((left, right) => left.day.date.localeCompare(right.day.date) || left.startMinute - right.startMinute || left.event.index - right.event.index);
}

export function buildTimedEventSlices(events: readonly ParsedCalendarEvent[], days: readonly CalendarDay[], intervalOptions: CalendarIntervalOptions = {}, layoutOptions: Pick<CalendarEventLayoutOptions, 'eventHeight' | 'overlapMode' | 'overlapThreshold' | 'categoryMode'> = {}): CalendarTimedSlice[] {
    const intervals = createCalendarIntervals(intervalOptions);
    const eventHeight = Number(layoutOptions.eventHeight ?? 20) || 20;
    const raw: CalendarTimedSlice[] = [];
    for (const event of events) {
        if (event.allDay || compareCalendarTimestamps(event.end, event.start, true) <= 0) continue;
        for (const day of days) {
            if (!calendarTimedEventOnDate(event, day, intervals.intervalRange)) continue;
            const dayId = dayIdentifier(day);
            const startMinute = dayId === dayIdentifier(event.start) ? event.start.hour * 60 + event.start.minute : 0;
            const endMinute = dayId === dayIdentifier(event.end) ? event.end.hour * 60 + event.end.minute : 1440;
            const clippedStart = Math.max(startMinute, intervals.firstMinute);
            const clippedEnd = Math.min(endMinute, intervals.intervalRange[1]);
            if (clippedStart >= clippedEnd) continue;
            const top = intervals.minutesToPixels(clippedStart - intervals.firstMinute);
            const bottom = intervals.minutesToPixels(clippedEnd - intervals.firstMinute);
            raw.push({
                event,
                day,
                startMinute: clippedStart,
                endMinute: clippedEnd,
                top,
                height: Math.max(eventHeight, bottom - top),
                left: 0,
                width: 100,
                column: 0,
                columnCount: 1,
                ...(layoutOptions.categoryMode ? { categoryMode: true } : {}),
                starts: dayId === dayIdentifier(event.start),
                ends: dayId === dayIdentifier(event.end) && event.end.hour * 60 + event.end.minute > 0
            });
        }
    }
    const mode = layoutOptions.overlapMode ?? 'stack';
    const threshold = Number.parseInt(String(layoutOptions.overlapThreshold ?? 60), 10) || 60;
    return layoutCalendarTimedEvents(raw, mode, threshold);
}

export function filterCalendarCategories(categories: readonly CalendarCategory[], events: readonly ParsedCalendarEvent[], categoryShowAll = false): CalendarCategory[] {
    if (categoryShowAll) return categories.map(category => ({ ...category }));
    const names = new Set(events.map(event => event.category).filter((category): category is string => typeof category === 'string'));
    return categories.filter(category => names.has(category.categoryName)).map(category => ({ ...category }));
}

export interface CalendarCategoryOptions {
    categoryHideDynamic?: boolean;
    categoryShowAll?: boolean;
    categoryForInvalid?: string;
    categoryText?: CalendarViewOptions['categoryText'];
}

/** Resolve configured and event-derived categories using VCalendar's hide/show rules. */
export function resolveCalendarCategories(
    configured: CalendarViewOptions['categories'],
    events: readonly ParsedCalendarEvent[],
    options: CalendarCategoryOptions = {}
): CalendarCategory[] {
    let categories = parseCalendarCategories(configured, options.categoryText);
    if (!events.length) return categories;

    const hideDynamic = options.categoryHideDynamic ?? false;
    const showAll = options.categoryShowAll ?? false;
    const invalidName = options.categoryForInvalid ?? '';
    const counts = new Map<string, number>(categories.map(category => [category.categoryName, 0]));
    if (!hideDynamic || !showAll) {
        for (const event of events) {
            const categoryName = typeof event.category === 'string' ? event.category : invalidName;
            if (!categoryName) continue;
            if (counts.has(categoryName)) counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
            else if (!hideDynamic) {
                categories.push({ categoryName });
                counts.set(categoryName, 1);
            }
        }
    }
    if (!showAll) categories = categories.filter(category => (counts.get(category.categoryName) ?? 0) > 0);
    return categories.map(category => ({ ...category }));
}

export interface CalendarCategoryDay {
    day: CalendarDay;
    category: CalendarCategory | null;
    categoryIndex: number;
}

/** Expand each date into category columns, matching the category calendar's day/category order. */
export function buildCalendarCategoryDays(days: readonly CalendarDay[], categories: readonly CalendarCategory[]): CalendarCategoryDay[] {
    const result: CalendarCategoryDay[] = [];
    for (const day of days) {
        if (categories.length) {
            categories.forEach((category, categoryIndex) => result.push({ day, category, categoryIndex }));
        } else {
            result.push({ day, category: null, categoryIndex: 0 });
        }
    }
    return result;
}

export function isCalendarEventForCategory(event: ParsedCalendarEvent, category: CalendarCategory | string | null | undefined, categoryForInvalid = ''): boolean {
    if (category && typeof category === 'object') {
        if (categoryForInvalid && category.categoryName === categoryForInvalid) return typeof event.category !== 'string';
        return !!category.categoryName && category.categoryName === event.category;
    }
    if (typeof event.category === 'string') return category === event.category;
    return category == null;
}

export function getCalendarEventsForCategory(events: readonly ParsedCalendarEvent[], category: CalendarCategory | string | null | undefined, categoryForInvalid = ''): ParsedCalendarEvent[] {
    return events.filter(event => isCalendarEventForCategory(event, category, categoryForInvalid));
}
