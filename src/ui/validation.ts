/** Rules can be synchronous or asynchronous. false uses the library's fallback message. */
export type ValidationRule<T = any> = boolean | string | PromiseLike<boolean | string> | ((value: T) => boolean | string | PromiseLike<boolean | string>);
export type ValidateOnTrigger = 'input' | 'blur' | 'submit' | 'invalid-input';
export type ValidateOn = ValidateOnTrigger | 'lazy' | 'eager' | `${ValidateOnTrigger} lazy` | `${ValidateOnTrigger} eager` | `lazy ${ValidateOnTrigger}` | `eager ${ValidateOnTrigger}`;
export function parseValidateOn(value: ValidateOn = 'input') {
    const parts = value.split(/\s+/);
    const trigger = parts.find(part => !['lazy', 'eager'].includes(part)) ?? 'input';
    return { trigger, lazy: parts.includes('lazy'), eager: parts.includes('eager') };
}
export interface ValidationResult {
    valid: boolean;
    errorMessages: string[];
    cancelled?: boolean;
}

export function createValidationRunner<T>(options: {
    value: () => T;
    rules: () => readonly ValidationRule<T>[];
    nativeError: () => string;
    externalErrors: () => string[];
    enabled: () => boolean;
    maxErrors: () => number;
    fallback: () => string;
    failure: () => string;
    beforeValidate: () => Promise<unknown>;
    commit: (errors: string[]) => void;
}) {
    let generation = 0;
    const invalidate = () => { generation++; };
    async function validate(): Promise<ValidationResult> {
        const current = ++generation;
        const value = options.value();
        const rules = [...options.rules()];
        const stale = () => current !== generation || !Object.is(value, options.value());
        await options.beforeValidate();
        if (stale()) return { valid: false, errorMessages: [], cancelled: true };
        const errors: string[] = [];
        const maximum = Math.max(1, Math.floor(options.maxErrors()) || 1);
        if (options.enabled()) {
            const nativeError = options.nativeError();
            if (nativeError) errors.push(nativeError);
            for (const rule of rules) {
                if (errors.length >= maximum) break;
                try {
                    const result = await (typeof rule === 'function' ? rule(value) : rule);
                    if (stale()) return { valid: false, errorMessages: [], cancelled: true };
                    if (result !== true) errors.push(typeof result === 'string' && result ? result : options.fallback());
                } catch {
                    if (stale()) return { valid: false, errorMessages: [], cancelled: true };
                    errors.push(options.failure());
                }
            }
        }
        if (stale()) return { valid: false, errorMessages: [], cancelled: true };
        options.commit(errors);
        const combined = options.enabled() ? [...new Set([...options.externalErrors(), ...errors])] : [];
        return { valid: combined.length === 0, errorMessages: combined };
    }
    return { validate, invalidate, revision: () => generation };
}
