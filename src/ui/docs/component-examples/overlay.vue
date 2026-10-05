<script setup>
import { ref } from 'vue';
import { UButton, UOverlay } from '../../index';
const open = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UOverlay">
        <u-button @click="open = true">打开浮层</u-button><u-overlay v-model="open" :width="360" v-slot="{ close }"><h3>通用浮层</h3><p>Escape 或点击外部关闭。</p><u-button @click="close">关闭</u-button></u-overlay>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
