<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import Icon from '../components/Icon.vue';
import { useDefaults } from './defaults';
import { computed, nextTick, ref, watch } from 'vue';
import { addDays, addMonths, isAllowedDate, isoDate, monthDays, parseIsoDate, selectedDates, selectDate, type AllowedDates, type DateLike, type DateMode, type DateSelection } from './date-model';
import { useLocale } from './locale-context';
import { getCalendarFirstDayOfWeek, getCalendarWeekNumber } from './calendar';
import { vPointerBlur } from './pointer-focus';

const rawProps = withDefaults(defineProps<{
    mode?: DateMode;
    min?: DateLike;
    max?: DateLike;
    allowedDates?: AllowedDates;
    locale?: string;
    firstDayOfWeek?: number | string;
    firstDayOfYear?: number | string;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
    multiple?: boolean | number | string;
    hideHeader?: boolean;
    hideWeekdays?: boolean;
    showAdjacentMonths?: boolean;
    weekdays?: readonly number[];
    title?: string;
    header?: string;
    noAutoNavigation?: boolean;
    noMonthPicker?: boolean;
    allowedMonths?: readonly number[] | ((month: number) => boolean);
    allowedYears?: readonly number[] | ((year: number) => boolean);
    weeksInMonth?: 'static' | 'dynamic';
    showWeek?: boolean;
    events?: readonly string[] | ((date: string) => boolean | string | readonly string[]) | Record<string, boolean | string | readonly string[]>;
    eventColor?: string | readonly string[] | ((date: string) => string | readonly string[]) | Record<string, string | readonly string[]>;
} & { ripple?: RippleOptions }>(), { ripple: true, mode: 'single', multiple: undefined, locale: undefined, label: 'Choose date', showAdjacentMonths: false, weeksInMonth: 'static' });
const props = useDefaults(rawProps, 'UDatePicker');
const model = defineModel<DateSelection>({ default: null });
const monthModel = defineModel<number>('month');
const yearModel = defineModel<number>('year');
const viewMode = defineModel<'month' | 'months' | 'year'>('viewMode', { default: 'month' });
const previewValue = defineModel<DateLike | null>('previewValue', { default: null });
const emit = defineEmits<{ 'boundary-navigate': [value: { date: Date; direction: number }] }>();
const root = ref<HTMLElement>();
const locale = useLocale();
const language = computed(() => props.locale ?? locale.current.value);
const firstDayOfWeek = computed(() => props.firstDayOfWeek === undefined ? getCalendarFirstDayOfWeek(language.value) : Math.max(0, Math.min(6, Number.parseInt(String(props.firstDayOfWeek), 10) || 0)));
const today = isoDate(new Date());
const initialDate = selectedDates(model.value, 'multiple')[0] ?? today;
const localMonth = ref(initialDate);
const focused = ref(initialDate);
const month = computed(() => {
    const date = parseIsoDate(localMonth.value)!;
    date.setDate(1);
    if (yearModel.value !== undefined) date.setFullYear(yearModel.value);
    if (monthModel.value !== undefined) date.setMonth(monthModel.value);
    return isoDate(date);
});
const mode = computed<DateMode>(() => props.multiple === undefined ? props.mode : props.multiple === 'range' ? 'range' : props.multiple ? 'multiple' : 'single');
const monthLabel = computed(() => new Intl.DateTimeFormat(language.value, { year: 'numeric', month: 'long' }).format(parseIsoDate(month.value)!));
const weekdayNumbers = computed(() => Array.from({ length: 7 }, (_, index) => (index + firstDayOfWeek.value) % 7).filter(day => !props.weekdays || props.weekdays.includes(day)));
const weekdays = computed(() => weekdayNumbers.value.map(day => new Intl.DateTimeFormat(language.value, { weekday: 'short' }).format(new Date(2023, 0, 1 + day))));
const days = computed(() => monthDays(month.value, firstDayOfWeek.value, props.weeksInMonth).filter(day => weekdayNumbers.value.includes(parseIsoDate(day.date)!.getDay())));
watch(month, () => {
    if (!days.value.some(day => day.date === focused.value && day.current && !dayDisabled(day.date))) focused.value = days.value.find(day => day.current && !dayDisabled(day.date))?.date ?? month.value;
});
const selection = computed(() => new Set(selectedDates(model.value, mode.value)));
const months = computed(() => Array.from({ length: 12 }, (_, index) => ({ value: index, text: new Intl.DateTimeFormat(language.value, { month: 'short' }).format(new Date(2024, index, 1)) })));
const currentYear = computed(() => parseIsoDate(month.value)!.getFullYear());
const years = computed(() => {
    const min = parseIsoDate(props.min)?.getFullYear() ?? new Date().getFullYear() - 100;
    const max = parseIsoDate(props.max)?.getFullYear() ?? new Date().getFullYear() + 52;
    return Array.from({ length: Math.max(0, Math.min(1000, max - min + 1)) }, (_, index) => min + index);
});
function displayMonth(date: string) {
    const value = parseIsoDate(date);
    if (!value) return;
    localMonth.value = date;
    monthModel.value = value.getMonth();
    yearModel.value = value.getFullYear();
}
watch(model, value => { const date = selectedDates(value, 'multiple').at(-1); if (date && !props.noAutoNavigation) displayMonth(date); });
function dayDisabled(date: string) {
    const maximum = typeof props.multiple === 'number' || (typeof props.multiple === 'string' && props.multiple !== 'range') ? Number(props.multiple) : Infinity;
    return !!props.disabled || !isAllowedDate(date, props.min, props.max, props.allowedDates) || (mode.value === 'multiple' && selection.value.size >= maximum && !selection.value.has(date));
}
function choose(value: string): void {
    if (props.readonly || dayDisabled(value)) return;
    const next = selectDate(model.value, value, mode.value);
    if (!selectedDates(next, mode.value).every(date => isAllowedDate(date, props.min, props.max, props.allowedDates))) return;
    model.value = next;
    focused.value = value;
    previewValue.value = null;
    if (!props.noAutoNavigation) displayMonth(value);
}
function canMove(count: number) {
    if (props.disabled) return false;
    const date = parseIsoDate(addMonths(month.value, viewMode.value === 'month' ? count : 12 * count))!;
    const start = new Date(date);
    const end = new Date(date);
    if (viewMode.value !== 'month') { start.setMonth(0, 1); end.setMonth(11, 31); }
    else end.setMonth(end.getMonth() + 1, 0);
    const lower = parseIsoDate(props.min);
    const upper = parseIsoDate(props.max);
    return (!lower || end >= lower) && (!upper || start <= upper);
}
function moveMonth(count: number): void { if (canMove(count)) displayMonth(addMonths(month.value, viewMode.value === 'month' ? count : 12 * count)); }
function monthAllowed(value: number) {
    const date = new Date(currentYear.value, value, 1);
    const lower = parseIsoDate(props.min);
    const upper = parseIsoDate(props.max);
    return !props.disabled && (!lower || date >= new Date(lower.getFullYear(), lower.getMonth(), 1)) && (!upper || date <= upper) && (Array.isArray(props.allowedMonths) ? props.allowedMonths.includes(value) : typeof props.allowedMonths !== 'function' || props.allowedMonths(value));
}
function yearAllowed(value: number) { const lower = parseIsoDate(props.min); const upper = parseIsoDate(props.max); return !props.disabled && (!lower || value >= lower.getFullYear()) && (!upper || value <= upper.getFullYear()) && (Array.isArray(props.allowedYears) ? props.allowedYears.includes(value) : typeof props.allowedYears !== 'function' || props.allowedYears(value)); }
function chooseMonth(value: number) { if (!monthAllowed(value)) return; displayMonth(isoDate(new Date(currentYear.value, value, 1))); viewMode.value = 'month'; }
function chooseYear(value: number) { if (!yearAllowed(value)) return; displayMonth(isoDate(new Date(value, parseIsoDate(month.value)!.getMonth(), 1))); viewMode.value = props.noMonthPicker ? 'month' : 'months'; }
async function focusDate(value: DateLike) { const date = parseIsoDate(value); if (!date) return; focused.value = isoDate(date); displayMonth(focused.value); viewMode.value = 'month'; await nextTick(); root.value?.querySelector<HTMLElement>(`[data-date="${focused.value}"]`)?.focus(); }
function onKeydown(event: KeyboardEvent, value: string): void {
    const delta = event.key === 'ArrowLeft' ? (locale.isRtl.value ? 1 : -1) : event.key === 'ArrowRight' ? (locale.isRtl.value ? -1 : 1) : event.key === 'ArrowUp' ? -7 : event.key === 'ArrowDown' ? 7 : 0;
    if (delta || event.key === 'PageUp' || event.key === 'PageDown' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        let next = delta ? addDays(value, delta) : event.key === 'PageUp' || event.key === 'PageDown' ? addMonths(value, (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)) : addDays(value, (event.key === 'Home' ? 0 : 6) - (parseIsoDate(value)!.getDay() - firstDayOfWeek.value + 7) % 7);
        for (let attempts = 0; attempts < 366 && (dayDisabled(next) || !weekdayNumbers.value.includes(parseIsoDate(next)!.getDay())); attempts++) next = addDays(next, delta < 0 || event.key === 'PageUp' ? -1 : 1);
        if (dayDisabled(next) || !weekdayNumbers.value.includes(parseIsoDate(next)!.getDay())) return;
        if (next.slice(0, 7) !== month.value.slice(0, 7)) emit('boundary-navigate', { date: parseIsoDate(next)!, direction: next > value ? 1 : -1 });
        void focusDate(next);
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose(value);
    }
}
const previewDates = computed(() => {
    const values = selectedDates(model.value, 'multiple');
    const preview = parseIsoDate(previewValue.value);
    return mode.value === 'range' && values.length === 1 && preview ? new Set(selectedDates([values[0], isoDate(preview)], 'range')) : new Set<string>();
});
function eventColors(date: string): readonly string[] {
    const setting = props.events;
    const data = Array.isArray(setting) ? setting.includes(date) : typeof setting === 'function' ? setting(date) : setting ? (setting as Record<string, boolean | string | readonly string[]>)[date] : false;
    if (!data) return [];
    const color = typeof data === 'string' || Array.isArray(data) ? data : typeof props.eventColor === 'function' ? props.eventColor(date) : typeof props.eventColor === 'string' || Array.isArray(props.eventColor) ? props.eventColor : (props.eventColor as Record<string, string | readonly string[]> | undefined)?.[date];
    return (Array.isArray(color) ? color : [color ?? 'var(--accent)']).filter((value): value is string => typeof value === 'string');
}
function weekNumber(value: string) {
    return getCalendarWeekNumber(value, language.value, firstDayOfWeek.value, props.firstDayOfYear);
}
defineExpose({ focusDate, choose, moveMonth });
</script>

