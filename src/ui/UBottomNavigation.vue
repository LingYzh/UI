<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { useLayoutItem } from './layout-completion';
import { bottomNavigationKey } from './bottom-navigation';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ modelValue?: string | number; height?: number; fixed?: boolean; absolute?: boolean }>(), { height: 56, fixed: false, absolute: false });
const props = useDefaults(rawProps, 'UBottomNavigation');
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>();
const local = ref<string | number>();
const value = computed(() => props.modelValue ?? local.value);
const { offset } = useLayoutItem(computed(() => 'bottom'), computed(() => props.height), computed(() => props.fixed && !props.absolute), computed(() => 5));
function select(next: string | number) { local.value = next; emit('update:modelValue', next); }
provide(bottomNavigationKey, { value: () => value.value, select });
</script>

<template>
    <nav class="ui-bottom-navigation" :class="{ 'is-fixed': props.fixed && !props.absolute, 'is-absolute': props.absolute }" :style="{ minHeight: props.height + 'px', bottom: offset + 'px' }" aria-label="底部导航"><slot :selected="value" :select="select" /></nav>
</template>
