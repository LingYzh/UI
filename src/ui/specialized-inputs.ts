export function clampNumber(value: number, min = -Infinity, max = Infinity): number {
    if (!Number.isFinite(value)) return Number.isFinite(min) ? min : Number.isFinite(max) ? max : 0;
    return Math.min(Math.max(value, min), max);
}

export function stepNumber(value: number | null | undefined, direction: -1 | 1, step = 1, min = -Infinity, max = Infinity, precision?: number): number {
    const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
    const base = value == null || !Number.isFinite(value) ? Number.isFinite(min) ? min : 0 : value;
    const digits = precision ?? Math.min(12, (String(safeStep).split('.')[1] ?? '').length);
    const scale = 10 ** Math.max(0, Math.min(12, digits));
    return clampNumber(Math.round((base + direction * safeStep) * scale) / scale, min, max);
}

export function parseNumberInput(text: string, min = -Infinity, max = Infinity): number | null | undefined {
    if (!text.trim()) return null;
    const value = Number(text);
    if (!Number.isFinite(value)) return undefined;
    return clampNumber(value, min, max);
}

export interface LocalizedNumberOptions {
    locale: string;
    grouping?: boolean | 'always' | 'auto' | 'min2';
    precision?: number;
    minFractionDigits?: number;
    decimalSeparator?: string;
    groupSeparator?: string;
}

function numberSeparators(options: LocalizedNumberOptions) {
    const parts = new Intl.NumberFormat(options.locale, { useGrouping: true }).formatToParts(12345.6);
    return {
        decimal: options.decimalSeparator ?? parts.find((part) => part.type === 'decimal')?.value ?? '.',
        group: options.groupSeparator ?? parts.find((part) => part.type === 'group')?.value ?? ',',
        minus: new Intl.NumberFormat(options.locale).formatToParts(-1).find((part) => part.type === 'minusSign')?.value ?? '-'
    };
}

export function formatLocalizedNumber(value: number, options: LocalizedNumberOptions): string {
    if (!Number.isFinite(value)) return String(value);
    try {
        const maxDigits = Math.max(0, Math.min(20, Math.floor(options.precision ?? 20)));
        const minDigits = Math.max(0, Math.min(maxDigits, Math.floor(options.minFractionDigits ?? 0)));
        const formatterOptions = {
            useGrouping: options.grouping ?? false,
            minimumFractionDigits: minDigits,
            maximumFractionDigits: maxDigits
        } as unknown as Intl.NumberFormatOptions;
        const formatted = new Intl.NumberFormat(options.locale, formatterOptions).formatToParts(value);
        const { decimal, group } = numberSeparators(options);
        return formatted.map((part) => part.type === 'decimal' ? decimal : part.type === 'group' ? group : part.value).join('');
    } catch {
        return String(value);
    }
}

export function parseLocalizedNumber(text: string, options: LocalizedNumberOptions, min = -Infinity, max = Infinity): number | null | undefined {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
        const { decimal, group, minus } = numberSeparators(options);
        const digitFormatter = new Intl.NumberFormat(options.locale, { useGrouping: false });
        const localizedDigits = new Map<string, string>();
        for (let digit = 0; digit <= 9; digit++) localizedDigits.set(digitFormatter.format(digit), String(digit));
        let normalized = trimmed.replace(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '');
        for (const [localized, ascii] of localizedDigits) normalized = normalized.replaceAll(localized, ascii);
        if (group) normalized = normalized.replaceAll(group, '');
        if (decimal !== '.') normalized = normalized.replaceAll(decimal, '.');
        if (minus !== '-') normalized = normalized.replaceAll(minus, '-');
        normalized = normalized.replace(/[−﹣－]/g, '-').replace(/\s/gu, '');
        const value = Number(normalized);
        return Number.isFinite(value) ? clampNumber(value, min, max) : undefined;
    } catch {
        return undefined;
    }
}

export function normalizeSlider(value: number, min = 0, max = 100, step = 0): number {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    if (!Number.isFinite(step) || step <= 0) return clampNumber(value, low, high);
    const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
    const snapped = low + Math.round((clampNumber(value, low, high) - low) / safeStep) * safeStep;
    const digits = Math.min(12, (String(safeStep).split('.')[1] ?? '').length);
    return clampNumber(Number(snapped.toFixed(digits)), low, high);
}

export interface SliderTick {
    value: number;
    position: number;
    label?: string;
}

