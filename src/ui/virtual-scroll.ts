export function virtualWindow(count: number, scrollTop: number, viewportHeight: number, itemHeight: number, overscan: number) {
    const rowHeight = Number.isFinite(itemHeight) && itemHeight > 0 ? itemHeight : 1;
    const padding = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0;
    const start = Math.min(count, Math.max(0, Math.floor(Math.max(0, scrollTop) / rowHeight) - padding));
    const end = Math.min(count, Math.max(start, Math.ceil((Math.max(0, scrollTop) + Math.max(0, viewportHeight)) / rowHeight) + padding));
    return { start, end, rowHeight, totalHeight: count * rowHeight };
}
