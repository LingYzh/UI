<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, onBeforeUnmount, provide, ref, useId, watch } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';
import { itemGroupKey, itemGroupItemIdKey } from './item-group-context';
import { useDefaults } from './defaults';
import UiBadge from './UiBadge.vue';
import { useUiLink, type RouterProps } from './router';
import { slideGroupKey } from './slide-group';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<RouterProps & {
    value?: unknown;
    disabled?: boolean;
    closable?: boolean;
    selected?: boolean;
    selectedClass?: string;
    tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
    variant?: 'soft' | 'outline' | 'tonal' | 'outlined' | 'text' | 'flat';
    color?: string;
    dense?: boolean;
    closeLabel?: string;
    label?: boolean;
    filter?: boolean;
} & { ripple?: RippleOptions }>(), { ripple: true, selected: undefined, tone: 'neutral', variant: 'soft', dense: false });
const props = useDefaults(rawProps, 'UChip');
const emit = defineEmits<{ close: [event: MouseEvent]; 'click:close': [event: MouseEvent]; 'group:selected': [context: { value: boolean }] }>();
const shown = defineModel<boolean>({ default: true });
const link = useUiLink(props);
const group = inject(selectionGroupKey, undefined);
const items = inject(itemGroupKey, undefined);
const slide = inject(slideGroupKey, undefined);
const badge = ref<InstanceType<typeof UiBadge>>();
const id = useId();
const registration = items?.register({ id, value: () => props.value, disabled: () => !!props.disabled });
if (registration) provide(itemGroupItemIdKey, id);
const releaseSlide = slide?.register({ id, value: () => props.value ?? registration?.index.value, disabled: () => !!props.disabled || !!group?.disabled.value, element: () => badge.value?.$el instanceof HTMLElement ? badge.value.$el : undefined });
onBeforeUnmount(() => { registration?.release(); releaseSlide?.(); });
const active = computed(() => props.selected ?? (items ? items.isSelected(id) : group && props.value !== undefined ? group.selected(props.value) : slide?.isSelected(id) ?? false));
const selectedClass = computed(() => active.value ? [items?.selectedClass(), props.selectedClass] : []);
watch(active, selected => emit('group:selected', { value: selected }), { flush: 'sync' });
const disabled = computed(() => !!props.disabled || !!group?.disabled.value || !!slide?.disabled.value);
const badgeVariant = computed(() => ['outline', 'outlined'].includes(props.variant) ? 'outline' : 'soft');
function activate(event?: MouseEvent): void {
    if (disabled.value || group?.readonly.value) return;
    if (items) items.toggle(id);
    else if (props.value !== undefined) group?.toggle(props.value);
    if (!items && !group) slide?.select(id, !active.value);
    if (event) link.navigate(event);
}
function close(event: MouseEvent) { event.stopPropagation(); shown.value = false; emit('close', event); emit('click:close', event); }
</script>

<template>
    <UiBadge v-if="shown" ref="badge" v-bind="$attrs" :ripple="disabled || group?.readonly.value ? false : props.ripple" :tone="active ? 'accent' : props.tone" :variant="badgeVariant" :color="props.color" :dense="props.dense" :closable="props.closable && !disabled" :close-label="props.closeLabel"
        class="ui-chip" :class="[selectedClass, { 'is-selected': active, 'is-disabled': disabled, 'is-text': props.variant === 'text', 'is-label': props.label }]" :aria-disabled="disabled || undefined" @close="close">
        <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        <slot v-if="props.filter && active" name="filter"><span aria-hidden="true">✓</span></slot>
        <slot name="prepend" />
        <component :is="link.isLink.value ? 'a' : 'button'" v-ripple="disabled || group?.readonly.value ? false : props.ripple" v-if="group || items || slide || link.isLink.value" v-pointer-blur :type="link.isLink.value ? undefined : 'button'" :href="disabled ? undefined : link.href.value" class="ui-chip-select" :aria-pressed="group || items || slide ? active : undefined" :aria-current="link.isActive.value ? 'page' : undefined" :disabled="!link.isLink.value && disabled" :tabindex="disabled ? -1 : undefined" @click="activate"><slot /></component>
        <slot v-else />
        <slot name="append" />
        <template v-if="$slots.close" #close="scope"><slot name="close" v-bind="scope" /></template>
    </UiBadge>
</template>
