<script setup lang="ts">
withDefaults(defineProps<{
    size?: number;
    /** 提供时作为 role=status 的名称；不提供时视为装饰并对辅助技术隐藏。 */
    label?: string;
}>(), { size: 16 });
</script>

<template>
    <span class="ui-spinner" :style="{ '--spinner-size': `${size}px` }" :role="label ? 'status' : undefined" :aria-label="label" :aria-hidden="label ? undefined : 'true'">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="ui-spinner-track" cx="12" cy="12" r="9" />
            <path class="ui-spinner-arc" d="M12 3a9 9 0 0 1 9 9" />
        </svg>
    </span>
</template>
