<script setup>
import { UList, UListItem, UListSubheader } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UListSubheader">
        <u-list><u-list-subheader>当前工作区</u-list-subheader><u-list-item title="设计工作区" /><u-list-subheader>归档</u-list-subheader><u-list-item title="历史工作区" disabled /></u-list>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
