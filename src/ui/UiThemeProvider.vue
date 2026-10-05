<script setup lang="ts">
import { provideUiTheme } from './theme';
const props = withDefaults(defineProps<{ theme?: string; withBackground?: boolean; as?: string }>(), { withBackground: false, as: 'div' });
const context = provideUiTheme(() => props.theme);
</script>

<template>
    <component :is="as" class="ui-theme-provider" :class="{ 'ui-theme-provider--background': withBackground }" :data-ui-theme="context.name.value" :data-theme="context.current.value.dark ? 'dark' : 'light'" :style="context.styles.value">
        <slot />
    </component>
</template>
