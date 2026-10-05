<script setup>
import { ref } from 'vue';
import { UCalendar } from '../../index';
const date = ref('2026-10-06');
const title = ref('工作区名称');
</script>

<template>
    <div class="component-demo" data-demo-component="UCalendar">
        <u-calendar v-model="date" locale="zh-CN" :events="[{ id: 1, title: '设计评审', start: '2026-10-06' }, { id: 2, title: '组件验收', start: '2026-10-10' }]" class="mt-4" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
