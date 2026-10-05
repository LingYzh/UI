<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, ref, watch } from 'vue';
import UiPagination from './UiPagination.vue';
import { vPointerBlur } from './pointer-focus';
import { uiText } from './locale';
import { getPath, groupRows, itemKey, pageItems, processItems, type DataGroup, type DataHeader, type DataItem } from './data-pipeline';
import type { TableSort } from './table';

const rawProps = withDefaults(defineProps<{
    headers: readonly DataHeader[];
    items: readonly DataItem[];
    itemTitle?: string;
    itemValue?: string;
    label?: string;
    search?: string;
    customFilter?: (value: unknown, query: string, item: DataItem, key: string) => boolean;
    showSelect?: boolean;
    returnObject?: boolean;
    showExpand?: boolean;
    multiSort?: boolean;
    server?: boolean;
    loading?: boolean;
    error?: string;
    disabled?: boolean;
    hideDefaultFooter?: boolean;
    itemsPerPageOptions?: readonly number[];
    height?: string;
    fixedHeader?: boolean;
    dense?: boolean;
}>(), { itemTitle: 'title', itemValue: 'id', label: 'Data table', itemsPerPageOptions: () => [10, 25, 50] });
const props = useDefaults(rawProps, 'UDataTable');
const emit = defineEmits<{ 'update:options': [options: { page: number; itemsPerPage: number; sortBy: TableSort[]; groupBy: DataGroup[]; search: string }] }>();
const page = defineModel<number>('page', { default: 1 });
const itemsPerPage = defineModel<number>('itemsPerPage', { default: 10 });
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const groupBy = defineModel<DataGroup[]>('groupBy', { default: () => [] });
const selected = defineModel<unknown[]>({ default: () => [] });
const expanded = defineModel<unknown[]>('expanded', { default: () => [] });
const collapsedGroups = ref<string[]>([]);
const processed = computed(() => props.server ? [...props.items] : processItems(props.items, { headers: props.headers, search: props.search, customFilter: props.customFilter, sortBy: sortBy.value, groupBy: groupBy.value }));
const size = computed(() => itemsPerPage.value === -1 ? -1 : Math.max(1, Math.floor(itemsPerPage.value) || 10));
const pageCount = computed(() => size.value === -1 ? 1 : Math.max(1, Math.ceil(processed.value.length / size.value)));
const visible = computed(() => props.server ? processed.value : pageItems(processed.value, page.value, size.value));
const rows = computed(() => groupRows(visible.value, groupBy.value));
const columnCount = computed(() => Math.max(1, props.headers.length + Number(props.showSelect) + Number(props.showExpand)));
const selectedKeys = computed(() => new Set(selected.value.map((value) => props.returnObject && value && typeof value === 'object' ? itemKey(value as DataItem, props.itemValue) : value)));
const expandedKeys = computed(() => new Set(expanded.value.map((value) => props.returnObject && value && typeof value === 'object' ? itemKey(value as DataItem, props.itemValue) : value)));
const allSelected = computed(() => visible.value.length > 0 && visible.value.every((item, index) => selectedKeys.value.has(itemKey(item, props.itemValue, index))));
const someSelected = computed(() => visible.value.some((item, index) => selectedKeys.value.has(itemKey(item, props.itemValue, index))));
const range = computed(() => processed.value.length ? `${size.value === -1 ? 1 : (page.value - 1) * size.value + 1}–${size.value === -1 ? processed.value.length : Math.min(page.value * size.value, processed.value.length)} / ${processed.value.length}` : '0 / 0');
watch(pageCount, (count) => { if (page.value > count) page.value = count; });
watch(() => JSON.stringify({ page: page.value, itemsPerPage: size.value, sortBy: sortBy.value, groupBy: groupBy.value, search: props.search ?? '' }), (value) => emit('update:options', JSON.parse(value)), { immediate: true });
function toggleSort(key: string): void {
    if (props.loading || props.disabled) return;
    const old = sortBy.value.find((sort) => sort.key === key);
    const next = old?.order === 'asc' ? { key, order: 'desc' as const } : old?.order === 'desc' ? null : { key, order: 'asc' as const };
    sortBy.value = props.multiSort ? [...sortBy.value.filter((sort) => sort.key !== key), ...(next ? [next] : [])] : next ? [next] : [];
    page.value = 1;
}
function toggleSelection(item: DataItem, index: number): void {
    const key = itemKey(item, props.itemValue, index);
    selected.value = selectedKeys.value.has(key)
        ? selected.value.filter((value) => (props.returnObject && value && typeof value === 'object' ? itemKey(value as DataItem, props.itemValue) : value) !== key)
        : [...selected.value, props.returnObject ? item : key];
}
function toggleAll(): void {
    const keys = new Set(visible.value.map((item, index) => itemKey(item, props.itemValue, index)));
    const rest = selected.value.filter((value) => !keys.has(props.returnObject && value && typeof value === 'object' ? itemKey(value as DataItem, props.itemValue) : value as string | number));
    selected.value = allSelected.value ? rest : [...rest, ...visible.value.map((item, index) => props.returnObject ? item : itemKey(item, props.itemValue, index))];
}
function toggleExpanded(item: DataItem, index: number): void {
    const key = itemKey(item, props.itemValue, index);
    expanded.value = expandedKeys.value.has(key)
        ? expanded.value.filter((value) => (props.returnObject && value && typeof value === 'object' ? itemKey(value as DataItem, props.itemValue) : value) !== key)
        : [...expanded.value, props.returnObject ? item : key];
}
</script>

