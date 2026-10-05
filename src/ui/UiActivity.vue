<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { useId } from 'vue';
import UiCollapse from './UiCollapse.vue';
import UiScrollArea from './UiScrollArea.vue';
import Icon from '../components/Icon.vue';
withDefaults(defineProps<{ title: string; status?: string; tone?: 'neutral' | 'busy' | 'error' | 'success'; scrollable?: boolean; variant?: 'default' | 'inline'; icon?: string; filename?: string; added?: number; removed?: number }>(), { scrollable: true, variant: 'default' });
const open = defineModel<boolean>('open', { default: false });
const contentId = useId();
</script>

<template>
    <section class="ui-activity" :class="{ 'is-inline': variant === 'inline' }" :data-tone="tone || 'neutral'">
        <button v-pointer-blur type="button" class="ui-activity-heading" :aria-expanded="open" :aria-controls="contentId" @click="open = !open">
            <Icon v-if="variant === 'inline'" :name="icon || 'terminal'" :size="15" />
            <svg v-else class="ui-activity-chevron" :class="{ 'is-open': open }" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 4 4 4-4 4" /></svg>
            <span class="ui-activity-title">{{ title }}</span><span v-if="variant === 'inline' && filename" class="ui-activity-filename" :title="filename">{{ filename }}</span><span v-if="status" class="ui-activity-status">{{ status }}</span>
            <span v-if="variant === 'inline' && added !== undefined" class="ui-activity-added">+{{ added }}</span><span v-if="variant === 'inline' && removed !== undefined" class="ui-activity-removed">−{{ removed }}</span>
            <svg v-if="variant === 'inline'" class="ui-activity-chevron" :class="{ 'is-open': open }" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 4 4 4-4 4" /></svg>
        </button>
        <UiCollapse :id="contentId" :open="open"><div class="ui-activity-body"><UiScrollArea v-if="scrollable" :label="title" max-height="320px"><div class="ui-activity-content"><slot /></div></UiScrollArea><div v-else class="ui-activity-content"><slot /></div><div v-if="$slots.actions" class="ui-activity-actions"><slot name="actions" /></div></div></UiCollapse>
    </section>
</template>
