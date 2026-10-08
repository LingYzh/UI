<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue';
import { useDefaults } from './defaults';
import UiControlFrame from './UiControlFrame.vue';
import UiButton from './UiButton.vue';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';
import { formatTimeDisplay, formatTimeValue, getTimePickerItems, isTimeValueAllowed, moveTimeValue, nextTimeViewMode, parseTimeInput, setTimePeriod, stepTimeValue, type AllowedTimeValues, type TimeFormat, type TimePickerParts, type TimeViewMode } from './time-picker';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<Omit<FormControlProps, 'variant'> & {
    format?: TimeFormat; min?: string; max?: string; minuteStep?: number;
    allowedHours?: AllowedTimeValues; allowedMinutes?: AllowedTimeValues; allowedSeconds?: AllowedTimeValues;
    useSeconds?: boolean; scrollable?: boolean; variant?: 'select' | 'dial' | 'input';
    hideHeader?: boolean; title?: string; ampmInTitle?: boolean;
}>(), { label: '时间', format: '24h', minuteStep: 1, variant: 'dial', dense: undefined, ghost: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UTimePicker');
const emit = defineEmits<{
    'update:hour': [value: number]; 'update:minute': [value: number]; 'update:second': [value: number]; 'update:focused': [value: boolean];
}>();
const model = defineModel<string | Date | null>({ default: '00:00' });
const viewMode = defineModel<TimeViewMode>('viewMode', { default: 'hour' });
const period = defineModel<'am' | 'pm'>('period', { default: 'am' });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const options = computed(() => ({ ...props, period: period.value }));
const parts = ref<TimePickerParts>(parseTimeInput(model.value, options.value).parts);
const twelveHour = computed(() => props.format === '12h' || props.format === 'ampm');
const text = ref('');
const invalidText = ref(false);
const fields = computed<TimeViewMode[]>(() => ['hour', 'minute', ...(props.useSeconds ? ['second' as const] : [])]);
const valid = computed(() => {
    if (invalidText.value) return false;
    if (model.value == null || model.value === '') return true;
    const parsed = parseTimeInput(model.value, options.value);
    return parsed.valid && parsed.complete && fields.value.every(mode => isTimeValueAllowed(mode, parsed.parts[mode]!, parsed.parts, options.value));
});
const validationProps = new Proxy(props, { get(target, key, receiver) {
    if (key === 'variant') return undefined;
    if (key === 'rules') return [() => valid.value || '时间无效或超出范围。', ...(props.rules ?? [])];
    return Reflect.get(target, key, receiver);
} }) as unknown as FormControlProps;
const control = useFormControl(validationProps, model, element, attrs);
const blocked = computed(() => control.disabled.value || control.readonly.value);
function items(mode: TimeViewMode) {
    return getTimePickerItems(mode, parts.value, options.value).filter(item => mode !== 'minute' || item.value % Math.max(1, Math.min(60, props.minuteStep)) === 0);
}
const dialItems = computed(() => items(viewMode.value));
function syncText() { text.value = formatTimeDisplay(parts.value, options.value)?.text ?? ''; invalidText.value = false; }
watch([() => model.value, () => props.useSeconds, () => props.format], () => {
    parts.value = parseTimeInput(model.value, options.value).parts;
    period.value = parts.value.period;
    if (!props.useSeconds && viewMode.value === 'second') viewMode.value = 'minute';
    syncText();
}, { immediate: true });
function commitParts(next: TimePickerParts) {
    if (blocked.value) return;
    parts.value = next;
    period.value = next.period;
    const value = formatTimeValue(next, options.value);
    if (value !== null) control.editable.value = value;
    syncText();
}
watch(period, value => {
    const next = setTimePeriod(parts.value, value);
    if (next.hour !== null && isTimeValueAllowed('hour', next.hour, next, options.value)) commitParts(next);
});
function select(mode: TimeViewMode, value: number, advance = false) {
    const next = moveTimeValue(parts.value, mode, value, options.value);
    if (!next || blocked.value) return;
    commitParts(next);
    if (mode === 'hour') emit('update:hour', value);
    else if (mode === 'minute') emit('update:minute', value);
    else emit('update:second', value);
    if (advance) viewMode.value = nextTimeViewMode(mode, props.useSeconds) ?? mode;
}
function commitText() {
    if (blocked.value) return;
    if (!text.value.trim()) { control.editable.value = null; parts.value = parseTimeInput(null).parts; invalidText.value = false; return; }
    const parsed = parseTimeInput(text.value, { ...options.value, inputMode: 'display' });
    if (parsed.valid && parsed.complete && fields.value.every(mode => isTimeValueAllowed(mode, parsed.parts[mode]!, parsed.parts, options.value))) commitParts(parsed.parts);
    else { invalidText.value = true; void control.validate(); }
}
function inputAttrs(controlAttrs: Record<string, unknown>) {
    const { class: _class, style: _style, ...rest } = attrs;
    return mergeControlAttrs(rest, controlAttrs, control.id());
}
function selectedValue(mode: TimeViewMode) {
    const value = parts.value[mode];
    return value == null ? '' : mode === 'hour' && twelveHour.value ? (value % 12 || 12) : value;
}
function step(direction: -1 | 1) {
    if (!blocked.value) commitParts(stepTimeValue(parts.value, viewMode.value, direction, options.value));
}
function onWheel(event: WheelEvent) { if (props.scrollable && !blocked.value) { event.preventDefault(); step(event.deltaY > 0 ? 1 : -1); } }
function dialStyle(index: number, count: number) {
    const hour24 = viewMode.value === 'hour' && !twelveHour.value;
    const angle = index / (hour24 ? 12 : count) * Math.PI * 2 - Math.PI / 2;
    const radius = hour24 && index >= 12 ? 27 : 41;
    return { left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%` };
}
function periodDisabled(value: 'am' | 'pm') {
    const next = setTimePeriod(parts.value, value);
    return blocked.value || (next.hour !== null && !isTimeValueAllowed('hour', next.hour, next, options.value));
}
watch([element, valid, control.disabled], () => { element.value?.setCustomValidity(control.disabled.value || valid.value ? '' : '时间无效或超出范围。'); }, { flush: 'post' });
defineExpose({ element, focus: () => element.value?.focus(), select, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-bind="props" variant="outlined" :framed="true" :for="control.id()" :focused="control.focused.value" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
        <div class="u-time-picker" :data-view-mode="viewMode">
            <header v-if="!props.hideHeader" class="u-time-picker-header">
                <slot name="title">{{ props.title }}</slot>
                <slot name="header" :hour="parts.hour" :minute="parts.minute" :second="parts.second" :period="period" :view-mode="viewMode">
                    <div class="u-time-picker-heading"><UiButton v-for="field in fields" :key="field" variant="text" :aria-pressed="viewMode === field" :disabled="blocked" @click="viewMode = field">{{ selectedValue(field) === '' ? '--' : String(selectedValue(field)).padStart(2, '0') }}</UiButton><span v-if="twelveHour && props.ampmInTitle">{{ period.toUpperCase() }}</span></div>
                </slot>
            </header>
            <div class="ui-input" :class="control.classes.value" :style="control.styles.value"><input ref="element" v-model="text" v-bind="inputAttrs(controlAttrs)" type="text" :name="props.name" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="!valid || undefined" :placeholder="twelveHour ? 'hh:mm AM' : props.useSeconds ? 'HH:mm:ss' : 'HH:mm'" @focus="control.focus" @blur="commitText(); control.blur()" @keydown.enter.prevent="commitText" /></div>
            <slot :hour="parts.hour" :minute="parts.minute" :second="parts.second" :period="period" :view-mode="viewMode" :select="select">
                <div v-if="props.variant === 'dial'" class="u-time-picker-dial" :data-mode="viewMode" role="group" :aria-label="viewMode" @wheel="onWheel" @keydown.up.prevent="step(1)" @keydown.down.prevent="step(-1)">
                    <button v-for="(item, index) in dialItems" :key="item.value" type="button" :class="{ 'is-tick': viewMode !== 'hour' && item.value % 5 !== 0 }" :aria-label="item.label" :style="dialStyle(index, dialItems.length)" :disabled="blocked || item.disabled" :aria-pressed="selectedValue(viewMode) === item.value" @click="select(viewMode, item.value, true)">{{ viewMode === 'hour' || item.value % 5 === 0 ? item.label : '·' }}</button>
                </div>
                <div v-else-if="props.variant !== 'input'" class="u-time-picker-controls">
                    <template v-for="(field, index) in fields" :key="field"><span v-if="index">:</span><select class="ui-select" :value="selectedValue(field)" :disabled="blocked" :aria-label="field" @focus="control.focus(); viewMode = field" @blur="control.blur" @change="select(field, Number(($event.target as HTMLSelectElement).value))"><option v-if="selectedValue(field) === ''" value="" disabled>--</option><option v-for="item in items(field)" :key="item.value" :value="item.value" :disabled="item.disabled">{{ item.label }}</option></select></template>
                </div>
                <div v-if="twelveHour" class="u-time-picker-period"><UiButton v-for="value in (['am', 'pm'] as const)" :key="value" variant="text" :disabled="periodDisabled(value)" :aria-pressed="period === value" @click="period = value">{{ value.toUpperCase() }}</UiButton></div>
            </slot>
            <slot name="actions" />
        </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details="scope"><slot name="details" v-bind="scope" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
