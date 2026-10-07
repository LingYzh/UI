<script setup>
import { ref } from 'vue';
import { UButton, UToolbar, UToolbarItems, UToolbarTitle } from '../../index';
const action = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UToolbarTitle">
        <u-toolbar border>
            <u-toolbar-title text="很长的工作区名称，容器收窄时标题截断，操作始终可见" />
            <u-toolbar-items>
                <u-button size="sm" variant="text" @click="action++">刷新</u-button>
            </u-toolbar-items>
        </u-toolbar>
        <u-toolbar density="prominent" color="primary">
            <u-toolbar-title tag="h3" text="此内容被 text 插槽替代">
                <template #text>自定义标题内容</template>
            </u-toolbar-title>
        </u-toolbar>
        <output>已刷新 {{ action }} 次</output>
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
</style>
