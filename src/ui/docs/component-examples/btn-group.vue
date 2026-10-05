<script setup>
import { UBtnGroup, UButton } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UBtnGroup">
        <u-btn-group><u-button size="sm">复制</u-button><u-button size="sm">导出</u-button></u-btn-group>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
