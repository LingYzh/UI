<script setup>
import { ref } from 'vue';
import { UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels } from '../../index';
const panel = ref('overview');
</script>

<template>
    <div class="component-demo" data-demo-component="UExpansionPanel">
        <u-expansion-panels v-model="panel"><u-expansion-panel value="overview"><u-expansion-panel-title>组件说明</u-expansion-panel-title><u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text></u-expansion-panel><u-expansion-panel value="details"><u-expansion-panel-title>更多说明</u-expansion-panel-title><u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text></u-expansion-panel></u-expansion-panels>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
