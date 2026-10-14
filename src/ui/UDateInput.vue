<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs, useSlots, watch } from 'vue';
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import UDatePicker from './UDatePicker.vue';
import UTimePicker from './UTimePicker.vue';
import Icon from '../components/Icon.vue';
import UiMenu from './UiMenu.vue';
import UiControlFrame from './UiControlFrame.vue';
import { isAllowedDate, parseIsoDate, parseTime, selectedDates, type AllowedDates, type DateLike, type DateMode, type DateSelection } from './date-model';
import { cloneEditValue } from './confirm-edit';
import UiButton from './UiButton.vue';
import { createDateInputFormat, type DateDisplayFormat } from './date-input-format';
import {
    cloneAdvancedDateSelection,
    combineCalendarDatesWithTimes,
    createAdvancedDateInputFormat,
    dateSelectionForCalendar,
    dateTimeBoundsForDate,
    dateTimeDraftTimes as getDateTimeDraftTimes,
    formatTimeOfDay,
    isAdvancedDateSelectionAllowed,
    parseAdvancedDate,
    type AdvancedDateInputOptions,
    type DateGranularity,
    type DateTimeDraftTimes
} from './advanced-date-input';
import { useLocale } from './locale-context';
import { vPointerBlur } from './pointer-focus';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';
import type { TimeFormat } from './time-picker';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & {
    mode?: DateMode;
    multiple?: boolean | number | string;
    granularity?: DateGranularity;
    datetime?: boolean;
    min?: DateLike;
    max?: DateLike;
    allowedDates?: AllowedDates;
    locale?: string;
    hideActions?: boolean;
    editable?: boolean;
    openOnFocus?: boolean;
    openOnInput?: boolean;
    updateOn?: readonly ('blur' | 'enter' | 'input')[];
    pickerProps?: Record<string, unknown>;
    timeProps?: Record<string, unknown>;
    menuProps?: Record<string, unknown>;
    inputFormat?: string;
    rangeSeparator?: string;
    displayFormat?: DateDisplayFormat;
    placeholder?: string;
    okText?: string;
    cancelText?: string;
} & { ripple?: RippleOptions }>(), {
    ripple: true,
    mode: 'single',
    multiple: undefined,
    granularity: 'day',
    datetime: false,
    hideActions: undefined,
    editable: false,
    updateOn: () => ['blur', 'enter'],
    label: '日期',
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'UDateInput');
const slots = useSlots();
const pickerSlotNames = computed(() => ['title', 'header', 'day', 'month', 'year', 'controls'].filter(name => slots[name]));
const locale = useLocale();
const emit = defineEmits<{
    'update:focused': [value: boolean];
    save: [value: DateSelection];
    cancel: [];
    'click:clear': [event: MouseEvent];
}>();
const attrs = useAttrs();
function inputAttrs(): Record<string, unknown> {
    const { class: _class, style: _style, ...rest } = attrs;
    return rest;
}
const model = defineModel<DateSelection>({ default: null });
const open = defineModel<boolean>('menu', { default: false });
const mode = computed<DateMode>(() => props.multiple === undefined ? props.mode : props.multiple === 'range' ? 'range' : props.multiple ? 'multiple' : 'single');
const granularity = computed<DateGranularity>(() => props.granularity ?? 'day');
const advancedMode = computed(() => props.datetime || granularity.value !== 'day');
const hideActions = computed(() => props.hideActions ?? !props.datetime);
const dateOptions = computed<AdvancedDateInputOptions>(() => ({
    locale: props.locale ?? locale.current.value,
    inputFormat: props.inputFormat,
    displayFormat: props.displayFormat,
    rangeSeparator: props.rangeSeparator,
    mode: mode.value,
    granularity: granularity.value,
    datetime: props.datetime,
    firstDayOfWeek: props.pickerProps?.firstDayOfWeek as number | string | undefined,
    firstDayOfYear: props.pickerProps?.firstDayOfYear as number | string | undefined,
    isRtl: locale.isRtl.value
}));
const format = computed(() => advancedMode.value
    ? createAdvancedDateInputFormat(dateOptions.value)
    : createDateInputFormat({ locale: dateOptions.value.locale, inputFormat: props.inputFormat, displayFormat: props.displayFormat, mode: mode.value, isRtl: locale.isRtl.value, rangeSeparator: props.rangeSeparator }));
