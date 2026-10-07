<script setup>
import { ref } from 'vue';
import { ULabel } from '../../index';
const text = ref('');
</script>

<template>
    <div class="component-demo" data-demo-component="ULabel">
        <u-label for="custom-label-demo" required>自定义输入名称</u-label>
        <input id="custom-label-demo" class="completion-native-input" v-model="text" />
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
.completion-native-input {
    width: 100%;
    min-width: 0;
    min-height: 36px;
    padding: 7px 11px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
}
</style>
