<script setup>
import { ref } from 'vue';
import { UOtpInput } from '../../index';
const otp = ref('');
</script>

<template>
    <div class="component-demo" data-demo-component="UOtpInput">
        <u-otp-input v-model="otp" label="六位验证码" numeric :length="6" hint="支持粘贴、方向键和退格。" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
