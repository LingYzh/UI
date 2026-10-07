<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeRange } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { min?: number; max?: number; step?: number }>(), { min: 0, max: 100, step: 1, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'URangeSlider');
const model = defineModel<[number, number]>({ default: () => [0, 100] });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const startInput = ref<HTMLInputElement>();
const endInput = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const range = computed(() => normalizeRange(model.value, props.min, props.max, props.step));
const percentages = computed(() => props.max === props.min ? [0, 0] : range.value.map((value) => (value - props.min) / (props.max - props.min) * 100));
function update(index: 0 | 1, value: number) {
    if (control.disabled.value || control.readonly.value) return;
    const next: [number, number] = [...range.value];
    next[index] = value;
    control.editable.value = normalizeRange(next, props.min, props.max, props.step, index);
}
function input(index: 0 | 1, event: Event) { update(index, Number((event.target as HTMLInputElement).value)); }
defineExpose({ element, startInput, endInput, range, percentages, control, update, input, focus: () => startInput.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-range-slider-control" :class="control.classes.value" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']">
            <div class="ui-range-slider-track">
                <div class="ui-range-slider-fill" :style="{ insetInlineStart: percentages[0] + '%', width: percentages[1] - percentages[0] + '%' }" />
            <input v-focus-modality :id="control.id()" ref="startInput" type="range" :value="range[0]" :min="props.min" :max="props.max" :step="props.step" :disabled="control.disabled.value" :aria-label="(props.label || '范围') + '：下限'" :aria-readonly="control.readonly.value || undefined" @pointerdown="control.guard" @keydown="control.guardKeys" @input="input(0, $event)" @blur="control.blur" />
            <input v-focus-modality ref="endInput" type="range" :value="range[1]" :min="props.min" :max="props.max" :step="props.step" :disabled="control.disabled.value" :aria-label="(props.label || '范围') + '：上限'" :aria-readonly="control.readonly.value || undefined" @pointerdown="control.guard" @keydown="control.guardKeys" @input="input(1, $event)" @blur="control.blur" />
            </div>
            <div class="ui-range-slider-values"><output>{{ range[0] }}</output><output>{{ range[1] }}</output></div>
        </div>
    </UiControlFrame>
</template>
