<script setup>
import { ref } from 'vue';
import { UButton, UToolbar, UToolbarItems, UToolbarTitle } from '../../index';
const action = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UToolbarTitle">
        <u-toolbar><u-toolbar-title>工作区</u-toolbar-title><u-toolbar-items><u-button size="sm" variant="ghost" @click="action++">刷新</u-button></u-toolbar-items></u-toolbar><output>已刷新 {{ action }} 次</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
