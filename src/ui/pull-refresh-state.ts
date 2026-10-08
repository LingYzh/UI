import { computed, onUnmounted, ref, watch } from 'vue';

export interface PullRefreshStateProps {
    disabled?: boolean;
    threshold?: number;
    pullDownThreshold?: number;
    resistance?: number;
}

export interface PullRefreshLoadContext {
    done: () => void;
}

export type PullRefreshPointerEvent = MouseEvent | TouchEvent;

interface PullPoint {
    x: number;
    y: number;
}

interface PullGesture {
    type: 'mouse' | 'touch';
    identifier?: number;
    startX: number;
    startY: number;
    axis: 'undecided' | 'vertical';
}

function isTouchEvent(event: PullRefreshPointerEvent): event is TouchEvent {
    return 'touches' in event || 'changedTouches' in event;
}

function getTouchPoint(event: TouchEvent, identifier?: number): PullPoint | undefined {
    if (event.touches.length !== 1) return undefined;
    const touch = event.touches[0];
    if (identifier !== undefined && touch.identifier !== identifier) return undefined;
    return { x: touch.clientX, y: touch.clientY };
}

function isScrollable(element: HTMLElement): boolean {
    const overflowY = element.ownerDocument?.defaultView?.getComputedStyle(element).overflowY;
    return (overflowY === 'auto' || overflowY === 'scroll')
        && element.scrollHeight > element.clientHeight;
}

function isAtTop(element: HTMLElement): boolean {
    if (element.scrollTop > 0) return false;
    if (isScrollable(element)) return true;

    const ownerDocument = element.ownerDocument;
    let ancestor = element.parentElement;
    while (ancestor && ancestor !== ownerDocument?.documentElement) {
        if (isScrollable(ancestor)) return ancestor.scrollTop <= 0;
        ancestor = ancestor.parentElement;
    }

    const documentScrollTop = Math.max(
        ownerDocument?.scrollingElement?.scrollTop ?? 0,
        ownerDocument?.defaultView?.scrollY ?? 0
    );
    return documentScrollTop <= 0;
}

export function usePullRefreshState(
    getProps: () => PullRefreshStateProps,
    emitLoad: (context: PullRefreshLoadContext) => void
) {
    const root = ref<HTMLElement>();
    const distance = ref(0);
    const refreshing = ref(false);
    const goingUp = ref(false);
    const threshold = computed(() => getProps().pullDownThreshold ?? getProps().threshold ?? 72);
    const resistance = computed(() => getProps().resistance ?? 0.5);
    const canRefresh = computed(() => !getProps().disabled && !refreshing.value && distance.value >= threshold.value);
    let gesture: PullGesture | undefined;
    let requestGeneration = 0;
    let disposed = false;

    function cancel(): void {
        gesture = undefined;
        distance.value = 0;
        goingUp.value = false;
    }

    function reset(): void {
        requestGeneration++;
        refreshing.value = false;
        cancel();
    }

    function begin(event: PullRefreshPointerEvent): void {
        if (disposed || getProps().disabled || refreshing.value || gesture || !root.value) return;

        if (isTouchEvent(event)) {
            if (event.touches.length !== 1) return;
            const touch = event.touches[0];
            if (!isAtTop(root.value)) return;
            gesture = { type: 'touch', identifier: touch.identifier, startX: touch.clientX, startY: touch.clientY, axis: 'undecided' };
        } else {
            if (event.button !== 0 || !isAtTop(root.value)) return;
            gesture = { type: 'mouse', startX: event.clientX, startY: event.clientY, axis: 'undecided' };
        }

        distance.value = 0;
        goingUp.value = false;
    }

    function move(event: PullRefreshPointerEvent): void {
        if (disposed || !gesture || getProps().disabled) return;

        let point: PullPoint | undefined;
        if (gesture.type === 'touch') {
            if (!isTouchEvent(event)) { cancel(); return; }
            point = getTouchPoint(event, gesture.identifier);
        } else if (!isTouchEvent(event)) {
            point = { x: event.clientX, y: event.clientY };
        }

        if (!point || !root.value || !isAtTop(root.value)) { cancel(); return; }

        const deltaX = point.x - gesture.startX;
        const deltaY = point.y - gesture.startY;
        if (gesture.axis === 'undecided') {
            if (deltaY < 0 || Math.abs(deltaX) > Math.abs(deltaY)) { cancel(); return; }
            if (deltaX === 0 && deltaY === 0) return;
            gesture.axis = 'vertical';
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            cancel();
            return;
        }

        const nextDistance = Math.min(threshold.value * 1.5, Math.max(0, deltaY * resistance.value));
        goingUp.value = nextDistance < distance.value;
        distance.value = nextDistance;
    }

    function end(event: PullRefreshPointerEvent): void {
        if (disposed || !gesture) return;
        if (gesture.type === 'touch') {
            if (!isTouchEvent(event)) return;
            if (event.touches.length !== 0) { cancel(); return; }
            const endedTouch = Array.from(event.changedTouches).some(touch => touch.identifier === gesture?.identifier);
            if (!endedTouch) return;
        } else if (isTouchEvent(event)) {
            return;
        }

        const shouldRefresh = canRefresh.value && !getProps().disabled;
        gesture = undefined;
        goingUp.value = false;
        if (!shouldRefresh) {
            distance.value = 0;
            return;
        }

        // Set this before emitting because a consumer can call done synchronously.
        refreshing.value = true;
        const generation = ++requestGeneration;
        let completed = false;
        emitLoad({
            done() {
                if (completed) return;
                completed = true;
                if (disposed || requestGeneration !== generation) return;
                refreshing.value = false;
                distance.value = 0;
                goingUp.value = false;
            }
        });
    }

    watch(() => Boolean(getProps().disabled), disabled => {
        if (disabled) cancel();
    }, { flush: 'sync' });

    onUnmounted(() => {
        disposed = true;
        requestGeneration++;
        refreshing.value = false;
        cancel();
    });

    return { root, distance, refreshing, canRefresh, goingUp, threshold, begin, move, end, cancel, reset };
}
