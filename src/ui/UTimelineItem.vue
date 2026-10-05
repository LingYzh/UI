<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, inject } from 'vue';
import { timelineKey } from './timeline-state';
const rawProps = defineProps<{ title?: string; subtitle?: string; side?: 'start' | 'end'; color?: string }>();
const props = useDefaults(rawProps, 'UTimelineItem');
const timeline = inject(timelineKey, undefined);
const index = timeline?.register() ?? 0;
const side = computed(() => props.side ?? (timeline?.side === 'alternate' ? (index % 2 === 0 ? 'start' : 'end') : timeline?.side ?? 'start'));
</script>
<template>
    <article class="u-timeline-item" :data-side="side"><div class="u-timeline-marker" :style="{ background: props.color || 'var(--accent)' }"><slot name="icon" /></div><div class="u-timeline-content"><h4 v-if="props.title">{{ props.title }}</h4><p v-if="props.subtitle" class="u-timeline-subtitle">{{ props.subtitle }}</p><slot :index="index" :side="side" /></div><div class="u-timeline-opposite"><slot name="opposite" /></div></article>
</template>
