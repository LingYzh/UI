<script setup>
import { ref } from 'vue';
import { URangeSlider } from '../../index';
const range = ref([20, 70]);
</script>

<template>
    <div class="component-demo" data-demo-component="URangeSlider">
        <u-range-slider v-model="range" label="可接受范围" hint="两个手柄不能越过彼此。" />
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
