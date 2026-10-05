<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch, type CSSProperties } from 'vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & FormControlProps & {
    invalid?: boolean; rows?: number; autoGrow?: boolean;
    maxRows?: number; noResize?: boolean; counter?: boolean | number;
}>(), { rows: 5, dense: undefined, ghost: undefined, rounded: undefined });
const attrs = useAttrs();
const model = defineModel<string>({ default: '' });
const element = ref<HTMLTextAreaElement>();
const control = useFormControl(props, model, element, attrs);
const counterId = `${useId()}-counter`;
const safeRows = computed(() => Number.isFinite(props.rows) ? Math.max(1, Math.floor(props.rows)) : 5);
const hasCounter = computed(() => props.counter !== undefined && props.counter !== false);
const limit = computed(() => {
    const value = typeof props.counter === 'number' ? props.counter : attrs.maxlength === undefined ? undefined : Number(attrs.maxlength);
    return value !== undefined && Number.isFinite(value) && value >= 0 ? value : undefined;
});
const invalid = computed(() => props.invalid || control.state.value === false || attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true');
let observer: ResizeObserver | undefined;
let lastWidth = 0;
let originalHeight = '';
let ownedHeight = false;

function resize() {
    const textarea = element.value;
    if (!textarea) return;
    if (!props.autoGrow) {
        if (ownedHeight) textarea.style.height = originalHeight;
        ownedHeight = false;
        return;
    }
    if (!ownedHeight) originalHeight = textarea.style.height;
    ownedHeight = true;
    const style = getComputedStyle(textarea);
    const line = parseFloat(style.lineHeight);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const minimum = safeRows.value * line + padding + border;
    const maximum = props.maxRows !== undefined && Number.isFinite(props.maxRows)
        ? Math.max(safeRows.value, Math.floor(props.maxRows)) * line + padding + border : Infinity;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.max(minimum, Math.min(textarea.scrollHeight + border, maximum))}px`;
}
watch(() => [model.value, props.autoGrow, props.rows, props.maxRows, control.dense.value], () => nextTick(resize));
onMounted(() => {
    resize();
    observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        if (width !== lastWidth) { lastWidth = width; resize(); }
    });
    if (element.value) observer.observe(element.value);
});
watch(element, (next, previous) => {
    if (previous) observer?.unobserve(previous);
    ownedHeight = false;
    if (next) { observer?.observe(next); nextTick(resize); }
});
onBeforeUnmount(() => observer?.disconnect());
defineExpose({ element, focus: () => element.value?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="attrs.required !== undefined && attrs.required !== false" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div v-if="hasCounter" class="ui-textarea-wrap" :class="{ 'is-inline': inline }" :style="control.framed.value ? undefined : controlSizeStyles(props)">
            <textarea ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="ui-textarea"
                :class="{ 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'has-no-resize': noResize || autoGrow }"
                :disabled="control.disabled.value" :readonly="control.readonly.value" :rows="safeRows" :aria-invalid="invalid || undefined" @blur="control.blur"
                :aria-describedby="[mergeControlAttrs(attrs, controlAttrs, control.id())['aria-describedby'], counterId].filter(Boolean).join(' ')" />
            <output :id="counterId" class="ui-textarea-counter" :class="{ 'is-over-limit': limit !== undefined && model.length > limit }"
                aria-live="off" :for="control.id()">{{ model.length }}<template v-if="limit !== undefined"> / {{ limit }}</template></output>
        </div>
        <textarea v-else ref="element" v-model="control.editable.value" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="ui-textarea"
            :class="{ 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'has-no-resize': noResize || autoGrow, 'is-inline': inline }"
            :style="[control.framed.value ? undefined : controlSizeStyles(props), attrs.style as CSSProperties]"
            :disabled="control.disabled.value" :readonly="control.readonly.value" :rows="safeRows" :aria-invalid="invalid || undefined" @blur="control.blur" />
    </UiControlFrame>
</template>
