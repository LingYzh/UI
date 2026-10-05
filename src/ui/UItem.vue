<script setup lang="ts">
import { computed, inject } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { selectionGroupKey } from './selection-context';
defineOptions({ inheritAttrs: false });
const props = defineProps<{ value: unknown; disabled?: boolean }>();
const group = inject(selectionGroupKey, undefined);
const selected = computed(() => group?.selected(props.value) ?? false);
const disabled = computed(() => !!props.disabled || !!group?.disabled.value);
function activate() { if (!disabled.value && !group?.readonly.value) group?.toggle(props.value); }
</script>

<template>
    <button v-pointer-blur type="button" class="u-item" :class="[$attrs.class, { 'is-selected': selected }]" :style="$attrs.style as any" :disabled="disabled" :aria-pressed="selected" @click="activate"><slot :selected="selected" :toggle="activate" /></button>
</template>
