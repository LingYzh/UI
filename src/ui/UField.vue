<script setup lang="ts">
import { computed, ref, useId, type Ref } from 'vue';
import { useDefaults } from './defaults';
import UiField from './UiField.vue';
import UiThemeProvider from './UiThemeProvider.vue';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import type { FieldLayout } from './layout';
import { roundedStyles } from './appearance';

interface FieldScope {
    isActive: Ref<boolean>;
    isFocused: Ref<boolean>;
    controlRef: Ref<HTMLElement | undefined>;
    iconColor: Ref<string | undefined>;
    focus: () => void;
    blur: () => void;
}
defineSlots<{
    default?: (scope: FieldScope & { props: Record<string, unknown>; controlAttrs: Record<string, unknown> }) => any;
    label?: (scope: FieldScope & { label?: string; props: { for: string } }) => any;
    'prepend-inner'?: (scope: FieldScope) => any;
    'append-inner'?: (scope: FieldScope) => any;
    clear?: (scope: FieldScope & { props: Record<string, unknown> }) => any;
    loader?: (scope: { isActive: boolean; color?: string }) => any;
}>();

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    id?: string;
    labelId?: string;
    label?: string;
    details?: boolean;
    active?: boolean;
    dirty?: boolean;
    disabled?: boolean | null;
    error?: boolean | string;
    variant?: 'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain';
    clearable?: boolean;
    clearIcon?: IconValue;
    persistentClear?: boolean;
    prependInnerIcon?: IconValue;
    appendInnerIcon?: IconValue;
    centerAffix?: boolean;
    reverse?: boolean;
    singleLine?: boolean;
    flat?: boolean;
    glow?: boolean;
    color?: string;
    baseColor?: string;
    bgColor?: string;
    iconColor?: boolean | string;
    loading?: boolean | string;
    rounded?: boolean | number | string;
    theme?: string;
    /** 本库表单布局、说明与 ARIA 扩展。 */
    for?: string;
    description?: string;
    layout?: FieldLayout;
    required?: boolean;
    hideDetails?: boolean | 'auto';
}>(), { variant: 'outlined', clearIcon: '$clear', rounded: true, centerAffix: undefined });
const props = useDefaults(rawProps, 'UField');
const focused = defineModel<boolean>('focused', { default: false });
const emit = defineEmits<{
    'update:modelValue': [value: null];
    'click:clear': [event: MouseEvent];
    'click:prependInner': [event: MouseEvent];
    'click:appendInner': [event: MouseEvent];
}>();
const controlRef = ref<HTMLElement>();
const uid = useId();
const id = computed(() => props.id ?? props.for ?? `u-field-${uid}`);
const isActive = computed(() => !!props.active || !!props.dirty);
const isFocused = computed(() => focused.value);
const fieldColor = computed(() => props.error || props.disabled ? undefined : isActive.value && focused.value ? props.color : props.baseColor);
const fieldIconColor = computed(() => props.iconColor === true || (!props.iconColor && props.glow && focused.value) ? fieldColor.value : typeof props.iconColor === 'string' ? props.iconColor : undefined);
function color(value: string | undefined): string | undefined {
    return value && /^[a-z][\w-]*$/i.test(value) ? `var(--ui-theme-${value}, ${value})` : value;
}
const scope = computed(() => ({ isActive, isFocused, controlRef, iconColor: fieldIconColor, focus, blur }));
const styles = computed(() => ({
    '--u-field-color': color(fieldColor.value),
    background: color(props.bgColor),
    ...roundedStyles(props.rounded)
}));
function focus(): void { if (!props.disabled) focused.value = true; }
function blur(): void { focused.value = false; }
function onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) blur();
}
function clear(event: MouseEvent): void {
    if (props.disabled) return;
    emit('click:clear', event);
    emit('update:modelValue', null);
}
function inputProps(controlAttrs: Record<string, unknown>) {
    return { ...controlAttrs, id: id.value, class: 'u-field-input', 'aria-invalid': props.error || controlAttrs['aria-invalid'] ? true : undefined, 'aria-describedby': [controlAttrs['aria-describedby'], props.details && `${id.value}-messages`].filter(Boolean).join(' ') || undefined };
}
defineExpose({ controlRef, fieldIconColor, focus, blur });
</script>

<template>
    <UiThemeProvider :theme="props.theme">
        <UiField v-slot="{ controlAttrs }" :label="props.layout ? props.label : undefined" :for="id" :description="props.description" :error="typeof props.error === 'string' ? props.error : undefined" :layout="props.layout ?? 'vertical'" :required="props.required" :hide-details="props.hideDetails">
            <div ref="controlRef" v-bind="$attrs" class="u-field-surface" :class="[`is-${props.variant}`, { 'is-active': isActive, 'is-focused': focused, 'is-dirty': props.dirty, 'is-disabled': props.disabled, 'is-error': props.error, 'is-reverse': props.reverse, 'is-single-line': props.singleLine, 'is-flat': props.flat, 'is-center-affix': props.centerAffix ?? !['plain', 'underlined'].includes(props.variant) }]" :style="styles"
                @focusin="focus" @focusout="onFocusOut">
                <div v-if="props.loading || $slots.loader" class="u-field-loader">
                    <slot name="loader" :is-active="!!props.loading" :color="props.error ? 'error' : typeof props.loading === 'string' ? props.loading : props.color">
                        <span v-if="props.loading" class="u-field-loading" />
                    </slot>
                </div>
                <span v-if="props.prependInnerIcon || $slots['prepend-inner']" class="u-field-affix" :style="{ color: color(fieldIconColor) }">
                    <slot name="prepend-inner" v-bind="scope">
                        <button type="button" class="u-field-icon" :disabled="!!props.disabled" aria-label="前置操作"
                            @click="emit('click:prependInner', $event)">
                            <Icon :icon="props.prependInnerIcon" :size="20" />
                        </button>
                    </slot>
                </span>
                <div class="u-field-control">
                    <label v-if="(props.label || $slots.label) && !props.layout" :id="props.labelId" :for="id" class="u-field-label" :class="{ 'is-floating': !props.singleLine && (isActive || focused) }">
                        <slot name="label" v-bind="scope" :label="props.label" :props="{ for: id }">{{ props.label }}</slot>
                    </label>
                    <slot v-bind="scope" :props="inputProps(controlAttrs)" :control-attrs="inputProps(controlAttrs)">
                        <div v-bind="inputProps(controlAttrs)" />
                    </slot>
                </div>
                <span v-if="(props.clearable || $slots.clear) && !props.disabled" v-show="props.dirty || props.persistentClear" class="u-field-affix">
                    <slot name="clear" v-bind="scope" :props="{ onFocus: focus, onBlur: blur, onClick: clear, tabindex: -1 }">
                        <button type="button" class="u-field-icon" aria-label="清除" tabindex="-1"
                            @mousedown.prevent @click="clear">
                            <Icon :icon="props.clearIcon" :size="18" />
                        </button>
                    </slot>
                </span>
                <span v-if="props.appendInnerIcon || $slots['append-inner']" class="u-field-affix" :style="{ color: color(fieldIconColor) }">
                    <slot name="append-inner" v-bind="scope">
                        <button type="button" class="u-field-icon" :disabled="!!props.disabled" aria-label="后置操作"
                            @click="emit('click:appendInner', $event)">
                            <Icon :icon="props.appendInnerIcon" :size="20" />
                        </button>
                    </slot>
                </span>
            </div>
        </UiField>
    </UiThemeProvider>
</template>
