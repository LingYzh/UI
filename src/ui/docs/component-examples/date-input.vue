<script setup>
import { ref } from 'vue';
import { UDateInput } from '../../index';
const date = ref(new Date(2026, 9, 6));
const range = ref([new Date(2026, 9, 6), new Date(2026, 9, 10)]);
function describe(value) {
    return (Array.isArray(value) ? value : value ? [value] : [])
        .map((date) => (date instanceof Date ? date.toLocaleDateString('zh-CN') : date))
        .join(' - ');
}
</script>

<template>
    <div class="component-demo" data-demo-component="UDateInput">
        <u-date-input
            v-model="date"
            label="开始日期"
            input-format="yyyy-mm-dd"
            hint="输入 ISO 日期或打开日历，输出 Date 对象。"
        />
        <u-date-input
            v-model="range"
            label="需确认的范围草稿"
            multiple="range"
            :hide-actions="false"
            input-format="yyyy-mm-dd"
        />
        <output>Date 模型：{{ describe(date) }}；范围：{{ describe(range) }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
</style>
