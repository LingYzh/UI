<script setup lang="ts">
import { computed, inject, mergeProps, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, provide, ref, useId, watch } from 'vue';
import { acquireScrollLock, bindElementProps, popOverlay, pushOverlay, releaseScrollLock } from './overlay-lifecycle';
import { useOverlayBack } from './overlay-back';
import { claimOverlayDismiss } from './overlay-lifecycle';
import { menuContextKey, type MenuContext, type MenuPlacement } from './menu';
import { useDefaults } from './defaults';
import { dimensionStyles, type DimensionProps } from './dimensions';
import { overlayActivatorElement, overlayPositionStyles, resolveOverlayTarget, type OverlayPositionProps } from './overlay-position';
import { isTopOverlay } from './overlay-lifecycle';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';
import { useOverlayTransition } from './overlay-transition';
import UiOverlayHost from './UiOverlayHost.vue';
import type { OverlayContainerProps } from './overlay-container';
import { overlayFocusable } from './overlay-lifecycle';

type Activator = string | HTMLElement | null;
type ScrollStrategy = 'none' | 'locked' | 'block' | 'close' | 'reposition';
const rawProps = withDefaults(defineProps<DimensionProps & OverlayPositionProps & OverlayContainerProps & {
    placement?: MenuPlacement;
    modelValue?: boolean;
    open?: boolean;
    disabled?: boolean;
    eager?: boolean;
    activator?: Activator;
    activatorProps?: Record<string, unknown>;
    contentProps?: Record<string, unknown>;
    contentClass?: string | string[] | Record<string, boolean>;
    openOnClick?: boolean;
    openOnHover?: boolean;
    openOnFocus?: boolean;
    openDelay?: number;
    closeDelay?: number;
    openOnArrow?: boolean;
    closeOnContentClick?: boolean;
    persistent?: boolean;
    closeOnBack?: boolean;
    /** 保留组合输入框焦点；输入控件自行处理方向键和活动项。 */
    disableInitialFocus?: boolean;
    /** 组合输入在 focus 时开启；由本组件处理关闭，避免同一次指针操作被浏览器 light-dismiss。 */
    nativeDismiss?: boolean;
    scrollStrategy?: ScrollStrategy;
    /** 自由内容面板（role=dialog，Tab 自然导航）；默认为菜单（role=menu，方向键导航）。 */
    panel?: boolean;
    /** 显式可访问名称；不传时由触发器文字命名。 */
    label?: string;
    transition?: UiTransition;
}>(), {
    placement: 'bottom-start',
    modelValue: undefined,
    open: undefined,
    disabled: false,
    eager: false,
    activator: undefined,
    activatorProps: () => ({}),
    contentProps: () => ({}),
    panel: false,
    openOnClick: undefined,
    openOnHover: false,
    openOnFocus: false,
    openDelay: 300,
    closeDelay: 250,
    openOnArrow: true,
    closeOnContentClick: undefined,
    persistent: false,
    closeOnBack: true,
    scrollStrategy: 'reposition',
    transition: undefined
});
const props = useDefaults(rawProps, 'UMenu');
const transition = useOverlayTransition(() => props.transition);
let transitionClosing = false;
const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:modelValue': [value: boolean];
    'click:outside': [event: MouseEvent];
    keydown: [event: KeyboardEvent];
    afterEnter: [];
    afterLeave: [];
}>();

const localOpen = ref(false);
const disabledCloseLatch = ref(false);
const forcedCloseLatch = ref(false);
const deactivated = ref(false);
const open = computed({
    get: () => !deactivated.value && !props.disabled && !disabledCloseLatch.value && !forcedCloseLatch.value && (props.modelValue ?? props.open ?? localOpen.value),
    set: (value: boolean) => {
        if (value && (props.disabled || deactivated.value)) return;
        if (value) { disabledCloseLatch.value = false; forcedCloseLatch.value = false; }
        localOpen.value = value;
        emit('update:open', value);
        emit('update:modelValue', value);
    }
});
const menuPlacement = computed(() => props.location ?? props.placement);
const closeOnContentClick = computed(() => props.closeOnContentClick ?? !props.panel);
const openOnClick = computed(() => props.openOnClick ?? !(props.openOnHover || props.openOnFocus));

