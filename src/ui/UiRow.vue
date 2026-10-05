<script setup lang="ts">
import type { LayoutDensity } from './layout';
withDefaults(defineProps<{
    tag?: string;
    size?: number;
    density?: LayoutDensity;
    noGutters?: boolean;
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}>(), { tag: 'div', size: 12, density: 'default', align: 'stretch', justify: 'start' });
</script>

<template>
    <component :is="tag" class="ui-row" :data-density="density" :class="{ 'has-no-gutters': noGutters }"
        :style="{ '--ui-grid-size': Number.isFinite(size) && size > 0 ? size : 12, alignItems: align, justifyContent: justify }"><slot /></component>
</template>
