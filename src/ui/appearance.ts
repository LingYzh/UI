import type { CSSProperties } from 'vue';

const radii: Record<string, string> = { '0': '0', sm: '2px', md: '4px', lg: '8px', xl: '24px', pill: '9999px', circle: '50%', shaped: '24px 0' };
const radiusCorners: Record<string, Array<keyof CSSProperties>> = {
    t: ['borderTopLeftRadius', 'borderTopRightRadius'], b: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    s: ['borderStartStartRadius', 'borderEndStartRadius'], e: ['borderStartEndRadius', 'borderEndEndRadius'],
    ts: ['borderStartStartRadius'], te: ['borderStartEndRadius'], bs: ['borderEndStartRadius'], be: ['borderEndEndRadius']
};

/** Explicit lengths are pixels/CSS lengths; omitted values keep each component's own radius. */
export function roundedStyles(value?: boolean | string | number): CSSProperties {
    if (value === undefined) return {};
    if (value === false || value === 0 || value === '0') return { borderRadius: 0 };
    if (value === true || value === '') return { borderRadius: 'var(--radius, 8px)' };
    if (typeof value === 'number') return { borderRadius: `${value}px` };
    if (value.includes('(') || value.split(/\s+/).every(token => /^\d*\.?\d+([a-z%]*)$/i.test(token))) return { borderRadius: /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value };
    const styles: CSSProperties = {};
    for (const token of value.split(/\s+/)) {
        if (radii[token]) { styles.borderRadius = radii[token]; continue; }
        const [side, size] = token.split('-');
        const radius = radii[size ?? 'md'];
        if (radius && radiusCorners[side]) for (const corner of radiusCorners[side]) Object.assign(styles, { [corner]: radius });
    }
    return styles;
}

const widths: Record<string, string> = { '0': '0', thin: '1px', sm: '1px', md: '2px', lg: '4px', xl: '8px' };
const borderEdges: Record<string, keyof CSSProperties> = { t: 'borderTopWidth', b: 'borderBottomWidth', s: 'borderInlineStartWidth', e: 'borderInlineEndWidth' };
export function borderStyles(value?: boolean | string | number): CSSProperties {
    if (value === undefined) return {};
    if (value === false || value === 0) return { borderWidth: 0 };
    const styles: CSSProperties = { borderStyle: 'solid', borderColor: 'var(--border)' };
    if (value === true || value === '') return { ...styles, borderWidth: '1px' };
    if (typeof value === 'number') return { ...styles, borderWidth: `${value}px` };
    for (const token of value.split(/\s+/)) {
        if (widths[token]) { styles.borderWidth = widths[token]; continue; }
        const [side, size] = token.split('-');
        if (borderEdges[side] && widths[size ?? 'thin']) {
            styles.borderWidth ??= 0;
            Object.assign(styles, { [borderEdges[side]]: widths[size ?? 'thin'] });
        }
    }
    return styles;
}
