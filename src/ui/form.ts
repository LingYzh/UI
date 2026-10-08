import { computed, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, ref, shallowReactive, useId, watch, type ComputedRef, type CSSProperties, type InjectionKey, type Ref } from 'vue';
import { createValidationRunner, parseValidateOn, type ValidateOn, type ValidationRule, type ValidationResult } from './validation';
import { useLocale } from './locale-context';
import { useDefaults } from './defaults';
import { useRules } from './rules';

export interface FormControlProps {
    label?: string;
    hint?: string;
    labelPosition?: 'top' | 'left';
    labelWidth?: string;
    disabled?: boolean;
    readonly?: boolean;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
    rules?: readonly ValidationRule[];
    errorMessages?: string | readonly string[];
    maxErrors?: number | string;
    name?: string;
    error?: boolean;
    validationValue?: unknown;
    focused?: boolean;
    messages?: string | readonly string[];
    validateOn?: ValidateOn;
    density?: 'default' | 'comfortable' | 'compact';
    variant?: 'outlined' | 'filled' | 'underlined' | 'plain';
    color?: string;
    clearable?: boolean;
    persistentHint?: boolean;
    hideDetails?: boolean | 'auto';
    loading?: boolean;
    prefix?: string;
    suffix?: string;
    counter?: boolean | number;
}
export interface FormError { id: string; errorMessages: string[]; }
export interface FormValidationResult { valid: boolean; errors: FormError[]; cancelled?: boolean; }
export interface RegisteredControl {
    id: () => string;
    element: () => HTMLElement | undefined;
    state: ComputedRef<boolean | null>;
    errors: ComputedRef<string[]>;
    enabled: ComputedRef<boolean>;
    revision: () => number;
    validate: () => Promise<ValidationResult>;
    reset: () => void | Promise<void>;
    resetValidation: () => void | Promise<void>;
}
export interface FormContext {
    disabled: ComputedRef<boolean>;
    readonly: ComputedRef<boolean>;
    dense: ComputedRef<boolean>;
    ghost: ComputedRef<boolean>;
    rounded: ComputedRef<boolean>;
    labelPosition: ComputedRef<'top' | 'left'>;
    labelWidth: ComputedRef<string>;
    validateOn: ComputedRef<ValidateOn>;
    density?: ComputedRef<'default' | 'comfortable' | 'compact'>;
    variant?: ComputedRef<'outlined' | 'filled' | 'underlined' | 'plain'>;
    color?: ComputedRef<string | undefined>;
    hideDetails?: ComputedRef<boolean | 'auto'>;
    resetMode?: ComputedRef<'initial' | 'empty'>;
    resetting: Ref<boolean>;
    register: (control: RegisteredControl) => void;
    unregister: (control: RegisteredControl) => void;
}
export const formContextKey: InjectionKey<FormContext> = Symbol('ui-form');
export interface FieldContext {
    error: ComputedRef<string | undefined>;
    register: (control: RegisteredControl) => void;
    unregister: (control: RegisteredControl) => void;
}
export const fieldContextKey: InjectionKey<FieldContext> = Symbol('ui-field');

export function mergeControlAttrs(attrs: Record<string, unknown>, fieldAttrs: Record<string, unknown>, id: string) {
    return { ...attrs, ...fieldAttrs, id: String(attrs.id ?? id),
        'aria-describedby': [...new Set([attrs['aria-describedby'], fieldAttrs['aria-describedby']].filter(Boolean).join(' ').split(' ').filter(Boolean))].join(' ') || undefined };
}

