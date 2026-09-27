<script setup lang="ts">
import UiButton from './UiButton.vue';
import UiTooltip from './UiTooltip.vue';
import Icon from '../components/Icon.vue';

export interface MessageActionItem {
    id: string;
    icon: string;
    label: string;
    disabled?: boolean;
}
defineProps<{ label: string; actions: MessageActionItem[] }>();
const emit = defineEmits<{ action: [id: string] }>();
</script>

<template>
    <div class="ui-message-actions">
        <UiTooltip v-for="item in actions" :key="item.id" :text="item.label" :focusable="false"><UiButton variant="ghost" size="sm" icon :aria-label="item.label" :disabled="item.disabled" :ripple="false" @click="emit('action', item.id)"><Icon :name="item.icon" :size="16" /></UiButton></UiTooltip>
        <span class="ui-message-actions-label">{{ label }}</span>
    </div>
</template>
