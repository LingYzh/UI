<script setup lang="ts">
import { useDefaults } from './defaults';
import { provide, reactive } from 'vue';
import { createGroup, windowKey, type GroupValue } from './group-state';
import { stepperContextKey, type StepperContext } from './stepper-state';
const rawProps = defineProps<{ disabled?: boolean; mandatory?: boolean; linear?: boolean }>();
const props = useDefaults(rawProps, 'UStepper');
const model = defineModel<GroupValue | null>({ default: null });
const group = createGroup(model, { mandatory: props.mandatory ?? true, disabled: props.disabled });
const blocked = reactive(new Set<GroupValue>());
function go(value: GroupValue): void {
    if (props.disabled || blocked.has(value) || !group.values.includes(value)) return;
    if (props.linear) {
        const current = group.values.indexOf(model.value as GroupValue);
        const target = group.values.indexOf(value);
        if (target > current + 1) return;
    }
    model.value = value;
}
function move(delta: number): void {
    const current = group.values.indexOf(model.value as GroupValue);
    for (let index = current + delta; index >= 0 && index < group.values.length; index += delta) {
        if (!blocked.has(group.values[index])) { go(group.values[index]); return; }
    }
}
const context: StepperContext = { ...group, blocked, go, next: () => move(1), prev: () => move(-1) };
provide(stepperContextKey, context);
provide(windowKey, context);
defineExpose({ next: context.next, prev: context.prev, go });
</script>
<template>
    <div class="u-stepper" :class="{ 'is-disabled': props.disabled }"><slot :next="context.next" :prev="context.prev" :go="go" :model-value="model" /></div>
</template>
