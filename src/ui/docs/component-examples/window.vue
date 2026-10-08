<script setup>
import { ref } from 'vue';
import { UButton, USwitch, UWindow, UWindowItem } from '../../index';
const windowValue = ref('a');
const windowRef = ref();
const disabled = ref(false);
function next() {
    windowRef.value?.next();
}
</script>

<template>
    <div class="component-demo" data-demo-component="UWindow">
        <u-switch v-model="disabled" label="禁用窗口交互" />
        <u-button size="sm" @click="next">调用下一项</u-button>
        <u-window
            ref="windowRef"
            v-model="windowValue"
            :disabled="disabled"
            continuous
            show-arrows="hover"
            label="内容窗口"
            tabindex="0"
            role="region"
        >
            <u-window-item value="a">
                <div class="completion-window-card">概览面板</div>
            </u-window-item>
            <u-window-item value="b">
                <div class="completion-window-card">详情面板</div>
            </u-window-item>
        </u-window>
        <output>鼠标悬停或键盘聚焦时显示箭头；箭头遵守禁用状态。</output>
        <output>当前面板：{{ windowValue }}；禁用后下一项、方向键与触摸均保持当前项。</output>
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
.completion-window-card {
    display: grid;
    place-items: center;
    min-height: 140px;
    padding: 20px;
    background: var(--accent-soft);
    color: var(--accent-text);
}
</style>
