<script setup>
import { ref } from 'vue';
import { UButton, UDialog, UTextField } from '../index';
const open = ref(false);
const fullscreen = ref(false);
</script>

<template>
    <div class="demo-row">
        <u-button @click="fullscreen = false; open = true">指定尺寸弹窗</u-button>
        <u-button @click="fullscreen = true; open = true">全屏弹窗</u-button>
        <u-dialog v-model="open" :fullscreen="fullscreen" :width="420" :height="460" scrollable aria-label="尺寸与全屏示例">
            <template #header><h2 class="ma-0 text-title">{{ fullscreen ? '全屏编辑' : '420 × 460 弹窗' }}</h2></template>
            <div class="d-flex flex-column ga-4">
                <p>全屏时覆盖宽高限制；头尾固定，正文独立滚动。关闭动画结束后卸载内容。</p>
                <u-text-field v-for="index in 8" :key="index" :label="`字段 ${index}`" placeholder="使用 Tab 查看焦点移动" />
            </div>
            <template #footer="{ close }"><u-button @click="close">关闭</u-button></template>
        </u-dialog>
    </div>
</template>
