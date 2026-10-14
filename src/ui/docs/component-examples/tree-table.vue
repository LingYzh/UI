<script setup>
import { ref } from 'vue';
import { UButton, UChip, UTreeTable } from '../../index';
const opened = ref([1]);
const tree = ref();
const selected = ref('');
const headers = [{ key: 'name', title: '部门', minWidth: 220 }, { key: 'manager', title: '负责人' }, { key: 'status', title: '状态' }, { key: 'actions', title: '操作' }];
const items = [
    { id: 1, name: '牛卡商城', manager: '管理员', children: [
        { id: 11, name: '研发中心', manager: '张三', children: [{ id: 111, name: '前端组', manager: '李四' }] },
        { id: 12, name: '运营中心', manager: '王五' }
    ] },
    { id: 2, name: '独立事业部', manager: '赵六' }
];
</script>

<template>
    <div class="tree-table-demo" data-demo-component="UTreeTable">
        <div class="tree-table-demo-actions">
            <UButton variant="outlined" @click="tree.expandAll()">展开全部</UButton>
            <UButton variant="outlined" @click="tree.collapseAll()">收起全部</UButton>
        </div>
        <UTreeTable ref="tree" :items="items" :headers="headers" tree-key="name" label="部门树表格" :height="320" fixed-header
            v-model:opened="opened">
            <template #item.status><UChip tone="success">正常</UChip></template>
            <template #item.actions="{ item }"><UButton dense variant="text" @click="selected = item.name">查看</UButton></template>
        </UTreeTable>
        <output>当前查看：{{ selected || '未选择' }}</output>
    </div>
</template>

<style scoped>
.tree-table-demo { display: grid; gap: 16px; }
.tree-table-demo-actions { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
