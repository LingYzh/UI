import assert from 'node:assert/strict';
import test from 'node:test';
import { createRenderer, defineComponent, h, nextTick, ref, type Ref } from 'vue';
import {
    appLayoutKey,
    createAppLayout,
    useLayoutItem,
    type LayoutEdge,
} from '../src/ui/layout-completion';

test('layout accumulates four edges in priority and stable registration order', () => {
    const layout = createAppLayout();
    const topFirst = Symbol('top-first');
    const left = Symbol('left');
    const topSecond = Symbol('top-second');
    const bottom = Symbol('bottom');
    const inactive = Symbol('inactive');
    const invalidSize = Symbol('invalid-size');

    layout.register(topFirst, { id: 'top-first', edge: 'top', size: 10, active: true, order: 1 });
    layout.register(left, { id: 'left', edge: 'left', size: 5, active: true, order: 1 });
    layout.register(topSecond, { id: 'top-second', edge: 'top', size: 3, active: true, order: 1 });
    layout.register(bottom, { id: 'bottom', edge: 'bottom', size: 7, active: true, order: 0 });
    layout.register(inactive, { id: 'inactive', edge: 'top', size: 100, active: false, order: -1 });
    layout.register(invalidSize, { id: 'invalid-size', edge: 'right', size: Number.NaN, active: true, order: 2 });

    assert.deepEqual(layout.offsets.value, { top: 13, right: 0, bottom: 7, left: 5 });
    assert.equal(layout.mainRect, layout.offsets);
    assert.equal(layout.before(topSecond), 10);
    assert.deepEqual(layout.items.value.map(({ id }) => id), [
        'inactive',
        'bottom',
        'top-first',
        'left',
        'top-second',
        'invalid-size',
    ]);
    assert.deepEqual(layout.getLayoutItem('left'), {
        id: 'left',
        position: 'left',
        size: 5,
        top: 10,
        right: 0,
        bottom: 7,
        left: 0,
    });
    assert.equal(layout.getLayoutItem('missing'), undefined);
    assert.equal(layout.getLayoutItem('invalid-size')?.size, 0);
});

test('negative and non-finite sizes are clamped without changing active layout', () => {
    const layout = createAppLayout();
    const negative = Symbol('negative');
    const infinite = Symbol('infinite');
    const inactive = Symbol('inactive');
    layout.register(negative, { edge: 'top', size: -12, active: true, order: 0 });
    layout.register(infinite, { edge: 'right', size: Number.POSITIVE_INFINITY, active: true, order: 1 });
    layout.register(inactive, { edge: 'bottom', size: 22, active: false, order: 2 });

    assert.deepEqual(layout.offsets.value, { top: 0, right: 0, bottom: 0, left: 0 });
    assert.deepEqual(layout.items.value.map((item) => item.size), [0, 0, 22]);
});

test('fallback ids stay stable per symbol and unique across identical symbol descriptions', () => {
    const layout = createAppLayout();
    const first = Symbol('layout-item');
    const second = Symbol('layout-item');
    layout.register(first, { edge: 'top', size: 10, active: true, order: 0 });
    layout.register(second, { edge: 'bottom', size: 12, active: true, order: 1 });

    const [firstId, secondId] = layout.items.value.map((item) => item.id);
    assert.ok(firstId);
    assert.ok(secondId);
    assert.notEqual(firstId, secondId);
    assert.equal(layout.getLayoutItem(firstId)?.position, 'top');
    assert.equal(layout.getLayoutItem(secondId)?.position, 'bottom');

    layout.register(first, { edge: 'left', size: 14, active: true, order: 2 });
    assert.equal(layout.itemRect(first)?.id, firstId);
    assert.equal(layout.itemRect(secondId)?.id, secondId);
});

test('named overlaps adjust item rectangles in both directions but leave mainRect intact', () => {
    const overlaps = ref<readonly string[]>(['bar:drawer']);
    const layout = createAppLayout(() => ({ overlaps: overlaps.value }));
    const bar = Symbol('bar');
    const drawer = Symbol('drawer');
    layout.register(bar, { id: 'bar', edge: 'top', size: 20, active: true, order: 0 });
    layout.register(drawer, { id: 'drawer', edge: 'left', size: 100, active: true, order: 1 });

    assert.equal(layout.itemRect(bar)?.left, -100);
    assert.equal(layout.itemRect('drawer')?.top, 40);
    assert.deepEqual(layout.mainRect.value, { top: 20, right: 0, bottom: 0, left: 100 });

    overlaps.value = ['drawer:bar'];
    assert.equal(layout.itemRect(drawer)?.top, 0);
    assert.equal(layout.itemRect('bar')?.left, 100);

    overlaps.value = ['bar:drawer', 'other:drawer'];
    const other = Symbol('other');
    layout.register(other, { id: 'other', edge: 'bottom', size: 8, active: true, order: 2 });
    assert.equal(layout.itemRect(drawer)?.bottom, 8);
    assert.equal(layout.itemRect(bar)?.left, -100);
});

test('overlap adjustments use registered sizes even when one participating item is inactive', () => {
    const layout = createAppLayout(() => ({ overlaps: ['bar:drawer'] }));
    const bar = Symbol('bar');
    const drawer = Symbol('drawer');
    layout.register(bar, { id: 'bar', edge: 'top', size: 20, active: true, order: 0 });
    layout.register(drawer, { id: 'drawer', edge: 'left', size: 100, active: false, order: 1 });

    assert.equal(layout.itemRect(bar)?.left, -100);
    assert.equal(layout.itemRect(drawer)?.top, 40);
    assert.deepEqual(layout.mainRect.value, { top: 20, right: 0, bottom: 0, left: 0 });
});

