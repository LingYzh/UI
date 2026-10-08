<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { UTable, UDataTableServer, UPagination, UTextField, UButton } from '../index';
defineProps({ example: { type: String, required: true } });
const headers = [{ key: 'name', title: '项目', sortable: true }, { key: 'status', title: '状态' }, { key: 'files', title: '文件数', sortable: true, align: 'end' }];
const staticHeaders = headers.map((header) => ({ ...header, sortable: false }));
const database = Array.from({ length: 83 }, (_, index) => ({ id: index + 1, name: `工作区 ${String(index + 1).padStart(2, '0')}`, status: index % 3 ? '就绪' : '进行中', files: (index * 37 + 12) % 200 }));
const rows = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref('');
const search = ref('');
const page = ref(1);
const perPage = ref(5);
const sortBy = ref([]);
const options = ref({ page: 1, itemsPerPage: 5, sortBy: [] });
const failNext = ref(false);
let request = 0;
let timer;
function load(next = options.value) {
    options.value = next;
    const ticket = ++request;
    const query = search.value.trim().toLowerCase();
    const shouldFail = failNext.value;
    failNext.value = false;
    clearTimeout(timer);
    loading.value = true;
    error.value = '';
    timer = setTimeout(() => {
        if (ticket !== request) return;
        if (shouldFail) { rows.value = []; error.value = '示例请求失败，请重试。'; loading.value = false; return; }
        let result = database.filter((item) => item.name.toLowerCase().includes(query));
        const sort = next.sortBy[0];
        if (sort) result = [...result].sort((a, b) => (typeof a[sort.key] === 'number' ? a[sort.key] - b[sort.key] : a[sort.key].localeCompare(b[sort.key])) * (sort.order === 'desc' ? -1 : 1));
        total.value = result.length;
        rows.value = next.itemsPerPage === -1 ? result : result.slice((next.page - 1) * next.itemsPerPage, next.page * next.itemsPerPage);
        loading.value = false;
    }, 450);
}
function filter() { if (page.value !== 1) page.value = 1; else load(); }
onBeforeUnmount(() => { request++; clearTimeout(timer); });
const paginationPage = ref(1);
const paginationLength = ref(24);
const variants = [
    { id: 'default', label: '默认', props: {} },
    { id: 'dense', label: 'dense · 紧凑', props: { dense: true } },
    { id: 'ghost', label: 'ghost · 透明表面', props: { ghost: true } },
    { id: 'square', label: 'rounded=false · 直角', props: { rounded: false } }
];
const requestText = computed(() => JSON.stringify(options.value));
</script>

<template>
    <template v-if="example === 'table-basic'">
        <u-table :headers="staticHeaders" :items="database.slice(0, 4)" label="项目概览"><template #item.status="{ value }"><span class="demo-value">{{ value }}</span></template></u-table>
    </template>
    <template v-else-if="example === 'table-fixed'">
        <u-table :headers="staticHeaders" :items="database.slice(0, 12)" label="固定表头项目" height="220px" fixed-header dense />
    </template>
    <template v-else-if="example === 'table-server'">
        <form class="demo-table-search d-flex flex-wrap ga-2 mb-4" @submit.prevent="filter"><u-text-field v-model="search" placeholder="例如 工作区 01" aria-label="筛选项目" /><u-button type="submit">查询</u-button><u-button @click="failNext = true; load()">模拟失败</u-button></form>
        <u-data-table-server v-model:page="page" v-model:items-per-page="perPage" v-model:sort-by="sortBy" :headers="headers" :items="rows" :items-length="total" :loading="loading" :error="error" :items-per-page-options="[5, 10, 25]" label="服务端项目" @update:options="load" @retry="load()"><template #item.status="{ value }"><span class="demo-value">{{ value }}</span></template></u-data-table-server>
        <output>请求参数：{{ requestText }}</output>
        <p class="text-muted small">本地模拟 450ms 请求；排序、筛选和切片在请求处理端执行。这里只传入当前页，组件不再次排序或分页。</p>
    </template>
    <template v-else-if="example === 'pagination-basic'">
        <u-pagination v-model="paginationPage" :length="paginationLength" label="示例分页" />
        <output>第 {{ paginationPage }} / {{ paginationLength }} 页</output>
        <div class="d-flex ga-2 mt-4"><u-button dense @click="paginationPage = 12; paginationLength = 24">跳到中段</u-button><u-button dense @click="paginationLength = 2">缩减为 2 页</u-button></div>
        <u-pagination :length="1" disabled dense class="mt-4" label="禁用分页" />
    </template>
    <div v-else class="docs-variant-list">
        <div v-for="variant in variants" :key="variant.id" class="docs-variant-sample">
            <p class="docs-variant-label">{{ variant.label }}</p>
            <u-table v-if="example === 'table-variants'" :headers="staticHeaders" :items="database.slice(0, 2)" :label="`${variant.label}表格`" v-bind="variant.props" />
            <u-data-table-server v-else-if="example === 'server-variants'" :headers="staticHeaders" :items="database.slice(0, 2)" :items-length="2" :label="`${variant.label}服务端表格`" v-bind="variant.props" />
            <u-pagination v-else :length="6" :label="`${variant.label}分页器`" v-bind="variant.props" />
        </div>
    </div>
</template>
