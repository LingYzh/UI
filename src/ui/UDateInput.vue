<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import { computed, ref, useAttrs, watch } from 'vue';
import UDatePicker from './UDatePicker.vue';
import Icon from '../components/Icon.vue';
import UTransition from './UTransition.vue';
import UiControlFrame from './UiControlFrame.vue';
import { isAllowedDate, parseIsoDate, selectedDates, type AllowedDates, type DateMode, type DateSelection } from './date-model';
import { vPointerBlur } from './pointer-focus';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { mode?: DateMode; min?: string; max?: string; allowedDates?: AllowedDates; locale?: string } & { ripple?: RippleOptions }>(), { ripple: true, mode: 'single', label: '日期', dense: undefined, ghost: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UDateInput');
const attrs = useAttrs();
function inputAttrs(): Record<string, unknown> { const { class: _class, style: _style, ...rest } = attrs; return rest; }
const model = defineModel<DateSelection>({ default: null });
const open = ref(false);
const text = ref('');
const invalid = ref(false);
const element = ref<HTMLInputElement>();
const validationProps = new Proxy(props, { get(target, key, receiver) {
    if (key === 'errorMessages' && invalid.value) return ['Enter a valid date within the allowed range.'];
    if (key === 'rules') return [(value: DateSelection) => selectedDates(value, props.mode).every((date) => isAllowedDate(date, props.min, props.max, props.allowedDates)) || 'Date outside the allowed range.', ...(props.rules ?? [])];
    return Reflect.get(target, key, receiver);
} });
const control = useFormControl(validationProps, model, element, attrs);
function mergedInputAttrs(controlAttrs: Record<string, unknown> = {}): Record<string, unknown> { return mergeControlAttrs(inputAttrs(), controlAttrs, control.id()); }
defineExpose({ element, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
const display = computed(() => Array.isArray(model.value) ? model.value.join(props.mode === 'range' ? ' – ' : ', ') : model.value ?? '');
watch(display, (value) => { text.value = value; invalid.value = false; }, { immediate: true });
function commit(): void {
    if (control.disabled.value || control.readonly.value) return;
    if (!text.value.trim()) { model.value = props.mode === 'single' ? null : []; invalid.value = false; return; }
    const dates = text.value.split(/\s*(?:,|–)\s*/).filter(Boolean);
    if (!dates.every((date) => parseIsoDate(date) && isAllowedDate(date, props.min, props.max, props.allowedDates)) || (props.mode === 'single' && dates.length !== 1) || (props.mode === 'range' && dates.length > 2)) { invalid.value = true; return; }
    model.value = props.mode === 'single' ? dates[0] : props.mode === 'range' ? dates.sort() : [...new Set(dates)].sort();
    invalid.value = false;
}
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="u-date-input">
            <div class="ui-input" :class="control.classes.value" :style="control.styles.value"><input ref="element" v-model="text" v-bind="mergedInputAttrs(controlAttrs)" type="text" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalid || control.state.value === false || undefined" placeholder="YYYY-MM-DD" @blur="commit(); control.blur()" @keydown.enter.prevent="commit" @keydown.esc="open = false" /><button v-ripple="props.ripple" v-pointer-blur type="button" class="ui-control-clear" :disabled="control.disabled.value || control.readonly.value" :aria-expanded="open" aria-label="打开日历" @click="open = !open"><Icon name="mdi-calendar-month-outline" :size="18" /></button></div>
            <UTransition variant="slide-y"><UDatePicker v-if="open" v-model="model" :ripple="props.ripple" :mode="props.mode" :min="props.min" :max="props.max" :allowed-dates="props.allowedDates" :locale="props.locale" :disabled="control.disabled.value" :readonly="control.readonly.value" @update:model-value="props.mode === 'single' && (open = false)" /></UTransition>
        </div>
    </UiControlFrame>
</template>
