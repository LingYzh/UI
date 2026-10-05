<script setup>
import { USparkline } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="USparkline">
        <u-sparkline :values="[12, 18, 14, 25, 22, 35, 28, 40]" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
