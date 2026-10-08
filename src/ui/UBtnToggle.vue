<script setup lang="ts">
import { provide, ref, useAttrs } from 'vue';
import { buttonToggleScopeKey } from './button-group';
import UItemGroup from './UItemGroup.vue';
import { useDefaults } from './defaults';
import type { ItemGroupProps } from './group-props';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ItemGroupProps>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UBtnToggle');
const attrs = useAttrs();
const model = defineModel<unknown>();
const child = ref<InstanceType<typeof UItemGroup>>();
provide(buttonToggleScopeKey, true);
defineExpose({
    focus: () => child.value?.focus(),
    validate: () => child.value?.validate(),
    reset: () => child.value?.reset(),
    resetValidation: () => child.value?.resetValidation(),
    get element() { return child.value?.element; },
    get errors() { return child.value?.errors; },
    get selected() { return child.value?.selected ?? []; },
    get selectedValues() { return child.value?.selectedValues ?? []; },
    isSelected: (id: string) => child.value?.isSelected(id) ?? false,
    select: (id: string, selected?: boolean) => child.value?.select(id, selected),
    next: () => child.value?.next(),
    prev: () => child.value?.prev()
});
defineSlots<{
    default?: (scope: {
        selected: string[];
        selectedValues: unknown[];
        isSelected: (id: string) => boolean;
        select: (id: string, selected?: boolean) => void;
        next: () => void;
        prev: () => void;
        isValueSelected: (value: unknown) => boolean;
        toggle: (value: unknown) => void;
    }) => any;
}>();
</script>

<template>
    <UItemGroup ref="child" v-model="model" class="u-btn-group" v-bind="{ ...props, ...attrs }" v-slot="scope">
        <slot v-bind="scope" />
    </UItemGroup>
</template>
