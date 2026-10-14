<script setup>
import { ref } from 'vue';
import { UTreeSelect } from '@lingyzh/ui';

const selected = ref(11);
const departments = ref([11]);
const items = [
    { id: 1, name: '研发部', children: [{ id: 11, name: '前端组' }, { id: 12, name: '后端组' }] },
    { id: 2, name: '运营部' },
    { id: 3, name: '停用部门', disabled: true, children: [{ id: 31, name: '不可选子部门' }] }
];
</script>

<template>
    <div data-demo-component="UTreeSelect">
        <UTreeSelect :items="items" item-title="name" item-value="id" label="所属部门" searchable clearable
            v-model="selected" />
        <p>已选 ID：{{ selected ?? '未选择' }}</p>
        <UTreeSelect :items="items" item-title="name" item-value="id" label="自定义部门" multiple
            select-strategy="independent" searchable clearable required v-model="departments" />
        <p>独立勾选多个部门，选择父节点不会自动选择子节点：{{ departments }}</p>
    </div>
</template>
