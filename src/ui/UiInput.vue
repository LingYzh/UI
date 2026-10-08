<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, ref, useAttrs, useId, useSlots, type CSSProperties } from 'vue';
import Icon from '../components/Icon.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ControlSizing & Omit<FormControlProps, 'counter'> & {
    invalid?: boolean; ripple?: RippleOptions; counter?: boolean | number | string;
    counterValue?: number | ((value: string) => number); persistentCounter?: boolean;
    clearIcon?: string; persistentClear?: boolean;
}>(), { ripple: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined, persistentCounter: false });
const props = useDefaults(rawProps, 'UTextField');
const emit = defineEmits<{ 'update:focused': [value: boolean]; 'click:clear': [event: MouseEvent] }>();
const attrs = useAttrs();
const slots = useSlots();
const locale = useLocale();
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
// 字符串模型保持原行为；type="number" 时模型为 number，清空为 null。
const model = defineModel<string | number | null>({ default: '' });
const numeric = computed(() => attrs.type === 'number');
const text = computed({
    get: () => (model.value === null || model.value === undefined ? '' : String(model.value)),
    set: (value: string) => {
        if (control.disabled.value || control.readonly.value) return;
        if (!numeric.value) {
            model.value = value;
            return;
        }
        // 输入中间态（如 "-"、"1e"）浏览器返回空串，此时不写回 null，避免打断输入。
        if (value === '') {
            if (element.value?.validity.badInput) return;
            model.value = null;
            return;
        }
        const number = Number(value);
        if (Number.isFinite(number)) model.value = number;
    }
});
const element = ref<HTMLInputElement>();
const control = useFormControl(props as FormControlProps, model, element, attrs);
const counterId = `${useId()}-counter`;
const hasCounter = computed(() => !!slots.counter || props.counterValue != null || props.counter !== undefined && props.counter !== false);
const counterActive = computed(() => props.counter !== false && (props.persistentCounter || control.focused.value));
function numericLimit(value: unknown): number | undefined {
    if (typeof value !== 'number' && typeof value !== 'string' || typeof value === 'string' && !value.trim()) return undefined;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : undefined;
}
const limit = computed(() => numericLimit(attrs.maxlength) !== undefined ? attrs.maxlength as string | number : numericLimit(props.counter) !== undefined ? props.counter as string | number : undefined);
const count = computed(() => {
    const value = typeof props.counterValue === 'function' ? props.counterValue(text.value) : props.counterValue ?? text.value.length;
    return Number.isFinite(value) ? value : text.value.length;
});
const formattedCount = computed(() => limit.value === undefined ? String(count.value) : `${count.value} / ${limit.value}`);
const slotScope = computed(() => ({ id: control.id(), controlRef: element, isFocused: control.focused, isActive: !!text.value || control.focused.value }));
function clear(event: MouseEvent) {
    if (!props.clearable || control.disabled.value || control.readonly.value) return;
    control.editable.value = null; element.value?.focus(); emit('click:clear', event);
}
defineExpose({ element, focus: () => element.value?.focus(), select: () => element.value?.select(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors, displayErrors: control.displayErrors, focused: control.focused, isPristine: control.isPristine, isDirty: control.isDirty, isValidating: control.isValidating });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="control.framed.value" :for="control.id()" :error="control.displayErrors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <slot name="prepend" />
            <div class="ui-input" :class="[$attrs.class, control.classes.value, { 'is-invalid': props.invalid, 'is-inline': props.inline }]" :style="[control.framed.value ? undefined : controlSizeStyles(props), control.styles.value, $attrs.style as CSSProperties]">
                <span v-if="$slots.leading || $slots['prepend-inner']" class="ui-input-adornment"><slot name="prepend-inner"><slot name="leading" /></slot></span>
                <span v-if="props.prefix" class="ui-input-adornment">{{ props.prefix }}</span>
                <input ref="element" v-model="text" v-bind="mergeControlAttrs(inputAttrs(), controlAttrs, control.id())" :name="props.name" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="props.invalid || control.state.value === false || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" :aria-describedby="[mergeControlAttrs(inputAttrs(), controlAttrs, control.id())['aria-describedby'], hasCounter ? counterId : ''].filter(Boolean).join(' ') || undefined" @focus="control.focus" @blur="control.blur" />
                <span v-if="props.suffix" class="ui-input-adornment">{{ props.suffix }}</span>
                <slot v-if="props.loading" name="loader"><span class="u-input-loading" role="status" :aria-label="locale.t('common.loading')" /></slot>
                <slot v-if="props.clearable && (text || props.persistentClear) && !control.disabled.value && !control.readonly.value" name="clear" :props="{ onClick: clear }"><button v-ripple="props.ripple" type="button" class="u-input-clear" :aria-label="locale.t('common.clear')" @pointerdown.prevent @click="clear"><Icon v-if="props.clearIcon" :icon="props.clearIcon" :size="16" /><template v-else>×</template></button></slot>
                <span v-if="$slots.trailing || $slots['append-inner']" class="ui-input-adornment"><slot name="append-inner"><slot name="trailing" /></slot></span>
                <slot v-bind="slotScope" />
            </div>
            <slot name="append" />
            <output v-if="hasCounter" v-show="counterActive" :id="counterId" class="u-input-counter" :class="{ 'is-over-limit': limit !== undefined && count > Number(limit) }" :for="control.id()"><slot name="counter" :counter="formattedCount" :max="limit" :value="count">{{ formattedCount }}</slot></output>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
