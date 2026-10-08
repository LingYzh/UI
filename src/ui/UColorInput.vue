<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { vFocusModality } from './focus-modality';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { parseColorModel, serializeColorModel, type ColorModelInput, type HSVA } from './color-model';
import { useLocale } from './locale-context';
import UiMenu from './UiMenu.vue';
import UColorPicker from './UColorPicker.vue';
import UConfirmEdit from './UConfirmEdit.vue';
type ColorMode = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & {
    allowEmpty?: boolean;
    nativePicker?: boolean;
    openOnFocus?: boolean;
    hidePip?: boolean;
    pipLocation?: 'prepend' | 'prepend-inner' | 'append' | 'append-inner';
    pickerProps?: Record<string, unknown>;
    menuProps?: Record<string, unknown>;
    hideActions?: boolean;
    cancelText?: string;
    okText?: string;
    hideEyeDropper?: boolean;
    hideCanvas?: boolean;
    hideSliders?: boolean;
    hideInputs?: boolean;
    hideInputLabels?: boolean;
    showInputs?: boolean;
    showSwatches?: boolean;
    swatches?: readonly (ColorModelInput | readonly ColorModelInput[])[];
    modes?: readonly ColorMode[];
    canvasHeight?: string | number;
    dotSize?: string | number;
    swatchesMaxHeight?: string | number;
}>(), {
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined,
    nativePicker: false,
    openOnFocus: false,
    hideActions: false,
    pipLocation: 'prepend',
    pickerProps: () => ({}),
    menuProps: () => ({}),
    hideEyeDropper: undefined, hideCanvas: undefined, hideSliders: undefined, hideInputs: undefined,
    hideInputLabels: undefined, showInputs: undefined, showSwatches: undefined
});
const props = useDefaults(rawProps, 'UColorInput');
const emit = defineEmits<{ 'update:focused': [value: boolean]; save: [value: ColorModelInput]; cancel: [] }>();
const model = defineModel<ColorModelInput>({ default: null });
const menu = defineModel<boolean>('menu', { default: false });
const mode = defineModel<ColorMode>('mode');
const attrs = useAttrs();
const locale = useLocale();
const element = ref<HTMLInputElement>();
const nativeInput = ref<HTMLInputElement>();
const field = ref<HTMLElement>();
const menuRef = ref<InstanceType<typeof UiMenu>>();
const picker = ref<InstanceType<typeof UColorPicker>>();
let suppressFocusOpen = false;

