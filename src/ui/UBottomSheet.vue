<script setup lang="ts">
import UOverlay from './UOverlay.vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ modelValue?: boolean; persistent?: boolean; height?: string | number }>(), { modelValue: undefined, persistent: false });
const props = useDefaults(rawProps, 'UBottomSheet');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
    <UOverlay :model-value="props.modelValue" :persistent="props.persistent" location="bottom" @update:model-value="emit('update:modelValue', $event)"><template v-if="$slots.activator" #activator="scope"><slot name="activator" v-bind="scope" /></template><div class="ui-bottom-sheet" :style="{ maxHeight: typeof props.height === 'number' ? props.height + 'px' : props.height }"><slot /></div></UOverlay>
</template>
