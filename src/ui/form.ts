import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, shallowReactive, useId, watch, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import { createValidationRunner, type ValidateOn, type ValidationRule, type ValidationResult } from './validation';
import { uiText } from './locale';

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
    maxErrors?: number;
    validateOn?: ValidateOn;
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
    reset: () => void;
    resetValidation: () => void;
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
    const form = inject(formContextKey, undefined);
    const field = inject(fieldContextKey, undefined);
    const uid = useId();
    const framed = computed(() => Boolean(props.label || props.hint || props.rules || props.errorMessages !== undefined || (form && !field)));
    const disabled = computed(() => Boolean(form?.disabled.value || props.disabled));
    const readonly = computed(() => Boolean(form?.readonly.value || props.readonly));
    const dense = computed(() => props.dense ?? form?.dense.value ?? false);
    const ghost = computed(() => props.ghost ?? form?.ghost.value ?? false);
    const rounded = computed(() => props.rounded ?? form?.rounded.value ?? true);
    const labelPosition = computed(() => props.labelPosition ?? form?.labelPosition.value ?? 'top');
    const labelWidth = computed(() => props.labelWidth ?? form?.labelWidth.value ?? '180px');
    const validateOn = computed(() => props.validateOn ?? form?.validateOn.value ?? 'input');
    const ownErrors = ref<string[]>([]);
    const ownValid = ref<boolean | null>(null);
    const externalErrors = computed(() => [...new Set([
        ...(field?.error.value ? [field.error.value] : []),
        ...(typeof props.errorMessages === 'string' ? [props.errorMessages] : props.errorMessages ?? [])
    ].filter(Boolean))]);
    const enabled = computed(() => !disabled.value);
    const errors = computed(() => enabled.value ? [...new Set([...externalErrors.value, ...ownErrors.value])] : []);
    const state = computed(() => !enabled.value ? true : errors.value.length ? false : ownValid.value);
    let initialValue = model.value;
    let disposed = false;
    const runner = createValidationRunner({
        value: () => model.value,
        rules: () => props.rules ?? [],
        nativeError: () => {
            const control = element.value as HTMLInputElement | undefined;
            return control?.willValidate && !control.validity.valid ? control.validationMessage : '';
        },
        externalErrors: () => externalErrors.value,
        enabled: () => enabled.value && !element.value?.matches(':disabled'),
        maxErrors: () => props.maxErrors ?? 1,
        fallback: () => uiText('form.invalid'),
        failure: () => uiText('form.validationFailed'),
        beforeValidate: () => nextTick(),
        commit: (messages) => { if (!disposed) { ownErrors.value = messages; ownValid.value = messages.length === 0; } }
    });
    function resetValidation() {
        runner.invalidate();
        ownErrors.value = [];
        ownValid.value = null;
    }
    function reset() { model.value = initialValue; resetValidation(); }
    const control: RegisteredControl = {
        id: () => String(attrs.id ?? uid),
        element: () => element.value,
        state, errors, enabled,
        revision: runner.revision,
        validate: runner.validate, reset, resetValidation
    };
    form?.register(control);
    field?.register(control);
    watch(model, () => {
        resetValidation();
        if (!form?.resetting.value && validateOn.value === 'input') void runner.validate();
    }, { flush: 'sync' });
    watch(() => [props.rules, disabled.value, readonly.value], () => {
        resetValidation();
    }, { deep: true, flush: 'sync' });
    onMounted(() => { void nextTick(() => { initialValue = model.value; }); });
    onBeforeUnmount(() => { disposed = true; runner.invalidate(); form?.unregister(control); field?.unregister(control); });
    function blur() { if (validateOn.value === 'blur' && !form?.resetting.value) void runner.validate(); }
    function guard(event: Event) { if (readonly.value || disabled.value) event.preventDefault(); }
    function guardKeys(event: KeyboardEvent) {
        if (readonly.value && event.key !== 'Tab' && event.key !== 'Escape' && !event.ctrlKey && !event.metaKey) event.preventDefault();
    }
    const editable = computed({ get: () => model.value, set: (value: T) => { if (!readonly.value && !disabled.value) model.value = value; } });
    return { ...control, framed, disabled, readonly, dense, ghost, rounded, labelPosition, labelWidth, editable, blur, guard, guardKeys };
}

export function createControlRegistry() { return shallowReactive(new Set<RegisteredControl>()); }
