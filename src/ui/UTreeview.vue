<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import { isNestedControlEvent } from './action-events';
import Icon from '../components/Icon.vue';
import UiLinkSurface from './UiLinkSurface.vue';
import { useReducedMotion } from './motion';
import { useExpandMotion } from './expand-motion';
import { vPointerBlur } from './pointer-focus';
import { getItemField } from './list-completion';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
import { buildNestedIndex, createOpenStrategy, createSelectStrategy, type NestedSelectionState, type SelectStrategyInput } from './nested-strategies';
import { defaultValueComparator, type ItemProperty, type ValueComparator } from './selection';
import { filterTreeviewNodes, modelValuesToTreeviewIds, resolveTreeviewItemProps, treeviewIdsToModelValues, type TreeviewFilterNode } from './treeview-state';

type Item = unknown;
interface Node {
    id: unknown;
    raw: unknown;
    item: Item;
    value: unknown;
    title: string;
    parent: unknown | undefined;
    depth: number;
    disabled: boolean;
    props: Record<string, unknown>;
    hasChildren: boolean;
    children: Node[];
    index: number;
    domKey: string;
}

const rawProps = withDefaults(defineProps<{
    items: Item[];
    modelValue?: unknown[];
    selected?: unknown[];
    opened?: unknown[];
    activated?: unknown[] | unknown | null;
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    itemChildren?: ItemProperty;
    itemProps?: ItemProperty | boolean;
    selectable?: boolean;
    multiple?: boolean;
    mandatory?: boolean;
    activatable?: boolean;
    openOnClick?: boolean;
    selectStrategy?: SelectStrategyInput<unknown>;
    returnObject?: boolean;
    valueComparator?: ValueComparator;
    search?: string;
    filterKeys?: ItemProperty | ItemProperty[];
    customFilter?: (value: unknown, query: string, item: unknown) => unknown;
    loadChildren?: (item: unknown) => readonly unknown[] | void | Promise<readonly unknown[] | void>;
    disabled?: boolean;
    readonly?: boolean;
} & { ripple?: RippleOptions }>(), {
    ripple: true,
    activated: undefined,
    itemTitle: 'title',
    itemValue: 'value',
    itemChildren: 'children',
    itemProps: 'props',
    openOnClick: undefined,
    selectable: false,
    multiple: false,
    mandatory: false,
    activatable: false,
    returnObject: false,
    search: '',
    disabled: false,
    readonly: false
});
const props = useDefaults(rawProps, 'UTreeview');
const emit = defineEmits<{
    'update:modelValue': [value: unknown[]];
    'update:selected': [value: unknown[]];
    'update:opened': [value: unknown[]];
    'update:activated': [value: unknown[]];
}>();

const localSelected = ref<unknown[]>([]);
const localOpened = ref<unknown[]>([]);
const localActivated = ref<unknown[]>([]);
const root = ref<HTMLElement>();
const revision = ref(0);
const pendingLoads = ref(new Set<unknown>());
const loadErrors = ref(new Map<unknown, unknown>());
const loadedChildrenByItem = new Map<Item, readonly unknown[]>();
const loadedItems = new Set<Item>();
const loadRequests = new Map<unknown, { token: number; item: Item }>();
const objectKeys = new WeakMap<object, string>();
let objectKeySequence = 0;
let loadTokenSequence = 0;
let unmounted = false;

const reduced = useReducedMotion();
const motion = useExpandMotion(() => reduced.value);
const locale = useLocale();
const openStrategy = createOpenStrategy<unknown>('multiple');

function currentItemProps(item: Item) {
    return resolveTreeviewItemProps(item, props.itemProps);
}

function itemValue(item: Item, index: number, parent: unknown | undefined) {
    const fallback = `${parent === undefined ? 'root' : String(parent)}:${index}`;
    return getItemField(item, props.itemValue!, fallback);
}

