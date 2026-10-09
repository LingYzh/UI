<script setup lang="ts">
import { computed, mergeProps, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, provide, ref, useAttrs, watch, type CSSProperties } from 'vue';
import UiScrollArea from './UiScrollArea.vue';
import { acquireScrollLock, bindElementProps, dismissOverlay, isTopOverlay, popOverlay, presentOverlay, pushOverlay, releaseScrollLock } from './overlay-lifecycle';
import { useLocale } from './locale-context';
import { wasPointerActivated } from './pointer-focus';
import { provideUiTheme } from './theme';
import { useDefaults } from './defaults';
import { dimensionStyles } from './dimensions';
import { useOverlayBack } from './overlay-back';
import { claimOverlayDismiss } from './overlay-lifecycle';
import { overlayActivatorElement, overlayPositionStyles, resolveOverlayTarget, type OverlayPositionProps } from './overlay-position';
import { menuContextKey } from './menu';
import { overlayAppearanceStyles, type OverlayAppearanceProps } from './overlay-appearance';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';
import { useOverlayTransition } from './overlay-transition';
import UiOverlayHost from './UiOverlayHost.vue';
import type { OverlayContainerProps } from './overlay-container';
import { overlayFocusable, retainOverlayFocus } from './overlay-lifecycle';
import { useOverlayFocus } from './overlay-focus';

type Activator = string | HTMLElement | null;
type ScrollStrategy = 'none' | 'block' | 'locked' | 'close' | 'reposition';
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rawProps = withDefaults(defineProps<OverlayPositionProps & OverlayAppearanceProps & OverlayContainerProps & {
    theme?: string;
    open?: boolean;
    modelValue?: boolean;
    persistent?: boolean;
    closeOnBack?: boolean;
    disabled?: boolean;
    eager?: boolean;
    retainFocus?: boolean;
    fullscreen?: boolean;
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    height?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    scrollStrategy?: ScrollStrategy;
    activator?: Activator;
    activatorProps?: Record<string, unknown>;
    contentProps?: Record<string, unknown>;
    openOnClick?: boolean;
    openOnHover?: boolean;
    openOnFocus?: boolean;
    openDelay?: number;
    closeDelay?: number;
    scrollable?: boolean;
    error?: string;
    contentLabel?: string;
    /** 固定宽度档位；不传时保持原行为（普通弹窗按内容、scrollable 为 680px）。 */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** end 为贴靠行内结束边的整高抽屉。 */
    placement?: 'center' | 'end';
    transition?: UiTransition;
}>(), {
    open: undefined,
    modelValue: undefined,
    persistent: false,
    closeOnBack: true,
    disabled: false,
    eager: false,
    scrim: true,
    retainFocus: true,
    scrollStrategy: 'block',
    activator: undefined,
    activatorProps: () => ({}),
    contentProps: () => ({}),
    openOnClick: true,
    openOnHover: false,
    openOnFocus: false,
    openDelay: 0,
    closeDelay: 0,
    scrollable: false,
    error: '',
    contentLabel: undefined,
    size: undefined,
    placement: 'center',
    // Preserve the CSS animation fallback; absent Boolean union props otherwise cast to false.
    transition: undefined
});
const props = useDefaults(rawProps, 'UDialog');
provide(menuContextKey, null);
const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:modelValue': [value: boolean];
    'present-change': [value: boolean];
    opened: [];
    closed: [];
    'click:outside': [event: MouseEvent];
    keydown: [event: KeyboardEvent];
    afterEnter: [];
    afterLeave: [];
}>();

