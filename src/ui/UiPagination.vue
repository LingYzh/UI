<script setup lang="ts">
import { computed, watch } from 'vue';
import UiButton from './UiButton.vue';
import { positiveInteger } from './table';
import { uiText } from './locale';
const props = withDefaults(defineProps<{ length: number; totalVisible?: number; disabled?: boolean; dense?: boolean; ghost?: boolean; rounded?: boolean; label?: string }>(), { totalVisible: 5, rounded: true, label: undefined });
const model = defineModel<number>({ default: 1 });
const count = computed(() => positiveInteger(props.length));
const current = computed(() => Math.min(count.value, positiveInteger(model.value)));
watch([model, count], () => { if (current.value !== model.value) model.value = current.value; }, { immediate: true });
const entries = computed(() => {
    const visible = Math.min(9, Math.max(3, positiveInteger(props.totalVisible, 5)));
    const start = Math.max(1, Math.min(current.value - Math.floor(visible / 2), count.value - visible + 1));
    const end = Math.min(count.value, start + visible - 1);
    const result: (number | string)[] = [];
    if (start > 1) { result.push(1); if (start > 2) result.push('before'); }
    for (let page = start; page <= end; page++) result.push(page);
    if (end < count.value) { if (end < count.value - 1) result.push('after'); result.push(count.value); }
    return result;
});
function select(page: number) { if (!props.disabled) model.value = Math.max(1, Math.min(count.value, page)); }
</script>

<template>
    <nav class="ui-pagination" :class="{ 'is-dense': dense }" :aria-label="label ?? uiText('pagination.label')">
        <UiButton icon :dense="dense" :ghost="ghost" :rounded="rounded" :disabled="disabled || current === 1" :aria-label="uiText('pagination.previous')" @click="select(current - 1)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></UiButton>
        <template v-for="entry in entries" :key="entry">
            <UiButton v-if="typeof entry === 'number'" :dense="dense" :variant="entry === current ? 'primary' : 'secondary'" :ghost="ghost && entry !== current" :rounded="rounded" :disabled="disabled" :aria-label="uiText('pagination.page', { page: entry })" :aria-current="entry === current ? 'page' : undefined" @click="select(entry)">{{ entry }}</UiButton>
            <span v-else class="ui-pagination-ellipsis" aria-hidden="true">…</span>
        </template>
        <UiButton icon :dense="dense" :ghost="ghost" :rounded="rounded" :disabled="disabled || current === count" :aria-label="uiText('pagination.next')" @click="select(current + 1)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></UiButton>
    </nav>
</template>
