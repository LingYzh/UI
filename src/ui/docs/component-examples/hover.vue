<script setup>
import { UButton, UHover } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UHover">
        <u-hover v-slot="{ isHovering, props: hoverProps }"><div v-bind="hoverProps" class="completion-panel" :style="{ background: isHovering ? 'var(--accent-soft)' : 'var(--surface)' }">{{ isHovering ? '指针或键盘位于此区域' : '移入或聚焦查看状态' }}<u-button size="sm" class="mt-3">可聚焦的操作</u-button></div></u-hover>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }
.completion-panel { padding: 16px; border: 1px solid var(--border); border-radius: 8px; }
</style>
