<script setup>
import { ref } from 'vue';
import { UTreeview, UTextField, USwitch, UButton } from '../index';

const search = ref('');
const ignoreAccents = ref(true);
const noFilter = ref(false);
const selected = ref([]);
const status = ref('可搜索标题，或用行内按钮选中项目。');
const items = [
    { value: 'group', title: '文档与资源', children: [
        { value: 'cafe', title: 'Café 说明', props: { subtitle: '支持忽略重音字符' } },
        { value: 'design', title: '设计规范' },
        { value: 'disabled', title: '未开放资源', props: { disabled: true } }
    ] },
    { value: 'separator', type: 'divider' },
    { value: 'heading', title: '其他', type: 'subheader' },
    { value: 'release', title: '发布记录' }
];
function recordSelection(payload) { status.value = `${payload.path.join(' / ')}：${payload.value ? '已选中' : '已取消'}`; }
</script>

<template>
    <section class="tree-filter-demo">
        <UTextField v-model="search" label="搜索资源" clearable />
        <div class="tree-filter-settings">
            <USwitch v-model="ignoreAccents" label="忽略重音" />
            <USwitch v-model="noFilter" label="暂停筛选" />
        </div>
        <UTreeview v-model="selected" :items="items" :search="search" :ignore-accents="ignoreAccents" :no-filter="noFilter" open-all selectable multiple
            @click:select="recordSelection"
        >
            <template #actions="{ select, isSelected, disabled }">
                <UButton variant="text" size="small" :disabled="disabled"
                    @click.stop="select(!isSelected, $event)"
                >
                    {{ isSelected ? '取消' : '选中' }}
                </UButton>
            </template>
        </UTreeview>
        <p class="tree-filter-status" aria-live="polite">{{ status }}</p>
    </section>
</template>

<style scoped>
.tree-filter-demo { display: grid; gap: 12px; width: min(100%, 520px); }
.tree-filter-settings { display: flex; flex-wrap: wrap; gap: 12px; }
.tree-filter-status { margin: 0; color: var(--muted); font-size: var(--ui-font-body-small); overflow-wrap: anywhere; }
</style>
