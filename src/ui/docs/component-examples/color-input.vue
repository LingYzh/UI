<script setup>
import { ref } from 'vue';
import { UColorInput } from '../../index';
const color = ref('#bd6749');
const translucent = ref({ r: 189, g: 103, b: 73, a: 0.45 });
</script>

<template>
    <div class="component-demo" data-demo-component="UColorInput">
        <u-color-input
            v-model="color"
            label="标记颜色"
            hint="点击色块打开组件库面板，确认后提交，取消保留原颜色。"
        />
        <u-color-input
            v-model="translucent"
            label="透明色对象"
            :picker-props="{ mode: 'rgba', hideCanvas: false }"
            open-on-focus
        />
        <u-color-input v-model="color" label="即时更新" hide-actions pip-location="append-inner" />
        <u-color-input v-model="color" label="系统选择器扩展" native-picker />
        <output>{{ translucent }}</output>
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
