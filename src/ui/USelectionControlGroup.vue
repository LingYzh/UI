<script setup lang="ts">
import { computed, provide, ref, useAttrs, useId } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useDefaults } from './defaults';
import { mergeControlAttrs, useFormControl } from './form';
import { defaultValueComparator, toggleGroupSelection } from './selection';
import type { SelectionControlGroupProps } from './group-props';
import { selectionGroupKey } from './selection-context';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<Omit<SelectionControlGroupProps, 'multiple'> & { multiple?: boolean | null }>(), { multiple: null, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined, direction: 'column' });
const props = useDefaults(rawProps, 'USelectionControlGroup');
defineEmits<{ 'update:focused': [value: boolean] }>();
const attrs = useAttrs();
const model = defineModel<unknown>();
const element = ref<HTMLDivElement>();
const control = useFormControl(props, model, element, attrs);
const multiple = computed(() => !!props.multiple || (props.multiple == null && Array.isArray(model.value)));
const mandatory = computed(() => !!props.mandatory);
const max = computed(() => props.max);
const comparator = computed(() => props.valueComparator);
const name = props.name ?? `u-selection-${useId()}`;
function selected(value: unknown) {
    const equal = comparator.value ?? defaultValueComparator;
    return multiple.value ? Array.isArray(model.value) && model.value.some((entry) => equal(entry, value)) : equal(model.value, value);
}
function toggle(value: unknown) {
    if (control.disabled.value || control.readonly.value) return;
    model.value = toggleGroupSelection(model.value, value, { multiple: multiple.value, mandatory: mandatory.value, max: max.value, comparator: comparator.value });
}
provide(selectionGroupKey, { model, multiple, mandatory, max, disabled: control.disabled, readonly: control.readonly, name, comparator, toggle, selected });
defineExpose({ element, focus: () => element.value?.querySelector<HTMLElement>('input:not(:disabled),button:not(:disabled)')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="u-selection-group" :class="[$attrs.class, `is-${props.direction}`, { 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value }]" :style="$attrs.style as any" :role="multiple ? 'group' : 'radiogroup'" :aria-label="props.label ?? attrs['aria-label'] as string" :aria-disabled="control.disabled.value || undefined" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @focusin="!($event.currentTarget as HTMLElement).contains($event.relatedTarget as Node) && control.focus()" @focusout="!($event.currentTarget as HTMLElement).contains($event.relatedTarget as Node) && control.blur()">
            <slot :selected="selected" :toggle="toggle" />
        </div>
    </UiControlFrame>
</template>
