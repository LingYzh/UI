<script setup lang="ts">
import { computed, inject, provide, useAttrs } from 'vue';
import { useDefaults } from './defaults';
import type { GroupValue } from './group-state';
import { stepperContextKey, type StepperContext } from './stepper-state';
import { allocateStepperValue } from './stepper-selection';
import UiCollapse from './UiCollapse.vue';
import UStepperItem from './UStepperItem.vue';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import UStepperVerticalActions from './UStepperVerticalActions.vue';
import type { RippleOptions } from './ripple';

defineOptions({ inheritAttrs: false });

type StepperRule = () => boolean | string;

const rawProps = withDefaults(defineProps<{
    value?: GroupValue;
    title?: string;
    subtitle?: string;
    icon?: IconValue;
    complete?: boolean;
    error?: boolean;
    editable?: boolean;
    disabled?: boolean;
    rules?: readonly StepperRule[];
    hideActions?: boolean;
    prevText?: string;
    nextText?: string;
    color?: string;
    ripple?: RippleOptions;
}>(), { rules: () => [], hideActions: false, color: 'primary', ripple: true, error: undefined, complete: undefined });
const props = useDefaults(rawProps, 'UStepperVerticalItem');
const emit = defineEmits<{
    'group:selected': [value: { value: boolean }];
    'click:prev': [event?: MouseEvent];
    'click:next': [event?: MouseEvent];
    'click:finish': [];
}>();
const attrs = useAttrs();
const stepper = inject(stepperContextKey, undefined);
const fallbackValue = allocateStepperValue(stepper?.values);
const value = computed(() => props.value ?? fallbackValue);
const active = computed(() => stepper?.isSelected(value.value) ?? false);
const ruleResults = computed(() => props.rules.map(rule => rule() === true));
const hasError = computed(() => props.error ?? ruleResults.value.some(result => !result));
const hasCompleted = computed(() => props.complete ?? (props.rules.length > 0 && ruleResults.value.every(Boolean)));
const rulesPassed = computed(() => !props.rules.length || ruleResults.value.every(Boolean));
const canEdit = computed(() => !props.disabled && !!props.editable);
const step = computed(() => {
    const index = stepper?.values.indexOf(value.value) ?? -1;
    return index >= 0 ? index + 1 : fallbackValue;
});
const nextDisabled = computed(() => props.disabled || hasError.value || !rulesPassed.value || !!stepper?.disabled);

function handlePrev(): void { stepper?.prev(); }

function handleNext(): void {
    if (nextDisabled.value) return;
    const current = stepper?.values.find(stepValue => stepper?.isSelected(stepValue));
    const isLast = stepper !== undefined && current !== undefined && stepper.values.indexOf(current) === stepper.values.length - 1;
    if (isLast) {
        emit('click:finish');
        stepper?.finish();
        return;
    }
    stepper?.next();
}

function forwardPrev(event?: MouseEvent): void { emit('click:prev', event); }
function forwardNext(event?: MouseEvent): void { emit('click:next', event); }
function forwardFinish(): void {
    emit('click:finish');
    stepper?.finish();
}

if (stepper) {
    const itemContext = Object.create(stepper) as StepperContext;
    Object.defineProperty(itemContext, 'next', { value: handleNext });
    provide(stepperContextKey, itemContext);
}

const slotScope = computed(() => ({
    active: active.value,
    complete: props.complete,
    canEdit: canEdit.value,
    hasError: hasError.value,
    hasCompleted: hasCompleted.value,
    title: props.title,
    subtitle: props.subtitle,
    step: step.value,
    value: value.value,
    next: handleNext,
    prev: handlePrev
}));
</script>

<template>
    <div class="u-stepper-vertical-item" v-bind="attrs">
        <UStepperItem
            :value="value"
            :title="props.title"
            :subtitle="props.subtitle"
            :icon="props.icon"
            :complete="props.complete"
            :error="props.error"
            :editable="props.editable"
            :disabled="props.disabled"
            :rules="props.rules"
            :ripple="props.ripple"
            @group:selected="emit('group:selected', $event)"
        >
            <template #default="scope">
                <slot name="header" v-bind="{ ...slotScope, ...scope }">
                    <span v-if="props.icon" class="u-stepper-icon"><slot name="icon" :icon="props.icon"><Icon :icon="props.icon" /></slot></span>
                    <span v-if="props.title" class="u-stepper-title"><slot name="title" :title="props.title">{{ props.title }}</slot></span>
                    <span v-if="props.subtitle" class="u-stepper-subtitle"><slot name="subtitle" :subtitle="props.subtitle">{{ props.subtitle }}</slot></span>
                </slot>
            </template>
        </UStepperItem>
        <UiCollapse :open="active" class="u-stepper-vertical-collapse">
            <div class="u-stepper-vertical-content">
                <slot v-bind="slotScope" />
                <slot v-if="!props.hideActions" name="actions" v-bind="slotScope">
                    <UStepperVerticalActions
                        :prev-text="props.prevText"
                        :next-text="props.nextText"
                        :color="props.color"
                        :disabled="nextDisabled ? 'next' : false"
                        @click:prev="forwardPrev"
                        @click:next="forwardNext"
                        @click:finish="forwardFinish"
                    >
                        <template v-if="$slots.prev" #prev="scope"><slot name="prev" v-bind="{ ...slotScope, ...scope }" /></template>
                        <template v-if="$slots.next" #next="scope"><slot name="next" v-bind="{ ...slotScope, ...scope }" /></template>
                    </UStepperVerticalActions>
                </slot>
            </div>
        </UiCollapse>
    </div>
</template>
