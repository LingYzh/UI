<script setup>
import { ref } from 'vue';
import { UCalendar, USelect, USwitch } from '../../index';
const date = ref('2026-10-06');
const locale = ref('zh-CN');
const showWeek = ref(false);
const ripple = ref(false);
const compactEvents = ref(false);
const events = [
    { id: 1, title: '跨周组件验收', start: '2026-10-06', end: '2026-10-13', allDay: true },
    {
        id: 2,
        title: '设计评审',
        start: '2026-10-06 09:00',
        end: '2026-10-06 10:30',
        timed: true,
        category: '设计',
    },
    {
        id: 3,
        title: '开发同步',
        start: '2026-10-06 09:30',
        end: '2026-10-06 11:00',
        timed: true,
        category: '开发',
    },
];
const selected = ref('');
</script>

<template>
    <div class="component-demo" data-demo-component="UCalendar">
        <u-select
            v-model="locale"
            :items="['zh-CN', 'zh-HK', 'en-US', 'en-GB']"
            label="语言地区与周起始日"
        />
        <div class="calendar-demo-settings">
            <u-switch v-model="showWeek" label="显示地区周号" />
            <u-switch v-model="ripple" label="事件点击波纹" />
            <u-switch v-model="compactEvents" label="事件行间距 1px" />
        </div>
        <u-calendar
            v-model="date"
            :locale="locale"
            :events="events"
            :show-week="showWeek"
            :event-ripple="ripple"
            :event-margin-bottom="compactEvents ? 1 : 3"
            @click:event="selected = $event.event.title"
        />
        <u-calendar
            v-model="date"
            type="day"
            :locale="locale"
            first-time="08:00"
            :interval-count="5"
            :events="events"
            :event-ripple="ripple"
            :event-margin-bottom="compactEvents ? 1 : 3"
            @click:event="selected = $event.event.title"
        />
        <u-calendar
            v-model="date"
            type="category"
            :locale="locale"
            :categories="['设计', '开发']"
            first-time="08:00"
            :interval-count="5"
            :events="events"
            :event-ripple="ripple"
            :event-margin-bottom="compactEvents ? 1 : 3"
            @click:event="selected = $event.event.title"
        />
        <output>
            选中事件：{{ selected || '尚未选择' }}；时间视图可滚动，重叠事件保留独立点击区域。
        </output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
.calendar-demo-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
</style>
