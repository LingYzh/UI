<script setup>
import { ref } from 'vue';
import {
    UDataTable,
    UDataTableVirtual,
    UDataIterator,
    UTextField,
    UButton,
    UCard,
    UProgressCircular,
    UProgressLinear,
    UDateInput,
    UDatePicker,
    UTimePicker,
    UCalendar,
    UPicker,
    UConfirmEdit,
} from '../index';
defineProps({ example: String });
const headers = [
    { key: 'title', title: '工作区', sortable: true },
    { key: 'category', title: '分类', sortable: true },
    { key: 'count', title: '任务数', sortable: true, align: 'end' },
];
const items = Array.from({ length: 60 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: index % 2 ? '设计' : '开发',
    count: (index * 7) % 31,
}));
const largeItems = Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: '开发',
    count: index,
}));
const search = ref('');
const selected = ref([]);
const expanded = ref([]);
const groups = ref([]);
const page = ref(1);
const date = ref('2026-10-06');
const range = ref(['2026-10-06', '2026-10-10']);
const time = ref('09:30');
const chosen = ref('设计');
const title = ref('工作区名称');
const progress = ref(40);
</script>

<template>
    <div class="completion-demo">
        <template v-if="example === 'completion-data'">
            <div class="completion-toolbar">
                <UTextField v-model="search" label="搜索工作区" clearable style="flex: 1" />
                <UButton @click="groups = groups.length ? [] : [{ key: 'category', order: 'asc' }]">
                    {{ groups.length ? '取消分组' : '按分类分组' }}
                </UButton>
            </div>
            <UDataTable
                v-model="selected"
                v-model:expanded="expanded"
                v-model:group-by="groups"
                :headers="headers"
                :items="items"
                :search="search"
                show-select
                show-expand
                multi-sort
                label="工作区列表"
            >
                <template #expanded-row="{ item }">
                    {{ item.title }} · {{ item.category }} · 可在插槽放入详情。
                </template>
            </UDataTable>
            <output class="text-muted">选择了 {{ selected.length }} 项</output>
        </template>
        <template v-else-if="example === 'completion-virtual-data'">
            <UTextField v-model="search" label="搜索 10,000 行" clearable class="mb-4" />
            <UDataTableVirtual
                :headers="headers"
                :items="largeItems"
                :search="search"
                :height="260"
                label="虚拟工作区列表"
            />
        </template>
        <template v-else-if="example === 'completion-iterator'">
            <UDataIterator v-model:page="page" :items="items" :items-per-page="4">
                <template #default="{ items: current, pageCount, nextPage, prevPage }">
                    <div class="completion-grid">
                        <UCard
                            v-for="item in current"
                            :key="item.id"
                            :title="item.title"
                            :subtitle="item.category"
                        >
                            {{ item.count }} 个任务
                        </UCard>
                    </div>
                    <div class="completion-toolbar mt-4">
                        <UButton :disabled="page === 1" @click="prevPage">上一页</UButton>
                        <output>{{ page }} / {{ pageCount }}</output>
                        <UButton :disabled="page === pageCount" @click="nextPage">下一页</UButton>
                    </div>
                </template>
            </UDataIterator>
        </template>
        <template v-else-if="example === 'completion-dates'">
            <div class="completion-grid">
                <div>
                    <UDateInput
                        v-model="date"
                        label="开始日期"
                        hint="输入 ISO 日期或打开日历选择。"
                    />
                    <UTimePicker v-model="time" label="执行时间" class="mt-4" />
                    <UPicker v-model="chosen" :items="['设计', '开发', '文档']" class="mt-4" />
                </div>
                <UDatePicker
                    v-model="range"
                    mode="range"
                    locale="zh-CN"
                    label="日期范围"
                    min="2026-10-01"
                    max="2026-10-31"
                />
            </div>
            <UCalendar
                v-model="date"
                locale="zh-CN"
                :events="[
                    { id: 1, title: '设计评审', start: '2026-10-06' },
                    { id: 2, title: '组件验收', start: '2026-10-10' },
                ]"
                class="mt-4"
            />
            <UConfirmEdit v-model="title" class="mt-4">
                <template #default="{ model }">
                    <UTextField v-model="model.value" label="编辑名称" />
                </template>
            </UConfirmEdit>
            <output>{{ title }}</output>
        </template>
        <template v-else>
            <div class="completion-toolbar">
                <UButton @click="progress = (progress + 20) % 120">增加进度</UButton>
                <UProgressCircular :model-value="progress" label="确定进度">
                    <template #default="{ value }">{{ value }}</template>
                </UProgressCircular>
                <UProgressCircular indeterminate label="处理中" />
            </div>
            <UProgressLinear :model-value="progress" :buffer-value="80" label="后台执行进度" />
            <UProgressLinear indeterminate class="mt-4" label="正在等待服务" />
        </template>
    </div>
</template>
