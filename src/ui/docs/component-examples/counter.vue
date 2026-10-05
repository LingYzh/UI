<script setup>
import { ref } from 'vue';
import { UCounter, UTextField } from '../../index';
const text = ref('');
</script>

<template>
    <div class="component-demo" data-demo-component="UCounter">
        <u-text-field v-model="text" label="名称" /><u-counter :value="text.length" :max="20" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
