import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

export type InfiniteScrollEdge = 'start' | 'end';
export type InfiniteScrollSide = InfiniteScrollEdge | 'both';
export type InfiniteScrollDirection = InfiniteScrollSide | 'vertical' | 'horizontal';
export type InfiniteScrollMode = 'intersect' | 'manual';
export type InfiniteScrollStatus = 'ok' | 'loading' | 'empty' | 'error';
export type InfiniteScrollDoneStatus = InfiniteScrollStatus;
export type InfiniteScrollAxis = 'vertical' | 'horizontal';

export interface InfiniteScrollStateProps {
    disabled?: boolean;
    direction?: InfiniteScrollDirection;
    side?: InfiniteScrollSide;
    mode?: InfiniteScrollMode;
    rootMargin?: string;
    margin?: number | string;
}

export interface InfiniteScrollLoadContext {
    side: InfiniteScrollEdge;
    done: (status?: InfiniteScrollDoneStatus) => void;
}

interface ScrollMetrics {
    offset: number;
    size: number;
}

export function useInfiniteScrollState(
    getProps: () => InfiniteScrollStateProps,
    emitLoad: (context: InfiniteScrollLoadContext) => void
) {
    const root = ref<HTMLElement>();
    const startSentinel = ref<HTMLElement>();
    const endSentinel = ref<HTMLElement>();
    const startStatus = ref<InfiniteScrollStatus>('ok');
    const endStatus = ref<InfiniteScrollStatus>('ok');
    const mounted = ref(false);
    let disposed = false;

    const side = computed<InfiniteScrollSide>(() => {
        const direction = getProps().direction;
        if (direction === 'start' || direction === 'end' || direction === 'both') return direction;
        return getProps().side ?? 'end';
    });
    const axis = computed<InfiniteScrollAxis>(() => {
        return getProps().direction === 'horizontal' ? 'horizontal' : 'vertical';
    });
    const mode = computed<InfiniteScrollMode>(() => getProps().mode ?? 'intersect');
    const disabled = computed<boolean>(() => Boolean(getProps().disabled));
    const rootMargin = computed<string>(() => {
        const margin = getProps().margin;
        if (margin !== undefined) return typeof margin === 'number' || /^-?\d+(\.\d+)?$/.test(margin) ? margin + 'px' : margin;
        return getProps().rootMargin ?? '200px';
    });

    const observers = new Map<InfiniteScrollEdge, IntersectionObserver>();
    const intersecting: Record<InfiniteScrollEdge, boolean> = { start: false, end: false };
    const scheduledFrames: Record<InfiniteScrollEdge, number[]> = { start: [], end: [] };
    const frameGenerations: Record<InfiniteScrollEdge, number> = { start: 0, end: 0 };
    const requestGenerations: Record<InfiniteScrollEdge, number> = { start: 0, end: 0 };

    function getStatus(edge: InfiniteScrollEdge): InfiniteScrollStatus {
        return edge === 'start' ? startStatus.value : endStatus.value;
    }

    function setStatus(edge: InfiniteScrollEdge, status: InfiniteScrollStatus): void {
        if (edge === 'start') startStatus.value = status;
        else endStatus.value = status;
    }

    function enabledEdges(): InfiniteScrollEdge[] {
        if (side.value === 'both') return ['start', 'end'];
        return [side.value];
    }

    const busy = computed<boolean>(() => enabledEdges().some((edge) => getStatus(edge) === 'loading'));
    const done = computed<boolean>(() => enabledEdges().every((edge) => getStatus(edge) === 'empty'));
    const error = computed<boolean>(() => enabledEdges().some((edge) => getStatus(edge) === 'error'));

    function scrollMetrics(element: HTMLElement, scrollAxis: InfiniteScrollAxis): ScrollMetrics {
        return scrollAxis === 'horizontal'
            ? { offset: element.scrollLeft, size: element.scrollWidth }
            : { offset: element.scrollTop, size: element.scrollHeight };
    }

    function setScrollOffset(element: HTMLElement, scrollAxis: InfiniteScrollAxis, value: number): void {
        if (scrollAxis === 'horizontal') element.scrollLeft = value;
        else element.scrollTop = value;
    }

    function viewportSize(element: HTMLElement, scrollAxis: InfiniteScrollAxis): number {
        return scrollAxis === 'horizontal' ? element.clientWidth : element.clientHeight;
    }

    function isEdgeEnabled(edge: InfiniteScrollEdge): boolean {
        return enabledEdges().includes(edge);
    }

    function cancelScheduledLoad(edge: InfiniteScrollEdge): void {
        frameGenerations[edge]++;
        for (const frame of scheduledFrames[edge]) {
            if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
        }
        scheduledFrames[edge] = [];
    }

    function canAutoLoad(edge: InfiniteScrollEdge): boolean {
        return !disposed
            && mounted.value
            && !disabled.value
            && mode.value === 'intersect'
            && isEdgeEnabled(edge)
            && intersecting[edge]
            && getStatus(edge) === 'ok';
    }

    function scheduleAutoLoad(edge: InfiniteScrollEdge): void {
        if (!canAutoLoad(edge) || scheduledFrames[edge].length > 0 || typeof requestAnimationFrame !== 'function') return;
        const generation = frameGenerations[edge];

        function waitForFrame(remaining: number): void {
            if (generation !== frameGenerations[edge] || !canAutoLoad(edge)) {
                scheduledFrames[edge] = [];
                return;
            }
            if (remaining === 0) {
                scheduledFrames[edge] = [];
                loadEdge(edge);
                return;
            }

            let frame = 0;
            frame = requestAnimationFrame(() => {
                scheduledFrames[edge] = scheduledFrames[edge].filter((current) => current !== frame);
                waitForFrame(remaining - 1);
            });
            scheduledFrames[edge].push(frame);
        }

        waitForFrame(3);
    }

    function clearObservers(): void {
        for (const observer of observers.values()) observer.disconnect();
        observers.clear();
        for (const edge of ['start', 'end'] as const) {
            intersecting[edge] = false;
            cancelScheduledLoad(edge);
        }
    }

    function observeEdge(edge: InfiniteScrollEdge, element: HTMLElement): void {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.target !== element) continue;
                intersecting[edge] = entry.isIntersecting;
                if (entry.isIntersecting) scheduleAutoLoad(edge);
                else cancelScheduledLoad(edge);
            }
        }, {
            root: root.value ?? null,
            rootMargin: rootMargin.value
        });
        observer.observe(element);
        observers.set(edge, observer);
    }

    function syncObservers(): void {
        clearObservers();
        if (!mounted.value || disposed || disabled.value || mode.value !== 'intersect') return;
        if (typeof IntersectionObserver === 'undefined') return;

        for (const edge of enabledEdges()) {
            const element = edge === 'start' ? startSentinel.value : endSentinel.value;
            if (element) observeEdge(edge, element);
        }
    }

    function loadEdge(edge: InfiniteScrollEdge): void {
        if (disposed || disabled.value || !isEdgeEnabled(edge)) return;
        if (getStatus(edge) === 'loading' || getStatus(edge) === 'empty') return;

        setStatus(edge, 'loading');
        const generation = requestGenerations[edge];
        const scrollAxis = axis.value;
        const scrollRoot = root.value;
        const previousMetrics = edge === 'start' && scrollRoot ? scrollMetrics(scrollRoot, scrollAxis) : undefined;
        let completed = false;

        emitLoad({
            side: edge,
            done(status = 'ok') {
                if (completed) return;
                completed = true;
                if (disposed || requestGenerations[edge] !== generation) return;

                setStatus(edge, status);
                if (edge === 'start' && scrollRoot && previousMetrics) {
                    void nextTick().then(() => {
                        if (disposed || requestGenerations[edge] !== generation || root.value !== scrollRoot) return;
                        const nextMetrics = scrollMetrics(scrollRoot, scrollAxis);
                        const sizeDelta = nextMetrics.size - previousMetrics.size;
                        if (sizeDelta > 0) {
                            setScrollOffset(scrollRoot, scrollAxis, previousMetrics.offset + sizeDelta);
                        }
                    });
                }
                if (status === 'ok' && intersecting[edge]) scheduleAutoLoad(edge);
            }
        });
    }

    function primaryEdge(): InfiniteScrollEdge {
        return side.value === 'start' ? 'start' : 'end';
    }

    function load(edge?: InfiniteScrollEdge): void {
        loadEdge(edge ?? primaryEdge());
    }

    function retry(edge?: InfiniteScrollEdge): void {
        loadEdge(edge ?? primaryEdge());
    }

    function reset(target?: InfiniteScrollSide): void {
        const edges = target === 'both'
            ? ['start', 'end'] as const
            : target
                ? [target] as const
                : side.value === 'both'
                    ? ['start', 'end'] as const
                    : [side.value] as const;

        for (const edge of edges) {
            requestGenerations[edge]++;
            cancelScheduledLoad(edge);
            setStatus(edge, 'ok');
        }
        for (const edge of edges) {
            if (intersecting[edge]) scheduleAutoLoad(edge);
        }
    }

    watch(
        [side, axis, mode, disabled, rootMargin, root, startSentinel, endSentinel],
        syncObservers,
        { flush: 'post' }
    );

    onMounted(() => {
        mounted.value = true;
        syncObservers();
        void nextTick().then(() => {
            if (disposed || !root.value) return;
            const scrollRoot = root.value;
            const scrollAxis = axis.value;
            const metrics = scrollMetrics(scrollRoot, scrollAxis);
            const viewport = viewportSize(scrollRoot, scrollAxis);
            if (side.value === 'start') setScrollOffset(scrollRoot, scrollAxis, metrics.size);
            else if (side.value === 'both') setScrollOffset(scrollRoot, scrollAxis, (metrics.size - viewport) / 2);
        });
    });

    onUnmounted(() => {
        disposed = true;
        mounted.value = false;
        requestGenerations.start++;
        requestGenerations.end++;
        clearObservers();
    });

    return {
        root,
        startSentinel,
        endSentinel,
        side,
        axis,
        rootMargin,
        startStatus,
        endStatus,
        busy,
        done,
        error,
        load,
        retry,
        reset
    };
}
