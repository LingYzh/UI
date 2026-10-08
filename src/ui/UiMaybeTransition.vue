<script setup lang="ts">
import { computed, Transition, type Component, type TransitionProps } from 'vue';
import { useReducedMotion } from './motion';

export type UiTransition = boolean | string | (TransitionProps & { component?: Component; [key: string]: unknown });
const props = defineProps<{ transition?: UiTransition; appear?: boolean }>();
const reduced = useReducedMotion();
const component = computed(() => typeof props.transition === 'object' ? props.transition.component ?? Transition : Transition);
const bindings = computed(() => {
    if (typeof props.transition === 'object') {
        const { component: _component, ...options } = props.transition;
        return { ...options, appear: props.appear ?? options.appear, ...(component.value === Transition ? { css: !reduced.value && options.css !== false } : { disabled: reduced.value }) };
    }
    const names: Record<string, string> = { 'fade-transition': 'u-fade', 'scale-transition': 'u-scale', 'slide-y-transition': 'u-slide-y', 'slide-x-transition': 'u-slide-x' };
    const name = typeof props.transition === 'string' ? names[props.transition] ?? props.transition : 'u-fade';
    return { name, appear: props.appear, css: !!props.transition && !reduced.value };
});
</script>

<template>
    <component :is="component" v-bind="bindings"><slot /></component>
</template>
