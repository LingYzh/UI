import test from 'node:test';
import assert from 'node:assert/strict';
import { lineDiff, collapseDiffContext } from '../src/ui/line-diff';
test('line diff preserves exact additions, removals, line numbers and final newline', () => {
    const result = lineDiff('a\nb\nc', 'a\nB\nc\n');
    assert.equal(result.omitted, false);
    assert.equal(result.added, 2);
    assert.equal(result.removed, 2);
    assert.deepEqual(result.rows.filter(row => row.kind === 'added').map(row => row.newLine), [2, 3]);
    assert.ok(result.rows.some(row => row.kind === 'removed' && row.noNewline));
    assert.equal(lineDiff(null, 'first\n').added, 1);
    assert.equal(lineDiff('old\n', null).removed, 1);
    assert.equal(lineDiff('', '').rows.length, 0);
});
test('context collapse does not omit changes; large input reports no computed diff', () => {
    const before = Array.from({ length: 100 }, (_, i) => `line ${i}\n`).join('');
    const after = before.replace('line 50\n', 'changed\n');
    const result = lineDiff(before, after);
    const collapsed = collapseDiffContext(result.rows);
    assert.equal(collapsed.filter(row => row.kind === 'added').length, 1);
    assert.equal(collapsed.filter(row => row.kind === 'removed').length, 1);
    assert.equal(collapsed.filter(row => row.kind === 'gap').length, 2);
    assert.equal(lineDiff('x'.repeat(600001), 'y').omitted, true);
});
