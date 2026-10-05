import { inject, type Component, type InjectionKey } from 'vue';
import { iconPath } from './icons';

export interface IconSet { paths?: Record<string, string>; component?: Component; }
export interface IconOptions { defaultSet?: string; aliases?: Record<string, string>; sets?: Record<string, IconSet>; }
export const iconKey: InjectionKey<IconOptions> = Symbol('u-icons');
export function useIcons() { return inject(iconKey, {}); }
export function resolveIcon(name: string, options: IconOptions = {}) {
    let value = name;
    const seen = new Set<string>();
    while (options.aliases?.[value] || options.aliases?.[value.replace(/^\$/, '')]) {
        if (seen.has(value)) return {};
        seen.add(value);
        value = options.aliases[value] ?? options.aliases[value.replace(/^\$/, '')];
    }
    const colon = value.indexOf(':');
    const set = colon >= 0 ? value.slice(0, colon) : options.defaultSet ?? 'mdi';
    const key = colon >= 0 ? value.slice(colon + 1) : value;
    const configured = options.sets?.[set];
    return { path: configured?.paths?.[key] ?? iconPath(key), component: configured?.component, name: key };
}
