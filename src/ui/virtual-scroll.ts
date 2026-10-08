export type VirtualScrollAlignment = 'start' | 'center' | 'end' | 'nearest';
export type VirtualScrollKey = string | number;

export interface VirtualScrollMetrics {
    rowHeight: number;
    heights: number[];
    offsets: number[];
    totalHeight: number;
}

export interface VirtualScrollWindow<T> {
    start: number;
    end: number;
    offset: number;
    items: T[];
    totalHeight: number;
    paddingTop: number;
    paddingBottom: number;
    offsets: number[];
    heights: number[];
}

export interface VirtualScrollAnchor {
    key: VirtualScrollKey;
    index: number;
    offset: number;
}

export function normalizeVirtualItemHeight(value: unknown, fallback = 1): number {
    const safeFallback = Number.isFinite(fallback) && fallback > 0 ? fallback : 1;
    const height = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(height) && height > 0 ? height : safeFallback;
}

/** Prefix offsets use one entry before the first row and one after each row. */
export function createVirtualScrollMetrics(count: number, itemHeight: number, measuredHeights?: readonly (number | undefined)[]): VirtualScrollMetrics {
    const rowHeight = normalizeVirtualItemHeight(itemHeight);
    const length = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    const heights = new Array<number>(length);
    const offsets = new Array<number>(length + 1);
    offsets[0] = 0;
    for (let index = 0; index < length; index++) {
        const height = normalizeVirtualItemHeight(measuredHeights?.[index], rowHeight);
        heights[index] = height;
        offsets[index + 1] = offsets[index] + height;
    }
    return { rowHeight, heights, offsets, totalHeight: offsets[length] };
}

/** Finds the row containing offset. Empty lists return -1; an exact row boundary selects the next row. */
export function virtualIndexAt(offset: number, offsets: readonly number[]): number {
    const count = Math.max(0, offsets.length - 1);
    if (!count) return -1;
    const position = Number.isFinite(offset) ? Math.max(0, offset) : 0;
    let low = 0;
    let high = count;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (offsets[middle + 1] <= position) low = middle + 1;
        else high = middle;
    }
    return Math.min(count - 1, low);
}

function virtualEndAt(offset: number, offsets: readonly number[]): number {
    const count = Math.max(0, offsets.length - 1);
    const position = Number.isFinite(offset) ? Math.max(0, offset) : 0;
    let low = 0;
    let high = count;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (offsets[middle] < position) low = middle + 1;
        else high = middle;
    }
    return low;
}

export function virtualOffsetForIndex(index: number, offsets: readonly number[]): number {
    const count = Math.max(0, offsets.length - 1);
    if (!count) return 0;
    const safeIndex = Number.isFinite(index) ? Math.min(count - 1, Math.max(0, Math.floor(index))) : 0;
    return offsets[safeIndex] ?? 0;
}

export function virtualScrollOffsetForIndex(index: number, offsets: readonly number[], viewportHeight: number, placement: VirtualScrollAlignment = 'start', currentScrollTop = 0): number {
    const count = Math.max(0, offsets.length - 1);
    if (!count) return 0;
    const safeIndex = Number.isFinite(index) ? Math.min(count - 1, Math.max(0, Math.floor(index))) : 0;
    const start = offsets[safeIndex] ?? 0;
    const end = offsets[safeIndex + 1] ?? start;
    const viewport = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;
    const current = Number.isFinite(currentScrollTop) ? Math.max(0, currentScrollTop) : 0;
    let next: number;
    switch (placement) {
        case 'center':
            next = start - (viewport - (end - start)) / 2;
            break;
        case 'end':
            next = end - viewport;
            break;
        case 'nearest':
            if (start >= current && end <= current + viewport) next = current;
            else if (start < current) next = start;
            else next = end - viewport;
            break;
        case 'start':
        default:
            next = start;
            break;
    }
    return Math.max(0, Math.min(Math.max(0, offsets[count] - viewport), next));
}

export function captureVirtualScrollAnchor(keys: readonly VirtualScrollKey[], offsets: readonly number[], scrollTop: number): VirtualScrollAnchor | undefined {
    const index = virtualIndexAt(scrollTop, offsets);
    if (index < 0 || index >= keys.length) return undefined;
    const height = (offsets[index + 1] ?? offsets[index] ?? 0) - (offsets[index] ?? 0);
    const intraItemOffset = Math.max(0, (Number.isFinite(scrollTop) ? scrollTop : 0) - (offsets[index] ?? 0));
    return { key: keys[index], index, offset: Math.min(intraItemOffset, Math.max(0, height - 1)) };
}

/** Restore the same keyed row and intra-row offset, falling back to the old index if it was removed. */
export function restoreVirtualScrollAnchor(anchor: VirtualScrollAnchor | undefined, keys: readonly VirtualScrollKey[], offsets: readonly number[]): number {
    if (!anchor || !keys.length) return 0;
    const keyedIndex = keys.indexOf(anchor.key);
    const index = keyedIndex >= 0 ? keyedIndex : Math.min(keys.length - 1, Math.max(0, anchor.index));
    const start = offsets[index] ?? 0;
    const height = Math.max(0, (offsets[index + 1] ?? start) - start);
    return start + Math.min(Math.max(0, anchor.offset), Math.max(0, height - 1));
}

export function getVirtualScrollWindow<T>(items: readonly T[], scrollTop: number, viewportHeight: number, overscan: number, metrics: VirtualScrollMetrics): VirtualScrollWindow<T> {
    const count = Math.min(items.length, metrics.heights.length);
    if (!count) {
        return { start: 0, end: 0, offset: 0, items: [], totalHeight: 0, paddingTop: 0, paddingBottom: 0, offsets: metrics.offsets, heights: metrics.heights };
    }
    const totalHeight = metrics.offsets[count] ?? metrics.totalHeight;
    const top = Number.isFinite(scrollTop) ? Math.min(totalHeight, Math.max(0, scrollTop)) : 0;
    const viewport = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;
    const padding = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0;
    const first = Math.min(count - 1, virtualIndexAt(top, metrics.offsets));
    const endVisible = viewport > 0 ? virtualEndAt(top + viewport, metrics.offsets) : virtualIndexAt(top, metrics.offsets);
    const start = Math.max(0, first - padding);
    const end = Math.min(count, Math.max(start, endVisible + padding));
    const offset = metrics.offsets[start] ?? 0;
    const paddingBottom = Math.max(0, totalHeight - (metrics.offsets[end] ?? totalHeight));
    return {
        start,
        end,
        offset,
        items: items.slice(start, end),
        totalHeight,
        paddingTop: offset,
        paddingBottom,
        offsets: metrics.offsets,
        heights: metrics.heights
    };
}

/** Fixed-height compatibility helper. Its returned shape is kept stable for existing callers. */
export function virtualWindow(count: number, scrollTop: number, viewportHeight: number, itemHeight: number, overscan: number) {
    const rowHeight = normalizeVirtualItemHeight(itemHeight);
    const padding = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0;
    const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    const top = Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0;
    const viewport = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;
    const start = Math.min(safeCount, Math.max(0, Math.floor(top / rowHeight) - padding));
    const end = Math.min(safeCount, Math.max(start, Math.ceil((top + viewport) / rowHeight) + padding));
    return { start, end, rowHeight, totalHeight: safeCount * rowHeight };
}
