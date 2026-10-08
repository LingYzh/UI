<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import { useLayoutItem } from './layout-completion';
import { useDisplay } from './display';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
import UTransition from './UTransition.vue';

type DrawerLocation = 'left' | 'right' | 'start' | 'end';

defineOptions({ inheritAttrs: false });

const rawProps = withDefaults(defineProps<{
    modelValue?: boolean;
    location?: DrawerLocation;
    width?: number;
    rail?: boolean;
    railWidth?: number;
    temporary?: boolean;
    mobileBreakpoint?: number;
    absolute?: boolean;
    order?: number | string;
    name?: string;
    tag?: string;
    permanent?: boolean;
    persistent?: boolean;
    scrim?: boolean | string;
    touchless?: boolean;
    expandOnHover?: boolean;
    disableResizeWatcher?: boolean;
    disableRouteWatcher?: boolean;
    stateless?: boolean;
}>(), {
    modelValue: undefined,
    location: 'left',
    width: 256,
    rail: false,
    railWidth: 56,
    temporary: false,
    absolute: false,
    order: 0,
    tag: 'nav',
    permanent: false,
    persistent: false,
    scrim: true,
    touchless: false,
    expandOnHover: false,
    disableResizeWatcher: false,
    disableRouteWatcher: false,
    stateless: false,
});
const props = useDefaults(rawProps, 'UNavigationDrawer');
const attrs = useAttrs();
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'update:rail': [value: boolean];
    'click:outside': [event: MouseEvent];
}>();

const element = ref<HTMLElement>();
const internal = ref(props.modelValue ?? true);
const mobile = ref(false);
const hovering = ref(false);
const display = useDisplay();
const locale = useLocale();
const physicalLocation = computed<'left' | 'right'>(() => {
    if (props.location === 'start') return locale.isRtl.value ? 'right' : 'left';
    if (props.location === 'end') return locale.isRtl.value ? 'left' : 'right';
    return props.location;
});
const overlay = computed(() => !props.permanent && (props.temporary || (props.mobileBreakpoint === undefined ? display.mobile.value : mobile.value)));
const shown = computed(() => props.permanent || (props.modelValue ?? internal.value));
const expanded = computed(() => shown.value && (!props.rail || props.expandOnHover && hovering.value));
const visualRail = computed(() => props.rail && !(props.expandOnHover && hovering.value));
const size = computed(() => props.rail && !(props.expandOnHover && hovering.value) ? props.railWidth : props.width);
const layoutSize = computed(() => props.rail && props.expandOnHover ? props.railWidth : size.value);
const { layout, offset } = useLayoutItem(physicalLocation, layoutSize, computed(() => shown.value && !overlay.value && !props.absolute), computed(() => Number(props.order) || 0), computed(() => props.name));
const topOffset = computed(() => overlay.value || props.absolute ? 0 : layout?.offsets.value.top ?? 0);
const bottomOffset = computed(() => overlay.value || props.absolute ? 0 : layout?.offsets.value.bottom ?? 0);
const scrimStyle = computed(() => typeof props.scrim === 'string' ? { backgroundColor: props.scrim } : undefined);
const showScrim = computed(() => shown.value && overlay.value && props.scrim !== false);

let media: MediaQueryList | undefined;
let mediaHandler: (() => void) | undefined;
let activePointer: { id: number; x: number; y: number; horizontal: boolean } | undefined;
const router = (getCurrentInstance()?.proxy as unknown as { $router?: { currentRoute?: { value: unknown } } } | null)?.$router;

