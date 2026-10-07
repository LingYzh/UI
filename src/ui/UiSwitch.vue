<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, ref, useAttrs } from 'vue';
import { vPointerBlur } from './pointer-focus';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { checkboxChecked, toggleCheckbox } from './selection';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<FormControlProps & { value?: unknown; trueValue?: unknown; falseValue?: unknown } & { ripple?: RippleOptions }>(), { ripple: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const attrs = useAttrs();
const model = defineModel<any>({ default: false });
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const checked = computed(() => checkboxChecked(model.value, props.value, props.trueValue));
function change(event: Event) {
    if (control.disabled.value || control.readonly.value) { event.preventDefault(); return; }
    control.editable.value = toggleCheckbox(model.value, (event.target as HTMLInputElement).checked, props);
}
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <span class="ui-selection-ripple is-switch" v-ripple.center.circle="control.disabled.value || control.readonly.value ? false : props.ripple"><input v-pointer-blur ref="element" :checked="checked" @change="change" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="checkbox" class="ui-switch" :class="control.classes.value" :style="control.styles.value"
            :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined"
            @click="control.guard" @keydown="control.guardKeys" @blur="control.blur" /></span>
    </UiControlFrame>
</template>
