<script setup lang="ts">
import { computed } from 'vue';
import { gridBasis } from './layout';
import type { GridSize } from './layout';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{
    tag?: string; cols?: GridSize; sm?: GridSize; md?: GridSize; lg?: GridSize; xl?: GridSize; xxl?: GridSize;
    offset?: GridSize; offsetSm?: GridSize; offsetMd?: GridSize; offsetLg?: GridSize; offsetXl?: GridSize; offsetXxl?: GridSize;
    order?: number; orderSm?: number; orderMd?: number; orderLg?: number; orderXl?: number; orderXxl?: number;
    alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
}>(), { tag: 'div' });
const props = useDefaults(rawProps, 'UCol');
const styles = computed(() => {
    const result: Record<string, string | number | undefined> = { alignSelf: props.alignSelf };
    const widths = [props.cols, props.sm, props.md, props.lg, props.xl, props.xxl];
    const offsets = [props.offset, props.offsetSm, props.offsetMd, props.offsetLg, props.offsetXl, props.offsetXxl];
    const orders = [props.order, props.orderSm, props.orderMd, props.orderLg, props.orderXl, props.orderXxl];
    ['', '-sm', '-md', '-lg', '-xl', '-xxl'].forEach((suffix, index) => {
        const basis = gridBasis(widths[index]);
        result[`--ui-col-basis${suffix}`] = basis;
        result[`--ui-col-grow${suffix}`] = basis ? 0 : undefined;
        result[`--ui-col-offset${suffix}`] = gridBasis(offsets[index], true);
        result[`--ui-col-order${suffix}`] = orders[index];
    });
    return result;
});
</script>

<template>
    <component :is="props.tag" class="ui-col" :style="styles"><slot /></component>
</template>
