<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, onBeforeUnmount, provide, useId, watch } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';
import { itemGroupKey, itemGroupItemIdKey } from './item-group-context';
import { useDefaults } from './defaults';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    value?: unknown;
    disabled?: boolean;
    selectedClass?: string;
    /** The library's button remains the default; false exposes the standard renderless item. */
    tag?: string | false;
    ripple?: RippleOptions;
}>(), { ripple: true, tag: 'button' });
const props = useDefaults(rawProps, 'UItem');
const emit = defineEmits<{ 'group:selected': [context: { value: boolean }] }>();
const group = inject(selectionGroupKey, undefined);
const items = inject(itemGroupKey, undefined);
const id = useId();
const registration = items?.register({ id, value: () => props.value, disabled: () => !!props.disabled });
if (registration) provide(itemGroupItemIdKey, id);
onBeforeUnmount(() => registration?.release());
const selected = computed(() => items ? items.isSelected(id) : group?.selected(props.value) ?? false);
const disabled = computed(() => !!props.disabled || !!group?.disabled.value);
const value = computed(() => items ? items.effectiveValue(id) : props.value);
const selectedClass = computed(() => selected.value ? [items?.selectedClass(), props.selectedClass].filter(Boolean) : []);
function select(active?: boolean): void {
    if (disabled.value || group?.readonly.value) return;
    if (items) items.select(id, active);
    else if (active === undefined || active !== selected.value) group?.toggle(value.value);
}
function activate(): void { select(); }
watch(selected, active => emit('group:selected', { value: active }), { flush: 'sync' });
defineSlots<{
    default?: (scope: { id: string; selected: boolean; isSelected: boolean; selectedClass: (string | undefined)[]; value: unknown;
        disabled: boolean; toggle: () => void; select: (active?: boolean) => void }) => any;
}>();
defineExpose({ id, isSelected: selected, value, disabled, select, toggle: activate });
</script>

<template>
    <component :is="props.tag" v-if="props.tag" v-ripple="disabled || group?.readonly.value ? false : props.ripple" v-pointer-blur
        v-bind="$attrs" :type="props.tag === 'button' ? 'button' : undefined" class="u-item" :class="[selectedClass, { 'is-selected': selected }]" :disabled="props.tag === 'button' ? disabled : undefined" :aria-disabled="disabled || undefined" :aria-pressed="selected"
        @click="activate">
        <slot :id="id" :selected="selected" :is-selected="selected" :selected-class="selectedClass" :value="value" :disabled="disabled" :toggle="activate" :select="select" />
    </component>
    <slot v-else :id="id" :selected="selected" :is-selected="selected" :selected-class="selectedClass" :value="value" :disabled="disabled" :toggle="activate" :select="select" />
</template>
