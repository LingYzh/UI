<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import Icon from '../components/Icon.vue';
import UiButton from './UiButton.vue';
import { vRipple, type RippleOptions } from './ripple';
import { getCalendarWeekNumber } from './calendar';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
import { isoDate, parseIsoDate } from './date-model';
import { addCalendarMinutes, buildAllDayEventSpans, buildCalendarCategoryDays, buildCalendarView, buildTimedEventSlices, createCalendarIntervals, getCalendarEventsForDay, isCalendarEventForCategory, moveCalendarView, parseCalendarTimestamp, resolveCalendarCategories, type CalendarDateInput, type CalendarEventInput, type CalendarEventOptions, type CalendarIntervalOptions, type CalendarOverlapMode, type CalendarTimestamp, type CalendarViewOptions, type CalendarViewType, parseCalendarEvents } from './calendar';
export interface CalendarEvent extends CalendarEventInput { id?: string | number; title?: string; start?: CalendarDateInput; end?: CalendarDateInput; color?: string; allDay?: boolean }
const rawProps = withDefaults(defineProps<Omit<CalendarViewOptions, 'modelValue'> & CalendarEventOptions & CalendarIntervalOptions & {
    events?: readonly CalendarEvent[]; view?: 'month' | 'week' | 'day'; min?: string; max?: string;
    categoryHideDynamic?: boolean; categoryShowAll?: boolean; categoryForInvalid?: string;
    eventColor?: string | ((event: CalendarEvent) => string); eventTextColor?: string | ((event: CalendarEvent) => string);
    eventHeight?: number; eventOverlapMode?: CalendarOverlapMode; eventOverlapThreshold?: number | string;
    eventRipple?: RippleOptions; eventMarginBottom?: number | string;
    showWeek?: boolean; firstDayOfYear?: number | string;
    eventMore?: boolean; eventMoreText?: string; eventLimit?: number; hideHeader?: boolean; hideWeekdays?: boolean;
    weekdayFormat?: (timestamp: CalendarTimestamp, short: boolean) => string; dayFormat?: (timestamp: CalendarTimestamp) => string;
    intervalFormat?: (timestamp: CalendarTimestamp, short: boolean) => string;
    intervalStyle?: (timestamp: CalendarTimestamp) => Record<string, string | number>;
    showIntervalLabel?: (timestamp: CalendarTimestamp) => boolean;
}>(), { events: () => [], view: 'month', eventHeight: 20, eventRipple: false, eventMarginBottom: 3, eventOverlapMode: 'stack', eventOverlapThreshold: 60, eventMore: true, eventLimit: 3 });
const props = useDefaults(rawProps, 'UCalendar');
const locale = useLocale();
const model = defineModel<CalendarDateInput>({ default: () => isoDate(new Date()) });
const emit = defineEmits<{
    change: [value: { start: CalendarTimestamp; end: CalendarTimestamp }]; moved: [value: { date: string; direction: 'next' | 'prev' }];
    'click:date': [value: CalendarTimestamp, event: MouseEvent]; 'click:day': [value: CalendarTimestamp, event: MouseEvent];
    'click:event': [value: { event: CalendarEventInput; eventParsed: unknown; day: CalendarTimestamp }, event: MouseEvent];
    'click:more': [value: { date: string; events: CalendarEventInput[] }, event: MouseEvent];
    'click:time': [value: CalendarTimestamp, event: MouseEvent]; 'click:dayCategory': [value: unknown, event: MouseEvent];
    'click:interval': [value: CalendarTimestamp, event: MouseEvent]; 'click:timeCategory': [value: unknown, event: MouseEvent];
}>();
const element = ref<HTMLElement>();
const scroller = ref<HTMLElement>();
const language = computed(() => props.locale ?? locale.current.value);
const type = computed<CalendarViewType>(() => props.type ?? props.view);
const currentTime = ref(new Date());
const now = computed(() => parseCalendarTimestamp(props.now ?? currentTime.value)!);
const calendar = computed(() => buildCalendarView({ ...props, now: props.now ?? currentTime.value, locale: language.value, modelValue: model.value, type: type.value }));
const parsed = computed(() => parseCalendarEvents(props.events, props).events);
const allDaySpans = computed(() => buildAllDayEventSpans(parsed.value, calendar.value.weeks));
const eventMarginBottom = computed(() => Math.max(0, Number(props.eventMarginBottom) || 0));
function weekRows(index: number) { return Math.min(props.eventMore ? Math.max(0, props.eventLimit) : Infinity, allDaySpans.value.find(span => span.weekIndex === index)?.rowCount ?? 0); }
function weekSpans(index: number) { return allDaySpans.value.filter(span => span.weekIndex === index && span.row < weekRows(index)); }
const intervals = computed(() => createCalendarIntervals(props));
const timed = computed(() => !['month', 'custom-weekly'].includes(type.value));
const categories = computed(() => type.value === 'category' ? resolveCalendarCategories(props.categories, parsed.value, props) : []);
const columns = computed(() => type.value === 'category' ? buildCalendarCategoryDays(calendar.value.days, categories.value) : calendar.value.days.map(day => ({ day, category: null, categoryIndex: 0 })));
const slices = computed(() => buildTimedEventSlices(parsed.value, calendar.value.days, props, { eventHeight: props.eventHeight, overlapMode: props.eventOverlapMode, overlapThreshold: props.eventOverlapThreshold, categoryMode: type.value === 'category' }));
const cells = computed(() => calendar.value.days.map(day => ({ date: day.date, current: !day.outside, day, events: getCalendarEventsForDay(parsed.value, day).map(event => event.input) })));
const title = computed(() => {
    const date = parseIsoDate(calendar.value.anchor.date)!;
    return new Intl.DateTimeFormat(language.value, type.value === 'month' ? { year: 'numeric', month: 'long' } : { dateStyle: 'full' }).format(date);
});
watch(() => calendar.value.start.date + '/' + calendar.value.end.date, () => emit('change', { start: calendar.value.start, end: calendar.value.end }), { immediate: true });
function move(amount = 1) {
    const moved = moveCalendarView(model.value, type.value, amount, Number(props.categoryDays ?? 1));
    const date = moved.value?.date;
    if (moved.moved && date && (!props.min || date >= props.min) && (!props.max || date <= props.max)) { model.value = date; emit('moved', { date, direction: moved.direction }); }
}
function goToday() { const date = isoDate(new Date()); if ((!props.min || date >= props.min) && (!props.max || date <= props.max)) model.value = date; }
function eventColor(event: CalendarEventInput) { return typeof props.eventColor === 'function' ? props.eventColor(event) : props.eventColor ?? event.color as string ?? 'var(--accent)'; }
function eventTextColor(event: CalendarEventInput) { return typeof props.eventTextColor === 'function' ? props.eventTextColor(event) : props.eventTextColor; }
function dayEvents(day: (typeof calendar.value.days)[number], allDayOnly = false) { return getCalendarEventsForDay(parsed.value, day).filter(event => !allDayOnly || event.allDay); }
function label(day: CalendarTimestamp) { return props.dayFormat?.(day) ?? String(day.day); }
function weekday(day: CalendarTimestamp) { return props.weekdayFormat?.(day, true) ?? new Intl.DateTimeFormat(language.value, { weekday: 'short' }).format(parseIsoDate(day.date)!); }
function intervalLabel(value: CalendarTimestamp) { return props.intervalFormat?.(value, false) ?? value.time; }
function visibleEvents(day: (typeof calendar.value.days)[number]) { const events = dayEvents(day); return props.eventMore ? events.slice(0, Math.max(0, props.eventLimit)) : events; }
function onTime(event: MouseEvent, day: CalendarTimestamp, category: unknown = null) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const minutes = Math.min(1439, Math.max(0, intervals.value.firstMinute + Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) * intervals.value.intervalCount * intervals.value.intervalMinutes));
    const value = addCalendarMinutes({ ...day, hour: 0, minute: 0, hasTime: true }, Math.floor(minutes));
    emit('click:time', value, event);
    if (category) emit('click:timeCategory', { ...value, category }, event);
}
async function scrollToTime(value: string | number) { await nextTick(); const y = intervals.value.timeToY(value); if (y === false || !scroller.value) return false; scroller.value.scrollTop = y; return true; }
function eventScope(event: (typeof parsed.value)[number], day: CalendarTimestamp, timedValue = false) { return { event: event.input, eventParsed: event, parsedEvent: event, date: day.date, day, timed: timedValue, start: event.start, end: event.end }; }
function updateTimes() { currentTime.value = new Date(); }
function weekNumber(week: readonly CalendarTimestamp[]) { return getCalendarWeekNumber(week[0].date, language.value, calendar.value.firstDayOfWeek, props.firstDayOfYear); }
defineExpose({ element, move, next: () => move(1), prev: () => move(-1), goToday, scrollToTime, timeToY: (value: string | number) => intervals.value.timeToY(value), timeDelta: (value: string | number) => intervals.value.timeDelta(value), updateTimes, getTimestampAtEvent: (event: MouseEvent, day: CalendarTimestamp) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return addCalendarMinutes({ ...day, hour: 0, minute: 0, hasTime: true }, Math.min(1439, Math.max(0, Math.floor(intervals.value.firstMinute + (event.clientY - rect.top) / rect.height * intervals.value.intervalCount * intervals.value.intervalMinutes))));
} });
</script>

