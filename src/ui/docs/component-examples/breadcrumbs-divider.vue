<script setup>
import { UBreadcrumbsDivider } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UBreadcrumbsDivider">
        <ol class="demo-row"><li>文档</li><u-breadcrumbs-divider /><li>当前项目</li></ol>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
