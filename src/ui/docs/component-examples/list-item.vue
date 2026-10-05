<script setup>
import { ref } from 'vue';
import { UList, UListItem } from '../../index';
const selected = ref('overview');
</script>

<template>
    <div class="component-demo" data-demo-component="UListItem">
        <u-list v-model="selected"><u-list-item value="overview" title="概览" subtitle="项目运行状况" /><u-list-item value="settings" title="设置" /><u-list-item value="disabled" title="归档" disabled /></u-list><output>已选：{{ selected }}</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
