<script setup lang="ts">
import { provideDefaults, type UIDefaults } from './defaults';

const props = withDefaults(defineProps<{
    defaults?: UIDefaults;
    root?: boolean | string;
    scoped?: boolean;
    reset?: boolean | number | string;
    disabled?: boolean;
}>(), {
    root: false,
    scoped: false,
    disabled: false
});

provideDefaults(() => props.defaults, {
    root: () => props.root,
    scoped: () => props.scoped,
    reset: () => props.reset,
    disabled: () => props.disabled
});
</script>

<template>
    <slot />
</template>
