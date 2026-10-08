import assert from 'node:assert/strict';
import test from 'node:test';
import { computed, createRenderer, defineComponent, h, provide, ref, type Component, type ComputedRef, type Ref } from 'vue';
import { defaultsKey, mergeDefaults, provideDefaults, type UIDefaults, type UIDefaultsProviderOptions } from '../src/ui/defaults';

interface HostNode {
    type: string;
    text: string;
    props: Record<string, unknown>;
    children: HostNode[];
    parent: HostNode | null;
}

interface DefaultsLayer {
    source: Ref<UIDefaults | undefined>;
    options?: UIDefaultsProviderOptions | (() => boolean);
}

function createHostNode(type: string, text = ''): HostNode {
    return { type, text, props: {}, children: [], parent: null };
}

const hostRenderer = createRenderer<HostNode, HostNode>({
    patchProp(node, key, _previous, value) {
        node.props[key] = value;
    },
    insert(node, parent, anchor) {
        if (node.parent) {
            const siblings = node.parent.children;
            const oldIndex = siblings.indexOf(node);
            if (oldIndex >= 0) siblings.splice(oldIndex, 1);
        }

        node.parent = parent;
        const index = anchor ? parent.children.indexOf(anchor) : -1;
        if (index < 0) parent.children.push(node);
        else parent.children.splice(index, 0, node);
    },
    remove(node) {
        if (!node.parent) return;
        const siblings = node.parent.children;
        const index = siblings.indexOf(node);
        if (index >= 0) siblings.splice(index, 1);
        node.parent = null;
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

function mountDefaultsTree(appSource: Ref<UIDefaults>, layers: DefaultsLayer[]) {
    const values: ComputedRef<UIDefaults>[] = [];

    function createLayer(index: number): Component {
        const child = index + 1 < layers.length
            ? createLayer(index + 1)
            : defineComponent({ setup: () => () => h('span') });

        return defineComponent({
            name: `DefaultsLayer${index}`,
            setup() {
                const layer = layers[index];
                const source = () => layer.source.value;
                const current = layer.options && typeof layer.options === 'function'
                    ? provideDefaults(source, layer.options)
                    : provideDefaults(source, layer.options as UIDefaultsProviderOptions | undefined);
                values[index] = current;
                return () => h(child);
            }
        });
    }

    const appRoot = defineComponent({
        setup() {
            provide(defaultsKey, computed(() => appSource.value));
            return () => h(createLayer(0));
        }
    });
    const root = createHostNode('root');
    const app = hostRenderer.createApp(appRoot);
    app.mount(root);

    return {
        values,
        unmount() {
            app.unmount();
        }
    };
}

test('deep defaults merge nested records, replace arrays, skip undefined, and keep inputs unmodified', () => {
    const parent = {
        UButton: {
            color: 'blue',
            nested: { parentOnly: true, shared: 'parent' },
            items: [1, 2]
        }
    } satisfies UIDefaults;
    const child = {
        UButton: {
            color: undefined,
            nested: { childOnly: true, shared: 'child' },
            items: [3]
        }
    } satisfies UIDefaults;

    const merged = mergeDefaults(parent, child);
    assert.deepEqual(merged, {
        UButton: {
            color: 'blue',
            nested: { parentOnly: true, childOnly: true, shared: 'child' },
            items: [3]
        }
    });
    assert.notEqual(merged.UButton.nested, parent.UButton.nested);
    assert.notEqual(merged.UButton.items, child.UButton.items);
    (merged.UButton.nested as Record<string, unknown>).parentOnly = false;
    assert.equal(parent.UButton.nested.parentOnly, true, 'mutating a merged result cannot mutate either input');
    assert.deepEqual(parent.UButton.nested, { parentOnly: true, shared: 'parent' });
    assert.deepEqual(child.UButton.nested, { childOnly: true, shared: 'child' });

    const unsafe = JSON.parse('{"UButton":{"__proto__":{"polluted":true},"constructor":{"polluted":true},"nested":{"prototype":{"polluted":true},"safe":1}}}') as UIDefaults;
    assert.deepEqual(mergeDefaults({}, unsafe), { UButton: { nested: { safe: 1 } } });
    assert.equal(({} as { polluted?: boolean }).polluted, undefined);
});

test('provider ancestry deep-merges defaults and retains inherited values when a child supplies undefined', () => {
    const appSource = ref<UIDefaults>({
        UProbe: {
            color: 'app',
            nested: { appOnly: true, shared: 'app' },
            items: [1]
        }
    });
    const outerSource = ref<UIDefaults>({
        UProbe: {
            color: 'outer',
            nested: { outerOnly: true, shared: 'outer' },
            items: [2]
        }
    });
    const innerSource = ref<UIDefaults>({
        UProbe: {
            color: undefined,
            nested: { innerOnly: true, shared: 'inner' },
            items: [3]
        }
    });
    const tree = mountDefaultsTree(appSource, [
        { source: outerSource },
        { source: innerSource }
    ]);

    try {
        assert.deepEqual(tree.values[1].value.UProbe, {
            color: 'outer',
            nested: { appOnly: true, outerOnly: true, innerOnly: true, shared: 'inner' },
            items: [3]
        });
        assert.deepEqual(innerSource.value?.UProbe.nested, { innerOnly: true, shared: 'inner' });

        appSource.value = { UProbe: { color: 'next app', nested: { appOnly: true } } };
        assert.equal(tree.values[1].value.UProbe.color, 'outer');
        assert.deepEqual(tree.values[1].value.UProbe.nested, {
            appOnly: true,
            outerOnly: true,
            innerOnly: true,
            shared: 'inner'
        });
    } finally {
        tree.unmount();
    }
});

test('reset number, string, and true use the inclusive ancestor traversal; root uses app defaults', () => {
    const appSource = ref<UIDefaults>({ UProbe: { level: 'app' } });
    const reset = ref<boolean | number | string | undefined>(undefined);
    const root = ref<boolean | string | undefined>(undefined);
    const grandparentSource = ref<UIDefaults>({ UProbe: { level: 'grandparent' } });
    const parentSource = ref<UIDefaults>({ UProbe: { level: 'parent' } });
    const localSource = ref<UIDefaults>({ UProbe: { level: 'local' } });
    const tree = mountDefaultsTree(appSource, [
        { source: grandparentSource },
        { source: parentSource },
        { source: localSource, options: { reset: () => reset.value, root: () => root.value } }
    ]);

    try {
        const value = () => tree.values[2].value.UProbe.level;
        assert.equal(value(), 'local');

        reset.value = 1;
        assert.equal(value(), 'grandparent', 'reset=1 walks local->parent and parent->grandparent');
        reset.value = '1';
        assert.equal(value(), 'grandparent', 'numeric strings follow Number(reset)');
        reset.value = true;
        assert.equal(value(), 'grandparent', 'true is Number(true)=1 and does not clear to the app root');
        reset.value = 2;
        assert.equal(value(), 'app');

        reset.value = undefined;
        root.value = true;
        assert.equal(value(), 'app', 'root=true starts at the app defaults captured from defaultsKey');
        root.value = false;
        reset.value = undefined;
    } finally {
        tree.unmount();
    }
});

test('root string merges the current parent named defaults map onto the app root', () => {
    const appSource = ref<UIDefaults>({
        UButton: { size: 'small', color: 'app' },
        named: { UButton: { size: 'large', color: 'named app' } }
    });
    const parentSource = ref<UIDefaults>({
        named: { UButton: { size: 'x-large', color: 'named parent' } }
    });
    const localSource = ref<UIDefaults>({
        UButton: { size: 'md', color: 'local' }
    });
    const tree = mountDefaultsTree(appSource, [
        { source: parentSource },
        { source: localSource, options: { root: 'named' } }
    ]);

    try {
        assert.deepEqual(tree.values[1].value.UButton, { size: 'x-large', color: 'named parent' });

        parentSource.value = { named: { UButton: { size: 'large', color: 'updated named parent' } } };
        assert.deepEqual(tree.values[1].value.UButton, { size: 'large', color: 'updated named parent' });
    } finally {
        tree.unmount();
    }
});

test('scoped and disabled options update dynamically, with disabled passing through the exact parent value', () => {
    const appSource = ref<UIDefaults>({ UButton: { size: 'app', color: 'app' } });
    const parentSource = ref<UIDefaults>({ UButton: { size: 'parent', color: 'parent' } });
    const localSource = ref<UIDefaults>({ UButton: { size: 'local' } });
    const scoped = ref(false);
    const disabled = ref(false);
    const tree = mountDefaultsTree(appSource, [
        { source: parentSource },
        { source: localSource, options: { scoped: () => scoped.value, disabled: () => disabled.value } }
    ]);

    try {
        assert.deepEqual(tree.values[1].value.UButton, { size: 'local', color: 'parent' });

        scoped.value = true;
        assert.equal(tree.values[1].value.UButton.size, 'local');
        assert.equal(tree.values[1].value.UButton.color, undefined, 'scoped returns local defaults without merging parent component defaults');
        assert.equal(tree.values[1].value.prev, tree.values[0].value);

        disabled.value = true;
        assert.equal(tree.values[1].value, tree.values[0].value, 'disabled directly returns the parent defaults object');
        localSource.value = { UButton: { size: 'updated local' } };
        assert.equal(tree.values[1].value, tree.values[0].value);

        disabled.value = false;
        assert.equal(tree.values[1].value.UButton.size, 'updated local');
    } finally {
        tree.unmount();
    }
});

test('the original reset getter signature remains valid and uses standard numeric reset semantics', () => {
    const appSource = ref<UIDefaults>({ UProbe: { level: 'app' } });
    const parentSource = ref<UIDefaults>({ UProbe: { level: 'parent' } });
    const localSource = ref<UIDefaults>({ UProbe: { level: 'local' } });
    const enabled = ref(false);
    const tree = mountDefaultsTree(appSource, [
        { source: parentSource },
        { source: localSource, options: () => enabled.value }
    ]);

    try {
        assert.equal(tree.values[1].value.UProbe.level, 'local');
        enabled.value = true;
        assert.equal(tree.values[1].value.UProbe.level, 'app');
    } finally {
        tree.unmount();
    }
});
