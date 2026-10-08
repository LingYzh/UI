<script setup>
import { ref } from 'vue';
import { UButton, UCard, USkeletonLoader } from '../../index';
const loading = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="USkeletonLoader">
        <u-skeleton-loader type="avatar" />
        <u-skeleton-loader :lines="3" />
        <u-button @click="loading = !loading">{{ loading ? '显示内容' : '显示骨架' }}</u-button>
        <u-skeleton-loader type="card" :loading="loading">
            <u-card title="内容已就绪" text="有默认插槽时直接显示内容；显式 loading 才显示骨架。" />
        </u-skeleton-loader>
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
