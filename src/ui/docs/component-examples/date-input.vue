<script setup>
import { ref } from 'vue';
import { UDateInput } from '../../index';
const date = ref(new Date(2026, 9, 6));
const range = ref([new Date(2026, 9, 6), new Date(2026, 9, 10)]);
const editableDate = ref(new Date(2026, 9, 6));
const week = ref(new Date(2026, 9, 6));
const month = ref(new Date(2026, 9, 6));
const year = ref(new Date(2026, 9, 6));
const dateTime = ref(new Date(2026, 9, 6, 9, 30, 15));
const dateTimeRange = ref([new Date(2026, 9, 6, 9, 0, 0), new Date(2026, 9, 10, 17, 30, 0)]);
function describe(value) {
    return (Array.isArray(value) ? value : value ? [value] : [])
        .map((date) => (date instanceof Date ? date.toLocaleDateString('zh-CN') : date))
        .join(' - ');
}
function describeDateTime(value) {
    return (Array.isArray(value) ? value : value ? [value] : [])
        .map((date) => (date instanceof Date ? date.toLocaleString('zh-CN') : date))
        .join(' - ');
}
</script>

<template>
    <div class="component-demo" data-demo-component="UDateInput">
        <u-date-input
            v-model="date"
            label="开始日期"
            input-format="yyyy-mm-dd"
            clearable
            hint="默认仅通过日历选择；点击日期区域或按 Enter 打开。"
        />
        <u-date-input
            v-model="range"
            label="需确认的范围草稿"
            multiple="range"
            :hide-actions="false"
            input-format="yyyy-mm-dd"
        />
        <UDateInput
            v-model="week"
            label="按周选择"
            granularity="week"
            input-format="YYYY 第 ww 周"
        />
        <UDateInput v-model="month" label="按月选择" granularity="month" input-format="YYYY-MM" />
        <UDateInput v-model="year" label="按年选择" granularity="year" input-format="YYYY" />
        <UDateInput v-model="dateTime" label="日期时间" datetime clearable />
        <UDateInput
            v-model="dateTimeRange"
            label="日期时间范围"
            multiple="range"
            datetime
            :hide-actions="false"
        />
        <UDateInput
            v-model="range"
            label="自定义范围分隔符"
            multiple="range"
            range-separator=" 至 "
            input-format="yyyy-mm-dd"
        />
        <UDateInput
            v-model="dateTimeRange"
            label="日期时间自定义分隔符"
            multiple="range"
            datetime
            range-separator=" ~ "
        />
        <output>
            Date 模型：{{ describe(date) }}；范围：{{ describe(range) }}；周/月/年：{{
                describe(week)
            }}
            / {{ describe(month) }} / {{ describe(year) }}；日期时间：{{
                describeDateTime(dateTime)
            }}
            / {{ describeDateTime(dateTimeRange) }}
        </output>
        <UDateInput
            v-model="editableDate"
            label="允许手动填写"
            editable
            input-format="yyyy-mm-dd"
            hint="显式 editable 恢复手动输入，Enter 或离开输入框后提交。"
        />
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
