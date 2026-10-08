<script setup lang="ts" generic="T">
import { computed, inject, ref, useAttrs, type Ref } from 'vue';
import { vRipple, type RippleOptions } from './ripple';
import { vPointerBlur } from './pointer-focus';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { selectionGroupKey } from './selection-context';
import { defaultValueComparator, type ValueComparator } from './selection';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FormControlProps & {
    /** 本单选项代表的值；与 v-model 相等时选中。 */
    value?: T;
    trueValue?: T;
    falseValue?: T;
    valueComparator?: ValueComparator;
    ripple?: RippleOptions;
}>(), {
    ripple: true,
    disabled: false,
    dense: undefined,
    ghost: undefined,
    rounded: undefined,
    hideDetails: undefined,
    persistentHint: undefined
});

const standaloneModel = defineModel<T | null>({ default: null });
const group = inject(selectionGroupKey, undefined);
const model = (group?.model ?? standaloneModel) as Ref<unknown>;
const element = ref<HTMLInputElement>();
const attrs = useAttrs();
const effectiveTrueValue = computed<unknown>(() => props.trueValue !== undefined
    ? props.trueValue
    : props.value !== undefined ? props.value : true);
const comparator = computed(() => props.valueComparator ?? defaultValueComparator);
const checked = computed(() => group
    ? group.selected(effectiveTrueValue.value)
    : comparator.value(model.value, effectiveTrueValue.value));

const formControlProps = new Proxy(props, {
    get(target, key, receiver) {
        if (key === 'disabled') return Boolean(group?.disabled.value || Reflect.get(target, key, receiver));
        if (key === 'readonly') return Boolean(group?.readonly.value || Reflect.get(target, key, receiver));
        return Reflect.get(target, key, receiver);
    }
});
const control = useFormControl(formControlProps, model, element, attrs);

function change(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (control.disabled.value || control.readonly.value) {
        input.checked = checked.value;
        return;
    }
    if (!input.checked) return;
    if (group) group.toggle(effectiveTrueValue.value);
    else model.value = effectiveTrueValue.value;
}

defineExpose({
    element,
    focus: () => element.value?.focus(),
    validate: control.validate,
    reset: control.reset,
    resetValidation: control.resetValidation,
    errors: control.errors
});
</script>

<template>
    <UiControlFrame
        v-slot="{ controlAttrs }"
        v-bind="props"
        :framed="control.framed.value"
        :for="control.id()"
        :error="control.errors.value.join('\n')"
        :required="attrs.required !== undefined && attrs.required !== false"
        :label-position="control.labelPosition.value"
        :label-width="control.labelWidth.value"
    >
        <label
            v-if="$slots.default"
            class="ui-radio"
            :class="[$attrs.class, { 'is-disabled': control.disabled.value }]"
            :style="$attrs.style as any"
        >
            <span
                class="ui-selection-ripple is-radio"
                v-ripple.center.circle="control.disabled.value || control.readonly.value ? false : props.ripple"
            >
                <input
                    v-pointer-blur
                    ref="element"
                    v-bind="mergeControlAttrs({ ...attrs, class: undefined, style: undefined }, controlAttrs, control.id())"
                    type="radio"
                    class="ui-radio-control"
                    :class="control.classes.value"
                    :style="control.styles.value"
                    :value="effectiveTrueValue as any"
                    :name="group?.name ?? attrs.name as string | undefined"
                    :checked="checked"
                    :disabled="control.disabled.value"
                    :aria-readonly="control.readonly.value || undefined"
                    :aria-invalid="control.state.value === false || undefined"
                    @click="control.guard"
                    @keydown="control.guardKeys"
                    @blur="control.blur"
                    @change="change"
                />
            </span>
            <span class="ui-radio-label"><slot /></span>
        </label>
        <span
            v-else
            class="ui-selection-ripple is-radio"
            v-ripple.center.circle="control.disabled.value || control.readonly.value ? false : props.ripple"
        >
            <input
                v-pointer-blur
                ref="element"
                v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())"
                type="radio"
                class="ui-radio-control"
                :value="effectiveTrueValue as any"
                :name="group?.name ?? attrs.name as string | undefined"
                :checked="checked"
                :disabled="control.disabled.value"
                :aria-readonly="control.readonly.value || undefined"
                :aria-invalid="control.state.value === false || undefined"
                @click="control.guard"
                @keydown="control.guardKeys"
                @blur="control.blur"
                @change="change"
            />
        </span>
    </UiControlFrame>
</template>
