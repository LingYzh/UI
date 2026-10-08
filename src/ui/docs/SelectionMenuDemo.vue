<script setup>
import { computed, ref } from 'vue';
import { UAutocomplete, UCombobox, UDateInput, USelect, USwitch } from '../index';

const location = ref('bottom start');
const scrollStrategy = ref('reposition');
const eager = ref(false);
const noAutoScroll = ref(false);
const workspace = ref('default');
const search = ref('');
const tags = ref(['文档']);
const date = ref(new Date(2026, 9, 9));
const options = [{ title: '默认工作区', value: 'default' }, { title: '组件验收', value: 'components' }, { title: '归档工作区', value: 'archived', props: { disabled: true } }];
const menuProps = computed(() => ({ location: location.value, offset: 6, scrollStrategy: scrollStrategy.value, eager: eager.value }));
</script>

<template>
    <div class="selection-menu-demo" data-selection-menu-demo>
        <div class="selection-menu-settings">
            <u-select v-model="location" :items="[{ value: 'bottom start', label: '下方起始边' }, { value: 'top end', label: '上方末端边' }]" label="菜单位置" />
            <u-select v-model="scrollStrategy" :items="[{ value: 'reposition', label: '滚动跟随' }, { value: 'close', label: '滚动关闭' }, { value: 'block', label: '锁定页面滚动' }]" label="滚动策略" />
        </div>
        <div class="selection-menu-toggles">
            <u-switch v-model="eager" label="关闭后保留内容" />
            <u-switch v-model="noAutoScroll" label="关闭活动项自动滚动" />
        </div>
        <u-autocomplete v-model="workspace" v-model:search="search" :items="options" :menu-props="menuProps" :list-props="{ 'aria-label': '工作区建议', 'data-menu-demo': 'autocomplete' }" :no-auto-scroll="noAutoScroll" label="搜索工作区" data-menu-autocomplete />
        <u-combobox v-model="tags" :items="['文档', '测试', '设计']" :menu-props="menuProps" :no-auto-scroll="noAutoScroll" label="创建标签" multiple chips data-menu-combobox />
        <u-select v-model="workspace" :items="[{ value: 'default', label: '默认工作区' }, { value: 'components', label: '组件验收' }]" :menu-props="menuProps" label="仅选择工作区" data-menu-select />
        <u-date-input v-model="date" :menu-props="menuProps" :hide-actions="false" label="确认日期草稿" input-format="yyyy-mm-dd" data-menu-date />
        <output>{{ workspace }} · {{ tags.join('、') }} · {{ date?.toLocaleDateString('zh-CN') }}</output>
    </div>
</template>

<style scoped>
.selection-menu-demo { display: grid; gap: 16px; min-width: 0; }
.selection-menu-settings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.selection-menu-toggles { display: flex; flex-wrap: wrap; gap: 16px; }
.selection-menu-demo output { color: var(--muted); font-size: var(--ui-font-body-medium); }
@media (max-width: 600px) { .selection-menu-settings { grid-template-columns: minmax(0, 1fr); } }
</style>
