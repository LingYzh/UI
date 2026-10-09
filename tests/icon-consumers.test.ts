import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { createSSRApp, defineComponent, h, type Component } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({
    root,
    configFile: false,
    plugins: [vue()],
    appType: 'custom',
    server: { middlewareMode: true, watch: { ignored: ['**/artifacts/**'] } },
    resolve: { dedupe: ['vue'] },
    logLevel: 'error'
});

after(async function closeViteSsrServer() {
    await vite.close();
});

const moduleCache = new Map<string, Promise<Record<string, any>>>();
function loadSsrModule(file: string): Promise<Record<string, any>> {
    let loaded = moduleCache.get(file);
    if (!loaded) {
        loaded = vite.ssrLoadModule(file);
        moduleCache.set(file, loaded);
    }
    return loaded;
}

async function loadComponent(file: string): Promise<Component> {
    const module = await loadSsrModule(file);
    assert.ok(module.default, `${file} exports a Vue component`);
    return module.default as Component;
}

const pathOne = 'M2 2h20v20H2z';
const pathTwo = 'M4 4h16v16H4z';
const pathArray = [pathOne, [pathTwo, 0.35]];
const objectIcon = defineComponent({
    name: 'ProtocolObjectIcon',
    setup() {
        return function renderObjectIcon() {
            return h('strong', { class: 'protocol-object-icon' }, 'object icon');
        };
    }
});
const functionalIcon: Component = function ProtocolFunctionalIcon() {
    return h('strong', { class: 'protocol-functional-icon' }, 'functional icon');
};

function invalidPropWarnings(warnings: string[]): string[] {
    return warnings.filter(function isInvalidPropWarning(message) {
        return /invalid prop|type check failed/i.test(message);
    });
}

async function renderSsrComponent(
    component: Component,
    props: Record<string, unknown>,
    slots?: Record<string, (...args: any[]) => unknown>,
    iconOptions?: Record<string, unknown>
): Promise<{ html: string; warnings: string[] }> {
    const warnings: string[] = [];
    const app = createSSRApp(defineComponent({
        name: 'IconProtocolSsrRoot',
        render() {
            return h(component, props as any, slots as any);
        }
    }));

    if (iconOptions) {
        const iconApi = await loadSsrModule('/src/ui/icon-config.ts');
        app.provide(iconApi.iconKey, iconApi.createIcons(iconOptions));
    }
    app.config.warnHandler = function collectVueWarning(message) {
        warnings.push(message);
    };

    return { html: await renderToString(app), warnings };
}

