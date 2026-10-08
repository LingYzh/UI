export const rootTypes = {
    actions: 'button@2',
    article: 'heading, paragraph',
    avatar: 'avatar',
    button: 'button',
    card: 'image, heading',
    'card-avatar': 'image, list-item-avatar',
    chip: 'chip',
    'chip-group': 'chip@8',
    'date-picker': 'list-item, heading, divider, date-picker-options, date-picker-days, actions',
    'date-picker-options': 'text, avatar@2',
    'date-picker-days': 'avatar@28',
    divider: 'divider',
    heading: 'heading',
    image: 'image',
    'list-item': 'text',
    'list-item-avatar': 'avatar, text',
    'list-item-two-line': 'sentences',
    'list-item-avatar-two-line': 'avatar, sentences',
    'list-item-three-line': 'paragraph',
    'list-item-avatar-three-line': 'avatar, paragraph',
    ossein: 'ossein',
    paragraph: 'text@3',
    sentences: 'text@2',
    subtitle: 'text',
    table: 'table-heading, table-thead, table-tbody, table-tfoot',
    'table-heading': 'heading, text',
    'table-thead': 'heading@6',
    'table-tbody': 'table-row-divider@6',
    'table-row-divider': 'table-row, divider',
    'table-row': 'table-cell@6',
    'table-cell': 'text',
    'table-tfoot': 'text@2, avatar@2',
    text: 'text'
} as const;

export interface SkeletonNode {
    type: string;
    children: SkeletonNode[];
}

export interface SkeletonBuildOptions {
    types?: Readonly<Record<string, string>>;
    maxNodes?: number;
    maxDepth?: number;
}

export interface SkeletonBuildResult {
    tree: SkeletonNode[];
    unknownTypes: string[];
    truncated: boolean;
}

const DEFAULT_MAX_NODES = 10_000;
const DEFAULT_MAX_DEPTH = 128;

function validLimit(value: number | undefined, fallback: number): number {
    return value !== undefined && Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

function repeatLength(value: string): number {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    if (parsed === Infinity) return Number.MAX_SAFE_INTEGER;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(parsed));
}

/** Resolve Vuetify-style skeleton patterns into serializable { type, children } nodes. */
export function resolveSkeletonTree(type: string | readonly string[] = 'ossein', options: SkeletonBuildOptions = {}): SkeletonBuildResult {
    const types: Record<string, string> = { ...rootTypes, ...options.types };
    const maxNodes = validLimit(options.maxNodes, DEFAULT_MAX_NODES);
    const maxDepth = validLimit(options.maxDepth, DEFAULT_MAX_DEPTH);
    const state = { nodes: 0, truncated: false, unknownTypes: new Set<string>() };

    function parsePattern(pattern: string, activeTypes: ReadonlySet<string>, depth: number): SkeletonNode[] {
        if (!pattern) return [];

        if (pattern.includes(',')) {
            return pattern.replace(/\s/g, '').split(',').flatMap(part => parsePattern(part, activeTypes, depth));
        }

        if (pattern.includes('@')) {
            const [baseType, length] = pattern.split('@');
            const requested = repeatLength(length ?? '');
            const available = Math.max(0, maxNodes - state.nodes);
            const count = Math.min(requested, available);
            if (count < requested) state.truncated = true;
            const repeated: SkeletonNode[] = [];
            for (let index = 0; index < count; index += 1) {
                repeated.push(...parsePattern(baseType ?? '', activeTypes, depth));
            }
            return repeated;
        }

        if (activeTypes.has(pattern)) {
            state.truncated = true;
            return [];
        }

        if (state.nodes >= maxNodes) {
            state.truncated = true;
            return [];
        }

        state.nodes += 1;
        if (!Object.hasOwn(types, pattern) || typeof types[pattern] !== 'string') {
            state.unknownTypes.add(pattern);
            return [{ type: pattern, children: [] }];
        }

        const definition = types[pattern];
        if (pattern === definition) return [{ type: pattern, children: [] }];
        if (depth >= maxDepth) {
            state.truncated = true;
            return [{ type: pattern, children: [] }];
        }

        const nextTypes = new Set(activeTypes);
        nextTypes.add(pattern);
        return [{ type: pattern, children: parsePattern(definition, nextTypes, depth + 1) }];
    }

    const pattern = typeof type === 'string' ? type : [...type].join(',');
    const tree = parsePattern(pattern, new Set(), 0);
    return { tree, unknownTypes: [...state.unknownTypes], truncated: state.truncated };
}

export function buildSkeletonTree(type: string | readonly string[] = 'ossein', options: SkeletonBuildOptions = {}): SkeletonNode[] {
    return resolveSkeletonTree(type, options).tree;
}
