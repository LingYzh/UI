<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useAppLayout, useLayoutItem } from './layout-completion';
import { useDefaults } from './defaults';
import { dimensionLength } from './dimensions';
const rawProps = withDefaults(defineProps<{ height?: number | string; fixed?: boolean; absolute?: boolean; order?: number | string; name?: string; tag?: string; app?: boolean }>(), { height: 48, fixed: false, absolute: false, order: 10, tag: 'footer', app: undefined });
const props = useDefaults(rawProps, 'UFooter');
const element = ref<HTMLElement>();
const measured = ref(Number(props.height) || 48);
let observer: ResizeObserver | undefined;
const attached = computed(() => props.app ?? props.fixed);
const appLayout = useAppLayout();
const { offset, styles: layoutStyles } = useLayoutItem(computed(() => 'bottom'), measured, computed(() => props.app ?? (props.fixed && (!props.absolute || !!appLayout?.ordered.value))), computed(() => Number(props.order) || 0), computed(() => props.name));
onMounted(() => {
    observer = new ResizeObserver(() => { measured.value = element.value?.offsetHeight ?? (Number(props.height) || 0); });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
defineExpose({ element });
</script>

<template>
    <component :is="props.tag" ref="element" class="ui-footer" :class="{ 'is-fixed': attached && !props.absolute, 'is-absolute': props.absolute }" :style="{ minHeight: dimensionLength(props.height), bottom: offset + 'px', ...(attached ? layoutStyles : {}) }"><slot /></component>
</template>
