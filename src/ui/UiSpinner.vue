<script setup lang="ts">
import UProgressCircular from './UProgressCircular.vue';

withDefaults(defineProps<{
    size?: number;
    /** 提供时作为 role=status 的名称；不提供时视为装饰并对辅助技术隐藏。 */
    label?: string;
}>(), { size: 16 });
</script>

<template>
    <span
        class="ui-spinner"
        :style="{ '--spinner-size': size + 'px' }"
        :role="label ? 'status' : undefined"
        :aria-label="label"
        :aria-hidden="label ? undefined : 'true'"
    >
        <UProgressCircular
            class="ui-spinner-circular"
            :indeterminate="true"
            :size="24"
            :width="2.5"
            aria-hidden="true"
            :style="{ width: '100%', height: '100%' }"
        />
    </span>
</template>
