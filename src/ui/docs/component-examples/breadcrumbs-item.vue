<script setup>
import { UBreadcrumbs, UBreadcrumbsItem } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UBreadcrumbsItem">
        <u-breadcrumbs aria-label="项目路径">
            <u-breadcrumbs-item href="#/overview" title="文档" />
            <u-breadcrumbs-item title="当前项目" active />
        </u-breadcrumbs>
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
