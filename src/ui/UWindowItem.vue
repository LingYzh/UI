<script setup lang="ts">
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import UiMaybeTransition from './UiMaybeTransition.vue';
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { windowContextKey } from './window-state';
import type { GroupValue } from './group-state';
const rawProps = withDefaults(defineProps<{ value: GroupValue; eager?: boolean; disabled?: boolean; transition?: boolean | string; reverseTransition?: boolean | string }>(), { eager: undefined, transition: undefined, reverseTransition: undefined });
const props = useDefaults(rawProps, 'UWindowItem');
const emit = defineEmits<{ 'group:selected': [value: { value: boolean }] }>();
const context = inject(windowContextKey, undefined);
const selectedTransition = computed(() => context?.direction.value === 'backward' ? props.reverseTransition ?? props.transition : props.transition);
const customTransition = computed(() => typeof selectedTransition.value === 'string' || selectedTransition.value === false);
const inertBeforeLeave = new WeakMap<HTMLElement, boolean>();
function restoreInert(element: HTMLElement) { if (inertBeforeLeave.has(element)) { element.inert = inertBeforeLeave.get(element)!; inertBeforeLeave.delete(element); } }
const transitionBindings = computed(() => customTransition.value ? {
    transition: selectedTransition.value,
    onBeforeLeave: (element: HTMLElement) => { inertBeforeLeave.set(element, element.inert); element.inert = true; },
    onBeforeEnter: restoreInert,
    onLeaveCancelled: restoreInert
} : { variant: context?.orientation?.value === 'vertical' ? 'slide-y' : 'slide-x' });
const isSelected = computed(() => context?.isSelected(props.value) ?? false);
const eager = computed(() => props.eager ?? context?.eager?.value ?? false);
const hasContent = ref(eager.value || isSelected.value);
watch([eager, isSelected], ([isEager, selected], previous) => {
    if (isEager || selected) hasContent.value = true;
    else if (previous?.[0] && !previous[1]) hasContent.value = false;
});
watch(isSelected, value => emit('group:selected', { value }));
function afterLeave(element: HTMLElement) {
    if (customTransition.value) restoreInert(element);
    if (!eager.value && !isSelected.value) hasContent.value = false;
}
let unregister = context?.register(props.value, () => props.disabled);
watch(() => props.value, (current, previous) => { if (current === previous) return; unregister?.(); unregister = context?.register(current, () => props.disabled); });
onBeforeUnmount(() => unregister?.());
</script>
<template>
    <component :is="customTransition ? UiMaybeTransition : UTransition" :key="props.value" v-bind="transitionBindings" @after-leave="afterLeave"><div v-if="hasContent" v-show="isSelected" class="u-window-item" :data-direction="context?.direction.value"><slot /></div></component>
</template>
