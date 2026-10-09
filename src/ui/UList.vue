<script setup lang="ts">
import { computed, Fragment, h, inject, nextTick, ref, useId, useSlots, watch } from 'vue';
import { menuContextKey } from './menu';
import type { ValueComparator } from './selection';
import { defaultValueComparator } from './selection';
import UListItem from './UListItem.vue';
import UListGroup from './UListGroup.vue';
import UListSubheader from './UListSubheader.vue';
import UDivider from './UDivider.vue';
import {
    canonicalizeListValue,
    canonicalizeListValues,
    getItemField,
    makeListContext,
    provideList,
    type ListNavigationStrategy,
    type ListRegistrationInput,
    type ListRegistrationView,
    type ListValue
} from './list-completion';
import { createOpenStrategy, createSelectStrategy, type SelectStrategyName, type OpenStrategyName } from './nested-strategies';
import { isNestedControlEvent } from './action-events';
import { useDefaults } from './defaults';

type ActiveStrategyName = 'independent' | 'single-independent' | 'leaf' | 'single-leaf';
type ChangeSource = 'select' | 'activate';
type Item = {
    raw: unknown;
    value: ListValue;
    title: string;
    type: string;
    props: Record<string, unknown>;
    children: Item[];
    parent?: ListValue;
    index: number;
    key: string;
};
type ItemChangePayload = { id: ListValue; value: boolean; path: ListValue[]; event?: Event };

const rawProps = withDefaults(defineProps<{
    id?: string;
    modelValue?: ListValue | ListValue[];
    selected?: ListValue[];
    activated?: ListValue | ListValue[];
    opened?: ListValue[];
    multiple?: boolean;
    mandatory?: boolean;
    selectable?: boolean;
    activatable?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    nav?: boolean;
    items?: unknown[];
    itemTitle?: string | ((item: unknown) => unknown);
    itemValue?: string | ((item: unknown) => unknown);
    itemProps?: string | boolean | ((item: unknown) => unknown);
    itemChildren?: string | ((item: unknown) => unknown);
    itemType?: string | ((item: unknown) => unknown);
    selectStrategy?: SelectStrategyName;
    activeStrategy?: ActiveStrategyName;
    openStrategy?: OpenStrategyName;
    navigationStrategy?: ListNavigationStrategy;
    valueComparator?: ValueComparator;
    filterable?: boolean;
    search?: string;
    customFilter?: (value: string, query: string, item: unknown) => boolean;
}>(), {
    id: undefined,
    modelValue: undefined,
    selected: undefined,
    activated: undefined,
    opened: undefined,
    multiple: false,
    mandatory: false,
    selectable: false,
    activatable: false,
    disabled: false,
    readonly: false,
    nav: false,
    itemTitle: 'title',
    itemValue: 'value',
    itemProps: 'props',
    itemChildren: 'children',
    itemType: 'type',
    openStrategy: 'list',
    navigationStrategy: 'focus',
    filterable: false
});
const props = useDefaults(rawProps, 'UList');
const menu = inject(menuContextKey, undefined);
const emit = defineEmits<{
    'update:modelValue': [value: ListValue[]];
    'update:selected': [value: ListValue[]];
    'update:activated': [value: ListValue[]];
    'update:opened': [value: ListValue[]];
    'click:select': [value: ItemChangePayload];
    'click:activate': [value: ItemChangePayload];
    'click:open': [value: ItemChangePayload];
}>();

const navigationIndex = defineModel<number>('navigationIndex', { default: -1 });
const slots = useSlots();
const generatedId = useId();
const listId = computed(() => props.id ?? `ui-list-${generatedId}`);
const element = ref<HTMLElement>();
const localSelected = ref<ListValue[]>([]);
const localActivated = ref<ListValue[]>([]);
const localOpened = ref<ListValue[]>([]);
const registrations = new Map<symbol, ListRegistrationInput>();
const registrationVersion = ref(0);

