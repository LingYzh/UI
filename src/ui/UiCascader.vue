<script setup lang="ts" generic="Multiple extends boolean = false">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRefs, useAttrs, useId, watch, type CSSProperties } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import UiIcon from '../components/Icon.vue';
import { mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';
import UCheckbox from './UiCheckbox.vue';
import UChip from './UChip.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';
import {
    areCascaderPathsEqual,
    canToggleCascaderPath,
    getCascaderSelectionState,
    hasCascaderPath,
    isCascaderPathDisabled,
    isCascaderPathValid,
    isCascaderPathsValid,
    normalizeCascaderPaths,
    resolveCascaderPath,
    searchSelectableCascaderPaths,
    toggleCascaderPath,
    type CascaderItem,
    type CascaderPath,
    type CascaderPathOption,
    type CascaderValue
} from './cascader';
import { uiText } from './locale';
import { vPointerBlur } from './pointer-focus';
import { useDefaults } from './defaults';

type CascaderModel<Multiple extends boolean> = Multiple extends true
    ? CascaderValue[][] | null
    : CascaderValue[] | null;

type CascaderProps<Multiple extends boolean> = ControlSizing & FormControlProps & {
    items: readonly CascaderItem[];
    multiple?: Multiple & boolean;
    filterable?: boolean;
    checkStrictly?: boolean;
    max?: number;
    placeholder?: string;
    searchPlaceholder?: string;
    chips?: boolean;
    collapseTags?: boolean;
    maxCollapseTags?: number;
    clearable?: boolean;
    changeOnSelect?: boolean;
    showAllLevels?: boolean;
    separator?: string;
    invalid?: boolean;
    ripple?: RippleOptions;
};

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<CascaderProps<Multiple>>(), {
    ripple: true,
    showAllLevels: true,
    separator: ' / ',
    chips: true,
    collapseTags: false,
    maxCollapseTags: 1,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});
const props = useDefaults(rawProps, 'UCascader') as CascaderProps<Multiple>;
defineEmits<{ 'update:focused': [value: boolean] }>();
const model = defineModel<CascaderModel<Multiple>>({ default: () => [] });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const triggerRoot = ref<HTMLDivElement>();
const surface = ref<HTMLElement>();
const open = ref(false);
const draft = ref<CascaderValue[]>([]);
const searchQuery = ref('');
const composing = ref(false);
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '-');
const popupId = 'ui-cascader-' + uid;
const anchor = '--ui-cascader-' + uid;
let keyboardInteraction = false;
let blurFrame = 0;
const multiple = computed(() => props.multiple === true);
const filterable = computed(() => props.filterable === true);
const checkStrictly = computed(() => props.checkStrictly === true);
const required = computed(() => attrs.required !== undefined && attrs.required !== false);
const modelPath = computed<CascaderValue[]>(() => {
    if (multiple.value || !Array.isArray(model.value)) return [];
    return model.value as CascaderValue[];
});
const selectedPaths = computed<CascaderValue[][]>(() => {
    if (!multiple.value || !Array.isArray(model.value)) return [];
    return normalizeCascaderPaths(model.value as CascaderValue[][]);
});
const selected = computed(() => resolveCascaderPath(props.items, modelPath.value));
function formatPath(path: CascaderPath): string {
    const nodes = resolveCascaderPath(props.items, path);
    return nodes.length === path.length
        ? nodes.map(item => item.label).join(props.separator)
        : path.map(value => String(value)).join(props.separator);
}
const display = computed(() => multiple.value
    ? selectedPaths.value.map(formatPath).join('; ')
    : selected.value.length === modelPath.value.length
        ? (props.showAllLevels ? selected.value : selected.value.slice(-1)).map(item => item.label).join(props.separator)
        : '');
const hasValue = computed(() => multiple.value ? selectedPaths.value.length > 0 : modelPath.value.length > 0);
const showChips = computed(() => multiple.value && props.chips !== false && selectedPaths.value.length > 0);
const maxCollapseTags = computed(() => Math.max(1, Number.isFinite(props.maxCollapseTags) ? Math.floor(props.maxCollapseTags ?? 1) : 1));
const visibleSelectedPaths = computed(() => props.collapseTags
    ? selectedPaths.value.slice(0, maxCollapseTags.value)
    : selectedPaths.value);
