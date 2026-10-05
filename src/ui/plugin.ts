import { computed, type App, type Component, type Directive } from 'vue';
import { components as builtins, legacyComponents } from './component-registry';
import { defaultsKey, type UIDefaults } from './defaults';
import { createDisplay, displayKey, type DisplayOptions } from './display';
import { createUiTheme, type UiThemeOptions } from './theme';
import { createLocale, type LocaleOptions } from './locale-context';
import { localeKey, setLocale, uiLocale } from './locale';
import { iconKey, type IconOptions } from './icon-config';
import { createRules, rulesKey, type RuleAliases } from './rules';
import { responsiveStyles } from './responsive';
import { vRipple } from './ripple';
import { vClickOutside, vIntersect, vMutate, vResize, vScroll, vTouch, vTooltip } from './directives';

export interface UIOptions {
    components?: Record<string, Component> | false;
    aliases?: Record<string, Component>;
    defaults?: UIDefaults;
    display?: DisplayOptions;
    theme?: UiThemeOptions;
    locale?: LocaleOptions;
    icons?: IconOptions;
    rules?: RuleAliases;
}
/** Register u- components and application-scoped configuration; importing components individually also works. */
export function createUI(options: UIOptions = {}) {
    const display = createDisplay(options.display);
    const theme = createUiTheme(options.theme);
    const locale = createLocale(options.locale, options.locale?.locale ? undefined : uiLocale as any);
    const rules = createRules(options.rules);
    let style: HTMLStyleElement | undefined;
    const dispose = () => { display.dispose(); theme.dispose(); style?.remove(); style = undefined; };
    return {
        display, theme, locale, rules,
        install(app: App) {
            for (const [name, component] of Object.entries(options.components === false ? {} : options.components ?? builtins)) {
                app.component(name, component);
                app.component(name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/^U(?=[A-Z])/, 'U-').toLowerCase(), component);
            }
            if (options.components !== false) for (const [name, component] of Object.entries(legacyComponents)) if (component) app.component(name, component);
            for (const [name, component] of Object.entries(options.aliases ?? {})) app.component(name, component);
            app.provide(defaultsKey, computed(() => options.defaults ?? {}));
            app.provide(displayKey, display); app.provide(localeKey, locale); app.provide(iconKey, options.icons ?? {}); app.provide(rulesKey, rules);
            app.use(theme);
            if (options.locale?.locale === 'zh' || options.locale?.locale === 'en') setLocale(options.locale.locale);
            for (const [name, directive] of Object.entries({ ripple: vRipple, 'click-outside': vClickOutside, intersect: vIntersect, mutate: vMutate, resize: vResize, scroll: vScroll, touch: vTouch, tooltip: vTooltip })) app.directive(name, directive as Directive);
            display.install();
            if (typeof document !== 'undefined' && options.display?.thresholds) { style = document.createElement('style'); style.textContent = responsiveStyles(display.thresholds); document.head.append(style); }
            app.onUnmount(dispose);
        },
        dispose
    };
}
