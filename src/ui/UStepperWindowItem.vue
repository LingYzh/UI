<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, ref, useAttrs } from 'vue';
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import UWindowItem from './UWindowItem.vue';
import { stepperContextKey } from './stepper-state';
import type { GroupValue } from './group-state';
import { windowContextKey } from './window-state';
import { stepperWindowContextKey, stepperWindowItemId, type StepperWindowRegistration } from './stepper-window-context';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{ value?: GroupValue; eager?: boolean; disabled?: boolean }>(), { eager: undefined, disabled: false });
const props = useDefaults(rawProps, 'UStepperWindowItem');
const attrs = useAttrs();
const stepper = inject(stepperContextKey, undefined);
const window = inject(windowContextKey, undefined);
const stepperWindow = inject(stepperWindowContextKey, undefined);
const instance = getCurrentInstance();
const id = stepperWindowItemId(instance?.vnode.key, instance?.uid ?? 0);
const standaloneIndex = window?.values.length ?? stepper?.values.length ?? 0;
const marker = ref<HTMLElement>();
let registration: StepperWindowRegistration | undefined;

const resolvedValue = computed<GroupValue>(() => {
    if (props.value != null) return props.value;
    if (registration) return registration.index.value;
    return standaloneIndex;
});

if (window && stepperWindow) {
    registration = stepperWindow.register(id, () => resolvedValue.value, window, () => marker.value);
}
onBeforeUnmount(() => registration?.release());

const isSelected = computed(() => stepper?.isSelected(resolvedValue.value) ?? false);
</script>

<template>
    <span v-if="stepperWindow" ref="marker" hidden aria-hidden="true" :data-stepper-window-item-id="id" :data-stepper-window-item-value="resolvedValue" />
    <UWindowItem v-if="window" :key="resolvedValue" :value="resolvedValue" :eager="props.eager" :disabled="props.disabled">
        <div class="u-stepper-window-item" v-bind="attrs"><slot /></div>
    </UWindowItem>
    <UTransition v-else variant="fade">
        <div v-if="props.eager || isSelected" v-show="isSelected" class="u-stepper-window-item" v-bind="attrs"><slot /></div>
    </UTransition>
</template>