function itemChildren(item: Item): readonly unknown[] | undefined {
    const loadedChildren = loadedChildrenByItem.get(item);
    if (loadedChildren !== undefined) return loadedChildren.length ? loadedChildren : undefined;
    const rawChildren = getItemField(item, props.itemChildren!, undefined);
    if (!Array.isArray(rawChildren)) return undefined;
    if (loadedItems.has(item) && rawChildren.length === 0) return undefined;
    return rawChildren;
}

function stableDomKey(value: unknown, item: Item, index: number) {
    const keySource = item !== null && (typeof item === 'object' || typeof item === 'function') ? item as object : undefined;
    if (keySource) {
        let key = objectKeys.get(keySource);
        if (!key) {
            key = `object:${++objectKeySequence}`;
            objectKeys.set(keySource, key);
        }
        return key;
    }
    return `${typeof value}:${String(value)}:${index}`;
}

const nestedIndex = computed(() => {
    revision.value;
    return buildNestedIndex<Item, unknown>(props.items, {
        getId: (item, index, parent) => itemValue(item, index, parent),
        getChildren: (item) => itemChildren(item),
        isDisabled: (item) => {
            const selectedProps = currentItemProps(item);
            return Boolean(props.disabled || (selectedProps.disabled ?? getItemField(item, 'disabled', false)));
        },
        inheritDisabled: true
    });
});

const allNodes = computed<Node[]>(() => {
    const index = nestedIndex.value;
    const byId = new Map<unknown, Node>();
    const nodes = index.flat.map((entry, position) => {
        const item = entry.raw;
        const propsForItem = currentItemProps(item);
        const value = entry.id;
        const title = getItemField(item, props.itemTitle!, value);
        const node: Node = {
            id: value,
            raw: item,
            item,
            value,
            title: String(title ?? ''),
            parent: entry.parent,
            depth: entry.depth,
            disabled: entry.disabled,
            props: propsForItem,
            children: [],
            hasChildren: index.children.has(value),
            index: position,
            domKey: stableDomKey(value, item, position)
        };
        byId.set(value, node);
        return node;
    });
    for (const node of nodes) {
        node.children = (index.children.get(node.id) ?? []).flatMap((id) => {
            const child = byId.get(id);
            return child ? [child] : [];
        });
    }
    return nodes;
});

const nodeById = computed(() => new Map(allNodes.value.map((node) => [node.id, node])));
const comparator = computed(() => props.valueComparator ?? defaultValueComparator);
const modelValueForNode = (node: TreeviewFilterNode<unknown>) => props.returnObject ? node.raw : node.id;
const normalizedSelection = computed(() => {
    const model = props.selected !== undefined
        ? props.selected
        : props.modelValue !== undefined ? props.modelValue : localSelected.value;
    return Array.isArray(model) ? model : model == null ? [] : [model];
});
const selectedIds = computed(() => modelValuesToTreeviewIds(
    allNodes.value,
    normalizedSelection.value,
    modelValueForNode,
    comparator.value
));

const strategyInput = computed<SelectStrategyInput<unknown>>(() => props.selectStrategy ?? (props.multiple ? 'legacy-cascade' : 'single-leaf'));
const selectStrategy = computed(() => createSelectStrategy<unknown>(strategyInput.value, props.mandatory));
const selectState = computed<Map<unknown, NestedSelectionState>>(() => {
    const index = nestedIndex.value;
    return selectStrategy.value.in(selectedIds.value, index.children, index.parents, index.disabled);
});
const multiSelectable = computed(() => {
    const input = props.selectStrategy;
    if (typeof input === 'string') return input !== 'single-independent' && input !== 'single-leaf';
    if (input !== undefined) return true;
    return props.multiple;
});

