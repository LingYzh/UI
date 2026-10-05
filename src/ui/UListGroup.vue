<script setup lang="ts">
import { computed, ref } from 'vue';
import { useList, type ListValue } from './list-completion';
import { useDefaults } from './defaults';
import { vPointerBlur } from './pointer-focus';
const rawProps = withDefaults(defineProps<{ value: ListValue; title?: string; disabled?: boolean; modelValue?: boolean }>(), { modelValue: undefined, disabled: false });
const props = useDefaults(rawProps, 'UListGroup');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const list = useList();
const local = ref(false);
const expanded = computed(() => props.modelValue ?? (list ? list.opened().includes(props.value) : local.value));
function toggle() {
    if (props.disabled) return;
    const next = !expanded.value;
    if (list) list.toggleOpen(props.value);
    else local.value = next;
    emit('update:modelValue', next);
}
</script>

<template>
    <div class="ui-list-group" role="group">
        <slot name="activator" :props="{ onClick: toggle, class: 'ui-list-group-header', 'aria-expanded': expanded, disabled: props.disabled }">
            <button v-pointer-blur type="button" class="ui-list-group-header" :disabled="props.disabled" :aria-expanded="expanded" @click="toggle">{{ props.title }}<span class="ui-list-group-chevron" aria-hidden="true">{{ expanded ? '⌄' : '›' }}</span></button>
        </slot>
        <div v-show="expanded" class="ui-list-group-items"><slot /></div>
    </div>
</template>
