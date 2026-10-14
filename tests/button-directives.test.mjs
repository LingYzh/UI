import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileScript, parse } from '@vue/compiler-sfc';
import ts from 'typescript';
import { computed, createRenderer, defineComponent, h, nextTick, provide, ref, withDirectives } from 'vue';
import { createLocalePlugin } from '@vuetify/v0';
import { defaultsKey } from '../src/ui/defaults.ts';

const projectRoot = process.cwd();
const componentDirectory = path.join(projectRoot, 'src', 'ui');
const componentSourcePath = path.join(componentDirectory, 'UiButton.vue');
// Keep Button.Root and Vue directive lifecycle real; replace DOM-only helpers, the unused loader and icon rendering.
const stubbedImports = new Set(['./pointer-focus', './ripple', './UProgressCircular.vue', '../components/Icon.vue']);
const generatedFiles = [];

let UiButton;

function createHostNode(type, text = '') {
    const node = {
        type,
        tagName: type.startsWith('#') ? type : type.toUpperCase(),
        text,
        props: {},
        children: [],
        parent: null,
        removeChild(child) {
            const index = this.children.indexOf(child);
            if (index >= 0) this.children.splice(index, 1);
            child.parent = null;
            return child;
        }
    };
    Object.defineProperty(node, 'parentNode', {
        get() {
            return node.parent;
        }
    });
    return node;
}

function readCompilerTypeFile(filePath) {
    return readFileSync(filePath, 'utf8');
}

function isTypeScriptError(diagnostic) {
    return diagnostic.category === ts.DiagnosticCategory.Error;
}

function insertHostNode(node, parent, anchor) {
    if (node.parent) node.parent.removeChild(node);
    node.parent = parent;
    const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1;
    if (anchorIndex < 0) parent.children.push(node);
    else parent.children.splice(anchorIndex, 0, node);
}

const hostRenderer = createRenderer({
    patchProp(node, key, _previous, value) {
        if (value === undefined) delete node.props[key];
        else node.props[key] = value;
    },
    insert: insertHostNode,
    remove(node) {
        if (node.parent) node.parent.removeChild(node);
    },
    createElement(type) {
        return createHostNode(type);
    },
    createText(text) {
        return createHostNode('#text', text);
    },
    createComment(text) {
        return createHostNode('#comment', text);
    },
    setText(node, text) {
        node.text = text;
    },
    setElementText(node, text) {
        node.text = text;
        for (const child of node.children) child.parent = null;
        node.children = [];
    },
    parentNode(node) {
        return node.parent;
    },
    nextSibling(node) {
        if (!node.parent) return null;
        const siblings = node.parent.children;
        return siblings[siblings.indexOf(node) + 1] ?? null;
    }
});

function rewriteStubbedImports(source, stubSpecifier) {
    const replaced = new Set();
    const rewritten = source.replace(/(from\s+)(['"])([^'"]+)\2/g, function replaceImport(match, prefix, quote, specifier) {
        if (!stubbedImports.has(specifier)) return match;
        replaced.add(specifier);
        return `${prefix}${quote}${stubSpecifier}${quote}`;
    });
    assert.deepEqual([...replaced].sort(), [...stubbedImports].sort(), 'only the expected DOM helpers and icon import are stubbed');
    return rewritten;
}

async function loadUiButton() {
    const source = await readFile(componentSourcePath, 'utf8');
    const parsed = parse(source, { filename: componentSourcePath });
    assert.deepEqual(parsed.errors, [], 'UiButton SFC should parse');
    const compiled = compileScript(parsed.descriptor, {
        id: 'button-directives-runtime',
        inlineTemplate: true,
        templateOptions: { compilerOptions: { hoistStatic: false } },
        fs: { fileExists: existsSync, readFile: readCompilerTypeFile }
    });
    const transpiled = ts.transpileModule(compiled.content, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
    });
    const errors = (transpiled.diagnostics ?? []).filter(isTypeScriptError);
    assert.deepEqual(errors, [], 'UiButton script should transpile for the runtime test');

    const generatedId = randomUUID();
    const componentPath = path.join(componentDirectory, `.UiButton.button-directives-${generatedId}.mjs`);
    const stubPath = path.join(componentDirectory, `.UiButton.button-directives-stubs-${generatedId}.mjs`);
    const componentPrefix = `${path.resolve(componentDirectory)}${path.sep}`;
    assert.ok(path.resolve(componentPath).startsWith(componentPrefix), 'generated component must stay inside src/ui');
    assert.ok(path.resolve(stubPath).startsWith(componentPrefix), 'runtime stubs must stay inside src/ui');
    generatedFiles.push(componentPath, stubPath);

    const stubSource = [
        "import { defineComponent, h } from 'vue';",
        'export const vPointerBlur = Object.freeze({});',
        'export const vRipple = Object.freeze({});',
        'export default defineComponent({',
        "    name: 'UiButtonTestIconStub',",
        '    setup() {',
        "        return function renderIconStub() { return h('span'); };",
        '    }',
        '});'
    ].join('\n');
    const stubSpecifier = `./${path.basename(stubPath)}`;
    const componentModule = rewriteStubbedImports(transpiled.outputText, stubSpecifier);
    await writeFile(stubPath, stubSource, 'utf8');
    await writeFile(componentPath, componentModule, 'utf8');
    const loaded = await import(pathToFileURL(componentPath).href);
    UiButton = loaded.default;
}

