<script setup lang="ts">
import { useDefaults } from './defaults';
import { dimensionStyles, type DimensionProps } from './dimensions';
const rawProps = withDefaults(defineProps<DimensionProps & { fluid?: boolean; tag?: string }>(), { tag: 'div' });
const props = useDefaults(rawProps, 'UContainer');
</script>

<template>
    <component :is="props.tag" class="ui-container" :class="{ 'is-fluid': props.fluid }" :style="dimensionStyles(props)"><slot /></component>
</template>