const openedModel = computed(() => props.opened ?? localOpened.value);
const openedValues = computed(() => Array.isArray(openedModel.value) ? openedModel.value : []);
const openedIds = computed(() => modelValuesToTreeviewIds(
    allNodes.value,
    openedValues.value,
    modelValueForNode,
    comparator.value
));
const activatedModel = computed(() => props.activated !== undefined ? props.activated : localActivated.value);
const activatedValues = computed(() => {
    const value = activatedModel.value;
    return Array.isArray(value) ? value : value == null ? [] : [value];
});
const activatedIds = computed(() => modelValuesToTreeviewIds(
    allNodes.value,
    activatedValues.value,
    modelValueForNode,
    comparator.value
));

const filterKeys = computed<ItemProperty[]>(() => {
    const configured = props.filterKeys;
    if (Array.isArray(configured)) return configured;
    if (configured !== undefined) return [configured];
    return [props.itemTitle ?? 'title'];
});
const filterState = computed(() => filterTreeviewNodes({
    nodes: allNodes.value,
    query: props.search ?? '',
    filterKeys: filterKeys.value,
    getField: (item, key) => typeof key === 'function' ? key(item) : getItemField(item, key, undefined),
    customFilter: props.customFilter
}));
const expandedIds = computed(() => new Set([...openedIds.value, ...filterState.value.expanded]));
const visible = computed<Node[]>(() => {
    const result: Node[] = [];
    const byId = nodeById.value;
    const searchActive = Boolean(props.search?.trim());
    const visit = (ids: readonly unknown[]) => {
        for (const id of ids) {
            const node = byId.get(id);
            if (!node || searchActive && !filterState.value.visible.has(id)) continue;
            result.push(node);
            if (expandedIds.value.has(id)) visit(node.children.map((child) => child.id));
        }
    };
    visit(nestedIndex.value.roots);
    return result;
});

function state(node: Node): 'checked' | 'mixed' | 'unchecked' {
    const value = selectState.value.get(node.id);
    return value === 'on' ? 'checked' : value === 'indeterminate' ? 'mixed' : 'unchecked';
}

function nodeIsOpen(node: Node) {
    return expandedIds.value.has(node.id);
}

function valuesForIds(ids: readonly unknown[]) {
    return treeviewIdsToModelValues(allNodes.value, ids, modelValueForNode);
}

function commitSelection(map: Map<unknown, NestedSelectionState>) {
    const index = nestedIndex.value;
    const ids = selectStrategy.value.out(map, index.children, index.parents, index.disabled);
    const values = valuesForIds(ids);
    localSelected.value = values;
    emit('update:modelValue', values);
    emit('update:selected', values);
}

function selectNode(id: unknown, selected = true) {
    const node = nodeById.value.get(id);
    if (!node || node.disabled || props.disabled || props.readonly || !props.selectable) return;
    const index = nestedIndex.value;
    const next = selectStrategy.value.select({
        id,
        value: selected,
        selected: selectState.value,
        children: index.children,
        parents: index.parents,
        disabled: index.disabled
    });
    if (next.size === selectState.value.size && [...next].every(([key, value]) => selectState.value.get(key) === value)) return;
    commitSelection(next);
}

function resolveNodeId(value: unknown) {
    const node = allNodes.value.find((entry) => comparator.value(modelValueForNode(entry), value) || comparator.value(entry.id, value));
    return node?.id;
}

function select(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) selectNode(id, true);
}

function unselect(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) selectNode(id, false);
}

function toggleSelection(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) selectNode(id, state(nodeById.value.get(id)!) !== 'checked');
}

function commitOpened(ids: Iterable<unknown>) {
    const values = valuesForIds([...new Set(ids)]);
    localOpened.value = values;
    emit('update:opened', values);
}

function isCurrentLoad(id: unknown, request: { token: number; item: Item }) {
    const activeRequest = loadRequests.get(id);
    return !unmounted
        && activeRequest?.token === request.token
        && allNodes.value.some((node) => node.id === id && node.item === request.item);
}

function updatePending(id: unknown, pending: boolean) {
    const next = new Set(pendingLoads.value);
    if (pending) next.add(id);
    else next.delete(id);
    pendingLoads.value = next;
}

