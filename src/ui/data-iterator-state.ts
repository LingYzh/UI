import { computed, watch, type Ref } from 'vue';
import {
    createGroups,
    filterItems,
    flattenGroups,
    getItemProperty,
    internalItems as createInternalItems,
    normalizeHeaders,
    pageItems,
    sortItems,
    type DataGroup,
    type DataGroupNode,
    type DataHeader,
    type DataItem,
    type FilterFunction,
    type InternalDataItem,
    type ItemProperty,
    type ProcessOptions
} from './data-pipeline';
import type { TableSort } from './table';

export interface DataIteratorItem {
    type: 'item';
    value: unknown;
    selectable: boolean;
    raw: unknown;
    index: number;
    key: string | number;
    columns: Record<string, unknown>;
}

export interface DataIteratorGroup {
    type: 'group';
    id: string;
    key: string;
    title: string;
    value: unknown;
    depth: number;
    items: DataIteratorRow[];
}

export type DataIteratorRow = DataIteratorItem | DataIteratorGroup;

export interface DataIteratorSelectionContext {
    allItems: DataIteratorItem[];
    currentPage: DataIteratorItem[];
}

export interface DataIteratorSelectContext extends DataIteratorSelectionContext {
    value: boolean;
    selected: Set<unknown>;
}

export interface DataIteratorSelectionStrategy {
    showSelectAll: boolean;
    allSelected: (context: DataIteratorSelectionContext) => DataIteratorItem[];
    select: (context: { items: DataIteratorItem[]; value: boolean; selected: Set<unknown> }) => Set<unknown>;
    selectAll: (context: DataIteratorSelectContext) => Set<unknown>;
}

export type DataIteratorModels = {
    page: Ref<number | string>;
    itemsPerPage: Ref<number | string>;
    sortBy: Ref<TableSort[]>;
    groupBy: Ref<DataGroup[]>;
    modelValue: Ref<unknown[]>;
    expanded: Ref<unknown[]>;
    opened: Ref<string[]>;
};

export interface DataIteratorProps {
    items?: readonly unknown[];
    headers?: readonly DataHeader[];
    search?: string;
    itemsLength?: number | string;
    standardProtocol?: boolean;
    itemValue?: ItemProperty | null;
    itemSelectable?: ItemProperty | null;
    returnObject?: boolean;
    valueComparator?: (left: unknown, right: unknown) => boolean;
    customFilter?: FilterFunction;
    customKeyFilter?: Record<string, FilterFunction>;
    filterKeys?: string | readonly string[];
    filterMode?: ProcessOptions['filterMode'];
    ignoreAccents?: boolean | string;
    noFilter?: boolean;
    customKeySort?: Record<string, (left: unknown, right: unknown) => number | null>;
    disableSort?: boolean;
    initialSortOrder?: 'asc' | 'desc';
    multiSort?: boolean | { key?: 'ctrl'; mode?: 'append' | 'prepend'; modifier?: 'alt' | 'shift' };
    mustSort?: boolean;
    selectStrategy?: 'single' | 'page' | 'all' | DataIteratorSelectionStrategy;
    expandStrategy?: 'single' | 'multiple';
    expandOnClick?: boolean;
    groupKey?: (context: { key: string; value: unknown; parentKey: string | null }) => string;
    openAll?: boolean;
    disabled?: boolean;
    loading?: boolean | string | { color?: string; side?: 'start' | 'end' | 'both' };
}

export interface DataIteratorOptions {
    page: number;
    itemsPerPage: number;
    sortBy: TableSort[];
    groupBy: DataGroup[];
    search: string;
}

export interface DataIteratorEmit {
    (event: 'update:options', value: DataIteratorOptions): void;
    (event: 'update:currentItems', value: unknown[]): void;
}

type SourceEntry = {
    raw: unknown;
    record: DataItem;
    index: number;
    key: string;
    selectable: boolean;
};

function isObjectLike(value: unknown): value is object {
    return (typeof value === 'object' && value !== null) || typeof value === 'function';
}

