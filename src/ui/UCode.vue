<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = defineProps<{ tag?: string }>();
const props = useDefaults(rawProps, 'UCode');
</script>

<template>
    <component :is="props.tag || 'code'" class="u-code"><slot /></component>
</template>
