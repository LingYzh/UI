import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groups, pages } from '../src/ui/docs/content.js';
import { controlSizeStyles } from '../src/ui/control-sizing';
import { gridBasis, type GridSize } from '../src/ui/layout';

test('control sizing converts numeric bounds to pixels and preserves CSS lengths', () => {
    assert.deepEqual(controlSizeStyles({ width: 160, minWidth: 120, maxWidth: 240 }), {
        width: '160px', minWidth: '120px', maxWidth: '240px'
    });
    assert.deepEqual(controlSizeStyles({ width: '50%', minWidth: '12rem', maxWidth: 'min(100%, 480px)' }), {
        width: '50%', minWidth: '12rem', maxWidth: 'min(100%, 480px)'
    });
    assert.equal(controlSizeStyles({ width: -1 }).width, undefined, 'negative widths are ignored');
});

test('gridBasis resolves numeric columns against the row size and keeps the shared gutter', () => {
    assert.equal(
        gridBasis(6),
        'calc((100% + var(--ui-grid-gap, 24px)) * 6 / var(--ui-grid-size, 12) - var(--ui-grid-gap, 24px))'
    );
    assert.equal(
        gridBasis(2, true),
        'calc((100% + var(--ui-grid-gap, 24px)) * 2 / var(--ui-grid-size, 12))'
    );
});

test('gridBasis uses a fraction’s own denominator and supports auto columns and offsets', () => {
    assert.equal(
        gridBasis('2/3'),
        'calc((100% + var(--ui-grid-gap, 24px)) * 2 / 3 - var(--ui-grid-gap, 24px))'
    );
    assert.equal(
        gridBasis('1/4', true),
        'calc((100% + var(--ui-grid-gap, 24px)) * 1 / 4)'
    );
    assert.equal(gridBasis('auto'), 'auto');
    assert.equal(gridBasis('auto', true), '0px');
    assert.equal(gridBasis(undefined), undefined);
});

test('gridBasis rejects invalid widths, malformed fractions and out-of-range offsets', () => {
    for (const value of [0, -1, '0', '-1', 'abc', '1/0', '3/2', '1/2/3', 'Infinity'] as const) {
        assert.equal(gridBasis(value as GridSize), undefined, `width ${value} should be rejected`);
    }
    for (const value of [-1, '-1', 'abc', '1/0', '3/2', '1/2/3', 'Infinity'] as const) {
        assert.equal(gridBasis(value as GridSize, true), undefined, `offset ${value} should be rejected`);
    }
    assert.equal(gridBasis(0, true), 'calc((100% + var(--ui-grid-gap, 24px)) * 0 / var(--ui-grid-size, 12))');
});

test('every public component export has one component page in a visible navigation group', () => {
    const index = readFileSync(new URL('../src/ui/index.ts', import.meta.url), 'utf8');
    const exports = [...index.matchAll(/export\s+\{\s*default\s+as\s+(\w+)\s*\}/g)].map((match) => match[1]);
    const componentPages = pages.filter((page) => page.kind === 'component');
    const documented = componentPages.map((page) => page.name);

    assert.equal(new Set(exports).size, exports.length, 'component exports should be unique');
    assert.deepEqual([...documented].sort(), [...exports].sort(), 'every default component export must have a docs page');
    assert.equal(new Set(componentPages.map((page) => page.id)).size, componentPages.length, 'component routes should be unique');
    for (const page of componentPages) {
        assert.ok(groups.includes(page.group), `${page.name} group ${page.group} must appear in the docs navigation`);
        assert.ok(page.title.trim(), `${page.name} needs a visible page title`);
        assert.ok(page.examples?.length, `${page.name} needs a real component example`);
    }
});

test('every component example id has a LiveExample rendering branch', () => {
    const liveExample = readFileSync(new URL('../src/ui/docs/LiveExample.vue', import.meta.url), 'utf8');
    for (const page of pages.filter((entry) => entry.kind === 'component')) {
        for (const example of page.examples) {
            const routedByPattern = (example.id.startsWith('layout-') && liveExample.includes("example.startsWith('layout-')"))
                || (example.id.startsWith('conversation-') && liveExample.includes("example.startsWith('conversation-')"))
                || (example.id.startsWith('markdown-') && liveExample.includes("example.startsWith('markdown-')"))
                || (example.id.endsWith('-shared-variants') && liveExample.includes("example.endsWith('-shared-variants')"));
            assert.ok(routedByPattern || liveExample.includes(`'${example.id}'`), `${page.name}.${example.id} needs a LiveExample branch`);
        }
    }
});
