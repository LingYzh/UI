<script setup lang="ts">
import {
    computed,
    ref,
    watch,
    useSlots,
    useId,
    mergeProps,
    nextTick,
    type CSSProperties,
} from 'vue';
import Icon from '../components/Icon.vue';
import UiScrollArea from './UiScrollArea.vue';
import UiSelect from './UiSelect.vue';
import UiPagination from './UiPagination.vue';
import UiButton from './UiButton.vue';
import DataTableSlotRows from './DataTableSlotRows';
import DataTableHighlight from './DataTableHighlight';
import { vRipple } from './ripple';
import { vPointerBlur } from './pointer-focus';
import { useDisplay } from './display';
import { provideUiTheme } from './theme';
import { uiText, type UiMessageKey } from './locale';
import { buttonColorStyles } from './button-colors';
import { useDataTableState } from './data-table-state';
import { dataRowKey, useTableVirtual } from './data-table-virtual';
import {
    extractItems,
    getItemProperty,
    toUnit,
    type DataGroup,
    type DataItem,
    type DataGroupNode,
    type DataRow,
    type InternalDataItem,
    type NormalizedHeader,
} from './data-pipeline';
import type {
    DataTableEventMap,
    DataTableProps,
    RowContext,
    TablePaginationProps,
    TableVirtualProps,
} from './data-table-types';
import type { TableSort } from './table';