// Keep activator/content IDs stable across lazy mounting and attached DOM containers.
const uid = useId().replace(/[^\w-]/g, '-');
const surfaceId = computed(() => String(props.contentProps.id ?? `ui-menu-${uid}`));
const activatorId = `ui-menu-trigger-${uid}`;
const anchorName = `--ui-menu-${uid}`;
const surface = ref<HTMLElement>();
const presented = ref(false);
const activatorEl = ref<HTMLElement>();
const positionStyle = ref<ReturnType<typeof overlayPositionStyles>>({});
let positionObserver: ResizeObserver | undefined;
let cursor: [number, number] | undefined;
const triggerId = computed(() => props.activator ? activatorEl.value?.id || activatorId : activatorId);
const contentMounted = ref(false);
const parentMenu = inject(menuContextKey, null);
const childKey = {};
const childMenus = new Map<object, { close: () => void; deactivate: () => void; containsFocus: () => boolean }>();
let branchOwnedFocus = false;
let keyboardInteraction = false;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let closeParentsTimer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;
let restoreFocusAfterClose = true;
let externalActivatorCleanup: (() => void) | undefined;
const lockToken = Symbol('ui-menu-scroll-lock');
const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function setActivatorElement(value: unknown) {
    activatorEl.value = overlayActivatorElement(value);
}
function resolveActivator(value: Activator | undefined): HTMLElement | undefined {
    if (typeof document === 'undefined' || value == null) return undefined;
    if (typeof value !== 'string') return value instanceof HTMLElement ? value : undefined;
    try { return document.querySelector<HTMLElement>(value) ?? undefined; }
    catch { return undefined; }
}
function enabledItems() {
    return Array.from(surface.value?.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemcheckbox"]') ?? [])
        .filter((element) => !element.matches(':disabled, [aria-disabled="true"], [hidden], [inert]'));
}
function isShown() { return presented.value; }
function updateLocation() {
    const element = surface.value;
    if (!element) return;
    element.style.setProperty('position-anchor', props.locationStrategy === 'static' ? 'none' : anchorName);
    const next = overlayPositionStyles({ ...props, location: menuPlacement.value, locationStrategy: props.locationStrategy ?? 'connected', offset: props.offset ?? 5 }, element, activatorEl.value, cursor);
    if (JSON.stringify(next) !== JSON.stringify(positionStyle.value)) positionStyle.value = next;
}
function lock() {
    if (props.scrollStrategy === 'locked' || props.scrollStrategy === 'block') acquireScrollLock(lockToken);
    else releaseScrollLock(lockToken);
}
function unlock() { releaseScrollLock(lockToken); }
function show() {
    if (props.disabled || !surface.value) return;
    if (isShown()) {
        if (transitionClosing) { transitionClosing = false; state.value = 'opening'; void finishEnter(); }
        return;
    }
    contentMounted.value = true;
    void nextTick(() => {
        const element = surface.value;
        if (!element || !open.value || isShown()) return;
        transitionClosing = false;
        presented.value = true;
        pushOverlay(element);
        state.value = 'opening';
        updateLocation();
        lock();
        void finishEnter();
    });
}
function clearTimers() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    showTimer = undefined;
    hideTimer = undefined;
}
function scheduleShow() {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(() => { showTimer = undefined; open.value = true; }, Math.max(0, Number(props.openDelay) || 0));
}
function scheduleHide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        hideTimer = undefined;
        if (!surface.value?.contains(document.activeElement)) open.value = false;
    }, Math.max(0, Number(props.closeDelay) || 0));
}
function cancelHide() { clearTimeout(hideTimer); hideTimer = undefined; }
function pointerInteraction() { keyboardInteraction = false; }
function keyboardUsed(event: KeyboardEvent) {
    if (event.key === 'Escape' && event.defaultPrevented) return;
    keyboardInteraction = true;
    const element = surface.value;
    if (event.key !== 'Escape' || !open.value || !element || !isTopOverlay(element)) return;
    event.preventDefault();
    event.stopPropagation();
    closeSelf();
}

