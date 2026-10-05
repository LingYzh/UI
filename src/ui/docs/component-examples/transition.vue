<script setup>
import { ref } from 'vue';
import { UButton, UTransition } from '../../index';
const expanded = ref(true);
</script>

<template>
    <div class="component-demo" data-demo-component="UTransition">
        <u-button size="sm" @click="expanded = !expanded">{{ expanded ? '收起' : '展开' }}</u-button><u-transition variant="expand"><div v-if="expanded" class="completion-panel">展开动画跟随减少动效偏好。</div></u-transition>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }
.completion-panel { padding: 16px; border: 1px solid var(--border); border-radius: 8px; }
</style>