function svgPathData(markup: string): string[] {
    return [...markup.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(function pathData(match) {
        return match[1];
    });
}

function runtimeTypeConstructors(component: Component, propName: string): Function[] | undefined {
    const prop = (component as any).props?.[propName];
    assert.ok(Object.hasOwn((component as any).props ?? {}, propName), `${(component as any).name ?? 'component'} exposes runtime prop ${propName}`);
    if (prop == null) return undefined;
    const type = typeof prop === 'function' ? prop : prop.type;
    if (type == null) return undefined;
    return Array.isArray(type) ? type : [type];
}

function assertRuntimePropAcceptsIconValue(component: Component, propName: string, componentName: string): void {
    const types = runtimeTypeConstructors(component, propName);
    if (!types) return;

    assert.ok(types.includes(Array), `${componentName}.${propName} accepts path arrays at runtime`);
    assert.ok(types.includes(Object), `${componentName}.${propName} accepts object Vue components at runtime (constructors: ${types.map(type => type.name || String(type)).join(", ")})`);
    assert.ok(types.includes(Function), `${componentName}.${propName} accepts functional Vue components at runtime`);
}

test('createIcons normalizes built-in defaults, aliases, and custom icon sets', async () => {
    const { createIcons, resolveIcon } = await loadSsrModule('/src/ui/icon-config.ts');
    const defaults = createIcons();
    assert.equal(defaults.defaultSet, 'mdi');
    assert.ok(defaults.sets.mdi, 'the MDI set remains registered by default');
    assert.ok(defaults.sets.svg, 'the explicit SVG set remains registered by default');
    assert.ok(Object.keys(defaults.aliases).length > 0, 'built-in aliases are preserved');

    const custom = createIcons({
        defaultSet: 'protocol',
        aliases: { protocolPath: pathOne },
        sets: { protocol: { component: objectIcon, paths: { device: pathTwo } } }
    });
    assert.equal(custom.defaultSet, 'protocol');
    assert.equal(custom.aliases.protocolPath, pathOne);
    assert.equal(custom.sets.protocol.paths?.device, pathTwo);
    assert.ok(custom.sets.mdi && custom.sets.svg, 'custom options extend the built-in sets');
    assert.equal(resolveIcon('$protocolPath', { aliases: { protocolPath: pathOne } }).path, pathOne);
});

test('compiled consumer SFCs accept IconValue strings, path arrays, and Vue components', async () => {
    const carouselItem = await loadComponent('/src/ui/UCarouselItem.vue');
    const consumers: Array<{
        name: string;
        file: string;
        iconProps: string[];
        propsFor: (icon: unknown) => Record<string, unknown>;
        slotsFor?: () => Record<string, (...args: any[]) => unknown>;
    }> = [
        {
            name: 'Icon',
            file: '/src/components/Icon.vue',
            iconProps: ['icon'],
            propsFor: icon => ({ icon, size: 24 })
        },
        {
            name: 'UiButton',
            file: '/src/ui/UiButton.vue',
            iconProps: ['icon', 'prependIcon', 'appendIcon'],
            propsFor: icon => ({ icon, prependIcon: icon, appendIcon: icon })
        },
        {
            name: 'UiInput',
            file: '/src/ui/UiInput.vue',
            iconProps: ['clearIcon'],
            propsFor: icon => ({ label: 'Input', modelValue: 'typed value', clearable: true, persistentClear: true, clearIcon: icon })
        },
        {
            name: 'UiCard',
            file: '/src/ui/UiCard.vue',
            iconProps: ['prependIcon', 'appendIcon'],
            propsFor: icon => ({ title: 'Card', prependIcon: icon, appendIcon: icon })
        },
        {
            name: 'UiPagination',
            file: '/src/ui/UiPagination.vue',
            iconProps: ['prevIcon', 'nextIcon', 'firstIcon', 'lastIcon'],
            propsFor: icon => ({ length: 5, modelValue: 3, showFirstLastPage: true, prevIcon: icon, nextIcon: icon, firstIcon: icon, lastIcon: icon })
        },
        {
            name: 'UCarousel',
            file: '/src/ui/UCarousel.vue',
            iconProps: ['delimiterIcon'],
            propsFor: icon => ({ delimiterIcon: icon, showArrows: false }),
            slotsFor: () => ({
                default: () => [
                    h(carouselItem, { value: 'one' }, { default: () => 'One' }),
                    h(carouselItem, { value: 'two' }, { default: () => 'Two' })
                ]
            })
        },
        {
            name: 'UStepperItem',
            file: '/src/ui/UStepperItem.vue',
            iconProps: ['icon'],
            propsFor: icon => ({ title: 'Step', value: 'step', icon })
        },
        {
            name: 'UStepperVerticalItem',
            file: '/src/ui/UStepperVerticalItem.vue',
            iconProps: ['icon'],
            propsFor: icon => ({ title: 'Step', value: 'step', icon })
        },
        {
            name: 'UStepper items',
            file: '/src/ui/UStepper.vue',
            iconProps: [],
            propsFor: icon => ({
                modelValue: 'step',
                hideActions: true,
                items: [{ title: 'Step', value: 'step', props: { icon } }]
            })
        },
        {
            name: 'UStepperVertical items',
            file: '/src/ui/UStepperVertical.vue',
            iconProps: [],
            propsFor: icon => ({
                modelValue: 'step',
                hideActions: true,
                items: [{ title: 'Step', value: 'step', props: { icon } }]
            })
        },
        {
            name: 'UField',
            file: '/src/ui/UField.vue',
            iconProps: ['clearIcon', 'prependInnerIcon', 'appendInnerIcon'],
            propsFor: icon => ({ label: 'Field', active: true, dirty: true, clearable: true, clearIcon: icon, prependInnerIcon: icon, appendInnerIcon: icon }),
            slotsFor: () => ({ default: () => h('input', { value: 'field value' }) })
        },
        {
            name: 'UiSwitch',
            file: '/src/ui/UiSwitch.vue',
            iconProps: ['trueIcon', 'falseIcon'],
            propsFor: icon => ({ modelValue: true, label: 'Switch', trueIcon: icon, falseIcon: icon })
        },
        {
            name: 'UDataTable',
            file: '/src/ui/UDataTable.vue',
            iconProps: ['sortIcon', 'sortAscIcon', 'sortDescIcon', 'expandIcon', 'collapseIcon', 'groupExpandIcon', 'groupCollapseIcon', 'firstIcon', 'lastIcon', 'prevIcon', 'nextIcon'],
            propsFor: icon => ({
                headers: [{ title: 'Name', key: 'name', sortable: true }],
                items: [{ name: 'Row' }],
                sortBy: [{ key: 'name', order: 'asc' }],
                showExpand: true,
                showFirstLastPage: true,
                hideDefaultFooter: true,
                sortIcon: icon,
                sortAscIcon: icon,
                sortDescIcon: icon,
                expandIcon: icon,
                collapseIcon: icon,
                groupExpandIcon: icon,
                groupCollapseIcon: icon,
                firstIcon: icon,
                lastIcon: icon,
                prevIcon: icon,
                nextIcon: icon
            })
        },
        {
            name: 'UDataTableVirtual',
            file: '/src/ui/UDataTableVirtual.vue',
            iconProps: ['sortIcon', 'sortAscIcon', 'sortDescIcon', 'expandIcon', 'collapseIcon', 'groupExpandIcon', 'groupCollapseIcon'],
            propsFor: icon => ({
                headers: [{ title: 'Name', key: 'name', sortable: true }],
                items: [{ name: 'Row' }],
                sortBy: [{ key: 'name', order: 'asc' }],
                showExpand: true,
                showFirstLastPage: true,
                hideDefaultFooter: true,
                sortIcon: icon,
                sortAscIcon: icon,
                sortDescIcon: icon,
                expandIcon: icon,
                collapseIcon: icon,
                groupExpandIcon: icon,
                groupCollapseIcon: icon
            })
        },
        {
            name: 'UiDataTableServer',
            file: '/src/ui/UiDataTableServer.vue',
            iconProps: ['sortIcon', 'sortAscIcon', 'sortDescIcon', 'expandIcon', 'collapseIcon', 'groupExpandIcon', 'groupCollapseIcon', 'firstIcon', 'lastIcon', 'prevIcon', 'nextIcon'],
            propsFor: icon => ({
                headers: [{ title: 'Name', key: 'name', sortable: true }],
                items: [{ name: 'Row' }],
                itemsLength: 1,
                sortBy: [{ key: 'name', order: 'asc' }],
                showExpand: true,
                showFirstLastPage: true,
                hideDefaultFooter: true,
                sortIcon: icon,
                sortAscIcon: icon,
                sortDescIcon: icon,
                expandIcon: icon,
                collapseIcon: icon,
                groupExpandIcon: icon,
                groupCollapseIcon: icon,
                firstIcon: icon,
                lastIcon: icon,
                prevIcon: icon,
                nextIcon: icon
            })
        },
        {
            name: 'UHotkey nested keyMap icons',
            file: '/src/ui/UHotkey.vue',
            iconProps: [],
            propsFor: icon => ({
                keys: 'ctrl',
                displayMode: 'icon',
                platform: 'pc',
                listen: false,
                keyMap: { ctrl: { default: { text: 'Control', icon } } }
            })
        }
    ];

    const loadedConsumers = await Promise.all(consumers.map(async consumer => ({
        ...consumer,
        component: await loadComponent(consumer.file)
    })));
    const values = [
        { name: 'string SVG path', value: pathOne },
        { name: 'path array with opacity', value: pathArray },
        { name: 'object Vue component', value: objectIcon },
        { name: 'functional Vue component', value: functionalIcon }
    ];

    for (const consumer of loadedConsumers) {
        for (const propName of consumer.iconProps) {
            assertRuntimePropAcceptsIconValue(consumer.component, propName, consumer.name);
        }
    }

    for (const iconValue of values) {
        const warnings: string[] = [];
        const tree = defineComponent({
            name: 'IconConsumerRuntimeFixture',
            render() {
                return h('main', null, loadedConsumers.map(consumer => h('section', {
                    key: consumer.name,
                    'data-consumer': consumer.name
                }, [h(consumer.component, consumer.propsFor(iconValue.value), consumer.slotsFor?.() as any)])));
            }
        });
        const app = createSSRApp(tree);
        app.config.warnHandler = function collectVueWarning(message) {
            warnings.push(message);
        };
        const html = await renderToString(app);
        assert.ok(html.length > 0, `SSR rendered consumer SFCs for ${iconValue.name}`);
        assert.deepEqual(
            invalidPropWarnings(warnings),
            [],
            `${iconValue.name} is accepted by all compiled icon consumer runtime props:\n${warnings.join('\n')}`
        );
    }
});

test('Icon.vue SSR renders path arrays, component values, legacy precedence, and local aliases', async () => {
    const iconComponent = await loadComponent('/src/components/Icon.vue');
    const iconApi = await loadSsrModule('/src/ui/icon-config.ts');
    const copySource = await import('node:fs/promises').then(fs => fs.readFile(path.join(root, 'src/assets/icons/copy.svg'), 'utf8'));
    const fileSource = await import('node:fs/promises').then(fs => fs.readFile(path.join(root, 'src/assets/icons/file.svg'), 'utf8'));
    const copyAssetPaths = svgPathData(copySource);
    const fileAssetPaths = svgPathData(fileSource);
    const options = {
        aliases: {
            pathAlias: pathOne,
            layeredAlias: pathArray,
            componentAlias: objectIcon,
            copyAlias: 'copy'
        }
    };

    const layered = await renderSsrComponent(iconComponent, { icon: pathArray, size: 24 });
    assert.deepEqual(invalidPropWarnings(layered.warnings), []);
    assert.deepEqual(svgPathData(layered.html), [pathOne, pathTwo]);
    assert.match(layered.html, /opacity="0\.35"/);

    const directComponent = await renderSsrComponent(iconComponent, { icon: objectIcon });
    assert.match(directComponent.html, /protocol-object-icon/);
    const aliasedComponent = await renderSsrComponent(iconComponent, { icon: '$componentAlias' }, undefined, options);
    assert.match(aliasedComponent.html, /protocol-object-icon/);

    const explicitPath = 'M6 6h12v12H6z';
    const pathOverIconAndName = await renderSsrComponent(iconComponent, {
        name: 'copy',
        icon: '$pathAlias',
        path: explicitPath
    }, undefined, options);
    assert.deepEqual(svgPathData(pathOverIconAndName.html), [explicitPath]);

    const iconOverName = await renderSsrComponent(iconComponent, { name: 'copy', icon: pathTwo });
    assert.deepEqual(svgPathData(iconOverName.html), [pathTwo]);

    const forcedSvg = await renderSsrComponent(iconComponent, { icon: `svg:${pathOne}` });
    assert.deepEqual(svgPathData(forcedSvg.html), [pathOne]);

    const directCopy = await renderSsrComponent(iconComponent, { icon: 'copy' });
    const aliasedCopy = await renderSsrComponent(iconComponent, { icon: '$copyAlias' }, undefined, options);
    assert.ok(copyAssetPaths.length > 0, 'the local copy asset has path geometry');
    assert.deepEqual(svgPathData(directCopy.html), copyAssetPaths, 'the direct local icon uses copy.svg rather than file.svg');
    assert.deepEqual(svgPathData(aliasedCopy.html), copyAssetPaths, 'an alias to the local icon resolves to the same geometry');
    assert.notDeepEqual(copyAssetPaths, fileAssetPaths, 'copy.svg and file.svg are distinct fixtures');
});
