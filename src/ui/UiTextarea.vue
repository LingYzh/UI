<script setup lang="ts">
import { ref } from 'vue';
withDefaults(defineProps<{ disabled?: boolean; invalid?: boolean; rows?: number }>(), { rows: 5 });
const model = defineModel<string>({ default: '' });
const element = ref<HTMLTextAreaElement>();
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <textarea ref="element" v-model="model" class="ui-textarea" :disabled="disabled" :rows="rows" :aria-invalid="invalid || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" />
</template>