function valuesOf(value: ListValue | ListValue[] | undefined): ListValue[] {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

const selected = computed(() => props.selected ?? (props.modelValue === undefined ? localSelected.value : valuesOf(props.modelValue)));
const activated = computed(() => props.activated === undefined ? localActivated.value : valuesOf(props.activated));
const opened = computed(() => props.opened ?? localOpened.value);
const comparator = computed(() => props.valueComparator ?? defaultValueComparator);

function normalize(items: unknown[], parent: ListValue | undefined, path: string, canonicalValues: ListValue[], nextIndex: { value: number }): Item[] {
    return items.map((raw, index) => {
        const fallback = raw && typeof raw === 'object' ? `${parent ?? 'root'}:${index}` : raw ?? index;
        const rawValue = getItemField(raw, props.itemValue!, fallback) as ListValue;
        const value = canonicalizeListValue(rawValue, canonicalValues, comparator.value);
        if (!canonicalValues.some((candidate) => comparator.value(candidate, value))) canonicalValues.push(value);

        const titleValue = getItemField(raw, props.itemTitle!, raw && typeof raw === 'object' ? '' : raw ?? '');
        const itemProperties = props.itemProps === true && raw && typeof raw === 'object'
            ? Object.fromEntries(Object.entries(raw).filter(([key]) => key !== 'children'))
            : typeof props.itemProps === 'boolean'
                ? {}
                : getItemField(raw, props.itemProps!, {});
        const rawChildren = getItemField(raw, props.itemChildren!, []);
        const itemIndex = nextIndex.value++;
        const key = path ? `${path}-${index}` : String(index);
        const item: Item = {
            raw,
            value,
            title: String(titleValue ?? ''),
            type: String(getItemField(raw, props.itemType!, 'item')),
            props: itemProperties && typeof itemProperties === 'object' ? itemProperties as Record<string, unknown> : {},
            children: [],
            parent,
            index: itemIndex,
            key
        };
        item.children = Array.isArray(rawChildren)
            ? normalize(rawChildren, value, key, canonicalValues, nextIndex)
            : [];
        return item;
    });
}

const normalizedItems = computed(() => normalize(props.items ?? [], undefined, '', [], { value: 0 }));

function flatten(items: Item[], target: Item[] = []): Item[] {
    for (const item of items) {
        target.push(item);
        flatten(item.children, target);
    }
    return target;
}

const tree = computed(() => {
    registrationVersion.value;
    const values: ListValue[] = [];
    const children = new Map<ListValue, ListValue[]>();
    const parents = new Map<ListValue, ListValue>();
    const disabled = new Set<ListValue>();
    const flat = flatten(normalizedItems.value);

    function canonical(value: ListValue): ListValue {
        const index = values.findIndex((candidate) => comparator.value(candidate, value));
        if (index >= 0) return values[index];
        values.push(value);
        return value;
    }

    function visit(items: Item[]): void {
        for (const item of items) {
            const value = canonical(item.value);
            const parent = item.parent === undefined ? undefined : canonical(item.parent);
            if (parent !== undefined) parents.set(value, parent);
            if (item.props.disabled) disabled.add(value);
            if (item.children.length) {
                children.set(value, item.children.map((child) => canonical(child.value)));
                visit(item.children);
            }
        }
    }
    visit(normalizedItems.value);

    for (const registration of registrations.values()) {
        const value = canonical(registration.value);
        if (registration.parent !== undefined) {
            const parent = canonical(registration.parent);
            parents.set(value, parent);
            const valuesForParent = children.get(parent) ?? [];
            if (!valuesForParent.some((child) => comparator.value(child, value))) children.set(parent, [...valuesForParent, value]);
        }
        if (registration.kind === 'group' && !children.has(value)) children.set(value, []);
        if (registration.disabled()) disabled.add(value);
    }

    if (props.disabled) for (const value of values) disabled.add(value);
    return { children, parents, disabled, flat, values };
});

const strategy = computed(() => createSelectStrategy<ListValue>(props.selectStrategy ?? (props.multiple ? 'independent' : 'single-leaf'), props.mandatory));
const activeStrategy = computed(() => createSelectStrategy<ListValue>(props.activeStrategy ?? 'single-independent', props.mandatory));
const openStrategy = computed(() => createOpenStrategy<ListValue>(props.openStrategy));

function canonical(value: ListValue): ListValue {
    return canonicalizeListValue(value, tree.value.values, comparator.value);
}

function normalizedSelection(values: ListValue[]): ListValue[] {
    return canonicalizeListValues(values, tree.value.values, comparator.value);
}

function isSelected(value: ListValue): boolean {
    const { children, parents, disabled } = tree.value;
    return strategy.value.in(normalizedSelection(selected.value), children, parents, disabled).get(canonical(value)) === 'on';
}

function isActive(value: ListValue): boolean {
    const id = canonical(value);
    const { children, parents, disabled } = tree.value;
    return activeStrategy.value.in(normalizedSelection(activated.value), children, parents, disabled).get(id) === 'on';
}

function isOpen(value: ListValue): boolean {
    return opened.value.some((entry) => comparator.value(entry, canonical(value)));
}

function path(value: ListValue): ListValue[] {
    const result = [canonical(value)];
    const seen = new Set<ListValue>(result);
    while (tree.value.parents.has(result[0])) {
        const parent = tree.value.parents.get(result[0])!;
        if (seen.has(parent)) break;
        seen.add(parent);
        result.unshift(parent);
    }
    return result;
}

function eventPayload(value: ListValue, on: boolean, event?: Event): ItemChangePayload {
    return { id: canonical(value), value: on, path: path(value), event };
}

function change(value: ListValue, source: ChangeSource, on?: boolean, event?: Event): void {
    const id = canonical(value);
    if (props.disabled || props.readonly || tree.value.disabled.has(id)) return;

    if (source === 'activate') {
        const { children, parents, disabled } = tree.value;
        const state = activeStrategy.value.in(normalizedSelection(activated.value), children, parents, disabled);
        const nextOn = on ?? state.get(id) !== 'on';
        const next = activeStrategy.value.out(
            activeStrategy.value.select({ id, value: nextOn, selected: state, children, parents, disabled }),
            children,
            parents,
            disabled
        );
        localActivated.value = next;
        emit('update:activated', next);
        emit('click:activate', eventPayload(id, nextOn, event));
        return;
    }

    const { children, parents, disabled } = tree.value;
    const state = strategy.value.in(normalizedSelection(selected.value), children, parents, disabled);
    const nextOn = on ?? state.get(id) !== 'on';
    const next = strategy.value.out(
        strategy.value.select({ id, value: nextOn, selected: state, children, parents, disabled }),
        children,
        parents,
        disabled
    );
    localSelected.value = next;
    emit('update:modelValue', next);
    emit('update:selected', next);
    emit('click:select', eventPayload(id, nextOn, event));

    const nextOpened = openStrategy.value.select?.({ id, value: nextOn, opened: new Set(normalizedSelection(opened.value)), parents });
    if (nextOpened) setOpened([...nextOpened]);
}

function setOpened(next: ListValue[]): void {
    localOpened.value = next;
    emit('update:opened', next);
}

function toggleOpen(value: ListValue, on?: boolean, event?: Event): void {
    const id = canonical(value);
    if (props.disabled || props.readonly || tree.value.disabled.has(id)) return;
    const currentOpened = normalizedSelection(opened.value);
    const wasOpen = currentOpened.some((entry) => comparator.value(entry, id));
    const nextOn = on ?? !wasOpen;
    const next = openStrategy.value.open({ id, value: nextOn, opened: new Set(currentOpened), parents: tree.value.parents });
    setOpened([...next]);
    emit('click:open', eventPayload(id, nextOn, event));
}

function itemScope(item: Item) {
    return {
        isActive: isActive(item.value),
        isSelected: isSelected(item.value),
        isOpen: isOpen(item.value),
        isDisabled: props.disabled || !!item.props.disabled,
        isReadonly: props.readonly,
        isFocused: rowId(item) === activeDescendant.value,
        select: (on?: boolean, event?: Event) => change(item.value, 'select', on, event),
        activate: (on?: boolean, event?: Event) => change(item.value, 'activate', on, event),
        open: (on?: boolean, event?: Event) => toggleOpen(item.value, on, event)
    };
}

function rowId(item: Item): string {
    return `${listId.value}-item-${item.key}`;
}

function onFullRowClick(item: Item, event: MouseEvent): void {
    const row = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    if (row && isNestedControlEvent(event, row)) return;
    if (props.selectable) change(item.value, 'select', undefined, event);
    if (props.activatable) change(item.value, 'activate', undefined, event);
}

function onRowKeydown(event: KeyboardEvent): void {
    // Menu is the sole owner of roving keys, including full-row slot listeners.
    if (menu?.ownsNavigation() && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const row = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    if (!row || isNestedControlEvent(event, row)) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        context.focus(event.key === 'ArrowDown' ? 1 : -1, row);
    } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        context.focus(event.key === 'Home' ? 'first' : 'last');
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        row.click();
    }
}

