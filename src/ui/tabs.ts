import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { RippleOptions } from './ripple';
import type { ItemGroupState } from './item-group-state';
import type { ValueComparator } from './selection';

export type TabValue = unknown;
export type TabItem = string | number | boolean | null | {
    value?: unknown;
    text?: string;
    id?: string | number;
    label?: string;
    disabled?: boolean;
    icon?: string;
};
export interface NormalizedTabItem {
    value: unknown;
    text: string;
    disabled?: boolean;
    icon?: string;
    id?: string | number;
    label: string;
}

export function normalizeTabItems(items: readonly TabItem[]): NormalizedTabItem[] {
    return items.map((item, index) => {
        if (item !== null && typeof item === 'object') {
            const value = item.value !== undefined ? item.value : item.id !== undefined ? item.id : index;
            const label = item.text !== undefined ? item.text : item.label !== undefined ? item.label : String(value ?? '');
            return { ...item, value, text: label, label };
        }
        const label = String(item ?? '');
        return { value: item, text: label, label };
    });
}

const objectTokens = new WeakMap<object, number>();
let nextObjectToken = 0;

export function tabToken(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `s-${encodeURIComponent(value)}`;
    if (typeof value === 'number') return `n-${encodeURIComponent(String(value))}`;
    if (typeof value === 'boolean') return `b-${value}`;
    if (typeof value === 'bigint') return `bi-${value.toString()}`;
    if (typeof value === 'symbol') return `sy-${encodeURIComponent(value.description ?? '')}`;
    let token = objectTokens.get(value);
    if (token === undefined) {
        token = ++nextObjectToken;
        objectTokens.set(value, token);
    }
    return `o-${token}`;
}

export interface TabRegistration {
    id: string;
    element: Ref<HTMLButtonElement | HTMLAnchorElement | undefined>;
    value: ComputedRef<unknown>;
    disabled: ComputedRef<boolean>;
}

export interface UiTabsContext {
    prefix: ComputedRef<string>;
    focusedId: Ref<string | undefined>;
    model: Ref<unknown>;
    selection: ItemGroupState;
    multiple: ComputedRef<boolean>;
    readonly: ComputedRef<boolean>;
    ripple: ComputedRef<RippleOptions>;
    disabled: ComputedRef<boolean>;
    selectedClass: ComputedRef<string | undefined>;
    compare: (left: unknown, right: unknown) => boolean;
    token: (value: unknown) => string;
    mandatory: ComputedRef<boolean | 'force'>;
    activation: ComputedRef<'manual' | 'automatic'>;
    entries: TabRegistration[];
}

export const tabsKey: InjectionKey<UiTabsContext> = Symbol('ui-tabs');

export interface UiTabsWindowEntry {
    id: string;
    internalValue: string;
    marker: Ref<HTMLElement | undefined>;
    index: ComputedRef<number>;
    value: ComputedRef<unknown>;
    disabled: ComputedRef<boolean>;
}

export interface UiTabsWindowContext {
    prefix: ComputedRef<string>;
    model: ComputedRef<unknown>;
    compare: (left: unknown, right: unknown) => boolean;
    token: (value: unknown) => string;
    entries: UiTabsWindowEntry[];
    register: (id: string, marker: Ref<HTMLElement | undefined>, value: () => unknown, disabled: () => boolean) => UiTabsWindowEntry;
    unregister: (entry: UiTabsWindowEntry) => void;
    reorder: () => void;
}

export const tabsWindowKey: InjectionKey<UiTabsWindowContext> = Symbol('ui-tabs-window');
