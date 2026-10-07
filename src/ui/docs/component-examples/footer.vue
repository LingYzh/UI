<script setup>
import { UFooter, ULayout, UMain } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UFooter">
        <div class="completion-layout">
            <u-layout>
                <u-main>
                    <p class="pa-4">页脚占位由 Main 自动处理。</p>
                </u-main>
                <u-footer fixed :height="40">固定页脚</u-footer>
            </u-layout>
        </div>
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
.completion-layout {
    position: relative;
    height: 260px;
    overflow: clip;
    border: 1px solid var(--border);
    border-radius: 8px;
    transform: translateZ(0);
}
.completion-layout :deep(.ui-app),
.completion-layout :deep(.ui-layout),
.completion-layout :deep(.ui-main) {
    min-height: 260px;
}
</style>
