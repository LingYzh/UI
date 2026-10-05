<script setup lang="ts">
import { useDefaults } from './defaults';
import { provide, reactive, ref, watch } from 'vue';
import { createGroup, windowKey, type GroupValue } from './group-state';
import { attachWindowMotion, windowContextKey, type WindowContext } from './window-state';
const rawProps = defineProps<{ disabled?: boolean; touch?: boolean; keyboard?: boolean; continuous?: boolean; eager?: boolean; label?: string }>();
const props = useDefaults(rawProps, 'UWindow');
const model = defineModel<GroupValue | null>({ default: null });
const group = createGroup(model, { mandatory: true, disabled: props.disabled });
const direction = ref<'forward' | 'backward'>('forward');
const visited = reactive(new Set<GroupValue>());
watch(model, (value) => { if (value != null) visited.add(value); }, { immediate: true });
const context: WindowContext = { ...group, direction, visited };
provide(windowKey, context);
provide(windowContextKey, context);
function next(): void {
    const index = context.values.indexOf(model.value as GroupValue);
    if (!props.continuous && index >= context.values.length - 1) return;
    direction.value = 'forward'; context.next();
}
function prev(): void {
    const index = context.values.indexOf(model.value as GroupValue);
    if (!props.continuous && index <= 0) return;
    direction.value = 'backward'; context.prev();
}
const motion = attachWindowMotion({ ...context, next, prev }, (value) => { direction.value = value; });
defineExpose({ next, prev });
</script>
<template>
    <div class="u-window" :data-direction="direction" :aria-label="props.label" @keydown="props.keyboard !== false && motion.onKeydown($event)" @touchstart.passive="props.touch !== false && motion.onTouchStart($event)" @touchend.passive="props.touch !== false && motion.onTouchEnd($event)" @touchcancel="motion.onTouchCancel"><slot :next="next" :prev="prev" :model-value="model" /></div>
</template>
