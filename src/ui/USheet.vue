<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ elevation?: number; rounded?: boolean; color?: string; border?: boolean }>(), { elevation: 0, rounded: true, border: false });
const props = useDefaults(rawProps, 'USheet');
</script>

<template>
    <div class="ui-sheet" :class="{ 'is-rounded': props.rounded, 'has-border': props.border }" :style="{ background: props.color, boxShadow: props.elevation ? `0 ${props.elevation * 2}px ${props.elevation * 6}px rgba(0, 0, 0, ${Math.min(props.elevation * .03, .2)})` : undefined }"><slot /></div>
</template>
