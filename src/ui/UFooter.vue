<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useLayoutItem } from './layout-completion';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ height?: number; fixed?: boolean; absolute?: boolean; order?: number }>(), { height: 48, fixed: false, absolute: false, order: 10 });
const props = useDefaults(rawProps, 'UFooter');
const element = ref<HTMLElement>();
const measured = ref(props.height);
let observer: ResizeObserver | undefined;
const { offset } = useLayoutItem(computed(() => 'bottom'), measured, computed(() => props.fixed && !props.absolute), computed(() => props.order));
onMounted(() => {
    observer = new ResizeObserver(() => { measured.value = element.value?.offsetHeight ?? props.height; });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <footer ref="element" class="ui-footer" :class="{ 'is-fixed': props.fixed && !props.absolute, 'is-absolute': props.absolute }" :style="{ minHeight: props.height + 'px', bottom: offset + 'px' }"><slot /></footer>
</template>
