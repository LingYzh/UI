<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots, watch, type CSSProperties } from 'vue';
import Icon from '../components/Icon.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { vRipple, type RippleOptions } from './ripple';
import { useLocale } from './locale-context';

defineOptions({ inheritAttrs: false });

type TextareaProps = ControlSizing & Omit<FormControlProps, 'counter'> & {
    invalid?: boolean;
    rows?: number | string;
    autoGrow?: boolean;
    maxRows?: number | string;
    maxHeight?: number | string;
    noResize?: boolean;
    counter?: boolean | number | string;
    counterValue?: number | ((value: string) => number);
    persistentCounter?: boolean;
    persistentClear?: boolean;
    clearIcon?: string;
    ripple?: RippleOptions;
};

const rawProps = withDefaults(defineProps<TextareaProps>(), {
    rows: 5,
    clearable: false,
    persistentClear: false,
    ripple: true,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'UTextarea');
const emit = defineEmits<{ 'update:focused': [value: boolean]; 'update:rows': [value: number]; 'click:clear': [event: MouseEvent] }>();
const attrs = useAttrs();
const slots = useSlots();
const model = defineModel<string | null>({ default: '' });
const element = ref<HTMLTextAreaElement>();
// The control engine does not consume `counter`; its string limit belongs to this component.
const control = useFormControl(props as FormControlProps, model, element, attrs);
const slotScope = computed(() => ({ id: control.id(), controlRef: element, isFocused: control.focused, isActive: !!text.value || control.focused.value }));
const text = computed({
    get: () => model.value ?? '',
    set: (value: string) => { control.editable.value = value; }
});
const counterId = `${useId()}-counter`;
const safeRows = computed(() => Number.isFinite(Number(props.rows)) ? Math.max(1, Math.floor(Number(props.rows))) : 5);
const effectiveRows = ref(safeRows.value);
watch(effectiveRows, value => emit('update:rows', value));
const heightStyles = computed<CSSProperties>(() => ({ maxHeight: typeof props.maxHeight === 'number' ? `${Math.max(0, props.maxHeight)}px` : props.maxHeight }));
const hasCounter = computed(() => Boolean(
    slots.counter || props.counterValue != null || (props.counter !== undefined && props.counter !== false)
));
const locale = useLocale();
const counterActive = computed(() => props.counter !== false && (props.persistentCounter || control.focused.value));
const count = computed(() => {
    const value = typeof props.counterValue === 'function'
        ? props.counterValue(text.value)
        : props.counterValue ?? text.value.length;
    return Number.isFinite(value) ? value : text.value.length;
});
function numericLimit(value: unknown): number | undefined {
    if (typeof value !== 'number' && typeof value !== 'string') return undefined;
    if (typeof value === 'string' && !value.trim()) return undefined;
    const result = Number(value);
    return Number.isFinite(result) && result >= 0 ? result : undefined;
}
const limit = computed<string | number | undefined>(() => {
    const attrLimit = numericLimit(attrs.maxlength);
    if (attrLimit !== undefined) return attrs.maxlength as string | number;
    if (typeof props.counter === 'string' || typeof props.counter === 'number') {
        return numericLimit(props.counter) === undefined ? undefined : props.counter;
    }
    return undefined;
});
const numericMax = computed(() => numericLimit(limit.value));
const formattedCount = computed(() => limit.value === undefined ? String(count.value) : `${count.value} / ${limit.value}`);
const showClear = computed(() => Boolean(
    props.clearable && (text.value || props.persistentClear) && !control.disabled.value && !control.readonly.value
));
const hasFieldActions = computed(() => Boolean(props.clearable || props.loading || props.clearIcon));
const invalid = computed(() => props.invalid || control.state.value === false || attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true');
let observer: ResizeObserver | undefined;
let lastWidth = 0;
let originalHeight = '';
let ownedHeight = false;

function clear(event: MouseEvent) {
    if (!props.clearable || control.disabled.value || control.readonly.value) return;
    control.editable.value = null;
    element.value?.focus();
    emit('click:clear', event);
}

function resize() {
    const textarea = element.value;
    if (!textarea) return;
    if (!props.autoGrow) {
        if (ownedHeight) textarea.style.height = originalHeight;
        ownedHeight = false;
        effectiveRows.value = safeRows.value;
        return;
    }
    if (!ownedHeight) originalHeight = textarea.style.height;
    ownedHeight = true;
    const style = getComputedStyle(textarea);
    const parsedLine = parseFloat(style.lineHeight);
    const fontSize = parseFloat(style.fontSize);
    const line = Number.isFinite(parsedLine) ? parsedLine : Number.isFinite(fontSize) ? fontSize * 1.4 : 19.6;
    const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    const border = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
    const minimum = safeRows.value * line + padding + border;
    const rowMaximum = props.maxRows !== undefined && Number.isFinite(Number(props.maxRows))
        ? Math.max(safeRows.value, Math.floor(Number(props.maxRows))) * line + padding + border
        : Infinity;
    const heightMaximum = style.maxHeight.endsWith('px') ? Number.parseFloat(style.maxHeight) : Infinity;
    const maximum = Math.min(rowMaximum, Number.isFinite(heightMaximum) ? heightMaximum : Infinity);
    textarea.style.height = '0px';
    const height = Math.min(maximum, Math.max(minimum, textarea.scrollHeight + border));
    textarea.style.height = `${height}px`;
    effectiveRows.value = Math.max(1, Math.floor((height - padding - border) / line));
}

function textareaAttrs(controlAttrs: Record<string, unknown>) {
    const { style: _style, ...rest } = attrs;
    return mergeControlAttrs(rest, controlAttrs, control.id());
}

watch(() => [model.value, props.autoGrow, props.rows, props.maxRows, props.maxHeight, control.dense.value], () => nextTick(resize));
onMounted(() => {
    resize();
    observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        if (width !== lastWidth) {
            lastWidth = width;
            resize();
        }
    });
    if (element.value) observer.observe(element.value);
});
watch(element, (next, previous) => {
    if (previous) observer?.unobserve(previous);
    ownedHeight = false;
    if (next) {
        observer?.observe(next);
        nextTick(resize);
    }
});
onBeforeUnmount(() => observer?.disconnect());

