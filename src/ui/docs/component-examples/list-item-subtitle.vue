<script setup>
import { UList, UListItem, UListItemSubtitle, UListItemTitle } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UListItemSubtitle">
        <u-list><u-list-item><u-list-item-title>设计工作区</u-list-item-title><u-list-item-subtitle>自定义列表项标题与说明</u-list-item-subtitle></u-list-item></u-list>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