function rowProps(item: Item, fullRow = false): Record<string, unknown> {
    const state = itemScope(item);
    const disabled = state.isDisabled;
    const role = props.nav ? undefined : 'option';
    const result: Record<string, unknown> = {
        ...item.props,
        id: rowId(item),
        value: item.value,
        title: item.title,
        disabled: !!item.props.disabled,
        selectable: props.selectable,
        activatable: props.activatable,
        role,
        tabindex: disabled ? -1 : props.navigationStrategy === 'track' ? -1 : 0,
        'aria-selected': role === 'option' ? state.isSelected : undefined,
        'aria-current': role === undefined && state.isActive ? 'page' : undefined,
        'aria-disabled': disabled || undefined,
        'data-list-index': item.index,
        'data-ui-list-navigation-item': '',
        'data-ui-list-tracked': state.isFocused || undefined,
        onFocus: (event: FocusEvent) => context.setNavigationIndexFor(event.currentTarget as HTMLElement)
    };
    if (fullRow) {
        result['data-ui-list-managed'] = '';
        result.onClick = (event: MouseEvent) => onFullRowClick(item, event);
        result.onKeydown = onRowKeydown;
    }
    return result;
}

function filterItems(items: Item[]): Item[] {
    const query = props.filterable ? (props.search ?? '').toLocaleLowerCase() : '';
    if (!query) return items;
    return items.flatMap((item) => {
        const children = filterItems(item.children);
        const matches = props.customFilter
            ? props.customFilter(item.title, query, item.raw)
            : item.title.toLocaleLowerCase().includes(query);
        return matches || children.length ? [{ ...item, children }] : [];
    });
}