test('malformed, unknown, and stale overlap names are ignored', () => {
    const overlaps = ref<readonly string[]>([
        'bar',
        'bar:missing',
        'bar:drawer:extra',
        ':drawer',
        'bar:',
    ]);
    const layout = createAppLayout(() => ({ overlaps: overlaps.value }));
    const bar = Symbol('bar');
    const drawer = Symbol('drawer');
    layout.register(bar, { id: 'bar', edge: 'top', size: 20, active: true, order: 0 });
    layout.register(drawer, { id: 'drawer', edge: 'left', size: 100, active: true, order: 1 });
    assert.equal(layout.itemRect(bar)?.left, 0);
    assert.equal(layout.itemRect(drawer)?.top, 20);

    overlaps.value = ['bar:drawer'];
    layout.register(bar, { id: 'renamed-bar', edge: 'top', size: 20, active: true, order: 0 });
    assert.equal(layout.getLayoutItem('bar'), undefined);
    assert.equal(layout.itemRect('renamed-bar')?.left, 0);
    layout.unregister(drawer);
    assert.equal(layout.getLayoutItem('drawer'), undefined);
    assert.equal(layout.itemRect(drawer), undefined);
});

test('reorder changes equal-priority tie order while keeping before same-edge only', () => {
    const layout = createAppLayout();
    const first = Symbol('first');
    const side = Symbol('side');
    const second = Symbol('second');
    layout.register(first, { id: 'first', edge: 'top', size: 10, active: true, order: 4 });
    layout.register(side, { id: 'side', edge: 'right', size: 6, active: true, order: 4 });
    layout.register(second, { id: 'second', edge: 'top', size: 12, active: true, order: 4 });
    assert.equal(layout.before(second), 10);

    layout.reorder([second, first]);
    assert.deepEqual(layout.items.value.map(({ id }) => id), ['second', 'first', 'side']);
    assert.equal(layout.before(first), 12);
    assert.equal(layout.before(second), 0);
    assert.deepEqual(layout.mainRect.value, { top: 22, right: 6, bottom: 0, left: 0 });
});

type TestNode = {
    type: string;
    text: string;
    parent: TestNode | null;
    children: TestNode[];
};

function createTestNode(type: string, text = ''): TestNode {
    return { type, text, parent: null, children: [] };
}

const renderer = createRenderer<TestNode, TestNode>({
    patchProp: () => undefined,
    insert(node, parent, anchor) {
        if (node.parent) {
            const oldIndex = node.parent.children.indexOf(node);
            if (oldIndex >= 0) node.parent.children.splice(oldIndex, 1);
        }
        node.parent = parent;
        const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1;
        if (anchorIndex < 0) parent.children.push(node);
        else parent.children.splice(anchorIndex, 0, node);
    },
    remove(node) {
        if (!node.parent) return;
        const index = node.parent.children.indexOf(node);
        if (index >= 0) node.parent.children.splice(index, 1);
        node.parent = null;
    },
    createElement: (type) => createTestNode(type),
    createText: (text) => createTestNode('#text', text),
    createComment: (text) => createTestNode('#comment', text),
    setText(node, text) { node.text = text; },
    setElementText(node, text) {
        node.text = text;
        node.children = [];
    },
    parentNode: (node) => node.parent,
    nextSibling(node) {
        if (!node.parent) return null;
        const index = node.parent.children.indexOf(node);
        return node.parent.children[index + 1] ?? null;
    },
});

test('useLayoutItem keeps the legacy four-argument call and reacts to a named layout registration', async () => {
    const legacyCall: (
        edge: Ref<LayoutEdge>,
        size: Ref<number>,
        active: Ref<boolean>,
        order: Ref<number>,
    ) => ReturnType<typeof useLayoutItem> = (edge, size, active, order) => useLayoutItem(edge, size, active, order);
    assert.equal(typeof legacyCall, 'function');

    const layout = createAppLayout();
    const edge = ref<LayoutEdge>('top');
    const size = ref(18);
    const active = ref(true);
    const order = ref(0);
    const name = ref<string | undefined>('first-name');
    let api: ReturnType<typeof useLayoutItem> | undefined;
    const Component = defineComponent({
        setup() {
            api = useLayoutItem(edge, size, active, order, name);
            return () => h('span');
        },
    });
    const app = renderer.createApp(Component);
    const container = createTestNode('root');
    app.provide(appLayoutKey, layout);
    app.mount(container);

    assert.equal(api?.id.value, 'first-name');
    assert.equal(layout.getLayoutItem('first-name')?.top, 0);
    assert.equal(api?.rect.value.size, 18);

    name.value = 'renamed';
    edge.value = 'left';
    size.value = 30;
    order.value = 2;
    await nextTick();
    assert.equal(layout.getLayoutItem('first-name'), undefined);
    assert.equal(layout.getLayoutItem('renamed')?.position, 'left');
    assert.equal(layout.getLayoutItem('renamed')?.size, 30);
    assert.equal(api?.rect.value.left, 0);

    active.value = false;
    await nextTick();
    assert.equal(layout.mainRect.value.left, 0);
    app.unmount();
    assert.equal(layout.items.value.length, 0);
});
