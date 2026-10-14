<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import Icon from '../components/Icon.vue';
import UImageViewer from './UImageViewer.vue';
import type { IconValue } from './icon-config';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, h, inject, mergeProps, onBeforeUnmount, onMounted, ref, useAttrs, useSlots, watch, type CSSProperties } from 'vue';
import { formContextKey, useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { collectDroppedFiles, hasFileDropItems } from './file-drop';
import { validateFiles, type FileValidationResult } from './specialized-inputs';
import { formatFileSize } from './file-display';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { accept?: string; filterByType?: string; multiple?: boolean; maxSize?: number; title?: string; subtitle?: string; browseText?: string; dividerText?: string; icon?: IconValue; hideBrowse?: boolean; insetFileList?: boolean; showSize?: boolean; listType?: 'text' | 'picture' | 'picture-card' } & { ripple?: RippleOptions }>(), { ripple: true, clearable: true, showSize: true, listType: 'text', title: '拖放文件到这里', browseText: '选择本地文件', icon: '$upload', dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UFileUpload');
const emit = defineEmits<{ 'update:focused': [value: boolean]; rejected: [files: File[]]; 'rejected-details': [result: FileValidationResult['rejected']]; change: [files: File[]]; 'click:browse': [event?: MouseEvent]; 'click:remove': [index: number] }>();
const model = defineModel<File | File[] | null>({ default: null });
const attrs = useAttrs();
const slots = useSlots();
const element = ref<HTMLDivElement>();
const input = ref<HTMLInputElement>();
const control = useFormControl(props, model, element, attrs);
const form = inject(formContextKey, null);
const dragging = ref(false);
const files = computed(() => model.value == null ? [] : Array.isArray(model.value) ? model.value : [model.value]);
const previewUrls = ref(new Map<File, string>());
const imageOpen = ref(false);
const imageIndex = ref(0);
const imageSources = computed(() => [...previewUrls.value.values()]);
let mounted = false;
function syncImagePreviews() {
    if (!mounted) return;
    const images = props.listType === 'text' ? [] : files.value.filter(file => file.type.startsWith('image/') || /\.(?:png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(file.name));
    const next = new Map(previewUrls.value);
    for (const [file, url] of next) if (!images.includes(file)) { URL.revokeObjectURL(url); next.delete(file); }
    for (const file of images) if (!next.has(file)) next.set(file, URL.createObjectURL(file));
    previewUrls.value = next;
    if (!next.size) imageOpen.value = false;
}
watch([files, () => props.listType], syncImagePreviews, { flush: 'post' });
function previewImage(file: File) {
    if (control.disabled.value) return;
    const url = previewUrls.value.get(file);
    if (!url) return;
    imageIndex.value = imageSources.value.indexOf(url);
    imageOpen.value = true;
}
const interactive = computed(() => !control.disabled.value && !control.readonly.value);
const customInput = computed(() => !!slots.default || !!slots.browse || !!slots.input || !!props.hideBrowse || !!props.insetFileList && files.value.length > 0);
const slotScope = computed(() => ({ id: control.id(), controlRef: input, model, files: files.value, isDragging: dragging.value, hasFiles: files.value.length > 0, isFocused: control.focused, isDisabled: control.disabled, isReadonly: control.readonly, isValid: control.state, props: browseProps.value }));
function browse(event?: MouseEvent) {
    if (!interactive.value || event?.defaultPrevented) return;
    emit('click:browse', event);
    input.value?.click();
}
const browseProps = computed(() => ({ type: 'button' as const, disabled: !interactive.value, onClick: browse }));
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
const nativeInputNode = computed(() => h('input', mergeProps(inputAttrs(), {
    id: control.id(),
    ref: (node: unknown) => { input.value = node instanceof HTMLInputElement ? node : undefined; },
    class: ['ui-upload-file-input', { 'is-custom-input': customInput.value }],
    type: 'file',
    accept: attrs.webkitdirectory !== undefined && attrs.webkitdirectory !== false ? undefined : props.filterByType ?? props.accept,
    multiple: props.multiple,
    name: props.name,
    disabled: control.disabled.value,
    tabindex: customInput.value ? -1 : undefined,
    'aria-label': props.label || props.browseText,
    'aria-invalid': control.state.value === false || undefined,
    onClick: control.guard,
    onChange: change,
    onFocus: control.focus,
    onBlur: control.blur
})));
function onDragOver(event: DragEvent) {
    if (!interactive.value || !hasFileDropItems(event.dataTransfer)) return;
    event.preventDefault();
    dragging.value = true;
}
function onTargetClick(event: MouseEvent) {
    const target = event.target instanceof Element ? event.target.closest('button, input, a, [role="button"]') : null;
    if (!props.hideBrowse || target && target !== event.currentTarget) return;
    browse(event);
}
function onTargetKeydown(event: KeyboardEvent) {
    if (!props.hideBrowse || event.target !== event.currentTarget || !['Enter', ' '].includes(event.key) || !interactive.value) return;
    event.preventDefault();
    browse();
}
function removeProps(index: number) { return { disabled: !interactive.value, 'onClick:remove': () => remove(index), onClick: () => remove(index) }; }
let fileOperation = 0;
function invalidateFileOperation() { fileOperation++; }
function clearNativeInput() {
    if (input.value) input.value.value = '';
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
    if (disabled || readonly) {
        dragging.value = false;
        invalidateFileOperation();
    }
}, { flush: 'sync' });
function receive(candidate: readonly File[]) {
    invalidateFileOperation();
    if (control.disabled.value || control.readonly.value) return;
    const result = validateFiles(candidate, { ...props, accept: props.filterByType });
    if (result.rejected.length) {
        emit('rejected', result.rejected.map((entry) => entry.file));
        emit('rejected-details', result.rejected);
    }
    const next = props.multiple ? [...files.value, ...result.accepted] : result.accepted[0] ?? null;
    control.editable.value = next;
    if (input.value && typeof DataTransfer !== 'undefined') {
        const transfer = new DataTransfer();
        result.accepted.forEach(file => transfer.items.add(file));
        input.value.files = transfer.files;
    }
    emit('change', next == null ? [] : Array.isArray(next) ? next : [next]);
    if (result.accepted.length === 0) clearNativeInput();
}
async function drop(event: DragEvent) {
    event.preventDefault();
    dragging.value = false;
    if (control.disabled.value || control.readonly.value || !hasFileDropItems(event.dataTransfer)) return;
    const operation = ++fileOperation;
    try {
        const candidates = await collectDroppedFiles(event.dataTransfer);
        if (operation === fileOperation && candidates.length) receive(candidates);
    } catch {
        if (operation === fileOperation) invalidateFileOperation();
    }
}
function change(event: Event) { receive(Array.from((event.target as HTMLInputElement).files ?? [])); }
async function paste(event: ClipboardEvent) {
    const transfer = event.clipboardData;
    if (!transfer || control.disabled.value || control.readonly.value || !hasFileDropItems(transfer)) return;
    event.preventDefault();
    const operation = ++fileOperation;
    try {
        const candidates = transfer.files.length > 0
            ? Array.from(transfer.files)
            : await collectDroppedFiles(transfer);
        if (operation === fileOperation && candidates.length) receive(candidates);
    } catch {
        if (operation === fileOperation) invalidateFileOperation();
    }
}
function onDragLeave(event: DragEvent) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && element.value?.contains(nextTarget)) event.stopPropagation();
}
onMounted(() => {
    mounted = true;
    syncImagePreviews();
    element.value?.addEventListener('dragleave', onDragLeave, true);
    element.value?.addEventListener('paste', paste);
});
onBeforeUnmount(() => {
    mounted = false;
    for (const url of previewUrls.value.values()) URL.revokeObjectURL(url);
    invalidateFileOperation();
    element.value?.removeEventListener('dragleave', onDragLeave, true);
    element.value?.removeEventListener('paste', paste);
});
function remove(index: number) {
    if (control.disabled.value || control.readonly.value) return;
    invalidateFileOperation();
    const next = files.value.filter((_, current) => current !== index);
    const value = props.multiple ? next : next[0] ?? null;
    control.editable.value = value;
    emit('change', next);
    emit('click:remove', index);
}
function clear() {
    if (control.disabled.value || control.readonly.value) return;
    invalidateFileOperation();
    control.editable.value = props.multiple ? [] : null;
    clearNativeInput();
    emit('change', []);
}
async function reset() {
    invalidateFileOperation();
    await control.reset();
    clearNativeInput();
}
defineExpose({ element, input, files, dragging, control, receive, drop, change, remove, clear, browse, focus: () => input.value?.focus(), validate: control.validate, reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <slot name="prepend" v-bind="slotScope" />
            <div ref="element" class="ui-file-upload" :class="[attrs.class, control.classes.value, { 'is-dragging': dragging, 'is-inset-list': props.insetFileList && files.length > 0 }]" :style="[control.styles.value, attrs.style as CSSProperties]" :aria-describedby="controlAttrs['aria-describedby']" @dragover="onDragOver" @dragleave="dragging = false" @drop="drop">
                <slot v-if="$slots.default" v-bind="slotScope" />
                <template v-else>
                    <div class="ui-upload-target" :class="{ 'is-custom-input': customInput }" :role="props.hideBrowse ? 'button' : undefined" :tabindex="props.hideBrowse ? interactive ? 0 : -1 : undefined" :aria-disabled="props.hideBrowse && !interactive || undefined" @click="onTargetClick" @keydown="onTargetKeydown">
                        <span v-if="props.icon || $slots.icon" class="ui-upload-symbol" aria-hidden="true"><slot name="icon"><Icon :icon="props.icon" :size="20" /></slot></span>
                        <strong v-if="props.title || $slots.title"><slot name="title">{{ props.title }}</slot></strong>
                        <span v-if="props.subtitle" class="ui-upload-hint">{{ props.subtitle }}</span>
                        <span v-if="props.dividerText || $slots.divider" class="ui-upload-hint"><slot name="divider">{{ props.dividerText }}</slot></span>
                        <template v-if="!props.hideBrowse"><slot v-if="$slots.browse || props.insetFileList && files.length > 0" name="browse" :props="browseProps"><button v-ripple="interactive ? props.ripple : false" v-pointer-blur v-bind="browseProps" class="ui-upload-browse">{{ props.browseText }}</button></slot><span v-else class="ui-upload-hint">或{{ props.browseText }}</span></template>
                        <slot name="input" :input-node="nativeInputNode"><component :is="nativeInputNode" v-focus-modality :aria-describedby="controlAttrs['aria-describedby']" /></slot>
                    </div>
                    <ul v-if="files.length" class="ui-upload-files" :class="`is-${props.listType}`">
                        <li v-for="(file, index) in files" :key="index">
                            <slot :name="!props.multiple && files.length === 1 && $slots.single ? 'single' : 'item'" :file="file" :index="index" :props="removeProps(index)">
                                <button v-if="previewUrls.has(file)" v-ripple="props.ripple" v-pointer-blur type="button" class="ui-upload-thumbnail" :aria-label="'预览 ' + file.name" :disabled="control.disabled.value" @click="previewImage(file)">
                                    <img :src="previewUrls.get(file)" :alt="file.name" />
                                </button>
                                <span :title="file.name">{{ file.name }}</span>
                                <small v-if="props.showSize">{{ formatFileSize(file.size) }}</small>
                                <button v-if="props.clearable" v-ripple="interactive ? props.ripple : false" v-pointer-blur type="button" class="ui-control-clear" :aria-label="'移除 ' + file.name" :disabled="!interactive" @click="remove(index)"><Icon icon="$close" :size="16" /></button>
                            </slot>
                        </li>
                    </ul>
                </template>
                <component :is="nativeInputNode" v-if="$slots.default" v-focus-modality :aria-describedby="controlAttrs['aria-describedby']" />
                <slot v-if="props.loading" name="loader" :is-active="true" :color="props.color"><span class="u-input-loading" role="status" aria-label="加载中" /></slot>
            </div>
            <UImageViewer v-model="imageOpen" v-model:index="imageIndex" :sources="imageSources" label="文件图片预览" />
            <slot name="append" v-bind="slotScope" />
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" v-bind="slotScope" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
