<script setup lang="ts">
import type { LayoutDensity } from './layout';
import { computed } from 'vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{
    tag?: string;
    size?: number | string;
    gap?: number | string | (number | string)[];
    density?: LayoutDensity;
    noGutters?: boolean;
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}>(), { tag: 'div', size: 12, density: 'default' });
const props = useDefaults(rawProps, 'URow');
const gapLength = (value: number | string | undefined) => typeof value === 'number' ? `${Math.max(0, value)}px` : value;
const styles = computed(() => ({
    '--ui-grid-size': Number.isFinite(Number(props.size)) && Number(props.size) > 0 ? Number(props.size) : 12,
    '--ui-grid-gap': gapLength(Array.isArray(props.gap) ? props.gap[0] : props.gap),
    rowGap: gapLength(Array.isArray(props.gap) ? props.gap[1] ?? props.gap[0] : props.gap),
    alignItems: props.align, justifyContent: props.justify
}));
</script>

<template>
    <component :is="props.tag" class="ui-row" :data-density="props.density" :class="{ 'has-no-gutters': props.noGutters }" :style="styles"><slot /></component>
</template>
