<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import UiScrollArea from './UiScrollArea.vue';
import { uiText } from './locale';
import { wasPointerActivated } from './pointer-focus';
import { provideUiTheme } from './theme';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{
    theme?: string;
    open?: boolean;
    modelValue?: boolean;
    persistent?: boolean;
    fullscreen?: boolean;
    scrollable?: boolean;
    error?: string;
    contentLabel?: string;
    /** 固定宽度档位；不传时保持原行为（普通弹窗按内容、scrollable 为 680px）。 */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** end 为贴靠行内结束边的整高抽屉。 */
    placement?: 'center' | 'end';
}>(), { open: undefined, modelValue: undefined, scrollable: false, error: '', contentLabel: undefined, size: undefined, placement: 'center' });
const props = useDefaults(rawProps, 'UDialog');
const emit = defineEmits<{ 'update:open': [value: boolean]; 'update:modelValue': [value: boolean]; 'present-change': [value: boolean]; opened: []; closed: [] }>();
const localOpen = ref(false);
const isOpen = computed(() => props.modelValue ?? props.open ?? localOpen.value);
const themeContext = provideUiTheme(() => props.theme);
const element = ref<HTMLDialogElement>();
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
const errorElement = ref<HTMLElement>();
const errorSpace = ref(0);
let errorObserver: ResizeObserver | undefined;
watch(errorElement, (next, previous) => {
    if (previous) errorObserver?.unobserve(previous);
    errorSpace.value = next ? next.offsetHeight + 12 : 0;
    if (next) errorObserver?.observe(next);
});
let generation = 0;
let backdropPressed = false;
let returnFocus: HTMLElement | null = null;
let restoreKeyboardFocus = true;
function requestClose() {
    if (props.persistent) return;
    localOpen.value = false;
    emit('update:open', false);
    emit('update:modelValue', false);
}
async function sync() {
    const dialog = element.value;
    if (!dialog) return;
    const current = ++generation;
    if (isOpen.value) {
        if (!dialog.open) {
            returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            restoreKeyboardFocus = !wasPointerActivated(returnFocus);
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
    if (isOpen.value) {
        state.value = 'open';
        emit('opened');
    } else {
        state.value = 'closed';
        dialog.close();
        if (returnFocus?.isConnected) {
            if (restoreKeyboardFocus) returnFocus.focus({ preventScroll: true });
            else if (document.activeElement === returnFocus && returnFocus.matches('button, [role="button"], [role="tab"], input[type="checkbox"], input[type="radio"]')) returnFocus.blur();
        }
        emit('present-change', false);
        emit('closed');
    }
}
function outside(event: PointerEvent) {
    const dialog = element.value!;
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
}
function pointerDown(event: PointerEvent) { restoreKeyboardFocus = false; backdropPressed = outside(event); }
function pointerUp(event: PointerEvent) {
    if (backdropPressed && outside(event)) requestClose();
    backdropPressed = false;
}
watch(isOpen, sync, { flush: 'post' });
onMounted(() => {
    errorObserver = new ResizeObserver(() => { errorSpace.value = errorElement.value ? errorElement.value.offsetHeight + 12 : 0; });
    if (errorElement.value) errorObserver.observe(errorElement.value);
    sync();
});
onBeforeUnmount(() => { errorObserver?.disconnect(); generation++; element.value?.close(); emit('present-change', false); });
defineExpose({ element });
</script>

<template>
    <dialog ref="element" class="ui-dialog" :style="props.theme ? themeContext.styles.value : undefined" :data-ui-theme="props.theme ? themeContext.name.value : undefined" :data-theme="props.theme ? (themeContext.current.value.dark ? 'dark' : 'light') : undefined" :class="[{ 'ui-dialog--scrollable': props.scrollable, 'ui-dialog--end': props.placement === 'end' }, props.size ? `ui-dialog--${props.size}` : '']" :data-state="state" @cancel.prevent="requestClose" @pointerdown.capture="pointerDown" @keydown.capture="restoreKeyboardFocus = true" @pointerup="pointerUp">
        <template v-if="props.scrollable">
            <header v-if="$slots.header" class="ui-dialog-header"><slot name="header" /></header>
            <div class="ui-dialog-content" :style="{ '--ui-dialog-error-space': `${errorSpace}px` }">
                <div v-if="props.error" ref="errorElement" class="ui-dialog-error" role="alert">{{ props.error }}</div>
                <UiScrollArea class="ui-dialog-scroll" :label="props.contentLabel ?? uiText('dialog.contentLabel')" :rounded="false"><div class="ui-dialog-body"><slot /></div></UiScrollArea>
            </div>
            <footer v-if="$slots.footer" class="ui-dialog-footer"><slot name="footer" /></footer>
        </template>
        <slot v-else />
    </dialog>
</template>
