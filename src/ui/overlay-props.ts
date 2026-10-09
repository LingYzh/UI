import type { DimensionProps } from './dimensions';
import type { OverlayPositionProps } from './overlay-position';
import type { OverlayAppearanceProps } from './overlay-appearance';
import type { UiTransition } from './UiMaybeTransition.vue';
import type { OverlayContainerProps } from './overlay-container';

export type OverlayActivator = string | HTMLElement | null;
export type OverlayScrollStrategy = 'none' | 'locked' | 'block' | 'close' | 'reposition';
export interface OverlayProps extends DimensionProps, OverlayPositionProps, OverlayAppearanceProps, OverlayContainerProps {
    modelValue?: boolean;
    persistent?: boolean;
    closeOnBack?: boolean;
    disabled?: boolean;
    eager?: boolean;
    activator?: OverlayActivator;
    activatorProps?: Record<string, unknown>;
    contentProps?: Record<string, unknown>;
    contentClass?: string | string[] | Record<string, boolean>;
    fullscreen?: boolean;
    openOnClick?: boolean;
    openOnHover?: boolean;
    openOnFocus?: boolean;
    openDelay?: number;
    closeDelay?: number;
    scrollStrategy?: OverlayScrollStrategy;
    captureFocus?: boolean;
    retainFocus?: boolean;
    transition?: UiTransition;
}
