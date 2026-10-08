<script setup lang="ts">
import { computed, nextTick, normalizeClass, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import { useDefaults } from './defaults';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';
import { roundedStyles } from './appearance';

export interface ImageSource { src: string; srcset?: string; lazySrc?: string; aspect?: number; }
const rawProps = withDefaults(defineProps<{
    src?: string | ImageSource;
    alt?: string;
    lazy?: boolean;
    disabled?: boolean;
    standardProtocol?: boolean;
    absolute?: boolean;
    cover?: boolean;
    color?: string;
    draggable?: boolean | 'true' | 'false';
    eager?: boolean;
    gradient?: string;
    imageClass?: unknown;
    lazySrc?: string;
    options?: IntersectionObserverInit;
    sizes?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    referrerpolicy?: ReferrerPolicy;
    srcset?: string;
    position?: string;
    aspectRatio?: number | string;
    contentClass?: unknown;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    inline?: boolean;
    tag?: string;
    rounded?: boolean | number | string;
    tile?: boolean;
    transition?: UiTransition;
}>(), { src: '', cover: true, tag: 'div', transition: 'u-fade' });
const props = useDefaults(rawProps, 'UImg');
// The existing native Event contract remains the default; the URL contract is opt-in.
const emit = defineEmits<{ loadstart: [url: string]; load: [event: Event | string]; error: [event: Event | string] }>();
const root = ref<HTMLElement>();
const element = ref<HTMLImageElement>();
const visible = ref(!props.lazy || props.eager);
// IntersectionObserver controls when src is assigned. Once intersecting, use
// eager native loading: a hidden loading image would otherwise never load.
const loading = ref(false);
const error = ref(false);
const state = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle');
const currentSrc = ref('');
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const source = computed(() => {
    const value = typeof props.src === 'string' ? { src: props.src } : props.src;
    return {
        src: value?.src ?? '', srcset: props.srcset || value?.srcset,
        lazySrc: props.lazySrc || value?.lazySrc,
        aspect: props.aspectRatio || value?.aspect
    };
});
const ratio = computed(() => {
    const parts = String(source.value.aspect ?? '').split('/').map(Number);
    const explicit = parts.length === 2 ? parts[0] / parts[1] : parts[0];
    return explicit > 0 && Number.isFinite(explicit) ? explicit : naturalWidth.value / naturalHeight.value || undefined;
});
const imageStyles = computed<CSSProperties>(() => ({ objectFit: props.cover ? 'cover' : 'contain', objectPosition: props.position }));
const imageClass = computed(() => normalizeClass(props.imageClass));
const contentClass = computed(() => normalizeClass(props.contentClass));
function unit(value?: number | string): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
function color(value?: string): string | undefined {
    return value && /^[a-z][\w-]*$/i.test(value) ? `var(--ui-theme-${value}, ${value})` : value;
}
const styles = computed<CSSProperties>(() => ({
    width: unit(props.width), height: unit(props.height), minWidth: unit(props.minWidth), minHeight: unit(props.minHeight),
    maxWidth: unit(props.maxWidth), maxHeight: unit(props.maxHeight), aspectRatio: ratio.value,
    backgroundColor: color(props.color), ...roundedStyles(props.tile ? 0 : props.rounded)
}));
let observer: IntersectionObserver | undefined;
let revision = 0;
let disposed = false;
watch([root, () => props.lazy, () => props.eager, () => props.disabled, () => props.options], () => {
    observer?.disconnect();
    observer = undefined;
    if (props.disabled) return;
    if (!props.lazy || props.eager || typeof IntersectionObserver === 'undefined') { visible.value = true; return; }
    if (visible.value || !root.value) return;
    observer = new IntersectionObserver((entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        visible.value = true;
        observer?.disconnect();
        observer = undefined;
    }, { rootMargin: '200px', ...props.options });
    observer.observe(root.value);
}, { immediate: true, flush: 'post', deep: true });
// Compare the actual request fields. Inline src objects are recreated when a
// load handler updates its parent; object identity must not restart a cached image.
watch([() => source.value.src, () => source.value.srcset, () => props.sizes, visible, () => props.disabled], () => {
    const version = ++revision;
    error.value = false;
    naturalWidth.value = 0;
    naturalHeight.value = 0;
    currentSrc.value = '';
    loading.value = Boolean(source.value.src && visible.value && !props.disabled);
    state.value = loading.value ? 'loading' : 'idle';
    if (!loading.value) return;
    // srcset selection and cached-image state become available after the DOM update.
    void nextTick(() => {
        if (disposed || version !== revision) return;
        currentSrc.value = element.value?.currentSrc || source.value.src;
        emit('loadstart', currentSrc.value);
        if (element.value?.complete && element.value.currentSrc) {
            if (element.value.naturalWidth) onLoad(new Event('load'));
            else onError(new Event('error'));
        }
    });
}, { immediate: true });
function setElement(value: HTMLImageElement | null): void { element.value = value ?? undefined; }
function onLoad(event: Event): void {
    if (props.disabled || state.value !== 'loading' || (event.target && event.target !== element.value)) return;
    loading.value = false;
    error.value = false;
    state.value = 'loaded';
    naturalWidth.value = element.value?.naturalWidth ?? 0;
    naturalHeight.value = element.value?.naturalHeight ?? 0;
    currentSrc.value = element.value?.currentSrc || source.value.src;
    emit('load', props.standardProtocol ? currentSrc.value : event);
}
function onError(event: Event): void {
    if (props.disabled || state.value !== 'loading' || (event.target && event.target !== element.value)) return;
    loading.value = false;
    error.value = true;
    state.value = 'error';
    currentSrc.value = element.value?.currentSrc || source.value.src;
    emit('error', props.standardProtocol ? currentSrc.value : event);
}
onBeforeUnmount(() => { disposed = true; revision++; observer?.disconnect(); });
defineExpose({ element, image: element, root, visible, loading, error, state, currentSrc, naturalWidth, naturalHeight, onLoad, onError, setElement });
</script>

<template>
    <component :is="props.tag" ref="root" class="u-img" :style="styles"
        :class="{ 'is-loading': loading, 'is-error': error, 'is-absolute': props.absolute, 'is-inline': props.inline, 'has-ratio': !!ratio }">
        <img v-if="source.lazySrc && state !== 'loaded'" class="u-img-preview" :src="source.lazySrc" alt="" aria-hidden="true" :style="imageStyles" />
        <UiMaybeTransition :transition="props.transition">
            <picture v-if="$slots.sources" class="u-img-picture"
                v-show="state === 'loaded'">
                <slot name="sources" />
                <img :key="source.src" ref="element" class="u-img-main" :class="imageClass" :style="imageStyles"
                    :src="visible && !props.disabled ? source.src || undefined : undefined" :srcset="visible && !props.disabled ? source.srcset : undefined"
                    :sizes="props.sizes" :alt="props.alt ?? ''" :loading="visible ? 'eager' : 'lazy'"
                    :draggable="props.draggable" :crossorigin="props.crossorigin" :referrerpolicy="props.referrerpolicy"
                    @load="onLoad" @error="onError" />
            </picture>
            <img v-else :key="source.src" ref="element" class="u-img-main" :class="imageClass" :style="imageStyles"
                :src="visible && !props.disabled ? source.src || undefined : undefined" :srcset="visible && !props.disabled ? source.srcset : undefined"
                :sizes="props.sizes" :alt="props.alt ?? ''" :loading="visible ? 'eager' : 'lazy'"
                :draggable="props.draggable" :crossorigin="props.crossorigin" :referrerpolicy="props.referrerpolicy"
                v-show="state === 'loaded'" @load="onLoad" @error="onError" />
        </UiMaybeTransition>
        <div v-if="props.gradient" class="u-img-gradient" :style="{ backgroundImage: `linear-gradient(${props.gradient})` }" />
        <div v-if="loading || (error && !$slots.error)" class="u-img-placeholder"><slot name="placeholder" :loading="loading" :error="error" /></div>
        <div v-if="error" class="u-img-error"><slot name="error" :loading="loading" :error="error">图片加载失败</slot></div>
        <div v-if="$slots.default" class="u-img-content" :class="contentClass"><slot :loading="loading" :error="error" :state="state" /></div>
    </component>
</template>
