import type { CSSProperties } from 'vue';

const semanticFallbacks: Record<string, string> = {
    primary: 'var(--primary, var(--accent-text))', secondary: 'var(--muted)',
    success: 'var(--green)', error: 'var(--red)', danger: 'var(--red)',
    warning: 'var(--amber)', info: 'var(--code-property, #315f8b)',
    surface: 'var(--surface)', background: 'var(--background)'
};

function rgbChannels(color: string): number[] | undefined {
    const hex = color.match(/^#([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i)?.[1];
    if (hex) {
        const full = hex.length <= 4 ? [...hex].map(value => value + value).join('') : hex;
        if (full.length === 8 && full.slice(6) !== 'ff' && full.slice(6) !== 'FF') return;
        return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16));
    }
    const match = color.match(/^rgba?\((.+)\)$/i);
    if (match) {
        const values = match[1].trim().split(/[\s,/]+/);
        if (values.length < 3 || values.length > 4) return;
        if (values[3] && Number.parseFloat(values[3]) / (values[3].endsWith('%') ? 100 : 1) < 1) return;
        const rgb = values.slice(0, 3).map(value => Number.parseFloat(value) * (value.endsWith('%') ? 2.55 : 1));
        if (rgb.every(value => Number.isFinite(value) && value >= 0 && value <= 255)) return rgb;
    }
    // The browser resolves named and hsl colors; variables remain inherited CSS values.
    if (typeof document !== 'undefined' && !/var\(|currentcolor|transparent/i.test(color) && CSS.supports('color', color)) {
        const context = document.createElement('canvas').getContext('2d');
        if (!context) return;
        context.fillStyle = color;
        const normalized = context.fillStyle;
        if (normalized.toLowerCase() !== color.toLowerCase()) return rgbChannels(normalized);
    }
}

/** Resolve semantic names without constructing invalid variables for raw CSS colors. */
export function themeColor(color?: string, surface = false): string | undefined {
    const value = color?.trim();
    if (!value) return;
    if (/^[a-z][a-z\d-]*$/i.test(value) && value !== 'currentColor' && value !== 'transparent') {
        if (surface && value === 'primary') return 'var(--ui-theme-primary-surface, var(--primary-surface, var(--accent)))';
        return `var(--ui-theme-${value}, ${semanticFallbacks[value] ?? value})`;
    }
    return value;
}

export function themeOnColor(color?: string, surface = false): string | undefined {
    const value = color?.trim();
    if (!value) return;
    if (/^[a-z][a-z\d-]*$/i.test(value) && value !== 'currentColor' && value !== 'transparent') {
        if (surface && value === 'primary') return 'var(--ui-theme-on-primary-surface, var(--on-primary-surface, #ffffff))';
        return `var(--ui-theme-on-${value}, ${semanticFallbacks[value] ? `var(--on-${value}, #ffffff)` : foreground(value) ?? 'var(--text)'})`;
    }
    const themeVariable = value.match(/^var\(\s*--(?:ui-theme-)?([a-z][a-z\d-]*)\s*\)$/i)?.[1];
    return themeVariable ? `var(--ui-theme-on-${themeVariable}, var(--on-${themeVariable}, var(--text)))` : foreground(value) ?? 'var(--text)';
}

export function buttonColorStyles(color?: string): CSSProperties {
    if (!color?.trim()) return {};
    // Every colored surface owns both pairs, preventing inherited primary fills on nested colors.
    return {
        '--ui-button-color': themeColor(color),
        '--ui-button-on-color': themeOnColor(color),
        '--ui-button-surface': themeColor(color, true),
        '--ui-button-on-surface': themeOnColor(color, true)
    } as CSSProperties;
}

function foreground(color: string): string | undefined {
    const rgb = rgbChannels(color);
    if (!rgb) return;
    const linear = rgb.map(channel => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
    const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    return (luminance + .05) / .05 > 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
}