function renderGroupActivator(item: Item, groupProps: Record<string, unknown>): unknown {
    const state = itemScope(item);
    const toggle = groupProps.onClick as ((event: MouseEvent) => void) | undefined;
    const fullProps: Record<string, unknown> = {
        ...groupProps,
        value: item.value,
        title: item.title,
        disabled: !!item.props.disabled,
        selectable: props.selectable,
        activatable: props.activatable,
        'data-ui-list-managed': '',
        'data-list-index': item.index,
        onClick: (event: MouseEvent) => {
            const row = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            if (row && isNestedControlEvent(event, row)) return;
            toggle?.(event);
            if (props.selectable) change(item.value, 'select', undefined, event);
            if (props.activatable) change(item.value, 'activate', undefined, event);
        },
        onKeydown: onRowKeydown
    };
    const slotProps = {
        item: item.raw,
        internalItem: item,
        index: item.index,
        isActive: state.isActive,
        isSelected: state.isSelected,
        isOpen: state.isOpen,
        isDisabled: state.isDisabled,
        isReadonly: state.isReadonly,
        select: state.select,
        activate: state.activate,
        open: state.open,
        props: fullProps
    };
    if (slots['group-activator']) return slots['group-activator']({ ...slotProps, props: groupProps });
    if (slots.item) return slots.item(slotProps);
    return undefined;
}

