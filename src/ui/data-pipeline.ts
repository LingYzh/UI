import type { TableHeader, TableSort } from './table';
import { findMatchRanges } from '@vuetify/v0/utilities';

export type DataItem = Record<string, unknown>;
export type DataKey = string | number;
export type ItemProperty = string | readonly string[] | ((item: DataItem, fallback?: unknown) => unknown);
export type FilterMatch = boolean | number | readonly [number, number] | ReadonlyArray<readonly [number, number]>;
export type FilterFunction = (value: unknown, query: string, item: DataItem & { raw: DataItem; columns: Record<string, unknown>; index: number }, key: string) => FilterMatch;
export type DataHeader = Omit<TableHeader, 'key' | 'title'> & {
    key?: string;
    title?: string;
    value?: ItemProperty;
    children?: readonly DataHeader[];
    filterable?: boolean;
    fixed?: boolean | 'start' | 'end';
    nowrap?: boolean;
    indent?: number;
    minWidth?: string | number;
    maxWidth?: string | number;
    headerProps?: Record<string, unknown>;
    cellProps?: Record<string, unknown> | ((context: { item: DataItem; index: number; value: unknown; column: DataHeader; internalItem: InternalDataItem }) => Record<string, unknown>);
    sort?: (a: unknown, b: unknown) => number | null;
    sortRaw?: (a: DataItem, b: DataItem) => number | null;
    filter?: FilterFunction;
};
export type DataGroup = { key: string; order?: 'asc' | 'desc' | boolean };
export type DataOptions = { page: number; itemsPerPage: number; sortBy: TableSort[]; groupBy: DataGroup[]; search: string };
export type InternalDataItem = { type: 'item'; key: DataKey; index: number; value: unknown; selectable: boolean; columns: Record<string, unknown>; raw: DataItem };
export type NormalizedHeader = DataHeader & { key: string; title: string; sortable: boolean; rowspan: number; colspan: number; depth: number; fixedOffset: number; fixedEndOffset: number };
export type DataGroupNode = { type: 'group'; id: string; key: string; title: string; value: unknown; depth: number; items: Array<InternalDataItem | DataGroupNode> };
export type DataRow = InternalDataItem | DataGroupNode | (Omit<DataGroupNode, 'type'> & { type: 'group-summary' });
const fallbackKeys = new WeakMap<DataItem, number>();
let nextFallbackKey = -1;

