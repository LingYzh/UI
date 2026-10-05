<script setup lang="ts">
import { computed } from 'vue';
import { useAppLayout } from './layout-completion';
const layout = useAppLayout();
const style = computed(() => {
    const offsets = layout?.offsets.value ?? { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        '--ui-app-top': `${offsets.top}px`,
        '--ui-app-right': `${offsets.right}px`,
        '--ui-app-bottom': `${offsets.bottom}px`,
        '--ui-app-left': `${offsets.left}px`
    };
});
</script>

<template>
    <main class="ui-main" :style="style"><slot /></main>
</template>
