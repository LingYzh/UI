<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed } from 'vue';
const rawProps = withDefaults(defineProps<{ values: readonly number[]; width?: number; height?: number; min?: number; max?: number }>(), { width: 120, height: 40 });
const props = useDefaults(rawProps, 'USparkline');
const finite = computed(() => props.values.map((value) => Number.isFinite(value) ? value : 0));
const bounds = computed(() => { const minimum = props.min ?? Math.min(...finite.value, 0); const maximum = props.max ?? Math.max(...finite.value, 1); return { minimum, maximum: maximum > minimum ? maximum : minimum + 1 }; });
const points = computed(() => finite.value.map((value, index) => ({ x: finite.value.length < 2 ? props.width / 2 : index * props.width / (finite.value.length - 1), y: props.height - (value - bounds.value.minimum) / (bounds.value.maximum - bounds.value.minimum) * props.height, value })));
const path = computed(() => points.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '));
</script>
<template>
    <svg class="u-sparkline" :viewBox="'0 0 ' + props.width + ' ' + props.height" role="img" aria-label="趋势图" preserveAspectRatio="none"><slot :points="points" :path="path"><path :d="path" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" /></slot></svg>
</template>
