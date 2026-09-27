<script setup lang="ts">
import { getCurrentInstance, h, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue';
import UiScrollArea from './UiScrollArea.vue';
export interface SelectItem {
    value: string;
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
const props = withDefaults(defineProps<{ items?: SelectItem[]; menuTitle?: string; placeholder?: string; compact?: boolean; invalid?: boolean; blurOnSelect?: boolean; dense?: boolean; ghost?: boolean; rounded?: boolean }>(), { compact: false, invalid: false, blurOnSelect: true, rounded: true });
const model = defineModel<string | number | null>();
const element = ref<HTMLSelectElement>();
const instance = getCurrentInstance();
const customPicker = typeof CSS !== 'undefined' && CSS.supports('appearance', 'base-select');
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
    if (selectedContent && option) selectedContent.replaceChildren(...Array.from(option.childNodes, node => node.cloneNode(true)));
}
onMounted(syncSelectedContent);
onUpdated(syncSelectedContent);
const pointerSelection = ref(false);
let blurFrame = 0;
function keyboardSelection() {
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
onBeforeUnmount(() => cancelAnimationFrame(blurFrame));
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <select ref="element" v-model="model" class="ui-select" :class="{ 'is-described': Boolean(items), 'is-compact': compact, 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }" :aria-invalid="invalid || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" @pointerdown="pointerSelection = true" @keydown="keyboardSelection" @change="commit" @click="optionClick" @blur="pointerSelection = false">
        <button v-if="items && customPicker" type="button"><selectedcontent /></button>
        <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
        <UiScrollArea v-if="customPicker" class="ui-select-options" label="可选项" :max-height="items ? 'min(420px, 65dvh)' : 'min(320px, 50dvh)'" :focusable="false">
            <template v-if="items">
                <div v-if="menuTitle" class="ui-select-menu-title" aria-hidden="true">{{ menuTitle }}</div>
                <RichOption v-for="item in items" :key="item.value" :item="item" />
            </template>
            <slot v-else />
        </UiScrollArea>
        <template v-else-if="items"><option v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled">{{ item.label }}</option></template>
        <slot v-else />
    </select>
</template>
