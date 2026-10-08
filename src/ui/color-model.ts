export interface HSVA {
    h: number;
    s: number;
    v: number;
    a: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface HSV {
    h: number;
    s: number;
    v: number;
    a?: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
    a?: number;
}

export type ColorModelObject = RGB | HSV | HSL;
export type ColorModelInput = string | ColorModelObject | null | undefined;
export type ColorModelOutput = string | ColorModelObject | null | undefined;
export type ColorModelFormat = 'hex' | 'rgb' | 'hsv' | 'hsl';
export type ColorChannelScale = 'rgb' | 'unit';

type MutableHSVA = { h: number; s: number; v: number; a: number };
type ColorFunction = 'rgb' | 'rgba' | 'hsl' | 'hsla';

const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function wrapHue(value: number): number | undefined {
    if (!Number.isFinite(value)) return undefined;
    return ((value % 360) + 360) % 360;
}

function finiteNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Converts RGB byte channels and normalized unit channels without accepting non-finite values. */
export function convertChannel(value: number, from: ColorChannelScale, to: ColorChannelScale): number | undefined {
    if (!Number.isFinite(value)) return undefined;
    const sourceMax = from === 'rgb' ? 255 : 1;
    const normalized = clamp(value, 0, sourceMax) / sourceMax;
    return to === 'rgb' ? normalized * 255 : normalized;
}

function parseNumericToken(token: string): { value: number; unit: string } | undefined {
    const match = token.trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/i);
    if (!match) return undefined;
    const value = Number(match[1]);
    if (!Number.isFinite(value)) return undefined;
    return { value, unit: (match[2] ?? '').toLowerCase() };
}

function parseHue(token: string): number | undefined {
    const parsed = parseNumericToken(token);
    if (!parsed) return undefined;
    let degrees: number;
    switch (parsed.unit) {
        case '':
        case 'deg':
            degrees = parsed.value;
            break;
        case 'grad':
            degrees = parsed.value * 0.9;
            break;
        case 'rad':
            degrees = parsed.value * (180 / Math.PI);
            break;
        case 'turn':
            degrees = parsed.value * 360;
            break;
        default:
            return undefined;
    }
    return wrapHue(degrees);
}

function parseUnitValue(token: string, cssPercent = false): number | undefined {
    const parsed = parseNumericToken(token);
    if (!parsed) return undefined;
    if (parsed.unit === '%') return clamp(parsed.value / 100, 0, 1);
    if (parsed.unit !== '') return undefined;
    return clamp(cssPercent ? parsed.value / 100 : parsed.value, 0, 1);
}

function parseRgbValue(token: string): number | undefined {
    const parsed = parseNumericToken(token);
    if (!parsed) return undefined;
    if (parsed.unit === '%') return clamp(parsed.value / 100, 0, 1) * 255;
    if (parsed.unit !== '') return undefined;
    return clamp(parsed.value, 0, 255);
}

function parseAlpha(token: string): number | undefined {
    return parseUnitValue(token);
}

function parseFunctionValues(body: string): { channels: string[]; alpha?: string } | undefined {
    const slashParts = body.split('/');
    if (slashParts.length > 2) return undefined;
    const channelText = slashParts[0].trim();
    const channels = channelText.includes(',')
        ? channelText.split(',').map(part => part.trim())
        : channelText.split(/\s+/).filter(Boolean);
    let alpha = slashParts[1]?.trim();
    if (channels.length === 4 && alpha === undefined) alpha = channels.pop() ?? '';
    if (channels.length !== 3 || (slashParts.length === 2 && !alpha)) return undefined;
    return { channels, alpha };
}

function normalizeHsva(value: unknown): MutableHSVA | undefined {
    if (!isRecord(value)) return undefined;
    const h = finiteNumber(value.h);
    const s = finiteNumber(value.s);
    const v = finiteNumber(value.v);
    const a = finiteNumber(value.a);
    if (h === undefined || s === undefined || v === undefined || a === undefined) return undefined;
    const wrappedHue = wrapHue(h);
    if (wrappedHue === undefined) return undefined;
    return {
        h: wrappedHue,
        s: clamp(s, 0, 1),
        v: clamp(v, 0, 1),
        a: clamp(a, 0, 1)
    };
}

function rgbToHsva(color: RGB): MutableHSVA | undefined {
    const r = finiteNumber(color.r);
    const g = finiteNumber(color.g);
    const b = finiteNumber(color.b);
    const alpha = color.a === undefined ? 1 : finiteNumber(color.a);
    if (r === undefined || g === undefined || b === undefined || alpha === undefined) return undefined;
    const red = clamp(r, 0, 255) / 255;
    const green = clamp(g, 0, 255) / 255;
    const blue = clamp(b, 0, 255) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;
    if (delta > 0) {
        if (max === red) hue = 60 * (((green - blue) / delta) % 6);
        else if (max === green) hue = 60 * ((blue - red) / delta + 2);
        else hue = 60 * ((red - green) / delta + 4);
    }
    return {
        h: wrapHue(hue) ?? 0,
        s: max === 0 ? 0 : delta / max,
        v: max,
        a: clamp(alpha, 0, 1)
    };
}

