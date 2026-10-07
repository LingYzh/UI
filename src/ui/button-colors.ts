import type { CSSProperties } from 'vue';

const semanticFallbacks: Record<string, string> = {
    primary: 'var(--accent)', secondary: 'var(--muted)',
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

export function buttonColorStyles(color?: string): CSSProperties {
    if (!color?.trim()) return {};
    const value = color.trim();
    if (/^[a-z][a-z\d-]*$/i.test(value) && value !== 'currentColor' && value !== 'transparent') {
        return {
            '--ui-button-color': `var(--ui-theme-${value}, ${semanticFallbacks[value] ?? value})`,
            '--ui-button-on-color': `var(--ui-theme-on-${value}, ${semanticFallbacks[value] ? `var(--on-${value}, #ffffff)` : foreground(value) ?? 'var(--text)'})`
        } as CSSProperties;
    }
    const themeVariable = value.match(/^var\(\s*--ui-theme-([a-z][a-z\d-]*)\s*\)$/i)?.[1];
    return { '--ui-button-color': value, '--ui-button-on-color': themeVariable ? `var(--ui-theme-on-${themeVariable}, var(--text))` : foreground(value) ?? 'var(--text)' } as CSSProperties;
}

function foreground(color: string): string | undefined {
    const rgb = rgbChannels(color);
    if (!rgb) return;
    const linear = rgb.map(channel => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
    const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    return (luminance + .05) / .05 > 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
}
