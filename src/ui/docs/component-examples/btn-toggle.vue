<script setup>
import { ref } from 'vue';
import { UBtnToggle, UItem } from '../../index';
const selected = ref('a');
</script>

<template>
    <div class="component-demo" data-demo-component="UBtnToggle">
        <u-btn-toggle v-model="selected" mandatory><u-item value="a">概览</u-item><u-item value="b">详情</u-item></u-btn-toggle>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
