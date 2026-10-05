<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { Button } from '@vuetify/v0';
import { computed, inject, ref } from 'vue';
import { formContextKey } from './form';
import { vRipple, type RippleOptions } from './ripple';
defineOptions({ inheritAttrs: false });
const element = ref<HTMLButtonElement>();
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) });
const props = withDefaults(defineProps<{
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
}>(), { variant: 'secondary', size: 'md', type: 'button', ripple: true, rounded: undefined, dense: undefined, ghost: undefined });
const form = inject(formContextKey, undefined);
const isDisabled = computed(() => props.disabled || form?.disabled.value);
const isDense = computed(() => props.dense ?? form?.dense.value ?? false);
const isGhost = computed(() => props.ghost ?? form?.ghost.value ?? false);
const isRounded = computed(() => props.rounded ?? form?.rounded.value ?? true);
</script>

<template>
    <Button.Root v-slot="{ attrs }" :disabled="isDisabled || loading" :loading="loading" renderless>
        <button v-pointer-blur ref="element" v-ripple="ripple" v-bind="{ ...attrs, ...$attrs }" :type="type" class="ui-button" :class="[isGhost && variant !== 'danger' ? 'ghost' : variant, isDense ? 'sm' : size, { 'is-icon': icon, 'is-square': !isRounded, 'is-ghost-danger': isGhost && variant === 'danger' }]"><slot /></button>
    </Button.Root>
</template>
