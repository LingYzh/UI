<script setup>
import { ref } from 'vue';
import { UDataTableVirtual } from '../../index';
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
</script>

<template>
    <div class="component-demo" data-demo-component="UDataTableVirtual">
        <u-data-table-virtual
            :headers="headers"
            :items="largeItems"
            :search="search"
            :height="260"
            :mobile="false"
            label="虚拟工作区列表"
        />
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
