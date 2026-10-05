export type DateSelection = string | string[] | null;
export type DateMode = 'single' | 'multiple' | 'range';
export type AllowedDates = readonly string[] | ((date: string) => boolean);

export function parseIsoDate(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
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

export function isAllowedDate(value: string, min?: string, max?: string, allowedDates?: AllowedDates): boolean {
    if (!parseIsoDate(value) || (min && value < min) || (max && value > max)) return false;
    if (Array.isArray(allowedDates)) return allowedDates.includes(value);
    return typeof allowedDates === 'function' ? allowedDates(value) : true;
}

export function selectedDates(model: DateSelection, mode: DateMode): string[] {
    const values = Array.isArray(model) ? model : model ? [model] : [];
    if (mode !== 'range' || values.length < 2) return values;
    const [start, end] = [...values].sort();
    const dates: string[] = [];
    for (let date = start; date <= end && dates.length < 3660; date = addDays(date, 1)) dates.push(date);
    return dates;
}

export function selectDate(model: DateSelection, value: string, mode: DateMode): DateSelection {
    if (mode === 'single') return value;
    const values = Array.isArray(model) ? model : model ? [model] : [];
    if (mode === 'multiple') return values.includes(value) ? values.filter((date) => date !== value) : [...values, value].sort();
    if (values.length !== 1) return [value];
    return [values[0], value].sort();
}

export function monthDays(month: string, firstDayOfWeek = 0): Array<{ date: string; current: boolean }> {
    const first = parseIsoDate(month.slice(0, 7) + '-01');
    if (!first) return [];
    const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
    first.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + index);
        return { date: isoDate(date), current: date.getMonth() === parseIsoDate(month.slice(0, 7) + '-01')!.getMonth() && date.getFullYear() === parseIsoDate(month.slice(0, 7) + '-01')!.getFullYear() };
    });
}

export function validTime(value: string, format: '24h' | '12h' = '24h'): boolean {
    return parseTime(value, format) !== null;
}

export function parseTime(value: string, format: '24h' | '12h' = '24h'): { hour: number; minute: number; period?: 'AM' | 'PM'; minutes: number } | null {
    if (format === '12h') {
        const match = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i.exec(value);
        if (!match) return null;
        const hour = Number(match[1]);
        const minute = Number(match[2]);
        const period = match[3].toUpperCase() as 'AM' | 'PM';
        return { hour, minute, period, minutes: (hour % 12) * 60 + minute + (period === 'PM' ? 720 : 0) };
    }
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    return { hour, minute, minutes: hour * 60 + minute };
}
