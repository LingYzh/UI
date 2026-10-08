<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onMounted, onUpdated, ref, useAttrs, useId, useSlots, watch, type StyleValue } from 'vue';
import { useDefaults } from './defaults';
import UImg from './UImg.vue';
import UWindowItem from './UWindowItem.vue';
import type { ImageSource } from './UImg.vue';
import type { GroupValue } from './group-state';
import type { UiTransition } from './UiMaybeTransition.vue';
import { windowContextKey } from './window-state';

defineOptions({ inheritAttrs: false });

const rawProps = withDefaults(defineProps<{
    value?: GroupValue;
    eager?: boolean;
    disabled?: boolean;
    class?: unknown;
    style?: StyleValue;
    src?: string | ImageSource;
    alt?: string;
    lazy?: boolean;
    standardProtocol?: boolean;
    absolute?: boolean;
    cover?: boolean;
    color?: string;
    draggable?: boolean | 'true' | 'false';
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
}>(), { cover: undefined, eager: undefined });
const props = useDefaults(rawProps, 'UCarouselItem');
const attrs = useAttrs();
const slots = useSlots();
const context = inject(windowContextKey, undefined);
const instance = getCurrentInstance();
const ticketId = useId();
let automaticValue: GroupValue = ticketId;
if (context) {
    let index = 0;
    while (context.values.includes(index)) index++;
    automaticValue = index;
}
const value = computed(() => props.value ?? automaticValue);
const disabled = computed(() => Boolean(props.disabled || context?.disabled));
const isSelected = computed(() => context?.isSelected(value.value) ?? false);
const selected = isSelected;
const element = ref<HTMLElement>();
const image = ref<{ element?: HTMLImageElement }>();
const hasImage = computed(() => Boolean(props.src || props.srcset || props.lazySrc || slots.sources));
const imageProps = computed(() => ({
    src: props.src,
    alt: props.alt,
    lazy: props.lazy,
    disabled: props.disabled,
    standardProtocol: props.standardProtocol,
    absolute: props.absolute,
    cover: props.cover,
    color: props.color,
    draggable: props.draggable,
    eager: props.eager,
    gradient: props.gradient,
    imageClass: props.imageClass,
    lazySrc: props.lazySrc,
    options: props.options,
    sizes: props.sizes,
    crossorigin: props.crossorigin,
    referrerpolicy: props.referrerpolicy,
    srcset: props.srcset,
    position: props.position,
    aspectRatio: props.aspectRatio,
    contentClass: props.contentClass,
    width: props.width,
    height: props.height,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    inline: props.inline,
    tag: props.tag,
    rounded: props.rounded,
    tile: props.tile,
    transition: props.transition,
}));
function select(): void {
    if (!disabled.value) context?.select(value.value);
}
function syncElement(): void {
    const root = instance?.vnode.el;
    element.value = root instanceof HTMLElement ? root : undefined;
}
watch(isSelected, () => { void nextTick(syncElement); }, { flush: 'post' });
onMounted(syncElement);
onUpdated(syncElement);

defineExpose({ element, image, selected, isSelected, select, disabled, value });
</script>

<template>
    <UWindowItem v-bind="hasImage ? undefined : attrs" :value="value" :eager="props.eager" :disabled="props.disabled" :class="['u-carousel-item', props.class]" :style="props.style">
        <UImg v-if="hasImage" ref="image" v-bind="{ ...attrs, ...imageProps }">
            <template v-if="$slots.sources" #sources><slot name="sources" /></template>
            <template v-if="$slots.placeholder" #placeholder="slotProps"><slot name="placeholder" v-bind="slotProps" /></template>
            <template v-if="$slots.error" #error="slotProps"><slot name="error" v-bind="slotProps" /></template>
            <template #default="imageState"><slot v-bind="imageState" :selected="selected" :is-selected="isSelected" :select="select" :disabled="disabled" :value="value" :element="element" /></template>
        </UImg>
        <slot v-else :selected="selected" :is-selected="isSelected" :select="select" :disabled="disabled" :value="value" :element="element" />
    </UWindowItem>
</template>
