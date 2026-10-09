import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync } from 'node:fs';
import { createSSRApp, defineComponent } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { mdiCheck, mdiClose, mdiContentCopy, mdiKeyboardEsc, mdiMagnify } from '@mdi/js';
import { IconValue, createIcons, resolveIcon } from '../src/ui/icon-config';
import { ClassIcon, ComponentIcon, SvgIcon } from '../src/ui/icon-renderers';
import { iconPath, registerIcons } from '../src/ui/icons';
import { localIconNames } from '../src/ui/local-icon-names';

test('local icon metadata matches the SVG files consumed by Icon.vue', function () {
    const names = readdirSync(new URL('../src/assets/icons/', import.meta.url))
        .filter(name => name.endsWith('.svg'))
        .map(name => name.slice(0, -4));
    assert.deepEqual([...localIconNames].sort(), names.sort());
});

function captureWarnings<T>(callback: () => T): { result: T; warnings: string[] } {
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (...values: unknown[]) => warnings.push(values.join(' '));
    try {
        return { result: callback(), warnings };
    } finally {
        console.warn = originalWarn;
    }
}

test('IconValue exposes Vue runtime prop constructors for every supported value kind', function () {
    assert.deepEqual(IconValue, [String, Array, Object, Function]);
});

test('resolveIcon handles raw MDI paths, known MDI names, svg prefixes, and path arrays', function () {
    const rawMdi = resolveIcon(mdiCheck);
    const finiteMdiName = resolveIcon('mdi-check');
    const prefixedMdiName = resolveIcon('mdi:mdi-check');
    const prefixedSvgPath = resolveIcon('svg:' + mdiCheck);
    const paths = ['M1 1h2v2H1z', ['M4 4h2v2H4z', 0.4]] as (string | [string, number])[];
    const multiPath = resolveIcon(paths);

    assert.equal(rawMdi.kind, 'svg');
    assert.equal(rawMdi.path, mdiCheck);
    assert.equal(finiteMdiName.path, mdiCheck);
    assert.equal(prefixedMdiName.path, mdiCheck);
    assert.equal(prefixedSvgPath.kind, 'svg');
    assert.equal(prefixedSvgPath.path, mdiCheck);
    assert.equal(multiPath.kind, 'svg');
    assert.deepEqual(multiPath.icon, paths);
    assert.equal(multiPath.component, SvgIcon);
});

test('default semantic aliases are SVG paths and include the library icon keys', function () {
    const options = createIcons();
    const vuetifyAliases = [
        'collapse', 'complete', 'cancel', 'close', 'delete', 'clear', 'success', 'info', 'warning', 'error',
        'prev', 'next', 'checkboxOn', 'checkboxOff', 'checkboxIndeterminate', 'delimiter', 'sortAsc', 'sortDesc',
        'expand', 'menu', 'subgroup', 'dropdown', 'radioOn', 'radioOff', 'edit', 'ratingEmpty', 'ratingFull',
        'ratingHalf', 'loading', 'first', 'last', 'unfold', 'file', 'plus', 'minus', 'calendar', 'treeviewCollapse',
        'treeviewExpand', 'tableGroupCollapse', 'tableGroupExpand', 'eyeDropper', 'upload', 'color', 'command',
        'ctrl', 'space', 'shift', 'alt', 'enter', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'backspace',
        'play', 'pause', 'fullscreen', 'fullscreenExit', 'volumeHigh', 'volumeMedium', 'volumeLow', 'volumeOff'
    ];
    const fontOptions = createIcons({ defaultSet: 'font', sets: { font: { component: ClassIcon } } });

    assert.equal(options.defaultSet, 'mdi');
    assert.equal(options.sets.mdi.component, SvgIcon);
    assert.equal(options.sets.svg.component, SvgIcon);
    for (const alias of vuetifyAliases) {
        const resolved = resolveIcon('$' + alias, options);
        const fontResolved = resolveIcon('$' + alias, fontOptions);
        assert.equal(resolved.kind, 'svg', alias + ' should use the SVG set');
        assert.equal(resolved.component, SvgIcon, alias + ' should use SvgIcon');
        assert.equal(fontResolved.kind, 'svg', alias + ' should remain SVG with a font default set');
    }
    assert.equal(resolveIcon('$sort', options).kind, 'svg');
    assert.equal(resolveIcon('$copy', options).path, mdiContentCopy);
    assert.equal(resolveIcon('$search', options).path, mdiMagnify);
    assert.equal(resolveIcon('$escape', options).path, mdiKeyboardEsc);
});

