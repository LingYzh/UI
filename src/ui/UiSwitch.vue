<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import { vPointerBlur } from './pointer-focus';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = defineProps<FormControlProps>();
const attrs = useAttrs();
const model = defineModel<boolean>({ default: false });
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <input v-pointer-blur ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="checkbox" class="ui-switch"
            :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined"
            @click="control.guard" @keydown="control.guardKeys" @blur="control.blur" />
    </UiControlFrame>
</template>
