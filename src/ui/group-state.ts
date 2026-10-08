import { computed, inject, nextTick, provide, reactive, toValue, type InjectionKey, type MaybeRefOrGetter, type Ref } from 'vue';

export type GroupValue = string | number;
export interface GroupContext {
    values: GroupValue[];
    selected: Ref<GroupValue | GroupValue[] | null | undefined>;
    mandatory: boolean;
    multiple: boolean;
    disabled: boolean;
    register: (value: GroupValue) => () => void;
    isSelected: (value: GroupValue) => boolean;
    select: (value: GroupValue) => void;
    next: () => void;
    prev: () => void;
}

export const expansionKey: InjectionKey<GroupContext> = Symbol('u-expansion');
export const stepperKey: InjectionKey<GroupContext> = Symbol('u-stepper');
export const windowKey: InjectionKey<GroupContext> = Symbol('u-window');

export interface GroupOptions {
    mandatory?: MaybeRefOrGetter<boolean | undefined>;
    multiple?: MaybeRefOrGetter<boolean | undefined>;
    disabled?: MaybeRefOrGetter<boolean | undefined>;
}

export function createGroup(selected: Ref<GroupValue | GroupValue[] | null | undefined>, options: GroupOptions): GroupContext {
    const values = reactive<GroupValue[]>([]);
    const current = computed<GroupValue[]>(() => Array.isArray(selected.value) ? selected.value : selected.value == null ? [] : [selected.value]);
    // Controlled model props can lag until the parent render, so sibling setup registrations share one initial selection.
    let pendingInitialSelection: GroupValue | null | undefined;
    const isMandatory = (): boolean => toValue(options.mandatory) ?? false;
    const isMultiple = (): boolean => toValue(options.multiple) ?? false;
    const isDisabled = (): boolean => toValue(options.disabled) ?? false;
    function register(value: GroupValue): () => void {
        if (!values.includes(value)) values.push(value);
        if (isMandatory() && !current.value.length && !isDisabled()) {
            if (pendingInitialSelection === undefined) {
                pendingInitialSelection = value;
                selected.value = isMultiple() ? [value] : value;
                void nextTick(() => { pendingInitialSelection = undefined; });
            } else if (pendingInitialSelection === null || !values.includes(pendingInitialSelection)) {
                pendingInitialSelection = value;
                selected.value = isMultiple() ? [value] : value;
            }
        }
        return () => {
            const index = values.indexOf(value);
            if (index >= 0) values.splice(index, 1);
            const handledPendingInitial = pendingInitialSelection === value;
            if (handledPendingInitial) {
                const rest = current.value.filter((entry) => entry !== value && values.includes(entry));
                const multiple = isMultiple();
                if (rest.length) {
                    pendingInitialSelection = undefined;
                    selected.value = multiple ? rest : rest[0];
                } else {
                    const fallback = isMandatory() ? values[0] : undefined;
                    pendingInitialSelection = fallback ?? null;
                    selected.value = multiple ? (fallback === undefined ? [] : [fallback]) : fallback ?? null;
                }
            }
            if (!handledPendingInitial && current.value.includes(value)) {
                const rest = current.value.filter((entry) => entry !== value);
                const multiple = isMultiple();
                selected.value = multiple ? (rest.length ? rest : isMandatory() && values.length ? [values[0]] : []) : isMandatory() ? (values[0] ?? null) : null;
            }
        };
    }
    function select(value: GroupValue): void {
        if (isDisabled() || !values.includes(value)) return;
        const active = current.value.includes(value);
        if (isMultiple()) {
            if (active && isMandatory() && current.value.length <= 1) return;
            selected.value = active ? current.value.filter((entry) => entry !== value) : [...current.value, value];
        } else selected.value = active && !isMandatory() ? null : value;
    }
    function move(delta: number): void {
        if (isDisabled() || !values.length) return;
        const index = values.findIndex((entry) => current.value.includes(entry));
        const next = values[(index + delta + values.length) % values.length];
        selected.value = isMultiple() ? [next] : next;
    }
    return {
        values,
        selected,
        get mandatory() { return isMandatory(); },
        get multiple() { return isMultiple(); },
        get disabled() { return isDisabled(); },
        register,
        isSelected: (value) => current.value.includes(value),
        select,
        next: () => move(1),
        prev: () => move(-1)
    };
}

export function provideGroup(key: InjectionKey<GroupContext>, context: GroupContext): void { provide(key, context); }
export function useGroup(key: InjectionKey<GroupContext>): GroupContext | undefined { return inject(key, undefined); }
