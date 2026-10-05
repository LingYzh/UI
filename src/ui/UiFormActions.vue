<script setup lang="ts">
withDefaults(defineProps<{ align?: 'start' | 'end' | 'between'; divided?: boolean }>(), { align: 'end', divided: true });
</script>

<template>
    <div class="ui-form-actions" :data-align="align" :class="{ 'is-divided': divided }">
        <div v-if="$slots.leading" class="ui-form-actions-leading"><slot name="leading" /></div>
        <div class="ui-form-actions-buttons"><slot /></div>
    </div>
</template>
