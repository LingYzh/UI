<script setup lang="ts">
import UiIcon from '../components/Icon.vue';
import { useDefaults } from './defaults';
const rawProps = defineProps<{ icon?: string; title?: string; text?: string }>();
const props = useDefaults(rawProps, 'UEmptyState');
</script>

<template>
    <div class="ui-empty-state" role="status"><div v-if="props.icon || $slots.media" class="ui-empty-state-media"><slot name="media"><UiIcon v-if="props.icon" :name="props.icon" /></slot></div><strong v-if="props.title || $slots.title" class="ui-empty-state-title"><slot name="title">{{ props.title }}</slot></strong><p v-if="props.text || $slots.text" class="ui-empty-state-text"><slot name="text">{{ props.text }}</slot></p><div v-if="$slots.actions" class="ui-empty-state-actions"><slot name="actions" /></div></div>
</template>
