<script setup>
import { ref } from 'vue';
import { UPicker } from '../../index';
const items = Array.from({ length: 60 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: index % 2 ? '设计' : '开发',
    count: (index * 7) % 31,
}));
const chosen = ref('设计');
</script>

<template>
    <div class="component-demo" data-demo-component="UPicker">
        <u-picker v-model="chosen" :items="['设计', '开发', '文档']" class="mt-4" />
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
