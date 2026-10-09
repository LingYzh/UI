<script setup lang="ts">
import { computed, mergeProps, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, provide, ref, useAttrs, watch, type CSSProperties } from 'vue';
import { acquireScrollLock, bindElementProps, dismissOverlay, isTopOverlay, popOverlay, presentOverlay, pushOverlay, releaseScrollLock } from './overlay-lifecycle';
import { useDefaults } from './defaults';
import { useReducedMotion } from './motion';
import type { OverlayProps as Props } from './overlay-props';
import { dimensionStyles } from './dimensions';
import { useOverlayBack } from './overlay-back';
import { claimOverlayDismiss } from './overlay-lifecycle';
import { overlayActivatorElement, overlayPositionStyles, resolveOverlayTarget } from './overlay-position';
import { menuContextKey } from './menu';
import { overlayAppearanceStyles } from './overlay-appearance';
import UiMaybeTransition from './UiMaybeTransition.vue';
import { useOverlayTransition } from './overlay-transition';
import UiOverlayHost from './UiOverlayHost.vue';
import { retainOverlayFocus } from './overlay-lifecycle';
import { useOverlayFocus } from './overlay-focus';

type ScrollStrategy = 'none' | 'locked' | 'block' | 'close' | 'reposition';
type Activator = string | HTMLElement | null;
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rawProps = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    location: undefined,
    persistent: false,
    closeOnBack: true,
    disabled: false,
    eager: false,
    activator: undefined,
    activatorProps: () => ({}),
    contentProps: () => ({}),
    openOnClick: true,
    openOnHover: false,
    openOnFocus: false,
    openDelay: 0,
    closeDelay: 0,
    scrollStrategy: 'none',
    captureFocus: false,
    retainFocus: false,
    scrim: true,
    transition: undefined
});
const props = useDefaults(rawProps, 'UOverlay');
provide(menuContextKey, null);
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'click:outside': [event: MouseEvent];
    keydown: [event: KeyboardEvent];
    afterEnter: [];
    afterLeave: [];
}>();

const internal = ref(false);
const deactivated = ref(false);
const disabledCloseLatch = ref(false);
const open = computed(() => !deactivated.value && !props.disabled && !disabledCloseLatch.value && (props.modelValue ?? internal.value));
const dialog = ref<HTMLDialogElement>();
useOverlayFocus(dialog, () => open.value, () => props.retainFocus);
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
const contentMounted = ref(false);
const reduced = useReducedMotion();
const transition = useOverlayTransition(() => props.transition);
const activator = ref<HTMLElement>();
const anchorStyle = ref<CSSProperties>({});
let cursor: [number, number] | undefined;
let positionObserver: ResizeObserver | undefined;
let generation = 0;
let returnFocus: HTMLElement | null = null;
let keyboard = true;
let hovered = false;
let focused = false;
let suppressFocusOpen = false;
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let externalActivatorCleanup: (() => void) | undefined;
const lockToken = Symbol('ui-overlay-scroll-lock');

