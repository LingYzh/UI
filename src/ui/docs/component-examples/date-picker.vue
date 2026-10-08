<script setup>
import { ref } from 'vue';
import { UDatePicker, USelect, USwitch } from '../../index';
const date = ref(new Date(2026, 9, 6));
const range = ref([new Date(2026, 9, 6), new Date(2026, 9, 10)]);
const locale = ref('zh-CN');
const sunday = ref(false);
const yearOnly = ref(false);
const weekThreshold = ref('locale');
function describe(value) {
    return (Array.isArray(value) ? value : value ? [value] : [])
        .map((date) => (date instanceof Date ? date.toLocaleDateString('zh-CN') : date))
        .join(' - ');
}
</script>

<template>
    <div class="component-demo" data-demo-component="UDatePicker">
        <u-select
            v-model="locale"
            :items="['zh-CN', 'zh-HK', 'en-US', 'en-GB']"
            label="语言地区与周起始日"
        />
        <u-switch v-model="sunday" label="显式指定周日开始" />
        <u-switch v-model="yearOnly" label="标题直接选择年份" />
        <u-select
            v-model="weekThreshold"
            :items="[
                { value: 'locale', label: '地区默认周号' },
                { value: '0', label: '周日阈值（0）' },
                { value: '4', label: '周四阈值（4）' },
            ]"
            label="周一年份阈值"
        />
        <u-date-picker
            v-model="date"
            :locale="locale"
            :first-day-of-week="sunday ? 0 : undefined"
            :first-day-of-year="weekThreshold === 'locale' ? undefined : weekThreshold"
            :no-month-picker="yearOnly"
            label="默认隐藏相邻日期"
            show-week
            :events="['2026-10-06', '2026-10-10']"
            event-color="var(--accent)"
        />
        <u-date-picker
            v-model="range"
            multiple="range"
            :locale="locale"
            :first-day-of-week="sunday ? 0 : undefined"
            label="日期范围与悬停预览"
            min="2026-10-01"
            max="2026-10-31"
            show-adjacent-months
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
