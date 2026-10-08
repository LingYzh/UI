import { parseIsoDate, type DateLike } from './date-model';

export type DateInputMode = 'single' | 'multiple' | 'range';
export type DateInputSelection = Date | Date[] | null;
export type DateDisplayFunction = (date: Date) => string;
export type DateAdapterFormatFunction = (date: Date, format: string, locale: string) => string;
export type DateDisplayFormat = string | DateDisplayFunction;
export type DateFormatDefinition = Intl.DateTimeFormatOptions | DateAdapterFormatFunction;

export interface DateInputFormatOptions {
    locale?: string;
    inputFormat?: string;
    displayFormat?: DateDisplayFormat;
    formats?: Readonly<Record<string, DateFormatDefinition>>;
    mode?: DateInputMode;
    /** Vuetify-style multiple option; mode takes precedence when both are supplied. */
    multiple?: boolean | 'range' | number | (string & {});
    placeholder?: string;
    currentYear?: number;
    isRtl?: boolean;
}

export interface DateFormatSpec {
    order: 'dmy' | 'mdy' | 'ymd' | string;
    separator: '/' | '-' | '.';
    format: string;
}

export interface ParsedDateSelection {
    valid: boolean;
    value: DateInputSelection;
}

const DATE_SEPARATOR_ORDER = ['/', '-', '.'] as const;
const MULTIPLE_SEPARATOR = ', ';
const RANGE_SEPARATOR = ' - ';

function makeFormatSpec(order: string, separator: string): DateFormatSpec {
    const normalizedSeparator = DATE_SEPARATOR_ORDER.includes(separator as typeof DATE_SEPARATOR_ORDER[number])
        ? separator as DateFormatSpec['separator']
        : '/';
    const format = order.split('').map(sign => sign + sign).join(normalizedSeparator).replace('yy', 'yyyy');
    return { order, separator: normalizedSeparator, format };
}

/** Same accepted order/separator form as Vuetify 4.2.4's DateFormatSpec. */
export function parseDateFormatSpec(value: string | null | undefined): DateFormatSpec | null {
    if (typeof value !== 'string') return null;
    const lowercase = value.toLowerCase();
    if (!['y', 'm', 'd'].every(sign => lowercase.includes(sign))) return null;
    const separator = DATE_SEPARATOR_ORDER.find(sign => value.includes(sign));
    if (!separator) return null;
    const order = [...lowercase].filter((char, index, all) => 'dmy'.includes(char) && all.indexOf(char) === index).join('');
    if (order.length !== 3 || !['dmy', 'mdy', 'ymd', 'dym', 'myd', 'ydm'].includes(order)) return null;
    return makeFormatSpec(order, separator);
}

function inferFormatFromLocale(locale: string): DateFormatSpec {
    try {
        const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
            .formatToParts(new Date(1999, 11, 7));
        const logicalOrder = parts
            .filter(part => ['year', 'month', 'day'].includes(part.type))
            .map(part => ({ year: 'y', month: 'm', day: 'd' } as const)[part.type as 'year' | 'month' | 'day'])
            .join('');
        const literal = parts.find(part => part.type === 'literal')?.value ?? '';
        const separator = DATE_SEPARATOR_ORDER.find(sign => literal.includes(sign)) ?? '/';
        if (logicalOrder.length !== 3) return makeFormatSpec('mdy', '/');
        const visualOrder = literal.includes('\u200f') ? [...logicalOrder].reverse().join('') : logicalOrder;
        return makeFormatSpec(visualOrder, separator);
    } catch {
        return makeFormatSpec('mdy', '/');
    }
}

export function autoFixDateYear(year: number, currentYear = new Date().getFullYear()): number {
    if (year > 100 || currentYear % 100 >= 50) return year;
    const currentCentury = Math.trunc(currentYear / 100) * 100;
    return year < 50 ? currentCentury + year : currentCentury - 100 + year;
}

