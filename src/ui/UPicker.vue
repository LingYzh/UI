<script setup lang="ts">
import { useDefaults } from './defaults';
import { vPointerBlur } from './pointer-focus';
import { computed } from 'vue';
import { getPath, type DataItem } from './data-pipeline';

type PickerItem = string | number | DataItem;
type PickerValue = PickerItem | boolean | null | undefined;
const rawProps = withDefaults(defineProps<{ items: readonly PickerItem[]; itemTitle?: string; itemValue?: string; multiple?: boolean; disabled?: boolean; readonly?: boolean; returnObject?: boolean }>(), { itemTitle: 'title', itemValue: 'value' });
const props = useDefaults(rawProps, 'UPicker');
const model = defineModel<PickerValue | PickerValue[]>({ default: null });
const entries = computed(() => props.items.map((item) => ({ item, title: typeof item === 'object' ? String(getPath(item, props.itemTitle) ?? '') : String(item), value: typeof item === 'object' ? getPath(item, props.itemValue) : item })));
const values = computed(() => Array.isArray(model.value) ? model.value : model.value == null ? [] : [model.value]);
function selected(value: unknown): boolean { return values.value.some((entry) => Object.is(props.returnObject && entry && typeof entry === 'object' ? getPath(entry as DataItem, props.itemValue) : entry, value)); }
function choose(item: PickerItem): void {
    if (props.disabled || props.readonly) return;
    const value = typeof item === 'object' ? getPath(item, props.itemValue) : item;
    const output = (props.returnObject ? item : value) as PickerValue;
    if (!props.multiple) { model.value = output; return; }
    model.value = selected(value) ? values.value.filter((entry) => !Object.is(props.returnObject && entry && typeof entry === 'object' ? getPath(entry as DataItem, props.itemValue) : entry, value)) : [...values.value, output];
}
</script>
<template>
    <div class="u-picker" role="listbox" :aria-multiselectable="props.multiple || undefined"><button v-for="(entry, index) in entries" :key="index" v-pointer-blur type="button" class="u-picker-item" role="option" :aria-selected="selected(entry.value)" :class="{ 'is-selected': selected(entry.value) }" :disabled="props.disabled || props.readonly" @click="choose(entry.item)"><slot name="item" :item="entry.item" :selected="selected(entry.value)">{{ entry.title }}</slot></button><slot :items="entries" :selected="selected" :choose="choose" :model-value="model" /></div>
</template>
