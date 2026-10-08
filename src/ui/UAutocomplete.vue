<script setup lang="ts">
import { vRipple } from './ripple';
import { computed, mergeProps, nextTick, ref, useAttrs, useId, useSlots, watch, type CSSProperties } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import Icon from '../components/Icon.vue';
import UiMenu from './UiMenu.vue';
import UVirtualScroll from './UVirtualScroll.vue';
import { useDefaults } from './defaults';
import { mergeControlAttrs, useFormControl } from './form';
import { controlSizeStyles } from './control-sizing';
import { findSelection, isSelected, normalizeItems, toggleSelection, type SelectionItem } from './selection';
import { filterSelectionItems } from './selection-filter';
import { useLocale } from './locale-context';
import type { AutocompleteProps } from './autocomplete-props';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<AutocompleteProps>(), {
    ripple: true,
    items: () => [],
    itemProps: 'props',
    clearOnSelect: false,
    blurOnSelect: true,
    closableChips: false,
    ignoreAccents: undefined,
    autoSelectFirst: false,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'UAutocomplete');
const emit = defineEmits<{
    'update:focused': [value: boolean];
    'item:added': [item: SelectionItem];
    'item:removed': [item: SelectionItem];
    'item:created': [item: SelectionItem];
    'click:clear': [];
}>();
const attrs = useAttrs();
const slots = useSlots();
const locale = useLocale();
const model = defineModel<unknown>();
const search = defineModel<string>('search', { default: '' });
const menuOpen = defineModel<boolean>('menu', { default: false });
const input = ref<HTMLInputElement>();
const root = ref<HTMLDivElement>();
const virtualScroll = ref<InstanceType<typeof UVirtualScroll>>();
const control = useFormControl(props, model, input, attrs);
const active = ref(-1);
const listId = `${useId()}-list`;
const allItems = computed(() => normalizeItems(props.items, {
    itemTitle: props.itemTitle,
    itemValue: props.itemValue,
    itemProps: props.itemProps
}));

function flattenItems(items: readonly SelectionItem[]): SelectionItem[] {
    return items.flatMap(item => item.children?.length ? flattenItems(item.children) : [item]);
}

const flatItems = computed(() => flattenItems(allItems.value));
const filterQuery = computed(() => props.selectOnly ? '' : search.value);
const filterOptions = computed(() => ({
    customFilter: props.customFilter,
    customKeyFilter: props.customKeyFilter,
    filterKeys: props.filterKeys,
    filterMode: props.filterMode,
    ignoreAccents: props.ignoreAccents,
    noFilter: props.noFilter,
    standardFilterEnabled: Boolean(props.customFilter
        || Object.keys(props.customKeyFilter ?? {}).length
        || props.filterKeys !== undefined
        || props.filterMode !== undefined
        || props.ignoreAccents !== undefined)
}));
const visible = computed(() => filterSelectionItems(flatItems.value, filterQuery.value, filterOptions.value, props.filter)
    .filter(item => !props.hideSelected || !isSelected(model.value, item, !!props.multiple, !!props.returnObject, props.valueComparator)));
const selectedValues = computed<unknown[]>(() => props.multiple
    ? Array.isArray(model.value) ? model.value : []
    : model.value == null ? [] : [model.value]);

function itemTitleForValue(value: unknown): string {
    return findSelection(allItems.value, value, !!props.returnObject, props.valueComparator)?.title
        ?? normalizeItems([value], { itemTitle: props.itemTitle, itemValue: props.itemValue, itemProps: props.itemProps })[0]?.title
        ?? String(value ?? '');
}

