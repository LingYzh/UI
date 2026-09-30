<script setup lang="ts">
import { Button } from '@vuetify/v0';
import { ref } from 'vue';
import { vRipple, type RippleOptions } from './ripple';
defineOptions({ inheritAttrs: false });
const element = ref<HTMLButtonElement>();
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) });
withDefaults(defineProps<{
    variant?: 'secondary' | 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
    loading?: boolean;
    disabled?: boolean;
    icon?: boolean;
    type?: 'button' | 'submit' | 'reset';
    ripple?: RippleOptions;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
}>(), { variant: 'secondary', size: 'md', type: 'button', ripple: true, rounded: true });
</script>

<template>
    <Button.Root v-slot="{ attrs }" :disabled="disabled || loading" :loading="loading" renderless>
        <button ref="element" v-ripple="ripple" v-bind="{ ...attrs, ...$attrs }" :type="type" class="ui-button" :class="[ghost && variant !== 'danger' ? 'ghost' : variant, dense ? 'sm' : size, { 'is-icon': icon, 'is-square': !rounded, 'is-ghost-danger': ghost && variant === 'danger' }]"><slot /></button>
    </Button.Root>
</template>
