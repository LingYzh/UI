<script setup>
import { ref } from 'vue';
import { UButton, UIcon, USwitch } from '../index';

const enabled = ref(true);
const loading = ref(false);
const disabled = ref(false);
const readonly = ref(false);
const custom = ref();
const errors = ref([]);
async function validate() { errors.value = await custom.value.validate(); }
</script>

<template>
    <div class="switch-protocol-demo" data-switch-protocol-demo>
        <div class="switch-demo-settings">
            <u-switch v-model="loading" label="加载状态" />
            <u-switch v-model="disabled" label="禁用示例" />
            <u-switch v-model="readonly" label="只读示例" />
        </div>
        <u-switch ref="custom" v-model="enabled" :loading="loading" :disabled="disabled" :readonly="readonly" true-icon="mdi-check" false-icon="mdi-close" :rules="[value => value || '请开启同步']" data-custom-switch>
            <template #label="{ label, model }">{{ label || '自动同步' }} · {{ model.value ? '开启' : '关闭' }}</template>
            <template #track-true>开</template>
            <template #track-false>关</template>
            <template #thumb="{ icon }"><u-icon :icon="icon" :size="10" /></template>
            <template #details="{ isValid }"><span :class="{ 'switch-demo-error': isValid.value === false }">{{ isValid.value === false ? '请开启同步' : '鼠标点击或 Space 切换；自定义滑块优先于加载图标。' }}</span></template>
        </u-switch>
        <u-switch v-model="enabled" label="内置加载与图标" :loading="loading" :disabled="disabled" :readonly="readonly" true-icon="mdi-check" false-icon="mdi-close" thumb-color="primary" data-loading-switch />
        <u-switch v-model="enabled" label="保留默认外观" :disabled="disabled" :readonly="readonly" data-default-switch />
        <u-switch v-model="enabled" label="无阴影滑块" flat :disabled="disabled" :readonly="readonly" data-flat-switch />
        <u-button size="sm" @click="validate">验证同步状态</u-button>
        <output role="status">{{ enabled ? '同步开启' : '同步关闭' }}{{ errors.length ? ` · ${errors.join('；')}` : '' }}</output>
    </div>
</template>

<style scoped>
.switch-protocol-demo { display: grid; gap: 16px; min-width: 0; }
.switch-demo-settings { display: flex; flex-wrap: wrap; gap: 20px; }
.switch-protocol-demo > .ui-button { justify-self: start; }
.switch-protocol-demo output { color: var(--muted); font-size: var(--ui-font-body-medium); }
.switch-demo-error { color: var(--ui-theme-error, var(--danger)); }
</style>
