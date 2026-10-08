<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import { computed, mergeProps, ref, useAttrs, useSlots, watch } from 'vue';
import UDatePicker from './UDatePicker.vue';
import Icon from '../components/Icon.vue';
import UiMenu from './UiMenu.vue';
import UiControlFrame from './UiControlFrame.vue';
import { isAllowedDate, parseIsoDate, selectedDates, type AllowedDates, type DateLike, type DateMode, type DateSelection } from './date-model';
import { cloneEditValue } from './confirm-edit';
import UiButton from './UiButton.vue';
import { createDateInputFormat } from './date-input-format';
import { useLocale } from './locale-context';
import { vPointerBlur } from './pointer-focus';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { mode?: DateMode; multiple?: boolean | number | string; min?: DateLike; max?: DateLike; allowedDates?: AllowedDates; locale?: string; hideActions?: boolean; openOnFocus?: boolean; openOnInput?: boolean; updateOn?: readonly ('blur' | 'enter' | 'input')[]; pickerProps?: Record<string, unknown>; menuProps?: Record<string, unknown>; inputFormat?: string; displayFormat?: string | ((value: Date) => string); okText?: string; cancelText?: string } & { ripple?: RippleOptions }>(), { ripple: true, mode: 'single', multiple: undefined, hideActions: true, updateOn: () => ['blur', 'enter'], label: '日期', dense: undefined, ghost: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UDateInput');
const slots = useSlots();
const pickerSlotNames = computed(() => ['title', 'header', 'day', 'month', 'year', 'controls'].filter(name => slots[name]));
const locale = useLocale();
const emit = defineEmits<{ 'update:focused': [value: boolean]; save: [value: DateSelection]; cancel: [] }>();
const attrs = useAttrs();
function inputAttrs(): Record<string, unknown> { const { class: _class, style: _style, ...rest } = attrs; return rest; }
const model = defineModel<DateSelection>({ default: null });
const open = defineModel<boolean>('menu', { default: false });
const mode = computed<DateMode>(() => props.multiple === undefined ? props.mode : props.multiple === 'range' ? 'range' : props.multiple ? 'multiple' : 'single');
const format = computed(() => createDateInputFormat({ locale: props.locale ?? locale.current.value, inputFormat: props.inputFormat, displayFormat: props.displayFormat, mode: mode.value, isRtl: locale.isRtl.value }));
const draft = ref<DateSelection>(null);
const pickerValue = computed({ get: () => props.hideActions ? model.value : draft.value, set: (value: DateSelection) => { if (props.hideActions) model.value = value; else draft.value = value; } });
watch(open, value => { if (value) draft.value = cloneEditValue(model.value); }, { immediate: true });
const text = ref('');
const invalid = ref(false);
const element = ref<HTMLInputElement>();
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const menuBindings = computed(() => ({
    panel: true,
    nativeDismiss: false,
    openOnClick: false,
    openOnFocus: false,
    openOnHover: false,
    openOnArrow: false,
    closeOnContentClick: false,
    location: 'bottom start',
    locationStrategy: 'connected' as const,
    offset: 4,
    target: root.value,
    width: 320,
    ...props.menuProps,
    contentProps: mergeProps(props.menuProps?.contentProps as Record<string, unknown> ?? {}, { class: 'u-date-input-menu' })
}));
const validationProps = new Proxy(props, { get(target, key, receiver) {
    if (key === 'errorMessages' && invalid.value) return ['Enter a valid date within the allowed range.'];
    if (key === 'rules') return [(value: DateSelection) => selectedDates(value, mode.value).every((date) => isAllowedDate(date, props.min, props.max, props.allowedDates)) || 'Date outside the allowed range.', ...(props.rules ?? [])];
    return Reflect.get(target, key, receiver);
} });
const control = useFormControl(validationProps, model, element, attrs);
function mergedInputAttrs(controlAttrs: Record<string, unknown> = {}): Record<string, unknown> { return mergeControlAttrs(inputAttrs(), controlAttrs, control.id()); }
function save() { if (control.disabled.value || control.readonly.value) return; if (!props.hideActions) model.value = cloneEditValue(draft.value); emit('save', model.value); open.value = false; }
function cancel() { draft.value = cloneEditValue(model.value); open.value = false; emit('cancel'); }
function closeMenu() { if (!open.value) return; if (props.hideActions) open.value = false; else cancel(); }
function showMenu() { if (!control.disabled.value && !control.readonly.value) open.value = true; }
function pick() { if (props.hideActions && mode.value === 'single') save(); }
watch([control.disabled, control.readonly], ([disabled, readonly]) => { if (disabled || readonly) open.value = false; });
defineExpose({ element, commit, save, cancel, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
const display = computed(() => format.value.joinDates(Array.isArray(model.value) ? model.value : model.value ? [model.value] : [], mode.value));
watch(display, (value) => { text.value = value; invalid.value = false; }, { immediate: true });
function commit(): void {
    if (control.disabled.value || control.readonly.value) return;
    if (!text.value.trim()) { model.value = mode.value === 'single' ? null : []; invalid.value = false; return; }
    const parsed = format.value.parseInput(text.value, mode.value);
    const dates = Array.isArray(parsed.value) ? parsed.value : parsed.value ? [parsed.value] : [];
    if (!parsed.valid || !dates.every(date => isAllowedDate(date, props.min, props.max, props.allowedDates))) { invalid.value = true; return; }
    model.value = parsed.value;
    invalid.value = false;
}
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value || open" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
        <div ref="root" class="u-date-input">
            <div class="ui-input" :class="control.classes.value" :style="control.styles.value"><slot name="prepend-inner" /><input ref="element" v-model="text" v-bind="mergedInputAttrs(controlAttrs)" :name="props.name" type="text" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalid || control.state.value === false || undefined" :placeholder="format.placeholder" @focus="control.focus(); props.openOnFocus && showMenu()" @input="props.openOnInput && showMenu(); props.updateOn.includes('input') && commit()" @blur="props.updateOn.includes('blur') && commit(); control.blur()" @keydown.enter.prevent="props.updateOn.includes('enter') && commit()" @keydown.esc="closeMenu" /><slot name="append-inner" /><button ref="trigger" v-ripple="props.ripple" v-pointer-blur type="button" class="ui-control-clear" :disabled="control.disabled.value || control.readonly.value" :aria-expanded="open" aria-label="打开日历" @click="open ? closeMenu() : showMenu()"><Icon name="mdi-calendar-month-outline" :size="18" /></button></div>
            <UiMenu v-bind="menuBindings" :activator="trigger" :model-value="open" @update:model-value="$event ? showMenu() : closeMenu()"><UDatePicker v-model="pickerValue" :ripple="props.ripple" :mode="mode" :multiple="props.multiple" :min="props.min" :max="props.max" :allowed-dates="props.allowedDates" :locale="props.locale" :disabled="control.disabled.value" :readonly="control.readonly.value" show-adjacent-months hide-header v-bind="props.pickerProps" @update:model-value="pick"><template v-for="name in pickerSlotNames" #[name]="scope"><slot v-if="$slots[name]" :name="name" v-bind="scope" /></template></UDatePicker><slot v-if="!props.hideActions" name="actions" :save="save" :cancel="cancel"><div class="u-confirm-actions"><UiButton variant="text" @click="cancel">{{ props.cancelText ?? '取消' }}</UiButton><UiButton @click="save">{{ props.okText ?? '确定' }}</UiButton></div></slot></UiMenu>
        </div>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
