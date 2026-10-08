export type TimePeriod = 'am' | 'pm';
export type TimeViewMode = 'hour' | 'minute' | 'second';
export type TimeFormat = '12h' | '24h' | 'ampm' | '24hr';
export type AllowedTimeValues = readonly number[] | ((value: number) => boolean);

export interface TimePickerParts {
    /** Hour is always stored in canonical 24-hour form. */
    hour: number | null;
    minute: number | null;
    second: number | null;
    period: TimePeriod;
}

export interface TimePickerOptions {
    min?: string | null;
    max?: string | null;
    allowedHours?: AllowedTimeValues;
    allowedMinutes?: AllowedTimeValues;
    allowedSeconds?: AllowedTimeValues;
    useSeconds?: boolean;
    format?: TimeFormat;
    period?: TimePeriod;
    /** Interpret unsuffixed typed values as 12-hour display input. */
    inputMode?: 'canonical' | 'display';
    /** Local display extension; Vuetify 4.2.4 has no ampmInTitle prop. */
    ampmInTitle?: boolean;
}

export interface ParsedTimeInput {
    parts: TimePickerParts;
    complete: boolean;
    valid: boolean;
    /** Canonical 24-hour HH:mm[:ss], or null until complete and valid. */
    canonical: string | null;
}

export interface TimePickerItem {
    /** Value displayed in this view (1–12 for a 12-hour hour view). */
    value: number;
    /** Equivalent canonical value (24-hour hour, minute, or second). */
    timeValue: number;
    label: string;
    disabled: boolean;
}

const EMPTY_PARTS: TimePickerParts = { hour: null, minute: null, second: null, period: 'am' };

function isTwelveHourFormat(format: TimeFormat | undefined): boolean {
    return format === '12h' || format === 'ampm';
}

function periodForHour(hour: number | null, fallback: TimePeriod = 'am'): TimePeriod {
    return hour === null ? fallback : hour < 12 ? 'am' : 'pm';
}

function validField(value: number | null, max: number): boolean {
    return value === null || (Number.isInteger(value) && value >= 0 && value <= max);
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function emptyResult(valid = true): ParsedTimeInput {
    return { parts: { ...EMPTY_PARTS }, complete: false, valid, canonical: null };
}

export function convert12HourTo24(hour: number, period: TimePeriod): number {
    return (hour % 12) + (period === 'pm' ? 12 : 0);
}

export function convert24HourTo12(hour: number): number {
    return hour ? ((hour - 1) % 12) + 1 : 12;
}

/** Parse a canonical time or a legacy time ending in AM/PM without committing partial input. */
export function parseTimeInput(value: string | Date | null | undefined, options: TimePickerOptions = {}): ParsedTimeInput {
    if (value == null || value === '') return emptyResult();

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return emptyResult(false);
        const hour = value.getHours();
        const parts: TimePickerParts = { hour, minute: value.getMinutes(), second: value.getSeconds(), period: periodForHour(hour) };
        const valid = validField(parts.hour, 23) && validField(parts.minute, 59) && validField(parts.second, 59);
        const canonical = valid ? formatTimeValue(parts, options) : null;
        return { parts, complete: canonical !== null, valid, canonical };
    }

    const input = value.trim();
    if (!input) return emptyResult();

    const suffixMatch = input.match(/\s*(am|pm)$/i);
    const suffix = suffixMatch?.[1]?.toLowerCase() as TimePeriod | undefined;
    const timeText = suffixMatch ? input.slice(0, suffixMatch.index).trim() : input;
    const match = timeText.match(/^(\d{0,2})(?::(\d{0,2}))?(?::(\d{0,2}))?$/);
    if (!match) return emptyResult(false);

    const read = (field: string | undefined): number | null => field == null || field === '' ? null : Number(field);
    const rawHour = read(match[1]);
    const minute = read(match[2]);
    const second = read(match[3]);
    const hasMinuteSeparator = timeText.includes(':');
    const validShape = rawHour !== null || minute !== null || second !== null;
    if (!validShape) return emptyResult(input === '');

    let hour = rawHour;
    let valid = validField(minute, 59) && validField(second, 59);
    if (suffix) {
        valid = valid && rawHour !== null && rawHour >= 1 && rawHour <= 12;
        if (rawHour !== null) hour = convert12HourTo24(rawHour, suffix);
    } else if (options.inputMode === 'display' && isTwelveHourFormat(options.format) && rawHour !== null) {
        const period = options.period ?? 'am';
        valid = valid && rawHour >= 1 && rawHour <= 12;
        hour = convert12HourTo24(rawHour, period);
    }

    valid = valid && validField(hour, 23);
    const parts: TimePickerParts = {
        hour,
        minute: hasMinuteSeparator ? minute : null,
        second: timeText.split(':').length > 2 ? second : null,
        period: suffix ?? periodForHour(hour, options.period ?? 'am')
    };
    const complete = parts.hour !== null && parts.minute !== null && (!options.useSeconds || parts.second !== null);
    const canonical = valid && complete ? formatTimeValue(parts, options) : null;
    return { parts, complete: complete && canonical !== null, valid, canonical };
}

