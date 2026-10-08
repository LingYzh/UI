<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { UDataTableServer, UTextField, UButton } from '../../index';
const headers = [
    { key: 'title', title: '工作区' },
    { key: 'category', title: '分类' },
    { key: 'count', title: '任务数', align: 'end' },
];
const database = Array.from({ length: 83 }, (_, index) => ({
    id: index,
    title: `工作区 ${String(index + 1).padStart(2, '0')}`,
    category: index % 2 ? '开发' : '设计',
    count: (index * 37) % 200,
}));
const query = ref('');
const items = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref('');
const selected = ref([]);
const expanded = ref([]);
const options = ref();
const failNext = ref(false);
let version = 0;
let timer;
function load(next = options.value) {
    if (!next) return;
    options.value = next;
    const snapshot = { ...next, sortBy: next.sortBy.map((sort) => ({ ...sort })) };
    const ticket = ++version;
    const fail = failNext.value;
    failNext.value = false;
    clearTimeout(timer);
    loading.value = true;
    error.value = '';
    // 演示服务端；接真实 API 时传快照并使用 AbortController 或相同序号校验。
    timer = setTimeout(() => {
        if (ticket !== version) return;
        if (fail) {
            items.value = [];
            error.value = '请求失败，可重试。';
            loading.value = false;
            return;
        }
        let result = database.filter((item) => item.title.includes(snapshot.search));
        result = [...result].sort((a, b) => {
            for (const sort of snapshot.sortBy) {
                const value =
                    typeof a[sort.key] === 'number'
                        ? a[sort.key] - b[sort.key]
                        : a[sort.key].localeCompare(b[sort.key]);
                if (value) return sort.order === 'desc' ? -value : value;
            }
            return 0;
        });
        total.value = result.length;
        items.value =
            snapshot.itemsPerPage === -1
                ? result
                : result.slice(
                      (snapshot.page - 1) * snapshot.itemsPerPage,
                      snapshot.page * snapshot.itemsPerPage
                  );
        loading.value = false;
    }, 350);
}
function fail() {
    failNext.value = true;
    load();
}
onBeforeUnmount(() => {
    version++;
    clearTimeout(timer);
});
</script>

<template>
    <div class="table-demo" data-table-demo="server">
        <div class="table-demo-controls">
            <u-text-field
                v-model="query"
                aria-label="远程搜索"
                placeholder="输入工作区编号"
                dense
            />
            <u-button dense @click="fail">模拟失败</u-button>
        </div>
        <u-data-table-server
            :headers="headers"
            :items="items"
            :items-length="total"
            :search="query"
            :loading="loading"
            :error="error"
            :items-per-page-options="[5, 10, { value: -1, title: '全部工作区' }]"
            :items-per-page="5"
            :mobile="false"
            show-select
            show-expand
            multi-sort
            show-current-page
            items-per-page-text="每页数量"
            page-text="{0}–{1} / {2} 条"
            label="完整服务端用例"
            v-model="selected"
            v-model:expanded="expanded"
            @update:options="load"
            @retry="load()"
        >
            <template #expanded-row="{ item }">
                <p>{{ item.title }} · 当前页详情。</p>
            </template>
            <template #footer.prepend>
                <span class="table-demo-note">只处理服务端传入的数据页</span>
            </template>
        </u-data-table-server>
        <output>请求参数：{{ JSON.stringify(options) }}</output>
    </div>
</template>
