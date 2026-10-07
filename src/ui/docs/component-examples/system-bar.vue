<script setup>
import { ULayout, UMain, USystemBar } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="USystemBar">
        <div class="completion-layout">
            <u-layout>
                <u-system-bar :height="28">
                    本地工作区
                    <span class="ms-auto">在线</span>
                </u-system-bar>
                <u-main>
                    <p class="pa-4">主要内容自动避开已注册的栏。</p>
                </u-main>
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
