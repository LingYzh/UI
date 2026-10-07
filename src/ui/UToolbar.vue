<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { provideDefaults, useDefaults } from './defaults';
import { buttonColorStyles } from './button-colors';
import { provideUiTheme } from './theme';
import UiCollapse from './UiCollapse.vue';
import UToolbarTitle from './UToolbarTitle.vue';
import UToolbarItems from './UToolbarItems.vue';
const rawProps = withDefaults(defineProps<{
    density?: 'prominent' | 'default' | 'comfortable' | 'compact';
    height?: number | string;
    extensionHeight?: number | string;
    extended?: boolean | null;
    title?: string;
    color?: string;
    image?: string;
    absolute?: boolean;
    collapse?: boolean;
    collapsePosition?: 'start' | 'end';
    flat?: boolean;
    floating?: boolean;
    elevation?: number | string;
    border?: boolean;
    rounded?: boolean | string | number;
    location?: string;
    tag?: string;
    theme?: string;
}>(), { density: 'default', height: 64, extensionHeight: 48, extended: null, collapsePosition: 'start', tag: 'header', elevation: 0, rounded: true });
const props = useDefaults(rawProps, 'UToolbar');
const slots = useSlots();
const element = ref<HTMLElement>();
const theme = provideUiTheme(() => props.theme);
provideDefaults(() => ({ UButton: { variant: 'text' } }));
function pixels(value: number | string | undefined, fallback: number) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : fallback;
}
const contentHeight = computed(() => Math.max(0, pixels(props.height, 64) * (props.density === 'prominent' ? 2 : 1) - (props.density === 'comfortable' ? 8 : props.density === 'compact' ? 16 : 0)));
const isExtended = computed(() => props.extended ?? !!slots.extension);
const configuredExtensionHeight = computed(() => Math.max(0, pixels(props.extensionHeight, 48) * (props.density === 'prominent' ? 2 : 1) - (props.density === 'comfortable' ? 4 : props.density === 'compact' ? 8 : 0)));
const extensionHeight = computed(() => isExtended.value ? configuredExtensionHeight.value : 0);
const colors = computed(() => buttonColorStyles(props.color));
const radius = computed(() => {
    if (typeof props.rounded === 'number') return `${props.rounded}px`;
    if (typeof props.rounded === 'string') return ({ sm: '4px', lg: '16px', xl: '24px', pill: '999px', '0': '0px' } as Record<string, string>)[props.rounded] ?? props.rounded;
    return props.rounded ? '10px' : undefined;
});
const elevation = computed(() => props.flat || props.border ? 0 : Math.min(24, pixels(props.elevation, 0)));
const position = computed(() => {
    const result: Record<string, string> = {};
    for (const edge of (props.location ?? '').split(/\s+/)) {
        if (edge === 'top' || edge === 'bottom' || edge === 'left' || edge === 'right') result[edge] = '0';
        if (edge === 'start' || edge === 'end') result[`inset-inline-${edge}`] = '0';
    }
    return result;
});
defineExpose({ element, contentHeight, extensionHeight });
</script>

<template>
    <component :is="props.tag" ref="element" class="ui-toolbar" :class="{ 'is-absolute': props.absolute, 'is-collapsed': props.collapse, 'is-floating': props.floating, 'has-border': props.border }" :data-density="props.density" :data-color="props.color || undefined" :data-collapse-position="props.collapsePosition" :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'" :style="[theme.styles.value, colors, position, { '--ui-toolbar-radius': radius, boxShadow: elevation ? `0 ${elevation}px ${elevation * 3}px rgba(0, 0, 0, .18)` : undefined }]" role="toolbar">
        <div v-if="props.image || slots.image" class="ui-toolbar-image" aria-hidden="true"><slot name="image" :image="props.image"><img :src="props.image" alt="" /></slot></div>
        <div class="ui-toolbar-content" :style="{ height: `${contentHeight}px` }">
            <div v-if="slots.prepend" class="ui-toolbar-prepend"><slot name="prepend" /></div>
            <UToolbarTitle v-if="props.title || slots.title" :text="props.title"><template v-if="slots.title" #text><slot name="title" /></template></UToolbarTitle>
            <slot />
            <div v-if="slots.actions || slots.append" class="ui-toolbar-append"><UToolbarItems><slot name="actions"><slot name="append" /></slot></UToolbarItems></div>
        </div>
        <UiCollapse :open="isExtended" class="ui-toolbar-extension-wrap">
            <div class="ui-toolbar-extension" :style="{ height: `${configuredExtensionHeight}px` }"><slot name="extension" /></div>
        </UiCollapse>
    </component>
</template>
