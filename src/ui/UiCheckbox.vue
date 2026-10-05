<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { onMounted, ref, watch } from 'vue';
import { useAttrs } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<FormControlProps & {
    /** 部分选中；与 checked 相互独立，用户点击后由原生控件清除，调用方按选择结果重新计算。 */
    indeterminate?: boolean;
}>(), { indeterminate: false, disabled: false });
const model = defineModel<boolean>({ default: false });
const element = ref<HTMLInputElement>();
const attrs = useAttrs();
const control = useFormControl(props, model, element, attrs);
// indeterminate 只能通过 DOM 属性设置，没有对应的 HTML 特性。
function sync() {
    if (element.value) element.value.indeterminate = props.indeterminate;
}
watch(() => props.indeterminate, sync);
onMounted(sync);
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <!-- 有标签时整个 label 可点击；无标签时须通过 aria-label 等提供名称。 -->
        <label v-if="$slots.default" class="ui-checkbox" :class="[$attrs.class, { 'is-disabled': control.disabled.value }]" :style="$attrs.style as any">
            <input v-pointer-blur ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs({ ...attrs, class: undefined, style: undefined }, controlAttrs, control.id())" type="checkbox" class="ui-checkbox-control" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click="control.guard" @keydown="control.guardKeys" @blur="control.blur" :aria-checked="indeterminate ? 'mixed' : undefined" />
            <span class="ui-checkbox-label"><slot /></span>
        </label>
        <input v-pointer-blur v-else ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="checkbox" class="ui-checkbox-control" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click="control.guard" @keydown="control.guardKeys" @blur="control.blur" :aria-checked="indeterminate ? 'mixed' : undefined" />
    </UiControlFrame>
</template>
