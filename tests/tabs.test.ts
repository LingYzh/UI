import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTabItems, tabToken } from '../src/ui/tabs.ts';
import { componentApi } from '../src/ui/docs/apiReference.js';

test('tab item normalization accepts legacy and modern shapes and preserves numeric zero', () => {
    assert.deepEqual(normalizeTabItems([
        'overview',
        0,
        { value: 0, text: '零' },
        { id: 'details', label: '详情', disabled: true },
        { value: 'custom', text: '' },
        {},
    ]), [
        { value: 'overview', text: 'overview', label: 'overview' },
        { value: 0, text: '0', label: '0' },
        { value: 0, text: '零', label: '零' },
        { id: 'details', label: '详情', disabled: true, value: 'details', text: '详情' },
        { value: 'custom', text: '', label: '' },
        { value: 5, text: '5', label: '5' },
    ]);
});

test('tab tokens distinguish numeric and string values and encode unsafe characters', () => {
    assert.equal(tabToken(0), 'n-0');
    assert.equal(tabToken('0'), 's-0');
    assert.equal(tabToken('east/asia'), 's-east%2Fasia');
});

test('published Tabs API documents manual activation, optional models and all slot payloads', () => {
    const tabs = componentApi.UTabs;
    const prop = (name: string) => tabs.props.find(item => item.name === name)!;
    assert.deepEqual(prop('items').declaredDefault, { kind: 'factory', source: '() => []' });
    assert.equal(prop('items').required, false);
    assert.deepEqual(prop('activation').declaredDefault, { kind: 'explicit', source: "'manual'" });
    assert.deepEqual(prop('mandatory').declaredDefault, { kind: 'explicit', source: "'force'" });
    assert.equal(prop('modelValue').type, 'unknown');
    assert.equal(prop('modelValue').required, false);
    assert.deepEqual(prop('modelValue').declaredDefault, { kind: 'undefined' });
    assert.match(prop('modelValue').description, /空列表或取消选择时可为 undefined/);
    assert.equal(tabs.events.find(event => event.name === 'update:modelValue')?.type, 'value: unknown');
    assert.match(tabs.events.find(event => event.name === 'update:modelValue')?.description ?? '', /payload 可为 undefined/);
    assert.deepEqual(tabs.slots.map(slot => [slot.name, slot.type]).sort(([a], [b]) => a.localeCompare(b)), [
        ['default', '{ item }'],
        ['item', '{ item }'],
        ['tab', '{ item }'],
        ['window', '—'],
    ]);
});

test('declarative Tab and Window contracts expose arbitrary values and inherited lazy defaults', () => {
    const tab = componentApi.UTab;
    const window = componentApi.UTabsWindow;
    const windowItem = componentApi.UTabsWindowItem;
    assert.deepEqual(tab.props.find(item => item.name === 'value')?.declaredDefault, { kind: 'undefined' });
    assert.deepEqual(tab.props.find(item => item.name === 'ripple')?.declaredDefault, { kind: 'explicit-undefined', source: 'undefined' });
    assert.ok(tab.methods.some(method => method.name === 'focus'));
    assert.deepEqual(window.props.find(item => item.name === 'modelValue')?.declaredDefault, { kind: 'undefined' });
    assert.equal(window.props.find(item => item.name === 'modelValue')?.type, 'unknown');
    assert.equal(window.events.find(event => event.name === 'update:modelValue')?.type, 'value: unknown');
    assert.ok(window.events.some(event => event.name === 'update:modelValue'));
    assert.match(window.props.find(item => item.name === 'modelValue')?.description ?? '', /仅在 UTabs 后代或 #window 上下文中/);
    assert.match(window.props.find(item => item.name === 'modelValue')?.description ?? '', /相邻兄弟 UTabs 配对时需绑定同一模型/);
    assert.deepEqual(windowItem.props.find(item => item.name === 'eager')?.declaredDefault, { kind: 'explicit-undefined', source: 'undefined' });
});
