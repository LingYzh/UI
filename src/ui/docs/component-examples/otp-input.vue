<script setup>
import { ref } from 'vue';
import { UOtpInput } from '../../index';
const otp = ref();
const numericOtp = ref();
</script>

<template>
    <div class="component-demo" data-demo-component="UOtpInput">
        <u-otp-input
            v-model="otp"
            label="六位字母或数字"
            :length="6"
            hint="默认允许字母；聚焦外框平滑淡入，失焦淡出。支持粘贴、方向键和退格。"
        />
        <output>当前值：{{ otp ?? '未设置' }}</output>
        <u-otp-input v-model="numericOtp" numeric label="仅数字验证码" :length="4" />
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