function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
    if (month === 2) return isLeapYear(year) ? 29 : 28;
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function createLocalDate(year: number, month: number, day: number): Date | null {
    if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function resolveMode(options: DateInputFormatOptions): DateInputMode {
    if (options.mode) return options.mode;
    return options.multiple === 'range' ? 'range' : options.multiple ? 'multiple' : 'single';
}

function cloneDate(value: DateLike): Date | null {
    return parseIsoDate(value);
}

function formatWithSpec(date: Date, spec: DateFormatSpec): string {
    const parts: Record<string, string> = {
        y: String(date.getFullYear()).padStart(4, '0'),
        m: String(date.getMonth() + 1).padStart(2, '0'),
        d: String(date.getDate()).padStart(2, '0')
    };
    return [...spec.order].map(sign => parts[sign]).join(spec.separator);
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

function splitSelectionText(value: string, mode: DateInputMode): string[] | null {
    if (mode === 'single') return [value.trim()];
    const parts = mode === 'range'
        ? value.trim().split(/\s+-\s+|\s+[–—]\s+/)
        : value.trim().split(/\s*,\s*/);
    const filtered = parts.map(part => part.trim()).filter(Boolean);
    return filtered.length === 0 ? [] : filtered;
}

export interface DateInputFormat {
    locale: string;
    order: string;
    separator: DateFormatSpec['separator'];
    parserFormat: string;
    placeholder: string;
    separators: { date: DateFormatSpec['separator']; multiple: string; range: string; join: string };
    formatDate(value: DateLike | null | undefined): string;
    parseDate(value: DateLike | null | undefined): Date | null;
    join(values: readonly string[], mode?: DateInputMode): string;
    joinDates(values: readonly DateLike[], mode?: DateInputMode): string;
    parseInput(value: string | null | undefined, mode?: DateInputMode): ParsedDateSelection;
    formatSelection(value: DateInputSelection, mode?: DateInputMode): string;
    empty(mode?: DateInputMode): DateInputSelection;
}

/** Build deterministic date input behavior without Vue state or global locale mutation. */
export function createDateInputFormat(options: DateInputFormatOptions = {}): DateInputFormat {
    const locale = options.locale || 'en-US';
    const formatSpec = parseDateFormatSpec(options.inputFormat) ?? inferFormatFromLocale(locale);
    const mode = resolveMode(options);
    const currentYear = options.currentYear ?? new Date().getFullYear();
    const multipleSeparator = MULTIPLE_SEPARATOR;
    const rangeSeparator = RANGE_SEPARATOR;

    function parseDate(value: DateLike | null | undefined): Date | null {
        const date = cloneDate(value as DateLike);
        if (date) return date;
        if (typeof value !== 'string') return null;
        const input = value.trim();
        if (!input) return null;

        // Accept canonical ISO values regardless of the visible input order.
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return parseIsoDate(input);

        const values = input.split(formatSpec.separator);
        if (values.length !== 3 || values.some(part => !/^\d+$/.test(part.trim()))) return null;
        const numbers = values.map(part => Number(part.trim()));
        const dateParts: Record<string, number> = {};
        [...formatSpec.order].forEach((sign, index) => { dateParts[sign] = numbers[index]; });
        const year = autoFixDateYear(dateParts.y, currentYear);
        return createLocalDate(year, dateParts.m, dateParts.d);
    }

    function formatDate(value: DateLike | null | undefined): string {
        const date = value == null ? null : cloneDate(value);
        if (!date) return '';

        if (typeof options.displayFormat === 'function') {
            return options.displayFormat(new Date(date.getTime()));
        }

        const displayFormat = options.displayFormat;
        if (!displayFormat) return formatWithSpec(date, formatSpec);

        const pattern = parseDateFormatSpec(displayFormat);
        if (pattern) return formatWithSpec(date, pattern);

        const custom = options.formats?.[displayFormat];
        if (typeof custom === 'function') return custom(new Date(date.getTime()), displayFormat, locale);

        if (displayFormat === 'normalDate') {
            const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
            return `${date.getDate()} ${month}`;
        }
        if (displayFormat === 'dayOfMonth') return new Intl.NumberFormat(locale).format(date.getDate());

        const intlOptions = builtinFormatOptions(displayFormat) ?? custom as Intl.DateTimeFormatOptions | undefined ?? {
            timeZone: 'UTC',
            timeZoneName: 'short'
        };
        if (displayFormat === 'keyboardDateTime' || displayFormat === 'keyboardDateTime12h' || displayFormat === 'keyboardDateTime24h') {
            return new Intl.DateTimeFormat(locale, intlOptions).format(date).replace(/, /g, ' ');
        }
        return new Intl.DateTimeFormat(locale, intlOptions).format(date);
    }

    function join(values: readonly string[], selectionMode: DateInputMode = mode): string {
        const ordered = options.isRtl ? [...values].reverse() : values;
        return ordered.join(selectionMode === 'range' ? rangeSeparator : multipleSeparator);
    }

    function joinDates(values: readonly DateLike[], selectionMode: DateInputMode = mode): string {
        return join(values.map(value => formatDate(value)), selectionMode);
    }

    function empty(selectionMode: DateInputMode = mode): DateInputSelection {
        return selectionMode === 'single' ? null : [];
    }

    function parseInput(value: string | null | undefined, selectionMode: DateInputMode = mode): ParsedDateSelection {
        const input = value?.trim() ?? '';
        if (!input) return { valid: true, value: empty(selectionMode) };
        const parts = splitSelectionText(input, selectionMode);
        if (!parts || parts.length === 0 || (selectionMode === 'single' && parts.length !== 1) || (selectionMode === 'range' && parts.length > 2)) {
            return { valid: false, value: empty(selectionMode) };
        }
        const dates = parts.map(part => parseDate(part));
        if (dates.some(date => date === null)) return { valid: false, value: empty(selectionMode) };
        const parsed = dates as Date[];
        if (selectionMode === 'single') return { valid: true, value: parsed[0] };
        if (selectionMode === 'range') parsed.sort((left, right) => left.getTime() - right.getTime());
        return { valid: true, value: parsed };
    }

    function formatSelection(value: DateInputSelection, selectionMode: DateInputMode = mode): string {
        if (value == null) return '';
        if (!Array.isArray(value)) return formatDate(value);
        return joinDates(value, selectionMode);
    }

    const parserFormat = formatSpec.format;
    const placeholder = options.placeholder ?? (mode === 'range'
        ? join([parserFormat, parserFormat], 'range')
        : mode === 'multiple' ? `${parserFormat}, ...` : parserFormat);

    return {
        locale,
        order: formatSpec.order,
        separator: formatSpec.separator,
        parserFormat,
        placeholder,
        separators: { date: formatSpec.separator, multiple: multipleSeparator, range: rangeSeparator, join: mode === 'range' ? rangeSeparator : multipleSeparator },
        formatDate,
        parseDate,
        join,
        joinDates,
        parseInput,
        formatSelection,
        empty
    };
}
