export type NestedId = unknown;
export type NestedSelectionState = 'on' | 'off' | 'indeterminate';

export interface NestedIndexNode<T, Id> {
    id: Id;
    raw: T;
    parent: Id | undefined;
    children: Id[];
    disabled: boolean;
    depth: number;
}

export interface NestedIndex<T, Id> {
    nodes: Map<Id, NestedIndexNode<T, Id>>;
    flat: NestedIndexNode<T, Id>[];
    roots: Id[];
    /** Like Vuetify's nested map, only items with children are present as keys. */
    children: Map<Id, Id[]>;
    /** Root nodes have no entry; use `has(id)` so falsy parent IDs remain valid. */
    parents: Map<Id, Id>;
    disabled: Set<Id>;
}

export interface BuildNestedIndexOptions<T, Id> {
    getId?: (item: T, index: number, parent: Id | undefined) => Id;
    getChildren?: (item: T) => readonly T[] | null | undefined;
    isDisabled?: (item: T) => boolean;
    /** Disabled parents disable descendants, matching the current UTreeview behavior. */
    inheritDisabled?: boolean;
}

export function buildNestedIndex<T, Id = NestedId>(items: readonly T[], options: BuildNestedIndexOptions<T, Id> = {}): NestedIndex<T, Id> {
    if (!Array.isArray(items)) throw new TypeError('Nested items must be an array.');

    const nodes = new Map<Id, NestedIndexNode<T, Id>>();
    const flat: NestedIndexNode<T, Id>[] = [];
    const roots: Id[] = [];
    const children = new Map<Id, Id[]>();
    const parents = new Map<Id, Id>();
    const disabled = new Set<Id>();
    const activeItems = new WeakSet<object>();
    const activeLists = new WeakSet<object>();
    const inheritDisabled = options.inheritDisabled ?? true;

    const getId = options.getId ?? ((item: T) => defaultNestedId(item) as Id);
    const getChildren = options.getChildren ?? ((item: T) => defaultNestedChildren(item) as readonly T[] | undefined);
    const isDisabled = options.isDisabled ?? ((item: T) => defaultNestedDisabled(item));

    function visitList(list: readonly T[], parent: Id | undefined, parentDisabled: boolean, depth: number, target: Id[]): void {
        const listObject = list as object;
        if (activeLists.has(listObject)) throw new TypeError('Cycle detected in nested item children.');
        activeLists.add(listObject);
        try {
            list.forEach((item, index) => visitItem(item, index, parent, parentDisabled, depth, target));
        } finally {
            activeLists.delete(listObject);
        }
    }

    function visitItem(item: T, index: number, parent: Id | undefined, parentDisabled: boolean, depth: number, target: Id[]): void {
        const itemObject = isObjectLike(item) ? item as object : undefined;
        if (itemObject && activeItems.has(itemObject)) throw new TypeError('Cycle detected in nested item references.');
        if (itemObject) activeItems.add(itemObject);

        try {
            const id = getId(item, index, parent);
            if (id === undefined) throw new TypeError(`Nested item at index ${index} has no id or value.`);
            if (nodes.has(id)) throw new TypeError(`Duplicate nested item id: ${describeId(id)}.`);

            const ownDisabled = Boolean(isDisabled(item));
            const effectiveDisabled = ownDisabled || (inheritDisabled && parentDisabled);
            const node: NestedIndexNode<T, Id> = { id, raw: item, parent, children: [], disabled: effectiveDisabled, depth };
            nodes.set(id, node);
            flat.push(node);
            target.push(id);
            if (parent !== undefined) parents.set(id, parent);
            if (effectiveDisabled) disabled.add(id);

            const rawChildren = getChildren(item);
            if (rawChildren == null) return;
            if (!Array.isArray(rawChildren)) throw new TypeError(`Children of nested item ${describeId(id)} must be an array.`);
            node.children = [];
            children.set(id, node.children);
            if (!rawChildren.length) return;
            visitList(rawChildren, id, effectiveDisabled, depth + 1, node.children);
        } finally {
            if (itemObject) activeItems.delete(itemObject);
        }
    }

    visitList(items, undefined, false, 0, roots);
    return { nodes, flat, roots, children, parents, disabled };
}

function defaultNestedId(item: unknown): unknown {
    if (item === null || typeof item !== 'object') return item;
    const record = item as Record<string, unknown>;
    if ('id' in record && record.id !== undefined) return record.id;
    if ('value' in record && record.value !== undefined) return record.value;
    return undefined;
}

