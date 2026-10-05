<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import { stepperContextKey } from './stepper-state';
import type { GroupValue } from './group-state';
import { vPointerBlur } from './pointer-focus';
const rawProps = defineProps<{ value: GroupValue; title?: string; complete?: boolean; error?: boolean; editable?: boolean; disabled?: boolean }>();
const props = useDefaults(rawProps, 'UStepperItem');
const stepper = inject(stepperContextKey, undefined);
const unregister = stepper?.register(props.value);
watch(() => props.disabled, (disabled) => { if (disabled) stepper?.blocked.add(props.value); else stepper?.blocked.delete(props.value); }, { immediate: true });
onBeforeUnmount(() => { unregister?.(); stepper?.blocked.delete(props.value); });
const active = computed(() => stepper?.isSelected(props.value) ?? false);
const canActivate = computed(() => !props.disabled && (props.editable || active.value || !stepper?.mandatory));
</script>
<template>
    <button v-pointer-blur type="button" class="u-stepper-item" :class="{ 'is-active': active, 'is-complete': props.complete, 'is-error': props.error }" :aria-current="active ? 'step' : undefined" :disabled="!canActivate" @click="stepper?.go(props.value)"><span class="u-stepper-number" aria-hidden="true">{{ props.error ? '!' : props.complete ? '✓' : props.value }}</span><span class="u-stepper-copy"><slot :active="active" :complete="props.complete">{{ props.title }}</slot></span></button>
</template>
