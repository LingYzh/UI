<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeRating } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { length?: number; precision?: number; clearable?: boolean }>(), { length: 5, precision: 1, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'URating');
const model = defineModel<number>({ default: 0 });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const control = useFormControl(props, model, element, attrs);
const value = computed(() => normalizeRating(model.value, props.length, props.precision));
const items = computed(() => Array.from({ length: Math.max(0, Math.floor(props.length)) }, (_, index) => index + 1));
function update(next: number) {
    if (control.disabled.value || control.readonly.value) return;
    const normalized = normalizeRating(next, props.length, props.precision);
    control.editable.value = props.clearable && value.value === normalized ? 0 : normalized;
}
function keydown(event: KeyboardEvent) {
    if (control.disabled.value || control.readonly.value) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); update(value.value + props.precision); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); update(value.value - props.precision); }
    if (event.key === 'Home') { event.preventDefault(); update(0); }
    if (event.key === 'End') { event.preventDefault(); update(props.length); }
}
defineExpose({ element, value, items, control, update, keydown, focus: () => element.value?.querySelector<HTMLElement>('button')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-rating" :class="control.classes.value" :style="control.styles.value" role="slider" :aria-label="props.label || '评分'" :aria-valuemin="0" :aria-valuemax="props.length" :aria-valuenow="value" :aria-readonly="control.readonly.value || undefined" :aria-disabled="control.disabled.value || undefined" :aria-describedby="controlAttrs['aria-describedby']" @keydown="keydown">
            <button v-for="item in items" :key="item" v-pointer-blur type="button" class="ui-rating-star" :class="{ 'is-active': item <= value }" :aria-label="item + ' 星'" :disabled="control.disabled.value" :tabindex="item === Math.max(1, Math.ceil(value)) ? 0 : -1" @click="update(item)" @blur="control.blur"><span aria-hidden="true">★</span></button><output>{{ value }} / {{ props.length }}</output>
        </div>
    </UiControlFrame>
</template>
