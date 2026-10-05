<script setup>
import { UList, UListGroup, UListItem } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UListGroup">
        <u-list><u-list-group value="settings" title="配置"><u-list-item value="models" title="模型配置" /><u-list-item value="permissions" title="权限配置" /></u-list-group></u-list>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
