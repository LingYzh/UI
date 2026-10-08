<script setup lang="ts">
import { useDefaults } from './defaults';
import { provide } from 'vue';
import { timelineKey } from './timeline-state';
const rawProps = withDefaults(defineProps<{ side?: 'start' | 'end' | 'alternate'; reverse?: boolean; direction?: 'vertical' | 'horizontal'; align?: 'center' | 'start'; justify?: 'auto' | 'center' }>(), { side: 'alternate', direction: 'vertical', align: 'center', justify: 'auto' });
const props = useDefaults(rawProps, 'UTimeline');
let index = 0;
provide(timelineKey, { register: () => index++, get side() { return props.side; }, get reverse() { return !!props.reverse; }, get direction() { return props.direction; } });
</script>
<template>
    <div class="u-timeline" :class="{ 'is-reverse': props.reverse, 'is-horizontal': props.direction === 'horizontal' }" :data-side="props.side" :data-align="props.align" :data-justify="props.justify"><slot /></div>
</template>
