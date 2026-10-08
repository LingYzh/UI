<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed, normalizeClass, type CSSProperties } from 'vue';
const rawProps = defineProps<{
    aspectRatio?: number | string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    contentClass?: unknown;
    inline?: boolean;
}>();
const props = useDefaults(rawProps, 'UResponsive');
const ratio = computed(() => {
    if (typeof props.aspectRatio === 'number') return props.aspectRatio > 0 ? props.aspectRatio : undefined;
    if (typeof props.aspectRatio === 'string') {
        const parts = props.aspectRatio.split('/').map(Number);
        const value = parts.length === 2 ? parts[0] / parts[1] : Number(props.aspectRatio);
        return Number.isFinite(value) && value > 0 ? value : undefined;
    }
    const width = Number(props.width); const height = Number(props.height);
    return width > 0 && height > 0 ? width / height : undefined;
});
function unit(value?: number | string): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
const styles = computed<CSSProperties>(() => ({
    aspectRatio: ratio.value,
    width: unit(props.width), height: unit(props.height),
    minWidth: unit(props.minWidth), maxWidth: unit(props.maxWidth),
    minHeight: unit(props.minHeight), maxHeight: unit(props.maxHeight)
}));
const contentClass = computed(() => normalizeClass(props.contentClass));
</script>
<template>
    <div class="u-responsive" :class="{ 'is-inline': props.inline }" :style="styles">
        <slot name="additional" />
        <div class="u-responsive-content" :class="contentClass">
            <slot :ratio="ratio" />
        </div>
    </div>
</template>