function hasExplicitAlpha(value: unknown): boolean {
    if (typeof value === 'string') {
        const source = value.trim();
        if (/^#[\da-f]{4}$/i.test(source) || /^#[\da-f]{8}$/i.test(source)) return true;
        const match = source.match(/^(?:rgba?|hsla?)\(([\s\S]*)\)$/i);
        if (!match) return false;
        const channels = match[1].split('/')[0].trim();
        if (match[1].includes('/')) return true;
        const parts = channels.includes(',') ? channels.split(',') : channels.split(/\s+/);
        return parts.filter(Boolean).length === 4;
    }
    return typeof value === 'object' && value !== null && Object.hasOwn(value, 'a') && (value as { a?: unknown }).a !== undefined;
}

function hexDraft(value: unknown): string {
    const parsed = parseColorModel(value);
    if (!parsed) return '';
    const alphaTemplate = hasExplicitAlpha(value) ? '#000000FF' : '#000000';
    const serialized = serializeColorModel(parsed, alphaTemplate);
    return typeof serialized === 'string' ? serialized : '';
}

function sameRgb(left: HSVA, right: HSVA): boolean {
    const leftHex = serializeColorModel({ ...left, a: 1 }, '#000000');
    const rightHex = serializeColorModel({ ...right, a: 1 }, '#000000');
    return typeof leftHex === 'string' && typeof rightHex === 'string' && leftHex === rightHex;
}

const control = useFormControl(props, model, element, attrs);
const blocked = computed(() => control.disabled.value || control.readonly.value);
const pickerOptions = computed(() => ({
    ...Object.fromEntries(Object.entries({
        hideEyeDropper: props.hideEyeDropper, hideCanvas: props.hideCanvas, hideSliders: props.hideSliders,
        hideInputs: props.hideInputs, hideInputLabels: props.hideInputLabels, showInputs: props.showInputs,
        showSwatches: props.showSwatches, swatches: props.swatches, modes: props.modes,
        canvasHeight: props.canvasHeight, dotSize: props.dotSize, swatchesMaxHeight: props.swatchesMaxHeight,
        mode: mode.value
    }).filter(([, value]) => value !== undefined)),
    ...props.pickerProps
}));
const pipColor = computed(() => {
    const parsed = parseColorModel(model.value);
    return parsed ? String(serializeColorModel(parsed, '#000000FF') ?? '') : 'transparent';
});
const text = ref(hexDraft(model.value));
const valid = computed(() => {
    if (!text.value.trim()) return Boolean(props.allowEmpty);
    return Boolean(parseColorModel(text.value));
});
const nativeColor = computed(() => {
    const parsed = parseColorModel(model.value);
    if (!parsed) return '#000000';
    const color = serializeColorModel({ ...parsed, a: 1 }, '#000000');
    return typeof color === 'string' ? color : '#000000';
});

watch(model, value => {
    const editing = parseColorModel(text.value);
    const current = parseColorModel(value);
    // Keep equivalent short-hex and alpha drafts under the caret after model normalization.
    if (editing && current && sameRgb(editing, current) && (!hasExplicitAlpha(text.value) || Math.abs(editing.a - current.a) <= 1 / 255)) return;
    text.value = hexDraft(value);
});

function update(value: string): void {
    text.value = value;
    if (control.disabled.value || control.readonly.value) return;
    if (!value.trim() && props.allowEmpty) {
        control.editable.value = null;
        return;
    }

    const parsed = parseColorModel(value);
    if (!parsed) return;
    const current = parseColorModel(model.value);
    const keepCurrentAlpha = current && hasExplicitAlpha(model.value) && !hasExplicitAlpha(value);
    const next = keepCurrentAlpha ? { ...parsed, a: current.a } : parsed;
    const output = serializeColorModel(next, model.value ?? value);
    if (output !== undefined) control.editable.value = output;
}

function updateNative(value: string): void {
    if (control.disabled.value || control.readonly.value) return;
    const parsed = parseColorModel(value);
    if (!parsed) return;
    const current = parseColorModel(model.value);
    const next = { ...parsed, a: current?.a ?? 1 };
    const output = serializeColorModel(next, model.value ?? value);
    if (output === undefined) return;
    control.editable.value = output;
    text.value = hexDraft(output);
}

function commit(): void {
    text.value = hexDraft(model.value);
    control.blur();
}
function openPicker() {
    if (blocked.value) return;
    if (props.nativePicker) { nativeInput.value?.click(); return; }
    menu.value = true;
}
function closePicker() { menu.value = false; }
function setColor(value: unknown) {
    if (blocked.value || value !== null && value !== undefined && !parseColorModel(value)) return;
    control.editable.value = value as ColorModelInput;
    text.value = hexDraft(model.value);
}
function focused() {
    control.focus();
    if (props.openOnFocus && !suppressFocusOpen) openPicker();
}
function focusLeft(event: FocusEvent) {
    const target = event.target;
    if (!(target instanceof Node) || field.value?.contains(target) || menuRef.value?.contentEl?.contains(target)) return;
    closePicker();
    control.blur();
}
function finishPicker(cancelled: boolean) {
    closePicker();
    if (cancelled) emit('cancel');
    else emit('save', model.value);
    suppressFocusOpen = true;
    void nextTick(() => { element.value?.focus(); queueMicrotask(() => { suppressFocusOpen = false; }); });
}
function keydown(event: KeyboardEvent) {
    if (blocked.value) return;
    if (event.key === 'Enter' || event.key === 'ArrowDown' && event.altKey) { event.preventDefault(); openPicker(); }
    else if (event.key === 'Escape' && menu.value) { event.preventDefault(); closePicker(); }
}
watch(menu, open => {
    if (open && (blocked.value || props.nativePicker)) { menu.value = false; return; }
    if (typeof document === 'undefined') return;
    if (open) document.addEventListener('focusin', focusLeft);
    else document.removeEventListener('focusin', focusLeft);
}, { immediate: true });
watch(blocked, value => { if (value) closePicker(); });
watch(() => props.nativePicker, value => { if (value) closePicker(); });
onBeforeUnmount(() => { if (typeof document !== 'undefined') document.removeEventListener('focusin', focusLeft); });

defineExpose({
    element,
    nativeInput,
    menu,
    picker,
    mode,
    menuRef,
    text,
    valid,
    control,
    update,
    updateNative,
    commit,
    openPicker,
    closePicker,
    focus: () => element.value?.focus(),
    validate: control.validate,
    reset: control.reset,
    resetValidation: control.resetValidation
});
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="field" class="ui-input ui-color-input" :class="[control.classes.value, { 'is-pip-end': props.pipLocation.startsWith('append') }]" :style="control.styles.value" @keydown="keydown">
            <input v-if="props.nativePicker" v-show="!props.hidePip" v-focus-modality ref="nativeInput" class="ui-color-native" type="color" :value="nativeColor" :disabled="blocked" :aria-label="locale.t('color.hex')" @input="updateNative(($event.target as HTMLInputElement).value)" @focus="control.focus" @blur="control.blur" />
            <button v-else-if="!props.hidePip" v-focus-modality type="button" class="ui-color-pip" :disabled="blocked" :aria-label="locale.t('color.hex')" :aria-expanded="menu" aria-haspopup="dialog" :style="{ '--ui-color-pip': pipColor }" @click.stop="openPicker" />
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :name="props.name" :value="text" placeholder="#RRGGBB" :aria-label="locale.t('color.hex')" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="!valid || control.state.value === false || undefined" :aria-expanded="props.nativePicker ? undefined : menu" :aria-haspopup="props.nativePicker ? undefined : 'dialog'" @input="update(($event.target as HTMLInputElement).value)" @focus="focused" @blur="commit" @click="props.nativePicker ? undefined : openPicker()" />
            <slot name="default" :model="model" :open="openPicker" :close="closePicker" />
        </div>
        <UiMenu v-if="!props.nativePicker" ref="menuRef" v-bind="props.menuProps" v-model="menu" :activator="field" :disabled="blocked" panel :label="String(props.menuProps.label ?? (props.menuProps.contentProps as Record<string, unknown>)?.['aria-label'] ?? locale.t('color.hex'))" :open-on-click="false" :open-on-arrow="false" :close-on-content-click="false" :content-props="{ ...props.menuProps.contentProps as Record<string, unknown>, class: ['ui-color-input-menu', (props.menuProps.contentProps as Record<string, unknown>)?.class] }">
            <UConfirmEdit v-slot="scope" :model-value="model" :disabled="blocked ? true : undefined" :hide-actions="props.hideActions" :cancel-text="props.cancelText" :ok-text="props.okText" @update:model-value="setColor" @save="finishPicker(false)" @cancel="finishPicker(true)">
                <slot name="picker" :model="props.hideActions ? model : scope.model" :update="(value: ColorModelInput) => props.hideActions ? setColor(value) : scope.model.value = value" :save="scope.save" :cancel="scope.cancel" :is-pristine="scope.isPristine">
                    <UColorPicker ref="picker" v-bind="pickerOptions" :model-value="props.hideActions ? model : scope.model.value as ColorModelInput" :disabled="blocked" @update:mode="value => mode = value" @update:model-value="value => props.hideActions ? setColor(value) : scope.model.value = value" />
                </slot>
                <slot v-if="$slots.actions && !props.hideActions" name="actions" :save="scope.save" :cancel="scope.cancel" :is-pristine="scope.isPristine" :actions="scope.actions" />
            </UConfirmEdit>
        </UiMenu>
    </UiControlFrame>
</template>