async function requestChildren(node: Node) {
    const loader = props.loadChildren;
    const rawChildren = getItemField(node.item, props.itemChildren!, undefined);
    if (!loader || !node.hasChildren || !Array.isArray(rawChildren) || rawChildren.length !== 0 || loadedItems.has(node.item) || pendingLoads.value.has(node.id)) return;

    const request = { token: ++loadTokenSequence, item: node.item };
    loadRequests.set(node.id, request);
    updatePending(node.id, true);
    const nextErrors = new Map(loadErrors.value);
    nextErrors.delete(node.id);
    loadErrors.value = nextErrors;
    revision.value++;

    try {
        const loaded = await loader(node.item);
        if (!isCurrentLoad(node.id, request)) return;
        if (Array.isArray(loaded)) loadedChildrenByItem.set(node.item, loaded);
        loadedItems.add(node.item);
        const errors = new Map(loadErrors.value);
        errors.delete(node.id);
        loadErrors.value = errors;
    } catch (error) {
        if (isCurrentLoad(node.id, request)) {
            const errors = new Map(loadErrors.value);
            errors.set(node.id, error);
            loadErrors.value = errors;
        }
    } finally {
        if (isCurrentLoad(node.id, request)) {
            loadRequests.delete(node.id);
            updatePending(node.id, false);
            revision.value++;
        }
    }
}

function setOpened(id: unknown, value: boolean) {
    const node = nodeById.value.get(id);
    if (!node || !node.hasChildren || node.disabled || props.disabled) return;
    const index = nestedIndex.value;
    const opened = new Set(openedIds.value);
    const next = openStrategy.open({ id, value, opened, parents: index.parents });
    if (next.size !== opened.size || [...next].some((entry) => !opened.has(entry))) commitOpened(next);
    if (value) void requestChildren(node);
}

function openForSlot(node: Node) {
    return (value: boolean) => setOpened(node.id, value);
}

function selectForSlot(node: Node) {
    return (value: boolean) => selectNode(node.id, value);
}

function toggleOpen(node: Node) {
    if (!node.hasChildren || node.disabled || props.disabled) return;
    setOpened(node.id, !openedIds.value.includes(node.id));
}

function open(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) setOpened(id, true);
}

function close(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) setOpened(id, false);
}

function setActivated(node: Node) {
    if (!props.activatable || node.disabled || props.disabled || props.readonly) return;
    const values = [props.returnObject ? node.item : node.id];
    localActivated.value = values;
    emit('update:activated', values);
}

function activate(value: unknown) {
    const id = resolveNodeId(value);
    const node = id === undefined ? undefined : nodeById.value.get(id);
    if (node) setActivated(node);
}

const shouldOpenOnClick = computed(() => props.openOnClick ?? (props.selectable && !props.activatable));

function handleRowClick(node: Node, event?: MouseEvent) {
    if (node.disabled || props.disabled || event && isNestedControlEvent(event, event.currentTarget as HTMLElement)) return;
    setActivated(node);
    if (node.hasChildren && shouldOpenOnClick.value) {
        toggleOpen(node);
        return;
    }
    if (props.selectable) selectNode(node.id, state(node) !== 'checked');
}

function isLoading(node: Node) {
    return pendingLoads.value.has(node.id);
}

function loadError(node: Node) {
    return loadErrors.value.get(node.id);
}

function enterBranch(element: Element, done: () => void) {
    element.removeAttribute('inert');
    element.removeAttribute('aria-hidden');
    motion.enter(element, done);
}

function leaveBranch(element: Element, done: () => void) {
    element.setAttribute('inert', '');
    element.setAttribute('aria-hidden', 'true');
    motion.leave(element, done);
}

function keyboardItems(): HTMLElement[] {
    return [...(root.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])]
        .filter((element) => element.getAttribute('aria-disabled') !== 'true' && !element.closest('[inert]') && !element.closest('[aria-hidden="true"]'));
}