test('canonical semantic aliases stay SVG with a font default set while local names stay local', function () {
    const options = createIcons({
        defaultSet: 'font',
        sets: { font: { component: ClassIcon } }
    });
    const semanticClose = resolveIcon('$close', options);
    const localCopy = resolveIcon('copy', options);

    assert.equal(semanticClose.kind, 'svg');
    assert.equal(semanticClose.component, SvgIcon);
    assert.equal(semanticClose.path, mdiClose);
    assert.equal(localCopy.kind, 'local');
    assert.equal(localCopy.name, 'copy');
});

test('resolveIcon follows canonical and explicit bare alias chains without shadowing local names', function () {
    const options = createIcons({
        aliases: {
            firstAlias: '$secondAlias',
            secondAlias: 'mdi-check',
            localDemo: 'copy',
            business: 'mdi-check'
        }
    });
    const canonicalPath = resolveIcon('$firstAlias', options);
    const barePath = resolveIcon('firstAlias', options);
    const localAlias = resolveIcon('$localDemo', options);
    const bareBusiness = resolveIcon('business', options);
    const normalizedOptions = createIcons(options);

    assert.equal(canonicalPath.path, mdiCheck);
    assert.equal(barePath.path, mdiCheck);
    assert.equal(localAlias.kind, 'local');
    assert.equal(localAlias.name, 'copy');
    assert.equal(bareBusiness.path, mdiCheck);
    assert.equal(resolveIcon('business', normalizedOptions).path, mdiCheck);
    assert.equal(resolveIcon('copy', options).kind, 'local');
    assert.equal(resolveIcon('edit', options).kind, 'local');
});

test('resolveIcon uses ComponentIcon for component-valued icons and aliases', function () {
    const iconComponent = defineComponent({ name: 'ResolutionTestIcon' });
    const resolved = resolveIcon(iconComponent);
    const aliasResolved = resolveIcon('$customComponent', createIcons({ aliases: { customComponent: iconComponent } }));

    assert.equal(resolved.kind, 'component');
    assert.equal(resolved.component, ComponentIcon);
    assert.equal(resolved.icon, iconComponent);
    assert.equal(aliasResolved.kind, 'component');
    assert.equal(aliasResolved.icon, iconComponent);
});

test('custom icon sets receive path-table values or unqualified icon keys', function () {
    const customRenderer = defineComponent({ name: 'ResolutionTestSet' });
    const options = createIcons({
        defaultSet: 'brand',
        sets: {
            brand: {
                component: customRenderer,
                paths: { logo: 'M0 0h4v4H0z' }
            }
        }
    });
    const mapped = resolveIcon('brand:logo', options);
    const defaultIcon = resolveIcon('brand-mark', options);

    assert.equal(options.sets.mdi.component, SvgIcon);
    assert.equal(options.sets.svg.component, SvgIcon);
    assert.equal(mapped.kind, 'set');
    assert.equal(mapped.component, customRenderer);
    assert.equal(mapped.icon, 'M0 0h4v4H0z');
    assert.equal(defaultIcon.kind, 'set');
    assert.equal(defaultIcon.component, customRenderer);
    assert.equal(defaultIcon.icon, 'brand-mark');
});

