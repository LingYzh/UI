<script setup lang="ts">
import { ref } from 'vue';
import DataTableCore from './DataTableCore.vue';
import { useDefaults } from './defaults';
import type {
    DataTableProps,
    TablePaginationProps,
    TableVirtualProps,
    RowContext,
    GroupContext,
    DataTableSlots,
} from './data-table-types';
import type { DataGroup, DataOptions, DataRow } from './data-pipeline';
import type { TableSort } from './table';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(
    defineProps<Omit<DataTableProps, 'hideDefaultFooter'> & TableVirtualProps>(),
    {
        ripple: true,
        rounded: true,
        hover: true,
        mobile: undefined,
        mobileBreakpoint: 'lg',
        gridlines: 'horizontal',
        itemValue: 'id',
        itemTitle: 'title',
        initialSortOrder: 'asc',
        selectStrategy: 'page',
        expandStrategy: 'multiple',
        items: () => [],
        label: 'Virtual data table',
        filterMode: 'intersection',
        height: 360,
        itemHeight: 40,
        overscan: 5,
    }
);
const props = useDefaults(rawProps, 'UDataTableVirtual');
defineSlots<Omit<DataTableSlots, 'footer' | 'footer.prepend'>>();
const emit = defineEmits<{
    'update:options': [options: DataOptions];
    'update:currentItems': [items: DataRow[]];
    'click:row': [event: MouseEvent, context: RowContext];
    'dblclick:row': [event: MouseEvent, context: RowContext];
    'contextmenu:row': [event: MouseEvent, context: RowContext];
    'click:groupHeader': [event: MouseEvent, context: GroupContext];
    'dblclick:groupHeader': [event: MouseEvent, context: GroupContext];
    'contextmenu:groupHeader': [event: MouseEvent, context: GroupContext];
    retry: [];
}>();
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const groupBy = defineModel<DataGroup[]>('groupBy', { default: () => [] });
const selected = defineModel<unknown[]>({ default: () => [] });
const expanded = defineModel<unknown[]>('expanded', { default: () => [] });
const opened = defineModel<string[]>('opened', { default: () => [] });
const core = ref<InstanceType<typeof DataTableCore>>();
function scrollToIndex(index: number) {
    core.value?.scrollToIndex(index);
}
function setPage(value: number) {
    core.value?.setPage(value);
}
function setItemsPerPage(value: number) {
    core.value?.setItemsPerPage(value);
}
function toggleSort(column: string | { key?: string }, event?: MouseEvent, mandatory?: boolean) {
    core.value?.toggleSort(column, event, mandatory);
}
function selectAll(value: boolean) {
    core.value?.selectAll(value);
}
defineExpose({ scrollToIndex, toggleSort, selectAll });
</script>

<template>
    <DataTableCore
        ref="core"
        v-bind="{ ...$attrs, ...props }"
        virtual
        v-model:sort-by="sortBy"
        v-model:group-by="groupBy"
        v-model="selected"
        v-model:expanded="expanded"
        v-model:opened="opened"
        @update:options="emit('update:options', $event)"
        @update:current-items="emit('update:currentItems', $event)"
        @click:row="(event, context) => emit('click:row', event, context)"
        @dblclick:row="(event, context) => emit('dblclick:row', event, context)"
        @contextmenu:row="(event, context) => emit('contextmenu:row', event, context)"
        @click:group-header="(event, context) => emit('click:groupHeader', event, context)"
        @dblclick:group-header="(event, context) => emit('dblclick:groupHeader', event, context)"
        @contextmenu:group-header="
            (event, context) => emit('contextmenu:groupHeader', event, context)
        "
        @retry="emit('retry')"
    >
        <template
            v-for="name in (Object.keys($slots) as Array<keyof DataTableSlots>).filter(
                (name) => name !== 'footer' && name !== 'footer.prepend'
            )"
            #[name]="scope"
        >
            <!-- 动态 name 与 scope 在同一转发链中配对；模板类型系统无法表达此相关性。 -->
            <slot :name="name" v-bind="scope as any" />
        </template>
    </DataTableCore>
</template>
