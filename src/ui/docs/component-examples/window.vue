<script setup>
import { ref } from 'vue';
import { UButton, UWindow, UWindowItem } from '../../index';
const windowValue = ref('a');
</script>

<template>
    <div class="component-demo" data-demo-component="UWindow">
        <u-button size="sm" @click="windowValue = windowValue === 'a' ? 'b' : 'a'">切换面板</u-button><u-window v-model="windowValue" continuous label="内容窗口"><u-window-item value="a"><div class="completion-window-card">概览面板</div></u-window-item><u-window-item value="b"><div class="completion-window-card">详情面板</div></u-window-item></u-window>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }
.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }
</style>