function focusNode(id: unknown) {
    const node = nodeById.value.get(id);
    if (!node || node.disabled || props.disabled) return;
    root.value?.querySelector<HTMLElement>(`[data-treeview-index="${node.index}"]`)?.focus();
}

function focus(value?: unknown) {
    if (value === undefined) {
        focusFirst();
        return;
    }
    const id = resolveNodeId(value);
    if (id !== undefined) focusNode(id);
}

function focusFirst() {
    keyboardItems()[0]?.focus();
}

function focusLast() {
    keyboardItems().at(-1)?.focus();
}

async function focusFirstChild(node: Node) {
    const child = node.children.find((entry) => !entry.disabled);
    if (!child) return;
    await nextTick();
    focusNode(child.id);
}

function focusParent(node: Node) {
    if (node.parent !== undefined) focusNode(node.parent);
}

function expandSiblings(node: Node) {
    const siblingIds = node.parent === undefined
        ? nestedIndex.value.roots
        : nestedIndex.value.children.get(node.parent) ?? [];
    const index = nestedIndex.value;
    let next = new Set(openedIds.value);
    const toLoad: Node[] = [];
    for (const id of siblingIds) {
        const sibling = nodeById.value.get(id);
        if (!sibling?.hasChildren || sibling.disabled || props.disabled) continue;
        next = openStrategy.open({ id, value: true, opened: next, parents: index.parents });
        toLoad.push(sibling);
    }
    if (next.size !== openedIds.value.length || [...next].some((id) => !openedIds.value.includes(id))) commitOpened(next);
    toLoad.forEach((sibling) => void requestChildren(sibling));
}

function keydown(event: KeyboardEvent, node: Node) {
    if (isNestedControlEvent(event, event.currentTarget as HTMLElement) || node.disabled || props.disabled) return;
    const elements = keyboardItems();
    const currentElement = event.currentTarget as HTMLElement;
    const currentIndex = elements.indexOf(currentElement);
    if (currentIndex < 0) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? elements.length - 1 : Math.max(0, Math.min(elements.length - 1, currentIndex + (event.key === 'ArrowDown' ? 1 : -1)));
        elements[next]?.focus();
        return;
    }

    const expandKey = locale.isRtl.value ? 'ArrowLeft' : 'ArrowRight';
    const collapseKey = locale.isRtl.value ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === expandKey && node.hasChildren) {
        event.preventDefault();
        if (!openedIds.value.includes(node.id)) toggleOpen(node);
        else void focusFirstChild(node);
    } else if (event.key === collapseKey) {
        event.preventDefault();
        if (openedIds.value.includes(node.id)) toggleOpen(node);
        else focusParent(node);
    } else if (event.key === '*') {
        event.preventDefault();
        expandSiblings(node);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (node.props.to || node.props.href) { currentElement.click(); return; }
        setActivated(node);
        if (node.hasChildren) toggleOpen(node);
        else if (props.selectable) selectNode(node.id, state(node) !== 'checked');
    } else if (event.key === ' ') {
        event.preventDefault();
        const name = typeof strategyInput.value === 'string' ? strategyInput.value : '';
        const branchSelectable = !['leaf', 'single-leaf'].includes(name);
        if (props.selectable && (!node.hasChildren || branchSelectable)) selectNode(node.id, state(node) !== 'checked');
        else if (node.hasChildren) toggleOpen(node);
    }
}

function setCheckboxIndeterminate(element: unknown, node: Node) {
    if (element instanceof HTMLInputElement) element.indeterminate = state(node) === 'mixed';
}

function handleCheckboxChange(node: Node, event: Event) {
    selectNode(node.id, (event.currentTarget as HTMLInputElement).checked);
}

