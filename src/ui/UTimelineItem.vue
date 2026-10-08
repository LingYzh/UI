<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, inject } from 'vue';
import { timelineKey } from './timeline-state';
import UiIcon from '../components/Icon.vue';
const rawProps = defineProps<{ title?: string; subtitle?: string; side?: 'start' | 'end'; color?: string; hideDot?: boolean; icon?: string; dotColor?: string; iconColor?: string; size?: number | string }>();
const props = useDefaults(rawProps, 'UTimelineItem');
const timeline = inject(timelineKey, undefined);
const index = timeline?.register() ?? 0;
const side = computed(() => props.side ?? (timeline?.side === 'alternate' ? (index % 2 === 0 ? 'start' : 'end') : timeline?.side ?? 'start'));
</script>
<template>
    <article class="u-timeline-item" :data-side="side"><div v-if="!props.hideDot" class="u-timeline-marker" :class="{ 'has-icon': props.icon || $slots.icon }" :style="{ background: props.dotColor || props.color || 'var(--accent)', color: props.iconColor, width: typeof props.size === 'number' ? props.size + 'px' : props.size, height: typeof props.size === 'number' ? props.size + 'px' : props.size }"><slot name="icon"><UiIcon v-if="props.icon" :icon="props.icon" :size="14" /></slot></div><div class="u-timeline-content"><h4 v-if="props.title">{{ props.title }}</h4><p v-if="props.subtitle" class="u-timeline-subtitle">{{ props.subtitle }}</p><slot :index="index" :side="side" /></div><div class="u-timeline-opposite"><slot name="opposite" /></div></article>
</template>
