<script setup lang="ts">
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import { ref, watch, onBeforeUnmount } from 'vue';
const rawProps = withDefaults(defineProps<{ rootMargin?: string; once?: boolean; disabled?: boolean }>(), { rootMargin: '100px', once: true });
const props = useDefaults(rawProps, 'ULazy');
const element = ref<HTMLElement>();
const visible = ref(false);
const emit = defineEmits<{ intersect: [entry: IntersectionObserverEntry] }>();
let observer: IntersectionObserver | undefined;
function setElement(value: HTMLElement | null): void { element.value = value ?? undefined; }
watch([element, () => props.disabled, () => props.rootMargin], () => {
    observer?.disconnect();
    observer = undefined;
    if (props.disabled) { visible.value = true; return; }
    if (typeof IntersectionObserver === 'undefined') { visible.value = true; return; }
    if (!element.value) return;
    observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible.value = entry.isIntersecting || (props.once && visible.value);
        if (entry.isIntersecting) emit('intersect', entry);
        if (entry.isIntersecting && props.once) observer?.disconnect();
    }, { rootMargin: props.rootMargin });
    observer.observe(element.value);
}, { immediate: true, flush: 'post' });
onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
    <div ref="element" class="u-lazy"><UTransition variant="fade" mode="out-in"><div v-if="visible" key="content"><slot :visible="visible" /></div><div v-else key="placeholder"><slot name="placeholder" /></div></UTransition></div>
</template>
