export type CascaderValue = string | number;
export type CascaderPath = readonly CascaderValue[];
export type CascaderPaths = readonly CascaderPath[];

export interface CascaderItem {
    value: CascaderValue;
    label: string;
    disabled?: boolean;
    children?: readonly CascaderItem[];
}

export interface CascaderPathOption {
    item: CascaderItem;
    path: CascaderValue[];
    labels: string[];
    disabled: boolean;
}

export interface CascaderSelectionState {
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    selectionPaths: CascaderValue[][];
}

export interface CascaderToggleOptions {
    checkStrictly?: boolean;
    max?: number;
}

export interface CascaderToggleResult {
    accepted: boolean;
    reason?: 'invalid' | 'max';
    paths: CascaderValue[][];
}

interface LocatedCascaderPath {
    nodes: CascaderItem[];
    disabled: boolean;
}

/** Resolve each value among its siblings; duplicate values in other branches are valid. */
export function resolveCascaderPath(items: readonly CascaderItem[], values: CascaderPath): CascaderItem[] {
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

export function isCascaderPathValid(items: readonly CascaderItem[], values: CascaderPath, changeOnSelect = false): boolean {
    if (!values.length) return true;
    const path = resolveCascaderPath(items, values);
    return path.length === values.length && (changeOnSelect || !path.at(-1)?.children?.length);
}

/**
 * Copy selected paths and remove exact duplicates without resolving them against items.
 * Stale paths stay visible to validation instead of disappearing after an items update.
 */
export function normalizeCascaderPaths(paths: CascaderPaths | null | undefined): CascaderValue[][] {
    const normalized: CascaderValue[][] = [];
    for (const path of paths ?? []) {
        const copy = [...path];
        if (!normalized.some(candidate => areCascaderPathsEqual(candidate, copy))) normalized.push(copy);
    }
    return normalized;
}

export function areCascaderPathsEqual(left: CascaderPath, right: CascaderPath): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function hasCascaderPath(paths: CascaderPaths, path: CascaderPath): boolean {
    return paths.some(candidate => areCascaderPathsEqual(candidate, path));
}

function locateCascaderPath(items: readonly CascaderItem[], path: CascaderPath): LocatedCascaderPath | null {
    if (!path.length) return null;
    const nodes: CascaderItem[] = [];
    let siblings = items;
    let disabled = false;
    for (const value of path) {
        const item = siblings.find(candidate => candidate.value === value);
        if (!item) return null;
        nodes.push(item);
        disabled ||= !!item.disabled;
        siblings = item.children ?? [];
    }
    return { nodes, disabled };
}

/** Returns true when a path is missing or an item in it is disabled. */
export function isCascaderPathDisabled(items: readonly CascaderItem[], path: CascaderPath): boolean {
    const located = locateCascaderPath(items, path);
    return !located || located.disabled;
}

function collectLeafPaths(item: CascaderItem, parentPath: CascaderPath): CascaderValue[][] {
    if (item.disabled) return [];
    const path = [...parentPath, item.value];
    if (!item.children?.length) return [path];
    return item.children.flatMap(child => collectLeafPaths(child, path));
}

/** Collect enabled leaf paths. A disabled node excludes its complete subtree. */
export function collectCascaderLeafPaths(items: readonly CascaderItem[]): CascaderValue[][] {
    return items.flatMap(item => collectLeafPaths(item, []));
}

/** Collect matching options by their complete, case-insensitive label path. */
export function searchCascaderPaths(items: readonly CascaderItem[], query: string, separator = ' / '): CascaderPathOption[] {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const results: CascaderPathOption[] = [];
    function visit(siblings: readonly CascaderItem[], parentPath: CascaderPath, parentLabels: readonly string[], parentDisabled: boolean): void {
        for (const item of siblings) {
            const path = [...parentPath, item.value];
            const labels = [...parentLabels, item.label];
            const labelPath = labels.join(separator);
            const disabled = parentDisabled || !!item.disabled;
            if (labelPath.toLowerCase().includes(term)) results.push({ item, path, labels, disabled });
            if (item.children?.length) visit(item.children, path, labels, disabled);
        }
    }
    visit(items, [], [], false);
    return results;
}

export interface CascaderSearchOptions {
    multiple?: boolean;
    checkStrictly?: boolean;
    changeOnSelect?: boolean;
}

/** Return enabled search matches that can be selected without changing hidden sibling paths. */
export function searchSelectableCascaderPaths(
    items: readonly CascaderItem[],
    query: string,
    separator = ' / ',
    options: CascaderSearchOptions = {}
): CascaderPathOption[] {
    const allowBranches = options.checkStrictly === true || (!options.multiple && options.changeOnSelect === true);
    return searchCascaderPaths(items, query, separator).filter(option =>
        !option.disabled && (allowBranches || !option.item.children?.length)
    );
}

export function isCascaderPathsValid(items: readonly CascaderItem[], paths: CascaderPaths, checkStrictly = false): boolean {
    return paths.every(path => {
        const located = locateCascaderPath(items, path);
        if (!located || located.disabled) return false;
        return checkStrictly || !located.nodes.at(-1)?.children?.length;
    });
}

export function getCascaderSelectionState(
    items: readonly CascaderItem[],
    path: CascaderPath,
    selectedPaths: CascaderPaths,
    checkStrictly = false
): CascaderSelectionState {
    const located = locateCascaderPath(items, path);
    if (!located || located.disabled) return { checked: false, indeterminate: false, disabled: true, selectionPaths: [] };
    const item = located.nodes.at(-1)!;
    const selectionPaths = checkStrictly ? [[...path]] : collectLeafPaths(item, path.slice(0, -1));
    if (!selectionPaths.length) return { checked: false, indeterminate: false, disabled: true, selectionPaths: [] };
    const selectedCount = selectionPaths.reduce((count, candidate) => count + Number(hasCascaderPath(selectedPaths, candidate)), 0);
    return {
        checked: selectedCount === selectionPaths.length,
        indeterminate: selectedCount > 0 && selectedCount < selectionPaths.length,
        disabled: false,
        selectionPaths
    };
}

function exceedsCascaderMax(selectedCount: number, additionCount: number, max: number | undefined): boolean {
    return typeof max === 'number' && Number.isFinite(max) && max > 0 && selectedCount + additionCount > max;
}

export function canToggleCascaderPath(
    items: readonly CascaderItem[],
    selectedPaths: CascaderPaths,
    path: CascaderPath,
    options: CascaderToggleOptions = {}
): boolean {
    const state = getCascaderSelectionState(items, path, selectedPaths, options.checkStrictly);
    if (state.disabled || state.checked) return !state.disabled;
    const current = normalizeCascaderPaths(selectedPaths);
    const additions = state.selectionPaths.filter(candidate => !hasCascaderPath(current, candidate)).length;
    return !exceedsCascaderMax(current.length, additions, options.max);
}

/** Toggle a leaf, strict node, or all selectable leaves below a non-strict branch. */
export function toggleCascaderPath(
    items: readonly CascaderItem[],
    selectedPaths: CascaderPaths,
    path: CascaderPath,
    options: CascaderToggleOptions = {}
): CascaderToggleResult {
    const original = selectedPaths.map(candidate => [...candidate]);
    const state = getCascaderSelectionState(items, path, original, options.checkStrictly);
    if (state.disabled) return { accepted: false, reason: 'invalid', paths: original };
    if (state.checked) {
        return {
            accepted: true,
            paths: original.filter(candidate => !hasCascaderPath(state.selectionPaths, candidate))
        };
    }
    const current = normalizeCascaderPaths(original);
    const additions = state.selectionPaths.filter(candidate => !hasCascaderPath(current, candidate));
    if (exceedsCascaderMax(current.length, additions.length, options.max)) return { accepted: false, reason: 'max', paths: original };
    return { accepted: true, paths: [...original, ...additions.map(candidate => [...candidate])] };
}