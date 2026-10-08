import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch, type Ref } from 'vue';
import type UiScrollArea from './UiScrollArea.vue';
import type { DataRow } from './data-pipeline';

export function dataRowKey(row: DataRow): string {
    return row.type === 'item' ? `item:${typeof row.key}:${row.key}` : `${row.type}:${row.id}`;
}
/** 按实际行高累计偏移；分组、长单元格及展开行都参加测量，滚动仍只渲染视口附近。 */
export function useTableVirtual(rows: Ref<DataRow[]>, area: Ref<InstanceType<typeof UiScrollArea> | undefined>, table: Ref<HTMLTableElement | undefined>, enabled: () => boolean, itemHeight: () => number | string | undefined, overscan: () => number, rowKey = dataRowKey) {
    const scrollTop = ref(0);
    const viewportHeight = ref(360);
    const measurements = ref(new Map<string, number>());
    const estimate = computed(() => Math.max(24, Number.parseFloat(String(itemHeight() ?? 40)) || 40));
    const offsets = computed(() => {
        const positions = [0];
        for (const row of rows.value) positions.push(positions.at(-1)! + (measurements.value.get(rowKey(row)) ?? estimate.value));
        return positions;
    });
    function indexAt(offset: number): number {
        let low = 0;
        let high = rows.value.length;
        while (low < high) {
            const middle = Math.floor((low + high) / 2);
            if (offsets.value[middle + 1] <= offset) low = middle + 1; else high = middle;
        }
        return Math.min(low, Math.max(0, rows.value.length - 1));
    }
    const range = computed(() => {
        if (!enabled()) return { start: 0, end: rows.value.length };
        const buffer = Math.max(0, Math.floor(overscan()));
        const start = Math.max(0, indexAt(scrollTop.value) - buffer);
        const end = Math.min(rows.value.length, indexAt(scrollTop.value + viewportHeight.value) + buffer + 1);
        return { start, end };
    });
    const displayed = computed(() => rows.value.slice(range.value.start, range.value.end));
    const before = computed(() => enabled() ? offsets.value[range.value.start] : 0);
    const after = computed(() => enabled() ? Math.max(0, offsets.value.at(-1)! - offsets.value[range.value.end]) : 0);
    let observer: ResizeObserver | undefined;
    let observed = new Set<Element>();
    let scheduled = false;
    let frame = 0;
    let lastWidth = 0;
    function measure() {
        scheduled = false;
        if (!enabled() || !table.value) return;
        const view = area.value?.element;
        if (view) {
            viewportHeight.value = view.clientHeight;
            if (lastWidth && lastWidth !== view.clientWidth) measurements.value = new Map();
            lastWidth = view.clientWidth;
        }
        const sizes = new Map<string, number>();
        for (const row of table.value.querySelectorAll<HTMLElement>('[data-virtual-key]')) {
            const key = row.dataset.virtualKey!;
            sizes.set(key, (sizes.get(key) ?? 0) + row.getBoundingClientRect().height);
        }
        let next: Map<string, number> | undefined;
        for (const [key, size] of sizes) {
            if (size > 0 && Math.abs((measurements.value.get(key) ?? estimate.value) - size) > .5) {
                next ??= new Map(measurements.value);
                next.set(key, size);
            }
        }
        if (next) measurements.value = next;
        area.value?.update();
    }
    function scheduleMeasure() {
        if (scheduled || typeof requestAnimationFrame === 'undefined') return;
        scheduled = true;
        // ResizeObserver 内的响应式更新必须移到下一帧，避免同帧布局反馈循环。
        frame = requestAnimationFrame(measure);
    }
    function observeRows() {
        if (!enabled() || !observer || !table.value) return;
        const next = new Set<Element>(table.value.querySelectorAll('[data-virtual-key]'));
        if (area.value?.element) next.add(area.value.element);
        for (const element of observed) if (!next.has(element)) observer.unobserve(element);
        for (const element of next) if (!observed.has(element)) observer.observe(element);
        observed = next;
        scheduleMeasure();
    }
    function scroll(position: { scrollTop: number }) { scrollTop.value = position.scrollTop; }
    function scrollToIndex(index: number) {
        const position = Math.max(0, Math.min(rows.value.length - 1, Math.floor(index)));
        area.value?.scrollTo({ top: offsets.value[position] ?? 0 });
        scrollTop.value = offsets.value[position] ?? 0;
    }
    function reset() {
        scrollTop.value = 0;
        measurements.value = new Map();
        area.value?.scrollTo({ top: 0 });
        scheduleMeasure();
    }
    watch(rows, () => {
        const keys = new Set(rows.value.map(rowKey));
        measurements.value = new Map([...measurements.value].filter(([key]) => keys.has(key)));
        nextTick(() => {
            const view = area.value?.element;
            if (view && view.scrollTop > view.scrollHeight - view.clientHeight) scrollTop.value = view.scrollTop;
        });
    });
    onMounted(() => { observer = new ResizeObserver(scheduleMeasure); observeRows(); });
    onUpdated(observeRows);
    onBeforeUnmount(() => { observer?.disconnect(); cancelAnimationFrame(frame); });
    return { displayed, before, after, range, estimate, scroll, scrollToIndex, reset, scheduleMeasure };
}
