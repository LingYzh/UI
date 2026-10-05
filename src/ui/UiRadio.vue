<script setup lang="ts" generic="T extends string | number">
import { vPointerBlur } from './pointer-focus';
import { ref } from 'vue';
import { useAttrs } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<FormControlProps & {
    /** 本单选项代表的值；与 v-model 相等时选中。 */
    value: T;
}>(), { disabled: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
// 同一组单选共享 name 与 v-model；分组布局由页面负责，便于把单选放进各自的卡片。
const model = defineModel<T | null>({ default: null });
const element = ref<HTMLInputElement>();
const attrs = useAttrs();
const control = useFormControl(props, model, element, attrs);
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <label v-if="$slots.default" class="ui-radio" :class="[$attrs.class, { 'is-disabled': control.disabled.value }]" :style="$attrs.style as any">
            <input v-pointer-blur ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs({ ...attrs, class: undefined, style: undefined }, controlAttrs, control.id())" type="radio" class="ui-radio-control" :class="control.classes.value" :style="control.styles.value" :value="value" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click="control.guard" @keydown="control.guardKeys" @blur="control.blur" />
            <span class="ui-radio-label"><slot /></span>
        </label>
        <input v-pointer-blur v-else ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="radio" class="ui-radio-control" :value="value" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click="control.guard" @keydown="control.guardKeys" @blur="control.blur" />
    </UiControlFrame>
</template>
