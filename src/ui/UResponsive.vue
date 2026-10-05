<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed } from 'vue';
const rawProps = defineProps<{ aspectRatio?: number | string; width?: number | string; height?: number | string }>();
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
</script>
<template>
    <div class="u-responsive" :style="{ aspectRatio: ratio, width: typeof props.width === 'number' ? props.width + 'px' : props.width, height: typeof props.height === 'number' ? props.height + 'px' : props.height }"><slot :ratio="ratio" /></div>
</template>
