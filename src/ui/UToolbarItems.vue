<script setup lang="ts">
import { provideDefaults, useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ color?: string; variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain' }>(), { variant: 'text' });
const props = useDefaults(rawProps, 'UToolbarItems');
provideDefaults(() => ({ UButton: { variant: props.variant, ...(props.color ? { color: props.color } : {}) } }));
</script>

<template>
    <div class="ui-toolbar-items"><slot /></div>
</template>