export function sliderTicks(
    min: number,
    max: number,
    step: number,
    showTicks: boolean | 'always',
    ticks?: readonly number[] | Readonly<Record<string, string>>,
    labels?: readonly string[]
): SliderTick[] {
    if (!showTicks) return [];
    const position = (value: number) => max === min ? 0 : Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
    const labelAt = (index: number, value: number, fallback?: string) => labels?.[index] ?? fallback ?? String(value);
    if (Array.isArray(ticks)) {
        return ticks.map((value, index) => ({ value, position: position(value), label: labelAt(index, value) }));
    }
    if (ticks && typeof ticks === 'object') {
        return Object.entries(ticks).map(([rawValue, label], index) => {
            const value = Number(rawValue);
            return { value, position: position(value), label: labelAt(index, value, label) };
        }).filter((tick) => Number.isFinite(tick.value));
    }
    if (labels?.length) {
        return labels.map((label, index) => {
            const value = labels.length === 1 ? min : min + (max - min) * index / (labels.length - 1);
            return { value, position: position(value), label };
        });
    }
    if (!Number.isFinite(step) || step <= 0) return [];
    const count = (max - min) / step;
    if (!Number.isFinite(count) || count < 0) return [];
    return Array.from({ length: Math.floor(count + 1e-9) + 1 }, (_, index) => {
        const value = min + index * step;
        return { value, position: position(value) };
    });
}

export interface SliderKeyboardOptions {
    min?: number;
    max?: number;
    step?: number;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    rtl?: boolean;
    shiftKey?: boolean;
    ctrlKey?: boolean;
}

export function sliderKeyboardValue(value: number, key: string, options: SliderKeyboardOptions = {}): number | undefined {
    const min = options.min ?? 0;
    const max = options.max ?? 100;
    const step = Number.isFinite(options.step) && (options.step ?? 0) > 0 ? Number(options.step) : 0.1;
    let next = value;
    if (key === 'Home') next = min;
    else if (key === 'End') next = max;
    else if (key === 'PageUp' || key === 'PageDown') {
        const steps = (max - min) / step;
        const amount = steps > 100 ? steps / 10 : 10;
        // Match VSliderThumb: PageUp advances, PageDown retreats.
        next += (key === 'PageUp' ? 1 : -1) * step * amount;
    } else {
        const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (!arrowKeys.includes(key)) return undefined;
        const vertical = options.direction === 'vertical';
        const indexFromEnd = vertical !== Boolean(options.reverse);
        const rtl = Boolean(options.rtl);
        const increasing = vertical
            ? [rtl ? 'ArrowLeft' : 'ArrowRight', options.reverse ? 'ArrowDown' : 'ArrowUp']
            : indexFromEnd !== rtl ? ['ArrowLeft', 'ArrowUp'] : ['ArrowRight', 'ArrowUp'];
        const direction = increasing.includes(key) ? 1 : -1;
        const multipliers = options.step && options.step > 0 ? [1, 2, 3] : [1, 5, 10];
        const multiplier = options.shiftKey ? multipliers[2] : options.ctrlKey ? multipliers[1] : multipliers[0];
        const steps = (max - min) / step;
        if (direction === -1 && value === max && !options.shiftKey && !options.ctrlKey && !Number.isInteger(steps)) {
            next = value - steps % 1 * step;
        } else {
            next = value + direction * step * multiplier;
        }
    }
    return normalizeSlider(next, min, max, options.step ?? 0);
}

export function normalizeRange(values: readonly number[], min = 0, max = 100, step = 0, active?: 0 | 1): [number, number] {
    let start = normalizeSlider(values[0] ?? min, min, max, step);
    let end = normalizeSlider(values[1] ?? max, min, max, step);
    if (start > end) {
        if (active === 0) start = end;
        else if (active === 1) end = start;
        else [start, end] = [end, start];
    }
    return [start, end];
}

export interface FileValidationOptions {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
}
export interface FileValidationResult {
    accepted: File[];
    rejected: { file: File; reason: 'type' | 'size' | 'multiple' }[];
}
export function validateFiles(files: readonly File[], options: FileValidationOptions = {}): FileValidationResult {
    const accepted: File[] = [];
    const rejected: FileValidationResult['rejected'] = [];
    const patterns = (options.accept ?? '').split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
    for (const file of files) {
        const name = file.name.toLowerCase();
        const type = file.type.toLowerCase();
        const validType = !patterns.length || patterns.some((pattern) => pattern.startsWith('.') ? name.endsWith(pattern)
            : pattern.endsWith('/*') ? type.startsWith(pattern.slice(0, -1)) : type === pattern);
        if (!validType) rejected.push({ file, reason: 'type' });
        else if (options.maxSize !== undefined && file.size > options.maxSize) rejected.push({ file, reason: 'size' });
        else if (!options.multiple && accepted.length) rejected.push({ file, reason: 'multiple' });
        else accepted.push(file);
    }
    return { accepted, rejected };
}