const localOpen = ref(false);
const deactivated = ref(false);
const disabledCloseLatch = ref(false);
const isOpen = computed(() => !deactivated.value && !props.disabled && !disabledCloseLatch.value && (props.modelValue ?? props.open ?? localOpen.value));
const themeContext = provideUiTheme(() => props.theme);
const locale = useLocale();
const element = ref<HTMLDialogElement>();
useOverlayFocus(element, () => isOpen.value, () => props.retainFocus);
const activatorEl = ref<HTMLElement>();
const positionStyle = ref<CSSProperties>({});
let positionObserver: ResizeObserver | undefined;
let cursor: [number, number] | undefined;
const contentMounted = ref(false);
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
const transition = useOverlayTransition(() => props.transition);
const errorElement = ref<HTMLElement>();
const errorSpace = ref(0);
let errorObserver: ResizeObserver | undefined;
let generation = 0;
let backdropPressed = false;
let returnFocus: HTMLElement | null = null;
let restoreKeyboardFocus = true;
let keyboardInteraction = true;
let hovered = false;
let focused = false;
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let externalActivatorCleanup: (() => void) | undefined;
const lockToken = Symbol('ui-dialog-scroll-lock');

watch(errorElement, (next, previous) => {
    if (previous) errorObserver?.unobserve(previous);
    errorSpace.value = next ? next.offsetHeight + 12 : 0;
    if (next) errorObserver?.observe(next);
});

function setOpen(value: boolean) {
    if (value && props.disabled) return;
    if (value) disabledCloseLatch.value = false;
    localOpen.value = value;
    emit('update:open', value);
    emit('update:modelValue', value);
}
function openDialog() { setOpen(true); }
function requestClose() { if (!props.persistent) setOpen(false); }
useOverlayBack(element, () => props.closeOnBack, () => isOpen.value, requestClose);
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
        if (!hovered && !focused && !element.value?.contains(document.activeElement)) requestClose();
    }, Math.max(0, Number(props.closeDelay) || 0));
}
function setActivatorElement(value: unknown) { activatorEl.value = overlayActivatorElement(value); }
function resolveActivator(value: Activator | undefined): HTMLElement | undefined {
    if (typeof document === 'undefined' || value == null) return undefined;
    if (typeof value !== 'string') return value instanceof HTMLElement ? value : undefined;
    try { return document.querySelector<HTMLElement>(value) ?? undefined; }
    catch { return undefined; }
}
function onActivatorClick(event: MouseEvent) {
    cursor = [event.clientX, event.clientY];
    setActivatorElement(event.currentTarget);
    keyboardInteraction = event.detail === 0;
    if (props.openOnClick) setOpen(!isOpen.value);
}
function onActivatorKeydown() { keyboardInteraction = true; }
function onActivatorMouseenter() { hovered = true; scheduleOpen(); }
function onActivatorMouseleave() { hovered = false; scheduleClose(); }
function onActivatorFocus() {
    if (!props.openOnFocus || !keyboardInteraction) return;
    focused = true;
    scheduleOpen();
}
function onActivatorBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && element.value?.contains(event.relatedTarget)) return;
    focused = false;
    scheduleClose();
}
const activatorAttrs = computed(() => mergeProps({
    ref: setActivatorElement,
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen.value,
    onClick: props.disabled ? undefined : onActivatorClick,
    onKeydown: onActivatorKeydown,
    onMouseenter: props.disabled || !props.openOnHover ? undefined : onActivatorMouseenter,
    onMouseleave: props.disabled || !props.openOnHover ? undefined : onActivatorMouseleave,
    onFocus: props.disabled || !props.openOnFocus ? undefined : onActivatorFocus,
    onBlur: props.disabled || !props.openOnFocus ? undefined : onActivatorBlur
}, props.activatorProps));
const activatorSlot = computed(() => ({ isActive: isOpen, props: activatorAttrs.value, activatorProps: activatorAttrs.value, open: isOpen.value }));
const contentSlot = computed(() => ({ isActive: isOpen, close: requestClose }));

