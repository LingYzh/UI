<script setup lang="ts">
import UProgressLinear from './UProgressLinear.vue';

withDefaults(defineProps<{
    value?: number;
    max?: number;
    tone?: 'accent' | 'success' | 'warning' | 'error';
    dense?: boolean;
    /** 进度条的可访问名称，例如“批量注册进度”。 */
    label?: string;
}>(), { value: 0, max: 100, tone: 'accent', dense: false });
</script>

<template>
    <UProgressLinear
        class="ui-progress"
        :model-value="value"
        :max="max"
        :label="label"
        :class="{ 'is-dense': dense }"
        :data-tone="tone"
    />
</template>
