<script setup>
import { ref } from 'vue';
import { UTreeview } from '../../index';
const items = ref([
    { id: 'north', name: '华北', children: [{ id: 'beijing', name: '北京' }, { id: 'tianjin', name: '天津' }] },
    { id: 'east', name: '华东', children: [{ id: 'shanghai', name: '上海' }, { id: 'locked', name: '停用节点', props: { disabled: true } }] }
]);
const lastDrop = ref(null);
</script>

<template>
    <div class="component-demo" data-demo-component="TreeDrag">
        <UTreeview v-model:items="items" item-title="name" item-value="id" draggable open-all @node-drop="lastDrop = { source: $event.rawItem.id, target: $event.targetRaw.id, position: $event.position }" />
        <output>最近移动：{{ lastDrop }}</output>
        <output>顺序：{{ JSON.stringify(items) }}</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; gap: 16px; min-width: 0; }
output { color: var(--muted); font-size: 14px; overflow-wrap: anywhere; }
</style>
