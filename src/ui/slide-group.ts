import type { ComputedRef, InjectionKey } from 'vue';
import type { ValueComparator } from './selection';

export interface SlideGroupProps {
    disabled?: boolean;
    multiple?: boolean;
    mandatory?: boolean | 'force';
    max?: number;
    selectedClass?: string;
    valueComparator?: ValueComparator;
    direction?: 'horizontal' | 'vertical';
    centerActive?: boolean;
    scrollToActive?: boolean;
    scrollDistance?: number | string;
    scrollSnap?: 'start' | 'center' | 'end';
    showArrows?: boolean | 'always' | 'desktop' | 'mobile' | 'never';
    contentClass?: string;
}
export interface SlideItem {
    id: string;
    value: () => unknown;
    disabled: () => boolean;
    element: () => HTMLElement | undefined;
}
export interface SlideGroupContext {
    disabled: ComputedRef<boolean>;
    selectedClass: ComputedRef<string>;
    register: (item: SlideItem) => () => void;
    isSelected: (id: string) => boolean;
    select: (id: string, selected?: boolean) => void;
}
export const slideGroupKey: InjectionKey<SlideGroupContext> = Symbol('u-slide-group');