export function getPath(item: DataItem, path: string): unknown {
    return path.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as DataItem)[part] : undefined, item);
}
export function getItemProperty(item: DataItem, property?: ItemProperty, fallback?: unknown): unknown {
    if (property == null) return fallback;
    const value = typeof property === 'function' ? property(item, fallback) : getPath(item, Array.isArray(property) ? property.join('.') : property as string);
    return value === undefined ? fallback : value;
}
export function itemKey(item: DataItem, itemValue: ItemProperty = 'id', _index = 0): DataKey {
    const value = getItemProperty(item, itemValue);
    if (typeof value === 'string' || typeof value === 'number') return value;
    let key = fallbackKeys.get(item);
    if (key === undefined) { key = nextFallbackKey--; fallbackKeys.set(item, key); }
    return key;
}
export function toUnit(value?: string | number): string | undefined {
    return value == null ? undefined : typeof value === 'number' || /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

/** 表头矩阵与叶列共用同一结果，排序、过滤和固定列读取一致的 value。 */
export function normalizeHeaders(source: readonly DataHeader[] | undefined, items: readonly DataItem[], options: { showSelect?: boolean; showExpand?: boolean; grouped?: boolean } = {}) {
    const base: DataHeader[] = source ? [...source] : Object.keys(items[0] ?? {}).map(key => ({ key, title: key }));
    function hasKey(headers: readonly DataHeader[], key: string): boolean {
        return headers.some(header => header.key === key || !!header.children && hasKey(header.children, key));
    }
    if (options.grouped && !hasKey(base, 'data-table-group')) base.unshift({ key: 'data-table-group', title: '', sortable: false, width: 48 });
    if (options.showSelect && !hasKey(base, 'data-table-select')) base.unshift({ key: 'data-table-select', title: '', sortable: false, width: 48 });
    if (options.showExpand && !hasKey(base, 'data-table-expand')) base.push({ key: 'data-table-expand', title: '', sortable: false, width: 48 });
    function depth(headers: readonly DataHeader[]): number {
        return Math.max(1, ...headers.map(header => header.children?.length ? 1 + depth(header.children) : 1));
    }
    const maxDepth = depth(base);
    const rows: NormalizedHeader[][] = Array.from({ length: maxDepth }, () => []);
    const columns: NormalizedHeader[] = [];
    function visit(headers: readonly DataHeader[], level: number, parentFixed?: DataHeader['fixed']) {
        for (const [index, header] of headers.entries()) {
            const key = header.key ?? (typeof header.value === 'string' ? header.value : `header-${level}-${index}`);
            const fixed = header.fixed ?? parentFixed;
            const normalized: NormalizedHeader = { ...header, key, title: header.title ?? '', value: header.value ?? key, fixed: fixed === true ? 'start' : fixed, sortable: header.sortable ?? (!key.startsWith('data-table-') && !!(header.key || header.value)), rowspan: header.children?.length ? 1 : maxDepth - level, colspan: 1, depth: level, fixedOffset: 0, fixedEndOffset: 0 };
            rows[level].push(normalized);
            if (header.children?.length) {
                const start = columns.length;
                visit(header.children, level + 1, normalized.fixed);
                normalized.colspan = columns.length - start;
            } else columns.push(normalized);
        }
    }
    visit(base, 0);
    let start = 0;
    let end = 0;
    for (const column of columns) {
        column.fixedOffset = start;
        if (column.fixed === 'start') start += parseFloat(String(column.width ?? column.minWidth ?? 120));
    }
    for (const column of [...columns].reverse()) {
        column.fixedEndOffset = end;
        if (column.fixed === 'end') end += parseFloat(String(column.width ?? column.minWidth ?? 120));
    }
    for (const row of rows) for (const header of row) {
        if (header.children?.length) {
            const leafKeys = new Set(flatHeaders(header.children).map(child => child.key));
            const matching = columns.filter(column => leafKeys.has(column.key));
            header.fixedOffset = matching[0]?.fixedOffset ?? 0;
            header.fixedEndOffset = matching.at(-1)?.fixedEndOffset ?? 0;
        }
    }
    return { headers: rows, columns };
}
export function flatHeaders(headers: readonly DataHeader[]): DataHeader[] {
    return headers.flatMap(header => header.children?.length ? flatHeaders(header.children) : [header]);
}
export function internalItems(items: readonly DataItem[], columns: readonly NormalizedHeader[], options: { itemValue?: ItemProperty; itemSelectable?: ItemProperty; returnObject?: boolean }): InternalDataItem[] {
    return items.map((raw, index) => ({ type: 'item', key: itemKey(raw, options.itemValue), index, value: options.returnObject ? raw : itemKey(raw, options.itemValue), selectable: getItemProperty(raw, options.itemSelectable, true) !== false, columns: Object.fromEntries(columns.map(column => [column.key, getItemProperty(raw, column.value)])), raw }));
}
function compare(a: unknown, b: unknown): number {
    if (a == null) return b == null ? 0 : -1;
    if (b == null) return 1;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    const left = String(a).toLocaleLowerCase();
    const right = String(b).toLocaleLowerCase();
    if (!left || !right) return left === right ? 0 : !left ? -1 : 1;
    if (!Number.isNaN(Number(left)) && !Number.isNaN(Number(right))) return Number(left) - Number(right);
    return left.localeCompare(right, undefined, { sensitivity: 'accent' });
}
export interface ProcessOptions {
    headers?: readonly DataHeader[];
    search?: string;
    customFilter?: FilterFunction;
    customKeyFilter?: Record<string, FilterFunction>;
    filterKeys?: string | readonly string[];
    filterMode?: 'some' | 'every' | 'union' | 'intersection';
    ignoreAccents?: boolean | string;
    noFilter?: boolean;
    disableSort?: boolean;
    customKeySort?: Record<string, (a: unknown, b: unknown) => number | null>;
    sortBy?: readonly TableSort[];
    groupBy?: readonly DataGroup[];
}
function defaultMatch(value: unknown, query: string, ignoreAccents?: boolean | string): FilterMatch {
    if (value == null) return -1;
    if (!query.length) return 0;
    // 复用上游的无样式工具，折叠重音后仍保持原文字的高亮坐标。
    const ranges = findMatchRanges(String(value), query, { ignoreCase: true, matchAll: true, ignoreAccents: ignoreAccents === true || ignoreAccents === 'target' || ignoreAccents === 'query' ? ignoreAccents : false });
    return ranges.length ? ranges : -1;
}
export function filterItems(items: readonly DataItem[], options: ProcessOptions): { items: DataItem[]; matches: Map<DataItem, Record<string, FilterMatch>> } {
    const headers = flatHeaders(options.headers ?? []);
    const byKey = new Map(headers.map(header => [header.key ?? String(header.value), header]));
    const custom = { ...options.customKeyFilter, ...Object.fromEntries(headers.filter(header => header.filter).map(header => [header.key, header.filter])) };
    const customCount = Object.keys(custom).length;
    const query = options.search ?? '';
    const matches = new Map<DataItem, Record<string, FilterMatch>>();
    const filtered = items.filter((item, index) => {
        if (options.noFilter || !query && !customCount) return true;
        const keys = typeof options.filterKeys === 'string' ? [options.filterKeys] : options.filterKeys ?? (headers.length ? headers.filter(header => header.filterable !== false && !header.key?.startsWith('data-table-')).map(header => header.key ?? String(header.value)) : Object.keys(item));
        const rowMatches: Record<string, FilterMatch> = {};
        // 保留旧版直接读取 item 字段的回调，同时提供标准 raw/columns/index。
        const context = { ...item, raw: item, columns: Object.fromEntries(headers.map(header => [header.key, getItemProperty(item, header.value ?? header.key)])), index };
        let defaults = 0;
        let customs = 0;
        for (const key of keys) {
            const header = byKey.get(key);
            const value = getItemProperty(item, header?.value ?? key);
            const fn = custom[key] ?? options.customFilter;
            const match = fn ? fn(value, query, context, key) : defaultMatch(value, query, options.ignoreAccents);
            if (match === false || match === -1 || match == null) {
                if (options.filterMode === 'every') return false;
            } else {
                rowMatches[key] = typeof match === 'number' ? [match, match + query.length] : match;
                if (custom[key]) customs++; else defaults++;
            }
        }
        const mode = options.filterMode ?? 'intersection';
        const keep = defaults + customs > 0 && (mode === 'some' || mode === 'every' || mode === 'union' && (customs === customCount || defaults > 0) || mode === 'intersection' && customs === customCount && (defaults > 0 || keys.length === customCount));
        if (keep) matches.set(item, rowMatches);
        return keep;
    });
    return { items: filtered, matches };
}
export function sortItems(items: readonly DataItem[], options: ProcessOptions): DataItem[] {
    const headers = flatHeaders(options.headers ?? []);
    const sorts = [...(options.groupBy ?? []).filter(sort => sort.order != null && sort.order !== false), ...(options.disableSort ? [] : options.sortBy ?? [])].filter(sort => sort.order !== false);
    if (!sorts.length) return [...items];
    return items.map((item, index) => ({ item, index })).sort((a, b) => {
        for (const sort of sorts) {
            const header = headers.find(header => header.key === sort.key);
            const rawLeft = sort.order === 'desc' ? b.item : a.item;
            const rawRight = sort.order === 'desc' ? a.item : b.item;
            const left = getItemProperty(rawLeft, header?.value ?? sort.key);
            const right = getItemProperty(rawRight, header?.value ?? sort.key);
            let customResult = false;
            if (header?.sortRaw) {
                const result = header.sortRaw(rawLeft, rawRight);
                if (result == null) continue;
                customResult = true;
                if (result) return result;
            }
            const sorter = header?.sort ?? options.customKeySort?.[sort.key];
            if (sorter) {
                const result = sorter(left, right);
                if (result == null) continue;
                customResult = true;
                if (result) return result;
            }
            if (customResult) continue;
            const result = compare(left, right);
            if (result) return result;
        }
        return a.index - b.index;
    }).map(({ item }) => item);
}
export function processItems(items: readonly DataItem[], options: ProcessOptions): DataItem[] {
    return sortItems(filterItems(items, options).items, options);
}
export function pageItems<T>(items: readonly T[], page: number, itemsPerPage: number): T[] {
    if (itemsPerPage < 0) return [...items];
    const size = Math.max(1, Math.floor(itemsPerPage) || 10);
    const start = (Math.max(1, Math.floor(page) || 1) - 1) * size;
    return items.slice(start, start + size);
}
export function createGroups(items: readonly InternalDataItem[], groupBy: readonly DataGroup[], groupKey?: (context: { key: string; value: unknown; parentKey: string | null }) => string, depth = 0, parentKey: string | null = null): Array<DataGroupNode | InternalDataItem> {
    const group = groupBy[depth];
    if (!group) return [...items];
    const buckets = new Map<unknown, InternalDataItem[]>();
    for (const item of items) {
        const value = getPath(item.raw, group.key);
        if (!buckets.has(value)) buckets.set(value, []);
        buckets.get(value)!.push(item);
    }
    return [...buckets].map(([value, entries]) => {
        const id = groupKey?.({ key: group.key, value, parentKey }) ?? `${parentKey ?? 'root'}_${group.key}_${String(value)}`;
        return { type: 'group', id, key: group.key, value, title: String(value ?? '—'), depth, items: createGroups(entries, groupBy, groupKey, depth + 1, id) };
    });
}
export function extractItems(nodes: readonly DataRow[]): InternalDataItem[] {
    return nodes.flatMap(node => node.type === 'item' ? [node] : node.type === 'group' ? extractItems(node.items) : []);
}
export function flattenGroups(nodes: readonly (DataGroupNode | InternalDataItem)[], opened: ReadonlySet<string>, summary = false): DataRow[] {
    return nodes.flatMap<DataRow>(node => {
        if (node.type === 'item') return [node];
        const open = opened.has(node.id) || node.value == null;
        return [...(node.value == null ? [] : [node]), ...(open ? [...flattenGroups(node.items, opened, summary), ...(summary ? [{ ...node, type: 'group-summary' as const }] : [])] : [])];
    });
}
/** 兼容 iterator 已公开的扁平分组辅助接口。 */
export function groupRows(items: readonly DataItem[], groupBy: readonly DataGroup[]) {
    const groups = createGroups(internalItems(items, [], {}), groupBy);
    function visit(nodes: typeof groups): Array<{ type: 'group' | 'item'; key: string; item?: DataItem; title?: string; depth: number }> {
        return nodes.flatMap(node => node.type === 'item' ? [{ type: 'item' as const, key: String(node.key), item: node.raw, depth: 0 }] : [{ type: 'group' as const, key: node.id, title: node.title, depth: node.depth }, ...visit(node.items)]);
    }
    return visit(groups);
}
