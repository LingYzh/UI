<script setup>
import { UApp, UAppBar, UAppBarTitle, UMain } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UMain">
        <div class="completion-layout">
            <u-app>
                <u-app-bar :height="48">
                    <u-app-bar-title>应用顶栏</u-app-bar-title>
                </u-app-bar>
                <u-main tag="section" scrollable :height="260" :min-height="0">
                    <p v-for="index in 12" :key="index" class="pa-4">
                        第 {{ index }} 行：主要内容自动避开已注册的栏，正文独立滚动。
                    </p>
                </u-main>
            </u-app>
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
