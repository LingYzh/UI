import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import vue from '@vitejs/plugin-vue';
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc';

test('UCascader generic script and template compile as a Vue SFC', () => {
    const filename = join(process.cwd(), 'src', 'ui', 'UiCascader.vue');
    const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename });
    assert.deepEqual(errors, []);
    assert.ok(descriptor.template);

    const fs = { fileExists: existsSync, readFile: (path: string) => readFileSync(path, 'utf8') };
    const script = compileScript(descriptor, { id: 'ui-cascader-advanced', fs });
    const template = compileTemplate({
        source: descriptor.template.content,
        filename,
        id: 'ui-cascader-advanced',
        compilerOptions: { bindingMetadata: script.bindings }
    });

    assert.deepEqual(template.errors, []);
    assert.match(script.content, /multiple/);
    assert.match(script.content, /multiple: \{\s*type: Boolean\b/, 'bare multiple attributes must use Vue Boolean prop coercion');
    assert.match(script.content, /modelValue/);
});

test('UCascader exposes chips and collapsed-tag defaults through Vue runtime props', { timeout: 120_000 }, async () => {
    const viteServer = await createServer({
        root: process.cwd(),
        configFile: false,
        plugins: [vue()],
        optimizeDeps: { noDiscovery: true, include: [] },
        appType: 'custom',
        server: { middlewareMode: true },
        resolve: { dedupe: ['vue'] },
        logLevel: 'silent'
    });
    try {
        const component = (await viteServer.ssrLoadModule('/src/ui/UiCascader.vue')).default as {
            props: Record<string, { default?: unknown } | undefined>;
        };
        const Probe = defineComponent({
            props: component.props,
            setup(props: { chips?: boolean; collapseTags?: boolean; maxCollapseTags?: number }) {
                return () => h('span', {
                    'data-chips': String(props.chips),
                    'data-collapse-tags': String(props.collapseTags),
                    'data-max-collapse-tags': String(props.maxCollapseTags)
                });
            }
        });
        const markup = await renderToString(createSSRApp(h(Probe, { items: [] })));
        assert.match(markup, /data-chips="true"/);
        assert.match(markup, /data-collapse-tags="false"/);
        assert.match(markup, /data-max-collapse-tags="1"/);
    } finally {
        await viteServer.close();
    }
});

test('UCascader component example script and template compile as a Vue SFC', () => {
    const filename = join(process.cwd(), 'src', 'ui', 'docs', 'component-examples', 'cascader.vue');
    const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename });
    assert.deepEqual(errors, []);
    assert.ok(descriptor.template);

    const fs = { fileExists: existsSync, readFile: (path: string) => readFileSync(path, 'utf8') };
    const script = compileScript(descriptor, { id: 'ui-cascader-example', fs });
    const template = compileTemplate({
        source: descriptor.template.content,
        filename,
        id: 'ui-cascader-example',
        compilerOptions: { bindingMetadata: script.bindings }
    });

    assert.deepEqual(template.errors, []);
});