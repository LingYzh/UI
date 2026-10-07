<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, useId, watch } from 'vue';
import { slideGroupKey } from './slide-group';
const props = defineProps<{ value?: unknown; disabled?: boolean; selectedClass?: string }>();
const emit = defineEmits<{ 'group:selected': [state: { value: boolean }] }>();
const group = inject(slideGroupKey, undefined);
const id = useId();
const instance = getCurrentInstance();
let element: HTMLElement | undefined;
let release: (() => void) | undefined;
const isSelected = computed(() => group?.isSelected(id) ?? false);
const selectedClass = computed(() => isSelected.value ? props.selectedClass ?? group?.selectedClass.value ?? '' : '');
function select(value = true) { if (!props.disabled && !group?.disabled.value) group?.select(id, value); }
function toggle() { select(!isSelected.value); }
watch(isSelected, value => emit('group:selected', { value }));
onMounted(() => {
    let node = instance?.subTree.el as Node | undefined;
    while (node && !(node instanceof HTMLElement)) node = node.nextSibling ?? undefined;
    if (node instanceof HTMLElement) element = node;
    element?.setAttribute('data-u-slide-item', id);
    release = group?.register({ id, value: () => props.value, disabled: () => !!props.disabled, element: () => element });
});
onBeforeUnmount(() => { release?.(); element?.removeAttribute('data-u-slide-item'); });
defineExpose({ isSelected, selectedClass, select, toggle });
</script>

<template>
    <slot :is-selected="isSelected" :selected-class="selectedClass" :select="select" :toggle="toggle" />
</template>
