<script setup lang="ts">
import { computed, mergeProps, nextTick, normalizeClass, onMounted, onBeforeUnmount, provide, ref, useId, watch, type ComponentPublicInstance, type CSSProperties } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { useDefaults } from './defaults';
import { acquireScrollLock, releaseScrollLock } from './overlay-lifecycle';
import { provideUiTheme } from './theme';
import { menuContextKey } from './menu';

type ElementTarget = string | HTMLElement | ComponentPublicInstance;
const rawProps = withDefaults(defineProps<{
    text?: string;
    standardProtocol?: boolean;
    focusable?: boolean;
    modelValue?: boolean;
    id?: string;
    disabled?: boolean;
    interactive?: boolean;
    location?: string;
    origin?: string;
    offset?: number | string | readonly number[];
    target?: ElementTarget | readonly [number, number];
    activator?: ElementTarget;
    activatorProps?: Record<string, unknown>;
    contentProps?: Record<string, unknown>;
    contentClass?: unknown;
    color?: string;
    theme?: string;
    openOnHover?: boolean;
    openOnFocus?: boolean;
    openOnClick?: boolean;
    closeOnContentClick?: boolean;
    openDelay?: number | string;
    closeDelay?: number | string;
    persistent?: boolean;
    closeOnBack?: boolean;
    scrollStrategy?: 'close' | 'reposition' | 'block' | 'none';
    locationStrategy?: 'connected' | 'static';
    eager?: boolean;
    attach?: boolean | string | HTMLElement;
    contained?: boolean;
    transition?: boolean | string;
    zIndex?: number | string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
}>(), {
    modelValue: undefined, focusable: true, location: 'top', origin: 'auto', offset: 8,
    openOnHover: true, openOnFocus: true, openOnClick: false, openDelay: 0, closeDelay: 0,
    persistent: false, scrollStrategy: 'close', locationStrategy: 'connected', eager: true
});
const props = useDefaults(rawProps, 'UTooltip');
provide(menuContextKey, null);
const emit = defineEmits<{
    'update:modelValue': [value: boolean]; 'click:outside': [event: MouseEvent];
    keydown: [event: KeyboardEvent]; afterEnter: []; afterLeave: [];
}>();
const uid = useId();
const id = computed(() => props.id || `ui-tooltip-${uid}`);
const wrapper = ref<HTMLElement>();
const trigger = ref<HTMLElement>();
const bubble = ref<HTMLElement>();
const localVisible = ref(false);
const visible = computed({ get: () => !props.disabled && (props.modelValue ?? localVisible.value), set: setVisible });
const contentScope = { isActive: visible };
const targetElement = ref<HTMLElement>();
const rendered = ref(false);
const theme = provideUiTheme(() => props.theme);
const contentClass = computed(() => normalizeClass(props.contentClass));
const teleportTarget = computed(() => typeof props.attach === 'string' || typeof props.attach === 'object' ? props.attach : 'body');
let hovered = false;
let focused = false;
let contentHovered = false;
let contentFocused = false;
let pointerFocus = false;
let disposed = false;
let revision = 0;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let resizeObserver: ResizeObserver | undefined;
const scrollToken = Symbol('ui-tooltip-scroll');
const externalCleanup: Array<() => void> = [];
function unit(value?: number | string): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
const styles = computed<CSSProperties>(() => ({
    ...theme.styles.value,
    width: unit(props.width), height: unit(props.height), minWidth: unit(props.minWidth), minHeight: unit(props.minHeight),
    maxWidth: unit(props.maxWidth), maxHeight: unit(props.maxHeight), zIndex: props.zIndex,
    backgroundColor: props.color && /^[a-z][\w-]*$/i.test(props.color) ? `var(--ui-theme-${props.color}, ${props.color})` : props.color,
    transformOrigin: props.origin === 'auto' ? undefined : props.origin,
    transition: props.transition === false ? 'none' : undefined
}));
function resolveElement(value?: ElementTarget): HTMLElement | undefined {
    if (!value) return;
    if (value === 'parent') return wrapper.value?.parentElement ?? undefined;
    if (typeof value === 'string') return document.querySelector<HTMLElement>(value) ?? undefined;
    return value instanceof HTMLElement ? value : value.$el instanceof HTMLElement ? value.$el : undefined;
}
function setTrigger(value: Element | ComponentPublicInstance | null): void {
    trigger.value = value instanceof HTMLElement ? value : value && '$el' in value && value.$el instanceof HTMLElement ? value.$el : undefined;
}
function setTarget(value: Element | ComponentPublicInstance | null): void {
    targetElement.value = value instanceof HTMLElement ? value : value && '$el' in value && value.$el instanceof HTMLElement ? value.$el : undefined;
}
function contentEnter(): void { contentHovered = !!props.interactive; if (props.interactive) clearTimeout(hideTimer); }
function contentFocus(): void { contentFocused = !!props.interactive; }
function contentBlur(): void {
    const wasFocused = contentFocused;
    contentFocused = false;
    focused = false;
    if (wasFocused && props.openOnFocus) scheduleHide();
}
function setVisible(value: boolean): void {
    if (disposed || value && props.disabled || value === (props.modelValue ?? localVisible.value)) return;
    localVisible.value = value;
    emit('update:modelValue', value);
}
function scheduleShow(): void {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    if (props.disabled) return;
    showTimer = setTimeout(() => { if (!disposed && !props.disabled) setVisible(true); }, Math.max(0, Number(props.openDelay) || 0));
}
function scheduleHide(): void {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        if (!disposed && !hovered && !focused && !contentHovered && !contentFocused && !props.persistent) setVisible(false);
    }, Math.max(0, Number(props.closeDelay) || 0));
}
function enter(event?: Event): void {
    hovered = true;
    if (event?.currentTarget instanceof HTMLElement) trigger.value = event.currentTarget;
    if (props.openOnHover) scheduleShow();
}
function focus(event?: FocusEvent): void {
    focused = !pointerFocus && props.openOnFocus;
    if (event?.currentTarget instanceof HTMLElement) trigger.value = event.currentTarget;
    if (focused) scheduleShow();
}
function pointerDown(): void { pointerFocus = true; focused = false; }
function click(event: MouseEvent): void {
    if (event.currentTarget instanceof HTMLElement) trigger.value = event.currentTarget;
    if (props.openOnClick) setVisible(!visible.value);
}
function keyboard(): void { pointerFocus = false; }
function leave(): void { hovered = false; if (props.openOnHover && !focused) scheduleHide(); }
function blur(event?: FocusEvent): void {
    if (props.interactive && event?.relatedTarget instanceof Node && bubble.value?.contains(event.relatedTarget)) { contentFocused = true; return; }
    const wasFocused = focused;
    focused = false;
    if (wasFocused && props.openOnFocus && !hovered) scheduleHide();
}
function hide(): void {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hovered = focused = contentHovered = contentFocused = false;
    setVisible(false);
}
function onKeydown(event: KeyboardEvent): void {
    emit('keydown', event);
    if (event.key === 'Escape' && (!props.persistent || !props.standardProtocol)) hide();
}
const activatorBindings = computed(() => mergeProps({
    ref: setTrigger, 'aria-describedby': id.value,
    onPointerdown: pointerDown, onClick: click,
    onMouseenter: enter, onMouseleave: leave, onFocus: focus, onBlur: blur, onKeydown
}, props.activatorProps ?? {}));
function position(): void {
    if (!visible.value || !bubble.value || props.locationStrategy === 'static') return;
    const anchor = resolveElement(typeof props.target === 'string' || !Array.isArray(props.target) ? props.target as ElementTarget : undefined) ?? targetElement.value ?? trigger.value;
    const coordinates = Array.isArray(props.target) ? props.target : undefined;
    if (!anchor && !coordinates) return;
    const rect = coordinates ? { left: coordinates[0], right: coordinates[0], top: coordinates[1], bottom: coordinates[1], width: 0, height: 0 } : anchor!.getBoundingClientRect();
    const bounds = bubble.value.getBoundingClientRect();
    const offsets = Array.isArray(props.offset) ? props.offset : String(props.offset).split(/[ ,]+/).map(Number);
    const main = Number(offsets[0]) || 0;
    const cross = Number(offsets[1]) || 0;
    const rtl = anchor ? getComputedStyle(anchor).direction === 'rtl' : false;
    let [edge, align = 'center'] = props.location.split(/\s+/);
    if (edge === 'start') edge = rtl ? 'right' : 'left';
    if (edge === 'end') edge = rtl ? 'left' : 'right';
    let left = rect.left + (rect.width - bounds.width) / 2;
    let top = rect.top + (rect.height - bounds.height) / 2;
    if (edge === 'top' || edge === 'bottom') {
        if (edge === 'top' && rect.top < bounds.height + main && window.innerHeight - rect.bottom > rect.top) edge = 'bottom';
        else if (edge === 'bottom' && window.innerHeight - rect.bottom < bounds.height + main && rect.top > window.innerHeight - rect.bottom) edge = 'top';
        top = edge === 'top' ? rect.top - bounds.height - main : rect.bottom + main;
        if (align === 'start' || align === 'left') left = rtl && align === 'start' ? rect.right - bounds.width : rect.left;
        if (align === 'end' || align === 'right') left = rtl && align === 'end' ? rect.left : rect.right - bounds.width;
        left += cross;
    } else {
        if (edge === 'left' && rect.left < bounds.width + main && window.innerWidth - rect.right > rect.left) edge = 'right';
        else if (edge === 'right' && window.innerWidth - rect.right < bounds.width + main && rect.left > window.innerWidth - rect.right) edge = 'left';
        left = edge === 'left' ? rect.left - bounds.width - main : rect.right + main;
        if (align === 'start' || align === 'top') top = rect.top;
        if (align === 'end' || align === 'bottom') top = rect.bottom - bounds.height;
        top += cross;
    }
    left = Math.max(8, Math.min(window.innerWidth - bounds.width - 8, left));
    top = Math.max(8, Math.min(window.innerHeight - bounds.height - 8, top));
    if (props.contained && wrapper.value) {
        const container = wrapper.value.getBoundingClientRect();
        left -= container.left;
        top -= container.top;
    }
    bubble.value.style.left = `${left}px`;
    bubble.value.style.top = `${top}px`;
}
async function sync(): Promise<void> {
    const version = ++revision;
    if (visible.value) rendered.value = true;
    await nextTick();
    if (disposed || version !== revision) return;
    const tooltip = bubble.value;
    if (!tooltip) return;
    if (visible.value) {
        if (!props.contained && !tooltip.matches(':popover-open')) tooltip.showPopover();
        if (props.scrollStrategy === 'block') acquireScrollLock(scrollToken);
        position();
    } else {
        if (tooltip.matches(':popover-open')) tooltip.hidePopover();
        releaseScrollLock(scrollToken);
    }
    await Promise.all(tooltip.getAnimations().map(animation => animation.finished.catch(() => {})));
    if (disposed || version !== revision) return;
    if (visible.value) emit('afterEnter');
    else { if (!props.eager) rendered.value = false; emit('afterLeave'); }
}
function onScroll(event: Event): void {
    if (!visible.value || bubble.value?.contains(event.target as Node)) return;
    if (props.scrollStrategy === 'close') hide();
    else if (props.scrollStrategy === 'reposition') position();
}
function outside(event: MouseEvent): void {
    if (!visible.value || !(event.target instanceof Node) || trigger.value?.contains(event.target) || bubble.value?.contains(event.target)) return;
    emit('click:outside', event);
    if (!props.persistent) hide();
}
function back(): void { if (props.closeOnBack && !props.persistent) hide(); }
function bindExternal(): void {
    externalCleanup.splice(0).forEach(cleanup => cleanup());
    const element = resolveElement(props.activator);
    if (!element) return;
    trigger.value = element;
    const bindings = activatorBindings.value;
    for (const [key, value] of Object.entries(bindings)) {
        if (key === 'ref') continue;
        if (/^on[A-Z]/.test(key)) {
            const event = key.slice(2).toLowerCase();
            const handler: EventListener = payload => { for (const callback of Array.isArray(value) ? value : [value]) if (typeof callback === 'function') callback(payload); };
            element.addEventListener(event, handler);
            externalCleanup.push(() => element.removeEventListener(event, handler));
        } else if (value != null && typeof value !== 'object') {
            const previous = element.getAttribute(key);
            element.setAttribute(key, String(value));
            externalCleanup.push(() => previous === null ? element.removeAttribute(key) : element.setAttribute(key, previous));
        }
    }
}
watch(visible, sync, { flush: 'post' });
watch(() => [props.location, props.offset, props.target, props.width, props.height], position, { flush: 'post', deep: true });
watch(() => [props.activator, props.activatorProps, props.id], bindExternal, { flush: 'post', deep: true });
watch([bubble, trigger, targetElement], () => {
    resizeObserver?.disconnect();
    if (bubble.value) resizeObserver?.observe(bubble.value);
    if (trigger.value) resizeObserver?.observe(trigger.value);
    if (targetElement.value) resizeObserver?.observe(targetElement.value);
}, { flush: 'post' });
watch(() => props.disabled, value => { if (value) hide(); });
watch(() => props.scrollStrategy, value => {
    releaseScrollLock(scrollToken);
    if (visible.value && value === 'block') acquireScrollLock(scrollToken);
});
onMounted(() => {
    if (!props.standardProtocol && !props.activator) trigger.value = wrapper.value;
    bindExternal();
    resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(position);
    if (bubble.value) resizeObserver?.observe(bubble.value);
    if (trigger.value) resizeObserver?.observe(trigger.value);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', position);
    window.addEventListener('keydown', keyboard, true);
    window.addEventListener('popstate', back);
    document.addEventListener('click', outside);
    if (visible.value) void sync();
});
onBeforeUnmount(() => {
    disposed = true; revision++;
    clearTimeout(showTimer); clearTimeout(hideTimer);
    if (bubble.value?.matches(':popover-open')) bubble.value.hidePopover();
    externalCleanup.splice(0).forEach(cleanup => cleanup());
    resizeObserver?.disconnect();
    releaseScrollLock(scrollToken);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', position);
    window.removeEventListener('keydown', keyboard, true);
    window.removeEventListener('popstate', back);
    document.removeEventListener('click', outside);
});
defineExpose({ isActive: visible, activatorEl: trigger, contentEl: bubble, updateLocation: position, open: () => setVisible(true), close: hide });
</script>

