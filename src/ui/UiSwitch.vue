<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, nextTick, onMounted, ref, useAttrs, useModel, watch, type Ref } from 'vue';
import { vPointerBlur } from './pointer-focus';
import UiControlFrame from './UiControlFrame.vue';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { buttonColorStyles } from './button-colors';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { selectionGroupKey } from './selection-context';
import { checkboxChecked, defaultValueComparator, toggleCheckbox, type ValueComparator } from './selection';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { value?: unknown; trueValue?: unknown; falseValue?: unknown; valueComparator?: ValueComparator; indeterminate?: boolean; trueIcon?: IconValue; falseIcon?: IconValue; thumbColor?: string; flat?: boolean } & { ripple?: RippleOptions }>(), { ripple: true, indeterminate: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'USwitch');
defineEmits<{ 'update:focused': [value: boolean]; 'update:indeterminate': [value: boolean] }>();
const attrs = useAttrs();
const standaloneModel = defineModel<any>({ default: false });
const indeterminateModel = useModel(props as Record<string, any>, 'indeterminate');
const group = inject(selectionGroupKey, undefined);
const model = (group?.model ?? standaloneModel) as Ref<any>;
const element = ref<HTMLInputElement>();
const formControlProps = new Proxy(props, {
    get(target, key, receiver) {
        if (key === 'disabled') return Boolean(group?.disabled.value || Reflect.get(target, key, receiver));
        if (key === 'readonly') return Boolean(group?.readonly.value || Reflect.get(target, key, receiver));
        return Reflect.get(target, key, receiver);
    }
});
const control = useFormControl(formControlProps, model, element, attrs);
const comparator = computed(() => props.valueComparator ?? defaultValueComparator);
const selectionValue = computed(() => props.trueValue !== undefined ? props.trueValue : props.value !== undefined ? props.value : true);
const name = computed(() => group?.name ?? props.name ?? attrs.name as string | undefined);
const inputValue = computed(() => group ? selectionValue.value : undefined);
const indeterminate = computed(() => Boolean(indeterminateModel.value));
const checked = computed(() => group
    ? group.selected(selectionValue.value)
    : checkboxChecked(model.value, props.value, props.trueValue, comparator.value));
const icon = computed(() => checked.value ? props.trueIcon : props.falseIcon);
const slotProps = { model, isValid: control.state };
const thumbStyle = computed(() => {
    if (!checked.value || !props.thumbColor) return;
    const colors = buttonColorStyles(props.thumbColor);
    return { backgroundColor: colors['--ui-button-color' as keyof typeof colors] as string, color: colors['--ui-button-on-color' as keyof typeof colors] as string };
});

function sync() {
    if (element.value) element.value.indeterminate = indeterminate.value;
}

watch(indeterminate, sync);
onMounted(sync);

function change(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    if (control.disabled.value || control.readonly.value) {
        target.checked = checked.value;
        target.indeterminate = indeterminate.value;
        event.preventDefault();
        return;
    }
    indeterminateModel.value = false;
    void nextTick(sync);
    if (group) {
        group.toggle(selectionValue.value);
        target.checked = group.selected(selectionValue.value);
        return;
    }
    control.editable.value = toggleCheckbox(model.value, target.checked, {
        value: props.value,
        trueValue: props.trueValue,
        falseValue: props.falseValue,
        comparator: comparator.value
    });
}
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-bind="props" :focused="control.focused.value" :framed="control.framed.value" :for="control.id()" :error="control.displayErrors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <template #default="{ controlAttrs }">
            <span class="ui-selection-ripple is-switch" :class="{ 'is-checked': checked, 'is-disabled': control.disabled.value, 'is-flat': props.flat }" :style="control.styles.value" v-ripple.center.circle="control.disabled.value || control.readonly.value ? false : props.ripple">
                <input v-pointer-blur ref="element" :checked="checked" @change="change" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :name="name" :value="inputValue as any" type="checkbox" class="ui-switch" :class="[control.classes.value, { 'has-custom-thumb': $slots.thumb || props.loading || icon || props.thumbColor, 'is-flat': props.flat }]" :style="control.styles.value"
                    :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" :aria-checked="indeterminate ? 'mixed' : undefined" :aria-busy="props.loading || undefined"
                    @click="control.guard" @keydown="control.guardKeys" @focus="control.focus" @blur="control.blur" />
                <span v-if="$slots['track-true']" class="ui-switch-track-true" aria-hidden="true"><slot name="track-true" v-bind="slotProps" /></span>
                <span v-if="$slots['track-false']" class="ui-switch-track-false" aria-hidden="true"><slot name="track-false" v-bind="slotProps" /></span>
                <span v-if="$slots.thumb || props.loading || icon || props.thumbColor" class="ui-switch-thumb" :style="thumbStyle" aria-hidden="true">
                    <slot name="thumb" v-bind="slotProps" :icon="icon">
                        <slot v-if="props.loading" name="loader" :is-active="true" :color="control.state.value === false ? undefined : props.color"><span class="ui-switch-loader" /></slot>
                        <Icon v-else-if="icon" :icon="icon" :size="10" />
                    </slot>
                </span>
            </span>
        </template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="{ ...scope, ...slotProps }" /></template>
        <template v-if="$slots.details" #details><slot name="details" v-bind="slotProps" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiControlFrame>
</template>
