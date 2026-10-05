<script setup lang="ts">
import { useDefaults } from './defaults';
const rawProps = defineProps<{ title?: string }>();
const props = useDefaults(rawProps, 'UListSubheader');
</script>

<template>
    <div class="ui-list-subheader" role="presentation"><slot>{{ props.title }}</slot></div>
</template>