function renderItems(items = filterItems(normalizedItems.value)): ReturnType<typeof h>[] {
    return items.map((item) => {
        const state = itemScope(item);
        if (item.type === 'divider') return h(UDivider, { ...item.props, key: item.key });
        if (item.type === 'subheader') {
            return h(UListSubheader, { ...item.props, key: item.key }, () => slots.subheader?.({
                item: item.raw,
                internalItem: item,
                index: item.index,
                ...state
            }) ?? item.title);
        }

        const standardProps = rowProps(item, !!slots.item);
        if (item.children.length) {
            const groupSlots: Record<string, (scope?: unknown) => unknown> = {
                default: () => renderItems(item.children)
            };
            if (slots['group-activator'] || slots.item) {
                groupSlots.activator = (scope) => {
                    const record = scope as { props?: Record<string, unknown> };
                    return renderGroupActivator(item, record.props ?? {});
                };
            }
            return h(UListGroup, {
                ...item.props,
                key: item.key,
                id: `${listId.value}-group-${item.key}`,
                value: item.value,
                title: item.title,
                disabled: !!item.props.disabled,
                modelValue: props.filterable && !!props.search || isOpen(item.value)
            }, groupSlots);
        }

        const titleSlot = slots.title
            ? () => slots.title!({ item: item.raw, internalItem: item, index: item.index, ...state, props: standardProps })
            : undefined;
        const childSlots: Record<string, (() => unknown) | undefined> = {};
        if (titleSlot) childSlots.title = titleSlot;
        if (slots.subtitle) childSlots.subtitle = () => slots.subtitle!({ item: item.raw, internalItem: item, index: item.index, ...state, props: standardProps });
        if (slots.prepend) childSlots.prepend = () => slots.prepend!({ item: item.raw, internalItem: item, index: item.index, ...state, props: standardProps });
        if (slots.append) childSlots.append = () => slots.append!({ item: item.raw, internalItem: item, index: item.index, ...state, props: standardProps });

        if (slots.item) return h(Fragment, null, slots.item({ item: item.raw, internalItem: item, index: item.index, props: standardProps, ...state }));
        return h(UListItem, { ...standardProps, key: item.key }, childSlots);
    });
}

// Keep the fallback renderer component stable so registration refreshes do not remount every row.
const renderGeneratedItems = () => h(Fragment, null, renderItems());

function navigableRows(): HTMLElement[] {
    const root = element.value;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>('[data-ui-list-navigation-item]')]
        .filter((node) => node.closest('.ui-list') === root && node.id && node.getAttribute('aria-disabled') !== 'true' && !node.hasAttribute('disabled') && !node.closest('[inert], [aria-hidden="true"]') && node.getClientRects().length > 0);
}

const activeDescendant = computed(() => {
    normalizedItems.value;
    props.filterable;
    props.search;
    props.disabled;
    registrationVersion.value;
    opened.value;
    if (props.navigationStrategy !== 'track' || navigationIndex.value < 0) return undefined;
    return navigableRows()[navigationIndex.value]?.id;
});

function onRootFocusIn(event: FocusEvent): void {
    if (event.target === element.value) return;
    if (event.target instanceof HTMLElement) context.setNavigationIndexFor(event.target);
}

function onRootKeydown(event: KeyboardEvent): void {
    if (menu?.ownsNavigation() && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    if (props.navigationStrategy !== 'track' || event.target !== element.value) return;
    const root = element.value;
    if (!root || isNestedControlEvent(event, root)) return;
    const rows = navigableRows();
    if (!rows.length) return;
    const index = navigationIndex.value;
    let nextIndex: number | undefined;
    if (event.key === 'ArrowDown') nextIndex = index < 0 ? 0 : (index + 1) % rows.length;
    else if (event.key === 'ArrowUp') nextIndex = index < 0 ? rows.length - 1 : (index - 1 + rows.length) % rows.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = rows.length - 1;
    else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        rows[index]?.click();
        return;
    }
    if (nextIndex !== undefined) {
        event.preventDefault();
        navigationIndex.value = nextIndex;
    }
}

