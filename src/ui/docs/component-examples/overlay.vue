<script setup>
import { ref } from 'vue';
import { UButton, UOverlay } from '../../index';
const open = ref(false);
function reopen() {
    open.value = false;
    requestAnimationFrame(() => {
        open.value = true;
    });
}
</script>

<template>
    <div class="component-demo" data-demo-component="UOverlay">
        <u-button @click="open = true">打开浮层</u-button>
        <u-overlay v-model="open" :width="360" v-slot="{ close }">
            <h3>通用浮层</h3>
            <p>Escape 或点击外部关闭，退出动画完成后恢复焦点和滚动。</p>
            <div class="demo-row">
                <u-button @click="close">关闭</u-button>
                <u-button variant="text" @click="reopen">快速重开</u-button>
            </div>
        </u-overlay>
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