/** Format canonical model output. Display format never changes this 24-hour protocol. */
export function formatTimeValue(parts: TimePickerParts, options: Pick<TimePickerOptions, 'useSeconds'> = {}): string | null {
    if (parts.hour === null || parts.minute === null || (options.useSeconds && parts.second === null)) return null;
    if (!validField(parts.hour, 23) || !validField(parts.minute, 59) || !validField(parts.second, 59)) return null;
    return `${pad(parts.hour)}:${pad(parts.minute)}${options.useSeconds ? `:${pad(parts.second!)}` : ''}`;
}

export interface TimeDisplayValue {
    text: string;
    period: 'AM' | 'PM' | null;
    periodPlacement: 'inline' | 'title' | null;
}

/** Format visible text separately from canonical model output. */
export function formatTimeDisplay(parts: TimePickerParts, options: Pick<TimePickerOptions, 'useSeconds' | 'format' | 'ampmInTitle'> = {}): TimeDisplayValue | null {
    if (formatTimeValue(parts, options) === null) return null;
    const twelveHour = isTwelveHourFormat(options.format);
    const hour = twelveHour ? convert24HourTo12(parts.hour!) : parts.hour!;
    const time = `${pad(hour)}:${pad(parts.minute!)}${options.useSeconds ? `:${pad(parts.second!)}` : ''}`;
    const period = twelveHour ? periodForHour(parts.hour!).toUpperCase() as 'AM' | 'PM' : null;
    const periodPlacement = period === null ? null : options.ampmInTitle ? 'title' : 'inline';
    return {
        text: period !== null && periodPlacement === 'inline' ? `${time} ${period}` : time,
        period,
        periodPlacement
    };
}

function limitFields(value: string | null | undefined, fallback: number[]): number[] {
    return value ? value.split(':').map(Number) : fallback;
}

function allowedByList(value: number, allowed: AllowedTimeValues | undefined): boolean {
    if (Array.isArray(allowed)) return allowed.includes(value);
    if (typeof allowed === 'function') return allowed(value);
    return true;
}

/** Match VTimePicker's independent hour/minute/second validation rules. */
export function isTimeValueAllowed(mode: TimeViewMode, value: number, parts: TimePickerParts, options: TimePickerOptions = {}): boolean {
    if (!Number.isInteger(value)) return false;

    if (mode === 'hour') {
        const minHour = options.min ? Number(options.min.split(':')[0]) : 0;
        const maxHour = options.max ? Number(options.max.split(':')[0]) : 23;
        if (value < minHour || value > maxHour) return false;
        return allowedByList(value, options.allowedHours);
    }

    if (mode === 'minute') {
        const [minHour, minMinute] = limitFields(options.min, [0, 0]);
        const [maxHour, maxMinute] = limitFields(options.max, [23, 59]);
        const minTime = minHour * 60 + minMinute;
        const maxTime = maxHour * 60 + maxMinute;
        if (parts.hour !== null) {
            const time = 60 * parts.hour + value;
            if (time < minTime || time > maxTime) return false;
        }
        return allowedByList(value, options.allowedMinutes);
    }

    const [minHour, minMinute, minSecond] = limitFields(options.min, [0, 0, 0]);
    const [maxHour, maxMinute, maxSecond] = limitFields(options.max, [23, 59, 59]);
    const minTime = minHour * 3600 + minMinute * 60 + (minSecond || 0);
    const maxTime = maxHour * 3600 + maxMinute * 60 + (maxSecond || 0);
    if (parts.hour !== null && parts.minute !== null) {
        const time = 3600 * parts.hour + 60 * parts.minute + value;
        if (time < minTime || time > maxTime) return false;
    }
    return allowedByList(value, options.allowedSeconds);
}

