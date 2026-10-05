<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ vertical?: boolean; inset?: boolean; thickness?: number | string; color?: string }>(), { vertical: false, inset: false, thickness: 1 });
const props = useDefaults(rawProps, 'UDivider');
</script>

<template>
    <hr class="ui-divider" :class="{ 'is-vertical': props.vertical, 'is-inset': props.inset }" :style="{ borderColor: props.color, borderWidth: typeof props.thickness === 'number' ? `${props.thickness}px` : props.thickness }" />
</template>
