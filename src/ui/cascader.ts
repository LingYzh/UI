export type CascaderValue = string | number;
export interface CascaderItem {
    value: CascaderValue;
    label: string;
    disabled?: boolean;
    children?: readonly CascaderItem[];
}

/** Resolve each value among its siblings; duplicate values in other branches are valid. */
export function resolveCascaderPath(items: readonly CascaderItem[], values: readonly CascaderValue[]): CascaderItem[] {
    const path: CascaderItem[] = [];
    let siblings = items;
    for (const value of values) {
        const item = siblings.find(candidate => candidate.value === value);
        if (!item || item.disabled) break;
        path.push(item);
        siblings = item.children ?? [];
    }
    return path;
}

export function isCascaderPathValid(items: readonly CascaderItem[], values: readonly CascaderValue[], changeOnSelect = false): boolean {
    if (!values.length) return true;
    const path = resolveCascaderPath(items, values);
    return path.length === values.length && (changeOnSelect || !path.at(-1)?.children?.length);
}
