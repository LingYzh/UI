<script setup>
import { computed, ref, watch } from 'vue';
import { UButton, USwitch, UTab, UTabs, UTabsWindowItem, UTextField } from '../index';

const selected = ref();
const multiple = ref(false);
const mandatory = ref(true);
const readonly = ref(false);
const automatic = ref(false);
const reversed = ref(false);
const eager = ref(false);
const draft = ref('');
const definitions = [
    { value: null, text: '未命名', key: 'null' },
    { value: { id: 'docs' }, text: '文档', key: 'docs' },
    { value: ['tests', 'visual'], text: '验收', key: 'tests' },
    { value: 'locked', text: '尚未启用', key: 'locked', disabled: true },
];
const items = computed(() => reversed.value ? definitions.slice().reverse() : definitions);
const modelText = computed(() => selected.value === undefined ? 'undefined' : JSON.stringify(selected.value));
watch(multiple, value => { selected.value = value ? [] : undefined; });
function selectDocs() { selected.value = multiple.value ? [{ id: 'docs' }] : { id: 'docs' }; }
</script>

<template>
    <div class="tabs-selection-demo" data-tabs-selection-demo>
        <div class="tabs-selection-settings">
            <u-switch v-model="multiple" label="多选，最多两项" />
            <u-switch v-model="mandatory" label="自动选首个可用项" />
            <u-switch v-model="readonly" label="只读" />
            <u-switch v-model="automatic" label="方向键自动选择" />
            <u-switch v-model="reversed" label="倒序排列" />
            <u-switch v-model="eager" label="切换后保留面板" />
        </div>
        <div class="tabs-selection-actions">
            <u-button size="sm" @click="selectDocs">选择对象副本</u-button>
            <u-button size="sm" @click="selected = multiple ? [] : undefined">清空模型</u-button>
        </div>
        <u-tabs v-model="selected" :multiple="multiple" :max="2" :mandatory="mandatory ? 'force' : false" :readonly="readonly" :activation="automatic ? 'automatic' : 'manual'" aria-label="复杂模型标签页">
            <u-tab v-for="item in items" :key="item.key" :value="item.value" :disabled="item.disabled">
                <template #default="{ isSelected }">{{ item.text }}{{ multiple && isSelected.value ? ' ✓' : '' }}</template>
            </u-tab>
            <template #window>
                <u-tabs-window-item v-for="item in items" :key="item.key" :value="item.value" :eager="eager">
                    <p>{{ item.text }}面板</p>
                    <u-text-field v-if="item.key === 'docs'" v-model="draft" label="文档草稿" hint="默认离场后卸载；开启保留面板后保持输入节点。" />
                    <p v-else>{{ item.value === null ? 'null 是这个标签的实际值。' : JSON.stringify(item.value) }}</p>
                </u-tabs-window-item>
            </template>
        </u-tabs>
        <output role="status">模型：{{ modelText }}</output>
    </div>
</template>

<style scoped>
.tabs-selection-demo { display: grid; gap: 16px; min-width: 0; }
.tabs-selection-settings, .tabs-selection-actions { display: flex; flex-wrap: wrap; gap: 12px 20px; }
.tabs-selection-demo :deep(.ui-tabs-window) { padding-block: 12px; }
.tabs-selection-demo p { margin-block: 0 12px; }
.tabs-selection-demo output { color: var(--muted); font-size: var(--ui-font-body-medium); overflow-wrap: anywhere; }
</style>