function lock() {
    if (props.scrollStrategy === 'block' || props.scrollStrategy === 'locked') acquireScrollLock(lockToken);
    else releaseScrollLock(lockToken);
}
function unlock() { releaseScrollLock(lockToken); }
function outside(event: PointerEvent) {
    const dialog = element.value;
    if (!dialog || !isTopOverlay(dialog)) return false;
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
}
function pointerDown(event: PointerEvent) {
    keyboardInteraction = false;
    restoreKeyboardFocus = false;
    backdropPressed = outside(event);
}
function pointerUp(event: PointerEvent) {
    if (backdropPressed && outside(event)) {
        emit('click:outside', event);
        requestClose();
    }
    backdropPressed = false;
}
function onKeydown(event: KeyboardEvent) {
    keyboardInteraction = true;
    restoreKeyboardFocus = true;
    if (!element.value || !isTopOverlay(element.value)) return;
    emit('keydown', event);
}
function onContentMouseenter() { hovered = true; clearTimeout(closeTimer); }
function onContentMouseleave() { hovered = false; scheduleClose(); }
function onContentFocusin() { focused = true; clearTimeout(closeTimer); }
function onContentFocusout(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && element.value?.contains(event.relatedTarget)) return;
    focused = false;
    scheduleClose();
}
function onCancel(event: Event) {
    event.preventDefault();
    if (!element.value || !isTopOverlay(element.value)) return;
    requestClose();
}
function onScroll(event: Event) {
    if (!isOpen.value || element.value?.contains(event.target as Node)) return;
    if (props.scrollStrategy === 'close') requestClose();
    else if (props.scrollStrategy === 'reposition') updateLocation();
}
function updateLocation() {
    if (!element.value) return;
    const next = props.fullscreen ? {} : overlayPositionStyles(props, element.value, activatorEl.value, cursor);
    if (JSON.stringify(next) !== JSON.stringify(positionStyle.value)) positionStyle.value = next;
}
function onDocumentClick(event: MouseEvent) {
    const dialog = element.value;
    if (!isOpen.value || !dialog || !isTopOverlay(dialog) || dialog.closest('.ui-overlay-layer')?.contains(event.target as Node) || activatorEl.value?.contains(event.target as Node)) return;
    if (!claimOverlayDismiss(event)) return;
    emit('click:outside', event);
    requestClose();
}

async function sync() {
    const current = ++generation;
    if (isOpen.value) contentMounted.value = true;
    await nextTick();
    if (current !== generation) return;
    const dialog = element.value;
    if (!dialog) return;
    if (isOpen.value) {
        if (!dialog.open) {
            returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : activatorEl.value ?? null;
            restoreKeyboardFocus = props.retainFocus && !wasPointerActivated(returnFocus);
            emit('present-change', true);
            pushOverlay(dialog);
            presentOverlay(dialog, props.retainFocus);
            updateLocation();
            lock();
        }
        state.value = 'opening';
    } else {
        if (!dialog.open) {
            state.value = 'closed';
            if (!props.eager) contentMounted.value = false;
            return;
        }
        state.value = 'closing';
    }
    await nextTick();
    getComputedStyle(dialog).opacity;
    if (props.transition !== undefined) {
        const completing = transition.run(isOpen.value);
        await nextTick();
        if (isOpen.value) updateLocation();
        await completing;
    }
    else await Promise.all(dialog.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation) return;
    if (isOpen.value) {
        state.value = 'open';
        if (props.retainFocus && (document.activeElement === dialog || !dialog.contains(document.activeElement))) {
            (overlayFocusable(dialog)[0] ?? dialog).focus({ preventScroll: true });
        }
        emit('opened');
        emit('afterEnter');
    } else {
        state.value = 'closed';
        dismissOverlay(dialog);
        popOverlay(dialog);
        unlock();
        if (props.retainFocus && returnFocus?.isConnected) {
            if (restoreKeyboardFocus) returnFocus.focus({ preventScroll: true });
            else if (document.activeElement === returnFocus && returnFocus.matches('button, [role="button"], [role="tab"], input[type="checkbox"], input[type="radio"]')) returnFocus.blur();
        }
        emit('present-change', false);
        emit('closed');
        emit('afterLeave');
        if (!props.eager) contentMounted.value = false;
    }
}

