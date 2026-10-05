<script setup lang="ts">
import { useDefaults } from './defaults';
import { createGroup, expansionKey, provideGroup, type GroupValue } from './group-state';
const rawProps = defineProps<{ multiple?: boolean; mandatory?: boolean; disabled?: boolean }>();
const props = useDefaults(rawProps, 'UExpansionPanels');
const model = defineModel<GroupValue | GroupValue[] | null>({ default: null });
const group = createGroup(model, props);
provideGroup(expansionKey, group);
</script>
<template>
    <div class="u-expansion-panels" :class="{ 'is-disabled': props.disabled }"><slot /></div>
</template>
