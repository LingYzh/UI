<script setup>
import { UVirtualScroll } from '../../index';
const items = Array.from({ length: 5000 }, (_, index) => ({ id: index, title: `项目 ${index + 1}` }));
</script>

<template>
    <div class="component-demo" data-demo-component="UVirtualScroll">
        <u-virtual-scroll :items="items" :item-height="36" :height="180" item-key="id"><template #default="{ item, index }"><div class="px-3 py-2">{{ index + 1 }} · {{ item.title }}</div></template></u-virtual-scroll>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
