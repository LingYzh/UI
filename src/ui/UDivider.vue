<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';
import { useDefaults } from './defaults';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    vertical?: boolean; inset?: boolean; thickness?: number | string; color?: string;
    length?: number | string; opacity?: number | string; variant?: 'solid' | 'dotted' | 'dashed' | 'double';
    gradient?: boolean; contentOffset?: number | string | readonly [number | string, number | string];
}>(), { vertical: false, inset: false, thickness: 1, variant: 'solid' });
const props = useDefaults(rawProps, 'UDivider');
const attrs = useAttrs();
const slots = useSlots();
const unit = (value: number | string | undefined) => typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) ? `${value}px` : value;
const lineStyle = computed(() => ({
    borderColor: props.color, borderStyle: props.variant, opacity: props.opacity,
    [props.vertical ? 'borderInlineStartWidth' : 'borderTopWidth']: unit(props.thickness),
    [props.vertical ? 'height' : 'width']: unit(props.length)
}));
const contentStyle = computed(() => {
    const margin = Array.isArray(props.contentOffset) ? props.contentOffset[0] : props.contentOffset;
    const shift = Array.isArray(props.contentOffset) ? props.contentOffset[1] : 0;
    return { [props.vertical ? 'marginBlock' : 'marginInline']: unit(margin as number | string | undefined), transform: shift ? `translate${props.vertical ? 'X' : 'Y'}(${unit(shift)})` : undefined };
});
</script>

<template>
    <div v-if="slots.default" class="ui-divider-wrapper" :class="{ 'is-vertical': props.vertical, 'is-inset': props.inset, 'is-gradient': props.gradient }" v-bind="attrs">
        <hr class="ui-divider" :class="{ 'is-vertical': props.vertical }" :style="lineStyle" aria-hidden="true" />
        <div class="ui-divider-content" :style="contentStyle"><slot /></div>
        <hr class="ui-divider" :class="{ 'is-vertical': props.vertical }" :style="lineStyle" aria-hidden="true" />
    </div>
    <hr v-else class="ui-divider" :class="{ 'is-vertical': props.vertical, 'is-inset': props.inset, 'is-gradient': props.gradient }" :style="lineStyle" v-bind="attrs" :aria-orientation="attrs.role ? undefined : props.vertical ? 'vertical' : 'horizontal'" />
</template>
