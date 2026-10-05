<script setup>
import { ref } from 'vue';
import { UConfirmEdit, UTextField } from '../../index';
const title = ref('工作区名称');
</script>

<template>
    <div class="component-demo" data-demo-component="UConfirmEdit">
        <u-confirm-edit v-model="title" v-slot="{ model }"><u-text-field v-model="model.value" label="编辑名称" /></u-confirm-edit><output>已确认：{{ title }}</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>
