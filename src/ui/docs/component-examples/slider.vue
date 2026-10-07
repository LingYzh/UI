<script setup>
import { ref } from 'vue';
import { USlider } from '../../index';
const progress = ref(35);
</script>

<template>
    <div class="component-demo" data-demo-component="USlider">
        <u-slider v-model="progress" label="进度" thumb-label show-ticks />
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
