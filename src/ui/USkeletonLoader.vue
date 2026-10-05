<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ type?: 'text' | 'avatar' | 'button' | 'card'; lines?: number; width?: string; height?: string; loading?: boolean }>(), { type: 'text', lines: 1, loading: true });
const props = useDefaults(rawProps, 'USkeletonLoader');
</script>

<template>
    <div v-if="props.loading" class="ui-skeleton-loader" :data-type="props.type" :style="{ width: props.width, height: props.height }" role="status" aria-label="Loading"><span v-for="line in props.type === 'text' ? props.lines : 1" :key="line" class="ui-skeleton-line" /></div><slot v-else />
</template>