watch(() => allNodes.value.map((node) => ({ id: node.id, item: node.item })), (entries) => {
    const isLive = (id: unknown, item: Item) => entries.some((entry) => entry.id === id && entry.item === item);
    const liveItems = new Set(entries.map((entry) => entry.item));
    for (const item of loadedChildrenByItem.keys()) {
        if (!liveItems.has(item)) loadedChildrenByItem.delete(item);
    }
    for (const item of loadedItems) {
        if (!liveItems.has(item)) loadedItems.delete(item);
    }
    for (const [id, request] of loadRequests) {
        if (!isLive(id, request.item)) {
            loadRequests.delete(id);
            updatePending(id, false);
            const errors = new Map(loadErrors.value);
            errors.delete(id);
            loadErrors.value = errors;
        }
    }
}, { flush: 'sync' });

onBeforeUnmount(() => {
    unmounted = true;
    loadRequests.clear();
    loadedChildrenByItem.clear();
    loadedItems.clear();
    pendingLoads.value = new Set();
    loadErrors.value = new Map();
});

defineExpose({
    focus,
    focusFirst,
    focusLast,
    select,
    unselect,
    toggleSelection,
    activate,
    open,
    close,
    toggleOpen: (value: unknown) => {
        const id = resolveNodeId(value);
        const node = id === undefined ? undefined : nodeById.value.get(id);
        if (node) toggleOpen(node);
    }
});
</script>

<template>
    <div ref="root" class="ui-treeview" role="tree" :aria-multiselectable="multiSelectable" :aria-readonly="props.readonly">
        <TransitionGroup :css="false" @enter="enterBranch" @leave="leaveBranch" @enter-cancelled="motion.cancel" @leave-cancelled="motion.cancel">
            <div v-for="node in visible" :key="node.domKey" class="ui-treeview-branch">
                <UiLinkSurface v-bind="node.props" :disabled="node.disabled || props.disabled" v-focus-modality v-ripple="props.ripple" class="ui-treeview-item" :class="{ 'is-active': activatedIds.includes(node.id) }" role="treeitem" :data-treeview-index="node.index" :aria-level="node.depth + 1" :aria-expanded="node.hasChildren ? nodeIsOpen(node) : undefined" :aria-selected="state(node) === 'checked'" :aria-disabled="node.disabled || props.disabled" :aria-busy="isLoading(node) ? 'true' : undefined" :style="{ paddingInlineStart: `${node.depth * 20 + 8}px` }" :tabindex="node.disabled || props.disabled ? -1 : 0" @click="handleRowClick(node, $event)" @keydown="keydown($event, node)">
                    <button v-ripple="props.ripple" v-if="node.hasChildren" v-pointer-blur type="button" class="ui-treeview-toggle" :disabled="node.disabled || props.disabled" :aria-label="nodeIsOpen(node) ? 'Collapse' : 'Expand'" :aria-expanded="nodeIsOpen(node)" @click.stop.prevent="toggleOpen(node)"><Icon name="mdi-chevron-right" :size="18" class="ui-disclosure-icon" :class="{ 'is-open': nodeIsOpen(node) }" /></button><span v-else class="ui-treeview-spacer" />
                    <span v-if="props.selectable" class="ui-selection-ripple is-checkbox" v-ripple.center.circle="props.ripple"><input type="checkbox" :checked="state(node) === 'checked'" :disabled="node.disabled || props.disabled || props.readonly" :aria-label="node.title" :ref="(element) => setCheckboxIndeterminate(element, node)" @click.stop @change="handleCheckboxChange(node, $event)" /></span>
                    <span class="ui-treeview-title"><slot name="title" :item="node.item" :title="node.title" :internalItem="node" :selectedState="state(node)" :isSelected="state(node) === 'checked'" :isIndeterminate="state(node) === 'mixed'" :disabled="node.disabled" :hasChildren="node.hasChildren" :loading="isLoading(node)" :error="loadError(node)" :open="openForSlot(node)" :select="selectForSlot(node)">{{ node.title }}</slot></span>
                </UiLinkSurface>
            </div>
        </TransitionGroup>
    </div>
</template>
