<script setup>
import { ref } from 'vue';
import { UTimePicker } from '../../index';
const time = ref('14:30');
const seconds = ref('09:15:20');
</script>

<template>
    <div class="component-demo" data-demo-component="UTimePicker">
        <u-time-picker
            v-model="time"
            label="默认 24 小时拨盘"
            :allowed-hours="(hour) => hour >= 8 && hour <= 20"
        />
        <u-time-picker
            v-model="time"
            label="12 小时显示，模型仍为 24 小时"
            format="ampm"
            variant="select"
        />
        <u-time-picker v-model="seconds" label="秒级输入" use-seconds variant="input" />
        <output>模型：{{ time }} / {{ seconds }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
</style>
