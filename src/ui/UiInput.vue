<script setup lang="ts">
import { computed, ref, useAttrs, useId, type CSSProperties } from 'vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & FormControlProps & { invalid?: boolean }>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
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
const counterId = `${useId()}-counter`;
const hasCounter = computed(() => props.counter !== undefined && props.counter !== false);
const limit = computed(() => typeof props.counter === 'number' ? props.counter : attrs.maxlength === undefined ? undefined : Number(attrs.maxlength));
const count = computed(() => text.value.length);
function clear() { control.editable.value = numeric.value ? null : ''; element.value?.focus(); }
defineExpose({ element, focus: () => element.value?.focus(), select: () => element.value?.select(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-input" :class="[$attrs.class, control.classes.value, { 'is-invalid': invalid, 'is-inline': inline }]" :style="[control.framed.value ? undefined : controlSizeStyles(props), control.styles.value, $attrs.style as CSSProperties]">
            <span v-if="$slots.leading" class="ui-input-adornment"><slot name="leading" /></span>
            <span v-if="prefix" class="ui-input-adornment">{{ prefix }}</span>
            <input ref="element" v-model="text" v-bind="mergeControlAttrs(inputAttrs(), controlAttrs, control.id())" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalid || control.state.value === false || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" :aria-describedby="[mergeControlAttrs(inputAttrs(), controlAttrs, control.id())['aria-describedby'], hasCounter ? counterId : ''].filter(Boolean).join(' ') || undefined" @blur="control.blur" />
            <span v-if="suffix" class="ui-input-adornment">{{ suffix }}</span>
            <span v-if="loading" class="u-input-loading" role="status" aria-label="加载中" />
            <button v-if="clearable && text && !control.disabled.value && !control.readonly.value" type="button" class="u-input-clear" aria-label="清除" @pointerdown.prevent @click="clear">×</button>
            <span v-if="$slots.trailing" class="ui-input-adornment"><slot name="trailing" /></span>
        </div>
        <output v-if="hasCounter" :id="counterId" class="u-input-counter" :class="{ 'is-over-limit': limit !== undefined && count > limit }" :for="control.id()">{{ count }}<template v-if="limit !== undefined"> / {{ limit }}</template></output>
    </UiControlFrame>
</template>
