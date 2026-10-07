<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, ref } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ value: unknown; label?: string; type?: 'checkbox' | 'radio' | 'switch'; disabled?: boolean; readonly?: boolean; trueValue?: unknown; falseValue?: unknown } & { ripple?: RippleOptions }>(), { ripple: true, type: 'checkbox' });
const model = defineModel<unknown>();
const group = inject(selectionGroupKey, undefined);
const input = ref<HTMLInputElement>();
const disabled = computed(() => !!props.disabled || !!group?.disabled.value);
const readonly = computed(() => !!props.readonly || !!group?.readonly.value);
const checked = computed(() => group ? group.selected(props.value) : Array.isArray(model.value) ? model.value.includes(props.value) : Object.is(model.value, props.trueValue ?? true));
function change(event: Event) {
    if (disabled.value || readonly.value) { event.preventDefault(); return; }
    if (group) { group.toggle(props.value); return; }
    if (Array.isArray(model.value)) model.value = checked.value ? model.value.filter((entry) => !Object.is(entry, props.value)) : [...model.value, props.value];
    else model.value = checked.value ? props.falseValue ?? false : props.trueValue ?? true;
}
defineExpose({ element: input, focus: () => input.value?.focus() });
</script>

<template>
    <label class="u-selection-control" :class="[$attrs.class, { 'is-disabled': disabled }]" :style="$attrs.style as any">
        <span class="ui-selection-ripple" :class="`is-${type}`" v-ripple.center.circle="disabled || readonly ? false : props.ripple"><input v-pointer-blur ref="input" v-bind="{ ...$attrs, class: undefined, style: undefined }" :type="type === 'radio' ? 'radio' : 'checkbox'" :class="type === 'radio' ? 'ui-radio-control' : type === 'switch' ? 'ui-switch' : 'ui-checkbox-control'" :name="group?.name" :value="value as any" :checked="checked" :disabled="disabled" :aria-readonly="readonly || undefined" @click="readonly && $event.preventDefault()" @keydown="readonly && $event.key !== 'Tab' && $event.preventDefault()" @change="change" /></span>
        <span v-if="label || $slots.default" class="u-selection-control-label"><slot>{{ label }}</slot></span>
    </label>
</template>
