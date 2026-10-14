import { getItemProperty, type DataItem, type ItemProperty } from './data-pipeline';

export interface TreeTableRow {
    item: DataItem;
    key: unknown;
    depth: number;
    branch: boolean;
}

/** Keep original records and sibling order; expansion only controls visibility. */
export function treeTableRows(items: readonly DataItem[], opened: readonly unknown[], itemValue: ItemProperty = 'id', itemChildren: ItemProperty = 'children') {
    const expanded = new Set(opened);
    const rows: TreeTableRow[] = [];
    const branches: unknown[] = [];
    function visit(nodes: readonly DataItem[], depth: number, visible: boolean): void {
        for (const item of nodes) {
            const key = getItemProperty(item, itemValue);
            const children = getItemProperty(item, itemChildren, []);
            const branch = Array.isArray(children) && children.length > 0;
            if (branch) branches.push(key);
            if (visible) rows.push({ item, key, depth, branch });
            if (branch) visit(children, depth + 1, visible && expanded.has(key));
        }
    }
    visit(items, 0, true);
    return { rows, branches };
}
