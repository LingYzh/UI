import { getCalendarFirstDayOfWeek, getCalendarWeekNumber } from './calendar';
import { autoFixDateYear, createDateInputFormat, parseDateFormatSpec, resolveDateRangeSeparator, splitDateRangeText, type DateInputMode, type DateInputSelection, type DateDisplayFormat, type DateFormatSpec, type DateInputSeparators, type ParsedDateSelection } from './date-input-format';
import { isoDate, parseIsoDate, selectDate, type AllowedDates, type DateLike, type DateMode, type DateSelection } from './date-model';

export type DateGranularity = 'day' | 'week' | 'month' | 'year';

export interface AdvancedDateInputOptions {
    locale?: string;
    inputFormat?: string;
    displayFormat?: DateDisplayFormat;
    mode?: DateInputMode;
    granularity?: DateGranularity;
    datetime?: boolean;
    firstDayOfWeek?: number | string;
    firstDayOfYear?: number | string;
    currentYear?: number;
    isRtl?: boolean;
    rangeSeparator?: string;
}

export interface DateTimeDraftTimes {
    start: string;
    end: string;
}


const MULTIPLE_SEPARATOR = ', ';

function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
    if (month === 2) return isLeapYear(year) ? 29 : 28;
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function createLocalDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date | null {
    if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59 || !Number.isInteger(second) || second < 0 || second > 59) return null;
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(hour, minute, second, 0);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        && date.getHours() === hour && date.getMinutes() === minute && date.getSeconds() === second ? date : null;
}

function cloneDate(value: DateLike | null | undefined): Date | null {
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? new Date(value.getTime()) : null;
    if (typeof value !== 'string') return null;
    return parseIsoDate(value);
}

function configuredWeekStart(options: AdvancedDateInputOptions): number {
    const parsed = options.firstDayOfWeek === undefined ? NaN : Number(options.firstDayOfWeek);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6
        ? parsed
        : getCalendarFirstDayOfWeek(options.locale ?? 'en-US');
}

function configuredWeekThreshold(options: AdvancedDateInputOptions): number | string | undefined {
    return options.firstDayOfYear;
}

function parseTimeParts(value: string): [number, number, number] | null {
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
    if (!match) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
}

function splitDateTime(value: string): { date: string; time: [number, number, number] } | null {
    const match = /^(.+?)[ T]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
    if (!match) return null;
    return { date: match[1], time: [Number(match[2]), Number(match[3]), Number(match[4] ?? 0)] };
}

function parseWeekPattern(pattern: string): boolean {
    return /^y{4}\s*第\s*w{1,2}\s*周$/i.test(pattern.trim());
}

function startOfWeek(value: Date, options: AdvancedDateInputOptions): Date {
    const date = new Date(value.getTime());
    date.setDate(date.getDate() - (date.getDay() - configuredWeekStart(options) + 7) % 7);
    date.setHours(0, 0, 0, 0);
    return date;
}

function addLocalDays(value: Date, amount: number): Date {
    const date = new Date(value.getTime());
    date.setDate(date.getDate() + amount);
    return date;
}

function parseWeekValue(input: string, options: AdvancedDateInputOptions): Date | null {
    const match = /^(\d{4})\s*第\s*(\d{1,2})\s*周$/.exec(input.trim());
    if (!match) return null;
    const year = Number(match[1]);
    const number = Number(match[2]);
    if (number < 1 || number > 53) return null;
    const firstDay = createLocalDate(year, 1, 1);
    if (!firstDay) return null;
    const firstWeekStart = firstWeekStartForYear(year, options);
    if (!firstWeekStart) return null;
    const result = addLocalDays(firstWeekStart, (number - 1) * 7);
    return getCalendarWeekYear(result, options) === year
        && getCalendarWeekNumber(result, options.locale ?? 'en-US', options.firstDayOfWeek, options.firstDayOfYear) === number
        ? result
        : null;
}

