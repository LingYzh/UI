<script setup lang="ts">
withDefaults(defineProps<{ fluid?: boolean; tag?: string }>(), { tag: 'div' });
</script>

<template>
    <component :is="tag" class="ui-container" :class="{ 'is-fluid': fluid }"><slot /></component>
</template>
