<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import USelectionControlGroup from './USelectionControlGroup.vue';
import { useDefaults } from './defaults';
import type { CheckboxGroupProps } from './group-props';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<CheckboxGroupProps>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UCheckboxGroup');
const attrs = useAttrs();
const model = defineModel<unknown[]>({ default: () => [] });
const child = ref<InstanceType<typeof USelectionControlGroup>>();
defineExpose({
    focus: () => child.value?.focus(),
    validate: () => child.value?.validate(),
    reset: () => child.value?.reset(),
    resetValidation: () => child.value?.resetValidation(),
    get element() { return child.value?.element; },
    get errors() { return child.value?.errors; }
});
</script>

<template>
    <USelectionControlGroup ref="child" v-model="model" v-bind="{ ...props, ...attrs }" multiple><slot /></USelectionControlGroup>
</template>