<template>
    <div class="u-data-table" :class="{ 'is-dense': props.dense, 'is-fixed-header': props.fixedHeader }" :aria-busy="props.loading || undefined">
        <div class="u-data-table-scroll" :style="{ maxHeight: props.height }">
            <table :aria-label="props.label">
                <thead><tr>
                    <th v-if="props.showSelect" scope="col"><input type="checkbox" :checked="allSelected" :indeterminate="someSelected && !allSelected" :disabled="props.disabled || props.loading || !visible.length" aria-label="Select current page" @change="toggleAll" /></th>
                    <th v-for="header in props.headers" :key="header.key" scope="col" :style="{ textAlign: header.align, width: header.width }" :aria-sort="header.sortable ? (sortBy.find((sort) => sort.key === header.key)?.order === 'asc' ? 'ascending' : sortBy.find((sort) => sort.key === header.key)?.order === 'desc' ? 'descending' : 'none') : undefined">
                        <button v-if="header.sortable" v-pointer-blur type="button" class="u-data-table-sort" :disabled="props.loading || props.disabled" :aria-label="uiText('table.sort', { title: header.title })" @click="toggleSort(header.key)">
                            <slot :name="`header.${header.key}`" :header="header">{{ header.title }}</slot>
                            <svg class="ui-table-sort-icon" viewBox="0 0 12 16" aria-hidden="true"><path d="M6 2 10 6H2Z" :class="{ 'is-active': sortBy.find(sort => sort.key === header.key)?.order === 'asc' }" /><path d="M2 10H10L6 14Z" :class="{ 'is-active': sortBy.find(sort => sort.key === header.key)?.order === 'desc' }" /></svg>
                        </button>
                        <slot v-else :name="`header.${header.key}`" :header="header">{{ header.title }}</slot>
                    </th>
                    <th v-if="props.showExpand" scope="col">Expand</th>
                </tr></thead>
                <tbody>
                    <tr v-if="props.loading"><td :colspan="columnCount"><slot name="loading">Loading…</slot></td></tr>
                    <tr v-else-if="props.error"><td :colspan="columnCount"><slot name="error" :error="props.error">{{ props.error }}</slot></td></tr>
                    <template v-else>
                        <template v-for="(row, rowIndex) in rows" :key="row.key">
                            <tr v-if="row.type === 'group'" class="u-data-table-group"><td :colspan="columnCount"><slot name="group-header" :group="row" :toggle="() => collapsedGroups = collapsedGroups.includes(row.key) ? collapsedGroups.filter((key) => key !== row.key) : [...collapsedGroups, row.key]"><button v-pointer-blur type="button" :aria-expanded="!collapsedGroups.includes(row.key)" @click="collapsedGroups = collapsedGroups.includes(row.key) ? collapsedGroups.filter((key) => key !== row.key) : [...collapsedGroups, row.key]">{{ collapsedGroups.includes(row.key) ? '▸' : '▾' }} {{ row.title }}</button></slot></td></tr>
                            <template v-else-if="row.item && !collapsedGroups.some((key) => row.key.startsWith(`${key}/`) || row.key.startsWith(`${key}:`))">
                                <tr :data-item-key="itemKey(row.item, props.itemValue, rowIndex)">
                                    <td v-if="props.showSelect"><input type="checkbox" :checked="selectedKeys.has(itemKey(row.item, props.itemValue, rowIndex))" :disabled="props.disabled || props.loading" :aria-label="`Select ${getPath(row.item, props.itemTitle) ?? rowIndex + 1}`" @change="toggleSelection(row.item, rowIndex)" /></td>
                                    <td v-for="header in props.headers" :key="header.key" :style="{ textAlign: header.align }"><slot :name="`item.${header.key}`" :item="row.item" :value="getPath(row.item, header.value ?? header.key)" :index="rowIndex">{{ getPath(row.item, header.value ?? header.key) ?? '—' }}</slot></td>
                                    <td v-if="props.showExpand"><button v-pointer-blur type="button" :disabled="props.disabled || props.loading" :aria-expanded="expandedKeys.has(itemKey(row.item, props.itemValue, rowIndex))" @click="toggleExpanded(row.item, rowIndex)">{{ expandedKeys.has(itemKey(row.item, props.itemValue, rowIndex)) ? '−' : '+' }}</button></td>
                                </tr>
                                <tr v-if="props.showExpand && expandedKeys.has(itemKey(row.item, props.itemValue, rowIndex))"><td :colspan="columnCount"><slot name="expanded-row" :item="row.item" :index="rowIndex">{{ getPath(row.item, props.itemTitle) }}</slot></td></tr>
                            </template>
                        </template>
                        <tr v-if="!rows.length"><td :colspan="columnCount"><slot name="no-data">No data</slot></td></tr>
                    </template>
                </tbody>
            </table>
        </div>
        <slot v-if="!props.hideDefaultFooter" name="footer" :page="page" :page-count="pageCount" :items-per-page="size" :items-length="processed.length">
            <footer class="u-data-table-footer"><label>Rows per page <select v-model.number="itemsPerPage" :disabled="props.loading || props.disabled" @change="page = 1"><option v-for="option in props.itemsPerPageOptions" :key="option" :value="option">{{ option }}</option><option value="-1">All</option></select></label><span aria-live="polite">{{ range }}</span><UiPagination v-model="page" :length="pageCount" :disabled="props.loading || props.disabled || !processed.length" :total-visible="3" :label="`${props.label} pages`" /></footer>
        </slot>
    </div>
</template>
