<script setup lang="ts">
import { Tabs } from '@vuetify/v0';
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, onUpdated, provide, ref, shallowReactive, useId, useSlots, watch } from 'vue';
import UiTab from './UiTab.vue';
import UiTabsWindow from './UiTabsWindow.vue';
import UiTabsWindowItem from './UiTabsWindowItem.vue';
import UiIcon from '../components/Icon.vue';
import { createItemGroupState } from './item-group-state';
import { defaultValueComparator, type ValueComparator } from './selection';
import { normalizeTabItems, tabsKey, tabToken, type TabItem, type TabRegistration } from './tabs';
import { vPointerBlur } from './pointer-focus';
import { uiText } from './locale';
import { vRipple, type RippleOptions } from './ripple';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
    items?: readonly TabItem[];
    idPrefix?: string;
    direction?: 'horizontal' | 'vertical';
    orientation?: 'horizontal' | 'vertical';
    activation?: 'manual' | 'automatic';
    mandatory?: boolean | 'force';
    multiple?: boolean;
    max?: number;
    readonly?: boolean;
    valueComparator?: ValueComparator;
    selectedClass?: string;
    disabled?: boolean;
    alignTabs?: 'start' | 'center' | 'end' | 'title';
    grow?: boolean;
    fixedTabs?: boolean;
    stacked?: boolean;
    hideSlider?: boolean;
    centerActive?: boolean;
    showArrows?: boolean | 'always' | 'desktop' | 'mobile' | 'never';
    indicatorSide?: 'start' | 'end';
    variant?: 'soft' | 'underline';
    ripple?: RippleOptions;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
}>(), { items: () => [], activation: 'manual', mandatory: 'force', alignTabs: 'start', indicatorSide: 'end', variant: 'underline', ripple: true, rounded: true });
const model = defineModel<unknown>();
const slots = useSlots();
const instance = getCurrentInstance();
const usesItems = () => instance?.vnode.props?.items !== undefined;
const uid = `ui-tabs-${useId()}`;
const prefix = computed(() => props.idPrefix ?? uid);
const axis = computed(() => props.direction ?? props.orientation ?? 'horizontal');
const legacy = computed(() => props.items.some(item => item !== null && typeof item === 'object' && !Array.isArray(item) && item.id !== undefined));
const items = computed(() => normalizeTabItems(props.items));
const nullItemKey = Symbol('ui-tabs-null-value');
function itemKey(item: ReturnType<typeof normalizeTabItems>[number], index: number): string | number | symbol {
    const candidate = item.id !== undefined ? item.id : item.value;
    if (candidate === undefined) return index;
    if (candidate === null) return nullItemKey;
    return typeof candidate === 'string' || typeof candidate === 'number' ? candidate : tabToken(candidate);
}
const entries = shallowReactive<TabRegistration[]>([]);
const multiple = computed(() => !!props.multiple);
const readonly = computed(() => !!props.readonly);
const disabled = computed(() => !!props.disabled);
const selectedClass = computed(() => props.selectedClass);
const selection = createItemGroupState(model, () => ({
    multiple: props.multiple,
    max: props.max,
    mandatory: props.mandatory,
    disabled: props.disabled,
    readonly: props.readonly,
    valueComparator: props.valueComparator
}));
function compare(left: unknown, right: unknown): boolean {
    return (props.valueComparator ?? defaultValueComparator)(left, right);
}
function token(value: unknown): string {
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
        const entry = entries.find(candidate => compare(candidate.value.value, value));
        if (entry) return `r-${encodeURIComponent(entry.id)}`;
    }
    return legacy.value && (typeof value === 'string' || typeof value === 'number') ? String(value) : tabToken(value);
}
const headlessModel = computed<string | undefined>({
    get: () => selection.selectedIds.value[0],
    set: id => { if (id !== undefined) selection.select(id, true); }
});
provide(tabsKey, {
    prefix,
    focusedId: ref<string>(),
    model,
    selection,
    multiple,
    readonly,
    ripple: computed(() => props.ripple),
    disabled,
    selectedClass,
    compare,
    token,
    mandatory: computed(() => props.mandatory),
    activation: computed(() => props.activation),
    entries
});
const list = ref<HTMLElement>();
const slider = ref<Record<string, string>>({ opacity: '0' });
const ready = ref(false);
const overflow = ref(false);
const atStart = ref(true);
const atEnd = ref(true);
const mobile = ref(false);
const arrows = computed(() => props.showArrows === 'never' || props.showArrows === false ? false
    : props.showArrows === 'always' ? true : props.showArrows === 'desktop' ? !mobile.value
        : props.showArrows === 'mobile' ? mobile.value || overflow.value : overflow.value && (props.showArrows === true || !mobile.value));
