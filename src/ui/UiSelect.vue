<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import UiSelectNative from './UiSelectNative.vue';
import UAutocomplete from './UAutocomplete.vue';
import { useDefaults } from './defaults';
import type { AutocompleteProps } from './autocomplete-props';

export interface SelectItem {
    value: string | number;
    label: string;
    description?: string;
    hint?: string;
    disabled?: boolean;
}

type UiSelectProps = Omit<AutocompleteProps, 'combobox' | 'selectOnly'> & {
    compact?: boolean;
    invalid?: boolean;
};

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<UiSelectProps>(), {
    ripple: true,
    blurOnSelect: true,
    itemProps: undefined,
    ignoreAccents: undefined,
    autoSelectFirst: undefined,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'USelect');
const attrs = useAttrs();
const model = defineModel<any>();
const menu = defineModel<boolean>('menu', { default: false });
const child = ref<InstanceType<typeof UiSelectNative> | InstanceType<typeof UAutocomplete>>();

defineExpose({
    focus: () => child.value?.focus(),
    validate: () => child.value?.validate(),
    reset: () => child.value?.reset(),
    resetValidation: () => child.value?.resetValidation(),
    get element() { return child.value?.element; },
    get errors() { return child.value?.errors; }
});

const extended = computed(() => !!(props.multiple
    || props.menuProps
    || props.listProps
    || props.eager
    || props.noAutoScroll
    || props.chips
    || props.clearable
    || props.returnObject
    || props.itemTitle
    || props.itemValue
    || props.itemProps
    || props.valueComparator
    || props.hideSelected
    || props.hideNoData
    || props.noDataText
    || props.filter
    || props.customFilter
    || props.customKeyFilter
    || props.filterKeys
    || props.filterMode
    || props.ignoreAccents !== undefined
    || props.noFilter
    || props.autoSelectFirst !== undefined
    || props.closableChips
    || props.items?.some(item => typeof item !== 'object' || item === null || !('label' in item))));
const legacyItems = computed(() => props.items as SelectItem[] | undefined);
</script>

<template>
    <UAutocomplete v-if="extended" ref="child" v-bind="{ ...props, ...attrs }" v-model="model" v-model:menu="menu" select-only :item-title="props.itemTitle ?? 'title'" :item-value="props.itemValue ?? 'value'">
        <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot v-if="name !== 'default'" :name="name" v-bind="slotProps" />
        </template>
    </UAutocomplete>
    <UiSelectNative v-else ref="child" v-model="model" v-bind="{ ...props, ...attrs }" :items="legacyItems"><slot /></UiSelectNative>
</template>
