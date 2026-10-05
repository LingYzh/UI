<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed } from 'vue';
const rawProps = withDefaults(defineProps<{ modelValue?: number; max?: number; indeterminate?: boolean; size?: number; width?: number; label?: string; disabled?: boolean }>(), { modelValue: 0, max: 100, size: 32, width: 3 });
const props = useDefaults(rawProps, 'UProgressCircular');
const safeMax = computed(() => Number.isFinite(props.max) && props.max > 0 ? props.max : 100);
const value = computed(() => Math.max(0, Math.min(safeMax.value, Number.isFinite(props.modelValue) ? props.modelValue : 0)));
const ratio = computed(() => value.value / safeMax.value);
const radius = computed(() => Math.max(1, (props.size - props.width) / 2));
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(() => circumference.value * (1 - ratio.value));
</script>
<template>
    <div class="u-progress-circular" role="progressbar" :aria-label="props.label" :aria-valuemin="0" :aria-valuemax="safeMax" :aria-valuenow="props.indeterminate ? undefined : value" :class="{ 'is-indeterminate': props.indeterminate, 'is-disabled': props.disabled }" :style="{ width: props.size + 'px', height: props.size + 'px' }"><svg :viewBox="'0 0 ' + props.size + ' ' + props.size" aria-hidden="true"><circle class="u-progress-track" :cx="props.size / 2" :cy="props.size / 2" :r="radius" :stroke-width="props.width" /><circle class="u-progress-value" :cx="props.size / 2" :cy="props.size / 2" :r="radius" :stroke-width="props.width" :stroke-dasharray="circumference" :stroke-dashoffset="props.indeterminate ? circumference * .72 : dashOffset" /></svg><span class="u-progress-content"><slot :value="value" :ratio="ratio" /></span></div>
</template>