const hiddenSelectedPaths = computed(() => selectedPaths.value.slice(visibleSelectedPaths.value.length));
const hiddenSelectedCount = computed(() => hiddenSelectedPaths.value.length);
const hiddenSelectedText = computed(() => hiddenSelectedPaths.value.map(formatPath).join('; '));
const rules = computed(() => {
    const items = props.items;
    const changeOnSelect = props.changeOnSelect;
    const strict = checkStrictly.value;
    const isMultiple = multiple.value;
    return [
        (value: unknown) => !required.value || (Array.isArray(value) && value.length > 0) || uiText('cascader.required'),
        (value: unknown) => {
            if (value == null) return true;
            if (!Array.isArray(value)) return false;
            return isMultiple
                ? isCascaderPathsValid(items, value as CascaderValue[][], strict) || uiText('cascader.invalid')
                : isCascaderPathValid(items, value as CascaderValue[], Boolean(changeOnSelect || strict)) || uiText('cascader.invalid');
        },
        ...props.rules ?? []
    ];
});
const control = useFormControl(reactive({ ...toRefs(props), rules }), model, element, attrs);
const inputValue = computed({
    get: () => filterable.value && (open.value || searchQuery.value.length > 0)
        ? searchQuery.value
        : multiple.value && showChips.value
            ? ''
            : display.value,
    set: (value: string) => {
        if (filterable.value && !control.disabled.value && !control.readonly.value) searchQuery.value = value;
    }
});
const columns = computed(() => {
    const levels: (readonly CascaderItem[])[] = [props.items];
    for (const item of resolveCascaderPath(props.items, draft.value)) {
        if (!item.children?.length) break;
        levels.push(item.children);
    }
    return levels;
});
const invalid = computed(() => props.invalid || control.state.value === false || attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true');
const searching = computed(() => filterable.value && open.value && !composing.value && searchQuery.value.trim().length > 0);
const searchResults = computed(() => searching.value
    ? searchSelectableCascaderPaths(props.items, searchQuery.value, props.separator, {
        multiple: multiple.value,
        checkStrictly: checkStrictly.value,
        changeOnSelect: props.changeOnSelect
    })
    : []);
function setSingleModel(path: CascaderValue[]) {
    model.value = path as CascaderModel<Multiple>;
}
function setMultipleModel(paths: CascaderValue[][]) {
    model.value = paths as CascaderModel<Multiple>;
}
function pathKey(path: CascaderPath): string {
    return JSON.stringify(path);
}
function selectionState(path: CascaderPath) {
    return getCascaderSelectionState(props.items, path, selectedPaths.value, checkStrictly.value);
}
function canToggle(path: CascaderPath): boolean {
    return canToggleCascaderPath(props.items, selectedPaths.value, path, {
        checkStrictly: checkStrictly.value,
        max: props.max
    });
}
function canSelectPath(path: CascaderPath): boolean {
    if (!path.length || control.disabled.value || control.readonly.value || isCascaderPathDisabled(props.items, path)) return false;
    if (multiple.value) return canToggle(path);
    return isCascaderPathValid(props.items, path, Boolean(props.changeOnSelect || checkStrictly.value));
}
function checkboxDisabled(path: CascaderPath): boolean {
    return control.disabled.value || control.readonly.value || selectionState(path).disabled || !canToggle(path);
}
function optionDisabled(path: CascaderPath, item: CascaderItem): boolean {
    if (control.disabled.value || control.readonly.value || isCascaderPathDisabled(props.items, path)) return true;
    return multiple.value && !item.children?.length && !canToggle(path);
}
function optionSelected(path: CascaderPath, level: number, item: CascaderItem): boolean {
    return multiple.value ? selectionState(path).checked : draft.value[level] === item.value;
}
function columnPath(level: number, item: CascaderItem): CascaderValue[] {
    return [...draft.value.slice(0, level), item.value];
}
function triggerAttrs() {
    const { class: _class, style: _style, required: _required, ...rest } = attrs;
    return rest;
}
function pointerInteraction() {
    if (open.value) keyboardInteraction = false;
}
function markKeyboardInteraction() {
    keyboardInteraction = true;
}
function close() {
    if (surface.value?.matches(':popover-open')) surface.value.hidePopover();
}
function openPopup() {
    if (control.disabled.value || control.readonly.value || surface.value?.matches(':popover-open')) return;
    const showPopover = surface.value?.showPopover as ((options: { source?: HTMLElement }) => void) | undefined;
    showPopover?.call(surface.value, { source: triggerRoot.value ?? element.value });
}
function togglePopup() {
    if (control.disabled.value || control.readonly.value) return;
    if (surface.value?.matches(':popover-open')) close();
    else openPopup();
}
function onTriggerClick(event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('button, .ui-chip, .ui-cascader-clear, [data-cascader-no-open]')) return;
    openPopup();
}
function focusColumn(level: number, value?: CascaderValue) {
    const items = Array.from(surface.value?.querySelectorAll<HTMLButtonElement>('[data-level="' + level + '"] [role="option"]:not(:disabled)') ?? []);
    const index = columns.value[level]?.findIndex(item => item.value === value) ?? -1;
    const candidate = index >= 0 ? surface.value?.querySelector<HTMLButtonElement>('[data-level="' + level + '"] [role="option"][data-index="' + index + '"]') : undefined;
    const target = candidate && !candidate.disabled ? candidate : items[0] ?? surface.value;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function focusSearchResult(index: number) {
    const options = Array.from(surface.value?.querySelectorAll<HTMLButtonElement>('.ui-cascader-search-option[role="option"]:not(:disabled)') ?? []);
    if (!options.length) return;
    const normalizedIndex = (index + options.length) % options.length;
    options[normalizedIndex]?.focus({ preventScroll: true });
    options[normalizedIndex]?.scrollIntoView({ block: 'nearest' });
}
function beforeToggle(event: Event) {
    const newState = (event as ToggleEvent).newState;
    // toggle 延迟派发；关闭后立即输入时必须按原生弹层的同步状态重新打开。
    open.value = newState === 'open';
    if (open.value) cancelAnimationFrame(blurFrame);
    searchQuery.value = '';
    if (newState === 'open') {
        draft.value = multiple.value
            ? resolveCascaderPath(props.items, selectedPaths.value[0] ?? []).map(item => item.value)
            : selected.value.map(item => item.value);
    }
}
function toggled() {
    open.value = surface.value?.matches(':popover-open') ?? false;
    if (open.value) {
        if (!filterable.value && keyboardInteraction) nextTick(() => focusColumn(0, draft.value[0]));
        return;
    }
    const activeElement = document.activeElement;
    if (keyboardInteraction && (!activeElement || activeElement === document.body || surface.value?.contains(activeElement))) {
        element.value?.focus({ preventScroll: true });
    } else if (!keyboardInteraction) {
        cancelAnimationFrame(blurFrame);
        blurFrame = requestAnimationFrame(() => {
            if (document.activeElement === element.value) element.value?.blur();
        });
    }
}
function togglePath(path: CascaderPath, keyboard = false) {
    if (!multiple.value || control.disabled.value || control.readonly.value) return;
    const result = toggleCascaderPath(props.items, selectedPaths.value, path, {
        checkStrictly: checkStrictly.value,
        max: props.max
    });
    if (!result.accepted) return;
    setMultipleModel(result.paths);
    if (keyboard) nextTick(() => element.value?.focus({ preventScroll: true }));
}
function removeSelectedPath(path: CascaderPath) {
    if (!multiple.value || control.disabled.value || control.readonly.value) return;
    setMultipleModel(selectedPaths.value.filter(candidate => !areCascaderPathsEqual(candidate, path)));
}
async function choose(item: CascaderItem, level: number, keyboard = false) {
    const path = columnPath(level, item);
    if (control.disabled.value || control.readonly.value || isCascaderPathDisabled(props.items, path)) return;
    keyboardInteraction = keyboard;
    if (multiple.value) {
        if (item.children?.length) {
            draft.value = path;
            await nextTick();
            if (keyboard) focusColumn(level + 1);
            else surface.value?.querySelector<HTMLElement>('[data-level="' + (level + 1) + '"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
            togglePath(path, keyboard);
        }
        return;
    }
    draft.value = path;
    if (!item.children?.length || props.changeOnSelect) {
        selectPath(path, keyboard);
    } else {
        await nextTick();
        if (keyboard) focusColumn(level + 1);
        else surface.value?.querySelector<HTMLElement>('[data-level="' + (level + 1) + '"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
}
function selectPath(path: CascaderPath, keyboard = false): boolean {
    if (multiple.value || !canSelectPath(path)) return false;
    keyboardInteraction = keyboard;
    setSingleModel([...path]);
    draft.value = [...path];
    close();
    return true;
}
function isSearchResultDisabled(option: CascaderPathOption): boolean {
    return !canSelectPath(option.path);
}
function isSearchResultSelected(option: CascaderPathOption): boolean {
    return multiple.value
        ? selectionState(option.path).checked
        : hasCascaderPath([modelPath.value], option.path);
}
function chooseSearchResult(option: CascaderPathOption, keyboard = false) {
    if (!canSelectPath(option.path)) return;
    keyboardInteraction = keyboard;
    if (multiple.value) {
        togglePath(option.path, keyboard);
        return;
    }
    selectPath(option.path, keyboard);
}
function navigateOptions(direction: 1 | -1) {
    if (searching.value) focusSearchResult(direction > 0 ? 0 : -1);
    else focusColumn(0, draft.value[0]);
}
function searchResultKeydown(event: KeyboardEvent, index: number) {
    const options = Array.from(surface.value?.querySelectorAll<HTMLButtonElement>('.ui-cascader-search-option[role="option"]:not(:disabled)') ?? []);
    if (!options.length) return;
    const foundIndex = options.indexOf(event.currentTarget as HTMLButtonElement);
    const currentIndex = foundIndex >= 0 ? foundIndex : index;
    const targets: Record<string, number> = {
        ArrowDown: (currentIndex + 1) % options.length,
        ArrowUp: currentIndex <= 0 ? options.length - 1 : currentIndex - 1,
        Home: 0,
        End: options.length - 1
    };
    if (event.key in targets) {
        event.preventDefault();
        keyboardInteraction = true;
        focusSearchResult(targets[event.key]);
    }
}
function keydown(event: KeyboardEvent, level: number, item: CascaderItem) {
    keyboardInteraction = true;
    const buttons = Array.from(surface.value?.querySelectorAll<HTMLButtonElement>('[data-level="' + level + '"] [role="option"]:not(:disabled)') ?? []);
    const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
    const targets: Record<string, number> = {
        ArrowDown: (index + 1) % buttons.length,
        ArrowUp: index <= 0 ? buttons.length - 1 : index - 1,
        Home: 0,
        End: buttons.length - 1
    };
    if (event.key in targets) {
        event.preventDefault();
        buttons[targets[event.key]]?.focus();
    } else if (event.key === 'ArrowRight' && item.children?.length) {
        event.preventDefault();
        draft.value = [...draft.value.slice(0, level), item.value];
        nextTick(() => focusColumn(level + 1));
    } else if (event.key === 'ArrowLeft' && level > 0) {
        event.preventDefault();
        focusColumn(level - 1, draft.value[level - 1]);
    }
}
function triggerKey(event: KeyboardEvent) {
    keyboardInteraction = true;
    control.guardKeys(event);
    if (event.defaultPrevented || control.disabled.value || control.readonly.value || composing.value || event.isComposing) return;
    if (event.key === 'Tab') {
        if (open.value) close();
        return;
    }
    if (event.key === 'Escape') {
        if (open.value) {
            event.preventDefault();
            close();
        }
        return;
    }
    if (event.key === 'Backspace' && multiple.value && !searchQuery.value && selectedPaths.value.length) {
        event.preventDefault();
        removeSelectedPath(selectedPaths.value[selectedPaths.value.length - 1]);
        return;
    }
    if (event.key === 'Enter' && !open.value) {
        event.preventDefault();
        openPopup();
        return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open.value) {
            openPopup();
            nextTick(() => navigateOptions(event.key === 'ArrowDown' ? 1 : -1));
        } else {
            navigateOptions(event.key === 'ArrowDown' ? 1 : -1);
        }
    }
}
function inlineInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target || !filterable.value || control.disabled.value || control.readonly.value) return;
    const value = target.value;
    if (!open.value) openPopup();
    searchQuery.value = value;
}
function inlineCompositionStart() {
    if (!filterable.value || control.disabled.value || control.readonly.value) return;
    composing.value = true;
    if (!open.value) openPopup();
}
function inlineCompositionEnd(event: CompositionEvent) {
    composing.value = false;
    const target = event.target as HTMLInputElement | null;
    if (target && (target === document.activeElement || open.value)) inlineInput(event);
}
function clear(event: MouseEvent) {
    event.stopPropagation();
    if (control.disabled.value || control.readonly.value) return;
    keyboardInteraction = event.detail === 0;
    if (multiple.value) setMultipleModel([]);
    else setSingleModel([]);
    draft.value = [];
    searchQuery.value = '';
    close();
    if (keyboardInteraction) element.value?.focus();
}
function fieldBlur(event: FocusEvent) {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) control.blur();
}
function popupKey(event: KeyboardEvent) {
    keyboardInteraction = true;
    if (event.key === 'Escape') {
        close();
    } else if (event.key === 'Tab') {
        close();
        element.value?.focus();
    }
}
watch([control.disabled, control.readonly], () => {
    if (control.disabled.value || control.readonly.value) close();
});
watch(model, () => {
    if (open.value && !multiple.value) draft.value = selected.value.map(item => item.value);
});
watch(() => props.items, () => {
    close();
    draft.value = [];
    control.resetValidation();
}, { deep: true });
onMounted(() => document.addEventListener('pointerdown', pointerInteraction, true));
onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', pointerInteraction, true);
    cancelAnimationFrame(blurFrame);
    close();
});
defineExpose({ element, focus: () => element.value?.focus(), close, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.displayErrors.value.join('\n')" :required="required" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-cascader" :class="[$attrs.class, { 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'is-inline': props.inline, 'is-multiple': multiple }]" :style="[control.framed.value ? undefined : controlSizeStyles(props), $attrs.style as CSSProperties]" @focusin="!($event.currentTarget as HTMLElement).contains($event.relatedTarget as Node | null) && control.focus()" @focusout="fieldBlur">
            <div ref="triggerRoot" class="ui-cascader-trigger ui-input" :class="[control.classes.value, { 'is-disabled': control.disabled.value, 'is-readonly': control.readonly.value, 'has-chips': showChips }]" :style="[control.styles.value, { anchorName: anchor }]"
                @pointerdown="keyboardInteraction = false" @click="onTriggerClick">
                <div class="ui-cascader-content">
                    <UChip v-if="showChips" v-for="path in visibleSelectedPaths" :key="pathKey(path)" :closable="!control.disabled.value && !control.readonly.value" :close-label="`移除 ${formatPath(path)}`" class="ui-cascader-chip" dense label @close="removeSelectedPath(path)">
                        {{ formatPath(path) }}
                    </UChip>
                    <UChip v-if="showChips && hiddenSelectedCount" class="ui-cascader-chip ui-cascader-count" dense label :title="hiddenSelectedText" :aria-label="`另有 ${hiddenSelectedCount} 个已选路径：${hiddenSelectedText}`">+{{ hiddenSelectedCount }}</UChip>
                    <input v-focus-modality ref="element" v-bind="mergeControlAttrs(triggerAttrs(), controlAttrs, control.id())" class="ui-cascader-input" :value="inputValue" type="text" role="combobox" :disabled="control.disabled.value" :readonly="control.readonly.value || !filterable" :aria-readonly="control.readonly.value || undefined" :aria-required="required || undefined" :aria-invalid="invalid || undefined" :placeholder="showChips ? '' : props.placeholder || uiText('cascader.placeholder')" :title="!showChips ? display : undefined" aria-haspopup="dialog" :aria-expanded="open" :aria-controls="popupId"
                        @keydown="triggerKey" @input="inlineInput" @compositionstart="inlineCompositionStart" @compositionend="inlineCompositionEnd"/>
                </div>
                <button v-if="props.clearable && hasValue && !control.readonly.value" v-ripple="control.disabled.value ? false : props.ripple" v-pointer-blur type="button" class="ui-control-clear" :disabled="control.disabled.value" :aria-label="uiText('cascader.clear')" @click.stop="clear"><UiIcon name="$close" :size="16" /></button>
                <button v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-pointer-blur type="button" class="ui-control-clear" :disabled="control.disabled.value || control.readonly.value" :aria-label="open ? '收起级联选项' : '展开级联选项'" :aria-expanded="open" @click.stop="togglePopup"><UiIcon name="$expand" :size="18" class="ui-disclosure-icon is-down" :class="{ 'is-open': open }" /></button>
            </div>
            <div :id="popupId" ref="surface" popover="auto" class="ui-menu-surface ui-cascader-panel" data-placement="bottom-start" role="dialog" :aria-label="`${props.label || uiText('cascader.placeholder')} ${uiText('common.options')}`" tabindex="-1" :style="{ positionAnchor: anchor }"
                @beforetoggle="beforeToggle" @toggle="toggled" @pointerdown.capture="keyboardInteraction = false" @keydown.capture="markKeyboardInteraction" @keydown="popupKey">
                <div v-if="searching" class="ui-cascader-search-results" role="listbox" :aria-label="uiText('common.options')" :aria-multiselectable="multiple || undefined">
                    <div v-for="(option, index) in searchResults" :key="pathKey(option.path)" class="ui-cascader-search-result">
                        <UCheckbox v-if="multiple" :model-value="selectionState(option.path).checked" :indeterminate="selectionState(option.path).indeterminate" :disabled="checkboxDisabled(option.path)" :ripple="control.disabled.value || control.readonly.value ? false : props.ripple" :aria-label="`选择 ${formatPath(option.path)}`" @update:model-value="togglePath(option.path)" />
                        <button type="button" role="option" class="ui-cascader-option ui-cascader-search-option" :data-search-index="index" :disabled="isSearchResultDisabled(option)" :aria-selected="isSearchResultSelected(option)"
                            @click="chooseSearchResult(option, $event.detail === 0)" @keydown="searchResultKeydown($event, index)">
                            <span :title="formatPath(option.path)">{{ formatPath(option.path) }}</span>
                            <UiIcon v-if="!multiple && isSearchResultSelected(option)" name="$complete" :size="14" />
                        </button>
                    </div>
                    <p v-if="!searchResults.length" class="ui-cascader-empty" role="status">无匹配结果</p>
                </div>
                <div v-else class="ui-cascader-columns">
                    <div v-for="(items, level) in columns" :key="level" class="ui-cascader-column" role="listbox" :aria-label="uiText('cascader.level', { level: level + 1 })" :aria-multiselectable="multiple || undefined" :data-level="level">
                        <div v-for="(item, index) in items" :key="pathKey(columnPath(level, item))" class="ui-cascader-option-row">
                            <UCheckbox v-if="multiple" :model-value="selectionState(columnPath(level, item)).checked" :indeterminate="selectionState(columnPath(level, item)).indeterminate" :disabled="checkboxDisabled(columnPath(level, item))" :ripple="control.disabled.value || control.readonly.value ? false : props.ripple" :aria-label="`选择 ${formatPath(columnPath(level, item))}`" @update:model-value="togglePath(columnPath(level, item))" />
                            <button v-else-if="checkStrictly" v-ripple="props.ripple" v-pointer-blur type="button" class="ui-cascader-node-select" :disabled="!canSelectPath(columnPath(level, item))" :aria-label="`选择 ${formatPath(columnPath(level, item))}`" :aria-pressed="hasCascaderPath([modelPath], columnPath(level, item))" @click="selectPath(columnPath(level, item))"><UiIcon :icon="hasCascaderPath([modelPath], columnPath(level, item)) ? mdiRadioboxMarked : mdiRadioboxBlank" :size="18" /></button>
                            <button v-focus-modality v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" type="button" role="option" class="ui-cascader-option" :data-index="index" :disabled="optionDisabled(columnPath(level, item), item)" :aria-selected="optionSelected(columnPath(level, item), level, item)" :aria-label="item.children?.length ? `${formatPath(columnPath(level, item))} ${uiText('cascader.branch')}` : formatPath(columnPath(level, item))"
                                @click="choose(item, level, $event.detail === 0)" @keydown="keydown($event, level, item)">
                                <span :title="item.label">{{ item.label }}</span>
                                <UiIcon v-if="item.children?.length" name="$next" :size="14" />
                                <UiIcon v-else-if="!multiple && draft[level] === item.value" name="$complete" :size="14" />
                            </button>
                        </div>
                        <p v-if="!items.length" class="ui-cascader-empty" role="status">{{ uiText('common.empty') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </UiControlFrame>
</template>
