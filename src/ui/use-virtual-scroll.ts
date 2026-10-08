import { computed, isRef, onBeforeUnmount, onMounted, ref, shallowRef, toValue, unref, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import {
    captureVirtualScrollAnchor,
    createVirtualScrollMetrics,
    getVirtualScrollWindow,
    normalizeVirtualItemHeight,
    restoreVirtualScrollAnchor,
    virtualScrollOffsetForIndex,
    type VirtualScrollAlignment,
    type VirtualScrollKey
} from './virtual-scroll';

export type VirtualScrollItemKey<T> = string | ((item: T, index: number) => VirtualScrollKey);

export interface UseVirtualScrollOptions<T> {
    items: MaybeRefOrGetter<readonly T[]>;
    /** The component's existing itemKey prop is a string field or a key callback. */
    itemKey?: VirtualScrollItemKey<T> | Ref<VirtualScrollItemKey<T> | undefined>;
    /** Estimated row size; invalid or non-positive values use the upstream 16px estimate. */
    itemHeight?: MaybeRefOrGetter<number | undefined>;
    height?: MaybeRefOrGetter<number | string | undefined>;
    overscan?: MaybeRefOrGetter<number | undefined>;
    getScrollElement: () => HTMLElement | null | undefined;
    /** Injectable to test lifecycle and to support a host with its own observer implementation. */
    createResizeObserver?: (callback: ResizeObserverCallback) => ResizeObserver;
}

function heightFromOption(value: number | string | undefined): number {
    if (typeof value === 'number') return normalizeVirtualItemHeight(value);
    const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number.NaN;
    return normalizeVirtualItemHeight(parsed);
}

function resolveItemKey<T>(item: T, index: number, itemKey: VirtualScrollItemKey<T> | undefined): VirtualScrollKey {
    if (typeof itemKey === 'function') {
        const value = itemKey(item, index);
        return typeof value === 'string' || typeof value === 'number' ? value : index;
    }
    if (typeof itemKey === 'string' && item != null && typeof item === 'object') {
        const value = (item as Record<string, unknown>)[itemKey];
        return typeof value === 'string' || typeof value === 'number' ? value : index;
    }
    return index;
}

function measureElement(element: HTMLElement, entry: ResizeObserverEntry): number {
    const borderBox = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
    const borderBoxHeight = borderBox?.blockSize;
    if (Number.isFinite(borderBoxHeight) && borderBoxHeight! > 0) return borderBoxHeight!;
    // offsetHeight is in layout CSS pixels; getBoundingClientRect can be scaled by CSS zoom/transforms.
    const offsetHeight = element.offsetHeight;
    if (Number.isFinite(offsetHeight) && offsetHeight > 0) return offsetHeight;
    const contentHeight = entry.contentRect?.height;
    if (Number.isFinite(contentHeight) && contentHeight! > 0) return contentHeight!;
    const rectHeight = element.getBoundingClientRect?.().height;
    return Number.isFinite(rectHeight) && rectHeight! > 0 ? rectHeight! : 0;
}

/**
 * Reactive variable-height virtual list state. The consumer binds itemRef(index, el)
 * to each rendered row and uses window.offset / window.paddingBottom as spacers.
 */
export function useVirtualScroll<T>(options: UseVirtualScrollOptions<T>) {
    const sourceItems = computed(() => [...(toValue(options.items) ?? [])]);
    const itemKeyOption = options.itemKey;
    const keyField = computed(() => isRef(itemKeyOption) ? itemKeyOption.value : itemKeyOption);
    const explicitItemKey = computed(() => keyField.value != null);
    const keys = computed(() => sourceItems.value.map((item, index) => resolveItemKey(item, index, keyField.value)));
    const estimate = computed(() => normalizeVirtualItemHeight(options.itemHeight == null ? 16 : toValue(options.itemHeight), 16));
    const overscan = computed(() => {
        const value = options.overscan == null ? 4 : toValue(options.overscan);
        return Number.isFinite(value) ? Math.max(0, Math.floor(value!)) : 0;
    });
    const fallbackViewportHeight = computed(() => heightFromOption(options.height == null ? 320 : toValue(options.height)));
    const measurements = shallowRef(new Map<VirtualScrollKey, number>());
    const scrollTop = ref(0);
    const viewportHeight = ref(fallbackViewportHeight.value);

    const metrics = computed(() => {
        const measured = keys.value.map((key) => measurements.value.get(key));
        return createVirtualScrollMetrics(sourceItems.value.length, estimate.value, measured);
    });
    const window = computed(() => getVirtualScrollWindow(sourceItems.value, scrollTop.value, viewportHeight.value, overscan.value, metrics.value));
    const visibleItems = computed(() => window.value.items);

    let previousKeys = keys.value.slice();
    let previousItems = sourceItems.value.slice();
    let previousOffsets = metrics.value.offsets;
    let scrollElement: HTMLElement | undefined;
    let observer: ResizeObserver | undefined;
    let observerFrame: number | undefined;
    let observedElements = new Set<Element>();
    let pendingEntries = new Map<Element, ResizeObserverEntry>();
    const elementsByIndex = new Map<number, HTMLElement>();
    const keysByElement = new Map<Element, VirtualScrollKey>();

    function maxScrollTop(offsets = metrics.value.offsets, viewport = viewportHeight.value): number {
        return Math.max(0, (offsets.at(-1) ?? 0) - Math.max(0, viewport));
    }

    function setScrollTop(value: number, writeElement = true): number {
        const position = Number.isFinite(value) ? Math.max(0, Math.min(maxScrollTop(), value)) : 0;
        scrollTop.value = position;
        if (writeElement) {
            const element = scrollElement ?? options.getScrollElement() ?? undefined;
            if (element && Math.abs(element.scrollTop - position) > 0.5) {
                element.scrollTop = position;
                if (Number.isFinite(element.scrollTop)) scrollTop.value = element.scrollTop;
            }
        }
        return scrollTop.value;
    }

    function updateSnapshot(): void {
        previousKeys = keys.value.slice();
        previousItems = sourceItems.value.slice();
        previousOffsets = metrics.value.offsets;
    }

    function captureAnchor() {
        return captureVirtualScrollAnchor(previousKeys, previousOffsets, scrollTop.value);
    }

    function restoreAnchor(anchor: ReturnType<typeof captureAnchor>): void {
        setScrollTop(restoreVirtualScrollAnchor(anchor, keys.value, metrics.value.offsets));
        updateSnapshot();
    }

    function readViewportHeight(element = scrollElement): number {
        const measured = element?.clientHeight;
        return Number.isFinite(measured) && measured! > 0 ? measured! : fallbackViewportHeight.value;
    }

    function updateViewportHeight(): void {
        viewportHeight.value = readViewportHeight();
        setScrollTop(scrollTop.value);
    }

    function onScroll(): void {
        if (!scrollElement) return;
        scrollTop.value = Number.isFinite(scrollElement.scrollTop) ? Math.max(0, scrollElement.scrollTop) : 0;
    }

    function unobserve(element: Element): void {
        if (!observedElements.has(element)) return;
        observer?.unobserve(element);
        observedElements.delete(element);
    }

    function observe(element: Element): void {
        if (!observer || observedElements.has(element)) return;
        observer.observe(element);
        observedElements.add(element);
    }

    function bindScrollElement(next: HTMLElement | null | undefined): void {
        const element = next ?? undefined;
        if (scrollElement === element) return;
        if (scrollElement) {
            scrollElement.removeEventListener('scroll', onScroll);
            unobserve(scrollElement);
        }
        scrollElement = element;
        if (!element) return;
        element.addEventListener('scroll', onScroll, { passive: true });
        observe(element);
        viewportHeight.value = readViewportHeight(element);
        scrollTop.value = Number.isFinite(element.scrollTop) ? Math.max(0, element.scrollTop) : 0;
    }

    function applyMeasurements(entries: readonly ResizeObserverEntry[]): void {
        let viewportChanged = false;
        const nextMeasurements = new Map(measurements.value);
        let measurementsChanged = false;
        const currentKeys = new Set(keys.value);

        for (const entry of entries) {
            if (entry.target === scrollElement) {
                const nextHeight = readViewportHeight(scrollElement);
                if (nextHeight !== viewportHeight.value) {
                    viewportHeight.value = nextHeight;
                    viewportChanged = true;
                }
                continue;
            }
            if (!keysByElement.has(entry.target)) continue;
            const key = keysByElement.get(entry.target)!;
            if (!currentKeys.has(key)) continue;
            const height = measureElement(entry.target as HTMLElement, entry);
            // Zero-sized rows are common while hidden; they must not erase a valid estimate/measurement.
            if (!(height > 0)) continue;
            const previous = nextMeasurements.get(key) ?? estimate.value;
            if (Math.abs(previous - height) <= 0.5) continue;
            nextMeasurements.set(key, height);
            measurementsChanged = true;
        }

        if (measurementsChanged) {
            const anchor = captureAnchor();
            measurements.value = nextMeasurements;
            restoreAnchor(anchor);
        } else if (viewportChanged) {
            setScrollTop(scrollTop.value);
        }
    }

    function flushObserverEntries(): void {
        observerFrame = undefined;
        const entries = [...pendingEntries.values()];
        pendingEntries.clear();
        if (entries.length) applyMeasurements(entries);
    }

    function queueObserverEntries(entries: ResizeObserverEntry[]): void {
        for (const entry of entries) pendingEntries.set(entry.target, entry);
        if (observerFrame != null) return;
        if (typeof requestAnimationFrame === 'function') observerFrame = requestAnimationFrame(flushObserverEntries);
        else {
            flushObserverEntries();
        }
    }

    function itemRef(index: number, element: HTMLElement | null): void {
        const safeIndex = Number.isFinite(index) ? Math.floor(index) : -1;
        if (safeIndex < 0) return;
        const previous = elementsByIndex.get(safeIndex);
        if (previous === element) return;
        if (previous) {
            unobserve(previous);
            keysByElement.delete(previous);
            elementsByIndex.delete(safeIndex);
        }
        if (!element) return;
        for (const [mappedIndex, mappedElement] of elementsByIndex) {
            if (mappedElement === element && mappedIndex !== safeIndex) elementsByIndex.delete(mappedIndex);
        }
        elementsByIndex.set(safeIndex, element);
        if (safeIndex < keys.value.length) keysByElement.set(element, keys.value[safeIndex]);
        observe(element);
    }

    function scrollToIndex(index: number, placement: VirtualScrollAlignment = 'start'): number {
        const position = virtualScrollOffsetForIndex(index, metrics.value.offsets, viewportHeight.value, placement, scrollTop.value);
        return setScrollTop(position);
    }

    // Batch array methods such as reverse/sort so transient intermediate keys do not prune measurements.
    watch(keys, (nextKeys) => {
        const anchor = captureAnchor();
        const nextItems = sourceItems.value;
        const validKeys = new Set(nextKeys);
        const nextMeasurements = new Map<VirtualScrollKey, number>();
        for (const [key, height] of measurements.value) {
            if (validKeys.has(key)) nextMeasurements.set(key, height);
        }
        // Index keys remain the default for compatibility, but a changed item at that
        // index must not inherit a previous item's measured height.
        if (!explicitItemKey.value) {
            for (let index = 0; index < Math.max(previousItems.length, nextItems.length); index++) {
                if (previousItems[index] !== nextItems[index] && index < nextKeys.length) nextMeasurements.delete(nextKeys[index]);
            }
        }
        for (const [index, element] of elementsByIndex) {
            const indexItemChanged = !explicitItemKey.value && previousItems[index] !== nextItems[index];
            if (!indexItemChanged && nextKeys[index] === keysByElement.get(element)) continue;
            unobserve(element);
            keysByElement.delete(element);
            elementsByIndex.delete(index);
        }
        measurements.value = nextMeasurements;
        restoreAnchor(anchor);
    }, { flush: 'pre' });

    watch(fallbackViewportHeight, updateViewportHeight);
    watch(() => options.getScrollElement(), bindScrollElement, { flush: 'post' });

    onMounted(() => {
        const createObserver = options.createResizeObserver ?? ((callback: ResizeObserverCallback) => new ResizeObserver(callback));
        if (options.createResizeObserver || typeof ResizeObserver !== 'undefined') {
            observer = createObserver(queueObserverEntries);
            if (scrollElement) observe(scrollElement);
            for (const element of elementsByIndex.values()) observe(element);
        }
        bindScrollElement(options.getScrollElement());
        updateSnapshot();
    });

    onBeforeUnmount(() => {
        if (scrollElement) scrollElement.removeEventListener('scroll', onScroll);
        observer?.disconnect();
        observer = undefined;
        observedElements.clear();
        keysByElement.clear();
        elementsByIndex.clear();
        pendingEntries.clear();
        if (observerFrame != null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(observerFrame);
        observerFrame = undefined;
    });

    return {
        window,
        visibleItems,
        start: computed(() => window.value.start),
        end: computed(() => window.value.end),
        offset: computed(() => window.value.offset),
        totalHeight: computed(() => window.value.totalHeight),
        paddingTop: computed(() => window.value.paddingTop),
        paddingBottom: computed(() => window.value.paddingBottom),
        metrics,
        scrollTop,
        viewportHeight,
        estimate,
        itemRef,
        scrollToIndex
    };
}
