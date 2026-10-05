<script setup lang="ts">
import { Tabs } from '@vuetify/v0';
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, onUpdated, provide, ref, shallowReactive, useId, useSlots, watch } from 'vue';
import UiTab from './UiTab.vue';
import UiTabsWindow from './UiTabsWindow.vue';
import UiTabsWindowItem from './UiTabsWindowItem.vue';
import UiIcon from '../components/Icon.vue';
import { normalizeTabItems, tabsKey, tabToken, type TabItem, type TabRegistration, type TabValue } from './tabs';
import { vPointerBlur } from './pointer-focus';
import { uiText } from './locale';
import type { RippleOptions } from './ripple';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
    items?: readonly TabItem[];
    idPrefix?: string;
    direction?: 'horizontal' | 'vertical';
    orientation?: 'horizontal' | 'vertical';
    activation?: 'manual' | 'automatic';
    mandatory?: boolean | 'force';
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
const model = defineModel<TabValue | null | undefined>();
const slots = useSlots();
const instance = getCurrentInstance();
const usesItems = () => instance?.vnode.props?.items !== undefined;
const uid = `ui-tabs-${useId()}`;
const prefix = computed(() => props.idPrefix ?? uid);
const axis = computed(() => props.direction ?? props.orientation ?? 'horizontal');
const legacy = computed(() => props.items.some(item => typeof item === 'object' && item.id !== undefined));
const items = computed(() => normalizeTabItems(props.items));
const entries = shallowReactive<TabRegistration[]>([]);
provide(tabsKey, { prefix, model, entries, ripple: computed(() => props.ripple), disabled: computed(() => !!props.disabled), token: value => legacy.value ? String(value) : tabToken(value), mandatory: computed(() => props.mandatory), activation: computed(() => props.activation) });
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
    const active = host.querySelector<HTMLButtonElement>('button[aria-selected="true"]');
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
watch([model, axis, items, () => props.centerActive, () => props.grow, () => props.fixedTabs, () => props.stacked], sync, { deep: true });
watch(() => [model.value, props.mandatory, props.disabled, ...entries.map(entry => [entry.id, entry.value.value, entry.disabled.value])], async () => {
    await nextTick();
    if (props.disabled) return;
    const enabled = entries.filter(entry => !entry.disabled.value);
    if (enabled.some(entry => entry.value.value === model.value)) return;
    if (props.mandatory === 'force' || (props.mandatory && model.value != null)) model.value = enabled[0]?.value.value;
    else if (model.value != null) model.value = undefined;
    await sync();
}, { flush: 'post' });
onUpdated(() => {
    const order = Array.from(list.value?.querySelectorAll<HTMLElement>('[data-ui-tab]') ?? []).map(button => button.dataset.uiTab);
    const sorted = [...entries].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    if (sorted.some((entry, index) => entries[index] !== entry)) entries.splice(0, entries.length, ...sorted);
    measure();
});
onMounted(async () => {
    observer = new ResizeObserver(measure);
    window.addEventListener('resize', measure);
    await sync();
    frame = requestAnimationFrame(() => { ready.value = true; });
});
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', measure); cancelAnimationFrame(frame); });
</script>

<template>
    <Tabs.Root v-model="model" :orientation="axis" :activation="activation" :mandatory="mandatory" :disabled="disabled" circular>
        <div class="ui-tabs-shell" :data-direction="axis">
            <button v-if="arrows" v-pointer-blur type="button" class="ui-tabs-arrow" tabindex="-1" :disabled="disabled || atStart" :aria-label="uiText('tabs.previous')" @click="scroll(-1)"><UiIcon name="mdi-chevron-left" :size="16" /></button>
            <Tabs.List v-slot="{ attrs }" :label="$attrs['aria-label'] as string" renderless>
                <div ref="list" v-bind="{ ...attrs, ...$attrs }" class="ui-tabs" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded, 'is-grow': grow, 'is-fixed': fixedTabs, 'is-stacked': stacked }"
                    :data-variant="variant" :data-ready="ready" :data-indicator-side="indicatorSide" :data-align="alignTabs" :data-overflow="overflow" :data-ui-tabs-prefix="prefix" :data-ui-tabs-legacy="legacy" @scroll="measure" @focusin="focused">
                    <template v-if="usesItems()">
                        <template v-for="item in items" :key="item.value">
                            <slot name="tab" :item="item"><UiTab :value="item.value" :disabled="item.disabled" :icon="slots.default ? undefined : item.icon"><slot :item="item">{{ item.text }}</slot></UiTab></slot>
                        </template>
                    </template>
                    <slot v-else />
                    <span v-if="variant === 'underline' && !hideSlider" class="ui-tabs-slider" :style="slider" aria-hidden="true"></span>
                </div>
            </Tabs.List>
            <button v-if="arrows" v-pointer-blur type="button" class="ui-tabs-arrow" tabindex="-1" :disabled="disabled || atEnd" :aria-label="uiText('tabs.next')" @click="scroll(1)"><UiIcon name="mdi-chevron-right" :size="16" /></button>
        </div>
        <UiTabsWindow v-if="slots.item || slots.window">
            <UiTabsWindowItem v-for="item in slots.item ? items : []" :key="item.value" :value="item.value"><slot name="item" :item="item" /></UiTabsWindowItem>
            <slot name="window" />
        </UiTabsWindow>
    </Tabs.Root>
</template>
