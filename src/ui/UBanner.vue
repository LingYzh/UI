<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { vPointerBlur } from './pointer-focus';
import UTransition from './UTransition.vue';
import { computed, ref } from 'vue';
import UiIcon from '../components/Icon.vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ modelValue?: boolean; icon?: string; text?: string; color?: string; sticky?: boolean } & { ripple?: RippleOptions }>(), { ripple: true, modelValue: undefined, sticky: false });
const props = useDefaults(rawProps, 'UBanner');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const local = ref(true);
const shown = computed(() => props.modelValue ?? local.value);
function close() { local.value = false; emit('update:modelValue', false); }
</script>

<template>
    <UTransition variant="expand"><aside v-if="shown" class="ui-banner" :class="{ 'is-sticky': props.sticky }" :style="{ borderColor: props.color }" role="status"><span v-if="props.icon || $slots.icon" class="ui-banner-icon"><slot name="icon"><UiIcon v-if="props.icon" :icon="props.icon" /></slot></span><div class="ui-banner-content"><slot>{{ props.text }}</slot></div><div v-if="$slots.actions" class="ui-banner-actions"><slot name="actions" /></div><button v-ripple="props.ripple" v-pointer-blur type="button" class="ui-banner-close" aria-label="关闭提示" @click="close"><UiIcon name="mdi-close" :size="16" /></button></aside></UTransition>
</template>
