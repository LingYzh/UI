<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, type CSSProperties } from 'vue';
import { useDefaults } from './defaults';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';

const rawProps = withDefaults(defineProps<{
    rootMargin?: string;
    once?: boolean;
    disabled?: boolean;
    options?: IntersectionObserverInit;
    tag?: string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    transition?: UiTransition;
}>(), { rootMargin: '100px', once: true, tag: 'div', transition: 'u-fade' });
const props = useDefaults(rawProps, 'ULazy');
const visible = defineModel<boolean>({ default: false });
const emit = defineEmits<{ intersect: [entry: IntersectionObserverEntry] }>();
const element = ref<HTMLElement>();
let observer: IntersectionObserver | undefined;
let revision = 0;

function unit(value?: number | string): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
const styles = computed<CSSProperties>(() => ({
    width: unit(props.width), height: unit(props.height),
    minWidth: unit(props.minWidth), maxWidth: unit(props.maxWidth),
    minHeight: unit(props.minHeight), maxHeight: unit(props.maxHeight)
}));
function observe(): void {
    observer?.disconnect();
    observer = undefined;
    const version = ++revision;
    if (props.disabled || typeof IntersectionObserver === 'undefined') { visible.value = true; return; }
    if (!element.value || props.once && visible.value) return;
    observer = new IntersectionObserver(entries => {
        // A disconnected observer may still have a queued callback after options/model changes.
        if (version !== revision || props.disabled) return;
        const entry = entries.find(value => value.target === element.value);
        if (!entry) return;
        visible.value = entry.isIntersecting || props.once && visible.value;
        if (entry.isIntersecting) emit('intersect', entry);
        if (entry.isIntersecting && props.once) observer?.disconnect();
    }, { rootMargin: props.rootMargin, ...props.options });
    observer.observe(element.value);
}
watch([element, () => props.disabled, () => props.options, () => props.rootMargin, () => props.once], observe, { immediate: true, flush: 'post', deep: true });
// Continuous observers must survive their own model updates: reconnecting them
// delivers another initial intersection and duplicates the public notification.
watch(visible, () => { if (props.once && !props.disabled) observe(); }, { flush: 'post' });
onBeforeUnmount(() => { revision++; observer?.disconnect(); });
defineExpose({ element, visible });
</script>

<template>
    <component :is="props.tag" ref="element" class="u-lazy" :style="styles">
        <UiMaybeTransition :transition="props.transition" appear>
            <div v-if="visible" key="content"><slot :visible="visible" /></div>
            <div v-else key="placeholder"><slot name="placeholder" /></div>
        </UiMaybeTransition>
    </component>
</template>
