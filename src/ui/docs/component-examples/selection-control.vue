<script setup>
import { ref } from 'vue';
import { USelectionControl } from '../../index';
const checked = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="USelectionControl">
        <u-selection-control v-model="checked" type="checkbox" label="接收通知" />
        <output>当前值：{{ checked }}</output>
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