const selections = computed(() => selectedValues.value.map((value) => {
    const internalItem = findSelection(allItems.value, value, !!props.returnObject, props.valueComparator)
        ?? normalizeItems([value], { itemTitle: props.itemTitle, itemValue: props.itemValue, itemProps: props.itemProps })[0];
    return { value, internalItem, title: internalItem?.title ?? itemTitleForValue(value) };
}));
const chosen = computed(() => selections.value.map(selection => selection.title));
const display = computed(() => {
    if (props.multiple) return search.value;
    if (props.selectOnly) return selections.value.at(-1)?.title ?? '';
    if (search.value) return search.value;
    return selections.value.at(-1)?.title ?? '';
});
const menuWidth = ref(0);
const menuVisible = computed(() => menuOpen.value
    && !control.disabled.value
    && !control.readonly.value
    && (!props.hideNoData || visible.value.length > 0));
const menuBindings = computed(() => ({
    panel: true,
    disableInitialFocus: true,
    nativeDismiss: false,
    openOnClick: false,
    openOnFocus: false,
    openOnHover: false,
    openOnArrow: false,
    closeOnContentClick: false,
    location: 'bottom start',
    locationStrategy: 'connected' as const,
    offset: 4,
    target: root.value,
    minWidth: menuWidth.value || undefined,
    eager: props.eager,
    ...props.menuProps,
    contentProps: mergeProps(
        props.menuProps?.contentProps as Record<string, unknown> ?? {},
        props.listProps ?? {},
        { id: listId, role: 'listbox', class: 'u-autocomplete-menu', 'aria-multiselectable': props.multiple || undefined }
    ),
    activatorProps: mergeProps(props.menuProps?.activatorProps as Record<string, unknown> ?? {}, {
        'aria-haspopup': 'listbox', 'aria-controls': listId
    })
}));
const noDataLabel = computed(() => {
    const key = props.noDataText;
    if (!key) return locale.t('common.empty');
    return key.startsWith('$vuetify.') ? locale.t(key) : key;
});

function firstEnabledIndex(): number {
    return visible.value.findIndex(item => !item.disabled);
}

function nextEnabledIndex(start: number, direction: 1 | -1): number {
    const count = visible.value.length;
    if (!count) return -1;
    let index = start < 0 ? direction > 0 ? -1 : 0 : start;
    for (let attempt = 0; attempt < count; attempt++) {
        index = (index + direction + count) % count;
        if (!visible.value[index]?.disabled) return index;
    }
    return -1;
}

function syncActiveIndex(): void {
    const first = firstEnabledIndex();
    if (first < 0) {
        active.value = -1;
        return;
    }
    if (props.autoSelectFirst === true) {
        active.value = first;
        return;
    }
    if (props.autoSelectFirst === 'exact' && visible.value[first]?.title === search.value) {
        active.value = first;
        return;
    }
    active.value = -1;
}

watch(visible, () => {
    syncActiveIndex();
    if (menuOpen.value && props.hideNoData && !visible.value.length) menuOpen.value = false;
}, { immediate: true });
watch(() => props.autoSelectFirst, syncActiveIndex);
watch(menuOpen, async (value) => {
    if (!value) { active.value = -1; return; }
    if (control.disabled.value || control.readonly.value || (props.hideNoData && !visible.value.length)) {
        menuOpen.value = false;
        return;
    }
    if (active.value < 0 && props.autoSelectFirst !== false) syncActiveIndex();
    await nextTick();
    menuWidth.value = root.value?.offsetWidth ?? 0;
    const selectedIndex = visible.value.findIndex(item => isSelected(model.value, item, !!props.multiple, !!props.returnObject, props.valueComparator));
    scrollActive(active.value >= 0 ? active.value : selectedIndex);
}, { immediate: true });
watch([control.disabled, control.readonly], ([disabled, readonly]) => {
    if (disabled || readonly) menuOpen.value = false;
});

function openMenu(): void {
    if (control.disabled.value || control.readonly.value || (props.hideNoData && !visible.value.length)) return;
    if (!menuOpen.value) syncActiveIndex();
    menuOpen.value = true;
}

function scrollActive(index: number): void {
    if (index < 0 || props.noAutoScroll) return;
    void nextTick(() => virtualScroll.value?.scrollToIndex(index, 'start'));
}

