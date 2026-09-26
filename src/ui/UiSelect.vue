<script setup lang="ts">
import { getCurrentInstance, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue';
const props = withDefaults(defineProps<{ compact?: boolean; invalid?: boolean; blurOnSelect?: boolean; dense?: boolean; ghost?: boolean; rounded?: boolean }>(), { compact: false, invalid: false, blurOnSelect: true, rounded: true });
const model = defineModel<string | number | null>();
const element = ref<HTMLSelectElement>();
const instance = getCurrentInstance();
function defaultSelection() {
    const vnodeProps = instance?.vnode.props || {};
    if ('modelValue' in vnodeProps || 'model-value' in vnodeProps || model.value !== undefined) return;
    const option = element.value?.options[0] as (HTMLOptionElement & { _value?: string | number }) | undefined;
    if (option) model.value = option._value ?? option.value;
}
onMounted(defaultSelection);
onUpdated(defaultSelection);
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
    if (event.detail > 0 && event.target instanceof HTMLOptionElement) {
        pointerSelection.value = true;
        commit();
    }
}
onBeforeUnmount(() => cancelAnimationFrame(blurFrame));
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <select ref="element" v-model="model" class="ui-select" :class="{ 'is-compact': compact, 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }" :aria-invalid="invalid || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" @pointerdown="pointerSelection = true" @keydown="keyboardSelection" @change="commit" @click="optionClick" @blur="pointerSelection = false"><slot /></select>
</template>