function hslToHsva(color: HSL): MutableHSVA | undefined {
    const h = finiteNumber(color.h);
    const s = finiteNumber(color.s);
    const l = finiteNumber(color.l);
    const alpha = color.a === undefined ? 1 : finiteNumber(color.a);
    if (h === undefined || s === undefined || l === undefined || alpha === undefined) return undefined;
    const hue = wrapHue(h);
    if (hue === undefined) return undefined;
    const saturation = clamp(s, 0, 1);
    const lightness = clamp(l, 0, 1);
    const value = lightness + saturation * Math.min(lightness, 1 - lightness);
    const valueSaturation = value === 0 ? 0 : 2 - (2 * lightness) / value;
    return { h: hue, s: valueSaturation, v: value, a: clamp(alpha, 0, 1) };
}

/** Converts a normalized HSVA color to RGB byte channels. */
export function hsvToRgb(color: HSVA): RGB & { a: number } | undefined {
    const hsva = normalizeHsva(color);
    if (!hsva) return undefined;
    const chroma = hsva.v * hsva.s;
    const sector = hsva.h / 60;
    const x = chroma * (1 - Math.abs((sector % 2) - 1));
    const m = hsva.v - chroma;
    let red = 0;
    let green = 0;
    let blue = 0;
    if (sector < 1) [red, green] = [chroma, x];
    else if (sector < 2) [red, green] = [x, chroma];
    else if (sector < 3) [green, blue] = [chroma, x];
    else if (sector < 4) [green, blue] = [x, chroma];
    else if (sector < 5) [red, blue] = [x, chroma];
    else [red, blue] = [chroma, x];
    return {
        r: Math.round((red + m) * 255),
        g: Math.round((green + m) * 255),
        b: Math.round((blue + m) * 255),
        a: hsva.a
    };
}

/** Converts RGB byte channels to normalized HSVA. */
export function rgbToHsv(color: RGB): HSVA | undefined {
    return rgbToHsva(color);
}

/** Converts normalized HSVA to HSL while preserving alpha. */
export function hsvToHsl(color: HSVA): HSL & { a: number } | undefined {
    const hsva = normalizeHsva(color);
    if (!hsva) return undefined;
    const lightness = hsva.v - (hsva.v * hsva.s) / 2;
    const saturation = lightness === 0 || lightness === 1
        ? 0
        : (hsva.v - lightness) / Math.min(lightness, 1 - lightness);
    return { h: hsva.h, s: saturation, l: lightness, a: hsva.a };
}

/** Converts normalized HSL to normalized HSVA while preserving alpha. */
export function hslToHsv(color: HSL): HSVA | undefined {
    return hslToHsva(color);
}

