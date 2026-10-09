import type { GroupValue } from './group-state';

export type StepperItemField = string | ((item: unknown) => unknown);
export type StepperItemPropsField = StepperItemField | boolean;

export interface StepperItemRecord {
    raw: unknown;
    title: string;
    value: GroupValue;
    props: Record<string, unknown>;
}

export interface StepperItemsOptions {
    itemTitle?: StepperItemField;
    itemValue?: StepperItemField;
    itemProps?: StepperItemPropsField;
}

function readPath(item: unknown, path: string): unknown {
    let value = item;
    for (const segment of path.split('.')) {
        if (value === null || typeof value !== 'object') return undefined;
        value = (value as Record<string, unknown>)[segment];
    }
    return value;
}

function readField(item: unknown, field: StepperItemField, fallback: unknown): unknown {
    const value = typeof field === 'function' ? field(item) : readPath(item, field);
    return value === undefined || value === null ? fallback : value;
}

function resolveItemValue(value: unknown, index: number): GroupValue {
    return typeof value === 'string' || typeof value === 'number' ? value : index + 1;
}

function resolveItemProps(item: unknown, selector: StepperItemPropsField | undefined): Record<string, unknown> {
    if (selector === false) return {};
    let value: unknown;
    if (selector === true) {
        value = item !== null && typeof item === 'object'
            ? Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'children'))
            : undefined;
    } else {
        value = readField(item, selector ?? 'props', undefined);
    }
    return value !== null && typeof value === 'object' ? { ...value as Record<string, unknown> } : {};
}

/** Normalize public item records while keeping their original data available to slots. */
export function normalizeStepperItems(items: readonly unknown[], options: StepperItemsOptions = {}): StepperItemRecord[] {
    const titleField = options.itemTitle ?? 'title';
    const valueField = options.itemValue ?? 'value';

    return items.map((raw, index) => {
        const object = raw !== null && typeof raw === 'object' ? raw as Record<string, unknown> : undefined;
        const title = readField(raw, titleField, object?.title ?? object?.label ?? raw);
        const value = readField(raw, valueField, undefined);
        return {
            raw,
            title: String(title ?? ''),
            value: resolveItemValue(value, index),
            props: resolveItemProps(raw, options.itemProps)
        };
    });
}

/** Allocate an omitted item value from its stable registration position. */
export function allocateStepperValue(registeredValues: readonly GroupValue[] = []): number {
    let candidate = registeredValues.length + 1;
    while (registeredValues.includes(candidate)) candidate++;
    return candidate;
}
