import type { CSSProperties } from 'vue';

export interface DimensionProps {
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    height?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
}

export function dimensionLength(value: string | number | undefined): string | undefined {
    if (value === undefined || value === '') return undefined;
    if (typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(value)) {
        return Number.isFinite(Number(value)) && Number(value) >= 0 ? `${value}px` : undefined;
    }
    return value;
}

export function dimensionStyles(props: DimensionProps): CSSProperties {
    return Object.fromEntries(['width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight'].map(name => [name, dimensionLength(props[name as keyof DimensionProps])]));
}
