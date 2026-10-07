<script setup>
import { ref } from 'vue';
import { UDefaultsProvider, UTextField } from '../../index';
const text = ref('');
</script>

<template>
    <div class="component-demo" data-demo-component="UDefaultsProvider">
        <u-defaults-provider :defaults="{ UTextField: { density: 'compact', variant: 'filled' } }">
            <u-text-field
                v-model="text"
                label="继承紧凑、填充样式"
                hint="默认配置只作用于这个容器。"
            />
        </u-defaults-provider>
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
