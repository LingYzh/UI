<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { Button } from '@vuetify/v0';
import { computed, inject, onBeforeUnmount, provide, ref, useId, watch, type CSSProperties } from 'vue';
import { buttonGroupKey } from './button-group';
import { itemGroupKey, itemGroupItemIdKey } from './item-group-context';
import { formContextKey } from './form';
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
import { buttonColorStyles } from './button-colors';
import { useUiLink } from './router';
defineOptions({ inheritAttrs: false });
const element = ref<HTMLButtonElement | HTMLAnchorElement>();
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) });
const rawProps = withDefaults(defineProps<{
    variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';
    size?: 'sm' | 'md' | 'x-small' | 'small' | 'default' | 'large' | 'x-large' | number;
    density?: 'default' | 'comfortable' | 'compact';
    color?: string;
    value?: unknown;
    selectedClass?: string;
    href?: string;
    to?: string | Record<string, unknown>;
    replace?: boolean;
    exact?: boolean;
    loading?: boolean;
    disabled?: boolean;
    icon?: boolean | string;
    type?: 'button' | 'submit' | 'reset';
    ripple?: RippleOptions;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
}>(), { variant: 'outlined', size: 'md', type: 'button', ripple: true, rounded: undefined, dense: undefined, ghost: undefined });
const props = useDefaults(rawProps, 'UButton');
const emit = defineEmits<{ 'group:selected': [value: { value: boolean }] }>();
const form = inject(formContextKey, undefined);
const group = inject(buttonGroupKey, undefined);
const itemGroup = inject(itemGroupKey, undefined);
const groupId = useId();
const registration = group?.register(groupId, () => props.value, () => Boolean(props.disabled || props.loading));
if (registration) provide(itemGroupItemIdKey, groupId);
onBeforeUnmount(() => registration?.release());
const groupValue = computed(() => props.value === undefined ? registration?.index.value : props.value);
const isSelected = computed(() => !!group && group.selected(groupValue.value));
watch(isSelected, value => emit('group:selected', { value }));
const isDisabled = computed(() => props.disabled || form?.disabled.value || group?.disabled.value);
const link = useUiLink(props);
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
const classVariant = computed(() => `ui-button--variant-${isGhost.value ? 'text' : props.variant}`);
const styles = computed(() => ({ ...buttonColorStyles(props.color), '--ui-button-font-size': ({ 'x-small': '.625rem', sm: '.75rem', small: '.75rem', md: '.875rem', default: '.875rem', large: '1rem', 'x-large': '1.125rem' } as Record<string, string>)[String(props.size)], '--ui-button-height': typeof props.size === 'number' ? `${props.size}px` : ({ 'x-small': '24px', small: '28px', default: '36px', large: '44px', 'x-large': '52px' } as Record<string, string>)[props.size], ...loadingSize.value }));
function guard(event: MouseEvent) {
    if (isDisabled.value || props.loading) { event.preventDefault(); return; }
    if (!group?.readonly.value) group?.toggle(groupValue.value);
    link.navigate(event);
}
function guardDisabled(event: MouseEvent) {
    if (!isDisabled.value && !props.loading) return;
    event.preventDefault();
    event.stopImmediatePropagation();
}
</script>

<template>
    <Button.Root v-slot="{ attrs }" :disabled="isDisabled || props.loading" :loading="props.loading" renderless>
        <component :is="link.isLink.value ? 'a' : 'button'" v-pointer-blur ref="element" v-ripple="group?.readonly.value ? false : props.ripple" v-bind="{ ...attrs, ...$attrs }" :href="isDisabled || props.loading ? undefined : link.href.value" :type="link.isLink.value ? undefined : props.type" class="ui-button" :class="[classVariant, isSelected ? [itemGroup?.selectedClass(), props.selectedClass] : undefined, isDense || ['sm', 'small', 'x-small'].includes(String(props.size)) ? 'sm' : 'md', { 'is-icon': props.icon, 'is-square': !isRounded, 'is-loading': props.loading, 'has-color': props.color, 'is-group-selected': isSelected }]" :style="styles" :aria-current="($attrs['aria-current'] ?? (link.isActive.value ? 'page' : undefined)) as any" :aria-pressed="group ? isSelected : $attrs['aria-pressed'] as any" :aria-disabled="isDisabled || props.loading || undefined" :tabindex="(isDisabled || props.loading) && link.isLink.value ? -1 : $attrs.tabindex as any" @click.capture="guardDisabled" @click="guard">
            <span v-if="props.loading" class="ui-button-loader" aria-hidden="true"><slot name="loader"><span class="ui-button-loading" /></slot></span>
            <span class="ui-button-content" :class="{ 'is-loading': props.loading }">
                <slot name="prepend" />
                <Icon v-if="typeof props.icon === 'string'" :icon="props.icon" :size="18" />
                <slot />
                <slot name="append" />
            </span>
        </component>
    </Button.Root>
</template>
