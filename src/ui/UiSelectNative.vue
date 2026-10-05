<script setup lang="ts">
import { getCurrentInstance, h, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, type CSSProperties } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import UiScrollArea from './UiScrollArea.vue';
import { uiText } from './locale';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
export interface SelectItem {
    value: string | number;
    label: string;
    description?: string;
    hint?: string;
    disabled?: boolean;
}
// Customizable selects permit rich option content. Vue's template nesting validator
// still applies classic option rules; create this browser-gated subtree with VNodes.
const RichOption = ({ item }: { item: SelectItem }) => h('option', { value: item.value, disabled: item.disabled }, [
    h('span', { class: 'ui-select-item-copy' }, [
        h('span', { class: 'ui-select-item-label' }, item.label),
        item.description ? h('span', { class: 'ui-select-item-description' }, item.description) : null,
    ]),
    item.hint ? h('span', { class: 'ui-select-item-hint', 'aria-hidden': 'true' }, item.hint) : null,
]);
const SelectedContent = () => h('selectedcontent');
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & FormControlProps & { items?: SelectItem[]; menuTitle?: string; placeholder?: string; compact?: boolean; invalid?: boolean; blurOnSelect?: boolean }>(), { compact: false, invalid: false, blurOnSelect: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const attrs = useAttrs();
const model = defineModel<string | number | null>();
const element = ref<HTMLSelectElement>();
const control = useFormControl(props, model, element, attrs);
const instance = getCurrentInstance();
const customPicker = typeof CSS !== 'undefined' && CSS.supports('appearance', 'base-select');
let optionObserver: MutationObserver | undefined;
function defaultSelection() {
    const vnodeProps = instance?.vnode.props || {};
    if ('modelValue' in vnodeProps || 'model-value' in vnodeProps || model.value !== undefined) return;
    const option = element.value?.options[0] as (HTMLOptionElement & { _value?: string | number }) | undefined;
    if (option) model.value = option._value ?? option.value;
}
function syncSelectedContent() {
    defaultSelection();
    if (!customPicker) return;
    const select = element.value;
    const selectedContent = select?.querySelector('selectedcontent');
    const option = select?.selectedOptions[0];
    // Chromium can retain the old clone when an existing option's Vue subtree changes.
    // Refresh only the browser-owned display; preserve the select, value and focus.
    if (selectedContent && option && (selectedContent.childNodes.length !== option.childNodes.length
        || Array.from(option.childNodes).some((node, index) => !node.isEqualNode(selectedContent.childNodes[index])))) {
        selectedContent.replaceChildren(...Array.from(option.childNodes, node => node.cloneNode(true)));
    }
}
onMounted(() => {
    syncSelectedContent();
    // Slot content can update inside UiScrollArea without updating this component.
    const options = element.value?.querySelector('.ui-select-options .ui-scroll-content');
    if (customPicker && options) {
        optionObserver = new MutationObserver(syncSelectedContent);
        optionObserver.observe(options, { childList: true, subtree: true, characterData: true });
    }
});
onUpdated(syncSelectedContent);
const pointerSelection = ref(false);
let blurFrame = 0;
function keyboardSelection(event: KeyboardEvent) {
    control.guardKeys(event);
    pointerSelection.value = false;
    cancelAnimationFrame(blurFrame);
}
function commit() {
    // Keyboard users keep their tab position; pointer selections release focus.
    if (props.blurOnSelect && pointerSelection.value) {
        const select = element.value;
        select?.blur();
        // Chromium restores focus after dismissing its native picker.
        cancelAnimationFrame(blurFrame);
        blurFrame = requestAnimationFrame(() => {
            if (document.activeElement === select) select?.blur();
        });
    }
    pointerSelection.value = false;
}
function optionClick(event: MouseEvent) {
    if (event.detail > 0 && event.target instanceof Element && event.target.closest('option')) {
        pointerSelection.value = true;
        commit();
    }
}
onBeforeUnmount(() => { cancelAnimationFrame(blurFrame); optionObserver?.disconnect(); });
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <select ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="ui-select" :class="{ 'is-described': Boolean(items), 'is-compact': compact, 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'is-inline': inline }" :style="[control.framed.value ? undefined : controlSizeStyles(props), attrs.style as CSSProperties]" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="invalid || control.state.value === false || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" @pointerdown="pointerSelection = true; control.guard($event)" @keydown="keyboardSelection" @change="commit" @click="control.guard($event); optionClick($event)" @blur="pointerSelection = false; control.blur()">
            <button v-if="customPicker" type="button"><SelectedContent /></button>
            <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
            <UiScrollArea v-if="customPicker" class="ui-select-options" :label="uiText('common.options')" :max-height="items ? 'min(420px, 65dvh)' : 'min(320px, 50dvh)'" :focusable="false">
                <template v-if="items">
                    <div v-if="menuTitle" class="ui-select-menu-title" aria-hidden="true">{{ menuTitle }}</div>
                    <RichOption v-for="item in items" :key="item.value" :item="item" />
                </template>
                <slot v-else />
            </UiScrollArea>
            <template v-else-if="items"><option v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled">{{ item.label }}</option></template>
            <slot v-else />
        </select>
    </UiControlFrame>
</template>
