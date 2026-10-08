<script setup lang="ts">
import { computed, inject, mergeProps, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, provide, ref, useId, watch } from 'vue';
import { acquireScrollLock, bindElementProps, popOverlay, pushOverlay, releaseScrollLock } from './overlay-lifecycle';
import { useOverlayBack } from './overlay-back';
import { menuContextKey, type MenuContext, type MenuPlacement } from './menu';
import { useDefaults } from './defaults';
import { dimensionStyles, type DimensionProps } from './dimensions';
import { overlayPositionStyles, resolveOverlayTarget, type OverlayPositionProps } from './overlay-position';
import { isTopOverlay } from './overlay-lifecycle';

type Activator = string | HTMLElement | null;
type ScrollStrategy = 'none' | 'locked' | 'block' | 'close' | 'reposition';
const rawProps = withDefaults(defineProps<DimensionProps & OverlayPositionProps & {
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
    scrollStrategy: 'reposition'
});
const props = useDefaults(rawProps, 'UMenu');
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

// CSS identifiers stay local to each popover while preserving the existing native anchor positioning.
const uid = useId().replace(/[^\w-]/g, '-');
const surfaceId = computed(() => String(props.contentProps.id ?? `ui-menu-${uid}`));
const activatorId = `ui-menu-trigger-${uid}`;
const anchorName = `--ui-menu-${uid}`;
const surface = ref<HTMLElement>();
const activatorEl = ref<HTMLElement>();
const positionStyle = ref<ReturnType<typeof overlayPositionStyles>>({});
let positionObserver: ResizeObserver | undefined;
let cursor: [number, number] | undefined;
const triggerId = computed(() => props.activator ? activatorEl.value?.id || activatorId : activatorId);
const contentMounted = ref(false);
const parentMenu = inject(menuContextKey, null);
const childKey = {};
const childMenus = new Map<object, { close: () => void; deactivate: () => void }>();
let keyboardInteraction = false;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let closeParentsTimer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;
let deliberateClose = false;
let restoreFocusAfterClose = true;
let externalActivatorCleanup: (() => void) | undefined;
const lockToken = Symbol('ui-menu-scroll-lock');
const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function setActivatorElement(value: unknown) {
    activatorEl.value = value instanceof HTMLElement ? value : undefined;
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
function isShown() { return Boolean(surface.value?.matches(':popover-open')); }
function updateLocation() {
    const element = surface.value;
    if (!element) return;
    element.style.setProperty('position-anchor', props.locationStrategy === 'static' ? 'none' : anchorName);
    const knownPlacement = ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(menuPlacement.value);
    const connected = props.locationStrategy !== undefined || props.target != null || props.offset != null || props.origin != null || !knownPlacement;
    const next = connected ? overlayPositionStyles({ ...props, location: menuPlacement.value, locationStrategy: props.locationStrategy ?? 'connected', offset: props.offset ?? 5 }, element, activatorEl.value, cursor) : {};
    if (JSON.stringify(next) !== JSON.stringify(positionStyle.value)) positionStyle.value = next;
}
function lock() {
    if (props.scrollStrategy === 'locked' || props.scrollStrategy === 'block') acquireScrollLock(lockToken);
    else releaseScrollLock(lockToken);
}
function unlock() { releaseScrollLock(lockToken); }
function show() {
    if (props.disabled || !surface.value || isShown()) return;
    contentMounted.value = true;
    void nextTick(() => {
        const element = surface.value;
        if (!element || !open.value || isShown()) return;
        (element.showPopover as (options?: { source?: HTMLElement }) => void)({ source: activatorEl.value });
        updateLocation();
        lock();
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
    keyboardInteraction = true;
    const element = surface.value;
    if (props.nativeDismiss !== false || event.key !== 'Escape' || !open.value || !element || !isTopOverlay(element)) return;
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
        if (!active || active === document.body || surface.value?.contains(active)) trigger.focus({ preventScroll: true });
    } else if (active === trigger) trigger?.blur();
}

function closeSelf(force = false, restore = true): boolean {
    if (!force && props.persistent) return false;
    clearTimers();
    restoreFocusAfterClose = restore;
    for (const child of [...childMenus.values()]) child.close();
    deliberateClose = true;
    const wasOpen = open.value;
    if (wasOpen) open.value = false;
    if (force) forcedCloseLatch.value = true;
    if (isShown()) surface.value?.hidePopover();
    else {
        deliberateClose = false;
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
    deliberateClose = true;
    generation++;
    if (isShown()) surface.value?.hidePopover();
    if (surface.value) popOverlay(surface.value);
    unlock();
    state.value = 'closed';
    if (!props.eager) contentMounted.value = false;
    parentMenu?.unregisterChild(childKey);
    deliberateClose = false;
}
function openChild(key: object, closeChild: () => void, deactivateChild: () => void = closeChild) {
    clearCloseParentsTimer();
    parentMenu?.cancelCloseParents();
    for (const [otherKey, otherChild] of childMenus) if (otherKey !== key) otherChild.close();
    childMenus.set(key, { close: closeChild, deactivate: deactivateChild });
}
function unregisterChild(key: object) { childMenus.delete(key); }

const context: MenuContext = {
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
    popovertarget: !props.disabled && openOnClick.value ? surfaceId.value : undefined,
    'aria-haspopup': props.panel ? 'dialog' : 'menu',
    'aria-expanded': open.value,
    'aria-controls': surfaceId.value,
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
    await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation || open.value || isShown()) return;
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
    if (keyboardInteraction) focusInitial();
    await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    if (current !== generation || !open.value || !isShown()) return;
    state.value = 'open';
    emit('afterEnter');
}
const state = ref<'opening' | 'open' | 'closing' | 'closed'>('closed');
function toggled(event: Event) {
    const shown = (event as ToggleEvent).newState === 'open';
    if (deactivated.value) {
        if (shown) surface.value?.hidePopover();
        if (surface.value) popOverlay(surface.value);
        unlock();
        return;
    }
    if (shown) {
        if (surface.value) pushOverlay(surface.value);
        generation++;
        contentMounted.value = true;
        state.value = 'opening';
        lock();
        if (!open.value) open.value = true;
        if (parentMenu) parentMenu.openChild(childKey, () => { closeSelf(true, false); }, () => { forceCloseBranch(true); });
        void finishEnter();
        return;
    }
    if (props.persistent && !deliberateClose && open.value) { void nextTick(show); return; }
    if (surface.value) popOverlay(surface.value);
    const wasDeliberate = deliberateClose;
    deliberateClose = false;
    state.value = 'closing';
    if (open.value) open.value = false;
    if (!open.value) {
        parentMenu?.unregisterChild(childKey);
        void finishLeave();
    } else if (wasDeliberate) {
        void nextTick(show);
    }
}
function keydown(event: KeyboardEvent) {
    keyboardInteraction = true;
    emit('keydown', event);
    if (props.panel) return;
    if (event.key === 'Tab') {
        closeSelf(false, false);
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
    emit('click:outside', event);
    closeSelf();
    parentMenu?.closeParents(event);
}
function onContentClick(event: MouseEvent) {
    if (event.defaultPrevented || !closeOnContentClick.value) return;
    if (event.target instanceof Element && event.target.closest('[popovertarget]')) return;
    closeFromContent();
}

watch(open, (value) => {
    clearTimers();
    if (value) {
        contentMounted.value = true;
        show();
        parentMenu?.openChild(childKey, () => { closeSelf(true, false); }, () => { forceCloseBranch(true); });
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
    popover: props.nativeDismiss === false ? 'manual' : 'auto',
    class: ['ui-menu-surface', props.contentClass, { 'is-panel': props.panel }],
    'data-placement': menuPlacement.value,
    'data-state': state.value,
    'data-scroll-strategy': props.scrollStrategy,
    role: props.contentProps.role ?? (props.panel ? 'dialog' : 'menu'),
    'aria-label': props.label ?? props.contentProps['aria-label'],
    'aria-labelledby': props.label || props.contentProps['aria-label'] ? undefined : triggerId.value,
    tabindex: '-1',
    style: { positionAnchor: anchorName, ...positionStyle.value, ...dimensionStyles(props) },
    onToggle: toggled,
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
        <div ref="surface" v-bind="contentAttrs">
            <slot v-if="contentMounted || props.eager" v-bind="contentSlot" />
        </div>
    </div>
</template>
