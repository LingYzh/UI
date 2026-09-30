<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{
    value?: number;
    max?: number;
    tone?: 'accent' | 'success' | 'warning' | 'error';
    dense?: boolean;
    /** 进度条的可访问名称，例如“批量注册进度”。 */
    label?: string;
}>(), { value: 0, max: 100, tone: 'accent', dense: false });
// 越界与非法值收敛到 [0, max]，避免填充溢出轨道；max 非正数时视为空进度。
const safeMax = computed(() => (Number.isFinite(props.max) && props.max > 0 ? props.max : 100));
const clamped = computed(() => (Number.isFinite(props.value) ? Math.min(safeMax.value, Math.max(0, props.value)) : 0));
const ratio = computed(() => clamped.value / safeMax.value);
</script>

<template>
    <div class="ui-progress" :class="{ 'is-dense': dense }" :data-tone="tone" role="progressbar" :aria-label="label" aria-valuemin="0" :aria-valuemax="safeMax" :aria-valuenow="clamped">
        <span class="ui-progress-fill" :style="{ transform: `scaleX(${ratio})` }"></span>
    </div>
</template>
