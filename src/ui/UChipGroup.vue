<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import UItemGroup from './UItemGroup.vue';
import USlideGroup from './USlideGroup.vue';
import { useDefaults } from './defaults';
import type { ItemGroupProps } from './group-props';
import type { SlideGroupProps } from './slide-group';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ItemGroupProps & Omit<SlideGroupProps, 'direction'> & { scrollable?: boolean; column?: boolean; scrollDirection?: 'horizontal' | 'vertical' }>(), { scrollable: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UChipGroup');
const attrs = useAttrs();
const model = defineModel<unknown>();
const child = ref<InstanceType<typeof UItemGroup>>();
const slide = ref<InstanceType<typeof USlideGroup>>();
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
    prev: () => child.value?.prev(),
    scrollTo: (target: Parameters<InstanceType<typeof USlideGroup>['scrollTo']>[0]) => slide.value?.scrollTo(target),
    get isOverflowing() { return slide.value?.isOverflowing ?? false; },
    get viewport() { return slide.value?.viewport; }
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
        scrollTo?: InstanceType<typeof USlideGroup>['scrollTo'];
        isOverflowing?: boolean;
    }) => any;
    prev?: (scope: any) => any;
    next?: (scope: any) => any;
}>();
</script>

<template>
    <UItemGroup ref="child" v-model="model" class="u-chip-group" :class="{ 'is-scrollable': props.scrollable && !props.column }" v-bind="{ ...props, ...attrs }" v-slot="scope">
        <USlideGroup v-if="props.scrollable && !props.column" ref="slide" v-model="model" :multiple="props.multiple" :mandatory="props.mandatory" :max="props.max" :value-comparator="props.valueComparator" :disabled="props.disabled || props.readonly" :selected-class="props.selectedClass" :show-arrows="props.showArrows" :center-active="props.centerActive" :scroll-to-active="props.scrollToActive" :scroll-distance="props.scrollDistance" :scroll-snap="props.scrollSnap" :content-class="props.contentClass" :direction="props.scrollDirection ?? 'horizontal'">
            <slot v-bind="scope" :scroll-to="slide?.scrollTo" :is-overflowing="slide?.isOverflowing ?? false" />
            <template v-if="$slots.prev" #prev="slideScope"><slot name="prev" v-bind="slideScope" /></template>
            <template v-if="$slots.next" #next="slideScope"><slot name="next" v-bind="slideScope" /></template>
        </USlideGroup>
        <slot v-else v-bind="scope" />
    </UItemGroup>
</template>