function setOpen(value: boolean) {
    if (value && props.disabled) return;
    if (value) disabledCloseLatch.value = false;
    internal.value = value;
    emit('update:modelValue', value);
}
function openOverlay() { setOpen(true); }
function close() { if (!props.persistent) setOpen(false); }
useOverlayBack(dialog, () => props.closeOnBack, () => open.value, close);
function pointerUsed() { keyboard = false; suppressFocusOpen = false; }
function keyboardUsed() { keyboard = true; suppressFocusOpen = false; }
function clearTimers() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    openTimer = undefined;
    closeTimer = undefined;
}
function scheduleOpen() {
    clearTimeout(closeTimer);
    openTimer = setTimeout(() => { openTimer = undefined; setOpen(true); }, Math.max(0, Number(props.openDelay) || 0));
}
function scheduleClose() {
    clearTimeout(openTimer);
    closeTimer = setTimeout(() => {
        closeTimer = undefined;
        if (!hovered && !focused && !dialog.value?.contains(document.activeElement)) close();
    }, Math.max(0, Number(props.closeDelay) || 0));
}
function setActivatorElement(value: unknown) {
    activator.value = overlayActivatorElement(value);
    if (open.value) position();
}
function resolveActivator(value: Activator | undefined): HTMLElement | undefined {
    if (typeof document === 'undefined' || value == null) return undefined;
    if (typeof value !== 'string') return value instanceof HTMLElement ? value : undefined;
    try { return document.querySelector<HTMLElement>(value) ?? undefined; }
    catch { return undefined; }
}
function position() {
    if (!dialog.value) return;
    const next = overlayPositionStyles(props.location === 'anchor' && !props.locationStrategy ? { ...props, offset: props.offset ?? 4, viewportMargin: props.viewportMargin ?? 8 } : props, dialog.value, activator.value, cursor);
    if (JSON.stringify(next) !== JSON.stringify(anchorStyle.value)) anchorStyle.value = next;
}
function lock() {
    if (props.scrollStrategy === 'locked' || props.scrollStrategy === 'block') acquireScrollLock(lockToken);
    else releaseScrollLock(lockToken);
}
function unlock() { releaseScrollLock(lockToken); }
function onActivatorClick(event: MouseEvent) {
    cursor = [event.clientX, event.clientY];
    setActivatorElement(event.currentTarget);
    keyboard = event.detail === 0;
    if (props.openOnClick) setOpen(!open.value);
}
function onActivatorMouseEnter() { hovered = true; scheduleOpen(); }
function onActivatorMouseLeave() { hovered = false; scheduleClose(); }
function onActivatorFocus() {
    if (suppressFocusOpen || !props.openOnFocus || !keyboard) return;
    focused = true;
    scheduleOpen();
}
function onActivatorBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && dialog.value?.contains(event.relatedTarget)) return;
    focused = false;
    scheduleClose();
}
const activatorAttrs = computed(() => mergeProps({
    ref: setActivatorElement,
    'aria-haspopup': 'dialog',
    'aria-expanded': open.value,
    onClick: props.disabled ? undefined : onActivatorClick,
    onKeydown: keyboardUsed,
    onMouseenter: props.disabled || !props.openOnHover ? undefined : onActivatorMouseEnter,
    onMouseleave: props.disabled || !props.openOnHover ? undefined : onActivatorMouseLeave,
    onFocus: props.disabled || !props.openOnFocus ? undefined : onActivatorFocus,
    onBlur: props.disabled || !props.openOnFocus ? undefined : onActivatorBlur
}, props.activatorProps));
const activatorSlot = computed(() => ({
    isActive: open,
    props: activatorAttrs.value,
    activatorProps: activatorAttrs.value,
    open: open.value
}));
const contentSlot = computed(() => ({ isActive: open, close }));

function onContentMouseEnter() { hovered = true; clearTimeout(closeTimer); }
function onContentMouseLeave() { hovered = false; scheduleClose(); }
function onContentFocusIn() { focused = true; clearTimeout(closeTimer); }
function onContentFocusOut(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && dialog.value?.contains(event.relatedTarget)) return;
    focused = false;
    scheduleClose();
}
function outside(event: MouseEvent) {
    const element = dialog.value;
    if (!element || !isTopOverlay(element) || event.target !== element) return;
    const rect = element.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        emit('click:outside', event);
        keyboard = false;
        close();
    }
}
function onScroll(event: Event) {
    if (!open.value || dialog.value?.contains(event.target as Node)) return;
    if (props.scrollStrategy === 'close') close();
    else if (props.scrollStrategy === 'reposition') position();
}
function onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && event.defaultPrevented) return;
    keyboard = true;
    suppressFocusOpen = false;
    const element = dialog.value;
    if (!open.value || !element || !isTopOverlay(element)) return;
    emit('keydown', event);
    if (props.retainFocus) retainOverlayFocus(element, event);
    if (event.key === 'Escape') {
        event.preventDefault();
        close();
    }
}
function onDocumentClick(event: MouseEvent) {
    const element = dialog.value;
    if (!open.value || !element || !isTopOverlay(element) || element.closest('.ui-overlay-layer')?.contains(event.target as Node) || activator.value?.contains(event.target as Node)) return;
    if (!claimOverlayDismiss(event)) return;
    emit('click:outside', event);
    keyboard = false;
    close();
}

