<script setup lang="ts">
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
const rawProps = defineProps<{ disabled?: boolean; loading?: boolean; label?: string }>();
const props = useDefaults(rawProps, 'UFab');
const emit = defineEmits<{ click: [event: MouseEvent] }>();
function activate(event: MouseEvent): void { if (!props.disabled && !props.loading) emit('click', event); }
</script>
<template>
    <UiButton class="u-fab" :disabled="props.disabled" :loading="props.loading" :aria-label="props.label" @click="activate"><slot>+</slot></UiButton>
</template>