test('overriding the MDI renderer passes icon font names unchanged', function () {
    const options = createIcons({ sets: { mdi: { component: ClassIcon } } });
    const unqualified = resolveIcon('mdi-check', options);
    const prefixed = resolveIcon('mdi:mdi-check', options);

    assert.equal(unqualified.kind, 'set');
    assert.equal(unqualified.component, ClassIcon);
    assert.equal(unqualified.icon, 'mdi-check');
    assert.equal(prefixed.kind, 'set');
    assert.equal(prefixed.component, ClassIcon);
    assert.equal(prefixed.icon, 'mdi-check');
});

test('custom MDI paths and registerIcons compatibility paths remain available', function () {
    const registeredName = 'mdi-resolution-registered';
    const tableName = 'mdi-resolution-table';
    const registeredPath = 'M0 0h5v5H0z';
    const tablePath = 'M1 1h6v6H1z';
    registerIcons({ [registeredName]: registeredPath });
    const options = createIcons({ sets: { mdi: { paths: { [tableName]: tablePath } } } });

    assert.equal(iconPath(registeredName), registeredPath);
    assert.equal(resolveIcon(registeredName, options).path, registeredPath);
    assert.equal(resolveIcon(tableName, options).path, tablePath);
});

test('resolveIcon trims aliases, raw paths, prefixes, and prefixed paths before parsing', function () {
    assert.equal(resolveIcon('  $close  ').path, mdiClose);
    assert.equal(resolveIcon('  ' + mdiCheck + '  ').path, mdiCheck);
    assert.equal(resolveIcon('  mdi :  mdi-check  ').path, mdiCheck);
    assert.equal(resolveIcon('  svg :  ' + mdiCheck + '  ').path, mdiCheck);
});

test('resolveIcon keeps local names and empties unknown aliases, sets, and legacy names', function () {
    const local = resolveIcon('copy');
    const warnings = captureWarnings(function () {
        return [
            resolveIcon('$missing-alias'),
            resolveIcon('missing-set:icon'),
            resolveIcon('missing-legacy-icon')
        ];
    });

    assert.equal(local.kind, 'local');
    assert.equal(local.name, 'copy');
    assert.ok(warnings.result.every((icon) => icon.kind === 'empty'));
    assert.ok(warnings.warnings.some((warning) => warning.includes('Unknown icon alias')));
    assert.ok(warnings.warnings.some((warning) => warning.includes('Unknown icon set prefix')));
    assert.ok(warnings.warnings.some((warning) => warning.includes('Unknown legacy icon name')));
});

test('resolveIcon warns and returns empty for canonical and self alias cycles', function () {
    const options = createIcons({ aliases: { firstCycle: '$secondCycle', secondCycle: '$firstCycle' } });
    const warnings = captureWarnings(function () {
        return [
            resolveIcon('$firstCycle', options),
            resolveIcon('$copy', createIcons({ aliases: { copy: '$copy' } }))
        ];
    });

    assert.ok(warnings.result.every((icon) => icon.kind === 'empty'));
    assert.ok(warnings.warnings.some((warning) => warning.includes('Circular icon alias')));
});

test('SvgIcon renders tuple opacity with the Vuetify fill-opacity attribute', async function () {
    const html = await renderToString(createSSRApp(SvgIcon, {
        tag: 'span',
        icon: [['M1 1h2v2H1z', 0.4]]
    }));

    assert.match(html, /fill-opacity="0\.4"/);
    assert.doesNotMatch(html, /\sopacity=/);
});

test('explicit path resolution bypasses aliases, forces SVG, and trims the path', function () {
    const options = createIcons({ aliases: { pathAlias: 'mdi-check' } });
    const resolved = resolveIcon('  $pathAlias  ', options, true);

    assert.equal(resolved.kind, 'svg');
    assert.equal(resolved.icon, '$pathAlias');
    assert.equal(resolved.component, SvgIcon);
});
