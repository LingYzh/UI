<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeSlider } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { min?: number; max?: number; step?: number; showTicks?: boolean; thumbLabel?: boolean }>(), { min: 0, max: 100, step: 1, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'USlider');
const model = defineModel<number>({ default: 0 });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const value = computed(() => normalizeSlider(model.value, props.min, props.max, props.step));
const percent = computed(() => props.max === props.min ? 0 : (value.value - props.min) / (props.max - props.min) * 100);
function update(next: number) { if (!control.disabled.value && !control.readonly.value) control.editable.value = normalizeSlider(next, props.min, props.max, props.step); }
function input(event: Event) { update(Number((event.target as HTMLInputElement).value)); }
defineExpose({ element, value, percent, control, update, input, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-slider-control" :class="control.classes.value" :style="control.styles.value">
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="range" :value="value" :min="props.min" :max="props.max" :step="props.step" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :style="{ '--ui-slider-progress': percent + '%' }" @pointerdown="control.guard" @keydown="control.guardKeys" @input="input" @blur="control.blur" />
            <output v-if="props.thumbLabel">{{ value }}</output><div v-if="props.showTicks" class="ui-slider-ticks"><span>{{ props.min }}</span><span>{{ props.max }}</span></div>
        </div>
    </UiControlFrame>
</template>
