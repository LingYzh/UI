<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<FormControlProps>(), { dense: undefined, ghost: undefined, rounded: undefined });
const model = defineModel<unknown>();
const element = ref<HTMLElement>();
const control = useFormControl(props, model, element, useAttrs());
defineExpose({ element, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-control-base" :class="control.classes.value" :style="control.styles.value" @focusout="control.blur">
            <slot :control-attrs="controlAttrs" :is-valid="control.state.value" :errors="control.errors.value" :disabled="control.disabled.value" :readonly="control.readonly.value" :validate="control.validate" />
        </div>
    </UiControlFrame>
</template>
