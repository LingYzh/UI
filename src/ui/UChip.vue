<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, onBeforeUnmount, provide, useId, watch } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';
import { itemGroupKey, itemGroupItemIdKey } from './item-group-context';
import { useDefaults } from './defaults';
import UiBadge from './UiBadge.vue';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
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
} & { ripple?: RippleOptions }>(), { ripple: true, selected: undefined, tone: 'neutral', variant: 'soft', dense: false });
const props = useDefaults(rawProps, 'UChip');
const emit = defineEmits<{ close: [event: MouseEvent]; 'group:selected': [context: { value: boolean }] }>();
const group = inject(selectionGroupKey, undefined);
const items = inject(itemGroupKey, undefined);
const id = useId();
const registration = items?.register({ id, value: () => props.value, disabled: () => !!props.disabled });
if (registration) provide(itemGroupItemIdKey, id);
onBeforeUnmount(() => registration?.release());
const active = computed(() => props.selected ?? (items ? items.isSelected(id) : group && props.value !== undefined ? group.selected(props.value) : false));
const selectedClass = computed(() => active.value ? [items?.selectedClass(), props.selectedClass] : []);
watch(active, selected => emit('group:selected', { value: selected }), { flush: 'sync' });
const disabled = computed(() => !!props.disabled || !!group?.disabled.value);
const badgeVariant = computed(() => ['outline', 'outlined'].includes(props.variant) ? 'outline' : 'soft');
function activate(): void {
    if (disabled.value || group?.readonly.value) return;
    if (items) items.toggle(id);
    else if (props.value !== undefined) group?.toggle(props.value);
}
</script>

<template>
    <UiBadge v-bind="$attrs" :ripple="disabled || group?.readonly.value ? false : props.ripple" :tone="active ? 'accent' : props.tone" :variant="badgeVariant" :color="props.color" :dense="props.dense" :closable="props.closable && !disabled" :close-label="props.closeLabel"
        class="ui-chip" :class="[selectedClass, { 'is-selected': active, 'is-disabled': disabled, 'is-text': props.variant === 'text' }]" :aria-disabled="disabled || undefined" @close="emit('close', $event)">
        <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        <button v-ripple="disabled || group?.readonly.value ? false : props.ripple" v-if="group" v-pointer-blur type="button" class="ui-chip-select" :aria-pressed="active" :disabled="disabled" @click="activate"><slot /></button>
        <slot v-else />
    </UiBadge>
</template>
