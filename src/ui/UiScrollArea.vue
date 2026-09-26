<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
const props = withDefaults(defineProps<{
    height?: string;
    maxHeight?: string;
    axis?: 'vertical' | 'horizontal' | 'both';
    label: string;
    always?: boolean;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
}>(), { axis: 'vertical', rounded: true });
const emit = defineEmits<{ scroll: [position: { scrollTop: number; scrollLeft: number }] }>();
const element = ref<HTMLElement>();
const content = ref<HTMLElement>();
const metrics = ref({ width: 0, height: 0, scrollWidth: 0, scrollHeight: 0, left: 0, top: 0 });
const dragging = ref(false);
const scrolling = ref(false);
let scrollTimer: ReturnType<typeof setTimeout> | undefined;
let observer: ResizeObserver | undefined;
let mutation: MutationObserver | undefined;
let drag: { axis: 'x' | 'y'; start: number; scroll: number; ratio: number; target: HTMLElement; pointer: number } | undefined;
const bars = computed(() => {
    const m = metrics.value;
    const bar = (viewport: number, total: number, offset: number) => {
        const track = Math.max(0, viewport - 8);
        const size = Math.min(track, Math.max(24, track * viewport / (total || 1)));
        const range = Math.max(0, total - viewport);
        return { visible: range > 1, size, offset: range ? Math.max(0, Math.min(1, offset / range)) * (track - size) : 0, ratio: range / (track - size || 1) };
    };
    return { x: bar(m.width, m.scrollWidth, m.left), y: bar(m.height, m.scrollHeight, m.top) };
});
function update() {
    const view = element.value;
    if (!view) return;
    metrics.value = { width: view.clientWidth, height: view.clientHeight, scrollWidth: view.scrollWidth, scrollHeight: view.scrollHeight, left: view.scrollLeft, top: view.scrollTop };
}
function scroll() {
    update();
    scrolling.value = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { scrolling.value = false; }, 700);
    emit('scroll', { scrollTop: element.value?.scrollTop || 0, scrollLeft: element.value?.scrollLeft || 0 });
}
function start(event: PointerEvent, axis: 'x' | 'y') {
    if (event.button !== 0 || !element.value) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    const thumb = event.target instanceof HTMLElement && event.target.classList.contains('ui-scroll-thumb');
    const rect = target.getBoundingClientRect();
    const coordinate = axis === 'y' ? event.clientY : event.clientX;
    if (!thumb) {
        const desired = (coordinate - (axis === 'y' ? rect.top : rect.left) - bars.value[axis].size / 2) * bars.value[axis].ratio;
        if (axis === 'y') element.value.scrollTop = desired;
        else element.value.scrollLeft = desired;
        update();
    }
    target.setPointerCapture(event.pointerId);
    drag = { axis, start: coordinate, scroll: axis === 'y' ? element.value.scrollTop : element.value.scrollLeft, ratio: bars.value[axis].ratio, target, pointer: event.pointerId };
    dragging.value = true;
}
function move(event: PointerEvent) {
    if (!drag || !element.value || drag.pointer !== event.pointerId) return;
    const position = drag.scroll + ((drag.axis === 'y' ? event.clientY : event.clientX) - drag.start) * drag.ratio;
    if (drag.axis === 'y') element.value.scrollTop = position;
    else element.value.scrollLeft = position;
}
function stop() {
    if (drag?.target.hasPointerCapture(drag.pointer)) drag.target.releasePointerCapture(drag.pointer);
    drag = undefined;
    dragging.value = false;
}
onMounted(() => {
    observer = new ResizeObserver(update);
    if (element.value) observer.observe(element.value);
    if (content.value) {
        observer.observe(content.value);
        mutation = new MutationObserver(update);
        mutation.observe(content.value, { childList: true, subtree: true, characterData: true });
    }
    window.addEventListener('blur', stop);
    update();
});
onBeforeUnmount(() => { stop(); clearTimeout(scrollTimer); observer?.disconnect(); mutation?.disconnect(); window.removeEventListener('blur', stop); });
defineExpose({ element, update, focus: () => element.value?.focus(), scrollTo: (options: ScrollToOptions) => element.value?.scrollTo(options) });
</script>

<template>
    <div class="ui-scroll-area" :class="{ 'is-dragging': dragging, 'is-scrolling': scrolling, 'is-always': always, 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }" :data-axis="axis">
        <div ref="element" class="ui-scroll-viewport" :style="{ height, maxHeight }" tabindex="0" role="region" :aria-label="label" @scroll="scroll">
            <div ref="content" class="ui-scroll-content"><slot /></div>
        </div>
        <div v-if="bars.y.visible && axis !== 'horizontal'" class="ui-scroll-track is-vertical" aria-hidden="true" @pointerdown="start($event, 'y')" @pointermove="move" @pointerup="stop" @pointercancel="stop" @lostpointercapture="stop"><div class="ui-scroll-thumb" :style="{ height: `${bars.y.size}px`, transform: `translateY(${bars.y.offset}px)` }"></div></div>
        <div v-if="bars.x.visible && axis !== 'vertical'" class="ui-scroll-track is-horizontal" aria-hidden="true" @pointerdown="start($event, 'x')" @pointermove="move" @pointerup="stop" @pointercancel="stop" @lostpointercapture="stop"><div class="ui-scroll-thumb" :style="{ width: `${bars.x.size}px`, transform: `translateX(${bars.x.offset}px)` }"></div></div>
    </div>
</template>
