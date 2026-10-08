<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import UiThemeProvider from './UiThemeProvider.vue';
import UDefaultsProvider from './UDefaultsProvider.vue';
import UOptionPicker from './UOptionPicker.vue';
import { useDefaults } from './defaults';
import type { DataItem } from './data-pipeline';
import type { RippleOptions } from './ripple';
import { borderStyles, roundedStyles } from './appearance';

type PickerItem = string | number | DataItem;
type PickerValue = PickerItem | boolean | null | undefined;
const rawProps = withDefaults(defineProps<{
    title?: string;
    hideTitle?: boolean;
    hideHeader?: boolean;
    landscape?: boolean;
    divided?: boolean;
    color?: string;
    bgColor?: string;
    theme?: string;
    tag?: string;
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    height?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    rounded?: boolean | number | string;
    border?: boolean | string | number;
    elevation?: number | string;
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    location?: string;
    /** 本库选项列表扩展；只有传入 items 时启用。 */
    items?: readonly PickerItem[];
    itemTitle?: string;
    itemValue?: string;
    multiple?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    returnObject?: boolean;
    ripple?: RippleOptions;
}>(), { tag: 'div', rounded: true, elevation: 0 });
const props = useDefaults(rawProps, 'UPicker');
const model = defineModel<PickerValue | PickerValue[]>({ default: null });
function unit(value: string | number | undefined): string | undefined {
    return typeof value === 'number' || value !== undefined && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}
function color(value: string | undefined): string | undefined { return value && /^[a-z][\w-]*$/i.test(value) ? `var(--ui-theme-${value}, ${value})` : value; }
const styles = computed<CSSProperties>(() => ({
    background: color(props.bgColor),
    width: unit(props.width), minWidth: unit(props.minWidth), maxWidth: unit(props.maxWidth),
    height: unit(props.height), minHeight: unit(props.minHeight), maxHeight: unit(props.maxHeight),
    position: props.position,
    top: props.location?.includes('top') ? '0' : undefined,
    bottom: props.location?.includes('bottom') ? '0' : undefined,
    left: props.location?.includes('left') || props.location?.includes('start') ? '0' : undefined,
    right: props.location?.includes('right') || props.location?.includes('end') ? '0' : undefined,
    ...borderStyles(props.border),
    ...roundedStyles(props.rounded),
    boxShadow: Number(props.elevation) > 0 ? `0 ${Number(props.elevation) * 2}px ${Number(props.elevation) * 6}px rgb(0 0 0 / ${Math.min(Number(props.elevation) * .03, .2)})` : undefined
}));
</script>

<template>
    <UiThemeProvider :as="props.tag" :theme="props.theme" class="u-picker-container" :class="{ 'is-landscape': props.landscape, 'is-divided': props.divided }" :style="styles">
        <header v-if="!props.hideHeader && ((!props.hideTitle && (props.title || $slots.title)) || $slots.header)" class="u-picker-header" :style="{ background: color(props.color) }">
            <div v-if="!props.hideTitle && (props.title || $slots.title)" class="u-picker-title">
                <slot name="title">{{ props.title }}</slot>
            </div>
            <slot name="header" />
        </header>
        <div class="u-picker-body">
            <UOptionPicker v-if="props.items" v-model="model" :items="props.items" :item-title="props.itemTitle" :item-value="props.itemValue" :multiple="props.multiple" :disabled="props.disabled" :readonly="props.readonly" :return-object="props.returnObject" :ripple="props.ripple">
                <template v-if="$slots.item" #item="scope">
                    <slot name="item" v-bind="scope" />
                </template>
                <template #default="scope">
                    <slot v-bind="scope" />
                </template>
            </UOptionPicker>
            <slot v-else />
        </div>
        <UDefaultsProvider v-if="$slots.actions" :defaults="{ UButton: { variant: 'text' } }">
            <div class="u-picker-actions">
                <slot name="actions" />
            </div>
        </UDefaultsProvider>
    </UiThemeProvider>
</template>
