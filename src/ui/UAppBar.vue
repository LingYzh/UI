<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useLayoutItem } from './layout-completion';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ height?: number; fixed?: boolean; absolute?: boolean; order?: number; color?: string }>(), { height: 56, fixed: true, absolute: false, order: 10 });
const props = useDefaults(rawProps, 'UAppBar');
const element = ref<HTMLElement>();
const measured = ref(props.height);
let observer: ResizeObserver | undefined;
const { offset } = useLayoutItem(computed(() => 'top'), measured, computed(() => props.fixed && !props.absolute), computed(() => props.order));
onMounted(() => {
    observer = new ResizeObserver(() => { measured.value = element.value?.offsetHeight ?? props.height; });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <header ref="element" class="ui-app-bar" :class="{ 'is-fixed': props.fixed && !props.absolute, 'is-absolute': props.absolute }" :style="{ minHeight: props.height + 'px', top: offset + 'px', background: props.color }"><slot /></header>
</template>
