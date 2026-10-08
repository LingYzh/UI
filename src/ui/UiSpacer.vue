<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ tag?: string }>(), { tag: 'div' });
const props = useDefaults(rawProps, 'USpacer');
</script>

<template>
    <component :is="props.tag" class="ui-spacer" :aria-hidden="$slots.default ? undefined : true"><slot /></component>
</template>
