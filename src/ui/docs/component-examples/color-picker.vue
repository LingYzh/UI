<script setup>
import { ref } from 'vue';
import { UColorPicker } from '../../index';
const color = ref('#bd6749');
</script>

<template>
    <div class="component-demo" data-demo-component="UColorPicker">
        <u-color-picker v-model="color" label="颜色编辑器" :swatches="['#bd6749', '#679775', '#627ca0', '#8b739e']" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
