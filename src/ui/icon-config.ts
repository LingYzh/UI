import { inject, type Component, type InjectionKey, type PropType } from 'vue';
import { aliases as defaultAliases, mdi } from './iconsets/mdi-svg';
import { ComponentIcon, SvgIcon } from './icon-renderers';
import { iconPath } from './icons';
import { localIconNames } from './local-icon-names';

// Constrain values to Vue components while exposing object and function prop constructors to the SFC macro.
export type IconValue = string | (string | [path: string, opacity: number])[] | (Component & ({} | ((...args: any[]) => any)));
export const IconValue = [String, Array, Object, Function] as PropType<IconValue>;

export type IconAliases = Record<string, IconValue>;

export interface IconSet {
    component?: Component;
    paths?: Record<string, string>;
}

export interface IconOptions {
    defaultSet?: string;
    aliases?: IconAliases;
    sets?: Record<string, IconSet>;
}

interface IconOptionsInput extends IconOptions {
    legacyAliases?: IconAliases;
}

export interface ResolvedIconOptions extends IconOptions {
    defaultSet: string;
    aliases: IconAliases;
    legacyAliases: IconAliases;
    sets: Record<string, IconSet>;
}

export interface ResolvedIcon {
    kind: 'svg' | 'component' | 'set' | 'local' | 'empty';
    icon?: IconValue;
    name?: string;
    component?: Component;
    path?: string;
    set?: string;
}

function hasOwn<T extends object>(value: T, key: PropertyKey): key is keyof T {
    return Object.prototype.hasOwnProperty.call(value, key);
}

