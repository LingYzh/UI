<script setup>
import { ref } from 'vue';
import { UColorInput } from '../../index';
const color = ref('#bd6749');
</script>

<template>
    <div class="component-demo" data-demo-component="UColorInput">
        <u-color-input
            v-model="color"
            label="标记颜色"
            hint="颜色面板和十六进制输入共用一个模型。"
        />
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
