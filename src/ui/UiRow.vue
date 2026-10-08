<script setup lang="ts">
import type { LayoutDensity } from './layout';
import { computed } from 'vue';
import { useDefaults } from './defaults';
import { useDisplay } from './display';
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
type AlignContent = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'stretch';
const rawProps = withDefaults(defineProps<{
    tag?: string;
    size?: number | string;
    gap?: number | string | (number | string)[];
    density?: LayoutDensity;
    dense?: boolean;
    noGutters?: boolean;
    align?: Align; alignSm?: Align; alignMd?: Align; alignLg?: Align; alignXl?: Align; alignXxl?: Align;
    justify?: Justify; justifySm?: Justify; justifyMd?: Justify; justifyLg?: Justify; justifyXl?: Justify; justifyXxl?: Justify;
    alignContent?: AlignContent; alignContentSm?: AlignContent; alignContentMd?: AlignContent; alignContentLg?: AlignContent; alignContentXl?: AlignContent; alignContentXxl?: AlignContent;
}>(), { tag: 'div', size: 12, density: 'default' });
const props = useDefaults(rawProps, 'URow');
const display = useDisplay();
function responsive(name: 'align' | 'justify' | 'alignContent') {
    let value: string | undefined = props[name];
    for (const breakpoint of ['sm', 'md', 'lg', 'xl', 'xxl'] as const) {
        const key = `${name}${breakpoint[0].toUpperCase()}${breakpoint.slice(1)}` as keyof typeof props;
        if (display.width.value >= display.thresholds[breakpoint] && props[key] !== undefined) value = String(props[key]);
    }
    return value === 'start' || value === 'end' ? `flex-${value}` : value;
}
const gapLength = (value: number | string | undefined) => typeof value === 'number' ? `${Math.max(0, value)}px` : value;
const styles = computed(() => ({
    '--ui-grid-size': Number.isFinite(Number(props.size)) && Number(props.size) > 0 ? Number(props.size) : 12,
    '--ui-grid-gap': gapLength(Array.isArray(props.gap) ? props.gap[0] : props.gap),
    rowGap: gapLength(Array.isArray(props.gap) ? props.gap[1] ?? props.gap[0] : props.gap),
    alignItems: responsive('align'), justifyContent: responsive('justify'), alignContent: responsive('alignContent')
}));
</script>

<template>
    <component :is="props.tag" class="ui-row" :data-density="props.dense ? 'compact' : props.density" :class="{ 'has-no-gutters': props.noGutters }" :style="styles"><slot /></component>
</template>
