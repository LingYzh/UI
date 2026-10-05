<script setup>
import { USkeletonLoader } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="USkeletonLoader">
        <u-skeleton-loader type="avatar" /><u-skeleton-loader :lines="3" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
