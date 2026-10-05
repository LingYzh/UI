<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import UItemGroup from './UItemGroup.vue';
import { useDefaults } from './defaults';
import type { ItemGroupProps } from './group-props';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ItemGroupProps>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UBtnGroup');
const attrs = useAttrs();
const model = defineModel<unknown>();
const child = ref<InstanceType<typeof UItemGroup>>();
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
    <UItemGroup ref="child" v-model="model" class="u-btn-group" v-bind="{ ...props, ...attrs }"><slot /></UItemGroup>
</template>
