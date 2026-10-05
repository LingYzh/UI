import type { InjectionKey, Ref } from 'vue';
import type { ValueComparator } from './selection';

export interface SelectionGroupContext {
    model: Ref<unknown>;
    multiple: Ref<boolean>;
    mandatory: Ref<boolean>;
    max: Ref<number | undefined>;
    disabled: Ref<boolean>;
    readonly: Ref<boolean>;
    name: string;
    comparator: Ref<ValueComparator | undefined>;
    toggle: (value: unknown) => void;
    selected: (value: unknown) => boolean;
}
export const selectionGroupKey: InjectionKey<SelectionGroupContext> = Symbol('u-selection-group');