function internalItemForValue(value: unknown): SelectionItem | undefined {
    return findSelection(allItems.value, value, !!props.returnObject, props.valueComparator)
        ?? normalizeItems([value], { itemTitle: props.itemTitle, itemValue: props.itemValue, itemProps: props.itemProps })[0];
}

function choose(item: SelectionItem, pointer = false): boolean {
    if (control.disabled.value || control.readonly.value || item.disabled) return false;

    const before = model.value;
    const after = toggleSelection(before, item, !!props.multiple, !!props.returnObject, props.valueComparator, props.max);
    const wasSelected = isSelected(before, item, !!props.multiple, !!props.returnObject, props.valueComparator);
    const isNowSelected = isSelected(after, item, !!props.multiple, !!props.returnObject, props.valueComparator);
    if (wasSelected !== isNowSelected) {
        if (isNowSelected) emit('item:added', item);
        else emit('item:removed', item);
    }

    if (!props.multiple && before != null && !wasSelected) {
        const oldItem = internalItemForValue(before);
        if (oldItem) emit('item:removed', oldItem);
    }
    control.editable.value = after;

    if (props.multiple) {
        if (props.clearOnSelect) search.value = '';
    } else {
        if (props.combobox && props.clearOnSelect) search.value = '';
        else search.value = item.title;
        menuOpen.value = false;
    }

    if (pointer && props.blurOnSelect) input.value?.blur();
    return wasSelected !== isNowSelected;
}

function createValue(rawValue: string, fromDelimiter = false): void {
    const value = fromDelimiter || props.trimValues ? rawValue.trim() : rawValue;
    if (!value || control.disabled.value || control.readonly.value || props.selectOnly) return;
    const existing = flatItems.value.find(item => item.title === value);
    if (existing) {
        if (isSelected(model.value, existing, !!props.multiple, !!props.returnObject, props.valueComparator)) return;
        choose(existing);
        return;
    }
    const item: SelectionItem = { title: value, value, raw: value, props: {}, disabled: false };
    choose(item);
    emit('item:created', item);
}

function create(): void {
    if (!props.combobox || props.selectOnly || !search.value) return;
    createValue(search.value);
    menuOpen.value = false;
}

function onInput(event: Event): void {
    if (props.selectOnly) return;
    const value = (event.target as HTMLInputElement).value;
    search.value = value;
    syncActiveIndex();
    openMenu();

    if (!props.combobox || !props.multiple) return;
    const separators = ['\n', ...(props.delimiters ?? [])].filter(Boolean);
    if (!separators.length) return;
    const escaped = separators.map(separator => separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const parts = value.split(new RegExp(`(?:${escaped})+`));
    if (parts.length < 2) return;
    void createDelimitedValues(parts);
}

async function createDelimitedValues(parts: readonly string[]): Promise<void> {
    for (const part of parts) {
        createValue(part, true);
        await nextTick();
    }
    search.value = '';
    menuOpen.value = false;
}

function invokeEventHandler(handler: unknown, event: MouseEvent): void {
    const handlers = Array.isArray(handler) ? handler : [handler];
    for (const callback of handlers) {
        if (typeof callback === 'function') callback(event);
    }
}

function itemClick(item: SelectionItem, event: MouseEvent): void {
    event.stopPropagation();
    if (control.disabled.value || control.readonly.value || item.disabled) {
        event.preventDefault();
        return;
    }
    invokeEventHandler(item.props.onClick, event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    choose(item, true);
}

function itemSlotProps(item: SelectionItem, index: number) {
    const selected = isSelected(model.value, item, !!props.multiple, !!props.returnObject, props.valueComparator);
    return {
        ...item.props,
        id: `${listId}-${index}`,
        role: 'option',
        tabindex: -1,
        disabled: item.disabled || control.disabled.value || control.readonly.value,
        class: [item.props.class, {
            'u-autocomplete-option': true,
            'is-active': active.value === index,
            'is-selected': selected,
            'is-disabled': item.disabled || control.disabled.value || control.readonly.value
        }],
        'aria-selected': selected,
        'aria-disabled': item.disabled || control.disabled.value || control.readonly.value || undefined,
        'data-index': index,
        onPointerdown: (event: PointerEvent) => event.preventDefault(),
        onPointerenter: () => { if (!item.disabled) active.value = index; },
        onClick: (event: MouseEvent) => itemClick(item, event)
    };
}

function asSelectionItem(item: unknown): SelectionItem {
    return item as SelectionItem;
}

function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && menuOpen.value) {
        menuOpen.value = false;
        event.preventDefault();
        return;
    }
    if (event.key === 'Tab') {
        menuOpen.value = false;
        return;
    }
    if (control.disabled.value || control.readonly.value) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const wasOpen = menuOpen.value;
        openMenu();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        if (!wasOpen) active.value = direction === 1 ? firstEnabledIndex() : nextEnabledIndex(0, -1);
        else active.value = nextEnabledIndex(active.value, direction);
        scrollActive(active.value);
    } else if (event.key === 'Enter') {
        if (menuVisible.value && visible.value[active.value] && !visible.value[active.value].disabled) {
            event.preventDefault();
            choose(visible.value[active.value]);
        } else if (props.combobox && search.value) {
            event.preventDefault();
            create();
        } else if (props.selectOnly && visible.value[active.value] && !visible.value[active.value].disabled) {
            event.preventDefault();
            choose(visible.value[active.value]);
        }
    } else if (event.key === 'Backspace' && props.multiple && !search.value && selectedValues.value.length) {
        remove(selectedValues.value.length - 1);
    }
}

