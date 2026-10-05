<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, watch } from 'vue';
import { pageItems, processItems, type DataHeader, type DataItem } from './data-pipeline';
import type { TableSort } from './table';

const rawProps = withDefaults(defineProps<{
    items: readonly DataItem[];
    headers?: readonly DataHeader[];
    search?: string;
    customFilter?: (value: unknown, query: string, item: DataItem, key: string) => boolean;
    disabled?: boolean;
    itemsPerPage?: number;
}>(), { itemsPerPage: 10 });
const props = useDefaults(rawProps, 'UDataIterator');
const page = defineModel<number>('page', { default: 1 });
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const filtered = computed(() => processItems(props.items, { headers: props.headers, search: props.search, customFilter: props.customFilter, sortBy: sortBy.value }));
const pageCount = computed(() => props.itemsPerPage === -1 ? 1 : Math.max(1, Math.ceil(filtered.value.length / Math.max(1, props.itemsPerPage))));
const visible = computed(() => pageItems(filtered.value, page.value, props.itemsPerPage));
watch(pageCount, (count) => { if (page.value > count) page.value = count; });
function nextPage(): void { if (!props.disabled && page.value < pageCount.value) page.value++; }
function prevPage(): void { if (!props.disabled && page.value > 1) page.value--; }
</script>

<template>
    <slot :items="visible" :all-items="filtered" :page="page" :page-count="pageCount" :sort-by="sortBy" :next-page="nextPage" :prev-page="prevPage" :total="filtered.length" />
</template>
