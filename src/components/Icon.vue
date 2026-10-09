<script setup>
import { computed } from 'vue';
import { IconValue, resolveIcon, useIcons } from '../ui/icon-config';

const props = defineProps({
    name: { type: String, default: '' },
    icon: { type: IconValue, default: '' },
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
const iconOptions = useIcons();

const resolved = computed(() => {
    const value = props.icon || props.name;
    return props.path
        ? resolveIcon(props.path, iconOptions, true)
        : resolveIcon(value, iconOptions);
});
const markup = computed(() => resolved.value.kind === 'local' && resolved.value.name
    ? icons[resolved.value.name]
    : undefined);
</script>

<template>
    <span
        class="icon prototype-icon"
        :style="{ '--icon-size': typeof size === 'number' ? `${size}px` : size, color: color ? `var(--ui-theme-${color}, ${color})` : undefined }"
        :aria-hidden="label ? undefined : true"
        :role="label ? 'img' : undefined"
        :aria-label="label || undefined"
    >
        <slot>
            <component
                v-if="resolved.component"
                :is="resolved.component"
                tag="span"
                :icon="resolved.icon"
            />
            <span v-else-if="markup" class="ui-icon-markup" v-html="markup"></span>
        </slot>
    </span>
</template>