<template>
    <div ref="root" class="u-date-picker" :aria-label="props.label">
        <slot name="title"><strong v-if="props.title">{{ props.title }}</strong></slot>
        <div v-if="!props.hideHeader" class="u-date-picker-selection"><slot name="prepend" /><slot name="header" :header="selectedDates(model, 'multiple').join(', ') || props.header" :color="undefined">{{ selectedDates(model, 'multiple').join(', ') || props.header }}</slot><slot name="append" /></div>
        <div class="u-date-picker-header"><slot name="controls" :next="() => moveMonth(1)" :prev="() => moveMonth(-1)" :month="parseIsoDate(month)!.getMonth()" :year="currentYear" :view-mode="viewMode"><button v-ripple="props.readonly ? false : props.ripple" v-pointer-blur type="button" :disabled="!canMove(-1)" aria-label="Previous month" @click="moveMonth(-1)"><Icon name="mdi-chevron-left" :size="18" /></button><button type="button" :disabled="props.disabled" aria-live="polite" @click="viewMode = props.noMonthPicker ? 'year' : viewMode === 'months' ? 'year' : 'months'">{{ monthLabel }}</button><button v-ripple="props.readonly ? false : props.ripple" v-pointer-blur type="button" :disabled="!canMove(1)" aria-label="Next month" @click="moveMonth(1)"><Icon name="mdi-chevron-right" :size="18" /></button></slot></div>
        <div v-if="viewMode === 'months'" class="u-date-picker-options" role="grid" @keydown.esc="viewMode = 'month'">
            <template v-for="(item, i) in months" :key="item.value"><slot name="month" :month="item.value" :i="i" :props="{ onClick: () => chooseMonth(item.value), disabled: !monthAllowed(item.value), text: item.text }"><button type="button" :disabled="!monthAllowed(item.value)" @click="chooseMonth(item.value)">{{ item.text }}</button></slot></template>
        </div>
        <div v-else-if="viewMode === 'year'" class="u-date-picker-options is-years" role="grid" @keydown.esc="viewMode = 'month'">
            <template v-for="(year, i) in years" :key="year"><slot name="year" :year="year" :i="i" :props="{ onClick: () => chooseYear(year), disabled: !yearAllowed(year), text: String(year) }"><button type="button" :disabled="!yearAllowed(year)" @click="chooseYear(year)">{{ year }}</button></slot></template>
        </div>
        <div v-else class="u-date-picker-grid" role="grid" :aria-label="monthLabel" :style="{ gridTemplateColumns: `${props.showWeek ? '28px ' : ''}repeat(${Math.max(1, weekdayNumbers.length)}, minmax(0, 1fr))` }" @mouseleave="previewValue = null">
            <template v-if="!props.hideWeekdays"><span v-if="props.showWeek" class="u-date-weekday" role="columnheader">#</span><span v-for="(day, index) in weekdays" :key="index" class="u-date-weekday" role="columnheader">{{ day }}</span></template>
            <template v-for="(day, i) in days" :key="day.date">
                <span v-if="props.showWeek && i % weekdayNumbers.length === 0" class="u-date-weekday u-date-week-number">{{ weekNumber(day.date) }}</span>
                <span v-if="!day.current && !props.showAdjacentMonths" />
                <slot v-else name="day" :item="{ date: parseIsoDate(day.date)!, isoDate: day.date, isAdjacent: !day.current, isSelected: selection.has(day.date), isToday: day.date === today, isDisabled: dayDisabled(day.date), isPreview: previewDates.has(day.date) }" :i="i" :props="{ onClick: () => choose(day.date), onKeydown: (event: KeyboardEvent) => onKeydown(event, day.date), onMouseenter: () => { if (mode === 'range') previewValue = parseIsoDate(day.date); }, disabled: dayDisabled(day.date), text: String(Number(day.date.slice(-2))), tabindex: focused === day.date ? 0 : -1, 'data-date': day.date, 'aria-selected': selection.has(day.date) }">
                    <button v-ripple="props.readonly ? false : props.ripple" v-pointer-blur type="button" role="gridcell" :data-date="day.date" :class="{ 'is-outside': !day.current, 'is-selected': selection.has(day.date), 'is-today': day.date === today, 'is-preview': previewDates.has(day.date) }" :disabled="dayDisabled(day.date)" :aria-selected="selection.has(day.date)" :aria-label="new Intl.DateTimeFormat(language, { dateStyle: 'full' }).format(parseIsoDate(day.date)!)" :tabindex="focused === day.date ? 0 : -1" @click="choose(day.date)" @keydown="onKeydown($event, day.date)" @mouseenter="mode === 'range' && (previewValue = parseIsoDate(day.date))"><span>{{ Number(day.date.slice(-2)) }}</span><span v-if="eventColors(day.date).length" class="u-date-events" aria-hidden="true"><i v-for="(color, index) in eventColors(day.date)" :key="index" :style="{ backgroundColor: color }" /></span></button>
                </slot>
            </template>
        </div>
        <slot name="actions" />
    </div>
</template>
