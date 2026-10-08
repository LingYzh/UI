<script setup>
import { ref } from 'vue';
import { UDataTable, UButton, USelect } from '../../index';
const opened = ref([]);
const pageBy = ref('group');
const groupBy = ref([
    { key: 'category', order: 'asc' },
    { key: 'status', order: 'desc' },
]);
const headers = [
    { key: 'title', title: '工作区' },
    { key: 'category', title: '分类' },
    { key: 'status', title: '状态' },
    { key: 'count', title: '任务数', align: 'end' },
];
const items = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: index < 8 ? '开发' : '设计',
    status: index % 2 ? '就绪' : '进行中',
    count: index + 2,
}));
function groupKey({ key, value, parentKey }) {
    return `${parentKey ?? 'root'}/${key}:${value}`;
}
</script>

<template>
    <div class="table-demo" data-table-demo="grouping">
        <div class="table-demo-controls">
            <u-select v-model="pageBy" aria-label="分组分页方式" dense>
                <option value="group">按根分组</option>
                <option value="item">按数据项</option>
                <option value="any">按可见行</option>
            </u-select>
            <u-button dense @click="opened = []">收起全部</u-button>
        </div>
        <u-data-table
            :headers="headers"
            :items="items"
            :group-key="groupKey"
            :page-by="pageBy"
            :items-per-page="1"
            :items-per-page-options="[1, 5, 10, -1]"
            :mobile="false"
            show-select
            open-all
            label="嵌套分组与汇总"
            v-model:group-by="groupBy"
            v-model:opened="opened"
        >
            <template #data-table-group="{ item, count, props, columns }">
                <td :colspan="columns.length - 1" class="table-demo-group-cell">
                    <u-button
                        v-bind="props"
                        variant="text"
                        :style="{ marginInlineStart: item.depth * 16 + 'px' }"
                        :aria-label="`切换${item.value}分组`"
                    />
                    <span>{{ item.value }}（{{ count }}）</span>
                </td>
            </template>
            <template #group-summary="{ item, columns, extractRows }">
                <tr class="table-demo-summary">
                    <td :colspan="columns.length">
                        {{ item.value }}汇总：{{
                            extractRows(item.items).reduce((sum, row) => sum + row.raw.count, 0)
                        }}
                        个任务
                    </td>
                </tr>
            </template>
        </u-data-table>
        <output>opened：{{ JSON.stringify(opened) }}</output>
    </div>
</template>
