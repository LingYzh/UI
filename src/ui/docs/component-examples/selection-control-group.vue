<script setup>
import { ref } from 'vue';
import { USelectionControl, USelectionControlGroup } from '../../index';
const checks = ref(['a']);
</script>

<template>
    <div class="component-demo" data-demo-component="USelectionControlGroup">
        <u-selection-control-group v-model="checks" multiple label="自定义选择组" direction="row">
            <u-selection-control value="a" label="测试" />
            <u-selection-control value="b" label="文档" />
        </u-selection-control-group>
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
