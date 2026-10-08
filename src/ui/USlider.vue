<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeSlider, sliderKeyboardValue, sliderTicks } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & {
    min?: number;
    max?: number;
    step?: number;
    showTicks?: boolean | 'always';
    ticks?: readonly number[] | Readonly<Record<string, string>>;
    labels?: readonly string[];
    tickSize?: number | string;
    thumbLabel?: boolean | 'always' | 'hover';
    thumbSize?: number | string;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    noKeyboard?: boolean;
}>(), { min: 0, max: 100, step: 0, showTicks: false, thumbLabel: false, direction: 'horizontal', reverse: false, noKeyboard: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'USlider');
const emit = defineEmits<{
    'update:focused': [value: boolean];
    start: [value: number];
    end: [value: number];
}>();
const model = defineModel<number | null>({ default: 0 });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const value = computed(() => normalizeSlider(model.value ?? props.min, props.min, props.max, props.step));
const percent = computed(() => props.max === props.min ? 0 : (value.value - props.min) / (props.max - props.min) * 100);
const position = computed(() => (props.direction === 'vertical') !== props.reverse ? 100 - percent.value : percent.value);
const ticks = computed(() => sliderTicks(props.min, props.max, props.step, props.showTicks, props.ticks, props.labels));
const sizeValue = (size: number | string | undefined) => size == null ? undefined : typeof size === 'number' ? `${size}px` : size;
const sliderStyle = computed(() => ({
    ...control.styles.value,
    '--ui-slider-progress': `${position.value}%`,
    '--ui-slider-value-percent': `${percent.value}%`,
    '--ui-slider-thumb-size': sizeValue(props.thumbSize),
    '--ui-slider-tick-size': sizeValue(props.tickSize)
}));
const hovered = ref(false);
const showThumbLabel = computed(() => props.thumbLabel === 'always' || (props.thumbLabel === true && control.focused.value) || (props.thumbLabel === 'hover' && (hovered.value || control.focused.value)));
type InteractionKind = 'pointer' | 'keyboard';
let interaction: InteractionKind | undefined;
const KEYBOARD_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
function update(next: number) {
    if (!Number.isFinite(next) || control.disabled.value || control.readonly.value) return;
    control.editable.value = normalizeSlider(next, props.min, props.max, props.step);
}
function begin(kind: InteractionKind) {
    if (control.disabled.value || control.readonly.value) return;
    if (interaction === kind) return;
    if (interaction) finish();
    interaction = kind;
    emit('start', value.value);
}
function finish(kind?: InteractionKind) {
    if (!interaction || (kind && interaction !== kind)) return;
    interaction = undefined;
    emit('end', value.value);
}
function pointerDown(event: PointerEvent) {
    control.guard(event);
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    begin('pointer');
    if (interaction === 'pointer') {
        window.addEventListener('pointerup', pointerEnd);
        window.addEventListener('pointercancel', pointerEnd);
        window.addEventListener('blur', pointerEnd);
    }
}
function pointerEnd() {
    if (typeof window !== 'undefined') {
        window.removeEventListener('pointerup', pointerEnd);
        window.removeEventListener('pointercancel', pointerEnd);
        window.removeEventListener('blur', pointerEnd);
    }
    finish('pointer');
}
function keydown(event: KeyboardEvent) {
    if (!KEYBOARD_KEYS.includes(event.key)) return;
    if (props.noKeyboard || control.disabled.value || control.readonly.value) {
        event.preventDefault();
        if (element.value) element.value.value = String(value.value);
        return;
    }
    const controlRoot = (event.currentTarget as Element).closest('.ui-slider-control') ?? event.currentTarget as Element;
    const rtl = props.direction === 'vertical' ? false : getComputedStyle(controlRoot).direction === 'rtl';
    const next = sliderKeyboardValue(value.value, event.key, {
        min: props.min,
        max: props.max,
        step: props.step,
        direction: props.direction,
        reverse: props.reverse,
        rtl,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey
    });
    if (next === undefined) return;
    event.preventDefault();
    begin('keyboard');
    update(next);
}
function keyup(event: KeyboardEvent) { if (KEYBOARD_KEYS.includes(event.key)) finish('keyboard'); }
function input(event: Event) {
    const target = event.target as HTMLInputElement;
    if (control.disabled.value || control.readonly.value) {
        target.value = String(value.value);
        finish();
        return;
    }
    update(Number(target.value));
}
function blur() { finish(); control.blur(); }
watch([control.disabled, control.readonly], ([disabled, readonly]) => { if (disabled || readonly) finish(); });
onBeforeUnmount(() => { pointerEnd(); finish(); });
defineExpose({ element, value, percent, position, ticks, control, update, input, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-bind="props" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <div class="ui-slider-control" :class="[control.classes.value, { 'is-vertical': props.direction === 'vertical', 'is-reversed': props.reverse }]" :data-direction="props.direction" :data-reverse="props.reverse || undefined" :style="sliderStyle" @mouseenter="hovered = true" @mouseleave="hovered = false">
                <input v-focus-modality ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :id="control.id()" :name="props.name ?? control.id()" type="range" :value="value" :min="props.min" :max="props.max" :step="props.step > 0 ? props.step : 'any'" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-valuenow="value" :aria-valuemin="props.min" :aria-valuemax="props.max" :aria-orientation="props.direction" :aria-label="props.label" @pointerdown="pointerDown" @keydown="keydown" @keyup="keyup" @input="input" @focus="control.focus" @blur="blur" />
                <output v-if="showThumbLabel" class="ui-slider-thumb-label" :style="{ '--ui-slider-thumb-position': `${position}%` }"><slot name="thumb-label" :model-value="value" :value="value">{{ value }}</slot></output>
                <div v-if="props.showTicks" class="ui-slider-ticks" :data-show-ticks="props.showTicks">
                    <span v-for="(tick, index) in ticks" :key="tick.value" class="ui-slider-tick" :data-tick-value="tick.value" :style="{ '--ui-slider-tick-position': `${tick.position}%` }">
                        <slot name="tick-label" :tick="tick" :value="tick.value" :index="index">{{ tick.label }}</slot>
                    </span>
                </div>
            </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
    </UiControlFrame>
</template>