function displayHourToCanonical(value: number, parts: TimePickerParts, options: TimePickerOptions): number {
    if (!isTwelveHourFormat(options.format)) return value;
    return convert12HourTo24(value, options.period ?? parts.period ?? 'am');
}

export function getTimePickerItems(mode: TimeViewMode, parts: TimePickerParts, options: TimePickerOptions = {}): TimePickerItem[] {
    const twelveHour = mode === 'hour' && isTwelveHourFormat(options.format);
    const values = mode === 'hour'
        ? twelveHour ? Array.from({ length: 12 }, (_, index) => index + 1) : Array.from({ length: 24 }, (_, index) => index)
        : Array.from({ length: 60 }, (_, index) => index);
    return values.map(value => {
        const timeValue = mode === 'hour' ? displayHourToCanonical(value, parts, options) : value;
        return {
            value,
            timeValue,
            label: pad(value),
            disabled: !isTimeValueAllowed(mode, timeValue, parts, options)
        };
    });
}

export function getDisabledTimeValues(mode: TimeViewMode, parts: TimePickerParts, options: TimePickerOptions = {}): number[] {
    return getTimePickerItems(mode, parts, options).filter(item => item.disabled).map(item => item.value);
}

export function setTimePeriod(parts: TimePickerParts, period: TimePeriod): TimePickerParts {
    if (parts.hour === null) return { ...parts, period };
    const displayHour = convert24HourTo12(parts.hour);
    const hour = convert12HourTo24(displayHour, period);
    return { ...parts, hour, period };
}

/** Select an exact item; null means the requested item is disabled or out of range. */
export function moveTimeValue(parts: TimePickerParts, mode: TimeViewMode, value: number, options: TimePickerOptions = {}): TimePickerParts | null {
    const timeValue = mode === 'hour' ? displayHourToCanonical(value, parts, options) : value;
    if (!isTimeValueAllowed(mode, timeValue, parts, options)) return null;
    if (mode === 'hour') return { ...parts, hour: timeValue, period: periodForHour(timeValue) };
    if (mode === 'minute') return { ...parts, minute: timeValue };
    return { ...parts, second: timeValue };
}

/** Move one value in the active view, wrapping and skipping disabled values like VTimePicker controls. */
export function stepTimeValue(parts: TimePickerParts, mode: TimeViewMode, direction: -1 | 1, options: TimePickerOptions = {}): TimePickerParts {
    const limit = mode === 'hour' ? 24 : 60;
    const current = mode === 'hour' ? (parts.hour ?? (parts.period === 'pm' ? 12 : 0)) : (mode === 'minute' ? parts.minute : parts.second) ?? 0;
    let candidate = current;
    for (let attempt = 0; attempt < limit; attempt += 1) {
        candidate = (candidate + direction + limit) % limit;
        if (isTimeValueAllowed(mode, candidate, parts, options)) {
            if (mode === 'hour') return { ...parts, hour: candidate, period: periodForHour(candidate) };
            if (mode === 'minute') return { ...parts, minute: candidate };
            return { ...parts, second: candidate };
        }
    }
    return { ...parts };
}

export function nextTimeViewMode(mode: TimeViewMode, useSeconds = false): TimeViewMode | null {
    if (mode === 'hour') return 'minute';
    if (mode === 'minute' && useSeconds) return 'second';
    return null;
}
