<script setup>
import UiCodeBlock from '../UiCodeBlock.vue';
defineProps({ code: { type: String, required: true }, language: { type: String, default: 'vue' } });
</script>

<template><UiCodeBlock :code="code" :language="language" /></template>