watch(navigationIndex, async (index) => {
    if (props.navigationStrategy !== 'focus' || index < 0) return;
    await nextTick();
    navigableRows()[index]?.focus();
});

function register(registration: ListRegistrationInput): () => void {
    const key = Symbol();
    registrations.set(key, registration);
    registrationVersion.value++;
    return () => {
        registrations.delete(key);
        registrationVersion.value++;
    };
}

function registrationSnapshot(): ListRegistrationView[] {
    registrationVersion.value;
    return [...registrations.values()].map((registration) => {
        const element = registration.getElement();
        const container = registration.getContainer?.();
        return {
            id: element?.id ?? container?.id ?? '',
            value: registration.value,
            parent: registration.parent,
            kind: registration.kind,
            disabled: registration.disabled(),
            element,
            container
        };
    });
}

const registrationContext = computed(() => ({
    root: element.value,
    registrations: registrationSnapshot(),
    navigationIndex: navigationIndex.value,
    activeDescendant: activeDescendant.value
}));

function getRegistration(value: ListValue, kind?: 'item' | 'group'): ListRegistrationView | undefined {
    return registrationSnapshot().find((entry) => (!kind || entry.kind === kind) && comparator.value(entry.value, value));
}

const context = makeListContext({
    nav: () => props.nav,
    navigationStrategy: () => props.navigationStrategy,
    root: () => element.value,
    navigationIndex: () => navigationIndex.value,
    setNavigationIndex: (index) => { navigationIndex.value = index; },
    selected: () => selected.value,
    activated: () => activated.value,
    opened: () => opened.value,
    isSelected,
    isActive,
    isOpen,
    trackedId: () => activeDescendant.value,
    select: (value, on, event) => { if (props.selectable) change(value, 'select', on, event); },
    activate: (value, on, event) => { if (props.activatable) change(value, 'activate', on, event); },
    toggleOpen,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
    register,
    refreshRegistrations: () => { registrationVersion.value++; }
});
provideList(context);

function focusAt(index: number): void {
    context.focusAt(index);
}

function select(value: ListValue, on?: boolean, event?: Event): void {
    change(value, 'select', on, event);
}

function open(value: ListValue, on?: boolean, event?: Event): void {
    toggleOpen(value, on, event);
}

function activate(value: ListValue, on?: boolean, event?: Event): void {
    change(value, 'activate', on, event);
}

defineExpose({
    element,
    selected,
    activated,
    opened,
    navigationIndex,
    registrationContext,
    getRegistrations: registrationSnapshot,
    getItem: (value: ListValue) => getRegistration(value, 'item'),
    getGroup: (value: ListValue) => getRegistration(value, 'group'),
    focus: context.focus,
    focusAt,
    select,
    activate,
    open
});
</script>

<template>
    <div
        :id="listId"
        ref="element"
        class="ui-list"
        :role="props.nav ? 'navigation' : 'listbox'"
        :aria-multiselectable="props.multiple || undefined"
        :aria-disabled="props.disabled || undefined"
        :aria-readonly="props.readonly || undefined"
        :aria-activedescendant="activeDescendant"
        :data-navigation-strategy="props.navigationStrategy"
        :tabindex="props.navigationStrategy === 'track' ? props.disabled ? -1 : 0 : undefined"
        @keydown="onRootKeydown"
        @focusin="onRootFocusIn"
    >
        <slot :selected="selected" :activated="activated" :opened="opened" :registration="registrationContext">
            <component :is="renderGeneratedItems" />
        </slot>
    </div>
</template>
