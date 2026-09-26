<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [value: boolean]; 'present-change': [value: boolean]; opened: []; closed: [] }>();
const element = ref<HTMLDialogElement>();
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
let generation = 0;
let backdropPressed = false;
let returnFocus: HTMLElement | null = null;
function requestClose() { emit('update:open', false); }
async function sync() {
    const dialog = element.value;
    if (!dialog) return;
    const current = ++generation;
    if (props.open) {
        if (!dialog.open) {
            returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            emit('present-change', true);
            dialog.showModal();
        }
        state.value = 'opening';
    } else {
        if (!dialog.open) return;
        state.value = 'closing';
    }
    await nextTick();
    // Reading computed style starts the CSS animations, including the backdrop.
    getComputedStyle(dialog).opacity;
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation) return;
    if (props.open) {
        state.value = 'open';
        emit('opened');
    } else {
        state.value = 'closed';
        dialog.close();
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        emit('present-change', false);
        emit('closed');
    }
}
function outside(event: PointerEvent) {
    const dialog = element.value!;
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
}
function pointerDown(event: PointerEvent) { backdropPressed = outside(event); }
function pointerUp(event: PointerEvent) {
    if (backdropPressed && outside(event)) requestClose();
    backdropPressed = false;
}
watch(() => props.open, sync, { flush: 'post' });
onMounted(sync);
onBeforeUnmount(() => { generation++; element.value?.close(); emit('present-change', false); });
defineExpose({ element });
</script>

<template>
    <dialog ref="element" class="ui-dialog" :data-state="state" @cancel.prevent="requestClose" @pointerdown="pointerDown" @pointerup="pointerUp"><slot /></dialog>
</template>
