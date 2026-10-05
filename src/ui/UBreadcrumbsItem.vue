<script setup lang="ts">
import { inject } from 'vue';
import { breadcrumbsKey } from './breadcrumbs-completion';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ href?: string; disabled?: boolean; active?: boolean; title?: string }>(), { disabled: false, active: false });
const props = useDefaults(rawProps, 'UBreadcrumbsItem');
const divider = inject(breadcrumbsKey, () => '/');
</script>

<template>
    <li class="ui-breadcrumbs-item"><component :is="props.href && !props.disabled && !props.active ? 'a' : 'span'" :href="props.href && !props.disabled && !props.active ? props.href : undefined" :aria-current="props.active ? 'page' : undefined" :aria-disabled="props.disabled || undefined"><slot>{{ props.title }}</slot></component><span class="ui-breadcrumbs-divider" aria-hidden="true">{{ divider() }}</span></li>
</template>
