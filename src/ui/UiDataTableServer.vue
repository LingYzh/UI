<script setup lang="ts">
import { computed, watch, useId } from 'vue';
import UiTable from './UiTable.vue';
import UiPagination from './UiPagination.vue';
import UiSelect from './UiSelect.vue';
import UiButton from './UiButton.vue';
import { positiveInteger, type TableHeader, type TableSort, type TableOptions } from './table';
const props = withDefaults(defineProps<{
    headers: readonly TableHeader[];
    items: readonly Record<string, unknown>[];
    itemsLength: number;
    itemValue?: string;
    label: string;
    loading?: boolean;
    error?: string;
    itemsPerPageOptions?: readonly number[];
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
    height?: string;
    fixedHeader?: boolean;
}>(), { itemsPerPageOptions: () => [10, 25, 50], rounded: true });
const page = defineModel<number>('page', { default: 1 });
const itemsPerPage = defineModel<number>('itemsPerPage', { default: 10 });
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const emit = defineEmits<{ 'update:options': [options: TableOptions]; retry: [] }>();
const selectId = useId();
const total = computed(() => Number.isFinite(props.itemsLength) ? Math.max(0, Math.floor(props.itemsLength)) : 0);
const size = computed(() => positiveInteger(itemsPerPage.value, 10));
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / size.value)));
const sizes = computed(() => [...new Set([size.value, ...props.itemsPerPageOptions.filter((value) => Number.isInteger(value) && value > 0)])].sort((a, b) => a - b));
watch([total, size, () => props.loading, page], () => {
    if (!props.loading) page.value = Math.min(pageCount.value, positiveInteger(page.value));
}, { flush: 'post' });
watch(() => JSON.stringify({ page: positiveInteger(page.value), itemsPerPage: size.value, sortBy: sortBy.value }), (value) => emit('update:options', JSON.parse(value)), { immediate: true, flush: 'post' });
function changeSize(value: string | number | null | undefined) { itemsPerPage.value = positiveInteger(Number(value), 10); page.value = 1; }
function sort(key: string) {
    if (props.loading) return;
    const active = sortBy.value[0];
    sortBy.value = active?.key !== key ? [{ key, order: 'asc' }] : active.order === 'asc' ? [{ key, order: 'desc' }] : [];
    page.value = 1;
}
const range = computed(() => total.value ? `${(page.value - 1) * size.value + 1}–${Math.min(page.value * size.value, total.value)} / ${total.value} 条` : '0 条');
</script>

<template>
    <div class="ui-data-table-server" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }">
        <UiTable :headers="headers" :items="error ? [] : items" :item-value="itemValue" :label="label" :loading="loading" :sort-by="sortBy" :dense="dense" :ghost="ghost" :rounded="false" :height="height" :fixed-header="fixedHeader" @sort="sort">
            <template v-for="name in Object.keys($slots).filter((key) => key !== 'no-data' && key !== 'error')" #[name]="scope"><slot :name="name" v-bind="scope" /></template>
            <template #no-data><slot v-if="error" name="error" :error="error"><div class="ui-table-error" role="alert"><span>{{ error }}</span><UiButton dense @click="emit('retry')">重试</UiButton></div></slot><slot v-else name="no-data"><span role="status">暂无数据</span></slot></template>
        </UiTable>
        <footer class="ui-table-footer">
            <div class="ui-table-page-size"><label :for="selectId">每页</label><UiSelect :id="selectId" :model-value="size" :disabled="loading" dense :ghost="ghost" :rounded="rounded" @update:model-value="changeSize"><option v-for="value in sizes" :key="value" :value="value">{{ value }} 条</option></UiSelect></div>
            <span class="ui-table-range" aria-live="polite">{{ range }}</span>
            <UiPagination v-model="page" :length="loading ? Math.max(page, pageCount) : pageCount" :disabled="loading || total === 0" :total-visible="3" :dense="dense" :ghost="ghost" :rounded="rounded" :label="`${label}分页`" />
        </footer>
    </div>
</template>
