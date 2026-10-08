<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, onBeforeUnmount, ref, useAttrs, useId, useSlots, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
import { clampNumber, formatLocalizedNumber, parseLocalizedNumber, parseNumberInput, stepNumber } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<Omit<FormControlProps, 'counter'> & {
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    locale?: string;
    grouping?: boolean | 'always' | 'auto' | 'min2';
    minFractionDigits?: number;
    decimalSeparator?: string;
    groupSeparator?: string;
    controlVariant?: 'default' | 'end' | 'stacked' | 'split' | 'hidden';
    hideInput?: boolean;
    inset?: boolean;
    counter?: boolean | number | string;
    counterValue?: number | ((value: string) => number);
    persistentCounter?: boolean;
    persistentClear?: boolean;
} & { ripple?: RippleOptions }>(), {
    ripple: true,
    step: 1,
    controlVariant: 'default',
    hideInput: false,
    inset: false,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'UNumberInput');
const emit = defineEmits<{ 'update:focused': [value: boolean]; 'click:clear': [event: MouseEvent] }>();
const model = defineModel<number | null>({ default: null });
const attrs = useAttrs();
const slots = useSlots();
const locale = useLocale();
const element = ref<HTMLInputElement>();
const control = useFormControl(props as FormControlProps, model, element, attrs);
const text = ref(formatValue(model.value));
const invalidInput = ref(false);
const effectiveControlVariant = computed(() => props.hideInput ? 'stacked' : props.controlVariant);
const counterId = `${useId()}-counter`;
const hasCounter = computed(() => !!slots.counter || props.counterValue !== undefined || props.counter !== undefined && props.counter !== false);
const counterActive = computed(() => props.counter !== false && (!!props.persistentCounter || control.focused.value));
const counterMax = computed(() => {
    const value = attrs.maxlength ?? props.counter;
    return (typeof value === 'number' || typeof value === 'string' && value.trim()) && Number.isFinite(Number(value)) && Number(value) >= 0 ? value as number | string : undefined;
});
const counterValue = computed(() => {
    const value = typeof props.counterValue === 'function' ? props.counterValue(text.value) : props.counterValue ?? text.value.length;
    return Number.isFinite(value) ? value : text.value.length;
});
const formattedCounter = computed(() => counterMax.value === undefined ? String(counterValue.value) : `${counterValue.value} / ${counterMax.value}`);
const inputSlotScope = computed(() => ({ id: control.id(), controlRef: element, isFocused: control.focused, isActive: !!text.value || control.focused.value }));
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
function localizedOptions() {
    return {
        locale: props.locale ?? '',
        grouping: props.grouping ?? false,
        precision: props.precision,
        minFractionDigits: props.minFractionDigits,
        decimalSeparator: props.decimalSeparator,
        groupSeparator: props.groupSeparator
    };
}
function formatValue(value: number | null | undefined): string {
    if (value == null) return '';
    return props.locale ? formatLocalizedNumber(value, localizedOptions()) : String(value);
}
function parseValue(value: string): number | null | undefined {
    return props.locale
        ? parseLocalizedNumber(value, localizedOptions(), props.min, props.max)
        : parseNumberInput(value, props.min, props.max);
}
watch([model, () => props.locale, () => props.precision, () => props.minFractionDigits, () => props.grouping, () => props.decimalSeparator, () => props.groupSeparator], ([value]) => {
    text.value = formatValue(value);
    invalidInput.value = false;
});
const canDecrease = computed(() => !control.disabled.value && !control.readonly.value && (model.value == null || stepNumber(model.value, -1, props.step, props.min, props.max, props.precision) !== model.value));
const canIncrease = computed(() => !control.disabled.value && !control.readonly.value && (model.value == null || stepNumber(model.value, 1, props.step, props.min, props.max, props.precision) !== model.value));
let holdDelay: number | undefined;
let holdInterval: number | undefined;
let clickGuardTimeout: number | undefined;
let holdButton: HTMLButtonElement | null = null;
let suppressClickButton: HTMLButtonElement | null = null;

function stopHold() {
    if (holdDelay !== undefined) window.clearTimeout(holdDelay);
    if (holdInterval !== undefined) window.clearInterval(holdInterval);
    holdDelay = undefined;
    holdInterval = undefined;
    holdButton = null;
    if (typeof window !== 'undefined') {
        window.removeEventListener('pointerup', endHold);
        window.removeEventListener('pointercancel', endHold);
        window.removeEventListener('blur', endHold);
    }
}

function endHold() {
    stopHold();
    const button = suppressClickButton;
    if (!button) return;
    if (clickGuardTimeout !== undefined) window.clearTimeout(clickGuardTimeout);
    clickGuardTimeout = window.setTimeout(() => {
        if (suppressClickButton === button) suppressClickButton = null;
        clickGuardTimeout = undefined;
    }, 0);
}

function onStepPointerDown(event: PointerEvent, direction: -1 | 1) {
    if (event.button !== 0) return;
    const button = event.currentTarget as HTMLButtonElement;
    if (!button || button.disabled || control.disabled.value || control.readonly.value) return;
    stopHold();
    holdButton = button;
    suppressClickButton = button;
    change(direction);
    holdDelay = window.setTimeout(() => {
        if (holdButton !== button) return;
        holdInterval = window.setInterval(() => change(direction), 50);
    }, 500);
    window.addEventListener('pointerup', endHold, { once: true });
    window.addEventListener('pointercancel', endHold, { once: true });
    window.addEventListener('blur', endHold, { once: true });
}

