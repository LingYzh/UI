import type { ComputedRef, InjectionKey } from 'vue';

export type GridSize = number | `${number}` | `${number}/${number}` | 'auto';
export type LayoutDensity = 'default' | 'comfortable' | 'compact';
export type FieldLayout = 'horizontal' | 'vertical';
export const formLayoutKey: InjectionKey<ComputedRef<FieldLayout>> = Symbol('ui-form-layout');

/** Fractions use their own denominator; numbers follow the parent row size. */
export function gridBasis(value: GridSize | undefined, offset = false): string | undefined {
    if (value === undefined) return undefined;
    if (value === 'auto') return offset ? '0px' : 'auto';
    if (!String(value).trim() || String(value).split('/').some(part => !part.trim())) return undefined;
    const parts = String(value).split('/');
    const numerator = Number(parts[0]);
    const denominator = parts.length === 2 ? Number(parts[1]) : undefined;
    if (!Number.isFinite(numerator) || numerator < 0 || (!offset && numerator === 0)
        || parts.length > 2 || (denominator !== undefined && (!Number.isFinite(denominator) || denominator <= 0 || numerator > denominator))) return undefined;
    const ratio = `${numerator} / ${denominator ?? 'var(--ui-grid-size, 12)'}`;
    return offset
        ? `calc((100% + var(--ui-grid-gap, 24px)) * ${ratio})`
        : `calc((100% + var(--ui-grid-gap, 24px)) * ${ratio} - var(--ui-grid-gap, 24px))`;
}
