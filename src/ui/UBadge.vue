<script setup lang="ts">
import { computed } from 'vue';
import UTransition from './UTransition.vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ content?: string | number; dot?: boolean; max?: number; color?: string; location?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; offsetX?: number; offsetY?: number; modelValue?: boolean; inline?: boolean }>(), { dot: false, max: 99, location: 'top-right', offsetX: 0, offsetY: 0, modelValue: true, inline: false });
const props = useDefaults(rawProps, 'UBadge');
const label = computed(() => typeof props.content === 'number' && props.content > props.max ? `${props.max}+` : String(props.content ?? ''));
</script>

<template>
    <span class="ui-attached-badge" :class="{ 'is-inline': props.inline }"><slot /><UTransition variant="fade"><span v-if="props.modelValue" class="ui-attached-badge-content" :class="{ 'is-dot': props.dot }" :data-location="props.location" :style="{ background: props.color, '--ui-badge-offset-x': props.offsetX + 'px', '--ui-badge-offset-y': props.offsetY + 'px' }" :aria-label="props.dot ? '有新消息' : label">{{ props.dot ? '' : label }}</span></UTransition></span>
</template>
