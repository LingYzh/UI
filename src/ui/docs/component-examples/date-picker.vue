<script setup>
import { ref } from 'vue';
import { UDatePicker } from '../../index';
const date = ref('2026-10-06');
const range = ref(['2026-10-06', '2026-10-10']);
</script>

<template>
    <div class="component-demo" data-demo-component="UDatePicker">
        <u-date-picker v-model="range" mode="range" locale="zh-CN" label="日期范围" min="2026-10-01" max="2026-10-31" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
