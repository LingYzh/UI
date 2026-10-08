import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
    const exports = [...index.matchAll(/export\s+\{\s*default\s+as\s+(U[A-Z][A-Za-z0-9]*)\s*\}/g)].map((match) => match[1]);
    const componentPages = pages.filter((page) => page.kind === 'component');
    const documented = componentPages.map((page) => page.name);

    assert.equal(new Set(exports).size, exports.length, 'component exports should be unique');
    assert.deepEqual([...documented].sort(), [...exports].sort(), 'every default component export must have a docs page');
    assert.equal(new Set(componentPages.map((page) => page.id)).size, componentPages.length, 'component routes should be unique');
    assert.equal(new Set(pages.map((page) => page.id)).size, pages.length, 'service, guide and component routes must also be unique together');
    for (const page of componentPages) {
        assert.ok(groups.includes(page.group), `${page.name} group ${page.group} must appear in the docs navigation`);
        assert.ok(page.title.trim(), `${page.name} needs a visible page title`);
        assert.ok(page.examples?.length, `${page.name} needs a real component example`);
    }
});

test('every component example id has a LiveExample rendering branch', () => {
    const liveExample = readFileSync(new URL('../src/ui/docs/LiveExample.vue', import.meta.url), 'utf8');
    assert.ok(liveExample.includes("example.startsWith('component-')"), 'dedicated component examples need a LiveExample branch');
    assert.ok(liveExample.includes("import.meta.glob('./component-examples/*.vue'"), 'dedicated examples must resolve from their manifest files');
    for (const page of pages.filter((entry) => entry.kind === 'component')) {
        for (const example of page.examples) {
            const routedByPattern = (example.id.startsWith('component-') && liveExample.includes("example.startsWith('component-')"))
                || (example.id.startsWith('layout-') && liveExample.includes("example.startsWith('layout-')"))
                || (example.id.startsWith('conversation-') && liveExample.includes("example.startsWith('conversation-')"))
                || (example.id.startsWith('markdown-') && liveExample.includes("example.startsWith('markdown-')"))
                || (example.id.startsWith('theme-') && liveExample.includes("example.startsWith('theme-')"))
                || (example.id.startsWith('completion-') && liveExample.includes("example.startsWith('completion-')"))
                || (example.id.startsWith('table-align-')
                    && liveExample.includes("example.startsWith('table-align-')")
                    && liveExample.includes("import.meta.glob('./table-examples/*.vue'")
                    && existsSync(new URL(`../src/ui/docs/table-examples/${example.id.slice('table-align-'.length)}.vue`, import.meta.url)))
                || (example.id.endsWith('-shared-variants') && liveExample.includes("example.endsWith('-shared-variants')"));
            assert.ok(routedByPattern || liveExample.includes(`'${example.id}'`), `${page.name}.${example.id} needs a LiveExample branch`);
        }
    }
});

test('each manifest component example matches its real Vue file and page metadata', () => {
    const manifest = JSON.parse(readFileSync(new URL('../src/ui/docs/componentExampleManifest.json', import.meta.url), 'utf8')) as Array<{
        name: string;
        example: string;
        file: string;
    }>;
    const names = manifest.map((entry) => entry.name);
    const exampleIds = manifest.map((entry) => entry.example);
    const files = manifest.map((entry) => entry.file);

    assert.equal(new Set(names).size, manifest.length, 'manifest component names should be unique');
    assert.equal(new Set(exampleIds).size, manifest.length, 'every dedicated example must have a unique id');
    assert.equal(new Set(files).size, manifest.length, 'every dedicated example must have its own Vue file');

    const documentedComponentExamples = pages.flatMap((page) => page.examples ?? [])
        .filter((example) => example.id.startsWith('component-'));
    assert.deepEqual(
        documentedComponentExamples.map((example) => example.id).sort(),
        [...exampleIds].sort(),
        'docs pages should expose exactly the examples listed in the component manifest'
    );

    for (const entry of manifest) {
        const sourceUrl = new URL(`../src/ui/docs/component-examples/${entry.file}`, import.meta.url);
        assert.ok(existsSync(sourceUrl), `${entry.name} manifest file ${entry.file} should exist`);
        const source = readFileSync(sourceUrl, 'utf8');
        const page = pages.find((candidate) => candidate.name === entry.name && candidate.kind === 'component');
        assert.ok(page, `${entry.name} should have a component documentation page`);
        const examples = page.examples.filter((example) => example.id === entry.example);
        assert.equal(examples.length, 1, `${entry.name} should reference ${entry.example} exactly once`);
        assert.equal(
            examples[0].code,
            source.replaceAll("from '../../index'", "from '@lingyzh/ui'"),
            `${entry.name}.${entry.example} should stay in sync with ${entry.file}`
        );
    }
});

test('dedicated input demos isolate sibling components and declare local model state', () => {
    const inputComponents = [
        'UNumberInput', 'UColorInput', 'USlider', 'URangeSlider', 'UOtpInput',
        'URating', 'UFileInput', 'UFileUpload', 'UColorPicker'
    ];
    const manifest = JSON.parse(readFileSync(new URL('../src/ui/docs/componentExampleManifest.json', import.meta.url), 'utf8')) as Array<{
        name: string;
        example: string;
        file: string;
    }>;
    const kebabName = (component: string) => component.slice(1)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();

    for (const component of inputComponents) {
        const entry = manifest.find((candidate) => candidate.name === component);
        assert.ok(entry, `${component} should have a dedicated manifest entry`);
        const source = readFileSync(new URL(`../src/ui/docs/component-examples/${entry.file}`, import.meta.url), 'utf8');
        const template = source.match(/<template>([\s\S]*?)<\/template>/)?.[1];
        const script = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)?.[1];
        assert.ok(template, `${component} example needs a template`);
        assert.ok(script, `${component} example needs local setup code`);
        const ownTag = `u-${kebabName(component)}`;
        assert.match(template, new RegExp(`<${ownTag}(?:\\s|>|\\/)`, 'i'), `${component} example should render its own component`);

        for (const sibling of inputComponents) {
            if (sibling === component) continue;
            const siblingTag = `u-${kebabName(sibling)}`;
            assert.doesNotMatch(template, new RegExp(`<\\/?${siblingTag}(?:\\s|>|\\/)`, 'i'), `${component} example should not mix in ${sibling}`);
        }

        const models = [...template.matchAll(/\bv-model(?:\.[\w-]+)?=(["'])([A-Za-z_$][\w$]*)\1/g)].map((match) => match[2]);
        assert.ok(models.length > 0, `${component} example should demonstrate a bound model`);
        for (const model of models) {
            assert.match(script, new RegExp(`\\b(?:const|let)\\s+${model}\\s*=\\s*(?:ref|reactive)\\s*\\(`), `${component} model ${model} should be declared locally`);
        }
    }
});
