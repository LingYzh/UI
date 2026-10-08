<script setup lang="ts">
import { computed, h, ref, useSlots, watch } from 'vue';
import UListItem from './UListItem.vue';
import UListGroup from './UListGroup.vue';
import UListSubheader from './UListSubheader.vue';
import UDivider from './UDivider.vue';
import { getItemField, makeListContext, provideList, toggleListValue, type ListValue } from './list-completion';
import { createOpenStrategy, createSelectStrategy, type SelectStrategyName, type OpenStrategyName } from './nested-strategies';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{
    modelValue?: ListValue | ListValue[]; selected?: ListValue[]; activated?: ListValue | ListValue[]; opened?: ListValue[];
    multiple?: boolean; mandatory?: boolean; selectable?: boolean; activatable?: boolean; disabled?: boolean; readonly?: boolean; nav?: boolean;
    items?: unknown[]; itemTitle?: string | ((item: unknown) => unknown); itemValue?: string | ((item: unknown) => unknown);
    itemProps?: string | boolean | ((item: unknown) => unknown); itemChildren?: string | ((item: unknown) => unknown); itemType?: string | ((item: unknown) => unknown);
    selectStrategy?: SelectStrategyName; openStrategy?: OpenStrategyName; navigationStrategy?: 'focus' | 'track';
    filterable?: boolean; search?: string; customFilter?: (value: string, query: string, item: unknown) => boolean;
}>(), { modelValue: undefined, selected: undefined, activated: undefined, multiple: false, mandatory: false, selectable: false, activatable: false, nav: false, itemTitle: 'title', itemValue: 'value', itemProps: 'props', itemChildren: 'children', itemType: 'type', openStrategy: 'list', navigationStrategy: 'focus' });
const props = useDefaults(rawProps, 'UList');
const emit = defineEmits<{
    'update:modelValue': [value: ListValue[]]; 'update:selected': [value: ListValue[]]; 'update:activated': [value: ListValue[]]; 'update:opened': [value: ListValue[]];
    'click:select': [value: { id: ListValue; value: boolean; path: ListValue[] }]; 'click:open': [value: { id: ListValue; value: boolean; path: ListValue[] }];
}>();
const navigationIndex = defineModel<number>('navigationIndex', { default: -1 });
const slots = useSlots();
const element = ref<HTMLElement>();
const localSelected = ref<ListValue[]>([]);
const localActivated = ref<ListValue[]>([]);
const localOpened = ref<ListValue[]>([]);
const array = (value: ListValue | ListValue[] | undefined) => value === undefined ? [] : Array.isArray(value) ? value : [value];
const selected = computed(() => props.selected ?? (props.modelValue === undefined ? localSelected.value : array(props.modelValue)));
const activated = computed(() => props.activated === undefined ? localActivated.value : array(props.activated));
const opened = computed(() => props.opened ?? localOpened.value);
interface Item { raw: unknown; value: ListValue; title: string; type: string; props: Record<string, unknown>; children: Item[]; parent?: ListValue }
function normalize(items: unknown[], parent?: ListValue): Item[] {
    return items.map((item, index) => {
        const value = getItemField(item, props.itemValue, item && typeof item === 'object' ? `${parent ?? 'root'}:${index}` : item ?? index) as ListValue;
        const title = String(getItemField(item, props.itemTitle, typeof item === 'object' ? '' : item ?? '') ?? '');
        const itemProperties = props.itemProps === true && item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'children')) : typeof props.itemProps === 'boolean' ? {} : getItemField(item, props.itemProps, {});
        const children = getItemField(item, props.itemChildren, []);
        return { raw: item, value, title, type: String(getItemField(item, props.itemType, 'item')), props: itemProperties && typeof itemProperties === 'object' ? itemProperties as Record<string, unknown> : {}, children: Array.isArray(children) ? normalize(children, value) : [], parent };
    });
}
const normalizedItems = computed(() => normalize(props.items ?? []));
const registrations = new Map<symbol, { value: ListValue; parent?: ListValue; branch: boolean; disabled: () => boolean }>();
const registrationVersion = ref(0);
const tree = computed(() => {
    registrationVersion.value;
    const children = new Map<ListValue, ListValue[]>(); const parents = new Map<ListValue, ListValue>(); const disabled = new Set<ListValue>(); const flat: Item[] = [];
    function visit(items: Item[]) { for (const item of items) { flat.push(item); if (item.parent !== undefined) parents.set(item.value, item.parent); if (item.props.disabled) disabled.add(item.value); if (item.children.length) { children.set(item.value, item.children.map(child => child.value)); visit(item.children); } } }
    visit(normalizedItems.value);
    for (const item of registrations.values()) {
        if (item.parent !== undefined) { parents.set(item.value, item.parent); const values = children.get(item.parent) ?? []; if (!values.includes(item.value)) children.set(item.parent, [...values, item.value]); }
        if (item.branch && !children.has(item.value)) children.set(item.value, []);
        if (item.disabled()) disabled.add(item.value);
    }
    return { children, parents, disabled, flat };
});
const strategy = computed(() => createSelectStrategy<ListValue>(props.selectStrategy ?? (props.multiple ? 'independent' : 'single-leaf'), props.mandatory));
const openStrategy = computed(() => createOpenStrategy<ListValue>(props.openStrategy));
function path(value: ListValue) { const result = [value]; const seen = new Set<ListValue>(result); while (tree.value.parents.has(result[0])) { const parent = tree.value.parents.get(result[0])!; if (seen.has(parent)) break; seen.add(parent); result.unshift(parent); } return result; }
function change(value: ListValue, source: 'select' | 'activate') {
    if (props.disabled || props.readonly || tree.value.disabled.has(value)) return;
    if (source === 'activate') { const next = toggleListValue(activated.value, value, props.multiple, props.mandatory); localActivated.value = next; emit('update:activated', next); return; }
    const { children, parents, disabled } = tree.value;
    const state = strategy.value.in(selected.value, children, parents, disabled);
    const on = state.get(value) !== 'on';
    const next = strategy.value.out(strategy.value.select({ id: value, value: on, selected: state, children, parents, disabled }), children, parents, disabled);
    localSelected.value = next; emit('update:modelValue', next); emit('update:selected', next); emit('click:select', { id: value, value: on, path: path(value) });
    const nextOpened = openStrategy.value.select?.({ id: value, value: on, opened: new Set(opened.value), parents });
    if (nextOpened) setOpened([...nextOpened]);
}
function setOpened(next: ListValue[]) { localOpened.value = next; emit('update:opened', next); }
function toggleOpen(value: ListValue) {
    if (props.disabled || props.readonly || tree.value.disabled.has(value)) return;
    const on = !opened.value.includes(value);
    const next = openStrategy.value.open({ id: value, value: on, opened: new Set(opened.value), parents: tree.value.parents });
    if (next) setOpened([...next]);
    emit('click:open', { id: value, value: on, path: path(value) });
}
const context = makeListContext({ root: () => element.value, nav: () => props.nav, selected: () => selected.value, activated: () => activated.value, opened: () => opened.value, select: value => { if (props.selectable) change(value, 'select'); }, activate: value => { if (props.activatable) change(value, 'activate'); }, toggleOpen });
Object.assign(context, { disabled: () => props.disabled, readonly: () => props.readonly, register: (value: ListValue, parent: ListValue | undefined, branch: boolean, disabled: () => boolean) => { const key = Symbol(); registrations.set(key, { value, parent, branch, disabled }); registrationVersion.value++; return () => { registrations.delete(key); registrationVersion.value++; }; } });
provideList(context);
function filtered(items: Item[]): Item[] { const query = props.filterable ? (props.search ?? '').toLocaleLowerCase() : ''; if (!query) return items; return items.flatMap(item => { const children = filtered(item.children); const match = props.customFilter ? props.customFilter(item.title, query, item.raw) : item.title.toLocaleLowerCase().includes(query); return match || children.length ? [{ ...item, children }] : []; }); }
function renderItems(items = filtered(normalizedItems.value)): ReturnType<typeof h>[] {
    return items.map(item => {
        if (item.type === 'divider') return h(UDivider, { ...item.props, key: String(item.value) });
        if (item.type === 'subheader') return h(UListSubheader, { ...item.props, key: String(item.value) }, () => slots.subheader?.({ item: item.raw, props: item.props }) ?? item.title);
        const index = tree.value.flat.findIndex(entry => entry.value === item.value);
        const itemProps = { value: item.value, title: item.title, ...item.props, 'data-list-index': index, onFocus: () => { navigationIndex.value = index; if (props.navigationStrategy === 'track' && props.selectable && !selected.value.includes(item.value)) change(item.value, 'select'); } };
        if (item.children.length) return h(UListGroup, { ...itemProps, key: String(item.value), modelValue: !!props.search && props.filterable || opened.value.includes(item.value) }, { default: () => renderItems(item.children), ...(slots['group-activator'] ? { activator: (scope: unknown) => slots['group-activator']!({ item: item.raw, props: scope }) } : {}) });
        return h(UListItem, { ...itemProps, key: String(item.value) }, { ...(slots.item ? { title: () => slots.item!({ item: item.raw, index, props: itemProps }) } : {}), ...(slots.prepend ? { prepend: () => slots.prepend!({ item: item.raw, index }) } : {}), ...(slots.append ? { append: () => slots.append!({ item: item.raw, index }) } : {}) });
    });
}
const renderList = () => renderItems();
watch(navigationIndex, index => { if (index < 0) return; const node = element.value?.querySelector<HTMLElement>(`[data-ui-list-item][data-list-index="${index}"]:not([aria-disabled="true"])`); if (node && document.activeElement !== node) node.focus(); });
defineExpose({ element, focus: context.focus, select: (value: ListValue) => change(value, 'select'), open: toggleOpen });
</script>

<template>
    <div ref="element" class="ui-list" :role="props.nav ? 'navigation' : 'listbox'" :aria-multiselectable="props.multiple || undefined"><slot :selected="selected" :activated="activated" :opened="opened"><component :is="renderList" /></slot></div>
</template>
