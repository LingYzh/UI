<script setup lang="ts">
import { computed } from 'vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ value?: number | string; max?: number; active?: boolean }>(), { value: 0, active: true });
const props = useDefaults(rawProps, 'UCounter');
const count = computed(() => typeof props.value === 'number' ? props.value : [...props.value].length);
</script>

<template>
    <span v-if="props.active" class="ui-counter" :class="{ 'is-over': props.max !== undefined && count > props.max }" :aria-label="max === undefined ? `${count} characters` : `${count} of ${props.max} characters`">{{ count }}<template v-if="props.max !== undefined"> / {{ props.max }}</template></span>
</template>
