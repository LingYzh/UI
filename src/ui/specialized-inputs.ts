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

export function normalizeSlider(value: number, min = 0, max = 100, step = 1): number {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
    const snapped = low + Math.round((clampNumber(value, low, high) - low) / safeStep) * safeStep;
    const digits = Math.min(12, (String(safeStep).split('.')[1] ?? '').length);
    return clampNumber(Number(snapped.toFixed(digits)), low, high);
}

export function normalizeRange(values: readonly number[], min = 0, max = 100, step = 1, active?: 0 | 1): [number, number] {
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

export function normalizeOtp(text: string, length: number, numeric = false): string {
    const size = Math.max(0, Math.floor(length));
    return (numeric ? text.replace(/\D/g, '') : text).slice(0, size);
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
