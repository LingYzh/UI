<script setup>
import { computed, ref } from 'vue';
import { UDataTable, UTextField, USelect, USwitch } from '../../index';
const query = ref('');
const mode = ref('intersection');
const accent = ref(true);
const scoreFilter = ref(false);
const noFilter = ref(false);
const disabledSort = ref(false);
const sortBy = ref([]);
const items = [
    { id: 1, title: 'Éclair', category: '开发', score: 42 },
    { id: 2, title: 'Alpha', category: '开发', score: 12 },
    { id: 3, title: 'Beta', category: '设计', score: 36 },
    { id: 4, title: 'Café', category: '设计', score: 8 },
    { id: 5, title: 'Gamma', category: '开发', score: 36 },
];
const headers = [
    { key: 'title', title: '名称' },
    { key: 'category', title: '分类' },
    { key: 'score', title: '得分', align: 'end' },
];
const filters = computed(() =>
    scoreFilter.value
        ? {
              score: function highScore(value) {
                  return value >= 30;
              },
          }
        : {}
);
function scoreSort(a, b) {
    return Number(a) - Number(b);
}
</script>

<template>
    <div class="table-demo" data-table-demo="filter-sort">
        <div class="table-demo-controls">
            <u-text-field
                v-model="query"
                aria-label="搜索表格"
                placeholder="试试 eclair、cafe 或开发"
                dense
            />
            <u-select v-model="mode" aria-label="过滤模式" dense>
                <option value="intersection">交集</option>
                <option value="union">并集</option>
                <option value="every">每列</option>
                <option value="some">任意列</option>
            </u-select>
        </div>
        <div class="table-demo-controls">
            <u-switch v-model="accent" label="忽略重音" />
            <u-switch v-model="scoreFilter" label="自定义得分 ≥ 30" />
            <u-switch v-model="noFilter" label="跳过过滤" />
            <u-switch v-model="disabledSort" label="禁用排序" />
        </div>
        <u-data-table
            :headers="headers"
            :items="items"
            :search="query"
            :ignore-accents="accent"
            :custom-key-filter="filters"
            :filter-mode="mode"
            :no-filter="noFilter"
            :custom-key-sort="{ score: scoreSort }"
            :disable-sort="disabledSort"
            :multi-sort="{ key: 'ctrl', mode: 'append', modifier: 'shift' }"
            :mobile="false"
            must-sort
            initial-sort-order="desc"
            label="过滤与排序策略"
            v-model:sort-by="sortBy"
        >
            <template #top>
                <p class="table-demo-note">
                    首次降序；must-sort 保留排序。Ctrl/Command 添加列，Shift 反转排序优先级。
                </p>
            </template>
        </u-data-table>
        <output>sort-by：{{ JSON.stringify(sortBy) }}</output>
    </div>
</template>
