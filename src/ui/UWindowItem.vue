<script setup lang="ts">
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import { inject, onBeforeUnmount, watch } from 'vue';
import { windowContextKey } from './window-state';
import type { GroupValue } from './group-state';
const rawProps = defineProps<{ value: GroupValue; eager?: boolean }>();
const props = useDefaults(rawProps, 'UWindowItem');
const context = inject(windowContextKey, undefined);
let unregister = context?.register(props.value);
watch(() => props.value, (current, previous) => { if (current === previous) return; unregister?.(); unregister = context?.register(current); });
onBeforeUnmount(() => unregister?.());
</script>
<template>
    <UTransition :key="props.value" variant="slide-x"><div v-if="props.eager || context?.visited.has(props.value) || context?.isSelected(props.value)" v-show="context?.isSelected(props.value)" class="u-window-item" :data-direction="context?.direction.value"><slot /></div></UTransition>
</template>
