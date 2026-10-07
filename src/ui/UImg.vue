<script setup lang="ts">
import { useDefaults } from './defaults';
import { ref, watch, onBeforeUnmount } from 'vue';
const rawProps = defineProps<{ src: string; alt?: string; lazy?: boolean; disabled?: boolean }>();
const props = useDefaults(rawProps, 'UImg');
const emit = defineEmits<{ load: [event: Event]; error: [event: Event] }>();
const element = ref<HTMLImageElement>();
const visible = ref(!props.lazy);
const loading = ref(false);
const error = ref(false);
let observer: IntersectionObserver | undefined;
watch([element, () => props.lazy], () => {
    observer?.disconnect();
    observer = undefined;
    if (!props.lazy) { visible.value = true; return; }
    if (typeof IntersectionObserver === 'undefined') { visible.value = true; return; }
    if (!element.value) return;
    observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { visible.value = true; observer?.disconnect(); observer = undefined; } }, { rootMargin: '200px' });
    observer.observe(element.value);
}, { flush: 'post', immediate: true });
watch(() => props.src, () => { error.value = false; loading.value = !!props.src; }, { immediate: true });
function setElement(value: HTMLImageElement | null): void { element.value = value ?? undefined; }
function onLoad(event: Event): void { loading.value = false; error.value = false; emit('load', event); }
function onError(event: Event): void { loading.value = false; error.value = true; emit('error', event); }
onBeforeUnmount(() => observer?.disconnect());
defineExpose({ element, visible, loading, error, onLoad, onError, setElement });
</script>
<template>
    <div class="u-img" :class="{ 'is-loading': loading, 'is-error': error }"><img ref="element" :src="visible && !props.disabled ? props.src : undefined" :alt="props.alt ?? ''" :loading="props.lazy ? 'lazy' : 'eager'" @load="onLoad" @error="onError" /><div v-if="loading" class="u-img-placeholder"><slot name="placeholder" /></div><div v-if="error" class="u-img-error"><slot name="error">图片加载失败</slot></div><slot :loading="loading" :error="error" /></div>
</template>
