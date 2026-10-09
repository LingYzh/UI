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
import UDivider from './UDivider.vue';
import UListSubheader from './UListSubheader.vue';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
import { buildNestedIndex, createOpenStrategy, createSelectStrategy, type NestedSelectStrategy, type NestedSelectionState, type SelectStrategyFactory, type SelectStrategyInput } from './nested-strategies';
import { defaultValueComparator, type ItemProperty, type ValueComparator } from './selection';
import { filterTreeviewNodes, modelValuesToTreeviewIds, resolveTreeviewItemProps, treeviewIdsToModelValues, type TreeviewFilterNode, type TreeviewFilterFunction } from './treeview-state';

type Item = unknown;
type TreeviewActiveStrategyName = 'single-independent' | 'independent' | 'leaf' | 'single-leaf';
type TreeviewActiveStrategyInput = TreeviewActiveStrategyName | NestedSelectStrategy<unknown> | SelectStrategyFactory<unknown>;
interface Node {
    id: unknown;
    raw: unknown;
    item: Item;
    value: unknown;
    title: string;
    type: string;
    parent: unknown | undefined;
    depth: number;
    disabled: boolean;
    props: Record<string, unknown>;
    hasChildren: boolean;
    children: Node[];
    index: number;
    domKey: string;
}

interface TreeviewRegistrationIndex {
    children: Map<unknown, unknown[]>;
    parents: Map<unknown, unknown>;
    disabled: Set<unknown>;
    registered: Set<unknown>;
}

