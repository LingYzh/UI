<script setup lang="ts">
import { provide } from 'vue';
import { breadcrumbsKey } from './breadcrumbs-completion';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ divider?: string; ariaLabel?: string }>(), { divider: '/', ariaLabel: 'Breadcrumbs' });
const props = useDefaults(rawProps, 'UBreadcrumbs');
provide(breadcrumbsKey, () => props.divider);
</script>

<template>
    <nav class="ui-breadcrumbs" :aria-label="props.ariaLabel"><ol><slot /></ol></nav>
</template>
