<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import UiSelectNative from './UiSelectNative.vue';
import UAutocomplete from './UAutocomplete.vue';
import { useDefaults } from './defaults';
import type { ControlSizing } from './control-sizing';
import type { FormControlProps } from './form';
import type { ItemProperty, ValueComparator } from './selection';

export interface SelectItem {
    value: string | number;
    label: string;
    description?: string;
    hint?: string;
    disabled?: boolean;
}
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ControlSizing & FormControlProps & {
    items?: readonly unknown[];
    menuTitle?: string;
    placeholder?: string;
    compact?: boolean;
    invalid?: boolean;
    blurOnSelect?: boolean;
    multiple?: boolean;
    chips?: boolean;
    clearable?: boolean;
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    itemProps?: ItemProperty | boolean;
    returnObject?: boolean;
    valueComparator?: ValueComparator;
    hideSelected?: boolean;
}>(), { blurOnSelect: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'USelect');
const attrs = useAttrs();
const model = defineModel<any>();
const child = ref<InstanceType<typeof UiSelectNative> | InstanceType<typeof UAutocomplete>>();
defineExpose({
    focus: () => child.value?.focus(),
    validate: () => child.value?.validate(),
    reset: () => child.value?.reset(),
    resetValidation: () => child.value?.resetValidation(),
    get element() { return child.value?.element; },
    get errors() { return child.value?.errors; }
});
const extended = computed(() => !!(props.multiple || props.chips || props.clearable || props.returnObject || props.itemTitle || props.itemValue || props.itemProps || props.valueComparator || props.hideSelected || props.items?.some((item) => typeof item !== 'object' || item === null || !('label' in item))));
const legacyItems = computed(() => props.items as SelectItem[] | undefined);
</script>

<template>
    <UAutocomplete v-if="extended" ref="child" v-model="model" v-bind="{ ...props, ...attrs }" :item-title="props.itemTitle ?? 'label'" :item-value="props.itemValue ?? 'value'">
        <template v-if="$slots.item" #item="slotProps"><slot name="item" v-bind="slotProps" /></template>
        <template v-if="$slots.selection" #selection="slotProps"><slot name="selection" v-bind="slotProps" /></template>
    </UAutocomplete>
    <UiSelectNative v-else ref="child" v-model="model" v-bind="{ ...props, ...attrs }" :items="legacyItems"><slot /></UiSelectNative>
</template>