function focusInitial(direction: 'first' | 'last' = 'first') {
    if (props.disableInitialFocus) return;
    const element = surface.value;
    if (!element || !isShown()) return;
    const target = props.panel
        ? element.querySelector<HTMLElement>(FOCUSABLE) ?? element
        : direction === 'last' ? enabledItems().at(-1) ?? element : enabledItems()[0] ?? element;
    target.focus({ preventScroll: true });
}
function restoreFocus() {
    const active = document.activeElement;
    const trigger = activatorEl.value;
    if (!restoreFocusAfterClose) { restoreFocusAfterClose = true; return; }
    if (!trigger?.isConnected || (parentMenu && !parentMenu.canRestoreFocus())) return;
    if (keyboardInteraction) {
        if (!active || active === document.body || surface.value?.contains(active) || branchOwnedFocus) trigger.focus({ preventScroll: true });
    } else if (active === trigger) trigger?.blur();
    branchOwnedFocus = false;
}

function closeSelf(force = false, restore = true): boolean {
    if (!force && props.persistent) return false;
    clearTimers();
    restoreFocusAfterClose = restore;
    branchOwnedFocus ||= [...childMenus.values()].some(child => child.containsFocus());
    for (const child of [...childMenus.values()]) child.close();
    const wasOpen = open.value;
    if (wasOpen) open.value = false;
    if (force) forcedCloseLatch.value = true;
    if (isShown()) {
        if (!transitionClosing) {
            transitionClosing = true;
            state.value = 'closing';
            void finishLeave();
        }
    }
    else {
        unlock();
        if (!props.eager) contentMounted.value = false;
    }
    return true;
}
function closeFromContent() {
    if (!closeOnContentClick.value) return;
    if (!closeSelf()) return;
    if (closeOnContentClick.value) parentMenu?.close();
}
function close() { closeSelf(); }
const contentSlot = computed(() => ({ close, isActive: open }));
useOverlayBack(surface, () => props.closeOnBack, () => open.value, close);

function cancelCloseParents() {
    clearCloseParentsTimer();
    parentMenu?.cancelCloseParents();
}
function clearCloseParentsTimer() {
    clearTimeout(closeParentsTimer);
    closeParentsTimer = undefined;
}
function closeParents(event?: MouseEvent) {
    clearCloseParentsTimer();
    const target = event?.target;
    const inside = target instanceof Node && (surface.value?.contains(target) || activatorEl.value?.contains(target));
    if (inside) {
        parentMenu?.cancelCloseParents();
        return;
    }
    closeParentsTimer = setTimeout(() => {
        closeParentsTimer = undefined;
        if (childMenus.size || props.persistent) return;
        if (open.value || isShown()) closeSelf(true, false);
        parentMenu?.closeParents(event);
    }, 40);
}
function canRestoreFocus() {
    return !deactivated.value && open.value && isShown() && state.value !== 'closing' && state.value !== 'closed';
}
function forceCloseBranch(deactivate = false) {
    clearTimers();
    clearCloseParentsTimer();
    parentMenu?.cancelCloseParents();
    restoreFocusAfterClose = false;
    for (const child of [...childMenus.values()]) child.deactivate();
    if (open.value) open.value = false;
    forcedCloseLatch.value = true;
    if (deactivate) deactivated.value = true;
    generation++;
    transition.finish();
    transitionClosing = false;
    presented.value = false;
    if (surface.value) popOverlay(surface.value);
    unlock();
    state.value = 'closed';
    if (!props.eager) contentMounted.value = false;
    parentMenu?.unregisterChild(childKey);
}
function openChild(key: object, closeChild: () => void, deactivateChild: () => void = closeChild, containsFocus: () => boolean = () => false) {
    clearCloseParentsTimer();
    parentMenu?.cancelCloseParents();
    for (const [otherKey, otherChild] of childMenus) if (otherKey !== key) otherChild.close();
    childMenus.set(key, { close: closeChild, deactivate: deactivateChild, containsFocus });
}
function unregisterChild(key: object) { childMenus.delete(key); }

