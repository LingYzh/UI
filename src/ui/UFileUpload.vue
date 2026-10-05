<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { validateFiles, type FileValidationResult } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { accept?: string; multiple?: boolean; maxSize?: number }>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UFileUpload');
const emit = defineEmits<{ rejected: [result: FileValidationResult['rejected']]; change: [files: File[]] }>();
const model = defineModel<File[]>({ default: () => [] });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const input = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const dragging = ref(false);
const files = computed(() => model.value);
function receive(candidate: readonly File[]) {
    if (control.disabled.value || control.readonly.value) return;
    const result = validateFiles(candidate, props);
    if (result.rejected.length) emit('rejected', result.rejected);
    control.editable.value = props.multiple ? [...model.value, ...result.accepted] : result.accepted.slice(0, 1);
    emit('change', control.editable.value);
}
function drop(event: DragEvent) {
    event.preventDefault();
    dragging.value = false;
    receive(Array.from(event.dataTransfer?.files ?? []));
}
function change(event: Event) { receive(Array.from((event.target as HTMLInputElement).files ?? [])); }
function remove(index: number) {
    if (control.disabled.value || control.readonly.value) return;
    control.editable.value = model.value.filter((_, current) => current !== index);
    emit('change', model.value);
}
function clear() { if (!control.disabled.value && !control.readonly.value) { control.editable.value = []; emit('change', []); } }
defineExpose({ element, input, files, dragging, control, receive, drop, change, remove, clear, focus: () => input.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-file-upload" :class="[control.classes.value, { 'is-dragging': dragging }]" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']" @dragover.prevent="dragging = !control.disabled.value && !control.readonly.value" @dragleave="dragging = false" @drop="drop">
            <div class="ui-upload-target"><span class="ui-upload-symbol" aria-hidden="true">↑</span><strong>拖放文件到这里</strong><span class="ui-upload-hint">或选择本地文件</span><input :id="control.id()" ref="input" class="ui-upload-file-input" type="file" :accept="props.accept" :multiple="props.multiple" :disabled="control.disabled.value" :aria-label="props.label || '上传文件'" @click="control.guard" @change="change" @blur="control.blur" /></div>
            <ul v-if="files.length" class="ui-upload-files"><li v-for="(file, index) in files" :key="index"><span :title="file.name">{{ file.name }}</span><small>{{ (file.size / 1024).toFixed(1) }} KB</small><button v-pointer-blur type="button" class="ui-control-clear" :aria-label="'移除 ' + file.name" :disabled="control.disabled.value || control.readonly.value" @click="remove(index)">×</button></li></ul>
        </div>
    </UiControlFrame>
</template>
