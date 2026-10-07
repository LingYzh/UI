<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import { computed, ref, watch } from 'vue';
import { getPath, itemKey, processItems, type DataHeader, type DataItem } from './data-pipeline';
import type { TableSort } from './table';
import { vPointerBlur } from './pointer-focus';
import { uiText } from './locale';

const rawProps = withDefaults(defineProps<{
    headers: readonly DataHeader[];
    items: readonly DataItem[];
    label?: string;
    itemValue?: string;
    search?: string;
    height?: number;
    itemHeight?: number;
    overscan?: number;
    loading?: boolean;
    disabled?: boolean;
} & { ripple?: RippleOptions }>(), { ripple: true, label: 'Virtual data table', itemValue: 'id', height: 360, itemHeight: 40, overscan: 5 });
const props = useDefaults(rawProps, 'UDataTableVirtual');
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const scrollTop = ref(0);
const sorted = computed(() => processItems(props.items, { headers: props.headers, search: props.search, sortBy: sortBy.value }));
const rowHeight = computed(() => Math.max(24, props.itemHeight));
const first = computed(() => Math.max(0, Math.floor(scrollTop.value / rowHeight.value) - props.overscan));
const count = computed(() => Math.ceil(props.height / rowHeight.value) + props.overscan * 2);
const windowItems = computed(() => sorted.value.slice(first.value, first.value + count.value));
const before = computed(() => first.value * rowHeight.value);
const after = computed(() => Math.max(0, (sorted.value.length - first.value - windowItems.value.length) * rowHeight.value));
watch([() => props.search, sortBy], () => { scrollTop.value = 0; });
function sort(key: string): void {
    if (props.loading || props.disabled) return;
    const current = sortBy.value.find((entry) => entry.key === key);
    sortBy.value = current?.order === 'asc' ? [{ key, order: 'desc' }] : current?.order === 'desc' ? [] : [{ key, order: 'asc' }];
}
</script>

<template>
    <div class="u-data-table u-data-table-virtual" :style="{ height: `${props.height}px` }" :aria-busy="props.loading || undefined" @scroll="scrollTop = ($event.target as HTMLElement).scrollTop">
        <table :aria-label="props.label">
            <thead><tr><th v-for="header in props.headers" :key="header.key" scope="col" :style="{ width: header.width, textAlign: header.align }" :aria-sort="header.sortable ? (sortBy.find((entry) => entry.key === header.key)?.order === 'asc' ? 'ascending' : sortBy.find((entry) => entry.key === header.key)?.order === 'desc' ? 'descending' : 'none') : undefined"><button v-ripple="props.ripple" v-if="header.sortable" v-pointer-blur type="button" :disabled="props.disabled || props.loading" :aria-label="uiText('table.sort', { title: header.title })" @click="sort(header.key)"><slot :name="`header.${header.key}`" :header="header">{{ header.title }}</slot><svg class="ui-table-sort-icon" viewBox="0 0 12 16" aria-hidden="true"><path d="M6 2 10 6H2Z" :class="{ 'is-active': sortBy.find((entry) => entry.key === header.key)?.order === 'asc' }" /><path d="M2 10H10L6 14Z" :class="{ 'is-active': sortBy.find((entry) => entry.key === header.key)?.order === 'desc' }" /></svg></button><slot v-else :name="`header.${header.key}`" :header="header">{{ header.title }}</slot></th></tr></thead>
            <tbody>
                <tr v-if="props.loading"><td :colspan="props.headers.length"><slot name="loading">Loading…</slot></td></tr>
                <template v-else>
                    <tr v-if="before" aria-hidden="true" :style="{ height: `${before}px` }"><td :colspan="props.headers.length" /></tr>
                    <tr v-for="(item, index) in windowItems" :key="itemKey(item, props.itemValue, first + index)" :style="{ height: `${rowHeight}px` }"><td v-for="header in props.headers" :key="header.key" :style="{ textAlign: header.align }"><slot :name="`item.${header.key}`" :item="item" :value="getPath(item, header.value ?? header.key)" :index="first + index">{{ getPath(item, header.value ?? header.key) ?? '—' }}</slot></td></tr>
                    <tr v-if="after" aria-hidden="true" :style="{ height: `${after}px` }"><td :colspan="props.headers.length" /></tr>
                    <tr v-if="!sorted.length"><td :colspan="props.headers.length"><slot name="no-data">No data</slot></td></tr>
                </template>
            </tbody>
        </table>
    </div>
</template>
