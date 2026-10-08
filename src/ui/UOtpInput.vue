<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import UProgressCircular from './UProgressCircular.vue';
import { mergeControlAttrs } from './form';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { insertOtpText, normalizeOtp, otpArrowDelta, otpCharacters, resolveOtpPattern } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & {
    length?: number | string;
    numeric?: boolean;
    autofocus?: boolean;
    type?: 'text' | 'number' | 'password';
    masked?: boolean;
    placeholder?: string;
    pattern?: RegExp | string;
    divider?: string;
    focusAll?: boolean;
}>(), { length: 6, numeric: false, autofocus: false, type: 'text', masked: false, focusAll: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UOtpInput');
const emit = defineEmits<{ 'update:focused': [value: boolean]; finish: [value: string] }>();
const model = defineModel<string | number | null | undefined>();
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const inputs = ref<Array<HTMLInputElement | undefined>>([]);
const control = useFormControl(props, model, element, attrs);
const value = computed(() => model.value == null ? '' : String(model.value));
const otpLength = computed(() => Math.max(0, Math.floor(Number(props.length) || 0)));
const numericInput = computed(() => props.numeric || props.type === 'number');
const cells = computed(() => Array.from({ length: otpLength.value }, (_, index) => otpCharacters(value.value)[index] ?? ''));
const inputType = computed(() => props.masked ? 'password' : props.type);
const inputMode = computed(() => {
    const pattern = resolveOtpPattern(props.pattern, false);
    return props.pattern == null && numericInput.value || pattern?.source === '[0-9]' ? 'numeric' : 'text';
});
const focusAllActive = computed(() => props.focusAll && control.focused.value);
let disposed = false;
let finishGeneration = 0;
let focusGeneration = 0;
let lastFinishedValue: string | undefined;
watch([value, otpLength], ([next, length], [previous]) => {
    const current = ++finishGeneration;
    const characterCount = otpCharacters(next).length;
    if (characterCount !== length || !next) {
        if (characterCount < length) lastFinishedValue = undefined;
        return;
    }
    if (next === previous || next === lastFinishedValue) return;
    lastFinishedValue = next;
    void nextTick(() => {
        if (!disposed && current === finishGeneration && value.value === next && otpLength.value === length) emit('finish', next);
    });
}, { flush: 'sync' });
function focus(index = 0) {
    if (control.disabled.value) return;
    const last = inputs.value.length - 1;
    if (last < 0) return;
    inputs.value[Math.max(0, Math.min(index, last))]?.focus();
}
function scheduleFocus(index = 0) {
    const current = ++focusGeneration;
    void nextTick(() => {
        if (!disposed && current === focusGeneration && !control.disabled.value) focus(index);
    });
}
function restoreInput(index: number) {
    const input = inputs.value[index];
    if (input) input.value = cells.value[index] ?? '';
}
function remove(index: number) {
    if (control.disabled.value || control.readonly.value || index < 0 || index >= otpCharacters(value.value).length) return;
    const next = otpCharacters(value.value);
    next.splice(index, 1);
    control.editable.value = next.join('') || undefined;
    scheduleFocus(index);
}
function update(index: number, raw: string) {
    if (control.disabled.value || control.readonly.value) { restoreInput(index); return; }
    const normalized = normalizeOtp(raw, otpLength.value, numericInput.value, props.pattern);
    if (!normalized) {
        if (raw === '') remove(index);
        else restoreInput(index);
        return;
    }
    const nextValue = insertOtpText(value.value, index, normalized, otpLength.value, props.pattern, numericInput.value);
    if (nextValue !== value.value) control.editable.value = nextValue || undefined;
    scheduleFocus(Math.min(index + otpCharacters(normalized).length, Math.max(0, otpLength.value - 1)));
}
function keydown(index: number, event: KeyboardEvent) {
    if (control.disabled.value || control.readonly.value) {
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
        restoreInput(index);
        return;
    }
    if (event.key === 'Backspace') {
        event.preventDefault();
        const target = cells.value[index] ? index : index - 1;
        if (target < 0) return;
        remove(target);
    } else if (event.key === 'Delete') {
        event.preventDefault();
        remove(index);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const rtl = getComputedStyle(event.currentTarget as Element).direction === 'rtl';
        const delta = otpArrowDelta(event.key, rtl);
        if (delta !== undefined) focus(index + delta);
    }
}
function paste(index: number, event: ClipboardEvent) {
    event.preventDefault();
    if (control.disabled.value || control.readonly.value) { restoreInput(index); return; }
    update(index, event.clipboardData?.getData('text/plain').trim() ?? '');
}
function setInput(node: unknown, index: number) {
    if (node instanceof HTMLInputElement) inputs.value[index] = node;
    else {
        delete inputs.value[index];
        while (inputs.value.length && !inputs.value[inputs.value.length - 1]) inputs.value.length--;
    }
}
watch([otpLength, () => props.autofocus], ([length, autofocus], [previousLength, previousAutofocus]) => {
    if (autofocus && length > 0 && (length !== previousLength || !previousAutofocus)) scheduleFocus(0);
    else focusGeneration++;
}, { flush: 'post' });
onMounted(() => { if (props.autofocus && otpLength.value > 0) scheduleFocus(0); });
onBeforeUnmount(() => {
    disposed = true;
    finishGeneration++;
    focusGeneration++;
    inputs.value = [];
});
defineExpose({ element, inputs, cells, control, focus, focusAll: focusAllActive, update, remove, keydown, paste, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-bind="props" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <div ref="element" class="ui-otp-input" :class="[control.classes.value, { 'is-focus-all': focusAllActive }]" :data-focus-all="focusAllActive || undefined" :data-otp-type="props.type" :aria-describedby="controlAttrs['aria-describedby']" :aria-busy="props.loading || undefined" role="group">
                <template v-if="$slots.fields">
                    <slot name="fields" :cells="cells" :inputs="inputs" :focus="focus" :focus-all="focusAllActive" :update="update" />
                </template>
                <template v-else>
                    <template v-for="(cell, index) in cells" :key="index">
                        <span v-if="index > 0 && (props.divider || $slots.divider)" class="ui-otp-divider" aria-hidden="true"><slot name="divider" :index="index - 1">{{ props.divider }}</slot></span>
                        <input :id="index === 0 ? control.id() : undefined" :data-otp-index="index" :data-focus-all="focusAllActive || undefined" :ref="(node) => setInput(node, index)" :value="cell" :type="inputType" :inputmode="inputMode" :autocomplete="index === 0 ? 'one-time-code' : 'off'" :autofocus="props.autofocus && index === 0" :placeholder="props.placeholder" :aria-label="(props.label || '验证码') + '第 ' + (index + 1) + ' 位'" :disabled="control.disabled.value" :readonly="control.readonly.value" @input="update(index, ($event.target as HTMLInputElement).value)" @keydown="keydown(index, $event)" @paste="paste(index, $event)" @focus="control.focus" @blur="control.blur" />
                    </template>
                </template>
                <div v-if="props.loading" class="ui-otp-loader" role="status"><slot name="loader"><UProgressCircular indeterminate :size="24" :width="2" /></slot></div>
                <slot />
            </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
    </UiControlFrame>
</template>
