<script setup>
import { USheet } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="USheet">
        <u-sheet border class="pa-4">带边框的表面容器</u-sheet>
        <u-sheet color="var(--accent-soft)" class="pa-4">使用主题色的表面容器</u-sheet>
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
