<script setup>
import { ref } from 'vue';
import { UFab } from '../../index';
const count = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UFab">
        <div class="demo-row">
            <u-fab label="新建项目" @click="count++" />
            <output>已新建 {{ count }} 次</output>
        </div>
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
