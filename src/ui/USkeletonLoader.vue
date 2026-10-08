<script setup lang="ts">
import { computed, h, useSlots } from 'vue';
import { useDefaults } from './defaults';
import { buildSkeletonTree, type SkeletonNode } from './skeleton';
const rawProps = withDefaults(defineProps<{ type?: string | readonly string[]; types?: Readonly<Record<string, string>>; lines?: number; width?: number | string; height?: number | string; loading?: boolean; boilerplate?: boolean; loadingText?: string }>(), { type: 'text', lines: 1, loading: false, loadingText: 'Loading' });
const props = useDefaults(rawProps, 'USkeletonLoader');
const slots = useSlots();
const loading = computed(() => !slots.default || props.loading);
const unit = (value: number | string | undefined) => typeof value === 'number' ? `${value}px` : value;
const tree = computed(() => buildSkeletonTree(props.type === 'text' && props.lines > 1 ? `text@${Math.max(1, Math.min(100, props.lines))}` : props.type, { types: props.types }));
function bone(node: SkeletonNode): ReturnType<typeof h> {
    return h('div', { class: ['ui-skeleton-bone', `ui-skeleton-${node.type}`, { 'ui-skeleton-line': !node.children.length }] }, node.children.map(bone));
}
function renderBones() { return tree.value.map(bone); }
</script>

<template>
    <div v-if="loading" class="ui-skeleton-loader" :class="{ 'is-boilerplate': props.boilerplate }" :data-type="Array.isArray(props.type) ? props.type.join(',') : props.type" :style="{ width: unit(props.width), height: unit(props.height) }" :role="props.boilerplate ? undefined : 'status'" :aria-label="props.boilerplate ? undefined : props.loadingText" :aria-live="props.boilerplate ? undefined : 'polite'"><component :is="renderBones" /></div><slot v-else />
</template>
