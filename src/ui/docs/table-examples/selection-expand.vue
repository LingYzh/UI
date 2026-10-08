<script setup>
import { ref } from 'vue';
import { UDataTable, USelect, USwitch, UButton } from '../../index';
const strategy = ref('page');
const objects = ref(false);
const single = ref(false);
const selected = ref([]);
const expanded = ref([]);
const headers = [
    { key: 'title', title: '工作区' },
    { key: 'category', title: '分类' },
    { key: 'count', title: '任务数', align: 'end' },
];
const items = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: `工作区 ${index + 1}`,
    category: index % 2 ? '开发' : '设计',
    count: index * 3,
    selectable: index !== 1,
}));
function reset() {
    selected.value = [];
    expanded.value = [];
}
</script>

<template>
    <div class="table-demo" data-table-demo="selection-expand">
        <div class="table-demo-controls">
            <u-select v-model="strategy" aria-label="选择策略" dense>
                <option value="page">当前页</option>
                <option value="all">全部数据</option>
                <option value="single">单选</option>
            </u-select>
            <u-switch v-model="objects" label="返回对象" @update:model-value="reset" />
            <u-switch v-model="single" label="单行展开" />
            <u-button dense @click="reset">清空模型</u-button>
        </div>
        <u-data-table
            :headers="headers"
            :items="items"
            :items-per-page="5"
            :items-per-page-options="[5, 10, -1]"
            :select-strategy="strategy"
            :return-object="objects"
            :expand-strategy="single ? 'single' : 'multiple'"
            :mobile="false"
            item-selectable="selectable"
            show-select
            show-expand
            expand-on-click
            label="选择与展开"
            v-model="selected"
            v-model:expanded="expanded"
        >
            <template #top>
                <p class="table-demo-note">
                    第 2 行不可选择；翻页保留选择，Shift
                    点击范围选择。点击普通行可展开，按钮不触发行操作。
                </p>
            </template>
            <template #item.data-table-expand="{ props }">
                <u-button v-bind="props" variant="text" aria-label="切换详情" />
            </template>
            <template #expanded-row="{ columns, item }">
                <tr class="table-demo-expanded">
                    <td :colspan="columns.length">
                        <strong>{{ item.title }}</strong>
                        <p>
                            {{ item.category }} · {{ item.count }} 个任务。标准 expanded-row
                            返回完整 tr/td。
                        </p>
                    </td>
                </tr>
            </template>
        </u-data-table>
        <output>选择：{{ JSON.stringify(selected) }}；展开：{{ JSON.stringify(expanded) }}</output>
    </div>
</template>
