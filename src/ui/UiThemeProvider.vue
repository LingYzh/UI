<script setup lang="ts">
import { provideUiTheme } from './theme';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ theme?: string; withBackground?: boolean; as?: string; tag?: string }>(), { withBackground: false, as: 'div' });
const props = useDefaults(rawProps, 'UThemeProvider');
const context = provideUiTheme(() => props.theme);
</script>

<template>
    <component :is="props.tag ?? props.as" class="ui-theme-provider" :class="{ 'ui-theme-provider--background': props.withBackground }" :data-ui-theme="context.name.value" :data-theme="context.current.value.dark ? 'dark' : 'light'" :style="context.styles.value">
        <slot />
    </component>
</template>
