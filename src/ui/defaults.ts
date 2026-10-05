import { computed, getCurrentInstance, inject, provide, type ComputedRef, type InjectionKey } from 'vue';

export type UIDefaults = Record<string, Record<string, unknown>>;
export const defaultsKey: InjectionKey<ComputedRef<UIDefaults>> = Symbol('u-defaults');
export function mergeDefaults(parent: UIDefaults, child: UIDefaults): UIDefaults {
    const result = { ...parent };
    for (const [name, values] of Object.entries(child)) result[name] = { ...parent[name], ...values };
    return result;
}
export function provideDefaults(source: () => UIDefaults, reset: () => boolean = () => false) {
    const parent = inject(defaultsKey, computed<UIDefaults>(() => ({})));
    const defaults = computed(() => mergeDefaults(reset() ? {} : parent.value, source()));
    provide(defaultsKey, defaults);
    return defaults;
}
/** Explicit component props win over scoped defaults; omitted Boolean props remain inheritable. */
export function useDefaults<T extends object>(props: T, component?: string): T {
    const instance = getCurrentInstance();
    const inferred = instance?.type.name ?? (instance?.type as { __name?: string } | undefined)?.__name ?? 'UComponent';
    const name = component ?? (inferred === 'UiInput' ? 'UTextField' : inferred.replace(/^Ui(?=[A-Z])/, 'U'));
    const defaults = inject(defaultsKey, computed<UIDefaults>(() => ({})));
    return new Proxy(props, {
        get(target, key, receiver) {
            const original = Reflect.get(target, key, receiver);
            if (typeof key !== 'string') return original;
            const incoming = instance?.vnode.props ?? {};
            const kebab = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            if ((Object.hasOwn(incoming, key) && incoming[key] !== undefined) || (Object.hasOwn(incoming, kebab) && incoming[kebab] !== undefined)) return original;
            const scoped = defaults.value[name] ?? defaults.value[name.replace(/^U(?=[A-Z])/, 'Ui')] ?? {};
            if (Object.hasOwn(scoped, key)) return scoped[key];
            if (Object.hasOwn(defaults.value.global ?? {}, key)) return defaults.value.global[key];
            return original;
        }
    });
}
