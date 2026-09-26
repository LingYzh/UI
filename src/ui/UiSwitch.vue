<script setup lang="ts">
const model = defineModel<boolean>({ default: false });
</script>

<template>
    <input v-model="model" type="checkbox" class="ui-switch" />
</template>