function defaultNestedChildren(item: unknown): readonly unknown[] | undefined {
    if (item === null || typeof item !== 'object') return undefined;
    const value = (item as Record<string, unknown>).children;
    return value == null ? undefined : Array.isArray(value) ? value : value as readonly unknown[];
}

function defaultNestedDisabled(item: unknown): boolean {
    return item !== null && typeof item === 'object' && Boolean((item as Record<string, unknown>).disabled);
}

function isObjectLike(value: unknown): boolean {
    return value !== null && (typeof value === 'object' || typeof value === 'function');
}

function describeId(id: unknown): string {
    try {
        return String(id);
    } catch {
        return '<unprintable>';
    }
}

export interface NestedSelectArgs<Id> {
    id: Id;
    value: boolean;
    selected: Map<Id, NestedSelectionState>;
    children: ReadonlyMap<Id, readonly Id[]>;
    parents: ReadonlyMap<Id, Id>;
    disabled: ReadonlySet<Id>;
}

export interface NestedSelectStrategy<Id = NestedId> {
    select(args: NestedSelectArgs<Id>): Map<Id, NestedSelectionState>;
    in(values: readonly Id[] | null | undefined, children: ReadonlyMap<Id, readonly Id[]>, parents: ReadonlyMap<Id, Id>, disabled: ReadonlySet<Id>): Map<Id, NestedSelectionState>;
    out(selected: ReadonlyMap<Id, NestedSelectionState>, children: ReadonlyMap<Id, readonly Id[]>, parents: ReadonlyMap<Id, Id>, disabled: ReadonlySet<Id>): Id[];
}

export type SelectStrategyName = 'independent' | 'single-independent' | 'leaf' | 'single-leaf' | 'classic' | 'trunk' | 'branch' | 'legacy-cascade';
export type SelectStrategyFactory<Id> = (mandatory: boolean) => NestedSelectStrategy<Id>;
export type SelectStrategyInput<Id> = SelectStrategyName | NestedSelectStrategy<Id> | SelectStrategyFactory<Id>;

function countSelected(selected: ReadonlyMap<unknown, NestedSelectionState>): number {
    let count = 0;
    for (const state of selected.values()) if (state === 'on') count++;
    return count;
}

function setIndependent<Id>(args: NestedSelectArgs<Id>, mandatory: boolean): Map<Id, NestedSelectionState> {
    const next = new Map(args.selected);
    if (args.disabled.has(args.id)) return next;
    if (args.value === false && mandatory && args.selected.get(args.id) === 'on' && countSelected(args.selected) <= 1) return next;
    next.set(args.id, args.value ? 'on' : 'off');
    return next;
}

function setSingle<Id>(args: NestedSelectArgs<Id>, mandatory: boolean): Map<Id, NestedSelectionState> {
    const next = new Map<Id, NestedSelectionState>();
    if (args.disabled.has(args.id)) return new Map(args.selected);
    if (args.value) {
        next.set(args.id, 'on');
        return next;
    }
    if (args.selected.get(args.id) !== 'on') return new Map(args.selected);
    if (mandatory && countSelected(args.selected) <= 1) return new Map(args.selected);
    next.set(args.id, 'off');
    return next;
}

function makeIndependent<Id>(mandatory: boolean): NestedSelectStrategy<Id> {
    return {
        select: (args) => setIndependent(args, mandatory),
        in(values, children, parents, disabled) {
            let selected = new Map<Id, NestedSelectionState>();
            for (const id of values ?? []) selected = setIndependent({ id, value: true, selected, children, parents, disabled }, mandatory);
            return selected;
        },
        out(selected) {
            return [...selected].filter(([, state]) => state === 'on').map(([id]) => id);
        }
    };
}

function makeSingleIndependent<Id>(mandatory: boolean): NestedSelectStrategy<Id> {
    return {
        select: (args) => setSingle(args, mandatory),
        in(values, children, parents, disabled) {
            if (!values?.length) return new Map();
            const first = values[0];
            return setSingle({ id: first, value: true, selected: new Map(), children, parents, disabled }, mandatory);
        },
        out(selected) {
            return [...selected].filter(([, state]) => state === 'on').map(([id]) => id);
        }
    };
}

