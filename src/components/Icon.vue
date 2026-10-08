<script setup>
import { computed } from 'vue';
import { iconPath } from '../ui/icons';
import { resolveIcon, useIcons } from '../ui/icon-config';

const props = defineProps({
    name: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    path: { type: String, default: '' },
    label: { type: String, default: '' },
    size: { type: [Number, String], default: 18 }
});

const iconFiles = import.meta.glob('../assets/icons/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default'
});

const icons = Object.fromEntries(Object.entries(iconFiles).map(([path, source]) => [
    path.split('/').at(-1).replace(/\.svg$/, ''),
    source
]));
const markup = computed(() => icons[props.name] || icons.file);
const iconOptions = useIcons();
const resolved = computed(() => resolveIcon(props.icon || props.name, iconOptions));
const svgPath = computed(() => props.path || resolved.value.path || iconPath(props.name));
</script>

<template>
    <span
        class="icon prototype-icon"
        :style="{ '--icon-size': typeof size === 'number' ? `${size}px` : size, color: color ? `var(--ui-theme-${color}, ${color})` : undefined }"
        :aria-hidden="label ? undefined : true"
        :role="label ? 'img' : undefined"
        :aria-label="label || undefined"
    ><slot><component :is="resolved.component" v-if="resolved.component" :icon="resolved.name" /><svg v-else-if="svgPath" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="svgPath" /></svg><span v-else class="ui-icon-markup" v-html="markup"></span></slot></span>
</template>