function parseHex(value: string): MutableHSVA | undefined {
    if (!/^#[\da-f]{3}(?:[\da-f])?$|^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value)) return undefined;
    let digits = value.slice(1);
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map(digit => `${digit}${digit}`).join('');
    const r = Number.parseInt(digits.slice(0, 2), 16);
    const g = Number.parseInt(digits.slice(2, 4), 16);
    const b = Number.parseInt(digits.slice(4, 6), 16);
    const a = digits.length === 8 ? Number.parseInt(digits.slice(6, 8), 16) / 255 : 1;
    return rgbToHsva({ r, g, b, a });
}

function parseCssFunction(value: string): MutableHSVA | undefined {
    const match = value.match(/^(rgba?|hsla?)\(([\s\S]*)\)$/i);
    if (!match) return undefined;
    const fn = match[1].toLowerCase() as ColorFunction;
    const values = parseFunctionValues(match[2]);
    if (!values) return undefined;
    const alpha = values.alpha === undefined ? 1 : parseAlpha(values.alpha);
    if (alpha === undefined) return undefined;

    if (fn === 'rgb' || fn === 'rgba') {
        const [rToken, gToken, bToken] = values.channels;
        const r = parseRgbValue(rToken);
        const g = parseRgbValue(gToken);
        const b = parseRgbValue(bToken);
        if (r === undefined || g === undefined || b === undefined) return undefined;
        return rgbToHsva({ r, g, b, a: alpha });
    }

    const [hToken, sToken, lToken] = values.channels;
    const h = parseHue(hToken);
    const s = parseUnitValue(sToken, true);
    const l = parseUnitValue(lToken, true);
    if (h === undefined || s === undefined || l === undefined) return undefined;
    return hslToHsva({ h, s, l, a: alpha });
}

function parseObject(value: unknown): MutableHSVA | undefined {
    if (!isRecord(value)) return undefined;
    if ('r' in value || 'g' in value || 'b' in value) {
        if (!('r' in value && 'g' in value && 'b' in value)) return undefined;
        return rgbToHsva(value as unknown as RGB);
    }
    if ('l' in value) {
        if (!('h' in value && 's' in value && 'l' in value)) return undefined;
        return hslToHsva(value as unknown as HSL);
    }
    if ('v' in value) {
        if (!('h' in value && 's' in value && 'v' in value)) return undefined;
        const h = finiteNumber(value.h);
        const s = finiteNumber(value.s);
        const v = finiteNumber(value.v);
        const a = value.a === undefined ? 1 : finiteNumber(value.a);
        if (h === undefined || s === undefined || v === undefined || a === undefined) return undefined;
        const hue = wrapHue(h);
        if (hue === undefined) return undefined;
        return { h: hue, s: clamp(s, 0, 1), v: clamp(v, 0, 1), a: clamp(a, 0, 1) };
    }
    return undefined;
}

/** Parses supported strings and RGB/HSV/HSL objects into a normalized HSVA value.
 * Null, undefined, and blank strings represent an empty color; malformed values return undefined.
 */
export function parseColorModel(input: unknown): HSVA | null | undefined {
    if (input == null) return null;
    if (typeof input === 'string') {
        const value = input.trim();
        if (!value) return null;
        const parsed = value.startsWith('#') ? parseHex(value) : parseCssFunction(value);
        return parsed ? { ...parsed } : undefined;
    }
    const parsed = parseObject(input);
    return parsed ? { ...parsed } : undefined;
}

function colorFormat(input: ColorModelInput): ColorModelFormat {
    if (typeof input === 'string') {
        const value = input.trim().toLowerCase();
        if (/^rgba?\(/.test(value)) return 'rgb';
        if (/^hsla?\(/.test(value)) return 'hsl';
        return 'hex';
    }
    if (input == null) return 'hex';
    if ('r' in input || 'g' in input || 'b' in input) return 'rgb';
    if ('l' in input) return 'hsl';
    return 'hsv';
}

function hasExplicitAlpha(input: ColorModelInput): boolean {
    if (typeof input === 'string') {
        const value = input.trim();
        if (value.startsWith('#')) return value.length === 5 || value.length === 9;
        const match = value.match(/^(?:rgba?|hsla?)\(([\s\S]*)\)$/i);
        if (!match) return false;
        const parts = parseFunctionValues(match[1]);
        return parts?.alpha !== undefined;
    }
    return isRecord(input) && Object.hasOwn(input, 'a') && input.a !== undefined;
}

function toHexByte(value: number): string {
    return Math.round(value).toString(16).padStart(2, '0').toUpperCase();
}

/** Serializes HSVA in the source string family or the same object channel family. */
export function serializeColorModel(color: HSVA | null | undefined, source?: ColorModelInput): ColorModelOutput {
    if (color == null) return color;
    const hsva = normalizeHsva(color);
    if (!hsva) return undefined;
    const format = colorFormat(source);
    const cssString = typeof source === 'string' && format !== 'hex';
    const includeAlpha = cssString
        ? hsva.a < 1
        : hasExplicitAlpha(source) || hsva.a !== 1;

    if (format === 'hex') {
        const rgb = hsvToRgb(hsva);
        if (!rgb) return undefined;
        const channels = `${toHexByte(rgb.r)}${toHexByte(rgb.g)}${toHexByte(rgb.b)}`;
        return `#${channels}${includeAlpha ? toHexByte(hsva.a * 255) : ''}`;
    }

    if (format === 'rgb') {
        const rgb = hsvToRgb(hsva);
        if (!rgb) return undefined;
        if (typeof source !== 'string') return includeAlpha ? rgb : { r: rgb.r, g: rgb.g, b: rgb.b };
        return `rgb(${rgb.r} ${rgb.g} ${rgb.b}${includeAlpha ? ` / ${hsva.a}` : ''})`;
    }
    if (format === 'hsl') {
        const hsl = hsvToHsl(hsva);
        if (!hsl) return undefined;
        if (typeof source !== 'string') return includeAlpha ? hsl : { h: hsl.h, s: hsl.s, l: hsl.l };
        return `hsl(${hsl.h} ${Math.round(hsl.s * 100)} ${Math.round(hsl.l * 100)}${includeAlpha ? ` / ${hsva.a}` : ''})`;
    }
    return includeAlpha ? hsva : { h: hsva.h, s: hsva.s, v: hsva.v };
}