function blur(event: FocusEvent): void {
    if (root.value?.contains(event.relatedTarget as Node)) return;
    if (props.combobox && search.value) create();
    menuOpen.value = false;
    if (!props.combobox && !props.selectOnly) {
        search.value = props.multiple || props.chips || slots.selection || slots.chip
            ? ''
            : selections.value.at(-1)?.title ?? '';
    }
    control.blur();
}

function remove(index: number): void {
    if (control.disabled.value || control.readonly.value) return;
    const currentValues = Array.isArray(model.value) ? model.value : model.value == null ? [] : [model.value];
    const removedValue = currentValues[index];
    if (removedValue === undefined) return;
    const removedItem = internalItemForValue(removedValue);
    const next = props.multiple
        ? currentValues.filter((_, current) => current !== index)
        : null;
    control.editable.value = next;
    if (removedItem) emit('item:removed', removedItem);
    input.value?.focus();
}

function clear(): void {
    if (control.disabled.value || control.readonly.value) return;
    for (const selection of selections.value) emit('item:removed', selection.internalItem);
    control.editable.value = props.multiple ? [] : null;
    search.value = '';
    emit('click:clear');
    input.value?.focus();
    openMenu();
}

function focus(): void {
    input.value?.focus();
}

defineExpose({
    element: input,
    menu: menuOpen,
    focus,
    validate: control.validate,
    reset: control.reset,
    resetValidation: control.resetValidation,
    errors: control.errors
});
</script>

