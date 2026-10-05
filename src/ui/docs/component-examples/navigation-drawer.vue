<script setup>
import { ref } from 'vue';
import { UButton, ULayout, UList, UListItem, UMain, UNavigationDrawer } from '../../index';
const drawer = ref(true);
</script>

<template>
    <div class="component-demo" data-demo-component="UNavigationDrawer">
        <u-button size="sm" @click="drawer = !drawer">切换抽屉</u-button><div class="completion-layout"><u-layout><u-navigation-drawer v-model="drawer" :width="160" :mobile-breakpoint="600"><u-list><u-list-item title="概览" /><u-list-item title="配置" /></u-list></u-navigation-drawer><u-main><p class="pa-4">关闭抽屉后内容填满剩余空间。</p></u-main></u-layout></div>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }
.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }
.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }
</style>
