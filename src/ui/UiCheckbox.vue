<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { vPointerBlur } from './pointer-focus';
import { computed, inject, nextTick, onMounted, ref, useModel, watch, type Ref } from 'vue';
import { useAttrs } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { checkboxChecked, defaultValueComparator, toggleCheckbox, type ValueComparator } from './selection';
import { selectionGroupKey } from './selection-context';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & {
    /** 部分选中；与 checked 相互独立，用户点击后由原生控件清除，调用方按选择结果重新计算。 */
    indeterminate?: boolean;
    value?: unknown;
    trueValue?: unknown;
    falseValue?: unknown;
    valueComparator?: ValueComparator;
} & { ripple?: RippleOptions }>(), { ripple: true, indeterminate: false, disabled: false, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UCheckbox');
defineEmits<{ 'update:focused': [value: boolean]; 'update:indeterminate': [value: boolean] }>();
const standaloneModel = defineModel<any>({ default: false });
const indeterminateModel = useModel(props as Record<string, any>, 'indeterminate');
const element = ref<HTMLInputElement>();
const attrs = useAttrs();
const group = inject(selectionGroupKey, undefined);
const model = (group?.model ?? standaloneModel) as Ref<any>;
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

function change(event: Event) {
    const target = event.target as HTMLInputElement;
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

function guard(event: Event) {
    if (control.disabled.value || control.readonly.value) event.preventDefault();
    else control.guard(event);
}

function guardKeys(event: KeyboardEvent) {
    if (control.readonly.value && event.key !== 'Tab' && event.key !== 'Escape' && !event.ctrlKey && !event.metaKey) event.preventDefault();
    else control.guardKeys(event);
}

function sync() {
    if (element.value) element.value.indeterminate = indeterminate.value;
}
watch(indeterminate, sync);
onMounted(sync);
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.displayErrors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <!-- 有标签时整个 label 可点击；无标签时须通过 aria-label 等提供名称。 -->
        <label v-if="$slots.default" class="ui-checkbox" :class="[$attrs.class, { 'is-disabled': control.disabled.value }]" :style="$attrs.style as any">
            <span class="ui-selection-ripple is-checkbox" v-ripple.center.circle="control.disabled.value || control.readonly.value ? false : props.ripple"><input v-pointer-blur ref="element" :checked="checked" @change="change" v-bind="mergeControlAttrs({ ...attrs, class: undefined, style: undefined }, controlAttrs, control.id())" :name="name" :value="inputValue as any" type="checkbox" class="ui-checkbox-control" :class="control.classes.value" :style="control.styles.value" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click="guard" @keydown="guardKeys" @focus="control.focus" @blur="control.blur" :aria-checked="indeterminate ? 'mixed' : undefined" /></span>
            <span class="ui-checkbox-label"><slot /></span>
        </label>
        <span v-else class="ui-selection-ripple is-checkbox" v-ripple.center.circle="control.disabled.value || control.readonly.value ? false : props.ripple"><input v-pointer-blur ref="element" :checked="checked" @change="change" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :name="name" :value="inputValue as any" type="checkbox" class="ui-checkbox-control" :class="control.classes.value" :style="control.styles.value" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click="guard" @keydown="guardKeys" @focus="control.focus" @blur="control.blur" :aria-checked="indeterminate ? 'mixed' : undefined" /></span>
    </UiControlFrame>
</template>
