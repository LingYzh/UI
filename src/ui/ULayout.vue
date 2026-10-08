<script setup lang="ts">
import { provideAppLayout } from './layout-completion';
import { computed, ref } from 'vue';
import { dimensionStyles, type DimensionProps } from './dimensions';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<DimensionProps & { tag?: string; fullHeight?: boolean }>(), { tag: 'div' });
const props = useDefaults(rawProps, 'ULayout');
const element = ref<HTMLElement>();
const layout = provideAppLayout();
const style = computed(() => dimensionStyles(props));
defineExpose({ element, items: layout.items, getLayoutItem: layout.getLayoutItem, mainRect: layout.offsets });
</script>

<template>
    <component :is="props.tag" ref="element" class="ui-layout" :class="{ 'is-full-height': props.fullHeight }" :style="style"><slot /></component>
</template>
