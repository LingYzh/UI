<script setup lang="ts">
import { useId } from 'vue';
const props = defineProps<{ label: string; for?: string; description?: string; error?: string }>();
const id = useId();
</script>

<template>
    <div class="ui-field">
        <div><label v-if="props.for" :for="props.for">{{ label }}</label><span v-else>{{ label }}</span><p v-if="description" :id="`${id}-description`">{{ description }}</p><p v-if="error" :id="`${id}-error`" class="ui-field-error" role="alert">{{ error }}</p></div>
        <slot :control-attrs="{ id: props.for, 'aria-describedby': [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined, 'aria-invalid': error ? true : undefined }" />
    </div>
</template>
