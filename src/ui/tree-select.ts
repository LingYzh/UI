import { getItemProperty, type DataItem, type ItemProperty } from './data-pipeline';
import { defaultValueComparator, type ValueComparator } from './selection';

export interface TreeSelectItemOptions {
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    itemChildren?: ItemProperty;
    itemProps?: ItemProperty | boolean;
}

export interface TreeSelectItem {
    title: string;
    value: unknown;
    props: Record<string, unknown>;
    disabled: unknown;
    children?: TreeSelectItem[];
}

function getProperty(item: unknown, property: ItemProperty | undefined, fallback?: unknown): unknown {
    return getItemProperty(item as DataItem, property, fallback);
}

function allItemProps(item: unknown): Record<string, unknown> {
    if (item === null || typeof item !== 'object') return {};
    return Object.fromEntries(Object.entries(item as Record<string, unknown>).filter(([key]) => key !== 'children'));
}

function resolveItemProps(item: unknown, selector: ItemProperty | boolean | undefined): Record<string, unknown> {
    if (selector === false) return {};
    const selected = selector === true
        ? allItemProps(item)
        : getProperty(item, selector ?? 'props', undefined);
    return selected !== null && typeof selected === 'object' ? { ...selected as Record<string, unknown> } : {};
}

/** Map the public ItemProperty contract to UTreeview's canonical field names. */
export function mapTreeSelectItems(items: readonly unknown[] | undefined, options: TreeSelectItemOptions = {}): TreeSelectItem[] {
    function mapLevel(source: readonly unknown[], parentValue?: unknown): TreeSelectItem[] {
        return source.map((raw, index) => {
            const fallback = `${parentValue === undefined ? 'root' : String(parentValue)}:${index}`;
            const value = getProperty(raw, options.itemValue ?? 'value', fallback);
            const title = getProperty(raw, options.itemTitle ?? 'title', value);
            const rawChildren = getProperty(raw, options.itemChildren ?? 'children', undefined);
            return {
                title: String(title ?? ''),
                value,
                props: resolveItemProps(raw, options.itemProps),
                disabled: getProperty(raw, 'disabled', false),
                children: Array.isArray(rawChildren) ? mapLevel(rawChildren, value) : undefined
            };
        });
    }

    return mapLevel(Array.isArray(items) ? items : []);
}

export function findTreeSelectItem(
    items: readonly TreeSelectItem[],
    value: unknown,
    comparator: ValueComparator = defaultValueComparator
): TreeSelectItem | undefined {
    for (const item of items) {
        if (comparator(item.value, value)) return item;
        const nested = item.children?.length ? findTreeSelectItem(item.children, value, comparator) : undefined;
        if (nested) return nested;
    }
    return undefined;
}

export function treeSelectAncestors(
    items: readonly TreeSelectItem[],
    value: unknown,
    comparator: ValueComparator = defaultValueComparator
): unknown[] {
    function findPath(nodes: readonly TreeSelectItem[], ancestors: readonly unknown[]): unknown[] | undefined {
        for (const item of nodes) {
            if (comparator(item.value, value)) return [...ancestors];
            const nested = item.children?.length
                ? findPath(item.children, [...ancestors, item.value])
                : undefined;
            if (nested) return nested;
        }
        return undefined;
    }

    if (value === null || value === undefined) return [];
    return findPath(items, []) ?? [];
}

/** Preserve an unknown external ID in the trigger instead of rewriting its model. */
export function treeSelectDisplayValue(
    items: readonly TreeSelectItem[],
    value: unknown,
    comparator: ValueComparator = defaultValueComparator
): string | undefined {
    if (value === null || value === undefined) return undefined;
    const item = findTreeSelectItem(items, value, comparator);
    return item ? item.title : String(value);
}