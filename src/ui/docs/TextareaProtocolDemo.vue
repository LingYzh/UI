<script setup>
import { ref } from 'vue';
import { UButton, USwitch, UTextarea } from '../index';

const content = ref('第一行指令\n第二行约束');
const loading = ref(false);
const capped = ref(false);
const textarea = ref();
const errors = ref([]);
async function validate() { errors.value = await textarea.value.validate(); }
const countCharacters = value => Array.from(String(value ?? '')).length;
</script>

<template>
    <div class="textarea-protocol-demo">
        <u-switch v-model="loading" label="显示加载状态" />
        <u-switch v-model="capped" label="限制输入区最大高度为 96px" />
        <u-textarea ref="textarea" v-model="content" label="可清空的指令" clearable persistent-clear auto-grow :rows="2" :max-rows="5" :max-height="capped ? 96 : undefined" counter="40" :counter-value="countCharacters" :loading="loading" :rules="[value => Boolean(value) || '请输入指令']">
            <template #counter="{ counter, value }"><span>{{ counter }} · {{ value }} 个字符</span></template>
        </u-textarea>
        <u-button size="sm" @click="validate">验证当前内容</u-button>
        <output>{{ errors.join('；') || '尚无错误' }}</output>
        <u-textarea model-value="只读内容" readonly clearable label="只读状态" :rows="2" />
    </div>
</template>

<style scoped>
.textarea-protocol-demo { display: grid; gap: 16px; min-width: 0; }
.textarea-protocol-demo > .ui-button { justify-self: start; }
.textarea-protocol-demo output { color: var(--muted); font-size: var(--ui-font-body-medium); }
</style>
