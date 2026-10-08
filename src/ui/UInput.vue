<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps>(), { dense: undefined, ghost: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UInput');
defineEmits<{ 'update:focused': [value: boolean] }>();
const model = defineModel<unknown>();
const element = ref<HTMLElement>();
const control = useFormControl(props, model, element, useAttrs());
defineExpose({ element, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors, isValid: control.state, isDirty: control.isDirty, isPristine: control.isPristine, isValidating: control.isValidating });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
        <slot name="prepend" />
        <div ref="element" class="ui-control-base" :class="control.classes.value" :style="control.styles.value" @focusin="control.focus" @focusout="control.blur">
            <slot :control-attrs="controlAttrs" :is-valid="control.state.value" :errors="control.errors.value" :error-messages="control.errors.value" :is-dirty="control.isDirty.value" :is-pristine="control.isPristine.value" :is-validating="control.isValidating.value" :is-disabled="control.disabled.value" :is-readonly="control.readonly.value" :disabled="control.disabled.value" :readonly="control.readonly.value" :validate="control.validate" :reset="control.reset" :reset-validation="control.resetValidation" />
        </div>
        <slot name="append" />
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
