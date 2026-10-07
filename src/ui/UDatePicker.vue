<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import Icon from '../components/Icon.vue';
import { useDefaults } from './defaults';
import { computed, ref, watch } from 'vue';
import { addDays, addMonths, isAllowedDate, isoDate, monthDays, parseIsoDate, selectedDates, selectDate, type AllowedDates, type DateMode, type DateSelection } from './date-model';
import { vPointerBlur } from './pointer-focus';

const rawProps = withDefaults(defineProps<{
    mode?: DateMode;
    min?: string;
    max?: string;
    allowedDates?: AllowedDates;
    locale?: string;
    firstDayOfWeek?: number;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
} & { ripple?: RippleOptions }>(), { ripple: true, mode: 'single', locale: undefined, firstDayOfWeek: 0, label: 'Choose date' });
const props = useDefaults(rawProps, 'UDatePicker');
const model = defineModel<DateSelection>({ default: null });
const today = isoDate(new Date());
const month = ref((Array.isArray(model.value) ? model.value[0] : model.value) || today);
const focused = ref((Array.isArray(model.value) ? model.value[0] : model.value) || today);
const monthLabel = computed(() => new Intl.DateTimeFormat(props.locale, { year: 'numeric', month: 'long' }).format(parseIsoDate(month.value) ?? new Date()));
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format(new Date(2023, 0, 1 + ((index + props.firstDayOfWeek) % 7)))));
const days = computed(() => monthDays(month.value, props.firstDayOfWeek));
const selection = computed(() => new Set(selectedDates(model.value, props.mode)));
watch(model, (value) => { const date = Array.isArray(value) ? value[0] : value; if (date && parseIsoDate(date)) month.value = date; });
function choose(value: string): void {
    if (props.disabled || props.readonly || !isAllowedDate(value, props.min, props.max, props.allowedDates)) return;
    const next = selectDate(model.value, value, props.mode);
    if (!selectedDates(next, props.mode).every((date) => isAllowedDate(date, props.min, props.max, props.allowedDates))) return;
    model.value = next;
    focused.value = value;
    month.value = value;
}
function moveMonth(count: number): void { if (!props.disabled) month.value = addMonths(month.value, count); }
function onKeydown(event: KeyboardEvent, value: string): void {
    const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' ? -7 : event.key === 'ArrowDown' ? 7 : 0;
    if (delta) {
        event.preventDefault();
        const root = (event.currentTarget as HTMLElement).closest('.u-date-picker');
        const next = addDays(value, delta);
        focused.value = next;
        month.value = next;
        requestAnimationFrame(() => root?.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus());
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose(value);
    }
}
</script>

<template>
    <div class="u-date-picker" :aria-label="props.label">
        <div class="u-date-picker-header"><button v-ripple="props.readonly ? false : props.ripple" v-pointer-blur type="button" :disabled="props.disabled" aria-label="Previous month" @click="moveMonth(-1)"><Icon name="mdi-chevron-left" :size="18" /></button><strong aria-live="polite">{{ monthLabel }}</strong><button v-ripple="props.readonly ? false : props.ripple" v-pointer-blur type="button" :disabled="props.disabled" aria-label="Next month" @click="moveMonth(1)"><Icon name="mdi-chevron-right" :size="18" /></button></div>
        <div class="u-date-picker-grid" role="grid" :aria-label="monthLabel">
            <span v-for="(day, index) in weekdays" :key="index" class="u-date-weekday" role="columnheader">{{ day }}</span>
            <button v-ripple="props.readonly ? false : props.ripple" v-for="day in days" :key="day.date" v-pointer-blur type="button" role="gridcell" :data-date="day.date" :class="{ 'is-outside': !day.current, 'is-selected': selection.has(day.date), 'is-today': day.date === today }" :disabled="props.disabled || !isAllowedDate(day.date, props.min, props.max, props.allowedDates)" :aria-selected="selection.has(day.date)" :aria-label="new Intl.DateTimeFormat(props.locale, { dateStyle: 'full' }).format(parseIsoDate(day.date)!)" :tabindex="focused === day.date ? 0 : -1" @click="choose(day.date)" @keydown="onKeydown($event, day.date)">{{ Number(day.date.slice(-2)) }}</button>
        </div>
    </div>
</template>
