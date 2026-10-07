<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import { provideUiTheme } from './theme';
const props = withDefaults(defineProps<{
    theme?: string;
    title?: string;
    subtitle?: string;
    variant?: 'outlined' | 'elevated' | 'tonal' | 'flat';
    density?: 'comfortable' | 'compact';
    flush?: boolean;
    as?: string;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
} & { ripple?: RippleOptions }>(), { ripple: true, variant: 'outlined', density: 'comfortable', as: 'section', rounded: true });
const themeContext = provideUiTheme(() => props.theme);
</script>

<template>
    <component v-focus-modality :is="as" v-ripple="($attrs.onClick || $attrs.href || as === 'button') ? props.ripple : false" class="ui-card" :style="theme ? themeContext.styles.value : undefined" :data-ui-theme="theme ? themeContext.name.value : undefined" :data-theme="theme ? (themeContext.current.value.dark ? 'dark' : 'light') : undefined" :class="[`ui-card--${variant}`, `ui-card--${dense ? 'compact' : density}`, { 'ui-card--flush': flush, 'is-ghost': ghost, 'is-square': !rounded, 'is-clickable': !!($attrs.onClick || $attrs.href || as === 'button') }]">
        <header v-if="title || subtitle || $slots.header" class="ui-card-header">
            <slot name="header"><h3 v-if="title" class="ui-card-title">{{ title }}</h3><p v-if="subtitle" class="ui-card-subtitle">{{ subtitle }}</p></slot>
        </header>
        <div v-if="$slots.media" class="ui-card-media"><slot name="media" /></div>
        <div class="ui-card-content"><slot /></div>
        <footer v-if="$slots.actions" class="ui-card-actions"><slot name="actions" /></footer>
    </component>
</template>
