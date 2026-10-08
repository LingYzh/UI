<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUpdated, provide, reactive, watch, type VNode } from 'vue';
import { useDefaults } from './defaults';
import { createItemGroupState } from './item-group-state';
import type { ItemGroupRegistration, ItemGroupStateEntry } from './item-group-state';
import { defaultValueComparator } from './selection';
import type { ValueComparator } from './selection';
import { itemGroupItemIdKey } from './item-group-context';
import { expansionGroupKey, type ExpansionGroupContext } from './expansion-state';

const rawProps = withDefaults(defineProps<{
    multiple?: boolean;
    mandatory?: boolean | 'force';
    max?: number;
    valueComparator?: ValueComparator;
    disabled?: boolean;
    readonly?: boolean;
    selectedClass?: string;
    eager?: boolean;
    focusable?: boolean;
    static?: boolean;
    tag?: string;
}>(), { eager: undefined, focusable: undefined, static: undefined });
const props = useDefaults(rawProps, 'UExpansionPanels');
const model = defineModel<unknown>();
const selectedModel = computed<unknown | null>(() => model.value ?? null);
const instance = getCurrentInstance();
const groupModel = computed<unknown>({
    get: () => model.value == null ? undefined : model.value,
    set: value => { model.value = value == null ? null : value; }
});
const state = createItemGroupState(groupModel, () => ({
    multiple: !!props.multiple,
    mandatory: props.mandatory,
    max: props.max,
    disabled: !!props.disabled,
    readonly: !!props.readonly,
    valueComparator: props.valueComparator
}));
const order = reactive<string[]>([]);
const registrations = new Map<string, () => void>();
const values = computed(() => order.flatMap(id => {
    const value = state.effectiveValue(id);
    return value === undefined ? [] : [value];
}));

function comparator(): ValueComparator {
    return props.valueComparator ?? defaultValueComparator;
}

function isValueSelected(value: unknown): boolean {
    return state.selectedValues.value.some(selected => comparator()(selected, value));
}

function selectValue(value: unknown, selected?: boolean): void {
    const compare = comparator();
    const id = order.find(current => compare(state.effectiveValue(current), value));
    if (id !== undefined) state.select(id, selected);
}

const group: ExpansionGroupContext = Object.assign(state, {
    selected: selectedModel as import('vue').ComputedRef<unknown>,
    disabled: () => !!props.disabled,
    readonly: () => !!props.readonly,
    multiple: () => !!props.multiple,
    mandatory: () => props.mandatory ?? false,
    max: () => props.max,
    valueComparator: () => props.valueComparator,
    selectedClass: () => props.selectedClass,
    eager: () => props.eager,
    focusable: () => props.focusable,
    static: () => props.static,
    order,
    values,
    registerItem: (entry: ItemGroupStateEntry): ItemGroupRegistration => {
        const registration = state.register(entry);
        if (!order.includes(entry.id)) order.push(entry.id);
        registrations.set(entry.id, registration.release);
        return registration;
    },
    unregisterItem: (id: string) => {
        registrations.get(id)?.();
        registrations.delete(id);
        const index = order.indexOf(id);
        if (index >= 0) order.splice(index, 1);
    },
    selectValue,
    isValueSelected
});
provide(expansionGroupKey, group);

const legacyGroup = {
    get values() { return values.value; },
    selected: selectedModel,
    get mandatory() { return props.mandatory ?? false; },
    get multiple() { return !!props.multiple; },
    get disabled() { return !!props.disabled; },
    register: group.registerItem,
    isSelected: isValueSelected,
    select: selectValue,
    next: state.next,
    prev: state.prev
};
const slotScope = computed(() => ({
    next: state.next,
    prev: state.prev,
    select: selectValue,
    selected: selectedModel,
    selectedIds: state.selectedIds.value,
    selectedValues: state.selectedValues.value,
    isSelected: state.isSelected,
    group: legacyGroup
}));

function syncOrder(): void {
    const ids: string[] = [];
    const visited = new Set<VNode>();
    function visit(node: VNode): void {
        if (visited.has(node)) return;
        visited.add(node);
        const provided = (node.component as unknown as { provides?: Record<symbol, unknown> })?.provides;
        if (provided && Object.hasOwn(provided, itemGroupItemIdKey) && provided[expansionGroupKey] === group) {
            const id = provided[itemGroupItemIdKey];
            if (typeof id === 'string') ids.push(id);
        }
        if (node.component?.subTree) visit(node.component.subTree);
        if (Array.isArray(node.children)) {
            for (const child of node.children) {
                if (child && typeof child === 'object' && '__v_isVNode' in child) visit(child as VNode);
            }
        }
    }
    if (instance?.subTree) visit(instance.subTree);
    const ordered = ids.filter((id, index) => ids.indexOf(id) === index);
    state.reorder(ordered);
    order.splice(0, order.length, ...ordered, ...order.filter(id => !ordered.includes(id)));
}

onMounted(() => { syncOrder(); state.ensureMandatory(); });
onUpdated(syncOrder);
watch(() => [props.disabled, props.readonly, props.mandatory, props.multiple, props.max] as const, () => state.ensureMandatory());

defineExpose({
    next: state.next,
    prev: state.prev,
    select: selectValue,
    selected: selectedModel,
    selectedIds: state.selectedIds,
    selectedValues: state.selectedValues,
    isSelected: state.isSelected
});
</script>
<template>
    <component :is="props.tag ?? 'div'" class="u-expansion-panels" :class="{ 'is-disabled': props.disabled, 'is-readonly': props.readonly }" :aria-disabled="props.disabled || undefined" @vue:updated="syncOrder">
        <slot v-bind="slotScope" />
    </component>
</template>
