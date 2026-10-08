<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
import { vPointerBlur } from './pointer-focus';
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { createGroup, windowKey, type GroupValue } from './group-state';
import { attachWindowMotion, windowContextKey, type WindowContext } from './window-state';
import { useReducedMotion } from './motion';
interface TouchData { touchstartX: number; touchstartY: number; touchmoveX: number; touchmoveY: number; touchendX: number; touchendY: number; offsetX: number; offsetY: number }
interface CarouselTouchHandlers {
    left?: (data: TouchData) => void; right?: (data: TouchData) => void;
    up?: (data: TouchData) => void; down?: (data: TouchData) => void;
    onLeft?: (data: TouchData) => void; onRight?: (data: TouchData) => void;
    start?: (event: { originalEvent: TouchEvent } & TouchData) => void;
    end?: (event: { originalEvent: TouchEvent } & TouchData) => void;
    move?: (event: { originalEvent: TouchEvent } & TouchData) => void;
}
const rawProps = withDefaults(defineProps<{
    interval?: number | string; cycle?: boolean; continuous?: boolean; disabled?: boolean; label?: string;
    touch?: boolean | CarouselTouchHandlers; keyboard?: boolean; hideDelimiters?: boolean;
    hideDelimiterBackground?: boolean; delimiterIcon?: string; verticalDelimiters?: boolean | 'left' | 'right';
    showArrows?: boolean | 'hover'; height?: number | string; ripple?: RippleOptions; eager?: boolean;
    tag?: string; direction?: 'horizontal' | 'vertical'; mandatory?: boolean | 'force';
}>(), { ripple: true, interval: 6000, cycle: true, continuous: true, touch: true, keyboard: true, showArrows: true, height: 'auto', delimiterIcon: 'mdi-record', tag: 'section', direction: 'horizontal', mandatory: 'force' });
const props = useDefaults(rawProps, 'UCarousel');
const model = defineModel<GroupValue | null>({ default: null });
const group = createGroup(model, { mandatory: () => props.mandatory, disabled: () => props.disabled, forceOnlyInitial: true });
const itemDisabled = reactive(new Map<GroupValue, () => boolean>());
const baseRegister = group.register;
group.register = (value: GroupValue, disabled?: MaybeRefOrGetter<boolean | undefined>) => {
    const isDisabled = () => toValue(disabled) ?? false;
    itemDisabled.set(value, isDisabled);
    const unregister = baseRegister(value, isDisabled);
    return () => { if (itemDisabled.get(value) === isDisabled) itemDisabled.delete(value); unregister(); };
};
const direction = ref<'forward' | 'backward'>('forward');
const visited = reactive(new Set<GroupValue>());
const hovered = ref(false);
const focused = ref(false);
const paused = computed(() => hovered.value || focused.value);
const reducedMotion = useReducedMotion();
const rootElement = ref<HTMLElement>();
let mounted = false;
const context: WindowContext = Object.assign(group, { direction, visited, eager: computed(() => !!props.eager), orientation: computed(() => props.direction) });
provide(windowKey, context);
provide(windowContextKey, context);
const motion = attachWindowMotion(context, (value) => { direction.value = value; });
const enabledValues = computed(() => context.values.filter(value => !(itemDisabled.get(value)?.() ?? false)));
watch([() => props.mandatory, () => props.disabled, enabledValues, model], () => {
    if (props.mandatory === 'force' && !props.disabled && currentValue() === undefined && enabledValues.value.length) model.value = enabledValues.value[0];
}, { flush: 'post' });
function cssDimension(value: string | number | undefined): string | undefined { return typeof value === 'number' ? `${value}px` : value; }
function currentValue(): GroupValue | undefined { const selected = context.selected.value; return Array.isArray(selected) ? selected[0] : selected ?? undefined; }
function canMove(delta: 1 | -1): boolean {
    if (props.disabled || !enabledValues.value.length) return false;
    if (props.continuous) return true;
    const values = context.values;
    const current = currentValue();
    const index = current === undefined ? -1 : values.indexOf(current);
    if (index < 0) return delta > 0;
    for (let cursor = index + delta; cursor >= 0 && cursor < values.length; cursor += delta) if (!itemDisabled.get(values[cursor])?.()) return true;
    return false;
}
function move(delta: 1 | -1): boolean {
    if (props.disabled || !context.values.length || !enabledValues.value.length) return false;
    const values = context.values;
    const current = currentValue();
    const currentIndex = current === undefined ? -1 : values.indexOf(current);
    let cursor = currentIndex < 0 ? (delta > 0 ? -1 : values.length) : currentIndex;
    for (let offset = 0; offset < values.length; offset++) {
        cursor += delta;
        if (cursor < 0 || cursor >= values.length) { if (!props.continuous) return false; cursor = (cursor + values.length) % values.length; }
        const value = values[cursor];
        if (itemDisabled.get(value)?.()) continue;
        context.selected.value = context.multiple ? [value] : value;
        direction.value = delta > 0 ? 'forward' : 'backward';
        return true;
    }
    return false;
}
function next(): void { move(1); }
function prev(): void { move(-1); }
group.next = next;
group.prev = prev;
function select(value: GroupValue): void { if (!props.disabled && !itemDisabled.get(value)?.()) context.select(value); }
function keyDirection(event: KeyboardEvent): 1 | -1 | undefined {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return undefined;
    if (props.direction === 'vertical') return event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : undefined;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return undefined;
    const rtl = rootElement.value && getComputedStyle(rootElement.value).direction === 'rtl';
    return (event.key === 'ArrowRight') !== Boolean(rtl) ? 1 : -1;
}
function onKeydown(event: KeyboardEvent): void { if (!props.keyboard) return; const delta = keyDirection(event); if (delta === undefined || !canMove(delta)) return; event.preventDefault(); move(delta); }
function onDelimiterKeydown(event: KeyboardEvent, delta: 1 | -1): void {
    if (keyDirection(event) !== delta || !canMove(delta)) return;
    event.preventDefault(); event.stopPropagation(); move(delta);
    void nextTick(() => rootElement.value?.querySelector<HTMLElement>('.u-carousel-controls [aria-pressed="true"]')?.focus());
}
function delimiterItem(value: GroupValue) { return { id: String(value), value, disabled: itemDisabled.get(value)?.() }; }
function delimiterProps(value: GroupValue, index: number) {
    return {
        id: `carousel-item-${String(value)}`, class: ['u-carousel-delimiter', context.isSelected(value) && 'is-active'],
        'aria-label': `前往第 ${index + 1} 项`, 'aria-pressed': context.isSelected(value),
        disabled: props.disabled || !!itemDisabled.get(value)?.(), onClick: () => select(value),
        onKeydown: (event: KeyboardEvent) => { const delta = keyDirection(event); if (delta !== undefined) onDelimiterKeydown(event, delta); }
    };
}
const prevDisabled = computed(() => !canMove(-1));
const nextDisabled = computed(() => !canMove(1));
const arrowsVisible = computed(() => props.showArrows === true || props.showArrows === 'hover');
let timer: ReturnType<typeof setTimeout> | undefined;
function onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && (event.currentTarget as HTMLElement | null)?.contains(next)) return;
    focused.value = false;
}
function onFocusIn(): void {
    focused.value = true;
}
function resetTimer(): void {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const interval = Number(props.interval);
    if (!mounted || !props.cycle || props.disabled || paused.value || reducedMotion.value || !Number.isFinite(interval) || interval <= 0) return;
    timer = setTimeout(() => { timer = undefined; const before = model.value; next(); if (model.value === before) resetTimer(); }, Math.max(1, interval));
}
watch([() => props.interval, () => props.cycle, () => props.disabled, () => props.continuous, paused, reducedMotion], resetTimer);
watch(model, (value) => { if (value != null) visited.add(value); resetTimer(); }, { immediate: true });
onMounted(() => { mounted = true; resetTimer(); });
onBeforeUnmount(() => { mounted = false; if (timer) clearTimeout(timer); timer = undefined; });
defineExpose({ next, prev });