<template>
    <section ref="element" class="u-calendar" :data-view="type" :style="{ '--u-calendar-week-gutter': props.showWeek ? '28px' : '0px' }">
        <header v-if="!props.hideHeader" class="u-calendar-header"><slot name="header" :title="title" :prev="() => move(-1)" :next="() => move(1)" :go-today="goToday"><UiButton variant="text" aria-label="上一页" @click="move(-1)"><Icon name="mdi-chevron-left" :size="18" /></UiButton><strong>{{ title }}</strong><UiButton variant="text" @click="goToday">今天</UiButton><UiButton variant="text" aria-label="下一页" @click="move(1)"><Icon name="mdi-chevron-right" :size="18" /></UiButton></slot></header>
        <div v-if="!timed" class="u-calendar-month">
            <div v-if="!props.hideWeekdays" class="u-calendar-grid" :style="{ gridTemplateColumns: `${props.showWeek ? '28px ' : ''}repeat(${Math.max(1, calendar.weekdays.length)}, minmax(0, 1fr))` }"><div v-if="props.showWeek" class="u-calendar-weekday" aria-label="周号">#</div><div v-for="day in calendar.days.slice(0, calendar.weekdays.length)" :key="'weekday-' + day.weekday" class="u-calendar-weekday">{{ weekday(day) }}</div></div>
            <div v-for="(week, weekIndex) in calendar.weeks" :key="week[0]?.date" class="u-calendar-week u-calendar-grid" :style="{ gridTemplateColumns: `${props.showWeek ? '28px ' : ''}repeat(${Math.max(1, calendar.weekdays.length)}, minmax(0, 1fr))` }">
                <div v-if="props.showWeek" class="u-calendar-week-number"><slot name="week" :week="weekNumber(week)" :days="week">{{ weekNumber(week) }}</slot></div>
            <div v-for="day in week" :key="day.date" class="u-calendar-cell" :class="{ 'is-muted': day.outside, 'is-today': day.present }" @click="emit('click:day', day, $event)">
                <slot name="day-header" v-bind="day"><button type="button" class="u-calendar-day-label" @click.stop="emit('click:date', day, $event)"><slot name="day-label" v-bind="day"><time :datetime="day.date">{{ label(day) }}</time></slot></button></slot>
                <div :style="{ height: weekRows(weekIndex) * (props.eventHeight + eventMarginBottom) + 'px' }" />
                <div v-for="event in visibleEvents(day).filter(event => !event.allDay)" :key="event.index" v-ripple="props.eventRipple" class="u-calendar-event" :style="{ '--u-event-color': eventColor(event.input), color: eventTextColor(event.input), minHeight: props.eventHeight + 'px' }" @click.stop="emit('click:event', eventScope(event, day), $event)"><slot name="event" v-bind="eventScope(event, day)">{{ event.name }}</slot></div>
                <button v-if="props.eventMore && dayEvents(day).length > props.eventLimit" type="button" v-ripple="props.eventRipple" class="u-calendar-more" @click.stop="emit('click:more', { date: day.date, events: dayEvents(day).map(event => event.input) }, $event)"><slot name="more" :date="day.date" :events="dayEvents(day).map(event => event.input)">{{ props.eventMoreText?.replace('{0}', String(dayEvents(day).length - props.eventLimit)) ?? `+${dayEvents(day).length - props.eventLimit}` }}</slot></button>
                <slot name="day" :date="day.date" :events="dayEvents(day).map(event => event.input)" :day="day" /><slot name="day-body" v-bind="day" />
            </div>
                <div v-for="span in weekSpans(weekIndex)" :key="span.event.index" v-ripple="props.eventRipple" class="u-calendar-event is-all-day" :class="{ 'is-continuing-start': !span.starts, 'is-continuing-end': !span.ends }" :style="{ top: (34 + span.row * (props.eventHeight + eventMarginBottom)) + 'px', insetInlineStart: `calc(var(--u-calendar-week-gutter) + (100% - var(--u-calendar-week-gutter)) * ${span.startIndex / week.length} + 4px)`, width: `calc((100% - var(--u-calendar-week-gutter)) * ${span.spanDays / week.length} - 8px)`, height: props.eventHeight + 'px', '--u-event-color': eventColor(span.event.input), color: eventTextColor(span.event.input) }" @click.stop="emit('click:event', eventScope(span.event, week[span.startIndex]), $event)"><slot name="event" v-bind="{ ...eventScope(span.event, week[span.startIndex]), start: span.starts, end: span.ends }">{{ span.event.name }}</slot></div>
            </div>
        </div>
        <div v-else ref="scroller" class="u-calendar-time-scroll">
            <div class="u-calendar-time-grid" :style="{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(100px, 1fr))` }">
                <div class="u-calendar-time-axis" />
                <div v-for="(column, index) in columns" :key="index" class="u-calendar-time-heading"><slot name="day-header" v-bind="column.day"><button type="button" class="u-calendar-day-label" @click="emit('click:date', column.day, $event)">{{ props.hideWeekdays ? '' : weekday(column.day) }} {{ label(column.day) }}</button></slot><slot v-if="column.category" name="category" :category="column.category" :day="column.day"><button type="button" class="u-calendar-category" @click="emit('click:dayCategory', { ...column.day, category: column.category }, $event)">{{ column.category.categoryName }}</button></slot><div v-for="event in dayEvents(column.day, true).filter(event => !column.category || isCalendarEventForCategory(event, column.category, props.categoryForInvalid))" :key="event.index" v-ripple="props.eventRipple" class="u-calendar-event" :style="{ '--u-event-color': eventColor(event.input), marginBottom: eventMarginBottom + 'px' }" @click="emit('click:event', eventScope(event, column.day), $event)"><slot name="event" v-bind="eventScope(event, column.day)">{{ event.name }}</slot></div></div>
                <div class="u-calendar-time-axis" :style="{ height: intervals.bodyHeight + 'px' }"><div v-for="interval in intervals.intervalsForDay(calendar.days[0], now)" :key="interval.time" :style="{ height: intervals.intervalHeight + 'px' }"><slot name="interval" v-bind="interval"><span v-if="!props.showIntervalLabel || props.showIntervalLabel(interval)">{{ intervalLabel(interval) }}</span></slot></div></div>
                <div v-for="(column, index) in columns" :key="'body-' + index" class="u-calendar-time-day" :style="{ height: intervals.bodyHeight + 'px' }" @click="onTime($event, column.day, column.category)">
                    <div v-for="interval in intervals.intervalsForDay(column.day, now)" :key="interval.time" class="u-calendar-interval" :style="[{ height: intervals.intervalHeight + 'px' }, props.intervalStyle?.(interval)]" @click="emit('click:interval', interval, $event)"><slot name="interval-body" v-bind="interval" /></div>
                    <div v-for="slice in slices.filter(slice => slice.day.date === column.day.date && (!column.category || isCalendarEventForCategory(slice.event, column.category, props.categoryForInvalid)))" :key="slice.event.index" v-ripple="props.eventRipple" class="u-calendar-event is-timed" :style="{ top: slice.top + 'px', height: slice.height + 'px', left: slice.left + '%', width: slice.width + '%', '--u-event-color': eventColor(slice.event.input), color: eventTextColor(slice.event.input) }" @click.stop="emit('click:event', eventScope(slice.event, column.day, true), $event)"><slot name="event" v-bind="eventScope(slice.event, column.day, true)">{{ slice.event.name }}</slot></div>
                    <slot name="day-body" v-bind="column.day" />
                </div>
            </div>
        </div>
        <slot :cells="cells" :title="title" :move="move" :go-today="goToday" :start="calendar.start" :end="calendar.end" />
    </section>
</template>
