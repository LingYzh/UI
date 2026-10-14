<script setup lang="ts">
import { computed, defineComponent, h, inject, mergeProps, nextTick, provide, reactive, ref, toRefs, useAttrs, watch } from 'vue';
import type { CSSProperties } from 'vue';
import Icon from '../components/Icon.vue';
import { type ItemProperty } from './data-pipeline';
import type { SelectStrategyInput } from './nested-strategies';
import { defaultValueComparator } from './selection';
import { useLocale } from './locale-context';
import { mergeControlAttrs, fieldContextKey, formContextKey, useFormControl, type FormControlProps } from './form';
import UiControlFrame from './UiControlFrame.vue';
import UiInput from './UiInput.vue';
import UiMenu from './UiMenu.vue';
import UTreeview from './UTreeview.vue';
import { useDefaults } from './defaults';
import { mapTreeSelectItems, treeSelectAncestors, treeSelectDisplayValue, type TreeSelectItemOptions } from './tree-select';

type TreeSelectProps = FormControlProps & TreeSelectItemOptions & {
    items?: unknown[];
    multiple?: boolean;
    selectStrategy?: SelectStrategyInput<unknown>;
    searchable?: boolean;
    placeholder?: string;
};

const TreeSelectSearchInput = defineComponent({
    name: 'UTreeSelectSearchInput',
    props: {
        modelValue: { type: String, required: true },
        placeholder: { type: String, required: true },
        disabled: { type: Boolean, default: false }
    },
    emits: {
        'update:modelValue': (_value: string) => true,
        'update:focused': (_value: boolean) => true
    },
    setup(props, { emit }) {
        // Search is an implementation detail, not another field in the parent form.
        provide(formContextKey, undefined as never);
        provide(fieldContextKey, undefined as never);

        function updateValue(value: string | number | null): void {
            emit('update:modelValue', String(value ?? ''));
        }

        return () => h(UiInput, {
            modelValue: props.modelValue,
            'onUpdate:modelValue': updateValue,
            'onUpdate:focused': (value: boolean) => emit('update:focused', value),
            type: 'search',
            placeholder: props.placeholder,
            'aria-label': props.placeholder,
            disabled: props.disabled,
            hideDetails: true
        });
    }
});

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<TreeSelectProps>(), {
    items: () => [],
    itemTitle: 'title',
    itemValue: 'value',
    itemChildren: 'children',
    itemProps: 'props',
    multiple: false,
    searchable: false,
    clearable: false,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'UTreeSelect');
defineEmits<{ 'update:focused': [value: boolean] }>();
const model = defineModel<unknown | unknown[] | null>({ default: null as never });
const open = defineModel<boolean>('menu', { default: false });
const attrs = useAttrs();
const locale = useLocale();
const form = inject(formContextKey, undefined);
const element = ref<HTMLButtonElement>();
const root = ref<HTMLDivElement>();
const search = ref('');
const opened = ref<unknown[]>([]);
const required = computed(() => attrs.required !== undefined && attrs.required !== false);

function requiredRule(value: unknown): boolean | string {
    const hasSelection = props.multiple
        ? Array.isArray(value) && value.length > 0
        : value !== null && value !== undefined;
    return !required.value || hasSelection || locale.t('form.invalid');
}

const rules = computed(() => required.value ? [requiredRule, ...(props.rules ?? [])] : props.rules);
const validationProps = reactive({ ...toRefs(props), rules });
const control = useFormControl(validationProps, model, element, attrs);
// Keep the model shape aligned with the active mode without writing to frozen controls.
watch([() => props.multiple, model, control.disabled, control.readonly], ([multiple, value, disabled, readonly]) => {
    if (disabled || readonly) return;
    let normalized = value;
    if (multiple && !Array.isArray(value)) normalized = value === null || value === undefined ? [] : [value];
    else if (!multiple && Array.isArray(value)) normalized = value[0] ?? null;
    if (normalized !== value) model.value = normalized;
}, { flush: 'sync', immediate: true });

const treeItems = computed(() => mapTreeSelectItems(props.items, props));
const selectedValues = computed(() => props.multiple && Array.isArray(model.value) ? model.value : []);
const hasValue = computed(() => props.multiple
    ? selectedValues.value.length > 0
    : model.value !== null && model.value !== undefined);
const activeValues = computed(() => !props.multiple && hasValue.value ? [model.value] : []);
const displayValue = computed(() => {
    if (!props.multiple) return treeSelectDisplayValue(treeItems.value, model.value);
    const values = selectedValues.value
        .map((value) => treeSelectDisplayValue(treeItems.value, value))
        .filter((value): value is string => value !== undefined);
    return values.length ? values.join('、') : undefined;
});
const placeholderText = computed(() => props.placeholder ?? locale.t('cascader.placeholder'));
const searchLabel = computed(() => locale.t('treeSelect.search'));
const menuBindings = computed(() => ({
    panel: true,
    closeOnContentClick: false,
    location: 'bottom start' as const,
    locationStrategy: 'connected' as const,
    target: root.value,
    label: props.label || locale.t('common.options')
}));

function inputAttrs(): Record<string, unknown> {
    const { class: _class, style: _style, ...rest } = attrs;
    return rest;
}

function triggerAttributes(controlAttrs: Record<string, unknown>): Record<string, unknown> {
    const merged: Record<string, unknown> = mergeControlAttrs(inputAttrs(), controlAttrs, control.id());
    delete merged.required;
    if (merged['aria-required'] === undefined) merged['aria-required'] = required.value || undefined;
    return merged;
}

function updateMenu(value: boolean): void {
    if (value && (control.disabled.value || control.readonly.value)) return;
    open.value = value;
}

function updateOpened(value: unknown[]): void {
    opened.value = value;
}

