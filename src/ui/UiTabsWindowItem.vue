<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { computed, inject, onBeforeUnmount, ref, useId, watch } from 'vue';
import { tabsWindowKey, type TabValue } from './tabs';

const props = defineProps<{ value?: TabValue; eager?: boolean }>();
const context = inject(tabsWindowKey);
if (!context) throw new Error('UiTabsWindowItem must be used inside UiTabsWindow.');
const ticketId = useId();
context.entries.push({ id: ticketId });
const value = computed(() => props.value ?? context.entries.findIndex(entry => entry.id === ticketId));
const active = computed(() => context.model.value === value.value);
const visited = ref(false);
watch(active, value => { if (value) visited.value = true; }, { immediate: true });
onBeforeUnmount(() => { const index = context.entries.findIndex(entry => entry.id === ticketId); if (index >= 0) context.entries.splice(index, 1); });
</script>

<template>
    <div v-focus-modality v-show="active" :id="`${context.prefix.value}-panel-${context.token(value)}`" :data-ui-panel="ticketId" class="ui-tab-panel ui-tabs-window-item" :class="{ 'is-active': active }" role="tabpanel" :aria-labelledby="`${context.prefix.value}-tab-${context.token(value)}`" tabindex="0">
        <slot v-if="eager || visited" />
    </div>
</template>
