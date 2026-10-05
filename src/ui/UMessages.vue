<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ messages?: string | string[]; error?: boolean; id?: string }>(), { error: false });
const props = useDefaults(rawProps, 'UMessages');
</script>

<template>
    <div class="ui-messages" :class="{ 'is-error': props.error }" :id="props.id" :role="props.error ? 'alert' : 'status'"><slot><span v-for="(message, index) in (Array.isArray(props.messages) ? props.messages : props.messages ? [props.messages] : [])" :key="index">{{ message }}</span></slot></div>
</template>
