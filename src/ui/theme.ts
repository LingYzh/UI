import { computed, effectScope, getCurrentInstance, inject, provide, ref, watch, type App, type ComputedRef, type CSSProperties, type InjectionKey, type Ref } from 'vue';
import { defaultUiThemes } from './theme-defaults';

export interface UiThemeDefinition {
    dark?: boolean;
    colors?: Record<string, string>;
    variables?: Record<string, string | number>;
}
export interface UiResolvedTheme {
    dark: boolean;
    colors: Record<string, string>;
    variables: Record<string, string | number>;
}
export interface UiThemeTransition { origin?: string; duration?: number }
export interface UiThemeOptions {
    defaultTheme?: string;
    themes?: Record<string, UiThemeDefinition>;
    variations?: { colors: string[]; lighten?: number; darken?: number };
    target?: HTMLElement | string | false;
    cspNonce?: string;
    utilities?: boolean;
    transition?: boolean | UiThemeTransition;
}
export interface UiThemeInstance {
    themes: Ref<Record<string, UiThemeDefinition>>;
    computedThemes: ComputedRef<Record<string, UiResolvedTheme>>;
    current: ComputedRef<UiResolvedTheme>;
    name: ComputedRef<string>;
    mode: ComputedRef<string>;
    isSystem: ComputedRef<boolean>;
    themeNames: ComputedRef<string[]>;
    global: { name: Ref<string>; current: ComputedRef<UiResolvedTheme> };
    styles: ComputedRef<CSSProperties>;
    resolveName: (name: string) => string;
    change: (name: string, transition?: boolean | UiThemeTransition) => Promise<void>;
    toggle: (names?: [string, string], transition?: boolean | UiThemeTransition) => Promise<void>;
    cycle: (names?: string[], transition?: boolean | UiThemeTransition) => Promise<void>;
    setTransitionOrigin: (origin: Element | { clientX: number; clientY: number } | null) => void;
    install: (app: App) => void;
    dispose: () => void;
}
const themeKey: InjectionKey<UiThemeInstance> = Symbol('ui-theme');
let stylesheetSequence = 0;
const validKey = /^[a-z][a-z0-9-]*$/i;
function channels(color: string) {
    const hex = color.replace(/^#/, '');
    if (!/^(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) return;
    const full = hex.length === 3 ? [...hex].map(character => character + character).join('') : hex;
    return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16));
}
function foreground(color: string) {
    const rgb = channels(color);
    if (!rgb) return '#ffffff';
    const luminance = rgb.map(channel => { const c = channel / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
    const value = .2126 * luminance[0] + .7152 * luminance[1] + .0722 * luminance[2];
    return (value + .05) / .05 > 1.05 / (value + .05) ? '#000000' : '#ffffff';
}
function variation(color: string, amount: number, lighter: boolean) {
    const rgb = channels(color);
    if (!rgb) return color;
    return '#' + rgb.map(channel => Math.round(channel + ((lighter ? 255 : 0) - channel) * Math.min(1, amount / 10)).toString(16).padStart(2, '0')).join('');
}
function mergeTheme(base: UiResolvedTheme, definition: UiThemeDefinition = {}): UiResolvedTheme {
    const colors = { ...base.colors, ...definition.colors };
    for (const key of Object.keys(colors)) if (!validKey.test(key)) throw new Error(`Invalid theme color: ${key}`);
    if (definition.colors?.primary !== undefined) {
        colors['primary-surface'] = definition.colors['primary-surface'] ?? colors.primary;
        colors['accent-soft'] = definition.colors['accent-soft'] ?? `color-mix(in srgb, ${colors.primary} 14%, ${colors.background})`;
    }
    colors.accent = colors['primary-surface'];
    colors['accent-text'] = colors.primary;
    for (const [semantic, legacy] of [['success', 'green'], ['error', 'red'], ['warning', 'amber']] as const) {
        if (definition.colors?.[semantic] !== undefined) {
            colors[legacy] = colors[semantic];
            colors[`${legacy}-background`] = definition.colors[`${legacy}-background`] ?? `color-mix(in srgb, ${colors[semantic]} 12%, ${colors.background})`;
        }
    }
    if (definition.colors?.['on-surface'] !== undefined) colors.text = colors['on-surface'];
    const variables = { ...base.variables, ...definition.variables };
    for (const key of Object.keys(variables)) if (!validKey.test(key)) throw new Error(`Invalid theme variable: ${key}`);
    return { dark: definition.dark ?? base.dark, colors, variables };
}
export function uiThemeStyles(theme: UiResolvedTheme): CSSProperties {
    const styles: Record<string, string> = { 'color-scheme': theme.dark ? 'dark' : 'light' };
    for (const [name, value] of Object.entries(theme.colors)) {
        styles[`--ui-theme-${name}`] = value;
        styles[`--${name}`] = value;
    }
    for (const [name, value] of Object.entries(theme.variables)) styles[`--${name}`] = String(value);
    return styles;
}
export function createUiTheme(options: UiThemeOptions = {}): UiThemeInstance {
    const definitions = Object.fromEntries(Object.entries(options.themes ?? {}).map(([name, definition]) => [name, { ...definition, colors: definition.colors && { ...definition.colors }, variables: definition.variables && { ...definition.variables } }]));
    const themes = ref<Record<string, UiThemeDefinition>>({ light: structuredClone(defaultUiThemes.light), dark: structuredClone(defaultUiThemes.dark), ...definitions });
    const selection = ref(options.defaultTheme ?? 'light');
    const system = ref('light');
    const computedThemes = computed(() => {
        const light = mergeTheme(defaultUiThemes.light, themes.value.light);
        const dark = mergeTheme(defaultUiThemes.dark, themes.value.dark);
        const result: Record<string, UiResolvedTheme> = { light, dark };
        for (const [name, definition] of Object.entries(themes.value)) {
            if (!validKey.test(name) || name === 'system') throw new Error(`Invalid theme name: ${name}`);
            const resolved = name === 'light' ? light : name === 'dark' ? dark : mergeTheme(definition.dark ? dark : light, definition);
            const colors = { ...resolved.colors };
            for (const color of options.variations?.colors ?? []) {
                if (!colors[color]) continue;
                for (const direction of ['lighten', 'darken'] as const) {
                    for (let i = 1; i <= Math.min(10, options.variations?.[direction] ?? 0); i++) colors[`${color}-${direction}-${i}`] = variation(colors[color], i, direction === 'lighten');
                }
            }
            for (const [key, color] of Object.entries(colors)) {
                if (key.startsWith('on-')) continue;
                if (definition.colors?.[`on-${key}`] === undefined) colors[`on-${key}`] = foreground(color);
            }
            result[name] = { ...resolved, colors };
        }
        return result;
    });
    const resolveName = (value: string) => value === 'system' ? system.value : value;
    const name = computed(() => computedThemes.value[resolveName(selection.value)] ? resolveName(selection.value) : 'light');
    const current = computed(() => computedThemes.value[name.value]);
    const mode = computed(() => selection.value);
    const isSystem = computed(() => mode.value === 'system');
    const themeNames = computed(() => [...Object.keys(computedThemes.value), 'system']);
    const styles = computed(() => uiThemeStyles(current.value));
    let media: MediaQueryList | undefined;
    let motionMedia: MediaQueryList | undefined;
    let motionObserver: MutationObserver | undefined;
    let stop: (() => void) | undefined;
    let legacyObserver: MutationObserver | undefined;
    let utilityStyle: HTMLStyleElement | undefined;
    let target: HTMLElement | undefined;
    let activeTransition: ViewTransition | undefined;
    let transitionStyle: HTMLStyleElement | undefined;
    let transitionOrigin: string | undefined;
    let changeSequence = 0;
    const previous = new Map<string, [string, string]>();
    let previousTheme: string | undefined;
    let previousUiTheme: string | undefined;
    const updateSystem = () => { system.value = media?.matches ? 'dark' : 'light'; };
    function motionChanged() {
        if (!motionMedia?.matches && document.documentElement.dataset.reducedMotion !== 'true') return;
        activeTransition?.skipTransition();
        transitionStyle?.remove();
        transitionStyle = undefined;
    }
    function validate(value: string) { if (!themeNames.value.includes(value)) throw new Error(`Unknown UI theme: ${value}`); }
    validate(selection.value);
    async function change(value: string, transition: boolean | UiThemeTransition = options.transition ?? true) {
        validate(value);
        const sequence = ++changeSequence;
        activeTransition?.skipTransition();
        if (!transition || typeof document === 'undefined' || !target || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reducedMotion === 'true') { selection.value = value; return; }
        const config = typeof transition === 'object' ? transition : {};
        const origin = config.origin ?? transitionOrigin ?? '50% 0%';
        if (!/^(?:\d+(?:\.\d+)?%|center|left|right|top|bottom)(?:\s+(?:\d+(?:\.\d+)?%|center|left|right|top|bottom))?$/.test(origin)) throw new Error('Invalid theme transition origin');
        const style = document.createElement('style');
        if (options.cspNonce) style.nonce = options.cspNonce;
        style.textContent = `::view-transition-old(root){animation:none}::view-transition-new(root){animation:ui-theme-reveal ${Math.max(0, Math.min(2000, config.duration ?? 400))}ms ease-in-out}@keyframes ui-theme-reveal{from{clip-path:circle(0% at ${origin})}to{clip-path:circle(150% at ${origin})}}`;
        transitionStyle?.remove();
        transitionStyle = style;
        document.head.append(style);
        const animation = document.startViewTransition(() => { if (sequence === changeSequence) selection.value = value; });
        activeTransition = animation;
        void animation.finished.finally(() => { style.remove(); if (activeTransition === animation) { activeTransition = undefined; transitionOrigin = undefined; } }).catch(() => {});
        await animation.updateCallbackDone;
    }
    async function cycle(values = themeNames.value, transition?: boolean | UiThemeTransition) {
        if (!values.length) throw new Error('Theme cycle requires at least one theme');
        values.forEach(validate);
        const index = values.indexOf(mode.value);
        await change(values[(index + 1) % values.length], transition);
    }
    function dispose() {
        stop?.(); stop = undefined;
        media?.removeEventListener('change', updateSystem); media = undefined;
        motionMedia?.removeEventListener('change', motionChanged); motionMedia = undefined;
        motionObserver?.disconnect(); motionObserver = undefined;
        legacyObserver?.disconnect(); legacyObserver = undefined;
        utilityStyle?.remove(); utilityStyle = undefined;
        activeTransition?.skipTransition(); transitionStyle?.remove();
        if (target) {
            for (const [key, [original, applied]] of previous) if (target.style.getPropertyValue(key) === applied) { if (original) target.style.setProperty(key, original); else target.style.removeProperty(key); }
            if (previousTheme === undefined) target.removeAttribute('data-theme'); else target.dataset.theme = previousTheme;
            if (previousUiTheme === undefined) target.removeAttribute('data-ui-theme'); else target.dataset.uiTheme = previousUiTheme;
        }
        previous.clear(); target = undefined;
    }
    const instance: UiThemeInstance = {
        themes, computedThemes, current, name, mode, isSystem, themeNames, styles, resolveName,
        global: { name: computed({ get: () => name.value, set: value => { validate(value); selection.value = value; } }), current },
        change, cycle, toggle: (values = ['light', 'dark'], transition) => cycle(values, transition),
        setTransitionOrigin(origin) {
            if (!origin || typeof window === 'undefined') { transitionOrigin = undefined; return; }
            const point = 'getBoundingClientRect' in origin ? origin.getBoundingClientRect() : origin;
            const x = 'width' in point ? point.left + point.width / 2 : point.clientX;
            const y = 'height' in point ? point.top + point.height / 2 : point.clientY;
            transitionOrigin = `${Math.max(0, Math.min(100, x / window.innerWidth * 100))}% ${Math.max(0, Math.min(100, y / window.innerHeight * 100))}%`;
        },
        install(app) {
            app.provide(themeKey, instance);
            if (typeof document === 'undefined') return;
            target = options.target === false ? undefined : typeof options.target === 'string' ? document.querySelector<HTMLElement>(options.target) ?? undefined : options.target ?? document.documentElement;
            if (typeof options.target === 'string' && !target) throw new Error(`UI theme target not found: ${options.target}`);
            media = window.matchMedia('(prefers-color-scheme: dark)'); updateSystem(); media.addEventListener('change', updateSystem);
            if (target) {
                motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)'); motionMedia.addEventListener('change', motionChanged);
                motionObserver = new MutationObserver(motionChanged);
                motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
            }
            previousTheme = target?.dataset.theme; previousUiTheme = target?.dataset.uiTheme;
            if (options.utilities !== false) { utilityStyle = document.createElement('style'); utilityStyle.id = `ui-theme-${++stylesheetSequence}`; if (options.cspNonce) utilityStyle.nonce = options.cspNonce; document.head.append(utilityStyle); }
            const scope = effectScope(true);
            scope.run(() => watch([styles, computedThemes, name], () => {
                if (target) {
                    for (const [key, [original, applied]] of previous) {
                        if (!(key in styles.value) && target.style.getPropertyValue(key) === applied) {
                            if (original) target.style.setProperty(key, original); else target.style.removeProperty(key);
                        }
                    }
                    for (const [key, raw] of Object.entries(styles.value)) {
                        const value = String(raw);
                        if (!previous.has(key)) previous.set(key, [target.style.getPropertyValue(key), value]);
                        previous.get(key)![1] = value;
                        target.style.setProperty(key, value);
                    }
                    target.dataset.theme = current.value.dark ? 'dark' : 'light';
                    target.dataset.uiTheme = name.value;
                }
                if (utilityStyle) {
                    const keys = new Set(Object.values(computedThemes.value).flatMap(theme => Object.keys(theme.colors)));
                    utilityStyle.textContent = [...keys].filter(key => !key.startsWith('on-')).map(key => `.text-${key}{color:var(--ui-theme-${key})}.bg-${key}{background-color:var(--ui-theme-${key});color:var(--ui-theme-on-${key})}.border-${key}{border-color:var(--ui-theme-${key})}`).join('\n');
                }
            }, { immediate: true, flush: 'sync' }));
            stop = () => scope.stop();
            if (target) {
                legacyObserver = new MutationObserver(() => { const legacy = target?.dataset.theme; if (legacy && legacy !== (current.value.dark ? 'dark' : 'light') && ['light', 'dark'].includes(legacy)) selection.value = legacy; });
                legacyObserver.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
            }
            app.onUnmount(dispose);
        }, dispose
    };
    return instance;
}
export function useUiTheme(): UiThemeInstance { return useUiThemeWithFallback({ target: false, utilities: false }); }
// Internal preview entry: keep the exported documentation usable without a host plugin.
export function useUiThemeWithFallback(options: UiThemeOptions): UiThemeInstance {
    const inherited = inject(themeKey, null);
    if (inherited) return inherited;
    const app = getCurrentInstance()?.appContext.app;
    if (!app) throw new Error('useUiTheme must be called during component setup');
    const fallback = createUiTheme({ defaultTheme: typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light', ...options });
    fallback.install(app);
    if (typeof document !== 'undefined' && options.target === false) {
        const observer = new MutationObserver(() => {
            const legacy = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
            if (legacy !== (fallback.current.value.dark ? 'dark' : 'light')) fallback.global.name.value = legacy;
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        app.onUnmount(() => observer.disconnect());
    }
    return fallback;
}
export function provideUiTheme(getName: () => string | undefined): UiThemeInstance {
    const parent = useUiTheme();
    const mode = computed(() => getName() ?? parent.mode.value);
    const name = computed(() => parent.resolveName(mode.value));
    const current = computed(() => { const theme = parent.computedThemes.value[name.value]; if (!theme) throw new Error(`Unknown UI theme: ${name.value}`); return theme; });
    const context = { ...parent, mode, name, current, isSystem: computed(() => mode.value === 'system'), styles: computed(() => uiThemeStyles(current.value)) };
    provide(themeKey, context);
    return context;
}
