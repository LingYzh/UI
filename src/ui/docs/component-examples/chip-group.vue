<script setup>
import { ref } from 'vue';
import { UChip, UChipGroup } from '../../index';
const selected = ref('a');
</script>

<template>
    <div class="component-demo" data-demo-component="UChipGroup">
        <u-chip-group v-model="selected" mandatory><u-chip value="a">概览</u-chip><u-chip value="b" closable>详情</u-chip></u-chip-group>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
