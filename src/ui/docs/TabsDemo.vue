<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import {
    UTabs,
    UTab,
    UTabsWindow,
    UTabsWindowItem,
    UTextField,
    UCheckbox,
    UButton,
    USelect,
} from '../index';

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
        onMounted(() => {
            mounts.value[probe.name] = (mounts.value[probe.name] ?? 0) + 1;
        });
        return () => h('p', { class: 'tabs-demo-probe' }, `已访问 ${probe.name} 面板`);
    },
});
const items = computed(() =>
    empty.value
        ? []
        : [
              { value: 0, text: '常规设置', icon: 'mdi-cog-outline' },
              {
                  value: 'locked',
                  text: '尚未启用',
                  disabled: true,
                  icon: 'mdi-alert-circle-outline',
              },
              ...(removed.value
                  ? []
                  : [{ value: 2, text: '运行设置', icon: 'mdi-view-grid-outline' }]),
          ]
);
const scrollItems = Array.from({ length: 10 }, (_, index) => ({
    value: index,
    text: `工作区配置 ${index + 1}`,
    icon: 'mdi-folder-outline',
}));
</script>

<template>
    <div class="tabs-demo">
        <template v-if="example === 'tabs-declarative' || example === 'tabs-window'">
            <div class="tabs-demo-toolbar">
                <u-checkbox v-model="automatic">方向键自动选择</u-checkbox>
                <u-checkbox v-model="disabled">禁用标签页</u-checkbox>
                <u-checkbox v-model="eager">预先挂载内容</u-checkbox>
            </div>
            <u-tabs
                v-model="selected"
                :activation="automatic ? 'automatic' : 'manual'"
                :disabled="disabled"
                aria-label="声明式标签页"
            >
                <u-tab value="overview">概览</u-tab>
                <u-tab value="unavailable" disabled>尚未启用</u-tab>
                <u-tab value="details">详情</u-tab>
                <template v-if="example === 'tabs-window'" #window>
                    <u-tabs-window-item value="overview" :eager="eager">
                        <MountProbe name="overview" />
                        <u-text-field v-model="draft" label="面板草稿" hint="切换后仍保留内容。" />
                    </u-tabs-window-item>
                    <u-tabs-window-item value="unavailable">尚未启用。</u-tabs-window-item>
                    <u-tabs-window-item value="details" :eager="eager">
                        <MountProbe name="details" />
                        <p>通过 #window 自动关联模型与标签，无需逐个绑定。</p>
                    </u-tabs-window-item>
                </template>
            </u-tabs>
            <u-tabs-window v-if="example === 'tabs-declarative'" v-model="selected">
                <u-tabs-window-item value="overview" :eager="eager">
                    <MountProbe name="overview" />
                    <u-text-field
                        v-model="draft"
                        label="面板草稿"
                        hint="首次访问才挂载，切换后保留内容。"
                    />
                </u-tabs-window-item>
                <u-tabs-window-item value="unavailable">尚未启用。</u-tabs-window-item>
                <u-tabs-window-item value="details" :eager="eager">
                    <MountProbe name="details" />
                    <p>Tabs 和 Window 共享一个模型，标签与内容通过 value 对应。</p>
                </u-tabs-window-item>
            </u-tabs-window>
        </template>
        <template v-else-if="example === 'tabs-items'">
            <div class="tabs-demo-toolbar">
                <u-checkbox v-model="removed">移除运行标签</u-checkbox>
                <u-checkbox v-model="empty">清空标签列表</u-checkbox>
                <u-button @click="selected = 2" :disabled="removed || empty">
                    外部选择运行设置
                </u-button>
            </div>
            <u-tabs v-model="selected" :items="items" aria-label="数组标签页">
                <template #item="{ item }">
                    <p>{{ item.text }} · 模型类型为 {{ typeof item.value }}</p>
                    <u-text-field v-if="item.value === 0" v-model="draft" label="数组面板草稿" />
                </template>
            </u-tabs>
        </template>
        <template v-else-if="example === 'tabs-values'">
            <div class="tabs-demo-toolbar">
                <u-checkbox v-model="optional">允许空选择</u-checkbox>
                <u-button @click="selected = null">清空模型</u-button>
            </div>
            <u-tabs
                v-model="selected"
                :mandatory="optional ? false : 'force'"
                aria-label="索引标签页"
            >
                <u-tab>第一项</u-tab>
                <u-tab disabled>禁用项</u-tab>
                <u-tab>第三项</u-tab>
                <template #window>
                    <u-tabs-window-item>
                        <p>索引 0 的内容。</p>
                    </u-tabs-window-item>
                    <u-tabs-window-item>
                        <p>禁用项内容。</p>
                    </u-tabs-window-item>
                    <u-tabs-window-item>
                        <p>索引 2 的内容。</p>
                    </u-tabs-window-item>
                </template>
            </u-tabs>
        </template>
        <template v-else-if="example === 'tabs-scroll'">
            <div class="tabs-demo-toolbar">
                <u-select
                    v-model="direction"
                    inline
                    label="方向"
                    :items="['horizontal', 'vertical'].map((value) => ({ value, label: value }))"
                />
                <u-select
                    v-model="align"
                    inline
                    label="标签对齐"
                    :items="
                        ['start', 'center', 'end', 'title'].map((value) => ({
                            value,
                            label: value,
                        }))
                    "
                />
                <u-checkbox v-model="grow">伸展</u-checkbox>
                <u-checkbox v-model="fixed">等宽上限</u-checkbox>
                <u-checkbox v-model="stacked">图标在上方</u-checkbox>
                <u-checkbox v-model="hideSlider">隐藏指示条</u-checkbox>
            </div>
            <div class="tabs-demo-scroll" :class="{ 'is-vertical': direction === 'vertical' }">
                <u-tabs
                    v-model="selected"
                    :items="scrollItems"
                    :direction="direction"
                    :align-tabs="align"
                    :grow="grow"
                    :fixed-tabs="fixed"
                    :stacked="stacked"
                    :hide-slider="hideSlider"
                    show-arrows
                    center-active
                    aria-label="可滚动标签页"
                />
            </div>
            <u-tabs
                v-model="comparison"
                :items="scrollItems.slice(0, 3)"
                :grow="grow"
                :fixed-tabs="fixed"
                :stacked="stacked"
                :align-tabs="align"
                :hide-slider="hideSlider"
                aria-label="标签布局比较"
            />
        </template>
        <output class="tabs-demo-model" role="status">
            选中：{{ selected === undefined ? 'undefined' : JSON.stringify(selected) }} · 类型：{{
                typeof selected
            }}
        </output>
        <p
            v-if="example === 'tabs-declarative' || example === 'tabs-window'"
            class="tabs-demo-mounts"
        >
            挂载次数：{{ JSON.stringify(mounts) }}
        </p>
    </div>
</template>

<style scoped>
.tabs-demo {
    min-width: 0;
    width: 100%;
}
.tabs-demo-toolbar {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
}
.tabs-demo :deep(.ui-tabs-window) {
    padding-block: 16px;
}
.tabs-demo-model {
    display: block;
    margin-top: 16px;
    font-size: 14px;
    color: var(--muted);
}
.tabs-demo-mounts {
    font-size: 14px;
    color: var(--muted);
}
.tabs-demo-scroll {
    width: 480px;
    max-width: 100%;
    margin-bottom: 20px;
}
.tabs-demo-scroll.is-vertical {
    width: 220px;
    height: 220px;
}
.tabs-demo-scroll.is-vertical :deep(.ui-tabs-shell) {
    height: 100%;
}
.tabs-demo-scroll.is-vertical :deep(.ui-tabs) {
    min-height: 0;
}
</style>
