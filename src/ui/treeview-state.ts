import type { ItemProperty, ValueComparator } from './selection';
import { findMatchRanges } from '@vuetify/v0/utilities';
import type { SelectionFilterMode } from './autocomplete-props';

export type TreeviewFilterFunction = (value: unknown, query: string, item: unknown) => unknown;

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
    customFilter?: TreeviewFilterFunction;
    customKeyFilter?: Readonly<Record<string, TreeviewFilterFunction>>;
    filterMode?: SelectionFilterMode;
    ignoreAccents?: boolean | 'query' | 'target';
    noFilter?: boolean;
}

export interface TreeviewFilterState<Id = unknown> {
    matched: Set<Id>;
    visible: Set<Id>;
    expanded: Set<Id>;
}

export function filterTreeviewNodes<Id>(options: TreeviewFilterOptions<Id>): TreeviewFilterState<Id> {
    const { nodes, query, filterKeys, getField, customFilter, customKeyFilter = {} } = options;
    const matched = new Set<Id>();
    const visible = new Set<Id>();
    const expanded = new Set<Id>();
    const normalizedQuery = query.trim();
    const customFilterCount = Object.keys(customKeyFilter).length;

    if (options.noFilter || !normalizedQuery && !customFilterCount) {
        nodes.forEach((node) => visible.add(node.id));
        return { matched, visible, expanded };
    }

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const matchResult = (result: unknown) => {
        if (result === false || result === -1 || result === null || result === undefined) return false;
        return !Array.isArray(result) || result.length > 0;
    };
    const defaultMatch = (value: unknown) => {
        if (value === null || value === undefined) return false;
        if (!normalizedQuery) return true;
        const ranges = findMatchRanges(String(value), normalizedQuery, {
            ignoreCase: true,
            ignoreAccents: options.ignoreAccents ?? false,
            matchAll: true
        });
        return ranges.length > 0;
    };

    for (const node of nodes) {
        if (!filterKeys.length) continue;
        let defaultMatches = 0;
        let customMatches = 0;
        let allKeysMatch = true;

        for (const key of filterKeys) {
            const customKey = typeof key === 'string' ? customKeyFilter[key] : undefined;
            const value = getField(node.raw, key);
            const result = customKey
                ? customKey(value, normalizedQuery, node.raw)
                : customFilter
                    ? customFilter(value, normalizedQuery, node.raw)
                    : defaultMatch(value);
            const isMatch = matchResult(result);

            if (!isMatch) {
                allKeysMatch = false;
                if (options.filterMode === 'every') break;
                continue;
            }

            if (customKey) customMatches++;
            else defaultMatches++;
        }

        const mode = options.filterMode ?? 'intersection';
        const isMatched = options.filterMode === 'every'
            ? allKeysMatch
            : mode === 'some'
                ? defaultMatches + customMatches > 0
                : mode === 'union'
                    ? defaultMatches + customMatches > 0 && (customMatches === customFilterCount || defaultMatches > 0)
                    : defaultMatches + customMatches > 0
                        && customMatches === customFilterCount
                        && (defaultMatches > 0 || filterKeys.length === customFilterCount);

        if (isMatched) matched.add(node.id);
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
