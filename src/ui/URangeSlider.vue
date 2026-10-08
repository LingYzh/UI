<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import UiControlFrame from './UiControlFrame.vue';
import { vPointerBlur } from './pointer-focus';
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeRange, sliderKeyboardValue, sliderTicks } from './specialized-inputs';

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
const props = useDefaults(rawProps, 'URangeSlider');
const emit = defineEmits<{
    'update:focused': [value: boolean];
    start: [value: [number, number]];
    end: [value: [number, number]];
}>();
const model = defineModel<[number, number] | null>({ default: () => [0, 0] });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const startInput = ref<HTMLInputElement>();
const endInput = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const range = computed(() => normalizeRange(model.value ?? [props.min, props.min], props.min, props.max, props.step));
const percentages = computed(() => props.max === props.min ? [0, 0] : range.value.map((value) => (value - props.min) / (props.max - props.min) * 100));
const ticks = computed(() => sliderTicks(props.min, props.max, props.step, props.showTicks, props.ticks, props.labels));
const sizeValue = (size: number | string | undefined) => size == null ? undefined : typeof size === 'number' ? `${size}px` : size;
const sliderStyle = computed(() => ({
    ...control.styles.value,
    '--ui-slider-thumb-size': sizeValue(props.thumbSize),
    '--ui-slider-tick-size': sizeValue(props.tickSize)
}));
const hovered = ref(false);
const showThumbLabel = computed(() => props.thumbLabel === 'always' || (props.thumbLabel === true && control.focused.value) || (props.thumbLabel === 'hover' && (hovered.value || control.focused.value)));
const fillStyle = computed(() => {
    const vertical = props.direction === 'vertical';
    const fromEnd = vertical !== props.reverse;
    const start = `${vertical ? 'insetBlock' : 'insetInline'}${fromEnd ? 'End' : 'Start'}`;
    return {
        [start]: `${percentages.value[0]}%`,
        [vertical ? 'height' : 'width']: `${Math.max(0, percentages.value[1] - percentages.value[0])}%`
    };
});
type InteractionKind = 'pointer' | 'keyboard';
let interaction: InteractionKind | undefined;
let activeIndex: 0 | 1 = 0;
const KEYBOARD_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
function update(index: 0 | 1, value: number) {
    if (!Number.isFinite(value) || control.disabled.value || control.readonly.value) return;
    const next: [number, number] = [...range.value];
    next[index] = value;
    control.editable.value = normalizeRange(next, props.min, props.max, props.step, index);
}
function begin(index: 0 | 1, kind: InteractionKind) {
    if (control.disabled.value || control.readonly.value) return;
    if (interaction === kind && activeIndex === index) return;
    if (interaction) finish();
    activeIndex = index;
    interaction = kind;
    emit('start', [...range.value]);
}
function finish(kind?: InteractionKind) {
    if (!interaction || (kind && interaction !== kind)) return;
    interaction = undefined;
    emit('end', [...range.value]);
}
function pointerDown(event: PointerEvent, index: 0 | 1) {
    control.guard(event);
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    begin(index, 'pointer');
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
function keydown(index: 0 | 1, event: KeyboardEvent) {
    if (!KEYBOARD_KEYS.includes(event.key)) return;
    const input = event.currentTarget as HTMLInputElement;
    if (props.noKeyboard || control.disabled.value || control.readonly.value) {
        event.preventDefault();
        input.value = String(range.value[index]);
        return;
    }
    const controlRoot = input.closest('.ui-range-slider-control') ?? input;
    const rtl = props.direction === 'vertical' ? false : getComputedStyle(controlRoot).direction === 'rtl';
    const min = props.min;
    const max = props.max;
    const next = sliderKeyboardValue(range.value[index], event.key, {
        min,
        max,
        step: props.step,
        direction: props.direction,
        reverse: props.reverse,
        rtl,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey
    });
    if (next === undefined) return;
    event.preventDefault();
    begin(index, 'keyboard');
    update(index, next);
}
function keyup(event: KeyboardEvent) { if (KEYBOARD_KEYS.includes(event.key)) finish('keyboard'); }
function input(index: 0 | 1, event: Event) {
    const target = event.target as HTMLInputElement;
    if (control.disabled.value || control.readonly.value) {
        target.value = String(range.value[index]);
        finish();
        return;
    }
    update(index, Number(target.value));
}
function blur() { finish(); control.blur(); }
watch([control.disabled, control.readonly], ([disabled, readonly]) => { if (disabled || readonly) finish(); });
onBeforeUnmount(() => { pointerEnd(); finish(); });
defineExpose({ element, startInput, endInput, range, percentages, ticks, control, update, input, focus: () => startInput.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-bind="props" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <div ref="element" class="ui-range-slider-control" :class="[control.classes.value, { 'is-vertical': props.direction === 'vertical', 'is-reversed': props.reverse }]" :data-direction="props.direction" :data-reverse="props.reverse || undefined" :style="sliderStyle" :aria-describedby="controlAttrs['aria-describedby']" @mouseenter="hovered = true" @mouseleave="hovered = false">
                <div class="ui-range-slider-track" :data-direction="props.direction" :data-reverse="props.reverse || undefined">
                    <div class="ui-range-slider-fill" :style="fillStyle" />
                    <input v-focus-modality :id="`${control.id()}-start`" ref="startInput" :name="props.name ?? control.id()" type="range" :value="range[0]" :min="props.min" :max="props.max" :step="props.step > 0 ? props.step : 'any'" :disabled="control.disabled.value" :aria-label="(props.label || props.name || '范围') + '：下限'" :aria-valuenow="range[0]" :aria-valuemin="props.min" :aria-valuemax="range[1]" :aria-orientation="props.direction" :aria-readonly="control.readonly.value || undefined" :aria-describedby="controlAttrs['aria-describedby']" @pointerdown="pointerDown($event, 0)" @keydown="keydown(0, $event)" @keyup="keyup" @input="input(0, $event)" @focus="control.focus" @blur="blur" />
                    <input v-focus-modality :id="`${control.id()}-end`" ref="endInput" :name="props.name ?? control.id()" type="range" :value="range[1]" :min="props.min" :max="props.max" :step="props.step > 0 ? props.step : 'any'" :disabled="control.disabled.value" :aria-label="(props.label || props.name || '范围') + '：上限'" :aria-valuenow="range[1]" :aria-valuemin="range[0]" :aria-valuemax="props.max" :aria-orientation="props.direction" :aria-readonly="control.readonly.value || undefined" :aria-describedby="controlAttrs['aria-describedby']" @pointerdown="pointerDown($event, 1)" @keydown="keydown(1, $event)" @keyup="keyup" @input="input(1, $event)" @focus="control.focus" @blur="blur" />
                </div>
                <div class="ui-range-slider-values"><output>{{ range[0] }}</output><output>{{ range[1] }}</output></div>
                <div v-if="props.showTicks" class="ui-slider-ticks" :data-show-ticks="props.showTicks">
                    <span v-for="(tick, index) in ticks" :key="tick.value" class="ui-slider-tick" :data-tick-value="tick.value" :style="{ '--ui-slider-tick-position': `${tick.position}%` }">
                        <slot name="tick-label" :tick="tick" :value="tick.value" :index="index">{{ tick.label }}</slot>
                    </span>
                </div>
                <div v-if="showThumbLabel" class="ui-range-slider-thumb-labels">
                    <output :style="{ '--ui-slider-thumb-position': `${percentages[0]}%` }"><slot name="thumb-label" :model-value="range[0]" :value="range[0]">{{ range[0] }}</slot></output>
                    <output :style="{ '--ui-slider-thumb-position': `${percentages[1]}%` }"><slot name="thumb-label" :model-value="range[1]" :value="range[1]">{{ range[1] }}</slot></output>
                </div>
            </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
    </UiControlFrame>
</template>
