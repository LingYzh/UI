<script setup>
import { UDivider } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UDivider">
        <p>第一段内容</p>
        <u-divider />
        <p>分隔线后的内容</p>
        <div class="demo-row">
            <span>左侧</span>
            <u-divider vertical />
            <span>右侧</span>
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