function setActive(value: boolean, notify = true): void {
    if (props.permanent && !value) return;
    if (props.modelValue === undefined) internal.value = value;
    if (notify) emit('update:modelValue', value);
}
function open(): void { setActive(true); }
function close(): void { setActive(false); }
function toggle(): void { setActive(!shown.value); }
function closeFromOutside(event: MouseEvent): void {
    if (!shown.value || !overlay.value) return;
    const target = event.target;
    if (!(target instanceof Node) || element.value?.contains(target)) return;
    emit('click:outside', event);
    if (!props.persistent) close();
}
function onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !shown.value || !overlay.value) return;
    if (props.persistent || props.permanent) return;
    close();
}
function onMouseEnter(): void {
    if (!props.expandOnHover || !props.rail) return;
    hovering.value = true;
    emit('update:rail', false);
}
function onMouseLeave(): void {
    if (!props.expandOnHover || !props.rail) return;
    hovering.value = false;
    emit('update:rail', true);
}
function syncMedia(): void {
    if (media && mediaHandler) media.removeEventListener('change', mediaHandler);
    media = undefined;
    mediaHandler = undefined;
    if (props.mobileBreakpoint === undefined || typeof window === 'undefined') return;
    media = window.matchMedia(`(max-width: ${props.mobileBreakpoint - 1}px)`);
    mediaHandler = () => { mobile.value = Boolean(media?.matches); };
    media.addEventListener('change', mediaHandler);
    mediaHandler();
}
function onPointerDown(event: PointerEvent): void {
    if (props.touchless || props.permanent || !overlay.value || event.pointerType !== 'touch' || !event.isPrimary) return;
    const fromEdge = physicalLocation.value === 'left'
        ? event.clientX <= 25
        : event.clientX >= window.innerWidth - 25;
    const target = event.target;
    const insideDrawer = shown.value && target instanceof Node && !!element.value?.contains(target);
    if (!insideDrawer && !(fromEdge && !shown.value)) return;
    activePointer = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
}
function onPointerMove(event: PointerEvent): void {
    if (!activePointer || activePointer.id !== event.pointerId || props.touchless) return;
    const dx = event.clientX - activePointer.x;
    const dy = event.clientY - activePointer.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 3) activePointer.horizontal = true;
    else if (Math.abs(dy) > 3) activePointer = undefined;
    if (activePointer?.horizontal && event.cancelable) event.preventDefault();
}
function onPointerUp(event: PointerEvent): void {
    if (!activePointer || activePointer.id !== event.pointerId) return;
    const dx = event.clientX - activePointer.x;
    const horizontal = activePointer.horizontal;
    activePointer = undefined;
    if (!horizontal || Math.abs(dx) < 40 || props.touchless || props.permanent) return;
    const openGesture = physicalLocation.value === 'left' ? dx > 0 : dx < 0;
    const closeGesture = physicalLocation.value === 'left' ? dx < 0 : dx > 0;
    if (!shown.value && openGesture) open();
    else if (shown.value && closeGesture) close();
}
function onPointerCancel(event: PointerEvent): void {
    if (activePointer?.id === event.pointerId) activePointer = undefined;
}
function handleResize(next: boolean): void {
    if (props.permanent || props.stateless || props.disableResizeWatcher) return;
    setActive(!next);
}
function handleRouteChange(): void {
    if (props.permanent || props.stateless || props.disableRouteWatcher || !overlay.value) return;
    close();
}

watch(() => props.mobileBreakpoint, syncMedia);
watch(overlay, (next, previous) => {
    if (next !== previous) handleResize(next);
});
watch(() => props.permanent, permanent => {
    if (permanent) setActive(true);
});
watch(() => router?.currentRoute?.value, handleRouteChange);
watch(() => props.touchless, touchless => { if (touchless) activePointer = undefined; });

onMounted(() => {
    syncMedia();
    if (props.modelValue === undefined && !props.stateless) setActive(!overlay.value, false);
    document.addEventListener('click', closeFromOutside);
    document.addEventListener('keydown', onDocumentKeydown);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
});
onBeforeUnmount(() => {
    if (media && mediaHandler) media.removeEventListener('change', mediaHandler);
    document.removeEventListener('click', closeFromOutside);
    document.removeEventListener('keydown', onDocumentKeydown);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    activePointer = undefined;
});

defineExpose({ element, open, close, toggle, expanded, size, isActive: shown });
</script>

<template>
    <UTransition variant="fade"><div v-if="showScrim" class="ui-navigation-scrim" :style="scrimStyle" /></UTransition>
    <component :is="props.tag" v-bind="attrs" ref="element" class="ui-navigation-drawer"
        :class="{ 'is-open': shown, 'is-temporary': overlay, 'is-rail': visualRail, 'is-absolute': props.absolute, 'is-expand-on-hover': props.expandOnHover, 'is-hovering': hovering }"
        :data-location="physicalLocation"
        :style="{ width: size + 'px', [physicalLocation]: offset + 'px', top: topOffset + 'px', bottom: bottomOffset + 'px' }"
        :aria-hidden="!shown" :inert="!shown"
        @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <slot v-if="$slots.prepend" name="prepend" :is-active="shown" :expanded="expanded" :rail="visualRail" :toggle="toggle" :open="open" :close="close" />
        <slot :is-active="shown" :expanded="expanded" :rail="visualRail" :toggle="toggle" :open="open" :close="close" />
        <slot v-if="$slots.append" name="append" :is-active="shown" :expanded="expanded" :rail="visualRail" :toggle="toggle" :open="open" :close="close" />
    </component>
</template>
