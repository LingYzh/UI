import { inject, provide, reactive, type InjectionKey, type Ref } from 'vue';
import { defaultValueComparator, type ValueComparator } from './selection';

export type ListValue = unknown;
export type ListNavigationStrategy = 'focus' | 'track';
export type ListRegistrationKind = 'item' | 'group';

export interface ListRegistrationInput {
    value: ListValue;
    parent?: ListValue;
    kind: ListRegistrationKind;
    disabled: () => boolean;
    getElement: () => HTMLElement | undefined;
    getContainer?: () => HTMLElement | undefined;
}

export interface ListRegistrationView {
    id: string;
    value: ListValue;
    parent?: ListValue;
    kind: ListRegistrationKind;
    disabled: boolean;
    element?: HTMLElement;
    container?: HTMLElement;
}

export type ListContext = {
    nav: () => boolean;
    navigationStrategy: () => ListNavigationStrategy;
    selected: () => ListValue[];
    activated: () => ListValue[];
    opened: () => ListValue[];
    isSelected: (value: ListValue) => boolean;
    isActive: (value: ListValue) => boolean;
    isOpen: (value: ListValue) => boolean;
    trackedId?: () => string | undefined;
    select: (value: ListValue, on?: boolean, event?: Event) => void;
    activate: (value: ListValue, on?: boolean, event?: Event) => void;
    toggleOpen: (value: ListValue, on?: boolean, event?: Event) => void;
    focus: (direction: number | 'first' | 'last', current?: HTMLElement) => void;
    focusAt: (index: number) => void;
    setNavigationIndexFor: (element?: HTMLElement) => void;
    disabled: () => boolean;
    readonly: () => boolean;
    register?: (registration: ListRegistrationInput) => () => void;
    refreshRegistrations?: () => void;
};

export const listParentKey: InjectionKey<Ref<ListValue | undefined>> = Symbol('ui-list-parent');
export const listKey: InjectionKey<ListContext> = Symbol('ui-list');

export function provideList(context: ListContext): void {
    provide(listKey, context);
}

export function useList(): ListContext | null {
    return inject(listKey, null);
}

export function getItemField(item: unknown, field: string | ((item: unknown) => unknown), fallback: unknown): unknown {
    if (typeof field === 'function') return field(item);
    if (item && typeof item === 'object') {
        const value = field.split('.').reduce<unknown>((source, key) => source && typeof source === 'object'
            ? (source as Record<string, unknown>)[key]
            : undefined, item);
        return value === undefined ? fallback : value;
    }
    return fallback;
}

export function canonicalizeListValue(value: ListValue, values: readonly ListValue[], comparator: ValueComparator = defaultValueComparator): ListValue {
    const index = values.findIndex((candidate) => comparator(candidate, value));
    return index < 0 ? value : values[index];
}

export function canonicalizeListValues(values: readonly ListValue[], knownValues: readonly ListValue[], comparator: ValueComparator = defaultValueComparator): ListValue[] {
    return values.map((value) => canonicalizeListValue(value, knownValues, comparator));
}

export function toggleListValue(current: ListValue[], value: ListValue, multiple: boolean, mandatory: boolean, comparator: ValueComparator = defaultValueComparator): ListValue[] {
    const selected = current.some((entry) => comparator(entry, value));
    const next = multiple
        ? selected ? current.filter((entry) => !comparator(entry, value)) : [...current, value]
        : selected ? [] : [value];
    return mandatory && !next.length ? current : next;
}

export function treeSelectionState(values: ListValue[], selected: ListValue[], comparator: ValueComparator = defaultValueComparator): 'checked' | 'mixed' | 'unchecked' {
    const count = values.filter((value) => selected.some((entry) => comparator(entry, value))).length;
    return count === values.length && values.length > 0 ? 'checked' : count ? 'mixed' : 'unchecked';
}

export function toggleTreeValues(current: ListValue[], values: ListValue[], multiple: boolean, mandatory: boolean, comparator: ValueComparator = defaultValueComparator): ListValue[] {
    const checked = values.every((value) => current.some((entry) => comparator(entry, value)));
    const next = multiple
        ? checked ? current.filter((entry) => !values.some((value) => comparator(entry, value))) : [...current, ...values.filter((value) => !current.some((entry) => comparator(entry, value)))]
        : checked ? [] : values.slice(0, 1);
    return mandatory && !next.length ? current : next;
}

function isVisibleRow(node: HTMLElement, root: HTMLElement): boolean {
    if (!node.id || node.getAttribute('aria-disabled') === 'true' || node.hasAttribute('disabled')) return false;
    let current: HTMLElement | null = node;
    while (current && current !== root) {
        if (current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true' || current.hidden) return false;
        const style = current.ownerDocument.defaultView?.getComputedStyle(current);
        if (style?.display === 'none' || style?.visibility === 'hidden') return false;
        current = current.parentElement;
    }
    return node.getClientRects().length > 0;
}

export function makeListContext(options: {
    nav: () => boolean;
    navigationStrategy: () => ListNavigationStrategy;
    root: () => HTMLElement | undefined;
    navigationIndex: () => number;
    setNavigationIndex: (index: number) => void;
    selected: () => ListValue[];
    activated: () => ListValue[];
    opened: () => ListValue[];
    isSelected: (value: ListValue) => boolean;
    isActive: (value: ListValue) => boolean;
    isOpen: (value: ListValue) => boolean;
    trackedId?: () => string | undefined;
    select: (value: ListValue, on?: boolean, event?: Event) => void;
    activate: (value: ListValue, on?: boolean, event?: Event) => void;
    toggleOpen: (value: ListValue, on?: boolean, event?: Event) => void;
    disabled: () => boolean;
    readonly: () => boolean;
    register?: (registration: ListRegistrationInput) => () => void;
    refreshRegistrations?: () => void;
}): ListContext {
    function getNavigableItems(): HTMLElement[] {
        const root = options.root();
        if (!root) return [];
        return [...root.querySelectorAll<HTMLElement>('[data-ui-list-navigation-item]')]
            .filter((node) => node.closest('.ui-list') === root && isVisibleRow(node, root));
    }

    function setNavigationIndexFor(element?: HTMLElement): void {
        if (!element) return;
        const row = element.matches('[data-ui-list-navigation-item]')
            ? element
            : element.closest<HTMLElement>('[data-ui-list-navigation-item]');
        if (!row) return;
        const index = getNavigableItems().indexOf(row);
        if (index >= 0) options.setNavigationIndex(index);
    }

    function focusAt(index: number): void {
        if (options.navigationStrategy() === 'track') {
            options.setNavigationIndex(index);
            options.root()?.focus({ preventScroll: true });
        } else getNavigableItems()[index]?.focus();
    }

    function focus(direction: number | 'first' | 'last', current?: HTMLElement): void {
        const items = getNavigableItems();
        if (!items.length) return;
        const row = current?.matches('[data-ui-list-navigation-item]')
            ? current
            : current?.closest<HTMLElement>('[data-ui-list-navigation-item]');
        const index = options.navigationStrategy() === 'track' ? options.navigationIndex() : row ? items.indexOf(row) : -1;
        const next = direction === 'first'
            ? 0
            : direction === 'last'
                ? items.length - 1
                : (index + direction + items.length) % items.length;
        focusAt(next);
    }

    return reactive({
        ...options,
        focus,
        focusAt,
        setNavigationIndexFor
    }) as ListContext;
}
