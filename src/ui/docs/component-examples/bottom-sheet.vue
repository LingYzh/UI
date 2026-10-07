<script setup>
import { ref } from 'vue';
import { UBottomSheet, UButton } from '../../index';
const open = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UBottomSheet">
        <u-button @click="open = true">打开底部面板</u-button>
        <u-bottom-sheet v-model="open">
            <h3>底部操作面板</h3>
            <p>适合移动设备上的次要操作。</p>
            <u-button @click="open = false">完成</u-button>
        </u-bottom-sheet>
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
