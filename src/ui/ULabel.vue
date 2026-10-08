<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ for?: string; text?: string; required?: boolean; disabled?: boolean }>(), { required: false, disabled: false });
const props = useDefaults(rawProps, 'ULabel');
</script>

<template>
    <label class="ui-label" :class="{ 'is-disabled': props.disabled }" :for="props.for">{{ props.text }}<slot /><span v-if="props.required" class="ui-label-required" aria-hidden="true"> *</span></label>
</template>
