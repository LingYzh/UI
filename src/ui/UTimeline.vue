<script setup lang="ts">
import { useDefaults } from './defaults';
import { provide } from 'vue';
import { timelineKey } from './timeline-state';
const rawProps = withDefaults(defineProps<{ side?: 'start' | 'end' | 'alternate'; reverse?: boolean }>(), { side: 'alternate' });
const props = useDefaults(rawProps, 'UTimeline');
let index = 0;
provide(timelineKey, { register: () => index++, side: props.side, reverse: !!props.reverse });
</script>
<template>
    <div class="u-timeline" :class="{ 'is-reverse': props.reverse }" :data-side="props.side"><slot /></div>
</template>