const props = withDefaults(
    defineProps<
        DataTableProps &
            TablePaginationProps &
            TableVirtualProps & {
                server?: boolean;
                virtual?: boolean;
                itemsLength?: number | string;
            }
    >(),
    {
        items: () => [],
        itemValue: 'id',
        itemTitle: 'title',
        label: 'Data table',
        tag: 'div',
        rounded: true,
        hover: true,
        ripple: true,
        initialSortOrder: 'asc',
        selectStrategy: 'page',
        expandStrategy: 'multiple',
        pageBy: 'auto',
        filterMode: 'intersection',
        gridlines: 'horizontal',
        mobile: undefined,
        mobileBreakpoint: 'lg',
        itemsPerPageOptions: () => [10, 25, 50, 100, -1],
        showFirstLastPage: true,
        itemHeight: 40,
        overscan: 5,
    }
);
const emit = defineEmits<DataTableEventMap>();
const page = defineModel<number | string>('page', { default: 1 });
const itemsPerPage = defineModel<number | string>('itemsPerPage', { default: 10 });
const sortBy = defineModel<TableSort[]>('sortBy', { default: () => [] });
const groupBy = defineModel<DataGroup[]>('groupBy', { default: () => [] });
const selected = defineModel<unknown[]>({ default: () => [] });
const expanded = defineModel<unknown[]>('expanded', { default: () => [] });
const opened = defineModel<string[]>('opened', { default: () => [] });
const slots = useSlots();
const theme = provideUiTheme(() => props.theme);
const display = useDisplay();
const isMobile = computed(
    () =>
        props.mobile ??
        display.width.value <
            (typeof props.mobileBreakpoint === 'number'
                ? props.mobileBreakpoint
                : display.thresholds[props.mobileBreakpoint])
);
const state = useDataTableState(
    props,
    { page, itemsPerPage, sortBy, groupBy, modelValue: selected, expanded, opened },
    () => !!slots['group-summary']
);
const {
    layout,
    rows,
    currentItems,
    busy,
    blocked,
    slotProps,
    isSelected,
    isSomeSelected,
    select,
    selectAll,
    toggleSelect,
    isExpanded,
    toggleExpand,
    isGroupOpen,
    toggleGroup,
    toggleSort,
} = state;
const area = ref<InstanceType<typeof UiScrollArea>>();
const table = ref<HTMLTableElement>();
const virtual = useTableVirtual(
    rows,
    area,
    table,
    () => !!props.virtual,
    () => props.itemHeight,
    () => props.overscan,
    renderKey
);
const { displayed, before, after } = virtual;
const selectId = useId();
const columnCount = computed(() => Math.max(1, layout.value.columns.length));
const colors = computed(() => (props.color ? buttonColorStyles(props.color) : {}));
const loadingSide = computed(() =>
    typeof props.loading === 'object' ? (props.loading.side ?? 'start') : 'start'
);
const loadingColor = computed(() =>
    typeof props.loading === 'object'
        ? (props.loading.color ?? props.color)
        : typeof props.loading === 'string' && props.loading !== 'true'
          ? props.loading
          : props.color
);
const loaderScope = computed(() => ({
    ...slotProps.value,
    color: loadingColor.value,
    isActive: busy.value,
}));
const loaderStyle = computed(() => ({
    ...buttonColorStyles(loadingColor.value),
    background: 'var(--ui-button-color, var(--accent))',
}));
const compact = computed(() => props.density === 'compact' || props.dense);
const headerHeight = computed(() =>
    compact.value ? 40 : props.density === 'comfortable' ? 44 : 52
);
const rootStyle = computed<CSSProperties>(() => ({
    ...theme.styles.value,
    ...colors.value,
    '--ui-table-header-height': `${headerHeight.value}px`,
    '--ui-table-row-height': props.virtual ? `${virtual.estimate.value}px` : undefined,
    ...(props.virtual ? { height: toUnit(props.height ?? 360) } : {}),
}));
const sizes = computed(() => {
    const options = props.itemsPerPageOptions.map((option) =>
        typeof option === 'number'
            ? {
                  value: option,
                  title:
                      option === -1
                          ? uiText('table.all')
                          : uiText('table.perPageOption', { count: option }),
              }
            : option
    );
    return options.some((option) => option.value === state.size.value)
        ? options
        : [
              {
                  value: state.size.value,
                  title:
                      state.size.value === -1
                          ? uiText('table.all')
                          : uiText('table.perPageOption', { count: state.size.value }),
              },
              ...options,
          ];
});
const start = computed(() =>
    state.total.value
        ? state.size.value === -1
            ? 1
            : (state.page.value - 1) * state.size.value + 1
        : 0
);
const end = computed(() =>
    state.size.value === -1
        ? state.total.value
        : Math.min(state.page.value * state.size.value, state.total.value)
);
const range = computed(() =>
    props.pageText && !props.pageText.startsWith('$vuetify.')
        ? props.pageText
              .replaceAll('{0}', String(start.value))
              .replaceAll('{1}', String(end.value))
              .replaceAll('{2}', String(state.total.value))
        : state.total.value
          ? uiText('table.range', { start: start.value, end: end.value, total: state.total.value })
          : uiText('table.rangeEmpty')
);
function text(value: string | undefined, fallback: UiMessageKey): string {
    return value && !value.startsWith('$vuetify.') ? value : uiText(fallback);
}
function rowContext(item: InternalDataItem, index = currentItems.value.indexOf(item)): RowContext {
    return { item: item.raw, internalItem: item, index };
}
function matches(item: InternalDataItem) {
    return props.getMatches?.(item) ?? state.filtered.value.matches.get(item.raw);
}
function renderKey(row: DataRow): string {
    return row.type === 'item' && props.virtual && props.itemKey
        ? `item:${String(getItemProperty(row.raw, props.itemKey, row.key))}`
        : dataRowKey(row);
}
function itemScope(item: InternalDataItem, index: number) {
    return {
        ...slotProps.value,
        ...rowContext(item, index),
        value: item.value,
        isSelected,
        isExpanded,
        toggleSelect,
        toggleExpand,
        getMatches: matches,
        props: rowAttributes(item, index),
        itemRef: (element: HTMLElement | null) => {
            if (element) {
                element.dataset.virtualKey = renderKey(item);
                virtual.scheduleMeasure();
            }
        },
    };
}
function groupScope(
    row: Exclude<DataRow, InternalDataItem>,
    index: number,
    column?: NormalizedHeader
) {
    const selectable = groupItems(row);
    const groupProps =
        column?.key === 'data-table-select'
            ? {
                  modelValue: selectable.length > 0 && isSelected(selectable),
                  indeterminate: isSomeSelected(selectable) && !isSelected(selectable),
                  disabled: blocked.value || !selectable.length,
                  'onUpdate:modelValue': (value: boolean) => select(selectable, value),
              }
            : {
                  icon: isGroupOpen(row as DataGroupNode)
                      ? (props.groupCollapseIcon ?? '$expand')
                      : (props.groupExpandIcon ?? '$next'),
                  disabled: blocked.value,
                  onClick: () => toggleGroup(row as DataGroupNode),
              };
    return {
        ...slotProps.value,
        item: row,
        group: row,
        index,
        count: extractItems(row.items).length,
        props: groupProps,
        toggle: () => toggleGroup(row as DataGroupNode),
    };
}
function headerScope(column: NormalizedHeader) {
    return {
        ...slotProps.value,
        column,
        header: column,
        selectAll,
        getSortIcon: slotProps.value.getSortIcon,
        props: {
            color: props.color,
            modelValue: slotProps.value.allSelected,
            indeterminate: slotProps.value.someSelected && !slotProps.value.allSelected,
            disabled: blocked.value,
            'onUpdate:modelValue': selectAll,
        },
    };
}
function cellScope(item: InternalDataItem, index: number, column: NormalizedHeader) {
    const controls =
        column.key === 'data-table-select'
            ? {
                  color: props.color,
                  disabled: blocked.value || !item.selectable,
                  modelValue: isSelected(item),
                  onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      toggleSelect(item, currentItems.value.indexOf(item), event);
                  },
              }
            : column.key === 'data-table-expand'
              ? {
                    icon: isExpanded(item)
                        ? (props.collapseIcon ?? '$collapse')
                        : (props.expandIcon ?? '$expand'),
                    disabled: blocked.value,
                    size: 'small',
                    variant: 'text',
                    onClick: (event: MouseEvent) => {
                        event.stopPropagation();
                        toggleExpand(item);
                    },
                }
              : cellAttributes(item, index, column);
    return { ...itemScope(item, index), column, value: item.columns[column.key], props: controls };
}
function columnStyles(column: NormalizedHeader, header = false): CSSProperties {
    return {
        textAlign: column.align,
        width: toUnit(column.width),
        minWidth: toUnit(column.minWidth ?? (column.fixed ? (column.width ?? 120) : undefined)),
        maxWidth: toUnit(column.maxWidth),
        whiteSpace: column.nowrap ? 'nowrap' : undefined,
        paddingInlineStart: column.indent ? toUnit(column.indent) : undefined,
        ...(column.fixed
            ? {
                  position: 'sticky',
                  insetInlineStart:
                      column.fixed === 'start' ? `${column.fixedOffset}px` : undefined,
                  insetInlineEnd: column.fixed === 'end' ? `${column.fixedEndOffset}px` : undefined,
                  zIndex: header ? 4 : 2,
              }
            : {}),
        ...(header && (props.fixedHeader || props.sticky || props.virtual)
            ? {
                  position: 'sticky',
                  top: `calc(var(--ui-table-header-height) * ${column.depth})`,
                  zIndex: column.fixed ? 4 : 3,
              }
            : {}),
    };
}
function headerAttributes(column: NormalizedHeader) {
    return mergeProps(
        {
            style: columnStyles(column, true),
            class: { 'is-fixed-column': !!column.fixed },
            scope: column.colspan > 1 ? 'colgroup' : 'col',
            rowspan: column.rowspan,
            colspan: column.colspan,
        },
        props.headerProps ?? {},
        column.headerProps ?? {}
    );
}
function headerKey(event: KeyboardEvent, column: NormalizedHeader) {
    if (
        event.target !== event.currentTarget ||
        !slots[`header.${column.key}`] ||
        !['Enter', ' '].includes(event.key)
    )
        return;
    event.preventDefault();
    toggleSort(column);
}
function groupEvent(
    event: MouseEvent,
    item: DataGroupNode,
    index: number,
    name: 'click' | 'dblclick' | 'contextmenu'
) {
    if (blocked.value || (event.target as HTMLElement).closest('button, input, a, select')) return;
    const context = { item, index, columns: layout.value.columns };
    if (name === 'click') emit('click:groupHeader', event, context);
    else if (name === 'dblclick') emit('dblclick:groupHeader', event, context);
    else emit('contextmenu:groupHeader', event, context);
}
function rowAttributes(item: InternalDataItem, index: number) {
    const context = rowContext(item, index);
    const attributes =
        typeof props.rowProps === 'function' ? props.rowProps(context) : props.rowProps;
    return mergeProps(
        {
            'data-item-key': item.key,
            'data-virtual-key': props.virtual ? renderKey(item) : undefined,
            class: { 'is-selected': isSelected(item) },
            'aria-selected': props.showSelect ? isSelected(item) : undefined,
            onClick: (event: MouseEvent) => rowEvent(event, item, index, 'click:row'),
            onDblclick: (event: MouseEvent) => rowEvent(event, item, index, 'dblclick:row'),
            onContextmenu: (event: MouseEvent) => rowEvent(event, item, index, 'contextmenu:row'),
        },
        attributes ?? {}
    );
}
function cellAttributes(item: InternalDataItem, index: number, column: NormalizedHeader) {
    const context = { ...rowContext(item, index), column, value: item.columns[column.key] };
    return mergeProps(
        {
            style: columnStyles(column),
            class: { 'is-fixed-column': !!column.fixed },
            'data-column': column.key,
            'data-label': column.title,
        },
        typeof props.cellProps === 'function' ? props.cellProps(context) : (props.cellProps ?? {}),
        typeof column.cellProps === 'function'
            ? column.cellProps(context)
            : (column.cellProps ?? {})
    );
}
function rowEvent(
    event: MouseEvent,
    item: InternalDataItem,
    index: number,
    name: 'click:row' | 'dblclick:row' | 'contextmenu:row'
) {
    if (
        (event.target as HTMLElement).closest(
            'button, input, a, select, textarea, [role="button"]'
        ) ||
        blocked.value
    )
        return;
    if (name === 'click:row' && props.expandOnClick) toggleExpand(item);
    const context = rowContext(item, index);
    if (name === 'click:row') emit('click:row', event, context);
    else if (name === 'dblclick:row') emit('dblclick:row', event, context);
    else emit('contextmenu:row', event, context);
}
function selectLabel(item: InternalDataItem, index: number) {
    const title = String(getItemProperty(item.raw, props.itemTitle, index + 1));
    return props.selectRowLabel && !props.selectRowLabel.startsWith('$vuetify.')
        ? props.selectRowLabel.replaceAll('{0}', title)
        : uiText('table.selectRow', { title });
}
function groupItems(row: Exclude<DataRow, InternalDataItem>) {
    return extractItems(row.items).filter((item) => item.selectable);
}
function sortOrder(column: NormalizedHeader) {
    return sortBy.value.find((sort) => sort.key === column.key)?.order;
}
function changeSize(value: string | number | null | undefined) {
    state.setItemsPerPage(Number(value));
}
function scrollToIndex(index: number) {
    virtual.scrollToIndex(index);
}
watch(
    () =>
        JSON.stringify({
            page: state.page.value,
            itemsPerPage: state.size.value,
            sortBy: sortBy.value,
            groupBy: groupBy.value,
            search: props.search ?? '',
        }),
    (value) => emit('update:options', JSON.parse(value)),
    { immediate: true, flush: 'post' }
);
watch(state.paginatedEntries, (items) => emit('update:currentItems', items), { immediate: true });
watch([() => props.search, sortBy, groupBy], () => nextTick(virtual.reset), { deep: true });
watch(
    expanded,
    () => {
        virtual.scheduleMeasure();
        area.value?.update();
    },
    { deep: true, flush: 'post' }
);
watch(
    () => props.width,
    () => nextTick(() => area.value?.update())
);
defineExpose({
    scrollToIndex,
    setPage: state.setPage,
    setItemsPerPage: state.setItemsPerPage,
    toggleSort,
    selectAll,
    toggleExpand,
    toggleGroup,
});
</script>

