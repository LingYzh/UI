import assert from 'node:assert/strict';
import test from 'node:test';
import { createAppLayout } from '../src/ui/layout-completion';
import { getItemField, toggleListValue, toggleTreeValues, treeSelectionState } from '../src/ui/list-completion';
import { virtualWindow } from '../src/ui/virtual-scroll';
import { isTopOverlay, popOverlay, pushOverlay } from '../src/ui/overlay-lifecycle';

test('registered layout items add exact active dimensions and respect order', () => {
    const layout = createAppLayout();
    const system = Symbol('system');
    const bar = Symbol('bar');
    const drawer = Symbol('drawer');
    const secondDrawer = Symbol('second-drawer');
    layout.register(system, { edge: 'top', size: 24, active: true, order: 0 });
    layout.register(bar, { edge: 'top', size: 56, active: true, order: 10 });
    layout.register(drawer, { edge: 'left', size: 240, active: true, order: 0 });
    layout.register(secondDrawer, { edge: 'left', size: 56, active: true, order: 0 });
    assert.deepEqual(layout.offsets.value, { top: 80, right: 0, bottom: 0, left: 296 });
    assert.equal(layout.before(bar), 24);
    assert.equal(layout.before(secondDrawer), 240);
    layout.register(drawer, { edge: 'left', size: 240, active: false, order: 0 });
    assert.equal(layout.offsets.value.left, 56);
    layout.unregister(system);
    assert.equal(layout.offsets.value.top, 56);
});

test('list and tree selection respect multiple and mandatory states', () => {
    assert.deepEqual(toggleListValue(['a'], 'a', false, true), ['a']);
    assert.deepEqual(toggleListValue(['a'], 'b', true, false), ['a', 'b']);
    assert.deepEqual(toggleListValue(['a', 'b'], 'a', true, false), ['b']);
    assert.deepEqual(toggleTreeValues(['parent'], ['parent', 'child'], true, false), ['parent', 'child']);
    assert.equal(treeSelectionState(['parent', 'child'], ['child']), 'mixed');
    assert.equal(treeSelectionState(['parent', 'child'], ['parent', 'child']), 'checked');
    assert.deepEqual(toggleTreeValues(['parent', 'child'], ['parent', 'child'], true, true), ['parent', 'child']);
});

test('item mapping resolves nested fields and custom mappers', () => {
    const item = { meta: { label: 'Visible' }, id: 42 };
    assert.equal(getItemField(item, 'meta.label', ''), 'Visible');
    assert.equal(getItemField(item, (source) => (source as typeof item).id, null), 42);
    assert.equal(getItemField(item, 'missing', 'fallback'), 'fallback');
});

test('virtual range tracks scroll and changing item count without rendering every item', () => {
    assert.deepEqual(virtualWindow(1000, 5000, 300, 30, 3), { start: 163, end: 180, rowHeight: 30, totalHeight: 30000 });
    assert.deepEqual(virtualWindow(5, 5000, 300, 30, 3), { start: 5, end: 5, rowHeight: 30, totalHeight: 150 });
    assert.deepEqual(virtualWindow(0, 0, 300, 0, 3), { start: 0, end: 0, rowHeight: 1, totalHeight: 0 });
});

test('overlay stack only treats the newest live overlay as topmost', () => {
    const first = {} as HTMLDialogElement;
    const second = {} as HTMLDialogElement;
    pushOverlay(first);
    pushOverlay(second);
    pushOverlay(second);
    assert.equal(isTopOverlay(first), false);
    assert.equal(isTopOverlay(second), true);
    popOverlay(second);
    assert.equal(isTopOverlay(first), true);
    popOverlay(first);
});