function isDevelopment(): boolean {
    const viteDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV;
    if (typeof viteDev === 'boolean') return viteDev;
    const nodeEnv = (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
    return nodeEnv !== 'production';
}

function warnIcon(message: string): void {
    if (isDevelopment()) console.warn(`[UI icons] ${message}`);
}

function emptyIcon(): ResolvedIcon {
    return { kind: 'empty' };
}

function localIcon(name: string): ResolvedIcon {
    return { kind: 'local', icon: name, name };
}

function svgIcon(icon: IconValue, name?: string): ResolvedIcon {
    return {
        kind: 'svg',
        icon,
        name,
        path: typeof icon === 'string' ? icon : undefined,
        component: SvgIcon,
        set: 'svg'
    };
}

function componentIcon(icon: Component): ResolvedIcon {
    return { kind: 'component', icon, component: ComponentIcon };
}

function setIcon(icon: IconValue, name: string, setName: string, set: IconSet): ResolvedIcon {
    const component = set.component ?? SvgIcon;
    const kind = component === SvgIcon ? 'svg' : 'set';
    return {
        kind,
        icon,
        name,
        component,
        path: kind === 'svg' && typeof icon === 'string' ? icon : undefined,
        set: setName
    };
}

export function createIcons(options: IconOptionsInput = {}): ResolvedIconOptions {
    const sets: Record<string, IconSet> = {
        mdi,
        svg: { component: SvgIcon }
    };
    for (const [name, set] of Object.entries(options.sets ?? {})) {
        const base = sets[name];
        const merged: IconSet = { ...base, ...set };
        if (set.paths) merged.paths = { ...base?.paths, ...set.paths };
        else if (base?.paths) merged.paths = base.paths;
        sets[name] = merged;
    }
    const legacyAliases = options.legacyAliases ?? options.aliases ?? {};
    return {
        defaultSet: options.defaultSet ?? 'mdi',
        aliases: { ...defaultAliases, ...options.aliases },
        legacyAliases: { ...legacyAliases },
        sets
    };
}

export const iconKey: InjectionKey<ResolvedIconOptions> = Symbol('u-icons');
const defaultIconOptions = createIcons();

export function useIcons(): ResolvedIconOptions {
    return inject(iconKey, defaultIconOptions);
}

function findAlias(value: string, aliases: IconAliases): { name: string; value: IconValue } | undefined {
    const name = value.startsWith('$') ? value.slice(1) : value;
    const candidates = value.startsWith('$') ? [value, name] : [name, `$${name}`];
    for (const candidate of candidates) {
        if (hasOwn(aliases, candidate)) return { name, value: aliases[candidate] };
    }
    return undefined;
}

function resolveSetIcon(name: string, setName: string, config: ResolvedIconOptions, hasPrefix: boolean): ResolvedIcon {
    const set = config.sets[setName];
    if (!set) {
        warnIcon('Unknown icon set prefix "' + setName + '" in "' + name + '".');
        return emptyIcon();
    }

    const renderer = set.component ?? SvgIcon;
    if (setName === 'svg') return setIcon(name, name, setName, set);

    // Custom MDI renderers consume names directly, as icon font sets do.
    if (setName === 'mdi' && renderer !== SvgIcon) return setIcon(name, name, setName, set);

    const registeredPath = set.paths && hasOwn(set.paths, name) ? set.paths[name] : undefined;
    const legacyPath = setName === 'mdi' ? iconPath(name) : undefined;
    const path = registeredPath ?? legacyPath;
    if (path !== undefined) return setIcon(path, name, setName, set);

    if (setName === 'mdi') {
        if (!hasPrefix && localIconNames.has(name)) return localIcon(name);
        warnIcon('Unknown legacy icon name "' + name + '".');
        return emptyIcon();
    }

    if (set.component) return setIcon(name, name, setName, set);
    warnIcon('Icon set "' + setName + '" has no component for "' + name + '".');
    return emptyIcon();
}
function resolveString(value: string, config: ResolvedIconOptions): ResolvedIcon {
    const normalizedValue = value.trim();
    if (!normalizedValue) return emptyIcon();
    if (/^[Mm](?=\s|[0-9.+-])/.test(normalizedValue)) return svgIcon(normalizedValue, normalizedValue);

    const colon = normalizedValue.indexOf(':');
    if (colon >= 0) {
        const setName = normalizedValue.slice(0, colon).trim();
        const name = normalizedValue.slice(colon + 1).trim();
        if (!hasOwn(config.sets, setName)) {
            warnIcon('Unknown icon set prefix "' + setName + '" in "' + normalizedValue + '".');
            return emptyIcon();
        }
        return resolveSetIcon(name, setName, config, true);
    }

    const defaultSet = config.sets[config.defaultSet];
    const hasRegisteredPath = defaultSet?.paths && hasOwn(defaultSet.paths, normalizedValue);
    if (localIconNames.has(normalizedValue) && !hasRegisteredPath) return localIcon(normalizedValue);

    return resolveSetIcon(normalizedValue, config.defaultSet, config, false);
}

function resolveValue(value: IconValue, config: ResolvedIconOptions, seenAliases: Set<string>): ResolvedIcon {
    if (typeof value === 'string') {
        const normalizedValue = value.trim();
        if (!normalizedValue) return emptyIcon();

        const canonicalAlias = normalizedValue.startsWith('$');
        const alias = findAlias(normalizedValue, canonicalAlias ? config.aliases : config.legacyAliases);
        if (canonicalAlias && !alias) {
            warnIcon('Unknown icon alias "' + normalizedValue + '".');
            return emptyIcon();
        }
        if (alias) {
            const bareLocalTarget = typeof alias.value === 'string'
                && !alias.value.trim().startsWith('$')
                && alias.value.trim() === alias.name
                && localIconNames.has(alias.name);
            if (bareLocalTarget) return localIcon(alias.name);
            if (seenAliases.has(alias.name)) {
                warnIcon('Circular icon alias "' + alias.name + '".');
                return emptyIcon();
            }
            seenAliases.add(alias.name);
            return resolveValue(alias.value, config, seenAliases);
        }
        return resolveString(normalizedValue, config);
    }

    if (Array.isArray(value)) return svgIcon(value);
    if (typeof value === 'object' || typeof value === 'function') return componentIcon(value as Component);
    return emptyIcon();
}

/** Resolve both standard Vuetify icon values and the library's existing local/path names. */
export function resolveIcon(value: IconValue, options: IconOptions = defaultIconOptions, forceSvg = false): ResolvedIcon {
    const config = createIcons(options);
    if (forceSvg) {
        if (typeof value === 'string') {
            const path = value.trim();
            return path ? svgIcon(path) : emptyIcon();
        }
        if (Array.isArray(value)) return svgIcon(value);
        return resolveValue(value, config, new Set());
    }
    return resolveValue(value, config, new Set());
}
