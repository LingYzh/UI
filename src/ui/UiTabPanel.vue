<script setup lang="ts">
defineProps<{ value: string; modelValue: string; idPrefix: string }>();
</script>

<template>
    <div v-show="modelValue === value" :id="`${idPrefix}-panel-${value}`" class="ui-tab-panel" :class="{ 'is-active': modelValue === value }" role="tabpanel" :aria-labelledby="`${idPrefix}-tab-${value}`" tabindex="0"><slot /></div>
</template>
