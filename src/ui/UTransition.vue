<script setup lang="ts">
import { Transition } from 'vue';
import { useReducedMotion } from './motion';
const props = withDefaults(defineProps<{ variant?: 'fade' | 'scale' | 'slide-x' | 'slide-y' | 'expand'; mode?: 'in-out' | 'out-in' | 'default'; appear?: boolean; disabled?: boolean }>(), { variant: 'fade' });
const reduced = useReducedMotion();
function beforeEnter(element: Element) { if (props.variant === 'expand' && !reduced.value) { const node = element as HTMLElement; node.style.overflow = 'hidden'; node.style.height = '0'; } }
function enter(element: Element) { if (props.variant === 'expand' && !reduced.value) { const node = element as HTMLElement; void node.offsetHeight; node.style.height = `${node.scrollHeight}px`; } }
function beforeLeave(element: Element) { if (props.variant === 'expand' && !reduced.value) { const node = element as HTMLElement; node.style.overflow = 'hidden'; node.style.height = `${node.getBoundingClientRect().height}px`; void node.offsetHeight; } }
function leave(element: Element) { if (props.variant === 'expand' && !reduced.value) (element as HTMLElement).style.height = '0'; }
function clear(element: Element) { if (props.variant === 'expand') { const node = element as HTMLElement; node.style.height = ''; node.style.overflow = ''; } }
</script>

<template>
    <Transition :name="`u-${props.variant}`" :mode="props.mode" :appear="props.appear" :css="!props.disabled && !reduced" @before-enter="beforeEnter" @enter="enter" @after-enter="clear" @enter-cancelled="clear" @before-leave="beforeLeave" @leave="leave" @after-leave="clear" @leave-cancelled="clear"><slot /></Transition>
</template>
