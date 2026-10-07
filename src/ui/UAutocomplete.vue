<script setup lang="ts">
import { vRipple } from './ripple';
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, useId, watch, type CSSProperties } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import Icon from '../components/Icon.vue';
import UTransition from './UTransition.vue';
import { useDefaults } from './defaults';
import { mergeControlAttrs, useFormControl } from './form';
import { controlSizeStyles } from './control-sizing';
import { findSelection, isSelected, normalizeItems, toggleSelection, type SelectionItem } from './selection';
import type { AutocompleteProps } from './autocomplete-props';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<AutocompleteProps>(), { ripple: true, items: () => [], dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UAutocomplete');
const attrs = useAttrs();
const model = defineModel<unknown>();
const search = defineModel<string>('search', { default: '' });
const input = ref<HTMLInputElement>();
const root = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
const control = useFormControl(props, model, input, attrs);
const open = ref(false);
const active = ref(0);
const listId = `${useId()}-list`;
const allItems = computed(() => normalizeItems(props.items, { itemTitle: props.itemTitle, itemValue: props.itemValue, itemProps: props.itemProps }));
const flatItems = computed(() => allItems.value.flatMap((item) => item.children ? item.children : [item]));
const visible = computed(() => flatItems.value.filter((item) => {
    if (props.hideSelected && isSelected(model.value, item, !!props.multiple, !!props.returnObject, props.valueComparator)) return false;
    return props.filter ? props.filter(item, search.value) : item.title.toLocaleLowerCase().includes(search.value.toLocaleLowerCase());
}));
const chosen = computed(() => (props.multiple ? Array.isArray(model.value) ? model.value : [] : model.value == null ? [] : [model.value])
    .map((value) => findSelection(allItems.value, value, !!props.returnObject, props.valueComparator)?.title ?? String(value)));
const display = computed(() => props.multiple ? '' : search.value || (!open.value ? chosen.value[0] ?? '' : ''));
const menuWidth = ref(0);
let resizeObserver: ResizeObserver | undefined;
watch(visible, () => { active.value = Math.max(0, Math.min(active.value, visible.value.length - 1)); });
watch(open, async (value) => { if (value) { await nextTick(); menuWidth.value = root.value?.getBoundingClientRect().width ?? 0; } });
function choose(item: SelectionItem, pointer = false) {
    if (control.disabled.value || control.readonly.value || item.disabled) return;
    control.editable.value = toggleSelection(model.value, item, !!props.multiple, !!props.returnObject, props.valueComparator, props.max);
    search.value = '';
    if (!props.multiple) open.value = false;
    if (pointer) input.value?.blur();
}
function create() {
    const value = search.value.trim();
    if (!props.combobox || !value || control.disabled.value || control.readonly.value) return;
    const existing = flatItems.value.find((item) => item.title === value);
    if (existing) choose(existing);
    else {
        const item: SelectionItem = { title: value, value, raw: value, props: {}, disabled: false };
        choose(item);
    }
}
function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open.value) { open.value = false; event.preventDefault(); return; }
    if (event.key === 'Tab') { open.value = false; return; }
    if (control.disabled.value || control.readonly.value) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); open.value = true;
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const count = visible.value.length;
        if (count) {
            let next = active.value;
            do { next = (next + direction + count) % count; } while (visible.value[next]?.disabled && next !== active.value);
            active.value = next;
            nextTick(() => menu.value?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' }));
        }
    } else if (event.key === 'Enter' && open.value) {
        event.preventDefault();
        const item = visible.value[active.value];
        if (item && !item.disabled) choose(item);
        else create();
    } else if (event.key === 'Backspace' && props.multiple && !search.value && Array.isArray(model.value) && model.value.length) {
        model.value = model.value.slice(0, -1);
    }
}
function blur(event: FocusEvent) {
    if (root.value?.contains(event.relatedTarget as Node)) return;
    open.value = false;
    control.blur();
}
function remove(index: number) {
    if (control.disabled.value || control.readonly.value || !Array.isArray(model.value)) return;
    model.value = model.value.filter((_, current) => current !== index);
    input.value?.focus();
}
function clear() {
    if (control.disabled.value || control.readonly.value) return;
    model.value = props.multiple ? [] : null;
    search.value = '';
    input.value?.focus();
}
onBeforeUnmount(() => resizeObserver?.disconnect());
defineExpose({ element: input, focus: () => input.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="root" class="u-autocomplete" :class="[$attrs.class, control.classes.value]" :style="[control.styles.value, control.framed.value ? undefined : controlSizeStyles(props), $attrs.style as CSSProperties]" @focusout="blur">
            <div class="u-autocomplete-field" @pointerdown="!control.disabled.value && input?.focus()">
                <span v-if="props.chips && chosen.length" class="u-autocomplete-chips">
                    <span v-for="(title, index) in chosen" :key="index" class="u-autocomplete-chip"><span :title="title">{{ title }}</span><button v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-if="!control.readonly.value && !control.disabled.value" type="button" :aria-label="`移除 ${title}`" @pointerdown.stop.prevent @click.stop="remove(index)"><Icon name="mdi-close" :size="14" /></button></span>
                </span>
                <input ref="input" :value="display" v-bind="mergeControlAttrs({ ...attrs, class: undefined, style: undefined }, controlAttrs, control.id())" role="combobox" :aria-controls="listId" :aria-expanded="open" :aria-activedescendant="open && visible[active] ? `${listId}-${active}` : undefined" aria-autocomplete="list" :placeholder="props.placeholder" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="control.state.value === false || undefined" @input="search = ($event.target as HTMLInputElement).value; open = true; active = 0" @focus="open = true" @keydown="keydown" />
                <button v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-if="props.clearable && chosen.length && !control.disabled.value && !control.readonly.value" type="button" class="u-autocomplete-clear" aria-label="清除选择" @pointerdown.prevent @click.stop="clear"><Icon name="mdi-close" :size="16" /></button>
                <Icon name="mdi-chevron-down" :size="18" class="u-autocomplete-arrow ui-disclosure-icon is-down" :class="{ 'is-open': open }" />
            </div>
            <UTransition variant="fade"><div v-if="open && !control.disabled.value" :id="listId" ref="menu" role="listbox" class="u-autocomplete-menu" :aria-multiselectable="props.multiple || undefined" :style="{ minWidth: `${menuWidth}px` }">
                <template v-if="visible.length">
                    <div v-for="(item, index) in visible" :id="`${listId}-${index}`" :key="index" :data-index="index" role="option" v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" class="u-autocomplete-option" :class="{ 'is-active': active === index, 'is-selected': isSelected(model, item, !!props.multiple, !!props.returnObject, props.valueComparator), 'is-disabled': item.disabled }" :aria-selected="isSelected(model, item, !!props.multiple, !!props.returnObject, props.valueComparator)" :aria-disabled="item.disabled || undefined" @pointerdown.prevent @pointerenter="active = index" @click="choose(item, true)">
                        <slot name="item" :item="item" :index="index" :selected="isSelected(model, item, !!props.multiple, !!props.returnObject, props.valueComparator)">{{ item.title }}</slot>
                    </div>
                </template>
                <div v-else class="u-autocomplete-empty">{{ props.combobox && search ? `按 Enter 创建“${search}”` : props.noDataText ?? '没有匹配项' }}</div>
            </div></UTransition>
            <span v-if="!props.chips && props.multiple && chosen.length" class="u-autocomplete-summary"><slot name="selection" :items="chosen">{{ chosen.join('、') }}</slot></span>
        </div>
    </UiControlFrame>
</template>