let observer: ResizeObserver | undefined;
let frame = 0;
function measure() {
    const host = list.value;
    if (!host) return;
    const vertical = axis.value === 'vertical';
    const position = vertical ? host.scrollTop : Math.abs(host.scrollLeft);
    const size = vertical ? host.clientHeight : host.clientWidth;
    const total = vertical ? host.scrollHeight : host.scrollWidth;
    overflow.value = total > size + 1;
    atStart.value = position <= 1;
    atEnd.value = position >= total - size - 1;
    mobile.value = window.innerWidth < 600;
    const active = host.querySelector<HTMLElement>('.ui-tab[aria-selected="true"]');
    const measured: Record<string, string> = !active || !host.clientWidth ? { opacity: '0' } : vertical
        ? { opacity: '1', height: `${active.offsetHeight}px`, transform: `translateY(${active.offsetTop}px)` }
        : { opacity: '1', width: `${active.offsetWidth}px`, transform: `translateX(${active.offsetLeft}px)` };
    if (JSON.stringify(slider.value) !== JSON.stringify(measured)) slider.value = measured;
}
function reveal(target: HTMLElement | null, center = false) {
    const host = list.value;
    if (!host || !target) return;
    const bounds = host.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const vertical = axis.value === 'vertical';
    const start = vertical ? box.top - bounds.top : box.left - bounds.left;
    const end = vertical ? box.bottom - bounds.bottom : box.right - bounds.right;
    const delta = center ? (start + end) / 2 : start < 0 ? start : end > 0 ? end : 0;
    host.scrollBy(vertical ? { top: delta } : { left: delta });
}
async function sync() {
    await nextTick();
    observer?.disconnect();
    if (list.value) {
        observer?.observe(list.value);
        list.value.querySelectorAll('.ui-tab').forEach(button => observer?.observe(button));
    }
    measure();
    reveal(list.value?.querySelector('button[aria-selected="true"]') ?? null, props.centerActive);
}
function focused(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (target.matches('.ui-tab:focus-visible')) reveal(target);
}
function scroll(direction: number) {
    const host = list.value;
    if (!host) return;
    const vertical = axis.value === 'vertical';
    const rtl = getComputedStyle(host).direction === 'rtl';
    host.scrollBy(vertical ? { top: direction * host.clientHeight * .8 } : { left: direction * host.clientWidth * .8 * (rtl ? -1 : 1) });
}
watch([model, selection.selectedIds, axis, items, () => props.centerActive, () => props.grow, () => props.fixedTabs, () => props.stacked], sync, { deep: true });
watch(() => [
    model.value,
    props.multiple,
    props.max,
    props.mandatory,
    props.disabled,
    props.readonly,
    props.valueComparator,
    ...entries.map(entry => [entry.id, entry.value.value, entry.disabled.value])
], () => {
    void nextTick(() => selection.ensureMandatory());
}, { deep: true, flush: 'post', immediate: true });
onUpdated(() => {
    const order = Array.from(list.value?.querySelectorAll<HTMLElement>('[data-ui-tab]') ?? []).map(button => button.dataset.uiTab);
    const sorted = [...entries].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    if (sorted.some((entry, index) => entries[index] !== entry)) {
        entries.splice(0, entries.length, ...sorted);
        selection.reorder(order.filter((id): id is string => !!id));
    }
    measure();
});
onMounted(async () => {
    observer = new ResizeObserver(measure);
    window.addEventListener('resize', measure);
    await sync();
    frame = requestAnimationFrame(() => { ready.value = true; });
});
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', measure); cancelAnimationFrame(frame); });
function next(): void { selection.next(); }
function prev(): void { selection.prev(); }
defineExpose({
    selectedIds: selection.selectedIds,
    selectedValues: selection.selectedValues,
    isSelected: selection.isSelected,
    select: selection.select,
    toggle: selection.toggle,
    next,
    prev
});
</script>

<template>
    <Tabs.Root v-model="headlessModel" :orientation="axis" :activation="activation" :mandatory="false" :disabled="disabled" circular>
        <div class="ui-tabs-shell" :data-direction="axis">
            <button v-ripple="props.ripple" v-if="arrows" v-pointer-blur type="button" class="ui-tabs-arrow" tabindex="-1" :disabled="disabled || atStart" :aria-label="uiText('tabs.previous')" @click="scroll(-1)"><UiIcon name="mdi-chevron-left" :size="16" /></button>
            <Tabs.List v-slot="{ attrs }" :label="$attrs['aria-label'] as string" renderless>
                <div ref="list" v-bind="{ ...attrs, ...$attrs, 'aria-multiselectable': multiple || undefined, 'aria-readonly': readonly || undefined }" class="ui-tabs" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded, 'is-grow': grow, 'is-fixed': fixedTabs, 'is-stacked': stacked }"
                    :data-variant="variant" :data-ready="ready" :data-indicator-side="indicatorSide" :data-hide-slider="hideSlider || undefined" :data-align="alignTabs" :data-overflow="overflow" :data-ui-tabs-prefix="prefix" :data-ui-tabs-legacy="legacy" @scroll="measure" @focusin="focused">
                    <template v-if="usesItems()">
                        <template v-for="(item, index) in items" :key="itemKey(item, index)">
                            <slot name="tab" :item="item"><UiTab :value="item.value" :disabled="item.disabled" :icon="slots.default ? undefined : item.icon"><slot :item="item">{{ item.text }}</slot></UiTab></slot>
                        </template>
                    </template>
                    <slot v-else />
                    <span v-if="variant === 'underline' && !hideSlider && !multiple" class="ui-tabs-slider" :style="slider" aria-hidden="true"></span>
                </div>
            </Tabs.List>
            <button v-ripple="props.ripple" v-if="arrows" v-pointer-blur type="button" class="ui-tabs-arrow" tabindex="-1" :disabled="disabled || atEnd" :aria-label="uiText('tabs.next')" @click="scroll(1)"><UiIcon name="mdi-chevron-right" :size="16" /></button>
        </div>
        <UiTabsWindow v-if="slots.item || slots.window">
            <UiTabsWindowItem v-for="(item, index) in slots.item ? items : []" :key="itemKey(item, index)" :value="item.value"><slot name="item" :item="item" /></UiTabsWindowItem>
            <slot name="window" />
        </UiTabsWindow>
    </Tabs.Root>
</template>
