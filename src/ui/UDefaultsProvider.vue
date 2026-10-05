<script setup lang="ts">
import { provideDefaults, type UIDefaults } from './defaults';
const props = withDefaults(defineProps<{ defaults?: UIDefaults; reset?: boolean; disabled?: boolean }>(), { defaults: () => ({}) });
provideDefaults(() => props.disabled ? {} : props.defaults, () => !!props.reset);
</script>

<template><slot /></template>
