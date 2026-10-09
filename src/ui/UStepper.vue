<script setup lang="ts">
import { computed, provide, reactive } from 'vue';
import { useDefaults } from './defaults';
import { createGroup, windowKey, type GroupValue } from './group-state';
import { stepperContextKey, type StepperContext } from './stepper-state';
import { normalizeStepperItems, type StepperItemRecord } from './stepper-selection';
import UStepperActions from './UStepperActions.vue';
import UStepperItem from './UStepperItem.vue';
import UStepperWindow from './UStepperWindow.vue';
import UStepperWindowItem from './UStepperWindowItem.vue';

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
    mandatory: undefined,
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
const props = useDefaults(rawProps, 'UStepper');
const emit = defineEmits<{ 'click:prev': [event?: MouseEvent]; 'click:next': [event?: MouseEvent]; 'click:finish': [] }>();
const model = defineModel<GroupValue | GroupValue[] | null>({ default: null });
const group = createGroup(model, {
    mandatory: () => props.mandatory ?? 'force',
    multiple: () => props.multiple,
    disabled: () => props.disabled
});
const blocked = reactive(new Set<GroupValue>());

function selectedValues(): GroupValue[] {
    return Array.isArray(model.value) ? model.value : model.value == null ? [] : [model.value];
}

function canSelect(value: GroupValue): boolean {
    if (props.disabled || blocked.has(value) || !group.values.includes(value)) return false;
    return true;
}

function canNavigate(value: GroupValue): boolean {
    if (!canSelect(value)) return false;
    if (props.linear) {
        const selected = selectedValues();
        const current = group.values.findIndex(item => selected.includes(item));
        const target = group.values.indexOf(value);
        if (target > current + 1) return false;
    }
    return true;
}

function go(value: GroupValue): void {
    if (!canSelect(value)) return;
    const selected = selectedValues();
    if (props.multiple) {
        if (selected.includes(value)) {
            if (group.mandatory && selected.length <= 1) return;
            model.value = selected.filter(item => item !== value);
            return;
        }
        if (!canNavigate(value)) return;
        if (props.max !== undefined && selected.length >= props.max) return;
        model.value = [...selected, value];
        return;
    }
    if (!canNavigate(value)) return;
    model.value = value;
}

function selectCurrent(value: GroupValue): void {
    if (!canNavigate(value)) return;
    model.value = props.multiple ? [value] : value;
}

function move(delta: number): void {
    const selected = selectedValues();
    const current = group.values.findIndex(value => selected.includes(value));
    for (let index = current + delta; index >= 0 && index < group.values.length; index += delta) {
        if (!blocked.has(group.values[index])) { selectCurrent(group.values[index]); return; }
    }
}

function finish(): void { emit('click:finish'); }

const context: StepperContext = Object.assign(group, { blocked, go, finish, next: () => move(1), prev: () => move(-1) });
provide(stepperContextKey, context);
provide(windowKey, context);

const items = computed(() => normalizeStepperItems(props.items, {
    itemTitle: props.itemTitle,
    itemValue: props.itemValue,
    itemProps: props.itemProps
}));
const actionsDisabled = computed(() => {
    if (props.disabled) return true;

    const selected = selectedValues();
    const activeIndex = items.value.findIndex(item => selected.includes(item.value));
    if (items.value.length === 1) return true;
    if (activeIndex === 0) return 'prev';
    if (activeIndex === items.value.length - 1) return 'next';
    return false;
});
const actionScope = computed(() => ({
    items: items.value,
    modelValue: model.value,
    next: context.next,
    prev: context.prev,
    go
}));

function itemScope(item: StepperItemRecord) {
    return { raw: item.raw, title: item.title, value: item.value, props: item.props };
}

function headerSlotScope(item: StepperItemRecord, itemState: Record<string, unknown>) {
    return { ...itemScope(item), ...itemState };
}

function headerProps(item: StepperItemRecord): Record<string, unknown> {
    return { ...item.props, value: item.value, title: item.title, editable: item.props.editable ?? props.editable };
}

function forwardPrev(event?: MouseEvent): void { emit('click:prev', event); }
function forwardNext(event?: MouseEvent): void { emit('click:next', event); }

defineExpose({ next: context.next, prev: context.prev, go });
</script>

<template>
    <div class="u-stepper" :class="{ 'is-disabled': props.disabled }">
        <template v-if="items.length">
            <UStepperItem
                v-for="item in items"
                :key="item.value"
                v-bind="headerProps(item)"
            >
                <template #default="itemState">
                    <slot :name="`header-item.${item.value}`" v-bind="headerSlotScope(item, itemState)">
                        <slot name="header" v-bind="headerSlotScope(item, itemState)">
                            <span v-if="item.props.icon !== undefined || $slots.icon" class="u-stepper-icon">
                                <slot name="icon" :icon="item.props.icon" v-bind="headerSlotScope(item, itemState)">{{ item.props.icon }}</slot>
                            </span>
                            <span v-if="item.title || $slots.title" class="u-stepper-title">
                                <slot name="title" v-bind="headerSlotScope(item, itemState)">{{ item.title }}</slot>
                            </span>
                            <span v-if="item.props.subtitle !== undefined || $slots.subtitle" class="u-stepper-subtitle">
                                <slot name="subtitle" v-bind="headerSlotScope(item, itemState)">{{ item.props.subtitle }}</slot>
                            </span>
                        </slot>
                    </slot>
                </template>
            </UStepperItem>
            <UStepperWindow>
                <UStepperWindowItem
                    v-for="item in items"
                    :key="item.value"
                    :value="item.value"
                    :disabled="item.props.disabled === true"
                    :data-stepper-value="item.value"
                >
                    <slot :name="`item.${item.value}`" v-bind="{ ...itemScope(item), active: group.isSelected(item.value) }">
                        <slot name="item" v-bind="{ ...itemScope(item), active: group.isSelected(item.value) }" />
                    </slot>
                </UStepperWindowItem>
            </UStepperWindow>
            <template v-if="!props.hideActions">
                <slot name="actions" v-bind="actionScope">
                    <UStepperActions
                        :prev-text="props.prevText"
                        :next-text="props.nextText"
                        :color="props.color"
                        :disabled="actionsDisabled"
                        @click:prev="forwardPrev"
                        @click:next="forwardNext"
                        @click:finish="finish"
                    >
                        <template v-if="$slots.prev" #prev="scope"><slot name="prev" v-bind="{ ...actionScope, ...scope }" /></template>
                        <template v-if="$slots.next" #next="scope"><slot name="next" v-bind="{ ...actionScope, ...scope }" /></template>
                    </UStepperActions>
                </slot>
            </template>
        </template>
        <slot :next="context.next" :prev="context.prev" :go="go" :model-value="model" />
    </div>
</template>
