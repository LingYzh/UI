<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import { stepperContextKey } from './stepper-state';
import type { GroupValue } from './group-state';
import { vPointerBlur } from './pointer-focus';
const rawProps = withDefaults(defineProps<{ value: GroupValue; title?: string; complete?: boolean; error?: boolean; editable?: boolean; disabled?: boolean } & { ripple?: RippleOptions }>(), { ripple: true });
const props = useDefaults(rawProps, 'UStepperItem');
const stepper = inject(stepperContextKey, undefined);
let registeredValue = props.value;
let unregister = stepper?.register(registeredValue, () => props.disabled);
function syncBlocked(value: GroupValue, disabled: boolean | undefined): void {
    if (disabled) stepper?.blocked.add(value);
    else stepper?.blocked.delete(value);
}
syncBlocked(registeredValue, props.disabled);
watch(() => [props.value, props.disabled] as const, ([value, disabled], [previousValue]) => {
    if (value !== previousValue) {
        unregister?.();
        stepper?.blocked.delete(previousValue);
        registeredValue = value;
        unregister = stepper?.register(value, () => props.disabled);
    }
    syncBlocked(value, disabled);
});
onBeforeUnmount(() => {
    unregister?.();
    stepper?.blocked.delete(registeredValue);
});
const active = computed(() => stepper?.isSelected(props.value) ?? false);
const canActivate = computed(() => !props.disabled && !stepper?.disabled && (props.editable || active.value || !stepper?.mandatory));
</script>
<template>
    <button v-ripple="props.ripple" v-pointer-blur type="button" class="u-stepper-item" :class="{ 'is-active': active, 'is-complete': props.complete, 'is-error': props.error }" :aria-current="active ? 'step' : undefined" :disabled="!canActivate" @click="stepper?.go(props.value)"><span class="u-stepper-number" aria-hidden="true">{{ props.error ? '!' : props.complete ? '✓' : props.value }}</span><span class="u-stepper-copy"><slot :active="active" :complete="props.complete">{{ props.title }}</slot></span></button>
</template>
