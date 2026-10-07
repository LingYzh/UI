<script setup>
import { ref } from 'vue';
import { UNumberInput } from '../../index';
const number = ref(5);
</script>

<template>
    <div class="component-demo" data-demo-component="UNumberInput">
        <u-number-input
            v-model="number"
            label="执行并发数"
            :min="1"
            :max="10"
            :step="1"
            hint="按钮与方向键均遵守 1–10 边界。"
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
