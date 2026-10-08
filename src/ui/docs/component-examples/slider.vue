<script setup>
import { ref } from 'vue';
import { USlider } from '../../index';
const progress = ref(35.125);
</script>

<template>
    <div class="component-demo" data-demo-component="USlider">
        <u-slider
            v-model="progress"
            label="连续进度"
            thumb-label
            hint="默认连续小数；显式 step 限制步长。"
        />
        <output>{{ progress }}</output>
        <u-slider :model-value="40" :step="10" show-ticks label="按 10 步进" />
        <div class="demo-row">
            <u-slider
                :model-value="35"
                direction="vertical"
                :ticks="{ 0: '0', 50: '50', 100: '100' }"
                show-ticks
                thumb-label="always"
                label="纵向"
            />
            <u-slider
                :model-value="35"
                direction="vertical"
                reverse
                thumb-label="always"
                label="纵向反转"
            />
        </div>
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
