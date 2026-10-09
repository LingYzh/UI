<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import { provideUiTheme } from './theme';
import { useDefaults } from './defaults';
import UImg from './UImg.vue';
import UiSpinner from './UiSpinner.vue';
import UiIcon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { computed, getCurrentInstance, ref, useAttrs } from 'vue';
import { useNestedLinkGuard, useUiLink, type RouterProps } from './router';
import { dimensionStyles, type DimensionProps } from './dimensions';
import { isNestedControlEvent } from './action-events';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    theme?: string;
    title?: string;
    subtitle?: string;
    text?: string;
    image?: string;
    loading?: boolean;
    prependIcon?: IconValue;
    appendIcon?: IconValue;
    variant?: 'outlined' | 'elevated' | 'tonal' | 'flat';
    density?: 'comfortable' | 'compact';
    flush?: boolean;
    as?: string;
    tag?: string;
    link?: boolean;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
} & RouterProps & DimensionProps & { ripple?: RippleOptions }>(), { ripple: true, variant: 'outlined', density: 'comfortable', as: 'section', rounded: true, link: undefined });
const props = useDefaults(rawProps, 'UCard');
const themeContext = provideUiTheme(() => props.theme);
const attrs = useAttrs();
const instance = getCurrentInstance();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const element = ref<HTMLElement>();
const link = useUiLink(props);
const tag = computed(() => props.tag ?? (link.isLink.value ? 'a' : props.as));
const clickable = computed(() => !props.disabled && props.link !== false && (props.link || link.isLink.value || !!instance?.vnode.props?.onClick || tag.value === 'button'));
const captureClick = useNestedLinkGuard(element, () => props.link === false ? undefined : link.href.value, () => !!props.disabled);
function click(event: MouseEvent) {
    if (props.disabled) { event.preventDefault(); return; }
    if (isNestedControlEvent(event, element.value)) return;
    emit('click', event);
    if (props.link !== false) link.navigate(event);
    else if (link.isLink.value) event.preventDefault();
}
function keydown(event: KeyboardEvent) {
    if (!clickable.value || ['a', 'button'].includes(tag.value ?? '') || isNestedControlEvent(event, element.value)) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.value?.click(); }
}
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <component v-focus-modality :is="tag" ref="element" v-bind="attrs" v-ripple="clickable ? props.ripple : false" class="ui-card" :href="props.disabled || props.link === false ? undefined : link.href.value" :aria-disabled="props.disabled || undefined" :aria-current="link.isActive.value ? 'page' : undefined" :role="!['a', 'button'].includes(tag ?? '') && clickable ? 'button' : attrs.role" :tabindex="props.disabled ? -1 : clickable ? (attrs.tabindex ?? 0) : attrs.tabindex" :type="tag === 'button' ? 'button' : undefined" :style="[props.theme ? themeContext.styles.value : undefined, dimensionStyles(props)]" :data-ui-theme="props.theme ? themeContext.name.value : undefined" :data-theme="props.theme ? (themeContext.current.value.dark ? 'dark' : 'light') : undefined" :class="[`ui-card--${props.variant}`, `ui-card--${props.dense ? 'compact' : props.density}`, { 'ui-card--flush': props.flush, 'is-ghost': props.ghost, 'is-square': !props.rounded, 'is-clickable': clickable, 'is-disabled': props.disabled }]" @click.capture="captureClick" @click="click" @keydown="keydown">
        <div v-if="props.loading || $slots.loader" class="ui-card-loader"><slot name="loader" :is-active="props.loading"><UiSpinner v-if="props.loading" :size="16" /></slot></div>
        <div v-if="props.image || $slots.image" class="ui-card-media"><slot name="image"><UImg v-if="props.image" :src="props.image" /></slot></div>
        <header v-if="props.title || props.subtitle || $slots.header || $slots.title || $slots.subtitle || $slots.prepend || $slots.append || props.prependIcon || props.appendIcon" class="ui-card-header">
            <div v-if="$slots.prepend || props.prependIcon" class="ui-card-prepend"><slot name="prepend"><UiIcon v-if="props.prependIcon" :icon="props.prependIcon" /></slot></div>
            <div class="ui-card-heading"><slot name="header"><h3 v-if="props.title || $slots.title" class="ui-card-title"><slot name="title">{{ props.title }}</slot></h3><p v-if="props.subtitle || $slots.subtitle" class="ui-card-subtitle"><slot name="subtitle">{{ props.subtitle }}</slot></p></slot></div>
            <div v-if="$slots.append || props.appendIcon" class="ui-card-append"><slot name="append"><UiIcon v-if="props.appendIcon" :icon="props.appendIcon" /></slot></div>
        </header>
        <div v-if="$slots.media" class="ui-card-media"><slot name="media" /></div>
        <div class="ui-card-content"><slot name="item"><slot name="text">{{ props.text }}</slot><slot /></slot></div>
        <footer v-if="$slots.actions" class="ui-card-actions"><slot name="actions" /></footer>
    </component>
</template>
