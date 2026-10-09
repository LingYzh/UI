<script setup lang="ts">
import type { RippleOptions } from './ripple';
import UiButton from './UiButton.vue';
import UiTooltip from './UiTooltip.vue';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';

export interface MessageActionItem {
    id: string;
    icon: IconValue;
    label: string;
    disabled?: boolean;
}
withDefaults(defineProps<{ label: string; actions: MessageActionItem[] } & { ripple?: RippleOptions }>(), { ripple: true });
const emit = defineEmits<{ action: [id: string] }>();
</script>

<template>
    <div class="ui-message-actions">
        <UiTooltip v-for="item in actions" :key="item.id" :text="item.label" :focusable="false"><UiButton variant="text" size="sm" icon :aria-label="item.label" :disabled="item.disabled" :ripple="ripple" @click="emit('action', item.id)"><Icon :icon="item.icon" :size="16" /></UiButton></UiTooltip>
        <span class="ui-message-actions-label">{{ label }}</span>
    </div>
</template>
