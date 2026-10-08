<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<FormControlProps>(), { dense: undefined, ghost: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UValidation');
defineEmits<{ 'update:focused': [value: boolean] }>();
const model = defineModel<unknown>();
const element = ref<HTMLElement>();
const control = useFormControl(props, model, element, useAttrs());
defineExpose({ validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors, isValid: control.state, isDirty: control.isDirty, isPristine: control.isPristine, isValidating: control.isValidating });
</script>

<template><slot :model-value="model" :is-valid="control.state.value" :errors="control.errors.value" :error-messages="control.errors.value" :is-dirty="control.isDirty.value" :is-pristine="control.isPristine.value" :is-validating="control.isValidating.value" :is-disabled="control.disabled.value" :is-readonly="control.readonly.value" :validation-classes="control.validationClasses.value" :validate="control.validate" :reset="control.reset" :reset-validation="control.resetValidation" /></template>