function hasChildren<Id>(id: Id, children: ReadonlyMap<Id, readonly Id[]>): boolean {
    return children.has(id);
}

function makeLeaf<Id>(mandatory: boolean, single: boolean): NestedSelectStrategy<Id> {
    const base = single ? makeSingleIndependent<Id>(mandatory) : makeIndependent<Id>(mandatory);
    return {
        select(args) {
            if (hasChildren(args.id, args.children) || args.disabled.has(args.id)) return new Map(args.selected);
            return base.select(args);
        },
        in(values, children, parents, disabled) {
            const leaves = (values ?? []).filter((id) => !hasChildren(id, children) && !disabled.has(id));
            return base.in(single ? leaves.slice(0, 1) : leaves, children, parents, disabled);
        },
        out(selected, children, _parents, disabled) {
            return [...selected].filter(([id, state]) => state === 'on' && !hasChildren(id, children) && !disabled.has(id)).map(([id]) => id);
        }
    };
}

function parentOf<Id>(id: Id, parents: ReadonlyMap<Id, Id>): Id | undefined {
    return parents.has(id) ? parents.get(id) : undefined;
}

function recomputeAncestors<Id>(id: Id, selected: Map<Id, NestedSelectionState>, children: ReadonlyMap<Id, readonly Id[]>, parents: ReadonlyMap<Id, Id>, disabled: ReadonlySet<Id>): void {
    let current = id;
    const visited = new Set<Id>();
    while (parents.has(current) && !visited.has(current)) {
        visited.add(current);
        const parent = parentOf(current, parents)!;
        if (!disabled.has(parent)) {
            const eligibleChildren = (children.get(parent) ?? []).filter((child) => !disabled.has(child));
            const states = eligibleChildren.map((child) => selected.get(child) ?? 'off');
            const next = states.length > 0 && states.every((state) => state === 'on') ? 'on'
                : states.every((state) => state === 'off') ? 'off'
                    : 'indeterminate';
            selected.set(parent, next);
        }
        current = parent;
    }
}

function setClassic<Id>(args: NestedSelectArgs<Id>, mandatory: boolean): Map<Id, NestedSelectionState> {
    const next = new Map(args.selected);
    if (args.disabled.has(args.id)) return next;

    const queue = [args.id];
    const visited = new Set<Id>();
    while (queue.length) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        if (!args.disabled.has(id)) next.set(id, args.value ? 'on' : 'off');
        queue.push(...(args.children.get(id) ?? []));
    }
    recomputeAncestors(args.id, next, args.children, args.parents, args.disabled);
    if (mandatory && args.value === false && countSelected(next) === 0) return new Map(args.selected);
    return next;
}

function makeClassic<Id>(mandatory: boolean): NestedSelectStrategy<Id> {
    return {
        select: (args) => setClassic(args, mandatory),
        in(values, children, parents, disabled) {
            let selected = new Map<Id, NestedSelectionState>();
            for (const id of values ?? []) selected = setClassic({ id, value: true, selected, children, parents, disabled }, false);
            return selected;
        },
        out(selected, children, _parents, disabled) {
            return [...selected].filter(([id, state]) => state === 'on' && !hasChildren(id, children) && !disabled.has(id)).map(([id]) => id);
        }
    };
}

function makeTrunk<Id>(mandatory: boolean): NestedSelectStrategy<Id> {
    const classic = makeClassic<Id>(mandatory);
    return {
        ...classic,
        out(selected, _children, parents, disabled) {
            const result: Id[] = [];
            for (const [id, state] of selected) {
                if (state !== 'on' || disabled.has(id)) continue;
                const parent = parentOf(id, parents);
                if (parent !== undefined && selected.get(parent) === 'on') continue;
                result.push(id);
            }
            return result;
        }
    };
}

function makeBranch<Id>(mandatory: boolean, legacyCascade = false): NestedSelectStrategy<Id> {
    const classic = makeClassic<Id>(mandatory);
    return {
        select: classic.select,
        in(values, children, parents, disabled) {
            const accepted = legacyCascade ? values ?? [] : (values ?? []).filter((id) => !hasChildren(id, children));
            return classic.in(accepted, children, parents, disabled);
        },
        out(selected, children, _parents, disabled) {
            return [...selected].filter(([id, state]) => {
                if (disabled.has(id)) return false;
                if (legacyCascade) return state === 'on';
                return state === 'on' || state === 'indeterminate';
            }).map(([id]) => id);
        }
    };
}

