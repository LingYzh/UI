<script setup>
import { ref } from 'vue';
import { UAutocomplete } from '../../index';
const options = [
    { title: '默认工作区', value: 'default' },
    { title: '完整的很长选项文字应保持单行，并在控件宽度不足时截断显示', value: 'long' },
    { title: '归档工作区', value: 'archived', props: { disabled: true } },
];
const choice = ref('default');
const required = (value) => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';
</script>

<template>
    <div class="component-demo" data-demo-component="UAutocomplete">
        <u-autocomplete
            v-model="choice"
            :items="options"
            label="搜索工作区"
            hint="输入筛选，方向键选择；选项保留对象模型能力。"
            clearable
            :rules="[required]"
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
