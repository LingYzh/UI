<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, provide, ref, useAttrs } from 'vue';
import { useDefaults } from './defaults';
import type { GroupValue } from './group-state';
import UWindow from './UWindow.vue';
import { stepperContextKey } from './stepper-state';
import { createStepperWindowContext, stepperWindowContextKey } from './stepper-window-context';

type TouchHandlers = Record<string, ((...args: any[]) => void) | undefined>;
type TouchOption = boolean | TouchHandlers;

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    disabled?: boolean;
    mandatory?: boolean | 'force';
    touch?: TouchOption;
    keyboard?: boolean;
    continuous?: boolean;
    eager?: boolean;
    label?: string;
    height?: string | number;
    tag?: string;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    showArrows?: boolean | 'hover';
}>(), {
    disabled: false,
    mandatory: false,
    touch: false,
    keyboard: true,
    continuous: false,
    eager: false,
    tag: 'div',
    direction: 'horizontal',
    reverse: false,
    showArrows: false
});
const props = useDefaults(rawProps, 'UStepperWindow');
const attrs = useAttrs();
const model = defineModel<GroupValue | null>();
const stepper = inject(stepperContextKey, undefined);
const registrations = createStepperWindowContext();
const window = ref<InstanceType<typeof UWindow>>();
let observer: MutationObserver | undefined;

provide(stepperWindowContextKey, registrations);

const windowModel = computed<GroupValue | null>(() => {
    if (model.value != null) return model.value;
    const selected = stepper?.selected.value;
    if (Array.isArray(selected)) return stepper?.values.find(value => selected.includes(value)) ?? null;
    return selected ?? null;
});

function reorderItems(): void { registrations.reorder(); }

function queueReorder(): void {
    void nextTick(reorderItems);
}
onMounted(() => {
    void nextTick(() => {
        const element = window.value?.$el;
        if (typeof MutationObserver !== 'undefined' && element instanceof HTMLElement) {
            observer = new MutationObserver(queueReorder);
            observer.observe(element, { childList: true, subtree: true });
        }
        reorderItems();
    });
});
onUpdated(queueReorder);
onBeforeUnmount(() => observer?.disconnect());

function next(): void { window.value?.next(); }
function prev(): void { window.value?.prev(); }
function updateWindowModel(value: GroupValue | null): void { model.value = value; }
defineExpose({ next, prev, modelValue: windowModel });

defineSlots<{
    default?: (scope: { next: () => void; prev: () => void; modelValue: GroupValue | null; group: unknown }) => any;
    prev?: (scope: { props: Record<string, unknown> }) => any;
    next?: (scope: { props: Record<string, unknown> }) => any;
}>();
</script>

<template>
    <UWindow
        ref="window"
        :model-value="windowModel"
        :disabled="props.disabled"
        :mandatory="props.mandatory"
        :touch="props.touch"
        :keyboard="props.keyboard"
        :continuous="props.continuous"
        :eager="props.eager"
        :label="props.label"
        :height="props.height"
        :tag="props.tag"
        :direction="props.direction"
        :reverse="props.reverse"
        :show-arrows="props.showArrows"
        v-bind="attrs"
        class="u-stepper-window"
        @update:model-value="updateWindowModel"
    >
        <template #default="scope"><slot v-bind="{ ...scope, modelValue: windowModel }" /></template>
        <template v-if="$slots.prev" #prev="slotScope"><slot name="prev" v-bind="slotScope" /></template>
        <template v-if="$slots.next" #next="slotScope"><slot name="next" v-bind="slotScope" /></template>
    </UWindow>
</template>