function isSelectStrategy<Id>(value: unknown): value is NestedSelectStrategy<Id> {
    if (value === null || typeof value !== 'object') return false;
    const candidate = value as Partial<NestedSelectStrategy<Id>>;
    return typeof candidate.select === 'function' && typeof candidate.in === 'function' && typeof candidate.out === 'function';
}

export function createSelectStrategy<Id = NestedId>(input: SelectStrategyInput<Id>, mandatory = false): NestedSelectStrategy<Id> {
    if (typeof input === 'function') {
        const strategy = input(mandatory);
        if (!isSelectStrategy<Id>(strategy)) throw new TypeError('Custom select strategy must provide select, in, and out methods.');
        return strategy;
    }
    if (typeof input !== 'string') {
        if (!isSelectStrategy<Id>(input)) throw new TypeError('Custom select strategy must provide select, in, and out methods.');
        return input;
    }

    switch (input) {
        case 'independent': return makeIndependent(mandatory);
        case 'single-independent': return makeSingleIndependent(mandatory);
        case 'leaf': return makeLeaf(mandatory, false);
        case 'single-leaf': return makeLeaf(mandatory, true);
        case 'classic': return makeClassic(mandatory);
        case 'trunk': return makeTrunk(mandatory);
        case 'branch': return makeBranch(mandatory);
        case 'legacy-cascade': return makeBranch(mandatory, true);
        default: throw new RangeError(`Unknown nested selection strategy: ${input}.`);
    }
}

export interface NestedOpenArgs<Id> {
    id: Id;
    value: boolean;
    opened: Set<Id>;
    parents: ReadonlyMap<Id, Id>;
}

export interface NestedOpenStrategy<Id = NestedId> {
    open(args: NestedOpenArgs<Id>): Set<Id>;
    select?(args: NestedOpenArgs<Id>): Set<Id> | null;
}

export type OpenStrategyName = 'multiple' | 'single' | 'list';

function ancestorsOf<Id>(id: Id, parents: ReadonlyMap<Id, Id>): Id[] {
    const ancestors: Id[] = [];
    const visited = new Set<Id>([id]);
    let current = id;
    while (parents.has(current)) {
        const parent = parentOf(current, parents)!;
        if (visited.has(parent)) break;
        visited.add(parent);
        ancestors.push(parent);
        current = parent;
    }
    return ancestors;
}

function multipleOpen<Id>({ id, value, opened, parents }: NestedOpenArgs<Id>): Set<Id> {
    const next = new Set(opened);
    if (value) {
        next.add(id);
        for (const parent of ancestorsOf(id, parents)) next.add(parent);
    } else {
        next.delete(id);
    }
    return next;
}

const multipleOpenStrategy: NestedOpenStrategy<unknown> = { open: multipleOpen, select: () => null };

const singleOpenStrategy: NestedOpenStrategy<unknown> = {
    open(args) {
        if (!args.value) {
            const next = new Set(args.opened);
            next.delete(args.id);
            return next;
        }
        return new Set([args.id, ...ancestorsOf(args.id, args.parents)]);
    },
    select: () => null
};

const listOpenStrategy: NestedOpenStrategy<unknown> = {
    open: multipleOpen,
    select({ id, value, opened, parents }) {
        return value ? new Set(ancestorsOf(id, parents)) : new Set(opened);
    }
};

function isOpenStrategy<Id>(value: unknown): value is NestedOpenStrategy<Id> {
    if (value === null || typeof value !== 'object') return false;
    const candidate = value as Partial<NestedOpenStrategy<Id>>;
    return typeof candidate.open === 'function' && (candidate.select == null || typeof candidate.select === 'function');
}

export function createOpenStrategy<Id = NestedId>(input: OpenStrategyName | NestedOpenStrategy<Id>): NestedOpenStrategy<Id> {
    if (typeof input !== 'string') {
        if (!isOpenStrategy<Id>(input)) throw new TypeError('Custom open strategy must provide an open method and an optional select method.');
        return input;
    }

    switch (input) {
        case 'multiple': return multipleOpenStrategy as NestedOpenStrategy<Id>;
        case 'single': return singleOpenStrategy as NestedOpenStrategy<Id>;
        case 'list': return listOpenStrategy as NestedOpenStrategy<Id>;
        default: throw new RangeError(`Unknown nested open strategy: ${input}.`);
    }
}
