<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { UiButton, UiCodeBlock, UiPagination, UiTable, UiTabs, confirmDialog, getLocale, setLocale } from '../index';

const locale = ref(getLocale());
const page = ref(3);
const items = [{ id: 'zh', label: '中文' }, { id: 'en', label: 'English' }];
const answer = ref('');
watch(locale, (value) => setLocale(value));
// 文档站本身是中文；离开示例时恢复，避免影响其他页面的组件文案。
onBeforeUnmount(() => setLocale('zh'));
async function ask() {
    const ok = await confirmDialog(locale.value === 'en' ? 'Switch the active account?' : '切换当前账号？');
    answer.value = String(ok);
}
</script>

<template>
    <div class="d-flex flex-column ga-4">
        <UiTabs v-model="locale" :items="items" id-prefix="locale-demo" variant="soft" aria-label="组件语言" />
        <UiPagination v-model="page" :length="12" />
        <UiTable :headers="[{ key: 'name', title: 'Name', sortable: true }]" :items="[]" label="Accounts" dense />
        <UiCodeBlock code="const locale = 'en';" language="javascript" dense />
        <div class="d-flex align-center ga-3"><UiButton @click="ask">confirmDialog</UiButton><output>{{ answer || '—' }}</output></div>
    </div>
</template>