watch(isOpen, () => { if (!deactivated.value) { clearTimers(); void sync(); } }, { flush: 'post' });
watch(() => props.disabled, (value) => {
    if (value) {
        disabledCloseLatch.value = true;
        setOpen(false);
    }
});
watch(() => [props.modelValue, props.open] as const, ([modelValue, open], previous) => {
    if (modelValue === false || open === false || ((modelValue === true || open === true) && !previous?.some((value) => value === true) && !props.disabled)) disabledCloseLatch.value = false;
});
watch(() => props.scrollStrategy, () => { if (isOpen.value) lock(); else unlock(); });
watch(() => props.retainFocus, () => { if (isOpen.value) void sync(); });
watch(() => [props.locationStrategy, props.location, props.target, props.offset, props.origin, props.viewportMargin, props.stickToTarget, props.fullscreen, props.width, props.height, props.minWidth, props.maxWidth, props.minHeight, props.maxHeight] as const, () => { if (isOpen.value) void nextTick(updateLocation); }, { deep: true });
watch([element, activatorEl, () => props.target], ([content, anchor]) => {
    positionObserver?.disconnect();
    if (content) positionObserver?.observe(content);
    if (anchor) positionObserver?.observe(anchor);
    const target = resolveOverlayTarget(props.target, anchor, content, cursor);
    if (target instanceof HTMLElement) positionObserver?.observe(target);
});
watch(() => [props.activator, activatorAttrs.value] as const, ([target, attrs]) => {
    externalActivatorCleanup?.();
    externalActivatorCleanup = undefined;
    const activator = resolveActivator(target);
    if (!activator) {
        if (target) setActivatorElement(undefined);
        return;
    }
    setActivatorElement(activator);
    externalActivatorCleanup = bindElementProps(activator, attrs);
}, { flush: 'post', immediate: true });

onMounted(() => {
    positionObserver = new ResizeObserver(() => { if (isOpen.value) updateLocation(); });
    if (element.value) positionObserver.observe(element.value);
    if (activatorEl.value) positionObserver.observe(activatorEl.value);
    errorObserver = new ResizeObserver(() => { errorSpace.value = errorElement.value ? errorElement.value.offsetHeight + 12 : 0; });
    if (errorElement.value) errorObserver.observe(errorElement.value);
    document.addEventListener('pointerdown', onPointerdownCapture, true);
    document.addEventListener('keydown', onKeydownCapture, true);
    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updateLocation);
    window.visualViewport?.addEventListener('resize', updateLocation);
    window.visualViewport?.addEventListener('scroll', updateLocation);
    void sync();
});
function onKeydownCapture(event: KeyboardEvent) {
    if (event.key === 'Escape' && event.defaultPrevented) return;
    keyboardInteraction = true;
    if (isOpen.value && element.value && isTopOverlay(element.value)) {
        // Escape closes in capture phase, before the content keydown handler can mark keyboard focus return.
        restoreKeyboardFocus = true;
        if (props.retainFocus) retainOverlayFocus(element.value, event);
        if (!element.value.contains(event.target as Node)) emit('keydown', event);
        if (event.key === 'Escape') { event.preventDefault(); requestClose(); }
    }
}
function onPointerdownCapture() { keyboardInteraction = false; }
onDeactivated(() => {
    deactivated.value = true;
    generation++;
    transition.finish();
    clearTimers();
    if (element.value?.open) dismissOverlay(element.value);
    if (element.value) popOverlay(element.value);
    state.value = 'closed';
    unlock();
    emit('present-change', false);
});
onActivated(() => { deactivated.value = false; if (isOpen.value) void sync(); });
onBeforeUnmount(() => {
    positionObserver?.disconnect();
    errorObserver?.disconnect();
    generation++;
    transition.finish();
    clearTimers();
    externalActivatorCleanup?.();
    document.removeEventListener('pointerdown', onPointerdownCapture, true);
    document.removeEventListener('keydown', onKeydownCapture, true);
    document.removeEventListener('click', onDocumentClick, true);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', updateLocation);
    window.visualViewport?.removeEventListener('resize', updateLocation);
    window.visualViewport?.removeEventListener('scroll', updateLocation);
    if (element.value?.open) dismissOverlay(element.value);
    if (element.value) popOverlay(element.value);
    unlock();
    emit('present-change', false);
});

