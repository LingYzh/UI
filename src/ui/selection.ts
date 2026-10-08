export type SelectionValue = string | number | boolean | null | Record<string, unknown>;
export type ItemProperty = string | ((item: unknown) => unknown);
export interface SelectionItem {
    title: string;
    value: unknown;
    raw: unknown;
    disabled: boolean;
    props: Record<string, unknown>;
    children?: SelectionItem[];
}
export interface SelectionItemsOptions {
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    itemProps?: ItemProperty | boolean;
}

type ComparisonCache = WeakMap<object, WeakMap<object, boolean>>;

function getPath(value: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, part) => current && typeof current === 'object'
        ? (current as Record<string, unknown>)[part] : undefined, value);
}

function property(item: unknown, selector: ItemProperty | undefined, fallback: unknown): unknown {
    if (typeof selector === 'function') return selector(item);
    if (typeof selector === 'string') return getPath(item, selector) ?? fallback;
    return fallback;
}

export function normalizeItems(items: readonly unknown[], options: SelectionItemsOptions = {}): SelectionItem[] {
    return items.map((raw) => {
        const object = raw !== null && typeof raw === 'object' ? raw as Record<string, unknown> : undefined;
        const title = property(raw, options.itemTitle ?? 'title', object?.label ?? object?.title ?? raw);
        const value = property(raw, options.itemValue ?? 'value', object?.value ?? raw);
        const itemProps = options.itemProps === undefined ? 'props' : options.itemProps;
        const selectedProps = itemProps === true
            ? object && 'children' in object ? Object.fromEntries(Object.entries(object).filter(([key]) => key !== 'children')) : object
            : itemProps === false ? undefined : property(raw, itemProps, undefined);
        const props = selectedProps && typeof selectedProps === 'object' ? { ...selectedProps as Record<string, unknown> } : {};
        const children = Array.isArray(object?.children) ? normalizeItems(object.children, options) : undefined;
        return { title: String(title ?? ''), value, raw, props, disabled: Boolean(props.disabled ?? object?.disabled), children };
    });
}

export type ValueComparator = (a: unknown, b: unknown) => boolean;

function findCachedComparison(a: object, b: object, cache: ComparisonCache): boolean | undefined {
    const direct = cache.get(a)?.get(b);
    if (typeof direct === 'boolean') return direct;
    const reverse = cache.get(b)?.get(a);
    return typeof reverse === 'boolean' ? reverse : undefined;
}

function deepEqual(a: unknown, b: unknown, cache: ComparisonCache): boolean {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date && a.getTime() !== b.getTime()) return false;
    if (a !== Object(a) || b !== Object(b)) return false;

    const left = a as object;
    const right = b as object;
    const keys = Object.keys(left);
    if (keys.length !== Object.keys(right).length) return false;

    const cached = findCachedComparison(left, right, cache);
    if (cached !== undefined) return cached;

    const leftPairs = cache.get(left);
    if (leftPairs) leftPairs.set(right, true);
    else cache.set(left, new WeakMap([[right, true]]));

    return keys.every(key => deepEqual(
        (left as Record<string, unknown>)[key],
        (right as Record<string, unknown>)[key],
        cache
    ));
}

export const defaultValueComparator: ValueComparator = (a, b) => deepEqual(a, b, new WeakMap());

export function selectedValue(item: SelectionItem, returnObject: boolean): unknown {
    return returnObject ? item.raw : item.value;
}

export function isSelected(model: unknown, item: SelectionItem, multiple: boolean, returnObject: boolean, comparator: ValueComparator = defaultValueComparator): boolean {
    const value = selectedValue(item, returnObject);
    return multiple ? Array.isArray(model) && model.some((entry) => comparator(entry, value)) : comparator(model, value);
}

export function toggleSelection(model: unknown, item: SelectionItem, multiple: boolean, returnObject: boolean, comparator: ValueComparator = defaultValueComparator, max?: number): unknown {
    const value = selectedValue(item, returnObject);
    if (!multiple) return value;
    const entries = Array.isArray(model) ? model : [];
    const index = entries.findIndex((entry) => comparator(entry, value));
    if (index >= 0) return entries.filter((_, entryIndex) => entryIndex !== index);
    if (max !== undefined && entries.length >= max) return entries;
    return [...entries, value];
}

export function toggleGroupSelection(model: unknown, value: unknown, options: { multiple?: boolean; mandatory?: boolean; max?: number; comparator?: ValueComparator } = {}): unknown {
    const compare = options.comparator ?? defaultValueComparator;
    if (!options.multiple) {
        if (options.mandatory && compare(model, value)) return model;
        return value;
    }
    const entries = Array.isArray(model) ? model : [];
    const index = entries.findIndex((entry) => compare(entry, value));
    if (index >= 0) return options.mandatory && entries.length === 1 ? entries : entries.filter((_, current) => current !== index);
    if (options.max !== undefined && entries.length >= options.max) return entries;
    return [...entries, value];
}

export function checkboxChecked(model: unknown, value: unknown, trueValue: unknown = true, comparator: ValueComparator = defaultValueComparator): boolean {
    return Array.isArray(model) ? model.some((entry) => comparator(entry, value)) : comparator(model, trueValue);
}

export function toggleCheckbox(model: unknown, checked: boolean, options: { value?: unknown; trueValue?: unknown; falseValue?: unknown; comparator?: ValueComparator } = {}): unknown {
    const compare = options.comparator ?? defaultValueComparator;
    if (!Array.isArray(model)) return checked ? options.trueValue ?? true : options.falseValue ?? false;
    const value = options.value;
    return checked ? model.some((entry) => compare(entry, value)) ? model : [...model, value]
        : model.filter((entry) => !compare(entry, value));
}

export function findSelection(items: readonly SelectionItem[], value: unknown, returnObject: boolean, comparator: ValueComparator = defaultValueComparator): SelectionItem | undefined {
    for (const item of items) {
        if (comparator(selectedValue(item, returnObject), value)) return item;
        const child = findSelection(item.children ?? [], value, returnObject, comparator);
        if (child) return child;
    }
    return undefined;
}
