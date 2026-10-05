<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, onBeforeUnmount, provide, useId, watch } from 'vue';
import { expansionKey, useGroup, type GroupValue } from './group-state';
import { expansionPanelKey } from './expansion-state';
const rawProps = defineProps<{ value?: GroupValue; disabled?: boolean }>();
const props = useDefaults(rawProps, 'UExpansionPanel');
const fallback = useId();
const value = computed(() => props.value ?? fallback);
const group = useGroup(expansionKey);
let unregister = group?.register(value.value);
watch(value, (current, previous) => { if (current === previous) return; unregister?.(); unregister = group?.register(current); });
onBeforeUnmount(() => unregister?.());
const context = { get value() { return value.value; }, open: () => group?.isSelected(value.value) ?? false, toggle: () => { if (!props.disabled) group?.select(value.value); }, disabled: () => !!props.disabled || !!group?.disabled, titleId: `${fallback}-title`, textId: `${fallback}-text` };
provide(expansionPanelKey, context);
</script>
<template>
    <section class="u-expansion-panel" :class="{ 'is-open': context.open(), 'is-disabled': context.disabled() }"><slot :open="context.open()" :toggle="context.toggle" /></section>
</template>
