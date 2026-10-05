import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp, createRenderer, defineComponent, h, isReadonly, nextTick, ref } from 'vue';
import { createUiTheme, provideUiTheme } from '../src/ui/theme';

function withBrowserGlobals<T>(values: Record<string, unknown>, run: () => T): T {
    const previous = new Map<string, PropertyDescriptor | undefined>();
    for (const [key, value] of Object.entries(values)) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    try {
        return run();
    } finally {
        for (const [key, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else Reflect.deleteProperty(globalThis, key);
        }
    }
}

function isInk(value: unknown, expected: 'black' | 'white') {
    const color = String(value).replace(/\s+/g, '').toLowerCase();
    const accepted = expected === 'black'
        ? ['black', '#000', '#000000', 'rgb(0,0,0)', 'rgba(0,0,0,1)']
        : ['white', '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)'];
    return accepted.includes(color);
}

test('creates isolated built-in themes without requiring a DOM', () => {
    const light = createUiTheme({ defaultTheme: 'light', target: false });
    const dark = createUiTheme({ defaultTheme: 'dark', target: false });

    assert.equal(typeof light.install, 'function', 'the returned service is also a Vue plugin');
    assert.equal(isReadonly(light.themes), false, 'raw theme definitions are writable');
    for (const value of [light.computedThemes, light.current, light.name, light.mode, light.isSystem]) {
        assert.equal(isReadonly(value), true, 'derived theme state is readonly');
    }
    assert.equal(light.mode.value, 'light');
    assert.equal(light.name.value, 'light');
    assert.equal(light.isSystem.value, false);
    assert.equal(light.current.value.colors.primary, light.current.value.colors['accent-text']);
    assert.equal(light.current.value.colors['primary-surface'], light.current.value.colors.accent);
    assert.equal(light.global.name.value, 'light');
    assert.deepEqual(light.global.current.value, light.current.value);
    assert.equal(dark.mode.value, 'dark');
    assert.equal(dark.name.value, 'dark');
    assert.equal(dark.isSystem.value, false);
    assert.equal(dark.current.value.colors.primary, dark.current.value.colors['accent-text']);
    assert.equal(dark.current.value.colors['primary-surface'], dark.current.value.colors.accent);
    assert.notDeepEqual(light.current.value.colors, dark.current.value.colors);
    assert.notStrictEqual(light.themes, dark.themes, 'theme definitions belong to each instance');

    light.dispose();
    dark.dispose();
});

test('instances created from the same custom definitions do not mutate one another or the supplied options', () => {
    const options = { defaultTheme: 'brand', themes: { brand: { colors: { primary: '#246a91' }, variables: { 'code-size': 15 } } } };
    const first = createUiTheme(options);
    const second = createUiTheme(options);
    first.themes.value.brand.colors!.primary = '#e0b040';
    first.themes.value.brand.variables!['code-size'] = 18;
    assert.equal(second.current.value.colors.primary, '#246a91');
    assert.equal(second.current.value.variables['code-size'], 15);
    assert.equal(options.themes.brand.colors.primary, '#246a91');
    assert.equal(options.themes.brand.variables['code-size'], 15);
    first.dispose();
    second.dispose();
});

test('custom dark themes inherit the dark palette and synchronize an omitted primary surface', () => {
    const theme = createUiTheme({
        defaultTheme: 'brand',
        target: false,
        themes: {
            brand: {
                dark: true,
                colors: { primary: '#345678' },
                variables: { 'code-size': 17, 'motion-fast': '90ms' }
            }
        }
    });

    const brand = theme.computedThemes.value.brand;
    const dark = theme.computedThemes.value.dark;
    assert.equal(brand.dark, true);
    assert.equal(brand.colors.background, dark.colors.background);
    assert.equal(brand.colors.primary, '#345678');
    assert.equal(brand.colors['primary-surface'], '#345678');
    assert.equal(brand.variables['code-size'], 17);
    assert.equal(brand.variables['motion-fast'], '90ms');
    assert.equal(theme.current.value.colors.primary, '#345678');

    theme.dispose();
});

test('automatic on-colors use black or white, explicit on-colors win, and variations are named', () => {
    const theme = createUiTheme({
        defaultTheme: 'brand',
        target: false,
        themes: {
            brand: {
                dark: false,
                colors: {
                    primary: '#406080',
                    'primary-surface': '#b08040',
                    'on-primary': '#123456',
                    'on-primary-surface': '#654321'
                }
            },
            automatic: {
                dark: false,
                colors: { primary: '#000000', 'primary-surface': '#ffffff' }
            }
        },
        variations: { colors: ['primary'], lighten: 1, darken: 1 }
    });

    const brand = theme.computedThemes.value.brand.colors;
    const automatic = theme.computedThemes.value.automatic.colors;
    assert.equal(brand['on-primary'], '#123456');
    assert.equal(brand['on-primary-surface'], '#654321');
    assert.notEqual(brand['primary-lighten-1'], brand.primary);
    assert.notEqual(brand['primary-darken-1'], brand.primary);
    assert.ok(isInk(automatic['on-primary'], 'white'));
    assert.ok(isInk(automatic['on-primary-surface'], 'black'));

    theme.dispose();
});

test('editing the writable theme definitions updates computed and current palettes', () => {
    const theme = createUiTheme({
        defaultTheme: 'editable',
        target: false,
        themes: { editable: { dark: false, colors: { primary: '#345678' } } }
    });

    theme.themes.value.editable.colors.primary = '#abcdef';
    theme.themes.value.editable.variables = { 'code-size': '18px' };

    assert.equal(theme.computedThemes.value.editable.colors.primary, '#abcdef');
    assert.equal(theme.current.value.colors.primary, '#abcdef');
    assert.equal(theme.computedThemes.value.editable.variables['code-size'], '18px');

    theme.dispose();
});

test('change rejects unknown names without changing state and tracks requested system mode', async () => {
    const theme = createUiTheme({
        defaultTheme: 'light',
        target: false,
        themes: { custom: { dark: true, colors: { primary: '#234567' } } }
    });
    const beforeColors = JSON.parse(JSON.stringify(theme.current.value.colors));

    await assert.rejects(theme.change('missing'));
    assert.equal(theme.mode.value, 'light');
    assert.equal(theme.name.value, 'light');
    assert.deepEqual(theme.current.value.colors, beforeColors);

    await theme.change('custom');
    assert.equal(theme.mode.value, 'custom');
    assert.equal(theme.name.value, 'custom');
    assert.equal(theme.isSystem.value, false);
    assert.equal(theme.current.value.colors.primary, '#234567');

    const system = createUiTheme({ defaultTheme: 'system', target: false });
    assert.equal(system.mode.value, 'system');
    assert.equal(system.isSystem.value, true);
    assert.ok(system.current.value, 'system mode still resolves a usable palette without browser globals');

    theme.dispose();
    system.dispose();
});

test('toggle and cycle honor supplied names and reject an empty cycle without mutation', async () => {
    const theme = createUiTheme({
        defaultTheme: 'light',
        target: false,
        themes: { brand: { dark: false } }
    });
    const pair = ['light', 'dark'] as const;

    await theme.toggle(pair);
    assert.equal(theme.name.value, 'dark');
    await theme.toggle(pair);
    assert.equal(theme.name.value, 'light');

    const names = ['light', 'brand', 'dark'] as const;
    await theme.cycle(names);
    assert.equal(theme.name.value, 'brand');
    await theme.cycle(names);
    assert.equal(theme.name.value, 'dark');
    await theme.cycle(names);
    assert.equal(theme.name.value, 'light');

    await assert.rejects(theme.cycle([]));
    assert.equal(theme.name.value, 'light');
    theme.dispose();
});

test('a missing target fails before allocating an OS-theme listener', () => {
    let matchMediaCalls = 0;
    const fakeDocument = { querySelector: () => null };
    const fakeWindow = { matchMedia: () => { matchMediaCalls++; return {}; } };
    const theme = createUiTheme({ defaultTheme: 'system', target: '#missing', utilities: false });
    const app = createApp({ render: () => null });

    withBrowserGlobals({ document: fakeDocument, window: fakeWindow }, () => {
        assert.throws(() => theme.install(app), /target not found: #missing/);
    });
    assert.equal(matchMediaCalls, 0, 'failed target lookup leaves no media listener to clean up');
    theme.dispose();
});

test('target false follows system changes without resolving or mutating a DOM target, then disposes its listener', () => {
    let matches = false;
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    let addCount = 0;
    let removeCount = 0;
    let selectorQueries = 0;
    const media = {
        get matches() { return matches; },
        addEventListener: (_type: string, callback: (event: MediaQueryListEvent) => void) => { addCount++; listener = callback; },
        removeEventListener: (_type: string, callback: (event: MediaQueryListEvent) => void) => {
            removeCount++;
            if (listener === callback) listener = undefined;
        }
    };
    const fakeDocument = { querySelector: () => { selectorQueries++; return null; } };
    const fakeWindow = { matchMedia: () => media };
    const theme = createUiTheme({ defaultTheme: 'system', target: false, utilities: false });
    const app = createApp({ render: () => null });

    withBrowserGlobals({ document: fakeDocument, window: fakeWindow }, () => {
        theme.install(app);
        assert.equal(theme.mode.value, 'system');
        assert.equal(theme.name.value, 'light');
        matches = true;
        listener?.({} as MediaQueryListEvent);
        assert.equal(theme.mode.value, 'system', 'mode preserves the requested system selection');
        assert.equal(theme.name.value, 'dark', 'resolved theme tracks the system preference');
        assert.equal(selectorQueries, 0, 'target false does not query for an element');
        theme.dispose();
    });

    assert.equal(addCount, 1);
    assert.equal(removeCount, 1);
    assert.equal(listener, undefined, 'dispose removes the system listener');
});

test('scoped theme context inherits parent changes and local overrides without changing the global selection', async () => {
    const selected = ref<string | undefined>();
    const globalTheme = createUiTheme({ defaultTheme: 'light', target: false });
    let scoped: ReturnType<typeof provideUiTheme> | undefined;
    const renderer = createRenderer<any, any>({
        createElement: (type) => ({ type, children: [] }),
        createText: (text) => ({ text }),
        createComment: (text) => ({ comment: text }),
        setText: (node, text) => { node.text = text; },
        setElementText: (node, text) => { node.text = text; },
        patchProp: () => {},
        insert: (node, parent, anchor) => {
            const index = anchor ? parent.children.indexOf(anchor) : -1;
            if (index < 0) parent.children.push(node);
            else parent.children.splice(index, 0, node);
            node.parent = parent;
        },
        remove: (node) => {
            const index = node.parent?.children.indexOf(node) ?? -1;
            if (index >= 0) node.parent.children.splice(index, 1);
        },
        parentNode: (node) => node.parent,
        nextSibling: (node) => {
            const siblings = node.parent?.children ?? [];
            return siblings[siblings.indexOf(node) + 1] ?? null;
        }
    });
    const Root = defineComponent({
        setup() {
            scoped = provideUiTheme(() => selected.value);
            return () => h('root');
        }
    });
    const app = renderer.createApp(Root);
    app.use(globalTheme);
    app.mount({ type: 'host', children: [] });

    assert.ok(scoped);
    assert.equal(scoped.mode.value, 'light');
    selected.value = 'dark';
    await nextTick();
    assert.equal(scoped.name.value, 'dark');
    assert.equal(globalTheme.name.value, 'light');

    selected.value = undefined;
    await globalTheme.change('dark');
    await nextTick();
    assert.equal(scoped.mode.value, 'dark', 'an omitted local name follows the parent mode');
    assert.deepEqual(scoped.current.value, globalTheme.current.value);

    app.unmount();
});