function sameValues(left: unknown[], right: unknown[]): boolean {
    return left.length === right.length && left.every((value, index) => defaultValueComparator(value, right[index]));
}

function syncOpenedToSelection(): void {
    const values = props.multiple ? selectedValues.value : activeValues.value;
    const ancestors: unknown[] = [];
    for (const value of values) {
        for (const ancestor of treeSelectAncestors(treeItems.value, value, defaultValueComparator)) {
            if (!ancestors.some((openedValue) => defaultValueComparator(openedValue, ancestor))) ancestors.push(ancestor);
        }
    }

    // Keep manually opened branches and add the ancestors of every selected value.
    const next = props.multiple ? [...opened.value] : [];
    for (const ancestor of ancestors) {
        if (!next.some((openedValue) => defaultValueComparator(openedValue, ancestor))) next.push(ancestor);
    }
    if (!sameValues(opened.value, next)) opened.value = next;
}

function choose(values: unknown[]): void {
    if (control.disabled.value || control.readonly.value || (!props.multiple && !values.length)) return;
    model.value = props.multiple ? values : values[0];
    if (!props.multiple) open.value = false;
}

function updateSearchFocus(focused: boolean): void {
    if (focused) control.focus();
}

function fieldFocusIn(event: FocusEvent): void {
    const field = event.currentTarget as HTMLElement;
    if (!field.contains(event.relatedTarget as Node | null)) control.focus();
}

function fieldFocusOut(event: FocusEvent): void {
    const field = event.currentTarget as HTMLElement;
    if (field.contains(event.relatedTarget as Node | null) || open.value) return;
    control.blur();
}

function clear(): void {
    if (control.disabled.value || control.readonly.value) return;
    model.value = props.multiple ? [] : null;
    search.value = '';
    open.value = false;
    void nextTick(() => element.value?.focus({ preventScroll: true }));
}

function close(): void {
    open.value = false;
}

function focus(): void {
    element.value?.focus();
}

async function reset(): Promise<void> {
    close();
    search.value = '';
    await control.reset();
    if (props.multiple && !Array.isArray(model.value)) {
        model.value = [];
        await nextTick();
        await control.resetValidation();
    }
}

watch([open, control.disabled, control.readonly], (values, previousValues) => {
    const [isOpen, disabled, readonly] = values;
    const wasOpen = previousValues?.[0] ?? false;
    if (disabled || readonly) {
        if (isOpen) open.value = false;
        search.value = '';
        if (wasOpen && !element.value?.matches(':focus') && control.focused.value) control.blur();
        return;
    }
    if (isOpen) {
        search.value = '';
        syncOpenedToSelection();
        return;
    }
    search.value = '';
    if (wasOpen && !element.value?.matches(':focus') && control.focused.value) control.blur();
}, { flush: 'sync', immediate: true });

watch(model, () => {
    if (open.value) syncOpenedToSelection();
}, { flush: 'sync' });

// Form resets write null through the registered control; multi-select resets remain arrays.
watch([model, () => form?.resetting.value], ([value, resetting]) => {
    if (props.multiple && resetting && (value === null || value === undefined)) model.value = [];
}, { flush: 'sync' });

watch(treeItems, () => {
    if (open.value) syncOpenedToSelection();
}, { flush: 'sync' });

defineExpose({ focus, validate: control.validate, reset, resetValidation: control.resetValidation, close });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value || open" :framed="control.framed.value" :for="control.id()"
        :error="control.displayErrors.value.join('\n')" :required="required" :label-position="control.labelPosition.value"
        :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <div ref="root" class="ui-tree-select ui-input" :class="[attrs.class, control.classes.value]"
                :style="[control.styles.value, attrs.style as CSSProperties]" @focusin="fieldFocusIn" @focusout="fieldFocusOut">
                <UiMenu v-bind="menuBindings" :disabled="control.disabled.value || control.readonly.value" :model-value="open"
                    content-class="ui-tree-select-menu" @update:model-value="updateMenu">
                    <template #activator="{ props: menuActivatorProps }">
                        <button ref="element" v-bind="mergeProps(menuActivatorProps, triggerAttributes(controlAttrs))"
                            class="ui-tree-select-trigger" type="button" role="combobox" :id="control.id()"
                            :disabled="control.disabled.value" :aria-haspopup="'dialog'" :aria-expanded="open"
                            :aria-controls="menuActivatorProps['aria-controls'] as string | undefined" :aria-readonly="control.readonly.value || undefined">
                            <span class="ui-tree-select-value" :title="displayValue || undefined">
                                {{ displayValue ?? placeholderText }}
                            </span>
                        </button>
                    </template>
                    <TreeSelectSearchInput v-if="props.searchable" v-model="search" :placeholder="searchLabel"
                        :disabled="control.disabled.value || control.readonly.value" @update:focused="updateSearchFocus" />
                    <UTreeview :items="treeItems" :activated="activeValues" :selected="selectedValues" :opened="opened"
                        :search="props.searchable ? search : ''" item-title="title" item-value="value"
                        item-children="children" item-props="props" active-strategy="single-independent"
                        :select-strategy="props.selectStrategy ?? (props.multiple ? 'independent' : undefined)"
                        items-registration="props" :activatable="!props.multiple" :selectable="props.multiple"
                        :multiple="props.multiple" :disabled="control.disabled.value"
                        :readonly="control.readonly.value" @update:activated="choose" @update:selected="choose"
                        @update:opened="updateOpened" />
                </UiMenu>
                <button v-if="props.clearable && hasValue && !control.readonly.value" class="ui-tree-select-clear"
                    type="button" :disabled="control.disabled.value" :aria-label="locale.t('common.clear')"
                    @pointerdown.stop.prevent @click.stop="clear">
                    <Icon name="$close" :size="16" />
                </button>
            </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
