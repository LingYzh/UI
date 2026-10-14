<script setup>
import { ref } from 'vue';
import { URangeSlider } from '../../index';
const range = ref([20.125, 70.875]);
const vertical = ref([25, 75]);
const coincident = ref([50, 50]);
</script>

<template>
    <div class="component-demo" data-demo-component="URangeSlider">
        <u-range-slider
            v-model="range"
            label="连续小数范围"
            hint="默认步长为 0，重合后可向两侧拖动来重新分开。"
        />
        <output>{{ range }}</output>
        <u-range-slider
            v-model="coincident"
            label="从重合位置开始拖动"
            :step="1"
            thumb-label="always"
        />
        <u-range-slider
            v-model="vertical"
            direction="vertical"
            :step="1"
            :ticks="{ 0: '0', 50: '50', 100: '100' }"
            show-ticks
            thumb-label="always"
            label="纵向范围"
        />
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
</style>
