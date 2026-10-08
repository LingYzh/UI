import { isProxy, toRaw } from "vue";

/** Remove nested Vue proxies before the platform's structured clone. */
export function cloneEditValue<T>(value: T): T {
    const seen = new WeakMap<object, unknown>();
    function raw(entry: unknown): unknown {
        if (typeof entry !== "object" || entry === null) return entry;
        const source = isProxy(entry) ? toRaw(entry) : entry;
        if (seen.has(source)) return seen.get(source);
        if (source instanceof Map) {
            const result = new Map();
            seen.set(source, result);
            for (const [key, item] of source) result.set(raw(key), raw(item));
            return result;
        }
        if (source instanceof Set) {
            const result = new Set();
            seen.set(source, result);
            for (const item of source) result.add(raw(item));
            return result;
        }
        if (
            Array.isArray(source) ||
            Object.getPrototypeOf(source) === Object.prototype ||
            Object.getPrototypeOf(source) === null
        ) {
            const result: Record<string, unknown> | unknown[] = Array.isArray(
                source,
            )
                ? new Array(source.length)
                : {};
            seen.set(source, result);
            for (const key of Object.keys(source))
                Object.defineProperty(result, key, {
                    value: raw((source as Record<string, unknown>)[key]),
                    enumerable: true,
                    writable: true,
                    configurable: true,
                });
            return result;
        }
        return source;
    }
    return structuredClone(raw(value)) as T;
}

export function equalEditValues(left: unknown, right: unknown): boolean {
    const seen = new WeakMap<object, WeakSet<object>>();
    function equal(a: unknown, b: unknown): boolean {
        if (Object.is(a, b)) return true;
        if (
            typeof a !== "object" ||
            a === null ||
            typeof b !== "object" ||
            b === null
        )
            return false;
        if (
            Object.prototype.toString.call(a) !==
            Object.prototype.toString.call(b)
        )
            return false;
        if (seen.get(a)?.has(b)) return true;
        const pairs = seen.get(a) ?? new WeakSet<object>();
        pairs.add(b);
        seen.set(a, pairs);
        if (a instanceof Date && b instanceof Date)
            return Object.is(a.getTime(), b.getTime());
        if (a instanceof RegExp && b instanceof RegExp)
            return a.source === b.source && a.flags === b.flags;
        if (a instanceof Map && b instanceof Map) {
            const entries = [...b];
            return (
                a.size === b.size &&
                [...a].every(
                    ([key, value], index) =>
                        equal(key, entries[index][0]) &&
                        equal(value, entries[index][1]),
                )
            );
        }
        if (a instanceof Set && b instanceof Set) {
            const entries = [...b];
            return (
                a.size === b.size &&
                [...a].every((value, index) => equal(value, entries[index]))
            );
        }
        if (
            (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) ||
            (a instanceof ArrayBuffer && b instanceof ArrayBuffer)
        ) {
            const bytes = (value: ArrayBuffer | ArrayBufferView) =>
                value instanceof ArrayBuffer
                    ? new Uint8Array(value)
                    : new Uint8Array(
                          value.buffer,
                          value.byteOffset,
                          value.byteLength,
                      );
            const aa = bytes(a as ArrayBuffer | ArrayBufferView);
            const bb = bytes(b as ArrayBuffer | ArrayBufferView);
            return (
                aa.length === bb.length &&
                aa.every((value, index) => value === bb[index])
            );
        }
        if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length)
            return false;
        const keys = Object.keys(a);
        return (
            keys.length === Object.keys(b).length &&
            keys.every(
                (key) =>
                    Object.hasOwn(b, key) &&
                    equal(
                        (a as Record<string, unknown>)[key],
                        (b as Record<string, unknown>)[key],
                    ),
            )
        );
    }
    return equal(left, right);
}
