<script setup lang="ts">
import { computed, provide, reactive, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
import { createGroup, windowKey, type GroupValue } from './group-state';
import { attachWindowMotion, windowContextKey, type WindowContext } from './window-state';

interface TouchData {
    touchstartX: number;
    touchstartY: number;
    touchmoveX: number;
    touchmoveY: number;
    touchendX: number;
    touchendY: number;
    offsetX: number;
    offsetY: number;
}
interface WindowTouchHandlers {
    left?: (data: TouchData) => void;
    right?: (data: TouchData) => void;
    up?: (data: TouchData) => void;
    down?: (data: TouchData) => void;
    onLeft?: (data: TouchData) => void;
    onRight?: (data: TouchData) => void;
    start?: (event: { originalEvent: TouchEvent } & TouchData) => void;
    end?: (event: { originalEvent: TouchEvent } & TouchData) => void;
    move?: (event: { originalEvent: TouchEvent } & TouchData) => void;
}

const rawProps = withDefaults(defineProps<{
    disabled?: boolean;
    mandatory?: boolean | 'force';
    touch?: boolean | WindowTouchHandlers;
    keyboard?: boolean;
    continuous?: boolean;
    eager?: boolean;
    label?: string;
    height?: string | number;
    tag?: string;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    showArrows?: boolean | 'hover';
}>(), { tag: 'div', direction: 'horizontal', showArrows: false, keyboard: true, mandatory: 'force' });
const props = useDefaults(rawProps, 'UWindow');
const model = defineModel<GroupValue | null>({ default: null });
const group = createGroup(model, { mandatory: () => props.mandatory, disabled: () => props.disabled, forceOnlyInitial: true });
const itemDisabled = reactive(new Map<GroupValue, () => boolean>());
const register = group.register;
group.register = (value: GroupValue, disabled?: MaybeRefOrGetter<boolean | undefined>) => {
    const isDisabled = () => toValue(disabled) ?? false;
    itemDisabled.set(value, isDisabled);
    const unregister = register(value, isDisabled);
    return () => {
        if (itemDisabled.get(value) === isDisabled) itemDisabled.delete(value);
        unregister();
    };
};
const direction = ref<'forward' | 'backward'>('forward');
const visited = reactive(new Set<GroupValue>());
watch(model, value => { if (value != null) visited.add(value); }, { immediate: true });
const context: WindowContext = Object.assign(group, { direction, visited, eager: computed(() => !!props.eager), orientation: computed(() => props.direction) });
provide(windowKey, context);
provide(windowContextKey, context);
const rootElement = ref<HTMLElement>();
const enabledValues = computed(() => context.values.filter(value => !(itemDisabled.get(value)?.() ?? false)));
watch([() => props.mandatory, () => props.disabled, enabledValues, model], () => {
    if (props.mandatory !== 'force' || props.disabled || currentValue() !== undefined || !enabledValues.value.length) return;
    model.value = enabledValues.value[0];
}, { flush: 'post' });
function cssDimension(value: string | number | undefined): string | undefined {
    return typeof value === 'number' ? `${value}px` : value;
}

function currentValue(): GroupValue | undefined {
    const selected = context.selected.value;
    return Array.isArray(selected) ? selected[0] : selected ?? undefined;
}
function canMove(delta: 1 | -1): boolean {
    if (props.disabled || !enabledValues.value.length) return false;
    if (props.continuous) return true;
    const values = context.values;
    const current = currentValue();
    const index = current === undefined ? -1 : values.indexOf(current);
    if (index < 0) return delta > 0;
    for (let cursor = index + delta; cursor >= 0 && cursor < values.length; cursor += delta) {
        if (!(itemDisabled.get(values[cursor])?.() ?? false)) return true;
    }
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
        if (cursor < 0 || cursor >= values.length) {
            if (!props.continuous) return false;
            cursor = (cursor + values.length) % values.length;
        }
        const value = values[cursor];
        if (itemDisabled.get(value)?.() ?? false) continue;
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
const motion = attachWindowMotion(context, value => { direction.value = value; });

function onKeydown(event: KeyboardEvent): void {
    if (!props.keyboard || props.disabled) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return;
    const vertical = props.direction === 'vertical';
    const key = event.key;
    if (vertical ? key !== 'ArrowUp' && key !== 'ArrowDown' : key !== 'ArrowLeft' && key !== 'ArrowRight') return;
    const rtl = !vertical && rootElement.value && getComputedStyle(rootElement.value).direction === 'rtl';
    const delta: 1 | -1 = vertical
        ? key === 'ArrowDown' ? 1 : -1
        : (key === 'ArrowRight') !== Boolean(rtl) ? 1 : -1;
    if (!canMove(delta)) return;
    event.preventDefault();
    move(delta);
}

let touchStart: { x: number; y: number; data: TouchData } | undefined;
function touchData(x = 0, y = 0): TouchData {
    return { touchstartX: x, touchstartY: y, touchmoveX: x, touchmoveY: y, touchendX: x, touchendY: y, offsetX: 0, offsetY: 0 };
}
function onTouchStart(event: TouchEvent): void {
    if (props.touch === false || !event.touches.length) return;
    if (typeof props.touch === 'object') {
        const touch = event.touches[0];
        const data = touchData(touch.clientX, touch.clientY);
        touchStart = { x: touch.clientX, y: touch.clientY, data };
        props.touch.start?.({ originalEvent: event, ...data });
        return;
    }
    motion.onTouchStart(event);
}
function onTouchMove(event: TouchEvent): void {
    if (props.touch === false || typeof props.touch !== 'object' || !touchStart || !event.touches.length) return;
    const touch = event.touches[0];
    const data = { ...touchStart.data, touchmoveX: touch.clientX, touchmoveY: touch.clientY };
    touchStart = { ...touchStart, data };
    props.touch.move?.({ originalEvent: event, ...data });
}
function onTouchEnd(event: TouchEvent): void {
    if (props.touch === false) return;
    if (typeof props.touch !== 'object') { motion.onTouchEnd(event); return; }
    const start = touchStart;
    touchStart = undefined;
    if (!start || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const data: TouchData = {
        ...start.data,
        touchendX: touch.clientX,
        touchendY: touch.clientY,
        offsetX: touch.clientX - start.x,
        offsetY: touch.clientY - start.y
    };
    props.touch.end?.({ originalEvent: event, ...data });
    const vertical = props.direction === 'vertical';
    if (vertical ? Math.abs(data.offsetY) < 40 || Math.abs(data.offsetY) < Math.abs(data.offsetX) * 1.5 : Math.abs(data.offsetX) < 40 || Math.abs(data.offsetX) < Math.abs(data.offsetY) * 1.5) return;
    const directionKey = vertical ? data.offsetY < 0 ? 'up' : 'down' : data.offsetX < 0 ? 'left' : 'right';
    const custom = directionKey === 'left' ? props.touch.onLeft ?? props.touch.left
        : directionKey === 'right' ? props.touch.onRight ?? props.touch.right
            : props.touch[directionKey];
    if (custom) { custom(data); return; }
    if (directionKey === 'left' || directionKey === 'down') next();
    else prev();
}
function onTouchCancel(): void { touchStart = undefined; motion.onTouchCancel(); }

const arrowsVisible = computed(() => props.showArrows === true || props.showArrows === 'hover');
const prevProps = computed(() => ({ icon: 'mdi-chevron-left', class: 'u-window-prev', onClick: prev, disabled: !canMove(-1), 'aria-label': '上一项' }));
const nextProps = computed(() => ({ icon: 'mdi-chevron-right', class: 'u-window-next', onClick: next, disabled: !canMove(1), 'aria-label': '下一项' }));
defineExpose({ next, prev });
</script>

<template>
    <component
        :is="props.tag"
        ref="rootElement"
        class="u-window"
        :class="{ 'is-vertical': props.direction === 'vertical', 'is-reverse': props.reverse, 'show-arrows-on-hover': props.showArrows === 'hover' }"
        :data-direction="props.direction"
        :data-reverse="props.reverse || undefined"
        :aria-label="props.label"
        :style="{ height: cssDimension(rawProps.height !== undefined ? rawProps.height : props.height) }"
        @keydown="onKeydown"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend.passive="onTouchEnd"
        @touchcancel="onTouchCancel"
    >
        <slot :next="next" :prev="prev" :model-value="model" :group="context" />
        <slot name="additional" :next="next" :prev="prev" :model-value="model" :group="context" />
        <div v-if="arrowsVisible" class="u-window-controls" :class="{ 'is-hover': props.showArrows === 'hover' }">
            <slot name="prev" :props="prevProps">
                <button type="button" v-bind="prevProps"><Icon :name="prevProps.icon" :size="20" /></button>
            </slot>
            <slot name="next" :props="nextProps">
                <button type="button" v-bind="nextProps"><Icon :name="nextProps.icon" :size="20" /></button>
            </slot>
        </div>
    </component>
</template>
