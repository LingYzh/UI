<script setup lang="ts">
import { computed, nextTick, normalizeClass, onBeforeUnmount, ref, useId, useSlots, watch } from 'vue';
import { useDefaults } from './defaults';
import { buildSparklineGeometry, moveSparklineIndex, sparklineFocusIndex, sparklineIndexFromPointer, sparklineTooltipDefaults, type SparklineOptions } from './sparkline';
const rawProps = withDefaults(defineProps<SparklineOptions & {
    interactive?: boolean; tooltip?: boolean | { showCrosshair?: boolean; offset?: number; titleFormat?: (item: { index: number; value: number }) => string; class?: unknown };
    autoDraw?: boolean; autoDrawDuration?: number | string; autoDrawEasing?: string; color?: string;
}>(), { width: 120, height: 40, lineWidth: 2 });
const props = useDefaults(rawProps, 'USparkline');
const slots = useSlots();
const currentIndex = defineModel<number | null>('currentIndex', { default: null });
const emit = defineEmits<{ 'start': []; 'end': [] }>();
const svg = ref<SVGSVGElement>();
const path = ref<SVGPathElement>();
const gradientId = `sparkline-${useId()}`;
const geometry = computed(() => buildSparklineGeometry({ ...props, labelSlot: !!slots.label }));
const stroke = computed(() => props.gradient?.length ? `url(#${gradientId})` : props.color ?? 'currentColor');
const tooltipOptions = computed(() => sparklineTooltipDefaults(geometry.value.type, props.tooltip));
const activePoint = computed(() => currentIndex.value == null ? undefined : geometry.value.type === 'bar' ? geometry.value.bars[currentIndex.value] : geometry.value.points[currentIndex.value]);
const active = ref(false);
let animation: Animation | undefined;
function onMove(event: PointerEvent) {
    if (!props.interactive || !svg.value) return;
    currentIndex.value = sparklineIndexFromPointer(event.clientX, svg.value.getBoundingClientRect(), geometry.value);
    active.value = true;
}
function onKeydown(event: KeyboardEvent) {
    if (!props.interactive) return;
    const index = moveSparklineIndex(currentIndex.value, event.key, geometry.value.values.length);
    if (index !== undefined) { event.preventDefault(); currentIndex.value = index; active.value = true; }
    if (event.key === 'Escape') exit();
}
function exit() { active.value = false; currentIndex.value = null; }
watch(() => geometry.value.values.length, count => { if (currentIndex.value != null && currentIndex.value >= count) currentIndex.value = count ? count - 1 : null; });
watch(() => geometry.value.path, async () => {
    animation?.cancel();
    if (!props.autoDraw && !props.animation) return;
    await nextTick();
    if (!path.value || !path.value.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const length = path.value.getTotalLength();
    const options = typeof props.animation === 'object' ? props.animation : {};
    emit('start');
    animation = path.value.animate([{ strokeDasharray: `${length}`, strokeDashoffset: length }, { strokeDasharray: `${length}`, strokeDashoffset: 0 }], { duration: Number(props.autoDrawDuration ?? options.duration ?? 2000), easing: props.autoDrawEasing ?? options.easing ?? 'ease', fill: 'none' });
    animation.onfinish = () => emit('end');
}, { immediate: true, flush: 'post' });
onBeforeUnmount(() => animation?.cancel());
</script>

<template>
    <div class="u-sparkline-container" :style="{ color: props.color }">
        <svg ref="svg" class="u-sparkline" :style="{ height: geometry.totalHeight + 'px' }" :viewBox="`0 0 ${geometry.totalWidth} ${geometry.totalHeight}`" :role="props.interactive ? 'application' : 'img'" aria-label="趋势图" :tabindex="props.interactive ? 0 : undefined" preserveAspectRatio="none" @pointermove="onMove" @pointerleave="exit" @keydown="onKeydown" @focus="props.interactive && (currentIndex = sparklineFocusIndex(geometry.values.length), active = true)" @blur="exit">
            <defs v-if="props.gradient?.length"><linearGradient :id="gradientId" v-bind="{ x1: geometry.gradient.x1, y1: geometry.gradient.y1, x2: geometry.gradient.x2, y2: geometry.gradient.y2 }"><stop v-for="(stop, index) in geometry.gradient.stops" :key="index" :offset="stop.offset * 100 + '%'" :stop-color="stop.color" /></linearGradient></defs>
            <slot :points="geometry.points" :path="geometry.path" :bars="geometry.bars">
                <path v-if="geometry.type === 'trend'" ref="path" :d="geometry.path" :fill="props.fill ? stroke : 'none'" :stroke="props.fill ? undefined : stroke" :stroke-width="geometry.lineWidth" vector-effect="non-scaling-stroke" />
                <rect v-for="bar in geometry.bars" :key="bar.index" :x="bar.x + geometry.barOffsetX" :y="bar.y" :width="geometry.lineWidth" :height="bar.height" :rx="geometry.cornerRadius" :fill="stroke" />
            </slot>
            <text v-for="label in geometry.hasLabels ? geometry.labels : []" :key="label.index" :x="label.x" :y="label.y" :font-size="label.fontSize" text-anchor="middle" fill="currentColor"><slot name="label" :index="label.index" :value="label.value">{{ label.value }}</slot></text>
            <template v-if="props.interactive && activePoint">
                <line v-if="props.tooltip && tooltipOptions.showCrosshair" :x1="activePoint.x" :x2="activePoint.x" :y1="geometry.boundary.minY" :y2="geometry.height" stroke="currentColor" stroke-dasharray="2 2" opacity=".4" />
                <circle v-if="geometry.type === 'trend'" :cx="activePoint.x" :cy="activePoint.y" :r="geometry.markerRadius" :fill="stroke" />
            </template>
        </svg>
        <div v-if="props.tooltip && active && activePoint && currentIndex != null" class="u-sparkline-tooltip" :class="normalizeClass(tooltipOptions.class)" role="tooltip" :style="{ left: Math.max(0, Math.min(100, activePoint.x / geometry.totalWidth * 100)) + '%', bottom: (tooltipOptions.offset ?? 8) + 'px' }"><slot name="tooltip" :index="currentIndex" :value="activePoint.value">{{ tooltipOptions.titleFormat({ index: currentIndex, value: activePoint.value }) }}</slot></div>
    </div>
</template>
