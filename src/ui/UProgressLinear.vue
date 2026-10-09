<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed } from 'vue';
import { useLocale } from './locale-context';
const rawProps = withDefaults(defineProps<{ modelValue?: number; max?: number; bufferValue?: number; indeterminate?: boolean; stream?: boolean; label?: string; disabled?: boolean; clickable?: boolean; reverse?: boolean }>(), { modelValue: 0, max: 100 });
const props = useDefaults(rawProps, 'UProgressLinear');
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
const locale = useLocale();
const safeMax = computed(() => Number.isFinite(props.max) && props.max > 0 ? props.max : 100);
const value = computed(() => Math.max(0, Math.min(safeMax.value, Number.isFinite(props.modelValue) ? props.modelValue : 0)));
const buffer = computed(() => Math.max(value.value, Math.min(safeMax.value, Number.isFinite(props.bufferValue) ? props.bufferValue! : safeMax.value)));
const ratio = computed(() => value.value / safeMax.value);
const bufferRatio = computed(() => buffer.value / safeMax.value);
const reversed = computed(() => !!props.reverse !== locale.isRtl.value);
function click(event: MouseEvent) {
    if (!props.clickable || props.disabled || props.indeterminate) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    emit('update:modelValue', Math.round((!!props.reverse !== locale.isRtl.value ? 1 - percent : percent) * safeMax.value));
}
</script>
<template>
    <div
        class="u-progress-linear"
        role="progressbar"
        :aria-label="props.label"
        :aria-valuemin="0"
        :aria-valuemax="safeMax"
        :aria-valuenow="props.indeterminate ? undefined : value"
        :class="{ 'is-indeterminate': props.indeterminate, 'is-stream': props.stream, 'is-disabled': props.disabled, 'is-reverse': reversed }"
        :style="{ '--u-progress-ratio': ratio }"
        @click="click"
    >
        <span class="u-progress-buffer" :style="{ width: bufferRatio * 100 + '%' }" />
        <span class="u-progress-value" :style="{ width: props.indeterminate ? '35%' : ratio * 100 + '%' }" />
        <span class="u-progress-content">
            <slot :value="value" :buffer="buffer" :ratio="ratio" />
        </span>
    </div>
</template>
