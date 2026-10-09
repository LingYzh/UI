<script setup lang="ts">
import { computed } from 'vue';
import { useDefaults } from './defaults';
import UStepper from './UStepper.vue';
import UStepperVerticalItem from './UStepperVerticalItem.vue';
import type { GroupValue } from './group-state';
import { normalizeStepperItems, type StepperItemRecord } from './stepper-selection';

const rawProps = withDefaults(defineProps<{
    disabled?: boolean;
    mandatory?: boolean | 'force';
    linear?: boolean;
    editable?: boolean;
    multiple?: boolean;
    max?: number;
    items?: readonly unknown[];
    itemTitle?: string | ((item: unknown) => unknown);
    itemValue?: string | ((item: unknown) => unknown);
    itemProps?: string | boolean | ((item: unknown) => unknown);
    hideActions?: boolean;
    prevText?: string;
    nextText?: string;
    color?: string;
}>(), {
    editable: false,
    items: () => [],
    itemTitle: 'title',
    itemValue: 'value',
    itemProps: 'props',
    hideActions: false,
    prevText: '$vuetify.stepper.prev',
    nextText: '$vuetify.stepper.next',
    color: 'primary'
});
const props = useDefaults(rawProps, 'UStepperVertical');
const emit = defineEmits<{ 'click:finish': [] }>();
const model = defineModel<GroupValue | GroupValue[] | null>({ default: null });

const items = computed(() => normalizeStepperItems(props.items, {
    itemTitle: props.itemTitle,
    itemValue: props.itemValue,
    itemProps: props.itemProps
}));
const stepperProps = computed(() => ({
    disabled: props.disabled,
    mandatory: props.mandatory,
    linear: props.linear,
    editable: props.editable,
    multiple: props.multiple,
    max: props.max,
    prevText: props.prevText,
    nextText: props.nextText,
    color: props.color
}));

function itemScope(item: StepperItemRecord) {
    return { raw: item.raw, title: item.title, value: item.value, props: item.props };
}

function verticalItemProps(item: StepperItemRecord): Record<string, unknown> {
    return {
        ...item.props,
        value: item.value,
        title: item.title,
        hideActions: props.hideActions,
        editable: item.props.editable ?? props.editable,
        prevText: item.props.prevText ?? props.prevText,
        nextText: item.props.nextText ?? props.nextText,
        color: item.props.color ?? props.color
    };
}

function forwardFinish(): void { emit('click:finish'); }
</script>

<template>
    <UStepper v-model="model" v-bind="stepperProps" class="u-stepper-vertical" @click:finish="forwardFinish">
        <template #default="scope">
            <UStepperVerticalItem
                v-for="item in items"
                :key="item.value"
                v-bind="verticalItemProps(item)"
            >
                <template #header="verticalScope">
                    <slot :name="`header-item.${item.value}`" v-bind="{ ...itemScope(item), ...verticalScope }">
                        <slot name="header" v-bind="{ ...itemScope(item), ...verticalScope }">
                            <span v-if="typeof item.props.icon === 'string'" class="u-stepper-icon">
                                <slot name="icon" :icon="item.props.icon" v-bind="itemScope(item)">{{ item.props.icon }}</slot>
                            </span>
                            <span v-if="item.title" class="u-stepper-title">
                                <slot name="title" v-bind="itemScope(item)">{{ item.title }}</slot>
                            </span>
                            <span v-if="typeof item.props.subtitle === 'string'" class="u-stepper-subtitle">
                                <slot name="subtitle" :subtitle="item.props.subtitle" v-bind="itemScope(item)">{{ item.props.subtitle }}</slot>
                            </span>
                        </slot>
                    </slot>
                </template>
                <template #default="verticalScope">
                    <slot :name="`item.${item.value}`" v-bind="{ ...itemScope(item), ...verticalScope }">
                        <slot name="item" v-bind="{ ...itemScope(item), ...verticalScope }" />
                    </slot>
                </template>
                <template v-if="$slots.actions" #actions="verticalScope">
                    <slot name="actions" v-bind="{ ...itemScope(item), ...verticalScope }" />
                </template>
                <template v-if="$slots.prev" #prev="verticalScope">
                    <slot name="prev" v-bind="{ ...itemScope(item), ...verticalScope }" />
                </template>
                <template v-if="$slots.next" #next="verticalScope">
                    <slot name="next" v-bind="{ ...itemScope(item), ...verticalScope }" />
                </template>
            </UStepperVerticalItem>
            <slot v-bind="scope" />
        </template>
    </UStepper>
</template>
