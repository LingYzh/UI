<script setup>
import { ref } from 'vue';
import { UFileInput } from '../../index';
const files = ref(null);
</script>

<template>
    <div class="component-demo" data-demo-component="UFileInput">
        <u-file-input v-model="files" label="选择附件" multiple accept=".md,.txt,.png" show-size hint="本地选择，仅更新示例模型。" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