function mountConsumerButton(props, allowed) {
    const receivedElements = [];
    const hasPermiDirective = {
        mounted(element) {
            receivedElements.push(element);
            if (!allowed && element.parentNode) element.parentNode.removeChild(element);
        }
    };
    const root = createHostNode('root');
    const Consumer = defineComponent({
        name: 'ButtonDirectiveConsumer',
        setup() {
            return function renderConsumer() {
                return withDirectives(
                    h(UiButton, props, { default: function renderButtonContent() { return 'Run'; } }),
                    [[hasPermiDirective, allowed]]
                );
            };
        }
    });
    const app = hostRenderer.createApp(Consumer);
    app.use(createLocalePlugin());
    app.mount(root);
    return { app, root, receivedElements };
}

function assertDirectiveTargetsNativeElement(mounted, tagName) {
    assert.equal(mounted.receivedElements.length, 1, 'consumer directive should mount exactly once');
    assert.equal(mounted.receivedElements[0].tagName, tagName, 'consumer directive should receive the native control');
    assert.equal(mounted.root.children.length, 1, 'an allowed native control should remain mounted');
    assert.equal(mounted.root.children[0], mounted.receivedElements[0]);
}

before(loadUiButton);
after(async function removeGeneratedUiButtonRuntime() {
    for (const generatedFile of generatedFiles) await rm(generatedFile, { force: true });
});

test('consumer mounted directive targets native button and anchor roots while preserving native attributes', function verifyAllowedButtonRoots() {
    const button = mountConsumerButton({ disabled: true, type: 'submit' }, true);
    try {
        assertDirectiveTargetsNativeElement(button, 'BUTTON');
        assert.equal(button.root.children[0].props.disabled, true, 'disabled state remains on the native button');
        assert.equal(button.root.children[0].props.type, 'submit', 'button type remains on the native button');
        assert.equal(button.root.children[0].props['aria-busy'], undefined, 'disabled alone does not mark the button busy');
    } finally {
        button.app.unmount();
    }

    const loading = mountConsumerButton({ loading: true, type: 'submit' }, true);
    try {
        assertDirectiveTargetsNativeElement(loading, 'BUTTON');
        assert.equal(loading.root.children[0].props.disabled, true, 'loading disables the native button');
        assert.equal(loading.root.children[0].props['aria-busy'], true, 'loading state remains exposed to assistive technology');
        assert.equal(loading.root.children[0].props.type, 'submit', 'loading preserves the button type');
    } finally {
        loading.app.unmount();
    }

    const anchor = mountConsumerButton({ href: '/reports' }, true);
    try {
        assertDirectiveTargetsNativeElement(anchor, 'A');
        assert.equal(anchor.root.children[0].props.href, '/reports', 'anchor href remains on the native link');
        assert.equal(anchor.root.children[0].props.type, undefined, 'anchor does not receive a button type');
    } finally {
        anchor.app.unmount();
    }
});

test('consumer mounted directive can remove rejected native button and anchor roots', function verifyRejectedButtonRoots() {
    for (const [props, tagName] of [[{}, 'BUTTON'], [{ href: '/private' }, 'A']]) {
        const mounted = mountConsumerButton(props, false);
        try {
            assert.equal(mounted.receivedElements.length, 1, 'consumer directive should run before access decision');
            assert.equal(mounted.receivedElements[0].tagName, tagName, 'access directive should receive a native element');
            assert.equal(mounted.root.children.length, 0, 'a directive can remove the rejected native control');
            assert.equal(mounted.receivedElements[0].parentNode, null, 'removed control is detached from the consumer root');
        } finally {
            mounted.app.unmount();
        }
    }
});

test('global density updates mounted buttons while explicit dense, density and size stay authoritative', async function verifyReactiveDensity() {
    const density = ref('default');
    const root = createHostNode('root');
    const Consumer = defineComponent({
        setup() {
            provide(defaultsKey, computed(() => ({ global: { density: density.value } })));
            return function renderButtons() {
                return h('div', [
                    h(UiButton, {}, () => 'Inherited'),
                    h(UiButton, { dense: true }, () => 'Dense action'),
                    h(UiButton, { dense: false }, () => 'Explicit regular'),
                    h(UiButton, { density: 'compact' }, () => 'Compact action'),
                    h(UiButton, { size: 48 }, () => 'Fixed size')
                ]);
            };
        }
    });
    const app = hostRenderer.createApp(Consumer);
    app.use(createLocalePlugin());
    app.mount(root);
    const buttons = root.children[0].children.slice();
    try {
        for (const [value, height] of [['default', '36px'], ['comfortable', '34px'], ['compact', '32px'], ['default', '36px']]) {
            density.value = value;
            await nextTick();
            assert.equal(root.children[0].children[0], buttons[0], 'density changes should update without remounting');
            assert.equal(buttons[0].props.style['--ui-button-height'], height);
            assert.equal(buttons[1].props.style['--ui-button-height'], '32px', 'explicit dense stays compact');
            assert.equal(buttons[2].props.style['--ui-button-height'], '36px', 'explicit dense=false stays regular');
            assert.equal(buttons[3].props.style['--ui-button-height'], '32px', 'explicit density stays compact');
            assert.equal(buttons[4].props.style['--ui-button-height'], '48px', 'explicit size stays fixed');
        }
    } finally {
        app.unmount();
    }
});
