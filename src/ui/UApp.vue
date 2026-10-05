<script setup lang="ts">
import { provideAppLayout } from './layout-completion';
provideAppLayout();
</script>

<template>
    <div class="ui-app"><slot /></div>
</template>
