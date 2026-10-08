import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { computed, defineComponent, h, provide } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { compileScript, parse } from '@vue/compiler-sfc';
import { createServer } from 'vite';
import { defaultsKey, useDefaults } from '../src/ui/defaults';

const scopedProps: Record<string, string> = {
    UAppBar: 'height', UToolbar: 'density', UFooter: 'height', USystemBar: 'height', UNavigationDrawer: 'modelValue',
    UList: 'modelValue', UListItem: 'active', UListGroup: 'modelValue', UListSubheader: 'title',
    UTreeview: 'activated', UVirtualScroll: 'itemHeight', UAvatar: 'size', UBadge: 'content', UDivider: 'thickness',
    USheet: 'elevation', UEmptyState: 'title', USkeletonLoader: 'loading', UBanner: 'modelValue',
    UBreadcrumbs: 'divider', UBreadcrumbsItem: 'active', UBottomNavigation: 'modelValue', UBottomSheet: 'modelValue',
    ULabel: 'required', UMessages: 'error', UCounter: 'value', UOverlay: 'modelValue',
    UiMenu: 'modelValue', UiDialog: 'modelValue', UiTooltip: 'modelValue'
};

const optionalBooleanModels: Record<string, string[]> = {
    UiMenu: ['modelValue', 'open'], UiDialog: ['modelValue', 'open'], UiTooltip: ['modelValue'],
    UOverlay: ['modelValue'], UNavigationDrawer: ['modelValue'], UList: ['modelValue', 'activated'], UListGroup: ['modelValue'],
    UListItem: ['active'], UTreeview: ['activated'], UBanner: ['modelValue'], UBottomSheet: ['modelValue']
};

test('layout and display components compile real props and scoped defaults', () => {
    for (const [name, prop] of Object.entries(scopedProps)) {
        const filename = join(process.cwd(), 'src', 'ui', `${name}.vue`);
        const descriptor = parse(readFileSync(filename, 'utf8'), { filename }).descriptor;
        const compiled = compileScript(descriptor, { id: name, fs: { fileExists: existsSync, readFile: (path) => readFileSync(path, 'utf8') } }).content;
        assert.match(compiled, new RegExp(`['"]?${prop}['"]?:\\s*\\{`), `${name} must expose ${prop} at runtime`);
        assert.match(compiled, /const rawProps = __props/, `${name} must bind raw Vue props before defaults`);
        const defaultsName = name.replace(/^Ui(?=[A-Z])/, 'U');
        assert.match(compiled, new RegExp(`useDefaults\\(rawProps, ['"]${defaultsName}['"]\\)`), `${name} must read scoped defaults`);
        for (const model of optionalBooleanModels[name] ?? []) {
            assert.match(compiled, new RegExp(`\\b${model}:\\s*\\{[^}]*default: undefined`), `${name}.${model} must preserve omitted vs false`);
        }
    }
});

test('compiled Vue Boolean models keep old open aliases and scoped defaults in SSR', { timeout: 60_000 }, async () => {
    const vite = await createServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true }, appType: 'custom', logLevel: 'silent' });
    try {
        for (const file of ['UiMenu', 'UiDialog', 'UiTooltip', 'UOverlay', 'UNavigationDrawer', 'UListGroup']) {
            const component = (await vite.ssrLoadModule(`/src/ui/${file}.vue`)).default as { props: Record<string, unknown> };
            const canonical = file.replace(/^Ui(?=[A-Z])/, 'U');
            async function inspect(incoming: Record<string, unknown>, defaults: Record<string, unknown> = {}) {
                let result: Record<string, unknown> = {};
                const Probe = defineComponent({
                    props: component.props,
                    setup(raw) {
                        const effective = useDefaults(raw, canonical) as Record<string, unknown>;
                        result = { rawModel: raw.modelValue, model: effective.modelValue, rawOpen: raw.open, open: effective.open };
                        return () => h('span');
                    }
                });
                const Root = defineComponent({
                    setup() {
                        provide(defaultsKey, computed(() => ({ [canonical]: defaults })));
                        return () => h(Probe, { ...(file === 'UiTooltip' ? { text: 'tooltip' } : {}), ...(file === 'UListGroup' ? { value: 'group' } : {}), ...incoming });
                    }
                });
                await renderToString(h(Root));
                return result;
            }
            const omitted = await inspect({});
            assert.equal(omitted.rawModel, undefined, `${file} omitted modelValue must remain undefined`);
            assert.equal(omitted.model, undefined, `${file} omitted modelValue without defaults`);
            const explicit = await inspect({ modelValue: false }, { modelValue: true });
            assert.equal(explicit.model, false, `${file} explicit false must beat scoped true`);
            const scoped = await inspect({}, { modelValue: true });
            assert.equal(scoped.model, true, `${file} scoped default must apply`);
            if (file === 'UiMenu' || file === 'UiDialog') {
                const legacy = await inspect({ open: true });
                assert.equal(legacy.rawModel, undefined, `${file} modelValue must not mask legacy open`);
                assert.equal(legacy.open, true, `${file} legacy open remains true`);
                const priority = await inspect({ modelValue: false, open: true });
                assert.equal(priority.model, false, `${file} explicit modelValue takes priority`);
            }
            if (file === 'UiMenu') {
                const activator = ({ props }: { props: Record<string, unknown> }) => h('button', props, 'Open');
                const legacyMarkup = await renderToString(h(component as never, { open: true }, { activator, default: () => h('span', 'Item') }));
                assert.match(legacyMarkup, /aria-expanded="true"/, 'legacy open controls the real menu activator');
                const controlledMarkup = await renderToString(h(component as never, { open: true, modelValue: false }, { activator, default: () => h('span', 'Item') }));
                assert.match(controlledMarkup, /aria-expanded="false"/, 'modelValue false takes priority in the real menu');
            }
        }
    } finally {
        await vite.close();
    }
});
