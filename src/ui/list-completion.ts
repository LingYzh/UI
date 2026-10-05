import { inject, provide, reactive, type InjectionKey } from 'vue';

export type ListValue = string | number | boolean | null;
export type ListContext = {
    nav: () => boolean;
    selected: () => ListValue[];
    activated: () => ListValue[];
    opened: () => ListValue[];
    select: (value: ListValue) => void;
    activate: (value: ListValue) => void;
    toggleOpen: (value: ListValue) => void;
    focus: (direction: number | 'first' | 'last', current?: HTMLElement) => void;
};
export const listKey: InjectionKey<ListContext> = Symbol('ui-list');
export function provideList(context: ListContext) { provide(listKey, context); }
export function useList() { return inject(listKey, null); }

export function getItemField(item: unknown, field: string | ((item: unknown) => unknown), fallback: unknown) {
    if (typeof field === 'function') return field(item);
    if (item && typeof item === 'object') {
        const value = field.split('.').reduce<unknown>((source, key) => source && typeof source === 'object' ? (source as Record<string, unknown>)[key] : undefined, item);
        return value === undefined ? fallback : value;
    }
    return fallback;
}

export function toggleListValue(current: ListValue[], value: ListValue, multiple: boolean, mandatory: boolean): ListValue[] {
    const next = multiple ? current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value] : current.includes(value) ? [] : [value];
    return mandatory && !next.length ? current : next;
}

export function treeSelectionState(values: ListValue[], selected: ListValue[]): 'checked' | 'mixed' | 'unchecked' {
    const count = values.filter((value) => selected.includes(value)).length;
    return count === values.length && values.length > 0 ? 'checked' : count ? 'mixed' : 'unchecked';
}

export function toggleTreeValues(current: ListValue[], values: ListValue[], multiple: boolean, mandatory: boolean): ListValue[] {
    const checked = values.every((value) => current.includes(value));
    const next = multiple ? checked ? current.filter((value) => !values.includes(value)) : [...new Set([...current, ...values])] : checked ? [] : values.slice(0, 1);
    return mandatory && !next.length ? current : next;
}

export function makeListContext(options: {
    nav: () => boolean;
    root: () => HTMLElement | undefined;
    selected: () => ListValue[];
    activated: () => ListValue[];
    opened: () => ListValue[];
    select: (value: ListValue) => void;
    activate: (value: ListValue) => void;
    toggleOpen: (value: ListValue) => void;
}) {
    const focus = (direction: number | 'first' | 'last', current?: HTMLElement) => {
        const nodes = [...(options.root()?.querySelectorAll<HTMLElement>('[data-ui-list-item]:not([aria-disabled="true"])') ?? [])].filter((node) => node.offsetParent !== null);
        if (!nodes.length) return;
        const index = current ? nodes.indexOf(current) : -1;
        const next = direction === 'first' ? 0 : direction === 'last' ? nodes.length - 1 : (index + direction + nodes.length) % nodes.length;
        nodes[next]?.focus();
    };
    return reactive({ ...options, focus }) as ListContext;
}