export function useFormControl<T>(props: FormControlProps, model: Ref<T>, element: Ref<HTMLElement | undefined>, attrs: Record<string, unknown> = {}) {
    props = useDefaults(props);
    const instance = getCurrentInstance();
    const locale = useLocale();
    const form = inject(formContextKey, undefined);
    const field = inject(fieldContextKey, undefined);
    const uid = useId();
    const framed = computed(() => Boolean(props.label || props.hint || props.rules || props.errorMessages !== undefined || (form && !field)));
    const disabled = computed(() => Boolean(form?.disabled.value || props.disabled));
    const readonly = computed(() => Boolean(form?.readonly.value || props.readonly));
    const density = computed(() => props.density ?? (props.dense !== undefined ? props.dense ? 'compact' : 'default' : form?.density?.value ?? (form?.dense.value ? 'compact' : 'default')));
    const dense = computed(() => density.value === 'compact');
    const ghost = computed(() => props.ghost ?? form?.ghost.value ?? false);
    const rounded = computed(() => props.rounded ?? form?.rounded.value ?? true);
    const variant = computed(() => props.variant ?? (ghost.value ? 'plain' : form?.variant?.value ?? 'outlined'));
    const color = computed(() => props.color ?? form?.color?.value);
    const styles = computed<CSSProperties>(() => ({ '--ui-control-color': color.value ? `var(--ui-theme-${color.value}, ${color.value})` : 'var(--accent)' }));
    const classes = computed(() => ({ 'is-dense': dense.value, 'is-comfortable': density.value === 'comfortable', 'is-ghost': ghost.value || variant.value === 'plain', 'is-square': !rounded.value, 'is-filled': variant.value === 'filled', 'is-underlined': variant.value === 'underlined', 'is-disabled': disabled.value, 'is-invalid': state.value === false }));
    const labelPosition = computed(() => props.labelPosition ?? form?.labelPosition.value ?? 'top');
    const labelWidth = computed(() => props.labelWidth ?? form?.labelWidth.value ?? '180px');
    const validateOn = computed(() => props.validateOn ?? form?.validateOn.value ?? 'input');
    const validationMode = computed(() => parseValidateOn(validateOn.value));
    const aliases = useRules();
    const ownErrors = ref<string[]>([]);
    const isPristine = ref(true);
    const isValidating = ref(false);
    const localFocused = ref(props.focused ?? false);
    const focused = computed(() => {
        const incoming = instance?.vnode.props;
        return incoming && Object.hasOwn(incoming, 'focused') && incoming['onUpdate:focused'] ? props.focused ?? false : localFocused.value;
    });
    const validationModel = computed(() => props.validationValue === undefined ? model.value : props.validationValue);
    const isDirty = computed(() => [model.value, validationModel.value].some(value => value !== '' && value != null && (!Array.isArray(value) || value.length > 0)));
    const externalErrors = computed(() => [...new Set([
        ...(field?.error.value ? [field.error.value] : []),
        ...(typeof props.errorMessages === 'string' ? [props.errorMessages] : props.errorMessages ?? [])
    ].filter(Boolean))]);
    const enabled = computed(() => !disabled.value);
    const errors = computed(() => {
        const messages = [...new Set([...externalErrors.value, ...ownErrors.value])];
        return externalErrors.value.length ? messages.slice(0, Math.max(0, Number(props.maxErrors ?? 1))) : messages;
    });
    const state = computed(() => {
        if (props.error || externalErrors.value.length) return false;
        if (!props.rules?.length && !ownErrors.value.length) return true;
        if (isPristine.value) return ownErrors.value.length || validationMode.value.lazy ? null : true;
        return !ownErrors.value.length;
    });
    const displayErrors = computed(() => state.value === false ? errors.value : []);
    let initialValue = model.value;
    let disposed = false;
    const runner = createValidationRunner({
        value: () => validationModel.value,
        rules: () => (props.rules ?? []).map(rule => typeof rule === 'string' && aliases[rule.replace(/^\$/, '')] ? aliases[rule.replace(/^\$/, '')]() : rule),
        nativeError: () => {
            const control = element.value as HTMLInputElement | undefined;
            return control?.willValidate && !control.validity.valid ? control.validationMessage : '';
        },
        externalErrors: () => externalErrors.value,
        enabled: () => enabled.value && !element.value?.matches(':disabled'),
        maxErrors: () => props.maxErrors ?? 1,
        fallback: () => locale.t('form.invalid'),
        failure: () => locale.t('form.validationFailed'),
        beforeValidate: () => nextTick(),
        commit: (messages) => { if (!disposed) ownErrors.value = messages; }
    });
    let validationGeneration = 0;
    let resetting = false;
    async function validateResult(silent = false): Promise<ValidationResult> {
        const current = ++validationGeneration;
        isValidating.value = true;
        try {
            const result = await runner.validate();
            if (current !== validationGeneration || disposed) return { valid: false, errorMessages: [], cancelled: true };
            if (!result.cancelled) isPristine.value = silent;
            return { ...result, valid: !result.cancelled && state.value !== false, errorMessages: errors.value };
        } finally { if (current === validationGeneration) isValidating.value = false; }
    }
    async function validate(silent = false): Promise<string[]> {
        return (await validateResult(silent)).errorMessages;
    }
    async function resetValidation() {
        validationGeneration++;
        runner.invalidate();
        isValidating.value = false;
        // Inline rules arrays are recreated when a Form slot renders. Replacing
        // an already empty error array would invalidate that same slot again.
        if (ownErrors.value.length) ownErrors.value = [];
        isPristine.value = true;
        if (!validationMode.value.lazy && !disposed) await validateResult(!validationMode.value.eager);
    }
    async function reset() {
        resetting = true;
        model.value = (form?.resetMode?.value === 'initial' ? initialValue : null) as T;
        await nextTick();
        resetting = false;
        await resetValidation();
    }
    const control: RegisteredControl = {
        id: () => String(props.name ?? attrs.id ?? uid),
        element: () => element.value,
        state, errors, enabled,
        revision: runner.revision,
        validate: validateResult, reset, resetValidation
    };
    form?.register(control);
    field?.register(control);
    watch(validationModel, () => {
        const invalid = state.value === false;
        validationGeneration++;
        runner.invalidate();
        isValidating.value = false;
        if (!resetting && !form?.resetting.value && (validationMode.value.trigger === 'input' || (validationMode.value.trigger === 'invalid-input' && invalid))) void validateResult();
    }, { flush: 'sync' });
    let previousRules = [...props.rules ?? []];
    let previousRulesArray = props.rules;
    let previousDisabled = disabled.value;
    let previousReadonly = readonly.value;
    function sameRule(a: ValidationRule, b: ValidationRule): boolean {
        // Vue recreates inline callbacks along with their rules array on each
        // slot render. Their identical bodies must not cancel that render's
        // validation. The runner still reads the latest callbacks on each run.
        return a === b || (typeof a === 'function' && typeof b === 'function' && a.toString() === b.toString());
    }
    watch(() => [props.rules, disabled.value, readonly.value], () => {
        const rules = [...props.rules ?? []];
        const replacedArray = props.rules !== previousRulesArray;
        const changed = previousDisabled !== disabled.value || previousReadonly !== readonly.value
            || rules.length !== previousRules.length || rules.some((rule, index) => replacedArray
                ? !sameRule(rule, previousRules[index]) : rule !== previousRules[index]);
        previousRules = rules;
        previousRulesArray = props.rules;
        previousDisabled = disabled.value;
        previousReadonly = readonly.value;
        if (!changed) return;
        void resetValidation();
    }, { deep: true, flush: 'sync' });
    onMounted(() => { void nextTick(() => { initialValue = model.value; if (!validationMode.value.lazy) void validateResult(!validationMode.value.eager); }); });
    onBeforeUnmount(() => { disposed = true; validationGeneration++; runner.invalidate(); form?.unregister(control); field?.unregister(control); });
    function focus() { localFocused.value = true; instance?.emit('update:focused', true); }
    function blur() {
        localFocused.value = false;
        instance?.emit('update:focused', false);
        if (['blur', 'input', 'invalid-input'].includes(validationMode.value.trigger) && !form?.resetting.value) void validateResult();
    }
    watch(() => props.focused, (value, previous) => { if (value === false && previous === true) blur(); });
    const validationClasses = computed(() => ({ 'is-invalid': state.value === false, 'is-dirty': isDirty.value, 'is-disabled': disabled.value, 'is-readonly': readonly.value }));
    function guard(event: Event) { if (readonly.value || disabled.value) event.preventDefault(); }
    function guardKeys(event: KeyboardEvent) {
        if (readonly.value && event.key !== 'Tab' && event.key !== 'Escape' && !event.ctrlKey && !event.metaKey) event.preventDefault();
    }
    const editable = computed({ get: () => model.value, set: (value: T) => { if (!readonly.value && !disabled.value) model.value = value; } });
    return { ...control, props, validate, displayErrors, isDirty, isPristine, isValidating, focused, validationClasses, framed, disabled, readonly, dense, ghost, rounded, density, variant, color, classes, styles, labelPosition, labelWidth, editable, focus, blur, guard, guardKeys };
}

export function createControlRegistry() { return shallowReactive(new Set<RegisteredControl>()); }
