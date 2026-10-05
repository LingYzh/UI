<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { UiTabs, UiTab, UiTabsWindow, UiTabsWindowItem, UiInput, UiCheckbox, UiButton, UiSelect } from '../index';

const props = defineProps({ example: String });
const selected = ref();
const comparison = ref();
const draft = ref('');
const automatic = ref(false);
const disabled = ref(false);
const eager = ref(false);
const removed = ref(false);
const empty = ref(false);
const optional = ref(false);
const grow = ref(false);
const fixed = ref(false);
const stacked = ref(false);
const hideSlider = ref(false);
const direction = ref('horizontal');
const align = ref('start');
const mounts = ref({});
const MountProbe = defineComponent({
    props: { name: String },
    setup(probe) {
        onMounted(() => { mounts.value[probe.name] = (mounts.value[probe.name] ?? 0) + 1; });
        return () => h('p', { class: 'tabs-demo-probe' }, `已访问 ${probe.name} 面板`);
    }
});
const items = computed(() => empty.value ? [] : [
    { value: 0, text: '常规设置', icon: 'mdi-cog-outline' },
    { value: 'locked', text: '尚未启用', disabled: true, icon: 'mdi-alert-circle-outline' },
    ...removed.value ? [] : [{ value: 2, text: '运行设置', icon: 'mdi-view-grid-outline' }]
]);
const scrollItems = Array.from({ length: 10 }, (_, index) => ({ value: index, text: `工作区配置 ${index + 1}`, icon: 'mdi-folder-outline' }));
</script>

<template>
    <div class="tabs-demo">
        <template v-if="example === 'tabs-declarative' || example === 'tabs-window'">
            <div class="tabs-demo-toolbar">
                <UiCheckbox v-model="automatic">方向键自动选择</UiCheckbox>
                <UiCheckbox v-model="disabled">禁用标签页</UiCheckbox>
                <UiCheckbox v-model="eager">预先挂载内容</UiCheckbox>
            </div>
            <UiTabs v-model="selected" :activation="automatic ? 'automatic' : 'manual'" :disabled="disabled" aria-label="声明式标签页">
                <UiTab value="overview">概览</UiTab>
                <UiTab value="unavailable" disabled>尚未启用</UiTab>
                <UiTab value="details">详情</UiTab>
                <template v-if="example === 'tabs-window'" #window>
                    <UiTabsWindowItem value="overview" :eager="eager"><MountProbe name="overview" /><UiInput v-model="draft" label="面板草稿" hint="切换后仍保留内容。" /></UiTabsWindowItem>
                    <UiTabsWindowItem value="unavailable">尚未启用。</UiTabsWindowItem>
                    <UiTabsWindowItem value="details" :eager="eager"><MountProbe name="details" /><p>通过 #window 自动关联模型与标签，无需逐个绑定。</p></UiTabsWindowItem>
                </template>
            </UiTabs>
            <UiTabsWindow v-if="example === 'tabs-declarative'" v-model="selected">
                <UiTabsWindowItem value="overview" :eager="eager"><MountProbe name="overview" /><UiInput v-model="draft" label="面板草稿" hint="首次访问才挂载，切换后保留内容。" /></UiTabsWindowItem>
                <UiTabsWindowItem value="unavailable">尚未启用。</UiTabsWindowItem>
                <UiTabsWindowItem value="details" :eager="eager"><MountProbe name="details" /><p>Tabs 和 Window 共享一个模型，标签与内容通过 value 对应。</p></UiTabsWindowItem>
            </UiTabsWindow>
        </template>
        <template v-else-if="example === 'tabs-items'">
            <div class="tabs-demo-toolbar"><UiCheckbox v-model="removed">移除运行标签</UiCheckbox><UiCheckbox v-model="empty">清空标签列表</UiCheckbox><UiButton @click="selected = 2" :disabled="removed || empty">外部选择运行设置</UiButton></div>
            <UiTabs v-model="selected" :items="items" aria-label="数组标签页">
                <template #item="{ item }"><p>{{ item.text }} · 模型类型为 {{ typeof item.value }}</p><UiInput v-if="item.value === 0" v-model="draft" label="数组面板草稿" /></template>
            </UiTabs>
        </template>
        <template v-else-if="example === 'tabs-values'">
            <div class="tabs-demo-toolbar"><UiCheckbox v-model="optional">允许空选择</UiCheckbox><UiButton @click="selected = null">清空模型</UiButton></div>
            <UiTabs v-model="selected" :mandatory="optional ? false : 'force'" aria-label="索引标签页">
                <UiTab>第一项</UiTab><UiTab disabled>禁用项</UiTab><UiTab>第三项</UiTab>
                <template #window><UiTabsWindowItem><p>索引 0 的内容。</p></UiTabsWindowItem><UiTabsWindowItem><p>禁用项内容。</p></UiTabsWindowItem><UiTabsWindowItem><p>索引 2 的内容。</p></UiTabsWindowItem></template>
            </UiTabs>
        </template>
        <template v-else-if="example === 'tabs-scroll'">
            <div class="tabs-demo-toolbar">
                <UiSelect v-model="direction" inline label="方向" :items="['horizontal', 'vertical'].map(value => ({ value, label: value }))" />
                <UiSelect v-model="align" inline label="标签对齐" :items="['start', 'center', 'end', 'title'].map(value => ({ value, label: value }))" />
                <UiCheckbox v-model="grow">伸展</UiCheckbox><UiCheckbox v-model="fixed">等宽上限</UiCheckbox><UiCheckbox v-model="stacked">图标在上方</UiCheckbox><UiCheckbox v-model="hideSlider">隐藏指示条</UiCheckbox>
            </div>
            <div class="tabs-demo-scroll" :class="{ 'is-vertical': direction === 'vertical' }">
                <UiTabs v-model="selected" :items="scrollItems" :direction="direction" :align-tabs="align" :grow="grow" :fixed-tabs="fixed" :stacked="stacked" :hide-slider="hideSlider" show-arrows center-active aria-label="可滚动标签页" />
            </div>
            <UiTabs v-model="comparison" :items="scrollItems.slice(0, 3)" :grow="grow" :fixed-tabs="fixed" :stacked="stacked" :align-tabs="align" :hide-slider="hideSlider" aria-label="标签布局比较" />
        </template>
        <output class="tabs-demo-model" role="status">选中：{{ selected === undefined ? 'undefined' : JSON.stringify(selected) }} · 类型：{{ typeof selected }}</output>
        <p v-if="example === 'tabs-declarative' || example === 'tabs-window'" class="tabs-demo-mounts">挂载次数：{{ JSON.stringify(mounts) }}</p>
    </div>
</template>

<style scoped>
.tabs-demo { min-width: 0; width: 100%; }
.tabs-demo-toolbar { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.tabs-demo :deep(.ui-tabs-window) { padding-block: 16px; }
.tabs-demo-model { display: block; margin-top: 16px; font-size: 12px; color: var(--muted); }
.tabs-demo-mounts { font-size: 12px; color: var(--muted); }
.tabs-demo-scroll { width: 480px; max-width: 100%; margin-bottom: 20px; }
.tabs-demo-scroll.is-vertical { width: 220px; height: 220px; }
.tabs-demo-scroll.is-vertical :deep(.ui-tabs-shell) { height: 100%; }
.tabs-demo-scroll.is-vertical :deep(.ui-tabs) { min-height: 0; }
</style>