<template>
    <span ref="wrapper" v-pointer-blur class="ui-tooltip-trigger" :class="{ 'is-contained': props.contained }"
        :tabindex="!props.standardProtocol && !$slots.activator && props.focusable && !props.disabled ? 0 : undefined" :aria-describedby="props.standardProtocol ? undefined : id"
        @pointerdown.capture="!props.standardProtocol && !$slots.activator && pointerDown()" @click="!props.standardProtocol && !$slots.activator && click($event)"
        @mouseenter="!props.standardProtocol && !$slots.activator && enter()" @mouseleave="!props.standardProtocol && !$slots.activator && leave()"
        @focusin="!props.standardProtocol && !$slots.activator && focus()" @focusout="!props.standardProtocol && !$slots.activator && blur($event)"
        @keydown="!props.standardProtocol && !$slots.activator && onKeydown($event)">
        <slot v-if="props.standardProtocol || $slots.activator" name="activator" :props="activatorBindings" :activator-ref="setTrigger" :target-ref="setTarget" :is-active="visible" />
        <slot v-else />
        <Teleport :to="teleportTarget" :disabled="!props.attach || props.attach === true || props.contained">
            <span v-if="props.eager || rendered" :id="id" ref="bubble" class="ui-tooltip" :class="[contentClass, { 'is-interactive': props.interactive, 'is-contained': props.contained }]" :style="styles" :data-theme="theme.current.value.dark ? 'dark' : 'light'"
                v-bind="props.contentProps" :popover="props.contained ? undefined : 'manual'" :aria-hidden="!visible" role="tooltip"
                v-show="!props.contained || visible"
                @mouseenter="contentEnter"
                @mouseleave="contentHovered = false; props.openOnHover && scheduleHide()"
                @focusin="contentFocus" @focusout="contentBlur"
                @click="props.closeOnContentClick && hide()" @keydown="onKeydown">
                <slot v-if="props.standardProtocol" :is-active="contentScope.isActive">{{ props.text }}</slot>
                <slot v-else name="content" :is-active="visible">{{ props.text }}</slot>
            </span>
        </Teleport>
    </span>
</template>
