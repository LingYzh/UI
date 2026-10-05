import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { RippleOptions } from './ripple';

export type TabValue = string | number;
export type TabItem = TabValue | { value?: TabValue; text?: string; id?: string; label?: string; disabled?: boolean; icon?: string };
export interface NormalizedTabItem { value: TabValue; text: string; disabled?: boolean; icon?: string; id?: string; label: string }
export function normalizeTabItems(items: readonly TabItem[]): NormalizedTabItem[] {
    return items.map((item, index) => typeof item === 'object'
        ? { ...item, value: item.value ?? item.id ?? index, text: item.text ?? item.label ?? String(item.value ?? item.id ?? index), label: item.text ?? item.label ?? String(item.value ?? item.id ?? index) }
        : { value: item, text: String(item), label: String(item) });
}
export function tabToken(value: TabValue): string { return `${typeof value === 'number' ? 'n' : 's'}-${encodeURIComponent(String(value))}`; }
export interface TabRegistration { id: string; element: Ref<HTMLButtonElement | undefined>; value: ComputedRef<TabValue>; disabled: ComputedRef<boolean> }
export interface UiTabsContext {
    prefix: ComputedRef<string>;
    model: Ref<TabValue | null | undefined>;
    ripple: ComputedRef<RippleOptions>;
    disabled: ComputedRef<boolean>;
    token: (value: TabValue) => string;
    mandatory: ComputedRef<boolean | 'force'>;
    activation: ComputedRef<'manual' | 'automatic'>;
    entries: TabRegistration[];
}
export const tabsKey: InjectionKey<UiTabsContext> = Symbol('ui-tabs');
export interface UiTabsWindowContext { prefix: ComputedRef<string>; model: ComputedRef<TabValue | null | undefined>; token: (value: TabValue) => string; entries: { id: string }[] }
export const tabsWindowKey: InjectionKey<UiTabsWindowContext> = Symbol('ui-tabs-window');
