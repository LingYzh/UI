<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';
import { useLayoutItem } from './layout-completion';
import { useDefaults } from './defaults';
import UToolbar from './UToolbar.vue';
const rawProps = withDefaults(defineProps<{
    height?: number | string; fixed?: boolean; absolute?: boolean; order?: number | string; name?: string; color?: string;
    location?: 'top' | 'bottom'; title?: string; image?: string; density?: 'default' | 'prominent' | 'comfortable' | 'compact';
    extensionHeight?: number | string; extended?: boolean | null; collapse?: boolean; collapsePosition?: 'start' | 'end';
    flat?: boolean; floating?: boolean; elevation?: number | string; border?: boolean; rounded?: boolean | string | number;
    tag?: string; theme?: string; scrollBehavior?: string; scrollTarget?: string | HTMLElement; scrollThreshold?: number | string;
}>(), { height: 56, fixed: true, absolute: false, order: 10, location: 'top', density: 'default', extensionHeight: 48, extended: null, tag: 'header', scrollThreshold: 300 });
const props = useDefaults(rawProps, 'UAppBar');
const active = defineModel<boolean>({ default: true });
const slots = useSlots();
const element = ref<HTMLElement>();
const toolbar = ref<InstanceType<typeof UToolbar>>();
const measured = ref(Number(props.height));
const scroll = ref(0);
const scrollingUp = ref(false);
let scrollElement: HTMLElement | Window | undefined;
let observer: ResizeObserver | undefined;
const behaviors = computed(() => new Set((props.scrollBehavior ?? '').split(/\s+/)));
const threshold = computed(() => Math.max(0, Number(props.scrollThreshold) || 0));
const ratio = computed(() => threshold.value ? Math.max(0, Math.min(1, 1 - scroll.value / threshold.value)) : 0);
const collapsed = computed(() => props.collapse || behaviors.value.has('collapse') && (behaviors.value.has('inverted') ? ratio.value > 0 : ratio.value === 0));
const elevated = computed(() => !props.flat && (behaviors.value.has('elevate') ? (behaviors.value.has('inverted') ? scroll.value === 0 : scroll.value > 0) : !!props.elevation));
const imageOpacity = computed(() => behaviors.value.has('fade-image') ? behaviors.value.has('inverted') ? 1 - ratio.value : ratio.value : undefined);
const contentHeight = computed(() => Math.max(0, Number(props.height) * (props.density === 'prominent' ? 2 : 1) - (props.density === 'comfortable' ? 8 : props.density === 'compact' ? 16 : 0)));
const extensionHeight = computed(() => (props.extended ?? !!slots.extension) ? Math.max(0, Number(props.extensionHeight)) : 0);
const layoutHeight = computed(() => !active.value ? 0 : behaviors.value.has('hide') && !behaviors.value.has('fully-hide') && scroll.value >= threshold.value ? contentHeight.value : measured.value);
const { offset } = useLayoutItem(computed(() => props.location), layoutHeight, computed(() => props.fixed && !props.absolute), computed(() => Number(props.order) || 0), computed(() => props.name));
function onScroll() {
    if (!scrollElement) return;
    const current = scrollElement instanceof Window ? scrollElement.scrollY : scrollElement.scrollTop;
    const previous = scroll.value;
    if (current !== previous) scrollingUp.value = current < previous;
    scroll.value = Math.max(0, current);
    if (!(behaviors.value.has('hide') || behaviors.value.has('fully-hide'))) { if (props.scrollBehavior) active.value = true; return; }
    const height = scrollElement instanceof Window ? window.innerHeight : scrollElement.clientHeight;
    const maximum = (scrollElement instanceof Window ? document.documentElement.scrollHeight : scrollElement.scrollHeight) - height;
    if (behaviors.value.has('inverted')) active.value = scroll.value > threshold.value;
    else if (maximum <= measured.value) active.value = true;
    else active.value = scroll.value < threshold.value || scrollingUp.value && scroll.value < maximum - 1;
}
function bindScroll() {
    scrollElement?.removeEventListener('scroll', onScroll);
    const target = typeof props.scrollTarget === 'string' ? document.querySelector<HTMLElement>(props.scrollTarget) : props.scrollTarget;
    scrollElement = target ?? window;
    scrollElement.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
watch(() => [props.scrollTarget, props.scrollBehavior, props.scrollThreshold], () => { if (typeof window !== 'undefined') bindScroll(); });
onMounted(() => {
    observer = new ResizeObserver(() => { measured.value = element.value?.offsetHeight ?? contentHeight.value + extensionHeight.value; });
    if (element.value) observer.observe(element.value);
    void nextTick(() => { measured.value = element.value?.offsetHeight ?? contentHeight.value + extensionHeight.value; bindScroll(); });
});
onBeforeUnmount(() => { observer?.disconnect(); scrollElement?.removeEventListener('scroll', onScroll); });
defineExpose({ element, toolbar, contentHeight, extensionHeight, isActive: active, currentScroll: scroll, scrollRatio: ratio, isScrollingUp: scrollingUp });
</script>

<template>
    <component :is="props.tag" ref="element" class="ui-app-bar" :class="{ 'is-fixed': props.fixed && !props.absolute, 'is-absolute': props.absolute, 'is-hidden': !active, 'is-collapsed': collapsed, 'is-floating': props.floating }" :data-location="props.location" :aria-hidden="!active || undefined" :inert="!active" :style="{ [props.location]: offset + 'px', transform: active ? undefined : `translateY(${props.location === 'top' ? '-100%' : '100%'})`, '--ui-app-bar-image-opacity': imageOpacity }">
        <UToolbar ref="toolbar" v-bind="props" :tag="'div'" :absolute="false" :location="undefined" :collapse="collapsed" :elevation="elevated ? props.elevation || 4 : 0" :flat="!elevated">
            <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
        </UToolbar>
    </component>
</template>
