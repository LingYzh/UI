<script setup lang="ts">
import { computed, inject, ref, useAttrs } from 'vue';
import { vRipple, type RippleOptions } from './ripple';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';
import type { ValueComparator } from './selection';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
    value?: unknown;
    label?: string;
    name?: string;
    type?: 'checkbox' | 'radio' | 'switch';
    disabled?: boolean;
    readonly?: boolean;
    trueValue?: unknown;
    falseValue?: unknown;
    valueComparator?: ValueComparator;
} & { ripple?: RippleOptions }>(), {
    ripple: true,
    type: 'checkbox'
});

const model = defineModel<unknown>();
const group = inject(selectionGroupKey, undefined);
const input = ref<HTMLInputElement>();
const attrs = useAttrs();
const disabled = computed(() => !!props.disabled || !!group?.disabled.value);
const readonly = computed(() => !!props.readonly || !!group?.readonly.value);
const effectiveTrueValue = computed(() => props.trueValue !== undefined
    ? props.trueValue
    : props.value !== undefined ? props.value : true);
const comparator = computed(() => props.valueComparator ?? Object.is);
const name = computed(() => group?.name ?? props.name ?? attrs.name as string | undefined);
const checked = computed(() => {
    if (group) return group.selected(effectiveTrueValue.value);
    if (Array.isArray(model.value)) {
        const selectionValue = props.type === 'radio' ? effectiveTrueValue.value : props.value;
        return model.value.some((entry) => comparator.value(entry, selectionValue));
    }
    const selectedValue = props.type === 'radio'
        ? effectiveTrueValue.value
        : props.trueValue !== undefined ? props.trueValue : true;
    return comparator.value(model.value, selectedValue);
});

function change(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    if (disabled.value || readonly.value) {
        target.checked = checked.value;
        return;
    }
    if (group) {
        if (target.checked || props.type !== 'radio') group.toggle(effectiveTrueValue.value);
        return;
    }
    if (props.type === 'radio') {
        if (target.checked) model.value = effectiveTrueValue.value;
        return;
    }
    if (Array.isArray(model.value)) {
        const selectionValue = props.value;
        if (target.checked) {
            if (!model.value.some((entry) => comparator.value(entry, selectionValue))) {
                model.value = [...model.value, selectionValue];
            }
        }
        else model.value = model.value.filter((entry) => !comparator.value(entry, selectionValue));
        return;
    }
    model.value = target.checked
        ? props.trueValue !== undefined ? props.trueValue : true
        : props.falseValue !== undefined ? props.falseValue : false;
}

defineExpose({ element: input, focus: () => input.value?.focus() });
</script>

<template>
    <label class="u-selection-control" :class="[$attrs.class, { 'is-disabled': disabled }]" :style="$attrs.style as any">
        <span class="ui-selection-ripple" :class="`is-${type}`" v-ripple.center.circle="disabled || readonly ? false : props.ripple">
            <input
                v-pointer-blur
                ref="input"
                v-bind="{ ...$attrs, class: undefined, style: undefined }"
                :type="type === 'radio' ? 'radio' : 'checkbox'"
                :class="type === 'radio' ? 'ui-radio-control' : type === 'switch' ? 'ui-switch' : 'ui-checkbox-control'"
                :name="name"
                :value="effectiveTrueValue as any"
                :checked="checked"
                :disabled="disabled"
                :aria-readonly="readonly || undefined"
                @click="readonly && $event.preventDefault()"
                @keydown="readonly && $event.key !== 'Tab' && $event.preventDefault()"
                @change="change"
            />
        </span>
        <span v-if="label || $slots.default" class="u-selection-control-label"><slot>{{ label }}</slot></span>
    </label>
</template>
