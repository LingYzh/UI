<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ text?: string; tag?: string }>(), { tag: 'div' });
const props = useDefaults(rawProps, 'UToolbarTitle');
</script>

<template>
    <component :is="props.tag" class="ui-toolbar-title"><div class="ui-toolbar-title-placeholder"><slot name="text">{{ props.text }}</slot><slot /></div></component>
</template>
