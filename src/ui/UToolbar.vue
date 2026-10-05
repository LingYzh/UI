<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ density?: 'default' | 'comfortable' | 'compact'; color?: string }>(), { density: 'default' });
const props = useDefaults(rawProps, 'UToolbar');
</script>

<template>
    <div class="ui-toolbar" :data-density="props.density" :style="{ background: props.color }" role="toolbar"><slot /></div>
</template>
