<script setup>
import { ref } from 'vue';
import { UDateInput } from '../../index';
const date = ref('2026-10-06');
</script>

<template>
    <div class="component-demo" data-demo-component="UDateInput">
        <u-date-input v-model="date" label="开始日期" hint="输入 ISO 日期或打开日历选择。" />
        <output>当前日期：{{ date }}</output>
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
