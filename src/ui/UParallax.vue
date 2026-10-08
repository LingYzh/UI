<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, normalizeClass, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import UImg, { type ImageSource } from './UImg.vue';
import type { UiTransition } from './UiMaybeTransition.vue';
import { roundedStyles } from './appearance';
const rawProps = withDefaults(defineProps<{
    speed?: number;
    scale?: number | string;
    disabled?: boolean;
    src?: string | ImageSource;
    srcset?: string;
    lazySrc?: string;
    sizes?: string;
    alt?: string;
    lazy?: boolean;
    eager?: boolean;
    options?: IntersectionObserverInit;
    aspectRatio?: number | string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    color?: string;
    gradient?: string;
    position?: string;
    imageClass?: unknown;
    contentClass?: unknown;
    rounded?: boolean | number | string;
    tile?: boolean;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    referrerpolicy?: ReferrerPolicy;
    draggable?: boolean | 'true' | 'false';
    transition?: UiTransition;
}>(), { speed: 0.3 });
const props = useDefaults(rawProps, 'UParallax');
const emit = defineEmits<{ loadstart: [url: string]; load: [url: string]; error: [url: string] }>();
const element = ref<HTMLElement>();
const image = ref<InstanceType<typeof UImg>>();
const ratio = ref(0);
const offset = ref(0);
const imageScale = ref(1);
const speed = computed(() => Math.max(-1, Math.min(1, props.speed)));
const standardScale = computed(() => props.scale === undefined ? undefined : 1 - Math.max(0, Math.min(1, Number(props.scale) || 0)));
// Reserve enough image area for the largest displacement, including negative speeds.
const overscan = computed(() => standardScale.value === undefined ? Math.max(20, Math.abs(speed.value) * 50) + '%' : '0%');
function unit(value?: number | string): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
const styles = computed(() => ({
    '--u-parallax-overscan': overscan.value,
    width: unit(props.width), height: unit(props.height),
    minWidth: unit(props.minWidth), maxWidth: unit(props.maxWidth),
    minHeight: unit(props.minHeight), maxHeight: unit(props.maxHeight), aspectRatio: props.aspectRatio,
    ...roundedStyles(props.tile ? 0 : props.rounded)
}));
const contentClass = computed(() => normalizeClass(props.contentClass));
let frame = 0;
let resizeObserver: ResizeObserver | undefined;
let motionObserver: MutationObserver | undefined;
let motionMedia: MediaQueryList | undefined;

function scrollAncestors(): HTMLElement[] {
    const ancestors: HTMLElement[] = [];
    for (let parent = element.value?.parentElement; parent; parent = parent.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) ancestors.push(parent);
    }
    return ancestors;
}

function measure(): void {
    frame = 0;
    if (!element.value) return;
    const rect = element.value.getBoundingClientRect();
    let top = 0;
    let bottom = window.innerHeight;
    // A nested scroll viewport has its own visible bounds; window.innerHeight alone
    // makes motion barely noticeable or incorrect in drawers and documentation panes.
    for (const parent of scrollAncestors()) {
        const bounds = parent.getBoundingClientRect();
        const scale = parent.offsetHeight ? bounds.height / parent.offsetHeight : 1;
        const start = bounds.top + parent.clientTop * scale;
        top = Math.max(top, start);
        bottom = Math.min(bottom, start + parent.clientHeight * scale);
    }
    const height = Math.max(0, bottom - top);
    ratio.value = Math.max(0, Math.min(1, (bottom - rect.top) / (height + rect.height || 1)));
    const reduced = motionMedia?.matches || document.documentElement.dataset.reducedMotion === 'true';
    if (props.disabled || reduced) { offset.value = 0; imageScale.value = 1; return; }
    if (standardScale.value !== undefined) {
        const displacement = (top + height / 2 - rect.top - rect.height / 2) * standardScale.value;
        offset.value = Math.trunc(displacement);
        imageScale.value = Math.max(1, (standardScale.value * (height - rect.height) + rect.height) / (rect.height || 1));
    } else {
        offset.value = (ratio.value - 0.5) * rect.height * speed.value;
        imageScale.value = 1;
    }
}

function schedule(): void {
    if (!frame && element.value) frame = requestAnimationFrame(measure);
}

function onScroll(event: Event): void {
    if (event.target === document || (event.target instanceof Element && element.value && event.target.contains(element.value))) schedule();
}

function loaded(url: Event | string): void { schedule(); if (typeof url === 'string') emit('load', url); }
function failed(url: Event | string): void { if (typeof url === 'string') emit('error', url); }
function started(url: string): void { schedule(); emit('loadstart', url); }
watch([() => props.speed, () => props.scale, () => props.disabled], schedule);
onMounted(() => {
    // Scroll does not bubble. Capture also receives events from UScrollArea and
    // native overflow containers without requiring callers to bind an extra event.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    resizeObserver = new ResizeObserver(schedule);
    if (element.value) resizeObserver.observe(element.value);
    scrollAncestors().forEach(parent => resizeObserver?.observe(parent));
    motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMedia.addEventListener('change', schedule);
    motionObserver = new MutationObserver(schedule);
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
    schedule();
});
onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', schedule);
    resizeObserver?.disconnect();
    motionObserver?.disconnect();
    motionMedia?.removeEventListener('change', schedule);
    if (frame) cancelAnimationFrame(frame);
});
defineExpose({ element, image, offset, ratio, update: schedule });
</script>
<template>
    <div ref="element" class="u-parallax" :style="styles">
        <div class="u-parallax-background" :style="{ transform: `translateY(${offset}px) scale(${imageScale})` }">
            <slot name="background">
                <UImg v-if="props.src" ref="image" :src="props.src" :srcset="props.srcset" :lazy-src="props.lazySrc"
                    :sizes="props.sizes" :alt="props.alt" :lazy="props.lazy" :eager="props.eager" :options="props.options"
                    :color="props.color" :gradient="props.gradient" :position="props.position" :image-class="props.imageClass"
                    :rounded="props.tile ? 0 : props.rounded" :crossorigin="props.crossorigin" :referrerpolicy="props.referrerpolicy"
                    :draggable="props.draggable" :transition="props.transition" cover standard-protocol width="100%" height="100%"
                    @loadstart="started" @load="loaded" @error="failed">
                    <template v-if="$slots.sources" #sources><slot name="sources" /></template>
                    <template v-if="$slots.placeholder" #placeholder><slot name="placeholder" /></template>
                    <template v-if="$slots.error" #error><slot name="error" /></template>
                </UImg>
            </slot>
        </div>
        <div class="u-parallax-content" :class="contentClass">
            <slot :offset="offset" :ratio="ratio" />
        </div>
    </div>
</template>
