<script setup>
import { UResponsive } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UResponsive">
        <u-responsive aspect-ratio="2/1">
            <div class="completion-window-card">2 : 1 的内容区域</div>
        </u-responsive>
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
.completion-window-card {
    display: grid;
    place-items: center;
    min-height: 140px;
    padding: 20px;
    background: var(--accent-soft);
    color: var(--accent-text);
}
</style>
