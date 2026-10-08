<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
import { useInfiniteScrollState, type InfiniteScrollDirection, type InfiniteScrollEdge, type InfiniteScrollLoadContext, type InfiniteScrollMode, type InfiniteScrollSide, type InfiniteScrollStatus } from './infinite-scroll-state';

const rawProps = withDefaults(defineProps<{
    disabled?: boolean;
    rootMargin?: string;
    direction?: InfiniteScrollDirection;
    side?: InfiniteScrollSide;
    mode?: InfiniteScrollMode;
    margin?: number | string;
    color?: string;
    loadMoreText?: string;
    emptyText?: string;
    tag?: string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
}>(), { rootMargin: '200px', direction: 'vertical', side: 'end', mode: 'intersect', tag: 'div', loadMoreText: '加载更多', emptyText: '没有更多内容' });
const props = useDefaults(rawProps, 'UInfiniteScroll');
const emit = defineEmits<{ load: [context: InfiniteScrollLoadContext] }>();
const { root, startSentinel, endSentinel, axis, side, startStatus, endStatus, busy, done, error, load, retry, reset } = useInfiniteScrollState(() => props, context => emit('load', context));
const edges = computed<InfiniteScrollEdge[]>(() => side.value === 'both' ? ['start', 'end'] : [side.value]);
function unit(value?: number | string): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
const styles = computed<CSSProperties>(() => ({
    width: unit(props.width), height: unit(props.height), minWidth: unit(props.minWidth), minHeight: unit(props.minHeight),
    maxWidth: unit(props.maxWidth), maxHeight: unit(props.maxHeight)
}));
function status(edge: InfiniteScrollEdge): InfiniteScrollStatus { return edge === 'start' ? startStatus.value : endStatus.value; }
function actionProps(edge: InfiniteScrollEdge) { return { onClick: () => load(edge), color: props.color, disabled: props.disabled }; }
// Preserve the existing exposed sentinel setter while offering independent edge refs.
function setSentinel(value: HTMLElement | null): void {
    if (side.value === 'start') startSentinel.value = value ?? undefined;
    else endSentinel.value = value ?? undefined;
}
defineExpose({ load, retry, reset, root, startStatus, endStatus, startSentinel, endSentinel, setSentinel });
</script>

<template>
    <component :is="props.tag" ref="root" class="u-infinite-scroll" :class="`is-${axis}`" :style="styles" :aria-busy="busy">
        <template v-for="edge in edges" :key="edge">
            <div class="u-infinite-status" :class="`is-${edge}`" role="status">
                <slot v-if="status(edge) === 'loading'" name="loading" :side="edge" :props="actionProps(edge)">正在加载…</slot>
                <slot v-else-if="status(edge) === 'empty'" name="empty" :side="edge" :props="actionProps(edge)">{{ props.emptyText }}</slot>
                <slot v-else-if="status(edge) === 'error'" name="error" :side="edge" :props="actionProps(edge)" :retry="() => retry(edge)">
                    <UiButton variant="text" :color="props.color" :disabled="props.disabled"
                        @click="retry(edge)">加载失败，重试</UiButton>
                </slot>
                <slot v-else name="load-more" :side="edge" :props="actionProps(edge)" :load="() => load(edge)">
                    <UiButton variant="text" :color="props.color" :disabled="props.disabled"
                        @click="load(edge)">{{ props.loadMoreText }}</UiButton>
                </slot>
            </div>
        </template>
        <div v-if="side === 'start' || side === 'both'" ref="startSentinel" class="u-infinite-sentinel is-start" />
        <slot :busy="busy" :done="done" :error="error" :load="load" :retry="retry" :reset="reset" :start-status="startStatus" :end-status="endStatus" />
        <div v-if="side === 'end' || side === 'both'" ref="endSentinel" class="u-infinite-sentinel is-end" />
    </component>
</template>
