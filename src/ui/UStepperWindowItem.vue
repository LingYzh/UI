<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { useDefaults } from './defaults';
import UiMaybeTransition from './UiMaybeTransition.vue';
import UWindowItem from './UWindowItem.vue';
import { stepperContextKey } from './stepper-state';
import type { GroupValue } from './group-state';
import { windowContextKey } from './window-state';
import { stepperWindowContextKey, stepperWindowItemId, type StepperWindowRegistration } from './stepper-window-context';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    value?: GroupValue;
    eager?: boolean;
    disabled?: boolean;
    transition?: boolean | string;
    reverseTransition?: boolean | string;
}>(), { eager: undefined, disabled: false, transition: undefined, reverseTransition: undefined });
const props = useDefaults(rawProps, 'UStepperWindowItem');
const emit = defineEmits<{ 'group:selected': [value: { value: boolean }] }>();
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
const selectedTransition = computed(() => window?.direction.value === 'backward'
    ? props.reverseTransition ?? props.transition
    : props.transition);

function forwardGroupSelected(value: { value: boolean }): void {
    emit('group:selected', value);
}

watch(isSelected, value => {
    if (!window) emit('group:selected', { value });
});
</script>

<template>
    <span v-if="stepperWindow" ref="marker" hidden aria-hidden="true" :data-stepper-window-item-id="id" :data-stepper-window-item-value="resolvedValue" />
    <UWindowItem
        v-if="window"
        :key="resolvedValue"
        :value="resolvedValue"
        :eager="props.eager"
        :disabled="props.disabled"
        :transition="props.transition"
        :reverse-transition="props.reverseTransition"
        @group:selected="forwardGroupSelected"
    >
        <div class="u-stepper-window-item" v-bind="attrs"><slot /></div>
    </UWindowItem>
    <UiMaybeTransition v-else :transition="selectedTransition ?? 'fade-transition'">
        <div v-if="props.eager || isSelected" v-show="isSelected" class="u-stepper-window-item" v-bind="attrs"><slot /></div>
    </UiMaybeTransition>
</template>
