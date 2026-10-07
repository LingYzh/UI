<script setup lang="ts">
import { computed, inject, provide, ref, useAttrs, useId } from 'vue';
import { buttonGroupKey, buttonToggleScopeKey } from './button-group';
import UiControlFrame from './UiControlFrame.vue';
import { useDefaults } from './defaults';
import { mergeControlAttrs, useFormControl } from './form';
import { defaultValueComparator, toggleGroupSelection } from './selection';
import type { ItemGroupProps } from './group-props';
import { selectionGroupKey } from './selection-context';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ItemGroupProps>(), { direction: 'row', dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UItemGroup');
const attrs = useAttrs();
const model = defineModel<unknown>();
const element = ref<HTMLDivElement>();
const control = useFormControl(props, model, element, attrs);
const multiple = computed(() => !!props.multiple);
const mandatory = computed(() => !!props.mandatory);
const max = computed(() => props.max);
const comparator = computed(() => props.valueComparator);
const name = `u-item-group-${useId()}`;
function selected(value: unknown) {
    const equal = comparator.value ?? defaultValueComparator;
    return multiple.value ? Array.isArray(model.value) && model.value.some((entry) => equal(entry, value)) : equal(model.value, value);
}
function toggle(value: unknown) {
    if (control.disabled.value || control.readonly.value) return;
    if (!multiple.value && !mandatory.value && selected(value)) { model.value = undefined; return; }
    model.value = toggleGroupSelection(model.value, value, { multiple: multiple.value, mandatory: mandatory.value, max: max.value, comparator: comparator.value });
}
const context = { model, multiple, mandatory, max, disabled: control.disabled, readonly: control.readonly, name, comparator, toggle, selected };
provide(selectionGroupKey, context);
if (inject(buttonToggleScopeKey, false)) {
    const buttons = ref<string[]>([]);
    provide(buttonGroupKey, {
        ...context,
        register(id) {
            buttons.value.push(id);
            return { index: computed(() => buttons.value.indexOf(id)), release: () => { buttons.value = buttons.value.filter(value => value !== id); } };
        }
    });
}
defineExpose({ element, focus: () => element.value?.querySelector<HTMLElement>('button:not(:disabled)')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="u-item-group" :class="[$attrs.class, `is-${props.direction}`]" :style="$attrs.style as any" role="group" :aria-label="props.label ?? attrs['aria-label'] as string" :aria-disabled="control.disabled.value || undefined" :aria-invalid="control.state.value === false || undefined" @focusout="!($event.currentTarget as HTMLElement).contains($event.relatedTarget as Node) && control.blur()"><slot :selected="selected" :toggle="toggle" /></div>
    </UiControlFrame>
</template>
