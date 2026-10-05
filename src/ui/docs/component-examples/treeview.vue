<script setup>
import { ref } from 'vue';
import { UTreeview } from '../../index';
const tree = ref([]);
const opened = ref(['components']);
const items = Array.from({ length: 5000 }, (_, index) => ({ id: index, title: `项目 ${index + 1}` }));
const nodes = [{ title: '组件库', value: 'components', children: [{ title: '表单控件', value: 'forms' }, { title: '布局组件', value: 'layout' }, { title: '归档组件', value: 'archive', disabled: true }] }, { title: '文档与示例', value: 'docs' }];
</script>

<template>
    <div class="component-demo" data-demo-component="UTreeview">
        <u-treeview v-model="tree" v-model:opened="opened" :items="nodes" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
