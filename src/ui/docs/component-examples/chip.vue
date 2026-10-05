<script setup>
import { ref } from 'vue';
import { UButton, UChip } from '../../index';
const visible = ref(true);
</script>

<template>
    <div class="component-demo" data-demo-component="UChip">
        <u-chip closable tone="accent" @close="visible = false" v-if="visible">组件文档</u-chip><u-button v-else size="sm" @click="visible = true">恢复标签</u-button>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
