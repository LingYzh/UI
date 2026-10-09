<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useAppLayout, useLayoutItem } from './layout-completion';
import { useDefaults } from './defaults';
import { dimensionLength } from './dimensions';
const rawProps = withDefaults(defineProps<{ height?: number | string; fixed?: boolean; absolute?: boolean; order?: number | string; name?: string; tag?: string; window?: boolean }>(), { fixed: true, absolute: false, order: 0, tag: 'div' });
const props = useDefaults(rawProps, 'USystemBar');
const element = ref<HTMLElement>();
const height = computed(() => props.height ?? (props.window ? 32 : 24));
const measured = ref(Number(height.value) || 24);
let observer: ResizeObserver | undefined;
const appLayout = useAppLayout();
const { offset, styles: layoutStyles } = useLayoutItem(computed(() => 'top'), measured, computed(() => props.fixed && (!props.absolute || !!appLayout?.ordered.value)), computed(() => Number(props.order) || 0), computed(() => props.name));
onMounted(() => {
    observer = new ResizeObserver(() => { measured.value = element.value?.offsetHeight ?? (Number(height.value) || 0); });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
defineExpose({ element });
</script>

<template>
    <component :is="props.tag" ref="element" class="ui-system-bar" :class="{ 'is-fixed': props.fixed && !props.absolute, 'is-absolute': props.absolute, 'is-window': props.window }" :style="{ minHeight: dimensionLength(height), top: offset + 'px', ...(props.fixed || props.absolute ? layoutStyles : {}) }"><slot /></component>
</template>
