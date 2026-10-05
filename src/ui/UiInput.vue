<script setup lang="ts">
import { computed, ref, useAttrs, type CSSProperties } from 'vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & FormControlProps & { invalid?: boolean }>(), { dense: undefined, ghost: undefined, rounded: undefined });
const attrs = useAttrs();
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
// 字符串模型保持原行为；type="number" 时模型为 number，清空为 null。
const model = defineModel<string | number | null>({ default: '' });
const numeric = computed(() => attrs.type === 'number');
const text = computed({
    get: () => (model.value === null || model.value === undefined ? '' : String(model.value)),
    set: (value: string) => {
        if (control.disabled.value || control.readonly.value) return;
        if (!numeric.value) {
            model.value = value;
            return;
        }
        // 输入中间态（如 "-"、"1e"）浏览器返回空串，此时不写回 null，避免打断输入。
        if (value === '') {
            if (element.value?.validity.badInput) return;
            model.value = null;
            return;
        }
        const number = Number(value);
        if (Number.isFinite(number)) model.value = number;
    }
});
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
defineExpose({ element, focus: () => element.value?.focus(), select: () => element.value?.select(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-input" :class="[$attrs.class, { 'is-disabled': control.disabled.value, 'is-invalid': invalid || control.state.value === false, 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'is-inline': inline }]" :style="[control.framed.value ? undefined : controlSizeStyles(props), $attrs.style as CSSProperties]">
            <span v-if="$slots.leading" class="ui-input-adornment"><slot name="leading" /></span>
            <input ref="element" v-model="text" v-bind="mergeControlAttrs(inputAttrs(), controlAttrs, control.id())" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalid || control.state.value === false || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" @blur="control.blur" />
            <span v-if="$slots.trailing" class="ui-input-adornment"><slot name="trailing" /></span>
        </div>
    </UiControlFrame>
</template>
