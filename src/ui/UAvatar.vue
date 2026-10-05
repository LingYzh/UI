<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from '../components/Icon.vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ image?: string; icon?: string; text?: string; alt?: string; size?: number | string; rounded?: boolean; color?: string }>(), { size: 40, rounded: true });
const props = useDefaults(rawProps, 'UAvatar');
const dimension = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size);
</script>

<template>
    <span class="ui-avatar" :class="{ 'is-rounded': props.rounded }" :style="{ width: dimension, height: dimension, background: props.color }"><img v-if="props.image" :src="props.image" :alt="props.alt ?? props.text ?? ''" /><UiIcon v-else-if="props.icon" :name="props.icon" :label="props.alt" /><span v-else><slot>{{ props.text }}</slot></span></span>
</template>
