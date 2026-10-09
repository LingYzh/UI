<script setup lang="ts">
import UiIcon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
import UImg from './UImg.vue';
import { computed } from 'vue';
import type { RouterProps } from './router';
import { dimensionLength, dimensionStyles, type DimensionProps } from './dimensions';
const rawProps = withDefaults(defineProps<{
    icon?: IconValue; image?: string; headline?: string; title?: string; text?: string; actionText?: string;
    justify?: 'start' | 'center' | 'end'; textWidth?: number | string; size?: number | string;
} & RouterProps & DimensionProps>(), { justify: 'center', textWidth: 500 });
const props = useDefaults(rawProps, 'UEmptyState');
const emit = defineEmits<{ 'click:action': [event: MouseEvent] }>();
function action(event: MouseEvent) {
    if (props.disabled) { event.preventDefault(); return; }
    emit('click:action', event);
}
const actionProps = computed(() => ({ to: props.to, href: props.href, replace: props.replace, exact: props.exact, disabled: props.disabled, onClick: action }));
</script>

<template>
    <div class="ui-empty-state" :class="`is-justify-${props.justify}`" :style="dimensionStyles(props)" role="status"><div v-if="props.icon || props.image || $slots.media" class="ui-empty-state-media"><slot name="media"><UImg v-if="props.image" :src="props.image" :height="props.size ?? 200" /><UiIcon v-else-if="props.icon" :icon="props.icon" :size="typeof props.size === 'number' ? props.size : 48" /></slot></div><strong v-if="props.headline || $slots.headline" class="ui-empty-state-headline"><slot name="headline">{{ props.headline }}</slot></strong><strong v-if="props.title || $slots.title" class="ui-empty-state-title"><slot name="title">{{ props.title }}</slot></strong><p v-if="props.text || $slots.text" class="ui-empty-state-text" :style="{ maxWidth: dimensionLength(props.textWidth) }"><slot name="text">{{ props.text }}</slot></p><slot /><div v-if="$slots.actions || props.actionText" class="ui-empty-state-actions"><slot name="actions" :props="actionProps"><UiButton v-bind="actionProps">{{ props.actionText }}</UiButton></slot></div></div>
</template>
