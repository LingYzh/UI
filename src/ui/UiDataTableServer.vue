<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, watch, useId } from 'vue';
import UDataTable from './UDataTable.vue';
import UiPagination from './UiPagination.vue';
import UiSelect from './UiSelect.vue';
import UiButton from './UiButton.vue';
import { positiveInteger, type TableSort } from './table';
import type { DataGroup, DataHeader, DataItem } from './data-pipeline';
import { uiText } from './locale';
import type { RippleOptions } from './ripple';

const rawProps = withDefaults(defineProps<{
    ripple?: RippleOptions;
    headers: readonly DataHeader[];
    items: readonly DataItem[];
    itemsLength: number;
    itemValue?: string;
    itemTitle?: string;
    label: string;
    loading?: boolean;
    error?: string;
    disabled?: boolean;
    showSelect?: boolean;
    returnObject?: boolean;
    showExpand?: boolean;
    multiSort?: boolean;
    search?: string;
    itemsPerPageOptions?: readonly number[];
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
    height?: string;
    fixedHeader?: boolean;
}>(), { ripple: true, itemsPerPageOptions: () => [10, 25, 50], rounded: true });
const props = useDefaults(rawProps, 'UDataTableServer');
const page = defineModel<number>('page', { default: 1 });
const itemsPerPage = defineModel<number>('itemsPerPage', { default: 10 });
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const groupBy = defineModel<DataGroup[]>('groupBy', { default: () => [] });
const selected = defineModel<unknown[]>({ default: () => [] });
const expanded = defineModel<unknown[]>('expanded', { default: () => [] });
const emit = defineEmits<{ 'update:options': [options: { page: number; itemsPerPage: number; sortBy: TableSort[]; groupBy: DataGroup[]; search: string }]; retry: [] }>();
const selectId = useId();
const total = computed(() => Number.isFinite(props.itemsLength) ? Math.max(0, Math.floor(props.itemsLength)) : 0);
const size = computed(() => positiveInteger(itemsPerPage.value, 10));
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / size.value)));
const sizes = computed(() => [...new Set([size.value, ...props.itemsPerPageOptions.filter((value) => Number.isInteger(value) && value > 0)])].sort((a, b) => a - b));
watch([total, size, () => props.loading, page], () => {
    if (!props.loading) page.value = Math.min(pageCount.value, positiveInteger(page.value));
}, { flush: 'post' });
watch([sortBy, groupBy, () => props.search], () => { page.value = 1; }, { deep: true });
watch(() => JSON.stringify({ page: positiveInteger(page.value), itemsPerPage: size.value, sortBy: sortBy.value, groupBy: groupBy.value, search: props.search ?? '' }), (value) => emit('update:options', JSON.parse(value)), { immediate: true, flush: 'post' });
function changeSize(value: string | number | null | undefined): void { itemsPerPage.value = positiveInteger(Number(value), 10); page.value = 1; }
const range = computed(() => total.value ? uiText('table.range', { start: (page.value - 1) * size.value + 1, end: Math.min(page.value * size.value, total.value), total: total.value }) : uiText('table.rangeEmpty'));
</script>

<template>
    <div class="ui-data-table-server" :class="{ 'is-dense': props.dense, 'is-ghost': props.ghost, 'is-square': !props.rounded }">
        <UDataTable :ripple="props.ripple" v-model="selected" v-model:expanded="expanded" v-model:sort-by="sortBy" v-model:group-by="groupBy" :headers="props.headers" :items="props.error ? [] : props.items" :item-value="props.itemValue" :item-title="props.itemTitle" :label="props.label" :loading="props.loading" :error="props.error" :disabled="props.disabled" :show-select="props.showSelect" :return-object="props.returnObject" :show-expand="props.showExpand" :multi-sort="props.multiSort" :height="props.height" :fixed-header="props.fixedHeader" :dense="props.dense" server hide-default-footer>
            <template v-for="name in Object.keys($slots).filter((key) => key !== 'no-data' && key !== 'error')" #[name]="scope"><slot :name="name" v-bind="scope" /></template>
            <template #error="scope"><slot name="error" v-bind="scope"><div class="ui-table-error" role="alert"><span>{{ props.error }}</span><UiButton :ripple="props.ripple" dense @click="emit('retry')">{{ uiText('common.retry') }}</UiButton></div></slot></template>
            <template #no-data><slot name="no-data"><span role="status">{{ uiText('common.empty') }}</span></slot></template>
        </UDataTable>
        <footer class="ui-table-footer">
            <div class="ui-table-page-size"><label :for="selectId">{{ uiText('table.perPage') }}</label><UiSelect :id="selectId" :model-value="size" :disabled="props.loading || props.disabled" dense :ghost="props.ghost" :rounded="props.rounded" @update:model-value="changeSize"><option v-for="value in sizes" :key="value" :value="value">{{ uiText('table.perPageOption', { count: value }) }}</option></UiSelect></div>
            <span class="ui-table-range" aria-live="polite">{{ range }}</span>
            <UiPagination :ripple="props.ripple" v-model="page" :length="props.loading ? Math.max(page, pageCount) : pageCount" :disabled="props.loading || props.disabled || total === 0" :total-visible="3" :dense="props.dense" :ghost="props.ghost" :rounded="props.rounded" :label="uiText('table.pagination', { label: props.label })" />
        </footer>
    </div>
</template>
