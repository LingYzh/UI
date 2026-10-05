<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ fluid?: boolean; tag?: string }>(), { tag: 'div' });
const props = useDefaults(rawProps, 'UContainer');
</script>

<template>
    <component :is="props.tag" class="ui-container" :class="{ 'is-fluid': props.fluid }"><slot /></component>
</template>