<template>
    <component
        :is="props.tag"
        class="u-data-table"
        :style="rootStyle"
        :class="{
            'ui-data-table-server': props.server,
            'u-data-table-virtual': props.virtual,
            'is-dense': compact,
            'is-comfortable': props.density === 'comfortable',
            'is-ghost': props.ghost,
            'is-square': !props.rounded,
            'is-fixed-header': props.fixedHeader || props.sticky,
            'is-fixed-footer': props.fixedFooter,
            'is-hover': props.hover,
            'is-mobile': isMobile,
        }"
        :data-gridlines="
            props.gridlines === true ? 'all' : props.gridlines === false ? 'none' : props.gridlines
        "
        :data-striped="props.striped"
        :data-theme="theme.current.value.dark ? 'dark' : 'light'"
        :data-ui-theme="theme.name.value"
        :aria-busy="busy || undefined"
    >
        <slot name="top" v-bind="slotProps" />
        <slot name="wrapper" v-bind="slotProps">
            <UiScrollArea
                ref="area"
                :label="uiText('table.scrollArea', { label: props.label })"
                axis="both"
                :height="props.virtual ? '100%' : toUnit(props.height)"
                :rounded="props.rounded"
                :dense="compact"
                @scroll="virtual.scroll($event)"
            >
                <table
                    ref="table"
                    :aria-label="props.label"
                    :style="{ minWidth: toUnit(props.width) }"
                >
                    <slot name="default" v-bind="slotProps">
                        <slot name="caption" v-bind="slotProps" />
                        <slot name="colgroup" v-bind="slotProps" />
                        <thead v-if="!props.hideDefaultHeader">
                            <slot name="headers" v-bind="slotProps">
                                <tr v-for="(headerRow, depth) in layout.headers" :key="depth">
                                    <th
                                        v-for="column in headerRow"
                                        :key="column.key"
                                        v-bind="headerAttributes(column)"
                                        :aria-sort="
                                            column.sortable && !props.disableSort
                                                ? sortOrder(column) === 'asc'
                                                    ? 'ascending'
                                                    : sortOrder(column) === 'desc'
                                                      ? 'descending'
                                                      : 'none'
                                                : undefined
                                        "
                                        :tabindex="
                                            $slots[`header.${column.key}`] &&
                                            column.sortable &&
                                            !props.disableSort &&
                                            !blocked
                                                ? 0
                                                : undefined
                                        "
                                        @click="
                                            $slots[`header.${column.key}`] &&
                                            column.sortable &&
                                            toggleSort(column, $event)
                                        "
                                        @keydown="headerKey($event, column)"
                                    >
                                        <slot
                                            :name="`header.${column.key}`"
                                            v-bind="headerScope(column)"
                                        >
                                            <span
                                                v-if="
                                                    column.key === 'data-table-select' &&
                                                    state.strategy.value.showSelectAll
                                                "
                                                class="ui-selection-ripple is-checkbox"
                                                v-ripple.center.circle="props.ripple"
                                            >
                                                <input
                                                    type="checkbox"
                                                    :checked="slotProps.allSelected"
                                                    :indeterminate="
                                                        slotProps.someSelected &&
                                                        !slotProps.allSelected
                                                    "
                                                    :disabled="
                                                        blocked ||
                                                        !state.allItems.value.some(
                                                            (item) => item.selectable
                                                        )
                                                    "
                                                    :aria-label="
                                                        text(
                                                            props.selectAllLabel,
                                                            'table.selectAll'
                                                        )
                                                    "
                                                    @change="selectAll(!slotProps.allSelected)"
                                                />
                                            </span>
                                            <button
                                                v-else-if="column.sortable && !props.disableSort"
                                                type="button"
                                                class="u-data-table-sort"
                                                :disabled="blocked"
                                                :aria-label="
                                                    uiText('table.sort', { title: column.title })
                                                "
                                                v-ripple="props.ripple"
                                                v-pointer-blur
                                                @click="toggleSort(column, $event)"
                                            >
                                                {{ column.title }}
                                                <Icon
                                                    v-if="
                                                        props.sortIcon ||
                                                        props.sortAscIcon ||
                                                        props.sortDescIcon
                                                    "
                                                    :icon="
                                                        props.sortIcon ??
                                                        slotProps.getSortIcon(column)
                                                    "
                                                    :size="16"
                                                />
                                                <svg
                                                    v-else
                                                    class="ui-table-sort-icon"
                                                    viewBox="0 0 12 16"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M6 2 10 6H2Z"
                                                        :class="{
                                                            'is-active':
                                                                sortOrder(column) === 'asc',
                                                        }"
                                                    />
                                                    <path
                                                        d="M2 10H10L6 14Z"
                                                        :class="{
                                                            'is-active':
                                                                sortOrder(column) === 'desc',
                                                        }"
                                                    />
                                                </svg>
                                                <small
                                                    v-if="sortBy.length > 1 && sortOrder(column)"
                                                    class="u-data-table-sort-order"
                                                >
                                                    {{
                                                        sortBy.findIndex(
                                                            (sort) => sort.key === column.key
                                                        ) + 1
                                                    }}
                                                </small>
                                            </button>
                                            <template v-else>{{ column.title }}</template>
                                        </slot>
                                    </th>
                                </tr>
                            </slot>
                            <tr v-if="isMobile" class="u-data-table-mobile-header">
                                <th :colspan="columnCount">
                                    <slot name="mobile.header" v-bind="slotProps">
                                        <div class="u-data-table-mobile-controls">
                                            <UiSelect
                                                v-if="
                                                    !props.disableSort &&
                                                    layout.columns.some((column) => column.sortable)
                                                "
                                                :model-value="sortBy[0]?.key ?? ''"
                                                dense
                                                :aria-label="
                                                    uiText('table.sort', { title: props.label })
                                                "
                                                @update:model-value="
                                                    (value) => value && toggleSort(String(value))
                                                "
                                            >
                                                <option value="" disabled>
                                                    {{ uiText('table.sort', { title: '' }) }}
                                                </option>
                                                <option
                                                    v-for="column in layout.columns.filter(
                                                        (column) => column.sortable
                                                    )"
                                                    :key="column.key"
                                                    :value="column.key"
                                                >
                                                    {{ column.title }}
                                                </option>
                                            </UiSelect>
                                            <button
                                                v-if="sortBy.length && !props.disableSort"
                                                type="button"
                                                :disabled="blocked"
                                                :aria-label="
                                                    uiText('table.sort', {
                                                        title:
                                                            layout.columns.find(
                                                                (column) =>
                                                                    column.key === sortBy[0].key
                                                            )?.title ?? props.label,
                                                    })
                                                "
                                                v-ripple="props.ripple"
                                                v-pointer-blur
                                                @click="toggleSort(sortBy[0].key)"
                                            >
                                                <Icon
                                                    :icon="
                                                        sortBy[0].order === 'desc'
                                                            ? (props.sortDescIcon ??
                                                              '$sortDesc')
                                                            : (props.sortAscIcon ?? '$sortAsc')
                                                    "
                                                    :size="16"
                                                />
                                            </button>
                                            <label
                                                v-if="
                                                    props.showSelect &&
                                                    state.strategy.value.showSelectAll
                                                "
                                            >
                                                <input
                                                    type="checkbox"
                                                    :checked="slotProps.allSelected"
                                                    :indeterminate="
                                                        slotProps.someSelected &&
                                                        !slotProps.allSelected
                                                    "
                                                    :disabled="blocked"
                                                    @change="selectAll(!slotProps.allSelected)"
                                                />
                                                {{ text(props.selectAllLabel, 'table.selectAll') }}
                                            </label>
                                        </div>
                                    </slot>
                                </th>
                            </tr>
                            <tr v-if="busy && loadingSide !== 'end'" class="u-data-table-loader">
                                <th :colspan="columnCount">
                                    <slot name="loader" v-bind="loaderScope">
                                        <span
                                            class="u-data-table-progress"
                                            :style="loaderStyle"
                                            role="progressbar"
                                            :aria-label="text(props.loadingText, 'common.loading')"
                                        />
                                    </slot>
                                </th>
                            </tr>
                        </thead>
                        <slot name="thead" v-bind="slotProps" />
                        <tbody v-if="!props.hideDefaultBody">
                            <slot name="body.prepend" v-bind="slotProps" />
                            <slot name="body" v-bind="slotProps">
                                <tr v-if="busy && (!rows.length || $slots.loading)">
                                    <td :colspan="columnCount" class="ui-table-state">
                                        <slot name="loading" v-bind="slotProps">
                                            <span role="status">
                                                {{ text(props.loadingText, 'common.loading') }}
                                            </span>
                                        </slot>
                                    </td>
                                </tr>
                                <tr v-else-if="props.error">
                                    <td :colspan="columnCount" class="ui-table-state">
                                        <slot name="error" :error="props.error">
                                            <div class="ui-table-error" role="alert">
                                                <span>{{ props.error }}</span>
                                                <UiButton
                                                    :ripple="props.ripple"
                                                    dense
                                                    @click="emit('retry')"
                                                >
                                                    {{ uiText('common.retry') }}
                                                </UiButton>
                                            </div>
                                        </slot>
                                    </td>
                                </tr>
                                <template v-else>
                                    <tr
                                        v-if="before"
                                        class="u-data-table-spacer"
                                        aria-hidden="true"
                                        :style="{ height: `${before}px` }"
                                    >
                                        <td :colspan="columnCount" />
                                    </tr>
                                    <template
                                        v-for="(row, rowIndex) in displayed"
                                        :key="renderKey(row)"
                                    >
                                        <DataTableSlotRows
                                            v-if="row.type === 'group'"
                                            :colspan="columnCount"
                                            class="u-data-table-group"
                                            :data-virtual-key="
                                                props.virtual ? renderKey(row) : undefined
                                            "
                                        >
                                            <slot
                                                name="group-header"
                                                v-bind="
                                                    groupScope(
                                                        row,
                                                        virtual.range.value.start + rowIndex
                                                    )
                                                "
                                            >
                                                <tr
                                                    class="u-data-table-group"
                                                    @click="
                                                        groupEvent($event, row, rowIndex, 'click')
                                                    "
                                                    @dblclick="
                                                        groupEvent(
                                                            $event,
                                                            row,
                                                            rowIndex,
                                                            'dblclick'
                                                        )
                                                    "
                                                    @contextmenu="
                                                        groupEvent(
                                                            $event,
                                                            row,
                                                            rowIndex,
                                                            'contextmenu'
                                                        )
                                                    "
                                                >
                                                    <DataTableSlotRows
                                                        cell
                                                        v-for="column in layout.columns.filter(
                                                            (column) =>
                                                                column.key ===
                                                                    'data-table-select' ||
                                                                column.key === 'data-table-group'
                                                        )"
                                                        :key="column.key"
                                                        :colspan="
                                                            column.key === 'data-table-group'
                                                                ? columnCount -
                                                                  Number(
                                                                      layout.columns.some(
                                                                          (column) =>
                                                                              column.key ===
                                                                              'data-table-select'
                                                                      )
                                                                  )
                                                                : 1
                                                        "
                                                    >
                                                        <slot
                                                            v-if="column.key === 'data-table-group'"
                                                            name="data-table-group"
                                                            v-bind="
                                                                groupScope(row, rowIndex, column)
                                                            "
                                                        >
                                                            <slot
                                                                name="group-header.data-table-group"
                                                                v-bind="
                                                                    groupScope(
                                                                        row,
                                                                        rowIndex,
                                                                        column
                                                                    )
                                                                "
                                                            >
                                                                <button
                                                                    type="button"
                                                                    :style="{
                                                                        marginInlineStart: `${row.depth * 16}px`,
                                                                    }"
                                                                    :disabled="blocked"
                                                                    :aria-expanded="
                                                                        isGroupOpen(row)
                                                                    "
                                                                    v-ripple="props.ripple"
                                                                    v-pointer-blur
                                                                    @click="toggleGroup(row)"
                                                                >
                                                                    <Icon
                                                                        :icon="
                                                                            isGroupOpen(row)
                                                                                ? (props.groupCollapseIcon ??
                                                                                  '$expand')
                                                                                : (props.groupExpandIcon ??
                                                                                  '$next')
                                                                        "
                                                                        :size="18"
                                                                    />
                                                                    {{ row.title }} ({{
                                                                        extractItems(row.items)
                                                                            .length
                                                                    }})
                                                                </button>
                                                            </slot>
                                                        </slot>
                                                        <slot
                                                            v-else-if="
                                                                column.key === 'data-table-select'
                                                            "
                                                            name="data-table-select"
                                                            v-bind="
                                                                groupScope(row, rowIndex, column)
                                                            "
                                                        >
                                                            <slot
                                                                name="group-header.data-table-select"
                                                                v-bind="
                                                                    groupScope(
                                                                        row,
                                                                        rowIndex,
                                                                        column
                                                                    )
                                                                "
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    :checked="
                                                                        isSelected(
                                                                            groupItems(row)
                                                                        ) &&
                                                                        !!groupItems(row).length
                                                                    "
                                                                    :indeterminate="
                                                                        isSomeSelected(
                                                                            groupItems(row)
                                                                        ) &&
                                                                        !isSelected(groupItems(row))
                                                                    "
                                                                    :disabled="
                                                                        blocked ||
                                                                        !groupItems(row).length
                                                                    "
                                                                    :aria-label="
                                                                        uiText(
                                                                            'table.selectGroup',
                                                                            {
                                                                                title: row.title,
                                                                            }
                                                                        )
                                                                    "
                                                                    @change="
                                                                        select(
                                                                            groupItems(row),
                                                                            !isSelected(
                                                                                groupItems(row)
                                                                            )
                                                                        )
                                                                    "
                                                                />
                                                            </slot>
                                                        </slot>
                                                    </DataTableSlotRows>
                                                </tr>
                                            </slot>
                                        </DataTableSlotRows>
                                        <DataTableSlotRows
                                            v-else-if="row.type === 'group-summary'"
                                            :colspan="columnCount"
                                            class="u-data-table-group-summary"
                                            :data-virtual-key="
                                                props.virtual ? renderKey(row) : undefined
                                            "
                                        >
                                            <slot
                                                name="group-summary"
                                                v-bind="groupScope(row, rowIndex)"
                                            />
                                        </DataTableSlotRows>
                                        <template v-else>
                                            <DataTableSlotRows
                                                v-if="$slots.item"
                                                :colspan="columnCount"
                                                :data-virtual-key="
                                                    props.virtual ? renderKey(row) : undefined
                                                "
                                            >
                                                <slot
                                                    name="item"
                                                    v-bind="
                                                        itemScope(
                                                            row,
                                                            virtual.range.value.start + rowIndex
                                                        )
                                                    "
                                                />
                                            </DataTableSlotRows>
                                            <tr
                                                v-else
                                                v-bind="
                                                    rowAttributes(
                                                        row,
                                                        virtual.range.value.start + rowIndex
                                                    )
                                                "
                                            >
                                                <td
                                                    v-for="column in layout.columns"
                                                    :key="column.key"
                                                    v-bind="
                                                        cellAttributes(
                                                            row,
                                                            virtual.range.value.start + rowIndex,
                                                            column
                                                        )
                                                    "
                                                >
                                                    <span
                                                        v-if="
                                                            isMobile &&
                                                            !column.key.startsWith('data-table-')
                                                        "
                                                        class="u-data-table-mobile-label"
                                                    >
                                                        {{ column.title }}
                                                    </span>
                                                    <slot
                                                        :name="`item.${column.key}`"
                                                        v-bind="
                                                            cellScope(
                                                                row,
                                                                virtual.range.value.start +
                                                                    rowIndex,
                                                                column
                                                            )
                                                        "
                                                    >
                                                        <span
                                                            v-if="
                                                                column.key === 'data-table-select'
                                                            "
                                                            class="ui-selection-ripple is-checkbox"
                                                            v-ripple.center.circle="props.ripple"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                :checked="isSelected(row)"
                                                                :disabled="
                                                                    blocked || !row.selectable
                                                                "
                                                                :aria-label="
                                                                    selectLabel(row, rowIndex)
                                                                "
                                                                @click.stop="
                                                                    toggleSelect(
                                                                        row,
                                                                        currentItems.indexOf(row),
                                                                        $event
                                                                    )
                                                                "
                                                            />
                                                        </span>
                                                        <button
                                                            v-else-if="
                                                                column.key === 'data-table-expand'
                                                            "
                                                            type="button"
                                                            :disabled="blocked"
                                                            :aria-expanded="isExpanded(row)"
                                                            :aria-label="
                                                                uiText(
                                                                    isExpanded(row)
                                                                        ? 'table.collapseRow'
                                                                        : 'table.expandRow',
                                                                    {
                                                                        title: String(
                                                                            getItemProperty(
                                                                                row.raw,
                                                                                props.itemTitle,
                                                                                rowIndex + 1
                                                                            )
                                                                        ),
                                                                    }
                                                                )
                                                            "
                                                            v-ripple="props.ripple"
                                                            v-pointer-blur
                                                            @click.stop="toggleExpand(row)"
                                                        >
                                                            <Icon
                                                                :icon="
                                                                    isExpanded(row)
                                                                        ? (props.collapseIcon ??
                                                                          '$collapse')
                                                                        : (props.expandIcon ??
                                                                          '$expand')
                                                                "
                                                                :size="18"
                                                            />
                                                        </button>
                                                        <DataTableHighlight
                                                            v-else
                                                            :value="row.columns[column.key]"
                                                            :matches="matches(row)?.[column.key]"
                                                        />
                                                    </slot>
                                                </td>
                                            </tr>
                                            <DataTableSlotRows
                                                v-if="$slots['expanded-row'] || $slots.expanded"
                                                :colspan="columnCount"
                                                expanded
                                                :visible="isExpanded(row)"
                                                :transition="
                                                    props.virtual ? false : props.expandTransition
                                                "
                                                :data-virtual-key="
                                                    props.virtual ? renderKey(row) : undefined
                                                "
                                            >
                                                <slot
                                                    name="expanded-row"
                                                    v-bind="itemScope(row, rowIndex)"
                                                >
                                                    <slot
                                                        name="expanded"
                                                        v-bind="itemScope(row, rowIndex)"
                                                    />
                                                </slot>
                                            </DataTableSlotRows>
                                        </template>
                                    </template>
                                    <tr
                                        v-if="after"
                                        class="u-data-table-spacer"
                                        aria-hidden="true"
                                        :style="{ height: `${after}px` }"
                                    >
                                        <td :colspan="columnCount" />
                                    </tr>
                                    <tr v-if="!rows.length && !busy && !props.hideNoData">
                                        <td :colspan="columnCount" class="ui-table-state">
                                            <slot name="no-data" v-bind="slotProps">
                                                <span role="status">
                                                    {{ text(props.noDataText, 'common.empty') }}
                                                </span>
                                            </slot>
                                        </td>
                                    </tr>
                                </template>
                            </slot>
                            <slot name="body.append" v-bind="slotProps" />
                            <tr v-if="busy && loadingSide !== 'start'" class="u-data-table-loader">
                                <th :colspan="columnCount">
                                    <slot name="loader" v-bind="loaderScope">
                                        <span
                                            class="u-data-table-progress"
                                            :style="loaderStyle"
                                            role="progressbar"
                                            :aria-label="text(props.loadingText, 'common.loading')"
                                        />
                                    </slot>
                                </th>
                            </tr>
                        </tbody>
                        <slot name="tbody" v-bind="slotProps" />
                        <slot name="tfoot" v-bind="slotProps" />
                    </slot>
                </table>
            </UiScrollArea>
        </slot>
        <slot name="bottom" v-bind="slotProps">
            <slot
                v-if="!props.virtual && !props.hideDefaultFooter"
                name="footer"
                v-bind="slotProps"
            >
                <footer class="ui-table-footer u-data-table-footer">
                    <slot name="footer.prepend" v-bind="slotProps" />
                    <div class="ui-table-page-size">
                        <label :for="selectId">
                            {{ text(props.itemsPerPageText, 'table.perPage') }}
                        </label>
                        <UiSelect
                            :id="selectId"
                            :model-value="state.size.value"
                            :disabled="blocked"
                            dense
                            :ghost="props.ghost"
                            :rounded="props.rounded"
                            @update:model-value="changeSize"
                        >
                            <option
                                v-for="option in sizes"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.title }}
                            </option>
                        </UiSelect>
                    </div>
                    <span class="ui-table-range" aria-live="polite">{{ range }}</span>
                    <span v-if="props.showCurrentPage" class="ui-table-current-page">
                        {{ state.page.value }} / {{ state.pageCount.value }}
                    </span>
                    <nav
                        class="ui-table-page-actions"
                        :aria-label="uiText('table.pagination', { label: props.label })"
                    >
                        <UiButton
                            v-if="props.showFirstLastPage"
                            icon
                            :dense="compact"
                            :ghost="props.ghost"
                            :rounded="props.rounded"
                            :ripple="props.ripple"
                            :disabled="blocked || state.page.value <= 1 || !state.total.value"
                            :aria-label="text(props.firstPageLabel, 'table.firstPage')"
                            @click="state.setPage(1)"
                        >
                            <Icon :icon="props.firstIcon ?? '$first'" :size="16" />
                        </UiButton>
                        <UiPagination
                            :ripple="props.ripple"
                            :color="props.color"
                            :model-value="state.page.value"
                            :length="
                                busy
                                    ? Math.max(state.page.value, state.pageCount.value)
                                    : state.pageCount.value
                            "
                            :disabled="blocked || !state.total.value"
                            :total-visible="3"
                            :dense="compact"
                            :ghost="props.ghost"
                            :rounded="props.rounded"
                            :prev-icon="props.prevIcon"
                            :next-icon="props.nextIcon"
                            :prev-label="props.prevPageLabel"
                            :next-label="props.nextPageLabel"
                            @update:model-value="state.setPage"
                        />
                        <UiButton
                            v-if="props.showFirstLastPage"
                            icon
                            :dense="compact"
                            :ghost="props.ghost"
                            :rounded="props.rounded"
                            :ripple="props.ripple"
                            :disabled="
                                blocked ||
                                state.page.value >= state.pageCount.value ||
                                !state.total.value
                            "
                            :aria-label="text(props.lastPageLabel, 'table.lastPage')"
                            @click="state.setPage(state.pageCount.value)"
                        >
                            <Icon :icon="props.lastIcon ?? '$last'" :size="16" />
                        </UiButton>
                    </nav>
                </footer>
            </slot>
        </slot>
    </component>
</template>
