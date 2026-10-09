<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import UiControlFrame from './UiControlFrame.vue';
import UChip from './UChip.vue';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots, watch, type CSSProperties } from 'vue';
import { formContextKey, useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { collectDroppedFiles, hasFileDropItems } from './file-drop';
import { validateFiles, type FileValidationResult } from './specialized-inputs';
import { formatFileSize, truncateFileName } from './file-display';
import { useLocale } from './locale-context';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { accept?: string; filterByType?: string; multiple?: boolean; maxSize?: number; showSize?: boolean | number | string; chips?: boolean; hideInput?: boolean; truncateLength?: number | string; placeholder?: string; persistentPlaceholder?: boolean; clearIcon?: IconValue; counterString?: string; counterSizeString?: string } & { ripple?: RippleOptions }>(), { ripple: true, clearable: true, counter: undefined, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UFileInput');
const locale = useLocale();
const emit = defineEmits<{ 'update:focused': [value: boolean]; rejected: [files: File[]]; 'rejected-details': [result: FileValidationResult['rejected']]; change: [files: File[]]; 'click:clear': [event: MouseEvent]; 'click:control': [event: MouseEvent]; 'mousedown:control': [event: MouseEvent] }>();
const model = defineModel<File | File[] | null>({ default: ((modelProps: { multiple?: boolean }) => modelProps.multiple ? [] : null) as never });
const attrs = useAttrs();
const slots = useSlots();
const element = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const form = inject(formContextKey, null);
const files = computed(() => model.value == null ? [] : Array.isArray(model.value) ? model.value : [model.value]);
const counterId = `${useId()}-files`;
const hasCounter = computed(() => !!slots.counter || props.counter !== undefined && props.counter !== false);
const counterActive = computed(() => props.counter !== false && files.value.length > 0);
const totalBytes = computed(() => files.value.reduce((total, file) => total + file.size, 0));
const sizeBase = computed(() => typeof props.showSize === 'number' || typeof props.showSize === 'string' ? props.showSize : 1000);
const totalBytesReadable = computed(() => formatFileSize(totalBytes.value, sizeBase.value));
const fileNames = computed(() => files.value.map(file => {
    const name = props.truncateLength === undefined ? file.name : truncateFileName(file.name, props.truncateLength);
    return props.showSize ? `${name} (${formatFileSize(file.size, sizeBase.value)})` : name;
}));
const counterText = computed(() => {
    const count = files.value.length;
    const params = { count, size: totalBytesReadable.value, '0': count, '1': totalBytesReadable.value };
    const template = props.showSize ? props.counterSizeString : props.counterString;
    if (template !== undefined) return locale.t(template, params);
    const countText = locale.t('files.count', { count });
    return props.showSize ? `${countText} · ${totalBytesReadable.value}` : countText;
});
const slotScope = computed(() => ({ id: control.id(), controlRef: element, model, isFocused: control.focused, isDisabled: control.disabled, isReadonly: control.readonly, isValid: control.state, isDirty: control.isDirty }));
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
function inputAccept() { return attrs.webkitdirectory !== undefined && attrs.webkitdirectory !== false ? undefined : props.filterByType ?? props.accept; }
let fileOperation = 0;
function invalidateFileOperation() { fileOperation++; }
function clearNativeInput() {
    if (element.value) element.value.value = '';
}
watch(files, (value) => {
    invalidateFileOperation();
    if (value.length === 0) clearNativeInput();
}, { flush: 'sync' });
watch(() => form?.resetting.value, (resetting) => {
    if (!resetting) return;
    invalidateFileOperation();
    clearNativeInput();
}, { flush: 'sync' });
watch([control.disabled, control.readonly], ([disabled, readonly]) => {
    if (disabled || readonly) invalidateFileOperation();
}, { flush: 'sync' });
function receive(candidate: readonly File[]): FileValidationResult | undefined {
    invalidateFileOperation();
    if (control.disabled.value || control.readonly.value) return undefined;
    const result = validateFiles(candidate, { ...props, accept: props.filterByType });
    if (result.rejected.length) {
        emit('rejected', result.rejected.map((entry) => entry.file));
        emit('rejected-details', result.rejected);
    }
    control.editable.value = props.multiple ? result.accepted : result.accepted[0] ?? null;
    if (element.value && typeof DataTransfer !== 'undefined') {
        const transfer = new DataTransfer();
        result.accepted.forEach(file => transfer.items.add(file));
        element.value.files = transfer.files;
    }
    emit('change', result.accepted);
    if (result.accepted.length === 0) clearNativeInput();
    return result;
}
function change(event: Event) { receive(Array.from((event.target as HTMLInputElement).files ?? [])); }
function onDragOver(event: DragEvent) {
    if (control.disabled.value || control.readonly.value || !event.dataTransfer) return;
    if (hasFileDropItems(event.dataTransfer)) event.preventDefault();
}
async function receiveTransfer(transfer: DataTransfer | null, preferFileList = false) {
    if (!transfer || !hasFileDropItems(transfer)) return;
    const operation = ++fileOperation;
    try {
        const candidates = preferFileList && transfer.files.length > 0
            ? Array.from(transfer.files)
            : await collectDroppedFiles(transfer);
        if (operation !== fileOperation || candidates.length === 0) return;
        const result = receive(candidates);
        if (!result?.accepted.length || !element.value || typeof DataTransfer === 'undefined') return;
        const acceptedTransfer = new DataTransfer();
        result.accepted.forEach((file) => acceptedTransfer.items.add(file));
        element.value.files = acceptedTransfer.files;
    } catch {
        if (operation === fileOperation) invalidateFileOperation();
    }
}
function onDrop(event: DragEvent) {
    event.preventDefault();
    if (control.disabled.value || control.readonly.value) return;
    void receiveTransfer(event.dataTransfer);
}
function onPaste(event: ClipboardEvent) {
    if (control.disabled.value || control.readonly.value || !hasFileDropItems(event.clipboardData)) return;
    event.preventDefault();
    void receiveTransfer(event.clipboardData, true);
}
onMounted(() => {
    const root = element.value?.parentElement;
    root?.addEventListener('dragover', onDragOver);
    root?.addEventListener('drop', onDrop);
    root?.addEventListener('paste', onPaste);
});
onBeforeUnmount(() => {
    invalidateFileOperation();
    const root = element.value?.parentElement;
    root?.removeEventListener('dragover', onDragOver);
    root?.removeEventListener('drop', onDrop);
    root?.removeEventListener('paste', onPaste);
});
function clear(event?: MouseEvent) {
    if (control.disabled.value || control.readonly.value) return;
    invalidateFileOperation();
    control.editable.value = props.multiple ? [] : null;
    clearNativeInput();
    emit('change', []);
    element.value?.focus();
    if (event) emit('click:clear', event);
}
async function reset() {
    invalidateFileOperation();
    await control.reset();
    clearNativeInput();
}
defineExpose({ element, files, control, receive, change, clear, focus: () => element.value?.focus(), validate: control.validate, reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <slot name="prepend" v-bind="slotScope" />
            <div class="ui-file-input" :class="[attrs.class, control.classes.value, { 'is-hidden-input': props.hideInput }]" :style="[control.styles.value, attrs.style as CSSProperties]" @mousedown="emit('mousedown:control', $event)" @click="emit('click:control', $event)">
                <slot name="prepend-inner" v-bind="slotScope" />
                <input v-focus-modality ref="element" v-bind="mergeControlAttrs(inputAttrs(), controlAttrs, control.id())" class="ui-file-input-native" type="file" :name="props.name" :accept="inputAccept()" :multiple="props.multiple" :disabled="control.disabled.value" :tabindex="props.hideInput ? -1 : undefined" :aria-invalid="control.state.value === false || undefined" :aria-describedby="[mergeControlAttrs(inputAttrs(), controlAttrs, control.id())['aria-describedby'], hasCounter ? counterId : ''].filter(Boolean).join(' ') || undefined" @click="control.guard" @change="change" @focus="control.focus" @blur="control.blur" />
                <button v-if="props.hideInput" v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-pointer-blur type="button" class="ui-upload-browse" :disabled="control.disabled.value || control.readonly.value" @click="element?.click()">选择文件</button>
                <span v-if="props.placeholder && !files.length && (control.focused.value || props.persistentPlaceholder || !props.label)" class="ui-file-input-placeholder">{{ props.placeholder }}</span>
                <div v-if="files.length && !props.hideInput" class="ui-file-input-summary" :class="{ 'is-chips': props.chips }">
                    <slot name="selection" :files="files" :file-names="fileNames" :total-bytes="totalBytes" :total-bytes-readable="totalBytesReadable">
                        <template v-for="(file, index) in files" :key="index"><UChip v-if="props.chips" dense :title="file.name">{{ fileNames[index] }}</UChip><span v-else :title="file.name">{{ fileNames[index] }}{{ index < files.length - 1 ? '、' : '' }}</span></template>
                    </slot>
                </div>
                <slot v-if="props.loading" name="loader" :is-active="true" :color="props.color"><span class="u-input-loading" role="status" aria-label="加载中" /></slot>
                <slot v-if="props.clearable && files.length" name="clear" :props="{ onClick: clear, disabled: control.disabled.value || control.readonly.value }"><button v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-pointer-blur type="button" class="ui-control-clear" aria-label="清除文件" :disabled="control.disabled.value || control.readonly.value" @pointerdown.prevent @click.stop="clear"><Icon v-if="props.clearIcon" :icon="props.clearIcon" :size="16" /><template v-else>×</template></button></slot>
                <slot name="append-inner" v-bind="slotScope" />
            </div>
            <slot name="append" v-bind="slotScope" />
            <output v-if="hasCounter" v-show="counterActive" :id="counterId" class="u-input-counter" :for="control.id()"><slot name="counter" :counter="counterText" :value="files.length" :total-bytes="totalBytes" :total-bytes-readable="totalBytesReadable">{{ counterText }}</slot></output>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" v-bind="slotScope" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
