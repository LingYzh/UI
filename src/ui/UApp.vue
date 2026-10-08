<script setup lang="ts">
import { provideAppLayout } from './layout-completion';
import { provideUiTheme } from './theme';
import { ref } from 'vue';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ theme?: string; fullHeight?: boolean; tag?: string }>(), { tag: 'div', fullHeight: true });
const props = useDefaults(rawProps, 'UApp');
const element = ref<HTMLElement>();
const theme = provideUiTheme(() => props.theme);
const layout = provideAppLayout();
defineExpose({ element, items: layout.items, getLayoutItem: layout.getLayoutItem, mainRect: layout.offsets });
</script>

<template>
    <component :is="props.tag" ref="element" class="ui-app" :class="{ 'is-full-height': props.fullHeight }" :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'" :style="theme.styles.value"><slot /></component>
</template>