defineExpose({
    element,
    focus: () => element.value?.focus(),
    select: () => element.value?.select(),
    validate: control.validate,
    reset: control.reset,
    resetValidation: control.resetValidation,
    focused: control.focused,
    isPristine: control.isPristine,
    isDirty: control.isDirty,
    isValidating: control.isValidating,
    state: control.state,
    errors: control.errors,
    displayErrors: control.displayErrors
});
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="control.framed.value" :for="control.id()" :error="control.displayErrors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <slot name="prepend" />
            <slot name="prepend-inner" />
            <div v-if="hasCounter" class="ui-textarea-wrap" :class="{ 'is-inline': props.inline }" :style="control.framed.value ? undefined : controlSizeStyles(props)">
                <div v-if="hasFieldActions" class="ui-textarea-field">
                    <textarea ref="element" v-model="text" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :name="props.name" class="ui-textarea"
                        :style="[attrs.style as CSSProperties, heightStyles]"
                        :class="{ 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'has-no-resize': props.noResize || props.autoGrow }"
                        :disabled="control.disabled.value" :readonly="control.readonly.value" :rows="safeRows" :aria-invalid="invalid || undefined" @focus="control.focus" @blur="control.blur"
                        :aria-describedby="[mergeControlAttrs(attrs, controlAttrs, control.id())['aria-describedby'], counterId].filter(Boolean).join(' ')" />
                    <slot v-if="props.loading" name="loader"><span class="u-input-loading" role="status" :aria-label="locale.t('common.loading')" /></slot>
                    <slot v-if="showClear" name="clear" :props="{ onClick: clear }">
                        <button v-ripple="props.ripple" type="button" class="u-input-clear" :aria-label="locale.t('common.clear')" @pointerdown.prevent @click="clear">
                            <Icon v-if="props.clearIcon" :icon="props.clearIcon" :size="16" />
                            <template v-else>×</template>
                        </button>
                    </slot>
                </div>
                <textarea v-else ref="element" v-model="text" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :name="props.name" class="ui-textarea"
                    :style="[attrs.style as CSSProperties, heightStyles]"
                    :class="{ 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'has-no-resize': props.noResize || props.autoGrow }"
                    :disabled="control.disabled.value" :readonly="control.readonly.value" :rows="safeRows" :aria-invalid="invalid || undefined" @focus="control.focus" @blur="control.blur"
                    :aria-describedby="[mergeControlAttrs(attrs, controlAttrs, control.id())['aria-describedby'], counterId].filter(Boolean).join(' ')" />
                <output v-show="counterActive" :id="counterId" class="ui-textarea-counter" :class="{ 'is-over-limit': numericMax !== undefined && count > numericMax }"
                    aria-live="off" :for="control.id()"><slot name="counter" :counter="formattedCount" :max="limit" :value="count">{{ formattedCount }}</slot></output>
            </div>
            <div v-else-if="hasFieldActions" class="ui-textarea-field" :style="[control.framed.value ? undefined : controlSizeStyles(props), attrs.style as CSSProperties]">
                <textarea ref="element" v-model="text" v-bind="textareaAttrs(controlAttrs)" :name="props.name" class="ui-textarea"
                    :style="heightStyles"
                    :class="{ 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'has-no-resize': props.noResize || props.autoGrow, 'is-inline': props.inline }"
                    :disabled="control.disabled.value" :readonly="control.readonly.value" :rows="safeRows" :aria-invalid="invalid || undefined" @focus="control.focus" @blur="control.blur" />
                <slot v-if="props.loading" name="loader"><span class="u-input-loading" role="status" :aria-label="locale.t('common.loading')" /></slot>
                <slot v-if="showClear" name="clear" :props="{ onClick: clear }">
                    <button v-ripple="props.ripple" type="button" class="u-input-clear" :aria-label="locale.t('common.clear')" @pointerdown.prevent @click="clear">
                        <Icon v-if="props.clearIcon" :icon="props.clearIcon" :size="16" />
                        <template v-else>×</template>
                    </button>
                </slot>
            </div>
            <textarea v-else ref="element" v-model="text" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :name="props.name" class="ui-textarea"
                :class="{ 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'has-no-resize': props.noResize || props.autoGrow, 'is-inline': props.inline }"
                :style="[control.framed.value ? undefined : controlSizeStyles(props), attrs.style as CSSProperties, heightStyles]"
                :disabled="control.disabled.value" :readonly="control.readonly.value" :rows="safeRows" :aria-invalid="invalid || undefined" @focus="control.focus" @blur="control.blur" />
            <slot v-bind="slotScope" />
            <slot name="append-inner" />
            <slot name="append" />
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
