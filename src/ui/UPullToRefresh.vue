<script setup lang="ts">
import { useDefaults } from './defaults';
import { ref, onBeforeUnmount } from 'vue';
const rawProps = withDefaults(defineProps<{ threshold?: number; disabled?: boolean }>(), { threshold: 72 });
const props = useDefaults(rawProps, 'UPullToRefresh');
const emit = defineEmits<{ refresh: [context: { done: () => void }] }>();
const element = ref<HTMLElement>();
function setElement(value: HTMLElement | null): void { element.value = value ?? undefined; }
const distance = ref(0);
const refreshing = ref(false);
let startY: number | null = null;
let startX: number | null = null;
let active = true;
function onTouchStart(event: TouchEvent): void {
    if (props.disabled || refreshing.value || event.touches.length !== 1 || (element.value?.scrollTop ?? 0) > 0) return;
    startY = event.touches[0].clientY;
    startX = event.touches[0].clientX;
}
function onTouchMove(event: TouchEvent): void {
    if (startY == null || startX == null || event.touches.length !== 1) return;
    if ((element.value?.scrollTop ?? 0) > 0) { cancel(); return; }
    const vertical = event.touches[0].clientY - startY;
    const horizontal = event.touches[0].clientX - startX;
    if (vertical <= 0 || Math.abs(horizontal) > vertical) { cancel(); return; }
    distance.value = Math.min(props.threshold * 1.5, vertical * 0.5);
}
function onTouchEnd(): void {
    if (startY == null) return;
    const shouldRefresh = distance.value >= props.threshold && !refreshing.value;
    cancel();
    if (!shouldRefresh) return;
    refreshing.value = true;
    let settled = false;
    emit('refresh', { done() { if (!active || settled) return; settled = true; refreshing.value = false; } });
}
function cancel(): void { startY = null; startX = null; distance.value = 0; }
onBeforeUnmount(() => { active = false; cancel(); });
defineExpose({ cancel });
</script>
<template>
    <div ref="element" class="u-pull-to-refresh" :aria-busy="refreshing" @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend="onTouchEnd" @touchcancel="cancel"><div v-if="distance || refreshing" class="u-pull-indicator" role="status"><slot name="indicator" :distance="distance" :refreshing="refreshing">{{ refreshing ? '正在刷新…' : distance >= props.threshold ? '松开刷新' : '下拉刷新' }}</slot></div><div :style="{ transform: 'translateY(' + distance + 'px)' }"><slot :refreshing="refreshing" /></div></div>
</template>