const context: MenuContext = {
    ownsNavigation: () => !props.panel,
    close: closeFromContent,
    closeSelf: () => { closeSelf(); },
    closeParents,
    cancelCloseParents,
    canRestoreFocus,
    openChild,
    unregisterChild
};
provide(menuContextKey, context);

function onActivatorClick(event: MouseEvent) {
    cursor = [event.clientX, event.clientY];
    setActivatorElement(event.currentTarget);
    keyboardInteraction = event.detail === 0;
    if (openOnClick.value) {
        event.preventDefault();
        open.value = !open.value;
    }
}
function onActivatorKeydown(event: KeyboardEvent) {
    keyboardInteraction = true;
    if (props.disabled || !props.openOnArrow || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowUp' ? 'last' : 'first';
    open.value = true;
    void nextTick(() => { void nextTick(() => focusInitial(direction)); });
}
function onActivatorMouseenter() { pointerInteraction(); scheduleShow(); }
function onActivatorMouseleave() { scheduleHide(); }
function onActivatorFocus() { if (keyboardInteraction) scheduleShow(); }
function onActivatorBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && surface.value?.contains(event.relatedTarget)) return;
    scheduleHide();
}
function onContentMouseenter() { pointerInteraction(); cancelHide(); }
const activatorAttrs = computed(() => mergeProps({
    ref: setActivatorElement,
    id: triggerId.value,
    'aria-haspopup': props.panel ? 'dialog' : 'menu',
    'aria-expanded': open.value,
    'aria-controls': surfaceId.value,
    'data-ui-menu-activator': true,
    style: `anchor-name: ${anchorName}`,
    onClick: props.disabled ? undefined : onActivatorClick,
    onPointerdown: pointerInteraction,
    onKeydown: props.disabled ? undefined : onActivatorKeydown,
    onMouseenter: props.disabled || !props.openOnHover ? undefined : onActivatorMouseenter,
    onMouseleave: props.disabled || !props.openOnHover ? undefined : onActivatorMouseleave,
    onFocus: props.disabled || !props.openOnFocus ? undefined : onActivatorFocus,
    onBlur: props.disabled || !props.openOnFocus ? undefined : onActivatorBlur
}, props.activatorProps));
const activatorSlot = computed(() => ({ isActive: open, props: activatorAttrs.value, activatorProps: activatorAttrs.value, open: open.value }));

