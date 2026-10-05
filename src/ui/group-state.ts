import { computed, inject, provide, reactive, type InjectionKey, type Ref } from 'vue';

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

export function createGroup(selected: Ref<GroupValue | GroupValue[] | null | undefined>, options: { mandatory?: boolean; multiple?: boolean; disabled?: boolean }): GroupContext {
    const values = reactive<GroupValue[]>([]);
    const current = computed<GroupValue[]>(() => Array.isArray(selected.value) ? selected.value : selected.value == null ? [] : [selected.value]);
    function register(value: GroupValue): () => void {
        if (!values.includes(value)) values.push(value);
        if (options.mandatory && !current.value.length && !options.disabled) selected.value = options.multiple ? [value] : value;
        return () => {
            const index = values.indexOf(value);
            if (index >= 0) values.splice(index, 1);
            if (current.value.includes(value)) {
                const rest = current.value.filter((entry) => entry !== value);
                selected.value = options.multiple ? (rest.length ? rest : options.mandatory && values.length ? [values[0]] : []) : options.mandatory ? (values[0] ?? null) : null;
            }
        };
    }
    function select(value: GroupValue): void {
        if (options.disabled || !values.includes(value)) return;
        const active = current.value.includes(value);
        if (options.multiple) {
            if (active && options.mandatory && current.value.length <= 1) return;
            selected.value = active ? current.value.filter((entry) => entry !== value) : [...current.value, value];
        } else selected.value = active && !options.mandatory ? null : value;
    }
    function move(delta: number): void {
        if (options.disabled || !values.length) return;
        const index = values.findIndex((entry) => current.value.includes(entry));
        const next = values[(index + delta + values.length) % values.length];
        selected.value = options.multiple ? [next] : next;
    }
    return { values, selected, mandatory: !!options.mandatory, multiple: !!options.multiple, disabled: !!options.disabled, register, isSelected: (value) => current.value.includes(value), select, next: () => move(1), prev: () => move(-1) };
}

export function provideGroup(key: InjectionKey<GroupContext>, context: GroupContext): void { provide(key, context); }
export function useGroup(key: InjectionKey<GroupContext>): GroupContext | undefined { return inject(key, undefined); }
