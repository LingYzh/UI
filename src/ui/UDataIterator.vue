<script setup lang="ts">
import { computed } from 'vue';
import { useDefaults } from './defaults';
import { useDataIteratorState, type DataIteratorProps, type DataIteratorOptions, type DataIteratorItem, type DataIteratorGroup, type DataIteratorRow } from './data-iterator-state';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';
import type { DataGroup } from './data-pipeline';
import type { TableSort } from './table';

interface IteratorScope {
    page: number;
    itemsPerPage: number;
    pageCount: number;
    itemsLength: number;
    itemsCount: number;
    total: number;
    search: string;
    sortBy: TableSort[];
    groupBy: DataGroup[];
    items: unknown[];
    allItems: unknown[];
    internalItems: DataIteratorItem[];
    currentItems: unknown[];
    groupedItems: DataIteratorRow[];
    groups: DataIteratorRow[];
    allSelected: boolean;
    someSelected: boolean;
    somePageSelected: boolean;
    showSelectAll: boolean;
    expandOnClick: boolean;
    toggleSort: (column: string | { key?: string }, event?: MouseEvent, mandatory?: boolean) => void;
    setPage: (page: number) => void;
    setItemsPerPage: (size: number) => void;
    prevPage: () => void;
    nextPage: () => void;
    isSelected: {
        (item: DataIteratorItem): boolean;
        (items: readonly DataIteratorItem[]): boolean;
    };
    select: {
        (item: DataIteratorItem, value: boolean): void;
        (items: readonly DataIteratorItem[], value: boolean): void;
    };
    selectAll: (value: boolean) => void;
    toggleSelect: (item: DataIteratorItem) => void;
    isExpanded: (item: DataIteratorItem) => boolean;
    expand: (item: DataIteratorItem, value: boolean) => void;
    toggleExpand: (item: DataIteratorItem) => void;
    isGroupOpen: (group: DataIteratorGroup) => boolean;
    toggleGroup: (group: DataIteratorGroup) => void;
    extractRows: (rows: readonly DataIteratorRow[]) => DataIteratorItem[];
}
defineSlots<{
    default?: (scope: IteratorScope) => any;
    header?: (scope: IteratorScope) => any;
    footer?: (scope: IteratorScope) => any;
    loader?: (scope: { isActive: boolean; color?: string }) => any;
    'no-data'?: () => any;
}>();

defineOptions({ inheritAttrs: false });
const rawProps = defineProps<DataIteratorProps & { tag?: string; transition?: UiTransition }>();
const props = useDefaults(rawProps, 'UDataIterator');
const page = defineModel<number | string>('page', { default: 1 });
// Keep this library's original page size; callers can explicitly request five.
const itemsPerPage = defineModel<number | string>('itemsPerPage', { default: 10 });
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const groupBy = defineModel<DataGroup[]>('groupBy', { default: () => [] });
const selected = defineModel<unknown[]>({ default: () => [] });
const expanded = defineModel<unknown[]>('expanded', { default: () => [] });
const opened = defineModel<string[]>('opened', { default: () => [] });
const emit = defineEmits<{ 'update:options': [options: DataIteratorOptions]; 'update:currentItems': [items: unknown[]] }>();
const state = useDataIteratorState(() => props, { page, itemsPerPage, sortBy, groupBy, modelValue: selected, expanded, opened },
    (event, value) => event === 'update:options' ? emit(event, value as DataIteratorOptions) : emit(event, value as unknown[]));
const scope = state.slotProps;
const wrapperTag = computed(() => props.tag || (props.standardProtocol ? 'div' : undefined));
const loaderColor = computed(() => typeof props.loading === 'string' ? props.loading : typeof props.loading === 'object' ? props.loading.color : undefined);
defineExpose({
    items: state.currentItems, pageCount: state.pageCount, setPage: state.setPage, setItemsPerPage: state.setItemsPerPage,
    nextPage: state.nextPage, prevPage: state.prevPage, toggleSort: state.toggleSort,
    isSelected: state.isSelected, select: state.select, selectAll: state.selectAll, toggleSelect: state.toggleSelect,
    isExpanded: state.isExpanded, toggleExpand: state.toggleExpand, isGroupOpen: state.isGroupOpen, toggleGroup: state.toggleGroup
});
</script>

<template>
    <component :is="wrapperTag" v-if="wrapperTag" class="u-data-iterator" :class="{ 'is-loading': state.busy.value }" :aria-busy="state.busy.value"
        v-bind="$attrs">
        <slot name="header" v-bind="scope" />
        <UiMaybeTransition :transition="props.transition">
            <div v-if="state.busy.value" key="loading" class="u-data-iterator-loader" role="status">
                <slot name="loader" :is-active="true" :color="loaderColor">正在加载…</slot>
            </div>
            <div v-else key="items" class="u-data-iterator-items">
                <slot v-if="!state.currentItems.value.length && (props.standardProtocol || $slots['no-data'])" name="no-data">暂无数据</slot>
                <slot v-else v-bind="scope" />
            </div>
        </UiMaybeTransition>
        <slot name="footer" v-bind="scope" />
    </component>
    <template v-else>
        <slot name="header" v-bind="scope" />
        <slot v-if="state.busy.value" name="loader" :is-active="true" :color="loaderColor">正在加载…</slot>
        <slot v-else-if="!state.currentItems.value.length && $slots['no-data']" name="no-data" />
        <slot v-else v-bind="scope" />
        <slot name="footer" v-bind="scope" />
    </template>
</template>
