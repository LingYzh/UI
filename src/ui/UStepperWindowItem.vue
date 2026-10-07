<script setup lang="ts">
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import { inject } from 'vue';
import { stepperContextKey } from './stepper-state';
import type { GroupValue } from './group-state';
const rawProps = defineProps<{ value: GroupValue; eager?: boolean }>();
const props = useDefaults(rawProps, 'UStepperWindowItem');
const stepper = inject(stepperContextKey, undefined);
</script>
<template>
    <UTransition variant="fade"><div v-if="props.eager || stepper?.isSelected(props.value)" v-show="stepper?.isSelected(props.value)" class="u-stepper-window-item"><slot /></div></UTransition>
</template>