async function finishLeave() {
    const current = ++generation;
    await nextTick();
    const element = surface.value;
    if (!element) return;
    if (props.transition !== undefined) await transition.run(false);
    else await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation || open.value) return;
    transitionClosing = false;
    presented.value = false;
    popOverlay(element);
    unlock();
    state.value = 'closed';
    if (!props.eager) contentMounted.value = false;
    restoreFocus();
    emit('afterLeave');
}
async function finishEnter() {
    const current = ++generation;
    await nextTick();
    const element = surface.value;
    if (!element) return;
    const entering = props.transition === undefined ? undefined : transition.run(true);
    await nextTick();
    updateLocation();
    if (keyboardInteraction) focusInitial();
    if (entering) await entering;
    else await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation || !open.value || !isShown()) return;
    state.value = 'open';
    emit('afterEnter');
}
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
function keydown(event: KeyboardEvent) {
    keyboardInteraction = true;
    emit('keydown', event);
    if (event.defaultPrevented) return;
    if (props.panel) return;
    if (event.key === 'Tab') {
        // Include the currently focused roving item to preserve its DOM position,
        // then choose the next tabbable target (Vuetify's negative-tabindex traversal).
        const nodes = surface.value ? overlayFocusable(surface.value, true) : [];
        const index = nodes.indexOf(document.activeElement as HTMLElement);
        const candidates = event.shiftKey ? nodes.slice(0, index < 0 ? nodes.length : index).reverse() : nodes.slice(index + 1);
        const next = candidates.find(node => node.tabIndex >= 0);
        if (next) { event.preventDefault(); next.focus(); }
        else closeSelf(false, false);
        return;
    }
    const list = enabledItems();
    if (!list.length) return;
    const index = list.indexOf(document.activeElement as HTMLElement);
    const targets: Record<string, number> = {
        ArrowDown: index < 0 || index + 1 >= list.length ? 0 : index + 1,
        ArrowUp: index <= 0 ? list.length - 1 : index - 1,
        Home: 0,
        End: list.length - 1
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    list[targets[event.key]].focus();
}
function onScroll(event: Event) {
    if (!open.value || surface.value?.contains(event.target as Node)) return;
    if (props.scrollStrategy === 'close') closeSelf();
    else if (props.scrollStrategy === 'reposition') updateLocation();
}
function onDocumentClick(event: MouseEvent) {
    const element = surface.value;
    if (!open.value || !element || !isTopOverlay(element) || element.contains(event.target as Node) || activatorEl.value?.contains(event.target as Node)) return;
    // A composite field can open on input focus while its button is the activator.
    // Its positioning target is the whole field; that same click belongs to the opener.
    const target = resolveOverlayTarget(props.target, activatorEl.value, element, cursor);
    if (target instanceof HTMLElement && target.contains(event.target as Node)) return;
    if (!claimOverlayDismiss(event)) return;
    emit('click:outside', event);
    closeSelf();
    parentMenu?.closeParents(event);
}
function onContentClick(event: MouseEvent) {
    if (event.defaultPrevented || !closeOnContentClick.value) return;
    if (event.target instanceof Element && event.target.closest('[data-ui-menu-keep-open], [aria-disabled="true"], :disabled')) return;
    if (event.target instanceof Element && event.target.closest('[data-ui-menu-activator]')) return;
    closeFromContent();
}

watch(open, (value) => {
    clearTimers();
    if (value) {
        contentMounted.value = true;
        show();
        parentMenu?.openChild(childKey, () => { closeSelf(true, false); }, () => { forceCloseBranch(true); }, () => !!surface.value?.contains(document.activeElement) || [...childMenus.values()].some(child => child.containsFocus()));
    } else {
        closeSelf(true);
        parentMenu?.unregisterChild(childKey);
    }
}, { flush: 'post' });
watch(() => props.disabled, (value) => {
    if (value) {
        disabledCloseLatch.value = true;
        closeSelf(true);
        open.value = false;
    }
});
watch(() => [props.modelValue, props.open] as const, ([value, openValue], previous) => {
    if ((value === false || openValue === false) || ((value === true || openValue === true) && !previous?.some((item) => item === true) && !props.disabled)) {
        disabledCloseLatch.value = false;
        forcedCloseLatch.value = false;
    }
});
watch(() => props.scrollStrategy, () => { if (open.value) lock(); else unlock(); });
watch(() => [menuPlacement.value, props.locationStrategy, props.target, props.offset, props.origin, props.viewportMargin, props.stickToTarget, props.width, props.height, props.minWidth, props.maxWidth, props.minHeight, props.maxHeight] as const, () => { if (open.value) void nextTick(updateLocation); }, { deep: true });
watch([surface, activatorEl, () => props.target], ([content, anchor]) => {
    positionObserver?.disconnect();
    if (content) positionObserver?.observe(content);
    if (anchor) positionObserver?.observe(anchor);
    const target = resolveOverlayTarget(props.target, anchor, content, cursor);
    if (target instanceof HTMLElement) positionObserver?.observe(target);
});
watch(() => [props.activator, activatorAttrs.value] as const, ([target]) => {
    externalActivatorCleanup?.();
    externalActivatorCleanup = undefined;
    const element = resolveActivator(target);
    if (!element) {
        if (target) setActivatorElement(undefined);
        return;
    }
    setActivatorElement(element);
    externalActivatorCleanup = bindElementProps(element, activatorAttrs.value);
}, { flush: 'post', immediate: true });
onMounted(() => {
    positionObserver = new ResizeObserver(() => { if (open.value) updateLocation(); });
    if (surface.value) positionObserver.observe(surface.value);
    if (activatorEl.value) positionObserver.observe(activatorEl.value);
    document.addEventListener('pointerdown', pointerInteraction, true);
    document.addEventListener('keydown', keyboardUsed, true);
    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updateLocation);
    window.visualViewport?.addEventListener('resize', updateLocation);
    window.visualViewport?.addEventListener('scroll', updateLocation);
    if (open.value) show();
});
onDeactivated(() => forceCloseBranch(true));
onActivated(() => { deactivated.value = false; });
onBeforeUnmount(() => {
    positionObserver?.disconnect();
    generation++;
    transition.finish();
    clearTimers();
    clearCloseParentsTimer();
    externalActivatorCleanup?.();
    document.removeEventListener('pointerdown', pointerInteraction, true);
    document.removeEventListener('keydown', keyboardUsed, true);
    document.removeEventListener('click', onDocumentClick, true);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', updateLocation);
    window.visualViewport?.removeEventListener('resize', updateLocation);
    window.visualViewport?.removeEventListener('scroll', updateLocation);
    parentMenu?.unregisterChild(childKey);
    for (const child of [...childMenus.values()]) child.deactivate();
    if (surface.value) popOverlay(surface.value);
    unlock();
});

