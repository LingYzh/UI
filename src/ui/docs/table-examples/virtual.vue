<script setup>
import { ref } from 'vue';
import { UDataTableVirtual, UTextField, UButton, USwitch } from '../../index';
const table = ref();
const query = ref('');
const selected = ref([]);
const expanded = ref([]);
const grouped = ref(false);
const headers = [
    { key: 'title', title: '工作区', width: 170, fixed: 'start' },
    { key: 'category', title: '分类', width: 110 },
    { key: 'description', title: '可变高度说明', minWidth: 260, sortable: false },
    { key: 'count', title: '任务数', width: 90, align: 'end' },
];
const items = Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: index < 5000 ? '开发' : '设计',
    description:
        index % 7
            ? '短说明。'
            : '长说明可以换行，虚拟窗口会测量实际高度；展开详情也参加测量，避免滚动时出现重叠和空洞。',
    count: index,
    selectable: index % 5 !== 1,
}));
function goLast() {
    table.value?.scrollToIndex(grouped.value ? 10001 : 9999);
}
</script>

<template>
    <div class="table-demo" data-table-demo="virtual">
        <div class="table-demo-controls">
            <u-text-field
                v-model="query"
                aria-label="虚拟表格搜索"
                placeholder="搜索一万条数据"
                dense
            />
            <u-switch v-model="grouped" label="显示分组" />
            <u-button dense @click="goLast">滚动到末行</u-button>
        </div>
        <u-data-table-virtual
            ref="table"
            :headers="headers"
            :items="items"
            :search="query"
            :group-by="grouped ? [{ key: 'category' }] : []"
            :height="320"
            :width="750"
            :mobile="false"
            :item-height="44"
            :overscan="4"
            item-selectable="selectable"
            show-select
            show-expand
            open-all
            multi-sort
            label="一万行虚拟表格"
            v-model="selected"
            v-model:expanded="expanded"
        >
            <template #expanded-row="{ item, columns }">
                <tr class="table-demo-expanded">
                    <td :colspan="columns.length">
                        <strong>{{ item.title }}</strong>
                        <p>
                            可变高度详情与普通数据行共用滚动偏移；Ctrl+End
                            可定位末行，改变搜索或排序会同时复位真实滚动位置。
                        </p>
                        <p>{{ item.category }} · {{ item.count }} 个任务。</p>
                    </td>
                </tr>
            </template>
            <template #bottom>
                <p class="table-demo-note">虚拟表格展示全部过滤结果；只有视口附近的行进入 DOM。</p>
            </template>
        </u-data-table-virtual>
        <output>选择 {{ selected.length }} 项；展开 {{ expanded.length }} 项。</output>
    </div>
</template>
