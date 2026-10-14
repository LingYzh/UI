export type TreeviewDropPosition = 'before' | 'inner' | 'after';

export interface TreeviewItemAccess<T> {
    getValue: (item: T) => unknown;
    childrenKey: string;
}

export interface TreeviewDropGuardOptions<T> extends TreeviewItemAccess<T> {
    isDisabled?: (item: T) => boolean;
    allowDrop?: (dragRaw: T, targetRaw: T, position: TreeviewDropPosition) => boolean;
}

interface TreeviewPathEntry<T> {
    item: T;
    index: number;
    id: unknown;
}

function childrenOf<T>(item: T, childrenKey: string): readonly T[] {
    if (item === null || typeof item !== 'object') return [];
    const children = (item as Record<string, unknown>)[childrenKey];
    return Array.isArray(children) ? children as T[] : [];
}

function findPath<T>(
    items: readonly T[],
    id: unknown,
    options: TreeviewItemAccess<T>,
    parentPath: readonly TreeviewPathEntry<T>[] = []
): TreeviewPathEntry<T>[] | undefined {
    for (let index = 0; index < items.length; index++) {
        const item = items[index]!;
        const value = options.getValue(item);
        const path = [...parentPath, { item, index, id: value }];
        if (Object.is(value, id)) return path;

        const nestedPath = findPath(childrenOf(item, options.childrenKey), id, options, path);
        if (nestedPath) return nestedPath;
    }
    return undefined;
}

function pathsEqual<T>(left: readonly TreeviewPathEntry<T>[], right: readonly TreeviewPathEntry<T>[]) {
    return left.length === right.length && left.every((entry, index) => Object.is(entry.id, right[index]?.id));
}

function pathStartsWith<T>(path: readonly TreeviewPathEntry<T>[], prefix: readonly TreeviewPathEntry<T>[]) {
    return prefix.length <= path.length && prefix.every((entry, index) => Object.is(entry.id, path[index]?.id));
}

function cloneWithChildren<T>(item: T, childrenKey: string, children: T[]): T {
    return { ...(item as Record<string, unknown>), [childrenKey]: children } as T;
}

function removeAtPath<T>(
    items: readonly T[],
    path: readonly TreeviewPathEntry<T>[],
    depth: number,
    childrenKey: string
): T[] {
    const entry = path[depth]!;
    const next = [...items];
    if (depth === path.length - 1) {
        next.splice(entry.index, 1);
        return next;
    }

    const item = items[entry.index]!;
    const children = removeAtPath(childrenOf(item, childrenKey), path, depth + 1, childrenKey);
    next[entry.index] = cloneWithChildren(item, childrenKey, children);
    return next;
}

function updateArrayAtPath<T>(
    items: readonly T[],
    path: readonly TreeviewPathEntry<T>[],
    childrenKey: string,
    update: (siblings: readonly T[]) => T[]
): T[] {
    if (path.length === 0) return update(items);

    const entry = path[0]!;
    const item = items[entry.index]!;
    const next = [...items];
    const children = updateArrayAtPath(childrenOf(item, childrenKey), path.slice(1), childrenKey, update);
    next[entry.index] = cloneWithChildren(item, childrenKey, children);
    return next;
}

function canMoveBetweenPaths<T>(
    sourcePath: readonly TreeviewPathEntry<T>[],
    targetPath: readonly TreeviewPathEntry<T>[]
) {
    return !pathStartsWith(targetPath, sourcePath);
}

export function canTreeviewDrop<T>(
    items: T[],
    sourceId: unknown,
    targetId: unknown,
    position: TreeviewDropPosition,
    options: TreeviewDropGuardOptions<T>
): boolean {
    const sourcePath = findPath(items, sourceId, options);
    const targetPath = findPath(items, targetId, options);
    if (!sourcePath || !targetPath || Object.is(sourceId, targetId) || !canMoveBetweenPaths(sourcePath, targetPath)) return false;

    const sourceRaw = sourcePath[sourcePath.length - 1]!.item;
    const targetRaw = targetPath[targetPath.length - 1]!.item;
    if (options.isDisabled?.(sourceRaw) || options.isDisabled?.(targetRaw)) return false;
    return options.allowDrop?.(sourceRaw, targetRaw, position) !== false;
}

export function moveTreeviewItem<T>(
    items: T[],
    sourceId: unknown,
    targetId: unknown,
    position: TreeviewDropPosition,
    options: TreeviewItemAccess<T>
): { items: T[]; changed: boolean } {
    const unchanged = () => ({ items, changed: false });
    const sourcePath = findPath(items, sourceId, options);
    const targetPath = findPath(items, targetId, options);
    if (!sourcePath || !targetPath || Object.is(sourceId, targetId) || !canMoveBetweenPaths(sourcePath, targetPath)) return unchanged();

    const sourceEntry = sourcePath[sourcePath.length - 1]!;
    const targetEntry = targetPath[targetPath.length - 1]!;
    const sourceParentPath = sourcePath.slice(0, -1);
    const targetParentPath = targetPath.slice(0, -1);
    if (pathsEqual(sourceParentPath, targetParentPath)) {
        if (position === 'before' && sourceEntry.index + 1 === targetEntry.index) return unchanged();
        if (position === 'after' && sourceEntry.index === targetEntry.index + 1) return unchanged();
    }
    if (position === 'inner'
        && pathsEqual(sourceParentPath, targetPath)
        && sourceEntry.index === childrenOf(targetEntry.item, options.childrenKey).length - 1) {
        return unchanged();
    }

    const withoutSource = removeAtPath(items, sourcePath, 0, options.childrenKey);
    const relocatedTargetPath = findPath(withoutSource, targetId, options);
    if (!relocatedTargetPath) return unchanged();

    const sourceRaw = sourceEntry.item;
    if (position === 'inner') {
        const nextItems = updateArrayAtPath(withoutSource, relocatedTargetPath, options.childrenKey, (children) => [...children, sourceRaw]);
        return { items: nextItems, changed: true };
    }

    const relocatedTarget = relocatedTargetPath[relocatedTargetPath.length - 1]!;
    const insertIndex = relocatedTarget.index + (position === 'after' ? 1 : 0);
    const nextItems = updateArrayAtPath(withoutSource, relocatedTargetPath.slice(0, -1), options.childrenKey, (siblings) => {
        const next = [...siblings];
        next.splice(insertIndex, 0, sourceRaw);
        return next;
    });
    return { items: nextItems, changed: true };
}