defineExpose({
    close,
    open: () => { open.value = true; },
    surface,
    contentEl: surface,
    activatorEl,
    isActive: open,
    updateLocation
});

const contentAttrs = computed(() => mergeProps(props.contentProps, {
    id: surfaceId.value,
    class: ['ui-menu-surface', props.contentClass, { 'is-panel': props.panel }],
    'data-placement': menuPlacement.value,
    'data-state': state.value,
    inert: state.value === 'closing' || undefined,
    'aria-hidden': state.value === 'closing' || undefined,
    'data-ui-transition': props.transition !== undefined || undefined,
    'data-scroll-strategy': props.scrollStrategy,
    role: props.contentProps.role ?? (props.panel ? 'dialog' : 'menu'),
    'aria-label': props.label ?? props.contentProps['aria-label'],
    'aria-labelledby': props.label || props.contentProps['aria-label'] ? undefined : triggerId.value,
    tabindex: '-1',
    style: { positionAnchor: anchorName, ...positionStyle.value, ...dimensionStyles(props) },
    onPointerdownCapture: pointerInteraction,
    onKeydown: keydown,
    onClick: onContentClick,
    onMouseenter: onContentMouseenter,
    onMouseleave: props.openOnHover ? scheduleHide : undefined
}));
</script>

<template>
    <div class="ui-menu">
        <slot v-if="!props.activator" name="activator" v-bind="activatorSlot" />
        <UiOverlayHost :active="presented" :attach="props.attach" :contained="props.contained" :absolute="props.absolute" :z-index="props.zIndex" :scrim="false" floating>
        <UiMaybeTransition :transition="props.transition ?? false"
            @after-enter="transition.finish" @after-leave="transition.finish" @enter-cancelled="transition.finish" @leave-cancelled="transition.finish">
            <div ref="surface" v-bind="contentAttrs"
                v-show="props.transition === undefined || transition.visible.value">
                <slot v-if="contentMounted || props.eager" v-bind="contentSlot" />
            </div>
        </UiMaybeTransition>
        </UiOverlayHost>
    </div>
</template>
