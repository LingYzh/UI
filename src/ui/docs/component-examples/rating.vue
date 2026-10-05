<script setup>
import { ref } from 'vue';
import { URating } from '../../index';
const rating = ref(3);
</script>

<template>
    <div class="component-demo" data-demo-component="URating">
        <u-rating v-model="rating" label="完成质量" clearable />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