const otpPatterns: Record<string, RegExp> = {
    numeric: /[0-9]/,
    alpha: /[a-zA-Z]/,
    alphanumeric: /[a-zA-Z0-9]/,
    'unicode-alpha': /\p{L}/u,
    'unicode-alphanumeric': /[\p{L}\p{N}]/u
};

export function resolveOtpPattern(pattern?: RegExp | string, numeric = false): RegExp | undefined {
    if (pattern instanceof RegExp) return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''));
    if (pattern) {
        if (otpPatterns[pattern]) return otpPatterns[pattern];
        try { return new RegExp(pattern, 'u'); }
        catch { return undefined; }
    }
    return numeric ? otpPatterns.numeric : undefined;
}

export function otpCharacters(text: string): string[] {
    const segmenter = Intl as typeof Intl & { Segmenter?: new (locale?: string | string[], options?: { granularity: 'grapheme' }) => { segment(input: string): Iterable<{ segment: string }> } };
    if (segmenter.Segmenter) return Array.from(new segmenter.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (entry) => entry.segment);
    return Array.from(text);
}

export function filterOtpText(text: string, pattern?: RegExp | string, numeric = false): string {
    const matcher = resolveOtpPattern(pattern, numeric);
    if (!matcher) return text;
    return otpCharacters(text).filter((character) => {
        matcher.lastIndex = 0;
        return matcher.test(character);
    }).join('');
}

export function normalizeOtp(text: string, length: number, numeric = false, pattern?: RegExp | string): string {
    const size = Math.max(0, Math.floor(length));
    return otpCharacters(filterOtpText(text, pattern, numeric)).slice(0, size).join('');
}

export function insertOtpText(current: string, index: number, inserted: string, length: number, pattern?: RegExp | string, numeric = false): string {
    const existing = otpCharacters(current);
    const incoming = otpCharacters(filterOtpText(inserted, pattern, numeric));
    const cursor = Math.max(0, Math.min(Math.floor(index), existing.length));
    const result = [
        ...existing.slice(0, cursor),
        ...incoming,
        ...existing.slice(cursor + incoming.length)
    ];
    return result.slice(0, Math.max(0, Math.floor(length))).join('');
}

export function otpArrowDelta(key: string, rtl = false): -1 | 1 | undefined {
    if (key === 'ArrowLeft') return rtl ? 1 : -1;
    if (key === 'ArrowRight') return rtl ? -1 : 1;
    return undefined;
}

export function normalizeRating(value: number, length = 5, precision = 1): number {
    const safePrecision = Number.isFinite(precision) && precision > 0 ? precision : 1;
    return clampNumber(Math.round(value / safePrecision) * safePrecision, 0, Math.max(0, length));
}

export interface HsvColor { h: number; s: number; v: number; }
export function hsvToHex({ h, s, v }: HsvColor): string {
    const hue = ((h % 360) + 360) % 360;
    const saturation = clampNumber(s, 0, 1);
    const brightness = clampNumber(v, 0, 1);
    const chroma = brightness * saturation;
    const segment = hue / 60;
    const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
    const [red, green, blue] = segment < 1 ? [chroma, secondary, 0] : segment < 2 ? [secondary, chroma, 0]
        : segment < 3 ? [0, chroma, secondary] : segment < 4 ? [0, secondary, chroma]
            : segment < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
    const offset = brightness - chroma;
    return `#${[red, green, blue].map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function hexToHsv(input: string): HsvColor | undefined {
    const hex = input.trim().replace(/^#/, '');
    if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return undefined;
    const full = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
    const [red, green, blue] = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
    const high = Math.max(red, green, blue);
    const low = Math.min(red, green, blue);
    const delta = high - low;
    let hue = 0;
    if (delta) {
        if (high === red) hue = ((green - blue) / delta) % 6;
        else if (high === green) hue = (blue - red) / delta + 2;
        else hue = (red - green) / delta + 4;
    }
    return { h: (hue * 60 + 360) % 360, s: high ? delta / high : 0, v: high };
}