function stepClick(event: MouseEvent, direction: -1 | 1) {
    const button = event.currentTarget as HTMLButtonElement;
    if (button !== suppressClickButton) { change(direction); return; }
    suppressClickButton = null;
    if (clickGuardTimeout !== undefined) window.clearTimeout(clickGuardTimeout);
    clickGuardTimeout = undefined;
    event.preventDefault();
    event.stopPropagation();
    requestAnimationFrame(() => {
        if (document.activeElement === button) button.blur();
    });
}

onBeforeUnmount(() => {
    stopHold();
    if (clickGuardTimeout !== undefined) window.clearTimeout(clickGuardTimeout);
    clickGuardTimeout = undefined;
    suppressClickButton = null;
});
watch([control.disabled, control.readonly], ([disabled, readonly]) => {
    if (disabled || readonly) endHold();
});

function updateText(value: string) {
    text.value = value;
    const parsed = parseValue(value);
    invalidInput.value = parsed === undefined;
    if (parsed !== undefined && !control.disabled.value && !control.readonly.value) control.editable.value = parsed;
}
function commit() {
    const parsed = parseValue(text.value);
    if (parsed === undefined) { text.value = formatValue(model.value); invalidInput.value = false; }
    else {
        if (!control.disabled.value && !control.readonly.value) control.editable.value = parsed;
        text.value = formatValue(parsed);
        invalidInput.value = false;
    }
    control.blur();
}
function change(direction: -1 | 1) {
    if (control.disabled.value || control.readonly.value) return;
    if (direction === 1 && !canIncrease.value || direction === -1 && !canDecrease.value) return;
    const next = model.value == null
        ? clampNumber(0, props.min, props.max)
        : stepNumber(model.value, direction, props.step, props.min, props.max, props.precision);
    control.editable.value = next;
    text.value = formatValue(next);
    invalidInput.value = false;
}
function keydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); change(event.key === 'ArrowUp' ? 1 : -1); }
}
function clear(event: MouseEvent) {
    if (!props.clearable || control.disabled.value || control.readonly.value) return;
    endHold();
    control.editable.value = null;
    text.value = '';
    invalidInput.value = false;
    element.value?.focus();
    emit('click:clear', event);
}
function stepProps(direction: -1 | 1) {
    return {
        type: 'button' as const,
        class: 'ui-control-step',
        'aria-label': direction > 0 ? '增加数值' : '减少数值',
        disabled: direction > 0 ? !canIncrease.value : !canDecrease.value,
        onPointerdown: (event: PointerEvent) => onStepPointerDown(event, direction),
        onClick: (event: MouseEvent) => stepClick(event, direction)
    };
}
defineExpose({ element, text, invalidInput, canDecrease, canIncrease, control, updateText, commit, change, keydown, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <slot name="prepend" />
            <div class="ui-input ui-number-input" :class="[attrs.class, control.classes.value, `is-control-${effectiveControlVariant}`, { 'is-inset': props.inset, 'is-input-hidden': props.hideInput }]" :data-control-variant="effectiveControlVariant" :data-inset="props.inset || undefined" :style="[control.styles.value, attrs.style as any]">
                <slot v-if="effectiveControlVariant !== 'hidden'" name="decrement" :props="stepProps(-1)"><button v-bind="stepProps(-1)" v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-pointer-blur>−</button></slot>
                <div v-if="!props.hideInput" class="ui-number-input-body">
                    <span v-if="$slots['prepend-inner']" class="ui-input-adornment"><slot name="prepend-inner" /></span>
                    <span v-if="props.prefix" class="ui-input-adornment">{{ props.prefix }}</span>
                    <input ref="element" v-bind="mergeControlAttrs(inputAttrs(), controlAttrs, control.id())" :value="text" :name="props.name" type="text" inputmode="decimal" role="spinbutton" :aria-valuenow="model ?? undefined" :aria-valuemin="props.min" :aria-valuemax="props.max" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalidInput || control.state.value === false || undefined" :aria-describedby="[mergeControlAttrs(inputAttrs(), controlAttrs, control.id())['aria-describedby'], hasCounter ? counterId : ''].filter(Boolean).join(' ') || undefined" @input="updateText(($event.target as HTMLInputElement).value)" @focus="control.focus" @blur="commit" @keydown="keydown" />
                    <span v-if="props.suffix" class="ui-input-adornment">{{ props.suffix }}</span>
                    <slot v-if="props.loading" name="loader" :is-active="true" :color="props.color"><span class="u-input-loading" role="status" :aria-label="locale.t('common.loading')" /></slot>
                    <slot v-if="props.clearable && (text || props.persistentClear) && !control.disabled.value && !control.readonly.value" name="clear" :props="{ onClick: clear }"><button v-ripple="props.ripple" v-pointer-blur type="button" class="u-input-clear" :aria-label="locale.t('common.clear')" @pointerdown.prevent @click="clear">×</button></slot>
                    <span v-if="$slots['append-inner']" class="ui-input-adornment"><slot name="append-inner" /></span>
                    <slot v-bind="inputSlotScope" />
                </div>
                <slot v-if="effectiveControlVariant !== 'hidden'" name="increment" :props="stepProps(1)"><button v-bind="stepProps(1)" v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-pointer-blur>+</button></slot>
            </div>
            <slot name="append" />
            <output v-if="hasCounter" v-show="counterActive" :id="counterId" class="u-input-counter" :class="{ 'is-over-limit': counterMax !== undefined && counterValue > Number(counterMax) }" :for="control.id()"><slot name="counter" :counter="formattedCounter" :max="counterMax" :value="counterValue">{{ formattedCounter }}</slot></output>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
