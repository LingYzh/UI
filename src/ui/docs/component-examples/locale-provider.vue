<script setup>
import { ref } from 'vue';
import { ULocaleProvider, UPagination } from '../../index';
const page = ref(2);
</script>

<template>
    <div class="component-demo" data-demo-component="ULocaleProvider">
        <u-locale-provider locale="en">
            <u-pagination v-model="page" :length="5" label="English pagination" />
        </u-locale-provider>
        <output>当前页：{{ page }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
</style>
