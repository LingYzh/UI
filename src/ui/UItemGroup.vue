<script setup lang="ts">
import { computed, getCurrentInstance, inject, onMounted, onUpdated, provide, ref, useAttrs, useId, type VNode } from 'vue';
import { buttonGroupKey, buttonToggleScopeKey } from './button-group';
import UiControlFrame from './UiControlFrame.vue';
import { provideUiTheme } from './theme';
import { useDefaults } from './defaults';
import { mergeControlAttrs, useFormControl } from './form';
import { defaultValueComparator, toggleGroupSelection } from './selection';
import type { ItemGroupProps } from './group-props';
import { selectionGroupKey } from './selection-context';
import { itemGroupKey, itemGroupItemIdKey } from './item-group-context';
import { createItemGroupState } from './item-group-state';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<ItemGroupProps>(), { direction: 'row', tag: 'div', dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UItemGroup');
defineEmits<{ 'update:focused': [value: boolean] }>();
const theme = provideUiTheme(() => props.theme);
const instance = getCurrentInstance();
const attrs = useAttrs();
const model = defineModel<unknown>();
const element = ref<HTMLElement>();
const control = useFormControl(props, model, element, attrs);
const multiple = computed(() => !!props.multiple);
const mandatory = computed(() => !!props.mandatory);
const max = computed(() => props.max);
const comparator = computed(() => props.valueComparator);
const name = `u-item-group-${useId()}`;
const items = createItemGroupState(model, () => ({ ...props, disabled: control.disabled.value, readonly: control.readonly.value }));
function isValueSelected(value: unknown): boolean {
    const equal = comparator.value ?? defaultValueComparator;
    return multiple.value ? Array.isArray(model.value) && model.value.some(entry => equal(entry, value)) : equal(model.value, value);
}
function toggle(value: unknown): void {
    if (control.disabled.value || control.readonly.value) return;
    if (!multiple.value && !mandatory.value && isValueSelected(value)) { model.value = undefined; return; }
    model.value = toggleGroupSelection(model.value, value, { multiple: multiple.value, mandatory: mandatory.value, max: max.value, comparator: comparator.value });
}
const context = { model, multiple, mandatory, max, disabled: control.disabled, readonly: control.readonly, name, comparator, toggle, selected: isValueSelected };
provide(selectionGroupKey, context);
provide(itemGroupKey, Object.assign(items, { selectedClass: () => props.selectedClass }));
if (inject(buttonToggleScopeKey, false)) {
    provide(buttonGroupKey, { ...context, register: (id, value = () => undefined, disabled = () => false) => items.register({ id, value, disabled }) });
}
// Keyed children can move without remounting. The frame owns this slot's render
// effect, so its vnode update also reconciles order when the group itself stays idle.
function syncOrder(): void {
    const ids: string[] = [];
    const visited = new Set<VNode>();
    function visit(node: VNode): void {
        if (visited.has(node)) return;
        visited.add(node);
        const provided = (node.component as unknown as { provides?: Record<symbol, unknown> })?.provides;
        if (provided && Object.hasOwn(provided, itemGroupItemIdKey)) {
            const id = provided[itemGroupItemIdKey];
            if (typeof id === 'string') ids.push(id);
        }
        if (node.component?.subTree) visit(node.component.subTree);
        if (Array.isArray(node.children)) for (const child of node.children) {
            if (child && typeof child === 'object' && '__v_isVNode' in child) visit(child as VNode);
        }
    }
    if (instance?.subTree) visit(instance.subTree);
    items.reorder(ids);
}
onMounted(() => { syncOrder(); items.ensureMandatory(); });
onUpdated(syncOrder);
function focus(): void { element.value?.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled)')?.focus(); }
defineExpose({ element, focus, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors,
    selected: items.selectedIds, selectedValues: items.selectedValues, isSelected: items.isSelected, select: items.select, next: items.next, prev: items.prev });
defineSlots<{
    default?: (scope: { selected: string[]; selectedValues: unknown[]; isSelected: (id: string) => boolean; select: (id: string, selected?: boolean) => void;
        next: () => void; prev: () => void; isValueSelected: (value: unknown) => boolean; toggle: (value: unknown) => void }) => any;
}>();
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value"
        @vue:updated="syncOrder">
        <component :is="props.tag" ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="u-item-group" :class="[$attrs.class, `is-${props.direction}`]" :style="[theme.styles.value, $attrs.style as any]" :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'" role="group" :aria-label="props.label ?? attrs['aria-label'] as string" :aria-disabled="control.disabled.value || undefined" :aria-invalid="control.state.value === false || undefined"
            @focusout="!($event.currentTarget as HTMLElement).contains($event.relatedTarget as Node) && control.blur()">
            <slot :selected="items.selectedIds.value" :selected-values="items.selectedValues.value" :is-selected="items.isSelected" :select="items.select" :next="items.next" :prev="items.prev" :is-value-selected="isValueSelected" :toggle="toggle" />
        </component>
    </UiControlFrame>
</template>
