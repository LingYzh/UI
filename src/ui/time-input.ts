import { formatTimeDisplay, formatTimeValue, parseTimeInput, type TimeFormat, type TimeViewMode } from './time-picker';

export type TimeInputValue = string | string[] | null;
export interface TimeInputOptions {
    useSeconds?: boolean;
    min?: string;
    max?: string;
    allowedRanges?: readonly (readonly [string, string])[];
}

function seconds(value: string): number | null {
    const parsed = parseTimeInput(value);
    if (!parsed.valid || !parsed.complete) return null;
    return parsed.parts.hour! * 3600 + parsed.parts.minute! * 60 + (parsed.parts.second ?? 0);
}

/** Intersect whole time slots, so selecting an hour can lead to an allowed minute. */
function intervals(options: TimeInputOptions): [number, number][] {
    const min = options.min ? seconds(options.min) : 0;
    const max = options.max ? seconds(options.max) : 86399;
    if (min === null || max === null || min > max) return [];
    const ranges = options.allowedRanges ?? [['00:00:00', '23:59:59']];
    return ranges.flatMap(([start, end]) => {
        const from = seconds(start);
        const to = seconds(end);
        if (from === null || to === null || from > to) return [];
        const lower = Math.max(min, from);
        const upper = Math.min(max, to);
        return lower <= upper ? [[lower, upper] as [number, number]] : [];
    });
}

export function allowedTimeInput(value: string, options: TimeInputOptions = {}): boolean {
    const parsed = parseTimeInput(value, options);
    const point = seconds(value);
    return parsed.valid && parsed.complete && point !== null && intervals(options).some(([from, to]) => point >= from && point <= to);
}

export function allowedTimeInputField(field: TimeViewMode, value: number, selection: string | null, options: TimeInputOptions = {}): boolean {
    const parts = parseTimeInput(selection, options).parts;
    const step = options.useSeconds ? 1 : 60;
    return intervals(options).some(([from, to]) => {
        // At most 24 hours or 60 minutes are examined; never iterate every second.
        const hours = field === 'hour' ? [value] : parts.hour === null ? Array.from({ length: 24 }, (_, index) => index) : [parts.hour];
        return hours.some(hour => {
            const minutes = field === 'minute' ? [value] : field === 'second' && parts.minute !== null ? [parts.minute] : Array.from({ length: 60 }, (_, index) => index);
            return minutes.some(minute => {
                const lower = hour * 3600 + minute * 60 + (field === 'second' ? value : 0);
                const upper = lower + (field === 'second' ? 0 : options.useSeconds ? 59 : 0);
                const candidate = Math.ceil(Math.max(lower, from) / step) * step;
                return candidate <= Math.min(upper, to);
            });
        });
    });
}

export function initialTimeInput(options: TimeInputOptions = {}): string | null {
    const step = options.useSeconds ? 1 : 60;
    for (const [from, to] of intervals(options)) {
        const point = Math.ceil(from / step) * step;
        if (point > to) continue;
        return formatTimeValue({ hour: Math.floor(point / 3600), minute: Math.floor(point / 60) % 60, second: point % 60, period: point >= 43200 ? 'pm' : 'am' }, options);
    }
    return null;
}

export function validTimeInputSelection(value: TimeInputValue, range: boolean, options: TimeInputOptions = {}): boolean {
    if (value === null || value === '' || Array.isArray(value) && value.length === 0) return true;
    if (range) return Array.isArray(value) && value.length === 2 && value.every(time => allowedTimeInput(time, options)) && seconds(value[0])! <= seconds(value[1])!;
    return typeof value === 'string' && allowedTimeInput(value, options);
}

export function displayTimeInput(value: string, options: { useSeconds?: boolean; format?: TimeFormat; displayFormat?: string }): string {
    const parsed = parseTimeInput(value, options);
    if (!parsed.valid || !parsed.complete) return value;
    if (!options.displayFormat) return formatTimeDisplay(parsed.parts, options)?.text ?? value;
    const hour = parsed.parts.hour!;
    const fields: Record<string, string> = {
        HH: String(hour).padStart(2, '0'), H: String(hour), hh: String(hour % 12 || 12).padStart(2, '0'), h: String(hour % 12 || 12),
        mm: String(parsed.parts.minute!).padStart(2, '0'), m: String(parsed.parts.minute!), ss: String(parsed.parts.second ?? 0).padStart(2, '0'), s: String(parsed.parts.second ?? 0),
        A: hour >= 12 ? 'PM' : 'AM', a: hour >= 12 ? 'pm' : 'am'
    };
    return options.displayFormat.replace(/\[[^\]]*\]|HH|hh|mm|ss|H|h|m|s|A|a/g, token => token.startsWith('[') ? token.slice(1, -1) : fields[token]);
}
