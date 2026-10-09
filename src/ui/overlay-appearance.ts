import type { CSSProperties } from 'vue';

export interface OverlayAppearanceProps {
    scrim?: boolean | string;
    opacity?: number | string;
    zIndex?: number | string;
}

/** Unspecified appearance retains the existing native backdrop color and alpha. */
export function overlayAppearanceStyles(props: OverlayAppearanceProps): CSSProperties {
    const opacity = props.opacity === undefined ? undefined : Number(props.opacity);
    return {
        '--ui-overlay-scrim-color': props.scrim === false ? 'transparent' : typeof props.scrim === 'string' ? props.scrim : props.opacity !== undefined ? '#262624' : undefined,
        '--ui-overlay-scrim-opacity': opacity !== undefined && Number.isFinite(opacity) ? Math.max(0, Math.min(1, opacity)) : undefined,
        zIndex: props.zIndex,
    };
}
