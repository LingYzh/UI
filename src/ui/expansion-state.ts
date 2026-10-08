import type { InjectionKey } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { ItemGroupRegistration, ItemGroupState, ItemGroupStateEntry } from './item-group-state';
import type { ValueComparator } from './selection';

export interface ExpansionPanelContext {
    value: unknown;
    open: () => boolean;
    toggle: () => void;
    disabled: () => boolean;
    readonly?: () => boolean;
    eager?: () => boolean | undefined;
    focusable?: () => boolean | undefined;
    static?: () => boolean | undefined;
    titleId: string;
    textId: string;
}
export const expansionPanelKey: InjectionKey<ExpansionPanelContext> = Symbol('u-expansion-panel');

export interface ExpansionGroupContext extends ItemGroupState {
    selected: Ref<unknown>;
    disabled: () => boolean;
    readonly: () => boolean;
    multiple: () => boolean;
    mandatory: () => boolean | 'force';
    max: () => number | undefined;
    valueComparator: () => ValueComparator | undefined;
    selectedClass: () => string | undefined;
    eager?: () => boolean | undefined;
    focusable?: () => boolean | undefined;
    static?: () => boolean | undefined;
    registerItem: (entry: ItemGroupStateEntry) => ItemGroupRegistration;
    unregisterItem: (id: string) => void;
    selectValue: (value: unknown, selected?: boolean) => void;
    isValueSelected: (value: unknown) => boolean;
    order: string[];
    values: ComputedRef<unknown[]>;
}

export const expansionGroupKey: InjectionKey<ExpansionGroupContext> = Symbol('u-expansion-group');
