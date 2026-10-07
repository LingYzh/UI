<script setup>
import { ref } from 'vue';
import { UButton, UProgressLinear } from '../../index';
const progress = ref(40);
</script>

<template>
    <div class="component-demo" data-demo-component="UProgressLinear">
        <u-progress-linear :model-value="progress" :buffer-value="80" label="后台执行进度" />
        <u-progress-linear indeterminate label="等待服务" />
        <u-button size="sm" @click="progress = (progress + 20) % 120">增加进度</u-button>
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
