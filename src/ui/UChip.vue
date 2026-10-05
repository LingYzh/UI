<script setup lang="ts">
import { computed, inject } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';
import { useDefaults } from './defaults';
import UiBadge from './UiBadge.vue';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    value?: unknown;
    disabled?: boolean;
    closable?: boolean;
    selected?: boolean;
    tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
    variant?: 'soft' | 'outline' | 'tonal' | 'outlined' | 'text' | 'flat';
    color?: string;
    dense?: boolean;
    closeLabel?: string;
}>(), { selected: undefined, tone: 'neutral', variant: 'soft', dense: false });
const props = useDefaults(rawProps, 'UChip');
const emit = defineEmits<{ close: [event: MouseEvent] }>();
const group = inject(selectionGroupKey, undefined);
const active = computed(() => props.selected ?? (group && props.value !== undefined ? group.selected(props.value) : false));
const disabled = computed(() => !!props.disabled || !!group?.disabled.value);
const badgeVariant = computed(() => ['outline', 'outlined'].includes(props.variant) ? 'outline' : 'soft');
function activate() { if (!disabled.value && !group?.readonly.value && props.value !== undefined) group?.toggle(props.value); }
</script>

<template>
    <UiBadge v-bind="$attrs" :tone="active ? 'accent' : props.tone" :variant="badgeVariant" :color="props.color" :dense="props.dense" :closable="props.closable && !disabled" :close-label="props.closeLabel"
        class="ui-chip" :class="{ 'is-selected': active, 'is-disabled': disabled, 'is-text': props.variant === 'text' }" :aria-disabled="disabled || undefined" @close="emit('close', $event)">
        <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        <button v-if="group" v-pointer-blur type="button" class="ui-chip-select" :aria-pressed="active" :disabled="disabled" @click="activate"><slot /></button>
        <slot v-else />
    </UiBadge>
</template>
