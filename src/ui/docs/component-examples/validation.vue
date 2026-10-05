<script setup>
import { ref } from 'vue';
import { UButton, UMessages, UTextField, UValidation } from '../../index';
const custom = ref('');
const required = value => !!value || '请填写此项。';
</script>

<template>
    <div class="component-demo" data-demo-component="UValidation">
        <u-validation ref="validation" v-model="custom" :rules="[required]" v-slot="{ errors, validate }"><u-text-field v-model="custom" label="自定义内容" /><u-button @click="validate">验证</u-button><u-messages :messages="errors" error /></u-validation>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