const timeFormat = computed<TimeFormat>(() => {
    const value = props.timeProps?.format;
    return value === '12h' || value === '24h' || value === 'ampm' ? value : '24h';
});
const draft = ref<DateSelection>(null);
const draftTimes = ref<DateTimeDraftTimes>({ start: '00:00:00', end: '00:00:00' });
const useDraft = computed(() => !hideActions.value || !!props.datetime);
const workingSelection = computed(() => useDraft.value && open.value ? draft.value : model.value);
const pickerValue = computed<DateSelection>({
    get: () => dateSelectionForCalendar(workingSelection.value, mode.value, dateOptions.value),
    set: updateCalendarSelection
});
const text = ref('');
const invalid = ref(false);
const element = ref<HTMLInputElement>();
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const display = computed(() => format.value.joinDates(Array.isArray(model.value) ? model.value : model.value ? [model.value] : [], mode.value));
const hasClearableValue = computed(() => Boolean(text.value.trim() || display.value));
const menuBindings = computed(() => ({
    panel: true,
    nativeDismiss: false,
    openOnClick: false,
    openOnFocus: false,
    openOnHover: false,
    openOnArrow: false,
    closeOnContentClick: false,
    location: 'bottom start',
    locationStrategy: 'connected' as const,
    offset: 4,
    target: root.value,
    width: mode.value === 'range' && props.datetime ? 560 : 320,
    ...props.menuProps,
    contentProps: mergeProps(props.menuProps?.contentProps as Record<string, unknown> ?? {}, { class: 'u-date-input-menu' })
}));
function cloneSelection(value: DateSelection): DateSelection {
    return advancedMode.value ? cloneAdvancedDateSelection(value, mode.value, dateOptions.value) : cloneEditValue(value);
}
function resetDraft(): void {
    draft.value = cloneSelection(model.value);
    draftTimes.value = getDateTimeDraftTimes(model.value, mode.value, dateOptions.value);
    invalid.value = false;
}
watch(open, value => { if (value) resetDraft(); }, { immediate: true });
watch(display, value => { text.value = value; invalid.value = false; }, { immediate: true });
function isTimeValueAllowed(value: Date): boolean {
    const bounds = getTimeBounds(value);
    const minimum = timeSeconds(bounds.min);
    const maximum = timeSeconds(bounds.max);
    const selected = timeSeconds(formatTimeOfDay(value));
    if (!bounds.allowed || minimum === null || maximum === null || selected === null || selected < minimum || selected > maximum) return false;
    const settings = props.timeProps ?? {};
    if (!allowedTimePart(value.getHours(), settings.allowedHours)) return false;
    if (!allowedTimePart(value.getMinutes(), settings.allowedMinutes)) return false;
    if (!allowedTimePart(value.getSeconds(), settings.allowedSeconds)) return false;
    const minuteStep = Number(settings.minuteStep ?? 1);
    return Number.isInteger(minuteStep) && minuteStep > 0 && value.getMinutes() % minuteStep === 0;
}
function isSelectionAllowed(value: DateSelection): boolean {
    if (advancedMode.value) {
        const allowed = isAdvancedDateSelectionAllowed(value, {
            ...dateOptions.value,
            mode: mode.value,
            min: props.min,
            max: props.max,
            allowedDates: props.allowedDates
        });
        if (!allowed || !props.datetime) return allowed;
        const values = Array.isArray(value) ? value : value == null ? [] : [value];
        if (mode.value === 'range' && values.length === 1) return false;
        return values.every(entry => {
            const date = parseAdvancedDate(entry, dateOptions.value);
            return !!date && isTimeValueAllowed(date);
        });
    }
    return selectedDates(value, mode.value).every(date => isAllowedDate(date, props.min, props.max, props.allowedDates));
}
const validationProps = new Proxy(props, { get(target, key, receiver) {
    if (key === 'errorMessages' && invalid.value) return ['Enter a valid date and time within the allowed range.'];
    if (key === 'rules') return [(value: DateSelection) => isSelectionAllowed(value) || 'Date outside the allowed range.', ...(props.rules ?? [])];
    return Reflect.get(target, key, receiver);
} });
const control = useFormControl(validationProps, model, element, attrs);
function mergedInputAttrs(controlAttrs: Record<string, unknown> = {}): Record<string, unknown> {
    return mergeControlAttrs(inputAttrs(), controlAttrs, control.id());
}
function timeSeconds(value: string): number | null {
    const parsed = parseTime(value, '24h');
    return parsed ? parsed.hour * 3600 + parsed.minute * 60 + parsed.second : null;
}
function allowedTimePart(value: number, allowed: unknown): boolean {
    if (Array.isArray(allowed)) return allowed.includes(value);
    return typeof allowed === 'function' ? (allowed as (value: number) => boolean)(value) : true;
}
function getTimeBounds(value: Date | undefined): { min: string; max: string; allowed: boolean } {
    if (!value) return { min: '00:00:00', max: '23:59:59', allowed: false };
    const bounds = dateTimeBoundsForDate(value, props.min, props.max, dateOptions.value);
    const customMin = typeof props.timeProps?.min === 'string' ? timeSeconds(props.timeProps.min) : null;
    const customMax = typeof props.timeProps?.max === 'string' ? timeSeconds(props.timeProps.max) : null;
    if ((props.timeProps?.min !== undefined && customMin === null) || (props.timeProps?.max !== undefined && customMax === null)) {
        return { ...bounds, allowed: false };
    }
    const minimum = Math.max(timeSeconds(bounds.min) ?? 0, customMin ?? 0);
    const maximum = Math.min(timeSeconds(bounds.max) ?? 86399, customMax ?? 86399);
    return {
        min: formatTimeSeconds(minimum),
        max: formatTimeSeconds(maximum),
        allowed: bounds.allowed && minimum <= maximum
    };
}
function formatTimeSeconds(value: number): string {
    return `${String(Math.floor(value / 3600)).padStart(2, '0')}:${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
function selectedCalendarDates(): Date[] {
    const calendarValue = dateSelectionForCalendar(workingSelection.value, mode.value, dateOptions.value);
    const values = Array.isArray(calendarValue) ? calendarValue : calendarValue ? [calendarValue] : [];
    return values.flatMap(value => {
        const date = parseAdvancedDate(value, dateOptions.value);
        return date ? [date] : [];
    });
}
const timeBounds = computed(() => {
    const dates = selectedCalendarDates();
    return {
        start: getTimeBounds(dates[0]),
        end: getTimeBounds(dates[1] ?? dates[0])
    };
});
function writeWorkingSelection(value: DateSelection): void {
    if (useDraft.value) {
        draft.value = cloneSelection(value);
        invalid.value = false;
        if (props.datetime && hideActions.value && open.value && isSelectionAllowed(value)) model.value = cloneSelection(value);
    } else {
        model.value = cloneSelection(value);
        invalid.value = false;
    }
}
function updateCalendarSelection(value: DateSelection): void {
    const selection = props.datetime
        ? combineCalendarDatesWithTimes(value, draftTimes.value, mode.value, dateOptions.value)
        : cloneSelection(value);
    writeWorkingSelection(selection);
}
function updateTime(value: string | Date | null, index: 0 | 1): void {
    if (control.disabled.value || control.readonly.value) return;
    const time = value instanceof Date ? formatTimeOfDay(value) : value ?? '';
    if (timeSeconds(time) === null) { invalid.value = true; return; }
    draftTimes.value = { ...draftTimes.value, [index === 0 ? 'start' : 'end']: time };
    const dates = dateSelectionForCalendar(draft.value, mode.value, dateOptions.value);
    const values = Array.isArray(dates) ? dates : dates ? [dates] : [];
    if (!values.length) return;
    const selection = combineCalendarDatesWithTimes(dates, draftTimes.value, mode.value, dateOptions.value);
    writeWorkingSelection(selection);
}
function save(): void {
    if (control.disabled.value || control.readonly.value) return;
    const candidate = props.datetime
        ? combineCalendarDatesWithTimes(dateSelectionForCalendar(draft.value, mode.value, dateOptions.value), draftTimes.value, mode.value, dateOptions.value)
        : cloneSelection(draft.value);
    if (!isSelectionAllowed(candidate)) { invalid.value = true; return; }
    if (!hideActions.value || props.datetime) model.value = cloneSelection(candidate);
    emit('save', model.value);
    open.value = false;
}
function cancel(): void {
    draft.value = cloneSelection(model.value);
    draftTimes.value = getDateTimeDraftTimes(model.value, mode.value, dateOptions.value);
    invalid.value = false;
    open.value = false;
    emit('cancel');
}
function closeMenu(): void {
    if (!open.value) return;
    if (hideActions.value) open.value = false;
    else cancel();
}
function showMenu(): void {
    if (!control.disabled.value && !control.readonly.value) open.value = true;
}
function pick(): void {
    if (!props.datetime && hideActions.value && mode.value === 'single') save();
}
function clear(event: MouseEvent): void {
    if (!props.clearable || control.disabled.value || control.readonly.value) return;
    const empty: DateSelection = mode.value === 'single' ? null : [];
    model.value = empty;
    draft.value = cloneSelection(empty);
    draftTimes.value = { start: '00:00:00', end: '00:00:00' };
    text.value = '';
    invalid.value = false;
    open.value = false;
    emit('click:clear', event);
}
watch([control.disabled, control.readonly], ([disabled, readonly]) => { if (disabled || readonly) open.value = false; });
defineExpose({ element, commit, save, cancel, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
function commit(): void {
    if (!props.editable || control.disabled.value || control.readonly.value) return;
    if (!text.value.trim()) {
        model.value = mode.value === 'single' ? null : [];
        invalid.value = false;
        return;
    }
    const parsed = format.value.parseInput(text.value, mode.value);
    if (!parsed.valid || !isSelectionAllowed(parsed.value)) { invalid.value = true; return; }
    model.value = cloneSelection(parsed.value);
    invalid.value = false;
}
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value || open" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <div ref="root" class="u-date-input" :class="{ 'is-picker-only': !props.editable }">
                <div class="ui-input" :class="control.classes.value" :style="control.styles.value">
                    <slot name="prepend-inner" />
                    <input ref="element" v-model="text" v-bind="mergedInputAttrs(controlAttrs)" :name="props.name" type="text" :disabled="control.disabled.value" :readonly="control.readonly.value || !props.editable" :aria-invalid="invalid || control.state.value === false || undefined" :placeholder="props.placeholder ?? locale.t(props.datetime ? 'date.selectDateTime' : mode === 'range' ? 'date.selectRange' : 'date.selectDate')"
                        @focus="control.focus(); props.openOnFocus && showMenu()" @click="!props.editable && showMenu()" @input="props.openOnInput && showMenu(); props.updateOn.includes('input') && commit()" @blur="props.updateOn.includes('blur') && commit(); control.blur()" @keydown.enter.prevent="props.editable ? props.updateOn.includes('enter') && commit() : showMenu()" @keydown.down.prevent="showMenu" @keydown.esc="closeMenu" />
                    <slot name="append-inner" />
                    <button v-if="props.clearable && hasClearableValue && !control.disabled.value && !control.readonly.value" v-ripple="props.ripple" v-pointer-blur type="button" class="ui-control-clear" aria-label="清空日期" @click.stop="clear"><Icon name="$close" :size="16" /></button>
                    <button ref="trigger" v-ripple="props.ripple" v-pointer-blur type="button" class="ui-control-clear" :disabled="control.disabled.value || control.readonly.value" :aria-expanded="open" aria-label="打开日历" @click="open ? closeMenu() : showMenu()"><Icon name="mdi-calendar-month-outline" :size="18" /></button>
                </div>
                <UiMenu v-bind="menuBindings" :activator="trigger" :model-value="open" @update:model-value="$event ? showMenu() : closeMenu()">
                    <UDatePicker v-model="pickerValue" :ripple="props.ripple" :mode="mode" :multiple="props.multiple" :granularity="granularity" :min="props.min" :max="props.max" :allowed-dates="props.allowedDates" :locale="props.locale" :disabled="control.disabled.value" :readonly="control.readonly.value" show-adjacent-months hide-header v-bind="props.pickerProps" @update:model-value="pick">
                        <template v-for="name in pickerSlotNames" #[name]="scope"><slot v-if="$slots[name]" :name="name" v-bind="scope" /></template>
                    </UDatePicker>
                    <div v-if="props.datetime" class="u-date-input-time-fields">
                        <UTimePicker v-bind="props.timeProps" :model-value="draftTimes.start" :format="timeFormat" :min="timeBounds.start.min" :max="timeBounds.start.max" variant="select" hide-header hide-input :use-seconds="true" :disabled="control.disabled.value || control.readonly.value || !timeBounds.start.allowed" :label="mode === 'range' ? '开始时间' : '时间'" hide-details @update:model-value="updateTime($event, 0)" />
                        <UTimePicker v-if="mode === 'range'" v-bind="props.timeProps" :model-value="draftTimes.end" :format="timeFormat" :min="timeBounds.end.min" :max="timeBounds.end.max" variant="select" hide-header hide-input :use-seconds="true" :disabled="control.disabled.value || control.readonly.value || !timeBounds.end.allowed" label="结束时间" hide-details @update:model-value="updateTime($event, 1)" />
                    </div>
                    <slot v-if="!hideActions" name="actions" :save="save" :cancel="cancel"><div class="u-confirm-actions"><UiButton variant="text" @click="cancel">{{ props.cancelText ?? '取消' }}</UiButton><UiButton :disabled="invalid" @click="save">{{ props.okText ?? '确定' }}</UiButton></div></slot>
                </UiMenu>
            </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>