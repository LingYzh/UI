import type { ItemProperty, ValueComparator } from './selection';

export interface TreeviewFilterNode<Id = unknown> {
    id: Id;
    parent: Id | undefined;
    children: readonly Id[];
    raw: unknown;
}

export interface TreeviewFilterOptions<Id = unknown> {
    nodes: readonly TreeviewFilterNode<Id>[];
    query: string;
    filterKeys: readonly ItemProperty[];
    getField: (item: unknown, key: ItemProperty) => unknown;
    customFilter?: (value: unknown, query: string, item: unknown) => unknown;
}

export interface TreeviewFilterState<Id = unknown> {
    matched: Set<Id>;
    visible: Set<Id>;
    expanded: Set<Id>;
}

export function filterTreeviewNodes<Id>(options: TreeviewFilterOptions<Id>): TreeviewFilterState<Id> {
    const { nodes, query, filterKeys, getField, customFilter } = options;
    const matched = new Set<Id>();
    const visible = new Set<Id>();
    const expanded = new Set<Id>();
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
        nodes.forEach((node) => visible.add(node.id));
        return { matched, visible, expanded };
    }

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const match = (value: unknown, item: unknown) => {
        if (customFilter) {
            const result = customFilter(value, normalizedQuery, item);
            return result !== false && result !== -1 && result !== null && result !== undefined;
        }
        if (value === null || value === undefined) return false;
        return String(value).toLocaleLowerCase().includes(normalizedQuery.toLocaleLowerCase());
    };

    for (const node of nodes) {
        if (filterKeys.some((key) => match(getField(node.raw, key), node.raw))) matched.add(node.id);
    }

    const addDescendants = (id: Id, visited: Set<Id>) => {
        if (visited.has(id)) return;
        visited.add(id);
        const node = byId.get(id);
        if (!node) return;
        visible.add(id);
        if (node.children.length) expanded.add(id);
        for (const child of node.children) addDescendants(child, visited);
    };

    for (const id of matched) {
        const visitedAncestors = new Set<Id>([id]);
        let current = byId.get(id);
        visible.add(id);
        while (current?.parent !== undefined && !visitedAncestors.has(current.parent)) {
            const parent = current.parent;
            visitedAncestors.add(parent);
            visible.add(parent);
            expanded.add(parent);
            current = byId.get(parent);
        }
        if (byId.get(id)?.children.length) addDescendants(id, new Set());
    }

    return { matched, visible, expanded };
}

export function resolveTreeviewItemProps(item: unknown, selector: ItemProperty | boolean | undefined): Record<string, unknown> {
    if (selector === false) return {};
    let selected: unknown;
    if (selector === true) {
        if (item === null || typeof item !== 'object') return {};
        selected = Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'children'));
    } else {
        const field = selector ?? 'props';
        selected = typeof field === 'function'
            ? field(item)
            : getItemField(item, field);
    }
    return selected !== null && typeof selected === 'object' ? { ...selected as Record<string, unknown> } : {};
}

export function getItemField(item: unknown, field: string, fallback?: unknown): unknown {
    if (item === null || typeof item !== 'object') return fallback;
    let value: unknown = item;
    for (const segment of field.split('.')) {
        if (value === null || typeof value !== 'object') return fallback;
        value = (value as Record<string, unknown>)[segment];
    }
    return value === undefined ? fallback : value;
}

export function modelValuesToTreeviewIds<Id>(
    nodes: readonly TreeviewFilterNode<Id>[],
    values: readonly unknown[],
    getModelValue: (node: TreeviewFilterNode<Id>) => unknown,
    comparator: ValueComparator
): Id[] {
    const ids: Id[] = [];
    for (const value of values) {
        const node = nodes.find((candidate) => comparator(getModelValue(candidate), value));
        if (node && !ids.some((id) => id === node.id)) ids.push(node.id);
    }
    return ids;
}

export function treeviewIdsToModelValues<Id>(
    nodes: readonly TreeviewFilterNode<Id>[],
    ids: readonly Id[],
    getModelValue: (node: TreeviewFilterNode<Id>) => unknown
): unknown[] {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    return ids.flatMap((id) => {
        const node = byId.get(id);
        return node ? [getModelValue(node)] : [];
    });
}
