<script setup lang="ts">
import { useDefaults } from './defaults';
import UStepper from './UStepper.vue';
import type { GroupValue } from './group-state';
const rawProps = defineProps<{ disabled?: boolean; mandatory?: boolean; linear?: boolean }>();
const props = useDefaults(rawProps, 'UStepperVertical');
const model = defineModel<GroupValue | null>({ default: null });
</script>
<template>
    <UStepper v-model="model" v-bind="props" class="u-stepper-vertical"><template #default="scope"><slot v-bind="scope" /></template></UStepper>
</template>
