<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed } from 'vue';
const rawProps = withDefaults(defineProps<{ modelValue?: number; max?: number; bufferValue?: number; indeterminate?: boolean; stream?: boolean; label?: string; disabled?: boolean }>(), { modelValue: 0, max: 100 });
const props = useDefaults(rawProps, 'UProgressLinear');
const safeMax = computed(() => Number.isFinite(props.max) && props.max > 0 ? props.max : 100);
const value = computed(() => Math.max(0, Math.min(safeMax.value, Number.isFinite(props.modelValue) ? props.modelValue : 0)));
const buffer = computed(() => Math.max(value.value, Math.min(safeMax.value, Number.isFinite(props.bufferValue) ? props.bufferValue! : safeMax.value)));
const ratio = computed(() => value.value / safeMax.value);
const bufferRatio = computed(() => buffer.value / safeMax.value);
</script>
<template>
    <div class="u-progress-linear" role="progressbar" :aria-label="props.label" :aria-valuemin="0" :aria-valuemax="safeMax" :aria-valuenow="props.indeterminate ? undefined : value" :class="{ 'is-indeterminate': props.indeterminate, 'is-stream': props.stream, 'is-disabled': props.disabled }"><span class="u-progress-buffer" :style="{ width: bufferRatio * 100 + '%' }" /><span class="u-progress-value" :style="{ width: props.indeterminate ? '35%' : ratio * 100 + '%' }" /><span class="u-progress-content"><slot :value="value" :ratio="ratio" /></span></div>
</template>
