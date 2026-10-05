<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue';
import { formLayoutKey } from './layout';
import { createControlRegistry, formContextKey, type FormValidationResult, type RegisteredControl } from './form';
import type { ValidateOn } from './validation';

const props = withDefaults(defineProps<{
    labelPosition?: 'top' | 'left'; labelWidth?: string;
    disabled?: boolean; readonly?: boolean; dense?: boolean; ghost?: boolean; rounded?: boolean;
    validateOn?: ValidateOn; fastFail?: boolean;
}>(), { labelPosition: 'top', labelWidth: '180px', validateOn: 'input', rounded: true });
const model = defineModel<boolean | null>({ default: null });
const emit = defineEmits<{ submit: [event: SubmitEvent, result: FormValidationResult]; invalid: [result: FormValidationResult] }>();
const element = ref<HTMLFormElement>();
const controls = createControlRegistry();
const resetting = ref(false);
const isValidating = ref(false);
const nativeErrors = ref<FormValidationResult['errors']>([]);
const layout = computed(() => props.labelPosition === 'left' ? 'horizontal' : 'vertical');
provide(formLayoutKey, layout);
provide(formContextKey, {
    disabled: computed(() => !!props.disabled), readonly: computed(() => !!props.readonly),
    dense: computed(() => !!props.dense), ghost: computed(() => !!props.ghost),
    rounded: computed(() => props.rounded ?? true), labelPosition: computed(() => layout.value === 'horizontal' ? 'left' : 'top'),
    labelWidth: computed(() => props.labelWidth), validateOn: computed(() => props.validateOn), resetting,
    register: control => controls.add(control), unregister: control => controls.delete(control)
});
const errors = computed(() => [...controls].filter(control => control.errors.value.length)
    .map(control => ({ id: control.id(), errorMessages: control.errors.value })).concat(nativeErrors.value));
const isValid = computed(() => errors.value.length ? false : [...controls].some(control => control.enabled.value && control.state.value === null) ? null : true);
watch(isValid, value => { model.value = value; }, { immediate: true });
let generation = 0;
let submitting = false;
let nativeResetting = false;

async function validate(): Promise<FormValidationResult> {
    const current = ++generation;
    const snapshot = [...controls];
    const revisions = new Map<RegisteredControl, number>();
    isValidating.value = true;
    nativeErrors.value = [];
    const cancelled = () => current !== generation || snapshot.length !== controls.size || snapshot.some(control => !controls.has(control))
        || [...revisions].some(([control, revision]) => control.revision() !== revision);
    try {
        for (const control of snapshot) {
            const result = await control.validate();
            revisions.set(control, control.revision());
            if (result.cancelled || cancelled()) return { valid: false, errors: errors.value, cancelled: true };
            if (props.fastFail && !result.valid) break;
        }
        await nextTick();
        if (cancelled()) return { valid: false, errors: errors.value, cancelled: true };
        const managed = new Set(snapshot.map(control => control.element()));
        nativeErrors.value = Array.from(element.value?.elements ?? []).filter(control => !managed.has(control as HTMLElement))
            .flatMap(control => {
                const input = control as HTMLInputElement;
                return input.willValidate && !input.validity.valid ? [{ id: input.id || input.name, errorMessages: [input.validationMessage] }] : [];
            });
        return { valid: !errors.value.length && ![...controls].some(control => control.state.value === false), errors: errors.value };
    } finally { if (current === generation) isValidating.value = false; }
}
function resetValidation() {
    generation++;
    isValidating.value = false;
    nativeErrors.value = [];
    controls.forEach(control => control.resetValidation());
}
async function reset() {
    resetting.value = true;
    try {
        nativeResetting = true;
        element.value?.reset();
        nativeResetting = false;
        controls.forEach(control => control.reset());
        await nextTick();
        resetValidation();
    } finally { nativeResetting = false; resetting.value = false; }
}
function handleReset(event: Event) {
    if (nativeResetting) return;
    event.preventDefault();
    void reset();
}
async function submit(event: SubmitEvent) {
    if (props.disabled || submitting) return;
    submitting = true;
    try {
        const result = await validate();
        if (props.disabled || result.cancelled) return;
        if (result.valid) emit('submit', event, result);
        else {
            emit('invalid', result);
            const first = [...controls].find(control => control.state.value === false)?.element() ?? element.value?.querySelector<HTMLElement>(':invalid');
            const target = first?.matches('input, select, textarea, button') ? first : first?.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)');
            target?.focus();
            target?.scrollIntoView({ block: 'nearest' });
        }
    } finally { submitting = false; }
}
onBeforeUnmount(() => { generation++; });
defineExpose({ element, isValid, isValidating, errors, validate, reset, resetValidation, requestSubmit: () => element.value?.requestSubmit() });
</script>

<template>
    <form ref="element" class="ui-form" :data-layout="layout" novalidate
        :style="{ '--ui-form-label-width': labelWidth }" :aria-disabled="disabled || undefined" :aria-busy="isValidating || undefined"
        @submit.prevent="submit" @reset="handleReset">
        <fieldset class="ui-form-body" :disabled="disabled">
            <slot :is-valid="isValid" :is-validating="isValidating" :errors="errors" :validate="validate" :reset="reset" :reset-validation="resetValidation" />
        </fieldset>
    </form>
</template>
