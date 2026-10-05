<script setup>
import { ref } from 'vue';
import { UTimePicker } from '../../index';
const time = ref('09:30');
</script>

<template>
    <div class="component-demo" data-demo-component="UTimePicker">
        <u-time-picker v-model="time" label="执行时间" /><output>当前时间：{{ time }}</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
