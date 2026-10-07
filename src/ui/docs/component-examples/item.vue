<script setup>
import { ref } from 'vue';
import { UItem, UItemGroup } from '../../index';
const selected = ref('a');
</script>

<template>
    <div class="component-demo" data-demo-component="UItem">
        <u-item-group v-model="selected" mandatory>
            <u-item value="a">概览</u-item>
            <u-item value="b">详情</u-item>
        </u-item-group>
        <output>当前值：{{ selected }}</output>
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
