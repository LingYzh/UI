<script setup>
import { ref } from 'vue';
import { UCheckboxGroup, USelectionControl } from '../../index';
const checks = ref(['a']);
</script>

<template>
    <div class="component-demo" data-demo-component="UCheckboxGroup">
        <u-checkbox-group v-model="checks" label="多选组"><u-selection-control value="a" label="测试" /><u-selection-control value="b" label="文档" /></u-checkbox-group>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
