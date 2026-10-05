<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
    <fieldset class="ui-form-section">
        <legend>{{ title }}</legend>
        <p v-if="description" class="ui-form-section-description">{{ description }}</p>
        <div class="ui-form-section-body"><slot /></div>
    </fieldset>
</template>
