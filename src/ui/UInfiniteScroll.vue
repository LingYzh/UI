<script setup lang="ts">
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
import { onBeforeUnmount, ref, watch } from 'vue';
const rawProps = withDefaults(defineProps<{ disabled?: boolean; rootMargin?: string; direction?: 'end' | 'start' }>(), { rootMargin: '200px', direction: 'end' });
const props = useDefaults(rawProps, 'UInfiniteScroll');
const emit = defineEmits<{ load: [context: { done: (status?: 'ok' | 'empty' | 'error') => void }] }>();
const sentinel = ref<HTMLElement>();
const busy = ref(false);
const done = ref(false);
const error = ref(false);
let observer: IntersectionObserver | undefined;
let active = true;
function setSentinel(value: HTMLElement | null): void { sentinel.value = value ?? undefined; }
function load(): void {
    if (props.disabled || busy.value || done.value) return;
    busy.value = true;
    error.value = false;
    let settled = false;
    emit('load', { done(status = 'ok') {
        if (settled || !active) return;
        settled = true;
        busy.value = false;
        done.value = status === 'empty';
        error.value = status === 'error';
    } });
}
function retry(): void { if (busy.value) return; error.value = false; load(); }
function reset(): void { busy.value = false; done.value = false; error.value = false; }
watch([sentinel, () => props.disabled, () => props.rootMargin], () => {
    observer?.disconnect();
    if (props.disabled || !sentinel.value) return;
    if (typeof IntersectionObserver === 'undefined') return;
    observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) load(); }, { rootMargin: props.rootMargin });
    observer.observe(sentinel.value);
}, { immediate: true, flush: 'post' });
onBeforeUnmount(() => { active = false; observer?.disconnect(); });
defineExpose({ load, retry, reset });
</script>
<template>
    <div class="u-infinite-scroll" :aria-busy="busy"><div v-if="props.direction === 'start'" ref="sentinel" class="u-infinite-sentinel" /><slot :busy="busy" :done="done" :error="error" :load="load" :retry="retry" :reset="reset" /><div v-if="props.direction === 'end'" ref="sentinel" class="u-infinite-sentinel" /><div class="u-infinite-status" role="status"><slot v-if="busy" name="loading">正在加载…</slot><slot v-else-if="done" name="empty">没有更多内容</slot><slot v-else-if="error" name="error" :retry="retry"><UiButton variant="ghost" @click="retry">加载失败，重试</UiButton></slot><slot v-else name="load-more" :load="load"><UiButton variant="ghost" :disabled="props.disabled" @click="load">加载更多</UiButton></slot></div></div>
</template>
