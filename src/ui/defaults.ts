import { computed, getCurrentInstance, inject, provide, type ComputedRef, type InjectionKey } from 'vue';

export type UIDefaults = Record<string, Record<string, unknown>>;

type DefaultsOption<T> = T | (() => T);

export interface UIDefaultsProviderOptions {
    root?: DefaultsOption<boolean | string | undefined>;
    scoped?: DefaultsOption<boolean | undefined>;
    reset?: DefaultsOption<boolean | number | string | undefined>;
    disabled?: DefaultsOption<boolean | undefined>;
}

interface DefaultsContext {
    root: ComputedRef<UIDefaults>;
}

type DefaultsWithPrevious = UIDefaults & {
    prev?: UIDefaults;
};

const defaultsContextKey: InjectionKey<DefaultsContext> = Symbol('u-defaults-context');
const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

export const defaultsKey: InjectionKey<ComputedRef<UIDefaults>> = Symbol('u-defaults');

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function cloneSafe(value: unknown, seen = new WeakMap<object, unknown>()): unknown {
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);

    if (Array.isArray(value)) {
        const result: unknown[] = [];
        seen.set(value, result);
        for (const item of value) result.push(cloneSafe(item, seen));
        return result;
    }

    if (!isPlainObject(value)) return value;

    const result: Record<string, unknown> = {};
    seen.set(value, result);
    for (const key of Object.keys(value)) {
        if (!dangerousKeys.has(key)) result[key] = cloneSafe(value[key], seen);
    }
    return result;
}

function mergeDeep(
    source: unknown,
    target: unknown,
    skipUndefined = false
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (isPlainObject(source)) {
        for (const key of Object.keys(source)) {
            if (!dangerousKeys.has(key)) result[key] = cloneSafe(source[key]);
        }
    }

    if (!isPlainObject(target)) return result;

    for (const key of Object.keys(target)) {
        if (dangerousKeys.has(key)) continue;

        const targetValue = target[key];
        if (skipUndefined && targetValue === undefined) continue;

        const sourceValue = isPlainObject(source) && Object.hasOwn(source, key)
            ? source[key]
            : undefined;

        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
            result[key] = mergeDeep(sourceValue, targetValue, skipUndefined);
        } else if (key === 'prev' && isPlainObject(targetValue)) {
            result[key] = targetValue;
        } else {
            result[key] = cloneSafe(targetValue);
        }
    }

    return result;
}

/** Merge defaults without mutating either input; nested objects merge and arrays replace. */
export function mergeDefaults(parent: UIDefaults, child: UIDefaults): UIDefaults {
    return mergeDeep(parent, child, true) as UIDefaults;
}

function resolveOption<T>(value: DefaultsOption<T> | undefined): T | undefined {
    return typeof value === 'function' ? (value as () => T)() : value;
}

const emptyDefaults = computed<UIDefaults>(() => ({}));

export function provideDefaults(
    source: () => UIDefaults | undefined,
    reset?: () => boolean
): ComputedRef<UIDefaults>;
export function provideDefaults(
    source: () => UIDefaults | undefined,
    options?: UIDefaultsProviderOptions
): ComputedRef<UIDefaults>;
export function provideDefaults(
    source: () => UIDefaults | undefined,
    optionsOrReset: UIDefaultsProviderOptions | (() => boolean) = {}
): ComputedRef<UIDefaults> {
    const parent = inject(defaultsKey, emptyDefaults);
    const parentContext = inject(defaultsContextKey, undefined);
    const rootDefaultsSource = parentContext?.root ?? parent;
    const options: UIDefaultsProviderOptions = typeof optionsOrReset === 'function'
        ? { reset: optionsOrReset }
        : optionsOrReset;

    const defaults = computed<UIDefaults>(() => {
        if (resolveOption(options.disabled)) return parent.value;

        const scoped = resolveOption(options.scoped);
        const reset = resolveOption(options.reset);
        const root = resolveOption(options.root);
        const localDefaults = source();

        if (!localDefaults && !(scoped || reset || root)) return parent.value;

        const properties = mergeDeep(localDefaults ?? {}, { prev: parent.value }) as DefaultsWithPrevious;
        if (scoped) return properties;

        if (reset || root) {
            const namedRootDefaults = typeof root === 'string'
                ? properties.prev?.[root]
                : undefined;
            let current: UIDefaults = root ? rootDefaultsSource.value : properties;

            const length = Number(reset || Infinity);
            for (let index = 0; index <= length; index++) {
                if (!Object.hasOwn(current, 'prev')) break;
                const previous = current.prev;
                if (!isPlainObject(previous)) break;
                current = previous as UIDefaults;
            }

            if (typeof root === 'string' && namedRootDefaults && isPlainObject(namedRootDefaults)) {
                current = mergeDefaults(
                    mergeDefaults(current, { prev: current } as UIDefaults),
                    namedRootDefaults as UIDefaults
                );
            }

            return current;
        }

        return properties.prev
            ? mergeDefaults(properties.prev, properties)
            : properties;
    });

    provide(defaultsKey, defaults);
    provide(defaultsContextKey, { root: rootDefaultsSource });
    return defaults;
}

/** Explicit component props win over scoped defaults; omitted Boolean props remain inheritable. */
export function useDefaults<T extends object>(props: T, component?: string): T {
    const instance = getCurrentInstance();
    const inferred = instance?.type.name ?? (instance?.type as { __name?: string } | undefined)?.__name ?? 'UComponent';
    const name = component ?? (inferred === 'UiInput' ? 'UTextField' : inferred.replace(/^Ui(?=[A-Z])/, 'U'));
    const defaults = inject(defaultsKey, emptyDefaults);

    return new Proxy(props, {
        get(target, key, receiver) {
            const original = Reflect.get(target, key, receiver);
            if (typeof key !== 'string') return original;

            const incoming = instance?.vnode.props ?? {};
            const kebab = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            if (
                (Object.hasOwn(incoming, key) && incoming[key] !== undefined)
                || (Object.hasOwn(incoming, kebab) && incoming[kebab] !== undefined)
            ) {
                return original;
            }

            const componentDefaults = defaults.value[name] ?? defaults.value[name.replace(/^U(?=[A-Z])/, 'Ui')];
            const scopedValue = componentDefaults?.[key];
            if (scopedValue !== undefined) return scopedValue;

            const globalValue = defaults.value.global?.[key];
            if (globalValue !== undefined) return globalValue;

            return original;
        }
    });
}
