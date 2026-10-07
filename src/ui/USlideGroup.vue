<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue';
import UiButton from './UiButton.vue';
import Icon from '../components/Icon.vue';
import { useDefaults } from './defaults';
import { useDisplay } from './display';
import { useReducedMotion } from './motion';
import { defaultValueComparator } from './selection';
import { slideGroupKey, type SlideGroupProps, type SlideItem } from './slide-group';
const rawProps = withDefaults(defineProps<SlideGroupProps>(), { direction: 'horizontal', scrollToActive: true, scrollDistance: '100%', selectedClass: 'is-selected' });
const props = useDefaults(rawProps, 'USlideGroup');
const model = defineModel<unknown>();
const viewport = ref<HTMLElement>();
const content = ref<HTMLElement>();
const items = shallowRef<SlideItem[]>([]);
const overflow = ref(false);
const atStart = ref(true);
const atEnd = ref(true);
const display = useDisplay();
const reduced = useReducedMotion();
let observer: ResizeObserver | undefined;
const vertical = computed(() => props.direction === 'vertical');
const equal = computed(() => props.valueComparator ?? defaultValueComparator);
const valueOf = (item: SlideItem) => item.value() === undefined ? items.value.indexOf(item) : item.value();
const selected = computed(() => props.multiple ? Array.isArray(model.value) ? model.value : [] : model.value === undefined || model.value === null ? [] : [model.value]);
function isSelected(id: string) { const item = items.value.find(entry => entry.id === id); return !!item && selected.value.some(value => equal.value(value, valueOf(item))); }
function select(id: string, active = true) {
    const item = items.value.find(entry => entry.id === id);
    if (!item || props.disabled || item.disabled()) return;
    const value = valueOf(item);
    const exists = isSelected(id);
    if (active === exists) return;
    if (!active && props.mandatory && selected.value.length <= 1) return;
    if (props.multiple) {
        if (active && props.max !== undefined && selected.value.length >= props.max) return;
        model.value = active ? [...selected.value, value] : selected.value.filter(entry => !equal.value(entry, value));
    } else model.value = active ? value : undefined;
}
function forceSelection() {
    if (props.mandatory !== 'force' || selected.value.length || props.disabled) return;
    const first = items.value.find(item => !item.disabled());
    if (first) select(first.id);
}
function measure() {
    const view = viewport.value;
    const inner = content.value;
    if (!view || !inner) return;
    const a = view.getBoundingClientRect();
    const b = inner.getBoundingClientRect();
    const rtl = !vertical.value && getComputedStyle(view).direction === 'rtl';
    overflow.value = vertical.value ? view.scrollHeight > view.clientHeight + 1 : view.scrollWidth > view.clientWidth + 1;
    atStart.value = vertical.value ? b.top >= a.top - 1 : rtl ? b.right <= a.right + 1 : b.left >= a.left - 1;
    atEnd.value = vertical.value ? b.bottom <= a.bottom + 1 : rtl ? b.left >= a.left - 1 : b.right <= a.right + 1;
}
function scrollToItem(item: SlideItem) {
    const view = viewport.value;
    const node = item.element();
    if (!view || !node) return;
    const a = view.getBoundingClientRect();
    const b = node.getBoundingClientRect();
    const start = vertical.value ? b.top - a.top : b.left - a.left;
    const end = vertical.value ? b.bottom - a.bottom : b.right - a.right;
    const delta = props.centerActive ? (start + end) / 2 : start < 0 ? start : end > 0 ? end : 0;
    view.scrollBy({ [vertical.value ? 'top' : 'left']: delta, behavior: reduced.value ? 'instant' : 'smooth' });
}
function scrollTo(target: 'prev' | 'next' | { index: number } | { by: number | string }) {
    const view = viewport.value;
    if (!view) return;
    if (typeof target === 'object' && 'index' in target) { const item = items.value[target.index]; if (item) scrollToItem(item); return; }
    const size = vertical.value ? view.clientHeight : view.clientWidth;
    const raw = typeof target === 'object' ? target.by : props.scrollDistance;
    const parsed = Number.parseFloat(String(raw));
    const distance = Number.isFinite(parsed) ? parsed * (String(raw).endsWith('%') ? size / 100 : 1) : size;
    const rtl = !vertical.value && getComputedStyle(view).direction === 'rtl';
    const sign = (target === 'prev' ? -1 : 1) * (rtl ? -1 : 1);
    view.scrollBy({ [vertical.value ? 'top' : 'left']: sign * distance, behavior: reduced.value ? 'instant' : 'smooth' });
}
const arrows = computed(() => {
    switch (props.showArrows) {
        case 'always': return true;
        case 'never': return false;
        case 'desktop': return !display.mobile.value;
        case 'mobile': return display.mobile.value || overflow.value;
        case true: return overflow.value;
        default: return !display.mobile.value && overflow.value;
    }
});
function move(step: number) {
    const enabled = items.value.filter(item => !item.disabled());
    if (!enabled.length || props.disabled) return;
    const index = enabled.findIndex(item => isSelected(item.id));
    select(enabled[index < 0 ? step > 0 ? 0 : enabled.length - 1 : (index + step + enabled.length) % enabled.length].id);
}
function keyboard(event: KeyboardEvent) {
    if (props.disabled || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    if (vertical.value ? ['ArrowLeft', 'ArrowRight'].includes(event.key) : ['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    const target = event.target as HTMLElement;
    if (target.matches('input,textarea,select,[contenteditable="true"]')) return;
    const enabled = items.value.filter(item => !item.disabled());
    const index = enabled.findIndex(item => item.element()?.contains(target));
    const rtl = !vertical.value && getComputedStyle(viewport.value!).direction === 'rtl';
    const step = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : index < 0 ? 0 : (index + step * (rtl ? -1 : 1) + enabled.length) % enabled.length;
    const node = enabled[next]?.element();
    const focus = node?.matches('button,a,[tabindex]') ? node : node?.querySelector<HTMLElement>('button:not(:disabled),a[href],[tabindex]');
    if (focus) { event.preventDefault(); focus.focus({ preventScroll: true }); scrollToItem(enabled[next]); }
}
provide(slideGroupKey, {
    disabled: computed(() => !!props.disabled), selectedClass: computed(() => props.selectedClass), isSelected, select,
    register(item) {
        items.value = [...items.value, item];
        void nextTick(() => { forceSelection(); measure(); if (props.scrollToActive && isSelected(item.id)) scrollToItem(item); });
        return () => { items.value = items.value.filter(entry => entry !== item); forceSelection(); void nextTick(measure); };
    }
});
watch(() => [model.value, props.direction, props.centerActive], () => { void nextTick(() => { measure(); if (props.scrollToActive) { const item = items.value.find(item => isSelected(item.id)); if (item) scrollToItem(item); } }); }, { deep: true });
onMounted(() => { observer = new ResizeObserver(measure); if (viewport.value) observer.observe(viewport.value); if (content.value) observer.observe(content.value); measure(); });
onBeforeUnmount(() => observer?.disconnect());
defineExpose({ viewport, isOverflowing: overflow, isSelected, select, next: () => move(1), prev: () => move(-1), scrollTo });
</script>

<template>
    <div class="u-slide-group" role="group" :class="{ 'is-vertical': vertical, 'is-disabled': props.disabled }" :aria-disabled="props.disabled || undefined">
        <UiButton v-if="arrows" class="u-slide-group-prev" variant="text" icon :disabled="props.disabled || atStart" aria-label="向前滚动" @click="scrollTo('prev')"><slot name="prev" :prev="() => move(-1)" :next="() => move(1)" :select="select" :is-selected="isSelected"><Icon :name="vertical ? 'mdi-chevron-down' : 'mdi-chevron-left'" :class="{ 'is-up': vertical }" :size="18" /></slot></UiButton>
        <div ref="viewport" class="u-slide-group-viewport" :style="{ scrollSnapType: props.scrollSnap ? `${vertical ? 'y' : 'x'} proximity` : undefined, '--u-slide-snap': props.scrollSnap }" @scroll="measure" @keydown="keyboard">
            <div ref="content" class="u-slide-group-content" :class="props.contentClass"><slot :prev="() => move(-1)" :next="() => move(1)" :select="select" :is-selected="isSelected" /></div>
        </div>
        <UiButton v-if="arrows" class="u-slide-group-next" variant="text" icon :disabled="props.disabled || atEnd" aria-label="向后滚动" @click="scrollTo('next')"><slot name="next" :prev="() => move(-1)" :next="() => move(1)" :select="select" :is-selected="isSelected"><Icon :name="vertical ? 'mdi-chevron-down' : 'mdi-chevron-right'" :size="18" /></slot></UiButton>
    </div>
</template>
