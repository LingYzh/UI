<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, onBeforeUnmount, provide, ref, useId, watch } from 'vue';
import Icon from '../components/Icon.vue';
import UiCollapse from './UiCollapse.vue';
import { listParentKey, useList, type ListValue } from './list-completion';
import { useDefaults } from './defaults';
import { vPointerBlur } from './pointer-focus';
const rawProps = withDefaults(defineProps<{ value: ListValue; title?: string; disabled?: boolean; modelValue?: boolean } & { ripple?: RippleOptions }>(), { ripple: true, modelValue: undefined, disabled: false });
const props = useDefaults(rawProps, 'UListGroup');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const list = useList();
const parent = inject(listParentKey, ref(undefined));
provide(listParentKey, computed(() => props.value));
let release: (() => void) | undefined;
watch([() => props.value, parent], () => { release?.(); release = list?.register?.(props.value, parent.value, true, () => props.disabled); }, { immediate: true });
onBeforeUnmount(() => release?.());
const local = ref(false);
const id = useId();
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
        <slot name="activator" :props="{ onClick: toggle, ripple: props.ripple, class: 'ui-list-group-header', id: `${id}-title`, 'aria-controls': `${id}-items`, 'aria-expanded': expanded, disabled: props.disabled }">
            <button v-ripple="props.ripple" :id="`${id}-title`" v-pointer-blur type="button" class="ui-list-group-header" :disabled="props.disabled" :aria-expanded="expanded" :aria-controls="`${id}-items`" @click="toggle">{{ props.title }}<Icon name="mdi-chevron-down" :size="18" class="ui-disclosure-icon is-down" :class="{ 'is-open': expanded }" /></button>
        </slot>
        <UiCollapse :id="`${id}-items`" :open="expanded" role="group" :aria-labelledby="`${id}-title`"><div class="ui-list-group-items"><slot /></div></UiCollapse>
    </div>
</template>
