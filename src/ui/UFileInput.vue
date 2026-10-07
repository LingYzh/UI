<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { validateFiles, type FileValidationResult } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { accept?: string; multiple?: boolean; maxSize?: number; showSize?: boolean } & { ripple?: RippleOptions }>(), { ripple: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UFileInput');
const emit = defineEmits<{ rejected: [result: FileValidationResult['rejected']]; change: [files: File[]] }>();
const model = defineModel<File | File[] | null>({ default: null });
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const files = computed(() => model.value == null ? [] : Array.isArray(model.value) ? model.value : [model.value]);
function receive(candidate: readonly File[]) {
    if (control.disabled.value || control.readonly.value) return;
    const result = validateFiles(candidate, props);
    if (result.rejected.length) emit('rejected', result.rejected);
    control.editable.value = props.multiple ? result.accepted : result.accepted[0] ?? null;
    emit('change', result.accepted);
}
function change(event: Event) { receive(Array.from((event.target as HTMLInputElement).files ?? [])); }
function clear() {
    if (control.disabled.value || control.readonly.value) return;
    control.editable.value = props.multiple ? [] : null;
    if (element.value) element.value.value = '';
    emit('change', []);
}
defineExpose({ element, files, control, receive, change, clear, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-file-input" :class="control.classes.value" :style="control.styles.value">
            <input v-focus-modality ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="ui-file-input-native" type="file" :accept="props.accept" :multiple="props.multiple" :disabled="control.disabled.value" @click="control.guard" @change="change" @blur="control.blur" />
            <div v-if="files.length" class="ui-file-input-summary"><span v-for="(file, index) in files" :key="index" :title="file.name">{{ file.name }}<small v-if="props.showSize"> · {{ (file.size / 1024).toFixed(1) }} KB</small></span><button v-ripple="props.ripple" v-pointer-blur type="button" class="ui-control-clear" aria-label="清除文件" :disabled="control.disabled.value || control.readonly.value" @click="clear">×</button></div>
        </div>
    </UiControlFrame>
</template>
