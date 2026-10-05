<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, nextTick, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeOtp } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { length?: number; numeric?: boolean; autofocus?: boolean }>(), { length: 6, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UOtpInput');
const emit = defineEmits<{ finish: [value: string] }>();
const model = defineModel<string>({ default: '' });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const inputs = ref<HTMLInputElement[]>([]);
const control = useFormControl(props, model, element, attrs);
const cells = computed(() => Array.from({ length: Math.max(0, props.length) }, (_, index) => model.value[index] ?? ''));
function focus(index: number) { inputs.value[Math.max(0, Math.min(index, inputs.value.length - 1))]?.focus(); }
function update(index: number, raw: string) {
    if (control.disabled.value || control.readonly.value) return;
    const normalized = normalizeOtp(raw, props.length, !!props.numeric);
    if (!normalized) return;
    const next = model.value.padEnd(index, ' ').split('');
    normalized.split('').forEach((character, offset) => { if (index + offset < props.length) next[index + offset] = character; });
    control.editable.value = normalizeOtp(next.join('').trimEnd(), props.length, !!props.numeric);
    if (model.value.length === props.length) emit('finish', model.value);
    void nextTick(() => focus(index + normalized.length));
}
function keydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
        event.preventDefault();
        if (control.disabled.value || control.readonly.value) return;
        const target = cells.value[index] ? index : index - 1;
        if (target < 0) return;
        const next = model.value.split('');
        next.splice(target, 1);
        control.editable.value = next.join('');
        void nextTick(() => focus(target));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        focus(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
}
function paste(index: number, event: ClipboardEvent) { event.preventDefault(); update(index, event.clipboardData?.getData('text') ?? ''); }
defineExpose({ element, inputs, cells, control, focus, update, keydown, paste, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
function setInput(node: unknown, index: number) { if (node instanceof HTMLInputElement) inputs.value[index] = node; }
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-otp-input" :class="control.classes.value" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']">
            <input v-for="(cell, index) in cells" :id="index === 0 ? control.id() : undefined" :key="index" :ref="(node) => setInput(node, index)" :value="cell" :inputmode="props.numeric ? 'numeric' : 'text'" :autocomplete="index === 0 ? 'one-time-code' : 'off'" :autofocus="props.autofocus && index === 0" :aria-label="(props.label || '验证码') + '第 ' + (index + 1) + ' 位'" :disabled="control.disabled.value" :readonly="control.readonly.value" maxlength="1" @input="update(index, ($event.target as HTMLInputElement).value)" @keydown="keydown(index, $event)" @paste="paste(index, $event)" @blur="control.blur" />
        </div>
    </UiControlFrame>
</template>
