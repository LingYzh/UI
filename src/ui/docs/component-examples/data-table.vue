<script setup>
import { ref } from 'vue';
import { UButton, UDataTable } from '../../index';
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
const search = ref('');
const selected = ref([]);
const expanded = ref([]);
const groups = ref([]);
</script>

<template>
    <div class="component-demo" data-demo-component="UDataTable">
        <u-button
            size="sm"
            @click="groups = groups.length ? [] : [{ key: 'category', order: 'asc' }]"
        >
            切换分组
        </u-button>
        <u-data-table
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
                <strong>{{ item.title }}</strong>
                <p>{{ item.category }} · 详情内容随高度平滑展开、收起。</p>
            </template>
        </u-data-table>
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
