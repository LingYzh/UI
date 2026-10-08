<script setup lang="ts">
import { computed, ref, toRef, type ComponentPublicInstance } from 'vue';
import { useDefaults } from './defaults';
import { useVirtualScroll } from './use-virtual-scroll';
const rawProps = withDefaults(defineProps<{
    items: unknown[]; itemHeight?: number; height?: number | string; overscan?: number;
    itemKey?: string | ((item: unknown, index: number) => string | number); renderless?: boolean; tag?: string;
}>(), { height: 320, overscan: 4, tag: 'div' });
const props = useDefaults(rawProps, 'UVirtualScroll');
const element = ref<HTMLElement>();
const marker = ref<HTMLElement>();
function scrollElement() {
    if (!props.renderless) return element.value;
    let parent = marker.value?.parentElement;
    while (parent) {
        if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
        parent = parent.parentElement;
    }
    return document.scrollingElement as HTMLElement | null;
}
const virtual = useVirtualScroll({ items: () => props.items, itemHeight: () => props.itemHeight, itemKey: toRef(() => props.itemKey), height: () => props.height, overscan: () => props.overscan, getScrollElement: scrollElement });
const range = virtual.window;
const rows = virtual.visibleItems;
const size = computed(() => typeof props.height === 'number' ? `${props.height}px` : props.height);
function key(item: unknown, index: number) {
    return typeof props.itemKey === 'function' ? props.itemKey(item, index) : props.itemKey && item && typeof item === 'object' ? (item as Record<string, unknown>)[props.itemKey] as string | number : index;
}
function itemRef(index: number, node: Element | ComponentPublicInstance | null) { virtual.itemRef(index, node instanceof HTMLElement ? node : node && '$el' in node ? node.$el : null); }
defineExpose({ scrollToIndex: virtual.scrollToIndex });
</script>

<template>
    <template v-if="props.renderless">
        <div ref="marker" aria-hidden="true" :style="{ height: range.paddingTop + 'px' }" />
        <slot v-for="(item, index) in rows" :key="key(item, range.start + index)" :item="item" :index="range.start + index" :item-ref="(node: Element | ComponentPublicInstance | null) => itemRef(range.start + index, node)" />
        <div aria-hidden="true" :style="{ height: range.paddingBottom + 'px' }" />
    </template>
    <component :is="props.tag" v-else ref="element" class="ui-virtual-scroll" :style="{ height: size }">
        <div :style="{ paddingTop: range.paddingTop + 'px', paddingBottom: range.paddingBottom + 'px' }">
            <div v-for="(item, index) in rows" :key="key(item, range.start + index)" :ref="node => itemRef(range.start + index, node)" class="ui-virtual-scroll-item"><slot :item="item" :index="range.start + index" :item-ref="(node: Element | ComponentPublicInstance | null) => itemRef(range.start + index, node)" /></div>
        </div>
    </component>
</template>
