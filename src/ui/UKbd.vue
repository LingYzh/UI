<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = defineProps<{ keys?: string }>();
const props = useDefaults(rawProps, 'UKbd');
</script>
<template>
    <kbd class="u-kbd"><slot>{{ props.keys }}</slot></kbd>
</template>
