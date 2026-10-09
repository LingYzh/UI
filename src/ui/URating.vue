<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, nextTick, onMounted, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { normalizeRating } from './specialized-inputs';
import { useLocale } from './locale-context';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { length?: number; precision?: number; clearable?: boolean; halfIncrements?: boolean; hover?: boolean; emptyIcon?: IconValue; fullIcon?: IconValue; itemLabels?: readonly string[]; itemLabelPosition?: 'top' | 'bottom'; itemAriaLabel?: string; activeColor?: string } & { ripple?: RippleOptions }>(), { ripple: true, length: 5, precision: 1, itemLabelPosition: 'top', dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'URating');
defineEmits<{ 'update:focused': [value: boolean] }>();
const model = defineModel<number | null>({ default: 0 });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const control = useFormControl(props, model, element, attrs);
const locale = useLocale();
const hovered = ref<number | null>(null);
const ratingLength = computed(() => Number.isFinite(props.length) ? Math.max(0, props.length) : 0);
const ratingStep = computed(() => props.halfIncrements ? .5 : Number.isFinite(props.precision) && props.precision > 0 ? props.precision : 1);
const value = computed(() => normalizeRating(model.value ?? 0, ratingLength.value, ratingStep.value));
const items = computed(() => Array.from({ length: Math.floor(ratingLength.value) }, (_, index) => index + 1));
const displayed = computed(() => props.hover && hovered.value !== null ? hovered.value : value.value);
function pointerValue(event: MouseEvent, item: number) {
    if (!props.halfIncrements) return item;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const part = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return normalizeRating(item - 1 + Math.ceil((locale.isRtl.value ? 1 - part : part) / ratingStep.value) * ratingStep.value, ratingLength.value, ratingStep.value);
}
function ratingClick(event: MouseEvent, item: number) { update(event.detail === 0 ? item : pointerValue(event, item)); }
function itemLabel(item: number) { return props.itemAriaLabel ? locale.t(props.itemAriaLabel, { 0: item, 1: props.length }) : `${item} / ${props.length}`; }
function fraction(item: number) { return Math.max(0, Math.min(1, displayed.value - item + 1)); }
function syncTabStop() {
    const buttons = element.value?.querySelectorAll<HTMLButtonElement>('button.ui-rating-star');
    if (!buttons?.length) return;
    const activeIndex = Math.max(0, Math.min(buttons.length - 1, Math.ceil(value.value) - 1));
    buttons.forEach((button, index) => { button.tabIndex = index === activeIndex ? 0 : -1; });
}
watch([value, items], () => { void nextTick(syncTabStop); }, { flush: 'post' });
onMounted(syncTabStop);
function update(next: number) {
    if (control.disabled.value || control.readonly.value) return;
    const normalized = normalizeRating(next, ratingLength.value, ratingStep.value);
    control.editable.value = props.clearable && value.value === normalized ? 0 : normalized;
}
function keydown(event: KeyboardEvent) {
    if (control.disabled.value || control.readonly.value || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); update(value.value + (event.key === 'ArrowRight' && locale.isRtl.value ? -1 : 1) * ratingStep.value); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); update(value.value + (event.key === 'ArrowLeft' && locale.isRtl.value ? 1 : -1) * ratingStep.value); }
    if (event.key === 'Home') { event.preventDefault(); update(0); }
    if (event.key === 'End') { event.preventDefault(); update(ratingLength.value); }
}
defineExpose({ element, value, items, control, update, keydown, focus: () => element.value?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-rating" :class="control.classes.value" :style="control.styles.value" role="slider" :aria-label="props.label || '评分'" :aria-valuemin="0" :aria-valuemax="props.length" :aria-valuenow="value" :aria-readonly="control.readonly.value || undefined" :aria-disabled="control.disabled.value || undefined" :aria-describedby="controlAttrs['aria-describedby']" @keydown="keydown" @mouseleave="hovered = null">
            <button v-ripple="control.disabled.value || control.readonly.value ? false : props.ripple" v-for="item in items" :key="item" v-pointer-blur type="button" class="ui-rating-star" :class="{ 'is-active': fraction(item) === 1, 'has-label': !!props.itemLabels?.[item - 1] }" :data-label-position="props.itemLabelPosition" :aria-label="itemLabel(item)" :disabled="control.disabled.value" :tabindex="item === Math.min(items.length, Math.max(1, Math.ceil(value))) ? 0 : -1" @click="ratingClick($event, item)" @mousemove="props.hover && !control.disabled.value && !control.readonly.value && (hovered = pointerValue($event, item))" @focus="control.focus" @blur="control.blur"><span v-if="props.itemLabels?.[item - 1]" class="ui-rating-item-label"><slot name="item-label" :value="item" :label="props.itemLabels[item - 1]">{{ props.itemLabels[item - 1] }}</slot></span><slot name="item" :value="item" :is-filled="fraction(item) === 1" :is-half-filled="fraction(item) > 0 && fraction(item) < 1" :props="{ onClick: (event: MouseEvent) => ratingClick(event, item), disabled: control.disabled.value }"><span class="ui-rating-symbol" aria-hidden="true"><Icon v-if="props.emptyIcon" :icon="props.emptyIcon" /><span v-else>★</span><span class="ui-rating-filled" :style="{ width: fraction(item) * 100 + '%', color: props.activeColor }"><Icon v-if="props.fullIcon" :icon="props.fullIcon" /><span v-else>★</span></span></span></slot></button><output>{{ value }} / {{ props.length }}</output>
        </div>
    </UiControlFrame>
</template>
