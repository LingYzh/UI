<script setup>
import { ref } from 'vue';
import { UDataTable, USelect } from '../../index';
const density = ref('default');
const headers = [
    { key: 'name', title: '工作区', value: 'meta.name', fixed: 'start', width: 150, nowrap: true },
    {
        title: '资源统计',
        children: [
            { key: 'files', title: '文件数', width: 130, align: 'end' },
            {
                key: 'size',
                title: '容量',
                width: 140,
                align: 'end',
                value: (item) => item.files * 1.25,
            },
        ],
    },
    { key: 'description', title: '说明', minWidth: 300, sortable: false },
    { key: 'status', title: '状态', fixed: 'end', width: 100 },
];
const items = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    meta: { name: `工作区 ${index + 1}` },
    files: index * 7 + 3,
    description: '嵌套表头、取值映射与左右固定列共用标准化叶列。',
    status: index % 2 ? '就绪' : '进行中',
}));
function rowProps({ item }) {
    return { 'data-status': item.status };
}
function cellProps({ column }) {
    return column.key === 'files' ? { class: 'table-demo-number' } : {};
}
</script>

<template>
    <div class="table-demo" data-table-demo="columns">
        <u-select v-model="density" aria-label="列示例密度" dense>
            <option value="default">默认密度</option>
            <option value="compact">紧凑</option>
        </u-select>
        <u-data-table
            :headers="headers"
            :items="items"
            :density="density"
            :row-props="rowProps"
            :cell-props="cellProps"
            :height="280"
            :width="850"
            :mobile="false"
            fixed-header
            fixed-footer
            gridlines="all"
            label="嵌套与固定列"
        >
            <template #caption>
                <caption>横向滚动可检查两侧固定列；点击容量列按取值函数排序。</caption>
            </template>
            <template #item.size="{ value }">
                <code>{{ value.toFixed(2) }} MB</code>
            </template>
            <template #header.files="{ column }">
                <strong>{{ column.title }}</strong>
            </template>
            <template #tfoot="{ columns, items }">
                <tfoot>
                    <tr>
                        <th scope="row">本页合计</th>
                        <td :colspan="columns.length - 1">
                            {{ items.reduce((sum, item) => sum + item.files, 0) }} 个文件
                        </td>
                    </tr>
                </tfoot>
            </template>
            <template #footer.prepend>
                <span class="table-demo-note">标准 footer.prepend</span>
            </template>
        </u-data-table>
    </div>
</template>
