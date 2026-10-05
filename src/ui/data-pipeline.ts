import type { TableHeader, TableSort } from './table';

export type DataItem = Record<string, unknown>;
export type DataKey = string | number;
export type DataHeader = TableHeader & { value?: string; filterable?: boolean };
export type DataGroup = { key: string; order?: 'asc' | 'desc' };
export type DataOptions = { page: number; itemsPerPage: number; sortBy: TableSort[]; groupBy: DataGroup[]; search: string };
const fallbackKeys = new WeakMap<DataItem, number>();
let nextFallbackKey = -1;

export function getPath(item: DataItem, path: string): unknown {
    return path.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as DataItem)[part] : undefined, item);
}

export function itemKey(item: DataItem, itemValue: string | ((item: DataItem) => unknown) = 'id', index = 0): DataKey {
    const value = typeof itemValue === 'function' ? itemValue(item) : getPath(item, itemValue);
    if (typeof value === 'string' || typeof value === 'number') return value;
    let key = fallbackKeys.get(item);
    if (key === undefined) { key = nextFallbackKey--; fallbackKeys.set(item, key); }
    return key;
}

function compare(a: unknown, b: unknown): number {
    if (a == null) return b == null ? 0 : -1;
    if (b == null) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function processItems(items: readonly DataItem[], options: {
    headers?: readonly DataHeader[];
    search?: string;
    customFilter?: (value: unknown, query: string, item: DataItem, key: string) => boolean;
    sortBy?: readonly TableSort[];
    groupBy?: readonly DataGroup[];
}): DataItem[] {
    const query = options.search?.trim().toLocaleLowerCase() ?? '';
    const keys = options.headers?.filter((header) => header.filterable !== false).map((header) => header.value ?? header.key);
    const filtered = query ? items.filter((item) => (keys?.length ? keys : Object.keys(item)).some((key) => {
        const value = getPath(item, key);
        return options.customFilter ? options.customFilter(value, query, item, key) : String(value ?? '').toLocaleLowerCase().includes(query);
    })) : [...items];
    const sorts = [...(options.groupBy ?? []), ...(options.sortBy ?? [])];
    if (!sorts.length) return filtered;
    return filtered.map((item, index) => ({ item, index })).sort((a, b) => {
        for (const sort of sorts) {
            const result = compare(getPath(a.item, sort.key), getPath(b.item, sort.key));
            if (result) return sort.order === 'desc' ? -result : result;
        }
        return a.index - b.index;
    }).map(({ item }) => item);
}

export function pageItems(items: readonly DataItem[], page: number, itemsPerPage: number): DataItem[] {
    if (itemsPerPage < 0) return [...items];
    const size = Math.max(1, Math.floor(itemsPerPage) || 10);
    const start = (Math.max(1, Math.floor(page) || 1) - 1) * size;
    return items.slice(start, start + size);
}

export function groupRows(items: readonly DataItem[], groupBy: readonly DataGroup[]): Array<{ type: 'group' | 'item'; key: string; item?: DataItem; title?: string; depth: number }> {
    const rows: Array<{ type: 'group' | 'item'; key: string; item?: DataItem; title?: string; depth: number }> = [];
    function visit(current: readonly DataItem[], depth: number, prefix: string): void {
        const group = groupBy[depth];
        if (!group) {
            current.forEach((item, index) => rows.push({ type: 'item', key: `${prefix}:${index}`, item, depth }));
            return;
        }
        const buckets = new Map<string, DataItem[]>();
        for (const item of current) {
            const title = String(getPath(item, group.key) ?? '—');
            if (!buckets.has(title)) buckets.set(title, []);
            buckets.get(title)!.push(item);
        }
        for (const [title, entries] of buckets) {
            const key = `${prefix}/${group.key}:${title}`;
            rows.push({ type: 'group', key, title, depth });
            visit(entries, depth + 1, key);
        }
    }
    visit(items, 0, 'root');
    return rows;
}
