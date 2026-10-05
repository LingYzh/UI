<script setup>
import { computed } from 'vue';
import { iconPath } from '../ui/icons';

const props = defineProps({
    name: { type: String, default: '' },
    path: { type: String, default: '' },
    label: { type: String, default: '' },
    size: { type: Number, default: 18 }
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
const svgPath = computed(() => props.path || iconPath(props.name));
</script>

<template>
    <span
        class="icon prototype-icon"
        :style="{ '--icon-size': `${size}px` }"
        :aria-hidden="label ? undefined : true"
        :role="label ? 'img' : undefined"
        :aria-label="label || undefined"
    ><svg v-if="svgPath" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="svgPath" /></svg><span v-else class="ui-icon-markup" v-html="markup"></span></span>
</template>