const contentAttrs = computed(() => mergeProps({
    class: [
        'ui-dialog',
        { 'ui-dialog--scrollable': props.scrollable, 'ui-dialog--end': props.placement === 'end', 'ui-dialog--fullscreen': props.fullscreen },
        props.size ? `ui-dialog--${props.size}` : ''
    ],
    style: {
        ...(props.theme ? themeContext.styles.value : {}),
        ...positionStyle.value,
        ...overlayAppearanceStyles(props),
        ...(props.fullscreen ? {} : dimensionStyles(props))
    },
    'aria-modal': props.retainFocus || undefined,
    'data-scrim': props.scrim,
    'data-ui-theme': props.theme ? themeContext.name.value : undefined,
    'data-theme': props.theme ? (themeContext.current.value.dark ? 'dark' : 'light') : undefined,
    'data-state': state.value,
    inert: state.value === 'closing' || undefined,
    'aria-hidden': state.value === 'closing' || undefined,
    'data-ui-transition': props.transition !== undefined || undefined,
    'data-fullscreen': props.fullscreen || undefined,
    'data-scroll-strategy': props.scrollStrategy,
    onCancel,
    onPointerdownCapture: pointerDown,
    onKeydownCapture: onKeydown,
    onPointerup: pointerUp,
    onMouseenter: onContentMouseenter,
    onMouseleave: props.openOnHover ? onContentMouseleave : undefined,
    onFocusin: props.openOnFocus ? onContentFocusin : undefined,
    onFocusout: props.openOnFocus ? onContentFocusout : undefined
}, attrs, props.contentProps));

defineExpose({
    element,
    contentEl: element,
    activatorEl,
    isActive: isOpen,
    close: requestClose,
    updateLocation,
    open: openDialog
});
</script>

<template>
    <slot v-if="!props.activator" name="activator" v-bind="activatorSlot" />
    <UiOverlayHost :active="isOpen || state !== 'closed'" :attach="props.attach" :contained="props.contained" :absolute="props.absolute" :scrim="props.scrim" :opacity="props.opacity" :z-index="props.zIndex"
        @click:outside="event => { if (element && isTopOverlay(element)) { emit('click:outside', event); requestClose(); } }"
    >
    <UiMaybeTransition :transition="props.transition ?? false"
        @after-enter="transition.finish" @after-leave="transition.finish" @enter-cancelled="transition.finish" @leave-cancelled="transition.finish">
        <dialog ref="element" v-bind="contentAttrs"
            v-show="props.transition === undefined || transition.visible.value">
            <template v-if="contentMounted || props.eager">
                <template v-if="props.scrollable">
                    <header v-if="$slots.header" class="ui-dialog-header"><slot name="header" v-bind="contentSlot" /></header>
                    <div class="ui-dialog-content" :style="{ '--ui-dialog-error-space': `${errorSpace}px` }">
                        <div v-if="props.error" ref="errorElement" class="ui-dialog-error" role="alert">{{ props.error }}</div>
                        <UiScrollArea class="ui-dialog-scroll" :label="props.contentLabel ?? locale.t('dialog.contentLabel')" :rounded="false"><div class="ui-dialog-body"><slot v-bind="contentSlot" /></div></UiScrollArea>
                    </div>
                    <footer v-if="$slots.footer" class="ui-dialog-footer"><slot name="footer" v-bind="contentSlot" /></footer>
                </template>
                <slot v-else v-bind="contentSlot" />
            </template>
        </dialog>
    </UiMaybeTransition>
    </UiOverlayHost>
</template>
