<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { Button } from '@vuetify/v0';
import { computed, inject, ref, watch, type CSSProperties } from 'vue';
import { formContextKey } from './form';
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
defineOptions({ inheritAttrs: false });
const element = ref<HTMLButtonElement | HTMLAnchorElement>();
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) });
const rawProps = withDefaults(defineProps<{
    variant?: 'secondary' | 'primary' | 'ghost' | 'danger' | 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';
    size?: 'sm' | 'md' | 'x-small' | 'small' | 'default' | 'large' | 'x-large' | number;
    density?: 'default' | 'comfortable' | 'compact';
    color?: string;
    href?: string;
    to?: string | Record<string, unknown>;
    loading?: boolean;
    disabled?: boolean;
    icon?: boolean | string;
    type?: 'button' | 'submit' | 'reset';
    ripple?: RippleOptions;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
}>(), { variant: 'secondary', size: 'md', type: 'button', ripple: true, rounded: undefined, dense: undefined, ghost: undefined });
const props = useDefaults(rawProps, 'UButton');
const form = inject(formContextKey, undefined);
const isDisabled = computed(() => props.disabled || form?.disabled.value);
const isDense = computed(() => props.density ? props.density === 'compact' : props.dense ?? form?.dense.value ?? false);
const isGhost = computed(() => props.ghost ?? form?.ghost.value ?? false);
const isRounded = computed(() => props.rounded ?? form?.rounded.value ?? true);
const loadingSize = ref<CSSProperties>({});
watch(() => props.loading, (loading, previous) => {
    if (!loading) { loadingSize.value = {}; return; }
    if (previous || !element.value) return;
    // Read before the render replaces slot text. The loader never determines size.
    const bounds = element.value.getBoundingClientRect();
    if (bounds.width && bounds.height) loadingSize.value = {
        width: `${bounds.width}px`, height: `${bounds.height}px`,
        minWidth: `${bounds.width}px`, maxWidth: `${bounds.width}px`,
        minHeight: `${bounds.height}px`, maxHeight: `${bounds.height}px`,
        boxSizing: 'border-box', flexGrow: 0, flexShrink: 0
    };
}, { flush: 'pre' });
const classVariant = computed(() => props.variant === 'danger' ? 'danger' : ['text', 'plain', 'ghost'].includes(props.variant) || isGhost.value ? 'ghost' : ['flat', 'elevated'].includes(props.variant) ? 'primary' : props.variant);
const styles = computed(() => ({ '--ui-button-color': props.color ? `var(--ui-theme-${props.color}, ${props.color})` : undefined, '--ui-button-height': typeof props.size === 'number' ? `${props.size}px` : ({ 'x-small': '24px', small: '28px', default: '36px', large: '44px', 'x-large': '52px' } as Record<string, string>)[props.size], ...loadingSize.value }));
function guard(event: MouseEvent) { if (isDisabled.value || props.loading) event.preventDefault(); }
</script>

<template>
    <Button.Root v-slot="{ attrs }" :disabled="isDisabled || props.loading" :loading="props.loading" renderless>
        <component :is="props.href || props.to ? 'a' : 'button'" v-pointer-blur ref="element" v-ripple="props.ripple" v-bind="{ ...attrs, ...$attrs }" :href="props.href ?? (typeof props.to === 'string' ? props.to : undefined)" :type="props.href || props.to ? undefined : props.type" class="ui-button" :class="[classVariant, isDense || ['sm', 'small', 'x-small'].includes(String(props.size)) ? 'sm' : 'md', { 'is-icon': props.icon, 'is-square': !isRounded, 'is-loading': props.loading, 'is-ghost-danger': isGhost && props.variant === 'danger', 'has-color': props.color }]" :style="styles" :aria-disabled="isDisabled || props.loading || undefined" @click="guard">
            <span v-if="props.loading" class="ui-button-loader" aria-hidden="true"><slot name="loader"><span class="ui-button-loading" /></slot></span>
            <span class="ui-button-content" :class="{ 'is-loading': props.loading }">
                <Icon v-if="typeof props.icon === 'string'" :icon="props.icon" :size="18" />
                <slot />
            </span>
        </component>
    </Button.Root>
</template>
