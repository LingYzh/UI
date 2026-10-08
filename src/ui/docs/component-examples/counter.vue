<script setup>
import { ref } from 'vue';
import { UCounter, UTextField } from '../../index';
const text = ref('');
</script>

<template>
    <div class="component-demo" data-demo-component="UCounter">
        <u-text-field v-model="text" label="名称" />
        <u-counter :value="text" max="20" />
        <u-counter value="剩余 8 个名额" display-mode="value" />
        <u-counter :value="text" max="20">
            <template #default="{ counter, value }">
                {{ counter }}（原文：{{ value || '空' }}）
            </template>
        </u-counter>
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
