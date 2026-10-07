<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { acquireScrollLock, isTopOverlay, popOverlay, pushOverlay, releaseScrollLock } from './overlay-lifecycle';
import { useDefaults } from './defaults';
import { useReducedMotion } from './motion';
type Location = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'anchor';
const rawProps = withDefaults(defineProps<{ modelValue?: boolean; location?: Location; persistent?: boolean; scrollStrategy?: 'locked' | 'block' | 'close' | 'reposition'; width?: string | number; maxWidth?: string | number; scrim?: boolean }>(), {
    modelValue: undefined, location: 'center', persistent: false, scrollStrategy: 'locked', scrim: true
});
const props = useDefaults(rawProps, 'UOverlay');
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'click:outside': [] }>();
const internal = ref(false);
const open = computed(() => props.modelValue ?? internal.value);
const dialog = ref<HTMLDialogElement>();
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
const reduced = useReducedMotion();
let generation = 0;
const activator = ref<HTMLElement>();
const anchorStyle = ref<Record<string, string>>({});
let returnFocus: HTMLElement | null = null;
let keyboard: boolean = true;
function pointerUsed() { keyboard = false; }
function keyboardUsed() { keyboard = true; }
const lockToken = Symbol('ui-overlay-scroll-lock');
function setOpen(value: boolean) { internal.value = value; emit('update:modelValue', value); }
function close() { if (!props.persistent) setOpen(false); }
function position() {
    if (props.location !== 'anchor' || !activator.value || !dialog.value) return;
    const bounds = activator.value.getBoundingClientRect();
    const width = dialog.value.offsetWidth;
    const height = dialog.value.offsetHeight;
    anchorStyle.value = { left: `${Math.min(Math.max(8, bounds.left), window.innerWidth - width - 8)}px`, top: `${Math.min(bounds.bottom + 4, window.innerHeight - height - 8)}px` };
}
function lock() {
    if (props.scrollStrategy === 'locked' || props.scrollStrategy === 'block') acquireScrollLock(lockToken);
}
function unlock() {
    releaseScrollLock(lockToken);
}
async function sync() {
    const current = ++generation;
    await nextTick();
    if (current !== generation) return;
    const element = dialog.value;
    if (!element) return;
    if (open.value) {
        if (!element.open) {
            returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : activator.value ?? null;
            element.showModal();
            pushOverlay(element);
            lock();
            position();
            (element.querySelector<HTMLElement>('[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? element).focus({ preventScroll: true });
        }
        state.value = 'opening';
    } else {
        if (!element.open) return;
        state.value = 'closing';
    }
    await nextTick();
    getComputedStyle(element).opacity;
    await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation) return;
    if (open.value) state.value = 'open';
    else {
        state.value = 'closed';
        element.close();
        popOverlay(element);
        unlock();
        if (keyboard && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        else if (!keyboard && document.activeElement === returnFocus) returnFocus?.blur();
    }
}
function outside(event: MouseEvent) {
    if (!dialog.value || !isTopOverlay(dialog.value) || event.target !== dialog.value) return;
    const rect = dialog.value.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        emit('click:outside');
        keyboard = false;
        close();
    }
}
function onScroll(event: Event) {
    if (!open.value) return;
    if (dialog.value?.contains(event.target as Node)) return;
    if (props.scrollStrategy === 'close') close();
    else if (props.scrollStrategy === 'reposition') position();
}
const activatorProps = computed(() => ({
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open.value,
    onClick: (event: MouseEvent) => { activator.value = event.currentTarget as HTMLElement; keyboard = event.detail === 0; setOpen(!open.value); },
    onKeydown: () => { keyboard = true; }
}));
watch(open, sync, { flush: 'post' });
watch(reduced, (value) => { if (value) for (const animation of dialog.value?.getAnimations() ?? []) animation.finish(); });
onMounted(() => { sync(); window.addEventListener('scroll', onScroll, true); window.addEventListener('resize', position); });
onBeforeUnmount(() => {
    generation++;
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', position);
    if (dialog.value?.open) dialog.value.close();
    if (dialog.value) popOverlay(dialog.value);
    unlock();
});
defineExpose({ close, open: () => setOpen(true), dialog });
</script>

<template>
    <slot name="activator" :props="activatorProps" :activator-props="activatorProps" :open="open" />
    <dialog ref="dialog" class="ui-overlay" :class="[`is-${props.location}`, { 'has-scrim': props.scrim }]" :style="{ ...anchorStyle, width: typeof props.width === 'number' ? `${props.width}px` : props.width, maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth }" :data-state="state" :inert="state === 'closing'" :aria-hidden="state === 'closing' || undefined" :data-scroll-strategy="props.scrollStrategy" @cancel.prevent="close" @click="outside" @pointerdown="pointerUsed" @keydown="keyboardUsed"><slot :close="close" /></dialog>
</template>
