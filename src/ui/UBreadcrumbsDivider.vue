<script setup lang="ts">
import { computed, inject, type PropType } from 'vue';
import { breadcrumbsKey } from './breadcrumbs-completion';
import { useDefaults } from './defaults';

const rawProps = defineProps({ divider: { type: [String, Number] as PropType<string | number | undefined>, default: undefined } });
const props = useDefaults(rawProps, 'UBreadcrumbsDivider');
const inheritedDivider = inject(breadcrumbsKey, () => '/');
const divider = computed(() => rawProps.divider ?? props.divider ?? inheritedDivider() ?? '/');
</script>

<template>
    <li class="ui-breadcrumbs-divider-item" aria-hidden="true"><slot>{{ divider }}</slot></li>
</template>
