<script setup>
import { ref } from 'vue';
import { UInput } from '../../index';
const custom = ref('');
const disabled = ref(false);
const readonly = ref(false);
const required = value => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';
</script>

<template>
    <div class="component-demo" data-demo-component="UInput">
        <u-input v-model="custom" label="自定义输入的验证基座" :rules="[required]" hint="UInput 只提供状态、验证和框架，插槽放入自定义控件。"><template #default="{ controlAttrs, disabled: isDisabled, readonly: isReadonly }"><input v-model="custom" v-bind="controlAttrs" class="completion-native-input" :disabled="isDisabled" :readonly="isReadonly" /></template></u-input>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }
.completion-native-input { width: 100%; min-width: 0; min-height: 36px; padding: 7px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; }
</style>
