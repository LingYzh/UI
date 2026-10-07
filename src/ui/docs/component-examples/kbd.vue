<script setup>
import { UKbd } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UKbd">
        <div class="demo-row">
            <u-kbd keys="Ctrl + K" />
            <u-kbd keys="Enter" />
            <u-kbd keys="Escape" />
        </div>
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