function isRecordItem(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
}

function deepValueEqual(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) return true;
    if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime();
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
    const leftKeys = Object.keys(left);
    return leftKeys.length === Object.keys(right).length
        && leftKeys.every(key => Object.hasOwn(right, key)
            && deepValueEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]));
}

function normalizePage(value: number | string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function normalizeItemsPerPage(value: number | string): number {
    const parsed = Number(value);
    if (parsed === -1) return -1;
    return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 10;
}

function countValue(value: number | string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function cloneOptions(options: DataIteratorOptions): DataIteratorOptions {
    return {
        page: options.page,
        itemsPerPage: options.itemsPerPage,
        sortBy: options.sortBy.map(sort => ({ ...sort })),
        groupBy: options.groupBy.map(group => ({ ...group })),
        search: options.search
    };
}

function optionsEqual(left: DataIteratorOptions, right: DataIteratorOptions): boolean {
    return left.page === right.page
        && left.itemsPerPage === right.itemsPerPage
        && left.search === right.search
        && left.sortBy.length === right.sortBy.length
        && left.groupBy.length === right.groupBy.length
        && left.sortBy.every((sort, index) => sort.key === right.sortBy[index].key && sort.order === right.sortBy[index].order)
        && left.groupBy.every((group, index) => group.key === right.groupBy[index].key && group.order === right.groupBy[index].order);
}

function extractIteratorRows(rows: readonly DataIteratorRow[]): DataIteratorItem[] {
    return [...new Set(rows.flatMap(row => row.type === 'item' ? [row] : extractIteratorRows(row.items)))];
}

/** Iterator keeps its raw item contract while adapting primitives to the record-based data pipeline. */
export function useDataIteratorState(getProps: () => DataIteratorProps, models: DataIteratorModels, emit: DataIteratorEmit = () => undefined) {
    const objectRecords = new WeakMap<object, DataItem[]>();
    const primitiveRecords = new Map<unknown, DataItem[]>();
    const recordKeys = new WeakMap<object, string>();
    let nextRecordKey = 0;

    function getRecord(raw: unknown, occurrence: number): DataItem {
        const cache = isObjectLike(raw) ? objectRecords : primitiveRecords;
        let records = cache.get(raw as never);
        if (!records) {
            records = [];
            cache.set(raw as never, records);
        }
        let record = records[occurrence];
        if (!record) {
            if (isObjectLike(raw)) {
                record = new Proxy(raw as DataItem, {
                    get(target, key) {
                        const value = Reflect.get(target, key, target);
                        return typeof value === 'function' ? value.bind(target) : value;
                    }
                });
            } else {
                record = { value: raw };
            }
            records[occurrence] = record;
            recordKeys.set(record, `iterator-${++nextRecordKey}`);
        }
        return record;
    }

    function getPropertyValue(raw: unknown, record: DataItem, property?: ItemProperty | null, itemValue = false): unknown {
        const standardProtocol = !!getProps().standardProtocol;
        const resolvedProperty = itemValue && property === undefined ? 'id' : property;
        if (resolvedProperty == null) {
            if (!itemValue || standardProtocol) return undefined;
            return isRecordItem(raw) ? getItemProperty(record, 'id') : raw;
        }
        if (typeof resolvedProperty === 'function') return resolvedProperty(raw as DataItem);
        if (!isRecordItem(raw)) return standardProtocol ? undefined : raw;
        return getItemProperty(record, resolvedProperty);
    }

    function getSelectable(raw: unknown, record: DataItem, property?: ItemProperty | null): boolean {
        if (property == null) return true;
        const value = typeof property === 'function' ? property(raw as DataItem) : getItemProperty(record, property, true);
        if (value === undefined) return true;
        return getProps().standardProtocol ? Boolean(value) : value !== false;
    }

    const entries = computed<SourceEntry[]>(() => {
        const occurrences = new Map<unknown, number>();
        return (getProps().items ?? []).map((raw, index) => {
            const occurrence = occurrences.get(raw) ?? 0;
            occurrences.set(raw, occurrence + 1);
            const record = getRecord(raw, occurrence);
            return {
                raw,
                record,
                index,
                key: recordKeys.get(record)!,
                selectable: getSelectable(raw, record, getProps().itemSelectable)
            };
        });
    });
    const entriesByRecord = computed(() => new Map(entries.value.map(entry => [entry.record, entry])));
    const layout = computed(() => normalizeHeaders(getProps().headers, entries.value.map(entry => entry.record)));

    function adaptedFilter(filter: FilterFunction): FilterFunction {
        return (value, query, context, key) => {
            const entry = entriesByRecord.value.get(context.raw);
            if (!entry) return filter(value, query, context, key);
            if (getProps().standardProtocol) {
                const wrapper = wrapperByRecord.value.get(entry.record);
                return filter(value, query, wrapper as unknown as typeof context, key);
            }
            const legacyContext = { ...context, raw: entry.raw as DataItem };
            return filter(value, query, legacyContext, key);
        };
    }

    const pipelineHeaders = computed(() => layout.value.columns.map(header => ({
        ...header,
        value: (record: DataItem) => {
            const entry = entriesByRecord.value.get(record);
            return entry ? getPropertyValue(entry.raw, record, header.value) : getItemProperty(record, header.value);
        },
        sortRaw: header.sortRaw ? (left: DataItem, right: DataItem) => {
            const leftEntry = entriesByRecord.value.get(left);
            const rightEntry = entriesByRecord.value.get(right);
            return header.sortRaw!(leftEntry?.raw as DataItem ?? left, rightEntry?.raw as DataItem ?? right);
        } : undefined,
        filter: header.filter ? adaptedFilter(header.filter) : undefined
    })));
    const pipelineItems = computed(() => createInternalItems(entries.value.map(entry => entry.record), pipelineHeaders.value, {
        itemValue: record => recordKeys.get(record as object),
        itemSelectable: record => entriesByRecord.value.get(record)?.selectable ?? true,
        returnObject: true
    }));
    const pipelineItemByRecord = computed(() => new Map(pipelineItems.value.map(item => [item.raw, item])));
    const allItems = computed<DataIteratorItem[]>(() => pipelineItems.value.map(item => {
        const entry = entriesByRecord.value.get(item.raw)!;
        return {
            type: 'item',
            value: getProps().returnObject ? entry.raw : getPropertyValue(entry.raw, entry.record, getProps().itemValue, true),
            selectable: entry.selectable,
            raw: entry.raw,
            index: entry.index,
            key: entry.key,
            columns: item.columns
        };
    }));
    const wrapperByRecord = computed(() => new Map(allItems.value.map((item, index) => [entries.value[index].record, item])));
    const processOptions = computed<ProcessOptions>(() => {
        const props = getProps();
        return {
            headers: pipelineHeaders.value,
            search: props.search,
            customFilter: props.customFilter ? adaptedFilter(props.customFilter) : undefined,
            customKeyFilter: props.customKeyFilter
                ? Object.fromEntries(Object.entries(props.customKeyFilter).map(([key, filter]) => [key, adaptedFilter(filter)]))
                : undefined,
            filterKeys: props.filterKeys,
            filterMode: props.filterMode,
            ignoreAccents: props.ignoreAccents,
            noFilter: props.noFilter,
            customKeySort: props.customKeySort,
            disableSort: props.disableSort,
            sortBy: models.sortBy.value,
            groupBy: models.groupBy.value
        };
    });
    const filteredRecords = computed(() => filterItems(entries.value.map(entry => entry.record), processOptions.value).items);
    const processedRecords = computed(() => sortItems(filteredRecords.value, processOptions.value));
    const processedInternalItems = computed(() => processedRecords.value
        .map(record => pipelineItemByRecord.value.get(record))
        .filter((item): item is InternalDataItem => !!item));
    const filteredItems = computed(() => processedInternalItems.value
        .map(item => wrapperByRecord.value.get(item.raw))
        .filter((item): item is DataIteratorItem => !!item));
    const pipelineGroups = computed(() => createGroups(processedInternalItems.value, models.groupBy.value, getProps().groupKey));
    function convertRow(node: DataGroupNode | InternalDataItem): DataIteratorRow {
        if (node.type === 'item') return wrapperByRecord.value.get(node.raw)!;
        return { ...node, items: node.items.map(convertRow) };
    }
    const groups = computed<DataIteratorRow[]>(() => pipelineGroups.value.map(convertRow));
    const opened = computed(() => new Set(models.opened.value));
    const flatRows = computed(() => flattenGroups(pipelineGroups.value, opened.value));
    const page = computed(() => normalizePage(models.page.value));
    const size = computed(() => normalizeItemsPerPage(models.itemsPerPage.value));
    const hasItemsLength = computed(() => getProps().itemsLength !== undefined && getProps().itemsLength !== null);
    const totalLength = computed(() => hasItemsLength.value ? countValue(getProps().itemsLength!) : flatRows.value.length);
    const pageCount = computed(() => size.value === -1 ? 1 : Math.max(1, Math.ceil(totalLength.value / size.value)));
    const paginatedRows = computed(() => hasItemsLength.value ? flatRows.value : pageItems(flatRows.value, page.value, size.value));
    const groupedItems = computed<DataIteratorRow[]>(() => paginatedRows.value
        .filter((row): row is DataGroupNode | InternalDataItem => row.type === 'group' || row.type === 'item')
        .map(convertRow));
    const currentItems = computed(() => extractIteratorRows(groupedItems.value));
    const busy = computed(() => {
        const loading = getProps().loading;
        return loading != null && loading !== false && loading !== 'false';
    });
    const blocked = computed(() => !!getProps().disabled || busy.value);
    const comparator = computed(() => getProps().valueComparator ?? deepValueEqual);

    function isSelected(item: DataIteratorItem): boolean;
    function isSelected(items: readonly DataIteratorItem[]): boolean;
    function isSelected(itemOrItems: DataIteratorItem | readonly DataIteratorItem[]): boolean {
        const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems as DataIteratorItem];
        return items.every(item => models.modelValue.value.some(value => comparator.value(value, item.value)));
    }

    const selectedValues = computed(() => models.modelValue.value.map(value => {
        const item = allItems.value.find(candidate => comparator.value(value, candidate.value));
        return item ? item.value : value;
    }));

    const selectionContext = computed<DataIteratorSelectionContext>(() => ({
        allItems: allItems.value.filter(item => item.selectable),
        currentPage: currentItems.value.filter(item => item.selectable)
    }));
    const strategy = computed<DataIteratorSelectionStrategy>(() => {
        const configured = getProps().selectStrategy ?? 'page';
        if (typeof configured === 'object') return configured;
        const single = configured === 'single';
        const all = configured === 'all';
        return {
            showSelectAll: !single,
            allSelected: context => single ? [] : all ? context.allItems : context.currentPage,
            select: ({ items, value, selected }) => {
                if (single) return new Set(value && items[0] ? [items[0].value] : []);
                for (const item of items) if (value) selected.add(item.value); else selected.delete(item.value);
                return selected;
            },
            selectAll: ({ value, selected, allItems: candidates, currentPage }) => {
                if (single) return selected;
                if (all) return new Set(value ? candidates.map(item => item.value) : []);
                for (const item of currentPage) if (value) selected.add(item.value); else selected.delete(item.value);
                return selected;
            }
        };
    });
    const allSelected = computed(() => {
        const candidates = strategy.value.allSelected(selectionContext.value);
        return candidates.length > 0 && candidates.every(isSelected);
    });
    const someSelected = computed(() => models.modelValue.value.length > 0);
    const somePageSelected = computed(() => selectionContext.value.currentPage.some(isSelected));

    function select(item: DataIteratorItem, value: boolean): void;
    function select(items: readonly DataIteratorItem[], value: boolean): void;
    function select(itemOrItems: DataIteratorItem | readonly DataIteratorItem[], value: boolean) {
        if (blocked.value) return;
        const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems as DataIteratorItem];
        const selectedItems = items.filter(item => item.selectable);
        models.modelValue.value = [...strategy.value.select({
            items: selectedItems,
            value,
            selected: new Set(selectedValues.value)
        })];
    }

    function toggleSelect(item: DataIteratorItem) {
        if (!item.selectable || blocked.value) return;
        select([item], !isSelected(item));
    }

    function selectAll(value: boolean) {
        if (blocked.value) return;
        models.modelValue.value = [...strategy.value.selectAll({
            ...selectionContext.value,
            value,
            selected: new Set(selectedValues.value)
        })];
    }

    function isExpanded(item: DataIteratorItem): boolean {
        return models.expanded.value.some(value => comparator.value(value, item.value));
    }

    function expand(item: DataIteratorItem, value: boolean) {
        if (blocked.value) return;
        const remaining = value && getProps().expandStrategy === 'single'
            ? []
            : models.expanded.value.filter(candidate => !comparator.value(candidate, item.value));
        models.expanded.value = value ? [...remaining, item.value] : remaining;
    }

    function toggleExpand(item: DataIteratorItem) {
        expand(item, !isExpanded(item));
    }

    function isGroupOpen(group: DataIteratorGroup): boolean {
        return opened.value.has(group.id) || group.value == null;
    }

    function toggleGroup(group: DataIteratorGroup) {
        if (blocked.value) return;
        models.opened.value = opened.value.has(group.id)
            ? models.opened.value.filter(id => id !== group.id)
            : [...models.opened.value, group.id];
    }

    function collectGroupIds(nodes: readonly (DataGroupNode | InternalDataItem)[]): string[] {
        return nodes.flatMap(node => node.type === 'group' ? [node.id, ...collectGroupIds(node.items)] : []);
    }

    let seenGroupIds = new Set<string>();
    watch([pipelineGroups, () => getProps().openAll], () => {
        const ids = new Set(getProps().openAll ? collectGroupIds(pipelineGroups.value) : []);
        if (getProps().openAll) {
            const next = new Set(models.opened.value.filter(id => !seenGroupIds.has(id) || ids.has(id)));
            for (const id of ids) if (!seenGroupIds.has(id)) next.add(id);
            if (next.size !== models.opened.value.length || [...next].some(id => !opened.value.has(id))) {
                models.opened.value = [...next];
            }
        }
        seenGroupIds = ids;
    }, { immediate: true });

    function setPage(value: number) {
        if (!blocked.value) models.page.value = Math.min(pageCount.value, normalizePage(value));
    }

    function setItemsPerPage(value: number) {
        if (blocked.value) return;
        models.itemsPerPage.value = value === -1 ? -1 : normalizeItemsPerPage(value);
        models.page.value = 1;
    }

    function nextPage() {
        if (!blocked.value && page.value < pageCount.value) models.page.value = page.value + 1;
    }

    function prevPage() {
        if (!blocked.value && page.value > 1) models.page.value = page.value - 1;
    }

    function toggleSort(column: string | { key?: string }, event?: MouseEvent, mandatory = false) {
        const key = typeof column === 'string' ? column : column.key;
        if (!key || getProps().disableSort || blocked.value) return;
        const header = layout.value.columns.find(candidate => candidate.key === key);
        if (header?.sortable === false) return;
        const initial = getProps().initialSortOrder ?? 'asc';
        const other = initial === 'asc' ? 'desc' : 'asc';
        const previous = models.sortBy.value.find(sort => sort.key === key);
        const multi = getProps().multiSort;
        const active = typeof multi === 'object' ? !multi.key || !!(event?.ctrlKey || event?.metaKey) : !!multi;
        const reverse = typeof multi === 'object' && (multi.modifier === 'shift' && event?.shiftKey || multi.modifier === 'alt' && event?.altKey);
        const prepend = typeof multi === 'object' && (reverse ? multi.mode !== 'prepend' : multi.mode === 'prepend');
        let next: TableSort[] = active || previous ? [...models.sortBy.value] : [];
        const order = !previous ? initial : previous.order === other
            ? mandatory || getProps().mustSort && next.length === 1 ? initial : null
            : other;
        if (previous) next = next.filter(sort => sort.key !== key);
        if (order) {
            const entry = { key, order };
            const index = previous ? models.sortBy.value.findIndex(sort => sort.key === key) : prepend ? 0 : next.length;
            next.splice(index, 0, entry);
        }
        models.sortBy.value = next;
        models.page.value = 1;
    }

    watch([pageCount, page], () => {
        if (page.value > pageCount.value) models.page.value = pageCount.value;
    });
    watch(() => getProps().search, (search, previousSearch) => {
        if (getProps().standardProtocol && search !== previousSearch) models.page.value = 1;
    });

    const options = computed<DataIteratorOptions>(() => ({
        page: page.value,
        itemsPerPage: size.value,
        sortBy: models.sortBy.value,
        groupBy: models.groupBy.value,
        search: getProps().search ?? ''
    }));
    let previousOptions: DataIteratorOptions | undefined;
    watch(options, current => {
        const snapshot = cloneOptions(current);
        if (previousOptions && optionsEqual(previousOptions, snapshot)) return;
        previousOptions = snapshot;
        emit('update:options', cloneOptions(snapshot));
    }, { deep: true, immediate: true });

    const emittedCurrentItems = computed(() => {
        if (getProps().standardProtocol) return hasItemsLength.value ? null : groupedItems.value;
        return currentItems.value.map(item => item.raw);
    });
    let previousCurrentItems: unknown[] | undefined;
    watch(emittedCurrentItems, current => {
        if (current === null) return;
        if (previousCurrentItems && previousCurrentItems.length === current.length
            && previousCurrentItems.every((item, index) => Object.is(item, current[index]))) return;
        previousCurrentItems = [...current];
        emit('update:currentItems', current);
    }, { immediate: true });

    const slotProps = computed(() => {
        const current = currentItems.value;
        const filteredRaw = filteredItems.value.map(item => item.raw);
        return {
            page: page.value,
            itemsPerPage: size.value,
            pageCount: pageCount.value,
            itemsLength: totalLength.value,
            itemsCount: filteredItems.value.length,
            total: filteredItems.value.length,
            search: getProps().search ?? '',
            sortBy: models.sortBy.value,
            groupBy: models.groupBy.value,
            items: getProps().standardProtocol ? current : current.map(item => item.raw),
            allItems: filteredRaw,
            internalItems: filteredItems.value,
            currentItems: current.map(item => item.raw),
            groupedItems: groupedItems.value,
            groups: groups.value,
            allSelected: allSelected.value,
            someSelected: someSelected.value,
            somePageSelected: somePageSelected.value,
            showSelectAll: strategy.value.showSelectAll,
            expandOnClick: !!getProps().expandOnClick,
            toggleSort,
            setPage,
            setItemsPerPage,
            prevPage,
            nextPage,
            isSelected,
            select,
            selectAll,
            toggleSelect,
            isExpanded,
            expand,
            toggleExpand,
            isGroupOpen,
            toggleGroup,
            extractRows: extractIteratorRows
        };
    });

    return {
        allItems,
        filteredItems,
        processedItems: filteredItems,
        internalItems: filteredItems,
        groupedItems,
        groups,
        pipelineGroups,
        flatRows,
        paginatedRows,
        currentItems,
        page,
        size,
        pageCount,
        totalLength,
        busy,
        blocked,
        strategy,
        options,
        slotProps,
        isSelected,
        select,
        selectAll,
        toggleSelect,
        isExpanded,
        expand,
        toggleExpand,
        isGroupOpen,
        toggleGroup,
        toggleSort,
        setPage,
        setItemsPerPage,
        prevPage,
        nextPage
    };
}