const rawProps = withDefaults(defineProps<{
    items?: Item[];
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
    activeStrategy?: TreeviewActiveStrategyInput;
    openOnClick?: boolean;
    selectStrategy?: SelectStrategyInput<unknown>;
    itemsRegistration?: 'props' | 'render';
    returnObject?: boolean;
    valueComparator?: ValueComparator;
    search?: string;
    filterKeys?: ItemProperty | ItemProperty[];
    filterMode?: 'some' | 'every' | 'union' | 'intersection';
    customFilter?: TreeviewFilterFunction;
    customKeyFilter?: Readonly<Record<string, TreeviewFilterFunction>>;
    ignoreAccents?: boolean | 'query' | 'target';
    noFilter?: boolean;
    itemType?: ItemProperty;
    openAll?: boolean;
    loadChildren?: (item: unknown) => readonly unknown[] | void | Promise<readonly unknown[] | void>;
    hideNoData?: boolean;
    noDataText?: string;
    disabled?: boolean;
    readonly?: boolean;
} & { ripple?: RippleOptions }>(), {
    items: () => [],
    ripple: true,
    activated: undefined,
    itemTitle: 'title',
    itemValue: 'value',
    itemChildren: 'children',
    itemType: 'type',
    itemProps: 'props',
    openOnClick: undefined,
    activeStrategy: 'single-independent',
    itemsRegistration: 'render',
    selectable: false,
    multiple: false,
    mandatory: false,
    activatable: false,
    returnObject: false,
    search: '',
    openAll: false,
    noFilter: false,
    hideNoData: false,
    noDataText: '$vuetify.noDataText',
    disabled: false,
    readonly: false
});
const props = useDefaults(rawProps, 'UTreeview');
const emit = defineEmits<{
    'update:modelValue': [value: unknown[]];
    'update:selected': [value: unknown[]];
    'update:opened': [value: unknown[]];
    'update:activated': [value: unknown[]];
    'click:open': [value: { id: unknown; value: boolean; path: unknown[]; event?: Event }];
    'click:select': [value: { id: unknown; value: boolean; path: unknown[]; event?: Event }];
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

function currentItemType(item: Item) {
    return String(getItemField(item, props.itemType!, 'item') ?? 'item');
}

function isPresentationItemType(type: string) {
    return type === 'divider' || type === 'subheader';
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
        getChildren: (item) => isPresentationItemType(currentItemType(item)) ? undefined : itemChildren(item),
        isDisabled: (item) => {
            const selectedProps = currentItemProps(item);
            return isPresentationItemType(currentItemType(item)) || Boolean(props.disabled || (selectedProps.disabled ?? getItemField(item, 'disabled', false)));
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
        const type = currentItemType(item);
        const node: Node = {
            id: value,
            raw: item,
            item,
            value,
            title: String(title ?? ''),
            type,
            parent: entry.parent,
            depth: entry.depth,
            disabled: entry.disabled,
            props: propsForItem,
            children: [],
            hasChildren: !isPresentationItemType(type) && index.children.has(value),
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
    const index = registrationIndex.value;
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
let seenOpenAllBranches = new Set<unknown>();
watch([allNodes, () => props.openAll, () => props.opened !== undefined], () => {
    if (!props.openAll || props.opened !== undefined) {
        seenOpenAllBranches = new Set();
        return;
    }

    const branchIds = new Set(allNodes.value.filter((node) => node.hasChildren).map((node) => node.id));
    const newlyAdded = [...branchIds].filter((id) => !seenOpenAllBranches.has(id));
    const currentIds = modelValuesToTreeviewIds(allNodes.value, localOpened.value, modelValueForNode, comparator.value);
    const next = new Set(currentIds.filter((id) => !seenOpenAllBranches.has(id) || branchIds.has(id)));
    newlyAdded.forEach((id) => next.add(id));
    seenOpenAllBranches = branchIds;

    const nextValues = valuesForIds([...next]);
    const unchanged = nextValues.length === localOpened.value.length
        && nextValues.every((value, index) => comparator.value(value, localOpened.value[index]));
    if (!unchanged) {
        localOpened.value = nextValues;
    }
    newlyAdded.forEach((id) => {
        const node = nodeById.value.get(id);
        if (node) void requestChildren(node);
    });
}, { immediate: true, flush: 'sync' });
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
const activeStrategy = computed(() => createSelectStrategy<unknown>(props.activeStrategy ?? 'single-independent', props.mandatory));
const activatedState = computed<Map<unknown, NestedSelectionState>>(() => {
    const index = registrationIndex.value;
    return activeStrategy.value.in(activatedIds.value, index.children, index.parents, index.disabled);
});

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
    customFilter: props.customFilter,
    customKeyFilter: props.customKeyFilter,
    filterMode: props.filterMode,
    ignoreAccents: props.ignoreAccents,
    noFilter: props.noFilter
}));
const searchActive = computed(() => !props.noFilter && (Boolean(props.search?.trim()) || Object.keys(props.customKeyFilter ?? {}).length > 0));
const expandedIds = computed(() => new Set([...openedIds.value, ...filterState.value.expanded]));
const visible = computed<Node[]>(() => {
    const result: Node[] = [];
    const byId = nodeById.value;
    const visit = (ids: readonly unknown[]) => {
        for (const id of ids) {
            const node = byId.get(id);
            if (!node || searchActive.value && !filterState.value.visible.has(id)) continue;
            result.push(node);
            if (expandedIds.value.has(id)) visit(node.children.map((child) => child.id));
        }
    };
    visit(nestedIndex.value.roots);
    return result;
});

const registrationIndex = computed<TreeviewRegistrationIndex>(() => {
    if (props.itemsRegistration === 'props') {
        const index = nestedIndex.value;
        return {
            children: index.children,
            parents: index.parents,
            disabled: index.disabled,
            registered: new Set(index.nodes.keys())
        };
    }

    const registeredNodes = visible.value.filter((node) => !isPresentationItemType(node.type));
    const registered = new Set(registeredNodes.map((node) => node.id));
    const children = new Map<unknown, unknown[]>();
    const parents = new Map<unknown, unknown>();
    const disabled = new Set<unknown>();

    for (const node of registeredNodes) {
        // Keep a rendered branch classified as a branch while its descendants are collapsed or filtered out.
        if (node.hasChildren) children.set(node.id, []);
        if (node.disabled) disabled.add(node.id);
        if (node.parent !== undefined && registered.has(node.parent)) {
            parents.set(node.id, node.parent);
            children.get(node.parent)?.push(node.id);
        }
    }

    return { children, parents, disabled, registered };
});
const hasVisibleTreeItems = computed(() => visible.value.some((node) => !isPresentationItemType(node.type)));
const noDataLabel = computed(() => {
    const key = props.noDataText ?? '$vuetify.noDataText';
    const translated = locale.t(key);
    return key.startsWith('$vuetify.') && translated === key ? locale.t('common.empty') : translated;
});

function state(node: Node): 'checked' | 'mixed' | 'unchecked' {
    const value = selectState.value.get(node.id);
    return value === 'on' ? 'checked' : value === 'indeterminate' ? 'mixed' : 'unchecked';
}

function nodeIsOpen(node: Node) {
    return expandedIds.value.has(node.id);
}

function nodeIsActivated(node: Node) {
    return activatedState.value.get(node.id) === 'on';
}

function valuesForIds(ids: readonly unknown[]) {
    return treeviewIdsToModelValues(allNodes.value, ids, modelValueForNode);
}

function itemPath(id: unknown) {
    const path = [id];
    const seen = new Set(path);
    let node = nodeById.value.get(id);
    while (node?.parent !== undefined && !seen.has(node.parent)) {
        path.unshift(node.parent);
        seen.add(node.parent);
        node = nodeById.value.get(node.parent);
    }
    return path;
}

function itemSlotProps(node: Node) {
    const selectedState = state(node);
    return {
        item: node.item,
        internalItem: node,
        index: node.index,
        title: node.title,
        props: node.props,
        path: itemPath(node.id),
        selectedState,
        isSelected: selectedState === 'checked',
        isIndeterminate: selectedState === 'mixed',
        isOpen: nodeIsOpen(node),
        isActivated: nodeIsActivated(node),
        disabled: node.disabled || props.disabled,
        hasChildren: node.hasChildren,
        loading: isLoading(node),
        error: loadError(node),
        open: openForSlot(node),
        select: selectForSlot(node),
        activate: () => toggleActivated(node),
        toggleOpen: (event?: Event) => toggleOpen(node, event)
    };
}

function commitSelection(map: Map<unknown, NestedSelectionState>) {
    const index = registrationIndex.value;
    const ids = selectStrategy.value.out(map, index.children, index.parents, index.disabled);
    const values = valuesForIds(ids);
    localSelected.value = values;
    emit('update:modelValue', values);
    emit('update:selected', values);
}

function selectNode(id: unknown, selected = true, event?: Event) {
    const node = nodeById.value.get(id);
    if (!node || !registrationIndex.value.registered.has(id) || node.disabled || props.disabled || props.readonly || !props.selectable) return;
    const index = registrationIndex.value;
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
    emit('click:select', { id, value: selected, path: itemPath(id), ...(event ? { event } : {}) });
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

function setOpened(id: unknown, value: boolean, event?: Event) {
    const node = nodeById.value.get(id);
    if (!node || !node.hasChildren || node.disabled || props.disabled) return;
    if (openedIds.value.includes(id) === value) return;
    const index = nestedIndex.value;
    const opened = new Set(openedIds.value);
    const next = openStrategy.open({ id, value, opened, parents: index.parents });
    if (next.size !== opened.size || [...next].some((entry) => !opened.has(entry))) commitOpened(next);
    emit('click:open', { id, value, path: itemPath(id), ...(event ? { event } : {}) });
    if (value) void requestChildren(node);
}

function openForSlot(node: Node) {
    return (value: boolean, event?: Event) => setOpened(node.id, value, event);
}

function selectForSlot(node: Node) {
    return (value = true, event?: Event) => selectNode(node.id, value, event);
}

function toggleOpen(node: Node, event?: Event) {
    if (!node.hasChildren || node.disabled || props.disabled) return;
    setOpened(node.id, !openedIds.value.includes(node.id), event);
}

function open(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) setOpened(id, true);
}

function close(value: unknown) {
    const id = resolveNodeId(value);
    if (id !== undefined) setOpened(id, false);
}

function setActivated(node: Node, active: boolean) {
    if (!props.activatable || !registrationIndex.value.registered.has(node.id) || node.disabled || props.disabled || props.readonly) return;
    const index = registrationIndex.value;
    const next = activeStrategy.value.select({
        id: node.id,
        value: active,
        selected: activatedState.value,
        children: index.children,
        parents: index.parents,
        disabled: index.disabled
    });
    if (next.size === activatedState.value.size && [...next].every(([key, value]) => activatedState.value.get(key) === value)) return;
    const ids = activeStrategy.value.out(next, index.children, index.parents, index.disabled);
    const values = valuesForIds(ids);
    localActivated.value = values;
    emit('update:activated', values);
}

function toggleActivated(node: Node) {
    setActivated(node, !nodeIsActivated(node));
}

function activate(value: unknown, active?: boolean) {
    const id = resolveNodeId(value);
    const node = id === undefined ? undefined : nodeById.value.get(id);
    if (node) setActivated(node, active ?? !nodeIsActivated(node));
}

const shouldOpenOnClick = computed(() => props.openOnClick ?? (props.selectable && !props.activatable));

function handleRowClick(node: Node, event?: MouseEvent) {
    if (node.disabled || props.disabled || event && isNestedControlEvent(event, event.currentTarget as HTMLElement)) return;
    toggleActivated(node);
    if (node.hasChildren && shouldOpenOnClick.value) {
        toggleOpen(node, event);
        return;
    }
    if (props.selectable) selectNode(node.id, state(node) !== 'checked', event);
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

function expandSiblings(node: Node, event?: Event) {
    const siblingIds = node.parent === undefined
        ? nestedIndex.value.roots
        : nestedIndex.value.children.get(node.parent) ?? [];
    const index = nestedIndex.value;
    const opened = new Set(openedIds.value);
    let next = new Set(opened);
    const toLoad: Node[] = [];
    for (const id of siblingIds) {
        const sibling = nodeById.value.get(id);
        if (!sibling?.hasChildren || sibling.disabled || props.disabled) continue;
        next = openStrategy.open({ id, value: true, opened: next, parents: index.parents });
        toLoad.push(sibling);
    }
    if (next.size !== openedIds.value.length || [...next].some((id) => !openedIds.value.includes(id))) commitOpened(next);
    toLoad.forEach((sibling) => {
        if (!opened.has(sibling.id) && next.has(sibling.id)) {
            emit('click:open', { id: sibling.id, value: true, path: itemPath(sibling.id), ...(event ? { event } : {}) });
        }
    });
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
        expandSiblings(node, event);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (node.props.to || node.props.href) { currentElement.click(); return; }
        toggleActivated(node);
        if (node.hasChildren) toggleOpen(node, event);
        else if (props.selectable) selectNode(node.id, state(node) !== 'checked', event);
    } else if (event.key === ' ') {
        event.preventDefault();
        const name = typeof strategyInput.value === 'string' ? strategyInput.value : '';
        const branchSelectable = !['leaf', 'single-leaf'].includes(name);
        if (props.selectable && (!node.hasChildren || branchSelectable)) selectNode(node.id, state(node) !== 'checked', event);
        else if (node.hasChildren) toggleOpen(node, event);
    }
}

function setCheckboxIndeterminate(element: unknown, node: Node) {
    if (element instanceof HTMLInputElement) element.indeterminate = state(node) === 'mixed';
}

function handleCheckboxChange(node: Node, event: Event) {
    selectNode(node.id, (event.currentTarget as HTMLInputElement).checked, event);
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
            <template v-for="node in visible" :key="node.domKey">
                <UDivider v-if="node.type === 'divider' && $slots.divider" v-bind="node.props">
                    <slot name="divider" v-bind="itemSlotProps(node)" />
                </UDivider>
                <UDivider v-else-if="node.type === 'divider'" v-bind="node.props" />
                <UListSubheader v-else-if="node.type === 'subheader' && $slots.subheader" v-bind="node.props">
                    <slot name="subheader" v-bind="itemSlotProps(node)">{{ node.title }}</slot>
                </UListSubheader>
                <UListSubheader v-else-if="node.type === 'subheader'" v-bind="node.props">{{ node.title }}</UListSubheader>
                <div v-else class="ui-treeview-branch">
                    <UiLinkSurface
                        v-bind="node.props"
                        class="ui-treeview-item"
                        :class="{ 'is-active': nodeIsActivated(node) }"
                        :disabled="node.disabled || props.disabled"
                        :aria-level="node.depth + 1"
                        :aria-expanded="node.hasChildren ? nodeIsOpen(node) : undefined"
                        :aria-selected="state(node) === 'checked'"
                        :aria-disabled="node.disabled || props.disabled"
                        :aria-busy="isLoading(node) ? 'true' : undefined"
                        :style="{ paddingInlineStart: `${node.depth * 20 + 8}px` }"
                        :tabindex="node.disabled || props.disabled ? -1 : 0"
                        :data-treeview-index="node.index"
                        role="treeitem"
                        v-focus-modality
                        v-ripple="props.ripple"
                        @click="handleRowClick(node, $event)"
                        @keydown="keydown($event, node)"
                    >
                        <slot name="item" v-bind="itemSlotProps(node)">
                            <span v-if="$slots.prepend" class="ui-treeview-prepend">
                                <slot name="prepend" v-bind="itemSlotProps(node)" />
                            </span>
                            <button
                                v-if="node.hasChildren"
                                v-ripple="props.ripple"
                                v-pointer-blur
                                type="button"
                                class="ui-treeview-toggle"
                                :disabled="node.disabled || props.disabled"
                                :aria-label="nodeIsOpen(node) ? 'Collapse' : 'Expand'"
                                :aria-expanded="nodeIsOpen(node)"
                                @click.stop.prevent="toggleOpen(node, $event)"
                            >
                                <slot name="toggle" v-bind="itemSlotProps(node)">
                                    <Icon name="mdi-chevron-right" :size="18" class="ui-disclosure-icon" :class="{ 'is-open': nodeIsOpen(node) }" />
                                </slot>
                            </button>
                            <span v-else class="ui-treeview-spacer" />
                            <span v-if="props.selectable" class="ui-selection-ripple is-checkbox" v-ripple.center.circle="props.ripple">
                                <input
                                    type="checkbox"
                                    :checked="state(node) === 'checked'"
                                    :disabled="node.disabled || props.disabled || props.readonly"
                                    :aria-label="node.title"
                                    :ref="(element) => setCheckboxIndeterminate(element, node)"
                                    @click.stop
                                    @change="handleCheckboxChange(node, $event)"
                                />
                            </span>
                            <span class="ui-treeview-title">
                                <slot
                                    name="title"
                                    v-bind="itemSlotProps(node)"
                                    :item="node.item"
                                    :title="node.title"
                                    :internalItem="node"
                                    :selectedState="state(node)"
                                    :isSelected="state(node) === 'checked'"
                                    :isIndeterminate="state(node) === 'mixed'"
                                    :disabled="node.disabled"
                                    :hasChildren="node.hasChildren"
                                    :loading="isLoading(node)"
                                    :error="loadError(node)"
                                    :open="openForSlot(node)"
                                    :select="selectForSlot(node)"
                                >
                                    {{ node.title }}
                                </slot>
                            </span>
                            <span v-if="$slots.append" class="ui-treeview-append">
                                <slot name="append" v-bind="itemSlotProps(node)" />
                            </span>
                            <span v-if="$slots.loader && (isLoading(node) || loadError(node))" class="ui-treeview-loader">
                                <slot name="loader" v-bind="itemSlotProps(node)" />
                            </span>
                            <span v-if="$slots.actions" class="ui-treeview-actions">
                                <slot name="actions" v-bind="itemSlotProps(node)" />
                            </span>
                        </slot>
                    </UiLinkSurface>
                </div>
            </template>
        </TransitionGroup>
        <div v-if="!hasVisibleTreeItems && !props.hideNoData" class="ui-treeview-empty" role="status">
            <slot name="no-data" :search="props.search ?? ''">{{ noDataLabel }}</slot>
        </div>
    </div>
</template>
