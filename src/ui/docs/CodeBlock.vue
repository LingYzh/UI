<script setup>
import UCodeBlock from '../UiCodeBlock.vue';
defineProps({ code: { type: String, required: true }, language: { type: String, default: 'vue' } });
</script>

<template><u-code-block :code="code" :language="language" /></template>
