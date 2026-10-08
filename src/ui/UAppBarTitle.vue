<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ text?: string; tag?: string }>(), { tag: 'div' });
const props = useDefaults(rawProps, 'UAppBarTitle');
</script>
<template><component :is="props.tag" class="ui-app-bar-title"><slot name="text">{{ props.text }}</slot><slot /></component></template>
