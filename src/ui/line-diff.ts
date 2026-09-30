import { diffLines } from 'diff';
import { uiText } from './locale';

export interface DiffRow {
    kind: 'context' | 'added' | 'removed' | 'gap';
    text: string;
    oldLine?: number;
    newLine?: number;
    noNewline?: boolean;
}
export function lineDiff(before: string | null, after: string | null) {
    const oldText = before ?? '';
    const newText = after ?? '';
    if (oldText.length + newText.length > 600_000 || oldText.split('\n').length + newText.split('\n').length > 16_000) {
        return { rows: [] as DiffRow[], added: 0, removed: 0, omitted: true };
    }
    const changes = diffLines(oldText, newText, { timeout: 60, maxEditLength: 2000 });
    if (!changes) return { rows: [] as DiffRow[], added: 0, removed: 0, omitted: true };
    const rows: DiffRow[] = [];
    let oldLine = 1;
    let newLine = 1;
    let added = 0;
    let removed = 0;
    for (const change of changes) {
        const lines = change.value.match(/[^\n]*\n|[^\n]+$/g) || [];
        for (const line of lines) {
            const kind = change.added ? 'added' : change.removed ? 'removed' : 'context';
            rows.push({ kind, text: line.replace(/\r?\n$/, ''),
                ...(!change.added ? { oldLine: oldLine++ } : {}),
                ...(!change.removed ? { newLine: newLine++ } : {}), noNewline: !line.endsWith('\n') });
            if (change.added) added++;
            if (change.removed) removed++;
        }
    }
    return { rows, added, removed, omitted: false };
}

export function collapseDiffContext(rows: DiffRow[], context = 3): DiffRow[] {
    const kept = new Set<number>();
    rows.forEach((row, index) => {
        if (row.kind === 'context') return;
        for (let i = Math.max(0, index - context); i <= Math.min(rows.length - 1, index + context); i++) kept.add(i);
    });
    if (!kept.size) return [];
    const result: DiffRow[] = [];
    let skipped = 0;
    rows.forEach((row, index) => {
        if (!kept.has(index)) { skipped++; return; }
        if (skipped) { result.push({ kind: 'gap', text: uiText('diff.gap', { count: skipped }) }); skipped = 0; }
        result.push(row);
    });
    if (skipped) result.push({ kind: 'gap', text: uiText('diff.gap', { count: skipped }) });
    return result;
}
