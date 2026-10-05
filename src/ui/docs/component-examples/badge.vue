<script setup>
import { ref } from 'vue';
import { UAvatar, UBadge, UButton } from '../../index';
const count = ref(90);
</script>

<template>
    <div class="component-demo" data-demo-component="UBadge">
        <div class="demo-row"><u-badge :content="count" :max="99"><u-button @click="count += 10">消息</u-button></u-badge><u-badge dot><u-avatar text="UI" /></u-badge></div><output>消息数：{{ count }}</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
