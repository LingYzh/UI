import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { createApp } from 'vue';
import { createUiTheme } from '../src/ui/theme';

function setup(context: TestContext) {
    const properties = new Map<string, string>();
    const styles = new Set<any>();
    const transitions: any[] = [];
    const root = {
        dataset: {} as Record<string, string>,
        style: {
            getPropertyValue: (key: string) => properties.get(key) ?? '',
            setProperty: (key: string, value: string) => properties.set(key, value),
            removeProperty: (key: string) => properties.delete(key)
        },
        removeAttribute(name: string) {
            delete this.dataset[name === 'data-ui-theme' ? 'uiTheme' : 'theme'];
        }
    };
    const document = {
        documentElement: root,
        head: { append: (style: unknown) => styles.add(style) },
        createElement() {
            let text = '';
            return {
                id: '',
                writes: 0,
                get textContent() { return text; },
                set textContent(value: string) { text = value; this.writes++; },
                remove() { styles.delete(this); }
            };
        },
        startViewTransition(update: () => void) {
            let skipped = false;
            let finish!: () => void;
            const updateCallbackDone = Promise.resolve().then(update);
            const transition = {
                updateCallbackDone,
                ready: updateCallbackDone.then(() => {
                    if (skipped) throw new Error('AbortError: transition skipped before ready');
                }),
                finished: new Promise<void>(resolve => { finish = resolve; }),
                skipTransition() { skipped = true; finish(); },
                finish() { finish(); }
            };
            transitions.push(transition);
            return transition;
        }
    };
    const globals = {
        document,
        window: {
            matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
        },
        MutationObserver: class { observe() {} disconnect() {} }
    };
    const previous = new Map<string, PropertyDescriptor | undefined>();
    for (const [key, value] of Object.entries(globals)) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const theme = createUiTheme();
    theme.install(createApp({ render: () => null }));
    context.after(() => {
        theme.dispose();
        for (const [key, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else Reflect.deleteProperty(globalThis, key);
        }
    });
    return { theme, styles, transitions, root, properties };
}

test('switching existing themes leaves utility CSS unchanged and palette edits still update it', async context => {
    const { theme, styles, root, properties } = setup(context);
    const utility = [...styles].find(style => style.id.startsWith('ui-theme-'));
    const initialWrites = utility.writes;
    await theme.change('dark', false);
    assert.equal(root.dataset.theme, 'dark');
    assert.equal(properties.get('--background'), theme.current.value.colors.background);
    await theme.change('light', false);
    assert.equal(root.dataset.theme, 'light');
    assert.equal(utility.writes, initialWrites, 'selecting a theme must not rewrite identical utility rules');

    theme.themes.value.light.colors!.brand = '#123456';
    assert.equal(utility.writes, initialWrites + 1);
    assert.match(utility.textContent, /\.text-brand\{/);
    assert.equal(properties.get('--brand'), '#123456');
});

test('replacing a pending transition handles ready rejection and only applies the latest theme', async context => {
    const { theme, styles, transitions, root } = setup(context);
    const first = theme.change('dark');
    const second = theme.change('light');
    await Promise.all([first, second]);
    transitions.at(-1).finish();
    // An unhandled ready rejection is reported by node:test at this boundary.
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(root.dataset.theme, 'light');
    assert.equal(theme.name.value, 'light');
    assert.equal(styles.size, 1, 'only the persistent utility stylesheet remains');
});

test('disabling animation during a pending transition preserves the immediate target and cleans styles', async context => {
    const { theme, styles, root } = setup(context);
    const animated = theme.change('dark');
    await theme.change('light', false);
    await animated;
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(root.dataset.theme, 'light');
    assert.equal(styles.size, 1);
});

test('light reveals the new snapshot while built-in and custom dark themes contract the old snapshot', async context => {
    const { theme, styles, transitions } = setup(context);
    theme.themes.value.midnight = { dark: true, colors: { primary: '#8ecce9' } };
    for (const [name, dark] of [['dark', true], ['light', false], ['midnight', true]] as const) {
        await theme.change(name, { origin: '80% 10%', duration: 320 });
        const transitionStyle = [...styles].find(style => !style.id);
        assert.match(transitionStyle.textContent, dark
            ? /::view-transition-old\(root\)\{animation:ui-theme-conceal 320ms ease-in-out both\}/
            : /::view-transition-new\(root\)\{animation:ui-theme-reveal 320ms ease-in-out both\}/);
        assert.match(transitionStyle.textContent, /mix-blend-mode:normal/);
        assert.ok(transitionStyle.textContent.includes('circle(0% at 80% 10%)'));
        transitions.at(-1).finish();
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(styles.size, 1);
    }
});
