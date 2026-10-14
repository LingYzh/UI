<script setup lang="ts">
import { ref } from 'vue';
import { UCascader, UCheckbox } from '../../index';
import type { CascaderItem, CascaderValue } from '../../cascader';

const items: readonly CascaderItem[] = [
    {
        value: 'east',
        label: '华东',
        children: [
            {
                value: 'zhejiang',
                label: '浙江省',
                children: [
                    { value: 'hangzhou', label: '杭州市' },
                    { value: 'ningbo', label: '宁波市' }
                ]
            },
            {
                value: 'jiangsu',
                label: '江苏省',
                children: [
                    { value: 'nanjing', label: '南京市' },
                    { value: 'suzhou', label: '苏州市', disabled: true }
                ]
            }
        ]
    },
    {
        value: 'south',
        label: '华南',
        children: [
            {
                value: 'guangdong',
                label: '广东省',
                children: [
                    { value: 'shenzhen', label: '深圳市' },
                    { value: 'guangzhou', label: '广州市' }
                ]
            }
        ]
    },
    { value: 'overseas', label: '暂未开放的区域', disabled: true },
    { value: 0, label: '其他区域（数字值 0）' }
];
const singlePath = ref<CascaderValue[] | null>([]);
const multiplePaths = ref<CascaderValue[][] | null>([]);
const checkStrictly = ref(false);
const collapseTags = ref(false);
</script>

<template>
    <div class="component-demo cascader-advanced-demo" data-demo-component="UCascader">
        <u-cascader
            v-model="singlePath"
            :items="items"
            :check-strictly="checkStrictly"
            label="单选（原路径模型）"
            hint="默认选择完整叶节点路径；此模式保留 CascaderValue[] 模型。"
            clearable
            placeholder="请选择一个区域"
        />
        <u-checkbox v-model="checkStrictly">严格模式：父节点独立选择</u-checkbox>
        <UCheckbox v-model="collapseTags">折叠已选标签</UCheckbox>
        <u-cascader
            v-model="multiplePaths"
            :items="items"
            label="多选区域"
            hint="华东父项会显示半选；禁用项不参与批量选择。"
            multiple
            filterable
            chips
            clearable
            :check-strictly="checkStrictly"
            :collapse-tags="collapseTags"
            :max-collapse-tags="1"
            :max="3"
            placeholder="请选择区域"
            search-placeholder="搜索级联选项"
        />
        <output>单选模型：{{ JSON.stringify(singlePath) }}</output>
        <output>多选模型（完整路径数组）：{{ JSON.stringify(multiplePaths) }}</output>
        <p class="cascader-advanced-demo-help">
            直接在输入框搜索完整标签路径。普通模式只提供可选叶节点；严格模式允许父节点独立选择。多选标签显示在输入框内，可折叠成计数。达到上限时批量选择整体拒绝，已有路径仍可取消。
        </p>
    </div>
</template>

<style scoped>
.cascader-advanced-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.cascader-advanced-demo > output {
    overflow-wrap: anywhere;
    color: var(--muted);
    font-size: 14px;
}
.cascader-advanced-demo-help {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
}
</style>