const contentAttrs = computed(() => mergeProps({
    class: ['ui-overlay', `is-${props.location ?? 'center'}`, props.contentClass, { 'has-scrim': props.scrim, 'is-fullscreen': props.fullscreen }],
    style: {
        ...anchorStyle.value,
        ...overlayAppearanceStyles(props),
        ...dimensionStyles(props)
    },
    'data-state': state.value,
    'data-ui-transition': props.transition !== undefined || undefined,
    inert: state.value === 'closing' || undefined,
    'aria-hidden': state.value === 'closing' || undefined,
    'data-scroll-strategy': props.scrollStrategy,
    'aria-modal': props.retainFocus || undefined,
    onCancel: (event: Event) => { event.preventDefault(); close(); },
    onClick: outside,
    onPointerdown: pointerUsed,
    onMouseenter: onContentMouseEnter,
    onMouseleave: props.openOnHover ? onContentMouseLeave : undefined,
    onFocusin: props.openOnFocus ? onContentFocusIn : undefined,
    onFocusout: props.openOnFocus ? onContentFocusOut : undefined
}, attrs, props.contentProps));

async function sync() {
    const current = ++generation;
    if (open.value) contentMounted.value = true;
    await nextTick();
    if (current !== generation) return;
    const element = dialog.value;
    if (!element) return;
    if (open.value) {
        if (!element.open) {
            returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : activator.value ?? null;
            pushOverlay(element);
            presentOverlay(element, props.retainFocus);
            lock();
            position();
            const initial = element.querySelector<HTMLElement>('[autofocus], button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? element;
            if (props.captureFocus || props.retainFocus) initial.focus({ preventScroll: true });
        }
        state.value = 'opening';
    } else {
        if (!element.open) {
            state.value = 'closed';
            if (!props.eager) contentMounted.value = false;
            return;
        }
        state.value = 'closing';
    }
    await nextTick();
    getComputedStyle(element).opacity;
    if (props.transition !== undefined) {
        const completing = transition.run(open.value);
        await nextTick();
        if (open.value) {
            position();
            if ((props.captureFocus || props.retainFocus) && !element.contains(document.activeElement)) {
                const initial = element.querySelector<HTMLElement>('[autofocus], button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? element;
                initial.focus({ preventScroll: true });
            }
        }
        await completing;
    }
    else await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation) return;
    if (open.value) {
        state.value = 'open';
        emit('afterEnter');
    } else {
        state.value = 'closed';
        const ownsFocus = element.contains(document.activeElement) || document.activeElement === document.body || document.activeElement === returnFocus;
        const focusTarget = keyboard && ownsFocus && returnFocus?.isConnected ? returnFocus : undefined;
        if (focusTarget) suppressFocusOpen = true;
        dismissOverlay(element);
        popOverlay(element);
        unlock();
        if (focusTarget) {
            focusTarget.focus({ preventScroll: true });
            window.setTimeout(() => { suppressFocusOpen = false; }, 100);
        }
        else if (!keyboard && document.activeElement === returnFocus) returnFocus?.blur();
        emit('afterLeave');
        if (!props.eager) contentMounted.value = false;
    }
}

watch(open, (value) => {
    if (deactivated.value) return;
    clearTimers();
    if (value) contentMounted.value = true;
    void sync();
}, { flush: 'post' });
watch(() => props.disabled, (value) => {
    if (value) {
        disabledCloseLatch.value = true;
        setOpen(false);
    }
});
watch(() => props.modelValue, (value, previous) => {
    if (value === false || (value === true && previous !== true && !props.disabled)) disabledCloseLatch.value = false;
});
watch(() => props.scrollStrategy, () => { if (open.value) lock(); else unlock(); });
watch(() => props.retainFocus, () => { if (open.value) void sync(); });
watch(() => [props.location, props.locationStrategy, props.target, props.origin, props.offset, props.viewportMargin, props.stickToTarget, props.width, props.maxWidth, props.minWidth, props.height, props.minHeight, props.maxHeight, props.fullscreen] as const, () => { if (open.value) void nextTick(position); }, { deep: true });
watch([dialog, activator, () => props.target], ([content, anchor]) => {
    positionObserver?.disconnect();
    if (content) positionObserver?.observe(content);
    if (anchor) positionObserver?.observe(anchor);
    const target = resolveOverlayTarget(props.target, anchor, content, cursor);
    if (target instanceof HTMLElement) positionObserver?.observe(target);
});
watch(() => [props.activator, activatorAttrs.value] as const, ([target, attrs]) => {
    externalActivatorCleanup?.();
    externalActivatorCleanup = undefined;
    const element = resolveActivator(target);
    if (!element) {
        if (target) setActivatorElement(undefined);
        return;
    }
    setActivatorElement(element);
    externalActivatorCleanup = bindElementProps(element, attrs);
}, { flush: 'post', immediate: true });
watch(reduced, (value) => { if (value) for (const animation of dialog.value?.getAnimations() ?? []) animation.finish(); });

onMounted(() => {
    positionObserver = new ResizeObserver(() => { if (open.value) position(); });
    if (dialog.value) positionObserver.observe(dialog.value);
    if (activator.value) positionObserver.observe(activator.value);
    void sync();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', position);
    window.visualViewport?.addEventListener('resize', position);
    window.visualViewport?.addEventListener('scroll', position);
    document.addEventListener('pointerdown', pointerUsed, true);
    document.addEventListener('keydown', onDocumentKeydown, true);
    document.addEventListener('click', onDocumentClick, true);
});
onDeactivated(() => {
    deactivated.value = true;
    generation++;
    transition.finish();
    clearTimers();
    if (dialog.value?.open) dismissOverlay(dialog.value);
    if (dialog.value) popOverlay(dialog.value);
    state.value = 'closed';
    unlock();
});
onActivated(() => { deactivated.value = false; if (open.value) void sync(); });
onBeforeUnmount(() => {
    positionObserver?.disconnect();
    generation++;
    transition.finish();
    clearTimers();
    externalActivatorCleanup?.();
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', position);
    window.visualViewport?.removeEventListener('resize', position);
    window.visualViewport?.removeEventListener('scroll', position);
    document.removeEventListener('pointerdown', pointerUsed, true);
    document.removeEventListener('keydown', onDocumentKeydown, true);
    document.removeEventListener('click', onDocumentClick, true);
    if (dialog.value?.open) dismissOverlay(dialog.value);
    if (dialog.value) popOverlay(dialog.value);
    unlock();
});

defineExpose({
    close,
    open: openOverlay,
    dialog,
    contentEl: dialog,
    activatorEl: activator,
    isActive: open,
    updateLocation: position
});
</script>

<template>
    <slot v-if="!props.activator" name="activator" v-bind="activatorSlot" />
    <UiOverlayHost :active="open || state !== 'closed'" :attach="props.attach" :contained="props.contained" :absolute="props.absolute" :scrim="props.scrim" :opacity="props.opacity" :z-index="props.zIndex"
        @click:outside="event => { if (dialog && isTopOverlay(dialog)) { emit('click:outside', event); close(); } }"
    >
    <UiMaybeTransition :transition="props.transition ?? false"
        @after-enter="transition.finish" @after-leave="transition.finish" @enter-cancelled="transition.finish" @leave-cancelled="transition.finish">
        <dialog ref="dialog" v-bind="contentAttrs"
            v-show="props.transition === undefined || transition.visible.value">
            <slot v-if="contentMounted || props.eager" v-bind="contentSlot" />
        </dialog>
    </UiMaybeTransition>
    </UiOverlayHost>
</template>
