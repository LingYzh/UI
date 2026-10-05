<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import UiScrollArea from './UiScrollArea.vue';
import type { TableHeader, TableSort } from './table';
import { uiText } from './locale';
const props = withDefaults(defineProps<{
    headers: readonly TableHeader[];
    items: readonly Record<string, unknown>[];
    itemValue?: string;
    label: string;
    loading?: boolean;
    emptyText?: string;
    sortBy?: readonly TableSort[];
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
    height?: string;
    fixedHeader?: boolean;
}>(), { itemValue: 'id', emptyText: undefined, sortBy: () => [], rounded: true });
defineEmits<{ sort: [key: string] }>();
</script>

<template>
    <div class="ui-table" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded, 'is-fixed-header': fixedHeader }" :aria-busy="loading || undefined">
        <UiScrollArea :label="uiText('table.scrollArea', { label })" axis="both" :height="height" :dense="dense" :rounded="rounded">
            <table :aria-label="label">
                <thead><tr><th v-for="header in headers" :key="header.key" scope="col" :style="{ textAlign: header.align, width: header.width }" :aria-sort="header.sortable ? (sortBy[0]?.key === header.key ? (sortBy[0].order === 'asc' ? 'ascending' : 'descending') : 'none') : undefined">
                    <button v-pointer-blur v-if="header.sortable" type="button" class="ui-table-sort" :disabled="loading" :aria-label="uiText('table.sort', { title: header.title })" @click="$emit('sort', header.key)"><slot :name="`header.${header.key}`" :header="header">{{ header.title }}</slot><svg class="ui-table-sort-icon" viewBox="0 0 12 16" aria-hidden="true"><path d="M6 2 10 6H2Z" :class="{ 'is-active': sortBy[0]?.key === header.key && sortBy[0]?.order === 'asc' }" /><path d="M2 10H10L6 14Z" :class="{ 'is-active': sortBy[0]?.key === header.key && sortBy[0]?.order === 'desc' }" /></svg></button>
                    <slot v-else :name="`header.${header.key}`" :header="header">{{ header.title }}</slot>
                </th></tr></thead>
                <tbody>
                    <tr v-if="loading"><td :colspan="Math.max(1, headers.length)" class="ui-table-state"><slot name="loading"><span role="status">{{ uiText('common.loading') }}</span></slot></td></tr>
                    <template v-else>
                        <tr v-for="(item, index) in items" :key="String(item[itemValue] ?? index)"><td v-for="header in headers" :key="header.key" :style="{ textAlign: header.align }"><slot :name="`item.${header.key}`" :item="item" :value="item[header.key]" :index="index">{{ item[header.key] ?? '—' }}</slot></td></tr>
                        <tr v-if="!items.length"><td :colspan="Math.max(1, headers.length)" class="ui-table-state"><slot name="no-data"><span role="status">{{ props.emptyText ?? uiText('common.empty') }}</span></slot></td></tr>
                    </template>
                </tbody>
            </table>
        </UiScrollArea>
    </div>
</template>
