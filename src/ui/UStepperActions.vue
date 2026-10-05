<script setup lang="ts">
import UiButton from './UiButton.vue';
import { inject } from 'vue';
import { stepperContextKey } from './stepper-state';
import { vPointerBlur } from './pointer-focus';
const stepper = inject(stepperContextKey, undefined);
</script>
<template>
    <div class="u-stepper-actions"><slot :prev="stepper?.prev" :next="stepper?.next"><UiButton variant="ghost" @click="stepper?.prev()">上一步</UiButton><UiButton variant="primary" @click="stepper?.next()">下一步</UiButton></slot></div>
</template>
