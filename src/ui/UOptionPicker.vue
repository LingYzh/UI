<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import { vPointerBlur } from './pointer-focus';
import { computed } from 'vue';
import { getPath, type DataItem } from './data-pipeline';
import type { ValueComparator } from './selection';

type PickerItem = string | number | DataItem;
type PickerValue = PickerItem | boolean | null | undefined;
interface PickerEntry {
    item: PickerItem;
    title: string;
    value: unknown;
    disabled: boolean;
    props: Record<string, unknown>;
}

const rawProps = withDefaults(defineProps<{
    items: readonly PickerItem[];
    itemTitle?: string;
    itemValue?: string;
    itemDisabled?: string | ((item: PickerItem) => unknown);
    valueComparator?: ValueComparator;
    multiple?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    returnObject?: boolean;
} & { ripple?: RippleOptions }>(), { ripple: true, itemTitle: 'title', itemValue: 'value' });
const props = useDefaults(rawProps, 'UOptionPicker');
const model = defineModel<PickerValue | PickerValue[]>({ default: null });
function itemProps(item: PickerItem): Record<string, unknown> {
    const value = item !== null && typeof item === 'object' ? getPath(item, 'props') : undefined;
    return value && typeof value === 'object' && !Array.isArray(value)
        ? { ...value as Record<string, unknown> }
        : {};
}
function itemPath(item: PickerItem, path: string): unknown {
    return item !== null && typeof item === 'object' ? getPath(item, path) : undefined;
}
function isItemDisabled(item: PickerItem): boolean {
    if (typeof props.itemDisabled === 'function') return Boolean(props.itemDisabled(item));
    if (typeof props.itemDisabled === 'string') return Boolean(itemPath(item, props.itemDisabled));
    return Boolean(itemProps(item).disabled ?? itemPath(item, 'disabled'));
}
const entries = computed<PickerEntry[]>(() => props.items.map(item => {
    const normalizedProps = itemProps(item);

    return {
        item,
        title: typeof item === 'object' ? String(getPath(item, props.itemTitle) ?? '') : String(item),
        value: typeof item === 'object' ? getPath(item, props.itemValue) : item,
        disabled: isItemDisabled(item),
        props: normalizedProps
    };
}));
const values = computed(() => Array.isArray(model.value) ? model.value : model.value == null ? [] : [model.value]);
function modelValue(value: unknown): unknown {
    return props.returnObject && value !== null && typeof value === 'object'
        ? getPath(value as DataItem, props.itemValue)
        : value;
}
function equal(left: unknown, right: unknown): boolean {
    return props.valueComparator ? props.valueComparator(left, right) : Object.is(left, right);
}
function selected(value: unknown): boolean {
    return values.value.some(entry => equal(modelValue(entry), value));
}
function choose(item: PickerItem): void {
    if (props.disabled || props.readonly || isItemDisabled(item)) return;
    const value = typeof item === 'object' ? getPath(item, props.itemValue) : item;
    const output = (props.returnObject ? item : value) as PickerValue;
    if (!props.multiple) { model.value = output; return; }
    model.value = selected(value)
        ? values.value.filter(entry => !equal(modelValue(entry), value))
        : [...values.value, output];
}
</script>
<template>
    <div class="u-picker" role="listbox" :aria-multiselectable="props.multiple || undefined"><button v-for="(entry, index) in entries" :key="index" v-bind="entry.props" v-ripple="props.ripple" v-pointer-blur type="button" class="u-picker-item" role="option" :aria-selected="selected(entry.value)" :aria-disabled="entry.disabled || props.disabled || props.readonly || undefined" :class="{ 'is-selected': selected(entry.value) }" :disabled="entry.disabled || props.disabled || props.readonly" @click="choose(entry.item)"><slot name="item" :item="entry.item" :selected="selected(entry.value)" :disabled="entry.disabled" :props="entry.props">{{ entry.title }}</slot></button><slot :items="entries" :selected="selected" :choose="choose" :model-value="model" /></div>
</template>
