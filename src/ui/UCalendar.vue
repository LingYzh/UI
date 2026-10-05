<script setup lang="ts">
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
import { computed } from 'vue';
import { addDays, addMonths, isoDate, monthDays, parseIsoDate } from './date-model';

export interface CalendarEvent { id: string | number; title: string; start: string; end?: string; color?: string; allDay?: boolean }
const rawProps = withDefaults(defineProps<{ events?: readonly CalendarEvent[]; view?: 'month' | 'week' | 'day'; locale?: string; firstDayOfWeek?: number; min?: string; max?: string }>(), { events: () => [], view: 'month', firstDayOfWeek: 0 });
const props = useDefaults(rawProps, 'UCalendar');
const model = defineModel<string>({ default: isoDate(new Date()) });
const focused = computed(() => parseIsoDate(model.value) ?? new Date());
const title = computed(() => new Intl.DateTimeFormat(props.locale, props.view === 'month' ? { year: 'numeric', month: 'long' } : { dateStyle: 'full' }).format(focused.value));
const dates = computed(() => {
    if (props.view === 'month') return monthDays(model.value, props.firstDayOfWeek).map((entry) => entry.date);
    if (props.view === 'day') return [model.value];
    const offset = (focused.value.getDay() - props.firstDayOfWeek + 7) % 7;
    return Array.from({ length: 7 }, (_, index) => addDays(model.value, index - offset));
});
const cells = computed(() => dates.value.map((date) => ({ date, current: date.slice(0, 7) === model.value.slice(0, 7), events: props.events.filter((event) => {
    const start = event.start.slice(0, 10);
    const end = (event.end ?? event.start).slice(0, 10);
    return date >= start && date <= end;
}).sort((a, b) => a.start.localeCompare(b.start)) })));
function move(delta: number): void {
    const next = props.view === 'month' ? addMonths(model.value, delta) : addDays(model.value, props.view === 'week' ? 7 * delta : delta);
    if ((!props.min || next >= props.min) && (!props.max || next <= props.max)) model.value = next;
}
function goToday(): void { const today = isoDate(new Date()); if ((!props.min || today >= props.min) && (!props.max || today <= props.max)) model.value = today; }
defineExpose({ move, goToday });
</script>
<template>
    <section class="u-calendar" :data-view="props.view"><header class="u-calendar-header"><UiButton variant="ghost" aria-label="上一页" @click="move(-1)">‹</UiButton><strong>{{ title }}</strong><UiButton variant="ghost" @click="goToday">今天</UiButton><UiButton variant="ghost" aria-label="下一页" @click="move(1)">›</UiButton></header><div class="u-calendar-grid"><div v-for="cell in cells" :key="cell.date" class="u-calendar-cell" :class="{ 'is-muted': !cell.current }"><time :datetime="cell.date">{{ Number(cell.date.slice(-2)) }}</time><div v-for="event in cell.events" :key="event.id" class="u-calendar-event" :style="{ '--u-event-color': event.color || 'var(--accent)' }"><slot name="event" :event="event" :date="cell.date">{{ event.title }}</slot></div><slot name="day" :date="cell.date" :events="cell.events" /></div></div><slot :cells="cells" :title="title" :move="move" :go-today="goToday" /></section>
</template>
