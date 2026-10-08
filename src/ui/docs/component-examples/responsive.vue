<script setup>
import { UResponsive } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UResponsive">
        <u-responsive
            aspect-ratio="2/1"
            :min-width="120"
            max-width="640"
            content-class="ratio-content"
        >
            <template #additional>
                <span class="ratio-label">additional 标记层</span>
            </template>
            <div class="completion-window-card">2 : 1 的内容区域</div>
        </u-responsive>
        <u-responsive :width="180" :height="90" inline>
            <template #default="{ ratio }">
                <div class="completion-window-card is-small">宽高推导：{{ ratio }} : 1</div>
            </template>
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
.completion-window-card.is-small {
    min-height: 0;
    height: 100%;
    padding: 12px;
}
.ratio-label {
    position: absolute;
    inset: 8px auto auto 8px;
    color: var(--muted);
    font-size: 12px;
}
</style>
