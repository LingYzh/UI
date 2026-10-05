<script setup>
import { UTimeline, UTimelineItem } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UTimelineItem">
        <u-timeline side="alternate"><u-timeline-item title="完成盘点" subtitle="09:00">确认组件和使用接口。</u-timeline-item><u-timeline-item title="组件实现" subtitle="10:00">编写真实模板与交互示例。</u-timeline-item></u-timeline>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
