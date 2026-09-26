<script setup lang="ts">
defineProps<{ open: boolean }>();
</script>

<template>
    <div class="ui-collapse" :class="{ 'is-open': open }" :inert="!open" :aria-hidden="!open"><div class="ui-collapse-content"><slot /></div></div>
</template>
