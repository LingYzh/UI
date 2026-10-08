<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import UAutocomplete from './UAutocomplete.vue';
import { useDefaults } from './defaults';
import type { AutocompleteProps } from './autocomplete-props';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<AutocompleteProps>(), { ripple: true, items: () => [], itemProps: 'props', returnObject: true, clearOnSelect: true, hideNoData: true, ignoreAccents: undefined, autoSelectFirst: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UCombobox');
const attrs = useAttrs();
const model = defineModel<unknown>();
const search = defineModel<string>('search', { default: '' });
const menu = defineModel<boolean>('menu', { default: false });
const child = ref<InstanceType<typeof UAutocomplete>>();
defineExpose({
    focus: () => child.value?.focus(),
    validate: () => child.value?.validate(),
    reset: () => child.value?.reset(),
    resetValidation: () => child.value?.resetValidation(),
    get menu() { return menu.value; },
    get element() { return child.value?.element; },
    get errors() { return child.value?.errors; }
});
</script>

<template>
    <UAutocomplete ref="child" v-bind="{ ...props, ...attrs }" v-model="model" v-model:search="search" v-model:menu="menu" combobox><template v-for="(_, name) in $slots" #[name]="slotProps"><slot :name="name" v-bind="slotProps" /></template></UAutocomplete>
</template>