let touchStart: { x: number; y: number; data: TouchData } | undefined;
function touchData(x = 0, y = 0): TouchData { return { touchstartX: x, touchstartY: y, touchmoveX: x, touchmoveY: y, touchendX: x, touchendY: y, offsetX: 0, offsetY: 0 }; }
function onTouchStart(event: TouchEvent): void {
    if (props.touch === false || !event.touches.length) return;
    if (props.direction === 'vertical' && typeof props.touch !== 'object') { const touch = event.touches[0]; touchStart = { x: touch.clientX, y: touch.clientY, data: touchData(touch.clientX, touch.clientY) }; return; }
    if (typeof props.touch === 'object') { const touch = event.touches[0]; const data = touchData(touch.clientX, touch.clientY); touchStart = { x: touch.clientX, y: touch.clientY, data }; props.touch.start?.({ originalEvent: event, ...data }); return; }
    motion.onTouchStart(event);
}
function onTouchMove(event: TouchEvent): void {
    if (props.touch === false || typeof props.touch !== 'object' || !touchStart || !event.touches.length) return;
    const touch = event.touches[0]; const data = { ...touchStart.data, touchmoveX: touch.clientX, touchmoveY: touch.clientY }; touchStart = { ...touchStart, data }; props.touch.move?.({ originalEvent: event, ...data });
}
function onTouchEnd(event: TouchEvent): void {
    if (props.touch === false) return;
    if (props.direction === 'vertical' && typeof props.touch !== 'object') {
        const start = touchStart; touchStart = undefined;
        if (!start || !event.changedTouches.length) return;
        const touch = event.changedTouches[0]; const x = touch.clientX - start.x; const y = touch.clientY - start.y;
        if (Math.abs(y) >= 40 && Math.abs(y) >= Math.abs(x) * 1.5) { if (y < 0) next(); else prev(); }
        return;
    }
    if (typeof props.touch !== 'object') { motion.onTouchEnd(event); return; }
    const start = touchStart; touchStart = undefined; if (!start || !event.changedTouches.length) return;
    const touch = event.changedTouches[0]; const data: TouchData = { ...start.data, touchendX: touch.clientX, touchendY: touch.clientY, offsetX: touch.clientX - start.x, offsetY: touch.clientY - start.y };
    props.touch.end?.({ originalEvent: event, ...data });
    if (Math.abs(data.offsetX) >= 40 && Math.abs(data.offsetX) >= Math.abs(data.offsetY) * 1.5) {
        const custom = data.offsetX < 0 ? props.touch.onLeft ?? props.touch.left : props.touch.onRight ?? props.touch.right;
        if (custom) { custom(data); return; }
        if (data.offsetX < 0) next(); else prev();
        return;
    }
    if (Math.abs(data.offsetY) >= 40 && Math.abs(data.offsetY) >= Math.abs(data.offsetX) * 1.5) {
        (data.offsetY < 0 ? props.touch.up : props.touch.down)?.(data);
    }
}
function onTouchCancel(): void { touchStart = undefined; motion.onTouchCancel(); }
</script>
<template>
    <component :is="props.tag" ref="rootElement" class="u-carousel" :class="{ 'hide-delimiter-background': props.hideDelimiterBackground, 'vertical-delimiters': props.verticalDelimiters, 'show-arrows-on-hover': props.showArrows === 'hover', 'is-vertical': props.direction === 'vertical' }" :data-vertical-delimiters="props.verticalDelimiters || undefined" :style="{ height: cssDimension(props.height) }" role="region" aria-roledescription="轮播" :aria-label="props.label || '轮播内容'" @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="onFocusIn" @focusout="onFocusOut" @keydown="onKeydown" @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd" @touchcancel="onTouchCancel">
        <div class="u-carousel-content"><slot :next="next" :prev="prev" :model-value="model" /></div>
        <template v-if="arrowsVisible">
            <slot name="prev" :props="{ onClick: prev, disabled: prevDisabled, 'aria-label': '上一项', class: 'u-carousel-prev' }">
                <button v-ripple="props.ripple" v-pointer-blur type="button" class="u-carousel-prev" aria-label="上一项" :disabled="prevDisabled" @click="prev"><Icon name="mdi-chevron-left" :size="20" /></button>
            </slot>
            <slot name="next" :props="{ onClick: next, disabled: nextDisabled, 'aria-label': '下一项', class: 'u-carousel-next' }">
                <button v-ripple="props.ripple" v-pointer-blur type="button" class="u-carousel-next" aria-label="下一项" :disabled="nextDisabled" @click="next"><Icon name="mdi-chevron-right" :size="20" /></button>
            </slot>
        </template>
        <div v-if="!props.hideDelimiters" class="u-carousel-controls" :class="{ 'is-vertical': props.verticalDelimiters, 'are-left': props.verticalDelimiters === 'left', 'is-background-hidden': props.hideDelimiterBackground }">
            <template v-for="(value, index) in context.values" :key="value">
                <slot name="item" :item="delimiterItem(value)" :index="index" :props="delimiterProps(value, index)">
                    <button v-ripple.center.circle="props.ripple" v-pointer-blur type="button" v-bind="delimiterProps(value, index)"><Icon :name="props.delimiterIcon" class="u-carousel-dot" aria-hidden="true" /></button>
                </slot>
            </template>
        </div>
    </component>
</template>
