<script setup lang="ts">
import { useDefaults } from './defaults';
import UWindowItem from './UWindowItem.vue';
import type { GroupValue } from './group-state';
const rawProps = defineProps<{ value: GroupValue; eager?: boolean }>();
const props = useDefaults(rawProps, 'UCarouselItem');
</script>
<template>
    <UWindowItem :value="props.value" :eager="props.eager" class="u-carousel-item"><slot /></UWindowItem>
</template>