function firstWeekStartForYear(year: number, options: AdvancedDateInputOptions): Date | null {
    const firstDay = createLocalDate(year, 1, 1);
    if (!firstDay) return null;
    for (let offset = -7; offset <= 14; offset += 1) {
        const candidate = startOfWeek(addLocalDays(firstDay, offset), options);
        if (getCalendarWeekNumber(candidate, options.locale ?? 'en-US', options.firstDayOfWeek, options.firstDayOfYear) === 1) return candidate;
    }
    return null;
}

function getCalendarWeekYear(value: Date, options: AdvancedDateInputOptions): number | null {
    const start = startOfWeek(value, options);
    const year = value.getFullYear();
    for (const candidateYear of [year - 1, year, year + 1]) {
        const firstWeek = firstWeekStartForYear(candidateYear, options);
        if (!firstWeek) continue;
        const nextFirstWeek = firstWeekStartForYear(candidateYear + 1, options);
        if (start >= firstWeek && (!nextFirstWeek || start < nextFirstWeek)) return candidateYear;
    }
    return null;
}

function parseDateWithSpec(value: string, pattern: string, options: AdvancedDateInputOptions): Date | null {
    const spec = parseDateFormatSpec(pattern);
    if (!spec) return null;
    const parts = value.split(spec.separator).map(part => part.trim());
    if (parts.length !== 3 || parts.some(part => !/^\d+$/.test(part))) return null;
    const values = parts.map(Number);
    const record: Record<string, number> = {};
    [...spec.order].forEach((sign, index) => { record[sign] = values[index]; });
    const year = autoFixDateYear(record.y, options.currentYear);
    return createLocalDate(year, record.m, record.d);
}

