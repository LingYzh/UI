<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs, watch } from 'vue';
import { mdiClockOutline } from '@mdi/js';
import Icon from '../components/Icon.vue';
import UiButton from './UiButton.vue';
import UiControlFrame from './UiControlFrame.vue';
import UiMenu from './UiMenu.vue';
import UTimePicker from './UTimePicker.vue';
import { useDefaults } from './defaults';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';
import { vPointerBlur } from './pointer-focus';
import { vRipple, type RippleOptions } from './ripple';
import { parseTimeInput, type TimeFormat, type TimeViewMode } from './time-picker';
import { allowedTimeInputField, displayTimeInput, initialTimeInput, validTimeInputSelection, type TimeInputValue } from './time-input';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & {
    mode?: 'single' | 'range'; format?: TimeFormat; useSeconds?: boolean; min?: string; max?: string;
    allowedRanges?: readonly (readonly [string, string])[]; displayFormat?: string; rangeSeparator?: string; placeholder?: string;
    editable?: boolean; hideActions?: boolean; pickerProps?: Record<string, unknown>; menuProps?: Record<string, unknown>;
    okText?: string; cancelText?: string; ripple?: RippleOptions;
}>(), { mode: 'single', format: '24h', useSeconds: false, editable: false, hideActions: false, rangeSeparator: ' – ', ripple: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UTimeInput');
const model = defineModel<TimeInputValue>({ default: null });
const open = defineModel<boolean>('menu', { default: false });
const emit = defineEmits<{ save: [value: TimeInputValue]; cancel: []; 'click:clear': [event: MouseEvent]; 'update:focused': [value: boolean] }>();
const attrs = useAttrs();
const element = ref<HTMLInputElement>();
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const text = ref('');
const invalid = ref(false);
const draft = ref<TimeInputValue>(null);
const range = computed(() => props.mode === 'range');
const options = computed(() => ({ useSeconds: props.useSeconds, min: props.min, max: props.max, allowedRanges: props.allowedRanges }));
const validDraft = computed(() => validTimeInputSelection(draft.value, range.value, options.value));
const validationProps = new Proxy(props, { get(target, key, receiver) {
    if (key === 'errorMessages' && invalid.value) return ['时间无效或超出允许范围。'];
    if (key === 'rules') return [(value: TimeInputValue) => validTimeInputSelection(value, range.value, options.value) || '时间无效或超出允许范围。', ...(props.rules ?? [])];
    return Reflect.get(target, key, receiver);
} });
const control = useFormControl(validationProps, model, element, attrs);
const blocked = computed(() => control.disabled.value || control.readonly.value);
const display = computed(() => (Array.isArray(model.value) ? model.value : model.value ? [model.value] : []).map(value => displayTimeInput(value, props)).join(props.rangeSeparator));
watch(display, value => { text.value = value; invalid.value = false; }, { immediate: true });
watch(open, value => {
    if (!value) return;
    const initial = initialTimeInput(options.value);
    draft.value = range.value ? Array.isArray(model.value) && model.value.length === 2 ? [...model.value] : initial ? [initial, initial] : [] : typeof model.value === 'string' && model.value ? model.value : initial;
});
watch(blocked, value => { if (value) open.value = false; });
const menuBindings = computed(() => ({
    panel: true, nativeDismiss: false, openOnClick: false, openOnFocus: false, openOnHover: false, openOnArrow: false,
    closeOnContentClick: false, location: 'bottom start', locationStrategy: 'connected' as const, offset: 4, target: root.value,
    width: range.value ? 560 : 280, ...props.menuProps,
    contentProps: mergeProps(props.menuProps?.contentProps as Record<string, unknown> ?? {}, { class: 'u-time-input-menu' })
}));
function inputAttrs(controlAttrs: Record<string, unknown>) {
    const { class: _class, style: _style, ...rest } = attrs;
    return mergeControlAttrs(rest, controlAttrs, control.id());
}
function showMenu() { if (!blocked.value) open.value = true; }
function save() {
    if (blocked.value || !validDraft.value) return;
    control.editable.value = Array.isArray(draft.value) ? [...draft.value] : draft.value;
    emit('save', model.value);
    open.value = false;
}
function cancel() { open.value = false; emit('cancel'); }
function closeMenu() { if (open.value) cancel(); }
function pickerValue(index: number): string | null { return Array.isArray(draft.value) ? draft.value[index] ?? null : typeof draft.value === 'string' ? draft.value : null; }
function updatePicker(value: string | Date | null, index: number) {
    if (blocked.value) return;
    const canonical = parseTimeInput(value, options.value).canonical;
    draft.value = range.value ? [index === 0 ? canonical ?? '' : pickerValue(0) ?? '', index === 1 ? canonical ?? '' : pickerValue(1) ?? ''] : canonical;
    if (props.hideActions && validDraft.value) { control.editable.value = Array.isArray(draft.value) ? [...draft.value] : draft.value; if (!range.value) save(); }
}
function allowed(field: TimeViewMode, value: number, index: number) { return allowedTimeInputField(field, value, pickerValue(index), options.value); }
function clear(event: MouseEvent) {
    if (blocked.value) return;
    control.editable.value = range.value ? [] : null;
    draft.value = range.value ? [] : null;
    text.value = ''; invalid.value = false; open.value = false;
    emit('click:clear', event);
}
function commit() {
    if (!props.editable || blocked.value) return;
    if (!text.value.trim()) { control.editable.value = range.value ? [] : null; invalid.value = false; return; }
    const inputs = range.value ? text.value.split(props.rangeSeparator) : [text.value];
    const values = inputs.map(value => parseTimeInput(value, { useSeconds: props.useSeconds, format: props.format, inputMode: 'display' }).canonical);
    const value = range.value ? values as string[] : values[0];
    if (values.some(time => time === null) || !validTimeInputSelection(value, range.value, options.value)) { invalid.value = true; return; }
    control.editable.value = value;
    invalid.value = false;
}
defineExpose({ element, save, cancel, commit, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value || open" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <div ref="root" class="u-time-input" :class="{ 'is-picker-only': !props.editable }">
                <div class="ui-input" :class="control.classes.value" :style="control.styles.value">
                    <slot name="prepend-inner" />
                    <input ref="element" v-model="text" v-bind="inputAttrs(controlAttrs)" type="text" :name="props.name" :disabled="control.disabled.value" :readonly="control.readonly.value || !props.editable" :aria-invalid="invalid || control.state.value === false || undefined" :placeholder="props.placeholder ?? (props.useSeconds ? 'HH:mm:ss' : 'HH:mm')"
                        @focus="control.focus" @blur="commit(); control.blur()" @click="!props.editable && showMenu()" @keydown.enter.prevent="props.editable ? commit() : showMenu()" @keydown.down.prevent="showMenu" @keydown.esc="closeMenu"/>
                    <slot name="append-inner" />
                    <button v-if="props.clearable && display" v-ripple="props.ripple" v-pointer-blur class="ui-control-clear" type="button" :disabled="blocked" aria-label="清空时间" @click.stop="clear"><Icon icon="$close" :size="16" /></button>
                    <button ref="trigger" v-ripple="props.ripple" v-pointer-blur class="ui-control-clear" type="button" :disabled="blocked" :aria-expanded="open" aria-label="打开时间选择" @click="open ? closeMenu() : showMenu()"><Icon :icon="mdiClockOutline" :size="18" /></button>
                </div>
                <UiMenu v-bind="menuBindings" :activator="trigger" :model-value="open" @update:model-value="$event ? showMenu() : closeMenu()">
                    <div class="u-time-input-pickers" :class="{ 'is-range': range }">
                        <UTimePicker v-for="index in range ? 2 : 1" :key="index" v-bind="props.pickerProps" :model-value="pickerValue(index - 1)" :format="props.format" :use-seconds="props.useSeconds" :min="props.min" :max="props.max" :allowed-hours="value => allowed('hour', value, index - 1)" :allowed-minutes="value => allowed('minute', value, index - 1)" :allowed-seconds="value => allowed('second', value, index - 1)" :disabled="control.disabled.value" :readonly="control.readonly.value" variant="select" hide-details :label="range ? index === 1 ? '开始时间' : '结束时间' : '时间'" :name="undefined" @update:model-value="updatePicker($event, index - 1)"/>
                    </div>
                    <slot v-if="!props.hideActions" name="actions" :save="save" :cancel="cancel" :valid="validDraft">
                        <div class="u-confirm-actions"><UiButton variant="text" @click="cancel">{{ props.cancelText ?? '取消' }}</UiButton><UiButton :disabled="!validDraft" @click="save">{{ props.okText ?? '确定' }}</UiButton></div>
                    </slot>
                </UiMenu>
            </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
