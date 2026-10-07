<script setup lang="ts">
import { Transition } from 'vue';
import { useReducedMotion } from './motion';
import { useExpandMotion } from './expand-motion';
const props = withDefaults(defineProps<{ variant?: 'fade' | 'scale' | 'slide-x' | 'slide-y' | 'expand'; mode?: 'in-out' | 'out-in' | 'default'; appear?: boolean; disabled?: boolean }>(), { variant: 'fade' });
const reduced = useReducedMotion();
const expand = useExpandMotion(() => !!props.disabled || reduced.value);
const inertStates = new WeakMap<Element, string | null>();
function beforeLeave(element: Element) { inertStates.set(element, element.getAttribute('inert')); element.setAttribute('inert', ''); }
function restoreInert(element: Element) {
    if (!inertStates.has(element)) return;
    const previous = inertStates.get(element);
    if (previous === null) element.removeAttribute('inert');
    else element.setAttribute('inert', previous!);
    inertStates.delete(element);
}
</script>

<template>
    <Transition :name="`u-${props.variant}`" :mode="props.mode" :appear="props.appear" :css="props.variant !== 'expand' && !props.disabled && !reduced" @before-enter="restoreInert" @before-leave="beforeLeave" @after-leave="restoreInert" :on-enter="props.variant === 'expand' ? expand.enter : undefined" :on-leave="props.variant === 'expand' ? expand.leave : undefined" :on-enter-cancelled="props.variant === 'expand' ? expand.cancel : undefined" :on-leave-cancelled="props.variant === 'expand' ? expand.cancel : undefined"><slot /></Transition>
</template>
