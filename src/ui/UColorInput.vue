<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { hexToHsv, hsvToHex } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { allowEmpty?: boolean }>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UColorInput');
const model = defineModel<string | null>({ default: null });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const nativeInput = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const text = ref(model.value ?? '');
const valid = computed(() => !text.value && props.allowEmpty || !!hexToHsv(text.value));
watch(model, (value) => {
    const editing = hexToHsv(text.value);
    // Our normalized model must not expand a three-digit draft under the caret.
    if (editing && value?.toLowerCase() === hsvToHex(editing).toLowerCase()) return;
    text.value = value ?? '';
});
function update(value: string) {
    text.value = value;
    if (control.disabled.value || control.readonly.value) return;
    const hsv = hexToHsv(value);
    if (hsv) control.editable.value = hsvToHex(hsv);
    else if (!value && props.allowEmpty) control.editable.value = null;
}
function commit() {
    text.value = model.value ?? '';
    control.blur();
}
defineExpose({ element, nativeInput, text, valid, control, update, commit, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-input ui-color-input" :class="control.classes.value" :style="control.styles.value">
            <input v-focus-modality ref="nativeInput" class="ui-color-native" type="color" :value="model || '#000000'" :disabled="control.disabled.value || control.readonly.value" aria-label="打开颜色选择器" @input="update(($event.target as HTMLInputElement).value)" />
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :value="text" placeholder="#RRGGBB" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="!valid || control.state.value === false || undefined" @input="update(($event.target as HTMLInputElement).value)" @blur="commit" />
        </div>
    </UiControlFrame>
</template>