<template>
    <UiControlFrame v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
        <template #default="{ controlAttrs }">
            <div ref="root" class="u-autocomplete" :class="[$attrs.class, control.classes.value]" :style="[control.styles.value, control.framed.value ? undefined : controlSizeStyles(props), $attrs.style as CSSProperties]" @focusout="blur">
            <div class="u-autocomplete-field" @pointerdown="!control.disabled.value && input?.focus()">
                <slot name="prepend" :disabled="control.disabled.value" :readonly="control.readonly.value" />
                <slot name="prepend-inner" :disabled="control.disabled.value" :readonly="control.readonly.value" />
                <span v-if="props.chips && selections.length" class="u-autocomplete-chips">
                    <span v-for="(selection, index) in selections" :key="index" class="u-autocomplete-chip">
                        <slot name="chip" :item="selection.internalItem.raw" :internal-item="selection.internalItem" :index="index" :props="{ disabled: control.disabled.value || control.readonly.value }">{{ selection.title }}</slot>
                        <button v-if="props.closableChips && !control.readonly.value && !control.disabled.value" v-ripple="props.ripple" type="button" :aria-label="`${locale.t('badge.remove')} ${selection.title}`" @pointerdown.stop.prevent @click.stop="remove(index)"><Icon name="mdi-close" :size="14" /></button>
                    </span>
                </span>
                <input ref="input" :value="display" v-bind="mergeControlAttrs({ ...attrs, class: undefined, style: undefined }, controlAttrs, control.id())" role="combobox" :aria-controls="listId" :aria-expanded="menuVisible" :aria-activedescendant="menuVisible && visible[active] ? `${listId}-${active}` : undefined" :aria-autocomplete="props.selectOnly ? 'none' : 'list'" :placeholder="props.placeholder" :disabled="control.disabled.value" :readonly="control.readonly.value || props.selectOnly" :aria-invalid="control.state.value === false || undefined" @input="onInput" @focus="openMenu(); control.focus()" @click="openMenu()" @keydown="keydown" />
                <slot name="append-inner" :disabled="control.disabled.value" :readonly="control.readonly.value" />
                <button v-if="props.clearable && (selections.length || search) && !control.disabled.value && !control.readonly.value" v-ripple="props.ripple" type="button" class="u-autocomplete-clear" :aria-label="locale.t('cascader.clear')" @pointerdown.prevent @click.stop="clear"><slot name="clear"><Icon name="mdi-close" :size="16" /></slot></button>
                <span v-if="props.loading" class="u-autocomplete-loader"><slot name="loader" /></span>
                <Icon name="mdi-chevron-down" :size="18" class="u-autocomplete-arrow ui-disclosure-icon is-down" :class="{ 'is-open': menuVisible }" />
                <slot name="append" :disabled="control.disabled.value" :readonly="control.readonly.value" />
            </div>
            <span v-if="$slots.selection" class="u-autocomplete-selection">
                <template v-for="(selection, index) in selections" :key="index"><slot name="selection" :item="selection.internalItem.raw" :internal-item="selection.internalItem" :index="index" :props="{ disabled: control.disabled.value || control.readonly.value }" /></template>
            </span>
            <span v-if="!props.chips && props.multiple && selections.length" class="u-autocomplete-summary"><slot name="selection-summary" :items="chosen">{{ chosen.join('、') }}</slot></span>
            <UiMenu v-bind="menuBindings" :activator="input" :model-value="menuVisible" @update:model-value="menuOpen = $event">
                    <slot name="menu-header" :items="visible" />
                    <slot name="prepend-item" :items="visible" />
                    <UVirtualScroll v-if="visible.length" ref="virtualScroll" renderless :items="visible" :item-height="34" height="310" :overscan="4" v-slot="{ item: row, index, itemRef }">
                        <template v-if="$slots.item">
                            <div :ref="itemRef" @pointerdown.prevent @pointerenter="!asSelectionItem(row).disabled && (active = index)">
                                <slot name="item" :item="asSelectionItem(row).raw" :internal-item="asSelectionItem(row)" :index="index" :selected="isSelected(model, asSelectionItem(row), !!props.multiple, !!props.returnObject, props.valueComparator)" :props="itemSlotProps(asSelectionItem(row), index)" />
                            </div>
                        </template>
                        <div v-else :ref="itemRef" v-bind="itemSlotProps(asSelectionItem(row), index)" v-ripple="control.disabled.value || control.readonly.value || asSelectionItem(row).disabled ? false : props.ripple">{{ asSelectionItem(row).title }}</div>
                    </UVirtualScroll>
                    <div v-else-if="!props.hideNoData" class="u-autocomplete-empty"><slot name="no-data" :search="search" :items="visible">{{ noDataLabel }}</slot></div>
                    <slot name="append-item" :items="visible" />
                    <slot name="menu-footer" :items="visible" />
            </UiMenu>
            </div>
        </template>
    </UiControlFrame>
</template>
