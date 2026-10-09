<script setup lang="ts">
import { computed, useSlots } from 'vue';
import UiIcon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { useDefaults } from './defaults';
import UBadge from './UBadge.vue';
const rawProps = withDefaults(defineProps<{ image?: string; icon?: IconValue; text?: string; alt?: string; size?: number | string; rounded?: boolean; color?: string; badge?: boolean | string | Record<string, unknown> }>(), { size: 40, rounded: true });
const props = useDefaults(rawProps, 'UAvatar');
const dimension = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size);
const slots = useSlots();
const badgeProps = computed(() => ({ dot: !slots.badge, color: typeof props.badge === 'string' ? props.badge : undefined, ...(typeof props.badge === 'object' ? props.badge : {}) }));
</script>

<template>
    <component :is="props.badge ? UBadge : 'span'" v-bind="props.badge ? badgeProps : {}">
        <span class="ui-avatar" :class="{ 'is-rounded': props.rounded }" :style="{ width: dimension, height: dimension, background: props.color }"><slot><img v-if="props.image" :src="props.image" :alt="props.alt ?? props.text ?? ''" /><UiIcon v-else-if="props.icon" :icon="props.icon" :label="props.alt" /><span v-else>{{ props.text }}</span></slot></span>
        <template v-if="$slots.badge" #badge><slot name="badge" /></template>
    </component>
</template>
