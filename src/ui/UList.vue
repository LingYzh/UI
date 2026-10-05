<script setup lang="ts">
import UListItem from './UListItem.vue';
import { computed, ref } from 'vue';
import { getItemField, makeListContext, provideList, toggleListValue, type ListValue } from './list-completion';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{
    modelValue?: ListValue | ListValue[];
    activated?: ListValue | ListValue[];
    opened?: ListValue[];
    multiple?: boolean;
    mandatory?: boolean;
    selectable?: boolean;
    activatable?: boolean;
    nav?: boolean;
    items?: unknown[];
    itemTitle?: string | ((item: unknown) => unknown);
    itemValue?: string | ((item: unknown) => unknown);
    itemProps?: string | ((item: unknown) => unknown);
}>(), { modelValue: undefined, activated: undefined, multiple: false, mandatory: false, selectable: true, activatable: false, nav: false, itemTitle: 'title', itemValue: 'value', itemProps: 'props' });
const props = useDefaults(rawProps, 'UList');
const emit = defineEmits<{ 'update:modelValue': [value: ListValue | ListValue[] | undefined]; 'update:activated': [value: ListValue | ListValue[] | undefined]; 'update:opened': [value: ListValue[]] }>();
const element = ref<HTMLElement>();
const localSelected = ref<ListValue[]>([]);
const localActivated = ref<ListValue[]>([]);
const localOpened = ref<ListValue[]>([]);
const array = (value: ListValue | ListValue[] | undefined) => value === undefined ? [] : Array.isArray(value) ? value : [value];
const selected = computed(() => props.modelValue === undefined ? localSelected.value : array(props.modelValue));
const activated = computed(() => props.activated === undefined ? localActivated.value : array(props.activated));
const opened = computed(() => props.opened ?? localOpened.value);
const normalizedItems = computed(() => (props.items ?? []).map((item, index) => {
    const value = getItemField(item, props.itemValue!, item && typeof item === 'object' ? index : item ?? index) as ListValue;
    const title = String(getItemField(item, props.itemTitle!, item ?? '') ?? '');
    const itemProperties = getItemField(item, props.itemProps!, {});
    return { raw: item, value, title, props: itemProperties && typeof itemProperties === 'object' ? itemProperties as Record<string, unknown> : {} };
}));
function change(value: ListValue, source: 'select' | 'activate') {
    const current = source === 'select' ? selected.value : activated.value;
    const next = toggleListValue(current, value, props.multiple, props.mandatory);
    if (next === current) return;
    if (source === 'select') {
        localSelected.value = next;
        emit('update:modelValue', props.multiple ? next : next[0]);
    } else {
        localActivated.value = next;
        emit('update:activated', props.multiple ? next : next[0]);
    }
}
function toggleOpen(value: ListValue) {
    const next = opened.value.includes(value) ? opened.value.filter((entry) => entry !== value) : [...opened.value, value];
    localOpened.value = next;
    emit('update:opened', next);
}
const context = makeListContext({ root: () => element.value, nav: () => props.nav, selected: () => selected.value, activated: () => activated.value, opened: () => opened.value,
    select: (value) => { if (props.selectable) change(value, 'select'); },
    activate: (value) => { if (props.activatable) change(value, 'activate'); }, toggleOpen });
provideList(context);
</script>

<template>
    <div ref="element" class="ui-list" :role="props.nav ? 'navigation' : 'listbox'" :aria-multiselectable="props.multiple || undefined"><slot :selected="selected" :activated="activated" :opened="opened"><UListItem v-for="(item, index) in normalizedItems" :key="index" :value="item.value" :title="item.title" v-bind="item.props"><template v-if="$slots.item" #title><slot name="item" :item="item.raw" :index="index" /></template></UListItem></slot></div>
</template>
