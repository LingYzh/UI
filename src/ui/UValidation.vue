<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
const props = withDefaults(defineProps<FormControlProps>(), { dense: undefined, ghost: undefined, rounded: undefined });
const model = defineModel<unknown>();
const element = ref<HTMLElement>();
const control = useFormControl(props, model, element, useAttrs());
defineExpose({ validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template><slot :model-value="model" :is-valid="control.state.value" :errors="control.errors.value" :validate="control.validate" :reset="control.reset" :reset-validation="control.resetValidation" /></template>
