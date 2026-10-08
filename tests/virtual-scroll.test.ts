import assert from 'node:assert/strict';
import test from 'node:test';
import { createRenderer, defineComponent, nextTick, ref, shallowRef, type MaybeRefOrGetter, type Ref } from 'vue';
import {
    captureVirtualScrollAnchor,
    createVirtualScrollMetrics,
    getVirtualScrollWindow,
    restoreVirtualScrollAnchor,
    virtualIndexAt,
    virtualOffsetForIndex,
    virtualScrollOffsetForIndex,
    virtualWindow,
    type VirtualScrollKey
} from '../src/ui/virtual-scroll';
import { useVirtualScroll, type VirtualScrollItemKey } from '../src/ui/use-virtual-scroll';

interface TestItem { id: string; label: string; }

class MockResizeObserver {
    static instances: MockResizeObserver[] = [];
    observed = new Set<Element>();
    observeCalls: Element[] = [];
    unobserved: Element[] = [];
    disconnected = false;
    constructor(private readonly callback: ResizeObserverCallback) { MockResizeObserver.instances.push(this); }
    observe(target: Element): void { this.observeCalls.push(target); this.observed.add(target); }
    unobserve(target: Element): void { this.observed.delete(target); this.unobserved.push(target); }
    disconnect(): void { this.disconnected = true; this.observed.clear(); }
    trigger(target: Element): void {
        this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
}

function fakeElement(initial: { clientHeight?: number; height?: number; scrollTop?: number } = {}) {
    const listeners = new Map<string, Set<EventListener>>();
    let scrollTop = initial.scrollTop ?? 0;
    let height = initial.height ?? 0;
    const element = {
        clientHeight: initial.clientHeight ?? 0,
        offsetHeight: initial.height ?? 0,
        get scrollTop() { return scrollTop; },
        set scrollTop(value: number) { scrollTop = value; },
        addEventListener(type: string, listener: EventListener) {
            const group = listeners.get(type) ?? new Set<EventListener>();
            group.add(listener);
            listeners.set(type, group);
        },
        removeEventListener(type: string, listener: EventListener) { listeners.get(type)?.delete(listener); },
        getBoundingClientRect() { return { height } as DOMRect; },
        setHeight(value: number) { height = value; this.offsetHeight = value; },
        dispatch(type: string) { for (const listener of listeners.get(type) ?? []) listener(new Event(type)); },
        listenerCount(type: string) { return listeners.get(type)?.size ?? 0; }
    };
    return element;
}

interface HostNode { type: string; children: HostNode[]; parent?: HostNode; text?: string; }
const renderer = createRenderer<HostNode, HostNode>({
    patchProp() {},
    insert(node, parent, anchor) {
        node.parent = parent;
        const index = anchor ? parent.children.indexOf(anchor) : -1;
        if (index < 0) parent.children.push(node); else parent.children.splice(index, 0, node);
    },
    remove(node) {
        const parent = node.parent;
        if (!parent) return;
        const index = parent.children.indexOf(node);
        if (index >= 0) parent.children.splice(index, 1);
        node.parent = undefined;
    },
    createElement(type) { return { type, children: [] }; },
    createText(text) { return { type: '#text', text, children: [] }; },
    createComment(text) { return { type: '#comment', text, children: [] }; },
    setText(node, text) { node.text = text; },
    setElementText(node, text) { node.text = text; node.children = []; },
    parentNode(node) { return node.parent ?? null; },
    nextSibling(node) {
        const parent = node.parent;
        if (!parent) return null;
        return parent.children[parent.children.indexOf(node) + 1] ?? null;
    }
});

function mountComposable(items: Ref<TestItem[]>, scroller: ReturnType<typeof fakeElement>, itemKey: Ref<VirtualScrollItemKey<TestItem> | undefined> = ref('id'), itemHeight: MaybeRefOrGetter<number | undefined> = 10) {
    const apiRef = shallowRef<ReturnType<typeof useVirtualScroll<TestItem>> | undefined>();
    const app = renderer.createApp(defineComponent({
        setup() {
            apiRef.value = useVirtualScroll({
                items,
                itemKey,
                itemHeight,
                height: 25,
                overscan: 0,
                getScrollElement: () => scroller as unknown as HTMLElement,
                createResizeObserver: (callback) => new MockResizeObserver(callback) as unknown as ResizeObserver
            });
            return () => null;
        }
    }));
    const root: HostNode = { type: 'root', children: [] };
    app.mount(root);
    return { app, api: apiRef.value!, observer: MockResizeObserver.instances.at(-1)! };
}

test('fixed compatibility helper keeps its original result shape', () => {
    assert.deepEqual(virtualWindow(1000, 5000, 300, 30, 3), { start: 163, end: 180, rowHeight: 30, totalHeight: 30000 });
    assert.deepEqual(virtualWindow(5, 5000, 300, 30, 3), { start: 5, end: 5, rowHeight: 30, totalHeight: 150 });
    assert.deepEqual(virtualWindow(0, 0, 300, 0, 3), { start: 0, end: 0, rowHeight: 1, totalHeight: 0 });
});

test('variable metrics ignore invalid row measurements and expose offsets and spacers', () => {
    const metrics = createVirtualScrollMetrics(4, 20, [10, 0, Number.NaN, 30]);
    assert.deepEqual(metrics.heights, [10, 20, 20, 30]);
    assert.deepEqual(metrics.offsets, [0, 10, 30, 50, 80]);
    assert.equal(metrics.totalHeight, 80);

    const result = getVirtualScrollWindow(['a', 'b', 'c', 'd'], 10, 40, 0, metrics);
    assert.deepEqual(result.items, ['b', 'c']);
    assert.equal(result.start, 1);
    assert.equal(result.end, 3);
    assert.equal(result.offset, 10);
    assert.equal(result.paddingTop, 10);
    assert.equal(result.paddingBottom, 30);
    assert.equal(result.totalHeight, 80);
});

test('variable index lookup and scroll alignment clamp invalid and out-of-range inputs', () => {
    const offsets = [0, 10, 30, 50];
    assert.equal(virtualIndexAt(-2, offsets), 0);
    assert.equal(virtualIndexAt(9.99, offsets), 0);
    assert.equal(virtualIndexAt(10, offsets), 1);
    assert.equal(virtualIndexAt(50, offsets), 2);
    assert.equal(virtualIndexAt(20, [0]), -1);
    assert.equal(virtualOffsetForIndex(-3, offsets), 0);
    assert.equal(virtualOffsetForIndex(2, offsets), 30);
    assert.equal(virtualOffsetForIndex(99, offsets), 30);
    assert.equal(virtualScrollOffsetForIndex(1, offsets, 15, 'start'), 10);
    assert.equal(virtualScrollOffsetForIndex(1, offsets, 15, 'center'), 12.5);
    assert.equal(virtualScrollOffsetForIndex(1, offsets, 15, 'end'), 15);
    assert.equal(virtualScrollOffsetForIndex(1, offsets, 15, 'nearest', 10), 15);
    assert.equal(virtualScrollOffsetForIndex(1, offsets, 15, 'nearest', 0), 15);
    assert.equal(virtualScrollOffsetForIndex(Number.NaN, offsets, 15), 0);
});

test('anchor helpers preserve a keyed row through height changes and deletion', () => {
    const keys: VirtualScrollKey[] = ['a', 'b', 'c'];
    const previousOffsets = [0, 10, 30, 50];
    const anchor = captureVirtualScrollAnchor(keys, previousOffsets, 15);
    assert.deepEqual(anchor, { key: 'b', index: 1, offset: 5 });
    assert.equal(restoreVirtualScrollAnchor(anchor, keys, [0, 20, 40, 60]), 25);
    assert.equal(restoreVirtualScrollAnchor(anchor, ['a', 'c'], [0, 10, 30]), 15, 'removed anchors fall back to the old index');
    assert.equal(restoreVirtualScrollAnchor(anchor, [], [0]), 0);
});

test('composable measures rows, keeps the visible key anchored, and reacts to viewport resize', async () => {
    MockResizeObserver.instances = [];
    const items = ref<TestItem[]>(Array.from({ length: 8 }, (_, index) => ({ id: String.fromCharCode(97 + index), label: String(index) })));
    const scroller = fakeElement({ clientHeight: 25 });
    const { app, api, observer } = mountComposable(items, scroller);
    await nextTick();

    assert.equal(api.totalHeight.value, 80);
    assert.equal(scroller.listenerCount('scroll'), 1);
    assert.equal(api.scrollToIndex(2, 'start'), 20);
    assert.equal(api.scrollToIndex(2, 'center'), 12.5);
    assert.equal(api.scrollToIndex(2, 'end'), 5);
    scroller.scrollTop = 0;
    scroller.dispatch('scroll');
    assert.equal(api.scrollToIndex(1, 'nearest'), 0, 'nearest leaves a fully visible item in place');
    assert.equal(api.scrollToIndex(99, 'start'), 55, 'public index positioning clamps to the last reachable viewport');
    const rowA = fakeElement({ height: 10 });
    const rowB = fakeElement({ height: 10 });
    const rowC = fakeElement({ height: 10 });
    api.itemRef(0, rowA as unknown as HTMLElement);
    api.itemRef(1, rowB as unknown as HTMLElement);
    api.itemRef(2, rowC as unknown as HTMLElement);
    assert.ok(observer.observed.has(rowA as unknown as Element));

    scroller.scrollTop = 22;
    scroller.dispatch('scroll');
    rowA.setHeight(20);
    rowB.setHeight(15);
    observer.trigger(rowA as unknown as Element);
    observer.trigger(rowB as unknown as Element);
    assert.equal(api.metrics.value.offsets[2], 35);
    assert.equal(api.scrollTop.value, 37, 'the same key and two-pixel intra-row offset stay at the viewport top');
    assert.equal(scroller.scrollTop, 37);

    const beforeInvalid = api.metrics.value.heights[2];
    rowC.setHeight(0);
    observer.trigger(rowC as unknown as Element);
    assert.equal(api.metrics.value.heights[2], beforeInvalid, 'zero-height observer callbacks are ignored');

    scroller.clientHeight = 40;
    observer.trigger(scroller as unknown as Element);
    assert.equal(api.viewportHeight.value, 40);
    app.unmount();
    assert.equal(observer.disconnected, true);
    assert.equal(scroller.listenerCount('scroll'), 0);
});

test('composable prunes removed keys, holds the surviving anchor, replaces row refs, and cleans up', async () => {
    MockResizeObserver.instances = [];
    const items = ref<TestItem[]>([
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' }
    ]);
    const scroller = fakeElement({ clientHeight: 10 });
    const itemKey = ref<VirtualScrollItemKey<TestItem> | undefined>('id');
    const { app, api, observer } = mountComposable(items, scroller, itemKey);
    await nextTick();
    const rowA = fakeElement({ height: 20 });
    const rowB = fakeElement({ height: 10 });
    const rowC = fakeElement({ height: 10 });
    api.itemRef(0, rowA as unknown as HTMLElement);
    api.itemRef(1, rowB as unknown as HTMLElement);
    api.itemRef(2, rowC as unknown as HTMLElement);
    observer.trigger(rowA as unknown as Element);
    assert.equal(api.metrics.value.offsets[1], 20);

    scroller.scrollTop = 25;
    scroller.dispatch('scroll');
    items.value.splice(1, 1);
    await nextTick();
    assert.equal(api.scrollTop.value, 25, 'the deleted anchor falls back to the next item at its old index and preserves the intra-row offset');
    assert.deepEqual(api.metrics.value.offsets, [0, 20, 30, 40], 'deleted key measurements are removed');
    assert.ok(observer.unobserved.includes(rowB as unknown as Element));
    assert.ok(observer.unobserved.includes(rowC as unknown as Element), 'a shifted row ref is detached until the consumer binds its new index');

    itemKey.value = (item) => `key:${item.id}`;
    await nextTick();
    assert.deepEqual(api.metrics.value.offsets, [0, 10, 20, 30], 'changing the key strategy drops measurements owned by old keys');
    assert.equal(api.scrollTop.value, 15, 'the index fallback preserves the intra-row offset when the anchor key changes');

    const replacement = fakeElement({ height: 12 });
    api.itemRef(0, replacement as unknown as HTMLElement);
    assert.ok(observer.unobserved.includes(rowA as unknown as Element));
    assert.ok(observer.observed.has(replacement as unknown as Element));
    api.itemRef(0, null);
    assert.ok(observer.unobserved.includes(replacement as unknown as Element));

    app.unmount();
    assert.equal(observer.disconnected, true);
    assert.equal(scroller.listenerCount('scroll'), 0);
});

test('composable preserves keyed row measurements when rows reorder', async () => {
    MockResizeObserver.instances = [];
    const items = ref<TestItem[]>([
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
    ]);
    const scroller = fakeElement({ clientHeight: 10 });
    const { app, api, observer } = mountComposable(items, scroller);
    await nextTick();

    const rowA = fakeElement({ height: 12 });
    const rowB = fakeElement({ height: 18 });
    api.itemRef(0, rowA as unknown as HTMLElement);
    api.itemRef(1, rowB as unknown as HTMLElement);
    observer.trigger(rowA as unknown as Element);
    observer.trigger(rowB as unknown as Element);
    assert.deepEqual(api.metrics.value.heights, [12, 18]);

    items.value.reverse();
    await nextTick();
    assert.deepEqual(api.metrics.value.heights, [18, 12], 'measurements follow stable item keys through a reorder');
    assert.ok(!observer.observed.has(rowA as unknown as Element));
    assert.ok(!observer.observed.has(rowB as unknown as Element));

    api.itemRef(0, null);
    api.itemRef(1, null);
    api.itemRef(0, rowB as unknown as HTMLElement);
    api.itemRef(1, rowA as unknown as HTMLElement);
    assert.equal(observer.observeCalls.filter((element) => element === rowA as unknown as Element).length, 2, 'the row is observed once per attach lifecycle');
    assert.deepEqual(api.metrics.value.heights, [18, 12]);

    api.itemRef(1, null);
    assert.ok(!observer.observed.has(rowA as unknown as Element));
    app.unmount();
    assert.equal(observer.disconnected, true);
});

test('composable moves a reused row ref without duplicate observer registration', async () => {
    MockResizeObserver.instances = [];
    const items = ref<TestItem[]>([
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
    ]);
    const scroller = fakeElement({ clientHeight: 10 });
    const { app, api, observer } = mountComposable(items, scroller);
    await nextTick();

    const row = fakeElement({ height: 12 });
    api.itemRef(0, row as unknown as HTMLElement);
    observer.trigger(row as unknown as Element);
    api.itemRef(1, row as unknown as HTMLElement);
    api.itemRef(0, null);
    assert.ok(observer.observed.has(row as unknown as Element), 'the old index callback cannot detach a row after its ref has moved');
    assert.equal(observer.observeCalls.filter((element) => element === row as unknown as Element).length, 1, 'same-element rebinding does not call observe twice');

    observer.trigger(row as unknown as Element);
    assert.equal(api.metrics.value.heights[1], 12, 'the moved DOM row now measures against the destination item key');
    api.itemRef(1, null);
    assert.ok(!observer.observed.has(row as unknown as Element));
    app.unmount();
});

test('composable uses the upstream 16px estimate when the supplied estimate is zero or invalid', async () => {
    MockResizeObserver.instances = [];
    const items = ref<TestItem[]>([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]);
    const scroller = fakeElement({ clientHeight: 20 });
    const itemHeight = ref<number | undefined>();
    const { app, api } = mountComposable(items, scroller, ref('id'), itemHeight);
    await nextTick();
    assert.equal(api.estimate.value, 16, 'omitting itemHeight uses the official initial estimate');
    assert.equal(api.totalHeight.value, 32);
    itemHeight.value = 0;
    await nextTick();
    assert.equal(api.estimate.value, 16, 'a non-positive estimate safely retains the same fallback');
    assert.equal(api.totalHeight.value, 32);
    app.unmount();
});