function parseInputPattern(value: string, pattern: string, options: AdvancedDateInputOptions): Date | null {
    const normalized = pattern.trim();
    if (parseWeekPattern(normalized)) return parseWeekValue(value, options);
    if (/^y{4}$/i.test(normalized)) {
        const match = /^(\d{4})$/.exec(value.trim());
        return match ? createLocalDate(Number(match[1]), 1, 1) : null;
    }
    const monthPattern = /^y{4}([-/.])m{1,2}$/i.exec(normalized);
    if (monthPattern) {
        const match = new RegExp(`^(\\d{4})${escapeRegExp(monthPattern[1])}(\\d{1,2})$`).exec(value.trim());
        if (!match) return null;
        const month = Number(match[2]);
        return month >= 1 && month <= 12 ? createLocalDate(Number(match[1]), month, 1) : null;
    }

    const dateTimePattern = /^(.+?)[ T]HH:mm(?::ss)?$/i.exec(normalized);
    const datePattern = dateTimePattern?.[1] ?? normalized;
    const entered = splitDateTime(value.trim());
    if (dateTimePattern && !entered) return null;
    const dateText = entered?.date ?? value.trim();
    const date = parseDateWithSpec(dateText, datePattern, options);
    if (!date) return null;
    if (!entered) return date;
    date.setHours(entered.time[0], entered.time[1], entered.time[2], 0);
    return date;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseCanonicalDate(value: string, options: AdvancedDateInputOptions): Date | null {
    const week = parseWeekValue(value, options);
    if (week) return week;
    const dateTime = splitDateTime(value);
    if (dateTime) {
        const date = parseDateWithSpec(dateTime.date, 'yyyy-mm-dd', options);
        if (!date) return null;
        date.setHours(dateTime.time[0], dateTime.time[1], dateTime.time[2], 0);
        return date;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseDateWithSpec(value, 'yyyy-mm-dd', options);
    const month = /^(\d{4})-(\d{2})$/.exec(value);
    if (month) {
        const monthNumber = Number(month[2]);
        return monthNumber >= 1 && monthNumber <= 12 ? createLocalDate(Number(month[1]), monthNumber, 1) : null;
    }
    const year = /^(\d{4})$/.exec(value);
    return year ? createLocalDate(Number(year[1]), 1, 1) : null;
}

export function parseAdvancedDate(value: DateLike | null | undefined, options: AdvancedDateInputOptions = {}): Date | null {
    const cloned = cloneDate(value);
    if (cloned || value instanceof Date || typeof value !== 'string') return cloned;
    const input = value.trim();
    if (!input) return null;
    if (options.inputFormat) {
        const parsed = parseInputPattern(input, options.inputFormat, options);
        if (parsed) return parsed;
    }
    return parseCanonicalDate(input, options);
}

export function startOfDatePeriod(value: DateLike | Date, granularity: DateGranularity = 'day', options: AdvancedDateInputOptions = {}, preserveTime = false): Date | null {
    const date = parseAdvancedDate(value, options);
    if (!date) return null;
    const result = new Date(date.getTime());
    if (granularity === 'week') {
        result.setDate(result.getDate() - (result.getDay() - configuredWeekStart(options) + 7) % 7);
    } else if (granularity === 'month') {
        result.setDate(1);
    } else if (granularity === 'year') {
        result.setMonth(0, 1);
    }
    if (!preserveTime) result.setHours(0, 0, 0, 0);
    return result;
}

export function endOfDatePeriod(value: DateLike | Date, granularity: DateGranularity = 'day', options: AdvancedDateInputOptions = {}): Date | null {
    const start = startOfDatePeriod(value, granularity, options);
    if (!start) return null;
    const end = new Date(start.getTime());
    if (granularity === 'week') end.setDate(end.getDate() + 6);
    else if (granularity === 'month') end.setMonth(end.getMonth() + 1, 0);
    else if (granularity === 'year') end.setFullYear(end.getFullYear() + 1, 0, 0);
    end.setHours(23, 59, 59, 999);
    return end;
}

export function normalizeDateToGranularity(value: Date, granularity: DateGranularity = 'day', options: AdvancedDateInputOptions = {}, preserveTime = true): Date {
    return startOfDatePeriod(value, granularity, options, preserveTime) ?? new Date(value.getTime());
}

export function isAllowedDatePeriod(value: DateLike | Date, min: DateLike | undefined, max: DateLike | undefined, granularity: DateGranularity = 'day', options: AdvancedDateInputOptions = {}): boolean {
    const start = startOfDatePeriod(value, granularity, options);
    const end = endOfDatePeriod(value, granularity, options);
    const lower = min === undefined ? null : parseAdvancedDate(min, options);
    const upper = max === undefined ? null : parseAdvancedDate(max, options);
    if (!start || !end) return false;
    const lowerDay = lower ? new Date(lower.getFullYear(), lower.getMonth(), lower.getDate()) : null;
    const upperDay = upper ? new Date(upper.getFullYear(), upper.getMonth(), upper.getDate(), 23, 59, 59, 999) : null;
    return (!lowerDay || end >= lowerDay) && (!upperDay || start <= upperDay);
}

export function selectDateForGranularity(model: DateSelection, value: DateLike | Date, mode: DateMode, granularity: DateGranularity = 'day', options: AdvancedDateInputOptions = {}, expandRange = false): DateSelection {
    const date = startOfDatePeriod(value, granularity, options);
    return date ? selectDate(model, isoDate(date), mode, expandRange) : model;
}

function parseSelectionValues(value: DateSelection, options: AdvancedDateInputOptions): Date[] {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return values.flatMap(entry => {
        const date = parseAdvancedDate(entry, options);
        return date ? [date] : [];
    });
}

function periodDateKeys(values: readonly Date[], granularity: DateGranularity, options: AdvancedDateInputOptions): string[] {
    const result = new Set<string>();
    values.forEach(value => {
        const start = startOfDatePeriod(value, granularity, options);
        const end = endOfDatePeriod(value, granularity, options);
        if (!start || !end) return;
        for (let day = new Date(start.getTime()), count = 0; day <= end && count < 367; day = addLocalDays(day, 1), count += 1) result.add(isoDate(day));
    });
    return [...result].sort();
}

export function selectedDatesForGranularity(model: DateSelection, mode: DateMode, granularity: DateGranularity = 'day', options: AdvancedDateInputOptions = {}): string[] {
    const values = parseSelectionValues(model, options);
    if (values.length < 2 || mode !== 'range') return periodDateKeys(values, granularity, options);
    const ordered = [...values].sort((left, right) => left.getTime() - right.getTime());
    const start = startOfDatePeriod(ordered[0], granularity, options);
    const end = endOfDatePeriod(ordered[ordered.length - 1], granularity, options);
    if (!start || !end) return [];
    const dates: string[] = [];
    for (let date = new Date(start.getTime()), count = 0; date <= end && count < 3660; date = addLocalDays(date, 1), count += 1) dates.push(isoDate(date));
    return dates;
}

export function cloneAdvancedDateSelection(value: DateSelection, mode: DateMode = 'single', options: AdvancedDateInputOptions = {}): DateSelection {
    const granularity = options.granularity ?? 'day';
    const dates = parseSelectionValues(value, options).map(date => normalizeDateToGranularity(date, granularity, options, !!options.datetime));
    if (mode === 'single') return dates[0] ? new Date(dates[0].getTime()) : null;
    return dates.map(date => new Date(date.getTime()));
}

function dateOnly(value: Date): Date {
    const result = new Date(value.getTime());
    result.setHours(0, 0, 0, 0);
    return result;
}

export function dateSelectionForCalendar(value: DateSelection, mode: DateMode, options: AdvancedDateInputOptions = {}): DateSelection {
    const dates = parseSelectionValues(value, options);
    if (mode === 'range') dates.sort((left, right) => left.getTime() - right.getTime());
    const days = dates.map(dateOnly);
    if (mode === 'single') return days[0] ?? null;
    return days;
}

export function formatTimeOfDay(value: Date | null | undefined): string {
    if (!value || !Number.isFinite(value.getTime())) return '00:00:00';
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}:${String(value.getSeconds()).padStart(2, '0')}`;
}

export function mergeDateAndTime(date: Date, time: string): Date | null {
    const parts = parseTimeParts(time);
    if (!parts) return null;
    const result = dateOnly(date);
    result.setHours(parts[0], parts[1], parts[2], 0);
    return result;
}

function dateValues(value: DateSelection, _mode: DateMode, options: AdvancedDateInputOptions): Date[] {
    return parseSelectionValues(value, options);
}

export function dateTimeDraftTimes(value: DateSelection, mode: DateMode, options: AdvancedDateInputOptions = {}): DateTimeDraftTimes {
    const dates = dateValues(value, mode, options);
    if (mode === 'range') dates.sort((left, right) => left.getTime() - right.getTime());
    return { start: formatTimeOfDay(dates[0]), end: formatTimeOfDay(mode === 'range' ? dates[1] : undefined) };
}

export function combineCalendarDatesWithTimes(value: DateSelection, times: DateTimeDraftTimes, mode: DateMode, options: AdvancedDateInputOptions = {}): DateSelection {
    const dates = parseSelectionValues(value, options).map(dateOnly);
    if (mode === 'range') dates.sort((left, right) => left.getTime() - right.getTime());
    if (!dates.length) return mode === 'single' ? null : [];
    const granularity = options.granularity ?? 'day';
    const result = dates.map((date, index) => {
        const merged = mergeDateAndTime(date, mode === 'range' && index === 1 ? times.end : times.start);
        return merged ? normalizeDateToGranularity(merged, granularity, options, true) : null;
    }).filter((date): date is Date => !!date);
    if (mode === 'single') return result[0] ?? null;
    return result;
}

export function applyTimeToDateSelection(value: DateSelection, time: string, index: 0 | 1, mode: DateMode, options: AdvancedDateInputOptions = {}): DateSelection {
    const dates = dateValues(value, mode, options);
    const times = dateTimeDraftTimes(value, mode, options);
    if (mode === 'range' && index === 1) times.end = time;
    else times.start = time;
    const updated = dates.map((date, dateIndex) => mergeDateAndTime(date, mode === 'range' && dateIndex === 1 ? times.end : times.start)).filter((date): date is Date => !!date);
    if (mode === 'single') return updated[0] ?? null;
    return updated;
}

function getValueGranularity(value: string): DateGranularity {
    if (/^\d{4}$/.test(value)) return 'year';
    if (/^\d{4}-\d{2}$/.test(value)) return 'month';
    if (/^\d{4}\s*第\s*\d{1,2}\s*周$/.test(value)) return 'week';
    return 'day';
}

function dateBoundary(value: DateLike, edge: 'min' | 'max', options: AdvancedDateInputOptions): Date | null {
    const parsed = parseAdvancedDate(value, options);
    if (!parsed) return null;
    if (value instanceof Date || typeof value === 'string' && splitDateTime(value)) return parsed;
    const granularity = getValueGranularity(String(value));
    return edge === 'min' ? startOfDatePeriod(parsed, granularity, options) : endOfDatePeriod(parsed, granularity, options);
}

export interface DateTimeBounds {
    min: string;
    max: string;
    allowed: boolean;
}

export function dateTimeBoundsForDate(value: DateLike | Date, min?: DateLike, max?: DateLike, options: AdvancedDateInputOptions = {}): DateTimeBounds {
    const date = parseAdvancedDate(value, options);
    if (!date) return { min: '00:00:00', max: '23:59:59', allowed: false };
    const start = dateOnly(date);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);
    const lower = min === undefined ? null : dateBoundary(min, 'min', options);
    const upper = max === undefined ? null : dateBoundary(max, 'max', options);
    const allowed = (!lower || end >= lower) && (!upper || start <= upper);
    return {
        min: lower && lower >= start && lower <= end ? formatTimeOfDay(lower) : '00:00:00',
        max: upper && upper >= start && upper <= end ? formatTimeOfDay(upper) : '23:59:59',
        allowed
    };
}

function selectionAllowedDate(value: Date, allowedDates: AllowedDates | undefined): boolean {
    const date = dateOnly(value);
    if (Array.isArray(allowedDates)) return allowedDates.some(entry => {
        const allowed = parseAdvancedDate(entry);
        return !!allowed && dateOnly(allowed).getTime() === date.getTime();
    });
    return typeof allowedDates === 'function' ? allowedDates(date) : true;
}

export function isAdvancedDateSelectionAllowed(value: DateSelection, options: AdvancedDateInputOptions & { min?: DateLike; max?: DateLike; allowedDates?: AllowedDates } = {}): boolean {
    const mode = options.mode ?? 'single';
    const dates = parseSelectionValues(value, options);
    if ((mode === 'single' && dates.length > 1) || (mode === 'range' && dates.length > 2)) return false;
    if (dates.some(date => !selectionAllowedDate(date, options.allowedDates))) return false;
    const granularity = options.granularity ?? 'day';
    for (const date of dates) {
        if (!isAllowedDatePeriod(date, options.min, options.max, granularity, options)) return false;
        if (options.datetime && granularity === 'day') {
            const lower = options.min === undefined ? null : dateBoundary(options.min, 'min', options);
            const upper = options.max === undefined ? null : dateBoundary(options.max, 'max', options);
            if ((lower && date < lower) || (upper && date > upper)) return false;
        }
    }
    if (mode === 'range' && dates.length === 2 && dates[0].getTime() > dates[1].getTime()) return false;
    return true;
}

function splitSelectionText(value: string, mode: DateInputMode, rangeSeparator: string, parseDate: (value: string) => Date | null): string[] | null {
    if (mode === 'single') return [value.trim()];
    if (mode === 'range') return splitDateRangeText(value.trim(), rangeSeparator, parseDate);
    return value.trim().split(/\s*,\s*/).map(part => part.trim()).filter(Boolean);
}

function defaultInputPattern(options: AdvancedDateInputOptions): string {
    if (options.datetime) return 'YYYY-MM-DD HH:mm:ss';
    if (options.granularity === 'year') return 'YYYY';
    if (options.granularity === 'month') return 'YYYY-MM';
    if (options.granularity === 'week') return 'YYYY 第 ww 周';
    return 'YYYY-MM-DD';
}

function builtinFormatOptions(format: string): Intl.DateTimeFormatOptions | null {
    switch (format) {
        case 'fullDate': return { year: 'numeric', month: 'short', day: 'numeric' };
        case 'fullDateWithWeekday': return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        case 'normalDateWithWeekday': return { weekday: 'short', day: 'numeric', month: 'short' };
        case 'shortDate': return { month: 'short', day: 'numeric' };
        case 'year': return { year: 'numeric' };
        case 'month': return { month: 'long' };
        case 'monthShort': return { month: 'short' };
        case 'monthAndYear': return { month: 'long', year: 'numeric' };
        case 'monthAndDate': return { month: 'long', day: 'numeric' };
        case 'weekday': return { weekday: 'long' };
        case 'weekdayShort': return { weekday: 'short' };
        case 'hours12h': return { hour: 'numeric', hour12: true };
        case 'hours24h': return { hour: 'numeric', hour12: false };
        case 'minutes': return { minute: 'numeric' };
        case 'seconds': return { second: 'numeric' };
        case 'fullTime': return { hour: 'numeric', minute: 'numeric' };
        case 'fullTime12h': return { hour: 'numeric', minute: 'numeric', hour12: true };
        case 'fullTime24h': return { hour: 'numeric', minute: 'numeric', hour12: false };
        case 'fullDateTime': return { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        case 'fullDateTime12h': return { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        case 'fullDateTime24h': return { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
        case 'keyboardDate': return { year: 'numeric', month: '2-digit', day: '2-digit' };
        case 'keyboardDateTime': return { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' };
        case 'keyboardDateTime12h': return { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true };
        case 'keyboardDateTime24h': return { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: false };
        default: return null;
    }
}

function formatDatePattern(date: Date, pattern: string, options: AdvancedDateInputOptions): string | null {
    const normalized = pattern.trim();
    if (/^y{4}$/i.test(normalized)) return String(date.getFullYear()).padStart(4, '0');
    const monthPattern = /^y{4}([-/.])m{1,2}$/i.exec(normalized);
    if (monthPattern) return `${String(date.getFullYear()).padStart(4, '0')}${monthPattern[1]}${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (parseWeekPattern(normalized)) {
        const number = getCalendarWeekNumber(date, options.locale ?? 'en-US', options.firstDayOfWeek, options.firstDayOfYear);
        const year = getCalendarWeekYear(date, options) ?? date.getFullYear();
        return `${String(year).padStart(4, '0')} 第 ${String(number).padStart(2, '0')} 周`;
    }
    const dateTimePattern = /^(.+?)[ T]HH:mm(?::ss)?$/i.exec(normalized);
    const datePattern = dateTimePattern?.[1] ?? normalized;
    const spec = parseDateFormatSpec(datePattern);
    if (spec) {
        const values: Record<string, string> = {
            y: String(date.getFullYear()).padStart(4, '0'),
            m: String(date.getMonth() + 1).padStart(2, '0'),
            d: String(date.getDate()).padStart(2, '0')
        };
        const formattedDate = [...spec.order].map(sign => values[sign]).join(spec.separator);
        if (!dateTimePattern) return formattedDate;
        const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const seconds = /:ss$/i.test(normalized) ? `:${String(date.getSeconds()).padStart(2, '0')}` : '';
        return `${formattedDate}${normalized.match(/[ T]/)?.[0] ?? ' '}${time}${seconds}`;
    }
    return null;
}

function formatNamedDate(date: Date, format: string, locale: string): string | null {
    if (format === 'normalDate') {
        const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
        return `${date.getDate()} ${month}`;
    }
    if (format === 'dayOfMonth') return new Intl.NumberFormat(locale).format(date.getDate());
    const intlOptions = builtinFormatOptions(format);
    if (!intlOptions) return null;
    const result = new Intl.DateTimeFormat(locale, intlOptions).format(date);
    return format.startsWith('keyboardDateTime') ? result.replace(/, /g, ' ') : result;
}

export function formatAdvancedDate(value: DateLike | null | undefined, options: AdvancedDateInputOptions = {}): string {
    const date = parseAdvancedDate(value, options);
    if (!date) return '';
    if (typeof options.displayFormat === 'function') return options.displayFormat(new Date(date.getTime()));
    const displayFormat = options.displayFormat ?? defaultInputPattern(options);
    return formatDatePattern(date, displayFormat, options) ?? formatNamedDate(date, displayFormat, options.locale ?? 'en-US') ?? createDateInputFormat({ locale: options.locale, displayFormat }).formatDate(date);
}

export interface AdvancedDateInputFormat {
    placeholder: string;
    separators: DateInputSeparators;
    parseDate(value: DateLike | null | undefined): Date | null;
    formatDate(value: DateLike | null | undefined): string;
    joinDates(values: readonly DateLike[], mode?: DateInputMode): string;
    parseInput(value: string | null | undefined, mode?: DateInputMode): ParsedDateSelection;
    formatSelection(value: DateInputSelection, mode?: DateInputMode): string;
    empty(mode?: DateInputMode): DateInputSelection;
}

export function createAdvancedDateInputFormat(options: AdvancedDateInputOptions = {}): AdvancedDateInputFormat {
    const mode = options.mode ?? 'single';
    const inputPattern = options.inputFormat ?? defaultInputPattern(options);
    const rangeSeparator = resolveDateRangeSeparator(options.rangeSeparator);
    const dateSeparator = parseDateFormatSpec(inputPattern)?.separator
        ?? (inputPattern.match(/[-/.]/)?.[0] as DateFormatSpec['separator'] | undefined)
        ?? createDateInputFormat({ locale: options.locale }).separator;
    function parseDate(value: DateLike | null | undefined): Date | null {
        return parseAdvancedDate(value, options);
    }

    function formatDate(value: DateLike | null | undefined): string {
        return formatAdvancedDate(value, options);
    }

    function joinDates(values: readonly DateLike[], selectionMode: DateInputMode = mode): string {
        const orderedValues = selectionMode === 'range'
            ? [...values].sort((left, right) => (parseAdvancedDate(left, options)?.getTime() ?? 0) - (parseAdvancedDate(right, options)?.getTime() ?? 0))
            : [...values];
        if (selectionMode === 'range' && options.isRtl) orderedValues.reverse();
        return orderedValues.map(value => formatDate(value)).join(selectionMode === 'range' ? rangeSeparator : MULTIPLE_SEPARATOR);
    }

    function parseInput(value: string | null | undefined, selectionMode: DateInputMode = mode): ParsedDateSelection {
        const input = value?.trim() ?? '';
        if (!input) return { valid: true, value: selectionMode === 'single' ? null : [] };
        const parts = splitSelectionText(input, selectionMode, rangeSeparator, part => parseAdvancedDate(part, options));
        if (!parts || !parts.length || (selectionMode === 'single' && parts.length !== 1) || (selectionMode === 'range' && parts.length > 2)) {
            return { valid: false, value: selectionMode === 'single' ? null : [] };
        }
        const dates = parts.map(part => parseAdvancedDate(part, options));
        if (dates.some(date => !date)) return { valid: false, value: selectionMode === 'single' ? null : [] };
        if (selectionMode === 'range' && dates.length === 2 && dates[0]!.getTime() > dates[1]!.getTime()) return { valid: false, value: [] };
        const parsed = dates.map(date => normalizeDateToGranularity(date!, options.granularity ?? 'day', options, !!options.datetime));
        if (selectionMode === 'single') return { valid: true, value: parsed[0] };
        return { valid: true, value: parsed };
    }

    function formatSelection(value: DateInputSelection, selectionMode: DateInputMode = mode): string {
        if (value == null) return '';
        return Array.isArray(value) ? joinDates(value, selectionMode) : formatDate(value);
    }

    function empty(selectionMode: DateInputMode = mode): DateInputSelection {
        return selectionMode === 'single' ? null : [];
    }

    const placeholder = options.inputFormat ?? inputPattern;
    return {
        placeholder: mode === 'range' ? `${placeholder}${rangeSeparator}${placeholder}` : mode === 'multiple' ? `${placeholder}, ...` : placeholder,
        separators: { date: dateSeparator, multiple: MULTIPLE_SEPARATOR, range: rangeSeparator, join: mode === 'range' ? rangeSeparator : MULTIPLE_SEPARATOR },
        parseDate,
        formatDate,
        joinDates,
        parseInput,
        formatSelection,
        empty
    };
}