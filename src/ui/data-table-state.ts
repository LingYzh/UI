import { computed, ref, watch, type Ref } from 'vue';
import { createGroups, extractItems, filterItems, flattenGroups, internalItems, normalizeHeaders, pageItems, sortItems, type DataGroupNode, type DataRow, type InternalDataItem } from './data-pipeline';
import type { DataTableProps, SelectionStrategy, TableModels, TablePaginationProps } from './data-table-types';
import type { IconValue } from './icon-config';
import { positiveInteger, type TableSort } from './table';

type Models = { [K in keyof TableModels]: Ref<TableModels[K]> };
export function tableValueEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && tableValueEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

/** 三种数据表共用排序、选择、展开和分组模型，服务端只跳过本地过滤与排序。 */
export function useDataTableState(props: DataTableProps & TablePaginationProps & { server?: boolean; virtual?: boolean; itemsLength?: number | string }, models: Models, hasSummary: () => boolean) {
    const layout = computed(() => normalizeHeaders(props.headers, props.items ?? [], { showSelect: props.showSelect, showExpand: props.showExpand, grouped: models.groupBy.value.length > 0 }));
    const allItems = computed(() => internalItems(props.items ?? [], layout.value.columns, props));
    const processOptions = computed(() => ({ ...props, headers: layout.value.columns, sortBy: models.sortBy.value, groupBy: models.groupBy.value }));
    const filtered = computed(() => props.server ? { items: [...props.items ?? []], matches: new Map() } : filterItems(props.items ?? [], processOptions.value));
    const processed = computed(() => {
        const raw = props.server ? filtered.value.items : sortItems(filtered.value.items, processOptions.value);
        const byRaw = new Map(allItems.value.map(item => [item.raw, item]));
        return raw.map(item => byRaw.get(item)!);
    });
    const groups = computed(() => createGroups(processed.value, models.groupBy.value, props.groupKey));
    const opened = computed(() => new Set(models.opened.value));
    const flatRows = computed(() => flattenGroups(groups.value, opened.value, hasSummary()));
    const size = computed(() => props.virtual || Number(models.itemsPerPage.value) === -1 ? -1 : positiveInteger(Number(models.itemsPerPage.value), 10));
    const page = computed(() => positiveInteger(Number(models.page.value)));
    const pageBy = computed(() => props.pageBy === 'auto' || !props.pageBy ? models.groupBy.value.length ? 'group' : 'item' : props.pageBy);
    const total = computed(() => props.server ? Math.max(0, Number.parseInt(String(props.itemsLength ?? 0), 10) || 0) : pageBy.value === 'group' ? groups.value.length : pageBy.value === 'any' ? flatRows.value.length : processed.value.length);
    const pageCount = computed(() => size.value === -1 ? 1 : Math.max(1, Math.ceil(total.value / size.value)));
    const paginatedEntries = computed<DataRow[]>(() => {
        if (props.server || props.virtual) return processed.value;
        if (pageBy.value === 'group') return pageItems(groups.value, page.value, size.value);
        if (pageBy.value === 'item') return pageItems(processed.value, page.value, size.value);
        return pageItems(flatRows.value, page.value, size.value);
    });
    const rows = computed<DataRow[]>(() => {
        if (props.server || props.virtual) return flatRows.value;
        if (pageBy.value === 'group') return flattenGroups(paginatedEntries.value as Array<DataGroupNode | InternalDataItem>, opened.value, hasSummary());
        if (pageBy.value === 'item') return flattenGroups(createGroups(paginatedEntries.value as InternalDataItem[], models.groupBy.value, props.groupKey), opened.value, hasSummary());
        return paginatedEntries.value;
    });
    const currentItems = computed(() => rows.value.filter((row): row is InternalDataItem => row.type === 'item'));
    const busy = computed(() => props.loading != null && props.loading !== false && props.loading !== 'false');
    const blocked = computed(() => props.disabled || busy.value);
    const strategy = computed<SelectionStrategy>(() => {
        if (typeof props.selectStrategy === 'object') return props.selectStrategy;
        const single = props.selectStrategy === 'single';
        const all = props.selectStrategy === 'all';
        return {
            showSelectAll: !single,
            allSelected: context => single ? [] : all ? context.allItems : context.currentPage,
            select: ({ items, value, selected }) => {
                if (single) return new Set(value && items[0] ? [items[0].value] : []);
                for (const item of items) if (value) selected.add(item.value); else selected.delete(item.value);
                return selected;
            },
            selectAll: ({ value, allItems, currentPage, selected }) => {
                if (single) return selected;
                if (all) return new Set(value ? allItems.map(item => item.value) : []);
                for (const item of currentPage) if (value) selected.add(item.value); else selected.delete(item.value);
                return selected;
            }
        };
    });
    const comparator = computed(() => props.valueComparator ?? tableValueEqual);
    const selected = computed(() => new Set(models.modelValue.value.map(value => allItems.value.find(item => comparator.value(value, item.value))?.value ?? value)));
    const selectionContext = computed(() => ({ allItems: allItems.value.filter(item => item.selectable), currentPage: currentItems.value.filter(item => item.selectable) }));
    const someSelected = computed(() => selected.value.size > 0);
    const allSelected = computed(() => {
        const candidates = strategy.value.allSelected(selectionContext.value);
        return candidates.length > 0 && candidates.every(item => selected.value.has(item.value));
    });
    const lastSelectedIndex = ref<number>();
    function isSelected(items: InternalDataItem | readonly InternalDataItem[]): boolean {
        return (Array.isArray(items) ? items : [items as InternalDataItem]).every(item => selected.value.has(item.value));
    }
    function isSomeSelected(items: InternalDataItem | readonly InternalDataItem[]): boolean {
        return (Array.isArray(items) ? items : [items as InternalDataItem]).some(item => selected.value.has(item.value));
    }
    function select(items: readonly InternalDataItem[], value: boolean) {
        if (blocked.value) return;
        models.modelValue.value = [...strategy.value.select({ items: items.filter(item => item.selectable), value, selected: new Set(selected.value) })];
    }
    function toggleSelect(item: InternalDataItem, index?: number, event?: MouseEvent) {
        if (!item.selectable || blocked.value) return;
        const position = index ?? currentItems.value.findIndex(candidate => candidate.key === item.key);
        const candidates = event?.shiftKey && lastSelectedIndex.value !== undefined && props.selectStrategy !== 'single'
            ? currentItems.value.slice(Math.min(lastSelectedIndex.value, position), Math.max(lastSelectedIndex.value, position) + 1)
            : [item];
        lastSelectedIndex.value = position;
        select(candidates, !isSelected(item));
    }
    function selectAll(value: boolean) {
        if (blocked.value) return;
        models.modelValue.value = [...strategy.value.selectAll({ ...selectionContext.value, value, selected: new Set(selected.value) })];
    }
    function isExpanded(item: InternalDataItem): boolean {
        return models.expanded.value.some(value => comparator.value(value, item.value));
    }
    function expand(item: InternalDataItem, value: boolean) {
        if (blocked.value) return;
        const rest = value && props.expandStrategy === 'single' ? [] : models.expanded.value.filter(candidate => !comparator.value(candidate, item.value));
        models.expanded.value = value ? [...rest, item.value] : rest;
    }
    function toggleExpand(item: InternalDataItem) { expand(item, !isExpanded(item)); }
    function isGroupOpen(group: DataGroupNode): boolean { return opened.value.has(group.id) || group.value == null; }
    function toggleGroup(group: DataGroupNode) {
        if (blocked.value) return;
        models.opened.value = opened.value.has(group.id) ? models.opened.value.filter(id => id !== group.id) : [...models.opened.value, group.id];
    }
    function collectIds(nodes: typeof groups.value): string[] {
        return nodes.flatMap(node => node.type === 'group' ? [node.id, ...collectIds(node.items)] : []);
    }
    let seenGroups = new Set<string>();
    watch([groups, () => props.openAll], () => {
        const ids = new Set(props.openAll ? collectIds(groups.value) : []);
        if (props.openAll) {
            const next = new Set(models.opened.value.filter(id => !seenGroups.has(id) || ids.has(id)));
            for (const id of ids) if (!seenGroups.has(id)) next.add(id);
            if (next.size !== models.opened.value.length || [...next].some(id => !opened.value.has(id))) models.opened.value = [...next];
        }
        seenGroups = ids;
    }, { immediate: true });
    function setPage(value: number) {
        if (!blocked.value) models.page.value = Math.min(pageCount.value, positiveInteger(value));
    }
    function setItemsPerPage(value: number) {
        if (blocked.value) return;
        models.itemsPerPage.value = value === -1 ? -1 : positiveInteger(value, 10);
        models.page.value = 1;
    }
    function toggleSort(column: string | { key?: string }, event?: MouseEvent, mandatory = false) {
        const key = typeof column === 'string' ? column : column.key;
        if (!key || props.disableSort || blocked.value) return;
        const header = layout.value.columns.find(header => header.key === key);
        if (header?.sortable === false) return;
        const initial = props.initialSortOrder ?? 'asc';
        const other = initial === 'asc' ? 'desc' : 'asc';
        const previous = models.sortBy.value.find(sort => sort.key === key);
        const multi = props.multiSort;
        const active = typeof multi === 'object' ? !multi.key || !!(event?.ctrlKey || event?.metaKey) : !!multi;
        const reverse = typeof multi === 'object' && (multi.modifier === 'shift' && event?.shiftKey || multi.modifier === 'alt' && event?.altKey);
        const prepend = typeof multi === 'object' && (reverse ? multi.mode !== 'prepend' : multi.mode === 'prepend');
        let next: TableSort[] = active || previous ? [...models.sortBy.value] : [];
        const order = !previous ? initial : previous.order === other ? mandatory || props.mustSort && next.length === 1 ? initial : null : other;
        if (previous) next = next.filter(sort => sort.key !== key);
        if (order) {
            const entry = { key, order };
            const index = previous ? models.sortBy.value.findIndex(sort => sort.key === key) : prepend ? 0 : next.length;
            next.splice(index, 0, entry);
        }
        models.sortBy.value = next;
        models.page.value = 1;
    }
    watch([pageCount, page, busy], () => {
        if (!props.virtual && !busy.value && page.value > pageCount.value) models.page.value = pageCount.value;
    });
    watch([() => props.search, () => models.sortBy.value, () => models.groupBy.value, size], () => {
        models.page.value = 1;
        lastSelectedIndex.value = undefined;
    }, { deep: true });
    const slotProps = computed(() => ({
        page: page.value, itemsPerPage: size.value, itemsLength: props.server ? total.value : processed.value.length, pageCount: pageCount.value,
        sortBy: models.sortBy.value, groupBy: models.groupBy.value, toggleSort,
        setItemsPerPage, setPage, nextPage: () => setPage(page.value + 1), prevPage: () => setPage(page.value - 1),
        allSelected: allSelected.value, someSelected: someSelected.value, isSelected, isSomeSelected, select, selectAll, toggleSelect,
        expand, isExpanded, toggleExpand, isGroupOpen, toggleGroup, extractRows: extractItems,
        items: currentItems.value.map(item => item.raw), internalItems: currentItems.value,
        groupedItems: rows.value, columns: layout.value.columns, headers: layout.value.headers,
        isSorted: (column: { key?: string }) => models.sortBy.value.some(sort => sort.key === column.key),
        getSortIcon: (column: { key?: string }): IconValue => models.sortBy.value.find(sort => sort.key === column.key)?.order === 'desc' ? props.sortDescIcon ?? '$sortDesc' : props.sortAscIcon ?? '$sortAsc'
    }));
    return { layout, allItems, processed, filtered, groups, rows, paginatedEntries, currentItems, page, size, total, pageCount, busy, blocked, strategy, slotProps, isSelected, isSomeSelected, select, selectAll, toggleSelect, isExpanded, expand, toggleExpand, isGroupOpen, toggleGroup, toggleSort, setPage, setItemsPerPage };
}
