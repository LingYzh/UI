<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, inject, onBeforeUnmount, provide, useId, watch } from 'vue';
import { expansionGroupKey } from './expansion-state';
import { expansionPanelKey } from './expansion-state';
import { itemGroupItemIdKey } from './item-group-context';
import UExpansionPanelTitle from './UExpansionPanelTitle.vue';
import UExpansionPanelText from './UExpansionPanelText.vue';
const rawProps = withDefaults(defineProps<{
    value?: unknown;
    title?: string;
    text?: string;
    eager?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    focusable?: boolean;
    static?: boolean;
    tag?: string;
    selectedClass?: string;
}>(), { eager: undefined, focusable: undefined, static: undefined });
const props = useDefaults(rawProps, 'UExpansionPanel');
const fallback = useId();
const id = `u-expansion-panel-${fallback}`;
const group = inject(expansionGroupKey, undefined);
const panelValue = computed(() => props.value == null ? undefined : props.value);
const registration = group?.registerItem({ id, value: () => panelValue.value, disabled: () => !!props.disabled });
const selected = computed(() => group?.isSelected(id) ?? false);
const currentValue = computed(() => group?.effectiveValue(id) ?? panelValue.value);
const eager = () => props.eager ?? group?.eager?.();
const focusable = () => props.focusable ?? group?.focusable?.();
const isStatic = () => props.static ?? group?.static?.();
const isDisabled = () => !!props.disabled || !!group?.disabled();
const isReadonly = () => !!props.readonly || !!group?.readonly();
const context = {
    get value() { return currentValue.value; },
    open: () => selected.value,
    toggle: () => { if (!isDisabled() && !isReadonly()) group?.select(id); },
    disabled: isDisabled,
    readonly: isReadonly,
    eager,
    focusable,
    static: isStatic,
    titleId: `${fallback}-title`,
    textId: `${fallback}-text`
};
provide(expansionPanelKey, context);
provide(itemGroupItemIdKey, id);
const emit = defineEmits<{ 'group:selected': [payload: { value: boolean }] }>();
watch(selected, (value, previous) => {
    if (value !== previous) emit('group:selected', { value });
});
watch(() => props.disabled, () => group?.ensureMandatory());
watch(() => props.readonly, () => group?.ensureMandatory());
onBeforeUnmount(() => group?.unregisterItem(id));
const groupItem = {
    id,
    index: registration?.index,
    value: currentValue,
    disabled: () => !!props.disabled
};
defineExpose({ groupItem, selected });
defineSlots<{
    default?: (scope: { open: boolean; toggle: () => void; value: unknown; index: number; disabled: boolean; readonly: boolean; selected: boolean }) => any;
    title?: (scope: { open: boolean; toggle: () => void; value: unknown; index: number }) => any;
    text?: (scope: { open: boolean; value: unknown; index: number }) => any;
}>();
</script>
<template>
    <component :is="props.tag ?? 'section'" class="u-expansion-panel" :class="[
        { 'is-open': context.open(), 'is-disabled': context.disabled(), 'is-readonly': context.readonly() },
        context.open() ? (props.selectedClass ?? group?.selectedClass()) : undefined
    ]" :aria-disabled="context.disabled() || context.readonly() || undefined">
        <UExpansionPanelTitle v-if="$slots.title || props.title != null" :readonly="context.readonly()" :focusable="context.focusable()" :static="context.static()">
            <slot name="title" :open="context.open()" :toggle="context.toggle" :value="context.value" :index="registration?.index.value ?? -1">{{ props.title }}</slot>
        </UExpansionPanelTitle>
        <slot :open="context.open()" :toggle="context.toggle" :value="context.value" :index="registration?.index.value ?? -1" :disabled="context.disabled()" :readonly="context.readonly()" :selected="selected" />
        <UExpansionPanelText v-if="$slots.text || props.text != null" :eager="context.eager()">
            <slot name="text" :open="context.open()" :value="context.value" :index="registration?.index.value ?? -1">{{ props.text }}</slot>
        </UExpansionPanelText>
    </component>
</template>
