<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { parseNumberInput, stepNumber } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { min?: number; max?: number; step?: number; precision?: number }>(), { step: 1, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UNumberInput');
const model = defineModel<number | null>({ default: null });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const text = ref(model.value == null ? '' : String(model.value));
const invalidInput = ref(false);
watch(model, (value) => { text.value = value == null ? '' : String(value); invalidInput.value = false; });
const canDecrease = computed(() => !control.disabled.value && !control.readonly.value && (props.min === undefined || (model.value ?? props.min) > props.min));
const canIncrease = computed(() => !control.disabled.value && !control.readonly.value && (props.max === undefined || (model.value ?? props.max) < props.max));
function updateText(value: string) {
    text.value = value;
    const parsed = parseNumberInput(value, props.min, props.max);
    invalidInput.value = parsed === undefined;
    if (parsed !== undefined && !control.disabled.value && !control.readonly.value) control.editable.value = parsed;
}
function commit() {
    const parsed = parseNumberInput(text.value, props.min, props.max);
    if (parsed === undefined) { text.value = model.value == null ? '' : String(model.value); invalidInput.value = false; }
    else if (parsed !== null) text.value = String(parsed);
    control.blur();
}
function change(direction: -1 | 1) {
    if (control.disabled.value || control.readonly.value) return;
    const next = stepNumber(model.value, direction, props.step, props.min, props.max, props.precision);
    control.editable.value = next;
    text.value = String(next);
}
function keydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); change(event.key === 'ArrowUp' ? 1 : -1); }
}
defineExpose({ element, text, invalidInput, canDecrease, canIncrease, control, updateText, commit, change, keydown, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-input ui-number-input" :class="control.classes.value" :style="control.styles.value">
            <button v-pointer-blur type="button" class="ui-control-step" aria-label="减少数值" :disabled="!canDecrease" @click="change(-1)">−</button>
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :value="text" type="text" inputmode="decimal" role="spinbutton" :aria-valuenow="model ?? undefined" :aria-valuemin="props.min" :aria-valuemax="props.max" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalidInput || control.state.value === false || undefined" @input="updateText(($event.target as HTMLInputElement).value)" @blur="commit" @keydown="keydown" />
            <button v-pointer-blur type="button" class="ui-control-step" aria-label="增加数值" :disabled="!canIncrease" @click="change(1)">+</button>
        </div>
    </UiControlFrame>
</template>
