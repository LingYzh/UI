<script setup>
import { ref } from 'vue';
import { UButton, UProgressCircular } from '../../index';
const progress = ref(40);
</script>

<template>
    <div class="component-demo" data-demo-component="UProgressCircular">
        <div class="demo-row">
            <u-progress-circular :model-value="progress" label="确定进度" v-slot="{ value }">
                {{ value }}
            </u-progress-circular>
            <u-progress-circular indeterminate label="处理中" />
            <u-button size="sm" @click="progress = (progress + 20) % 120">增加进度</u-button>
        </div>
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
