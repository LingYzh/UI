import type { CSSProperties } from 'vue';

export interface ControlSizing {
    /** Numbers are pixels; strings are CSS lengths. */
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    /** Content width, no flex growth; useful in toolbars. */
    inline?: boolean;
}

function length(value: string | number | undefined): string | undefined {
    return typeof value === 'number' ? Number.isFinite(value) && value >= 0 ? `${value}px` : undefined : value;
}

export function controlSizeStyles(props: ControlSizing): CSSProperties {
    return { width: length(props.width), minWidth: length(props.minWidth), maxWidth: length(props.maxWidth) };
}
