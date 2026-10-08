export type DateLike = string | Date;
export type DateSelection = DateLike | DateLike[] | null;
export type DateMode = 'single' | 'multiple' | 'range';
export type AllowedDates = readonly DateLike[] | ((date: Date) => boolean);

export function parseIsoDate(value: DateLike | null | undefined): Date | null {
    if (value instanceof Date) {
        if (!Number.isFinite(value.getTime())) return null;
        const date = new Date(value.getTime());
        date.setHours(0, 0, 0, 0);
        return date;
    }
    if (typeof value !== 'string') return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function isoDate(date: Date): string {
    return `${date.getFullYear().toString().padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addDays(value: string, count: number): string {
    const date = parseIsoDate(value);
    if (!date) return value;
    date.setDate(date.getDate() + count);
    return isoDate(date);
}

export function addMonths(value: string, count: number): string {
    const date = parseIsoDate(value);
    if (!date) return value;
    date.setDate(1);
    date.setMonth(date.getMonth() + count);
    return isoDate(date);
}

export function isAllowedDate(value: DateLike, min?: DateLike, max?: DateLike, allowedDates?: AllowedDates): boolean {
    const date = parseIsoDate(value);
    if (!date) return false;
    const lower = parseIsoDate(min);
    const upper = parseIsoDate(max);
    if ((lower && date < lower) || (upper && date > upper)) return false;
    if (Array.isArray(allowedDates)) return allowedDates.some(entry => parseIsoDate(entry)?.getTime() === date.getTime());
    return typeof allowedDates === 'function' ? allowedDates(date) : true;
}

export function selectedDates(model: DateSelection, mode: DateMode): string[] {
    const values = (Array.isArray(model) ? model : model ? [model] : []).flatMap(value => { const date = parseIsoDate(value); return date ? [isoDate(date)] : []; });
    if (mode !== 'range' || values.length < 2) return values;
    const [start, end] = [...values].sort();
    const dates: string[] = [];
    for (let date = start; date <= end && dates.length < 3660; date = addDays(date, 1)) dates.push(date);
    return dates;
}

export function selectDate(model: DateSelection, value: string, mode: DateMode, expandRange = false): DateSelection {
    const date = parseIsoDate(value);
    if (!date) return model;
    if (mode === 'single') return date;
    const values = selectedDates(model, 'multiple');
    if (mode === 'multiple') return (values.includes(value) ? values.filter(entry => entry !== value) : [...values, value]).map(entry => parseIsoDate(entry)!);
    if (values.length !== 1) return [date];
    const range = [values[0], value].sort();
    return (expandRange ? selectedDates(range, 'range') : range).map(entry => parseIsoDate(entry)!);
}

export function monthDays(month: string, firstDayOfWeek = 0, weeksInMonth: 'static' | 'dynamic' = 'static'): Array<{ date: string; current: boolean }> {
    const first = parseIsoDate(month.slice(0, 7) + '-01');
    if (!first) return [];
    const anchor = new Date(first);
    const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
    const last = new Date(anchor);
    last.setMonth(last.getMonth() + 1, 0);
    const count = weeksInMonth === 'dynamic' ? Math.ceil((offset + last.getDate()) / 7) * 7 : 42;
    first.setDate(1 - offset);
    return Array.from({ length: count }, (_, index) => {
        const date = new Date(first);
        date.setDate(first.getDate() + index);
        return { date: isoDate(date), current: date.getMonth() === anchor.getMonth() && date.getFullYear() === anchor.getFullYear() };
    });
}

export function validTime(value: string, format: '24h' | '12h' = '24h'): boolean {
    return parseTime(value, format) !== null;
}

export function parseTime(value: string | null | undefined, format: '24h' | '12h' = '24h'): { hour: number; minute: number; second: number; period?: 'AM' | 'PM'; minutes: number } | null {
    if (typeof value !== 'string') return null;
    if (format === '12h') {
        const match = /^(0?[1-9]|1[0-2]):([0-5]\d)(?::([0-5]\d))?\s?(AM|PM)$/i.exec(value);
        if (!match) return null;
        const hour = Number(match[1]);
        const minute = Number(match[2]);
        const second = Number(match[3] ?? 0);
        const period = match[4].toUpperCase() as 'AM' | 'PM';
        return { hour, minute, second, period, minutes: (hour % 12) * 60 + minute + (period === 'PM' ? 720 : 0) + second / 60 };
    }
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] ?? 0);
    return { hour, minute, second, minutes: hour * 60 + minute + second / 60 };
}
