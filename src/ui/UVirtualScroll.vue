<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { virtualWindow } from './virtual-scroll';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ items: unknown[]; itemHeight: number; height?: number | string; overscan?: number; itemKey?: string | ((item: unknown) => string | number) }>(), { height: 320, overscan: 4 });
const props = useDefaults(rawProps, 'UVirtualScroll');
const element = ref<HTMLElement>();
const scrollTop = ref(0);
const viewportHeight = ref(typeof props.height === 'number' ? props.height : 320);
let observer: ResizeObserver | undefined;
const count = computed(() => props.items.length);
const windowRange = computed(() => virtualWindow(count.value, scrollTop.value, viewportHeight.value, props.itemHeight, props.overscan));
const start = computed(() => windowRange.value.start);
const end = computed(() => windowRange.value.end);
const visible = computed(() => props.items.slice(start.value, end.value));
const key = (item: unknown, index: number) => typeof props.itemKey === 'function' ? props.itemKey(item) : props.itemKey && item && typeof item === 'object' ? (item as Record<string, unknown>)[props.itemKey] as string | number : index;
function onScroll() { scrollTop.value = element.value?.scrollTop ?? 0; }
function scrollToIndex(index: number) { if (element.value) element.value.scrollTop = Math.max(0, Math.min(count.value - 1, index)) * windowRange.value.rowHeight; }
watch([count, () => props.itemHeight], () => {
    if (element.value && element.value.scrollTop > windowRange.value.totalHeight) element.value.scrollTop = Math.max(0, windowRange.value.totalHeight - viewportHeight.value);
    onScroll();
});
import { onMounted, onBeforeUnmount } from 'vue';
onMounted(() => {
    observer = new ResizeObserver(() => { viewportHeight.value = element.value?.clientHeight ?? 0; });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
defineExpose({ scrollToIndex });
</script>

<template>
    <div ref="element" class="ui-virtual-scroll" :style="{ height: typeof props.height === 'number' ? props.height + 'px' : props.height }" @scroll="onScroll"><div :style="{ height: windowRange.totalHeight + 'px', position: 'relative' }"><div v-for="(item, index) in visible" :key="key(item, start + index)" class="ui-virtual-scroll-item" :style="{ position: 'absolute', insetInline: 0, top: (start + index) * windowRange.rowHeight + 'px', height: windowRange.rowHeight + 'px' }"><slot :item="item" :index="start + index" /></div></div></div>
</template>
