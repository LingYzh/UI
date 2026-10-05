<script setup>
import { reactive } from 'vue';
import { UButton, UTextField, USelect, UTabs, UTabPanel, UCard, UScrollArea, UCodeBlock } from '../index';
defineProps({ component: { type: String, required: true } });
const variants = [
    { id: 'default', label: '默认', attrs: {} },
    { id: 'dense', label: 'dense · 紧凑', attrs: { dense: true } },
    { id: 'ghost', label: 'ghost · 透明表面', attrs: { ghost: true } },
    { id: 'square', label: 'rounded=false · 直角', attrs: { rounded: false } }
];
const values = reactive(Object.fromEntries(variants.map(({ id }) => [id, 'UAH'])));
const selected = reactive(Object.fromEntries(variants.map(({ id }) => [id, 'overview'])));
const items = [{ id: 'overview', label: '概览' }, { id: 'details', label: '详情' }];
const code = '<u-button dense :rounded="false">保存更改</u-button>';
</script>

<template>
    <div class="docs-variant-list">
        <div v-for="variant in variants" :key="variant.id" class="docs-variant-sample" :data-sample="variant.id">
            <p class="docs-variant-label">{{ variant.label }}</p>
            <u-button v-if="component === 'button'" v-bind="variant.attrs">保存更改</u-button>
            <u-text-field v-else-if="component === 'input'" v-model="values[variant.id]" v-bind="variant.attrs" :aria-label="`${variant.label}输入框`" />
            <u-select v-else-if="component === 'select'" v-model="values[variant.id]" v-bind="variant.attrs" :aria-label="`${variant.label}选择器`"><option value="UAH">UAH 工作台</option><option value="personal">个人工作区</option></u-select>
            <template v-else-if="component === 'tabs'">
                <u-tabs v-model="selected[variant.id]" :items="items" :id-prefix="`variant-tabs-${variant.id}`" v-bind="variant.attrs" :aria-label="`${variant.label}标签页`" />
                <u-tab-panel v-for="item in items" :key="item.id" :model-value="selected[variant.id]" :value="item.id" :id-prefix="`variant-tabs-${variant.id}`"><p class="ma-0 py-3 text-muted">{{ item.label }}内容</p></u-tab-panel>
            </template>
            <u-card v-else-if="component === 'card'" title="工作区" subtitle="容器的间距与表面" v-bind="variant.attrs">项目、文件与最近使用的内容。<template #actions><u-button v-bind="variant.attrs">打开工作区</u-button></template></u-card>
            <u-scroll-area v-else-if="component === 'scroll-area'" :label="`${variant.label}滚动区域`" height="120px" always v-bind="variant.attrs"><p v-for="line in 10" :key="line" class="ma-0 pa-3">日志 {{ line }} · 保留原生滚动操作</p></u-scroll-area>
            <u-code-block v-else-if="component === 'code-block'" :code="code" language="vue" v-bind="variant.attrs" />
        </div>
    </div>
</template>
