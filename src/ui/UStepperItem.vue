<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import { stepperContextKey } from './stepper-state';
import type { GroupValue } from './group-state';
import { allocateStepperValue } from './stepper-selection';
import { vPointerBlur } from './pointer-focus';

type StepperRule = () => boolean | string;

const rawProps = withDefaults(defineProps<{
    value?: GroupValue;
    title?: string;
    subtitle?: string;
    icon?: string;
    complete?: boolean;
    error?: boolean;
    editable?: boolean;
    disabled?: boolean;
    rules?: readonly StepperRule[];
} & { ripple?: RippleOptions }>(), { ripple: true, rules: () => [], error: undefined, complete: undefined });
const props = useDefaults(rawProps, 'UStepperItem');
const emit = defineEmits<{ 'group:selected': [value: { value: boolean }] }>();
const stepper = inject(stepperContextKey, undefined);
const fallbackValue = allocateStepperValue(stepper?.values);
const value = computed(() => props.value ?? fallbackValue);
let registeredValue = value.value;
let unregister = stepper?.register(registeredValue, () => props.disabled);

function syncBlocked(currentValue: GroupValue, disabled: boolean | undefined): void {
    if (disabled) stepper?.blocked.add(currentValue);
    else stepper?.blocked.delete(currentValue);
}

syncBlocked(registeredValue, props.disabled);
watch(() => [value.value, props.disabled] as const, ([currentValue, disabled], [previousValue]) => {
    if (currentValue !== previousValue) {
        unregister?.();
        stepper?.blocked.delete(previousValue);
        registeredValue = currentValue;
        unregister = stepper?.register(currentValue, () => props.disabled);
    }
    syncBlocked(currentValue, disabled);
});
onBeforeUnmount(() => {
    unregister?.();
    stepper?.blocked.delete(registeredValue);
});

const active = computed(() => stepper?.isSelected(value.value) ?? false);
const ruleResults = computed(() => props.rules.map(rule => rule() === true));
const hasError = computed(() => props.error ?? ruleResults.value.some(result => !result));
const hasCompleted = computed(() => props.complete ?? (props.rules.length > 0 && ruleResults.value.every(Boolean)));
const step = computed(() => {
    const index = stepper?.values.indexOf(value.value) ?? -1;
    return index >= 0 ? index + 1 : fallbackValue;
});
const displayNumber = computed(() => props.value ?? step.value);
const canEdit = computed(() => {
    return !props.disabled && !!props.editable;
});
const canActivate = computed(() => canEdit.value && !stepper?.disabled);
const slotScope = computed(() => ({
    active: active.value,
    complete: props.complete,
    canEdit: canEdit.value,
    hasError: hasError.value,
    hasCompleted: hasCompleted.value,
    title: props.title,
    subtitle: props.subtitle,
    step: step.value,
    value: value.value
}));

watch(active, selected => emit('group:selected', { value: selected }));
</script>

<template>
    <button
        v-ripple="props.ripple"
        v-pointer-blur
        type="button"
        class="u-stepper-item"
        :class="{ 'is-active': active, 'is-complete': hasCompleted, 'is-error': hasError }"
        :aria-current="active ? 'step' : undefined"
        :disabled="!canActivate"
        @click="stepper?.go(value)"
    >
        <span class="u-stepper-number" aria-hidden="true">{{ hasError ? '!' : hasCompleted ? '✓' : displayNumber }}</span>
        <span class="u-stepper-copy">
            <slot v-bind="slotScope">
                <span v-if="props.icon" class="u-stepper-icon"><slot name="icon" :icon="props.icon">{{ props.icon }}</slot></span>
                <span v-if="props.title" class="u-stepper-title"><slot name="title" :title="props.title">{{ props.title }}</slot></span>
                <span v-if="props.subtitle" class="u-stepper-subtitle"><slot name="subtitle" :subtitle="props.subtitle">{{ props.subtitle }}</slot></span>
            </slot>
        </span>
    </button>
</template>
