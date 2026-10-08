<script setup>
import { ref } from 'vue';
import { UTreeview } from '../../index';
const tree = ref([]);
const opened = ref(['components']);
const nodes = [
    {
        title: '组件库',
        value: 'components',
        children: [
            {
                title: '表单控件',
                value: 'forms',
                children: [
                    { title: '输入与选择', value: 'inputs' },
                    { title: '验证与提交', value: 'validation' },
                ],
            },
            { title: '布局组件', value: 'layout' },
            {
                title: '归档组件',
                value: 'archive',
                disabled: true,
                children: [{ title: '历史组件', value: 'history' }],
            },
        ],
    },
    { title: '文档与示例', value: 'docs' },
];
</script>

<template>
    <div class="component-demo" data-demo-component="UTreeview">
        <u-treeview v-model="tree" v-model:opened="opened" :items="nodes" selectable />
        <output>选中的叶节点：{{ tree }}</output>
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
